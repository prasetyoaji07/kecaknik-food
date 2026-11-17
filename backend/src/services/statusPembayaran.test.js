import test from 'node:test';
import assert from 'node:assert/strict';
import { tentukanStatusPembayaran, sisaBayar, sinkronPembayaran } from './statusPembayaran.js';

test('BR-08: status dari jumlah dibayar', () => {
  assert.equal(tentukanStatusPembayaran(100000, 0), 'belum_dibayar');
  assert.equal(tentukanStatusPembayaran(100000, 1), 'uang_muka');
  assert.equal(tentukanStatusPembayaran(100000, 99999), 'uang_muka');
  assert.equal(tentukanStatusPembayaran(100000, 100000), 'lunas');
  assert.equal(tentukanStatusPembayaran(100000, 100001), null); // D-13
});

test('sisaBayar tidak pernah negatif', () => {
  assert.equal(sisaBayar(100000, 40000), 60000);
  assert.equal(sisaBayar(100000, 100000), 0);
  assert.equal(sisaBayar(100000, 120000), 0);
});

// Koneksi palsu: urutan kueri = SELECT pesanan, SELECT SUM, UPDATE.
function koneksiPalsu(total, dibayar) {
  const log = [];
  return {
    log,
    async query(sql, params) {
      log.push({ sql, params });
      if (sql.startsWith('SELECT id, total')) return [total === null ? [] : [{ id: 7, total }]];
      if (sql.includes('SUM(jumlah)')) return [[{ dibayar: String(dibayar) }]];
      return [{ affectedRows: 1 }];
    },
  };
}

test('sinkronPembayaran: menulis jumlah dan status', async () => {
  const k = koneksiPalsu(100000, 50000);
  const h = await sinkronPembayaran(k, 7);
  assert.deepEqual(h, { jumlah_dibayar: 50000, status_pembayaran: 'uang_muka', total: 100000, sisa: 50000 });
  assert.deepEqual(k.log.at(-1).params, [50000, 'uang_muka', 7]);
  assert.match(k.log[0].sql, /FOR UPDATE/);
});

test('sinkronPembayaran: kelebihan bayar 400, pesanan tidak ada 404', async () => {
  await assert.rejects(sinkronPembayaran(koneksiPalsu(100000, 120000), 7), (g) => g.status === 400);
  await assert.rejects(sinkronPembayaran(koneksiPalsu(null, 0), 7), (g) => g.status === 404);
});
