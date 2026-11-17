import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { saring } from '../../core/validasi.js';
import { gabung } from '../gabung.js';
import { BungkusBidang } from '../BungkusBidang/BungkusBidang.jsx';
import {
  petunjukSaring, ketikanDitolak, tampilanField, rapikan, galatField, LABEL_BAWAAN,
} from './aturanField.js';
import gaya from './Field.module.css';

const ATRIBUT = {
  nama: { type: 'text', inputMode: 'text', autoComplete: 'name' },
  telepon: { type: 'tel', inputMode: 'tel', autoComplete: 'tel' },
  rupiah: { type: 'text', inputMode: 'numeric', autoComplete: 'off' },
  angka: { type: 'text', inputMode: 'numeric', autoComplete: 'off' },
  kode: { type: 'text', inputMode: 'text', autoComplete: 'off', autoCapitalize: 'characters', spellCheck: false },
  teks: { type: 'text', inputMode: 'text' },
  alamat: { autoComplete: 'street-address' },
  sandi: { autoComplete: 'current-password' },
};
const BERANGKA = ['telepon', 'rupiah', 'angka', 'kode'];
const WAKTU_PETUNJUK = 3000;

/**
 * Satu-satunya cara membuat input teks (DESIGN bagian 5 dan 6).
 * kind: nama | telepon | rupiah | angka | kode | teks | alamat | sandi.
 * Terkendali: `nilai` (teks) dan `onUbah(teks)`. Karakter terlarang disaring di onChange
 * (termasuk saat tempel). `galat` dari induk (mis. saat kirim) menimpa galat otomatis,
 * yang baru muncul setelah field disentuh (blur).
 */
export const Field = forwardRef(function Field(
  {
    kind = 'teks', label, nilai = '', onUbah, bantuan, galat, awalan, akhiran, wajib = false,
    nonaktif = false, baris, min, maks, maksKarakter, placeholder, nama, id, onBlur, onFokus,
    className, ...sisa
  },
  ref,
) {
  const idAuto = useId();
  const idInput = id ?? idAuto;
  const idBantuan = `${idInput}-bantuan`;
  const idGalat = `${idInput}-galat`;

  const [fokus, setFokus] = useState(false);
  const [tersentuh, setTersentuh] = useState(false);
  const [petunjuk, setPetunjuk] = useState('');
  const [lihatSandi, setLihatSandi] = useState(false);
  const penghitungWaktu = useRef(null);
  useEffect(() => () => clearTimeout(penghitungWaktu.current), []);

  const banyak = kind === 'alamat' || (baris ?? 1) > 1;
  const batasTeks = maksKarakter ?? (kind === 'alamat' || kind === 'teks' ? 255 : undefined);
  const labelGalat = label || LABEL_BAWAAN[kind];

  const galatOtomatis = tersentuh
    ? galatField(kind, nilai, { wajib, label: labelGalat, min, maks, maksKarakter: batasTeks })
    : null;
  const galatTampil = galat || galatOtomatis;

  function tampilkanPetunjuk(teks) {
    setPetunjuk(teks);
    clearTimeout(penghitungWaktu.current);
    penghitungWaktu.current = setTimeout(() => setPetunjuk(''), WAKTU_PETUNJUK);
  }

  function ubah(e) {
    const mentah = e.target.value;
    const baru = saring(kind, mentah);
    const p = petunjukSaring(kind, mentah, baru);
    if (p) tampilkanPetunjuk(p);
    onUbah?.(baru);
  }

  function sebelumMasuk(e) {
    // Mempercepat respons untuk satu ketikan. Sumber kebenaran tetap onChange.
    if (ketikanDitolak(kind, e.nativeEvent?.data ?? e.data)) {
      e.preventDefault();
      tampilkanPetunjuk(petunjukSaring(kind, e.nativeEvent?.data ?? e.data, ''));
    }
  }

  function saatBlur(e) {
    setFokus(false);
    setTersentuh(true);
    const rapi = rapikan(kind, nilai);
    if (rapi !== nilai) onUbah?.(rapi);
    onBlur?.(e);
  }

  function saatFokus(e) {
    setFokus(true);
    onFokus?.(e);
  }

  const atribut = ATRIBUT[kind] ?? ATRIBUT.teks;
  const jenisSandi = kind === 'sandi' ? (lihatSandi ? 'text' : 'password') : atribut.type;
  const deskripsi = [bantuan ? idBantuan : null, galatTampil ? idGalat : null].filter(Boolean).join(' ') || undefined;

  const sifatKontrol = {
    id: idInput,
    name: nama,
    ref,
    value: tampilanField(kind, nilai, fokus),
    onChange: ubah,
    onBlur: saatBlur,
    onFocus: saatFokus,
    onBeforeInput: sebelumMasuk,
    disabled: nonaktif,
    placeholder,
    maxLength: kind === 'kode' ? 10 : batasTeks,
    'aria-invalid': galatTampil ? true : undefined,
    'aria-required': wajib || undefined,
    'aria-describedby': deskripsi,
    className: gabung(gaya.kontrol, BERANGKA.includes(kind) && gaya.angka),
    ...atribut,
    ...sisa,
  };
  delete sifatKontrol.type;

  const penghitung = batasTeks && (kind === 'teks' || kind === 'alamat')
    ? `${String(nilai ?? '').length}/${batasTeks}`
    : null;

  return (
    <BungkusBidang
      idKontrol={idInput}
      idBantuan={idBantuan}
      idGalat={idGalat}
      label={label}
      wajib={wajib}
      bantuan={bantuan}
      galat={galatTampil}
      petunjuk={petunjuk}
      penghitung={penghitung}
      className={className}
    >
      <div
        className={gabung(gaya.kotak, banyak && gaya.kotakBanyak, galatTampil && gaya.kotakGalat, nonaktif && gaya.kotakMati)}
      >
        {awalan ? <span className={gaya.sisi}>{awalan}</span> : null}
        {banyak
          ? <textarea {...sifatKontrol} rows={baris ?? 3} />
          : <input {...sifatKontrol} type={jenisSandi} />}
        {kind === 'sandi' ? (
          <button
            type="button"
            className={gaya.mata}
            onClick={() => setLihatSandi((v) => !v)}
            aria-label={lihatSandi ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
            aria-pressed={lihatSandi}
            disabled={nonaktif}
          >
            {lihatSandi ? <EyeOff size={20} strokeWidth={2} aria-hidden="true" /> : <Eye size={20} strokeWidth={2} aria-hidden="true" />}
          </button>
        ) : null}
        {akhiran ? <span className={gaya.sisi}>{akhiran}</span> : null}
      </div>
    </BungkusBidang>
  );
});
