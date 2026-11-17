import { Check } from 'lucide-react';
import { alurPesanan, labelStatus } from '../../core/statusPesanan.js';
import { gabung } from '../gabung.js';
import gaya from './Timeline.module.css';

/** Timeline vertikal status pesanan untuk tipe Ambil atau Antar. */
export function Timeline({ tipePesanan, status, className }) {
  const alur = alurPesanan(tipePesanan);
  if (!alur.length || !alur.includes(status)) return null;
  const posisi = alur.indexOf(status);
  const dibatalkan = status === 'dibatalkan';

  return (
    <ol className={gabung(gaya.timeline, className)} aria-label={`Progres pesanan ${tipePesanan}`}>
      {alur.map((langkah, indeks) => {
        const selesai = !dibatalkan && (indeks < posisi || status === 'selesai');
        const aktif = !dibatalkan && indeks === posisi;
        const mendatang = !selesai && !aktif;
        return (
          <li key={langkah} className={gabung(gaya.langkah, selesai && gaya.selesai, aktif && gaya.aktif, mendatang && gaya.mendatang)}>
            <span className={gaya.penanda} aria-hidden="true">
              {selesai ? <Check size={15} strokeWidth={3} /> : <span />}
            </span>
            <span className={gaya.teks}>
              <span className={gaya.nama} aria-current={aktif ? 'step' : undefined}>{labelStatus(langkah, tipePesanan)}</span>
              {aktif ? <span className={gaya.keterangan}>Status pesanan saat ini</span> : null}
            </span>
            {aktif ? <span className={gaya.saatIni}>Saat ini</span> : null}
          </li>
        );
      })}
      {dibatalkan ? (
        <li className={gabung(gaya.langkah, gaya.dibatalkan)}>
          <span className={gaya.penanda} aria-hidden="true"><span /></span>
          <span className={gaya.teks}><span className={gaya.nama}>{labelStatus('dibatalkan', tipePesanan)}</span></span>
          <span className={gaya.saatIni}>Status akhir</span>
        </li>
      ) : null}
    </ol>
  );
}
