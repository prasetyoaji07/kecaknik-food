import { Link } from 'react-router-dom';
import { ArrowLeft, Utensils } from 'lucide-react';
import { Button } from '@kecaknik/shared/ui';
import gaya from './TidakDitemukan.module.css';

export default function TidakDitemukan() {
  return (
    <section className={gaya.halaman}>
      <div className={gaya.ilustrasi} aria-hidden="true"><span>404</span><Utensils size={42}/></div>
      <h1>Sepertinya bukan jalan ke dapur kami.</h1>
      <p>Alamat yang kamu buka tidak tersedia. Yuk, kembali lihat menu Kecaknik Food.</p>
      <Button as={Link} to="/menu" ikonKiri={<ArrowLeft size={17}/>}>Lihat menu</Button>
    </section>
  );
}
