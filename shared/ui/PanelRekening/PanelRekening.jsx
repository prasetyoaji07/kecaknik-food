import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { rupiah } from '../../core/format.js';
import { Button } from '../Button/Button.jsx';
import { gabung } from '../gabung.js';
import gaya from './PanelRekening.module.css';

const KANAL_BAWAAN = ['DANA', 'BCA', 'BRI', 'GoPay'];

/** Panel rekening transfer. `rekening`: { DANA: {nomor, atasNama}, ... }. */
export function PanelRekening({ rekening = {}, nominal, kanal, onKanalUbah, className }) {
  const daftarRekening = Array.isArray(rekening)
    ? Object.fromEntries(rekening.map((item) => [item.nama, item]))
    : rekening;
  const tersedia = KANAL_BAWAAN.filter((nama) => daftarRekening[nama]?.nomor && daftarRekening[nama].nomor !== 'TBD');
  const [aktifLokal, setAktifLokal] = useState(kanal ?? tersedia[0] ?? 'DANA');
  const [tersalin, setTersalin] = useState(false);
  const [galatSalin, setGalatSalin] = useState('');
  const aktif = kanal ?? (tersedia.includes(aktifLokal) ? aktifLokal : (tersedia[0] ?? aktifLokal));
  const data = daftarRekening[aktif] ?? {};
  const nomor = data.nomor && data.nomor !== 'TBD' ? String(data.nomor) : '';
  const atasNama = data.atasNama && data.atasNama !== 'TBD' ? data.atasNama : 'Belum tersedia';

  useEffect(() => {
    if (!tersalin) return undefined;
    const waktu = window.setTimeout(() => setTersalin(false), 2000);
    return () => window.clearTimeout(waktu);
  }, [tersalin]);

  async function salin() {
    if (!nomor || !navigator.clipboard?.writeText) {
      setGalatSalin('Penyalinan tidak tersedia di browser ini.');
      return;
    }
    try {
      await navigator.clipboard.writeText(nomor);
      setTersalin(true);
      setGalatSalin('');
    } catch {
      setGalatSalin('Nomor rekening belum bisa disalin.');
    }
  }

  function pilih(nama) {
    setAktifLokal(nama);
    setTersalin(false);
    setGalatSalin('');
    onKanalUbah?.(nama);
  }

  return (
    <section className={gabung(gaya.panel, className)} aria-label="Informasi rekening pembayaran">
      <div className={gaya.kepala}>
        <h3>Transfer ke rekening Kecaknik</h3>
        {nominal !== undefined && nominal !== null ? <strong>{rupiah(nominal)}</strong> : null}
      </div>
      <div className={gaya.tab} role="tablist" aria-label="Pilih rekening">
        {KANAL_BAWAAN.map((nama) => (
          <button
            key={nama}
            type="button"
            role="tab"
            id={`rekening-tab-${nama.toLowerCase()}`}
            aria-selected={aktif === nama}
            aria-controls="rekening-panel"
            tabIndex={aktif === nama ? 0 : -1}
            disabled={!daftarRekening[nama]?.nomor || daftarRekening[nama].nomor === 'TBD'}
            className={gabung(gaya.tombolTab, aktif === nama && gaya.tabAktif)}
            onClick={() => pilih(nama)}
          >
            {nama}
          </button>
        ))}
      </div>
      <div id="rekening-panel" className={gaya.isi} role="tabpanel" aria-labelledby={`rekening-tab-${aktif.toLowerCase()}`}>
        <span className={gaya.label}>Nomor rekening / akun</span>
        <div className={gaya.nomorBaris}>
          <strong className={gaya.nomor}>{nomor || 'Nomor belum tersedia'}</strong>
          <Button variasi="sekunder" ukuran="sm" ikonKiri={tersalin ? <Check size={16} /> : <Copy size={16} />} onClick={salin} nonaktif={!nomor}>
            {tersalin ? 'Tersalin' : 'Salin'}
          </Button>
        </div>
        <span className={gaya.label}>Atas nama</span>
        <strong>{atasNama}</strong>
        {galatSalin ? <p className={gaya.galat} role="status">{galatSalin}</p> : null}
      </div>
    </section>
  );
}
