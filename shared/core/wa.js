// Templat WhatsApp (STRUKTUR Lampiran D, K-09, BR-18). Fungsi murni.
// Pesan disusun dari data pesanan, pengguna tinggal menekan Kirim di WhatsApp.
//
// Bentuk data `pesanan` (dipakai halaman status pelanggan dan detail admin):
//   kode_pesanan | kode, tipe_pesanan, status, nama_pelanggan, no_hp,
//   tanggal | created_at, tanggal_ambil, alasan_batal, total, status_pembayaran,
//   jumlah_dibayar, sisa (opsional, dihitung bila kosong),
//   items: [{ nama, qty, harga, harga_opsi, subtotal?, catatan, opsi: [{ nama_opsi, teks }] }],
//   pembayaran: [{ status, catatan }] urut dari yang terlama. Bila tidak ada,
//   dipakai pembayaran_terakhir { status, catatan } dari endpoint publik.

import { rupiah, tanggal } from './format.js';
import { labelStatus } from './statusPesanan.js';
import { normalisasiTelepon, validasiTelepon } from './validasi.js';

export const BATAS_PESAN = 1500;
export const BATAS_BARIS_ITEM = 10;

export const TEMPLAT_ADMIN = [
  { id: 'konfirmasi', label: 'Konfirmasi pesanan' },
  { id: 'bukti_ditolak', label: 'Bukti ditolak' },
  { id: 'uang_muka', label: 'Uang muka diterima' },
  { id: 'lunas', label: 'Lunas' },
  { id: 'siap_diambil', label: 'Siap diambil' },
  { id: 'dikirim', label: 'Sedang diantar' },
  { id: 'selesai', label: 'Selesai' },
  { id: 'dibatalkan', label: 'Dibatalkan' },
];

const angka = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0);
const kodeDari = (p) => p.kode_pesanan ?? p.kode ?? '';

export function hitungSisa(p) {
  if (p.sisa !== undefined && p.sisa !== null) return Math.max(0, angka(p.sisa));
  return Math.max(0, angka(p.total) - angka(p.jumlah_dibayar));
}

function barisPembayaran(p) {
  if (Array.isArray(p.pembayaran)) return p.pembayaran;
  return p.pembayaran_terakhir ? [p.pembayaran_terakhir] : [];
}

function teksPembayaran(p) {
  if (p.status_pembayaran === 'lunas') return 'Lunas';
  if (p.status_pembayaran === 'uang_muka') {
    return `Uang muka ${rupiah(angka(p.jumlah_dibayar))}, sisa ${rupiah(hitungSisa(p))}`;
  }
  return 'Belum dibayar';
}

function barisItem(item, nomor) {
  const qty = angka(item.qty) || 1;
  const opsi = (item.opsi ?? [])
    .map((o) => {
      const nama = o.nama_opsi ?? o.nama ?? '';
      return o.teks ? `${nama} "${o.teks}"` : nama;
    })
    .filter(Boolean);
  const sub = item.subtotal ?? (angka(item.harga) + angka(item.harga_opsi)) * qty;
  let b = `${nomor}. ${item.nama} x${qty}`;
  if (opsi.length) b += ` (${opsi.join(', ')})`;
  if (item.catatan) b += ` catatan: ${item.catatan}`;
  return `${b}  ${rupiah(sub)}`;
}

// D.1 Blok data. `maksItem` membatasi jumlah baris item (sisanya diringkas).
function blokData(p, maksItem) {
  const items = p.items ?? [];
  const tgl = tanggal(p.tanggal ?? p.created_at);
  const baris = [`Pesanan ${kodeDari(p)}`];
  baris.push(
    `Tipe: ${p.tipe_pesanan === 'antar' ? 'Antar' : 'Ambil'}${tgl ? `   Tanggal: ${tgl}` : ''}`,
  );
  if (p.tanggal_ambil) baris.push(`Tanggal ambil: ${tanggal(p.tanggal_ambil)}`);
  baris.push('Pesanan:');
  items.slice(0, maksItem).forEach((it, i) => baris.push(barisItem(it, i + 1)));
  if (items.length > maksItem) baris.push(`dan ${items.length - maksItem} item lainnya`);
  baris.push(`Total: ${rupiah(angka(p.total))}`);
  baris.push(`Pembayaran: ${teksPembayaran(p)}`);
  baris.push(`Status: ${labelStatus(p.status, p.tipe_pesanan)}`);
  return baris.join('\n');
}

// Menyusun pesan dengan blok data. Item dikurangi hingga muat 1500 karakter (BR-18);
// bila masih melebihi, dipotong keras.
function rakit(p, awalan, akhiran) {
  const total = (p.items ?? []).length;
  let hasil = '';
  for (let m = Math.min(total, BATAS_BARIS_ITEM); m >= 0; m -= 1) {
    hasil = [awalan, blokData(p, m), akhiran].filter(Boolean).join('\n\n');
    if (hasil.length <= BATAS_PESAN) return hasil;
  }
  return `${hasil.slice(0, BATAS_PESAN - 1)}…`;
}

const potong = (t) => (t.length <= BATAS_PESAN ? t : `${t.slice(0, BATAS_PESAN - 1)}…`);

// ------------------------------------------------ D.2 Pelanggan -> admin
export function kalimatKonteksPelanggan(p) {
  const baris = barisPembayaran(p);
  const akhir = baris.at(-1);
  switch (p.status) {
    case 'pending':
      if (baris.slice(0, -1).some((b) => b.status === 'ditolak') && akhir?.status === 'menunggu') {
        return 'Saya sudah mengunggah ulang bukti transfer. Mohon dicek ya.';
      }
      if (akhir?.status === 'menunggu') {
        return 'Mohon dikonfirmasi pesanan dan bukti transfer saya ya.';
      }
      return 'Mohon dikonfirmasi pesanan saya ya.';
    case 'diproses':
      return 'Boleh tahu estimasi pesanan saya selesai?';
    case 'siap diambil':
      return 'Saya akan mengambil pesanan. Jam berapa yang pas?';
    case 'dikirim':
      return 'Mohon info estimasi pesanan sampai.';
    case 'selesai':
      return 'Pesanan sudah saya terima. Terima kasih!';
    case 'dibatalkan':
      return 'Saya ingin menanyakan pembatalan pesanan ini.';
    default:
      return '';
  }
}

export function buatPesanPelanggan(p) {
  const sapa = p.nama_pelanggan
    ? `Halo Kecaknik Food, saya ${p.nama_pelanggan}.`
    : 'Halo Kecaknik Food.';
  return rakit(p, sapa, kalimatKonteksPelanggan(p));
}

// ---------------------------------------------------- D.3 Admin -> pelanggan
/**
 * Templat awal dari status. Urutan: status akhir/pengantaran dulu, lalu bukti
 * ditolak (baris pembayaran terakhir ditolak), lalu pembayaran, lalu konfirmasi.
 */
export function pilihTemplatAdmin(p) {
  if (p.status === 'dibatalkan') return 'dibatalkan';
  if (p.status === 'selesai') return 'selesai';
  if (p.status === 'dikirim') return 'dikirim';
  if (p.status === 'siap diambil') return 'siap_diambil';
  if (barisPembayaran(p).at(-1)?.status === 'ditolak') return 'bukti_ditolak';
  if (p.status_pembayaran === 'uang_muka') return 'uang_muka';
  if (p.status_pembayaran === 'lunas' && p.status === 'diproses') return 'lunas';
  return 'konfirmasi';
}

export function buatPesanAdmin(p, templat = pilihTemplatAdmin(p)) {
  const halo = p.nama_pelanggan ? `Halo ${p.nama_pelanggan}` : 'Halo';
  const kode = kodeDari(p);
  const sisa = hitungSisa(p);
  const barisSisa = sisa > 0 ? ` Sisa pembayaran: ${rupiah(sisa)}.` : '';

  switch (templat) {
    case 'konfirmasi': {
      const akhir = ['Kode ini bisa dipakai untuk melacak pesanan di website.'];
      if (p.tipe_pesanan === 'antar') akhir.push('Ongkir akan kami konfirmasi di chat ini.');
      return rakit(p, `${halo}, pesananmu ${kode} sudah kami terima.`, akhir.join('\n'));
    }
    case 'bukti_ditolak': {
      const alasan = barisPembayaran(p).findLast?.((b) => b.status === 'ditolak')?.catatan;
      return potong(
        `${halo}, bukti transfer untuk ${kode} belum bisa kami terima${alasan ? `: ${alasan}` : ''}. ` +
          'Mohon unggah ulang bukti yang sesuai ya.',
      );
    }
    case 'uang_muka':
      return potong(
        `${halo}, uang muka ${rupiah(angka(p.jumlah_dibayar))} untuk ${kode} sudah kami terima. ` +
          `Sisa ${rupiah(sisa)} dibayar tunai saat pesanan diterima.`,
      );
    case 'lunas':
      return potong(`${halo}, pembayaran ${kode} sudah lunas. Pesananmu sedang kami siapkan.`);
    case 'siap_diambil':
      return potong(`${halo}, pesanan ${kode} sudah siap diambil.${barisSisa}`);
    case 'dikirim':
      return potong(
        `${halo}, pesanan ${kode} sedang diantar dari Kecaknik Food ke lokasimu.${barisSisa}`,
      );
    case 'selesai':
      return potong(`${halo}, terima kasih sudah memesan di Kecaknik Food.`);
    case 'dibatalkan':
      return potong(`${halo}, pesanan ${kode} kami batalkan karena: ${p.alasan_batal ?? '-'}.`);
    default:
      throw new Error(`Templat tidak dikenal: ${templat}`);
  }
}

// ------------------------------------------------------------------ tautan
/**
 * https://wa.me/<nomor62>?text=<teks>. Mengembalikan '' bila nomor kosong atau
 * tidak valid, sehingga TombolWa bisa menonaktifkan diri (BR-18).
 */
export function linkWa(nomor, pesan = '') {
  if (!validasiTelepon(nomor ?? '').ok) return '';
  const n = normalisasiTelepon(nomor);
  return pesan ? `https://wa.me/${n}?text=${encodeURIComponent(pesan)}` : `https://wa.me/${n}`;
}
