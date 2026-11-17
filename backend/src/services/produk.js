// Pembacaan produk beserta grup dan opsi bersarang (dipakai routes dan hitungPesanan).
import { kueri } from '../db.js';

const ya = (v) => v === 1 || v === true;

function bentukOpsi(o) {
  return {
    id: o.id,
    nama: o.nama,
    harga_tambah: o.harga_tambah,
    butuh_teks: ya(o.butuh_teks),
    label_teks: o.label_teks,
    aktif: ya(o.aktif),
    urutan: o.urutan,
  };
}

function bentukGrup(g, opsi) {
  return {
    id: g.id,
    nama: g.nama,
    tipe: g.tipe,
    wajib: ya(g.wajib),
    min_pilih: g.min_pilih,
    max_pilih: g.max_pilih,
    urutan: g.urutan,
    muncul_setelah_grup_id: g.muncul_setelah_grup_id,
    opsi: opsi.filter((o) => o.grup_id === g.id).map(bentukOpsi),
  };
}

function bentukProduk(p, grup) {
  return {
    id: p.id,
    nama: p.nama,
    harga: p.harga,
    kategori: p.kategori,
    satuan: p.satuan,
    gambar: p.gambar,
    gambar_url: p.gambar ? `/uploads/produk/${p.gambar}` : null,
    aktif: ya(p.aktif),
    is_preorder: ya(p.is_preorder),
    tanggal_buka: p.tanggal_buka,
    tanggal_tutup: p.tanggal_tutup,
    tanggal_ambil: p.tanggal_ambil,
    // eslint-disable-next-line no-unused-vars
    grup: grup.filter((g) => g.product_id === p.id).map(({ product_id, ...sisa }) => sisa),
  };
}

/**
 * Produk + grup + opsi.
 * publik: hanya produk aktif; PO yang belum buka atau sudah tutup disembunyikan
 *   (BR-02, D-09; tanggal acuan CURDATE() sesi WIB); hanya opsi aktif.
 * id: satu produk saja.
 */
export async function daftarProduk({ publik = false, id = null } = {}) {
  const syarat = [];
  const param = [];
  if (publik) {
    syarat.push('aktif = 1');
    syarat.push('(is_preorder = 0 OR CURDATE() BETWEEN tanggal_buka AND tanggal_tutup)');
  }
  if (id !== null) {
    syarat.push('id = ?');
    param.push(id);
  }
  const produk = await kueri(
    `SELECT * FROM products ${syarat.length ? `WHERE ${syarat.join(' AND ')}` : ''} ORDER BY id`,
    param,
  );
  if (produk.length === 0) return [];

  const grupBaris = await kueri(
    'SELECT * FROM grup_opsi WHERE product_id IN (?) ORDER BY urutan, id',
    [produk.map((p) => p.id)],
  );
  const opsiBaris = grupBaris.length
    ? await kueri(
        `SELECT * FROM opsi_produk WHERE grup_id IN (?) ${publik ? 'AND aktif = 1' : ''} ORDER BY urutan, id`,
        [grupBaris.map((g) => g.id)],
      )
    : [];

  const grup = grupBaris.map((g) => ({ product_id: g.product_id, ...bentukGrup(g, opsiBaris) }));
  return produk.map((p) => bentukProduk(p, grup));
}

export async function ambilProduk(id, opsi = {}) {
  const [p] = await daftarProduk({ ...opsi, id });
  return p ?? null;
}
