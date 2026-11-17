// Satu-satunya definisi aturan input (STRUKTUR Lampiran E, BR-19).
// Klien: saring*() dipakai saat mengetik dan menempel. Server: validasi*() menolak
// (tidak diam-diam memperbaiki) masukan yang melanggar. Fungsi murni.
//
// Semua validasi*() mengembalikan { ok: true, nilai } atau { ok: false, galat }.

import { rupiah } from './format.js';

export const BATAS = {
  namaMin: 2,
  namaMaks: 100,
  teleponMin: 10, // digit, termasuk 62
  teleponMaks: 15,
  rupiahMaks: 99_999_999,
  qtyMin: 1,
  qtyMaks: 99,
  alamatMin: 10,
  alamatMaks: 255,
  catatanPesananMaks: 500,
  catatanItemMaks: 255,
  teksOpsiMaks: 100,
  kodePanjang: 10,
};

export const ALFABET_KODE = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

const POLA_NAMA = /^[\p{L}][\p{L}\p{M} .'’-]{1,99}$/u;
const NAMA_TERLARANG = /[^\p{L}\p{M} .'’-]/gu;
const POLA_TELEPON = /^62\d{8,13}$/;
const POLA_KODE = /^KCK-[2-9A-HJKMNP-Z]{6}$/;
// Karakter kontrol selain baris baru (\n) dibuang dari teks bebas.
const KONTROL = /[\u0000-\u0008\u000B-\u001F\u007F]/g;

const ok = (nilai) => ({ ok: true, nilai });
const gagal = (galat) => ({ ok: false, galat });
const teks = (v) => (v === null || v === undefined ? '' : String(v));

// ---------------------------------------------------------------- nama
/** Saat mengetik/menempel: buang angka dan simbol lain, rapikan spasi ganda. */
export function saringNama(v) {
  return teks(v)
    .replace(NAMA_TERLARANG, '')
    .replace(/^[^\p{L}]+/u, '')
    .replace(/ {2,}/g, ' ')
    .slice(0, BATAS.namaMaks);
}

export function validasiNama(v) {
  const rapi = teks(v).trim().replace(/\s{2,}/g, ' ');
  if (!rapi) return gagal('Nama wajib diisi.');
  if (rapi.length < BATAS.namaMin) return gagal(`Nama minimal ${BATAS.namaMin} karakter.`);
  if (rapi.length > BATAS.namaMaks) return gagal(`Nama maksimal ${BATAS.namaMaks} karakter.`);
  if (!POLA_NAMA.test(rapi)) {
    return gagal('Nama hanya boleh berisi huruf, spasi, titik, apostrof, dan tanda hubung.');
  }
  return ok(rapi);
}

// ------------------------------------------------------------- telepon
/** Saat mengetik/menempel: hanya angka (+, spasi, - ikut dibuang). */
export function saringTelepon(v) {
  return teks(v).replace(/\D/g, '').slice(0, BATAS.teleponMaks);
}

/** 08xx, 8xx, +62 8xx -> 628xx. Masukan lain dikembalikan sebagai deretan angka. */
export function normalisasiTelepon(v) {
  const d = teks(v).replace(/\D/g, '');
  if (d.startsWith('620')) return `62${d.slice(3)}`;
  if (d.startsWith('62')) return d;
  if (d.startsWith('0')) return `62${d.slice(1)}`;
  if (d.startsWith('8')) return `62${d}`;
  return d;
}

export function validasiTelepon(v) {
  const bersih = teks(v).trim().replace(/[\s+-]/g, '');
  if (!bersih) return gagal('Nomor WhatsApp wajib diisi.');
  if (!/^\d+$/.test(bersih)) return gagal('Nomor WhatsApp hanya boleh berisi angka.');
  const n = normalisasiTelepon(bersih);
  if (!POLA_TELEPON.test(n)) {
    return gagal('Nomor WhatsApp tidak valid. Contoh: 0812 3456 7890.');
  }
  return ok(n);
}

// -------------------------------------------------------------- rupiah
/** Saat mengetik/menempel: hanya angka, tanpa nol di depan. */
export function saringRupiah(v) {
  return teks(v).replace(/\D/g, '').replace(/^0+/, '').slice(0, 8);
}

function bilanganBulat(v) {
  if (typeof v === 'number') return Number.isInteger(v) ? v : null;
  if (typeof v === 'string' && /^\d+$/.test(v.trim())) return Number(v.trim());
  return null;
}

export function validasiRupiah(v, { maks = BATAS.rupiahMaks, label = 'Nominal' } = {}) {
  const n = bilanganBulat(v);
  if (n === null) return gagal(`${label} harus berupa angka bulat.`);
  if (n < 1) return gagal(`${label} minimal ${rupiah(1)}.`);
  if (n > maks) return gagal(`${label} maksimal ${rupiah(maks)}.`);
  return ok(n);
}

/** BR-17: 0 < nominal transfer < total. */
export function validasiNominalSplit(v, total) {
  const r = validasiRupiah(v, { label: 'Nominal transfer' });
  if (!r.ok) return r;
  if (!(r.nilai > 0 && r.nilai < total)) {
    return gagal('Nominal transfer harus lebih dari 0 dan kurang dari total pesanan.');
  }
  return r;
}

// --------------------------------------------------------------- angka
export function saringAngka(v) {
  return teks(v).replace(/\D/g, '').slice(0, 3);
}

/** Bilangan bulat dalam rentang. Bawaan: qty 1 sampai 99 (BR-04, D-14). */
export function validasiAngka(v, { min = BATAS.qtyMin, maks = BATAS.qtyMaks, label = 'Jumlah' } = {}) {
  const n = bilanganBulat(v);
  if (n === null) return gagal(`${label} harus berupa angka bulat.`);
  if (n < min) return gagal(`${label} minimal ${min}.`);
  if (n > maks) return gagal(`${label} maksimal ${maks}.`);
  return ok(n);
}

// ---------------------------------------------------------------- kode
/** Saat mengetik/menempel: kapital, hanya alfabet kode dan tanda hubung. */
export function saringKode(v) {
  return [...teks(v).toUpperCase()]
    .filter((c) => c === '-' || ALFABET_KODE.includes(c))
    .join('')
    .slice(0, BATAS.kodePanjang);
}

/** 'kck-abc234', 'KCKABC234', dan 'abc234' menjadi 'KCK-ABC234'. */
export function normalisasiKode(v) {
  const u = teks(v).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (u.length === 9 && u.startsWith('KCK')) return `KCK-${u.slice(3)}`;
  if (u.length === 6) return `KCK-${u}`;
  return teks(v).trim().toUpperCase();
}

export function validasiKode(v) {
  const k = normalisasiKode(v);
  if (!k) return gagal('Kode pesanan wajib diisi.');
  if (!POLA_KODE.test(k)) return gagal('Kode pesanan tidak valid. Contoh: KCK-7H2K9M.');
  return ok(k);
}

// ---------------------------------------------------------------- teks
/**
 * Teks bebas. Kosong dan tidak wajib -> nilai null (siap disimpan sebagai NULL).
 */
export function validasiTeks(v, { maks, min = 0, wajib = false, label = 'Teks' } = {}) {
  const s = teks(v).replace(KONTROL, '').trim();
  if (!s) return wajib ? gagal(`${label} wajib diisi.`) : ok(null);
  if (s.length < min) return gagal(`${label} minimal ${min} karakter.`);
  if (maks && s.length > maks) return gagal(`${label} maksimal ${maks} karakter.`);
  return ok(s);
}

export const validasiCatatanPesanan = (v) =>
  validasiTeks(v, { maks: BATAS.catatanPesananMaks, label: 'Catatan' });

export const validasiCatatanItem = (v) =>
  validasiTeks(v, { maks: BATAS.catatanItemMaks, label: 'Catatan' });

/** Isian teks opsi (BR-03, BR-15). `wajib` bila opsi `butuh_teks`. */
export const validasiTeksOpsi = (v, { wajib = false, label = 'Isian' } = {}) =>
  validasiTeks(v, { maks: BATAS.teksOpsiMaks, wajib, label });

export const validasiAlamat = (v) =>
  validasiTeks(v, { min: BATAS.alamatMin, maks: BATAS.alamatMaks, wajib: true, label: 'Alamat' });

// ---------------------------------------------------------- dispatcher
export const JENIS_INPUT = ['nama', 'telepon', 'rupiah', 'angka', 'kode', 'teks', 'alamat', 'sandi'];

const PENYARING = {
  nama: saringNama,
  telepon: saringTelepon,
  rupiah: saringRupiah,
  angka: saringAngka,
  kode: saringKode,
};

/** Penyaring per `kind` untuk komponen Field. Jenis lain tidak menyaring. */
export function saring(kind, v) {
  const fn = PENYARING[kind];
  return fn ? fn(v) : teks(v);
}

const PEMERIKSA = {
  nama: validasiNama,
  telepon: validasiTelepon,
  rupiah: validasiRupiah,
  angka: validasiAngka,
  kode: validasiKode,
  alamat: validasiAlamat,
};

/** Pemeriksa per `kind`. `teks` memerlukan opsi { maks }, `sandi` hanya memeriksa tidak kosong. */
export function validasi(kind, v, opsi) {
  if (kind === 'sandi') return teks(v) ? ok(teks(v)) : gagal('Sandi wajib diisi.');
  if (kind === 'teks') return validasiTeks(v, opsi);
  const fn = PEMERIKSA[kind];
  if (!fn) throw new Error(`Jenis input tidak dikenal: ${kind}`);
  return fn(v, opsi);
}
