import { useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, Trash2, RefreshCw } from 'lucide-react';
import { gabung } from '../gabung.js';
import { Button } from '../Button/Button.jsx';
import { periksaFileGambar, ukuranFile, TIPE_GAMBAR } from './aturanDropzone.js';
import gaya from './Dropzone.module.css';

/**
 * Unggah satu gambar (bukti transfer, foto produk). Keadaan: kosong, menyeret, terpilih
 * (pratinjau + nama + ukuran + Ganti/Hapus), galat. jpg/png/webp, maksimal 2 MB, diperiksa
 * di klien (server memeriksa ulang). Terkendali: `nilai` (File atau null), `onUbah(File|null)`.
 * `galat` dari induk menimpa galat file. `urlAwal`: pratinjau gambar yang sudah tersimpan (edit produk).
 */
export function Dropzone({
  label, nilai = null, onUbah, galat, bantuan, wajib = false, nonaktif = false, urlAwal = '', className,
}) {
  const idInput = useId();
  const idBantuan = `${idInput}-bantuan`;
  const idGalat = `${idInput}-galat`;
  const berkas = useRef(null);
  const [menyeret, setMenyeret] = useState(false);
  const [galatFile, setGalatFile] = useState('');
  const [pratinjau, setPratinjau] = useState('');

  useEffect(() => {
    if (!nilai) { setPratinjau(''); return undefined; }
    const url = URL.createObjectURL(nilai);
    setPratinjau(url);
    return () => URL.revokeObjectURL(url);
  }, [nilai]);

  function terima(file) {
    const masalah = periksaFileGambar(file);
    setGalatFile(masalah ?? '');
    if (!masalah) onUbah?.(file);
  }

  function pilih(e) {
    const file = e.target.files?.[0];
    if (file) terima(file);
    e.target.value = ''; // file yang sama bisa dipilih ulang setelah dihapus
  }

  function lepas(e) {
    e.preventDefault();
    setMenyeret(false);
    if (nonaktif) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) terima(file);
  }

  function hapus() {
    setGalatFile('');
    onUbah?.(null);
  }

  const galatTampil = galat || galatFile;
  const gambar = pratinjau || urlAwal;
  const terpilih = Boolean(nilai) || Boolean(urlAwal);

  return (
    <div className={gabung(gaya.bidang, className)}>
      {label ? (
        <span className={gaya.label}>
          {label}
          {wajib ? <span aria-hidden="true" className={gaya.wajib}> *</span> : null}
        </span>
      ) : null}

      <input
        ref={berkas}
        id={idInput}
        className="hanya-baca"
        type="file"
        accept={TIPE_GAMBAR.join(',')}
        disabled={nonaktif}
        aria-describedby={[bantuan ? idBantuan : '', galatTampil ? idGalat : ''].filter(Boolean).join(' ') || undefined}
        aria-invalid={galatTampil ? true : undefined}
        onChange={pilih}
      />

      {terpilih ? (
        <div className={gabung(gaya.area, gaya.terpilih, galatTampil && gaya.galat)}>
          {gambar ? <img className={gaya.pratinjau} src={gambar} alt={nilai ? `Pratinjau ${nilai.name}` : 'Gambar tersimpan'} /> : null}
          <div className={gaya.info}>
            <p className={gaya.nama}>{nilai ? nilai.name : 'Gambar tersimpan'}</p>
            {nilai ? <p className={gaya.ukuran}>{ukuranFile(nilai.size)}</p> : null}
            <div className={gaya.aksi}>
              <Button
                variasi="sekunder"
                ukuran="sm"
                ikonKiri={<RefreshCw size={16} strokeWidth={2.5} />}
                nonaktif={nonaktif}
                onClick={() => berkas.current?.click()}
              >
                Ganti
              </Button>
              {nilai ? (
                <Button
                  variasi="bahaya"
                  ukuran="sm"
                  ikonKiri={<Trash2 size={16} strokeWidth={2.5} />}
                  nonaktif={nonaktif}
                  onClick={hapus}
                >
                  Hapus
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={idInput}
          className={gabung(gaya.area, gaya.kosong, menyeret && gaya.menyeret, galatTampil && gaya.galat, nonaktif && gaya.mati)}
          onDragOver={(e) => { e.preventDefault(); if (!nonaktif) setMenyeret(true); }}
          onDragLeave={() => setMenyeret(false)}
          onDrop={lepas}
        >
          <ImagePlus size={32} strokeWidth={2} aria-hidden="true" />
          <span className={gaya.ajakan}>{menyeret ? 'Lepas di sini' : 'Seret gambar ke sini, atau pilih dari perangkat'}</span>
          <span className={gaya.batas}>JPG, PNG, atau WebP, maksimal 2 MB</span>
        </label>
      )}

      {bantuan ? <p id={idBantuan} className={gaya.bantuan}>{bantuan}</p> : null}
      <div aria-live="polite">
        {galatTampil ? <p id={idGalat} className={gaya.pesanGalat}>{galatTampil}</p> : null}
      </div>
    </div>
  );
}
