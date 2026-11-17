// Pesanan: pembuatan (publik dan manual admin), pelacakan publik, unggah ulang bukti,
// daftar dan detail admin, perubahan status.
// Dipenuhi: PB pesanan, BR-01 sampai BR-07, BR-09, BR-10 (sisi status), BR-14, BR-15, BR-17, BR-19.
// Pencatatan pembayaran admin dan verifikasi bukti ada di routes/pembayaran.js (U8).
import crypto from 'node:crypto';
import { Router } from 'express';
import { kueri, transaksi } from '../db.js';
import { wajibAdmin } from '../middleware/auth.js';
import { batasLacak } from '../middleware/batasan.js';
import { unggah, denganBersihFile } from '../middleware/upload.js';
import { bungkus, galat400, galat404, galat409 } from '../middleware/galat.js';
import { daftarProduk } from '../services/produk.js';
import { hitungPesanan } from '../services/hitungPesanan.js';
import { sinkronPembayaran } from '../services/statusPembayaran.js';
import { bacaTanggal } from '../services/validasiProduk.js';
import { ambilPesananAdmin, ambilStatusPublik, cariPesananByKode } from '../services/pesanan.js';
import {
  validasiNama, validasiTelepon, validasiAlamat, validasiCatatanPesanan, validasiNominalSplit,
  validasiRupiah, validasiKode, validasiTeks, ALFABET_KODE,
} from '@kecaknik/shared/core/validasi.js';
import { kanal, rekening } from '@kecaknik/shared/core/konfigurasi.js';
import {
  TIPE_PESANAN, STATUS_PESANAN, STATUS_FINAL, STATUS_PEMBAYARAN, bolehTransisi,
} from '@kecaknik/shared/core/statusPesanan.js';

const router = Router();

const METODE = ['tunai', 'transfer', 'split'];
const CHANNEL = rekening.map((r) => r.kode);

// ------------------------------------------------------------ pembantu
const hasil = (r) => {
  if (!r.ok) throw galat400(r.galat);
  return r.nilai;
};
const kosong = (v) => v === undefined || v === null || String(v).trim() === '';
const objek = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function idParam(req) {
  if (!/^\d+$/.test(req.params.id)) throw galat404('Pesanan tidak ditemukan.');
  return Number(req.params.id);
}

/** Multipart mengirim larik/objek sebagai teks JSON; JSON biasa sudah berupa nilai. */
function bacaJson(v, label) {
  if (typeof v !== 'string') return v;
  try {
    return JSON.parse(v);
  } catch {
    throw galat400(`${label} bukan JSON yang valid.`);
  }
}

function bacaKoordinat(lat, lng, wajib) {
  if (kosong(lat) && kosong(lng)) {
    if (wajib) throw galat400('Lokasi pengantaran wajib dipilih di peta.');
    return { lat: null, lng: null };
  }
  if (kosong(lat) || kosong(lng)) throw galat400('Koordinat harus berisi lintang dan bujur.');
  const a = Number(lat);
  const b = Number(lng);
  if (!Number.isFinite(a) || a < -90 || a > 90) throw galat400('Lintang tidak valid.');
  if (!Number.isFinite(b) || b < -180 || b > 180) throw galat400('Bujur tidak valid.');
  return { lat: Number(a.toFixed(8)), lng: Number(b.toFixed(8)) };
}

/** Data pemesan (BR-06, BR-15, BR-19). Manual: koordinat opsional, HP boleh kosong bila sumber `langsung`. */
function bacaPemesan(b, { manual = false, sumber = 'website' } = {}) {
  if (!TIPE_PESANAN.includes(b.tipe_pesanan)) throw galat400('Pilih cara terima pesanan: ambil atau antar.');
  const nama = hasil(validasiNama(b.nama_pelanggan));
  let noHp = null;
  if (kosong(b.no_hp)) {
    if (!(manual && sumber === 'langsung')) throw galat400('Nomor WhatsApp wajib diisi.');
  } else {
    noHp = hasil(validasiTelepon(b.no_hp));
  }
  const catatan = hasil(validasiCatatanPesanan(b.catatan));
  let alamat = null;
  let koordinat = { lat: null, lng: null };
  if (b.tipe_pesanan === 'antar') {
    alamat = hasil(validasiAlamat(b.alamat));
    koordinat = bacaKoordinat(b.lat, b.lng, !manual);
  }
  return { tipe_pesanan: b.tipe_pesanan, nama, no_hp: noHp, catatan, alamat, ...koordinat };
}

function buatKode() {
  let k = 'KCK-';
  for (let i = 0; i < 6; i += 1) k += ALFABET_KODE[crypto.randomInt(ALFABET_KODE.length)];
  return k;
}

/** Menyimpan pesanan + item + opsi dalam transaksi `k`. Mengembalikan { id, kode }. */
async function simpanPesanan(k, d) {
  let id = null;
  let kode = null;
  for (let percobaan = 0; percobaan < 5 && id === null; percobaan += 1) {
    kode = buatKode();
    try {
      const [h] = await k.query(
        `INSERT INTO orders (kode_pesanan, sumber, tipe_pesanan, nama_pelanggan, no_hp, alamat, lat, lng,
           tanggal_ambil, catatan, total, metode_bayar, nominal_transfer) VALUES (?)`,
        [[kode, d.sumber, d.pemesan.tipe_pesanan, d.pemesan.nama, d.pemesan.no_hp, d.pemesan.alamat,
          d.pemesan.lat, d.pemesan.lng, d.hitung.tanggal_ambil, d.pemesan.catatan, d.hitung.total,
          d.metode_bayar, d.nominal_transfer]],
      );
      id = h.insertId;
    } catch (galat) {
      if (galat.code !== 'ER_DUP_ENTRY' || percobaan === 4) throw galat;
    }
  }
  for (const item of d.hitung.items) {
    const [h] = await k.query(
      'INSERT INTO order_items (order_id, product_id, nama, harga, harga_opsi, qty, catatan) VALUES (?)',
      [[id, item.product_id, item.nama, item.harga, item.harga_opsi, item.qty, item.catatan]],
    );
    if (item.opsi.length) {
      await k.query(
        'INSERT INTO order_item_opsi (order_item_id, opsi_id, nama_grup, nama_opsi, harga_tambah, teks) VALUES ?',
        [item.opsi.map((o) => [h.insertId, o.opsi_id, o.nama_grup, o.nama_opsi, o.harga_tambah, o.teks])],
      );
    }
  }
  return { id, kode };
}

const bacaChannel = (v) => {
  if (!CHANNEL.includes(v)) throw galat400(`Pilih channel transfer: ${rekening.map((r) => r.nama).join(', ')}.`);
  return v;
};

// ------------------------------------------------- POST /orders (publik)
// tunai: JSON. transfer dan split: multipart, file `bukti`, `items` sebagai teks JSON (BR-07).
router.post('/', ...unggah('bukti', 'bukti'), bungkus(async (req, res) => {
  await denganBersihFile(req, async () => {
    const b = req.body ?? {};
    const pemesan = bacaPemesan(b);
    if (!METODE.includes(b.metode_bayar)) throw galat400('Pilih metode pembayaran: tunai, transfer, atau split.');

    const hitung = hitungPesanan(bacaJson(b.items, 'Daftar item'), await daftarProduk({ publik: true }));

    let nominal = null;
    let baris = null;
    if (b.metode_bayar !== 'tunai') {
      const channel = bacaChannel(b.channel);
      if (!req.fileTersimpan) throw galat400('Bukti transfer wajib diunggah.');
      if (b.metode_bayar === 'split') nominal = hasil(validasiNominalSplit(b.nominal_transfer, hitung.total)); // BR-17
      baris = { channel, jumlah: nominal ?? hitung.total, bukti: req.fileTersimpan.nama };
    } else if (req.fileTersimpan) {
      throw galat400('Pembayaran tunai tidak memerlukan bukti.');
    }

    const dibuat = await transaksi(async (k) => {
      const o = await simpanPesanan(k, {
        sumber: 'website', pemesan, hitung, metode_bayar: b.metode_bayar, nominal_transfer: nominal,
      });
      if (baris) {
        await k.query(
          `INSERT INTO pembayaran (order_id, metode, channel, jumlah, bukti_bayar, status, dicatat_oleh)
           VALUES (?, 'transfer', ?, ?, ?, 'menunggu', 'pelanggan')`,
          [o.id, baris.channel, baris.jumlah, baris.bukti],
        );
      }
      return o;
    });
    res.status(201).json({ kode_pesanan: dibuat.kode, total: hitung.total });
  });
}));

// ---------------------------------------- POST /orders/manual (admin)
// Body: sumber, tipe_pesanan, nama_pelanggan, no_hp, alamat, lat, lng, catatan, items,
// metode_bayar (opsional), nominal_transfer (split), pembayaran (opsional, langsung diterima):
// { metode: 'tunai'|'transfer', channel, jumlah, catatan }. Transfer tanpa bukti wajib catatan (BR-07).
router.post('/manual', wajibAdmin, ...unggah('bukti', 'bukti'), bungkus(async (req, res) => {
  await denganBersihFile(req, async () => {
    const b = req.body ?? {};
    if (!kanal.includes(b.sumber)) throw galat400(`Sumber harus salah satu dari: ${kanal.join(', ')}.`);
    const pemesan = bacaPemesan(b, { manual: true, sumber: b.sumber });
    // D-08: admin tidak boleh melanggar aturan campur; hitungPesanan menolak dan meminta dipecah.
    const hitung = hitungPesanan(bacaJson(b.items, 'Daftar item'), await daftarProduk({ publik: true }));

    const bayar = bacaJson(b.pembayaran, 'Data pembayaran');
    let barisBayar = null;
    if (!kosong(bayar)) {
      if (!objek(bayar)) throw galat400('Data pembayaran tidak valid.');
      if (!['tunai', 'transfer'].includes(bayar.metode)) throw galat400('Metode pembayaran awal: tunai atau transfer.');
      const jumlah = hasil(validasiRupiah(bayar.jumlah, { label: 'Jumlah pembayaran' }));
      if (jumlah > hitung.total) throw galat400('Jumlah pembayaran melebihi total pesanan.'); // D-13
      const catatan = hasil(validasiTeks(bayar.catatan, { maks: 255, label: 'Catatan pembayaran' }));
      const channel = bayar.metode === 'transfer' ? bacaChannel(bayar.channel) : null;
      const bukti = req.fileTersimpan?.nama ?? null;
      if (bayar.metode === 'transfer' && !bukti && !catatan) {
        throw galat400('Transfer tanpa bukti wajib disertai catatan alasan.');
      }
      barisBayar = { metode: bayar.metode, channel, jumlah, bukti, catatan };
    }

    const metodeBayar = kosong(b.metode_bayar) ? (barisBayar?.metode ?? null) : b.metode_bayar;
    if (metodeBayar !== null && !METODE.includes(metodeBayar)) throw galat400('Metode pembayaran tidak valid.');
    const nominal = metodeBayar === 'split' ? hasil(validasiNominalSplit(b.nominal_transfer, hitung.total)) : null;

    const dibuat = await transaksi(async (k) => {
      const o = await simpanPesanan(k, {
        sumber: b.sumber, pemesan, hitung, metode_bayar: metodeBayar, nominal_transfer: nominal,
      });
      if (barisBayar) {
        await k.query(
          `INSERT INTO pembayaran (order_id, metode, channel, jumlah, bukti_bayar, status, dicatat_oleh, catatan, diverifikasi_at)
           VALUES (?, ?, ?, ?, ?, 'diterima', 'admin', ?, NOW())`,
          [o.id, barisBayar.metode, barisBayar.channel, barisBayar.jumlah, barisBayar.bukti, barisBayar.catatan],
        );
        await sinkronPembayaran(k, o.id);
      }
      return o;
    });
    res.status(201).json(await ambilPesananAdmin(dibuat.id));
  });
}));

// ------------------------------------ GET /orders/kode/:kode (publik)
router.get('/kode/:kode', batasLacak, bungkus(async (req, res) => {
  const kode = hasil(validasiKode(req.params.kode));
  const o = await cariPesananByKode(kode);
  if (!o) throw galat404('Pesanan dengan kode itu tidak ditemukan.');
  res.json(await ambilStatusPublik(o));
}));

// -------------------------- POST /orders/kode/:kode/bukti (publik)
// Unggah ulang setelah bukti terakhir ditolak: membuat baris pembayaran `menunggu` baru.
router.post('/kode/:kode/bukti', batasLacak, ...unggah('bukti', 'bukti'), bungkus(async (req, res) => {
  await denganBersihFile(req, async () => {
    const kode = hasil(validasiKode(req.params.kode));
    if (!req.fileTersimpan) throw galat400('Bukti transfer wajib diunggah.');
    await transaksi(async (k) => {
      const [[o]] = await k.query('SELECT id, status FROM orders WHERE kode_pesanan = ? FOR UPDATE', [kode]);
      if (!o) throw galat404('Pesanan dengan kode itu tidak ditemukan.');
      if (STATUS_FINAL.includes(o.status)) throw galat409('Pesanan ini sudah selesai atau dibatalkan.');
      const [[terakhir]] = await k.query('SELECT * FROM pembayaran WHERE order_id = ? ORDER BY id DESC LIMIT 1', [o.id]);
      if (!terakhir || terakhir.status !== 'ditolak') {
        throw galat409(
          terakhir?.status === 'menunggu'
            ? 'Bukti sebelumnya masih menunggu verifikasi.'
            : 'Tidak ada bukti yang perlu diunggah ulang.',
        );
      }
      const channel = kosong(req.body?.channel) ? terakhir.channel : bacaChannel(req.body.channel);
      await k.query(
        `INSERT INTO pembayaran (order_id, metode, channel, jumlah, bukti_bayar, status, dicatat_oleh)
         VALUES (?, 'transfer', ?, ?, ?, 'menunggu', 'pelanggan')`,
        [o.id, channel, terakhir.jumlah, req.fileTersimpan.nama],
      );
    });
    res.status(201).json({ ok: true });
  });
}));

// ------------------------------------------------- GET /orders (admin)
// Filter: status (nilai status, atau `aktif` / `riwayat`), sumber, status_pembayaran,
// dari, sampai (tanggal created_at, WIB), q (nama, kode, atau nomor HP), batas, mulai.
const escapeLike = (s) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

router.get('/', wajibAdmin, bungkus(async (req, res) => {
  const f = req.query;
  const syarat = [];
  const param = [];
  if (!kosong(f.status)) {
    if (f.status === 'aktif') {
      syarat.push('o.status NOT IN (?)');
      param.push(STATUS_FINAL);
    } else if (f.status === 'riwayat') {
      syarat.push('o.status IN (?)');
      param.push(STATUS_FINAL);
    } else if (STATUS_PESANAN.includes(f.status)) {
      syarat.push('o.status = ?');
      param.push(f.status);
    } else {
      throw galat400('Filter status tidak valid.');
    }
  }
  if (!kosong(f.sumber)) {
    if (!kanal.includes(f.sumber)) throw galat400('Filter sumber tidak valid.');
    syarat.push('o.sumber = ?');
    param.push(f.sumber);
  }
  if (!kosong(f.status_pembayaran)) {
    if (!STATUS_PEMBAYARAN.includes(f.status_pembayaran)) throw galat400('Filter status pembayaran tidak valid.');
    syarat.push('o.status_pembayaran = ?');
    param.push(f.status_pembayaran);
  }
  const dari = bacaTanggal(f.dari, 'Tanggal dari');
  const sampai = bacaTanggal(f.sampai, 'Tanggal sampai');
  if (dari) { syarat.push('DATE(o.created_at) >= ?'); param.push(dari); }
  if (sampai) { syarat.push('DATE(o.created_at) <= ?'); param.push(sampai); }
  if (!kosong(f.q)) {
    const pola = `%${escapeLike(String(f.q).trim().slice(0, 100))}%`;
    syarat.push('(o.nama_pelanggan LIKE ? OR o.kode_pesanan LIKE ? OR o.no_hp LIKE ?)');
    param.push(pola, pola, pola);
  }
  const batas = kosong(f.batas) ? 100 : Number(f.batas);
  const mulai = kosong(f.mulai) ? 0 : Number(f.mulai);
  if (!Number.isInteger(batas) || batas < 1 || batas > 200) throw galat400('Batas harus 1 sampai 200.');
  if (!Number.isInteger(mulai) || mulai < 0) throw galat400('Mulai tidak valid.');

  const baris = await kueri(
    `SELECT o.id, o.kode_pesanan, o.sumber, o.tipe_pesanan, o.status, o.nama_pelanggan, o.no_hp,
            o.total, o.metode_bayar, o.status_pembayaran, o.jumlah_dibayar, o.tanggal_ambil, o.created_at,
            (SELECT COALESCE(SUM(qty), 0) FROM order_items WHERE order_id = o.id) AS jumlah_item,
            EXISTS(SELECT 1 FROM pembayaran WHERE order_id = o.id AND status = 'menunggu') AS menunggu_verifikasi
     FROM orders o ${syarat.length ? `WHERE ${syarat.join(' AND ')}` : ''}
     ORDER BY o.created_at DESC, o.id DESC LIMIT ? OFFSET ?`,
    [...param, batas, mulai],
  );
  res.json(baris.map((r) => ({
    ...r,
    jumlah_item: Number(r.jumlah_item),
    menunggu_verifikasi: Number(r.menunggu_verifikasi) === 1,
    sisa: Math.max(0, r.total - r.jumlah_dibayar),
  })));
}));

// -------------------------------------------- GET /orders/:id (admin)
router.get('/:id', wajibAdmin, bungkus(async (req, res) => {
  const o = await ambilPesananAdmin(idParam(req));
  if (!o) throw galat404('Pesanan tidak ditemukan.');
  res.json(o);
}));

// --------------------------------- PATCH /orders/:id/status (admin)
// Body: { status, alasan_batal }. BR-09: transisi hanya mengikuti statusPesanan.js, dikunci
// FOR UPDATE. BR-10: batal wajib alasan. D-10: `selesai` boleh meski belum lunas.
router.patch('/:id/status', wajibAdmin, bungkus(async (req, res) => {
  const id = idParam(req);
  const ke = req.body?.status;
  if (!STATUS_PESANAN.includes(ke)) throw galat400('Status tujuan tidak valid.');
  const alasan = ke === 'dibatalkan'
    ? hasil(validasiTeks(req.body.alasan_batal, { maks: 255, wajib: true, label: 'Alasan pembatalan' }))
    : null;

  await transaksi(async (k) => {
    const [[o]] = await k.query('SELECT id, status, tipe_pesanan FROM orders WHERE id = ? FOR UPDATE', [id]);
    if (!o) throw galat404('Pesanan tidak ditemukan.');
    if (!bolehTransisi(o.status, ke, o.tipe_pesanan)) {
      throw galat409(`Status tidak bisa diubah dari "${o.status}" ke "${ke}".`);
    }
    await k.query('UPDATE orders SET status = ?, alasan_batal = ? WHERE id = ?', [ke, alasan, id]);
  });
  res.json(await ambilPesananAdmin(id));
}));

export default router;
