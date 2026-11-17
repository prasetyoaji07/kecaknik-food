import { gabung } from '../gabung.js';
import gaya from './Chip.module.css';

/**
 * Chip filter (kategori). Tombol dengan aria-pressed. Terpilih = merah.
 * `jumlah` (opsional) tampil kecil di kanan label.
 */
export function Chip({ terpilih = false, onKlik, jumlah, nonaktif = false, className, children, ...sisa }) {
  return (
    <button
      {...sisa}
      type="button"
      className={gabung(gaya.chip, terpilih && gaya.terpilih, className)}
      aria-pressed={terpilih}
      disabled={nonaktif}
      onClick={onKlik}
    >
      {children}
      {jumlah !== undefined && jumlah !== null ? <span className={gaya.jumlah}>{jumlah}</span> : null}
    </button>
  );
}

/**
 * Baris chip. Di layar kecil bisa digulir menyamping di dalam wadahnya (bukan halamannya).
 * Beri `label` agar kelompok chip punya nama bagi pembaca layar.
 */
export function BarisChip({ label, className, children }) {
  return (
    <div className={gabung(gaya.baris, className)} role="group" aria-label={label}>
      {children}
    </div>
  );
}
