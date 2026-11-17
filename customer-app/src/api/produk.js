import { permintaan } from './klien.js';

export function ambilProduk(params = {}) {
  const query = new URLSearchParams(params);
  return permintaan(`/products${query.size ? `?${query}` : ''}`);
}

