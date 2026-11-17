// Menghitung dan memvalidasi isi pesanan (BR-01 sampai BR-05, BR-15). Murni, tanpa DB:
// menerima daftar produk (bentuk `daftarProduk()`) dan masukan klien, mengembalikan
// item dengan snapshot nama dan harga serta total. Klien hanya mengirim product_id,
// qty, id opsi, teks, dan catatan. Harga selalu dari DB (BR-01).
// Melempar GalatHttp 400 dengan pesan Indonesia bila masukan melanggar aturan.
import {
  validasiAngka, validasiCatatanItem, validasiTeksOpsi, BATAS,
} from '@kecaknik/shared/core/validasi.js';
import { galat400 } from '../middleware/galat.js';

export const MAKS_ITEM = 30;
export const MAKS_OPSI_PER_ITEM = 30;

const hasil = (r) => {
  if (!r.ok) throw galat400(r.galat);
  return r.nilai;
};
const objek = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function idBulat(v, pesan) {
  const n = typeof v === 'number' ? v : typeof v === 'string' && /^\d+$/.test(v.trim()) ? Number(v) : NaN;
  if (!Number.isSafeInteger(n) || n < 1) throw galat400(pesan);
  return n;
}

function hitungItem(m, produkById, no) {
  if (!objek(m)) throw galat400(`Item ${no} tidak valid.`);
  const p = produkById.get(idBulat(m.product_id, `Produk pada item ${no} tidak valid.`));
  // `produkById` hanya berisi produk yang boleh dipesan sekarang (BR-02): aktif, dan
  // PO dalam rentang tanggal buka sampai tutup.
  if (!p) throw galat400(`Produk pada item ${no} sedang tidak tersedia.`);

  const qty = hasil(validasiAngka(m.qty, { label: `Jumlah ${p.nama}` })); // BR-04
  const catatan = hasil(validasiCatatanItem(m.catatan)); // BR-15

  const pilihan = m.opsi ?? [];
  if (!Array.isArray(pilihan)) throw galat400(`Pilihan tambahan ${p.nama} tidak valid.`);
  if (pilihan.length > MAKS_OPSI_PER_ITEM) throw galat400(`Pilihan tambahan ${p.nama} terlalu banyak.`);

  // Peta id opsi -> { grup, opsi } hanya dari opsi milik produk ini (BR-03).
  const milik = new Map();
  for (const g of p.grup) for (const o of g.opsi) if (o.aktif) milik.set(o.id, { g, o });

  const dipilih = new Map(); // id opsi -> teks
  const jumlahGrup = new Map(); // id grup -> banyak opsi terpilih
  for (const pil of pilihan) {
    if (!objek(pil)) throw galat400(`Pilihan tambahan ${p.nama} tidak valid.`);
    const oid = idBulat(pil.opsi_id, `Pilihan tambahan ${p.nama} tidak valid.`);
    const ref = milik.get(oid);
    if (!ref) throw galat400(`Ada pilihan tambahan yang tidak tersedia untuk ${p.nama}.`);
    if (dipilih.has(oid)) throw galat400(`Pilihan "${ref.o.nama}" pada ${p.nama} terkirim dua kali.`);
    const teks = ref.o.butuh_teks
      ? hasil(validasiTeksOpsi(pil.teks, { wajib: true, label: ref.o.label_teks || ref.o.nama }))
      : null;
    dipilih.set(oid, teks);
    jumlahGrup.set(ref.g.id, (jumlahGrup.get(ref.g.id) ?? 0) + 1);
  }

  // Grup bergantung hanya berlaku bila grup pemicunya terlihat dan sudah terisi (BR-03).
  const memo = new Map();
  const terlihat = (g) => {
    if (memo.has(g.id)) return memo.get(g.id);
    memo.set(g.id, false); // penjaga siklus
    let r = true;
    if (g.muncul_setelah_grup_id !== null && g.muncul_setelah_grup_id !== undefined) {
      const pemicu = p.grup.find((x) => x.id === g.muncul_setelah_grup_id);
      r = Boolean(pemicu) && terlihat(pemicu) && (jumlahGrup.get(pemicu.id) ?? 0) > 0;
    }
    memo.set(g.id, r);
    return r;
  };

  for (const g of p.grup) {
    const n = jumlahGrup.get(g.id) ?? 0;
    if (!terlihat(g)) {
      if (n > 0) throw galat400(`Pilihan "${g.nama}" pada ${p.nama} belum berlaku. Lengkapi pilihan sebelumnya dulu.`);
      continue;
    }
    if (g.opsi.length === 0) continue; // tidak ada opsi aktif, tidak bisa diwajibkan
    const maks = g.tipe === 'pilih_satu' ? 1 : g.max_pilih;
    const min = Math.max(g.min_pilih ?? 0, g.wajib ? 1 : 0);
    if (n < min) {
      throw galat400(min === 1 ? `${g.nama} pada ${p.nama} wajib dipilih.` : `${g.nama} pada ${p.nama}: pilih minimal ${min}.`);
    }
    if (maks !== null && maks !== undefined && n > maks) {
      throw galat400(maks === 1 ? `${g.nama} pada ${p.nama}: pilih satu saja.` : `${g.nama} pada ${p.nama}: pilih maksimal ${maks}.`);
    }
  }

  // Snapshot opsi mengikuti urutan grup dan opsi di DB, bukan urutan kiriman klien.
  const opsi = [];
  for (const g of p.grup) {
    for (const o of g.opsi) {
      if (dipilih.has(o.id)) {
        opsi.push({
          opsi_id: o.id, nama_grup: g.nama, nama_opsi: o.nama, harga_tambah: o.harga_tambah, teks: dipilih.get(o.id),
        });
      }
    }
  }
  const hargaOpsi = opsi.reduce((s, o) => s + o.harga_tambah, 0);
  return {
    item: {
      product_id: p.id,
      nama: p.nama,
      harga: p.harga,
      harga_opsi: hargaOpsi,
      qty,
      catatan,
      opsi,
      subtotal: (p.harga + hargaOpsi) * qty,
    },
    po: p.is_preorder,
    tanggalAmbil: p.is_preorder ? p.tanggal_ambil : null,
  };
}

/**
 * @param masukan     larik item dari klien: [{ product_id, qty, catatan, opsi: [{ opsi_id, teks }] }]
 * @param produkTersedia  hasil `daftarProduk({ publik: true })`
 * @returns { items, total, tanggal_ambil }  tanggal_ambil terisi berarti pesanan PO (BR-05)
 */
export function hitungPesanan(masukan, produkTersedia) {
  if (!Array.isArray(masukan) || masukan.length === 0) {
    throw galat400('Keranjang kosong. Pilih minimal satu produk.');
  }
  if (masukan.length > MAKS_ITEM) throw galat400(`Maksimal ${MAKS_ITEM} item per pesanan.`);

  const produkById = new Map(produkTersedia.map((p) => [p.id, p]));
  const hitung = masukan.map((m, i) => hitungItem(m, produkById, i + 1));

  // BR-05: tidak boleh mencampur reguler dengan PO, atau PO dengan tanggal ambil berbeda.
  const banyakPo = hitung.filter((h) => h.po).length;
  if (banyakPo > 0 && banyakPo < hitung.length) {
    throw galat400('Pre-order tidak bisa digabung dengan produk reguler. Buat pesanan terpisah.');
  }
  let tanggalAmbil = null;
  if (banyakPo > 0) {
    const tanggal = new Set(hitung.map((h) => h.tanggalAmbil));
    if (tanggal.size > 1) {
      throw galat400('Pre-order dengan tanggal ambil berbeda tidak bisa digabung. Buat pesanan terpisah.');
    }
    [tanggalAmbil] = tanggal;
  }

  const total = hitung.reduce((s, h) => s + h.item.subtotal, 0);
  if (total > BATAS.rupiahMaks) throw galat400('Total pesanan terlalu besar. Kurangi jumlah item.');
  return { items: hitung.map((h) => h.item), total, tanggal_ambil: tanggalAmbil };
}
