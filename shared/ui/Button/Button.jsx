import { useId } from 'react';
import { gabung } from '../gabung.js';
import gaya from './Button.module.css';

/**
 * Tombol. Satu-satunya cara membuat tombol di halaman (DESIGN bagian 5).
 * variasi: primer | sekunder | aksen | bahaya | tautan. ukuran: sm | md | lg.
 * `as`: elemen atau komponen lain (mis. 'a', Link). `alasan`: teks bantu saat nonaktif.
 * Tombol hanya ikon wajib `aria-label`.
 */
export function Button({
  variasi = 'primer',
  ukuran = 'md',
  memuat = false,
  nonaktif = false,
  ikonKiri = null,
  ikonKanan = null,
  penuh = false,
  alasan = '',
  as: Komponen = 'button',
  type,
  onClick,
  className,
  children,
  ...sisa
}) {
  const idAlasan = useId();
  const tidakAktif = nonaktif || memuat;
  const hanyaIkon = !children && Boolean(ikonKiri || ikonKanan);
  if (hanyaIkon && !sisa['aria-label'] && import.meta.env?.DEV) {
    console.warn('Button hanya ikon wajib memakai aria-label.');
  }

  const sifat = { ...sisa };
  if (Komponen === 'button') sifat.type = type ?? 'button';
  else if (type) sifat.type = type;
  // aria-disabled (bukan disabled) agar tetap bisa difokus dan alasannya terbaca.
  if (tidakAktif) sifat['aria-disabled'] = true;
  if (memuat) sifat['aria-busy'] = true;
  if (alasan && nonaktif) sifat['aria-describedby'] = idAlasan;

  const tombol = (
    <Komponen
      {...sifat}
      className={gabung(
        gaya.tombol,
        gaya[variasi],
        gaya[ukuran],
        penuh && gaya.penuh,
        hanyaIkon && gaya.hanyaIkon,
        tidakAktif && gaya.mati,
        className,
      )}
      onClick={(e) => {
        if (tidakAktif) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    >
      {memuat ? <span className={gaya.putar} aria-hidden="true" /> : null}
      {!memuat && ikonKiri ? <span className={gaya.ikon} aria-hidden="true">{ikonKiri}</span> : null}
      {children}
      {ikonKanan ? <span className={gaya.ikon} aria-hidden="true">{ikonKanan}</span> : null}
    </Komponen>
  );

  if (!(alasan && nonaktif)) return tombol;
  return (
    <span className={gabung(gaya.bungkus, penuh && gaya.bungkusPenuh)}>
      {tombol}
      <span id={idAlasan} className={gaya.alasan}>{alasan}</span>
    </span>
  );
}
