import { createBrowserRouter } from 'react-router-dom';
import Beranda from './halaman/Beranda.jsx';
import Produk from './halaman/Produk.jsx';
import HalamanRangka from './halaman/HalamanRangka.jsx';
import TidakDitemukan from './halaman/TidakDitemukan.jsx';
import Checkout from './halaman/Checkout.jsx';
import Lacak from './halaman/Lacak.jsx';
import Berhasil from './halaman/Berhasil.jsx';
import Status from './halaman/Status.jsx';
const halaman = (judul, deskripsi) => <HalamanRangka judul={judul} deskripsi={deskripsi}/>;
export const rute = createBrowserRouter([
  { path: '/', element: <Beranda/> },
  { path: '/menu', element: <Produk/> },
  { path: '/menu/:kategori', element: <Produk/> },
  { path: '/preorder', element: <Produk mode="preorder"/> },
  { path: '/lacak', element: <Lacak/> },
  { path: '/checkout', element: <Checkout/> },
  { path: '/berhasil/:kode', element: <Berhasil/> },
  { path: '/status/:kode', element: <Status/> },
  { path: '*', element: <TidakDitemukan/> },
]);
