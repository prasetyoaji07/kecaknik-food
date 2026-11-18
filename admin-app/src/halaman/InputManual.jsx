import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ShoppingBag, Send } from 'lucide-react';
import {
  Button, Dropzone, Field, GrupOpsi, OptionCard, Select, useToast,
} from '@kecaknik/shared/ui';
import { rupiah } from '@kecaknik/shared/core/format.js';
import { rekening } from '@kecaknik/shared/core/konfigurasi.js';
import { permintaan } from '../api/klien.js';
import gaya from './InputManual.module.css';

const SUMBER = [
  { nilai: 'whatsapp', label: 'WhatsApp', deskripsi: 'Pesanan masuk melalui chat.' },
  { nilai: 'facebook', label: 'Facebook', deskripsi: 'Pesanan dari media sosial.' },
  { nilai: 'langsung', label: 'Langsung', deskripsi: 'Pelanggan datang atau memesan langsung.' },
  { nilai: 'website', label: 'Website', deskripsi: 'Pesanan yang dicatat atas permintaan pelanggan.' },
];
const TIPE = [
  { nilai: 'ambil', label: 'Ambil', deskripsi: 'Pelanggan mengambil pesanan di toko.' },
  { nilai: 'antar', label: 'Antar', deskripsi: 'Pesanan dikirim ke alamat pelanggan.' },
];
const PEMBAYARAN = [
  { nilai: 'tidak_ada', label: 'Belum ada pembayaran', deskripsi: 'Pembayaran dicatat nanti.' },
  { nilai: 'tunai', label: 'Tunai', deskripsi: 'Pembayaran tunai sudah diterima.' },
  { nilai: 'transfer', label: 'Transfer', deskripsi: 'Transfer sudah diterima admin.' },
];
const KANAL = rekening.map((r) => ({ nilai: r.kode, label: r.nama }));

function itemBaru(id) {
  return { id, product_id: '', qty: '1', catatan: '', pilihan: {}, teks: {} };
}

function opsiTerpilih(item) {
  return Object.entries(item.pilihan).flatMap(([idGrup, nilai]) => {
    const daftar = Array.isArray(nilai) ? nilai : nilai ? [nilai] : [];
    return daftar.map((idOpsi) => ({
      opsi_id: Number(idOpsi),
      teks: item.teks[idGrup]?.[idOpsi] || null,
    }));
  });
}

function hargaPerItem(item, produk) {
  const p = produk.find((x) => String(x.id) === String(item.product_id));
  if (!p) return 0;
  const ids = new Set(opsiTerpilih(item).map((o) => o.opsi_id));
  const tambahan = (p.grup || []).flatMap((g) => g.opsi || [])
    .filter((o) => ids.has(o.id))
    .reduce((jumlah, o) => jumlah + Number(o.harga_tambah || 0), 0);
  return (Number(p.harga) + tambahan) * Math.max(0, Number(item.qty) || 0);
}

export default function InputManual() {
  const toast = useToast();
  const navigate = useNavigate();
  const [produk, setProduk] = useState([]);
  const [memuatProduk, setMemuatProduk] = useState(true);
  const [galatProduk, setGalatProduk] = useState('');
  const [simpan, setSimpan] = useState(false);
  const [nomorItem, setNomorItem] = useState(2);
  const [items, setItems] = useState([itemBaru(1)]);
  const [sumber, setSumber] = useState('whatsapp');
  const [tipePesanan, setTipePesanan] = useState('ambil');
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  const [alamat, setAlamat] = useState('');
  const [catatan, setCatatan] = useState('');
  const [metodeAwal, setMetodeAwal] = useState('tidak_ada');
  const [channel, setChannel] = useState('');
  const [jumlahBayar, setJumlahBayar] = useState('');
  const [catatanBayar, setCatatanBayar] = useState('');
  const [bukti, setBukti] = useState(null);

  const muatProduk = useCallback(async () => {
    setMemuatProduk(true);
    setGalatProduk('');
    try {
      setProduk(await permintaan('/products'));
    } catch (e) {
      setGalatProduk(e.message);
    } finally {
      setMemuatProduk(false);
    }
  }, []);

  useEffect(() => { muatProduk(); }, [muatProduk]);

  const total = useMemo(() => items.reduce((jumlah, item) => jumlah + hargaPerItem(item, produk), 0), [items, produk]);
  const daftarProduk = useMemo(() => produk.map((p) => ({ nilai: String(p.id), label: `${p.nama} — ${rupiah(p.harga)}${p.is_preorder ? ' · Pre-order' : ''}` })), [produk]);

  function ubahItem(id, perubahan) {
    setItems((lama) => lama.map((item) => item.id === id ? { ...item, ...perubahan } : item));
  }

  function pilihProduk(id, productId) {
    ubahItem(id, { product_id: productId, pilihan: {}, teks: {}, catatan: '' });
  }

  function tambahItem() {
    setItems((lama) => [...lama, itemBaru(nomorItem)]);
    setNomorItem((n) => n + 1);
  }

  function hapusItem(id) {
    setItems((lama) => lama.length > 1 ? lama.filter((item) => item.id !== id) : lama);
  }

  async function kirim(e) {
    e.preventDefault();
    if (!items.length || items.some((item) => !item.product_id)) {
      toast.galat('Pilih produk untuk setiap baris pesanan.');
      return;
    }
    if (metodeAwal !== 'tidak_ada') {
      if (!jumlahBayar || Number(jumlahBayar) < 1) {
        toast.galat('Isi jumlah pembayaran yang sudah diterima.');
        return;
      }
      if (Number(jumlahBayar) > total) {
        toast.galat('Jumlah pembayaran tidak boleh melebihi total pesanan.');
        return;
      }
      if (metodeAwal === 'transfer' && !channel) {
        toast.galat('Pilih channel transfer.');
        return;
      }
      if (metodeAwal === 'transfer' && !bukti && !catatanBayar.trim()) {
        toast.galat('Transfer tanpa bukti wajib disertai catatan alasan.');
        return;
      }
    }

    const dataItems = items.map((item) => ({
      product_id: Number(item.product_id),
      qty: Number(item.qty),
      catatan: item.catatan,
      opsi: opsiTerpilih(item),
    }));
    const form = new FormData();
    form.set('sumber', sumber);
    form.set('tipe_pesanan', tipePesanan);
    form.set('nama_pelanggan', nama);
    form.set('no_hp', telepon);
    form.set('alamat', tipePesanan === 'antar' ? alamat : '');
    form.set('catatan', catatan);
    form.set('items', JSON.stringify(dataItems));
    if (metodeAwal !== 'tidak_ada') {
      form.set('pembayaran', JSON.stringify({
        metode: metodeAwal,
        jumlah: Number(jumlahBayar),
        channel: metodeAwal === 'transfer' ? channel : null,
        catatan: catatanBayar,
      }));
    }
    if (bukti) form.set('bukti', bukti);

    setSimpan(true);
    try {
      const dibuat = await permintaan('/orders/manual', { method: 'POST', body: form });
      toast.berhasil(`Pesanan ${dibuat.kode_pesanan} berhasil dicatat.`);
      navigate(`/pesanan/${dibuat.id}`);
    } catch (err) {
      toast.galat(err.message);
    } finally {
      setSimpan(false);
    }
  }

  return (
    <section className="admin-halaman">
      <header className="admin-kepala">
        <div><p className="admin-alis">OPERASIONAL</p><h2>Input manual</h2><p className="admin-subjudul">Catat pesanan dari WhatsApp, Facebook, atau pelanggan yang datang langsung.</p></div>
      </header>

      {galatProduk ? <div className="admin-galat" role="alert">{galatProduk} <Button variasi="sekunder" ukuran="sm" onClick={muatProduk}>Coba lagi</Button></div> : null}
      {memuatProduk ? <div className="admin-kosong">Memuat daftar produk…</div> : null}
      {!memuatProduk && !produk.length && !galatProduk ? <div className="admin-kosong">Belum ada produk aktif yang bisa dipesan.</div> : null}

      <form className={gaya.form} onSubmit={kirim}>
        <section className={gaya.kartu}>
          <div className={gaya.judulBagian}><span className={gaya.ikon}><ShoppingBag size={19} /></span><div><h3>Sumber pesanan</h3><p>Dari mana pesanan pelanggan diterima?</p></div></div>
          <OptionCard legenda="Sumber" nilai={sumber} onUbah={setSumber} opsi={SUMBER} />
        </section>

        <section className={gaya.kartu}>
          <div className={gaya.judulBagian}><span className={gaya.ikon}><ShoppingBag size={19} /></span><div><h3>Produk yang dipesan</h3><p>Pilih produk, atur opsi tambahan, dan jumlahnya.</p></div></div>
          <div className={gaya.daftarItem}>
            {items.map((item, indeks) => {
              const p = produk.find((x) => String(x.id) === String(item.product_id));
              return (
                <article className={gaya.item} key={item.id}>
                  <div className={gaya.kepalaItem}><strong>Produk {indeks + 1}</strong>{items.length > 1 ? <Button variasi="tautan" ukuran="sm" ikonKiri={<Trash2 size={15} />} onClick={() => hapusItem(item.id)}>Hapus</Button> : null}</div>
                  <Select label="Pilih produk" nilai={String(item.product_id)} onUbah={(v) => pilihProduk(item.id, v)} opsi={daftarProduk} placeholder="Pilih produk" nonaktif={memuatProduk || !produk.length} wajib />
                  {p ? <>
                    <div className={gaya.rincianProduk}><strong>{p.nama}</strong><span>{rupiah(p.harga)} / {p.satuan || 'porsi'}</span></div>
                    {p.grup?.length ? <GrupOpsi grup={p.grup} nilai={item.pilihan} teks={item.teks} onUbah={(id, nilai) => ubahItem(item.id, { pilihan: { ...item.pilihan, [id]: nilai } })} onUbahTeks={(id, idOpsi, nilai) => ubahItem(item.id, { teks: { ...item.teks, [id]: { ...item.teks[id], [idOpsi]: nilai } } })} /> : <p className={gaya.bantuan}>Produk ini tidak memiliki opsi tambahan.</p>}
                    <div className={gaya.gridItem}>
                      <Field kind="angka" label="Jumlah" nilai={item.qty} onUbah={(v) => ubahItem(item.id, { qty: v })} wajib min={1} maks={99} />
                      <Field kind="teks" label="Catatan produk" nilai={item.catatan} onUbah={(v) => ubahItem(item.id, { catatan: v })} maksKarakter={255} placeholder="Contoh: tanpa saus" />
                    </div>
                    <div className={gaya.subtotal}><span>Subtotal sementara</span><strong>{rupiah(hargaPerItem(item, produk))}</strong></div>
                  </> : null}
                </article>
              );
            })}
          </div>
          <Button variasi="sekunder" ikonKiri={<Plus size={17} />} onClick={tambahItem} nonaktif={memuatProduk || !produk.length}>Tambah produk</Button>
          <div className={gaya.total}><span>Perkiraan total pesanan</span><strong>{rupiah(total)}</strong><small>Total akhir dihitung ulang oleh server berdasarkan harga produk dan opsi yang tersimpan.</small></div>
        </section>

        <section className={gaya.kartu}>
          <div className={gaya.judulBagian}><span className={gaya.ikon}><ShoppingBag size={19} /></span><div><h3>Data pemesan</h3><p>Isi informasi pelanggan dan cara pesanan diterima.</p></div></div>
          <div className={gaya.gridDua}><Field kind="nama" label="Nama pemesan" nilai={nama} onUbah={setNama} wajib placeholder="Nama pelanggan" /><Field kind="telepon" label="Nomor WhatsApp" nilai={telepon} onUbah={setTelepon} wajib={sumber !== 'langsung'} bantuan={sumber === 'langsung' ? 'Boleh dikosongkan untuk pelanggan yang datang langsung.' : 'Nomor digunakan untuk menghubungi pelanggan.'} placeholder="0812 3456 7890" /></div>
          <OptionCard legenda="Cara menerima pesanan" nilai={tipePesanan} onUbah={setTipePesanan} opsi={TIPE} />
          {tipePesanan === 'antar' ? <Field kind="alamat" label="Alamat pengantaran" nilai={alamat} onUbah={setAlamat} wajib baris={3} maksKarakter={255} placeholder="Nama jalan, nomor rumah, kelurahan, dan patokan" /> : null}
          <Field kind="teks" label="Catatan pesanan" nilai={catatan} onUbah={setCatatan} baris={2} maksKarakter={500} placeholder="Catatan tambahan untuk seluruh pesanan (opsional)" />
        </section>

        <section className={gaya.kartu}>
          <div className={gaya.judulBagian}><span className={gaya.ikon}><Send size={19} /></span><div><h3>Pembayaran awal</h3><p>Catat pembayaran yang sudah diterima. Bagian ini boleh dilewati.</p></div></div>
          <OptionCard legenda="Status pembayaran awal" nilai={metodeAwal} onUbah={(v) => { setMetodeAwal(v); setJumlahBayar(''); setChannel(''); setBukti(null); setCatatanBayar(''); }} opsi={PEMBAYARAN} kolom={1} />
          {metodeAwal !== 'tidak_ada' ? <div className={gaya.bagianBayar}>
            <div className={gaya.gridDua}>
              <Field kind="rupiah" label="Jumlah diterima" nilai={jumlahBayar} onUbah={setJumlahBayar} wajib placeholder="Contoh: 50000" bantuan={`Maksimal ${rupiah(total)}.`} />
              {metodeAwal === 'transfer' ? <Select label="Channel transfer" nilai={channel} onUbah={setChannel} opsi={KANAL} placeholder="Pilih rekening" wajib /> : <div className={gaya.infoBayar}>Pembayaran tunai dicatat langsung sebagai diterima.</div>}
            </div>
            {metodeAwal === 'transfer' ? <>
              <Dropzone label="Bukti transfer" nilai={bukti} onUbah={setBukti} bantuan="Opsional. Jika bukti tidak tersedia, catatan alasan wajib diisi." />
              {!bukti ? <Field kind="teks" label="Catatan pembayaran" nilai={catatanBayar} onUbah={setCatatanBayar} baris={2} maksKarakter={255} wajib placeholder="Alasan bukti transfer tidak tersedia" /> : <Field kind="teks" label="Catatan pembayaran" nilai={catatanBayar} onUbah={setCatatanBayar} baris={2} maksKarakter={255} placeholder="Catatan tambahan (opsional)" />}
            </> : <Field kind="teks" label="Catatan pembayaran" nilai={catatanBayar} onUbah={setCatatanBayar} maksKarakter={255} placeholder="Catatan tambahan (opsional)" />}
          </div> : null}
        </section>

        <footer className={gaya.bawahForm}><p>Pastikan produk, jumlah, dan data pemesan sudah benar sebelum disimpan.</p><Button type="submit" ikonKanan={<Send size={17} />} memuat={simpan} nonaktif={simpan || memuatProduk || !produk.length}>Simpan pesanan</Button></footer>
      </form>
    </section>
  );
}
