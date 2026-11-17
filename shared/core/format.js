// Pemformat tampilan. Fungsi murni, tanpa bergantung pada locale mesin.

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const BULAN_SINGKAT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const WIB_MS = 7 * 60 * 60 * 1000;

/**
 * rupiah(75000) -> 'Rp75.000'. Dibulatkan ke bilangan bulat.
 * Nilai bukan angka (null, undefined, NaN, teks) -> '' agar galat data terlihat.
 */
export function rupiah(nilai) {
  if (nilai === null || nilai === undefined || nilai === '') return '';
  const n = Number(nilai);
  if (!Number.isFinite(n)) return '';
  const bulat = Math.round(Math.abs(n));
  const teks = String(bulat).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${n < 0 && bulat !== 0 ? '-' : ''}Rp${teks}`;
}

// Mengubah masukan menjadi komponen kalender. 'YYYY-MM-DD' dibaca apa adanya
// (kolom DATE tidak bergeser zona waktu). Date atau ISO bertanda waktu dibaca
// sebagai instan lalu dikonversi ke WIB (UTC+7).
function komponen(nilai) {
  if (nilai === null || nilai === undefined || nilai === '') return null;
  if (typeof nilai === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(nilai.trim());
    if (m) {
      const [t, b, h] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const uji = new Date(Date.UTC(t, b - 1, h));
      if (uji.getUTCFullYear() !== t || uji.getUTCMonth() !== b - 1 || uji.getUTCDate() !== h) {
        return null;
      }
      return { t, b: b - 1, h, hari: uji.getUTCDay(), jam: null, menit: null };
    }
  }
  // 'YYYY-MM-DD HH:MM[:SS]' tanpa zona = waktu WIB dari MySQL (dateStrings, sesi +07:00).
  if (typeof nilai === 'string') {
    const w = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(nilai.trim());
    if (w) {
      const [t, b, h, jam, menit] = w.slice(1, 6).map(Number);
      const uji = new Date(Date.UTC(t, b - 1, h, jam, menit));
      if (uji.getUTCFullYear() !== t || uji.getUTCMonth() !== b - 1 || uji.getUTCDate() !== h) return null;
      if (jam > 23 || menit > 59) return null;
      return { t, b: b - 1, h, hari: uji.getUTCDay(), jam, menit };
    }
  }
  const d = nilai instanceof Date ? nilai : new Date(nilai);
  if (Number.isNaN(d.getTime())) return null;
  const w = new Date(d.getTime() + WIB_MS);
  return {
    t: w.getUTCFullYear(),
    b: w.getUTCMonth(),
    h: w.getUTCDate(),
    hari: w.getUTCDay(),
    jam: w.getUTCHours(),
    menit: w.getUTCMinutes(),
  };
}

/**
 * tanggal('2026-11-17')                     -> '17 November 2026'
 * tanggal(x, { singkat: true })              -> '17 Nov 2026'
 * tanggal(x, { hari: true })                 -> 'Selasa, 17 November 2026'
 * tanggal(instan, { jam: true })             -> '17 November 2026, 14.30 WIB'
 * Masukan tidak valid -> ''. Opsi jam diabaikan untuk tanggal tanpa waktu.
 */
export function tanggal(nilai, { singkat = false, hari = false, jam = false } = {}) {
  const k = komponen(nilai);
  if (!k) return '';
  const bulan = (singkat ? BULAN_SINGKAT : BULAN)[k.b];
  let teks = `${k.h} ${bulan} ${k.t}`;
  if (hari) teks = `${HARI[k.hari]}, ${teks}`;
  if (jam && k.jam !== null) {
    teks += `, ${String(k.jam).padStart(2, '0')}.${String(k.menit).padStart(2, '0')} WIB`;
  }
  return teks;
}
