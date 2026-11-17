# HANDOFF: Kecaknik Food

> Update di akhir setiap sesi. Jangan hapus riwayat lama, tambahkan di atas.

## Task Board
Legenda: ⬜ belum · 🟡 sebagian · ✅ selesai · 🔥 berat (kuota sesi jadi 1 unit)
Kuota per sesi: **2 unit ringan** atau **1 unit jika ada 🔥**. Kerjakan berurutan.
Rujukan = bagian dokumen yang **boleh dibaca** untuk unit itu (jangan baca seluruh dokumen).

### Tahap A: Fondasi dan backend
| Unit | Pekerjaan | Rujukan | Status |
|---|---|---|---|
| U1 | Kerangka: `package.json` root (workspaces, skrip), `backend/package.json`, `.gitignore`, `backend/.env.example`, `package.json` kosong untuk customer-app, admin-app, shared | CLAUDE §2, STRUKTUR §5.1 | ✅ |
| U2 🔥 | `database/schema.sql`, `seed.sql` (20 produk, opsi contoh harga 0 bertanda TBD, 1 PO contoh), skrip `db:reset` | STRUKTUR §6, Lamp. A, B | ✅ (SQL belum dijalankan, lihat Changelog) |
| U3 | `shared/core`: `konfigurasi.js`, `format.js`, `statusPesanan.js` + uji `node:test` | STRUKTUR §8, Lamp. F | ✅ |
| U4 | `shared/core`: `validasi.js`, `wa.js` + uji (nama tolak angka, telepon 08/+62/8 jadi 62, kode, nominal, batas 1500 karakter pesan WA) | STRUKTUR Lamp. D, E | ✅ |
| U5 | Backend dasar: `index.js`, `db.js`, middleware `auth`, `upload`, `batasan`, `galat` | STRUKTUR §7 (BR-12, 13, 16), §9 | ✅ (belum dijalankan) |
| U6 | Routes `auth`, `products`, `opsi` | STRUKTUR §9 | ✅ (rute belum dijalankan) |
| U7 🔥 | `services/hitungPesanan.js`, `services/statusPembayaran.js`, route `orders` | STRUKTUR §7, §8, §9 | ✅ (route belum dijalankan, lihat Changelog) |
| U8 | Routes `pembayaran`, `laporan` | STRUKTUR §7 (BR-07, 08), §9 | ✅ (belum dijalankan) |
| U9 | `backend/tests/smoke.mjs` + verifikasi (tulis lulus / tidak dijalankan karena …) | PERINTAH.md bagian "smoke" | ✅ (ditulis, **tidak dijalankan**: sandbox tanpa MySQL) |

### Tahap B: Komponen bersama dan aplikasi pelanggan
| Unit | Pekerjaan | Rujukan | Status |
|---|---|---|---|
| U10 🔥 | `shared/ui`: `tokens.css` (persis DESIGN §2), font lokal, `Button`, `Field` (semua kind), `Select` (Radix) | DESIGN §2, 3, 5, 6, 7 | ✅ (belum dijalankan di browser, lihat Changelog) |
| U11 | `shared/ui`: `Logo`, `OptionCard`, `Checkbox`, `Radio`, `DateField`, `Badge`, `Stiker`, `Chip`, `Stepper` | DESIGN §3 (Logo), 5 | ✅ (belum dijalankan di browser, lihat Changelog) |
| U12 | `shared/ui`: `Modal`, `Laci`, `Toast`, `Dropzone`, `KeadaanKosong`, `Rangka` | DESIGN §5 | ✅ (belum dijalankan di browser; Modal dan Laci belum dirender, lihat Changelog) |
| U13 🔥 | `shared/ui`: `KartuProduk`, `FotoProduk`, `GrupOpsi`, `BarisKeranjang`, `Timeline`, `PanelRekening` | DESIGN §5, 12 | ⬜ |
| U14 | `shared/ui`: `PetaPilih`, `PetaRute`, `TombolWa` | DESIGN §5, STRUKTUR Lamp. D | ⬜ |
| U15 | `shared/ui`: `HeaderSitus`, `FooterSitus`, `PelangganLayout`, `index.js` | DESIGN §8, 9 | ⬜ |
| U16 | customer-app: kerangka Vite, rute, API klien, keranjang (localStorage) | STRUKTUR §5.2, §9 | ⬜ |
| U17 🔥 | customer-app: Beranda, Menu, Preorder, modal opsi | DESIGN §10 (1 sampai 4), 11, 12 | ⬜ |
| U18 🔥 | customer-app: Checkout (transfer, tunai, split) | DESIGN §10 (5), STRUKTUR BR-07, BR-17 | ⬜ |
| U19 | customer-app: Berhasil, Status (polling 5 detik), Lacak, 404 | DESIGN §10 (6 sampai 9), STRUKTUR Lamp. C.3 | ⬜ |
| U20 | Lint dan build customer-app lulus, perbaikan 10 butir "Perbaikan dari layar yang sudah dibuat" | DESIGN §10, 15 | ⬜ |

### Tahap C: Admin dan penyelesaian
| Unit | Pekerjaan | Rujukan | Status |
|---|---|---|---|
| U21 | `shared/ui`: `AdminLayout`, `TabelData`, `Tab`, `KartuStat`, `Switch` | DESIGN §5, 9 | ⬜ |
| U22 | admin-app: kerangka, Login, penjaga JWT | DESIGN §10 (10), STRUKTUR §9 | ⬜ |
| U23 🔥 | admin-app: Pesanan, DetailPesanan | DESIGN §10 (11, 12), STRUKTUR Lamp. C.4, D.3 | ⬜ |
| U24 | admin-app: InputManual | DESIGN §10 (13) | ⬜ |
| U25 | admin-app: Produk + editor opsi | DESIGN §10 (14) | ⬜ |
| U26 | admin-app: Laporan | DESIGN §10 (15) | ⬜ |
| U27 | Audit lintas aplikasi (`<button`, `<input`, `<select`, hex, px literal), lint, build, smoke | DESIGN §14, 15 | ⬜ |
| U28 | `UJI_BLACKBOX.md` (opsional, tabel uji per fitur untuk Bab 4) | STRUKTUR §11 | ⬜ |

Rencana sesi berikutnya (**Sesi 9**): **U13** 🔥 (satu unit saja). Sebelumnya, di komputer Anda: `npm install` (memasang `@radix-ui/react-dialog` yang baru di `shared`), `npm test` (harus **91 lulus**). Backend masih menunggu verifikasi (`npm run db:reset`, `npm run dev:backend`, `npm test -w backend`); laporkan hasilnya. UI belum bisa dilihat sampai U16 (kerangka Vite).

## Status saat ini
- **Stack:** React (Vite, JavaScript) + Express + MySQL/MariaDB (XAMPP). Final.
- **Sudah ada di folder (ringkasan lama, kini juga U8 dan U9):** 5 dokumen, logo, kerangka npm workspaces (U1), database (U2), `shared/core` lengkap beserta uji (U3, U4), backend dasar (U5), rute `auth`, `products`, `opsi` (U6), serta `orders` dan servis hitung pesanan dan status pembayaran (U7), komponen dasar `shared/ui` (U10) dan U11, U12 (lihat Changelog Sesi 8).
- **Belum ada:** komponen UI U13 dst dan kedua aplikasi (customer-app, admin-app). Backend lengkap secara kode (U1 sampai U9) tetapi **belum terverifikasi terhadap MySQL**.

## Data bisnis yang menunggu pemilik
| Item | Status |
|---|---|
| D-15 Rekening: DANA nomor ✅ (6281999915104). Atas nama DANA, serta BCA, BRI, GoPay (nomor dan atas nama) → `shared/core/konfigurasi.js` | 🟡 |
| D-16 Nomor WhatsApp admin (`waAdmin`, format 62…) | ✅ 6281999915104 |
| D-17 Alamat, jam buka, koordinat toko | ⏳ |
| D-01 Nama dan harga opsi add-on tiap produk | ⏳ |
| Foto produk asli (20 produk, tiap produk berbeda) → `backend/uploads/produk/` | ⏳ |
| Ejaan merek resmi: Kecaknik atau KeCaNick (logo bertuliskan KeCaNick) | ⏳ |
| `favicon.png` 180×180 untuk `customer-app/public` dan `admin-app/public` | ⏳ |

## Aset
| Aset | Status |
|---|---|
| `shared/ui/assets/logo-kecaknik.jpeg` | ✅ ada (disarankan versi yang sudah dipangkas, 720×450) |
| Font | via `@fontsource` (perlu internet saat `npm install`) |

## Keputusan
- (U11, U12) **Berkas tambahan:** `Dropzone/aturanDropzone.{js,test.js}` (periksa jpg/png/webp, maks 2 MB, 5 uji; `MAKS_BYTE` sengaja sama dengan backend), `.hanya-baca` di `dasar.css` (teks khusus pembaca layar, dipakai `Stepper` dan `Dropzone`).
- (U11, U12) **Token baru (turunan, bukan warna baru)** di blok kedua `tokens.css`: `--lebar-modal`, `--lebar-laci` (30rem = 480 px), `--lebar-toast`, `--tinggi-lembar-maks`, `--tabir` (satu-satunya rgba baru, untuk latar redup), `--garis-putus`, `--kotak-pilih`, `--lebar-stepper`. **Pertimbangkan menambahkan ke DESIGN §2.**
- (U11) **API:** `Logo` (`ukuran`, `href` atau `as`), `OptionCard` (`legenda`, `nilai`, `onUbah`, `opsi[{nilai,label,deskripsi,ikon,nonaktif}]`), `Checkbox` dan `Radio` (`label`, `akhiran`, `terpilih`, `onUbah`), `DateField` (`nilai` 'YYYY-MM-DD', `min`, `maks`), `Badge` (`jenis` status|bayar|kanal|tipe, `nilai`, `tipePesanan`), `Stiker` (`warna`, `indeks`), `Chip` + `BarisChip`, `Stepper` (`nilai`, `onUbah`, bawaan 1 sampai 99).
- (U11) `Badge` memakai `labelStatus`/`labelPembayaran` dari `statusPesanan.js` (satu sumber). Nilai kanal mengikuti `konfigurasi.kanal` (website, whatsapp, facebook, langsung). Nilai tak dikenal tidak menampilkan apa pun. Warna status: menunggu kuning, selesai dan siap diambil hijau, dibatalkan dan belum dibayar merah (garis), lainnya netral. Lime tidak dipakai di Badge (DESIGN §2: hanya kotak info dan opsi terpilih).
- (U12) **API:** `Modal` (`buka`, `onTutup`, `judul`, `deskripsi`, `footer`, `tutupLuar`), `Laci` (`buka`, `onTutup`, `judul`, `footer`), `Toast` lewat `<ToastProvider>` di akar app lalu `useToast()` dengan `.berhasil/.galat/.info(pesan)`, `Dropzone` (`nilai` File atau null, `onUbah`, `urlAwal`, `galat`), `KeadaanKosong` (`ilustrasi` keranjang|cari|toples, `judul`, `deskripsi`, `tindakan`), `Rangka` (`bentuk` teks|kartu|baris|foto, `jumlah`). Toast buatan sendiri (tanpa Radix Toast), maks 3, galat bertahan 7 detik, lainnya 4 detik.
- (U11, U12) Elemen `<input>` dan `<button>` mentah **ada di dalam komponen `shared/ui`** (Checkbox, Radio, OptionCard, Stepper, DateField, Dropzone, Chip, tombol tutup Toast). Itu sah, aturan CLAUDE §4.1 hanya melarangnya di halaman. Audit U27 harus **mengecualikan folder `shared/ui`**.
- (U10) **`tokens.css`:** blok pertama **persis DESIGN §2**. Blok kedua (turunan, bukan warna baru) menambah: `--font-display`, `--font-isi`, skala tipografi `--teks-h1/h2/h3/isi/kecil`, `--ring` (3 px kuning) dan `--ring-offset`, `--tekan` (geser tombol), `--lebar-panel-min` dan `--tinggi-panel-maks` (Select). Alasannya agar CSS komponen bebas px dan hex. **Pertimbangkan menambahkan blok ini ke DESIGN §2.** `dasar.css` (reset ringan, fokus global, `prefers-reduced-motion`, gaya `h1..h3`, latar krem) dimuat dari `index.js`; bukan token.
- (U10) **Satu-satunya px literal di luar tokens.css** ada di `@media (max-width: 767px)` (breakpoint tidak bisa memakai `var()`). Audit U27 harus mengecualikan baris `@media`.
- (U10) **Props berbahasa Indonesia:** `Button` (`variasi`, `ukuran`, `memuat`, `nonaktif`, `ikonKiri`, `ikonKanan`, `penuh`, `alasan`, `as`), `Field` (`kind`, `label`, `nilai`, `onUbah(teks)`, `bantuan`, `galat`, `awalan`, `akhiran`, `wajib`, `nonaktif`, `baris`, `min`, `maks`, `maksKarakter`), `Select` (`label`, `nilai`, `onUbah(nilai)`, `opsi[{nilai,label,nonaktif}]`, `placeholder`, `bantuan`, `galat`, `wajib`, `nonaktif`). Nilai `''` = belum memilih; `opsi[].nilai` tidak boleh teks kosong (aturan Radix).
- (U10) **`Button`** memakai `aria-disabled` (bukan `disabled`) saat nonaktif atau memuat: tetap bisa difokus, klik diblokir (`preventDefault`, jadi submit juga tertahan). `alasan` tampil sebagai teks bantu di bawah tombol bila `nonaktif`. Tombol hanya ikon tanpa `aria-label` memberi peringatan konsol di dev.
- (U10) **`Field`:** penyaringan di `onChange` (termasuk tempel), `onBeforeInput` hanya mempercepat. Petunjuk 3 detik ("Nama hanya boleh huruf.") bila karakter terbuang; spasi ganda, `+`, `-`, titik ribuan tidak memicunya. Galat otomatis baru muncul setelah blur; prop `galat` dari induk menimpa. Nilai di induk **tidak dinormalisasi** (telepon tetap seperti diketik; tampilan `+62 812 3456 7890` hanya saat tidak fokus, rupiah `Rp75.000` saat tidak fokus). Induk wajib memanggil `validasi*()` dari `shared/core/validasi.js` saat kirim. `onBlur` merapikan nama (spasi ganda) dan memangkas teks. Form harus `noValidate`.
- (U10) **`Select`:** Radix Select posisi `popper` (`collisionPadding` 12, `sideOffset` 8), panel di-portal. Bottom sheet di bawah 768 px lewat `Select/lembar.css` (CSS biasa, menimpa wrapper Radix dengan `!important` dan `:has()`), plus tabir redup. Perlu browser yang mendukung `:has()` (Chrome 105+, Safari 15.4+, Firefox 121+).
- (U10) Berkas tambahan: `BungkusBidang` (internal, label/bantuan/galat bersama Field dan Select, tidak diekspor), `Field/aturanField.js` (logika murni + uji), `gabung.js`, `fonts.js`, `dasar.css`. `shared/ui/index.js` sudah dibuat dan mengekspor tiga komponen; **U11 sampai U15 menambah ekspor**, bukan membuat ulang.
- (U8) `POST /orders/:id/pembayaran` (admin, JSON atau multipart `bukti`): `{ metode, channel, jumlah, catatan }`, langsung `diterima`, 201 + detail pesanan. Ditolak 409 bila pesanan `dibatalkan`. Mengisi `orders.metode_bayar` bila masih NULL. Kelebihan bayar = 400 (transaksi dibatalkan oleh `sinkronPembayaran`). Berada di `routes/pembayaran.js` (ekspor bernama `pembayaranPesanan`, dipasang di `/orders`).
- (U8) `PATCH /pembayaran/:id`: `{ status, jumlah?, catatan? }`. `diterima` (dari menunggu, jumlah boleh dikoreksi), `ditolak` (dari menunggu, catatan wajib), `dikembalikan` (dari diterima, catatan wajib, **hanya bila pesanan sudah `dibatalkan`**, 409 bila belum). Transisi lain 409 (`statusPesanan.js`). Respons = detail pesanan admin. Kunci: pesanan dulu, lalu baris pembayaran.
- (U8) `GET /laporan?periode=harian|bulanan&dari&sampai`: bawaan harian 30 hari terakhir, bulanan 12 bulan; maks 366 hari; hanya periode yang punya pesanan yang muncul (tidak diisi nol). Respons `{ periode, dari, sampai, baris[{ periode, jumlah_pesanan, total_tagihan, total_diterima }], ringkasan }`. Logika rentang di `services/laporan.js` (diuji).
- (U7) **Servis:** `hitungPesanan(masukan, produkTersedia)` murni (tanpa DB), menerima hasil `daftarProduk({ publik: true })`, mengembalikan `{ items, total, tanggal_ambil }`. `statusPembayaran.js`: `tentukanStatusPembayaran`, `sisaBayar`, dan `sinkronPembayaran(koneksi, orderId)` yang **harus dipanggil U8** di dalam `transaksi()` setiap kali baris pembayaran berubah (mengunci pesanan, menjumlah baris `diterima`, menolak kelebihan bayar D-13). Berkas tambahan di luar rencana: `services/pesanan.js` (`ambilPesananAdmin`, `ambilStatusPublik`, `cariPesananByKode`, dipakai ulang U8) dan `denganBersihFile` dipindah ke `middleware/upload.js` (dipakai `products.js` dan `orders.js`).
- (U7) **Manual admin memakai aturan produk yang sama dengan pelanggan** (aktif, PO dalam rentang tanggal), karena `daftarProduk({ publik: true })`. Pesanan campur reguler dan PO ditolak dan harus dipecah (D-08).
- (U7) **Tambahan kontrak `GET /orders`:** `status` menerima juga `aktif` dan `riwayat`; `batas` (default 100, maks 200) dan `mulai`. Respons berupa larik baris ringkas + `jumlah_item`, `sisa`, `menunggu_verifikasi` (ada pembayaran `menunggu`). Detail `GET /orders/:id` memuat `items[].opsi[]`, `pembayaran[]` (urut terlama ke terbaru, `bukti_url`), `sisa`.
- (U7) **`POST /orders`:** tunai = JSON; transfer dan split = multipart (`bukti`, `items` teks JSON). Tunai disertai file bukti = 400. Transfer: `jumlah` baris = total. Split: `nominal_transfer` divalidasi BR-17, baris transfer `menunggu`. Respons 201 `{ kode_pesanan, total }`. Kode `KCK-XXXXXX` acak, coba ulang 5 kali bila bentrok.
- (U7) **`POST /orders/manual`:** body sama ditambah `sumber`; `no_hp` boleh kosong bila sumber `langsung`; koordinat opsional. `pembayaran: { metode: 'tunai'|'transfer', channel, jumlah, catatan }` opsional, dicatat langsung `diterima` (`dicatat_oleh = 'admin'`), lalu `sinkronPembayaran`; transfer tanpa file `bukti` wajib `catatan` (BR-07). `metode_bayar` bawaan = metode pembayaran awal, atau NULL. Respons 201 = detail admin.
- (U7) **`GET /orders/kode/:kode`:** format kode salah = 400, tidak ada = 404. Menyertakan `tanggal_ambil` (PO) selain isi kontrak. `toko {lat,lng}` dari `konfigurasi.js` (masih null sampai D-17 diisi). **`POST /orders/kode/:kode/bukti`:** hanya bila baris pembayaran terakhir `ditolak` dan pesanan belum final, selain itu 409. Jumlah dan channel disalin dari baris yang ditolak (channel boleh diganti).
- (U7) **`PATCH /orders/:id/status`:** `{ status, alasan_batal }`. Transisi tak sah = 409, status di luar daftar = 400. Pembatalan **tidak** otomatis mengubah baris pembayaran: admin menandainya `dikembalikan` lewat `PATCH /pembayaran/:id` (U8, BR-10).
- (U6) `POST /auth/login` menerima `{ password }` (kontrak) dan `{ sandi }` sebagai alias. Mengembalikan `{ token, kedaluwarsa }`. Sandi salah = 401.
- (U6) **Tambahan kontrak:** `GET /products/semua` (admin) mengembalikan semua produk termasuk nonaktif dan semua opsi, untuk halaman Kelola produk (U25). `GET /products` publik tetap hanya produk aktif, PO di luar rentang tanggal disembunyikan (D-09), opsi nonaktif disembunyikan.
- (U6) Bentuk produk di respons: kolom produk, `aktif`/`is_preorder` sebagai boolean, `gambar_url` (`/uploads/produk/<nama>`), dan `grup[{ id, nama, tipe, wajib, min_pilih, max_pilih, urutan, muncul_setelah_grup_id, opsi[{ id, nama, harga_tambah, butuh_teks, label_teks, aktif, urutan }] }]`.
- (U6) `POST/PUT /products`: JSON atau multipart (foto di field `foto`). PUT mempertahankan kolom yang tidak dikirim. Produk PO wajib tiga tanggal, urutan buka ≤ tutup ≤ ambil. Bukan PO: tanggal dibuang. Kategori harus salah satu dari `kategoriProduk` (`shared/core/konfigurasi.js`). Nama produk memakai `validasiTeks`, bukan `validasiNama`, karena boleh berangka ("Nastar 250 gr").
- (U6) `PUT /products/:id/opsi`: payload `{ grup: [{ id?, kunci?, nama, tipe, wajib, min_pilih, max_pilih, muncul_setelah, opsi: [{ nama, harga_tambah, butuh_teks, label_teks, aktif }] }] }`. `muncul_setelah` = `kunci` (atau `id`) grup lain yang harus berada **di atas**. Urutan = urutan larik. `pilih_satu` otomatis min wajib?1:0, max 1. Minimal 1 opsi per grup, maks 10 grup dan 30 opsi. Larik kosong = hapus semua grup. Satu transaksi, grup lama dihapus lalu dibuat ulang (id berganti; `order_item_opsi.opsi_id` menjadi NULL, snapshot tetap).
- (U6) `DELETE /products/:id` menghapus produk, grup, opsi, dan file foto. Riwayat pesanan aman karena snapshot.
- (U6) `middleware/galat.js` tidak lagi mengimpor `env.js` (agar `npm test` tidak butuh `.env`). Validasi produk dipisah ke `services/validasiProduk.js` (murni, diuji) dan pembacaan DB ke `services/produk.js` (`daftarProduk`, `ambilProduk`, dipakai ulang oleh U7).
- (U4) `validasi*()` menolak masukan yang melanggar, tidak memperbaikinya diam-diam (BR-19, uji "nama berisi angka harus 400"). `saring*()` hanya untuk klien saat mengetik/menempel. Telepon: hanya `+`, spasi, `-` yang dibuang, huruf ditolak.
- (U4) Templat admin dipilih otomatis: status akhir/pengantaran dulu, lalu `bukti_ditolak` bila **baris pembayaran terakhir** ditolak (bukan sekadar pernah ditolak, agar tidak muncul setelah bukti diunggah ulang), lalu `uang_muka`, `lunas` (saat `diproses`), lalu `konfirmasi`. Admin tetap bisa mengganti lewat `Select`.
- (U4) Larik `pembayaran` pada data pesanan harus urut dari terlama ke terbaru (dipakai `wa.js`).
- (U5) Berkas tambahan di luar §5.1: `backend/src/env.js` (muat `.env` dari folder backend dan periksa variabel; keluar bila `ADMIN_PASSWORD`/`JWT_SECRET` kosong).
- (U5) Rute belum dipasang di `index.js`: baris `app.use(...)` sudah disiapkan sebagai komentar, aktifkan di U6 sampai U8.
- (U5) `/uploads` dilayani statis (D-11). `GalatHttp`, `galat400/401/404/409`, `bungkus()` (pembungkus handler async Express 4) ada di `middleware/galat.js`; `kueri()` dan `transaksi()` di `db.js`; `cekSandi()`, `buatToken()`, `wajibAdmin` di `middleware/auth.js`; `unggah(field, folder)` dan `hapusFile()` di `middleware/upload.js`.
- Label status `pending` ditampilkan "Menunggu" (asumsi U3; DESIGN belum dibaca). Ubah di `statusPesanan.js` bila DESIGN menetapkan lain.
- `rupiah()` tanpa spasi (`Rp75.000`) sesuai STRUKTUR Lamp. E. Masukan tidak valid menghasilkan teks kosong.
- `tanggal()` memakai WIB. `YYYY-MM-DD` dibaca apa adanya. Backend harus memakai `dateStrings: true` pada koneksi MySQL (U5).

## Catatan / masalah terbuka
- `npm run db:reset` menjalankan `database/reset.mjs` yang dibuat di U2.
- `dev:pelanggan` dan `dev:admin` baru berfungsi setelah U16 dan U22 melengkapi `package.json` aplikasi (Vite, React, skrip `dev` dan `build`).
- `npm test` di root memakai `node --test` (menemukan `*.test.js`). Uji `backend/tests/smoke.mjs` dijalankan terpisah lewat `npm test -w backend` (U9).

## Changelog
- **Sesi 8 (U11, U12):**
  - File baru U11: `shared/ui/{Logo,OptionCard,Checkbox,Radio,DateField,Badge,Stiker,Chip,Stepper}/*.{jsx,module.css}`. File baru U12: `shared/ui/{Modal,Laci,Toast,Dropzone,KeadaanKosong,Rangka}/*.{jsx,module.css}`, `Dropzone/aturanDropzone.{js,test.js}`. Diedit: `shared/ui/{index.js,tokens.css,dasar.css}`, `shared/package.json` (+`@radix-ui/react-dialog`), `HANDOFF.md`.
  - Dipenuhi: aturan UI CLAUDE §4 butir 1, 2, 3 (komponen, token, validasi Stepper hanya angka), DESIGN §3 (Logo: lencana krem, cadangan teks, tautan beranda), §4 (gerak tekan, fokus), §5 (katalog komponen U11 dan U12), §7 (Modal dan Laci di atas Radix Dialog), D-14 (Stepper 1 sampai 99).
  - Dijalankan: `node --test` **91 lulus** (86 + 5 uji Dropzone; `@kecaknik/shared` ditautkan sementara di sandbox). Sintaks semua `.jsx` dan `.css` diperiksa dengan esbuild. Dirender ke HTML (react-dom/server, CSS Modules dibundel, ikon di-stub): `Badge`, `Stiker`, `Stepper`, `Checkbox`, `Radio`, `OptionCard`, `Logo`, `DateField`, `BarisChip`, `KeadaanKosong`, `Rangka`, `Dropzone` (keadaan kosong). Markup, ARIA, dan kelas sesuai. Audit hex dan px literal di CSS komponen baru: bersih (kecuali `@media`).
  - **Belum dijalankan:** tampilan di browser (belum ada app Vite sampai U16), `Modal` dan `Laci` (Radix Dialog tidak terpasang di sandbox, hanya sintaks), `Toast` (hanya sintaks), interaksi `Dropzone` (seret, ganti, hapus), `Stepper` saat diketik, `npm run lint`. Risiko: selektor `:has()` (OptionCard, Dropzone), `100dvh` di `--tinggi-lembar-maks` (Safari 15.4+), `Modal` di desktop memakai `transform` untuk memusatkan sambil beranimasi, `Dialog.Description` tidak dipasang bila `deskripsi` kosong (Radix bisa memberi peringatan konsol; sudah diredam dengan `aria-describedby={undefined}`), ikon lucide-react `CircleCheck` dan `CircleAlert` (butuh versi baru, sama seperti U10).
  - Belum ada: `favicon.png`, foto produk, dan data bisnis (D-01, D-15 sebagian, D-17) tetap menunggu pemilik. Default D-xx baru: tidak ada.
- **Sesi 7 (U10):**
  - File baru: `shared/ui/{tokens.css,dasar.css,fonts.js,gabung.js,index.js}`, `Button/Button.{jsx,module.css}`, `Field/Field.{jsx,module.css}`, `Field/aturanField.{js,test.js}` (5 uji), `Select/Select.{jsx,module.css}`, `Select/lembar.css`, `BungkusBidang/BungkusBidang.{jsx,module.css}`. Diedit: `shared/package.json` (+`@radix-ui/react-select`, `lucide-react`, `@fontsource/archivo-black`, `@fontsource/inter`; peer `react`, `react-dom` 18), `HANDOFF.md`.
  - Dipenuhi: aturan UI CLAUDE §4 butir 1 sampai 4 (komponen dasar, token, validasi per kind, Select), BR-19 sisi klien, DESIGN §2, 4 (gerak tekan, fokus), 6, 7.
  - Dijalankan: `node --test` **86 lulus** (81 + 5). Sintaks semua `.jsx` diperiksa dengan esbuild. `Button` dan `Field` dirender ke HTML (react-dom/server, CSS Modules dibundel, ikon di-stub): markup, ARIA, dan kelas sesuai. Audit hex/px di CSS komponen: bersih (kecuali `@media`).
  - **Belum dijalankan:** tampilan di browser (belum ada app Vite sampai U16), `Select` (Radix tidak terpasang di sandbox, hanya diperiksa sintaksnya), `npm run lint` (konfigurasi ESLint belum mengenal JSX React: variabel komponen bisa dilaporkan "unused"; dibereskan di U16 saat `eslint-plugin-react` ditambahkan). Risiko: nama ikon `CircleAlert` (lucide-react ≥ 0.4xx), selektor `:has()` pada `lembar.css`, `import.meta.env?.DEV` di `Button` (aman di Vite).
  - Belum ada: font hanya terpasang lewat impor `@fontsource` (perlu `npm install`). `favicon.png` dan foto produk tetap menunggu pemilik.
- **Sesi 6 (U8, U9):**
  - File baru: `backend/src/routes/{pembayaran,laporan}.js`, `services/laporan.js`, `services/laporan.test.js` (5 uji), `backend/tests/smoke.mjs`. Diedit: `index.js` (tiga rute baru dipasang), `HANDOFF.md`.
  - Dipenuhi: BR-07 (pengecualian transfer tanpa bukti), BR-08, BR-10 (sisi pembayaran), BR-11, D-05, D-06, D-13; PB pembayaran, verifikasi, dan laporan.
  - `smoke.mjs`: 12 skenario (10 dari PERINTAH.md + unggah ulang bukti/dikembalikan + input manual/laporan). Membaca `ADMIN_PASSWORD` dari `backend/.env`; keluar dengan pesan "Tidak dijalankan" (kode 2) bila server mati. Menambah data uji ke DB (bersihkan dengan `npm run db:reset`).
  - Dijalankan: `node --test` **81 lulus**, `node --check` semua berkas. **Tidak dijalankan:** smoke test dan semua route (sandbox tanpa MySQL, tanpa `npm install`), `npm run lint`. Risiko: `DATE_FORMAT(created_at, ?)` dengan `GROUP BY periode` (alias) bisa ditolak mode `ONLY_FULL_GROUP_BY` pada MySQL 8; bila galat, ganti ke `GROUP BY DATE_FORMAT(created_at, ?)` atau ulangi ekspresi.
- **Sesi 5 (U7):**
  - File baru: `backend/src/services/{hitungPesanan,statusPembayaran,pesanan}.js`, `hitungPesanan.test.js` (13 uji), `statusPembayaran.test.js` (4 uji), `routes/orders.js` (7 endpoint: `POST /orders`, `POST /orders/manual`, `GET /orders/kode/:kode`, `POST /orders/kode/:kode/bukti`, `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status`). Diedit: `index.js` (rute `/orders` aktif), `middleware/upload.js` (+`denganBersihFile`), `routes/products.js` (memakai `denganBersihFile` dari upload.js), `HANDOFF.md`.
  - Dipenuhi: BR-01 sampai BR-05, BR-06, BR-07 (sisi pembuatan), BR-09, BR-10 (sisi status), BR-14, BR-15, BR-17, BR-19, D-08, D-13, D-14.
  - Dijalankan: `node --test` **76 lulus** (59 lama + 17 baru; `@kecaknik/shared` ditautkan manual di sandbox), `node --check` semua berkas backend.
  - **Belum dijalankan:** seluruh route `orders` terhadap MySQL dan HTTP (sandbox tanpa MySQL dan tanpa `npm install`), `npm run lint`. Risiko: `INSERT ... VALUES ?` bertingkat dan `NOT IN (?)` mengandalkan ekspansi `query()` mysql2; `const [[o]] = await k.query(...)` memakai koneksi transaksi; kolom `EXISTS(...)` dikembalikan sebagai 0/1; multer memproses multipart sebelum `express.json` tidak bentrok (JSON dilewati multer). Bila ada galat, kirim pesan lengkapnya.
  - Uji cepat setelah `npm run dev:backend` (PowerShell, ganti `ID` dengan id produk reguler dari `GET /products`):
    `curl.exe -X POST http://localhost:5000/orders -H "Content-Type: application/json" -d "{\"tipe_pesanan\":\"ambil\",\"nama_pelanggan\":\"Budi\",\"no_hp\":\"081234567890\",\"metode_bayar\":\"tunai\",\"items\":[{\"product_id\":ID,\"qty\":1}]}"`
- **Sesi 4 (U6):**
  - File baru: `backend/src/routes/{auth,products,opsi}.js`, `services/{produk,validasiProduk}.js`, `services/validasiProduk.test.js` (13 uji). Diedit: `index.js` (rute dipasang), `middleware/galat.js`, `shared/core/konfigurasi.js` (+`kategoriProduk`, +1 uji), `HANDOFF.md`.
  - Dipenuhi: PB produk dan add-on (K-05, 2.2), BR-02 sisi tampil (D-09), BR-12, BR-13 (foto produk), BR-16.
  - Dijalankan: `node --test` (59 uji lulus; `@kecaknik/shared` ditautkan manual di sandbox, di komputer Anda otomatis oleh `npm install`). `node --check` semua berkas.
  - **Belum dijalankan:** semua route terhadap MySQL nyata (sandbox tanpa DB), `npm run lint`. Risiko: `INSERT ... VALUES ?` dan `IN (?)` dengan larik mengandalkan ekspansi `pool.query` mysql2; `import '@kecaknik/shared/...'` dari backend baru pertama kali dipakai.
- **Sesi 3 (U4, U5):**
  - File baru U4: `shared/core/validasi.js`, `wa.js`, `validasi.test.js`, `wa.test.js` (BR-18, BR-19, K-09, K-13, Lamp. D dan E).
  - File baru U5: `backend/src/{env,db,index}.js`, `middleware/{galat,auth,batasan,upload}.js` (BR-12, BR-13, BR-16, D-11, D-20).
  - File diedit: `shared/core/format.js` (`tanggal()` kini membaca `'YYYY-MM-DD HH:MM:SS'` tanpa zona sebagai WIB, sesuai keluaran MySQL `dateStrings`) + 1 uji; `HANDOFF.md`.
  - Dijalankan: `node --test` (46 uji lulus; diuji dengan TZ=UTC, Asia/Jakarta, America/New_York). `node --check` lulus untuk semua berkas backend.
  - **Belum dijalankan:** server backend (sandbox tanpa npm install dan MySQL), `npm run lint`. Risiko: `pool.pool.on('connection', ...)` pada mysql2/promise dan opsi `decimalNumbers`; jika galat saat start, laporkan pesan lengkapnya.
  - Default D-xx: D-11 (folder statis, nama acak 32 heksa), D-14 (qty maks 99), D-20 (login 10/menit, lacak 60/menit, dalam memori).
- **Sesi 2 (U2):**
  - File baru: `database/schema.sql` (7 tabel sesuai §6, FK dan CHECK), `database/seed.sql` (20 produk Lamp. A, 3 grup + 6 opsi Lamp. B, 1 PO contoh), `database/reset.mjs` (skrip `db:reset`).
  - `db:reset`: DROP lalu CREATE database `DB_NAME` (bawaan `kecaknik_food`), jalankan schema dan seed, cetak ringkasan. Ditolak bila `NODE_ENV=production`. Tanpa `backend/.env`, dipakai bawaan XAMPP (root, tanpa sandi).
  - Asumsi: PO contoh = **Aneka bolu jadul** (id 5), tanggal relatif hari reset: buka hari ini, tutup +14 hari, ambil +16 hari. Smoke test PO tutup (U9) harus membuat PO tertutup sendiri lewat API.
  - Opsi contoh: Puding ultah (Lilin umur 1/2/3 lilin wajib; Lilin nama muncul setelah Lilin umur, `butuh_teks`), Pizza mozarella (Topping A, Topping B). **Semua harga_tambah = 0, TBD D-01**, ditandai komentar SQL. D-02: harga tetap per opsi.
  - `order_items.product_id` tanpa FK (rujukan, STRUKTUR 6.5). `order_item_opsi.opsi_id` FK ON DELETE SET NULL.
  - Zona waktu: `reset.mjs` memakai `+07:00`. `db.js` (U5) harus mengatur hal yang sama dan `dateStrings: true`.
  - **Belum dijalankan:** seluruh SQL dan `reset.mjs` (sandbox tanpa MySQL). `node --check reset.mjs` lulus. Risiko: sintaks CHECK pada MariaDB XAMPP lama (<10.2).
- **Pasca-Sesi 1:** pemilik memberi nomor WhatsApp admin dan DANA (6281999915104) → `konfigurasi.js` dan ujinya diperbarui. Tabel 20 produk dari pemilik dicocokkan dengan STRUKTUR Lamp. A: identik, tidak ada perubahan seed. `eslint.config.js` diganti nama menjadi `.mjs`.
- **Sesi 1 (U1, U3):**
  - File baru: `package.json` (root, workspaces, skrip), `backend/package.json`, `backend/.env.example`, `.gitignore`, `eslint.config.mjs` (dasar, agar `npm run lint` punya konfigurasi), `customer-app/package.json`, `admin-app/package.json`, `shared/package.json` (nama `@kecaknik/shared`), `shared/core/{konfigurasi,format,statusPesanan}.js`, dan uji `format.test.js`, `statusPesanan.test.js`, `konfigurasi.test.js`.
  - `statusPesanan.js` juga memuat status pembayaran dan transisi baris `pembayaran` (§8.2, §8.3) agar tetap satu sumber.
  - Default D-xx: D-15, D-16, D-17 tetap placeholder (rekening `TBD`, `waAdmin` kosong, alamat dan koordinat kosong).
  - Dijalankan: `node --test` (19 uji lulus, Node 22). Dijalankan pemilik di Windows: `npm install` (0 kerentanan) dan `npm run lint` (bersih). Peringatan `MODULE_TYPELESS_PACKAGE_JSON` diperbaiki dengan mengganti nama config menjadi `.mjs`.
  - Catatan: npm memberi peringatan eslint 9.x sudah deprecated (tidak mengganggu). Pertimbangkan naik ke versi terbaru saat U20.
- **Sesi 0:** folder, 5 dokumen, logo, dan alur kerja bertahap disiapkan.
