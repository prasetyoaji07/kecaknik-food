# PERINTAH.md: Prompt siap pakai

Pekerjaan dibagi menjadi **unit kecil** di `HANDOFF.md` (Task Board). Satu sesi mengerjakan 2 unit ringan atau 1 unit 🔥. Aturan lengkap di `CLAUDE.md` bagian 5.

## Cara memakai

**Persiapan (sekali):** folder `kecaknik-food/` berisi 5 dokumen (`CLAUDE.md`, `STRUKTUR.md`, `DESIGN.md`, `PERINTAH.md`, `HANDOFF.md`), folder kosong sesuai struktur, dan logo di `shared/ui/assets/`.

**Di Claude Code:** buka CMD di folder `kecaknik-food`, jalankan `claude`, tempel prompt standar.
**Di claude.ai:** chat baru per sesi, unggah `kecaknik-food.zip` (zip lengkap terbaru), tempel prompt standar.

**Setelah tiap sesi:** ekstrak ZIP yang dikembalikan menimpa folder, `npm install` bila ada paket baru, jalankan, cek. Baru lanjut sesi berikutnya.

## 1. Prompt standar (dipakai setiap sesi)

```
Lanjutkan proyek Kecaknik Food.
Baca CLAUDE.md, lalu HANDOFF.md. Kerjakan unit berikutnya yang belum selesai sesuai kuota sesi di CLAUDE.md bagian 5. Baca hanya bagian dokumen yang tercantum di kolom Rujukan. Akhiri sesuai format akhir sesi, lalu berhenti.
```

## 2. Prompt unit tertentu

```
Kerjakan hanya unit <U?> proyek Kecaknik Food. Baca CLAUDE.md dan HANDOFF.md, lalu hanya bagian di kolom Rujukan unit itu. Akhiri sesuai format akhir sesi, lalu berhenti.
```

## 3. Prompt perbaikan cepat (satu masalah)

```
Perbaiki satu hal di proyek Kecaknik Food: <jelaskan masalah, sebutkan layar atau file bila tahu>.
Baca CLAUDE.md. Ubah hanya file yang perlu. Patuhi aturan UI di CLAUDE.md bagian 4. Balas maksimal 5 baris: file yang diubah dan alasannya. Catat di Changelog HANDOFF.md.
```

## 4. Prompt audit (setelah U27, opsional)

```
Audit proyek Kecaknik Food tanpa mengubah fitur. Periksa: (1) semua halaman pelanggan memakai PelangganLayout dan footer tampil; (2) tidak ada <button>, <input>, <select> mentah, warna hex, atau px literal di luar tokens.css; (3) nama menolak angka dan nomor menolak huruf, termasuk saat tempel, di semua form; (4) dropdown tidak keluar layar di 360 dan 1440; (5) tidak ada scroll horizontal di 360, 768, 1024, 1440; (6) tidak ada rating, ulasan, diskon, QRIS, atau ongkir di UI. Laporkan dalam tabel (file, masalah, perbaikan), perbaiki yang kecil, dan daftar yang butuh keputusan saya.
```

## 5. Skenario smoke test (untuk U9)

`backend/tests/smoke.mjs`, ujung ke ujung lewat HTTP:
1. Login admin.
2. Buat pesanan tunai.
3. Transfer tanpa bukti harus 400.
4. Split dengan nominal di luar batas harus 400.
5. Nama berisi angka harus 400.
6. PO yang sudah tutup harus ditolak. Campuran PO dan reguler harus ditolak.
7. Pesanan transfer dengan bukti: admin terima 1/2 jumlah menjadi uang_muka, lalu catat tunai sisa menjadi lunas.
8. `GET /orders/kode/:kode` tidak memuat `no_hp` dan `alamat`.
9. `GET /orders` tanpa token harus 401.
10. Transisi status tidak valid harus 409.

## 6. Catatan penting

- **WhatsApp:** `TombolWa` membuka WhatsApp dengan pesan sudah terisi. Pengguna tetap menekan Kirim. Ini bukan bot dan bukan WhatsApp Business API.
- **Data yang belum ada** (rekening, nomor WhatsApp, alamat, koordinat, harga add-on) adalah placeholder di `shared/core/konfigurasi.js` dan seed. Isi sebelum demo atau UAT. Daftarnya ada di `HANDOFF.md`.
- **Sesi terpotong itu normal.** `HANDOFF.md` adalah titik lanjut: pakai prompt standar lagi.
