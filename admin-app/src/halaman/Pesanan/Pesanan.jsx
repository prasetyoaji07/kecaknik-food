import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw, Eye } from 'lucide-react';
import { Badge, Button, DateField, Field, Select, Tab, TabelData, useToast } from '@kecaknik/shared/ui';
import { permintaan } from '../../api/klien.js';
import { rupiah, tanggal } from '@kecaknik/shared/core/format.js';

const OPSI_STATUS = [{ nilai: 'pending', label: 'Menunggu' }, { nilai: 'diproses', label: 'Diproses' }, { nilai: 'siap diambil', label: 'Siap diambil' }, { nilai: 'dikirim', label: 'Dikirim' }, { nilai: 'selesai', label: 'Selesai' }, { nilai: 'dibatalkan', label: 'Dibatalkan' }];
const OPSI_SUMBER = [{ nilai: 'website', label: 'Website' }, { nilai: 'whatsapp', label: 'WhatsApp' }, { nilai: 'facebook', label: 'Facebook' }, { nilai: 'langsung', label: 'Langsung' }];
const OPSI_BAYAR = [{ nilai: 'belum_dibayar', label: 'Belum dibayar' }, { nilai: 'uang_muka', label: 'Uang muka' }, { nilai: 'lunas', label: 'Lunas' }];
const LABEL_SUMBER = Object.fromEntries(OPSI_SUMBER.map((o) => [o.nilai, o.label]));

export default function Pesanan() {
  const toast = useToast();
  const [tab, setTab] = useState('aktif');
  const [filter, setFilter] = useState({ status: '', sumber: '', status_pembayaran: '', dari: '', sampai: '', q: '' });
  const [cari, setCari] = useState('');
  const [baris, setBaris] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');

  const muat = useCallback(async () => {
    setMemuat(true); setGalat('');
    const params = new URLSearchParams({ status: tab, batas: '200' });
    Object.entries(filter).forEach(([k, v]) => { if (v) params.set(k, v); });
    try { setBaris(await permintaan(`/orders?${params}`)); }
    catch (e) { setGalat(e.message); toast.galat(e.message); }
    finally { setMemuat(false); }
  }, [filter, tab, toast]);
  useEffect(() => { muat(); }, [muat]);

  const kolom = useMemo(() => [
    { kunci: 'kode_pesanan', label: 'Kode' },
    { kunci: 'nama_pelanggan', label: 'Pelanggan' },
    { kunci: 'created_at', label: 'Masuk', render: (v) => tanggal(v, { jam: true }) },
    { kunci: 'sumber', label: 'Sumber', render: (v) => LABEL_SUMBER[v] ?? v },
    { kunci: 'jumlah_item', label: 'Item', rata: 'kanan' },
    { kunci: 'total', label: 'Total', rata: 'kanan', render: (v) => rupiah(v) },
    { kunci: 'status', label: 'Status', render: (v, r) => <Badge jenis="status" nilai={v} tipePesanan={r.tipe_pesanan} /> },
    { kunci: 'status_pembayaran', label: 'Pembayaran', render: (v) => <Badge jenis="bayar" nilai={v} /> },
    { kunci: 'aksi', label: 'Detail', render: (_, r) => <Button as={Link} to={`/pesanan/${r.id}`} variasi="sekunder" ukuran="sm" ikonKiri={<Eye size={16} />}>Buka</Button> },
  ], []);
  function ubah(k, v) { setFilter((lama) => ({ ...lama, [k]: v })); }
  function terapkanCari(e) { e.preventDefault(); ubah('q', cari.trim()); }
  function resetFilter() { setFilter({ status: '', sumber: '', status_pembayaran: '', dari: '', sampai: '', q: '' }); setCari(''); }

  return (
    <section className="admin-halaman">
      <header className="admin-kepala"><div><p className="admin-alis">OPERASIONAL</p><h2>Pesanan</h2><p className="admin-subjudul">Pantau pesanan website dan pesanan yang dicatat admin.</p></div><Button variasi="sekunder" ukuran="sm" ikonKiri={<RefreshCw size={16} />} onClick={muat} memuat={memuat}>Muat ulang</Button></header>
      <Tab label="Kelompok pesanan" nilai={tab} onUbah={setTab} daftar={[{ nilai: 'aktif', label: 'Aktif' }, { nilai: 'riwayat', label: 'Riwayat' }]} />
      <form className="admin-filter" onSubmit={terapkanCari}>
        <div className="admin-cari"><Field kind="teks" label="Cari pesanan" tanpaPenghitung maksKarakter={255} nilai={cari} onUbah={setCari} placeholder="Kode, nama, atau nomor HP" /><Button type="submit" ikonKiri={<Search size={17} />}>Cari</Button></div>
        <div className="admin-grid-filter">
          <Select label="Status" nilai={filter.status} onUbah={(v) => ubah('status', v)} placeholder="Semua status" opsi={OPSI_STATUS} />
          <Select label="Sumber" nilai={filter.sumber} onUbah={(v) => ubah('sumber', v)} placeholder="Semua sumber" opsi={OPSI_SUMBER} />
          <Select label="Pembayaran" nilai={filter.status_pembayaran} onUbah={(v) => ubah('status_pembayaran', v)} placeholder="Semua pembayaran" opsi={OPSI_BAYAR} />
          <DateField label="Dari tanggal" nilai={filter.dari} onUbah={(v) => ubah('dari', v)} maks={filter.sampai || undefined} />
          <DateField label="Sampai tanggal" nilai={filter.sampai} onUbah={(v) => ubah('sampai', v)} min={filter.dari || undefined} />
        </div>
        <div className="admin-aksi-filter"><span>{memuat ? 'Memuat pesanan…' : `${baris.length} pesanan ditemukan`}</span><Button variasi="tautan" ukuran="sm" onClick={resetFilter}>Reset filter</Button></div>
      </form>
      {galat ? <div className="admin-galat" role="alert">{galat}</div> : null}
      {memuat ? <div className="admin-kosong">Memuat daftar pesanan…</div> : <TabelData label="Daftar pesanan" kolom={kolom} data={baris} kunci="id" kosong={tab === 'aktif' ? 'Belum ada pesanan aktif.' : 'Belum ada riwayat pesanan.'} />}
    </section>
  );
}
