import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { Button, Field } from '@kecaknik/shared/ui';
import gaya from './Lacak.module.css';

export default function Lacak() {
  const [kode, setKode] = useState('');
  const navigasi = useNavigate();
  function kirim(e) {
    e.preventDefault();
    const bersih = kode.trim().toUpperCase();
    if (bersih) navigasi(`/status/${encodeURIComponent(bersih)}`);
  }
  return <main className={gaya.halaman}>
    <section className={gaya.kartu}>
      <span className={gaya.ikon}><Search size={25}/></span>
      <h1>Lacak pesanan</h1>
      <p>Masukkan kode yang kamu dapat setelah memesan. Kode bisa ditemukan di halaman pesanan berhasil.</p>
      <form onSubmit={kirim}>
        <Field kind="kode" label="Kode pesanan" nilai={kode} onUbah={setKode} placeholder="KCK-XXXXXX" wajib bantuan="Contoh: KCK-ABC123" />
        <Button penuh type="submit" ikonKanan={<ArrowRight size={18}/>} nonaktif={!kode.trim()}>Lihat status pesanan</Button>
      </form>
    </section>
  </main>;
}
