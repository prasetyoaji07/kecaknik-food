import { Link } from 'react-router-dom';

export default function HalamanRangka({ judul, deskripsi }) {
  return (
    <section className="halaman-rangka">
      <h1>{judul}</h1>
      <p>{deskripsi}</p>
      <Link to="/menu" className="tautan-utama">Lihat menu</Link>
    </section>
  );
}
