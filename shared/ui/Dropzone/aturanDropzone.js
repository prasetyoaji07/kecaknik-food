// Aturan unggah gambar sisi klien (DESIGN bagian 5). Server memeriksa ulang dari isi file
// (backend/src/middleware/upload.js, MAKS_BYTE = 2 MB). Logika murni agar bisa diuji.

export const MAKS_BYTE = 2 * 1024 * 1024;
export const TIPE_GAMBAR = ['image/jpeg', 'image/png', 'image/webp'];

/** null bila file sah, selain itu teks galat untuk pengguna. */
export function periksaFileGambar(file, { maksByte = MAKS_BYTE, tipe = TIPE_GAMBAR } = {}) {
  if (!file) return 'Pilih file terlebih dahulu.';
  if (!tipe.includes(file.type)) return 'Format harus JPG, PNG, atau WebP.';
  if (file.size > maksByte) return `Ukuran file maksimal ${Math.round(maksByte / (1024 * 1024))} MB.`;
  if (file.size === 0) return 'File kosong, pilih file lain.';
  return null;
}

/** Ukuran ramah baca: '850 KB', '1,4 MB'. */
export function ukuranFile(byte) {
  if (!Number.isFinite(byte) || byte < 0) return '';
  if (byte < 1024 * 1024) return `${Math.max(1, Math.round(byte / 1024))} KB`;
  return `${(byte / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}
