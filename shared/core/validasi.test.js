import test from 'node:test';
import assert from 'node:assert/strict';
import {
  saringNama, validasiNama, saringTelepon, normalisasiTelepon, validasiTelepon,
  saringRupiah, validasiRupiah, validasiNominalSplit, validasiAngka,
  saringKode, normalisasiKode, validasiKode, validasiTeks, validasiAlamat,
  validasiCatatanPesanan, validasiTeksOpsi, saring, validasi, JENIS_INPUT,
} from './validasi.js';

// --- nama
test('nama: angka dan simbol disaring saat mengetik atau menempel', () => {
  assert.equal(saringNama('Budi123'), 'Budi');
  assert.equal(saringNama('Siti@# Aminah'), 'Siti Aminah');
  assert.equal(saringNama('  Rina   Putri '), 'Rina Putri ');
  assert.equal(saringNama("D'Angelo-Smith Jr."), "D'Angelo-Smith Jr.");
  assert.equal(saringNama('123'), '');
  assert.equal(saringNama('.-Budi'), 'Budi');
});

test('nama: server menolak angka dan simbol, bukan memperbaikinya', () => {
  assert.equal(validasiNama('Budi123').ok, false);
  assert.equal(validasiNama('Budi_').ok, false);
  assert.equal(validasiNama('B').ok, false);
  assert.equal(validasiNama('').ok, false);
  assert.equal(validasiNama(null).ok, false);
  assert.equal(validasiNama('a'.repeat(101)).ok, false);
});

test('nama: huruf Unicode, spasi ganda dirapikan', () => {
  assert.deepEqual(validasiNama('  Siti   Nurhaliza '), { ok: true, nilai: 'Siti Nurhaliza' });
  assert.equal(validasiNama('Zoë Müller').ok, true);
  assert.equal(validasiNama("O’Brien").ok, true);
});

// --- telepon
test('telepon: huruf tidak bisa diketik atau ditempel', () => {
  assert.equal(saringTelepon('0812abc3456'), '08123456');
  assert.equal(saringTelepon('+62 812-3456-7890'), '6281234567890');
});

test('telepon: 08, 8, +62 menjadi 62', () => {
  assert.equal(normalisasiTelepon('081234567890'), '6281234567890');
  assert.equal(normalisasiTelepon('81234567890'), '6281234567890');
  assert.equal(normalisasiTelepon('+62 812-3456-7890'), '6281234567890');
  assert.equal(normalisasiTelepon('6281234567890'), '6281234567890');
  assert.equal(normalisasiTelepon('620812345678'), '62812345678');
});

test('telepon: validasi server', () => {
  assert.deepEqual(validasiTelepon('0812 3456 7890'), { ok: true, nilai: '6281234567890' });
  assert.deepEqual(validasiTelepon('+62 812-3456-7890'), { ok: true, nilai: '6281234567890' });
  assert.equal(validasiTelepon('0812abc').ok, false); // huruf ditolak
  assert.equal(validasiTelepon('0812').ok, false); // terlalu pendek
  assert.equal(validasiTelepon('08123456789012345678').ok, false); // terlalu panjang
  assert.equal(validasiTelepon('1234567890').ok, false); // bukan nomor Indonesia
  assert.equal(validasiTelepon('').ok, false);
});

// --- rupiah dan angka
test('rupiah: negatif, nol, desimal, dan teks ditolak', () => {
  assert.equal(validasiRupiah(-1).ok, false);
  assert.equal(validasiRupiah(0).ok, false);
  assert.equal(validasiRupiah(1.5).ok, false);
  assert.equal(validasiRupiah('-5000').ok, false);
  assert.equal(validasiRupiah('Rp75.000').ok, false);
  assert.equal(validasiRupiah(100_000_000).ok, false);
  assert.deepEqual(validasiRupiah(75000), { ok: true, nilai: 75000 });
  assert.deepEqual(validasiRupiah('75000'), { ok: true, nilai: 75000 });
  assert.deepEqual(validasiRupiah(99_999_999), { ok: true, nilai: 99_999_999 });
});

test('rupiah: penyaring', () => {
  assert.equal(saringRupiah('Rp 75.000'), '75000');
  assert.equal(saringRupiah('-500'), '500');
  assert.equal(saringRupiah('007'), '7');
});

test('split: 0 < nominal < total', () => {
  assert.equal(validasiNominalSplit(0, 100000).ok, false);
  assert.equal(validasiNominalSplit(100000, 100000).ok, false);
  assert.equal(validasiNominalSplit(150000, 100000).ok, false);
  assert.equal(validasiNominalSplit(-5, 100000).ok, false);
  assert.deepEqual(validasiNominalSplit(50000, 100000), { ok: true, nilai: 50000 });
});

test('angka: qty 1 sampai 99', () => {
  assert.equal(validasiAngka(0).ok, false);
  assert.equal(validasiAngka(100).ok, false);
  assert.equal(validasiAngka('abc').ok, false);
  assert.equal(validasiAngka(2.5).ok, false);
  assert.deepEqual(validasiAngka(99), { ok: true, nilai: 99 });
  assert.deepEqual(validasiAngka('3'), { ok: true, nilai: 3 });
});

// --- kode
test('kode: huruf kecil menjadi kapital, 0 1 I L O dibuang', () => {
  assert.equal(saringKode('kck-7h2k9m'), 'KCK-7H2K9M');
  assert.equal(saringKode('KCK-0O1IL9'), 'KCK-9');
  assert.equal(normalisasiKode('kck-7h2k9m'), 'KCK-7H2K9M');
  assert.equal(normalisasiKode('7h2k9m'), 'KCK-7H2K9M');
  assert.equal(normalisasiKode('KCK 7H2K9M'), 'KCK-7H2K9M');
});

test('kode: pola akhir', () => {
  assert.deepEqual(validasiKode('kck-7h2k9m'), { ok: true, nilai: 'KCK-7H2K9M' });
  assert.equal(validasiKode('KCK-7H2K9').ok, false);
  assert.equal(validasiKode('KCK-7H2K9O').ok, false); // O tidak ada di alfabet
  assert.equal(validasiKode('ABC-7H2K9M').ok, false);
  assert.equal(validasiKode('').ok, false);
});

// --- teks dan alamat
test('teks: batas panjang, opsional menjadi null, karakter kontrol dibuang', () => {
  assert.deepEqual(validasiTeks('  ', { maks: 10 }), { ok: true, nilai: null });
  assert.equal(validasiTeks('', { maks: 10, wajib: true }).ok, false);
  assert.equal(validasiTeks('a'.repeat(11), { maks: 10 }).ok, false);
  assert.deepEqual(validasiTeks('ab\u0000c', { maks: 10 }), { ok: true, nilai: 'abc' });
});

test('catatan 500, teks opsi 100, alamat 10 sampai 255', () => {
  assert.equal(validasiCatatanPesanan('a'.repeat(500)).ok, true);
  assert.equal(validasiCatatanPesanan('a'.repeat(501)).ok, false);
  assert.equal(validasiTeksOpsi('a'.repeat(101)).ok, false);
  assert.equal(validasiTeksOpsi('', { wajib: true, label: 'Nama di lilin' }).ok, false);
  assert.equal(validasiAlamat('Jl. Mawar').ok, false); // 9 karakter
  assert.equal(validasiAlamat('Jl. Mawar 1').ok, true);
  assert.equal(validasiAlamat('a'.repeat(256)).ok, false);
});

// --- dispatcher
test('dispatcher: saring dan validasi per kind', () => {
  assert.equal(saring('nama', 'Budi9'), 'Budi');
  assert.equal(saring('telepon', '+62 8x1'), '6281');
  assert.equal(saring('sandi', 'a b1'), 'a b1');
  assert.equal(validasi('nama', 'Budi').ok, true);
  assert.equal(validasi('sandi', '').ok, false);
  assert.equal(validasi('teks', 'halo', { maks: 10 }).ok, true);
  assert.throws(() => validasi('ngawur', 'x'));
  for (const k of JENIS_INPUT) assert.equal(typeof saring(k, 'x'), 'string');
});
