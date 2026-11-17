const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(pesan, { status = 0, data = null } = {}) {
    super(pesan);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function permintaan(path, options = {}) {
  const { headers = {}, ...opsi } = options;
  let respons;
  try {
    respons = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
      ...opsi,
      headers: {
        ...(opsi.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
    });
  } catch (galat) {
    throw new ApiError('Tidak dapat terhubung ke server. Pastikan backend berjalan.', { data: galat });
  }

  const tipe = respons.headers.get('content-type') || '';
  const data = tipe.includes('application/json') ? await respons.json() : await respons.text();
  if (!respons.ok) {
    const pesan = typeof data === 'object' && data
      ? data.pesan || data.message || data.error
      : data;
    throw new ApiError(pesan || `Permintaan gagal (${respons.status}).`, { status: respons.status, data });
  }
  return data;
}

export { API_BASE };
