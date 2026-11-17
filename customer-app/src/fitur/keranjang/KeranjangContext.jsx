import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { bacaKeranjang, hapusKeranjangTersimpan, simpanKeranjang } from './penyimpanan.js';

const KeranjangContext = createContext(null);

function kunciBaris(item) {
  const opsi = [...(item.opsi || [])]
    .map((pilihan) => ({ opsi_id: pilihan.opsi_id ?? pilihan.id, teks: pilihan.teks || '' }))
    .sort((a, b) => Number(a.opsi_id) - Number(b.opsi_id));
  return `${item.product_id}:${JSON.stringify(opsi)}:${item.catatan || ''}`;
}

export function KeranjangProvider({ children }) {
  const [items, setItems] = useState(bacaKeranjang);
  const [gagalSimpan, setGagalSimpan] = useState(false);

  useEffect(() => {
    setGagalSimpan(!simpanKeranjang(items));
  }, [items]);

  const tambah = useCallback((produk, { qty = 1, opsi = [], catatan = '' } = {}) => {
    setItems((sebelumnya) => {
      const baris = {
        product_id: produk.id,
        nama: produk.nama,
        harga: Number(produk.harga) || 0,
        gambar: produk.gambar || null,
        qty: Math.max(1, Math.min(99, Number(qty) || 1)),
        opsi,
        catatan,
        is_preorder: Boolean(produk.is_preorder),
        tanggal_ambil: produk.tanggal_ambil || null,
      };
      const kunci = kunciBaris(baris);
      const index = sebelumnya.findIndex((item) => kunciBaris(item) === kunci);
      if (index < 0) return [...sebelumnya, baris];
      return sebelumnya.map((item, i) => i === index
        ? { ...item, qty: Math.min(99, item.qty + baris.qty) }
        : item);
    });
  }, []);

  const ubahJumlah = useCallback((index, qty) => {
    const jumlah = Number(qty);
    if (!Number.isInteger(jumlah) || jumlah < 1) return;
    setItems((sebelumnya) => sebelumnya.map((item, i) => i === index
      ? { ...item, qty: Math.min(99, jumlah) }
      : item));
  }, []);

  const hapus = useCallback((index) => {
    setItems((sebelumnya) => sebelumnya.filter((_, i) => i !== index));
  }, []);

  const kosongkan = useCallback(() => {
    setItems([]);
    hapusKeranjangTersimpan();
  }, []);

  const nilai = useMemo(() => ({
    items,
    jumlahItem: items.reduce((total, item) => total + item.qty, 0),
    subtotal: items.reduce((total, item) => total + (Number(item.harga) || 0) * item.qty, 0),
    gagalSimpan,
    tambah,
    ubahJumlah,
    hapus,
    kosongkan,
  }), [items, gagalSimpan, tambah, ubahJumlah, hapus, kosongkan]);

  return <KeranjangContext.Provider value={nilai}>{children}</KeranjangContext.Provider>;
}

export function useKeranjang() {
  const konteks = useContext(KeranjangContext);
  if (!konteks) throw new Error('useKeranjang harus digunakan di dalam KeranjangProvider.');
  return konteks;
}
