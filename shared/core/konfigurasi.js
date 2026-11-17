// Konfigurasi toko. Data bisnis yang belum ada sengaja dikosongkan atau 'TBD'.
// Jangan mengarang nomor rekening, nomor WhatsApp, alamat, atau koordinat.

export const toko = {
  nama: 'Kecaknik Food',
  alamat: '', // D-17: isi pemilik
  lat: null, // D-17
  lng: null, // D-17
  jamBuka: '', // D-17
  waAdmin: '6281999915104', // D-16 (dari pemilik): format 62...
};

export const rekening = [
  // D-15: DANA sudah diisi pemilik (nomor); atas nama dan BCA, BRI, GoPay masih TBD
  { kode: 'dana', nama: 'DANA', nomor: '6281999915104', atasNama: 'TBD' },
  { kode: 'bca', nama: 'BCA', nomor: 'TBD', atasNama: 'TBD' },
  { kode: 'bri', nama: 'BRI', nomor: 'TBD', atasNama: 'TBD' },
  { kode: 'gopay', nama: 'GoPay', nomor: 'TBD', atasNama: 'TBD' },
];

export const kanal = ['website', 'whatsapp', 'facebook', 'langsung'];

// Kode kategori produk (kolom products.kategori). Label tampilan ada di UI.
export const kategoriProduk = ['kue', 'puding-salad', 'gorengan', 'lainnya'];
