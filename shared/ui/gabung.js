/** Menggabungkan nama kelas, membuang nilai kosong. */
export const gabung = (...kelas) => kelas.filter(Boolean).join(' ');
