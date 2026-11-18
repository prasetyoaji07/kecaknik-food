import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, ImagePlus, RefreshCw, Power } from 'lucide-react';
import {
  Button, Field, Select, Switch, Checkbox, DateField, Dropzone, Tab, Modal, useToast,
} from '@kecaknik/shared/ui';
import { kategoriProduk } from '@kecaknik/shared/core/konfigurasi.js';
import { rupiah } from '@kecaknik/shared/core/format.js';
import { permintaan, API } from '../api/klien.js';
import gaya from './Produk.module.css';

const labelKategori = { kue: 'Kue', 'puding-salad': 'Puding & Salad', gorengan: 'Gorengan', lainnya: 'Lainnya' };
const OPSI_FILTER = [
  { nilai: 'semua', label: 'Semua status' },
  { nilai: 'aktif', label: 'Aktif' },
  { nilai: 'nonaktif', label: 'Nonaktif' },
];
const OPSI_TIPE = [
  { nilai: 'pilih_satu', label: 'Pilih satu' },
  { nilai: 'pilih_banyak', label: 'Pilih banyak' },
];
const OPSI_KATEGORI = kategoriProduk.map((k) => ({ nilai: k, label: labelKategori[k] || k }));
const TAB_EDITOR = [
  { nilai: 'produk', label: 'Informasi produk' },
  { nilai: 'opsi', label: 'Opsi tambahan' },
];
// Radix Select tidak menerima nilai kosong, jadi "Selalu tampil" memakai penanda ini.
const SELALU = '__selalu';

const produkKosong = () => ({ nama: '', harga: '', kategori: 'kue', satuan: 'pcs', aktif: true, is_preorder: false, tanggal_buka: '', tanggal_tutup: '', tanggal_ambil: '' });
const grupKosong = () => ({ kunci: `g-${Date.now()}-${Math.random()}`, nama: '', tipe: 'pilih_satu', wajib: false, min_pilih: 0, max_pilih: '', muncul_setelah: '', opsi: [{ nama: '', harga_tambah: 0, butuh_teks: false, label_teks: '', aktif: true }] });
const opsiKosong = () => ({ nama: '', harga_tambah: 0, butuh_teks: false, label_teks: '', aktif: true });
const angkaTampil = (v) => (Number(v) ? String(v) : '');

export default function Produk() {
  const toast = useToast();
  const editorRef = useRef(null);
  const [daftar, setDaftar] = useState([]);
  const [muat, setMuat] = useState(true);
  const [galat, setGalat] = useState('');
  const [cari, setCari] = useState('');
  const [filter, setFilter] = useState('semua');
  const [terpilih, setTerpilih] = useState(null);
  const [form, setForm] = useState(produkKosong());
  const [foto, setFoto] = useState(null);
  const [grup, setGrup] = useState([]);
  const [simpan, setSimpan] = useState(false);
  const [mode, setMode] = useState('produk');
  const [akanHapus, setAkanHapus] = useState(null);

  const muatProduk = useCallback(async () => {
    setMuat(true); setGalat('');
    try { setDaftar(await permintaan('/products/semua')); }
    catch (e) { setGalat(e.message); }
    finally { setMuat(false); }
  }, []);
  useEffect(() => { muatProduk(); }, [muatProduk]);

  const terlihat = useMemo(() => daftar.filter((p) => {
    const cocok = p.nama.toLowerCase().includes(cari.toLowerCase());
    return cocok && (filter === 'semua' || (filter === 'aktif' ? p.aktif : !p.aktif));
  }), [daftar, cari, filter]);

  const gambarTersimpan = useMemo(() => {
    const p = daftar.find((x) => x.id === terpilih);
    return p?.gambar ? `${API}/uploads/produk/${encodeURIComponent(p.gambar)}` : '';
  }, [daftar, terpilih]);

  function keEditor() {
    if (!window.matchMedia('(max-width: 1023px)').matches) return;
    const kurangGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    editorRef.current?.scrollIntoView({ behavior: kurangGerak ? 'auto' : 'smooth', block: 'start' });
  }
  function baru() { setTerpilih(null); setForm(produkKosong()); setFoto(null); setGrup([]); setMode('produk'); keEditor(); }
  function edit(p) {
    setTerpilih(p.id); setForm({ nama: p.nama, harga: String(p.harga), kategori: p.kategori, satuan: p.satuan || 'pcs', aktif: p.aktif, is_preorder: p.is_preorder, tanggal_buka: p.tanggal_buka?.slice(0, 10) || '', tanggal_tutup: p.tanggal_tutup?.slice(0, 10) || '', tanggal_ambil: p.tanggal_ambil?.slice(0, 10) || '' });
    setFoto(null); setGrup((p.grup || []).map((g) => ({ kunci: String(g.id), id: g.id, nama: g.nama, tipe: g.tipe, wajib: g.wajib, min_pilih: g.min_pilih, max_pilih: g.max_pilih ?? '', muncul_setelah: g.muncul_setelah_grup_id ? String(g.muncul_setelah_grup_id) : '', opsi: g.opsi.map((o) => ({ ...o, harga_tambah: String(o.harga_tambah) })) }))); setMode('produk');
    keEditor();
  }
  function ubah(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function pilihTab(nilai) {
    if (nilai === 'opsi' && !terpilih) { toast.galat('Simpan produk terlebih dahulu sebelum mengatur opsi.'); return; }
    setMode(nilai);
  }

  async function simpanProduk(e) {
    e.preventDefault(); setSimpan(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.set(k, typeof v === 'boolean' ? String(v) : v));
      if (foto) body.set('foto', foto);
      const hasil = await permintaan(terpilih ? `/products/${terpilih}` : '/products', { method: terpilih ? 'PUT' : 'POST', body });
      setTerpilih(hasil.id); setFoto(null); toast.berhasil('Data produk berhasil disimpan.'); await muatProduk();
    } catch (e2) { toast.galat(e2.message); }
    finally { setSimpan(false); }
  }

  async function simpanOpsi(e) {
    e.preventDefault(); if (!terpilih) { toast.galat('Simpan produk terlebih dahulu sebelum mengatur opsi.'); return; }
    setSimpan(true);
    try {
      const payload = { grup: grup.map((g) => ({ ...g, muncul_setelah: g.muncul_setelah || null, opsi: g.opsi.map((o) => ({ ...o, harga_tambah: Number(o.harga_tambah || 0) })) })) };
      const hasil = await permintaan(`/products/${terpilih}/opsi`, { method: 'PUT', body: payload });
      setGrup((hasil.grup || []).map((g) => ({ ...g, kunci: String(g.id), muncul_setelah: g.muncul_setelah_grup_id ? String(g.muncul_setelah_grup_id) : '', opsi: g.opsi.map((o) => ({ ...o, harga_tambah: String(o.harga_tambah) })) })));
      toast.berhasil('Editor opsi berhasil disimpan.'); await muatProduk();
    } catch (e2) { toast.galat(e2.message); }
    finally { setSimpan(false); }
  }

  async function toggleAktif(p) {
    try { await permintaan(`/products/${p.id}/aktif`, { method: 'PATCH', body: { aktif: !p.aktif } }); toast.berhasil(`Produk ${p.aktif ? 'dinonaktifkan' : 'diaktifkan'}.`); await muatProduk(); }
    catch (e) { toast.galat(e.message); }
  }
  async function hapus() {
    const p = akanHapus; setAkanHapus(null); if (!p) return;
    try { await permintaan(`/products/${p.id}`, { method: 'DELETE' }); toast.berhasil('Produk berhasil dihapus.'); if (terpilih === p.id) baru(); await muatProduk(); }
    catch (e) { toast.galat(e.message); }
  }

  function ubahGrup(i, patch) { setGrup((a) => a.map((g, n) => n === i ? { ...g, ...patch } : g)); }
  function ubahOpsi(gi, oi, patch) { setGrup((a) => a.map((g, i) => i === gi ? { ...g, opsi: g.opsi.map((o, j) => j === oi ? { ...o, ...patch } : o) } : g)); }

  return (
    <section className="admin-halaman">
      <header className="admin-kepala">
        <div>
          <p className="admin-alis">KATALOG</p>
          <h2>Kelola produk</h2>
          <p className="admin-subjudul">Atur katalog, harga, foto, status, pre-order, dan opsi tambahan produk.</p>
        </div>
        <Button onClick={baru} ikonKiri={<Plus size={16} />}>Produk baru</Button>
      </header>

      <div className={gaya.toolbar}>
        <Field kind="teks" label="Cari produk" tanpaPenghitung maksKarakter={100} nilai={cari} onUbah={setCari} placeholder="Cari nama produk…" />
        <Select label="Status" nilai={filter} onUbah={setFilter} opsi={OPSI_FILTER} />
        <Button variasi="sekunder" onClick={muatProduk} ikonKiri={<RefreshCw size={16} />}>Muat ulang</Button>
      </div>

      {galat && (
        <div className="admin-galat" role="alert">
          {galat} <Button variasi="sekunder" ukuran="sm" onClick={muatProduk}>Coba lagi</Button>
        </div>
      )}

      <div className={gaya.layout}>
        <div className={gaya.daftar}>
          {muat ? <div className="admin-kosong">Memuat produk…</div>
            : terlihat.length === 0 ? <div className="admin-kosong">Tidak ada produk yang cocok.</div>
              : terlihat.map((p) => (
                <article key={p.id} className={`${gaya.baris} ${terpilih === p.id ? gaya.dipilih : ''}`}>
                  <div className={gaya.fotoKecil}>
                    {p.gambar ? <img src={`${API}/uploads/produk/${encodeURIComponent(p.gambar)}`} alt={p.nama} /> : <ImagePlus aria-hidden="true" />}
                  </div>
                  <div className={gaya.info}>
                    <strong>{p.nama}</strong>
                    <span>{labelKategori[p.kategori] || p.kategori} · {p.satuan || '—'}</span>
                    <b>{rupiah(p.harga)}</b>
                    <small>{p.is_preorder ? 'Pre-order' : 'Produk reguler'} · {p.aktif ? 'Aktif' : 'Nonaktif'}</small>
                  </div>
                  <div className={gaya.aksi}>
                    <Button variasi="sekunder" ukuran="sm" aria-label={`Edit ${p.nama}`} title="Edit produk" ikonKiri={<Pencil size={16} />} onClick={() => edit(p)} />
                    <Button variasi="sekunder" ukuran="sm" ikonKiri={<Power size={16} />} onClick={() => toggleAktif(p)}>{p.aktif ? 'Nonaktifkan' : 'Aktifkan'}</Button>
                    <Button variasi="bahaya" ukuran="sm" aria-label={`Hapus ${p.nama}`} title="Hapus produk" ikonKiri={<Trash2 size={16} />} onClick={() => setAkanHapus(p)} />
                  </div>
                </article>
              ))}
        </div>

        <div className={gaya.editor} ref={editorRef}>
          <Tab daftar={TAB_EDITOR} nilai={mode} onUbah={pilihTab} label="Bagian editor produk" />
          {mode === 'produk' ? (
            <form onSubmit={simpanProduk} className={gaya.form}>
              <h3>{terpilih ? 'Edit produk' : 'Tambah produk'}</h3>
              <Field kind="teks" label="Nama produk" wajib required maksKarakter={100} nilai={form.nama} onUbah={(v) => ubah('nama', v)} placeholder="Contoh: Risol Mayo" />
              <div className={gaya.dua}>
                <Select label="Kategori" nilai={form.kategori} onUbah={(v) => ubah('kategori', v)} opsi={OPSI_KATEGORI} />
                <Field kind="teks" label="Satuan" maksKarakter={50} nilai={form.satuan} onUbah={(v) => ubah('satuan', v)} placeholder="pcs, box, cup" />
              </div>
              <Field kind="rupiah" label="Harga (rupiah)" wajib required nilai={form.harga} onUbah={(v) => ubah('harga', v)} placeholder="15000" />
              <Dropzone label="Foto produk" nilai={foto} onUbah={setFoto} urlAwal={gambarTersimpan} />
              <Switch label="Produk aktif" deskripsi="Tampil di katalog pelanggan." nilai={form.aktif} onUbah={(v) => ubah('aktif', v)} />
              <Switch label="Produk pre-order" deskripsi="Dijual dengan jadwal buka, tutup, dan pengambilan." nilai={form.is_preorder} onUbah={(v) => ubah('is_preorder', v)} />
              {form.is_preorder && (
                <div className={gaya.tanggal}>
                  <DateField label="Tanggal buka" wajib required nilai={form.tanggal_buka} onUbah={(v) => ubah('tanggal_buka', v)} />
                  <DateField label="Tanggal tutup" wajib required nilai={form.tanggal_tutup} onUbah={(v) => ubah('tanggal_tutup', v)} />
                  <DateField label="Tanggal pengambilan" wajib required nilai={form.tanggal_ambil} onUbah={(v) => ubah('tanggal_ambil', v)} />
                </div>
              )}
              <Button type="submit" penuh memuat={simpan} ikonKiri={<Save size={16} />}>{simpan ? 'Menyimpan…' : 'Simpan produk'}</Button>
            </form>
          ) : (
            <form onSubmit={simpanOpsi} className={gaya.form}>
              <h3>Editor opsi tambahan</h3>
              <p className={gaya.hint}>Atur pilihan ukuran, rasa, topping, dan catatan teks untuk produk ini. Maksimal 10 grup dan 30 opsi per grup.</p>
              {grup.map((g, i) => (
                <section className={gaya.grup} key={g.kunci}>
                  <header>
                    <strong>Grup {i + 1}</strong>
                    <Button variasi="bahaya" ukuran="sm" ikonKiri={<Trash2 size={15} />} onClick={() => setGrup((a) => a.filter((_, n) => n !== i))}>Hapus grup</Button>
                  </header>
                  <Field kind="teks" label="Nama grup" wajib required maksKarakter={100} nilai={g.nama} onUbah={(v) => ubahGrup(i, { nama: v })} placeholder="Contoh: Pilih rasa" />
                  <div className={gaya.dua}>
                    <Select label="Tipe pilihan" nilai={g.tipe} onUbah={(v) => ubahGrup(i, { tipe: v })} opsi={OPSI_TIPE} />
                    <Checkbox label="Wajib dipilih" terpilih={g.wajib} onUbah={(v) => ubahGrup(i, { wajib: v })} className={gaya.cek} />
                  </div>
                  {g.tipe === 'pilih_banyak' && (
                    <div className={gaya.dua}>
                      <Field kind="angka" label="Minimal pilih" min={0} maks={30} nilai={String(g.min_pilih ?? '')} onUbah={(v) => ubahGrup(i, { min_pilih: v })} />
                      <Field kind="angka" label="Maksimal pilih" min={1} maks={30} nilai={String(g.max_pilih ?? '')} onUbah={(v) => ubahGrup(i, { max_pilih: v })} placeholder="Tidak dibatasi" />
                    </div>
                  )}
                  <Select
                    label="Tampilkan setelah grup"
                    nilai={g.muncul_setelah || SELALU}
                    onUbah={(v) => ubahGrup(i, { muncul_setelah: v === SELALU ? '' : v })}
                    opsi={[{ nilai: SELALU, label: 'Selalu tampil' }, ...grup.slice(0, i).map((x, j) => ({ nilai: x.kunci, label: `Grup ${j + 1}: ${x.nama || '(belum diberi nama)'}` }))]}
                  />
                  {g.opsi.map((o, j) => (
                    <div className={gaya.opsi} key={j}>
                      <div className={gaya.opsiKepala}>
                        <b>Opsi {j + 1}</b>
                        <Button variasi="sekunder" ukuran="sm" aria-label={`Hapus opsi ${j + 1}`} nonaktif={g.opsi.length === 1} ikonKiri={<X size={14} />} onClick={() => ubahGrup(i, { opsi: g.opsi.filter((_, n) => n !== j) })} />
                      </div>
                      <div className={gaya.dua}>
                        <Field kind="teks" label="Nama opsi" wajib required maksKarakter={100} nilai={o.nama} onUbah={(v) => ubahOpsi(i, j, { nama: v })} />
                        <Field kind="rupiah" label="Harga tambahan" nilai={angkaTampil(o.harga_tambah)} onUbah={(v) => ubahOpsi(i, j, { harga_tambah: v })} placeholder="0" />
                      </div>
                      <Checkbox label="Opsi aktif" terpilih={o.aktif} onUbah={(v) => ubahOpsi(i, j, { aktif: v })} />
                      <Checkbox label="Memerlukan isian teks" terpilih={o.butuh_teks} onUbah={(v) => ubahOpsi(i, j, { butuh_teks: v, label_teks: o.butuh_teks ? o.label_teks : 'Tulis keterangan' })} />
                      {o.butuh_teks && <Field kind="teks" label="Label isian teks" wajib required maksKarakter={100} nilai={o.label_teks || ''} onUbah={(v) => ubahOpsi(i, j, { label_teks: v })} />}
                    </div>
                  ))}
                  <Button variasi="sekunder" ukuran="sm" ikonKiri={<Plus size={14} />} onClick={() => ubahGrup(i, { opsi: [...g.opsi, opsiKosong()] })}>Tambah opsi</Button>
                </section>
              ))}
              <Button variasi="sekunder" ikonKiri={<Plus size={16} />} onClick={() => setGrup((a) => [...a, grupKosong()])} nonaktif={grup.length >= 10}>Tambah grup opsi</Button>
              <Button type="submit" penuh memuat={simpan} ikonKiri={<Save size={16} />}>{simpan ? 'Menyimpan…' : 'Simpan opsi'}</Button>
            </form>
          )}
        </div>
      </div>

      <Modal
        buka={Boolean(akanHapus)}
        onTutup={() => setAkanHapus(null)}
        judul="Hapus produk?"
        deskripsi={akanHapus ? `Hapus produk “${akanHapus.nama}”? Grup opsi produk ini juga akan dihapus.` : ''}
        footer={(
          <>
            <Button variasi="sekunder" onClick={() => setAkanHapus(null)}>Batal</Button>
            <Button variasi="bahaya" ikonKiri={<Trash2 size={16} />} onClick={hapus}>Hapus</Button>
          </>
        )}
      >
        <p>Tindakan ini tidak bisa dibatalkan.</p>
      </Modal>
    </section>
  );
}
