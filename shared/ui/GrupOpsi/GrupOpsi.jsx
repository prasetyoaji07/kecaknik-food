import { useId } from 'react';
import { rupiah } from '../../core/format.js';
import { Checkbox } from '../Checkbox/Checkbox.jsx';
import { Radio } from '../Radio/Radio.jsx';
import { Field } from '../Field/Field.jsx';
import { gabung } from '../gabung.js';
import gaya from './GrupOpsi.module.css';

/**
 * Grup pilihan produk. `grup` berisi [{id,label,jenis,wajib,minPilih,maksPilih,opsi,bergantungPada}].
 * `nilai` berupa objek { [idGrup]: nilaiRadio | nilaiCheckbox[] | teks }.
 * `onUbah(idGrup, nilaiBaru)` dipanggil setiap pilihan berubah.
 */
export function GrupOpsi({ grup = [], nilai = {}, onUbah, teks = {}, onUbahTeks, galat = {}, className }) {
  const idAwal = useId();

  return (
    <div className={gabung(gaya.daftar, className)}>
      {grup.map((item, indeks) => {
        const id = item.id ?? item.kunci ?? `grup-${indeks}`;
        const banyak = item.jenis === 'banyak' || item.tipe === 'pilih_banyak';
        const pilihan = nilai[id] ?? (banyak ? [] : '');
        const idPemicu = item.muncul_setelah_grup_id ?? item.pemicu;
        const grupPemicu = idPemicu == null
          ? null
          : grup.find((calon) => String(calon.id) === String(idPemicu));
        const nilaiPemicu = grupPemicu ? nilai[grupPemicu.id] : null;
        const tampil = idPemicu == null || (Array.isArray(nilaiPemicu) ? nilaiPemicu.length > 0 : Boolean(nilaiPemicu));
        if (!tampil) return null;

        const idLegenda = `${idAwal}-${indeks}`;
        const opsi = item.opsi ?? [];
        const terpilih = Array.isArray(pilihan) ? pilihan : [];
        const minPilih = item.minPilih ?? item.min_pilih ?? (item.wajib ? 1 : 0);
        const maksPilih = item.maksPilih ?? item.max_pilih ?? (banyak ? opsi.length : 1);
        const jumlah = banyak ? terpilih.length : (pilihan ? 1 : 0);
        const namaGrup = item.label ?? item.nama ?? 'Pilihan produk';

        return (
          <fieldset key={id} className={gaya.grup}>
            <legend id={idLegenda} className={gaya.legenda}>
              {namaGrup}
              {item.wajib ? <span className={gaya.wajib}> *</span> : null}
            </legend>
            {item.deskripsi ? <p className={gaya.deskripsi}>{item.deskripsi}</p> : null}
            <div className={gaya.opsi}>
              {opsi.map((o) => {
                const nilaiOpsi = o.nilai ?? o.id;
                const labelOpsi = o.label ?? o.nama;
                const dipilih = banyak ? terpilih.includes(nilaiOpsi) : pilihan === nilaiOpsi;
                const penuh = banyak && !dipilih && jumlah >= maksPilih;
                const hargaTambah = o.hargaTambah ?? o.harga_tambah;
                const akhiran = Number(hargaTambah) > 0 ? `+${rupiah(hargaTambah)}` : (Number(hargaTambah) === 0 ? 'Gratis' : undefined);
                const nonaktif = o.nonaktif || o.aktif === false || penuh;
                const ubah = (aktif) => {
                  if (!banyak) return onUbah?.(id, nilaiOpsi);
                  const baru = aktif ? [...terpilih, nilaiOpsi] : terpilih.filter((v) => v !== nilaiOpsi);
                  onUbah?.(id, baru);
                };
                return banyak ? (
                  <Checkbox key={nilaiOpsi} label={labelOpsi} deskripsi={o.deskripsi} akhiran={akhiran} nilai={nilaiOpsi} terpilih={dipilih} nonaktif={nonaktif} onUbah={ubah} />
                ) : (
                  <Radio key={nilaiOpsi} nama={`${idAwal}-${id}`} label={labelOpsi} deskripsi={o.deskripsi} akhiran={akhiran} nilai={nilaiOpsi} terpilih={dipilih} nonaktif={nonaktif} onUbah={ubah} />
                );
              })}
            </div>
            {opsi.filter((o) => o.butuh_teks && (banyak ? terpilih.includes(o.nilai ?? o.id) : pilihan === (o.nilai ?? o.id))).map((o) => {
              const nilaiOpsi = o.nilai ?? o.id;
              return (
                <Field
                  key={nilaiOpsi}
                  kind="teks"
                  label={o.label_teks || `Isian ${o.nama ?? o.label}`}
                  nilai={teks[id]?.[nilaiOpsi] ?? ''}
                  onUbah={(baru) => onUbahTeks?.(id, nilaiOpsi, baru)}
                  maksKarakter={100}
                  galat={galat[`${id}-${nilaiOpsi}`]}
                  wajib
                />
              );
            })}
            {banyak && (minPilih > 0 || maksPilih < opsi.length) ? (
              <p className={gaya.bantuan}>Pilih {minPilih}–{maksPilih} pilihan</p>
            ) : null}
            {galat[id] ? <p className={gaya.galat} role="alert">{galat[id]}</p> : null}
          </fieldset>
        );
      })}
    </div>
  );
}
