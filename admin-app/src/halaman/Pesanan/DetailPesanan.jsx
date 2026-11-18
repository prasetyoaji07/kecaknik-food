import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, CreditCard, Ban, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Badge, Button, Dropzone, Field, Modal, PetaRute, Select, TombolWa, useToast } from '@kecaknik/shared/ui';
import { toko } from '@kecaknik/shared/core/konfigurasi.js';
import { permintaan, API } from '../../api/klien.js';
import { rupiah, tanggal } from '@kecaknik/shared/core/format.js';
import { transisiTersedia, transisiBarisTersedia, labelBarisPembayaran, labelStatus } from '@kecaknik/shared/core/statusPesanan.js';
import gaya from './DetailPesanan.module.css';

const CHANNEL = [{ nilai: 'dana', label: 'DANA' }, { nilai: 'bca', label: 'BCA' }, { nilai: 'bri', label: 'BRI' }, { nilai: 'gopay', label: 'GoPay' }];
const METODE = [{ nilai: 'tunai', label: 'Tunai' }, { nilai: 'transfer', label: 'Transfer' }];
const formatWaktu = (v) => tanggal(v, { jam: true }) || '—';

export default function DetailPesanan() {
  const { id } = useParams();
  const toast = useToast();
  const [pesanan, setPesanan] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [modal, setModal] = useState('');
  const [statusTujuan, setStatusTujuan] = useState('');
  const [alasan, setAlasan] = useState('');
  const [metode, setMetode] = useState('tunai');
  const [channel, setChannel] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [catatan, setCatatan] = useState('');
  const [bukti, setBukti] = useState(null);
  const [barisAktif, setBarisAktif] = useState(null);
  const [aksiBayar, setAksiBayar] = useState('diterima');
  const [jumlahVerifikasi, setJumlahVerifikasi] = useState('');
  const [catatanVerifikasi, setCatatanVerifikasi] = useState('');
  const [simpan, setSimpan] = useState(false);

  const muat = useCallback(async () => {
    setMemuat(true);
    try { setPesanan(await permintaan(`/orders/${id}`)); }
    catch (e) { toast.galat(e.message); }
    finally { setMemuat(false); }
  }, [id, toast]);
  useEffect(() => { muat(); }, [muat]);

  const statusTersedia = useMemo(() => pesanan ? transisiTersedia(pesanan.status, pesanan.tipe_pesanan) : [], [pesanan]);
  const urlGoogle = pesanan?.lat !== null && pesanan?.lat !== undefined && pesanan?.lng !== null && pesanan?.lng !== undefined
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${pesanan.lat},${pesanan.lng}`)}` : '';

  async function ubahStatus() {
    if (!statusTujuan) return;
    if (statusTujuan === 'dibatalkan' && !alasan.trim()) { toast.galat('Alasan pembatalan wajib diisi.'); return; }
    setSimpan(true);
    try {
      const terbaru = await permintaan(`/orders/${id}/status`, { method: 'PATCH', body: { status: statusTujuan, alasan_batal: alasan.trim() } });
      setPesanan(terbaru); setModal(''); setAlasan(''); setStatusTujuan(''); toast.berhasil('Status pesanan diperbarui.');
    } catch (e) { toast.galat(e.message); }
    finally { setSimpan(false); }
  }

  async function catatPembayaran(e) {
    e.preventDefault();
    const nominal = Number(String(jumlah).replace(/\D/g, ''));
    if (!Number.isInteger(nominal) || nominal <= 0) { toast.galat('Jumlah pembayaran harus lebih dari nol.'); return; }
    if (metode === 'transfer' && !channel) { toast.galat('Pilih channel transfer.'); return; }
    if (metode === 'transfer' && !bukti && !catatan.trim()) { toast.galat('Transfer tanpa bukti wajib disertai catatan alasan.'); return; }
    const body = new FormData();
    body.append('metode', metode); body.append('jumlah', String(nominal));
    if (metode === 'transfer') body.append('channel', channel);
    if (catatan.trim()) body.append('catatan', catatan.trim());
    if (bukti) body.append('bukti', bukti);
    setSimpan(true);
    try {
      const terbaru = await permintaan(`/orders/${id}/pembayaran`, { method: 'POST', body });
      setPesanan(terbaru); setModal(''); setJumlah(''); setCatatan(''); setBukti(null); setChannel(''); setMetode('tunai'); toast.berhasil('Pembayaran berhasil dicatat.');
    } catch (e) { toast.galat(e.message); }
    finally { setSimpan(false); }
  }

  async function verifikasiPembayaran(e) {
    e.preventDefault();
    if (!barisAktif) return;
    if (aksiBayar !== 'diterima' && !catatanVerifikasi.trim()) { toast.galat('Catatan wajib diisi untuk menolak atau mengembalikan pembayaran.'); return; }
    const body = { status: aksiBayar, catatan: catatanVerifikasi.trim() };
    if (aksiBayar === 'diterima' && jumlahVerifikasi.trim()) body.jumlah = Number(jumlahVerifikasi.replace(/\D/g, ''));
    setSimpan(true);
    try {
      const terbaru = await permintaan(`/pembayaran/${barisAktif.id}`, { method: 'PATCH', body });
      setPesanan(terbaru); setModal(''); setBarisAktif(null); setCatatanVerifikasi(''); setJumlahVerifikasi(''); toast.berhasil(`Pembayaran ditandai ${labelBarisPembayaran(aksiBayar).toLowerCase()}.`);
    } catch (e) { toast.galat(e.message); }
    finally { setSimpan(false); }
  }

  function bukaVerifikasi(p, tujuan) {
    setBarisAktif(p); setAksiBayar(tujuan); setJumlahVerifikasi(String(p.jumlah)); setCatatanVerifikasi(p.catatan ?? ''); setModal('verifikasi');
  }

  if (memuat) return <div className="admin-kosong">Memuat detail pesanan…</div>;
  if (!pesanan) return <section className="admin-halaman"><p>Pesanan tidak ditemukan atau tidak dapat dimuat.</p><Button as={Link} to="/pesanan" variasi="sekunder" ikonKiri={<ArrowLeft size={17} />}>Kembali ke pesanan</Button></section>;

  return (
    <section className="admin-halaman">
      <header className="admin-kepala admin-kepala-detail">
        <div><Button as={Link} to="/pesanan" variasi="tautan" ukuran="sm" ikonKiri={<ArrowLeft size={17} />}>Kembali ke daftar</Button><p className="admin-alis">DETAIL PESANAN</p><h2>{pesanan.kode_pesanan}</h2><p className="admin-subjudul">Dibuat {formatWaktu(pesanan.created_at)}</p></div>
        <div className={gaya.badgeKepala}><Badge jenis="status" nilai={pesanan.status} tipePesanan={pesanan.tipe_pesanan} /><Badge jenis="bayar" nilai={pesanan.status_pembayaran} /></div>
      </header>

      <div className={gaya.grid}>
        <div className={gaya.kolom}>
          <section className={gaya.kartu}><div className={gaya.kepalaKartu}><h3>Rincian pesanan</h3><Badge jenis="tipe" nilai={pesanan.tipe_pesanan} /></div>
            <div className={gaya.items}>{pesanan.items?.map((item) => <article className={gaya.item} key={item.id}><div className={gaya.itemAtas}><div><strong>{item.nama}</strong><span className={gaya.rincian}>{item.qty} × {rupiah(Number(item.harga) + Number(item.harga_opsi))}</span></div><strong>{rupiah(item.subtotal)}</strong></div>
              {item.opsi?.length ? <div className={gaya.chips}>{item.opsi.map((o, i) => <span className={gaya.chip} key={`${o.nama_grup}-${i}`}>{o.nama_grup}: {o.nama_opsi}{o.teks ? ` · ${o.teks}` : ''}</span>)}</div> : null}
              {item.catatan ? <p className={gaya.catatanItem}>Catatan: {item.catatan}</p> : null}
            </article>)}</div>
            {pesanan.catatan ? <p className={gaya.catatanUmum}><strong>Catatan pesanan:</strong> {pesanan.catatan}</p> : null}
            <div className={gaya.total}><span>Total pesanan</span><strong>{rupiah(pesanan.total)}</strong></div>
          </section>

          <section className={gaya.kartu}><h3>Data pelanggan</h3><dl className={gaya.data}><div><dt>Nama</dt><dd>{pesanan.nama_pelanggan}</dd></div><div><dt>WhatsApp</dt><dd>{pesanan.no_hp || 'Tidak tersedia'}</dd></div><div><dt>Sumber</dt><dd>{pesanan.sumber}</dd></div>{pesanan.tanggal_ambil ? <div><dt>Tanggal ambil</dt><dd>{tanggal(pesanan.tanggal_ambil)}</dd></div> : null}{pesanan.tipe_pesanan === 'antar' ? <div className={gaya.alamat}><dt>Alamat antar</dt><dd>{pesanan.alamat || 'Alamat tidak tersedia'}</dd></div> : null}</dl>
            {pesanan.tipe_pesanan === 'antar' ? <><PetaRute toko={toko} lokasi={{ lat: pesanan.lat, lng: pesanan.lng }} status={pesanan.status} tinggi="15rem" /><div className={gaya.aksiPeta}>{urlGoogle ? <Button as="a" href={urlGoogle} target="_blank" rel="noreferrer" variasi="sekunder" ukuran="sm" ikonKiri={<ExternalLink size={16} />}>Buka rute di Google Maps</Button> : <span>Koordinat tujuan belum tersedia.</span>}</div></> : null}
          </section>

          <section className={gaya.kartu}><div className={gaya.kepalaKartu}><h3>Pesan ke pelanggan</h3><span className={gaya.teksLembut}>WhatsApp</span></div><TombolWa arah="admin" pesanan={pesanan} /></section>
        </div>

        <aside className={gaya.kolom}>
          <section className={gaya.kartu}><h3>Progres pembayaran</h3><div className={gaya.progres}><div><span>Total tagihan</span><strong>{rupiah(pesanan.total)}</strong></div><div><span>Sudah diterima</span><strong>{rupiah(pesanan.jumlah_dibayar)}</strong></div><div><span>Sisa pembayaran</span><strong>{rupiah(pesanan.sisa)}</strong></div></div><Badge jenis="bayar" nilai={pesanan.status_pembayaran} /><Button penuh ikonKiri={<CreditCard size={17} />} onClick={() => { setModal('catat'); setJumlah(String(pesanan.sisa || '')); }}>Catat pembayaran</Button></section>

          <section className={gaya.kartu}><div className={gaya.kepalaKartu}><h3>Riwayat pembayaran</h3><span className={gaya.teksLembut}>{pesanan.pembayaran?.length ?? 0} transaksi</span></div>
            {!pesanan.pembayaran?.length ? <p className={gaya.teksLembut}>Belum ada pembayaran tercatat.</p> : <div className={gaya.riwayat}>{pesanan.pembayaran.map((p) => <article className={gaya.bayar} key={p.id}><div className={gaya.itemAtas}><div><strong>{p.metode === 'transfer' ? `Transfer ${p.channel?.toUpperCase() ?? ''}` : 'Tunai'}</strong><span className={gaya.rincian}>{formatWaktu(p.created_at)} · {p.dicatat_oleh === 'admin' ? 'Admin' : 'Pelanggan'}</span></div><strong>{rupiah(p.jumlah)}</strong></div><span className={gaya.statusBaris}>{labelBarisPembayaran(p.status)}</span>{p.catatan ? <p className={gaya.catatanItem}>{p.catatan}</p> : null}{p.bukti_url ? <a className={gaya.bukti} href={`${API}${p.bukti_url}`} target="_blank" rel="noreferrer"><img src={`${API}${p.bukti_url}`} alt="Bukti pembayaran" /><span>Lihat bukti pembayaran</span></a> : null}
                {transisiBarisTersedia(p.status).length ? <div className={gaya.aksiBayar}>{transisiBarisTersedia(p.status).map((tujuan) => <Button key={tujuan} ukuran="sm" variasi={tujuan === 'ditolak' || tujuan === 'dikembalikan' ? 'bahaya' : 'sekunder'} ikonKiri={tujuan === 'diterima' ? <CheckCircle2 size={15} /> : tujuan === 'ditolak' ? <XCircle size={15} /> : <RotateCcw size={15} />} onClick={() => bukaVerifikasi(p, tujuan)}>{tujuan === 'diterima' ? 'Terima' : tujuan === 'ditolak' ? 'Tolak' : 'Kembalikan'}</Button>)}</div> : null}
              </article>)}</div>}
          </section>

          <section className={gaya.kartu}><h3>Perbarui status pesanan</h3><p className={gaya.teksLembut}>Alur yang tersedia mengikuti jenis pesanan dan status saat ini.</p><div className={gaya.aksiStatus}>{statusTersedia.filter((s) => s !== 'dibatalkan').map((s) => <Button key={s} penuh onClick={() => { setStatusTujuan(s); setModal('status'); }}>{s === 'diproses' ? 'Mulai proses' : s === 'siap diambil' ? 'Siap diambil' : s === 'dikirim' ? 'Kirim pesanan' : 'Tandai selesai'} <span aria-hidden="true">→</span></Button>)}</div>{statusTersedia.includes('dibatalkan') ? <Button penuh variasi="bahaya" ikonKiri={<Ban size={17} />} onClick={() => { setStatusTujuan('dibatalkan'); setModal('status'); }}>Batalkan pesanan</Button> : null}{pesanan.status === 'dibatalkan' ? <p className={gaya.alasanBatal}>Alasan pembatalan: {pesanan.alasan_batal || '—'}</p> : null}</section>
        </aside>
      </div>

      <Modal buka={modal === 'status'} onTutup={() => setModal('')} judul={statusTujuan === 'dibatalkan' ? 'Batalkan pesanan' : 'Konfirmasi perubahan status'} deskripsi={statusTujuan === 'dibatalkan' ? 'Alasan pembatalan wajib dicatat.' : `Status pesanan akan diubah menjadi ${labelStatus(statusTujuan, pesanan.tipe_pesanan)}.`} footer={<><Button variasi="sekunder" onClick={() => setModal('')}>Kembali</Button><Button variasi={statusTujuan === 'dibatalkan' ? 'bahaya' : 'primer'} memuat={simpan} onClick={ubahStatus}>Simpan status</Button></>}>
        {statusTujuan === 'dibatalkan' ? <Field kind="teks" label="Alasan pembatalan" nilai={alasan} onUbah={setAlasan} baris={3} wajib maksKarakter={255} placeholder="Tuliskan alasan yang jelas" /> : <p>Pastikan pesanan siap dipindahkan ke tahap berikutnya.</p>}
      </Modal>

      <Modal buka={modal === 'catat'} onTutup={() => setModal('')} judul="Catat pembayaran" deskripsi="Pembayaran yang dicatat admin langsung berstatus diterima." footer={<><Button variasi="sekunder" onClick={() => setModal('')}>Batal</Button><Button type="submit" form="form-bayar" memuat={simpan}>Simpan pembayaran</Button></>}>
        <form id="form-bayar" className={gaya.formModal} onSubmit={catatPembayaran}><Select label="Metode pembayaran" nilai={metode} onUbah={setMetode} opsi={METODE} /><Field kind="rupiah" label="Jumlah diterima" nilai={jumlah} onUbah={setJumlah} wajib placeholder="Contoh: 50000" />{metode === 'transfer' ? <><Select label="Channel transfer" nilai={channel} onUbah={setChannel} opsi={CHANNEL} placeholder="Pilih rekening" wajib /><Dropzone label="Bukti transfer" nilai={bukti} onUbah={setBukti} bantuan="Jika bukti tidak tersedia, isi catatan alasan di bawah." /></> : null}<Field kind="teks" label="Catatan" nilai={catatan} onUbah={setCatatan} baris={2} maksKarakter={255} placeholder="Catatan tambahan (opsional)" /></form>
      </Modal>

      <Modal buka={modal === 'verifikasi'} onTutup={() => setModal('')} judul={`${aksiBayar === 'diterima' ? 'Terima' : aksiBayar === 'ditolak' ? 'Tolak' : 'Kembalikan'} pembayaran`} deskripsi="Perubahan status pembayaran akan memperbarui ringkasan pembayaran pesanan." footer={<><Button variasi="sekunder" onClick={() => setModal('')}>Batal</Button><Button variasi={aksiBayar === 'diterima' ? 'primer' : 'bahaya'} type="submit" form="form-verifikasi" memuat={simpan}>Konfirmasi</Button></>}>
        <form id="form-verifikasi" className={gaya.formModal} onSubmit={verifikasiPembayaran}>{aksiBayar === 'diterima' ? <Field kind="rupiah" label="Jumlah diterima" nilai={jumlahVerifikasi} onUbah={setJumlahVerifikasi} bantuan="Boleh koreksi jumlah jika nominal pada bukti berbeda." /> : null}<Field kind="teks" label="Catatan" nilai={catatanVerifikasi} onUbah={setCatatanVerifikasi} baris={3} maksKarakter={255} wajib={aksiBayar !== 'diterima'} placeholder={aksiBayar === 'ditolak' ? 'Alasan bukti ditolak' : 'Catatan verifikasi'} /></form>
      </Modal>
    </section>
  );
}
