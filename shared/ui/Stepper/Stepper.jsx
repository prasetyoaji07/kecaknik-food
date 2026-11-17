import { useEffect, useId, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { gabung } from '../gabung.js';
import { Button } from '../Button/Button.jsx';
import gaya from './Stepper.module.css';

const jepit = (n, min, maks) => Math.min(maks, Math.max(min, n));

/**
 * Kurang, jumlah, tambah. Batas bawaan 1 sampai 99 (D-14). Terkendali: `nilai` (angka), `onUbah(angka)`.
 * Jumlah bisa diketik tetapi hanya angka (huruf, tempel teks, dan simbol dibuang); saat fokus
 * hilang nilai dijepit ke batas. Tombol 44 px.
 */
export function Stepper({
  nilai, onUbah, min = 1, maks = 99, label = 'Jumlah', nonaktif = false, className,
}) {
  const idLabel = useId();
  const [teks, setTeks] = useState(String(nilai));
  useEffect(() => setTeks(String(nilai)), [nilai]);

  const turun = nilai <= min;
  const naik = nilai >= maks;

  function ketik(e) {
    const bersih = e.target.value.replace(/\D/g, '').slice(0, String(maks).length);
    setTeks(bersih);
    if (bersih !== '') onUbah?.(jepit(Number(bersih), min, maks));
  }

  function selesaiKetik() {
    // kosong atau di luar batas: kembalikan ke nilai sah terdekat
    const sah = teks === '' ? min : jepit(Number(teks), min, maks);
    setTeks(String(sah));
    if (sah !== nilai) onUbah?.(sah);
  }

  return (
    <div className={gabung(gaya.stepper, nonaktif && gaya.mati, className)} role="group" aria-labelledby={idLabel}>
      <span id={idLabel} className="hanya-baca">{label}</span>
      <Button
        variasi="sekunder"
        ukuran="sm"
        ikonKiri={<Minus size={18} strokeWidth={3} />}
        aria-label={`Kurangi ${label.toLowerCase()}`}
        nonaktif={nonaktif || turun}
        onClick={() => onUbah?.(jepit(nilai - 1, min, maks))}
      />
      <input
        className={gaya.angka}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={teks}
        disabled={nonaktif}
        aria-labelledby={idLabel}
        onChange={ketik}
        onBlur={selesaiKetik}
        onFocus={(e) => e.target.select()}
      />
      <Button
        variasi="sekunder"
        ukuran="sm"
        ikonKiri={<Plus size={18} strokeWidth={3} />}
        aria-label={`Tambah ${label.toLowerCase()}`}
        nonaktif={nonaktif || naik}
        onClick={() => onUbah?.(jepit(nilai + 1, min, maks))}
      />
    </div>
  );
}
