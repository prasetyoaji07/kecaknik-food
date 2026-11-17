// `npm run db:reset`: buat ulang basis data dari nol (schema.sql lalu seed.sql).
// Membaca backend/.env (lihat backend/.env.example). MENGHAPUS semua data DB_NAME.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const akar = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(akar, '..', 'backend', '.env') });

if (process.env.NODE_ENV === 'production') {
  console.error('db:reset ditolak saat NODE_ENV=production.');
  process.exit(1);
}

const nama = process.env.DB_NAME || 'kecaknik_food';
if (!/^[A-Za-z0-9_]+$/.test(nama)) {
  console.error('DB_NAME hanya boleh huruf, angka, dan garis bawah.');
  process.exit(1);
}

let koneksi;
try {
  koneksi = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    charset: 'utf8mb4',
  });

  await koneksi.query("SET time_zone = '+07:00'"); // WIB, agar CURDATE() di seed sesuai
  await koneksi.query(`DROP DATABASE IF EXISTS \`${nama}\``);
  await koneksi.query(
    `CREATE DATABASE \`${nama}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await koneksi.query(`USE \`${nama}\``);

  for (const berkas of ['schema.sql', 'seed.sql']) {
    const sql = await readFile(path.join(akar, berkas), 'utf8');
    await koneksi.query(sql);
    console.log(`OK  ${berkas}`);
  }

  const [[p]] = await koneksi.query('SELECT COUNT(*) AS n FROM products');
  const [[g]] = await koneksi.query('SELECT COUNT(*) AS n FROM grup_opsi');
  const [[o]] = await koneksi.query('SELECT COUNT(*) AS n FROM opsi_produk');
  const [[po]] = await koneksi.query('SELECT COUNT(*) AS n FROM products WHERE is_preorder = 1');
  console.log(`Basis data "${nama}" siap: ${p.n} produk (${po.n} PO), ${g.n} grup opsi, ${o.n} opsi.`);
} catch (galat) {
  console.error(`db:reset gagal: ${galat.code ?? ''} ${galat.message}`);
  if (galat.code === 'ECONNREFUSED') console.error('Pastikan MySQL di XAMPP sudah Start.');
  process.exitCode = 1;
} finally {
  if (koneksi) await koneksi.end();
}
