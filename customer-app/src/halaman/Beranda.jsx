import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, KartuProduk, FotoProduk } from '@kecaknik/shared/ui';
import { ambilProduk } from '../api/produk.js';
import { API_BASE } from '../api/klien.js';
import gaya from './Beranda.module.css';

const uang = (n) => `Rp${new Intl.NumberFormat('id-ID').format(Number(n) || 0)}`;
const foto = (p) => p?.gambar_url ? `${API_BASE}${p.gambar_url}` : null;
const kategori = [
  { id:'kue', nama:'Kue', gambar:'Kue pilihan untuk teman minum teh' },
  { id:'puding-salad', nama:'Puding & Salad', gambar:'Yang dingin dan menyegarkan' },
  { id:'gorengan', nama:'Gorengan', gambar:'Camilan gurih baru diangkat' },
  { id:'lainnya', nama:'Lainnya', gambar:'Temukan kejutan dari dapur kami' },
];
export default function Beranda() {
  const [produk,setProduk] = useState([]);
  useEffect(()=>{let aktif=true;ambilProduk().then((d)=>{if(aktif)setProduk(Array.isArray(d)?d:d?.data||[])}).catch(()=>{});return()=>{aktif=false}},[]);
  const favorit = produk.filter(p=>!p.is_preorder).slice(0,4);
  const adaPO = produk.some(p=>p.is_preorder);
  return <div className={gaya.halaman}>
    <section className={gaya.hero}>
      <div className={gaya.heroIsi}><p className={gaya.salam}>Dari dapur kami, untuk harimu</p><h1>Segar. Hangat.<br/><span>Buatan Rumah.</span></h1><p className={gaya.intro}>Camilan dan kue rumahan yang dibuat dengan telaten. Pilih favoritmu, biar kami siapkan.</p><div className={gaya.tombolHero}><Button as={Link} to="/menu" ikonKanan={<ArrowRight size={18}/>}>Lihat menu</Button><Button as={Link} to="/lacak" variasi="sekunder">Lacak pesanan</Button></div></div>
      <div className={gaya.heroFoto}><div className={gaya.fotoMiring}><FotoProduk namaProduk="Kue buatan rumah" alt="Pilihan kue Kecaknik Food"/></div><span className={gaya.stiker}>BARU!</span><span className={gaya.catatanFoto}>Dibuat sepenuh hati ♥</span></div>
    </section>
    {adaPO && <Link className={gaya.bannerPO} to="/preorder"><span><strong>Pre-order sedang dibuka!</strong><small>Amankan pesananmu sebelum jadwal ditutup.</small></span><ArrowUpRight size={24}/></Link>}
    <section className={gaya.bagianFavorit}><div className={gaya.judulBagian}><div><p className={gaya.salam}>Pilihan dari dapur</p><h2>Menu Favorit</h2></div><Link to="/menu">Lihat semua <ArrowRight size={17}/></Link></div>
      {favorit.length ? <div className={gaya.gridFavorit}>{favorit.map((p,i)=><KartuProduk key={p.id} produk={{...p,gambar_url:foto(p)}} status={i===0?'unggulan':'normal'} indeksStiker={i%4} href="/menu" />)}</div> : <p className={gaya.teksBantuan}>Pilihan menu akan tampil di sini setelah katalog tersedia.</p>}
    </section>
    <section className={gaya.bagianKategori}><div className={gaya.judulBagian}><div><p className={gaya.salam}>Cari yang kamu suka</p><h2>Jelajahi kategori</h2></div></div><div className={gaya.gridKategori}>{kategori.map((k)=><Link key={k.id} to={`/menu/${k.id}`} className={gaya.kategori}><strong>{k.nama}</strong><small>{k.gambar}</small><ArrowUpRight size={20}/></Link>)}</div></section>
    <section className={gaya.cara}><div><p className={gaya.salam}>Nggak pakai ribet</p><h2>Cara pesan</h2><p>Pilih camilan, atur pesanan, lalu tunggu kabar dari kami.</p></div><ol>{['Pilih menu dan sesuaikan opsi yang kamu mau.','Masukkan ke keranjang, lalu isi data pesanan.','Kirim pesanan dan simpan kode untuk melacaknya.'].map((s,i)=><li key={s}><span>{i+1}</span><p>{s}</p></li>)}</ol></section>
    <section className={gaya.lacak}><PackageCheck size={30}/><div><h2>Sudah pesan?</h2><p>Masukkan kode pesanan untuk melihat kabar terbarunya.</p></div><Button as={Link} to="/lacak" variasi="sekunder" ikonKanan={<ArrowRight size={18}/>}>Lacak pesanan</Button></section>
  </div>;
}
