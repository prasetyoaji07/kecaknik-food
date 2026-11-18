import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocateFixed, MapPin } from 'lucide-react';
import { Button } from '../Button/Button.jsx';
import gaya from './PetaPilih.module.css';
import 'leaflet/dist/leaflet.css';

const ZOOM_AWAL = 15;
const PUSAT_PETA = [-2.5, 118];

function ikonPenanda() {
  return L.divIcon({
    className: gaya.bungkusIkon,
    html: '<span class="penanda-peta-pilih" aria-hidden="true"></span>',
    iconSize: [28, 36],
    iconAnchor: [14, 34],
  });
}

/** Peta OSM untuk memilih titik pengantaran. onUbah menerima { lat, lng, akurasi? }. */
export function PetaPilih({ lat = null, lng = null, nilai, onUbah, tinggi, nonaktif = false, className }) {
  const wadahRef = useRef(null);
  const petaRef = useRef(null);
  const penandaRef = useRef(null);
  const lingkaranRef = useRef(null);
  const onUbahRef = useRef(onUbah);
  const nonaktifRef = useRef(nonaktif);
  onUbahRef.current = onUbah;
  nonaktifRef.current = nonaktif;
  const [memuatLokasi, setMemuatLokasi] = useState(false);
  const [galatLokasi, setGalatLokasi] = useState('');
  const posisi = nilai ?? { lat, lng };
  const adaPosisi = posisi?.lat !== null && posisi?.lat !== undefined && posisi?.lat !== ''
    && posisi?.lng !== null && posisi?.lng !== undefined && posisi?.lng !== ''
    && Number.isFinite(Number(posisi.lat)) && Number.isFinite(Number(posisi.lng));

  function buatPenanda(peta, titik) {
    const penanda = L.marker(titik, { icon: ikonPenanda(), draggable: !nonaktifRef.current }).addTo(peta);
    penanda.on('dragend', () => {
      const lokasi = penanda.getLatLng();
      onUbahRef.current?.({ lat: lokasi.lat, lng: lokasi.lng });
    });
    return penanda;
  }

  useEffect(() => {
    if (!wadahRef.current || petaRef.current) return undefined;
    const awal = adaPosisi ? [Number(posisi.lat), Number(posisi.lng)] : PUSAT_PETA;
    const peta = L.map(wadahRef.current, { scrollWheelZoom: false }).setView(awal, adaPosisi ? ZOOM_AWAL : 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap', maxZoom: 19,
    }).addTo(peta);
    if (adaPosisi) penandaRef.current = buatPenanda(peta, awal);
    const lingkaran = L.circle(awal, { radius: 0, className: gaya.lingkaranAkurasi }).addTo(peta);
    peta.on('click', (peristiwa) => {
      if (nonaktifRef.current) return;
      if (!penandaRef.current) {
        penandaRef.current = buatPenanda(peta, peristiwa.latlng);
      } else {
        penandaRef.current.setLatLng(peristiwa.latlng);
      }
      lingkaran.setLatLng(peristiwa.latlng).setRadius(0);
      onUbahRef.current?.({ lat: peristiwa.latlng.lat, lng: peristiwa.latlng.lng });
    });
    petaRef.current = peta;
    lingkaranRef.current = lingkaran;
    const pengamat = new ResizeObserver(() => peta.invalidateSize());
    pengamat.observe(wadahRef.current);
    return () => {
      pengamat.disconnect(); peta.remove();
      petaRef.current = null; penandaRef.current = null; lingkaranRef.current = null;
    };
    // Peta dibuat sekali; perubahan koordinat ditangani efek berikutnya.
  }, []);

  useEffect(() => {
    if (!adaPosisi || !petaRef.current) return;
    const titik = [Number(posisi.lat), Number(posisi.lng)];
    if (!penandaRef.current) {
      penandaRef.current = buatPenanda(petaRef.current, titik);
    } else {
      penandaRef.current.setLatLng(titik);
    }
    petaRef.current.panTo(titik);
  }, [adaPosisi, posisi?.lat, posisi?.lng]);

  useEffect(() => {
    if (penandaRef.current) penandaRef.current.dragging[nonaktif ? 'disable' : 'enable']();
  }, [nonaktif]);

  function gunakanLokasi() {
    if (!navigator.geolocation) {
      setGalatLokasi('Perangkat ini tidak mendukung lokasi otomatis. Pilih titik pada peta.');
      return;
    }
    setMemuatLokasi(true); setGalatLokasi('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const titik = [coords.latitude, coords.longitude];
        petaRef.current?.setView(titik, 17);
        if (!penandaRef.current && petaRef.current) {
          penandaRef.current = buatPenanda(petaRef.current, titik);
        } else {
          penandaRef.current?.setLatLng(titik);
        }
        lingkaranRef.current?.setLatLng(titik).setRadius(coords.accuracy || 0);
        onUbahRef.current?.({ lat: coords.latitude, lng: coords.longitude, akurasi: coords.accuracy });
        setMemuatLokasi(false);
      },
      (galat) => {
        setGalatLokasi(galat.code === 1
          ? 'Izin lokasi ditolak. Aktifkan izin lokasi atau pilih titik pada peta.'
          : 'Lokasi belum bisa ditemukan. Coba lagi atau pilih titik pada peta.');
        setMemuatLokasi(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  }

  return (
    <section className={`${gaya.kontainer} ${className ?? ''}`}>
      <div ref={wadahRef} className={gaya.peta} style={tinggi ? { height: tinggi } : undefined} aria-label="Peta pemilihan lokasi pengantaran" />
      <div className={gaya.kontrol}>
        <Button variasi="sekunder" ukuran="sm" ikonKiri={<LocateFixed size={17} />} onClick={gunakanLokasi} memuat={memuatLokasi} nonaktif={nonaktif}>
          Gunakan lokasi saya
        </Button>
        <span className={gaya.petunjuk}><MapPin size={15} aria-hidden="true" /> Ketuk peta atau geser penanda untuk memilih titik</span>
      </div>
      {galatLokasi ? <p className={gaya.galat} role="status">{galatLokasi}</p> : null}
      {adaPosisi ? <p className={gaya.koordinat}>Titik dipilih: {Number(posisi.lat).toFixed(5)}, {Number(posisi.lng).toFixed(5)}</p> : null}
    </section>
  );
}
