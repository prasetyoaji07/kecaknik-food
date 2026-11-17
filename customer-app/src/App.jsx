import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ArrowRight, Trash2 } from 'lucide-react';
import { Button, PelangganLayout, ToastProvider, Laci, Stepper } from '@kecaknik/shared/ui';
import { rute } from './rute.jsx';
import { ambilProduk } from './api/produk.js';
import { KeranjangProvider, useKeranjang } from './fitur/keranjang/KeranjangContext.jsx';
import './app.css';

const uang = (n) => `Rp${new Intl.NumberFormat('id-ID').format(Number(n) || 0)}`;
function IsiAplikasi() {
  const keranjang = useKeranjang();
  const [keranjangBuka, setKeranjangBuka] = useState(false);
  const [preorderAktif, setPreorderAktif] = useState(false);
  useEffect(() => { let aktif = true; ambilProduk().then((data) => { if (aktif) setPreorderAktif((Array.isArray(data) ? data : data?.data || []).some((p) => p.is_preorder)); }).catch(() => {}); return () => { aktif = false; }; }, []);
  return <>
    <PelangganLayout jumlahKeranjang={keranjang.jumlahItem} onBukaKeranjang={() => setKeranjangBuka(true)} preorderAktif={preorderAktif}>
      <RouterProvider router={rute} />
    </PelangganLayout>
    <Laci buka={keranjangBuka} onTutup={() => setKeranjangBuka(false)} judul={`Keranjang (${keranjang.jumlahItem})`} footer={keranjang.items.length ? <div className="keranjang-footer"><div><span>Total sementara</span><strong>{uang(keranjang.subtotal)}</strong></div><Button penuh ikonKanan={<ArrowRight size={18}/>} onClick={()=>{setKeranjangBuka(false);window.location.href='/checkout';}}>Lanjut ke checkout</Button></div> : null}>
      {keranjang.items.length ? <div className="daftar-keranjang">{keranjang.items.map((item,i)=><article className="baris-keranjang" key={`${item.product_id}-${i}`}><div className="baris-info"><strong>{item.nama}</strong><span>{uang(item.harga)} / item</span>{item.opsi?.length>0 && <small>{item.opsi.length} opsi dipilih</small>}</div><Stepper nilai={item.qty} onUbah={(n)=>keranjang.ubahJumlah(i,n)} label={`Jumlah ${item.nama}`}/><Button variasi="bahaya" ukuran="sm" ikonKiri={<Trash2 size={16}/>} aria-label={`Hapus ${item.nama}`} onClick={()=>keranjang.hapus(i)}/></article>)}</div> : <div className="keranjang-kosong"><p>Keranjangmu masih kosong. Lihat menu dulu, yuk.</p><Button onClick={()=>{setKeranjangBuka(false);window.location.href='/menu';}}>Lihat menu</Button></div>}
      {keranjang.gagalSimpan && <p role="alert">Keranjang tidak dapat disimpan di perangkat ini. Periksa ruang penyimpanan browser.</p>}
    </Laci>
  </>;
}
export default function App() {
  return <ToastProvider><KeranjangProvider><IsiAplikasi/></KeranjangProvider></ToastProvider>;
}
