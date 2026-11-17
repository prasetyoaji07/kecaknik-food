// Pembacaan pesanan beserta item, opsi, dan pembayaran (dipakai routes orders dan pembayaran).
import { kueri } from '../db.js';
import { toko } from '@kecaknik/shared/core/konfigurasi.js';
import { sisaBayar } from './statusPembayaran.js';

const bulat3 = (n) => (n === null || n === undefined ? null : Math.round(n * 1000) / 1000);

export async function cariPesananByKode(kode) {
  const [baris] = await kueri('SELECT * FROM orders WHERE kode_pesanan = ?', [kode]);
  return baris ?? null;
}

async function muatRincian(orderId) {
  const items = await kueri('SELECT * FROM order_items WHERE order_id = ? ORDER BY id', [orderId]);
  const opsi = items.length
    ? await kueri('SELECT * FROM order_item_opsi WHERE order_item_id IN (?) ORDER BY id', [items.map((i) => i.id)])
    : [];
  // Urut dari terlama ke terbaru (dipakai wa.js, Lampiran D).
  const pembayaran = await kueri('SELECT * FROM pembayaran WHERE order_id = ? ORDER BY id', [orderId]);
  return {
    items: items.map((i) => ({
      id: i.id,
      product_id: i.product_id,
      nama: i.nama,
      harga: i.harga,
      harga_opsi: i.harga_opsi,
      qty: i.qty,
      catatan: i.catatan,
      subtotal: (i.harga + i.harga_opsi) * i.qty,
      opsi: opsi
        .filter((o) => o.order_item_id === i.id)
        .map((o) => ({ nama_grup: o.nama_grup, nama_opsi: o.nama_opsi, harga_tambah: o.harga_tambah, teks: o.teks })),
    })),
    pembayaran,
  };
}

/** Detail lengkap untuk admin (GET /orders/:id): termasuk no_hp, alamat, koordinat penuh. */
export async function ambilPesananAdmin(id) {
  const [o] = await kueri('SELECT * FROM orders WHERE id = ?', [id]);
  if (!o) return null;
  const { items, pembayaran } = await muatRincian(o.id);
  return {
    id: o.id,
    kode_pesanan: o.kode_pesanan,
    sumber: o.sumber,
    tipe_pesanan: o.tipe_pesanan,
    status: o.status,
    nama_pelanggan: o.nama_pelanggan,
    no_hp: o.no_hp,
    alamat: o.alamat,
    lat: o.lat,
    lng: o.lng,
    tanggal_ambil: o.tanggal_ambil,
    catatan: o.catatan,
    alasan_batal: o.alasan_batal,
    total: o.total,
    metode_bayar: o.metode_bayar,
    nominal_transfer: o.nominal_transfer,
    status_pembayaran: o.status_pembayaran,
    jumlah_dibayar: o.jumlah_dibayar,
    sisa: sisaBayar(o.total, o.jumlah_dibayar),
    created_at: o.created_at,
    updated_at: o.updated_at,
    items,
    pembayaran: pembayaran.map((p) => ({
      id: p.id,
      metode: p.metode,
      channel: p.channel,
      jumlah: p.jumlah,
      bukti_bayar: p.bukti_bayar,
      bukti_url: p.bukti_bayar ? `/uploads/bukti/${p.bukti_bayar}` : null,
      status: p.status,
      dicatat_oleh: p.dicatat_oleh,
      catatan: p.catatan,
      created_at: p.created_at,
      diverifikasi_at: p.diverifikasi_at,
    })),
  };
}

/**
 * Respons publik GET /orders/kode/:kode (BR-14): TANPA no_hp dan alamat. Koordinat pelanggan
 * dibulatkan 3 desimal (±100 m).
 */
export async function ambilStatusPublik(o) {
  const { items, pembayaran } = await muatRincian(o.id);
  const terakhir = pembayaran.at(-1);
  return {
    kode: o.kode_pesanan,
    tanggal: o.created_at,
    tipe_pesanan: o.tipe_pesanan,
    status: o.status,
    alasan_batal: o.alasan_batal,
    status_pembayaran: o.status_pembayaran,
    jumlah_dibayar: o.jumlah_dibayar,
    sisa: sisaBayar(o.total, o.jumlah_dibayar),
    total: o.total,
    metode_bayar: o.metode_bayar,
    nominal_transfer: o.nominal_transfer,
    pembayaran_terakhir: terakhir ? { status: terakhir.status, catatan: terakhir.catatan } : null,
    nama_pelanggan: o.nama_pelanggan,
    tanggal_ambil: o.tanggal_ambil,
    lokasi: o.lat !== null && o.lng !== null ? { lat: bulat3(o.lat), lng: bulat3(o.lng) } : null,
    toko: { lat: toko.lat, lng: toko.lng },
    items: items.map(({ product_id: _p, ...sisa }) => sisa),
  };
}

