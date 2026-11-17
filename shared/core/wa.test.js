import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buatPesanPelanggan, buatPesanAdmin, pilihTemplatAdmin, linkWa,
  kalimatKonteksPelanggan, hitungSisa, BATAS_PESAN, TEMPLAT_ADMIN,
} from './wa.js';

const dasar = () => ({
  kode_pesanan: 'KCK-7H2K9M',
  tipe_pesanan: 'ambil',
  status: 'pending',
  nama_pelanggan: 'Sadam',
  no_hp: '6281234567890',
  created_at: '2026-11-17T03:00:00Z',
  total: 300000,
  status_pembayaran: 'belum_dibayar',
  jumlah_dibayar: 0,
  items: [
    {
      nama: 'Puding ultah', qty: 2, harga: 150000, harga_opsi: 0,
      catatan: 'Selamat ulang tahun',
      opsi: [{ nama_opsi: '1 lilin' }, { nama_opsi: 'Lilin nama', teks: 'Sadam' }],
    },
  ],
  pembayaran: [],
});

test('blok data: item, opsi, catatan, total, pembayaran, status', () => {
  const t = buatPesanPelanggan(dasar());
  assert.match(t, /^Halo Kecaknik Food, saya Sadam\./);
  assert.match(t, /Pesanan KCK-7H2K9M/);
  assert.match(t, /Tipe: Ambil {3}Tanggal: 17 November 2026/);
  assert.match(t, /1\. Puding ultah x2 \(1 lilin, Lilin nama "Sadam"\) catatan: Selamat ulang tahun {2}Rp300\.000/);
  assert.match(t, /Total: Rp300\.000/);
  assert.match(t, /Pembayaran: Belum dibayar/);
  assert.match(t, /Status: Menunggu/);
});

test('blok data: baris opsi dan catatan hanya bila ada; tanggal ambil PO bila ada', () => {
  const p = dasar();
  p.items = [{ nama: 'Klappertart', qty: 1, harga: 6000, harga_opsi: 0, opsi: [] }];
  p.tanggal_ambil = '2026-12-01';
  const t = buatPesanPelanggan(p);
  assert.match(t, /1\. Klappertart x1 {2}Rp6\.000/);
  assert.doesNotMatch(t, /catatan:/);
  assert.match(t, /Tanggal ambil: 1 Desember 2026/);
});

test('pembayaran: uang muka menampilkan sisa, lunas, antar', () => {
  const p = dasar();
  p.status_pembayaran = 'uang_muka';
  p.jumlah_dibayar = 150000;
  assert.match(buatPesanPelanggan(p), /Pembayaran: Uang muka Rp150\.000, sisa Rp150\.000/);
  p.status_pembayaran = 'lunas';
  p.jumlah_dibayar = 300000;
  assert.match(buatPesanPelanggan(p), /Pembayaran: Lunas/);
  assert.equal(hitungSisa(p), 0);
});

test('item lebih dari 10 dipotong "dan N item lainnya"', () => {
  const p = dasar();
  p.items = Array.from({ length: 13 }, (_, i) => ({
    nama: `Produk ${i + 1}`, qty: 1, harga: 1000, harga_opsi: 0,
  }));
  const t = buatPesanPelanggan(p);
  assert.match(t, /10\. Produk 10/);
  assert.doesNotMatch(t, /11\. Produk 11/);
  assert.match(t, /dan 3 item lainnya/);
});

test('pesan tidak pernah melebihi 1500 karakter', () => {
  const p = dasar();
  p.items = Array.from({ length: 10 }, (_, i) => ({
    nama: `Produk panjang ${i + 1}`, qty: 1, harga: 1000, harga_opsi: 0,
    catatan: 'x'.repeat(250),
  }));
  const t = buatPesanPelanggan(p);
  assert.ok(t.length <= BATAS_PESAN, `panjang ${t.length}`);
  assert.match(t, /Total: Rp/); // bagian penting tetap ada
  p.items = [{ nama: 'A', qty: 1, harga: 1, harga_opsi: 0, catatan: 'x'.repeat(5000) }];
  assert.ok(buatPesanPelanggan(p).length <= BATAS_PESAN);
});

test('D.2 kalimat konteks pelanggan per status', () => {
  const p = dasar();
  assert.equal(kalimatKonteksPelanggan(p), 'Mohon dikonfirmasi pesanan saya ya.');
  p.pembayaran = [{ status: 'menunggu' }];
  assert.equal(kalimatKonteksPelanggan(p), 'Mohon dikonfirmasi pesanan dan bukti transfer saya ya.');
  p.pembayaran = [{ status: 'ditolak', catatan: 'buram' }, { status: 'menunggu' }];
  assert.equal(kalimatKonteksPelanggan(p), 'Saya sudah mengunggah ulang bukti transfer. Mohon dicek ya.');
  const tiap = {
    diproses: /estimasi pesanan saya selesai/, 'siap diambil': /Jam berapa yang pas/,
    dikirim: /estimasi pesanan sampai/, selesai: /Terima kasih!/, dibatalkan: /pembatalan/,
  };
  for (const [status, pola] of Object.entries(tiap)) {
    assert.match(kalimatKonteksPelanggan({ ...dasar(), status }), pola);
  }
});

test('D.3 templat admin dipilih otomatis', () => {
  const p = dasar();
  assert.equal(pilihTemplatAdmin(p), 'konfirmasi');
  assert.equal(pilihTemplatAdmin({ ...p, status: 'diproses', status_pembayaran: 'lunas' }), 'lunas');
  assert.equal(pilihTemplatAdmin({ ...p, status: 'diproses', status_pembayaran: 'uang_muka' }), 'uang_muka');
  assert.equal(pilihTemplatAdmin({ ...p, pembayaran: [{ status: 'ditolak', catatan: 'buram' }] }), 'bukti_ditolak');
  assert.equal(pilihTemplatAdmin({ ...p, status: 'siap diambil' }), 'siap_diambil');
  assert.equal(pilihTemplatAdmin({ ...p, status: 'dikirim' }), 'dikirim');
  assert.equal(pilihTemplatAdmin({ ...p, status: 'selesai' }), 'selesai');
  assert.equal(pilihTemplatAdmin({ ...p, status: 'dibatalkan' }), 'dibatalkan');
  for (const t of TEMPLAT_ADMIN) assert.equal(typeof buatPesanAdmin(dasar(), t.id), 'string');
});

test('D.3 isi templat admin', () => {
  const p = dasar();
  const k = buatPesanAdmin(p);
  assert.match(k, /^Halo Sadam, pesananmu KCK-7H2K9M sudah kami terima\./);
  assert.match(k, /melacak pesanan di website/);
  assert.doesNotMatch(k, /Ongkir/);
  assert.match(buatPesanAdmin({ ...p, tipe_pesanan: 'antar' }), /Ongkir akan kami konfirmasi di chat ini\./);
  assert.match(
    buatPesanAdmin({ ...p, pembayaran: [{ status: 'ditolak', catatan: 'nominal tidak sesuai' }] }),
    /belum bisa kami terima: nominal tidak sesuai\. Mohon unggah ulang/,
  );
  assert.equal(
    buatPesanAdmin({ ...p, status: 'dibatalkan', alasan_batal: 'stok habis' }),
    'Halo Sadam, pesanan KCK-7H2K9M kami batalkan karena: stok habis.',
  );
});

test('baris "Sisa pembayaran" hanya bila sisa > 0', () => {
  const p = { ...dasar(), status: 'siap diambil', status_pembayaran: 'uang_muka', jumlah_dibayar: 100000 };
  assert.match(buatPesanAdmin(p), /Sisa pembayaran: Rp200\.000\./);
  assert.doesNotMatch(
    buatPesanAdmin({ ...p, status_pembayaran: 'lunas', jumlah_dibayar: 300000 }),
    /Sisa pembayaran/,
  );
  assert.match(buatPesanAdmin({ ...p, status: 'dikirim' }), /sedang diantar dari Kecaknik Food ke lokasimu\. Sisa pembayaran: Rp200\.000\./);
});

test('linkWa: format wa.me, normalisasi, dan nonaktif bila nomor kosong', () => {
  assert.equal(linkWa('081234567890', 'Halo & hai'), 'https://wa.me/6281234567890?text=Halo%20%26%20hai');
  assert.equal(linkWa('+62 812-3456-7890'), 'https://wa.me/6281234567890');
  assert.equal(linkWa('', 'x'), '');
  assert.equal(linkWa(null, 'x'), '');
  assert.equal(linkWa('abc', 'x'), '');
});

test('templat tidak dikenal melempar galat; data pesanan publik (kode, pembayaran_terakhir) didukung', () => {
  assert.throws(() => buatPesanAdmin(dasar(), 'ngawur'));
  const pub = { ...dasar(), kode: 'KCK-AAAAAA', pembayaran: undefined, pembayaran_terakhir: { status: 'menunggu' } };
  delete pub.kode_pesanan;
  assert.match(buatPesanPelanggan(pub), /Pesanan KCK-AAAAAA/);
  assert.match(buatPesanPelanggan(pub), /bukti transfer saya/);
});
