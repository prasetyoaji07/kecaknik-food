import { permintaan } from './klien.js';

export function buatPesanan(payload) {
  const multipart = payload instanceof FormData;
  return permintaan('/orders', {
    method: 'POST',
    body: multipart ? payload : JSON.stringify(payload),
  });
}

export function ambilPesanan(kode) {
  return permintaan(`/orders/kode/${encodeURIComponent(kode)}`);
}

export function unggahBukti(kode, file) {
  const form = new FormData();
  form.append('bukti', file);
  return permintaan(`/orders/kode/${encodeURIComponent(kode)}/bukti`, {
    method: 'POST',
    body: form,
  });
}
