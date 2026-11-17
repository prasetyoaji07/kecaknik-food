// Penanganan galat seragam: { "error": "pesan" } dengan status HTTP bermakna
// (400 validasi, 401 tanpa token, 404, 409 transisi tidak valid, 429 terlalu sering).
export class GalatHttp extends Error {
  constructor(status, pesan) {
    super(pesan);
    this.name = 'GalatHttp';
    this.status = status;
  }
}

export const galat400 = (pesan) => new GalatHttp(400, pesan);
export const galat401 = (pesan = 'Perlu login.') => new GalatHttp(401, pesan);
export const galat404 = (pesan = 'Data tidak ditemukan.') => new GalatHttp(404, pesan);
export const galat409 = (pesan) => new GalatHttp(409, pesan);

/** Express 4 tidak menangkap galat dari handler async. Bungkus setiap handler async. */
export const bungkus = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export function tidakDitemukan(req, res) {
  res.status(404).json({ error: 'Rute tidak ditemukan.' });
}

export function penangkapGalat(galat, req, res, _next) {
  if (galat instanceof GalatHttp) {
    return res.status(galat.status).json({ error: galat.message });
  }
  if (galat?.name === 'MulterError') {
    const pesan =
      galat.code === 'LIMIT_FILE_SIZE'
        ? 'Ukuran file maksimal 2 MB.'
        : 'Unggahan file tidak valid.';
    return res.status(400).json({ error: pesan });
  }
  if (galat?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Isi permintaan bukan JSON yang valid.' });
  }
  if (galat?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Permintaan terlalu besar.' });
  }
  console.error(galat);
  const pesan = process.env.NODE_ENV === 'production' ? 'Terjadi kesalahan pada server.' : `Kesalahan server: ${galat?.message}`;
  return res.status(500).json({ error: pesan });
}
