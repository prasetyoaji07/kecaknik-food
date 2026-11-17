// Satu-satunya sumber alur status (STRUKTUR bagian 8). UI, API, dan templat
// WhatsApp merujuk modul ini. Jangan menulis ulang alur di tempat lain.

export const TIPE_PESANAN = ['ambil', 'antar'];

export const STATUS_PESANAN = ['pending', 'diproses', 'siap diambil', 'dikirim', 'selesai', 'dibatalkan'];
export const STATUS_FINAL = ['selesai', 'dibatalkan'];

export const STATUS_PEMBAYARAN = ['belum_dibayar', 'uang_muka', 'lunas'];
export const STATUS_BARIS_PEMBAYARAN = ['menunggu', 'diterima', 'ditolak', 'dikembalikan'];

// 8.1 Alur normal per tipe (tanpa dibatalkan)
const ALUR = {
  ambil: ['pending', 'diproses', 'siap diambil', 'selesai'],
  antar: ['pending', 'diproses', 'dikirim', 'selesai'],
};

// 8.3 Status baris pembayaran. 'ditolak' tidak punya lanjutan: pelanggan
// mengunggah ulang sebagai baris baru berstatus 'menunggu'.
const TRANSISI_BARIS = {
  menunggu: ['diterima', 'ditolak'],
  diterima: ['dikembalikan'],
  ditolak: [],
  dikembalikan: [],
};

const LABEL = {
  pending: 'Menunggu',
  diproses: 'Diproses',
  'siap diambil': 'Siap diambil',
  dikirim: 'Dikirim',
  dibatalkan: 'Dibatalkan',
};
const LABEL_SELESAI = { ambil: 'Sudah diambil', antar: 'Pesanan sampai' };

const LABEL_PEMBAYARAN = {
  belum_dibayar: 'Belum dibayar',
  uang_muka: 'Uang muka',
  lunas: 'Lunas',
};

const LABEL_BARIS = {
  menunggu: 'Menunggu',
  diterima: 'Diterima',
  ditolak: 'Ditolak',
  dikembalikan: 'Dikembalikan',
};

export const statusFinal = (status) => STATUS_FINAL.includes(status);

/** Filter "aktif": bukan selesai dan bukan dibatalkan. */
export const statusAktif = (status) => STATUS_PESANAN.includes(status) && !statusFinal(status);

/** Urutan langkah normal untuk tipe pesanan (salinan). [] bila tipe tidak dikenal. */
export function alurPesanan(tipe) {
  return ALUR[tipe] ? [...ALUR[tipe]] : [];
}

/** Status tujuan yang sah dari status sekarang: langkah berikutnya + dibatalkan. */
export function transisiTersedia(status, tipe) {
  const alur = ALUR[tipe];
  if (!alur || !statusAktif(status)) return [];
  const i = alur.indexOf(status);
  if (i === -1) return [];
  const hasil = [];
  if (i < alur.length - 1) hasil.push(alur[i + 1]);
  hasil.push('dibatalkan');
  return hasil;
}

export const bolehTransisi = (dari, ke, tipe) => transisiTersedia(dari, tipe).includes(ke);

/** Label tampilan. 'selesai' berbeda untuk ambil dan antar. */
export function labelStatus(status, tipe) {
  if (status === 'selesai') return LABEL_SELESAI[tipe] ?? 'Selesai';
  return LABEL[status] ?? '';
}

export const labelPembayaran = (status) => LABEL_PEMBAYARAN[status] ?? '';
export const labelBarisPembayaran = (status) => LABEL_BARIS[status] ?? '';

export const transisiBarisTersedia = (status) => [...(TRANSISI_BARIS[status] ?? [])];
export const bolehTransisiBaris = (dari, ke) => transisiBarisTersedia(dari).includes(ke);
