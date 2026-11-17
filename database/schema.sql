-- Kecaknik Food: skema database (STRUKTUR bagian 6).
-- Tidak memuat CREATE DATABASE: `npm run db:reset` membuat basis data dari DB_NAME
-- di backend/.env, lalu menjalankan berkas ini dan seed.sql.
-- Untuk impor manual via phpMyAdmin: buat basis data kosong, pilih, lalu impor.
-- Kompatibel MariaDB 10.4+ (XAMPP) dan MySQL 8.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS pembayaran;
DROP TABLE IF EXISTS order_item_opsi;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS opsi_produk;
DROP TABLE IF EXISTS grup_opsi;
DROP TABLE IF EXISTS products;

SET FOREIGN_KEY_CHECKS = 1;

-- 6.1 products ---------------------------------------------------------------
CREATE TABLE products (
  id             INT NOT NULL AUTO_INCREMENT,
  nama           VARCHAR(100) NOT NULL,
  harga          INT NOT NULL,
  kategori       VARCHAR(50) NOT NULL,
  satuan         VARCHAR(50) NULL,
  gambar         VARCHAR(255) NULL,
  aktif          TINYINT(1) NOT NULL DEFAULT 1,
  is_preorder    TINYINT(1) NOT NULL DEFAULT 0,
  tanggal_buka   DATE NULL,
  tanggal_tutup  DATE NULL,
  tanggal_ambil  DATE NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_kategori (kategori),
  KEY idx_products_aktif (aktif),
  KEY idx_products_preorder (is_preorder, tanggal_tutup),
  CONSTRAINT chk_products_harga CHECK (harga >= 0),
  -- Produk PO wajib punya tiga tanggal, urutan buka <= tutup <= ambil
  CONSTRAINT chk_products_po CHECK (
    is_preorder = 0 OR (
      tanggal_buka IS NOT NULL AND tanggal_tutup IS NOT NULL AND tanggal_ambil IS NOT NULL
      AND tanggal_buka <= tanggal_tutup AND tanggal_tutup <= tanggal_ambil
    )
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6.2 grup_opsi --------------------------------------------------------------
CREATE TABLE grup_opsi (
  id                      INT NOT NULL AUTO_INCREMENT,
  product_id              INT NOT NULL,
  nama                    VARCHAR(100) NOT NULL,
  tipe                    ENUM('pilih_satu','pilih_banyak') NOT NULL DEFAULT 'pilih_satu',
  wajib                   TINYINT(1) NOT NULL DEFAULT 0,
  min_pilih               INT NOT NULL DEFAULT 0,
  max_pilih               INT NULL,
  urutan                  INT NOT NULL DEFAULT 0,
  -- Grup ini tampil hanya bila grup pemicu terisi. Harus satu produk (dijaga di API).
  muncul_setelah_grup_id  INT NULL,
  PRIMARY KEY (id),
  KEY idx_grup_product (product_id, urutan),
  CONSTRAINT fk_grup_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_grup_pemicu FOREIGN KEY (muncul_setelah_grup_id) REFERENCES grup_opsi (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6.3 opsi_produk ------------------------------------------------------------
CREATE TABLE opsi_produk (
  id            INT NOT NULL AUTO_INCREMENT,
  grup_id       INT NOT NULL,
  nama          VARCHAR(100) NOT NULL,
  harga_tambah  INT NOT NULL DEFAULT 0,
  butuh_teks    TINYINT(1) NOT NULL DEFAULT 0,
  label_teks    VARCHAR(100) NULL,
  aktif         TINYINT(1) NOT NULL DEFAULT 1,
  urutan        INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_opsi_grup (grup_id, urutan),
  CONSTRAINT fk_opsi_grup FOREIGN KEY (grup_id) REFERENCES grup_opsi (id) ON DELETE CASCADE,
  CONSTRAINT chk_opsi_harga CHECK (harga_tambah >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6.4 orders -----------------------------------------------------------------
CREATE TABLE orders (
  id                 INT NOT NULL AUTO_INCREMENT,
  kode_pesanan       VARCHAR(12) NOT NULL,
  sumber             ENUM('website','whatsapp','facebook','langsung') NOT NULL DEFAULT 'website',
  tipe_pesanan       ENUM('ambil','antar') NOT NULL,
  status             ENUM('pending','diproses','siap diambil','dikirim','selesai','dibatalkan') NOT NULL DEFAULT 'pending',
  nama_pelanggan     VARCHAR(100) NOT NULL,
  no_hp              VARCHAR(20) NULL,
  alamat             VARCHAR(255) NULL,
  lat                DECIMAL(10,8) NULL,
  lng                DECIMAL(11,8) NULL,
  tanggal_ambil      DATE NULL,
  catatan            VARCHAR(500) NULL,
  alasan_batal       VARCHAR(255) NULL,
  total              INT NOT NULL,
  metode_bayar       ENUM('tunai','transfer','split') NULL,
  nominal_transfer   INT NULL,
  status_pembayaran  ENUM('belum_dibayar','uang_muka','lunas') NOT NULL DEFAULT 'belum_dibayar',
  jumlah_dibayar     INT NOT NULL DEFAULT 0,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_kode (kode_pesanan),
  KEY idx_orders_created (created_at),
  KEY idx_orders_status (status),
  KEY idx_orders_status_bayar (status_pembayaran),
  KEY idx_orders_tanggal_ambil (tanggal_ambil),
  CONSTRAINT chk_orders_total CHECK (total >= 0),
  CONSTRAINT chk_orders_dibayar CHECK (jumlah_dibayar >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6.5 order_items ------------------------------------------------------------
-- product_id hanya rujukan (tanpa FK): baris pesanan tetap utuh lewat snapshot nama dan harga.
CREATE TABLE order_items (
  id          INT NOT NULL AUTO_INCREMENT,
  order_id    INT NOT NULL,
  product_id  INT NOT NULL,
  nama        VARCHAR(100) NOT NULL,
  harga       INT NOT NULL,
  harga_opsi  INT NOT NULL DEFAULT 0,
  qty         INT NOT NULL,
  catatan     VARCHAR(255) NULL,
  PRIMARY KEY (id),
  KEY idx_items_order (order_id),
  KEY idx_items_product (product_id),
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT chk_items_qty CHECK (qty >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6.6 order_item_opsi --------------------------------------------------------
CREATE TABLE order_item_opsi (
  id             INT NOT NULL AUTO_INCREMENT,
  order_item_id  INT NOT NULL,
  opsi_id        INT NULL,
  nama_grup      VARCHAR(100) NOT NULL,
  nama_opsi      VARCHAR(100) NOT NULL,
  harga_tambah   INT NOT NULL DEFAULT 0,
  teks           VARCHAR(100) NULL,
  PRIMARY KEY (id),
  KEY idx_itemopsi_item (order_item_id),
  CONSTRAINT fk_itemopsi_item FOREIGN KEY (order_item_id) REFERENCES order_items (id) ON DELETE CASCADE,
  CONSTRAINT fk_itemopsi_opsi FOREIGN KEY (opsi_id) REFERENCES opsi_produk (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6.7 pembayaran -------------------------------------------------------------
CREATE TABLE pembayaran (
  id                INT NOT NULL AUTO_INCREMENT,
  order_id          INT NOT NULL,
  metode            ENUM('transfer','tunai') NOT NULL,
  channel           ENUM('dana','bca','bri','gopay') NULL,
  jumlah            INT NOT NULL,
  bukti_bayar       VARCHAR(255) NULL,
  status            ENUM('menunggu','diterima','ditolak','dikembalikan') NOT NULL DEFAULT 'menunggu',
  dicatat_oleh      ENUM('pelanggan','admin') NOT NULL,
  catatan           VARCHAR(255) NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  diverifikasi_at   TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_bayar_order (order_id),
  KEY idx_bayar_status (status),
  CONSTRAINT fk_bayar_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT chk_bayar_jumlah CHECK (jumlah > 0),
  -- Channel wajib untuk transfer
  CONSTRAINT chk_bayar_channel CHECK (metode <> 'transfer' OR channel IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
