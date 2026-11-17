-- Kecaknik Food: data awal (STRUKTUR Lampiran A dan B).
-- Dijalankan setelah schema.sql oleh `npm run db:reset`.
SET NAMES utf8mb4;

-- 20 produk (Lampiran A). Foto produk asli menyusul: kolom gambar dibiarkan NULL.
INSERT INTO products (id, nama, harga, kategori, satuan) VALUES
  ( 1, 'Klappertart',                 6000, 'kue',          'per cup'),
  ( 2, 'Bolen pisang',               30000, 'kue',          '1 box isi 10 pcs'),
  ( 3, 'Nastar 250 gr',              35000, 'kue',          '250 gr'),
  ( 4, 'Nastar 500 gr',              70000, 'kue',          '500 gr'),
  ( 5, 'Aneka bolu jadul',           40000, 'kue',          'per pcs'),
  ( 6, 'Puding cup',                 12000, 'puding-salad', 'per cup'),
  ( 7, 'Puding ultah',              150000, 'puding-salad', 'per pcs'),
  ( 8, 'Salad buah',                 15000, 'puding-salad', 'per cup'),
  ( 9, 'Pastel telur sayur',          2000, 'gorengan',     'per pcs'),
  (10, 'Roti goreng ayam',            2000, 'gorengan',     'per pcs'),
  (11, 'Risol telur mayo',            2500, 'gorengan',     'per pcs'),
  (12, 'Lumpia sosis sayur',          2000, 'gorengan',     'per pcs'),
  (13, 'Pizza mozarella',            35000, 'lainnya',      'per pcs'),
  (14, 'Pizza mozarella full sosis', 40000, 'lainnya',      'diameter 22 cm'),
  (15, 'Chicken steak',              15000, 'lainnya',      'per porsi'),
  (16, 'Woku kepala kakap',          18000, 'lainnya',      'per porsi'),
  (17, 'Rica-rica bebek',            20000, 'lainnya',      'per pcs'),
  (18, 'Spaghetti',                  10000, 'lainnya',      'per pcs'),
  (19, 'Macaroni schotel',            5000, 'lainnya',      'per pcs'),
  (20, 'Saos serbaguna',             17000, 'lainnya',      '250 ml');

-- 1 produk Pre-order contoh: Aneka bolu jadul (id 5). Tanggal relatif terhadap hari
-- db:reset dijalankan, jadi PO selalu sedang dibuka saat demo.
UPDATE products
   SET is_preorder   = 1,
       tanggal_buka  = CURDATE(),
       tanggal_tutup = DATE_ADD(CURDATE(), INTERVAL 14 DAY),
       tanggal_ambil = DATE_ADD(CURDATE(), INTERVAL 16 DAY)
 WHERE id = 5;

-- Grup dan opsi contoh (Lampiran B). SEMUA harga_tambah = 0 adalah placeholder TBD
-- sampai pemilik menjawab D-01. Jangan mengarang harga.
INSERT INTO grup_opsi (id, product_id, nama, tipe, wajib, min_pilih, max_pilih, urutan, muncul_setelah_grup_id) VALUES
  (1,  7, 'Lilin umur',        'pilih_satu',   1, 1, 1,    1, NULL),
  (2,  7, 'Lilin nama',        'pilih_satu',   0, 0, 1,    2, 1),
  (3, 13, 'Topping tambahan',  'pilih_banyak', 0, 0, NULL, 1, NULL);

INSERT INTO opsi_produk (grup_id, nama, harga_tambah, butuh_teks, label_teks, urutan) VALUES
  (1, '1 lilin',        0, 0, NULL,            1),  -- TBD D-01
  (1, '2 lilin',        0, 0, NULL,            2),  -- TBD D-01
  (1, '3 lilin',        0, 0, NULL,            3),  -- TBD D-01
  (2, 'Lilin nama',     0, 1, 'Nama di lilin', 1),  -- TBD D-01 (D-02: harga tetap, teks tanpa pengali)
  (3, 'Topping A',      0, 0, NULL,            1),  -- TBD D-01
  (3, 'Topping B',      0, 0, NULL,            2);  -- TBD D-01
