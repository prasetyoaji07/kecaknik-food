# DESIGN.md: Sistem desain Kecaknik Food

Versi 1.1 · 17 November 2026 (menambah logo Kecaknik, bagian 3, 5, 8, 10, 14, 15). Sumber kebenaran untuk **semua tampilan**. Dasarnya 12 layar desktop yang sudah disetujui pemilik (gaya referensi PickEat). Dokumen ini juga memperbaiki ketidakkonsistenan di layar tersebut (bagian 10) dan menambahkan responsif, komponen bersama, validasi, dan footer.

Aturan inti: **desain disusun dari komponen**, bukan ditulis ulang per halaman. Jika sebuah tampilan belum punya komponen, buat komponennya di `shared/ui` dulu, baru dipakai.

---

## 1. Arah desain

Hangat, ramai, seperti stiker di toples kue: garis tebal gelap, sudut membulat, merah menyala, kuning mustard, latar krem. Brief dari pemilik menang atas tren, jadi gaya ini dipertahankan. Yang dijaga adalah **ritme dan detailnya** supaya tidak terasa seperti template.

Satu hal yang paling diingat per halaman, sisanya tenang. Beranda: foto hero miring dengan stiker. Menu: kartu unggulan yang lebih lebar. Checkout: panel pembayaran yang rapi. Jangan membuat semua bagian sama ramainya.

## 2. Token (`shared/ui/tokens.css`)

Semua nilai berasal dari sini. Dilarang hex atau px literal di CSS komponen atau halaman.

```css
:root{
  /* warna */
  --merah:#D62828;  --merah-tua:#B01F1F;
  --kuning:#FBBF24; --kuning-tua:#E0A612;
  --krem:#FCF8EC;   --krem-gelap:#F3EBDA;
  --lime:#DDEB9D;   --hijau:#4CAF7D;
  --tinta:#2B2B2B;  --tinta-lembut:#6B6259;  --putih:#FFFFFF;
  /* garis dan bentuk */
  --garis:2px solid var(--tinta);  --garis-tebal:3px solid var(--tinta);
  --r-sm:10px; --r-md:16px; --r-lg:24px; --r-pill:999px;
  /* bayangan: keras untuk benda yang bisa ditekan, lembut tipis untuk kartu diam */
  --bayang-keras:3px 3px 0 var(--tinta);
  --bayang-tekan:1px 1px 0 var(--tinta);
  --bayang-kartu:0 6px 16px -10px rgba(43,43,43,.35);
  /* jarak (kelipatan 4) */
  --j1:4px; --j2:8px; --j3:12px; --j4:16px; --j5:24px; --j6:32px; --j7:48px; --j8:64px; --j9:96px;
  /* tata letak */
  --lebar-konten:1200px; --gutter:16px;           /* 24px mulai 768, 32px mulai 1024 */
  --tinggi-sentuh:44px;
  /* gerak */
  --ease:cubic-bezier(.2,.8,.2,1); --d1:120ms; --d2:200ms; --d3:320ms;
  /* lapisan */
  --z-header:20; --z-drawer:40; --z-modal:50; --z-select:60; --z-toast:70;
}
@media (min-width:768px){:root{--gutter:24px}}
@media (min-width:1024px){:root{--gutter:32px}}
```

Breakpoint: `480`, `768`, `1024`, `1280` (mobile-first, `min-width`).
Komposisi warna: krem dominan sebagai latar, merah untuk hero, footer, dan tombol utama, kuning aksen kecil dan banner, lime hanya untuk kotak info dan opsi terpilih. **Jangan menambah warna baru.**

## 3. Tipografi dan logo

- **Display: Archivo Black** untuk logo, judul, harga besar. **Isi: Inter** (400, 500, 600, 700). Pasang lokal lewat `@fontsource` agar demo tidak bergantung internet, dengan cadangan `system-ui`.
- Skala fluid: `h1 clamp(2.25rem, 1.2rem + 4vw, 4.5rem)`, `h2 clamp(1.75rem, 1.1rem + 2.4vw, 2.75rem)`, `h3 1.375rem`, isi `1rem`, kecil `.875rem`. Line-height judul 1.05–1.15, isi 1.55.
- Angka (harga, total, nominal) memakai `font-variant-numeric: tabular-nums`.
- Panjang baris isi maksimal 70 karakter.
- Judul memakai sentence case. Kapital semua hanya untuk **stiker** (PRE-ORDER, BARU!) dan logo.

### Logo

Berkas milik pemilik: `shared/ui/assets/logo-kecaknik.jpeg`. Itu satu-satunya sumber logo.

- **Hanya lewat komponen `Logo`** (`shared/ui`). Dilarang `<img>` logo langsung di halaman, dan dilarang menggambar ulang logo dengan SVG, CSS, atau teks.
- **Jangan diubah:** tidak diwarnai ulang, dipotong, diregangkan, diputar, diberi bayangan atau efek. Rasio asli dijaga (`object-fit: contain`).
- **Ukuran lewat token:** `sm` tinggi `--j6`, `md` tinggi `--j7`, `lg` tinggi `--j8`. Ruang kosong di sekeliling logo minimal `--j2`.
- **JPEG tidak transparan.** Logo selalu tampil di dalam **lencana berlatar `--krem`** dengan garis `--garis` dan radius `--r-md`, supaya latar gambar tidak tampak seperti kotak asing di atas merah. Bila pemilik kelak memberi PNG transparan atau SVG, cukup ganti nama berkas di `Logo` dan lepas lencananya. Tidak ada perubahan lain.
- **`alt`:** "Kecaknik Food". Di `HeaderSitus` dan `AdminLayout`, logo adalah tautan ke beranda (`aria-label` "Kecaknik Food, ke beranda").
- **Cadangan:** bila berkas gagal dimuat, `Logo` menampilkan teks KECAKNIK (Archivo Black, kuning di atas merah).
- **Favicon:** pemilik menyediakan `customer-app/public/favicon.png` dan `admin-app/public/favicon.png` (persegi, 180×180, dari logo). `index.html` kedua app menautkannya. Bila berkas belum ada, catat di `HANDOFF.md`, jangan membuat desain ikon baru.
- **Tempat pemakaian:** `HeaderSitus`, `FooterSitus` (kolom 1), `AdminLayout` (atas sidebar dan bilah atas mobile), dan kartu Login admin. Tidak dipakai berulang di badan halaman.

## 4. Bentuk, bayangan, gerak

- Semua kartu, foto, input, tombol: garis `--garis`. Foto hero dan foto produk unggulan: `--garis-tebal`.
- Radius berjenjang, tidak seragam: input dan chip `--r-pill` atau `--r-md`, kartu `--r-lg`, foto `--r-lg`, badge kecil `--r-pill`.
- Tombol dan stiker memakai `--bayang-keras`. Saat ditekan: geser `translate(2px,2px)` dan bayang jadi `--bayang-tekan`. Kartu diam memakai `--bayang-kartu`.
- Gerak hanya untuk **menjawab aksi** pengguna: tombol ditekan, modal dan drawer muncul, badge keranjang melonjak saat produk masuk, centang muncul, toast. **Dilarang** animasi masuk fade-slide pada tiap section dan hover mewah pada semua kartu. Satu momen terorkestrasi di beranda (hero) boleh.
- Hormati `prefers-reduced-motion`: matikan semua transisi non-esensial.
- Fokus keyboard selalu terlihat: ring 3 px `--kuning` dengan offset 2 px.

## 5. Katalog komponen (`shared/ui`)

Tanda: **[U]** umum, **[P]** pelanggan, **[A]** admin. Unit U10 sampai U20 membangun [U] dan [P]. Unit U21 membangun [A].

| Komponen | Tag | Varian dan keadaan | Catatan |
|---|---|---|---|
| `Button` | U | `primer` (merah), `sekunder` (putih), `aksen` (kuning), `bahaya` (putih, garis merah), `tautan`. Ukuran `sm`, `md`, `lg`. Props `memuat`, `nonaktif`, `ikonKiri`, `ikonKanan`, `penuh`, `as`. | Pill, tinggi minimal 44 px. Tombol hanya ikon wajib `aria-label`. Alasan nonaktif ditampilkan sebagai teks bantu di dekatnya, jangan dibiarkan misterius. |
| `Field` | U | `kind`: `nama`, `telepon`, `rupiah`, `angka`, `kode`, `teks`, `alamat`, `sandi`. Label, bantuan, galat, penghitung karakter, awalan, akhiran. | Lihat bagian 6. Satu-satunya cara membuat input teks. |
| `Select` | U | Satu pilihan, placeholder, nonaktif, galat. | Lihat bagian 7. |
| `OptionCard` | U | Grup radio berbentuk kartu (Ambil/Antar, metode bayar). Terpilih = latar lime. | Akses keyboard seperti radio. |
| `Checkbox`, `Radio` | U | Kotak dan bulatan dengan garis tebal. Terpilih = merah. | Dipakai di grup opsi produk. |
| `Switch` | A | Aktif, nonaktif. | Toggle aktif produk, Pre-order. |
| `DateField` | U | Satu tanggal. | Membungkus `input[type=date]`, popup milik browser sehingga tidak keluar layar. Rentang tanggal = dua `DateField`. |
| `Badge` | U | `status` (pending, diproses, siap, dikirim, selesai, batal), `bayar` (belum, uang muka, lunas), `kanal` (website, wa, fb, langsung), `tipe` (ambil, antar). | Warna + teks, tidak mengandalkan warna saja. |
| `Stiker` | P | Miring kecil, huruf kapital, bayang keras. | Untuk PRE-ORDER, BARU!. Rotasi diambil dari daftar tetap per indeks, bukan acak. |
| `Chip` | U | Filter kategori, terpilih/tidak. | Baris bisa di-scroll horizontal di layar kecil (di dalam wadahnya). |
| `Stepper` | U | Kurang, jumlah, tambah. Batas 1–99. | Tombol 44 px. Jumlah tidak bisa diketik huruf. |
| `KartuProduk` | P | Normal, pre-order, habis, unggulan (lebar 2 kolom di desktop). | Foto rasio 4:3. Lihat `FotoProduk`. |
| `FotoProduk` | P | Skeleton, termuat, galat. | Bila foto belum ada: latar krem-gelap dengan nama produk, bukan kotak abu-abu. |
| `GrupOpsi` | P | Pilih satu, pilih banyak, wajib, bergantung (muncul setelah grup lain terisi), dengan isian teks. | Menampilkan harga tambah dan batas pilih. |
| `BarisKeranjang` | P | Dengan opsi, tanpa opsi. | **Semua baris punya** foto kecil, stepper, "Ubah opsi" bila ada opsi, dan tombol hapus. |
| `Modal` | U | Dialog di tengah (desktop). Lembar dari bawah (di bawah 768 px). | Fokus terkunci, ESC menutup, scroll belakang terkunci. Header dan footer lengket, isi scroll di dalam. |
| `Laci` | P | Panel kanan 480 px (desktop). Penuh layar (mobile). | Keranjang. |
| `Timeline` | P | Selesai, saat ini, belum. Varian Ambil dan Antar. | Garis vertikal menyambung. |
| `Dropzone` | U | Kosong, menyeret, terpilih (pratinjau + nama file + ganti/hapus), galat. | jpg/png/webp, maksimal 2 MB, cek di klien dan server. |
| `PanelRekening` | P | Tab channel (DANA, BCA, BRI, GoPay) + nomor, atas nama, nominal, tombol Salin. | Tombol Salin berubah jadi "Tersalin" 2 detik. |
| `PetaPilih` | P | Peta Leaflet + OSM, klik untuk memindah marker, tombol "Gunakan lokasi saya", lingkaran akurasi. | Tinggi 280 px mobile, 360 px desktop. |
| `PetaRute` | U | Marker toko, marker lokasi, garis rute, marker motor statis saat `dikirim`. | Judulnya "Peta rute pengantaran", bukan pelacakan. |
| `TombolWa` | U | Pelanggan: teks kontekstual sesuai status. Admin: pilih templat + buka. | Lihat `STRUKTUR.md` Lampiran D. |
| `Toast` | U | Berhasil, galat, info. | Mobile di bawah tengah, desktop di kanan atas. Satu kata kerja yang sama dengan tombolnya. |
| `KeadaanKosong` | U | Keranjang kosong, pesanan tidak ditemukan, belum ada produk. | Ada ilustrasi garis sederhana (SVG) dan satu tindakan. |
| `Rangka` (skeleton) | U | Kartu, baris tabel, teks. | Dipakai saat memuat data. |
| `Logo` | U | Ukuran `sm`, `md`, `lg`. Dengan atau tanpa tautan. Cadangan teks bila gambar gagal. | Satu-satunya cara menampilkan logo. Lihat bagian 3. |
| `HeaderSitus` | P | Pill melayang: `Logo`, tautan, keranjang. Mobile: `Logo`, keranjang, menu. | Satu-satunya header pelanggan. |
| `FooterSitus` | P | Lihat bagian 8. | Selalu ada. |
| `PelangganLayout` | P | Header + `<main>` + Footer. | Membungkus semua rute pelanggan. |
| `AdminLayout` | A | Sidebar merah (desktop), bilah atas + laci menu (mobile). | `Logo` di bagian atas sidebar dan bilah atas. |
| `TabelData` | A | Tabel (≥ 1024 px). Daftar kartu bertumpuk (di bawah 1024 px). | Satu definisi kolom, dua tampilan. |
| `Tab` | A | Aktif/Riwayat, Harian/Bulanan. | |
| `KartuStat` | A | Angka + label. | Laporan. |

Aturan komponen: tidak ada gaya inline kecuali nilai dinamis (posisi, lebar bar). Setiap komponen punya CSS Module sendiri yang hanya memakai token.

## 6. Validasi input (`Field kind=...`)

Aturan ada di `shared/core/validasi.js` dan dipakai klien dan server. **Penyaringan terjadi di `onChange` dan saat tempel** (sumber kebenaran, karena keyboard ponsel kadang melewati `onBeforeInput`). `onBeforeInput` hanya mempercepat respons.

| `kind` | Boleh diketik | Ditolak otomatis | Batas | Kunci khusus |
|---|---|---|---|---|
| `nama` | Huruf semua bahasa, spasi, `.`, `'`, `-` | Angka dan simbol lain (hilang seketika dari input) | 2–100 | `autoComplete="name"`. Spasi ganda dirapikan saat blur. |
| `telepon` | Angka. Saat tempel, `+`, spasi, dan `-` disaring | Huruf dan simbol lain | 10–15 digit setelah dinormalisasi | `inputMode="tel"`. Normalisasi ke `62…` (08… dan +62… ikut). Tampil terformat saat blur. |
| `rupiah` | Angka | Huruf, simbol, minus | 1–99.999.999 | Tampil `Rp75.000`, simpan angka. `inputMode="numeric"`. |
| `angka` | Angka bulat | Selain angka | `min`/`max` dari props (qty 1–99) | |
| `kode` | Huruf dan angka | Huruf/angka yang mudah tertukar | `KCK-` + 6 karakter | Otomatis kapital. Alfabet `23456789ABCDEFGHJKMNPQRSTUVWXYZ`. |
| `teks` | Bebas | | `maxLength` + penghitung | Catatan 255/500, teks opsi 100. |
| `alamat` | Bebas, banyak baris | | 10–255 | |
| `sandi` | Bebas | | | Tombol tampil/sembunyi. |

Pesan galat: tampil di bawah field, ikon + teks (bukan hanya warna merah), `aria-live="polite"`, muncul saat blur dan saat kirim. Isi galat menjelaskan apa yang salah dan cara memperbaikinya, tidak meminta maaf. Contoh: "Nomor WhatsApp minimal 10 digit, contoh 0812 3456 7890." Karakter terlarang tidak pernah masuk ke input, jadi galatnya bukan "salah ketik" melainkan petunjuk. Bila pengguna menempel teks yang sebagian disaring, tampilkan bantuan singkat selama 3 detik: "Nama hanya boleh huruf."

## 7. Dropdown dan lapisan (tidak keluar frame)

`Select` dibangun di atas Radix Select (`@radix-ui/react-select`).

- Lebar panel = lebar pemicu (minimal 200 px). Tinggi maksimal `min(320px, ruang tersedia)`, isi scroll di dalam panel.
- Tabrakan: `collisionPadding` 12 px, otomatis membalik ke atas jika ruang bawah kurang, otomatis bergeser jika mepet tepi kiri/kanan.
- Di bawah 768 px: tampil sebagai **bottom sheet** dengan daftar besar (tinggi baris 48 px).
- Keyboard: panah, Home/End, ketik huruf untuk melompat, Enter memilih, ESC menutup. Pilihan terpilih bertanda centang.
- Tampil di atas modal dan laci (`--z-select`). Tidak pernah dipotong `overflow` induknya (di-portal ke `body`).
- Tidak memakai `<select>` bawaan browser untuk pilihan di UI.

Modal dan laci memakai `@radix-ui/react-dialog` (fokus terkunci, ESC, aria).

## 8. Footer dan tata letak halaman pelanggan

`PelangganLayout`: `HeaderSitus` → `<main>` → `FooterSitus`. Dipakai oleh **semua** rute pelanggan (beranda, menu, pre-order, lacak, checkout, berhasil, status, 404). Halaman tidak boleh membuat header atau footer sendiri.

`FooterSitus`: latar merah, teks krem.
- Kolom 1: `Logo` (lencana krem di atas merah) dan kalimat "Homemade food untuk hari-hari yang lebih hangat."
- Kolom 2 "Hubungi kami": alamat, WhatsApp (tautan `wa.me`), jam buka. Nilai dari `konfigurasi.js`. Baris yang masih kosong **disembunyikan** di produksi dan tampil sebagai placeholder di mode dev.
- Kolom 3 "Jelajah": Beranda, Menu, Pre-order (hanya bila ada PO aktif), Lacak pesanan.
- Garis bawah: "© {tahun} Kecaknik Food".
- Responsif: 3 kolom (≥ 1024) → 2 kolom (≥ 768) → 1 kolom bertumpuk.
- Tepi atas boleh bergelombang (SVG) saat bertemu latar krem.

## 9. Responsif (semua layar)

Mobile-first. Uji di 360, 390, 768, 1024, 1440. Tidak ada scroll horizontal di lebar mana pun. Konten lebar (tabel, kode) scroll **di dalam wadahnya**.

| Area | ≥ 1024 | 768–1023 | < 768 |
|---|---|---|---|
| Header pelanggan | Pill penuh, tautan terlihat | Pill, tautan ringkas | Logo + keranjang + tombol menu (laci menu) |
| Beranda hero | Dua kolom (teks kiri, foto miring kanan) | Dua kolom rapat | Satu kolom, foto di bawah teks |
| Grid produk | 3 kolom (unggulan lebar 2) | 2 kolom | 2 kolom kartu ringkas (satu kolom di bawah 360 px) |
| Modal opsi | Dialog 2 kolom (foto kiri, opsi kanan) | Dialog 1 kolom | Lembar bawah penuh, total dan tombol lengket |
| Keranjang | Laci kanan 480 px | Laci kanan | Layar penuh |
| Checkout | 2 kolom (form + ringkasan lengket) | 1 kolom | 1 kolom, ringkasan jadi bilah bawah lengket yang bisa dibuka |
| Status pesanan | 2 kolom (timeline kiri, peta+rincian kanan) | 2 kolom | 1 kolom: timeline, peta, rincian |
| Admin sidebar | Sidebar tetap 240 px | Sidebar menyempit | Bilah atas + laci menu |
| Admin tabel | Tabel | Tabel scroll di wadah | Kartu bertumpuk |
| Admin detail pesanan | 2 kolom | 1 kolom | 1 kolom, aksi status lengket di bawah |
| Admin kelola produk | Tabel + panel form kanan | Panel form jadi modal | Panel form jadi lembar bawah |

Target sentuh ≥ 44 px. Teks isi ≥ 16 px di input (mencegah zoom otomatis iOS).

## 10. Spesifikasi layar

### Pelanggan

1. **Beranda**: hero merah dengan judul "Segar. Hangat. Buatan Rumah." dan foto berbingkai miring dengan stiker BARU!. Banner kuning Pre-order (hanya bila ada PO aktif, data dari produk). "Menu Favorit" carousel dengan tombol panah. Empat kartu kategori. Cara pesan **tiga langkah** (ini memang urutan, jadi boleh bernomor). Kotak Lacak pesanan (`Field kind=kode`). Footer.
2. **Menu**: judul + deskripsi, chip kategori (Semua, Kue, Puding & Salad, Gorengan, Lainnya, Pre-order), grid produk. Kartu pertama bisa unggulan. Satu keadaan habis. Foto tiap produk **berbeda**.
3. **Modal opsi**: foto kiri, kanan nama, satuan, harga dasar, grup opsi (urut dari yang terkecil, 1, 2, 3 lilin), grup bergantung (Lilin nama muncul setelah Lilin umur), catatan produk, `Stepper`, bilah bawah total langsung + tombol "Masukkan ke keranjang".
4. **Keranjang** (laci): semua baris memakai `BarisKeranjang` (foto, chip opsi, catatan, stepper, subtotal, "Ubah opsi" bila ada opsi, hapus). Peringatan kuning bila campuran PO dan reguler. Catatan pesanan. Total. Tombol "Lanjut ke checkout".
5. **Checkout** (satu halaman, bukan wizard): tanpa teks "Langkah 4 dari 4". Bagian bernomor karena memang berurutan: 1 Cara terima (`OptionCard`), 2 Data pemesan (`Field nama`, `Field telepon`, catatan), 3 Pengantaran (hanya Antar: alamat + `PetaPilih`), 4 Metode bayar (`OptionCard` Transfer, Bayar di tempat (tunai), Split). Ringkasan kanan lengket.
   - Transfer: `PanelRekening` (DANA, BCA, BRI, GoPay) + `Dropzone`. Tombol Pesan nonaktif sampai channel dan file dipilih, dengan teks bantu "Unggah bukti transfer dulu".
   - Tunai: kotak kuning penjelas ("Bayar tunai saat pesanan diambil" atau "diterima"). Tanpa unggah.
   - Split: `Field rupiah` "Dibayar via transfer sekarang", chip 25% dan 50%, baris otomatis "Sisa dibayar tunai saat terima", lalu `PanelRekening` + `Dropzone`.
   - **Tidak ada baris ongkir.** Untuk Antar tampil catatan kecil "Ongkir dikonfirmasi admin lewat WhatsApp."
   - Nominal di `PanelRekening` selalu sama dengan jumlah yang harus ditransfer (total, atau nominal split).
6. **Pesanan berhasil**: stiker, judul, kode di kotak lime dengan "Salin kode", total, badge pembayaran, saran menyimpan kode, tombol "Lihat status pesanan", dan `TombolWa`.
7. **Status pesanan**: header halaman memakai `HeaderSitus` (bukan header merah polos), judul kode, tanggal, badge Ambil/Antar. Kartu "Perjalanan pesanan" berisi `Timeline`, badge pembayaran, lalu **`TombolWa` tepat di bawah badge pembayaran dan di bawah blok status lain** (bukti ditolak, dibatalkan, selesai). Kolom kanan: `PetaRute` (Antar) dan "Rincian pesanan". Tanpa nomor HP dan alamat teks. Keadaan: normal, bukti ditolak (alasan + `Dropzone` unggah ulang), dibatalkan (alasan), tidak ditemukan.
8. **Lacak pesanan** (`/lacak`): `Field kind=kode` + tombol.
9. **404**: ilustrasi, tautan ke menu.

### Admin

Sidebar merah: Pesanan, Input manual, Produk, Laporan, Keluar. Lebih padat dan fungsional, tanpa dekorasi stiker.

10. **Login**: `Logo` di atas kartu, kartu di tengah latar merah, `Field kind=sandi`, tombol Masuk, galat jelas bila salah.
11. **Daftar pesanan**: `Tab` Aktif/Riwayat, filter (`Select` status, sumber, pembayaran, dua `DateField`, `Field` cari), `TabelData` dengan badge dan tombol aksi cepat.
12. **Detail pesanan**: kiri rincian item (chip opsi, catatan), data pelanggan, **mini `PetaRute` OSM** (Antar), tombol "Buka rute di Google Maps". Kanan: bilah progres pembayaran, riwayat pembayaran (Terima/Tolak/Kembalikan, thumbnail bukti), form "Catat pembayaran", tombol status, "Batalkan pesanan" (alasan wajib). **`TombolWa` di bawah badge status/pembayaran**: `Select` templat terpilih otomatis sesuai status + tombol "Buka WhatsApp".
13. **Input manual**: sumber (`OptionCard`), pemilih produk dengan opsi dan catatan, pemesan (`Field nama`, `Field telepon`), Ambil/Antar, pembayaran awal.
14. **Kelola produk**: tabel + panel form (foto, nama, kategori `Select`, satuan, harga `Field rupiah`, `Switch` aktif, `Switch` Pre-order yang membuka tiga `DateField`) dan editor opsi tambahan.
15. **Laporan**: `Tab` Harian/Bulanan, `DateField`, `KartuStat`, tabel polos (tanpa grafik), catatan pesanan dibatalkan dikecualikan.

### Perbaikan dari layar yang sudah dibuat (wajib diterapkan)

1. Hapus baris "Ongkir pengantaran" dan samakan nominal transfer dengan total.
2. Checkout Split dengan Antar harus punya bagian Pengantaran.
3. Hapus "Langkah 4 dari 4".
4. Semua halaman memakai `HeaderSitus` dan `FooterSitus` yang sama (status dan menu sebelumnya berbeda).
5. Foto produk tidak boleh dipakai ulang antar produk. Kartu Habis tidak boleh memakai foto produk lain yang diabu-abukan.
6. Urutan opsi lilin 1, 2, 3.
7. Baris Risol di keranjang harus punya stepper dan hapus seperti baris lain.
8. Hapus label kapital kecil di atas judul ("PILIHAN HARI INI", "SUDAH PESAN?"). Judul sudah cukup.
9. Hindari metadata bertitik tengah ("per pcs · Rp150.000", "16 Nov · 09.10", "Uang Muka · Sisa Rp75.000"). Tulis dalam kalimat atau pisahkan elemennya: "Uang muka, sisa Rp75.000", "16 Nov, 09.10".
10. Tanda panah (`→`) di tombol hanya untuk tindakan maju (Lanjut ke checkout, Lihat status). Tidak di semua tombol.

## 11. Agar tidak terasa kaku dan buatan template

1. **Ritme, bukan keseragaman.** Section tidak semuanya rata tengah. Selang-seling kiri dan kanan. Jarak antar section bervariasi (48, 64, 96), bukan sama di mana-mana. Tidak lebih dari dua section berturut-turut dengan pola "judul tengah + tiga kartu".
2. **Kartu tidak kembar.** Grid produk memberi satu kartu unggulan yang lebih lebar. Radius dan bayangan mengikuti peran (bagian 4).
3. **Miring terkontrol.** Stiker dan foto hero miring -3° sampai 3°, diambil dari daftar tetap per indeks (`[-2.5, 1.5, -1, 2.5]`). Tidak acak per render agar tidak berkedip.
4. **Detail buatan tangan.** Tepi bergelombang (SVG) antara hero merah dan krem. Pola titik halus di banner kuning. Ilustrasi garis sederhana untuk keadaan kosong (piring kosong untuk keranjang kosong) sebagai ganti ikon dalam lingkaran.
5. **Ikon:** satu set (`lucide-react`), stroke 2, ukuran 20 atau 24. Tidak semua fitur memakai ikon dalam lingkaran. Variasikan.
6. **Interaksi jujur.** Tombol turun saat ditekan, badge keranjang melonjak, centang muncul, toast singkat. Selain itu diam.
7. **Foto:** rasio 4:3, selalu berbingkai garis, hangat. Bila belum ada, latar krem-gelap dengan nama produk. Tidak ada gradien ungu, glassmorphism, atau bayangan lembut besar.
8. **Satu kejutan per halaman.** Cukup satu elemen yang berani (foto hero miring, kartu unggulan, panel pembayaran). Sisanya tenang. Buang satu aksesori sebelum selesai.
9. **Uji lima detik.** Jika screenshot halaman bisa dipasang di restoran lain tanpa diubah, halaman belum punya kepribadian Kecaknik.

## 12. Tulisan (suara Kecaknik)

Hangat, singkat, pakai kata kerja jelas. Sentence case. Nama aksi sama di seluruh alur: tombol "Masukkan ke keranjang" menghasilkan toast "Masuk keranjang". "Pesan sekarang" menghasilkan "Pesanan diterima".

- Sebut produk nyata. Hindari "Seamless", "Elevate", "Discover", dan kalimat generik.
- Galat menjelaskan masalah dan cara memperbaikinya, tidak meminta maaf: "Bukti transfer belum diunggah. Pilih foto bukti dulu."
- Kosong adalah ajakan bertindak: "Keranjangmu masih kosong. Lihat menu dulu, yuk."
- Istilah tetap: **Ambil**, **Antar**, **Nomor WhatsApp**, **Bayar di tempat (tunai)**, **Bukti transfer**, **Pre-order**.
- Jangan menulis "kurir sedang menuju lokasimu". Posisi tidak real-time. Pakai "Pesanan sedang diantar dari Kecaknik Food".

## 13. Aksesibilitas dan kualitas

Kontras teks ≥ 4,5:1 (teks krem di atas merah #D62828 lolos, kuning di atas merah dipakai hanya untuk teks besar/logo). Label untuk semua field. Fokus terlihat. Status tidak hanya dengan warna. `aria-live` untuk galat dan toast. `alt` untuk foto produk. Urutan tab logis. Tidak ada kunci fokus selain modal dan laci.

## 14. Daftar larangan

- Rating bintang, ulasan, testimoni, statistik angka palsu, diskon, newsletter, form kontak, pencarian di header.
- QRIS dan logo atau teks QRIS di mana pun.
- `<button>`, `<input>`, `<select>` mentah di halaman. Dropdown bawaan browser untuk pilihan UI.
- Hex dan px literal di luar `tokens.css`.
- Logo digambar ulang, diwarnai ulang, dipotong, diregangkan, diberi efek, atau dipasang tanpa komponen `Logo`.
- Foto yang sama untuk produk berbeda. Teks Lorem ipsum. Data bisnis karangan (nomor, alamat, harga add-on).
- Eyebrow kapital di atas judul, satu kata beraksen di dalam judul, bernomor 01/02/03 untuk hal yang bukan urutan.
- Animasi masuk di setiap section, hover mewah di semua kartu.

## 15. Checklist QA visual (per layar)

- [ ] Memakai `PelangganLayout` (header + footer) atau `AdminLayout`.
- [ ] Semua tombol, field, dropdown dari `shared/ui`.
- [ ] Logo hanya lewat `Logo`, tidak berubah bentuk dan warna, terbaca jelas di atas merah.
- [ ] Rapi di 360, 768, 1024, 1440 tanpa scroll horizontal.
- [ ] Dropdown dibuka di tepi layar dan tidak keluar.
- [ ] Nama menolak angka, telepon menolak huruf, termasuk saat tempel.
- [ ] Keadaan kosong, memuat, dan galat tersedia.
- [ ] Lulus uji lima detik dan tidak memuat item di bagian 14.
