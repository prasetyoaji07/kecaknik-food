// Validasi produk dan opsi (BR-02, BR-03, STRUKTUR 6.1 sampai 6.3). Murni, tanpa DB,
// agar bisa diuji. Melempar GalatHttp 400 dengan pesan Indonesia pada masukan salah.
import {
  validasiTeks, validasiRupiah, validasiAngka, BATAS,
} from '@kecaknik/shared/core/validasi.js';
import { kategoriProduk } from '@kecaknik/shared/core/konfigurasi.js';
import { galat400 } from '../middleware/galat.js';

const MAKS_GRUP = 10;
const MAKS_OPSI = 30;

const hasil = (r) => {
  if (!r.ok) throw galat400(r.galat);
  return r.nilai;
};

/** true/false, 1/0, '1'/'0', 'true'/'false'. Kosong -> bawaan. Lainnya -> 400. */
export function bacaBool(v, bawaan, label = 'Isian') {
  if (v === undefined || v === null || v === '') return bawaan;
  if (v === true || v === 1 || v === '1' || v === 'true') return true;
  if (v === false || v === 0 || v === '0' || v === 'false') return false;
  throw galat400(`${label} harus berupa ya atau tidak.`);
}

/** 'YYYY-MM-DD' yang benar-benar ada di kalender. Kosong -> null. */
export function bacaTanggal(v, label) {
  if (v === undefined || v === null || v === '') return null;
  const s = String(v).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  const d = m && new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (!d || d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) {
    throw galat400(`${label} harus berupa tanggal yang valid (YYYY-MM-DD).`);
  }
  return s;
}

/**
 * Data produk dari body (JSON atau multipart). `lama` = baris produk yang sudah ada:
 * kolom yang tidak dikirim dipertahankan (untuk PUT). Mengembalikan kolom siap simpan.
 */
export function periksaProduk(masuk = {}, lama = {}) {
  const ambil = (k) => (masuk[k] !== undefined ? masuk[k] : lama[k]);

  const nama = hasil(validasiTeks(ambil('nama'), { maks: 100, wajib: true, label: 'Nama produk' }));
  const harga = hasil(validasiRupiah(ambil('harga'), { label: 'Harga' }));
  const kategori = ambil('kategori');
  if (!kategoriProduk.includes(kategori)) {
    throw galat400(`Kategori harus salah satu dari: ${kategoriProduk.join(', ')}.`);
  }
  const satuan = hasil(validasiTeks(ambil('satuan'), { maks: 50, label: 'Satuan' }));
  const aktif = bacaBool(ambil('aktif'), true, 'Status aktif');
  const isPreorder = bacaBool(ambil('is_preorder'), false, 'Pre-order');

  let buka = null;
  let tutup = null;
  let ambilTgl = null;
  if (isPreorder) {
    buka = bacaTanggal(ambil('tanggal_buka'), 'Tanggal buka');
    tutup = bacaTanggal(ambil('tanggal_tutup'), 'Tanggal tutup');
    ambilTgl = bacaTanggal(ambil('tanggal_ambil'), 'Tanggal ambil');
    if (!buka || !tutup || !ambilTgl) {
      throw galat400('Pre-order wajib punya tanggal buka, tanggal tutup, dan tanggal ambil.');
    }
    if (!(buka <= tutup && tutup <= ambilTgl)) {
      throw galat400('Urutan tanggal pre-order harus: buka, tutup, lalu ambil (boleh sama).');
    }
  }

  return {
    nama,
    harga,
    kategori,
    satuan,
    aktif: aktif ? 1 : 0,
    is_preorder: isPreorder ? 1 : 0,
    tanggal_buka: buka,
    tanggal_tutup: tutup,
    tanggal_ambil: ambilTgl,
  };
}

const kosong = (v) => v === undefined || v === null || v === '';

function periksaOpsi(o, nomorGrup, nomorOpsi) {
  const awalan = `Grup ${nomorGrup}, opsi ${nomorOpsi}`;
  const bungkus = (fn) => {
    try {
      return fn();
    } catch (g) {
      throw galat400(`${awalan}: ${g.message}`);
    }
  };
  const nama = bungkus(() => hasil(validasiTeks(o?.nama, { maks: 100, wajib: true, label: 'Nama' })));
  const harga = bungkus(() =>
    kosong(o?.harga_tambah)
      ? 0
      : hasil(validasiAngka(o.harga_tambah, { min: 0, maks: BATAS.rupiahMaks, label: 'Harga tambahan' })),
  );
  const butuhTeks = bungkus(() => bacaBool(o?.butuh_teks, false, 'Butuh teks'));
  const label = bungkus(() =>
    butuhTeks ? hasil(validasiTeks(o?.label_teks, { maks: 100, wajib: true, label: 'Label isian' })) : null,
  );
  const aktif = bungkus(() => bacaBool(o?.aktif, true, 'Aktif'));
  return {
    nama,
    harga_tambah: harga,
    butuh_teks: butuhTeks ? 1 : 0,
    label_teks: label,
    aktif: aktif ? 1 : 0,
  };
}

/**
 * Payload PUT /products/:id/opsi: { grup: [{ id?, kunci?, nama, tipe, wajib, min_pilih,
 * max_pilih, muncul_setelah, opsi: [{ nama, harga_tambah, butuh_teks, label_teks, aktif }] }] }.
 * `muncul_setelah` merujuk `kunci` (atau id) grup lain di payload yang sama dan harus
 * berada di atas grup ini. Urutan = urutan larik. Mengembalikan grup yang sudah dinormalkan
 * dengan `pemicu` (indeks grup pemicu atau null).
 */
export function periksaGrupOpsi(payload) {
  const daftar = payload?.grup;
  if (!Array.isArray(daftar)) throw galat400('grup harus berupa larik.');
  if (daftar.length > MAKS_GRUP) throw galat400(`Maksimal ${MAKS_GRUP} grup opsi per produk.`);

  const kunciGrup = daftar.map((g) => {
    if (!kosong(g?.kunci)) return String(g.kunci);
    if (!kosong(g?.id)) return String(g.id);
    return null;
  });
  const dipakai = kunciGrup.filter(Boolean);
  if (new Set(dipakai).size !== dipakai.length) throw galat400('Kunci grup tidak boleh kembar.');

  return daftar.map((g, i) => {
    const no = i + 1;
    const di = (fn) => {
      try {
        return fn();
      } catch (e) {
        throw galat400(`Grup ${no}: ${e.message}`);
      }
    };

    const nama = di(() => hasil(validasiTeks(g?.nama, { maks: 100, wajib: true, label: 'Nama grup' })));
    const tipe = kosong(g?.tipe) ? 'pilih_satu' : g.tipe;
    if (!['pilih_satu', 'pilih_banyak'].includes(tipe)) {
      throw galat400(`Grup ${no}: tipe harus pilih_satu atau pilih_banyak.`);
    }
    const wajib = di(() => bacaBool(g?.wajib, false, 'Wajib'));

    if (!Array.isArray(g?.opsi) || g.opsi.length === 0) {
      throw galat400(`Grup ${no}: minimal 1 opsi.`);
    }
    if (g.opsi.length > MAKS_OPSI) throw galat400(`Grup ${no}: maksimal ${MAKS_OPSI} opsi.`);
    const opsi = g.opsi.map((o, j) => periksaOpsi(o, no, j + 1));
    const jumlahAktif = opsi.filter((o) => o.aktif).length;

    let min;
    let maks;
    if (tipe === 'pilih_satu') {
      min = wajib ? 1 : 0;
      maks = 1;
    } else {
      min = kosong(g.min_pilih)
        ? (wajib ? 1 : 0)
        : di(() => hasil(validasiAngka(g.min_pilih, { min: 0, maks: MAKS_OPSI, label: 'Minimal pilih' })));
      if (wajib && min < 1) min = 1;
      maks = kosong(g.max_pilih)
        ? null
        : di(() => hasil(validasiAngka(g.max_pilih, { min: 1, maks: MAKS_OPSI, label: 'Maksimal pilih' })));
      if (maks !== null && maks < min) {
        throw galat400(`Grup ${no}: maksimal pilihan tidak boleh kurang dari minimal.`);
      }
    }
    if (min > jumlahAktif) {
      throw galat400(`Grup ${no}: minimal pilih (${min}) melebihi jumlah opsi aktif (${jumlahAktif}).`);
    }

    let pemicu = null;
    if (!kosong(g.muncul_setelah)) {
      pemicu = kunciGrup.indexOf(String(g.muncul_setelah));
      if (pemicu === -1) throw galat400(`Grup ${no}: grup pemicu tidak ditemukan.`);
      if (pemicu >= i) throw galat400(`Grup ${no}: grup pemicu harus berada di atas grup ini.`);
    }

    return { nama, tipe, wajib: wajib ? 1 : 0, min_pilih: min, max_pilih: maks, pemicu, opsi };
  });
}
