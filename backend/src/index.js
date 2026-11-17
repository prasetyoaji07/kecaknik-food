import './env.js'; // harus pertama
import express from 'express';
import cors from 'cors';
import { env } from './env.js';
import { cekKoneksi } from './db.js';
import { DIR_UPLOAD } from './middleware/upload.js';
import { penangkapGalat, tidakDitemukan } from './middleware/galat.js';
import authRoute from './routes/auth.js';
import productsRoute from './routes/products.js';
import opsiRoute from './routes/opsi.js';
import ordersRoute from './routes/orders.js';
import pembayaranRoute, { pembayaranPesanan } from './routes/pembayaran.js';
import laporanRoute from './routes/laporan.js';

const app = express();
app.disable('x-powered-by');

app.use(
  cors({
    origin(asal, balas) {
      // Tanpa header Origin (curl, smoke test) diizinkan. Browser harus dari daftar.
      if (!asal || env.corsOrigins.includes(asal)) return balas(null, true);
      return balas(null, false);
    },
  }),
);
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});
app.use(express.json({ limit: '100kb' }));

// File bukti dan foto produk: folder statis, nama acak 32 heksa (D-11).
app.use('/uploads', express.static(DIR_UPLOAD, { index: false, dotfiles: 'deny', fallthrough: true }));

app.get('/health', (req, res) => res.json({ ok: true }));

// Rute: aktifkan satu per satu saat unitnya selesai.
app.use('/auth', authRoute);
app.use('/products', productsRoute);
app.use('/products', opsiRoute);
app.use('/orders', ordersRoute);
app.use('/orders', pembayaranPesanan); // POST /orders/:id/pembayaran
app.use('/pembayaran', pembayaranRoute);
app.use('/laporan', laporanRoute);

app.use(tidakDitemukan);
app.use(penangkapGalat);

try {
  await cekKoneksi();
} catch (galat) {
  console.error(`Tidak bisa terhubung ke MySQL (${env.db.host}:${env.db.port}, basis data "${env.db.database}"): ${galat.message}`);
  console.error('Pastikan MySQL di XAMPP sudah Start dan `npm run db:reset` sudah dijalankan.');
  process.exit(1);
}

app.listen(env.port, () => {
  console.log(`API Kecaknik Food berjalan di http://localhost:${env.port}`);
});
