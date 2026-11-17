// BR-13: unggahan jpg/png/webp, maksimal 2 MB, nama acak 32 heksa (D-11), tipe
// diperiksa dari isi file (magic bytes), bukan ekstensi atau Content-Type klien.
//
// Pemakaian di route:
//   router.post('/', ...unggah('bukti', 'bukti'), handler)
// Hasil: req.fileTersimpan = { nama, folder } bila ada file, undefined bila tidak.
// Berkas opsional: route yang mewajibkan file (BR-07) memeriksa req.fileTersimpan.
import crypto from 'node:crypto';
import path from 'node:path';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import multer from 'multer';
import { env } from '../env.js';
import { galat400 } from './galat.js';

export const DIR_UPLOAD = path.join(env.folderBackend, 'uploads');
export const FOLDER_UPLOAD = ['bukti', 'produk'];
export const MAKS_BYTE = 2 * 1024 * 1024;

const memori = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAKS_BYTE, files: 1, fields: 40 },
});

/** Mengenali tipe gambar dari byte awal. Mengembalikan ekstensi atau null. */
export function kenaliGambar(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'png';
  }
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    return 'webp';
  }
  return null;
}

function simpan(folder) {
  return async (req, res, next) => {
    try {
      if (!req.file) return next();
      const ekstensi = kenaliGambar(req.file.buffer);
      if (!ekstensi) throw galat400('File harus berupa gambar JPG, PNG, atau WEBP.');
      const nama = `${crypto.randomBytes(16).toString('hex')}.${ekstensi}`;
      const dir = path.join(DIR_UPLOAD, folder);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, nama), req.file.buffer);
      req.fileTersimpan = { nama, folder };
      req.file.buffer = undefined; // lepaskan memori
      return next();
    } catch (galat) {
      return next(galat);
    }
  };
}

/** [penerima multipart, penyimpan]. `field` = nama kolom file, `folder` = bukti | produk. */
export function unggah(field, folder) {
  if (!FOLDER_UPLOAD.includes(folder)) throw new Error(`Folder unggahan tidak dikenal: ${folder}`);
  return [memori.single(field), simpan(folder)];
}

/** Hapus file yang sudah tersimpan (mis. saat transaksi DB gagal). Tidak melempar galat. */
export async function hapusFile(folder, nama) {
  if (!nama || !FOLDER_UPLOAD.includes(folder) || nama !== path.basename(nama)) return;
  try {
    await unlink(path.join(DIR_UPLOAD, folder, nama));
  } catch {
    /* sudah tidak ada */
  }
}

/**
 * Menjalankan `kerja()`; bila gagal, file yang baru terunggah (req.fileTersimpan) dihapus
 * agar tidak menjadi file yatim, lalu galat dilempar ulang.
 */
export async function denganBersihFile(req, kerja) {
  try {
    return await kerja();
  } catch (galat) {
    if (req.fileTersimpan) await hapusFile(req.fileTersimpan.folder, req.fileTersimpan.nama);
    throw galat;
  }
}
