// Memuat backend/.env (bukan dari cwd) dan memeriksa variabel wajib.
// Harus diimpor paling awal agar berkas lain membaca process.env yang sudah terisi.
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const folderBackend = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const berkasEnv = path.join(folderBackend, '.env');

if (!existsSync(berkasEnv)) {
  console.warn('backend/.env tidak ditemukan. Salin backend/.env.example menjadi backend/.env lalu isi.');
}
dotenv.config({ path: berkasEnv });

const produksi = process.env.NODE_ENV === 'production';
const masalah = [];

function wajib(nama) {
  const nilai = process.env[nama];
  if (!nilai) {
    masalah.push(`${nama} belum diisi di backend/.env`);
    return '';
  }
  if (nilai.startsWith('ganti-dengan')) {
    if (produksi) masalah.push(`${nama} masih berisi contoh dari .env.example`);
    else console.warn(`Peringatan: ${nama} masih berisi contoh dari .env.example. Ganti sebelum demo.`);
  }
  return nilai;
}

const adminPassword = wajib('ADMIN_PASSWORD');
const jwtSecret = wajib('JWT_SECRET');
if (jwtSecret && jwtSecret.length < 16) masalah.push('JWT_SECRET minimal 16 karakter');

if (masalah.length) {
  console.error(`Konfigurasi tidak valid:\n- ${masalah.join('\n- ')}`);
  process.exit(1);
}

export const env = {
  produksi,
  port: Number(process.env.PORT) || 5000,
  adminPassword,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kecaknik_food',
  },
  folderBackend,
};
