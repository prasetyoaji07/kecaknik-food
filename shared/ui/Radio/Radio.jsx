import { useId } from 'react';
import { gabung } from '../gabung.js';
import gaya from './Radio.module.css';

/**
 * Satu bulatan radio bergaris tebal, terpilih = merah. Dipakai di grup opsi produk (pilih satu).
 * Radio dengan `nama` yang sama membentuk satu grup, panah keyboard berpindah antar pilihan.
 * Bungkus grup dengan <fieldset>/<legend> (atau role="radiogroup" + aria-labelledby) di pemakai.
 * Terkendali: `terpilih`, `onUbah(nilai)`. `akhiran`: teks di kanan (mis. harga tambah).
 */
export function Radio({
  label, deskripsi, akhiran, nama, nilai, terpilih = false, onUbah, nonaktif = false, className, ...sisa
}) {
  const id = useId();
  return (
    <label className={gabung(gaya.baris, nonaktif && gaya.mati, className)} htmlFor={id}>
      <input
        {...sisa}
        id={id}
        className={gaya.asli}
        type="radio"
        name={nama}
        value={nilai}
        checked={terpilih}
        disabled={nonaktif}
        onChange={() => onUbah?.(nilai)}
      />
      <span className={gaya.bulat} aria-hidden="true"><span className={gaya.titik} /></span>
      <span className={gaya.teks}>
        <span className={gaya.label}>{label}</span>
        {deskripsi ? <span className={gaya.deskripsi}>{deskripsi}</span> : null}
      </span>
      {akhiran ? <span className={gaya.akhiran}>{akhiran}</span> : null}
    </label>
  );
}
