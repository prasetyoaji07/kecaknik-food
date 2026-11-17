import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, ShoppingBag } from 'lucide-react';
import {
  Button, Chip, Dropzone, Field, OptionCard, PanelRekening, PetaPilih, useToast,
} from '@kecaknik/shared/ui';
import { rekening } from '@kecaknik/shared/core/konfigurasi.js';
import { rupiah } from '@kecaknik/shared/core/format.js';
import { useKeranjang } from '../fitur/keranjang/KeranjangContext.jsx';
import { buatPesanan } from '../api/pesanan.js';
import gaya from './Checkout.module.css';

const uang = (nilai) => rupiah(nilai) || 'Rp0';

export default function Checkout() {
  const keranjang = useKeranjang();
  const navigasi = useNavigate();
  const toast = useToast();
  const [tipe, setTipe] = useState('ambil');
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  const [catatan, setCatatan] = useState('');
  const [alamat, setAlamat] = useState('');
  const [lokasi, setLokasi] = useState({ lat: null, lng: null });
  const [metode, setMetode] = useState('transfer');
  const [kanal, setKanal] = useState('DANA');
  const [nominal, setNominal] = useState('');
  const [bukti, setBukti] = useState(null);
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState('');

  // `item.harga` sudah mencakup add-on: Produk.jsx menambahkan total opsi saat masuk keranjang.
  const total = useMemo(() => keranjang.items.reduce((sum, item) =>
    sum + Number(item.harga) * Number(item.qty), 0), [keranjang.items]);
  const campurPo = keranjang.items.some((item) => item.is_preorder)
    && keranjang.items.some((item) => !item.is_preorder);
  const nominalAngka = Number(String(nominal).replace(/\D/g, ''));
  const sisa = total - nominalAngka;
  const butuhTransfer = metode !== 'tunai';
  const channelTersedia = rekening.find((r) => r.nama === kanal && r.nomor !== 'TBD');
  const siap = keranjang.items.length > 0 && !campurPo && nama.trim().length >= 2
    && telepon.replace(/\D/g, '').length >= 8
    && (tipe !== 'antar' || (alamat.trim().length >= 10 && lokasi.lat !== null && lokasi.lng !== null))
    && (!butuhTransfer || (Boolean(channelTersedia) && Boolean(bukti)))
    && (metode !== 'split' || (nominalAngka > 0 && nominalAngka < total));

  function pilihPersentase(persen) {
    const dibulatkan = Math.round((total * persen / 100) / 500) * 500;
    setNominal(String(Math.max(1, Math.min(total - 1, dibulatkan))));
  }

  async function kirim(e) {
    e.preventDefault();
    setGalat('');
    if (!siap) {
      setGalat(campurPo ? 'Produk Pre-order tidak bisa digabung dengan produk reguler.' : 'Lengkapi data pemesan, lokasi pengantaran, dan syarat pembayaran.');
      return;
    }
    setMengirim(true);
    try {
      const items = keranjang.items.map((item) => ({
        product_id: item.product_id,
        qty: item.qty,
        catatan: item.catatan || '',
        opsi: (item.opsi || []).map((o) => ({ opsi_id: o.opsi_id ?? o.id, teks: o.teks || '' })),
      }));
      let hasil;
      const payload = {
        tipe_pesanan: tipe,
        nama_pelanggan: nama,
        no_hp: telepon,
        catatan,
        alamat: tipe === 'antar' ? alamat : '',
        lat: tipe === 'antar' ? lokasi.lat : '',
        lng: tipe === 'antar' ? lokasi.lng : '',
        metode_bayar: metode,
        ...(metode === 'split' ? { nominal_transfer: String(nominalAngka) } : {}),
        items: JSON.stringify(items),
        ...(butuhTransfer ? { channel: kanal.toLowerCase(), bukti } : {}),
      };
      const form = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null) form.append(k, v instanceof File ? v : String(v));
      });
      // Transfer/split memakai multipart; tunai juga aman dikirim sebagai multipart.
      hasil = await buatPesanan(form);
      keranjang.kosongkan();
      navigasi(`/berhasil/${encodeURIComponent(hasil.kode_pesanan)}`);
    } catch (err) {
      const pesan = err?.message || 'Pesanan belum berhasil dikirim. Coba lagi.';
      setGalat(pesan);
      toast?.galat?.(pesan);
    } finally {
      setMengirim(false);
    }
  }

  if (!keranjang.items.length) return <main className={gaya.halaman}><section className={gaya.kosong}><ShoppingBag size={36}/><h1>Keranjang masih kosong</h1><p>Pilih menu terlebih dahulu sebelum checkout.</p><Button as={Link} to="/menu">Lihat menu</Button></section></main>;

  return <main className={gaya.halaman}>
    <Link className={gaya.kembali} to="/menu"><ArrowLeft size={17}/> Kembali ke menu</Link>
    <header className={gaya.judul}><h1>Checkout</h1><p>Periksa pesanan dan lengkapi data untuk mengirim pesananmu.</p></header>
    <form className={gaya.tata} onSubmit={kirim}>
      <div className={gaya.form}>
        <section className={gaya.bagian}>
          <h2><span>1</span> Cara terima</h2>
          <OptionCard legenda="Pilih cara menerima pesanan" nama="tipe-pesanan" nilai={tipe} onUbah={setTipe} kolom={2} opsi={[
            { nilai: 'ambil', label: 'Ambil', deskripsi: 'Ambil langsung di toko', ikon: '🛍️' },
            { nilai: 'antar', label: 'Antar', deskripsi: 'Dikirim ke lokasi kamu', ikon: '🛵' },
          ]}/>
        </section>
        <section className={gaya.bagian}>
          <h2><span>2</span> Data pemesan</h2>
          <div className={gaya.kolom}>
            <Field kind="nama" label="Nama lengkap" nilai={nama} onUbah={setNama} wajib placeholder="Nama pemesan" />
            <Field kind="telepon" label="Nomor WhatsApp" nilai={telepon} onUbah={setTelepon} wajib placeholder="0812 3456 7890" bantuan="Nomor akan dinormalisasi ke format 62." />
          </div>
          <Field kind="teks" label="Catatan pesanan (opsional)" nilai={catatan} onUbah={setCatatan} baris={3} maksKarakter={500} placeholder="Contoh: jangan terlalu pedas…"/>
        </section>
        {tipe === 'antar' && <section className={gaya.bagian}>
          <h2><span>3</span> Pengantaran</h2>
          <Field kind="alamat" label="Alamat lengkap" nilai={alamat} onUbah={setAlamat} wajib baris={3} maksKarakter={255} placeholder="Nama jalan, nomor rumah, RT/RW, patokan…"/>
          <div className={gaya.petaJudul}><MapPin size={18}/><strong>Pilih titik lokasi pengantaran</strong></div>
          <PetaPilih nilai={lokasi} onUbah={setLokasi}/>
          <p className={gaya.catatanKecil}>Ongkir dikonfirmasi admin lewat WhatsApp.</p>
        </section>}
        <section className={gaya.bagian}>
          <h2><span>{tipe === 'antar' ? '4' : '3'}</span> Metode bayar</h2>
          <OptionCard legenda="Pilih metode pembayaran" nama="metode-bayar" nilai={metode} onUbah={(v) => { setMetode(v); setBukti(null); }} kolom={1} opsi={[
            { nilai: 'transfer', label: 'Transfer', deskripsi: 'Transfer sekarang dan unggah bukti pembayaran', ikon: '🏦' },
            { nilai: 'tunai', label: 'Bayar di tempat (tunai)', deskripsi: tipe === 'ambil' ? 'Bayar tunai saat pesanan diambil' : 'Bayar tunai saat pesanan diterima', ikon: '💵' },
            { nilai: 'split', label: 'Split', deskripsi: 'Sebagian transfer sekarang, sisanya tunai saat terima', ikon: '🧾' },
          ]}/>
          {metode === 'tunai' && <div className={gaya.infoKuning}>Pembayaran tunai dilakukan {tipe === 'ambil' ? 'saat pesanan diambil.' : 'saat pesanan diterima.'}</div>}
          {metode === 'split' && <div className={gaya.split}>
            <Field kind="rupiah" label="Dibayar via transfer sekarang" nilai={nominal} onUbah={setNominal} wajib placeholder="Masukkan nominal" awalan="Rp" bantuan="Nominal harus lebih dari Rp0 dan kurang dari total pesanan."/>
            <div className={gaya.chipBaris}><Chip onKlik={() => pilihPersentase(25)}>25%</Chip><Chip onKlik={() => pilihPersentase(50)}>50%</Chip></div>
            <div className={gaya.sisa}><span>Sisa dibayar tunai saat terima</span><strong>{uang(sisa > 0 ? sisa : 0)}</strong></div>
          </div>}
          {butuhTransfer && <>
            <PanelRekening rekening={rekening} nominal={metode === 'split' ? nominalAngka : total} kanal={kanal} onKanalUbah={setKanal}/>
            <Dropzone label="Bukti transfer" nilai={bukti} onUbah={setBukti} wajib bantuan="Unggah foto atau tangkapan layar bukti transfer (JPG, PNG, WebP, maks. 2 MB)."/>
          </>}
        </section>
        {galat && <p className={gaya.galat} role="alert">{galat}</p>}
        <Button type="submit" penuh ukuran="lg" memuat={mengirim} nonaktif={!siap || mengirim} alasan={!siap ? 'Lengkapi data dan persyaratan pembayaran terlebih dahulu.' : ''} >Pesan sekarang</Button>
        {butuhTransfer && !bukti && <p className={gaya.bantuanTombol}>Unggah bukti transfer dulu.</p>}
      </div>
      <aside className={gaya.ringkasan}>
        <h2>Ringkasan pesanan</h2>
        {keranjang.items.map((item, i) => {
          return <div className={gaya.item} key={`${item.product_id}-${i}`}><div><strong>{item.nama}</strong><span>{item.qty} × {uang(Number(item.harga))}</span>{item.is_preorder && <small>Pre-order{item.tanggal_ambil ? `, tanggal ambil ${item.tanggal_ambil}` : ', tanggal ambil mengikuti jadwal produk'}</small>}</div><b>{uang(Number(item.harga) * item.qty)}</b></div>;
        })}
        <div className={gaya.total}><span>Total tagihan</span><strong>{uang(total)}</strong></div>
        <p className={gaya.catatanKecil}>Tidak ada baris ongkir. Ongkir dikonfirmasi admin lewat WhatsApp untuk pesanan Antar.</p>
        {campurPo && <p className={gaya.galat}>Pre-order tidak bisa digabung dengan produk reguler. Pisahkan pesanan terlebih dahulu.</p>}
      </aside>
    </form>
  </main>;
}
