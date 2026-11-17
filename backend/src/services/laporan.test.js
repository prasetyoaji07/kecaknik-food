import test from 'node:test';
import assert from 'node:assert/strict';
import { rentangLaporan, hariIniWib, ringkas, formatPeriodeSql } from './laporan.js';

const salah = (fn, pola) => assert.throws(fn, (g) => g.status === 400 && pola.test(g.message));

test('bawaan harian: 30 hari sampai hari ini', () => {
  assert.deepEqual(rentangLaporan({}, '2026-11-17'), { periode: 'harian', dari: '2026-10-19', sampai: '2026-11-17' });
});

test('bawaan bulanan: 12 bulan, mulai tanggal 1', () => {
  assert.deepEqual(rentangLaporan({ periode: 'bulanan' }, '2026-11-17'), { periode: 'bulanan', dari: '2025-12-01', sampai: '2026-11-17' });
});

test('rentang eksplisit, urutan terbalik, terlalu panjang, periode salah', () => {
  assert.deepEqual(rentangLaporan({ dari: '2026-11-01', sampai: '2026-11-10' }), { periode: 'harian', dari: '2026-11-01', sampai: '2026-11-10' });
  salah(() => rentangLaporan({ dari: '2026-11-10', sampai: '2026-11-01' }), /tidak boleh/);
  salah(() => rentangLaporan({ dari: '2024-01-01', sampai: '2026-11-01' }), /maksimal 366/);
  salah(() => rentangLaporan({ periode: 'mingguan' }), /Periode/);
  salah(() => rentangLaporan({ dari: '2026-02-30' }), /Tanggal dari/);
});

test('hariIniWib memakai WIB, bukan UTC', () => {
  assert.equal(hariIniWib(new Date('2026-11-17T18:00:00Z')), '2026-11-18');
});

test('ringkas dan format SQL', () => {
  assert.deepEqual(ringkas([{ jumlah_pesanan: 2, total_tagihan: 10, total_diterima: 5 }, { jumlah_pesanan: 1, total_tagihan: 3, total_diterima: 3 }]),
    { jumlah_pesanan: 3, total_tagihan: 13, total_diterima: 8 });
  assert.equal(formatPeriodeSql('bulanan'), '%Y-%m');
  assert.equal(formatPeriodeSql('harian'), '%Y-%m-%d');
});
