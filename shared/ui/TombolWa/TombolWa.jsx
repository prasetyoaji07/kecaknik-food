import { useEffect, useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { toko } from '../../core/konfigurasi.js';
import { buatPesanAdmin, buatPesanPelanggan, linkWa, pilihTemplatAdmin, TEMPLAT_ADMIN } from '../../core/wa.js';
import { Button } from '../Button/Button.jsx';
import { Select } from '../Select/Select.jsx';
import gaya from './TombolWa.module.css';

/** Tautan WhatsApp berisi pesan pesanan. Pengiriman tetap dilakukan manual oleh pengguna. */
export function TombolWa({
  pesanan,
  arah = 'pelanggan',
  nomor,
  className,
  label,
}) {
  const admin = arah === 'admin';
  const nomorTujuan = nomor ?? (admin ? pesanan?.no_hp : toko.waAdmin);
  const [templat, setTemplat] = useState(() => pilihTemplatAdmin(pesanan ?? {}));
  useEffect(() => {
    setTemplat(pilihTemplatAdmin(pesanan ?? {}));
  }, [pesanan]);
  const pesan = useMemo(() => {
    if (!pesanan) return '';
    return admin ? buatPesanAdmin(pesanan, templat) : buatPesanPelanggan(pesanan);
  }, [admin, pesanan, templat]);
  const tautan = useMemo(() => linkWa(nomorTujuan, pesan), [nomorTujuan, pesan]);
  const alasan = !pesanan ? 'Data pesanan belum tersedia.'
    : !nomorTujuan ? (admin ? 'Nomor WhatsApp pelanggan belum tersedia.' : 'Nomor admin belum diatur.')
      : 'Nomor WhatsApp tidak valid.';
  const labelPelanggan = {
    pending: 'Konfirmasi pesanan via WhatsApp',
    diproses: 'Tanyakan estimasi pesanan',
    'siap diambil': 'Atur waktu pengambilan',
    dikirim: 'Tanyakan estimasi pengantaran',
    selesai: 'Konfirmasi pesanan diterima',
    dibatalkan: 'Tanyakan pembatalan pesanan',
  }[pesanan?.status] ?? 'Hubungi Kecaknik via WhatsApp';

  if (!admin && !nomorTujuan && !import.meta.env.DEV) return null;

  function bukaWhatsApp() {
    if (!tautan) return;
    window.open(tautan, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className={`${gaya.kontainer} ${className ?? ''}`}>
      {admin ? (
        <Select
          label="Templat pesan"
          nilai={templat}
          onUbah={setTemplat}
          opsi={TEMPLAT_ADMIN.map((item) => ({ nilai: item.id, label: item.label }))}
          nonaktif={!pesanan}
        />
      ) : null}
      <Button
        variasi="sekunder"
        penuh
        ikonKiri={<MessageCircle size={19} />}
        onClick={bukaWhatsApp}
        nonaktif={!tautan}
        alasan={!tautan ? alasan : ''}
      >
        {label ?? (admin ? 'Buka WhatsApp' : labelPelanggan)}
      </Button>
      <p className={gaya.catatan}>Pesan akan dibuka di WhatsApp. Periksa pesan, lalu tekan Kirim.</p>
    </div>
  );
}
