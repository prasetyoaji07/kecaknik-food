// Pembayaran: catat langsung diterima oleh admin (POST /orders/:id/pembayaran) dan verifikasi
// baris (PATCH /pembayaran/:id). BR-07, BR-08, BR-10, D-13. Setiap perubahan memanggil
// sinkronPembayaran di transaksi yang sama.
import { Router } from 'express';
import { transaksi } from '../db.js';
import { wajibAdmin } from '../middleware/auth.js';
import { unggah, denganBersihFile } from '../middleware/upload.js';
import { bungkus, galat400, galat404, galat409 } from '../middleware/galat.js';
import { sinkronPembayaran } from '../services/statusPembayaran.js';
import { ambilPesananAdmin } from '../services/pesanan.js';
import { validasiRupiah, validasiTeks } from '@kecaknik/shared/core/validasi.js';
import { rekening } from '@kecaknik/shared/core/konfigurasi.js';
import { bolehTransisiBaris } from '@kecaknik/shared/core/statusPesanan.js';

const CHANNEL = rekening.map((r) => r.kode);
const hasil = (r) => {
  if (!r.ok) throw galat400(r.galat);
  return r.nilai;
};
const idParam = (req, pesan) => {
  if (!/^\d+$/.test(req.params.id)) throw galat404(pesan);
  return Number(req.params.id);
};
const catatan255 = (v, wajib = false) => hasil(validasiTeks(v, { maks: 255, wajib, label: 'Catatan' }));

// POST /orders/:id/pembayaran: tunai, transfer, atau pelunasan, langsung `diterima`.
// Body (JSON atau multipart dengan file `bukti`): { metode, channel, jumlah, catatan }.
// Transfer tanpa bukti hanya dengan catatan (pengecualian BR-07).
export const pembayaranPesanan = Router();

pembayaranPesanan.post('/:id/pembayaran', wajibAdmin, ...unggah('bukti', 'bukti'), bungkus(async (req, res) => {
  const id = idParam(req, 'Pesanan tidak ditemukan.');
  await denganBersihFile(req, async () => {
    const b = req.body ?? {};
    if (!['tunai', 'transfer'].includes(b.metode)) throw galat400('Metode pembayaran: tunai atau transfer.');
    const jumlah = hasil(validasiRupiah(b.jumlah, { label: 'Jumlah pembayaran' }));
    const catatan = catatan255(b.catatan);
    let channel = null;
    if (b.metode === 'transfer') {
      if (!CHANNEL.includes(b.channel)) throw galat400(`Pilih channel transfer: ${rekening.map((r) => r.nama).join(', ')}.`);
      channel = b.channel;
      if (!req.fileTersimpan && !catatan) throw galat400('Transfer tanpa bukti wajib disertai catatan alasan.');
    } else if (req.fileTersimpan) {
      throw galat400('Pembayaran tunai tidak memerlukan bukti.');
    }

    await transaksi(async (k) => {
      const [[o]] = await k.query('SELECT id, status, metode_bayar FROM orders WHERE id = ? FOR UPDATE', [id]);
      if (!o) throw galat404('Pesanan tidak ditemukan.');
      if (o.status === 'dibatalkan') throw galat409('Pesanan sudah dibatalkan, pembayaran tidak bisa dicatat.');
      await k.query(
        `INSERT INTO pembayaran (order_id, metode, channel, jumlah, bukti_bayar, status, dicatat_oleh, catatan, diverifikasi_at)
         VALUES (?, ?, ?, ?, ?, 'diterima', 'admin', ?, NOW())`,
        [id, b.metode, channel, jumlah, req.fileTersimpan?.nama ?? null, catatan],
      );
      if (!o.metode_bayar) await k.query('UPDATE orders SET metode_bayar = ? WHERE id = ?', [b.metode, id]);
      await sinkronPembayaran(k, id); // menolak kelebihan bayar (D-13), transaksi dibatalkan
    });
    res.status(201).json(await ambilPesananAdmin(id));
  });
}));

// PATCH /pembayaran/:id: verifikasi baris. Body: { status, jumlah?, catatan? }.
//   diterima     (dari menunggu)  jumlah boleh dikoreksi
//   ditolak      (dari menunggu)  catatan wajib
//   dikembalikan (dari diterima)  catatan wajib, hanya bila pesanan sudah dibatalkan (BR-10)
const router = Router();

router.patch('/:id', wajibAdmin, bungkus(async (req, res) => {
  const id = idParam(req, 'Pembayaran tidak ditemukan.');
  const ke = req.body?.status;
  if (!['diterima', 'ditolak', 'dikembalikan'].includes(ke)) {
    throw galat400('Status tujuan: diterima, ditolak, atau dikembalikan.');
  }
  const catatan = catatan255(req.body.catatan, ke !== 'diterima');
  const jumlahBaru = ke === 'diterima' && req.body.jumlah !== undefined && req.body.jumlah !== ''
    ? hasil(validasiRupiah(req.body.jumlah, { label: 'Jumlah pembayaran' }))
    : null;

  const orderId = await transaksi(async (k) => {
    const [[awal]] = await k.query('SELECT order_id FROM pembayaran WHERE id = ?', [id]);
    if (!awal) throw galat404('Pembayaran tidak ditemukan.');
    // Kunci pesanan lebih dulu (urutan sama dengan sinkronPembayaran), lalu baris pembayaran.
    const [[o]] = await k.query('SELECT id, status FROM orders WHERE id = ? FOR UPDATE', [awal.order_id]);
    const [[p]] = await k.query('SELECT * FROM pembayaran WHERE id = ? FOR UPDATE', [id]);
    if (!bolehTransisiBaris(p.status, ke)) {
      throw galat409(`Pembayaran berstatus "${p.status}" tidak bisa diubah menjadi "${ke}".`);
    }
    if (ke === 'dikembalikan' && o.status !== 'dibatalkan') {
      throw galat409('Pembayaran hanya bisa ditandai dikembalikan setelah pesanan dibatalkan.');
    }
    await k.query(
      'UPDATE pembayaran SET status = ?, jumlah = ?, catatan = ?, diverifikasi_at = NOW() WHERE id = ?',
      [ke, jumlahBaru ?? p.jumlah, catatan ?? p.catatan, id],
    );
    await sinkronPembayaran(k, o.id);
    return o.id;
  });
  res.json(await ambilPesananAdmin(orderId));
}));

export default router;
