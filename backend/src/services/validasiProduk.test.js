import test from 'node:test';
import assert from 'node:assert/strict';
import { bacaBool, bacaTanggal, periksaProduk, periksaGrupOpsi } from './validasiProduk.js';

const salah = (fn, pola) => assert.throws(fn, (g) => g.status === 400 && pola.test(g.message));

test('bacaBool: bentuk JSON dan multipart', () => {
  for (const v of [true, 1, '1', 'true']) assert.equal(bacaBool(v, false), true);
  for (const v of [false, 0, '0', 'false']) assert.equal(bacaBool(v, true), false);
  assert.equal(bacaBool(undefined, true), true);
  assert.equal(bacaBool('', false), false);
  salah(() => bacaBool('mungkin', false, 'Aktif'), /Aktif/);
});

test('bacaTanggal: tanggal nyata saja', () => {
  assert.equal(bacaTanggal('2026-12-01', 'Tgl'), '2026-12-01');
  assert.equal(bacaTanggal('', 'Tgl'), null);
  salah(() => bacaTanggal('2026-02-30', 'Tgl'), /Tgl/);
  salah(() => bacaTanggal('01-12-2026', 'Tgl'), /Tgl/);
});

const produkDasar = () => ({ nama: 'Nastar 250 gr', harga: '35000', kategori: 'kue', satuan: '250 gr' });

test('periksaProduk: produk reguler, angka pada nama produk diperbolehkan', () => {
  const d = periksaProduk(produkDasar());
  assert.equal(d.nama, 'Nastar 250 gr');
  assert.equal(d.harga, 35000);
  assert.equal(d.aktif, 1);
  assert.equal(d.is_preorder, 0);
  assert.equal(d.tanggal_buka, null);
});

test('periksaProduk: kolom wajib dan kategori', () => {
  salah(() => periksaProduk({ ...produkDasar(), nama: '' }), /Nama produk/);
  salah(() => periksaProduk({ ...produkDasar(), harga: 0 }), /Harga/);
  salah(() => periksaProduk({ ...produkDasar(), harga: -1 }), /Harga/);
  salah(() => periksaProduk({ ...produkDasar(), kategori: 'minuman' }), /Kategori/);
  salah(() => periksaProduk({ ...produkDasar(), satuan: 'x'.repeat(51) }), /Satuan/);
});

test('periksaProduk: pre-order wajib tiga tanggal berurutan', () => {
  const po = { ...produkDasar(), is_preorder: 'true' };
  salah(() => periksaProduk(po), /tanggal buka, tanggal tutup, dan tanggal ambil/);
  salah(
    () => periksaProduk({ ...po, tanggal_buka: '2026-12-10', tanggal_tutup: '2026-12-01', tanggal_ambil: '2026-12-20' }),
    /Urutan tanggal/,
  );
  salah(
    () => periksaProduk({ ...po, tanggal_buka: '2026-12-01', tanggal_tutup: '2026-12-10', tanggal_ambil: '2026-12-09' }),
    /Urutan tanggal/,
  );
  const ok = periksaProduk({ ...po, tanggal_buka: '2026-12-01', tanggal_tutup: '2026-12-01', tanggal_ambil: '2026-12-01' });
  assert.equal(ok.is_preorder, 1);
  // bukan PO: tanggal dibuang
  const bukan = periksaProduk({ ...produkDasar(), tanggal_buka: '2026-12-01' });
  assert.equal(bukan.tanggal_buka, null);
});

test('periksaProduk: PUT mempertahankan kolom lama yang tidak dikirim', () => {
  const lama = {
    nama: 'Klappertart', harga: 6000, kategori: 'kue', satuan: 'per cup', aktif: 1,
    is_preorder: 1, tanggal_buka: '2026-12-01', tanggal_tutup: '2026-12-10', tanggal_ambil: '2026-12-12',
  };
  const d = periksaProduk({ harga: 7000 }, lama);
  assert.equal(d.nama, 'Klappertart');
  assert.equal(d.harga, 7000);
  assert.equal(d.is_preorder, 1);
  assert.equal(d.tanggal_ambil, '2026-12-12');
  assert.equal(periksaProduk({ is_preorder: false }, lama).tanggal_buka, null);
  assert.equal(periksaProduk({ satuan: '' }, lama).satuan, null);
});

// --- grup opsi
const contoh = () => ({
  grup: [
    {
      kunci: 'umur', nama: 'Lilin umur', tipe: 'pilih_satu', wajib: true,
      opsi: [{ nama: '1 lilin', harga_tambah: 0 }, { nama: '2 lilin', harga_tambah: 2000 }],
    },
    {
      kunci: 'nama', nama: 'Lilin nama', tipe: 'pilih_satu', wajib: false, muncul_setelah: 'umur',
      opsi: [{ nama: 'Lilin nama', harga_tambah: '5000', butuh_teks: true, label_teks: 'Nama di lilin' }],
    },
  ],
});

test('periksaGrupOpsi: contoh lilin dinormalkan', () => {
  const [umur, nama] = periksaGrupOpsi(contoh());
  assert.deepEqual([umur.min_pilih, umur.max_pilih, umur.pemicu], [1, 1, null]);
  assert.deepEqual([nama.min_pilih, nama.max_pilih, nama.pemicu], [0, 1, 0]);
  assert.equal(nama.opsi[0].harga_tambah, 5000);
  assert.equal(nama.opsi[0].butuh_teks, 1);
  assert.equal(umur.opsi[0].aktif, 1);
  assert.equal(umur.opsi[0].label_teks, null);
});

test('periksaGrupOpsi: pilih_banyak (topping) tanpa batas atas', () => {
  const [g] = periksaGrupOpsi({
    grup: [{ nama: 'Topping tambahan', tipe: 'pilih_banyak', opsi: [{ nama: 'Keju' }, { nama: 'Sosis' }] }],
  });
  assert.deepEqual([g.min_pilih, g.max_pilih, g.wajib], [0, null, 0]);
  assert.equal(g.opsi[1].harga_tambah, 0);
});

test('periksaGrupOpsi: grup kosong boleh (hapus semua), bentuk salah ditolak', () => {
  assert.deepEqual(periksaGrupOpsi({ grup: [] }), []);
  salah(() => periksaGrupOpsi({}), /larik/);
  salah(() => periksaGrupOpsi(null), /larik/);
});

test('periksaGrupOpsi: aturan grup dan opsi', () => {
  const g = (ubah) => { const c = contoh(); ubah(c); return c; };
  salah(() => periksaGrupOpsi(g((c) => { c.grup[0].opsi = []; })), /minimal 1 opsi/);
  salah(() => periksaGrupOpsi(g((c) => { c.grup[0].nama = ''; })), /Grup 1/);
  salah(() => periksaGrupOpsi(g((c) => { c.grup[0].tipe = 'ngawur'; })), /tipe/);
  salah(() => periksaGrupOpsi(g((c) => { c.grup[0].opsi[0].harga_tambah = -1; })), /Grup 1, opsi 1/);
  salah(() => periksaGrupOpsi(g((c) => { c.grup[1].opsi[0].label_teks = ''; })), /Label isian/);
  salah(() => periksaGrupOpsi(g((c) => { c.grup[1].muncul_setelah = 'tidak-ada'; })), /pemicu tidak ditemukan/);
  salah(() => periksaGrupOpsi(g((c) => { c.grup[0].muncul_setelah = 'umur'; })), /di atas/);
  salah(() => periksaGrupOpsi(g((c) => { c.grup[0].muncul_setelah = 'nama'; })), /di atas/);
  salah(() => periksaGrupOpsi(g((c) => { c.grup[1].kunci = 'umur'; })), /kembar/);
});

test('periksaGrupOpsi: batas pilih_banyak dan opsi nonaktif', () => {
  const banyak = (extra, opsi = [{ nama: 'A' }, { nama: 'B' }]) =>
    ({ grup: [{ nama: 'T', tipe: 'pilih_banyak', opsi, ...extra }] });
  salah(() => periksaGrupOpsi(banyak({ min_pilih: 3 })), /melebihi jumlah opsi aktif/);
  salah(() => periksaGrupOpsi(banyak({ min_pilih: 2, max_pilih: 1 })), /tidak boleh kurang/);
  salah(() => periksaGrupOpsi(banyak({ wajib: true }, [{ nama: 'A', aktif: false }])), /melebihi jumlah opsi aktif/);
  assert.equal(periksaGrupOpsi(banyak({ wajib: true }))[0].min_pilih, 1);
});

test('periksaGrupOpsi: grup bisa dirujuk lewat id lama', () => {
  const [, b] = periksaGrupOpsi({
    grup: [
      { id: 11, nama: 'A', opsi: [{ nama: 'x' }] },
      { id: 12, nama: 'B', muncul_setelah: 11, opsi: [{ nama: 'y' }] },
    ],
  });
  assert.equal(b.pemicu, 0);
});
