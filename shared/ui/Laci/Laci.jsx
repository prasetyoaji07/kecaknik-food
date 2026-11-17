import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { gabung } from '../gabung.js';
import { Button } from '../Button/Button.jsx';
import gaya from './Laci.module.css';

/**
 * Panel kanan 480 px (desktop), penuh layar (mobile). Dipakai untuk keranjang.
 * Radix Dialog: fokus terkunci, ESC menutup, scroll belakang terkunci.
 * Terkendali: `buka`, `onTutup()`. `judul` wajib. `footer`: node lengket di bawah (total + tombol).
 */
export function Laci({ buka, onTutup, judul, footer, className, children }) {
  return (
    <Dialog.Root open={buka} onOpenChange={(b) => { if (!b) onTutup?.(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className={gaya.tabir} />
        <Dialog.Content className={gabung(gaya.panel, className)} aria-describedby={undefined}>
          <header className={gaya.kepala}>
            <Dialog.Title className={gaya.judul}>{judul}</Dialog.Title>
            <Dialog.Close asChild>
              <Button variasi="sekunder" ukuran="sm" ikonKiri={<X size={18} strokeWidth={3} />} aria-label="Tutup" />
            </Dialog.Close>
          </header>
          <div className={gaya.isi}>{children}</div>
          {footer ? <footer className={gaya.kaki}>{footer}</footer> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
