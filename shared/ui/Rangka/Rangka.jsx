import { gabung } from '../gabung.js';
import gaya from './Rangka.module.css';

/**
 * Skeleton saat data dimuat. bentuk: teks | kartu | baris | foto.
 * `jumlah` = banyak salinan (baris teks, kartu, atau baris tabel). Dekoratif (aria-hidden);
 * bungkus areanya dengan aria-busy atau pakai `label` agar pembaca layar tahu sedang memuat.
 */
export function Rangka({ bentuk = 'teks', jumlah = 1, label, className }) {
  const salinan = Array.from({ length: Math.max(1, jumlah) }, (_, i) => i);
  const item = (i) => {
    if (bentuk === 'kartu') {
      return (
        <div key={i} className={gaya.kartu}>
          <div className={gabung(gaya.blok, gaya.fotoKartu)} />
          <div className={gabung(gaya.blok, gaya.garisTebal)} />
          <div className={gabung(gaya.blok, gaya.garisPendek)} />
        </div>
      );
    }
    if (bentuk === 'foto') return <div key={i} className={gabung(gaya.blok, gaya.foto)} />;
    if (bentuk === 'baris') return <div key={i} className={gabung(gaya.blok, gaya.baris)} />;
    // baris teks: yang terakhir lebih pendek agar terlihat seperti paragraf
    return <div key={i} className={gabung(gaya.blok, gaya.teks, i === salinan.length - 1 && salinan.length > 1 && gaya.garisPendek)} />;
  };

  return (
    <div className={gabung(gaya.kumpulan, gaya[`kumpulan_${bentuk}`], className)} role={label ? 'status' : undefined} aria-label={label}>
      <div aria-hidden="true" className={gaya.isi}>{salinan.map(item)}</div>
    </div>
  );
}
