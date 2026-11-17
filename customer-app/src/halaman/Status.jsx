import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, RefreshCw, Upload } from 'lucide-react';
import { Badge, Button, Dropzone, PetaRute, Timeline, TombolWa } from '@kecaknik/shared/ui';
import { rupiah, tanggal } from '@kecaknik/shared/core/format.js';
import { ambilPesanan, unggahBukti } from '../api/pesanan.js';
import gaya from './StatusPelanggan.module.css';

const uang = (n) => rupiah(Number(n) || 0) || 'Rp0';
const labelBayar = (p) => {
  if (p.status_pembayaran === 'lunas') return 'Lunas';
  if (p.status_pembayaran === 'uang_muka') return `Uang muka ${uang(p.jumlah_dibayar)}, sisa ${uang(p.sisa)}`;
  if (p.pembayaran_terakhir?.status === 'menunggu') return 'Menunggu verifikasi';
  return 'Belum dibayar';
};

export default function Status() {
  const { kode } = useParams();
  const [pesanan, setPesanan] = useState(null);
  const [galat, setGalat] = useState('');
  const [memuat, setMemuat] = useState(true);
  const [bukti, setBukti] = useState(null);
  const [mengunggah, setMengunggah] = useState(false);
  const [pesanUnggah, setPesanUnggah] = useState('');

  const muat = useCallback(async (diam = false) => {
    if (!diam) setMemuat(true);
    try {
      const data = await ambilPesanan(kode);
      setPesanan(data);
      setGalat('');
    } catch (e) {
      if (!diam) setGalat(e.message || 'Pesanan tidak dapat ditemukan. Periksa kembali kode pesanan.');
    } finally { if (!diam) setMemuat(false); }
  }, [kode]);

  useEffect(() => { muat(); }, [muat]);
  useEffect(() => {
    if (!pesanan || ['selesai', 'dibatalkan'].includes(pesanan.status)) return undefined;
    const id = window.setInterval(() => muat(true), 5000);
    return () => window.clearInterval(id);
  }, [muat, pesanan?.status]);

  const ditolak = pesanan?.pembayaran_terakhir?.status === 'ditolak';
  const dataWa = useMemo(() => pesanan ? ({ ...pesanan, kode_pesanan: pesanan.kode, tanggal: pesanan.tanggal, pembayaran: pesanan.pembayaran_terakhir ? [pesanan.pembayaran_terakhir] : [] }) : null, [pesanan]);

  async function kirimBukti(e) {
    e.preventDefault();
    if (!bukti) return;
    setMengunggah(true); setPesanUnggah('');
    try {
      await unggahBukti(kode, bukti);
      setBukti(null);
      setPesanUnggah('Bukti transfer baru sudah dikirim dan menunggu verifikasi.');
      await muat();
    } catch (e2) { setPesanUnggah(e2.message || 'Bukti belum berhasil diunggah.'); }
    finally { setMengunggah(false); }
  }

  if (memuat && !pesanan && !galat) return <main className={gaya.halaman}><p role="status">Memuat status pesanan…</p></main>;
  if (!pesanan) return <main className={gaya.halaman}><section className={gaya.kartu}><AlertCircle size={30}/><h1>Pesanan tidak ditemukan</h1><p>{galat || 'Periksa kembali kode pesanan.'}</p><Button as={Link} to="/lacak" variasi="sekunder" ikonKiri={<ArrowLeft size={17}/>}>Kembali ke lacak pesanan</Button></section></main>;

  return <main className={gaya.halaman}>
    <div className={gaya.kepala}><div><h1>{pesanan.kode}</h1><p>{tanggal(pesanan.tanggal) || 'Tanggal pemesanan'}</p></div><div className={gaya.badges}><Badge jenis="tipe" nilai={pesanan.tipe_pesanan}/><Badge jenis="status" nilai={pesanan.status} tipePesanan={pesanan.tipe_pesanan}/></div></div>
    {pesanan.status === 'dikirim' && pesanan.tipe_pesanan === 'antar' && <p className={gaya.infoAntar}>Pesanan sedang diantar dari Kecaknik Food ke lokasi Anda.</p>}
    <div className={gaya.grid}>
      <div className={gaya.kolom}>
        <section className={gaya.kartu}><div className={gaya.judulBaris}><h2>Perjalanan pesanan</h2><Button variasi="tautan" ukuran="sm" ikonKiri={<RefreshCw size={15}/>} onClick={() => muat()}>Perbarui</Button></div><Timeline tipePesanan={pesanan.tipe_pesanan} status={pesanan.status}/>
          <div className={gaya.pembayaran}><h3>Pembayaran</h3><strong>{labelBayar(pesanan)}</strong>{pesanan.status_pembayaran === 'uang_muka' && <p>Sisa {uang(pesanan.sisa)} dibayar tunai saat pesanan diterima.</p>}</div>
          {ditolak && <div className={gaya.peringatan}><h3>Bukti transfer perlu diperbaiki</h3><p>{pesanan.pembayaran_terakhir?.catatan || 'Bukti transfer belum dapat diverifikasi. Unggah ulang bukti yang jelas.'}</p><form onSubmit={kirimBukti} className={gaya.formBukti}><Dropzone label="Bukti transfer baru" nilai={bukti} onUbah={setBukti} wajib/><Button penuh type="submit" memuat={mengunggah} nonaktif={!bukti || mengunggah} ikonKiri={<Upload size={17}/>}>Unggah ulang bukti</Button></form><p role="status">{pesanUnggah}</p></div>}
          {pesanan.status === 'dibatalkan' && <div className={gaya.peringatan}><h3>Pesanan dibatalkan</h3><p>{pesanan.alasan_batal || 'Pesanan ini telah dibatalkan.'}</p></div>}
          {pesanan.status === 'selesai' && <p className={gaya.selesai}>Pesanan sudah selesai. Terima kasih sudah memilih Kecaknik Food.</p>}
          <TombolWa pesanan={dataWa}/>
        </section>
        {pesanan.tipe_pesanan === 'antar' && <PetaRute toko={pesanan.toko} lokasi={pesanan.lokasi} status={pesanan.status}/>}
      </div>
      <aside className={gaya.kartu}><h2>Rincian pesanan</h2><div className={gaya.daftarItem}>{pesanan.items?.map((item, i) => <article className={gaya.item} key={`${item.id ?? item.nama}-${i}`}><div><strong>{item.nama}</strong><span>{item.qty} × {uang(Number(item.harga) + Number(item.harga_opsi))}</span>{item.opsi?.length > 0 && <ul>{item.opsi.map((o, j) => <li key={j}>{o.nama_opsi}{o.teks ? `: ${o.teks}` : ''}</li>)}</ul>}{item.catatan && <small>Catatan: {item.catatan}</small>}</div><strong>{uang(item.subtotal)}</strong></article>)}</div>
        {pesanan.tanggal_ambil && <p className={gaya.tanggalAmbil}>Tanggal ambil: <strong>{tanggal(pesanan.tanggal_ambil)}</strong></p>}
        <div className={gaya.total}><span>Total pesanan</span><strong>{uang(pesanan.total)}</strong></div>
        <p className={gaya.privasi}>Detail nomor WhatsApp dan alamat tidak ditampilkan di halaman pelacakan.</p>
      </aside>
    </div>
    <p className={gaya.polling} role="status">Status diperbarui otomatis setiap 5 detik selama pesanan masih berjalan.</p>
  </main>;
}
