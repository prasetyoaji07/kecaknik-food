// Rentang dan pengelompokan laporan (BR-11, D-05, D-06). Murni, tanpa DB.
import { galat400 } from '../middleware/galat.js';
import { bacaTanggal } from './validasiProduk.js';

export const PERIODE = ['harian', 'bulanan'];
export const MAKS_HARI = 366;

/** Tanggal 'YYYY-MM-DD' hari ini di WIB. */
export function hariIniWib(sekarang = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(sekarang);
}

const kePakai = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const keTeks = (d) => d.toISOString().slice(0, 10);

/**
 * Menentukan { periode, dari, sampai }. Bawaan: sampai = hari ini; harian: dari = 29 hari
 * sebelumnya; bulanan: dari = tanggal 1 sebelas bulan sebelumnya. Maksimal 366 hari.
 */
export function rentangLaporan({ periode, dari, sampai }, hariIni = hariIniWib()) {
  const p = periode === undefined || periode === '' ? 'harian' : periode;
  if (!PERIODE.includes(p)) throw galat400('Periode harus harian atau bulanan.');
  const akhir = bacaTanggal(sampai, 'Tanggal sampai') ?? hariIni;
  let awal = bacaTanggal(dari, 'Tanggal dari');
  if (!awal) {
    const a = kePakai(akhir);
    if (p === 'harian') a.setUTCDate(a.getUTCDate() - 29);
    else { a.setUTCDate(1); a.setUTCMonth(a.getUTCMonth() - 11); }
    awal = keTeks(a);
  }
  if (awal > akhir) throw galat400('Tanggal dari tidak boleh setelah tanggal sampai.');
  const hari = (kePakai(akhir) - kePakai(awal)) / 86_400_000 + 1;
  if (hari > MAKS_HARI) throw galat400(`Rentang laporan maksimal ${MAKS_HARI} hari.`);
  return { periode: p, dari: awal, sampai: akhir };
}

/** Format SQL DATE_FORMAT untuk pengelompokan. */
export const formatPeriodeSql = (periode) => (periode === 'bulanan' ? '%Y-%m' : '%Y-%m-%d');

/** Jumlahkan baris laporan menjadi ringkasan. */
export function ringkas(baris) {
  return baris.reduce(
    (r, b) => ({
      jumlah_pesanan: r.jumlah_pesanan + b.jumlah_pesanan,
      total_tagihan: r.total_tagihan + b.total_tagihan,
      total_diterima: r.total_diterima + b.total_diterima,
    }),
    { jumlah_pesanan: 0, total_tagihan: 0, total_diterima: 0 },
  );
}
