import { ArrowRight } from 'lucide-react';
import { gabung } from '../gabung.js';
import { FotoProduk } from '../FotoProduk/FotoProduk.jsx';
import { Button } from '../Button/Button.jsx';
import { Stiker } from '../Stiker/Stiker.jsx';
import gaya from './KartuProduk.module.css';

/** Kartu katalog pelanggan. `status`: normal | pre-order | habis | unggulan. */
export function KartuProduk({
  produk, nama, deskripsi, harga, foto, altFoto, status = 'normal', indeksStiker = 0,
  onPilih, href, className,
}) {
  const data = produk ?? {};
  const namaTampil = nama ?? data.nama ?? 'Produk Kecaknik';
  const hargaTampil = harga ?? data.harga;
  const fotoTampil = foto ?? data.foto ?? data.gambar_url;
  const statusAman = ['normal', 'pre-order', 'habis', 'unggulan'].includes(status) ? status : 'normal';
  const habis = statusAman === 'habis';
  const hargaFormat = Number.isFinite(Number(hargaTampil))
    ? `Rp${new Intl.NumberFormat('id-ID').format(Number(hargaTampil))}`
    : hargaTampil;

  return (
    <article className={gabung(gaya.kartu, gaya[statusAman], className)}>
      <div className={gaya.media}>
        <FotoProduk src={fotoTampil} alt={altFoto || namaTampil} namaProduk={namaTampil} />
        {statusAman === 'pre-order' ? <Stiker warna="kuning" indeks={indeksStiker} className={gaya.stikerKartu}>PRE-ORDER</Stiker> : null}
        {statusAman === 'unggulan' ? <Stiker warna="merah" indeks={indeksStiker} className={gaya.stikerKartu}>FAVORIT</Stiker> : null}
        {habis ? <span className={gaya.labelHabis}>Habis</span> : null}
      </div>
      <div className={gaya.isi}>
        <h3 className={gaya.nama}>{namaTampil}</h3>
        {deskripsi || data.deskripsi ? <p className={gaya.deskripsi}>{deskripsi ?? data.deskripsi}</p> : null}
        <div className={gaya.bawah}>
          <strong className={gaya.harga}>{hargaFormat ?? 'Harga menyusul'}</strong>
          {href ? (
            <Button as="a" href={href} variasi="sekunder" ukuran="sm" ikonKanan={<ArrowRight size={16} />} nonaktif={habis}>Lihat</Button>
          ) : (
            <Button variasi="primer" ukuran="sm" onClick={() => onPilih?.(data.id ?? data)} nonaktif={habis}>Pilih</Button>
          )}
        </div>
      </div>
    </article>
  );
}
