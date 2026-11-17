import { gabung } from '../gabung.js';
import { labelStatus, labelPembayaran } from '../../core/statusPesanan.js';
import gaya from './Badge.module.css';

const LABEL_KANAL = { website: 'Website', whatsapp: 'WhatsApp', facebook: 'Facebook', langsung: 'Langsung' };
const LABEL_TIPE = { ambil: 'Ambil', antar: 'Antar' };

// Kelas warna per jenis dan nilai. Warna selalu disertai teks (tidak mengandalkan warna saja).
const WARNA = {
  status: {
    pending: 'kuning',
    diproses: 'netral',
    'siap diambil': 'hijau',
    dikirim: 'netral',
    selesai: 'hijau',
    dibatalkan: 'merah',
  },
  bayar: { belum_dibayar: 'merah', uang_muka: 'kuning', lunas: 'hijau' },
  kanal: {},
  tipe: {},
};

/** Teks label: status dan pembayaran memakai statusPesanan.js (satu sumber), kanal dan tipe lokal. */
function teksLabel(jenis, nilai, tipePesanan) {
  if (jenis === 'status') return labelStatus(nilai, tipePesanan);
  if (jenis === 'bayar') return labelPembayaran(nilai);
  if (jenis === 'kanal') return LABEL_KANAL[nilai] ?? '';
  if (jenis === 'tipe') return LABEL_TIPE[nilai] ?? '';
  return '';
}

/**
 * Lencana kecil berbentuk pill.
 * jenis: status | bayar | kanal | tipe. nilai: nilai dari data (mis. 'siap diambil', 'uang_muka', 'whatsapp').
 * `tipePesanan` (ambil | antar) hanya untuk jenis status, karena label 'selesai' berbeda tiap tipe.
 * Nilai tidak dikenal = tidak menampilkan apa pun.
 */
export function Badge({ jenis = 'status', nilai, tipePesanan, className }) {
  const teks = teksLabel(jenis, nilai, tipePesanan);
  if (!teks) return null;
  const warna = WARNA[jenis]?.[nilai] ?? 'netral';
  return <span className={gabung(gaya.badge, gaya[warna], gaya[jenis], className)}>{teks}</span>;
}
