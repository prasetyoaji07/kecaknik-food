import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AdminLayout, Button } from '@kecaknik/shared/ui';
import Login from './halaman/Login.jsx';
import Pesanan from './halaman/Pesanan/Pesanan.jsx';
import DetailPesanan from './halaman/Pesanan/DetailPesanan.jsx';
import InputManual from './halaman/InputManual.jsx';
import Produk from './halaman/Produk.jsx';
import Laporan from './halaman/Laporan.jsx';
import { PenjagaAdmin } from './komponen/PenjagaAdmin.jsx';
import { keluar } from './api/auth.js';

const navigasi = [
  { href: '/pesanan', label: 'Pesanan', ikon: '▤' },
  { href: '/input-manual', label: 'Input manual', ikon: '+' },
  { href: '/produk', label: 'Produk', ikon: '▧' },
  { href: '/laporan', label: 'Laporan', ikon: '▥' },
];

function Sesi() {
  const navigasiHalaman = useNavigate();
  useEffect(() => {
    const berakhir = () => navigasiHalaman('/login', { replace: true });
    window.addEventListener('admin:sesi-berakhir', berakhir);
    return () => window.removeEventListener('admin:sesi-berakhir', berakhir);
  }, [navigasiHalaman]);
  return null;
}

function Keluar() {
  const navigasiHalaman = useNavigate();
  return <Button variasi="sekunder" ukuran="sm" onClick={() => { keluar(); navigasiHalaman('/login', { replace: true }); }}>Keluar</Button>;
}

function PanelAdmin() {
  return (
    <AdminLayout navigasi={navigasi} pathAktif={window.location.pathname.startsWith('/pesanan') ? '/pesanan' : window.location.pathname} judul="Panel admin" aksi={<Keluar />}>
      <Routes>
        <Route path="pesanan" element={<Pesanan />} />
        <Route path="pesanan/:id" element={<DetailPesanan />} />
        <Route path="input-manual" element={<InputManual />} />
        <Route path="produk" element={<Produk />} />
        <Route path="laporan" element={<Laporan />} />
        <Route path="*" element={<Navigate to="/pesanan" replace />} />
      </Routes>
    </AdminLayout>
  );
}

function IsiAplikasi() {
  return (
    <>
      <Sesi />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PenjagaAdmin />}>
          <Route path="/*" element={<PanelAdmin />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return <BrowserRouter><IsiAplikasi /></BrowserRouter>;
}
