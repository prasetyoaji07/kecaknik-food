import { Trash2, Pencil } from 'lucide-react';
import { rupiah } from '../../core/format.js';
import { gabung } from '../gabung.js';
import { FotoProduk } from '../FotoProduk/FotoProduk.jsx';
import { Stepper } from '../Stepper/Stepper.jsx';
import { Button } from '../Button/Button.jsx';
import gaya from './BarisKeranjang.module.css';

/** Baris item keranjang. Semua baris memiliki foto, stepper, ubah opsi, dan hapus. */
export function BarisKeranjang({
  item = {}, jumlah, onUbahJumlah, onUbahOpsi, onHapus, className,
}) {
  const nama = item.nama ?? 'Produk Kecaknik';
  const banyak = jumlah ?? item.jumlah ?? 1;
  const opsi = item.ringkasanOpsi ?? item.opsiLabel ?? '';
  const harga = Number(item.hargaSatuan ?? item.harga ?? 0);
  const total = Number.isFinite(harga) ? harga * banyak : null;

  return (
    <article className={gabung(gaya.baris, className)}>
      <FotoProduk className={gaya.foto} src={item.foto} alt={nama} namaProduk={nama} />
      <div className={gaya.detail}>
        <div className={gaya.judul}>
          <h3>{nama}</h3>
          <Button variasi="tautan" ukuran="sm" ikonKiri={<Trash2 size={16} />} aria-label={`Hapus ${nama}`} onClick={() => onHapus?.(item.id)} />
        </div>
        {opsi ? <p className={gaya.opsi}>{opsi}</p> : <p className={gaya.opsi}>Tanpa opsi tambahan</p>}
        <div className={gaya.bawah}>
          <Stepper nilai={banyak} onUbah={(baru) => onUbahJumlah?.(item.id, baru)} label={`Jumlah ${nama}`} />
          <strong className={gaya.total}>{total === null ? '—' : rupiah(total)}</strong>
        </div>
        <Button variasi="tautan" ukuran="sm" ikonKiri={<Pencil size={14} />} onClick={() => onUbahOpsi?.(item.id)} nonaktif={!onUbahOpsi}>Ubah opsi</Button>
      </div>
    </article>
  );
}
