// Smoke test ujung ke ujung lewat HTTP (PERINTAH.md bagian 5). Server harus sudah berjalan
// (`npm run dev:backend`) dengan basis data hasil `npm run db:reset`.
//   npm test -w backend            (API_URL bawaan http://localhost:5000)
// Sandi admin dibaca dari ADMIN_PASSWORD (lingkungan) atau backend/.env. Tes membuat
// pesanan baru setiap dijalankan; jalankan `npm run db:reset` untuk membersihkan.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const BASE = (process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');
const SANDI = process.env.ADMIN_PASSWORD;

// PNG 1x1 valid: tipe diperiksa dari isi file (BR-13).
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const hasil = [];
let token = '';

async function api(metode, jalur, { body, form, auth = false } = {}) {
  const headers = {};
  if (auth) headers.Authorization = `Bearer ${token}`;
  let isi;
  if (form) isi = form;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; isi = JSON.stringify(body); }
  const r = await fetch(BASE + jalur, { method: metode, headers, body: isi });
  const teks = await r.text();
  let data = null;
  try { data = JSON.parse(teks); } catch { /* bukan JSON */ }
  return { status: r.status, data };
}

function formPesanan(data, { bukti = true } = {}) {
  const f = new FormData();
  for (const [k, v] of Object.entries(data)) f.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  if (bukti) f.append('bukti', new Blob([PNG], { type: 'image/png' }), 'bukti.png');
  return f;
}

async function uji(nama, fn) {
  try {
    await fn();
    hasil.push({ nama, ok: true });
    console.log(`  lulus   ${nama}`);
  } catch (g) {
    hasil.push({ nama, ok: false, pesan: g.message });
    console.log(`  GAGAL   ${nama}\n          ${g.message}`);
  }
}

function harap(nyata, diharapkan, label) {
  if (nyata !== diharapkan) throw new Error(`${label}: diharapkan ${JSON.stringify(diharapkan)}, didapat ${JSON.stringify(nyata)}`);
}

const dasar = {
  tipe_pesanan: 'ambil', nama_pelanggan: 'Budi Santoso', no_hp: '081234567890',
};

async function main() {
  try {
    await fetch(`${BASE}/health`);
  } catch {
    console.log(`Tidak dijalankan: server tidak terjangkau di ${BASE}. Jalankan \`npm run db:reset\` dan \`npm run dev:backend\` dulu.`);
    process.exit(2);
  }
  if (!SANDI) {
    console.log('Tidak dijalankan: ADMIN_PASSWORD tidak ada (isi backend/.env atau set variabel lingkungan).');
    process.exit(2);
  }

  const daftar = (await api('GET', '/products')).data;
  if (!Array.isArray(daftar) || daftar.length === 0) {
    console.log('Tidak dijalankan: GET /products kosong. Jalankan `npm run db:reset`.');
    process.exit(2);
  }
  const reguler = daftar.find((p) => !p.is_preorder && p.aktif && p.grup.length === 0);
  const po = daftar.find((p) => p.is_preorder);
  if (!reguler) { console.log('Tidak dijalankan: tidak ada produk reguler tanpa opsi di seed.'); process.exit(2); }
  const item = (qty = 1) => [{ product_id: reguler.id, qty }];
  console.log(`Server ${BASE}. Produk uji: "${reguler.nama}" (Rp${reguler.harga}).\n`);

  await uji('1. login admin (sandi salah 401, benar 200)', async () => {
    harap((await api('POST', '/auth/login', { body: { password: 'salah-total' } })).status, 401, 'sandi salah');
    const r = await api('POST', '/auth/login', { body: { password: SANDI } });
    harap(r.status, 200, 'login');
    token = r.data.token;
    if (!token) throw new Error('token kosong');
  });

  await uji('2. pesanan tunai: 201, total dihitung server', async () => {
    const r = await api('POST', '/orders', { body: { ...dasar, metode_bayar: 'tunai', items: item(2) } });
    harap(r.status, 201, 'status');
    harap(r.data.total, reguler.harga * 2, 'total');
    if (!/^KCK-[2-9A-HJKMNP-Z]{6}$/.test(r.data.kode_pesanan)) throw new Error(`kode aneh: ${r.data.kode_pesanan}`);
  });

  await uji('3. transfer tanpa bukti 400', async () => {
    const f = formPesanan({ ...dasar, metode_bayar: 'transfer', channel: 'dana', items: item() }, { bukti: false });
    harap((await api('POST', '/orders', { form: f })).status, 400, 'status');
  });

  await uji('4. split dengan nominal di luar batas 400', async () => {
    const total = reguler.harga * 2;
    for (const nominal of [0, total, total + 1000, -5]) {
      const f = formPesanan({ ...dasar, metode_bayar: 'split', channel: 'dana', nominal_transfer: nominal, items: item(2) });
      harap((await api('POST', '/orders', { form: f })).status, 400, `nominal ${nominal}`);
    }
  });

  await uji('5. nama berisi angka 400', async () => {
    const r = await api('POST', '/orders', { body: { ...dasar, nama_pelanggan: 'Budi123', metode_bayar: 'tunai', items: item() } });
    harap(r.status, 400, 'status');
  });

  await uji('6. PO tutup ditolak; PO dicampur reguler ditolak', async () => {
    // PO tertutup dibuat lewat API admin, lalu dihapus.
    const dibuat = await api('POST', '/products', {
      auth: true,
      body: {
        nama: 'Smoke PO Tutup', harga: 10000, kategori: 'kue', is_preorder: true,
        tanggal_buka: '2020-01-01', tanggal_tutup: '2020-01-10', tanggal_ambil: '2020-01-12',
      },
    });
    harap(dibuat.status, 201, 'buat PO tutup');
    try {
      const r = await api('POST', '/orders', { body: { ...dasar, metode_bayar: 'tunai', items: [{ product_id: dibuat.data.id, qty: 1 }] } });
      harap(r.status, 400, 'PO tutup');
    } finally {
      await api('DELETE', `/products/${dibuat.data.id}`, { auth: true });
    }
    if (po && po.grup.every((g) => !g.wajib)) {
      const r = await api('POST', '/orders', { body: { ...dasar, metode_bayar: 'tunai', items: [{ product_id: po.id, qty: 1 }, ...item()] } });
      harap(r.status, 400, 'campur PO dan reguler');
    }
  });

  await uji('7. transfer bukti: terima 1/2 jadi uang_muka, tunai sisa jadi lunas', async () => {
    const total = reguler.harga * 2;
    const f = formPesanan({ ...dasar, metode_bayar: 'transfer', channel: 'dana', items: item(2) });
    const dibuat = await api('POST', '/orders', { form: f });
    harap(dibuat.status, 201, 'buat');
    const cari = await api('GET', `/orders?q=${dibuat.data.kode_pesanan}`, { auth: true });
    harap(cari.data.length, 1, 'hasil cari');
    harap(cari.data[0].menunggu_verifikasi, true, 'menunggu_verifikasi');
    const id = cari.data[0].id;
    const detail = (await api('GET', `/orders/${id}`, { auth: true })).data;
    harap(detail.pembayaran.length, 1, 'baris pembayaran');
    harap(detail.pembayaran[0].status, 'menunggu', 'status baris');

    // kelebihan bayar ditolak
    harap((await api('PATCH', `/pembayaran/${detail.pembayaran[0].id}`, { auth: true, body: { status: 'diterima', jumlah: total + 1 } })).status, 400, 'kelebihan');
    const a = await api('PATCH', `/pembayaran/${detail.pembayaran[0].id}`, { auth: true, body: { status: 'diterima', jumlah: total / 2 } });
    harap(a.status, 200, 'terima');
    harap(a.data.status_pembayaran, 'uang_muka', 'uang_muka');
    harap(a.data.jumlah_dibayar, total / 2, 'jumlah_dibayar');
    harap(a.data.sisa, total / 2, 'sisa');

    const b = await api('POST', `/orders/${id}/pembayaran`, { auth: true, body: { metode: 'tunai', jumlah: total / 2 } });
    harap(b.status, 201, 'tunai');
    harap(b.data.status_pembayaran, 'lunas', 'lunas');
    harap(b.data.sisa, 0, 'sisa lunas');
    harap((await api('POST', `/orders/${id}/pembayaran`, { auth: true, body: { metode: 'tunai', jumlah: 1000 } })).status, 400, 'bayar lagi setelah lunas');
  });

  await uji('8. GET /orders/kode/:kode tanpa no_hp dan alamat', async () => {
    const dibuat = await api('POST', '/orders', {
      body: { ...dasar, tipe_pesanan: 'antar', alamat: 'Jl. Contoh No. 12, Bekasi', lat: -6.2383, lng: 106.9756, metode_bayar: 'tunai', items: item() },
    });
    harap(dibuat.status, 201, 'buat');
    const r = await api('GET', `/orders/kode/${dibuat.data.kode_pesanan.toLowerCase()}`);
    harap(r.status, 200, 'status');
    for (const k of ['no_hp', 'alamat', 'lat', 'lng']) if (k in r.data) throw new Error(`bocor: ${k}`);
    harap(r.data.lokasi.lat, -6.238, 'lat dibulatkan 3 desimal');
    harap(r.data.nama_pelanggan, 'Budi Santoso', 'nama');
    harap((await api('GET', '/orders/kode/KCK-ZZZZZZ')).status, 404, 'kode tak ada');
    harap((await api('GET', '/orders/kode/abc')).status, 400, 'kode salah format');
  });

  await uji('9. GET /orders dan /laporan tanpa token 401', async () => {
    harap((await api('GET', '/orders')).status, 401, '/orders');
    harap((await api('GET', '/laporan')).status, 401, '/laporan');
    harap((await api('PATCH', '/pembayaran/1', { body: { status: 'diterima' } })).status, 401, '/pembayaran');
  });

  await uji('10. transisi status tidak valid 409; alur sah dan batal wajib alasan', async () => {
    const dibuat = await api('POST', '/orders', { body: { ...dasar, metode_bayar: 'tunai', items: item() } });
    const id = (await api('GET', `/orders?q=${dibuat.data.kode_pesanan}`, { auth: true })).data[0].id;
    harap((await api('PATCH', `/orders/${id}/status`, { auth: true, body: { status: 'selesai' } })).status, 409, 'pending ke selesai');
    harap((await api('PATCH', `/orders/${id}/status`, { auth: true, body: { status: 'dikirim' } })).status, 409, 'ambil tidak punya dikirim');
    harap((await api('PATCH', `/orders/${id}/status`, { auth: true, body: { status: 'ngawur' } })).status, 400, 'status ngawur');
    harap((await api('PATCH', `/orders/${id}/status`, { auth: true, body: { status: 'diproses' } })).data.status, 'diproses', 'diproses');
    harap((await api('PATCH', `/orders/${id}/status`, { auth: true, body: { status: 'dibatalkan' } })).status, 400, 'batal tanpa alasan');
    const b = await api('PATCH', `/orders/${id}/status`, { auth: true, body: { status: 'dibatalkan', alasan_batal: 'Pelanggan membatalkan' } });
    harap(b.data.status, 'dibatalkan', 'dibatalkan');
    harap((await api('PATCH', `/orders/${id}/status`, { auth: true, body: { status: 'diproses' } })).status, 409, 'dari status final');
  });

  await uji('11. bukti ditolak lalu unggah ulang; dikembalikan hanya setelah batal', async () => {
    const f = formPesanan({ ...dasar, metode_bayar: 'transfer', channel: 'bca', items: item() });
    const dibuat = await api('POST', '/orders', { form: f });
    const kode = dibuat.data.kode_pesanan;
    const id = (await api('GET', `/orders?q=${kode}`, { auth: true })).data[0].id;
    const p1 = (await api('GET', `/orders/${id}`, { auth: true })).data.pembayaran[0];
    harap((await api('POST', `/orders/kode/${kode}/bukti`, { form: formPesanan({}) })).status, 409, 'unggah saat masih menunggu');
    harap((await api('PATCH', `/pembayaran/${p1.id}`, { auth: true, body: { status: 'ditolak' } })).status, 400, 'tolak tanpa catatan');
    harap((await api('PATCH', `/pembayaran/${p1.id}`, { auth: true, body: { status: 'ditolak', catatan: 'Bukti buram' } })).status, 200, 'tolak');
    const lacak = (await api('GET', `/orders/kode/${kode}`)).data;
    harap(lacak.pembayaran_terakhir.status, 'ditolak', 'pembayaran_terakhir');
    harap((await api('POST', `/orders/kode/${kode}/bukti`, { form: formPesanan({}) })).status, 201, 'unggah ulang');
    const detail = (await api('GET', `/orders/${id}`, { auth: true })).data;
    harap(detail.pembayaran.length, 2, 'dua baris');
    harap(detail.pembayaran[1].status, 'menunggu', 'baris baru');
    await api('PATCH', `/pembayaran/${detail.pembayaran[1].id}`, { auth: true, body: { status: 'diterima' } });
    harap((await api('PATCH', `/pembayaran/${detail.pembayaran[1].id}`, { auth: true, body: { status: 'dikembalikan', catatan: 'x' } })).status, 409, 'kembalikan sebelum batal');
    await api('PATCH', `/orders/${id}/status`, { auth: true, body: { status: 'dibatalkan', alasan_batal: 'Uji' } });
    const k = await api('PATCH', `/pembayaran/${detail.pembayaran[1].id}`, { auth: true, body: { status: 'dikembalikan', catatan: 'Dana dikembalikan' } });
    harap(k.status, 200, 'kembalikan');
    harap(k.data.jumlah_dibayar, 0, 'jumlah_dibayar setelah dikembalikan');
    harap(k.data.status_pembayaran, 'belum_dibayar', 'status_pembayaran');
  });

  await uji('12. input manual dan laporan', async () => {
    const r = await api('POST', '/orders/manual', {
      auth: true,
      body: { sumber: 'langsung', tipe_pesanan: 'ambil', nama_pelanggan: 'Ibu Rina', items: item(), pembayaran: { metode: 'tunai', jumlah: reguler.harga } },
    });
    harap(r.status, 201, 'manual');
    harap(r.data.status_pembayaran, 'lunas', 'lunas');
    harap(r.data.no_hp, null, 'tanpa hp');
    harap((await api('POST', '/orders/manual', { auth: true, body: { sumber: 'whatsapp', tipe_pesanan: 'ambil', nama_pelanggan: 'Ibu Rina', items: item() } })).status, 400, 'hp wajib selain langsung');
    const lap = await api('GET', '/laporan', { auth: true });
    harap(lap.status, 200, 'laporan');
    if (!(lap.data.ringkasan.jumlah_pesanan >= 1)) throw new Error('ringkasan kosong');
    if (lap.data.ringkasan.total_diterima > lap.data.ringkasan.total_tagihan) throw new Error('diterima melebihi tagihan');
    harap((await api('GET', '/laporan?periode=mingguan', { auth: true })).status, 400, 'periode salah');
  });

  const gagal = hasil.filter((h) => !h.ok);
  console.log(`\n${hasil.length - gagal.length} lulus, ${gagal.length} gagal.`);
  process.exit(gagal.length ? 1 : 0);
}

main().catch((g) => {
  console.error(g);
  process.exit(1);
});
