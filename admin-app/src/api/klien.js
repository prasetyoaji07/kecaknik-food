const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const KUNCI_TOKEN = 'kecaknik_admin_token';

export function ambilToken() {
  return sessionStorage.getItem(KUNCI_TOKEN);
}

export function simpanToken(token) {
  sessionStorage.setItem(KUNCI_TOKEN, token);
}

export function hapusToken() {
  sessionStorage.removeItem(KUNCI_TOKEN);
}

export async function permintaan(path, { method = 'GET', body, token = ambilToken(), ...opsi } = {}) {
  const header = new Headers(opsi.headers || {});
  if (body !== undefined && !(body instanceof FormData)) header.set('Content-Type', 'application/json');
  if (token) header.set('Authorization', `Bearer ${token}`);

  let respons;
  try {
    respons = await fetch(`${API}${path}`, {
      ...opsi,
      method,
      headers: header,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch {
    throw new Error('Server tidak dapat dihubungi. Pastikan backend berjalan di port 5000.');
  }

  const hasil = await respons.json().catch(() => ({}));
  if (!respons.ok) {
    const galat = new Error(hasil.error || 'Permintaan tidak berhasil. Coba lagi.');
    galat.status = respons.status;
    if (respons.status === 401 && token) {
      hapusToken();
      window.dispatchEvent(new Event('admin:sesi-berakhir'));
    }
    throw galat;
  }
  return hasil;
}

export { API };
