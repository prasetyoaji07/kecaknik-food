import test from 'node:test';
import assert from 'node:assert/strict';
import { rupiah, tanggal } from './format.js';

test('rupiah: ribuan dengan titik, tanpa spasi', () => {
  assert.equal(rupiah(75000), 'Rp75.000');
  assert.equal(rupiah(0), 'Rp0');
  assert.equal(rupiah(999), 'Rp999');
  assert.equal(rupiah(1234567), 'Rp1.234.567');
  assert.equal(rupiah(99999999), 'Rp99.999.999');
});

test('rupiah: menerima teks angka, membulatkan, menangani negatif', () => {
  assert.equal(rupiah('75000'), 'Rp75.000');
  assert.equal(rupiah(1500.6), 'Rp1.501');
  assert.equal(rupiah(-2500), '-Rp2.500');
});

test('rupiah: masukan tidak valid menjadi teks kosong', () => {
  assert.equal(rupiah(null), '');
  assert.equal(rupiah(undefined), '');
  assert.equal(rupiah(''), '');
  assert.equal(rupiah('abc'), '');
  assert.equal(rupiah(NaN), '');
});

test('tanggal: DATE tidak bergeser zona waktu', () => {
  assert.equal(tanggal('2026-11-17'), '17 November 2026');
  assert.equal(tanggal('2026-01-01', { singkat: true }), '1 Jan 2026');
  assert.equal(tanggal('2026-11-17', { hari: true }), 'Selasa, 17 November 2026');
});

test('tanggal: opsi jam diabaikan untuk DATE', () => {
  assert.equal(tanggal('2026-11-17', { jam: true }), '17 November 2026');
});

test('tanggal: instan dikonversi ke WIB', () => {
  // 2026-11-17 07:30 UTC = 14.30 WIB
  assert.equal(tanggal(new Date('2026-11-17T07:30:00Z'), { jam: true }), '17 November 2026, 14.30 WIB');
  // 20:00 UTC = 03.00 WIB hari berikutnya
  assert.equal(tanggal('2026-11-17T20:00:00Z', { jam: true }), '18 November 2026, 03.00 WIB');
});

test('tanggal: masukan tidak valid menjadi teks kosong', () => {
  assert.equal(tanggal(null), '');
  assert.equal(tanggal(''), '');
  assert.equal(tanggal('2026-02-30'), '');
  assert.equal(tanggal('bukan tanggal'), '');
});

test('tanggal: waktu MySQL tanpa zona dibaca sebagai WIB, bebas zona mesin', () => {
  assert.equal(tanggal('2026-11-17 10:05:09', { jam: true }), '17 November 2026, 10.05 WIB');
  assert.equal(tanggal('2026-11-17T23:59', { jam: true }), '17 November 2026, 23.59 WIB');
  assert.equal(tanggal('2026-11-17 25:00:00'), '');
});
