import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPinned } from 'lucide-react';
import gaya from './PetaRute.module.css';
import 'leaflet/dist/leaflet.css';

const koordinatValid = (titik) => titik?.lat !== null && titik?.lat !== undefined && titik?.lat !== ''
  && titik?.lng !== null && titik?.lng !== undefined && titik?.lng !== ''
  && Number.isFinite(Number(titik.lat)) && Number.isFinite(Number(titik.lng));
const buatIkon = (jenis) => L.divIcon({
  className: gaya.bungkusIkon,
  html: `<span class="${jenis === 'motor' ? 'penanda-motor-rute' : 'penanda-titik-rute'}" aria-hidden="true">${jenis === 'motor' ? '🛵' : ''}</span>`,
  iconSize: jenis === 'motor' ? [34, 34] : [26, 34],
  iconAnchor: jenis === 'motor' ? [17, 17] : [13, 32],
});

/** Peta rute OSM. Marker motor sengaja statis di toko saat status `dikirim`. */
export function PetaRute({ toko, lokasi, status, tinggi, className, judul = 'Peta rute pengantaran' }) {
  const wadahRef = useRef(null);
  const petaRef = useRef(null);
  const lapisanRef = useRef(null);
  const [keadaanRute, setKeadaanRute] = useState('memuat');
  const asal = toko ?? {};
  const tujuan = lokasi ?? {};
  const valid = koordinatValid(asal) && koordinatValid(tujuan);

  useEffect(() => {
    if (!wadahRef.current || petaRef.current || !valid) return undefined;
    const peta = L.map(wadahRef.current, { scrollWheelZoom: false }).setView([Number(asal.lat), Number(asal.lng)], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(peta);
    petaRef.current = peta;
    lapisanRef.current = L.layerGroup().addTo(peta);
    const pengamat = new ResizeObserver(() => peta.invalidateSize());
    pengamat.observe(wadahRef.current);
    return () => {
      pengamat.disconnect();
      peta.remove();
      petaRef.current = null;
      lapisanRef.current = null;
    };
    // Peta dibuat ulang hanya bila koordinat belum tersedia saat render pertama.
  }, [valid]);

  useEffect(() => {
    if (!valid || !lapisanRef.current || !petaRef.current) return undefined;
    const asalLatLng = [Number(asal.lat), Number(asal.lng)];
    const tujuanLatLng = [Number(tujuan.lat), Number(tujuan.lng)];
    const lapisan = lapisanRef.current;
    lapisan.clearLayers();
    L.marker(asalLatLng, { icon: buatIkon('titik') }).bindTooltip('Kecaknik Food').addTo(lapisan);
    L.marker(tujuanLatLng, { icon: buatIkon('titik') }).bindTooltip('Lokasi tujuan').addTo(lapisan);
    if (status === 'dikirim') {
      L.marker(asalLatLng, { icon: buatIkon('motor') }).bindTooltip('Motor (posisi statis)').addTo(lapisan);
    }
    const garis = L.polyline([asalLatLng, tujuanLatLng], { color: 'var(--merah)', weight: 5, opacity: .85 }).addTo(lapisan);
    petaRef.current.fitBounds(garis.getBounds(), { padding: [24, 24], maxZoom: 15 });
    let aktif = true;
    setKeadaanRute('memuat');
    const url = `https://router.project-osrm.org/route/v1/driving/${Number(asal.lng)},${Number(asal.lat)};${Number(tujuan.lng)},${Number(tujuan.lat)}?overview=full&geometries=geojson`;
    fetch(url)
      .then((respons) => {
        if (!respons.ok) throw new Error('Rute tidak tersedia');
        return respons.json();
      })
      .then((data) => {
        if (!aktif) return;
        if (!data.routes?.[0]?.geometry?.coordinates) {
          setKeadaanRute('garis-lurus');
          return;
        }
        const titikRute = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        lapisan.clearLayers();
        L.marker(asalLatLng, { icon: buatIkon('titik') }).bindTooltip('Kecaknik Food').addTo(lapisan);
        L.marker(tujuanLatLng, { icon: buatIkon('titik') }).bindTooltip('Lokasi tujuan').addTo(lapisan);
        if (status === 'dikirim') L.marker(asalLatLng, { icon: buatIkon('motor') }).bindTooltip('Motor (posisi statis)').addTo(lapisan);
        const rute = L.polyline(titikRute, { color: 'var(--merah)', weight: 5, opacity: .85 }).addTo(lapisan);
        petaRef.current?.fitBounds(rute.getBounds(), { padding: [24, 24], maxZoom: 15 });
        setKeadaanRute('tersedia');
      })
      .catch(() => {
        if (aktif) setKeadaanRute('garis-lurus');
      });
    return () => { aktif = false; };
  }, [valid, asal.lat, asal.lng, tujuan.lat, tujuan.lng, status]);

  if (!valid) {
    return <section className={`${gaya.kontainer} ${className ?? ''}`}>
      <h3 className={gaya.judul}>{judul}</h3>
      <div className={gaya.kosong}><MapPinned size={25} aria-hidden="true" /><p>Koordinat toko atau lokasi tujuan belum tersedia.</p></div>
    </section>;
  }

  return (
    <section className={`${gaya.kontainer} ${className ?? ''}`}>
      <h3 className={gaya.judul}>{judul}</h3>
      <div ref={wadahRef} className={gaya.peta} style={tinggi ? { height: tinggi } : undefined} aria-label="Peta rute pengantaran dari toko ke lokasi tujuan" />
      <p className={gaya.keterangan} role="status">
        {status === 'dikirim' ? 'Penanda motor bersifat statis, bukan pelacakan langsung. ' : ''}
        {keadaanRute === 'memuat' ? 'Memuat rute…' : keadaanRute === 'garis-lurus' ? 'Rute jalan tidak tersedia. Garis lurus ditampilkan sebagai petunjuk.' : 'Rute jalan ditampilkan sebagai perkiraan.'}
      </p>
    </section>
  );
}
