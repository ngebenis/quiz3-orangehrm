// cypress/support/data/categoryData.js
// Lapisan data untuk API test Platzi (https://fakeapi.platzi.com/en/rest/categories).
//
// Semua nilai di sini diverifikasi langsung ke API hidup sebelum ditulis —
// bukan diasumsikan dari dokumentasi. Beberapa perilaku yang perlu diketahui:
//   * POST /categories TIDAK memerlukan token (201 tanpa header Authorization).
//   * `offset` diabaikan oleh API, hanya `limit` yang dihormati.
//   * Slug dibuat otomatis dari name: lowercase, spasi/simbol jadi "-".
//   * Id yang tidak ada mengembalikan 400 EntityNotFoundError, BUKAN 404.
//   * Id non-numerik mengembalikan 400 "numeric string is expected".
//   * DELETE mengembalikan body berupa TEKS "true" (content-type text/html),
//     bukan JSON boolean — jadi dibandingkan sebagai string.
//   * Payload {} atau {name:null} membuat API crash 500 Internal server error,
//     bukan 400. Validasi 400 hanya jalan kalau minimal satu field terisi.
//     Ini bug di sisi API, dicatat di README, bukan sesuatu yang kita tutupi.

export const apiBaseUrl = 'https://api.escuelajs.co/api/v1';

// Kategori seed yang dipakai untuk assertion nilai konkret.
export const seededCategory = {
  id: 1,
  slug: 'clothes'
};

// Gambar valid untuk payload (harus URL, kalau tidak ditolak validator).
export const validImage = 'https://i.imgur.com/QkIa5tT.jpeg';

// Payload yang benar-benar ditolak validator dengan 400:
// name kosong (image valid). Payload {} justru membuat API crash 500,
// jadi tidak dipakai untuk menguji jalur validasi.
export const invalidPayload = {
  name: '',
  image: 'https://i.imgur.com/QkIa5tT.jpeg'
};

// Payload tanpa image — memicu pesan validasi image.
export const payloadWithoutImage = {
  name: 'QA API No Image'
};

export const expectedErrors = {
  notFound: 'EntityNotFoundError',
  notNumeric: 'numeric string is expected',
  nameEmpty: 'name should not be empty',
  imageEmpty: 'image should not be empty',
  imageNotUrl: 'image must be a URL address'
};

// Status code yang benar-benar dikembalikan API untuk tiap kasus.
export const statusCodes = {
  ok: 200,
  created: 201,
  badRequest: 400,
  serverError: 500
};

// Body sukses DELETE: API mengirim teks mentah, bukan JSON boolean.
export const deleteSuccessBody = 'true';

/**
 * Slug yang seharusnya dihasilkan API dari sebuah name.
 * Dipakai untuk memverifikasi response body value, bukan hanya status code.
 */
export const slugify = (name) =>
  String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Nama unik per run supaya tidak bertabrakan dengan data peserta lain
 * di demo publik ini.
 */
export const uniqueName = (prefix = 'QA API') => `${prefix} ${Date.now()}`;

export const payloadFor = (name) => ({ name, image: validImage });
