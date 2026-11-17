// Logika murni Field (DESIGN bagian 6): petunjuk saat karakter disaring, tampilan terformat
// saat tidak fokus, galat per jenis, dan perapian saat blur. Dipisah dari JSX agar bisa diuji.
import { saring, validasi, normalisasiTelepon } from '../../core/validasi.js';
import { rupiah } from '../../core/format.js';

export const LABEL_BAWAAN = {
  nama: 'Nama',
  telepon: 'Nomor WhatsApp',
  rupiah: 'Nominal',
  angka: 'Jumlah',
  kode: 'Kode pesanan',
  teks: 'Isian',
  alamat: 'Alamat',
  sandi: 'Sandi',
};

const PETUNJUK = {
  nama: 'Nama hanya boleh huruf.',
  telepon: 'Nomor WhatsApp hanya boleh angka.',
  rupiah: 'Nominal hanya boleh angka.',
  angka: 'Isi dengan angka saja.',
  kode: 'Kode hanya memakai huruf dan angka yang jelas (tanpa 0, 1, I, L, O).',
};

// Karakter yang boleh hilang tanpa memunculkan petunjuk (spasi ganda, +, -, titik ribuan).
const ABAI = {
  telepon: /[\s+-]/g,
  rupiah: /[\s.,]|rp/gi,
};
const ABAI_BAWAAN = /\s/g;

/** Petunjuk bila `awal` kehilangan karakter karena disaring menjadi `hasilSaring`. Selain itu null. */
export function petunjukSaring(kind, awal, hasilSaring) {
  const teks = PETUNJUK[kind];
  if (!teks) return null;
  const abai = ABAI[kind] ?? ABAI_BAWAAN;
  const a = String(awal).replace(abai, '').toUpperCase();
  const b = String(hasilSaring).replace(abai, '').toUpperCase();
  return a.length > b.length ? teks : null;
}

/** Penyaring untuk satu ketikan: true bila ketikan itu seluruhnya ditolak (untuk onBeforeInput). */
export function ketikanDitolak(kind, data) {
  if (typeof data !== 'string' || data.length !== 1) return false;
  return petunjukSaring(kind, data, saring(kind, data)) !== null;
}

/** 62812... -> '+62 812 3456 7890'. Bukan nomor sah -> dikembalikan apa adanya. */
export function formatTelepon(v) {
  const n = normalisasiTelepon(v);
  if (!/^62\d{8,13}$/.test(n)) return String(v);
  const s = n.slice(2);
  return `+62 ${s.slice(0, 3)} ${s.slice(3, 7)} ${s.slice(7)}`.trim();
}

/** Teks yang tampil di input: terformat saat tidak fokus (telepon, rupiah), mentah saat fokus. */
export function tampilanField(kind, nilai, fokus) {
  const v = nilai === null || nilai === undefined ? '' : String(nilai);
  if (fokus || v === '') return v;
  if (kind === 'telepon') return formatTelepon(v);
  if (kind === 'rupiah' && /^\d+$/.test(v)) return rupiah(Number(v));
  return v;
}

/** Perapian saat blur: nama merapikan spasi ganda, teks memangkas ujung. */
export function rapikan(kind, nilai) {
  const v = nilai === null || nilai === undefined ? '' : String(nilai);
  if (kind === 'nama') return v.trim().replace(/\s{2,}/g, ' ');
  if (kind === 'teks' || kind === 'alamat') return v.trim();
  return v;
}

/**
 * Galat untuk nilai sekarang, atau null bila sah / kosong dan tidak wajib.
 * opsi: { wajib, label, min, maks, maksKarakter }
 */
export function galatField(kind, nilai, { wajib = false, label, min, maks, maksKarakter } = {}) {
  const v = nilai === null || nilai === undefined ? '' : String(nilai);
  const nama = label || LABEL_BAWAAN[kind] || 'Isian';
  if (v.trim() === '') return wajib ? `${nama} wajib diisi.` : null;
  let opsi;
  if (kind === 'teks') opsi = { maks: maksKarakter, label: nama };
  else if (kind === 'angka') opsi = { min, maks, label: nama };
  else if (kind === 'rupiah') opsi = { label: nama };
  const r = validasi(kind, v, opsi);
  return r.ok ? null : r.galat;
}
