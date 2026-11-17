import { test } from 'node:test';
import assert from 'node:assert/strict';
import { periksaFileGambar, ukuranFile, MAKS_BYTE } from './aturanDropzone.js';

const file = (type, size) => ({ type, size });

test('file jpg, png, webp di bawah batas lolos', () => {
  for (const t of ['image/jpeg', 'image/png', 'image/webp']) {
    assert.equal(periksaFileGambar(file(t, 500_000)), null);
  }
});

test('tepat 2 MB lolos, 1 byte lebih ditolak', () => {
  assert.equal(periksaFileGambar(file('image/png', MAKS_BYTE)), null);
  assert.match(periksaFileGambar(file('image/png', MAKS_BYTE + 1)), /maksimal 2 MB/);
});

test('format selain gambar yang diizinkan ditolak', () => {
  assert.match(periksaFileGambar(file('application/pdf', 1000)), /JPG, PNG, atau WebP/);
  assert.match(periksaFileGambar(file('image/gif', 1000)), /JPG, PNG, atau WebP/);
});

test('tanpa file atau file kosong ditolak', () => {
  assert.ok(periksaFileGambar(null));
  assert.match(periksaFileGambar(file('image/png', 0)), /kosong/);
});

test('ukuranFile menampilkan KB dan MB dengan koma', () => {
  assert.equal(ukuranFile(850 * 1024), '850 KB');
  assert.equal(ukuranFile(1.5 * 1024 * 1024), '1,5 MB');
  assert.equal(ukuranFile(10), '1 KB');
  assert.equal(ukuranFile(-1), '');
});
