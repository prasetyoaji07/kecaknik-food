import test from 'node:test';
import assert from 'node:assert/strict';
import {
  alurPesanan, transisiTersedia, bolehTransisi, statusFinal, statusAktif,
  labelStatus, labelPembayaran, bolehTransisiBaris, transisiBarisTersedia,
  STATUS_PESANAN,
} from './statusPesanan.js';

test('alur ambil dan antar', () => {
  assert.deepEqual(alurPesanan('ambil'), ['pending', 'diproses', 'siap diambil', 'selesai']);
  assert.deepEqual(alurPesanan('antar'), ['pending', 'diproses', 'dikirim', 'selesai']);
  assert.deepEqual(alurPesanan('lain'), []);
});

test('transisi sah: langkah berikutnya dan dibatalkan', () => {
  assert.deepEqual(transisiTersedia('pending', 'ambil'), ['diproses', 'dibatalkan']);
  assert.deepEqual(transisiTersedia('diproses', 'ambil'), ['siap diambil', 'dibatalkan']);
  assert.deepEqual(transisiTersedia('diproses', 'antar'), ['dikirim', 'dibatalkan']);
  assert.deepEqual(transisiTersedia('siap diambil', 'ambil'), ['selesai', 'dibatalkan']);
  assert.deepEqual(transisiTersedia('dikirim', 'antar'), ['selesai', 'dibatalkan']);
});

test('status final tidak punya transisi', () => {
  for (const tipe of ['ambil', 'antar']) {
    assert.deepEqual(transisiTersedia('selesai', tipe), []);
    assert.deepEqual(transisiTersedia('dibatalkan', tipe), []);
  }
  assert.ok(statusFinal('selesai') && statusFinal('dibatalkan'));
  assert.ok(!statusFinal('pending'));
});

test('transisi tidak valid ditolak', () => {
  assert.equal(bolehTransisi('pending', 'selesai', 'ambil'), false); // lompat
  assert.equal(bolehTransisi('diproses', 'diproses', 'ambil'), false); // sama
  assert.equal(bolehTransisi('diproses', 'dikirim', 'ambil'), false); // salah tipe
  assert.equal(bolehTransisi('diproses', 'siap diambil', 'antar'), false); // salah tipe
  assert.equal(bolehTransisi('siap diambil', 'diproses', 'ambil'), false); // mundur
  assert.equal(bolehTransisi('selesai', 'dibatalkan', 'ambil'), false);
  assert.equal(bolehTransisi('pending', 'diproses', 'tidak-ada'), false);
  assert.equal(bolehTransisi('ngawur', 'diproses', 'ambil'), false);
});

test('transisi sah diterima', () => {
  assert.equal(bolehTransisi('pending', 'diproses', 'ambil'), true);
  assert.equal(bolehTransisi('dikirim', 'dibatalkan', 'antar'), true);
});

test('statusAktif: bukan selesai dan bukan dibatalkan', () => {
  const aktif = STATUS_PESANAN.filter(statusAktif);
  assert.deepEqual(aktif, ['pending', 'diproses', 'siap diambil', 'dikirim']);
  assert.equal(statusAktif('ngawur'), false);
});

test('label selesai berbeda untuk ambil dan antar', () => {
  assert.equal(labelStatus('selesai', 'ambil'), 'Sudah diambil');
  assert.equal(labelStatus('selesai', 'antar'), 'Pesanan sampai');
  assert.equal(labelStatus('dibatalkan', 'ambil'), 'Dibatalkan');
  assert.equal(labelStatus('pending', 'antar'), 'Menunggu');
  assert.equal(labelStatus('ngawur', 'ambil'), '');
});

test('label status pembayaran', () => {
  assert.equal(labelPembayaran('belum_dibayar'), 'Belum dibayar');
  assert.equal(labelPembayaran('uang_muka'), 'Uang muka');
  assert.equal(labelPembayaran('lunas'), 'Lunas');
});

test('status baris pembayaran (8.3)', () => {
  assert.equal(bolehTransisiBaris('menunggu', 'diterima'), true);
  assert.equal(bolehTransisiBaris('menunggu', 'ditolak'), true);
  assert.equal(bolehTransisiBaris('diterima', 'dikembalikan'), true);
  assert.equal(bolehTransisiBaris('ditolak', 'menunggu'), false); // unggah ulang = baris baru
  assert.equal(bolehTransisiBaris('menunggu', 'dikembalikan'), false);
  assert.deepEqual(transisiBarisTersedia('dikembalikan'), []);
});
