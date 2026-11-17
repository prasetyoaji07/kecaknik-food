import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Copy, ArrowRight } from 'lucide-react';
import { Badge, Button, TombolWa } from '@kecaknik/shared/ui';
import { rupiah } from '@kecaknik/shared/core/format.js';
import { ambilPesanan } from '../api/pesanan.js';
import gaya from './StatusPelanggan.module.css';

export default function Berhasil() {
  const { kode } = useParams();
  const [tersalin, setTersalin] = useState(false);
  const [pesanan, setPesanan] = useState(null);
  useEffect(() => { let aktif = true; ambilPesanan(kode).then((data) => { if (aktif) setPesanan(data); }).catch(() => {}); return () => { aktif = false; }; }, [kode]);
  async function salin() {
    try { await navigator.clipboard.writeText(kode || ''); setTersalin(true); }
    catch { setTersalin(false); }
  }
  const dataWa = pesanan ? ({ ...pesanan, kode_pesanan: pesanan.kode, tanggal: pesanan.tanggal, pembayaran: pesanan.pembayaran_terakhir ? [pesanan.pembayaran_terakhir] : [] }) : null;
  return <main className={gaya.halaman}>
    <section className={`${gaya.kartu} ${gaya.berhasil}`}>
      <span className={gaya.centang}><Check size={34} strokeWidth={3}/></span>
      <h1>Terima kasih sudah memesan!</h1>
      <p>Pesananmu sudah masuk ke Kecaknik Food. Simpan kode ini untuk melihat perkembangannya.</p>
      <div className={gaya.kodeBox}><span>Kode pesanan</span><strong>{kode}</strong><Button variasi="sekunder" ukuran="sm" ikonKiri={<Copy size={16}/>} onClick={salin}>{tersalin ? 'Tersalin' : 'Salin kode'}</Button></div>
      {pesanan && <><Badge jenis="bayar" nilai={pesanan.status_pembayaran}/><strong className={gaya.totalBerhasil}>Total {rupiah(pesanan.total)}</strong><TombolWa pesanan={dataWa}/></>}
      <p className={gaya.catatan}>Simpan kode ini. Kamu bisa kembali kapan saja untuk melihat status pesanan.</p>
      <Button as={Link} to={`/status/${encodeURIComponent(kode || '')}`} penuh ikonKanan={<ArrowRight size={18}/>}>Lihat status pesanan</Button>
    </section>
  </main>;
}
