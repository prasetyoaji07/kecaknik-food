import { permintaan, simpanToken, hapusToken } from './klien.js';

export async function masuk(sandi) {
  const hasil = await permintaan('/auth/login', { method: 'POST', body: { password: sandi }, token: null });
  if (!hasil.token) throw new Error('Server tidak mengirim token login. Periksa konfigurasi backend.');
  simpanToken(hasil.token);
  return hasil;
}

export function keluar() {
  hapusToken();
}
