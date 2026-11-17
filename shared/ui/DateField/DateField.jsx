import { forwardRef, useId } from 'react';
import { gabung } from '../gabung.js';
import { BungkusBidang } from '../BungkusBidang/BungkusBidang.jsx';
import gaya from './DateField.module.css';

/**
 * Satu tanggal. Membungkus input[type=date]: popup kalender milik browser, jadi tidak
 * keluar layar. Rentang tanggal = dua DateField (dari dan sampai, pakai `min`/`maks`).
 * Nilai selalu teks 'YYYY-MM-DD' (atau '' bila kosong). Terkendali: `nilai`, `onUbah(teks)`.
 */
export const DateField = forwardRef(function DateField(
  { label, nilai = '', onUbah, min, maks, bantuan, galat, wajib = false, nonaktif = false, id, nama, onBlur, className, ...sisa },
  ref,
) {
  const idAuto = useId();
  const idInput = id ?? idAuto;
  const idBantuan = `${idInput}-bantuan`;
  const idGalat = `${idInput}-galat`;
  const deskripsi = [bantuan ? idBantuan : '', galat ? idGalat : ''].filter(Boolean).join(' ') || undefined;

  return (
    <BungkusBidang
      idKontrol={idInput}
      idBantuan={idBantuan}
      idGalat={idGalat}
      label={label}
      wajib={wajib}
      bantuan={bantuan}
      galat={galat}
      className={className}
    >
      <div className={gabung(gaya.kotak, galat && gaya.kotakGalat, nonaktif && gaya.kotakMati)}>
        <input
          {...sisa}
          ref={ref}
          id={idInput}
          name={nama}
          className={gaya.kontrol}
          type="date"
          value={nilai}
          min={min}
          max={maks}
          required={wajib}
          disabled={nonaktif}
          aria-invalid={galat ? true : undefined}
          aria-describedby={deskripsi}
          onChange={(e) => onUbah?.(e.target.value)}
          onBlur={onBlur}
        />
      </div>
    </BungkusBidang>
  );
});
