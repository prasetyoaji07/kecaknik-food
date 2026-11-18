import test from 'node:test';
import assert from 'node:assert/strict';
import { toko, rekening, kanal, kategoriProduk } from './konfigurasi.js';

test('kanal sesuai ENUM sumber pesanan', () => {
  assert.deepEqual(kanal, ['website', 'whatsapp', 'facebook', 'langsung']);
});

test('rekening: empat kanal, DANA terisi, sisanya masih placeholder', () => {
  assert.deepEqual(rekening.map((r) => r.kode), ['dana', 'bca', 'bri', 'gopay']);
  const dana = rekening.find((r) => r.kode === 'dana');
  assert.equal(dana.nomor, '6281999915104');
  assert.equal(dana.atasNama, 'Antonius Randie H.');
  for (const r of rekening.filter((x) => x.kode !== 'dana')) {
    assert.equal(r.nomor, 'TBD');
    assert.equal(r.atasNama, 'Antonius Randie H.');
  }
});

test('toko: waAdmin dari pemilik, data lain tidak dikarang', () => {
  assert.equal(toko.nama, 'Kecaknik Food');
  assert.match(toko.waAdmin, /^62\d{8,13}$/);
  assert.equal(toko.alamat, 'Unnamed Road, Sukasari, Kec. Serang Baru, Kabupaten Bekasi, Jawa Barat 17330');
  assert.deepEqual(toko.jamBuka, [
    { label: 'Pesan online', jam: 'Buka 24 jam' },
    { label: 'COD dan lainnya', jam: '08:00 - 21:00 WIB' },
  ]);
  // Koordinat toko boleh kosong (null) atau angka valid.
  for (const v of [toko.lat, toko.lng]) assert.ok(v === null || Number.isFinite(v));
});

test('kategori produk sesuai seed', () => {
  assert.deepEqual(kategoriProduk, ['kue', 'puding-salad', 'gorengan', 'lainnya']);
});
