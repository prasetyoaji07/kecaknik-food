import { useId } from 'react';
import { Check } from 'lucide-react';
import { gabung } from '../gabung.js';
import gaya from './OptionCard.module.css';

/**
 * Grup radio berbentuk kartu (Ambil/Antar, metode bayar). Terpilih = latar lime.
 * Memakai radio asli di dalamnya, jadi panah kiri/kanan/atas/bawah, Spasi, dan Tab
 * bekerja seperti radio biasa.
 * opsi: [{ nilai, label, deskripsi?, ikon?, nonaktif? }]. Terkendali: `nilai`, `onUbah(nilai)`.
 */
export function OptionCard({
  legenda, nama, nilai, onUbah, opsi = [], bantuan, galat, wajib = false, nonaktif = false, kolom, className,
}) {
  const idAuto = useId();
  const namaGrup = nama ?? idAuto;
  const idGalat = `${idAuto}-galat`;
  const idBantuan = `${idAuto}-bantuan`;

  return (
    <fieldset
      className={gabung(gaya.grup, className)}
      disabled={nonaktif}
      aria-describedby={[bantuan ? idBantuan : '', galat ? idGalat : ''].filter(Boolean).join(' ') || undefined}
    >
      {legenda ? (
        <legend className={gaya.legenda}>
          {legenda}
          {wajib ? <span aria-hidden="true" className={gaya.wajib}> *</span> : null}
        </legend>
      ) : null}
      <div className={gabung(gaya.daftar, kolom === 1 && gaya.satuKolom)}>
        {opsi.map((o) => {
          const terpilih = o.nilai === nilai;
          return (
            <label
              key={o.nilai}
              className={gabung(gaya.kartu, terpilih && gaya.terpilih, (nonaktif || o.nonaktif) && gaya.mati, galat && gaya.galat)}
            >
              <input
                className={gaya.radio}
                type="radio"
                name={namaGrup}
                value={o.nilai}
                checked={terpilih}
                disabled={nonaktif || o.nonaktif}
                onChange={() => onUbah?.(o.nilai)}
              />
              {o.ikon ? <span className={gaya.ikon} aria-hidden="true">{o.ikon}</span> : null}
              <span className={gaya.teks}>
                <span className={gaya.judul}>{o.label}</span>
                {o.deskripsi ? <span className={gaya.deskripsi}>{o.deskripsi}</span> : null}
              </span>
              <span className={gaya.centang} aria-hidden="true">
                {terpilih ? <Check size={16} strokeWidth={3} /> : null}
              </span>
            </label>
          );
        })}
      </div>
      {bantuan ? <p id={idBantuan} className={gaya.bantuan}>{bantuan}</p> : null}
      <div aria-live="polite">
        {galat ? <p id={idGalat} className={gaya.pesanGalat}>{galat}</p> : null}
      </div>
    </fieldset>
  );
}
