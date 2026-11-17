import test from 'node:test';
import assert from 'node:assert/strict';
import {
  petunjukSaring, ketikanDitolak, formatTelepon, tampilanField, rapikan, galatField,
} from './aturanField.js';
import { saring } from '../../core/validasi.js';

test('petunjuk: angka pada nama, huruf pada telepon; spasi ganda dan + - tidak memicu', () => {
  const p = (kind, awal) => petunjukSaring(kind, awal, saring(kind, awal));
  assert.equal(p('nama', 'Budi123'), 'Nama hanya boleh huruf.');
  assert.equal(p('nama', 'Budi  Santoso'), null);
  assert.equal(p('nama', 'Budi'), null);
  assert.match(p('telepon', '0812abc'), /hanya boleh angka/);
  assert.equal(p('telepon', '+62 812-3456-7890'), null);
  assert.match(p('rupiah', '12x'), /angka/);
  assert.equal(p('rupiah', 'Rp75.000'), null);
  assert.equal(p('kode', 'kck-abc234'), null);
  assert.match(p('kode', 'KCK-0O1I'), /Kode/);
  assert.equal(p('teks', 'bebas 123 !'), null);
});

test('ketikanDitolak: satu karakter terlarang ditolak, spasi dan huruf lolos', () => {
  assert.equal(ketikanDitolak('nama', '7'), true);
  assert.equal(ketikanDitolak('nama', ' '), false);
  assert.equal(ketikanDitolak('nama', 'a'), false);
  assert.equal(ketikanDitolak('telepon', 'a'), true);
  assert.equal(ketikanDitolak('telepon', '5'), false);
  assert.equal(ketikanDitolak('telepon', '+'), false);
  assert.equal(ketikanDitolak('nama', 'abc'), false); // tempelan ditangani onChange
  assert.equal(ketikanDitolak('teks', '1'), false);
});

test('tampilan terformat hanya saat tidak fokus', () => {
  assert.equal(formatTelepon('081234567890'), '+62 812 3456 7890');
  assert.equal(formatTelepon('abc'), 'abc');
  assert.equal(tampilanField('telepon', '081234567890', false), '+62 812 3456 7890');
  assert.equal(tampilanField('telepon', '081234567890', true), '081234567890');
  assert.equal(tampilanField('rupiah', '75000', false), 'Rp75.000');
  assert.equal(tampilanField('rupiah', '75000', true), '75000');
  assert.equal(tampilanField('nama', 'Budi', false), 'Budi');
  assert.equal(tampilanField('rupiah', '', false), '');
});

test('rapikan saat blur', () => {
  assert.equal(rapikan('nama', '  Budi   Santoso '), 'Budi Santoso');
  assert.equal(rapikan('teks', '  catatan '), 'catatan');
  assert.equal(rapikan('telepon', ' 0812 '), ' 0812 ');
});

test('galat: wajib, per jenis, kosong tidak wajib', () => {
  assert.equal(galatField('nama', '', { wajib: true }), 'Nama wajib diisi.');
  assert.equal(galatField('nama', '', {}), null);
  assert.equal(galatField('telepon', '', { wajib: true, label: 'Nomor WhatsApp' }), 'Nomor WhatsApp wajib diisi.');
  assert.match(galatField('telepon', '0812', {}), /tidak valid/);
  assert.equal(galatField('telepon', '081234567890', {}), null);
  assert.match(galatField('nama', 'B', {}), /minimal/);
  assert.equal(galatField('rupiah', '75000', {}), null);
  assert.match(galatField('rupiah', '0', {}), /minimal/);
  assert.match(galatField('angka', '100', { min: 1, maks: 99, label: 'Jumlah' }), /maksimal 99/);
  assert.match(galatField('angka', '0', { min: 1, maks: 99 }), /minimal 1/);
  assert.equal(galatField('kode', 'KCK-7H2K9M', {}), null);
  assert.match(galatField('kode', 'KCK-1', {}), /tidak valid/);
  assert.match(galatField('teks', 'x'.repeat(11), { maksKarakter: 10, label: 'Catatan' }), /maksimal 10/);
  assert.match(galatField('alamat', 'Jl. A', { wajib: true }), /minimal 10/);
  assert.equal(galatField('sandi', 'rahasia', {}), null);
});
