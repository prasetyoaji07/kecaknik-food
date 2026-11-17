import { gabung } from '../gabung.js';
import gaya from './KartuStat.module.css';

/** Kartu ringkasan angka untuk dashboard dan laporan admin. */
export function KartuStat({ label, nilai, ikon, keterangan, className }) {
  return (
    <article className={gabung(gaya.kartu, className)}>
      <div className={gaya.kepala}><p className={gaya.label}>{label}</p>{ikon ? <span className={gaya.ikon} aria-hidden="true">{ikon}</span> : null}</div>
      <p className={gaya.nilai}>{nilai ?? '—'}</p>
      {keterangan ? <p className={gaya.keterangan}>{keterangan}</p> : null}
    </article>
  );
}
