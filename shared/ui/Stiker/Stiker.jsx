import { gabung } from '../gabung.js';
import gaya from './Stiker.module.css';

// Daftar sudut tetap. Dipilih per `indeks`, bukan acak, agar tampilan sama di setiap muat ulang.
export const ROTASI_STIKER = ['-3deg', '2deg', '-1.5deg', '3deg', '-2deg'];

/**
 * Stiker miring kecil, huruf kapital, bayangan keras (PRE-ORDER, BARU!).
 * warna: kuning | merah | putih. `indeks` memilih sudut dari ROTASI_STIKER.
 * Dekoratif tetapi teksnya tetap terbaca pembaca layar.
 */
export function Stiker({ warna = 'kuning', indeks = 0, className, children }) {
  const sudut = ROTASI_STIKER[Math.abs(Number(indeks) || 0) % ROTASI_STIKER.length];
  return (
    <span className={gabung(gaya.stiker, gaya[warna], className)} style={{ '--sudut': sudut }}>
      {children}
    </span>
  );
}
