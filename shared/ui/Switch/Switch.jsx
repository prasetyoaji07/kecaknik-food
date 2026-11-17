import { useId } from 'react';
import { gabung } from '../gabung.js';
import gaya from './Switch.module.css';

/** Toggle aksesibel terkontrol untuk status aktif/nonaktif. */
export function Switch({ nilai = false, onUbah, label, deskripsi, nonaktif = false, className, id }) {
  const idOtomatis = useId();
  const idKontrol = id ?? idOtomatis;
  return (
    <label className={gabung(gaya.baris, nonaktif && gaya.nonaktif, className)} htmlFor={idKontrol}>
      <span className={gaya.teks}><span className={gaya.label}>{label}</span>{deskripsi ? <span className={gaya.deskripsi}>{deskripsi}</span> : null}</span>
      <input id={idKontrol} className={gaya.input} type="checkbox" role="switch" checked={Boolean(nilai)} disabled={nonaktif} onChange={(event) => onUbah?.(event.target.checked)} />
      <span className={gaya.track} aria-hidden="true"><span className={gaya.bulat} /></span>
    </label>
  );
}
