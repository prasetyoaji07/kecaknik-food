import { gabung } from '../gabung.js';
import gaya from './TabelData.module.css';

/** Satu definisi kolom untuk tabel desktop dan kartu ringkas pada layar kecil. */
export function TabelData({ kolom = [], data = [], kunci = 'id', kosong = 'Belum ada data.', label = 'Daftar data', className }) {
  const tampilkan = (baris, item) => {
    const nilai = typeof item.render === 'function' ? item.render(baris[item.kunci], baris) : baris[item.kunci];
    return nilai === null || nilai === undefined || nilai === '' ? '—' : nilai;
  };

  if (!data.length) return <div className={gabung(gaya.kosong, className)} role="status">{kosong}</div>;

  return (
    <div className={gabung(gaya.wadah, className)}>
      <table className={gaya.tabel} aria-label={label}>
        <thead><tr>{kolom.map((item) => <th key={item.kunci} scope="col">{item.label}</th>)}</tr></thead>
        <tbody>
          {data.map((baris, indeks) => (
            <tr key={baris[kunci] ?? indeks}>
              {kolom.map((item) => <td key={item.kunci} data-label={item.label} className={item.rata === 'kanan' ? gaya.kanan : undefined}>{tampilkan(baris, item)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
