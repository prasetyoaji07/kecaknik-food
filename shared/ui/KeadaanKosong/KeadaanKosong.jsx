import { gabung } from '../gabung.js';
import gaya from './KeadaanKosong.module.css';

// Ilustrasi garis sederhana. Warna lewat kelas (tokens), bukan atribut warna.
function Ilustrasi({ jenis }) {
  if (jenis === 'cari') {
    return (
      <svg viewBox="0 0 96 96" className={gaya.gambar} aria-hidden="true">
        <ellipse className={gaya.isi} cx="40" cy="52" rx="30" ry="12" />
        <ellipse className={gaya.garis} cx="40" cy="52" rx="30" ry="12" />
        <circle className={gaya.kaca} cx="50" cy="38" r="18" />
        <path className={gaya.garis} d="M63 51 L82 70" />
        <path className={gaya.garis} d="M42 32 Q46 26 54 28" />
      </svg>
    );
  }
  if (jenis === 'toples') {
    return (
      <svg viewBox="0 0 96 96" className={gaya.gambar} aria-hidden="true">
        <rect className={gaya.isi} x="22" y="30" width="52" height="52" rx="12" />
        <rect className={gaya.garis} x="22" y="30" width="52" height="52" rx="12" />
        <rect className={gaya.tutup} x="28" y="16" width="40" height="14" rx="6" />
        <path className={gaya.garis} d="M38 52 Q48 60 58 52" />
        <circle className={gaya.titik} cx="39" cy="44" r="2.5" />
        <circle className={gaya.titik} cx="57" cy="44" r="2.5" />
      </svg>
    );
  }
  // keranjang (bawaan)
  return (
    <svg viewBox="0 0 96 96" className={gaya.gambar} aria-hidden="true">
      <path className={gaya.garis} d="M30 40 Q48 8 66 40" />
      <path className={gaya.isi} d="M12 40 H84 L76 80 Q75 84 70 84 H26 Q21 84 20 80 Z" />
      <path className={gaya.garis} d="M12 40 H84 L76 80 Q75 84 70 84 H26 Q21 84 20 80 Z" />
      <path className={gaya.garis} d="M36 52 V72 M48 52 V72 M60 52 V72" />
    </svg>
  );
}

/**
 * Keadaan kosong: ilustrasi garis + judul + penjelasan singkat + satu tindakan.
 * ilustrasi: keranjang | cari | toples. `tindakan`: node (biasanya satu Button).
 * Tulis dengan suara Kecaknik (DESIGN bagian 12), jangan sekadar "Tidak ada data".
 */
export function KeadaanKosong({ ilustrasi = 'keranjang', judul, deskripsi, tindakan, className }) {
  return (
    <div className={gabung(gaya.kosong, className)}>
      <Ilustrasi jenis={ilustrasi} />
      <h3 className={gaya.judul}>{judul}</h3>
      {deskripsi ? <p className={gaya.deskripsi}>{deskripsi}</p> : null}
      {tindakan ? <div className={gaya.tindakan}>{tindakan}</div> : null}
    </div>
  );
}
