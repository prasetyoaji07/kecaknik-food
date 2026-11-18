# SPESIFIKASI SISTEM KECAKNIK FOOD
### Bahan untuk membuat diagram UML dan desain database relasional

---

## 0. PETUNJUK UNTUK AI (BACA DULU)

Dokumen ini diturunkan langsung dari kode aplikasi web **Kecaknik Food** (website pemesanan makanan rumahan). Semua isi dokumen ini adalah fakta dari sistem yang sudah jadi. **Jangan menambah fitur, tabel, kolom, aktor, atau alur yang tidak tertulis di sini.** Kalau ada yang tidak jelas, tulis sebagai asumsi di bagian akhir jawaban, jangan dikarang.

### Yang harus dibuat

| No | Deliverable | Sumber di dokumen ini |
|---|---|---|
| 1 | **Use Case Diagram** (satu diagram besar, atau dipecah per aktor kalau terlalu padat) | Bagian 3 |
| 2 | **Activity Diagram** (satu diagram per alur AD-xx, pakai swimlane) | Bagian 4 |
| 3 | **Sequence Diagram** (satu diagram per skenario SD-xx) | Bagian 5 |
| 4 | **Class Diagram** (domain + lapisan aplikasi) | Bagian 7 |
| 5 | **ERD** (notasi crow's foot) | Bagian 8 |
| 6 | **LRS / skema relasional** (tabel, PK, FK) | Bagian 8 |
| 7 | **Kamus data** per tabel | Bagian 8 |
| 8 | Catatan **normalisasi** (1NF sampai 3NF) dan redundansi yang disengaja | Bagian 8.9 |

### Yang TIDAK perlu dibuat
- State machine diagram.
- Use case specification (tabel skenario teks).

### Aturan keluaran
1. Tulis diagram sebagai **kode PlantUML** (satu blok kode per diagram, siap dirender). Kalau tidak bisa, pakai Mermaid.
2. Pakai **nama dalam bahasa Indonesia persis seperti di dokumen** (nama tabel, kolom, status, aktor). Jangan diterjemahkan.
3. Beri judul dan nomor diagram (contoh: "Gambar 4.3 Sequence Diagram Checkout").
4. Setiap diagram diberi 2 sampai 4 kalimat penjelasan.
5. Di use case diagram, tunjukkan relasi `<<include>>` dan `<<extend>>` seperti yang ditulis di Bagian 3.
6. Di ERD dan LRS, tampilkan PK, FK, UNIQUE, tipe data, dan kardinalitas.
7. Di akhir jawaban, buat daftar **asumsi** (jika ada).

---

## 1. RINGKASAN SISTEM

**Kecaknik Food** adalah website pemesanan makanan rumahan (kue, puding, gorengan, makanan lainnya). Sistem terdiri dari tiga bagian:

| Bagian | Teknologi | Fungsi |
|---|---|---|
| **customer-app** | React (SPA) | Situs pelanggan: lihat menu, keranjang, checkout, lacak pesanan |
| **admin-app** | React (SPA) | Panel admin: kelola pesanan, pembayaran, produk, laporan |
| **backend** | Node.js + Express + MySQL/MariaDB | REST API, autentikasi admin (JWT), penyimpanan file |

Ciri khas yang memengaruhi desain:
- **Pelanggan tidak punya akun.** Pelanggan mengidentifikasi pesanannya lewat **kode pesanan** (contoh `KCK-8KF6M5`).
- **Admin hanya satu orang**, login dengan **sandi** (tanpa tabel pengguna). Token JWT HS256 dengan masa kedaluwarsa.
- **Keranjang belanja tersimpan di browser pelanggan** (bukan di database).
- **Pengiriman WhatsApp dilakukan manual**: sistem hanya membuka tautan `wa.me` berisi teks pesan, pengguna menekan Kirim sendiri. Tidak ada integrasi WhatsApp API.
- **Pembayaran tidak lewat payment gateway.** Pelanggan transfer manual ke rekening toko lalu mengunggah bukti; admin memverifikasi.
- **Harga selalu dihitung server dari database.** Klien hanya mengirim `product_id`, `qty`, id opsi, teks, catatan.
- **Ongkir tidak masuk total pesanan.** Ongkir disepakati lewat WhatsApp.
- Zona waktu: WIB (Asia/Jakarta).

---

## 2. AKTOR

| Aktor | Jenis | Keterangan |
|---|---|---|
| **Pelanggan** | Primer | Pengunjung publik tanpa akun. Memesan dan melacak pesanan lewat kode pesanan |
| **Admin** | Primer | Pemilik/pengelola toko. Login dengan sandi. Mengelola semua data |
| **WhatsApp** | Sekunder (eksternal) | Layanan eksternal tujuan tautan `wa.me`. Hanya dibuka oleh pengguna, bukan integrasi API |
| **Layanan Peta** | Sekunder (eksternal) | Leaflet/OpenStreetMap untuk memilih dan menampilkan titik lokasi; Google Maps untuk tombol "Buka rute" di admin |

> Catatan: dua aktor sekunder boleh digambar di luar sistem, atau diabaikan di use case diagram kalau membuat diagram terlalu padat. Aktor utama yang wajib adalah **Pelanggan** dan **Admin**.

---

## 3. USE CASE

### 3.1 Use case Pelanggan

| ID | Use case | Keterangan |
|---|---|---|
| UC-P01 | Melihat beranda | Hero, ajakan lihat menu dan lacak pesanan |
| UC-P02 | Melihat daftar menu | Daftar produk aktif |
| UC-P03 | Memfilter menu per kategori | Kategori: `kue`, `puding-salad`, `gorengan`, `lainnya`, serta "semua" |
| UC-P04 | Melihat menu pre-order | Halaman `/preorder`; menu navigasi "Pre-order" hanya muncul jika ada produk pre-order aktif |
| UC-P05 | Memilih opsi tambahan produk | Pilih ukuran, rasa, topping, lilin, teks opsi, catatan item |
| UC-P06 | Menambah produk ke keranjang | Dengan qty, opsi, catatan |
| UC-P07 | Mengelola keranjang | Ubah jumlah (1 sampai 99), hapus item, lihat total sementara |
| UC-P08 | Checkout pesanan | Use case inti, lihat include di bawah |
| UC-P09 | Memilih cara terima | `ambil` atau `antar` |
| UC-P10 | Mengisi data pemesan | Nama, nomor WhatsApp, catatan pesanan |
| UC-P11 | Memilih titik lokasi pengantaran di peta | Hanya untuk `antar`, termasuk alamat lengkap |
| UC-P12 | Memilih metode pembayaran | `transfer`, `tunai` (bayar di tempat), `split` |
| UC-P13 | Mengisi nominal transfer split | Hanya untuk `split`; ada pintasan 25% dan 50% |
| UC-P14 | Melihat info rekening dan menyalin nomor | Tab channel DANA, BCA, BRI, GoPay |
| UC-P15 | Mengunggah bukti transfer | Untuk `transfer` dan `split` |
| UC-P16 | Melihat halaman sukses dan kode pesanan | Menyalin kode pesanan |
| UC-P17 | Mengonfirmasi pesanan via WhatsApp | Membuka `wa.me` dengan teks otomatis |
| UC-P18 | Melacak pesanan dengan kode | Halaman `/lacak` |
| UC-P19 | Melihat status pesanan | Timeline status, status pembayaran, rincian item, peta rute (jika antar) |
| UC-P20 | Mengunggah ulang bukti transfer | Hanya jika bukti terakhir ditolak |
| UC-P21 | Menghubungi toko via WhatsApp | Tombol/tautan dengan label menurut status pesanan |

### 3.2 Use case Admin

| ID | Use case | Keterangan |
|---|---|---|
| UC-A01 | Login admin | Dengan sandi; dibatasi 10 percobaan per menit per IP |
| UC-A02 | Logout admin | Tombol "Keluar" |
| UC-A03 | Melihat daftar pesanan | Dengan filter dan pencarian |
| UC-A04 | Memfilter dan mencari pesanan | Filter status (`aktif`, `riwayat`, atau status tertentu), sumber, status pembayaran, rentang tanggal, kata kunci (nama, kode, no HP) |
| UC-A05 | Melihat detail pesanan | Data pemesan, item, opsi, pembayaran, lokasi |
| UC-A06 | Mengubah status pesanan | Mengikuti alur status |
| UC-A07 | Membatalkan pesanan | Wajib alasan pembatalan |
| UC-A08 | Memverifikasi bukti pembayaran | Terima / tolak baris pembayaran |
| UC-A09 | Mencatat pembayaran langsung | Tunai, transfer, atau pelunasan; langsung berstatus `diterima` |
| UC-A10 | Menandai pembayaran dikembalikan | Hanya setelah pesanan dibatalkan |
| UC-A11 | Menghubungi pelanggan via WhatsApp | Dengan 8 templat pesan |
| UC-A12 | Membuka rute pengantaran di Google Maps | Untuk pesanan `antar` |
| UC-A13 | Input pesanan manual | Dari sumber `whatsapp`, `facebook`, `langsung`, `website` |
| UC-A14 | Melihat daftar produk | Termasuk produk nonaktif |
| UC-A15 | Menambah produk | Dengan foto |
| UC-A16 | Mengubah produk | Termasuk mengganti foto |
| UC-A17 | Menghapus produk | Grup dan opsi ikut terhapus |
| UC-A18 | Mengaktifkan/menonaktifkan produk | Toggle "Produk aktif" |
| UC-A19 | Mengatur produk pre-order | Tanggal buka, tutup, ambil |
| UC-A20 | Mengelola grup opsi dan opsi produk | Maks 10 grup, 30 opsi per grup |
| UC-A21 | Melihat laporan penjualan | Harian atau bulanan |

### 3.3 Relasi `<<include>>` dan `<<extend>>`

**Include (wajib dijalankan di dalam use case induk):**

| Use case induk | Meng-include |
|---|---|
| UC-P08 Checkout pesanan | UC-P09 Memilih cara terima, UC-P10 Mengisi data pemesan, UC-P12 Memilih metode pembayaran |
| UC-P06 Menambah ke keranjang | UC-P05 Memilih opsi tambahan (jika produk punya opsi) |
| UC-P18 Melacak pesanan | UC-P19 Melihat status pesanan |
| UC-A03 Melihat daftar pesanan | UC-A04 Memfilter dan mencari |
| UC-A07 Membatalkan pesanan | UC-A06 Mengubah status pesanan |

**Extend (opsional, bergantung kondisi):**

| Use case tambahan | Memperluas | Kondisi |
|---|---|---|
| UC-P11 Memilih lokasi di peta | UC-P08 Checkout | cara terima = `antar` |
| UC-P13 Mengisi nominal split | UC-P12 Memilih metode | metode = `split` |
| UC-P14 Melihat info rekening | UC-P12 Memilih metode | metode = `transfer` atau `split` |
| UC-P15 Mengunggah bukti transfer | UC-P08 Checkout | metode = `transfer` atau `split` |
| UC-P17 Konfirmasi via WhatsApp | UC-P16 Halaman sukses | Opsional, pengguna menekan tombol |
| UC-P20 Mengunggah ulang bukti | UC-P19 Melihat status | Bukti pembayaran terakhir berstatus `ditolak` |
| UC-A08 Memverifikasi bukti | UC-A05 Detail pesanan | Ada baris pembayaran berstatus `menunggu` |
| UC-A10 Menandai dikembalikan | UC-A08 | Pesanan berstatus `dibatalkan` dan ada pembayaran `diterima` |
| UC-A19 Mengatur pre-order | UC-A16 Mengubah produk | Produk ditandai pre-order |
| UC-A20 Mengelola opsi | UC-A16 Mengubah produk | Admin membuka editor opsi |

### 3.4 Hak akses
- Semua use case admin (UC-A02 sampai UC-A21) mensyaratkan UC-A01 Login admin. Gambarkan satu relasi `<<include>>` dari kelompok use case admin ke UC-A01, atau cukup beri catatan di diagram.
- Pelanggan **tidak bisa** mengakses fitur admin.
- Semua endpoint admin membutuhkan header `Authorization: Bearer <JWT>`. Token tidak valid atau kedaluwarsa menghasilkan 401 "Sesi berakhir".

---

## 4. ALUR UNTUK ACTIVITY DIAGRAM

Gunakan **swimlane**: Pelanggan / Admin / Sistem (frontend + backend) / Database sesuai kebutuhan.

### AD-01 Memesan (browse sampai keranjang)
1. Pelanggan membuka beranda atau menu.
2. Sistem mengambil produk aktif. (Produk pre-order hanya tampil jika hari ini di antara `tanggal_buka` dan `tanggal_tutup`, inklusif.)
3. Pelanggan memilih produk. **Keputusan:** produk punya grup opsi?
   - Ya: pelanggan memilih opsi (grup wajib harus terisi; `pilih_satu` tepat 1; `min_pilih`/`max_pilih` dipenuhi; grup bergantung hanya tampil jika grup pemicunya terisi; opsi `butuh_teks` mewajibkan teks).
   - Tidak: lanjut.
4. Pelanggan menentukan qty (1 sampai 99) dan catatan item (maks 255).
5. Sistem menambah ke keranjang di browser. **Keputusan:** baris yang sama (produk + opsi + catatan) sudah ada? Jika ya, qty ditambahkan (maks 99); jika tidak, baris baru.
6. Header menampilkan lingkaran merah berisi jumlah item di tombol menu (HP) atau tombol Keranjang (desktop).
7. Pelanggan membuka keranjang, boleh ubah jumlah atau hapus, lalu menekan "Lanjut ke checkout".

### AD-02 Checkout
1. Pelanggan membuka `/checkout`. **Keputusan:** keranjang kosong? Jika ya tampil "Keranjang masih kosong" dan berhenti.
2. Pelanggan memilih cara terima: `ambil` atau `antar`.
3. Pelanggan mengisi nama dan nomor WhatsApp (dinormalisasi ke format 62), catatan opsional (maks 500).
4. **Keputusan:** `antar`?
   - Ya: isi alamat lengkap (10 sampai 255 karakter) dan pilih titik di peta (wajib).
5. Pelanggan memilih metode bayar:
   - **Transfer:** pilih channel, unggah bukti (JPG/PNG/WebP, maks 2 MB).
   - **Tunai:** tidak perlu bukti.
   - **Split:** isi nominal transfer (harus > 0 dan < total), pilih channel, unggah bukti; sisa dibayar tunai saat terima.
6. **Keputusan:** keranjang mencampur produk reguler dengan pre-order, atau pre-order berbeda tanggal ambil? Jika ya, tampil pesan galat dan checkout tidak bisa dikirim.
7. Tombol "Pesan sekarang" aktif hanya jika data lengkap.
8. Pelanggan menekan "Pesan sekarang". Sistem mengirim ke backend (lihat SD-01).
9. **Keputusan:** server menolak (validasi gagal)? Jika ya tampil pesan galat, kembali ke langkah sebelumnya. Jika berhasil, keranjang dikosongkan dan pelanggan diarahkan ke halaman sukses berisi kode pesanan.

### AD-03 Melacak pesanan dan unggah ulang bukti
1. Pelanggan membuka `/lacak` dan memasukkan kode pesanan.
2. Sistem mencari pesanan. **Keputusan:** ditemukan? Jika tidak tampil "Pesanan tidak ditemukan".
3. Halaman status tampil (timeline status, status pembayaran, rincian item, peta rute jika antar). Halaman memperbarui otomatis tiap 5 detik selama status belum final.
4. **Keputusan:** bukti pembayaran terakhir `ditolak`?
   - Ya: pelanggan melihat catatan penolakan, mengunggah bukti baru. Sistem membuat baris pembayaran `menunggu` baru.
   - Tidak: selesai.
5. Pelanggan boleh menekan tombol WhatsApp untuk menghubungi toko.

### AD-04 Admin memproses pesanan (end to end)
1. Admin login.
2. Admin membuka daftar pesanan, memfilter (misalnya `aktif`), memilih satu pesanan.
3. Admin membuka detail pesanan.
4. **Keputusan:** ada pembayaran `menunggu`?
   - Ya: lihat bukti, pilih **terima** (jumlah boleh dikoreksi) atau **tolak** (catatan wajib). Sistem menghitung ulang `jumlah_dibayar` dan `status_pembayaran`.
5. Admin menggerakkan status ke langkah berikutnya:
   - `ambil`: pending → diproses → siap diambil → selesai
   - `antar`: pending → diproses → dikirim → selesai
6. **Keputusan:** dibatalkan? Jika ya admin wajib mengisi alasan; pesanan menjadi final.
7. **Keputusan:** pesanan sudah `selesai` tetapi belum lunas? Diizinkan (tunai dibayar saat serah terima); admin masih boleh mencatat pembayaran sesudahnya.
8. Admin boleh mengirim pesan WhatsApp ke pelanggan memakai salah satu dari 8 templat.

### AD-05 Admin mencatat pembayaran langsung
1. Admin membuka detail pesanan. **Keputusan:** pesanan `dibatalkan`? Jika ya tidak bisa mencatat pembayaran.
2. Admin memilih metode (`tunai` / `transfer`) dan mengisi jumlah.
3. Jika `transfer`: pilih channel; unggah bukti **atau** isi catatan alasan (salah satu wajib).
4. Sistem menyimpan baris pembayaran berstatus `diterima`, `dicatat_oleh = admin`.
5. Sistem menghitung ulang total diterima. **Keputusan:** total diterima > total pesanan? Jika ya ditolak (kelebihan bayar) dan transaksi dibatalkan.
6. Status pembayaran diperbarui: `belum_dibayar` / `uang_muka` / `lunas`.

### AD-06 Pembatalan dan pengembalian dana
1. Admin memilih "Batalkan", mengisi alasan (wajib).
2. Status menjadi `dibatalkan`.
3. **Keputusan:** ada pembayaran `diterima`?
   - Ya: pengembalian uang dilakukan di luar sistem; admin menandai baris pembayaran `dikembalikan` dengan catatan (wajib).
   - Tidak: selesai.

### AD-07 Input pesanan manual oleh admin
1. Admin memilih sumber: `whatsapp`, `facebook`, `langsung`, atau `website`.
2. Mengisi data pemesan. Nomor HP wajib kecuali sumber `langsung`. Alamat wajib jika `antar`; koordinat opsional.
3. Memilih produk, qty, opsi.
4. **Keputusan:** campuran reguler dan pre-order? Ditolak; admin harus memecah menjadi dua pesanan.
5. Opsional mengisi pembayaran awal (tunai/transfer + jumlah). Jika transfer tanpa bukti wajib catatan. Jumlah tidak boleh melebihi total.
6. Sistem menyimpan pesanan; jika ada pembayaran awal, baris pembayaran langsung `diterima` dan status pembayaran dihitung.

### AD-08 Kelola produk
1. Admin membuka halaman Produk.
2. Pilihan: tambah, ubah, hapus, aktif/nonaktif, atur opsi.
3. Tambah/ubah: isi nama, harga, kategori, satuan, foto, status aktif, pre-order. **Keputusan:** pre-order? Jika ya wajib tiga tanggal dengan urutan `tanggal_buka <= tanggal_tutup <= tanggal_ambil`.
4. Atur opsi: admin mengganti **seluruh** grup dan opsi produk dalam satu simpan (satu transaksi).
5. Hapus: grup dan opsi ikut terhapus; riwayat pesanan tetap utuh karena menyimpan snapshot nama dan harga.

### AD-09 Laporan
1. Admin membuka Laporan, memilih periode `harian` atau `bulanan` dan rentang tanggal (maks 366 hari; bawaan harian 30 hari terakhir, bulanan 12 bulan terakhir).
2. Sistem menghitung per periode: jumlah pesanan, total tagihan, total diterima. Pesanan `dibatalkan` dikecualikan; tanggal acuan `created_at`.
3. Menampilkan baris per periode dan ringkasan total.

---

## 5. SKENARIO UNTUK SEQUENCE DIAGRAM

Partisipan umum: `Pelanggan`, `Admin`, `Frontend (React)`, `API (Express)`, `Service`, `Database (MySQL)`, `Penyimpanan File`.

### SD-01 Checkout dan pembuatan pesanan (publik)
1. Pelanggan → Frontend: tekan "Pesan sekarang".
2. Frontend → API: `POST /orders` (JSON untuk tunai; multipart untuk transfer/split dengan file `bukti`).
3. API: validasi data pemesan (nama, HP, alamat, koordinat), metode bayar.
4. API → Service `hitungPesanan`: hitung item. Service ← Service `daftarProduk(publik)`: ambil produk aktif beserta opsi dari DB.
5. Service: validasi produk tersedia, qty, opsi, grup wajib/pemicu, campur reguler/pre-order. Harga dari DB. Hitung `subtotal = (harga + harga_opsi) × qty`, `total = Σ subtotal`.
6. Jika metode bukan tunai: API cek channel, file bukti ada, split divalidasi `0 < nominal < total`. File disimpan dengan nama acak.
7. API → DB: **transaksi**: INSERT `orders` (kode `KCK-` + 6 karakter acak, ulang sampai 5x jika bentrok), INSERT `order_items`, INSERT `order_item_opsi`, dan jika bukan tunai INSERT `pembayaran` (`status = menunggu`, `dicatat_oleh = pelanggan`).
8. API → Frontend: `201 { kode_pesanan, total }`.
9. Frontend: kosongkan keranjang, navigasi ke `/berhasil/:kode`.
- **Alt:** validasi gagal → `400` dengan pesan; file yang sudah terunggah dibersihkan.

### SD-02 Melacak pesanan (publik)
1. Pelanggan → Frontend: kirim kode.
2. Frontend → API: `GET /orders/kode/:kode` (dibatasi 60 per menit per IP).
3. API: validasi format kode (`KCK-` + 6 karakter dari alfabet tertentu).
4. API → DB: cari `orders`; muat `order_items`, `order_item_opsi`, `pembayaran`.
5. API → Frontend: data status **tanpa `no_hp` dan `alamat`**; koordinat pelanggan dibulatkan 3 desimal.
6. Frontend: render timeline, ulangi pengambilan tiap 5 detik selama belum final.
- **Alt:** tidak ditemukan → `404`.

### SD-03 Unggah ulang bukti oleh pelanggan
1. Pelanggan → Frontend: pilih file, kirim.
2. Frontend → API: `POST /orders/kode/:kode/bukti` (multipart).
3. API → DB: transaksi; kunci pesanan (`FOR UPDATE`); cek status pesanan bukan final; ambil pembayaran terakhir.
4. **Alt:** pembayaran terakhir bukan `ditolak` → `409` ("Bukti sebelumnya masih menunggu verifikasi" atau "Tidak ada bukti yang perlu diunggah ulang").
5. INSERT baris `pembayaran` baru (`menunggu`, `dicatat_oleh = pelanggan`, jumlah sama dengan baris terakhir).
6. API → Frontend: `201 { ok: true }`; Frontend memuat ulang status.

### SD-04 Login admin
1. Admin → Frontend: isi sandi.
2. Frontend → API: `POST /auth/login` (dibatasi 10/menit/IP).
3. API: bandingkan sandi dengan perbandingan waktu-konstan (hash SHA-256 + `timingSafeEqual`).
4. API → Frontend: `{ token, kedaluwarsa }` atau `401 "Sandi salah"`.
5. Frontend: simpan token, arahkan ke `/pesanan`. Semua permintaan berikutnya membawa `Authorization: Bearer`.

### SD-05 Admin mengubah status pesanan
1. Admin → Frontend: pilih status tujuan (alasan wajib jika `dibatalkan`).
2. Frontend → API: `PATCH /orders/:id/status`.
3. API: middleware `wajibAdmin` memverifikasi JWT.
4. API → DB: transaksi; `SELECT ... FOR UPDATE` pesanan.
5. API: cek `bolehTransisi(statusSekarang, statusTujuan, tipePesanan)`. **Alt:** tidak sah → `409`.
6. API → DB: UPDATE `orders` (status, alasan_batal).
7. API → Frontend: detail pesanan terbaru.

### SD-06 Admin memverifikasi bukti pembayaran
1. Admin → Frontend: terima/tolak baris pembayaran (catatan wajib jika tolak).
2. Frontend → API: `PATCH /pembayaran/:id` `{ status, jumlah?, catatan? }`.
3. API → DB: transaksi; kunci `orders` lalu `pembayaran` (`FOR UPDATE`).
4. API: cek `bolehTransisiBaris(dari, ke)`; untuk `dikembalikan` pesanan harus `dibatalkan`.
5. API → DB: UPDATE `pembayaran` (status, jumlah, catatan, `diverifikasi_at = NOW()`).
6. API → Service `sinkronPembayaran`: hitung `jumlah_dibayar = Σ pembayaran berstatus diterima`; tentukan `status_pembayaran`; **Alt:** melebihi total → `400`, transaksi dibatalkan.
7. API → DB: UPDATE `orders` (`jumlah_dibayar`, `status_pembayaran`).
8. API → Frontend: detail pesanan terbaru.

### SD-07 Admin mencatat pembayaran langsung
1. Frontend → API: `POST /orders/:id/pembayaran` (JSON atau multipart `bukti`).
2. API: validasi metode, jumlah, channel, bukti atau catatan.
3. API → DB: transaksi; kunci `orders`; tolak jika `dibatalkan`.
4. INSERT `pembayaran` (`diterima`, `dicatat_oleh = admin`, `diverifikasi_at = NOW()`); jika `orders.metode_bayar` kosong, isi dengan metode ini.
5. `sinkronPembayaran` (seperti SD-06).
6. Respons detail pesanan.

### SD-08 Input pesanan manual
1. Frontend → API: `POST /orders/manual` (admin).
2. API: validasi sumber, pemesan (aturan manual), hitung pesanan, validasi pembayaran awal (opsional).
3. API → DB: transaksi INSERT `orders`, `order_items`, `order_item_opsi`, dan jika ada pembayaran awal INSERT `pembayaran` (`diterima`) lalu `sinkronPembayaran`.
4. Respons detail pesanan lengkap.

### SD-09 Kelola produk dan opsi
1. Simpan produk: `POST /products` (tambah) atau `PUT /products/:id` (ubah), multipart dengan file `foto`. API memvalidasi (aturan pre-order tiga tanggal), simpan file, INSERT/UPDATE `products`. Jika foto diganti, file lama dihapus.
2. Simpan opsi: `PUT /products/:id/opsi` dengan seluruh daftar grup. API: transaksi; kunci produk; DELETE `grup_opsi` produk (opsi ikut terhapus, `order_item_opsi.opsi_id` menjadi NULL); INSERT grup dan opsi baru; setelah semua grup ada, UPDATE `muncul_setelah_grup_id`.
3. Aktif/nonaktif: `PATCH /products/:id/aktif`.
4. Hapus: `DELETE /products/:id`; file foto dihapus.

### SD-10 Laporan
1. Frontend → API: `GET /laporan?periode=&dari=&sampai=` (admin).
2. API: tentukan rentang (`rentangLaporan`), validasi maks 366 hari.
3. API → DB: `SELECT DATE_FORMAT(created_at), COUNT(*), SUM(total), SUM(jumlah_dibayar) FROM orders WHERE status <> 'dibatalkan' AND DATE(created_at) BETWEEN ? AND ? GROUP BY periode`.
4. API: hitung ringkasan (`ringkas`) dan kirim `{ periode, dari, sampai, baris, ringkasan }`.

### SD-11 Daftar pesanan admin
1. `GET /orders?status=&sumber=&status_pembayaran=&dari=&sampai=&q=&batas=&mulai=` (admin).
2. API membangun kondisi dinamis, mengambil data dengan subquery jumlah item dan penanda `menunggu_verifikasi`, urut `created_at DESC`. Batas 1 sampai 200 (bawaan 100).

---

## 6. ATURAN BISNIS (BR) DAN VALIDASI

| ID | Aturan |
|---|---|
| BR-01 | Harga selalu dihitung server dari DB (`harga` + Σ `harga_tambah`). Klien tidak mengirim harga |
| BR-02 | Produk harus `aktif`. Produk pre-order hanya bisa dipesan jika hari ini di antara `tanggal_buka` dan `tanggal_tutup` (inklusif) |
| BR-03 | Opsi harus milik produk tersebut dan aktif. Grup `wajib` harus terisi. `pilih_satu` tepat 1. `min_pilih`/`max_pilih` dipenuhi. Grup bergantung hanya valid jika grup pemicunya terisi. Opsi `butuh_teks` wajib berteks |
| BR-04 | `qty` bilangan bulat 1 sampai 99 |
| BR-05 | Satu pesanan tidak boleh mencampur produk reguler dengan pre-order, atau pre-order dengan `tanggal_ambil` berbeda |
| BR-06 | `ambil`: nama + nomor WhatsApp. `antar`: nama + nomor WhatsApp + alamat + koordinat. Nomor dinormalisasi ke format 62 (regex `^62\d{8,13}$`). Input manual: koordinat opsional, HP wajib kecuali sumber `langsung` |
| BR-07 | Transfer: channel dan bukti wajib, jumlah = total. Split: channel, bukti, dan `nominal_transfer` wajib. Tunai: tanpa bukti. Pengecualian admin: transfer tanpa bukti boleh jika ada catatan alasan |
| BR-08 | `jumlah_dibayar` = Σ pembayaran berstatus `diterima`. 0 → `belum_dibayar`; 0 < x < total → `uang_muka`; x = total → `lunas`; x > total ditolak |
| BR-09 | Transisi status pesanan hanya mengikuti alur (bagian 8.4), dikunci `FOR UPDATE` |
| BR-10 | Pembatalan dari status non-final wajib `alasan_batal`. Pengembalian dana di luar sistem; admin menandai pembayaran `dikembalikan` + catatan |
| BR-11 | Laporan mengecualikan `dibatalkan`, tanggal acuan `created_at`, kolom total tagihan dan total diterima |
| BR-12 | Rute admin wajib JWT valid dan belum kedaluwarsa |
| BR-13 | Unggahan bukti: JPG/PNG/WebP, maks 2 MB, nama file acak, tipe diperiksa dari isi file |
| BR-14 | Respons publik pelacakan **tanpa** `no_hp` dan `alamat`; koordinat dibulatkan 3 desimal |
| BR-15 | Catatan pesanan maks 500 karakter, catatan item maks 255, teks opsi maks 100 |
| BR-16 | Rate limit: login 10/menit/IP; pelacakan 60/menit/IP |
| BR-17 | Split: `0 < nominal_transfer < total`; sisa dibayar tunai saat terima; nominal tidak bisa diubah pelanggan setelah pesanan dibuat |
| BR-18 | Tautan WhatsApp dibuat di klien; teks maks 1500 karakter; daftar item dipotong setelah 10 baris |
| BR-19 | Validasi input berlaku di klien **dan** server (server menolak dengan 400 + pesan Indonesia) |
| BR-20 | Ongkir tidak masuk `total` |
| BR-21 | Maks 30 item per pesanan; maks 30 opsi per item; total pesanan maks Rp99.999.999 |
| BR-22 | Pembayaran tidak bisa dicatat pada pesanan `dibatalkan` |
| BR-23 | Pesanan boleh `selesai` meski belum lunas |
| BR-24 | Nama pelanggan 2 sampai 100 karakter (huruf, spasi, titik, apostrof, tanda hubung); alamat 10 sampai 255 karakter |

---

## 7. CLASS DIAGRAM

Buat **dua** class diagram.

### 7.1 Class diagram domain (sesuai tabel database)

Tipe di bawah adalah tipe konseptual. Semua atribut yang berasal dari tabel memakai nama kolom persis.

**Produk** (`products`)
- `id: int`, `nama: string`, `harga: int`, `kategori: string`, `satuan: string`, `gambar: string`, `aktif: bool`, `is_preorder: bool`, `tanggal_buka: date`, `tanggal_tutup: date`, `tanggal_ambil: date`, `created_at: timestamp`
- Operasi: `tersediaSekarang(): bool`, `valid(): bool` (aturan tiga tanggal)

**GrupOpsi** (`grup_opsi`)
- `id`, `product_id`, `nama`, `tipe: {pilih_satu, pilih_banyak}`, `wajib: bool`, `min_pilih: int`, `max_pilih: int`, `urutan: int`, `muncul_setelah_grup_id: int`
- Operasi: `terlihat(pilihan): bool`

**OpsiProduk** (`opsi_produk`)
- `id`, `grup_id`, `nama`, `harga_tambah: int`, `butuh_teks: bool`, `label_teks: string`, `aktif: bool`, `urutan: int`

**Pesanan** (`orders`)
- `id`, `kode_pesanan: string`, `sumber: {website, whatsapp, facebook, langsung}`, `tipe_pesanan: {ambil, antar}`, `status: {pending, diproses, siap diambil, dikirim, selesai, dibatalkan}`, `nama_pelanggan`, `no_hp`, `alamat`, `lat: decimal`, `lng: decimal`, `tanggal_ambil: date`, `catatan`, `alasan_batal`, `total: int`, `metode_bayar: {tunai, transfer, split}`, `nominal_transfer: int`, `status_pembayaran: {belum_dibayar, uang_muka, lunas}`, `jumlah_dibayar: int`, `created_at`, `updated_at`
- Operasi: `sisa(): int`, `ubahStatus(ke, alasan)`, `bolehTransisi(ke): bool`, `hitungUlangPembayaran()`

**ItemPesanan** (`order_items`)
- `id`, `order_id`, `product_id`, `nama`, `harga`, `harga_opsi`, `qty`, `catatan`
- Operasi: `subtotal(): int` = `(harga + harga_opsi) × qty`

**OpsiItemPesanan** (`order_item_opsi`)
- `id`, `order_item_id`, `opsi_id`, `nama_grup`, `nama_opsi`, `harga_tambah`, `teks`

**Pembayaran** (`pembayaran`)
- `id`, `order_id`, `metode: {transfer, tunai}`, `channel: {dana, bca, bri, gopay}`, `jumlah: int`, `bukti_bayar: string`, `status: {menunggu, diterima, ditolak, dikembalikan}`, `dicatat_oleh: {pelanggan, admin}`, `catatan`, `created_at`, `diverifikasi_at`
- Operasi: `terima(jumlah?)`, `tolak(catatan)`, `kembalikan(catatan)`

**Kelas sisi klien (bukan tabel):**
- **Keranjang**: `items: ItemKeranjang[]`, `jumlahItem(): int`, `subtotal(): int`, `tambah()`, `ubahJumlah()`, `hapus()`, `kosongkan()` (tersimpan di penyimpanan browser)
- **ItemKeranjang**: `product_id`, `nama`, `harga`, `gambar`, `qty`, `opsi[]`, `catatan`, `is_preorder`, `tanggal_ambil`

**Kelas konfigurasi (bukan tabel; file `konfigurasi.js`):**
- **Toko**: `nama`, `alamat`, `lat`, `lng`, `jamBuka[]`, `waAdmin`
- **Rekening**: `kode {dana,bca,bri,gopay}`, `nama`, `nomor`, `atasNama`
- **Admin**: aktor tunggal tanpa tabel (sandi dan rahasia JWT dari variabel lingkungan)

**Relasi antar kelas (dengan multiplisitas):**
- Produk 1 ──< 0..* GrupOpsi (komposisi; hapus produk menghapus grup)
- GrupOpsi 1 ──< 0..* OpsiProduk (komposisi)
- GrupOpsi 0..* ── 0..1 GrupOpsi (asosiasi reflektif: `muncul_setelah_grup_id`)
- Pesanan 1 ──< 1..* ItemPesanan (komposisi)
- ItemPesanan 1 ──< 0..* OpsiItemPesanan (komposisi)
- Pesanan 1 ──< 0..* Pembayaran (komposisi)
- OpsiProduk 0..1 ──< 0..* OpsiItemPesanan (asosiasi lemah; `opsi_id` jadi NULL jika opsi dihapus)
- Produk 0..1 ··> 0..* ItemPesanan (**rujukan tanpa foreign key**; ItemPesanan menyimpan snapshot `nama` dan `harga`)
- Keranjang 1 ◇── 0..* ItemKeranjang

### 7.2 Class diagram lapisan aplikasi (backend)

Kode backend berbentuk modul fungsi. Modelkan setiap modul sebagai kelas/komponen:

| Kelas | Tipe | Tanggung jawab / operasi utama |
|---|---|---|
| `AuthRoute` | Controller | `login(sandi)` |
| `ProdukRoute` | Controller | `daftarPublik()`, `daftarSemua()`, `tambah()`, `ubah()`, `ubahAktif()`, `hapus()` |
| `OpsiRoute` | Controller | `gantiOpsiProduk(id, grup[])` |
| `PesananRoute` | Controller | `buat()`, `buatManual()`, `lacakByKode()`, `unggahUlangBukti()`, `daftar()`, `detail()`, `ubahStatus()` |
| `PembayaranRoute` | Controller | `catatLangsung()`, `verifikasi()` |
| `LaporanRoute` | Controller | `ambilLaporan()` |
| `ProdukService` | Service | `daftarProduk(publik)`, `ambilProduk(id)` |
| `HitungPesananService` | Service | `hitungPesanan(masukan, produkTersedia)` |
| `PesananService` | Service | `ambilPesananAdmin(id)`, `ambilStatusPublik(pesanan)`, `cariPesananByKode(kode)` |
| `StatusPembayaranService` | Service | `tentukanStatusPembayaran()`, `sinkronPembayaran()`, `sisaBayar()` |
| `LaporanService` | Service | `rentangLaporan()`, `ringkas()` |
| `ValidasiProduk` | Service | `periksaProduk()`, `periksaGrupOpsi()` |
| `StatusPesananRule` | Aturan bersama | `alurPesanan(tipe)`, `transisiTersedia()`, `bolehTransisi()`, `bolehTransisiBaris()` |
| `Validasi` | Aturan bersama | `validasiNama/Telepon/Alamat/Kode/Rupiah/NominalSplit...` |
| `WaTemplate` | Aturan bersama (klien) | `buatPesanPelanggan()`, `buatPesanAdmin(templat)`, `linkWa()` |
| `AuthMiddleware` | Middleware | `wajibAdmin()`, `buatToken()`, `cekSandi()` |
| `UploadMiddleware` | Middleware | `unggah(field, folder)`, `hapusFile()` |
| `RateLimitMiddleware` | Middleware | `batasLogin`, `batasLacak` |
| `Database` | Infrastruktur | `kueri()`, `transaksi()` |

**Relasi utama:** Controller → Service → Database; `PesananRoute` memakai `HitungPesananService`, `ProdukService`, `PesananService`, `StatusPembayaranService`; `PembayaranRoute` memakai `StatusPembayaranService`; semua route admin memakai `AuthMiddleware`; route unggah memakai `UploadMiddleware`.

Templat pesan admin (`WaTemplate.TEMPLAT_ADMIN`): `konfirmasi`, `bukti_ditolak`, `uang_muka`, `lunas`, `siap_diambil`, `dikirim`, `selesai`, `dibatalkan`.

---

## 8. DATABASE RELASIONAL

DBMS: **MySQL 8 / MariaDB 10.4+**, engine **InnoDB**, charset `utf8mb4`. Total **7 tabel**. Tidak ada tabel pelanggan, admin, keranjang, rekening, atau toko.

### 8.1 Tabel `products`
| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| **id** | INT AUTO_INCREMENT | NOT NULL | | **PK** |
| nama | VARCHAR(100) | NOT NULL | | |
| harga | INT | NOT NULL | | CHECK `harga >= 0` |
| kategori | VARCHAR(50) | NOT NULL | | Nilai: `kue`, `puding-salad`, `gorengan`, `lainnya` |
| satuan | VARCHAR(50) | NULL | | Contoh "per cup" |
| gambar | VARCHAR(255) | NULL | | Nama file foto |
| aktif | TINYINT(1) | NOT NULL | 1 | |
| is_preorder | TINYINT(1) | NOT NULL | 0 | |
| tanggal_buka | DATE | NULL | | |
| tanggal_tutup | DATE | NULL | | |
| tanggal_ambil | DATE | NULL | | |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | |

Constraint: `CHECK (is_preorder = 0 OR (tiga tanggal terisi AND tanggal_buka <= tanggal_tutup AND tanggal_tutup <= tanggal_ambil))`.
Index: `idx_products_kategori(kategori)`, `idx_products_aktif(aktif)`, `idx_products_preorder(is_preorder, tanggal_tutup)`.

### 8.2 Tabel `grup_opsi`
| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| **id** | INT AUTO_INCREMENT | NOT NULL | | **PK** |
| product_id | INT | NOT NULL | | **FK → products.id** ON DELETE CASCADE |
| nama | VARCHAR(100) | NOT NULL | | |
| tipe | ENUM('pilih_satu','pilih_banyak') | NOT NULL | 'pilih_satu' | |
| wajib | TINYINT(1) | NOT NULL | 0 | |
| min_pilih | INT | NOT NULL | 0 | |
| max_pilih | INT | NULL | | |
| urutan | INT | NOT NULL | 0 | |
| muncul_setelah_grup_id | INT | NULL | | **FK → grup_opsi.id** (reflektif) ON DELETE SET NULL |

Index: `idx_grup_product(product_id, urutan)`.

### 8.3 Tabel `opsi_produk`
| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| **id** | INT AUTO_INCREMENT | NOT NULL | | **PK** |
| grup_id | INT | NOT NULL | | **FK → grup_opsi.id** ON DELETE CASCADE |
| nama | VARCHAR(100) | NOT NULL | | |
| harga_tambah | INT | NOT NULL | 0 | CHECK `>= 0` |
| butuh_teks | TINYINT(1) | NOT NULL | 0 | Opsi perlu isian teks (misal nama di lilin) |
| label_teks | VARCHAR(100) | NULL | | |
| aktif | TINYINT(1) | NOT NULL | 1 | |
| urutan | INT | NOT NULL | 0 | |

Index: `idx_opsi_grup(grup_id, urutan)`.

### 8.4 Tabel `orders`
| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| **id** | INT AUTO_INCREMENT | NOT NULL | | **PK** |
| kode_pesanan | VARCHAR(12) | NOT NULL | | **UNIQUE**; format `KCK-` + 6 karakter |
| sumber | ENUM('website','whatsapp','facebook','langsung') | NOT NULL | 'website' | |
| tipe_pesanan | ENUM('ambil','antar') | NOT NULL | | |
| status | ENUM('pending','diproses','siap diambil','dikirim','selesai','dibatalkan') | NOT NULL | 'pending' | |
| nama_pelanggan | VARCHAR(100) | NOT NULL | | |
| no_hp | VARCHAR(20) | NULL | | Format 62... |
| alamat | VARCHAR(255) | NULL | | Hanya untuk `antar` |
| lat | DECIMAL(10,8) | NULL | | |
| lng | DECIMAL(11,8) | NULL | | |
| tanggal_ambil | DATE | NULL | | Terisi untuk pesanan pre-order |
| catatan | VARCHAR(500) | NULL | | |
| alasan_batal | VARCHAR(255) | NULL | | Wajib saat `dibatalkan` |
| total | INT | NOT NULL | | CHECK `>= 0`; tidak termasuk ongkir |
| metode_bayar | ENUM('tunai','transfer','split') | NULL | | |
| nominal_transfer | INT | NULL | | Hanya untuk `split` |
| status_pembayaran | ENUM('belum_dibayar','uang_muka','lunas') | NOT NULL | 'belum_dibayar' | Hasil hitung dari `pembayaran` |
| jumlah_dibayar | INT | NOT NULL | 0 | CHECK `>= 0`; hasil hitung |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | |

Index: `uq_orders_kode(kode_pesanan)` UNIQUE, `idx_orders_created`, `idx_orders_status`, `idx_orders_status_bayar`, `idx_orders_tanggal_ambil`.

**Alur status (untuk keperluan aturan integritas, bukan untuk state machine diagram):**
- `ambil`: pending → diproses → siap diambil → selesai
- `antar`: pending → diproses → dikirim → selesai
- `dibatalkan` bisa dari status non-final mana pun. `selesai` dan `dibatalkan` bersifat final.

### 8.5 Tabel `order_items`
| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| **id** | INT AUTO_INCREMENT | NOT NULL | | **PK** |
| order_id | INT | NOT NULL | | **FK → orders.id** ON DELETE CASCADE |
| product_id | INT | NOT NULL | | **Rujukan saja, TANPA foreign key** (agar riwayat tetap utuh jika produk dihapus) |
| nama | VARCHAR(100) | NOT NULL | | **Snapshot** nama produk |
| harga | INT | NOT NULL | | **Snapshot** harga satuan |
| harga_opsi | INT | NOT NULL | 0 | Σ harga tambah opsi |
| qty | INT | NOT NULL | | CHECK `>= 1` |
| catatan | VARCHAR(255) | NULL | | |

Index: `idx_items_order(order_id)`, `idx_items_product(product_id)`.

### 8.6 Tabel `order_item_opsi`
| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| **id** | INT AUTO_INCREMENT | NOT NULL | | **PK** |
| order_item_id | INT | NOT NULL | | **FK → order_items.id** ON DELETE CASCADE |
| opsi_id | INT | NULL | | **FK → opsi_produk.id** ON DELETE SET NULL |
| nama_grup | VARCHAR(100) | NOT NULL | | **Snapshot** |
| nama_opsi | VARCHAR(100) | NOT NULL | | **Snapshot** |
| harga_tambah | INT | NOT NULL | 0 | **Snapshot** |
| teks | VARCHAR(100) | NULL | | Isian teks pelanggan |

Index: `idx_itemopsi_item(order_item_id)`.

### 8.7 Tabel `pembayaran`
| Kolom | Tipe | Null | Default | Keterangan |
|---|---|---|---|---|
| **id** | INT AUTO_INCREMENT | NOT NULL | | **PK** |
| order_id | INT | NOT NULL | | **FK → orders.id** ON DELETE CASCADE |
| metode | ENUM('transfer','tunai') | NOT NULL | | |
| channel | ENUM('dana','bca','bri','gopay') | NULL | | Wajib bila `metode = transfer` |
| jumlah | INT | NOT NULL | | CHECK `> 0` |
| bukti_bayar | VARCHAR(255) | NULL | | Nama file bukti |
| status | ENUM('menunggu','diterima','ditolak','dikembalikan') | NOT NULL | 'menunggu' | |
| dicatat_oleh | ENUM('pelanggan','admin') | NOT NULL | | |
| catatan | VARCHAR(255) | NULL | | |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | |
| diverifikasi_at | TIMESTAMP | NULL | NULL | |

Constraint: `CHECK (metode <> 'transfer' OR channel IS NOT NULL)`.
Index: `idx_bayar_order(order_id)`, `idx_bayar_status(status)`.

**Aturan transisi status baris pembayaran:** `menunggu → diterima | ditolak`; `diterima → dikembalikan` (hanya jika pesanan `dibatalkan`); `ditolak` dan `dikembalikan` final. Jika `ditolak`, pelanggan mengunggah ulang sebagai **baris baru** `menunggu`.

### 8.8 Ringkasan relasi untuk ERD (crow's foot)

| Induk | Anak | Kardinalitas | Jenis | ON DELETE |
|---|---|---|---|---|
| products | grup_opsi | 1 : 0..N | Identifying/FK `product_id` | CASCADE |
| grup_opsi | opsi_produk | 1 : 0..N | FK `grup_id` | CASCADE |
| grup_opsi | grup_opsi | 0..1 : 0..N | FK reflektif `muncul_setelah_grup_id` | SET NULL |
| orders | order_items | 1 : 1..N | FK `order_id` | CASCADE |
| order_items | order_item_opsi | 1 : 0..N | FK `order_item_id` | CASCADE |
| opsi_produk | order_item_opsi | 0..1 : 0..N | FK `opsi_id` | SET NULL |
| orders | pembayaran | 1 : 0..N | FK `order_id` | CASCADE |
| products | order_items | 0..1 : 0..N | **Hanya rujukan logis `product_id` (tanpa FK)** | tidak ada |

Gambarkan relasi `products → order_items` sebagai **garis putus-putus** dan beri catatan "tanpa FK, snapshot".

### 8.9 Catatan normalisasi (untuk Bab/penjelasan)
- **1NF:** semua kolom atomik; tidak ada grup berulang (item dan opsi pesanan dipisah ke tabel sendiri).
- **2NF:** semua tabel memakai PK tunggal (`id`), jadi tidak ada ketergantungan parsial.
- **3NF:** tidak ada ketergantungan transitif pada atribut non-kunci, **kecuali redundansi yang disengaja** berikut:
  1. `order_items.nama`, `order_items.harga` dan `order_item_opsi.nama_grup/nama_opsi/harga_tambah` adalah **snapshot** agar riwayat pesanan tidak berubah saat produk/opsi diubah atau dihapus.
  2. `orders.jumlah_dibayar` dan `orders.status_pembayaran` adalah **hasil turunan** dari Σ `pembayaran` berstatus `diterima`, disimpan demi kecepatan baca dan dihitung ulang tiap pembayaran berubah.
  3. `orders.total` hasil turunan dari Σ `(harga + harga_opsi) × qty` item, disimpan sebagai angka final saat pesanan dibuat.
  4. `orders.metode_bayar` dan `orders.nominal_transfer` merangkum pilihan pelanggan saat checkout.

---

## 9. DAFTAR ENDPOINT API (untuk pemetaan sequence/class diagram)

| Method | Path | Akses | Fungsi |
|---|---|---|---|
| POST | `/auth/login` | Publik (rate limit) | Login admin, hasil JWT |
| GET | `/products` | Publik | Produk aktif + opsi aktif |
| GET | `/products/semua` | Admin | Semua produk + semua opsi |
| POST | `/products` | Admin | Tambah produk (+ foto) |
| PUT | `/products/:id` | Admin | Ubah produk (+ foto) |
| PATCH | `/products/:id/aktif` | Admin | Ubah status aktif |
| DELETE | `/products/:id` | Admin | Hapus produk |
| PUT | `/products/:id/opsi` | Admin | Ganti seluruh grup dan opsi produk |
| POST | `/orders` | Publik | Buat pesanan pelanggan (+ bukti) |
| POST | `/orders/manual` | Admin | Buat pesanan manual |
| GET | `/orders/kode/:kode` | Publik (rate limit) | Lacak pesanan |
| POST | `/orders/kode/:kode/bukti` | Publik (rate limit) | Unggah ulang bukti |
| GET | `/orders` | Admin | Daftar pesanan + filter |
| GET | `/orders/:id` | Admin | Detail pesanan |
| PATCH | `/orders/:id/status` | Admin | Ubah status |
| POST | `/orders/:id/pembayaran` | Admin | Catat pembayaran langsung |
| PATCH | `/pembayaran/:id` | Admin | Verifikasi baris pembayaran |
| GET | `/laporan` | Admin | Laporan harian/bulanan |

---

## 10. PETA HALAMAN

**customer-app**

| Rute | Halaman |
|---|---|
| `/` | Beranda |
| `/menu`, `/menu/:kategori` | Daftar menu + filter kategori |
| `/preorder` | Menu pre-order |
| `/checkout` | Checkout (cara terima, data pemesan, pengantaran, metode bayar) |
| `/berhasil/:kode` | Halaman sukses + kode pesanan |
| `/lacak` | Form lacak pesanan |
| `/status/:kode` | Status pesanan |
| `*` | Halaman tidak ditemukan |

Komponen global: header (menu laci + keranjang), laci keranjang, footer (alamat, WhatsApp, jam buka).

**admin-app**

| Rute | Halaman |
|---|---|
| `/login` | Login admin |
| `/pesanan` | Daftar pesanan |
| `/pesanan/:id` | Detail pesanan |
| `/input-manual` | Input pesanan manual |
| `/produk` | Kelola produk dan opsi |
| `/laporan` | Laporan |

---

## 11. YANG TIDAK ADA DI SISTEM (jangan digambar)

- Registrasi/login pelanggan, profil pelanggan, riwayat pesanan akun.
- Payment gateway, pembayaran otomatis, QRIS.
- Pengiriman WhatsApp otomatis (hanya tautan `wa.me` yang dibuka manual).
- Notifikasi email atau push.
- Banyak admin, peran/role, manajemen pengguna.
- Perhitungan ongkir otomatis.
- Stok produk atau manajemen persediaan.
- Kupon, diskon, atau poin.
- Ulasan atau rating produk.
- Tabel keranjang di database.

---

## 12. CHECKLIST HASIL AKHIR

- [ ] 1 Use Case Diagram (Pelanggan + Admin, dengan include/extend)
- [ ] 9 Activity Diagram (AD-01 sampai AD-09)
- [ ] 11 Sequence Diagram (SD-01 sampai SD-11)
- [ ] 2 Class Diagram (domain + lapisan aplikasi)
- [ ] 1 ERD (7 tabel, crow's foot, tanpa FK untuk `products → order_items`)
- [ ] LRS / skema relasional
- [ ] Kamus data 7 tabel
- [ ] Catatan normalisasi
- [ ] Daftar asumsi (jika ada)
