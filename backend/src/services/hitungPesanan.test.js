import test from 'node:test';
import assert from 'node:assert/strict';
import { hitungPesanan } from './hitungPesanan.js';

const salah = (fn, pola) => assert.throws(fn, (g) => g.status === 400 && pola.test(g.message));

const op = (id, nama, harga_tambah = 0, extra = {}) => ({
  id, nama, harga_tambah, butuh_teks: false, label_teks: null, aktif: true, urutan: id, ...extra,
});
const grup = (id, nama, tipe, opsi, extra = {}) => ({
  id, nama, tipe, wajib: false, min_pilih: 0, max_pilih: null, urutan: id, muncul_setelah_grup_id: null, opsi, ...extra,
});
const produk = (id, nama, harga, extra = {}) => ({
  id, nama, harga, is_preorder: false, tanggal_buka: null, tanggal_tutup: null, tanggal_ambil: null, grup: [], ...extra,
});

const puding = produk(1, 'Puding ultah', 100000, {
  grup: [
    grup(10, 'Lilin umur', 'pilih_satu', [op(100, '1 lilin', 2000), op(101, '2 lilin', 4000)], { wajib: true, min_pilih: 1, max_pilih: 1 }),
    grup(11, 'Lilin nama', 'pilih_satu', [op(110, 'Lilin nama', 5000, { butuh_teks: true, label_teks: 'Nama di lilin' })], { muncul_setelah_grup_id: 10, max_pilih: 1 }),
  ],
});
const pizza = produk(2, 'Pizza mozarella', 30000, {
  grup: [grup(20, 'Topping', 'pilih_banyak', [op(200, 'Keju', 3000), op(201, 'Sosis', 4000), op(202, 'Jamur', 2000, { aktif: false })], { max_pilih: 2 })],
});
const nasi = produk(3, 'Es teh', 5000);
const poA = produk(4, 'Bolu A', 50000, { is_preorder: true, tanggal_buka: '2026-11-01', tanggal_tutup: '2026-11-20', tanggal_ambil: '2026-11-25' });
const poB = produk(5, 'Bolu B', 60000, { is_preorder: true, tanggal_buka: '2026-11-01', tanggal_tutup: '2026-11-20', tanggal_ambil: '2026-11-26' });
// daftarProduk({ publik: true }) sudah membuang opsi nonaktif; hitungPesanan tetap menolaknya.
const semua = [puding, pizza, nasi, poA, poB];

test('harga dihitung server: dasar + opsi, dikali qty (BR-01)', () => {
  const r = hitungPesanan([
    { product_id: 3, qty: 2 },
    { product_id: 1, qty: 1, opsi: [{ opsi_id: 101 }], catatan: ' tanpa lilin ' },
  ], semua);
  assert.equal(r.items[0].subtotal, 10000);
  assert.equal(r.items[1].harga_opsi, 4000);
  assert.equal(r.items[1].subtotal, 104000);
  assert.equal(r.items[1].catatan, 'tanpa lilin');
  assert.equal(r.total, 114000);
  assert.equal(r.tanggal_ambil, null);
});

test('klien tidak bisa mengirim harga sendiri (kolom harga diabaikan)', () => {
  const r = hitungPesanan([{ product_id: 3, qty: 1, harga: 1, subtotal: 1 }], semua);
  assert.equal(r.total, 5000);
});

test('qty 1 sampai 99 (BR-04)', () => {
  for (const qty of [0, 100, -1, 1.5, 'x', undefined]) salah(() => hitungPesanan([{ product_id: 3, qty }], semua), /Jumlah/);
  assert.equal(hitungPesanan([{ product_id: 3, qty: '99' }], semua).total, 495000);
});

test('keranjang kosong, produk tidak ada, item rusak', () => {
  salah(() => hitungPesanan([], semua), /kosong/);
  salah(() => hitungPesanan('x', semua), /kosong/);
  salah(() => hitungPesanan([{ product_id: 999, qty: 1 }], semua), /tidak tersedia/);
  salah(() => hitungPesanan([{ product_id: 'abc', qty: 1 }], semua), /tidak valid/);
  salah(() => hitungPesanan([null], semua), /tidak valid/);
});

test('grup wajib harus terisi; pilih_satu tidak boleh dua (BR-03)', () => {
  salah(() => hitungPesanan([{ product_id: 1, qty: 1 }], semua), /Lilin umur.*wajib/);
  salah(() => hitungPesanan([{ product_id: 1, qty: 1, opsi: [{ opsi_id: 100 }, { opsi_id: 101 }] }], semua), /pilih satu/);
});

test('opsi milik produk lain, nonaktif, atau dobel ditolak', () => {
  salah(() => hitungPesanan([{ product_id: 3, qty: 1, opsi: [{ opsi_id: 100 }] }], semua), /tidak tersedia/);
  salah(() => hitungPesanan([{ product_id: 2, qty: 1, opsi: [{ opsi_id: 202 }] }], semua), /tidak tersedia/);
  salah(() => hitungPesanan([{ product_id: 2, qty: 1, opsi: [{ opsi_id: 200 }, { opsi_id: 200 }] }], semua), /dua kali/);
});

test('pilih_banyak: maksimal dipatuhi, opsi opsional boleh kosong', () => {
  assert.equal(hitungPesanan([{ product_id: 2, qty: 1 }], semua).total, 30000);
  assert.equal(hitungPesanan([{ product_id: 2, qty: 1, opsi: [{ opsi_id: 201 }, { opsi_id: 200 }] }], semua).total, 37000);
  const tiga = { ...pizza, grup: [{ ...pizza.grup[0], opsi: [op(200, 'A'), op(201, 'B'), op(203, 'C')] }] };
  salah(() => hitungPesanan([{ product_id: 2, qty: 1, opsi: [{ opsi_id: 200 }, { opsi_id: 201 }, { opsi_id: 203 }] }], [tiga]), /maksimal 2/);
});

test('grup bergantung: hanya berlaku bila pemicu terisi; teks wajib (BR-03)', () => {
  // pemicu terisi + teks
  const r = hitungPesanan([{ product_id: 1, qty: 1, opsi: [{ opsi_id: 100 }, { opsi_id: 110, teks: ' Sadam ' }] }], semua);
  assert.equal(r.items[0].opsi[1].teks, 'Sadam');
  assert.equal(r.items[0].harga_opsi, 7000);
  assert.deepEqual(r.items[0].opsi.map((o) => o.nama_grup), ['Lilin umur', 'Lilin nama']);
  // teks kosong
  salah(() => hitungPesanan([{ product_id: 1, qty: 1, opsi: [{ opsi_id: 100 }, { opsi_id: 110 }] }], semua), /Nama di lilin/);
  // pemicu kosong tetapi grup bergantung dipilih: ditolak (pemicu wajib sendiri sudah gagal lebih dulu)
  const bebas = { ...puding, grup: [{ ...puding.grup[0], wajib: false, min_pilih: 0 }, puding.grup[1]] };
  salah(() => hitungPesanan([{ product_id: 1, qty: 1, opsi: [{ opsi_id: 110, teks: 'X' }] }], [bebas]), /belum berlaku/);
});

test('isian teks pada opsi tanpa butuh_teks diabaikan; teks > 100 karakter ditolak', () => {
  const r = hitungPesanan([{ product_id: 1, qty: 1, opsi: [{ opsi_id: 100, teks: 'abaikan' }] }], semua);
  assert.equal(r.items[0].opsi[0].teks, null);
  salah(() => hitungPesanan([{ product_id: 1, qty: 1, opsi: [{ opsi_id: 100 }, { opsi_id: 110, teks: 'a'.repeat(101) }] }], semua), /maksimal 100/);
});

test('catatan item maksimal 255 (BR-15)', () => {
  salah(() => hitungPesanan([{ product_id: 3, qty: 1, catatan: 'x'.repeat(256) }], semua), /maksimal 255/);
});

test('PO tidak boleh dicampur dengan reguler atau PO tanggal ambil berbeda (BR-05)', () => {
  salah(() => hitungPesanan([{ product_id: 3, qty: 1 }, { product_id: 4, qty: 1 }], semua), /tidak bisa digabung/);
  salah(() => hitungPesanan([{ product_id: 4, qty: 1 }, { product_id: 5, qty: 1 }], semua), /tanggal ambil berbeda/);
  const r = hitungPesanan([{ product_id: 4, qty: 2 }, { product_id: 4, qty: 1 }], semua);
  assert.equal(r.tanggal_ambil, '2026-11-25');
  assert.equal(r.total, 150000);
});

test('produk yang tidak ada di daftar tersedia (nonaktif atau PO tutup) ditolak (BR-02)', () => {
  salah(() => hitungPesanan([{ product_id: 4, qty: 1 }], [puding, nasi]), /tidak tersedia/);
});

test('total terlalu besar ditolak', () => {
  const mahal = produk(9, 'Mahal', 90_000_000);
  salah(() => hitungPesanan([{ product_id: 9, qty: 2 }], [mahal]), /terlalu besar/);
});
