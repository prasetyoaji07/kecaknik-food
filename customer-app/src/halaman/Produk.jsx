import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Button, Chip, BarisChip, KartuProduk, Modal, FotoProduk, GrupOpsi, Stepper, useToast } from '@kecaknik/shared/ui';
import { ambilProduk } from '../api/produk.js';
import { API_BASE } from '../api/klien.js';
import { useKeranjang } from '../fitur/keranjang/KeranjangContext.jsx';
import gaya from './Produk.module.css';

const kategori = [
  { id: 'semua', nama: 'Semua' }, { id: 'kue', nama: 'Kue' },
  { id: 'puding-salad', nama: 'Puding & Salad' }, { id: 'gorengan', nama: 'Gorengan' },
  { id: 'lainnya', nama: 'Lainnya' }, { id: 'preorder', nama: 'Pre-order' },
];
const uang = (n) => `Rp${new Intl.NumberFormat('id-ID').format(Number(n) || 0)}`;
const fotoUrl = (p) => p?.gambar_url ? `${API_BASE}${p.gambar_url}` : null;

export default function Produk({ mode = 'menu' }) {
  const { kategori: paramKategori } = useParams();
  const navigasi = useNavigate();
  const { tambah } = useKeranjang();
  const toast = useToast();
  const [produk, setProduk] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');
  const [terpilih, setTerpilih] = useState(null);
  const [nilai, setNilai] = useState({});
  const [teks, setTeks] = useState({});
  const [qty, setQty] = useState(1);
  const [galatOpsi, setGalatOpsi] = useState({});

  useEffect(() => {
    let aktif = true;
    setMemuat(true); setGalat('');
    ambilProduk().then((data) => { if (aktif) setProduk(Array.isArray(data) ? data : data?.data || []); })
      .catch((e) => { if (aktif) setGalat(e.message); })
      .finally(() => { if (aktif) setMemuat(false); });
    return () => { aktif = false; };
  }, []);

  const filter = mode === 'preorder' ? 'preorder' : (paramKategori || 'semua');
  const daftar = useMemo(() => filter === 'semua' ? produk : filter === 'preorder'
    ? produk.filter((p) => p.is_preorder)
    : produk.filter((p) => p.kategori === filter), [produk, filter]);
  const grup = terpilih?.grup || [];
  const totalOpsi = grup.reduce((sum, g) => {
    const v = nilai[g.id]; const ids = Array.isArray(v) ? v : v ? [v] : [];
    return sum + (g.opsi || []).filter((o) => ids.includes(o.id)).reduce((s, o) => s + Number(o.harga_tambah || 0), 0);
  }, 0);

  function bukaOpsi(p) { setTerpilih(p); setNilai({}); setTeks({}); setQty(1); setGalatOpsi({}); }
  function masukkan() {
    const errors = {};
    grup.forEach((g) => {
      const v = nilai[g.id]; const count = Array.isArray(v) ? v.length : v ? 1 : 0;
      const min = Number(g.min_pilih ?? (g.wajib ? 1 : 0));
      if (count < min) errors[g.id] = `${g.nama}: pilih minimal ${min} pilihan.`;
      (g.opsi || []).filter((o) => o.butuh_teks && (Array.isArray(v) ? v.includes(o.id) : v === o.id)).forEach((o) => {
        if (!String(teks[g.id]?.[o.id] || '').trim()) errors[`${g.id}-${o.id}`] = `${o.label_teks || o.nama} wajib diisi.`;
      });
    });
    if (Object.keys(errors).length) { setGalatOpsi(errors); return; }
    const opsi = grup.flatMap((g) => {
      const v = nilai[g.id]; const ids = Array.isArray(v) ? v : v ? [v] : [];
      return ids.map((id) => ({ opsi_id: id, teks: teks[g.id]?.[id] || '' }));
    });
    tambah({ ...terpilih, harga: Number(terpilih.harga) + totalOpsi, gambar: terpilih.gambar }, { qty, opsi });
    setTerpilih(null); toast.berhasil('Masuk keranjang');
  }

  return <div className={gaya.halaman}>
    <section className={gaya.kepalaMenu}>
      <div><p className={gaya.salam}>{mode === 'preorder' ? 'Dibuat sesuai jadwal' : 'Dari dapur Kecaknik'}</p>
        <h1>{mode === 'preorder' ? 'Pre-order' : 'Menu'}</h1>
        <p>{mode === 'preorder' ? 'Pesan lebih awal untuk camilan dan kue pilihan.' : 'Pilih yang kamu suka. Kami siapkan dengan hangat dari dapur.'}</p>
      </div>
      <span className={gaya.coretan} aria-hidden="true">Enak<br/>dibawa<br/>pulang!</span>
    </section>
    {mode !== 'preorder' && <BarisChip label="Filter kategori" className={gaya.filter}>{kategori.map((k) => <Chip key={k.id} terpilih={filter === k.id} onKlik={() => navigasi(k.id === 'semua' ? '/menu' : `/menu/${k.id}`)}>{k.nama}</Chip>)}</BarisChip>}
    {memuat ? <p className={gaya.info}>Sedang mengambil menu…</p> : galat ? <div className={gaya.kosong}><h2>Menu belum bisa dimuat</h2><p>{galat}</p><Button onClick={() => window.location.reload()}>Coba lagi</Button></div> : daftar.length === 0 ? <div className={gaya.kosong}><h2>{mode === 'preorder' ? 'Belum ada Pre-order aktif' : 'Belum ada produk di kategori ini'}</h2><p>Coba lihat pilihan lainnya, ya.</p><Button variasi="sekunder" onClick={() => navigasi('/menu')}>Lihat semua menu</Button></div> :
      <section className={gaya.grid} aria-label="Daftar produk">{daftar.map((p, i) => <div key={p.id} className={i === 0 ? gaya.unggulan : ''}><KartuProduk produk={{...p, gambar_url: fotoUrl(p)}} status={p.is_preorder ? 'pre-order' : i === 0 && filter === 'semua' ? 'unggulan' : 'normal'} indeksStiker={i % 4} onPilih={() => bukaOpsi(p)} /></div>)}</section>}
    <Modal buka={Boolean(terpilih)} onTutup={() => setTerpilih(null)} judul={terpilih?.nama || 'Pilih produk'} deskripsi="Sesuaikan pilihan sebelum masuk keranjang." footer={<div className={gaya.aksiModal}><div><span>Jumlah</span><Stepper nilai={qty} onUbah={setQty} label="Jumlah produk"/></div><div className={gaya.total}><small>Total</small><strong>{uang((Number(terpilih?.harga) + totalOpsi) * qty)}</strong></div><Button onClick={masukkan}>Masukkan ke keranjang</Button></div>}>
      {terpilih && <div className={gaya.detailProduk}><FotoProduk src={fotoUrl(terpilih)} namaProduk={terpilih.nama}/><div className={gaya.rincian}><h3>{terpilih.nama}</h3><strong>{uang(terpilih.harga)}{terpilih.satuan ? ` / ${terpilih.satuan}` : ''}</strong>{terpilih.deskripsi && <p>{terpilih.deskripsi}</p>}</div></div>}
      {grup.length > 0 ? <GrupOpsi grup={grup.map((g) => ({...g, label: g.nama, jenis: g.tipe === 'pilih_banyak' ? 'banyak' : 'satu', opsi: g.opsi.map((o) => ({...o, nilai:o.id, label:o.nama, hargaTambah:o.harga_tambah}))}))} nilai={nilai} onUbah={(id,v) => setNilai((s)=>({...s,[id]:v}))} teks={teks} onUbahTeks={(id,oid,v)=>setTeks((s)=>({...s,[id]:{...s[id],[oid]:v}}))} galat={galatOpsi}/> : <p className={gaya.info}>Tidak ada opsi tambahan untuk produk ini.</p>}
    </Modal>
  </div>;
}
