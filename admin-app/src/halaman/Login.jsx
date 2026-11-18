import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Field, Logo } from '@kecaknik/shared/ui';
import { masuk } from '../api/auth.js';
import gaya from './Login.module.css';

export default function Login() {
  const [sandi, setSandi] = useState('');
  const [galat, setGalat] = useState('');
  const [memuat, setMemuat] = useState(false);
  const navigasi = useNavigate();
  const lokasi = useLocation();

  async function kirim(event) {
    event.preventDefault();
    if (!sandi || memuat) return;
    setGalat('');
    setMemuat(true);
    try {
      await masuk(sandi);
      const tujuan = lokasi.state?.dari?.pathname;
      navigasi(tujuan && tujuan !== '/login' ? tujuan : '/pesanan', { replace: true });
    } catch (error) {
      setGalat(error.message === 'Sandi salah.' ? 'Sandi tidak sesuai. Periksa kembali lalu coba lagi.' : error.message);
    } finally {
      setMemuat(false);
    }
  }

  return (
    <main className={gaya.latar}>
      <div className={gaya.bungkus}>
        <div className={gaya.logo}><Logo ukuran="lg" /></div>
        <section className={gaya.kartu} aria-labelledby="judul-login">
        <h1 id="judul-login" className={gaya.judul}>Masuk ke panel admin</h1>
        <p className={gaya.deskripsi}>Kelola pesanan Kecaknik Food dari satu tempat.</p>
        <form className={gaya.form} onSubmit={kirim}>
          <Field
            kind="sandi"
            label="Sandi admin"
            nilai={sandi}
            onUbah={setSandi}
            wajib
            placeholder="Masukkan sandi admin"
            galat={galat || undefined}
            autoComplete="current-password"
          />
          <Button type="submit" penuh memuat={memuat} nonaktif={!sandi.trim()}>
            {memuat ? 'Memeriksa…' : 'Masuk'}
          </Button>
        </form>
        <p className={gaya.catatan}>Akses ini khusus admin Kecaknik Food.</p>
        </section>
      </div>
    </main>
  );
}
