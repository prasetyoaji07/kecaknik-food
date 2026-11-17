import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { gabung } from '../gabung.js';
import { Button } from '../Button/Button.jsx';
import gaya from './Modal.module.css';

/**
 * Dialog di tengah (desktop), lembar dari bawah (di bawah 768 px). DESIGN bagian 5 dan 7.
 * Dibangun di atas Radix Dialog: fokus terkunci, ESC menutup, scroll belakang terkunci, aria otomatis.
 * Header dan footer lengket, hanya isi yang bergulir.
 * Terkendali: `buka`, `onTutup()`. `judul` wajib (dibaca pembaca layar). `footer`: node (tombol aksi).
 * `tutupLuar={false}` mencegah tutup karena klik di luar (mis. formulir yang belum disimpan).
 */
export function Modal({
  buka, onTutup, judul, deskripsi, footer, tutupLuar = true, className, children,
}) {
  return (
    <Dialog.Root open={buka} onOpenChange={(b) => { if (!b) onTutup?.(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className={gaya.tabir} />
        <Dialog.Content
          className={gabung(gaya.panel, className)}
          {...(deskripsi ? {} : { 'aria-describedby': undefined })}
          onInteractOutside={(e) => { if (!tutupLuar) e.preventDefault(); }}
        >
          <header className={gaya.kepala}>
            <Dialog.Title className={gaya.judul}>{judul}</Dialog.Title>
            <Dialog.Close asChild>
              <Button variasi="sekunder" ukuran="sm" ikonKiri={<X size={18} strokeWidth={3} />} aria-label="Tutup" />
            </Dialog.Close>
          </header>
          {deskripsi ? <Dialog.Description className={gaya.deskripsi}>{deskripsi}</Dialog.Description> : null}
          <div className={gaya.isi}>{children}</div>
          {footer ? <footer className={gaya.kaki}>{footer}</footer> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
