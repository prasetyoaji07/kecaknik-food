const KUNCI = 'kecaknik:keranjang:v1';

export function bacaKeranjang() {
  try {
    const data = JSON.parse(localStorage.getItem(KUNCI) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function simpanKeranjang(items) {
  try {
    localStorage.setItem(KUNCI, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

export function hapusKeranjangTersimpan() {
  try { localStorage.removeItem(KUNCI); } catch { /* Penyimpanan browser tidak tersedia. */ }
}
