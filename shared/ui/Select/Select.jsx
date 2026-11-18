import { useId, useState } from 'react';
import * as RS from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { gabung } from '../gabung.js';
import { BungkusBidang } from '../BungkusBidang/BungkusBidang.jsx';
import gaya from './Select.module.css';
import './lembar.css';

const PADDING_TABRAKAN = 12;

/**
 * Dropdown satu pilihan (DESIGN bagian 7), di atas Radix Select. Panel di-portal ke body,
 * membalik atau bergeser agar tidak keluar layar, scroll di dalam panel, dan menjadi
 * bottom sheet di bawah 768 px. Satu-satunya dropdown di UI.
 * opsi: [{ nilai, label, nonaktif? }]. `nilai` tidak boleh berupa teks kosong (aturan Radix).
 * Terkendali: `nilai` ('' = belum memilih, tampil placeholder) dan `onUbah(nilai)`.
 */
export function Select({
  label, nilai = '', onUbah, opsi = [], placeholder = 'Pilih salah satu', bantuan, galat,
  wajib = false, nonaktif = false, nama, id, className, ...sisa
}) {
  const [terbuka, setTerbuka] = useState(false);
  const idAuto = useId();
  const idPemicu = id ?? idAuto;
  const idBantuan = `${idPemicu}-bantuan`;
  const idGalat = `${idPemicu}-galat`;
  const deskripsi = [bantuan ? idBantuan : null, galat ? idGalat : null].filter(Boolean).join(' ') || undefined;

  return (
    <BungkusBidang
      idKontrol={idPemicu}
      idBantuan={idBantuan}
      idGalat={idGalat}
      label={label}
      wajib={wajib}
      bantuan={bantuan}
      galat={galat}
      className={className}
    >
      <RS.Root value={nilai || ''} onValueChange={onUbah} open={terbuka} onOpenChange={setTerbuka} disabled={nonaktif} name={nama} required={wajib}>
        <RS.Trigger
          id={idPemicu}
          className={gabung(gaya.pemicu, galat && gaya.pemicuGalat)}
          aria-invalid={galat ? true : undefined}
          aria-describedby={deskripsi}
          {...sisa}
        >
          <RS.Value placeholder={placeholder} />
          <RS.Icon asChild>
            <ChevronDown size={20} strokeWidth={2} className={gaya.panah} aria-hidden="true" />
          </RS.Icon>
        </RS.Trigger>
        <RS.Portal>
          <div className={gaya.portalIsi}>
            {terbuka ? <div className={gaya.tabir} aria-hidden="true" /> : null}
            <RS.Content
            position="popper"
            sideOffset={8}
            collisionPadding={PADDING_TABRAKAN}
            className={gaya.panel}
            data-lembar-pilihan=""
          >
            <RS.Viewport className={gaya.daftar}>
              {opsi.map((o) => (
                <RS.Item key={o.nilai} value={o.nilai} disabled={o.nonaktif} className={gaya.item}>
                  <RS.ItemText>{o.label}</RS.ItemText>
                  <RS.ItemIndicator className={gaya.centang}>
                    <Check size={20} strokeWidth={2} aria-hidden="true" />
                  </RS.ItemIndicator>
                </RS.Item>
              ))}
            </RS.Viewport>
            </RS.Content>
          </div>
        </RS.Portal>
      </RS.Root>
    </BungkusBidang>
  );
}
