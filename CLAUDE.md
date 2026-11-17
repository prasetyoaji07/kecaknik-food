# CLAUDE.md: Aturan kerja Kecaknik Food

Baca file ini di awal **setiap sesi**. Setelah itu baca `HANDOFF.md` (Task Board). Dari `STRUKTUR.md` (data, aturan bisnis, API) dan `DESIGN.md` (tampilan, komponen) baca **hanya bagian yang tercantum di kolom Rujukan** unit yang dikerjakan, jangan membaca ulang seluruh dokumen. Jika ada konflik, `STRUKTUR.md` menang untuk logika dan data, `DESIGN.md` menang untuk tampilan. Keduanya menang atas kebiasaan atau tebakan Anda.

## 1. Proyek

Sistem pemesanan makanan untuk **satu brand** (Kecaknik Food), bahan skripsi. Pelanggan **tanpa akun**, admin **satu akun**. Dibangun dari nol.

- Stack: React (Vite, JavaScript), Express.js, MySQL/MariaDB (XAMPP lokal).
- Bahasa UI, nama kolom, endpoint, kelas, dan nama file komponen: **Bahasa Indonesia**.
- Gaya: sticker-food merah, kuning, krem (referensi PickEat, sudah disetujui pemilik). Detail di `DESIGN.md`.

## 2. Struktur dan perintah

```
kecaknik-food/
├── backend/            Express API (port 5000)
├── customer-app/       React, pelanggan (port 5173)
├── admin-app/          React, admin (port 5174)
├── shared/
│   ├── core/           JS murni: validasi, wa, konfigurasi, format (dipakai backend + kedua app)
│   └── ui/             Komponen React + tokens.css (dipakai kedua app)
├── database/           schema.sql + seed.sql
├── CLAUDE.md  STRUKTUR.md  DESIGN.md  PERINTAH.md  HANDOFF.md
└── package.json        npm workspaces
```

Perintah (harus ada dan berfungsi): `npm install` (root), `npm run db:reset`, `npm run dev:backend`, `npm run dev:pelanggan`, `npm run dev:admin`, `npm run lint`, `npm run test`.

## 3. Aturan keras

1. Jangan menambah fitur di luar `STRUKTUR.md` bagian 2. **Dilarang:** QRIS, payment gateway, bot atau API WhatsApp otomatis, akun pelanggan, banyak admin, grafik laporan, ongkir otomatis, pelacakan kurir real-time, kuota pre-order, deployment cloud.
2. Jangan membuka, menampilkan, atau meng-commit `.env`. Sediakan `.env.example`.
3. Harga, total, dan status pembayaran **tidak pernah** dipercaya dari klien. Server menghitung ulang.
4. Semua validasi dilakukan **di server** juga, memakai aturan yang sama dari `shared/core/validasi.js`.
5. Jangan mengarang data bisnis: nomor rekening, nomor WhatsApp, alamat, koordinat toko, harga add-on. Pakai placeholder di `shared/core/konfigurasi.js` dan sebutkan di jawaban.
6. Saat ada hal belum diputuskan, pakai default `D-xx` di `STRUKTUR.md` bagian 3 dan **sebutkan** di jawaban.
7. Setiap perubahan besar: sebut kode `PB-xx`, `BR-xx`, atau `UC-xx` yang dipenuhi.
8. Satu sumber kebenaran: alur status ada di satu modul (`shared/core/statusPesanan.js`). Jangan menulisnya ulang di tempat lain.

## 4. Aturan UI (wajib)

1. **Semua elemen interaktif berasal dari `shared/ui`.** Dilarang memakai `<button>`, `<input>`, `<select>`, `<textarea>` mentah di halaman. Pakai `Button`, `Field`, `Select`, `OptionCard`, `DateField`, dan seterusnya.
2. **Semua warna, ukuran, radius, bayangan, dan jarak dari token** di `shared/ui/tokens.css`. Dilarang hex atau angka px literal di CSS halaman.
3. **Input divalidasi per `kind`.** Kolom nama tidak bisa diketik angka. Kolom nomor tidak bisa diketik huruf. Aturan lengkap di `DESIGN.md` bagian 6 dan `STRUKTUR.md` Lampiran E.
4. **Dropdown selalu komponen `Select`.** Panelnya tidak boleh keluar dari layar (flip, geser, scroll di dalam panel), dan menjadi bottom sheet di layar kecil.
5. **Semua halaman pelanggan memakai `PelangganLayout`** (header pill + footer). Footer tidak boleh hilang di halaman mana pun, termasuk checkout, berhasil, status, dan 404.
6. **Semua layar responsif** dari 360 px sampai 1440 px. Tidak ada scroll horizontal. Target sentuh minimal 44 px.
7. **Tidak boleh terkesan buatan template AI.** Ikuti `DESIGN.md` bagian 11 dan 14. Jika sebuah layar bisa ditukar dengan restoran mana pun tanpa mengubah apa pun, layar itu belum selesai.
8. Tombol WhatsApp memakai `TombolWa` dan templat dari `shared/core/wa.js`. Pesan terisi otomatis dari data pesanan, pengguna tinggal menekan Kirim di WhatsApp.

## 5. Aturan kerja bertahap (WAJIB, anti-limit)

Daftar pekerjaan ada di `HANDOFF.md` → **Task Board** (U1, U2, ...). Pemilik memakai paket gratis, jadi batas pemakaian cepat habis. Kerja kecil yang utuh lebih baik daripada kerja besar yang terpotong.

1. **Kuota per sesi: maksimal 2 unit ringan, atau 1 unit jika bertanda 🔥.** Jangan melebihi.
2. Kerjakan unit **berurutan**, kecuali pemilik meminta lain. Jangan menyentuh unit lain.
3. Mulai hanya unit yang bisa **diselesaikan penuh**. Jika terpaksa setengah, tandai 🟡 dan tulis persis file yang tersisa.
4. Tulis rencana file maksimal 5 baris, lalu **langsung kerjakan** tanpa menunggu persetujuan.
5. Tulis file lewat tool. **Jangan menampilkan isi kode di chat.** Jangan menulis ulang file yang sudah selesai, ubah seperlunya.
6. Terasa mendekati batas: berhenti pada batas file yang utuh (tidak ada file setengah jadi), perbarui `HANDOFF.md`, kirim ZIP.
7. Verifikasi yang tersedia: `node --test` untuk `shared/core`, lint dan build bila `node_modules` ada. Sandbox biasanya **offline**: `npm install` bisa gagal. Jika tidak bisa dijalankan, **jangan klaim lulus**, tulis "belum dijalankan" di `HANDOFF.md`.
8. Aset atau data bisnis belum ada: pakai placeholder, catat di `HANDOFF.md`.
9. Jangan membuat README panjang, laporan, atau dokumen tambahan kecuali diminta.

### Akhir sesi
1. Perbarui `HANDOFF.md`: status unit di Task Board, lalu tambahkan entri Changelog **di atas** riwayat lama (file baru, file diedit, keputusan, default `D-xx`, apa yang belum dijalankan, risiko). Jangan menghapus riwayat.
2. Buat **ZIP lengkap** `kecaknik-food.zip` dengan folder induk `kecaknik-food/`. Jangan sertakan `node_modules/`, `dist/`, `.env`, dan isi `backend/uploads/`. Tampilkan dengan `present_files`.
3. Balasan akhir hanya format ini, lalu **berhenti**:

```
Selesai     : U?, U?
Berikut     : U?, U?
Butuh user  : (aset atau keputusan)
Belum dites : (apa yang belum dijalankan)
Default D-xx: (yang dipakai)
File ZIP    : kecaknik-food.zip (lengkap)
```

### Serah-terima (menimpa)
1. Pemilik memberi `kecaknik-food.zip` ke chat baru, atau menjalankan `claude` di folder proyek.
2. Claude mengekstrak, membaca sesuai urutan, bekerja.
3. Claude mengembalikan **ZIP lengkap**, bukan sebagian. Apa pun yang tidak ada di ZIP baru dianggap hilang.
4. Pemilik mengekstrak dan **menimpa** folder lama, lalu `npm install` bila `package.json` berubah.

## 6. Cara menjawab

- Bahasa Indonesia, singkat, tanpa basa-basi.
- Sebutkan default `D-xx` yang dipakai dan asumsi baru. Jangan menyembunyikannya.
- Jika menemukan konflik antara dokumen dan permintaan, tulis konfliknya dalam satu kalimat dan pilih sisi yang aman (dokumen), jangan diam-diam menyimpang.

## 7. Checklist sebelum menyatakan selesai

- [ ] Berjalan dari database kosong: `db:reset` lalu seed, tanpa error di terminal dan konsol.
- [ ] Tidak ada `<button>`, `<input>`, `<select>` mentah di halaman. Tidak ada warna atau px literal.
- [ ] Nama menolak angka. Nomor WhatsApp menolak huruf. Tempel teks juga disaring.
- [ ] Dropdown tidak keluar layar di lebar 360 dan 1440.
- [ ] Footer tampil di semua halaman pelanggan.
- [ ] Diuji di lebar 360, 768, 1024, 1440 tanpa scroll horizontal.
- [ ] Tidak ada QRIS, rating, ulasan, atau diskon di UI.
- [ ] `HANDOFF.md` terbarui (Task Board dan Changelog). ZIP lengkap, tanpa `node_modules`, `dist`, `.env`.
