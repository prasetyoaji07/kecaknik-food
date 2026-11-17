// BR-08: status pembayaran pesanan dihitung dari jumlah_dibayar = Σ pembayaran berstatus
// `diterima` (`dikembalikan`, `menunggu`, `ditolak` tidak dihitung). Kelebihan bayar ditolak (D-13).
// Tanpa impor db.js: fungsi basis data menerima koneksi transaksi dari pemanggil.
import { galat400, galat404 } from '../middleware/galat.js';

/** 0 -> belum_dibayar, 0 < x < total -> uang_muka, x = total -> lunas. x > total -> null (ditolak). */
export function tentukanStatusPembayaran(total, jumlahDibayar) {
  if (jumlahDibayar > total) return null;
  if (jumlahDibayar <= 0) return 'belum_dibayar';
  return jumlahDibayar === total ? 'lunas' : 'uang_muka';
}

/** Sisa yang harus dibayar, tidak pernah negatif. */
export const sisaBayar = (total, jumlahDibayar) => Math.max(0, total - jumlahDibayar);

/**
 * Hitung ulang jumlah_dibayar dan status_pembayaran satu pesanan dari baris pembayaran.
 * Panggil di dalam `transaksi()` setelah mengubah baris pembayaran. Mengunci baris pesanan
 * (FOR UPDATE). Melempar 400 bila total diterima melebihi total pesanan (D-13), sehingga
 * transaksi pemanggil dibatalkan.
 */
export async function sinkronPembayaran(koneksi, orderId) {
  const [[pesanan]] = await koneksi.query('SELECT id, total FROM orders WHERE id = ? FOR UPDATE', [orderId]);
  if (!pesanan) throw galat404('Pesanan tidak ditemukan.');
  const [[jumlah]] = await koneksi.query(
    "SELECT COALESCE(SUM(jumlah), 0) AS dibayar FROM pembayaran WHERE order_id = ? AND status = 'diterima'",
    [orderId],
  );
  const dibayar = Number(jumlah.dibayar);
  const status = tentukanStatusPembayaran(pesanan.total, dibayar);
  if (status === null) {
    throw galat400('Total pembayaran diterima melebihi total pesanan. Periksa nominalnya.');
  }
  await koneksi.query('UPDATE orders SET jumlah_dibayar = ?, status_pembayaran = ? WHERE id = ?', [dibayar, status, orderId]);
  return {
    jumlah_dibayar: dibayar,
    status_pembayaran: status,
    total: pesanan.total,
    sisa: sisaBayar(pesanan.total, dibayar),
  };
}
