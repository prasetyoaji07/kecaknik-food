import { useState } from 'react';
import { gabung } from '../gabung.js';
import logoUrl from '../assets/logo-kecaknik.jpeg';
import gaya from './Logo.module.css';

/**
 * Satu-satunya cara menampilkan logo (DESIGN bagian 3).
 * ukuran: sm | md | lg. Tanpa `href` = gambar biasa (alt "Kecaknik Food").
 * Dengan `href` (atau `as`, mis. Link) = tautan ke beranda. Logo JPEG selalu di dalam
 * lencana krem. Bila gambar gagal dimuat: teks KECAKNIK.
 */
export function Logo({ ukuran = 'md', href, as: Komponen, className, ...sisa }) {
  const [gagal, setGagal] = useState(false);
  const bertaut = Boolean(href || Komponen);
  const Pembungkus = bertaut ? (Komponen ?? 'a') : 'span';

  const isi = gagal ? (
    <span className={gaya.teks} role={bertaut ? undefined : 'img'} aria-label={bertaut ? undefined : 'Kecaknik Food'}>
      KECAKNIK
    </span>
  ) : (
    <img
      className={gaya.gambar}
      src={logoUrl}
      alt={bertaut ? '' : 'Kecaknik Food'}
      onError={() => setGagal(true)}
      draggable={false}
    />
  );

  const sifat = bertaut ? { href, 'aria-label': 'Kecaknik Food, ke beranda', ...sisa } : sisa;
  return (
    <Pembungkus {...sifat} className={gabung(gaya.lencana, gaya[ukuran], bertaut && gaya.tautan, className)}>
      {isi}
    </Pembungkus>
  );
}
