import { useState } from 'react';
import { Logo } from '../Logo/Logo.jsx';
import { Button } from '../Button/Button.jsx';
import { gabung } from '../gabung.js';
import gaya from './AdminLayout.module.css';

/** Kerangka admin: sidebar desktop, bilah atas dan laci navigasi pada mobile. */
export function AdminLayout({ children, navigasi = [], pathAktif = '', judul = 'Panel admin', aksi, footer }) {
  const [menuBuka, setMenuBuka] = useState(false);

  const renderNavigasi = (mobile = false) => navigasi.map((item) => {
    const aktif = item.href === pathAktif;
    return (
      <a
        key={item.href}
        href={item.href}
        className={gabung(gaya.tautan, aktif && gaya.aktif, mobile && gaya.tautanMobile)}
        aria-current={aktif ? 'page' : undefined}
        onClick={() => setMenuBuka(false)}
      >
        {item.ikon ? <span className={gaya.ikon} aria-hidden="true">{item.ikon}</span> : null}
        <span className={gaya.teksTautan}>{item.label}</span>
        {item.jumlah !== undefined ? <span className={gaya.jumlah}>{item.jumlah}</span> : null}
      </a>
    );
  });

  return (
    <div className={gaya.aplikasi}>
      <aside className={gaya.sidebar} aria-label="Navigasi utama admin">
        <div className={gaya.logo}><Logo ukuran="md" /></div>
        <p className={gaya.labelNavigasi}>MENU UTAMA</p>
        <nav className={gaya.daftar}>{renderNavigasi()}</nav>
        {footer ? <div className={gaya.footerSidebar}>{footer}</div> : null}
      </aside>

      <div className={gaya.area}>
        <header className={gaya.bilahAtas}>
          <Button
            variasi="sekunder"
            ukuran="sm"
            className={gaya.tombolMenu}
            aria-label={menuBuka ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuBuka}
            onClick={() => setMenuBuka((nilai) => !nilai)}
          >
            <span aria-hidden="true">{menuBuka ? '✕' : '☰'}</span>
          </Button>
          <div className={gaya.logoMobile}><Logo ukuran="sm" /></div>
          <h1 className={gaya.judulAtas}>{judul}</h1>
          <div className={gaya.aksi}>{aksi}</div>
        </header>
        {menuBuka ? (
          <>
            <button type="button" className={gaya.tabir} aria-label="Tutup menu" onClick={() => setMenuBuka(false)} />
            <nav className={gaya.laci} aria-label="Navigasi admin">{renderNavigasi(true)}</nav>
          </>
        ) : null}
        <main className={gaya.konten}>{children}</main>
      </div>
    </div>
  );
}
