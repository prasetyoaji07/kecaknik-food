import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, FileText } from 'lucide-react';
import { Button, DateField, KartuStat, Tab } from '@kecaknik/shared/ui';
import { rupiah, tanggal } from '@kecaknik/shared/core/format.js';
import { permintaan } from '../api/klien.js';
import gaya from './Laporan.module.css';

const hariLokal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Laporan() {
  const [periode, setPeriode] = useState('harian');
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState(hariLokal);
  const [data, setData] = useState(null);
  const [muat, setMuat] = useState(true);
  const [galat, setGalat] = useState('');

  const ambilLaporan = useCallback(async () => {
    setMuat(true); setGalat('');
    try {
      const q = new URLSearchParams({ periode });
      if (dari) q.set('dari', dari);
      if (sampai) q.set('sampai', sampai);
      setData(await permintaan(`/laporan?${q.toString()}`));
    } catch (e) { setGalat(e.message); }
    finally { setMuat(false); }
  }, [periode, dari, sampai]);

  useEffect(() => { ambilLaporan(); }, [ambilLaporan]);

  const baris = useMemo(() => data?.baris || [], [data]);
  const ringkasan = data?.ringkasan || { jumlah_pesanan: 0, total_tagihan: 0, total_diterima: 0 };
  const rentang = data ? `${tanggal(data.dari)} – ${tanggal(data.sampai)}` : 'Memuat rentang laporan…';
  const labelPeriode = (nilai) => {
    if (periode === 'harian') return tanggal(nilai);
    const [tahun, bulan] = nilai.split('-').map(Number);
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(tahun, bulan - 1, 1)));
  };

  return <section className="admin-halaman">
    <header className="admin-kepala"><div><p className="admin-alis">RINGKASAN USAHA</p><h2>Laporan</h2><p className="admin-subjudul">Pantau jumlah pesanan, total tagihan, dan pembayaran yang diterima.</p></div><Button variasi="sekunder" ukuran="sm" onClick={ambilLaporan} nonaktif={muat}><RefreshCw size={15}/> Muat ulang</Button></header>

    <div className={gaya.kontrol}>
      <Tab label="Periode laporan" nilai={periode} onUbah={setPeriode} daftar={[{ nilai: 'harian', label: 'Harian' }, { nilai: 'bulanan', label: 'Bulanan' }]} />
      <div className={gaya.tanggal}>
        <DateField label="Dari tanggal" nilai={dari} onUbah={setDari} maks={sampai || undefined} />
        <DateField label="Sampai tanggal" nilai={sampai} onUbah={setSampai} min={dari || undefined} maks={hariLokal()} />
        <Button onClick={ambilLaporan} nonaktif={muat || Boolean(dari && sampai && dari > sampai)}>Terapkan</Button>
        <Button variasi="tautan" onClick={() => { setDari(''); setSampai(hariLokal()); }}>Atur ulang</Button>
      </div>
      <p className={gaya.rentang}>Periode data: {rentang}. Pesanan yang dibatalkan tidak dihitung.</p>
    </div>

    {galat && <div className="admin-galat" role="alert">{galat} <Button variasi="sekunder" ukuran="sm" onClick={ambilLaporan}>Coba lagi</Button></div>}

    <div className={gaya.statistik} aria-live="polite">
      <KartuStat label="Jumlah pesanan" nilai={muat ? '…' : ringkasan.jumlah_pesanan.toLocaleString('id-ID')} ikon="▤" keterangan="Tidak termasuk pesanan dibatalkan" />
      <KartuStat label="Total tagihan" nilai={muat ? '…' : rupiah(ringkasan.total_tagihan)} ikon="Rp" keterangan="Akumulasi nilai pesanan" />
      <KartuStat label="Total diterima" nilai={muat ? '…' : rupiah(ringkasan.total_diterima)} ikon="✓" keterangan="Pembayaran yang sudah tercatat" />
    </div>

    <section className={gaya.tabelWrap}>
      <div className={gaya.tabelKepala}><div><h3>Rincian {periode === 'harian' ? 'harian' : 'bulanan'}</h3><p>Data dikelompokkan berdasarkan tanggal pesanan dibuat (WIB).</p></div></div>
      {muat ? <div className="admin-kosong">Memuat laporan…</div> : baris.length === 0 ? <div className={gaya.kosong}><FileText size={26}/><strong>Belum ada data laporan</strong><span>Tidak ditemukan pesanan pada rentang tanggal ini.</span></div> : <div className={gaya.gulir}><table className={gaya.tabel}><thead><tr><th>{periode === 'harian' ? 'Tanggal' : 'Bulan'}</th><th>Jumlah pesanan</th><th>Total tagihan</th><th>Total diterima</th></tr></thead><tbody>{baris.map((b) => <tr key={b.periode}><td>{labelPeriode(b.periode)}</td><td>{b.jumlah_pesanan.toLocaleString('id-ID')}</td><td>{rupiah(b.total_tagihan)}</td><td>{rupiah(b.total_diterima)}</td></tr>)}</tbody><tfoot><tr><th>Total</th><th>{ringkasan.jumlah_pesanan.toLocaleString('id-ID')}</th><th>{rupiah(ringkasan.total_tagihan)}</th><th>{rupiah(ringkasan.total_diterima)}</th></tr></tfoot></table></div>}
    </section>
  </section>;
}
