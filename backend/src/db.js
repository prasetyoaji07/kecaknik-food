// Koneksi MySQL/MariaDB. Semua waktu WIB (+07:00). DATE dan TIMESTAMP dikembalikan
// sebagai teks ('2026-11-17', '2026-11-17 10:05:09') agar tidak bergeser zona waktu;
// format.js (tanggal) membacanya sebagai WIB.
import mysql from 'mysql2/promise';
import { env } from './env.js';

export const pool = mysql.createPool({
  ...env.db,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
  decimalNumbers: true, // lat/lng DECIMAL menjadi angka, bukan teks
});

pool.pool.on('connection', (koneksi) => {
  koneksi.query("SET time_zone = '+07:00'");
});

/** Satu kueri berparameter. Selalu pakai `?`, jangan menyambung teks SQL. */
export async function kueri(sql, params = []) {
  const [baris] = await pool.query(sql, params);
  return baris;
}

/**
 * Menjalankan `fn(koneksi)` dalam satu transaksi. Commit bila berhasil, rollback
 * bila melempar galat. Untuk `SELECT ... FOR UPDATE` gunakan koneksi yang diberikan.
 */
export async function transaksi(fn) {
  const koneksi = await pool.getConnection();
  try {
    await koneksi.beginTransaction();
    const hasil = await fn(koneksi);
    await koneksi.commit();
    return hasil;
  } catch (galat) {
    await koneksi.rollback();
    throw galat;
  } finally {
    koneksi.release();
  }
}

export async function cekKoneksi() {
  await pool.query('SELECT 1');
}
