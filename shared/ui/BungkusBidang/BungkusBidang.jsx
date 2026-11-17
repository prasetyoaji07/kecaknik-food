import { CircleAlert } from 'lucide-react';
import { gabung } from '../gabung.js';
import gaya from './BungkusBidang.module.css';

/**
 * Pembungkus bersama Field dan Select (internal, tidak diekspor dari index):
 * label, bantuan, galat (ikon + teks, aria-live), petunjuk sementara, penghitung.
 */
export function BungkusBidang({
  idKontrol, idBantuan, idGalat, label, wajib, bantuan, galat, petunjuk, penghitung, className, children,
}) {
  return (
    <div className={gabung(gaya.bidang, className)}>
      {label ? (
        <label htmlFor={idKontrol} className={gaya.label}>
          {label}
          {wajib ? <span aria-hidden="true" className={gaya.wajib}> *</span> : null}
        </label>
      ) : null}
      {children}
      {bantuan ? <p id={idBantuan} className={gaya.bantuan}>{bantuan}</p> : null}
      <div className={gaya.bawah}>
        <div aria-live="polite" className={gaya.langsung}>
          {galat ? (
            <p id={idGalat} className={gaya.galat}>
              <CircleAlert size={16} strokeWidth={2} aria-hidden="true" />
              <span>{galat}</span>
            </p>
          ) : petunjuk ? (
            <p className={gaya.petunjuk}>{petunjuk}</p>
          ) : null}
        </div>
        {penghitung ? <span className={gaya.penghitung}>{penghitung}</span> : null}
      </div>
    </div>
  );
}
