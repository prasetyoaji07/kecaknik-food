import { Logo } from '../Logo/Logo.jsx';
import { toko } from '../../core/konfigurasi.js';
import gaya from './FooterSitus.module.css';

/** Footer semua halaman pelanggan. Data toko kosong disamarkan di produksi. */
export function FooterSitus({ preorderAktif = false }) {
  const dev = Boolean(import.meta.env?.DEV);
  const tampilkan = (nilai, label) => nilai
    ? nilai
    : dev ? <span className={gaya.placeholder}>Belum diatur: {label}</span> : null;
  const navigasi = [
    { href: '/', label: 'Beranda' },
    { href: '/menu', label: 'Menu' },
    ...(preorderAktif ? [{ href: '/preorder', label: 'Pre-order' }] : []),
    { href: '/lacak', label: 'Lacak pesanan' },
  ];

  return (
    <footer className={gaya.footer}>
      <div className={gaya.konten}>
        <section className={gaya.merek} aria-label="Tentang Kecaknik Food">
          <Logo ukuran="lg" />
          <p>Homemade food untuk hari-hari yang lebih hangat.</p>
        </section>
        <section className={gaya.kolom}>
          <h2>Hubungi kami</h2>
          {toko.alamat ? <p>{toko.alamat}</p> : dev ? <p>{tampilkan('', 'alamat toko')}</p> : null}
          {toko.waAdmin ? <p><a href={`https://wa.me/${toko.waAdmin}`} target="_blank" rel="noreferrer">WhatsApp kami</a></p> : dev ? <p>{tampilkan('', 'WhatsApp')}</p> : null}
          {toko.jamBuka?.length
            ? toko.jamBuka.map((j) => <p key={j.label}>{j.label}: {j.jam}</p>)
            : dev ? <p>{tampilkan('', 'jam buka')}</p> : null}
        </section>
        <nav className={gaya.kolom} aria-label="Jelajah">
          <h2>Jelajah</h2>
          {navigasi.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
      </div>
      <div className={gaya.bawah}>© {new Date().getFullYear()} Kecaknik Food</div>
    </footer>
  );
}
