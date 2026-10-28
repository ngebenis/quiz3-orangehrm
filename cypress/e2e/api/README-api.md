# API Automation — Platzi Categories (Hari 18)

Automation test API menggunakan **Cypress `cy.request`** pada
<https://fakeapi.platzi.com/en/rest/categories>.

- **Jumlah test case:** 14 (syarat minimal 12)
- **Setiap test** punya assertion pada **status code** dan **response body value**
- **Hasil:** 14 passing, 0 failing (~13 detik)
- **Folder:** `cypress/e2e/api/` — terpisah dari UI test (Quiz 3, intercept, POM)

## Struktur file

```
cypress/
├── api/
│   └── CategoryApi.js              # service layer: semua request ke endpoint categories
├── e2e/api/
│   ├── category-api.cy.js          # 14 test case (TC-API-001 … TC-API-014)
│   └── README-api.md               # dokumen ini
└── support/data/
    └── categoryData.js             # data & konstanta: URL, payload, status code, error message
cypress.api.config.js               # config khusus API (baseUrl API, tanpa video/screenshot)
```

Tiga lapisan, sama polanya dengan POM di Hari 17:

| Lapisan | File | Isi |
|---|---|---|
| Service | `cypress/api/CategoryApi.js` | URL endpoint + method `getList`, `getById`, `create`, `update`, `delete` |
| Data | `cypress/support/data/categoryData.js` | payload, status code, pesan error, helper `slugify` |
| Test | `cypress/e2e/api/category-api.cy.js` | 14 `it` block, assertion saja |

Spec tidak menulis URL mentah — semua lewat `CategoryApi`. Kalau endpoint berubah,
cukup satu file yang disentuh.

## Daftar test case

| ID | Method | Endpoint | Assertion utama |
|---|---|---|---|
| TC-API-001 | GET | `/categories` | status 200, body array, tidak kosong |
| TC-API-002 | GET | `/categories?limit=5` | 5 item, tiap item punya 6 field lengkap, `image` berupa URL |
| TC-API-003 | GET | `/categories/1` | status 200, `id` = 1, `slug` = `clothes` |
| TC-API-004 | GET | `/categories?limit=3` | status 200, panjang array = 3 |
| TC-API-005 | POST | `/categories` | status 201, `name` sesuai, `slug` = slugify(name) |
| TC-API-006 | POST → GET | `/categories` lalu `/categories/:id` | status 201 & 200, data hasil GET sama dengan yang dibuat |
| TC-API-007 | POST → PUT | `/categories/:id` | status 200, `name` berubah, `slug` ikut berubah |
| TC-API-008 | POST → DELETE → GET | `/categories/:id` | DELETE 200 body `"true"`, GET setelahnya 400 `EntityNotFoundError` |
| TC-API-009 | GET | `/categories/999999` | status 400, `name` = `EntityNotFoundError`, `path` memuat id |
| TC-API-010 | GET | `/categories/abc` | status 400, `message` memuat `numeric string is expected` |
| TC-API-011 | POST | `/categories` (name kosong) | status 400, `message` memuat `name should not be empty`, tidak ada `id` |
| TC-API-012 | POST | `/categories` (tanpa image) | status 400, `message` memuat `image should not be empty` + `image must be a URL address` |
| TC-API-013 | GET | `/categories/1/products` | status 200, semua produk `category.id` = 1, `price` number |
| TC-API-014 | POST | `/categories` (`{}`) | status 500, `message` = `Internal server error` (bug API, lihat catatan) |

## Perilaku API yang diverifikasi langsung (bukan asumsi)

Semua ini dicek dulu dengan `curl` sebelum assertion ditulis, karena
dokumentasi tidak menyebutkannya:

1. **`offset` diabaikan.** `?limit=2&offset=0` dan `?limit=2&offset=1`
   mengembalikan id yang sama (`[1, 2]`). Hanya `limit` yang dihormati —
   karena itu tidak ada test pagination offset.
2. **DELETE mengembalikan teks, bukan JSON.** Body-nya `true` dengan
   `content-type: text/html`. Assertion memakai `String(body)`, bukan `to.eq(true)`.
3. **Id tidak ada → 400, bukan 404.** Body `{ name: "EntityNotFoundError", ... }`.
4. **Id non-numerik → 400** dengan `message: "Validation failed (numeric string is expected)"`.
5. **POST tidak butuh autentikasi.** `POST /categories` mengembalikan 201 tanpa
   header `Authorization`. Karena itu tidak ada test 401 di sini.
6. **Slug dibuat otomatis** dari `name`: lowercase, spasi/simbol → `-`.
7. **POST `{}` membuat API crash 500**, bukan 400. Validasi 400 hanya berjalan
   kalau minimal satu field terisi (`{name:""}` → 400, `{}` → 500).

## Bug API yang ditemukan

**POST `/categories` dengan body `{}` mengembalikan 500 Internal Server Error.**

Seharusnya divalidasi sebagai 400 Bad Request seperti field kosong lainnya.
Payload `{name: null}` juga menghasilkan 500. Kemungkinan penyebabnya: validator
melempar error pada `undefined` sebelum sempat menghasilkan pesan validasi.

Test `TC-API-014` **mendokumentasikan perilaku nyata ini**, bukan menutupinya.
Kalau Platzi memperbaiki API-nya menjadi 400, test itu harus diubah — dan itu
tanda bug-nya sudah beres.

## Cara menjalankan

Windows (CMD / PowerShell):

```bat
npm run test:api
start cypress\reports\report-api.html
```

Linux / macOS:

```bash
npm run test:api
```

Mode interaktif (melihat request satu per satu di browser):

```bat
npm run test:api:open
```

Report: `cypress/reports/report-api.html` dan `report-api.json`.

## Kenapa config terpisah

`cypress.api.config.js` memakai `cypress.config.base.js` tapi menimpa:

- `baseUrl` → host API (`https://api.escuelajs.co/api/v1`), bukan website OrangeHRM
- `video: false`, `screenshotOnRunFailure: false` — API test tidak punya UI
- `reportFilename: 'report-api'` — supaya tidak menimpa report spec lain

Tanpa pemisahan ini, satu file report akan ditimpa oleh spec terakhir yang jalan.
