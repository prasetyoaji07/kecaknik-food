// PUT /products/:id/opsi: ganti seluruh grup dan opsi satu produk dalam satu payload
// (satu transaksi). Dipasang di /products. Format payload: lihat periksaGrupOpsi().
import { Router } from 'express';
import { transaksi } from '../db.js';
import { wajibAdmin } from '../middleware/auth.js';
import { bungkus, galat404 } from '../middleware/galat.js';
import { ambilProduk } from '../services/produk.js';
import { periksaGrupOpsi } from '../services/validasiProduk.js';

const router = Router();

router.put('/:id/opsi', wajibAdmin, bungkus(async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) throw galat404('Produk tidak ditemukan.');
  const id = Number(req.params.id);
  const grup = periksaGrupOpsi(req.body);

  await transaksi(async (k) => {
    const [ada] = await k.query('SELECT id FROM products WHERE id = ? FOR UPDATE', [id]);
    if (ada.length === 0) throw galat404('Produk tidak ditemukan.');

    // Opsi ikut terhapus (CASCADE). order_item_opsi.opsi_id menjadi NULL, snapshot tetap.
    await k.query('DELETE FROM grup_opsi WHERE product_id = ?', [id]);

    const idBaru = [];
    for (let i = 0; i < grup.length; i += 1) {
      const g = grup[i];
      // Pemicu diisi setelah semua grup ada, karena merujuk id yang baru dibuat.
      const [r] = await k.query(
        `INSERT INTO grup_opsi (product_id, nama, tipe, wajib, min_pilih, max_pilih, urutan)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, g.nama, g.tipe, g.wajib, g.min_pilih, g.max_pilih, i + 1],
      );
      idBaru.push(r.insertId);
      await k.query(
        `INSERT INTO opsi_produk (grup_id, nama, harga_tambah, butuh_teks, label_teks, aktif, urutan)
         VALUES ?`,
        [g.opsi.map((o, j) => [r.insertId, o.nama, o.harga_tambah, o.butuh_teks, o.label_teks, o.aktif, j + 1])],
      );
    }
    for (let i = 0; i < grup.length; i += 1) {
      if (grup[i].pemicu !== null) {
        await k.query('UPDATE grup_opsi SET muncul_setelah_grup_id = ? WHERE id = ?', [
          idBaru[grup[i].pemicu],
          idBaru[i],
        ]);
      }
    }
  });

  res.json(await ambilProduk(id));
}));

export default router;
