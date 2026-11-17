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
  assert.equal(dana.atasNama, 'TBD');
  for (const r of rekening.filter((x) => x.kode !== 'dana')) {
    assert.equal(r.nomor, 'TBD');
    assert.equal(r.atasNama, 'TBD');
  }
});

test('toko: waAdmin dari pemilik, data lain tidak dikarang', () => {
  assert.equal(toko.nama, 'Kecaknik Food');
  assert.match(toko.waAdmin, /^62\d{8,13}$/);
  assert.equal(toko.alamat, '');
  assert.equal(toko.lat, null);
  assert.equal(toko.lng, null);
});

test('kategori produk sesuai seed', () => {
  assert.deepEqual(kategoriProduk, ['kue', 'puding-salad', 'gorengan', 'lainnya']);
});
