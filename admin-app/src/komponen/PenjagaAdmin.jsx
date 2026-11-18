import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ambilToken } from '../api/klien.js';

/** Penjaga sisi klien; setiap endpoint admin tetap diverifikasi backend dengan JWT. */
export function PenjagaAdmin() {
  const lokasi = useLocation();
  if (!ambilToken()) return <Navigate to="/login" replace state={{ dari: lokasi }} />;
  return <Outlet />;
}
