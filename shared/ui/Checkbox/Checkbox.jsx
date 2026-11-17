import { useId } from 'react';
import { Check } from 'lucide-react';
import { gabung } from '../gabung.js';
import gaya from './Checkbox.module.css';

/**
 * Kotak centang bergaris tebal, terpilih = merah. Dipakai di grup opsi produk (pilih banyak).
 * Terkendali: `terpilih` (boolean), `onUbah(boolean)`. `akhiran`: teks di kanan (mis. harga tambah).
 */
export function Checkbox({
  label, deskripsi, akhiran, terpilih = false, onUbah, nonaktif = false, nama, nilai, className, ...sisa
}) {
  const id = useId();
  return (
    <label className={gabung(gaya.baris, nonaktif && gaya.mati, className)} htmlFor={id}>
      <input
        {...sisa}
        id={id}
        className={gaya.asli}
        type="checkbox"
        name={nama}
        value={nilai}
        checked={terpilih}
        disabled={nonaktif}
        onChange={(e) => onUbah?.(e.target.checked)}
      />
      <span className={gaya.kotak} aria-hidden="true">
        <Check className={gaya.centang} size={16} strokeWidth={3.5} />
      </span>
      <span className={gaya.teks}>
        <span className={gaya.label}>{label}</span>
        {deskripsi ? <span className={gaya.deskripsi}>{deskripsi}</span> : null}
      </span>
      {akhiran ? <span className={gaya.akhiran}>{akhiran}</span> : null}
    </label>
  );
}
