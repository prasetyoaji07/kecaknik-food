import { HeaderSitus } from '../HeaderSitus/HeaderSitus.jsx';
import { FooterSitus } from '../FooterSitus/FooterSitus.jsx';
import gaya from './PelangganLayout.module.css';

/** Kerangka tunggal seluruh rute pelanggan: header, konten utama, footer. */
export function PelangganLayout({ children, jumlahKeranjang = 0, onBukaKeranjang, preorderAktif = false, pathAktif = '' }) {
  return (
    <div className={gaya.halaman}>
      <HeaderSitus
        jumlahKeranjang={jumlahKeranjang}
        onBukaKeranjang={onBukaKeranjang}
        preorderAktif={preorderAktif}
        pathAktif={pathAktif}
      />
      <main id="konten-utama" className={gaya.konten}>{children}</main>
      <FooterSitus preorderAktif={preorderAktif} />
    </div>
  );
}
