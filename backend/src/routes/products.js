import { Router } from 'express';
import { kueri } from '../db.js';
import { wajibAdmin } from '../middleware/auth.js';
import { unggah, hapusFile, denganBersihFile } from '../middleware/upload.js';
import { bungkus, galat400, galat404 } from '../middleware/galat.js';
import { daftarProduk, ambilProduk } from '../services/produk.js';
import { periksaProduk, bacaBool } from '../services/validasiProduk.js';

const router = Router();

const KOLOM_SIMPAN = [
  'nama', 'harga', 'kategori', 'satuan', 'aktif', 'is_preorder',
  'tanggal_buka', 'tanggal_tutup', 'tanggal_ambil',
];

function idParam(req) {
  if (!/^\d+$/.test(req.params.id)) throw galat404('Produk tidak ditemukan.');
  return Number(req.params.id);
}

// GET /products: publik, produk aktif (PO di luar rentang tanggal disembunyikan)
router.get('/', bungkus(async (req, res) => {
  res.json(await daftarProduk({ publik: true }));
}));

// GET /products/semua: admin, semua produk termasuk nonaktif dan semua opsi
// (tambahan kontrak untuk halaman Kelola produk)
router.get('/semua', wajibAdmin, bungkus(async (req, res) => {
  res.json(await daftarProduk());
}));

// POST /products: admin, JSON atau multipart (foto di field `foto`)
router.post('/', wajibAdmin, ...unggah('foto', 'produk'), bungkus(async (req, res) => {
  await denganBersihFile(req, async () => {
    const data = periksaProduk(req.body);
    const gambar = req.fileTersimpan?.nama ?? null;
    const hasil = await kueri(
      `INSERT INTO products (${[...KOLOM_SIMPAN, 'gambar'].join(', ')}) VALUES (?)`,
      [[...KOLOM_SIMPAN.map((k) => data[k]), gambar]],
    );
    res.status(201).json(await ambilProduk(hasil.insertId));
  });
}));

// PUT /products/:id: admin. Kolom yang tidak dikirim dipertahankan.
router.put('/:id', wajibAdmin, ...unggah('foto', 'produk'), bungkus(async (req, res) => {
  const id = idParam(req);
  await denganBersihFile(req, async () => {
    const [lama] = await kueri('SELECT * FROM products WHERE id = ?', [id]);
    if (!lama) throw galat404('Produk tidak ditemukan.');

    const data = periksaProduk(req.body, lama);
    const gambar = req.fileTersimpan?.nama ?? lama.gambar;
    await kueri(
      `UPDATE products SET ${[...KOLOM_SIMPAN, 'gambar'].map((k) => `${k} = ?`).join(', ')} WHERE id = ?`,
      [...KOLOM_SIMPAN.map((k) => data[k]), gambar, id],
    );
    if (req.fileTersimpan && lama.gambar) await hapusFile('produk', lama.gambar);
    res.json(await ambilProduk(id));
  });
}));

// PATCH /products/:id/aktif  { aktif: true|false }
router.patch('/:id/aktif', wajibAdmin, bungkus(async (req, res) => {
  const id = idParam(req);
  if (req.body?.aktif === undefined) throw galat400('Isian aktif wajib dikirim.');
  const aktif = bacaBool(req.body.aktif, true, 'Status aktif');
  const hasil = await kueri('UPDATE products SET aktif = ? WHERE id = ?', [aktif ? 1 : 0, id]);
  if (hasil.affectedRows === 0) throw galat404('Produk tidak ditemukan.');
  res.json(await ambilProduk(id));
}));

// DELETE /products/:id: grup dan opsi ikut terhapus (CASCADE). Riwayat pesanan tetap
// utuh karena order_items menyimpan snapshot nama dan harga.
router.delete('/:id', wajibAdmin, bungkus(async (req, res) => {
  const id = idParam(req);
  const [lama] = await kueri('SELECT gambar FROM products WHERE id = ?', [id]);
  if (!lama) throw galat404('Produk tidak ditemukan.');
  await kueri('DELETE FROM products WHERE id = ?', [id]);
  if (lama.gambar) await hapusFile('produk', lama.gambar);
  res.json({ ok: true });
}));

export default router;
