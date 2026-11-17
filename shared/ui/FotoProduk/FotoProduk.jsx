import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { gabung } from '../gabung.js';
import gaya from './FotoProduk.module.css';

/** Foto produk rasio 4:3. Jika URL kosong atau gagal, tampilkan nama produk di latar krem. */
export function FotoProduk({ src, alt = '', namaProduk = 'Produk Kecaknik', className, prioritas = false }) {
  const [sumberGagal, setSumberGagal] = useState(null);
  const tersedia = Boolean(src) && sumberGagal !== src;

  return (
    <div className={gabung(gaya.bingkai, className)}>
      {tersedia ? (
        <img
          className={gaya.foto}
          src={src}
          alt={alt || namaProduk}
          loading={prioritas ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setSumberGagal(src)}
        />
      ) : (
        <div className={gaya.cadangan} role="img" aria-label={`Foto ${namaProduk} belum tersedia`}>
          <ImageOff size={28} strokeWidth={1.8} aria-hidden="true" />
          <span>{namaProduk}</span>
        </div>
      )}
    </div>
  );
}
