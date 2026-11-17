import { useState } from 'react';
import { Menu, ShoppingBag } from 'lucide-react';
import { Logo } from '../Logo/Logo.jsx';
import { Button } from '../Button/Button.jsx';
import { Laci } from '../Laci/Laci.jsx';
import gaya from './HeaderSitus.module.css';

const tautanDasar = [
  { href: '/', label: 'Beranda' },
  { href: '/menu', label: 'Menu' },
  { href: '/lacak', label: 'Lacak pesanan' },
];

/** Header pelanggan tunggal: pill desktop dan menu laci pada layar kecil. */
export function HeaderSitus({ jumlahKeranjang = 0, onBukaKeranjang, preorderAktif = false, pathAktif = '' }) {
  const [menuBuka, setMenuBuka] = useState(false);
  const tautan = preorderAktif
    ? [...tautanDasar.slice(0, 2), { href: '/preorder', label: 'Pre-order' }, tautanDasar[2]]
    : tautanDasar;

  const navigasi = (mobile = false) => (
    <nav className={mobile ? gaya.navigasiMobile : gaya.navigasi} aria-label="Navigasi utama">
      {tautan.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={pathAktif === item.href ? gaya.aktif : undefined}
          aria-current={pathAktif === item.href ? 'page' : undefined}
          onClick={() => setMenuBuka(false)}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );

  return (
    <header className={gaya.wadah}>
      <div className={gaya.pill}>
        <Logo ukuran="md" href="/" />
        {navigasi()}
        <Button
          variasi="aksen"
          ukuran="md"
          ikonKiri={<ShoppingBag size={18} />}
          onClick={onBukaKeranjang}
          aria-label={`Buka keranjang, ${jumlahKeranjang} item`}
          className={gaya.keranjang}
        >
          Keranjang{jumlahKeranjang > 0 ? <span className={gaya.jumlah}>{jumlahKeranjang}</span> : null}
        </Button>
        <Button
          variasi="sekunder"
          ukuran="md"
          ikonKiri={menuBuka ? <X size={20} /> : <Menu size={20} />}
          aria-label={menuBuka ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={menuBuka}
          onClick={() => setMenuBuka(true)}
          className={gaya.tombolMenu}
        />
      </div>
      <Laci buka={menuBuka} onTutup={() => setMenuBuka(false)} judul="Jelajah Kecaknik">
        <div className={gaya.isiLaci}>
          {navigasi(true)}
          <Button variasi="aksen" penuh ikonKiri={<ShoppingBag size={18} />} onClick={() => { setMenuBuka(false); onBukaKeranjang?.(); }}>
            Keranjang{jumlahKeranjang > 0 ? ` (${jumlahKeranjang})` : ''}
          </Button>
        </div>
      </Laci>
    </header>
  );
}
