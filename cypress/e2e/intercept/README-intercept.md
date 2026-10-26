# Hari 16 — Intercept di Cypress

Catatan materi + implementasi tugas intercept pada fitur Login OrangeHRM (Quiz 3).

## 1. Apa itu `cy.intercept()`

`cy.intercept()` adalah cara Cypress "mengintip" (dan kalau perlu mengubah) request
HTTP yang dilakukan aplikasi saat test berjalan. Dengan intercept kita bisa:

- **Mengintip** request/response — memastikan aplikasi benar-benar memanggil endpoint
  yang seharusnya, dengan method/body/query yang benar.
- **Menunggu** request tertentu selesai sebelum lanjut assertion (menghindari `cy.wait(5000)`
  yang rapuh).
- **Memodifikasi / stub** response — menguji tampilan tanpa bergantung pada data server.

Bentuk dasarnya:

```js
cy.intercept(method, url).as('alias');       // hanya mengintip
cy.intercept(method, url, { body: {...} });  // stub: response diganti
cy.wait('@alias').then(({ request, response }) => { /* assertion */ });
```

## 2. Kenapa intercept penting di UI automation

| Masalah pada test UI biasa | Solusi dengan intercept |
|---|---|
| `cy.wait(5000)` — lambat & rapuh | `cy.wait('@alias')` — tunggu request yang tepat |
| Sulit membuktikan request benar | assert `request.method`, `request.body`, `request.query` |
| Data server berubah → test flaky | stub response → data deterministik |
| Tidak tahu endpoint mana yang dipanggil | rekam semua traffic, lalu pilih endpoint nyata |

## 3. Alur kerja yang dipakai di tugas ini

1. **Rekam traffic nyata** — satu kali login dengan `cy.intercept('**/*')`, tulis semua
   URL `index.php` yang lewat ke file. Ini penting: jangan menebak endpoint.
2. **Pilih 12 endpoint berbeda** dari hasil rekaman.
3. **Tulis satu `it` block per endpoint** — intercept dulu, action, lalu assertion
   (assertion network via `cy.wait('@alias')`, lalu assertion UI).
4. **Jalankan sampai passed** — kalau gagal, cek apakah URL benar-benar terpanggil
   (`cy.wait` timeout = endpoint tidak pernah dipanggil) atau body stub salah bentuk.

## 4. Endpoint nyata OrangeHRM (hasil rekaman)

```
GET  /web/index.php/auth/login
GET  /web/index.php/core/i18n/messages
POST /web/index.php/auth/validate
GET  /web/index.php/dashboard/index
GET  /web/index.php/api/v2/dashboard/employees/time-at-work?timezoneOffset=0&currentDate=...&currentTime=...
GET  /web/index.php/api/v2/dashboard/employees/action-summary
GET  /web/index.php/api/v2/dashboard/shortcuts
GET  /web/index.php/api/v2/buzz/feed?limit=5&offset=0&sortOrder=DESC&sortField=share.createdAtUtc
GET  /web/index.php/api/v2/dashboard/employees/leaves?date=...
GET  /web/index.php/api/v2/dashboard/employees/subunit
GET  /web/index.php/api/v2/dashboard/employees/locations
POST /web/index.php/events/push
GET  /web/index.php/auth/logout
GET  /web/index.php/auth/requestPasswordResetCode
```

## 5. Hal-hal yang bikin gagal (dan cara memperbaikinya)

Ini yang benar-benar terjadi saat pengerjaan:

**a. `cy.wait('@alias')` timeout — "No request ever occurred"**
URL di intercept salah/tidak pernah dipanggil. Contoh: pola tanpa `*` di belakang
tidak cocok kalau URL punya query string.

```js
// gagal: endpoint punya query string
cy.intercept('GET', '**/api/v2/dashboard/employees/time-at-work')
// benar
cy.intercept('GET', '**/api/v2/dashboard/employees/time-at-work**')
```

**b. Body response bukan seperti yang dibayangkan**
`GET /core/i18n/messages` mengembalikan objek terjemahan langsung
(`{ "admin.add_job_title": "...", ... }`), bukan `{ data: ... }`.

```js
// gagal
expect(response.body).to.have.property('data');
// benar
expect(Object.keys(response.body).length).to.be.greaterThan(0);
```

**c. Response HTML di-parse jadi objek**
Untuk request halaman (bukan API), `response.body` bisa berupa string HTML —
tergantung `Content-Type`. Assertion yang aman: cek `content-type` lalu cek substring
yang stabil seperti `<title>OrangeHRM</title>`.

**d. Stub diterima API tapi UI tidak berubah**
Stub `action-summary` dengan `group: 'Leave Requests to Approve'` (huruf kecil "to")
**tidak dirender**, karena OrangeHRM memakai nilai `group` sebagai key label.
Nilai harus persis seperti response asli: `'Leave Requests To Approve'`.

**e. `cy.contains()` gagal walau teks terlihat ada**
Label widget memakai **non-breaking space** (`\u00a0`). Solusinya normalisasi whitespace:

```js
cy.get('.orangehrm-dashboard-grid').should(($el) => {
  expect($el.text().replace(/\s+/g, ' ')).to.contain('(7) Leave Requests to Approve');
});
```

**f. Widget butuh waktu render setelah response masuk**
`cy.wait('@alias')` hanya menunggu response, bukan render React. Tambahkan assertion
UI yang retry (bukan `cy.wait(ms)`).

## 6. File implementasi

- `cypress/e2e/intercept/login-intercept.cy.js` — 12 `it` block, 12 intercept berbeda.
- README utama: bagian **7. Tugas Intercept (Hari 16)** untuk tabel lengkap.
