import { gabung } from '../gabung.js';
import gaya from './Tab.module.css';

/** Tab terkontrol; pemilik state mengirim nilai aktif dan callback onUbah. */
export function Tab({ daftar = [], nilai, onUbah, label = 'Pilihan tampilan', className }) {
  return (
    <div className={gabung(gaya.tab, className)} role="group" aria-label={label}>
      {daftar.map((item) => {
        const value = typeof item === 'string' ? item : item.nilai;
        const teks = typeof item === 'string' ? item : item.label;
        const jumlah = typeof item === 'string' ? undefined : item.jumlah;
        const aktif = nilai === value;
        return (
          <button key={value} type="button" className={gabung(gaya.tombol, aktif && gaya.aktif)} aria-pressed={aktif} onClick={() => onUbah?.(value)}>
            <span>{teks}</span>{jumlah !== undefined ? <span className={gaya.jumlah}>{jumlah}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
