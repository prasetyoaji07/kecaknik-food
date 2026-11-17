import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { gabung } from '../gabung.js';
import gaya from './Toast.module.css';

const IKON = { berhasil: CircleCheck, galat: CircleAlert, info: Info };
const DURASI = { berhasil: 4000, info: 4000, galat: 7000 }; // galat bertahan lebih lama
const MAKS_TAMPIL = 3;

const KonteksToast = createContext(null);

/**
 * Pasang sekali di akar aplikasi. Pemakaian di halaman:
 *   const toast = useToast();
 *   toast.berhasil('Pesanan dikirim');   toast.galat('Gagal mengirim');   toast.info('...');
 * Tulis pesan dengan kata kerja yang sama dengan tombolnya (DESIGN bagian 5).
 * Mobile: di bawah tengah. Desktop: kanan atas. Maksimal 3 sekaligus.
 */
export function ToastProvider({ children }) {
  const [daftar, setDaftar] = useState([]);
  const nomor = useRef(0);
  const waktu = useRef(new Map());

  const tutup = useCallback((id) => {
    clearTimeout(waktu.current.get(id));
    waktu.current.delete(id);
    setDaftar((d) => d.filter((t) => t.id !== id));
  }, []);

  const munculkan = useCallback((jenis, pesan) => {
    if (!pesan) return null;
    nomor.current += 1;
    const id = nomor.current;
    setDaftar((d) => [...d, { id, jenis, pesan }].slice(-MAKS_TAMPIL));
    waktu.current.set(id, setTimeout(() => tutup(id), DURASI[jenis] ?? DURASI.info));
    return id;
  }, [tutup]);

  useEffect(() => {
    const penampung = waktu.current;
    return () => { penampung.forEach(clearTimeout); penampung.clear(); };
  }, []);

  const api = useMemo(() => ({
    berhasil: (pesan) => munculkan('berhasil', pesan),
    galat: (pesan) => munculkan('galat', pesan),
    info: (pesan) => munculkan('info', pesan),
    tutup,
  }), [munculkan, tutup]);

  return (
    <KonteksToast.Provider value={api}>
      {children}
      {typeof document !== 'undefined'
        ? createPortal(
          <div className={gaya.wadah}>
            {daftar.map((t) => {
              const Ikon = IKON[t.jenis] ?? Info;
              return (
                <div
                  key={t.id}
                  className={gabung(gaya.toast, gaya[t.jenis])}
                  role={t.jenis === 'galat' ? 'alert' : 'status'}
                >
                  <Ikon className={gaya.ikon} size={20} strokeWidth={2.5} aria-hidden="true" />
                  <p className={gaya.pesan}>{t.pesan}</p>
                  <button type="button" className={gaya.tutup} aria-label="Tutup pemberitahuan" onClick={() => tutup(t.id)}>
                    <X size={16} strokeWidth={3} aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body,
        )
        : null}
    </KonteksToast.Provider>
  );
}

export function useToast() {
  const api = useContext(KonteksToast);
  if (!api) throw new Error('useToast harus dipakai di dalam <ToastProvider>.');
  return api;
}
