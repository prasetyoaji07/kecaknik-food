// GET /laporan (admin). BR-11, D-05, D-06: pesanan `dibatalkan` dikecualikan, tanggal acuan
// created_at (WIB), dua kolom berdampingan: total tagihan dan total diterima.
import { Router } from 'express';
import { kueri } from '../db.js';
import { wajibAdmin } from '../middleware/auth.js';
import { bungkus } from '../middleware/galat.js';
import { rentangLaporan, formatPeriodeSql, ringkas } from '../services/laporan.js';

const router = Router();

router.get('/', wajibAdmin, bungkus(async (req, res) => {
  const r = rentangLaporan(req.query);
  const mentah = await kueri(
    `SELECT DATE_FORMAT(created_at, ?) AS periode, COUNT(*) AS jumlah_pesanan,
            COALESCE(SUM(total), 0) AS total_tagihan, COALESCE(SUM(jumlah_dibayar), 0) AS total_diterima
     FROM orders
     WHERE status <> 'dibatalkan' AND DATE(created_at) BETWEEN ? AND ?
     GROUP BY periode ORDER BY periode`,
    [formatPeriodeSql(r.periode), r.dari, r.sampai],
  );
  const baris = mentah.map((b) => ({
    periode: b.periode,
    jumlah_pesanan: Number(b.jumlah_pesanan),
    total_tagihan: Number(b.total_tagihan),
    total_diterima: Number(b.total_diterima),
  }));
  res.json({ ...r, baris, ringkasan: ringkas(baris) });
}));

export default router;
