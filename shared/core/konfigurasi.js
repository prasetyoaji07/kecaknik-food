// Konfigurasi toko. Data bisnis yang belum ada sengaja dikosongkan atau 'TBD'.
// Jangan mengarang nomor rekening, nomor WhatsApp, alamat, atau koordinat.

export const toko = {
  nama: 'Kecaknik Food',
  alamat: 'Unnamed Road, Sukasari, Kec. Serang Baru, Kabupaten Bekasi, Jawa Barat 17330',
  lat: -6.379017,
  lng: 107.105995,
  jamBuka: [
    { label: 'Pesan online', jam: 'Buka 24 jam' },
    { label: 'COD dan lainnya', jam: '08:00 - 21:00 WIB' },
  ],
  waAdmin: '6281999915104', // D-16 (dari pemilik): format 62...
};

export const rekening = [
  // D-15: atas nama semua rekening = pemilik; nomor BCA, BRI, GoPay masih TBD
  { kode: 'dana', nama: 'DANA', nomor: '6281999915104', atasNama: 'Antonius Randie H.' },
  { kode: 'bca', nama: 'BCA', nomor: 'TBD', atasNama: 'Antonius Randie H.' },
  { kode: 'bri', nama: 'BRI', nomor: 'TBD', atasNama: 'Antonius Randie H.' },
  { kode: 'gopay', nama: 'GoPay', nomor: 'TBD', atasNama: 'Antonius Randie H.' },
];

export const kanal = ['website', 'whatsapp', 'facebook', 'langsung'];

// Kode kategori produk (kolom products.kategori). Label tampilan ada di UI.
export const kategoriProduk = ['kue', 'puding-salad', 'gorengan', 'lainnya'];
