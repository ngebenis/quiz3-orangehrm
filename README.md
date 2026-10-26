# Quiz 3 — UI Automation Login OrangeHRM (Cypress)

Automation testing untuk fitur **Login** pada [OrangeHRM OS 5.9 Demo](https://opensource-demo.orangehrmlive.com/web/index.php/auth/login) menggunakan **Cypress** dengan format `it` block.

- **Jumlah test case:** 12 (diambil dari Quiz 2 — TC-LOGIN-001 s/d TC-LOGIN-012)
- **Hasil run terakhir:** **12 passing, 0 failing**
- **Kredensial demo:** `Admin` / `admin123`

---

## 1. Struktur Project

```
quiz3-orangehrm-login/
├── cypress/
│   ├── e2e/
│   │   ├── login.cy.js              # Quiz 3 — 12 it block (action + assertion)
│   │   └── intercept/
│   │       └── login-intercept.cy.js  # Hari 16 — 12 it block dengan cy.intercept()
│   ├── support/
│   │   └── e2e.js
│   ├── reports/                 # hasil run (HTML report + screenshot)
│   └── videos/                  # rekaman eksekusi
├── cypress.config.js            # baseUrl, viewport, timeout, reporter
├── package.json
└── README.md
```

## 2. Cara Menjalankan

```bash
npm install
npx cypress run                     # semua spec (headless)
npx cypress run --spec cypress/e2e/login.cy.js
npx cypress open                    # mode interaktif (Test Runner)
```

Butuh **Node.js 18+**. Setelah run, laporan HTML otomatis dibuat di
`cypress/reports/quiz3-login.html` dan video di `cypress/videos/login.cy.js.mp4`.

## 3. Daftar Test Case (12)

| No | Test Case ID | Skenario | Tipe | Action utama | Assertion utama |
|----|--------------|----------|------|--------------|-----------------|
| 1 | TC-LOGIN-001 | Login dengan kredensial valid | Positive | type username, type password, click Login | `cy.url().should('include','/dashboard/index')`, breadcrumb = `Dashboard` |
| 2 | TC-LOGIN-002 | Login dengan username tidak valid | Negative | type `invalid_user` + password valid, click | alert `contain` `Invalid credentials`, url tetap `/auth/login` |
| 3 | TC-LOGIN-003 | Login dengan password tidak valid | Negative | type username valid + `WrongPass123`, click | alert `contain` `Invalid credentials`, url tetap `/auth/login` |
| 4 | TC-LOGIN-004 | Submit form kosong | Negative | click Login tanpa mengisi field | 2 elemen error `have.length 2` dan `have.text` `Required` |
| 5 | TC-LOGIN-005 | Username kosong | Negative | isi password saja, click Login | 1 error `Required`, url tetap `/auth/login` |
| 6 | TC-LOGIN-006 | Password kosong | Negative | isi username saja, click Login | 1 error `Required`, url tetap `/auth/login` |
| 7 | TC-LOGIN-007 | Password dimasking | Functional | type password `admin123` | `have.attr('type','password')` + `have.value` benar |
| 8 | TC-LOGIN-008 | Submit dengan tombol Enter | Functional | `type('admin123{enter}')` | url `include` `/dashboard/index`, breadcrumb `Dashboard` |
| 9 | TC-LOGIN-009 | Username dengan spasi awal/akhir | Functional | type `'  Admin  '` + password valid | alert `Invalid credentials` (spasi tidak di-trim), url tetap login |
| 10 | TC-LOGIN-010 | Username case-insensitive | Functional | type `admin` (huruf kecil) | login berhasil, url `/dashboard/index` |
| 11 | TC-LOGIN-011 | Navigasi Forgot your password | Functional | click link Forgot your password | url `include` `/auth/requestPasswordResetCode`, input username & tombol terlihat |
| 12 | TC-LOGIN-012 | Akses Dashboard tanpa login | Functional (Security) | `cy.clearCookies()` lalu visit `/dashboard/index` | diarahkan ke `/auth/login`, form login `be.visible` |

## 4. Struktur Script (contoh satu it block)

```js
it('TC-LOGIN-001 - Login dengan kredensial valid', () => {
  // Action
  cy.get('input[name="username"]').type('Admin');
  cy.get('input[name="password"]').type('admin123');
  cy.get('button[type="submit"]').click();

  // Assertion
  cy.url().should('include', '/dashboard/index');
  cy.get('.oxd-topbar-header-breadcrumb-module').should('have.text', 'Dashboard');
  cy.get('.oxd-main-menu').should('be.visible');
});
```

Setiap `it` block selalu berpola **action dulu → assertion sesudahnya**, dan setiap
test berdiri sendiri (dijalankan ulang `cy.visit()` pada `beforeEach`) sehingga tidak
saling bergantung.

## 5. Locator yang Dipakai

Locator dibuat sederhana dan stabil (mengikuti strategi Hari 14): atribut `name`,
atribut `type`, dan class semantik milik OrangeHRM (`oxd-*`). Tidak memakai XPath
absolut maupun `nth-child` yang rapuh.

| Elemen | Locator |
|--------|---------|
| Username | `input[name="username"]` |
| Password | `input[name="password"]` |
| Tombol Login | `button[type="submit"]` |
| Alert error | `.oxd-alert-content-text` |
| Pesan validasi field | `.oxd-input-field-error-message` |
| Breadcrumb halaman | `.oxd-topbar-header-breadcrumb-module` |
| Link forgot password | `.orangehrm-login-forgot-header` |

## 6. Hasil Eksekusi

```
OrangeHRM - Login Feature
  ✓ TC-LOGIN-001 - Login dengan kredensial valid
  ✓ TC-LOGIN-002 - Login dengan username tidak valid
  ✓ TC-LOGIN-003 - Login dengan password tidak valid
  ✓ TC-LOGIN-004 - Submit form kosong
  ✓ TC-LOGIN-005 - Username kosong
  ✓ TC-LOGIN-006 - Password kosong
  ✓ TC-LOGIN-007 - Password ditampilkan sebagai karakter tersembunyi
  ✓ TC-LOGIN-008 - Submit form menggunakan tombol Enter
  ✓ TC-LOGIN-009 - Username dengan spasi di awal dan akhir
  ✓ TC-LOGIN-010 - Username tidak membedakan huruf besar kecil
  ✓ TC-LOGIN-011 - Navigasi Forgot your password
  ✓ TC-LOGIN-012 - Akses URL Dashboard tanpa login

  12 passing (2m)
```

Bukti: `cypress/reports/hasil-running.png`, `cypress/reports/quiz3-login.html`,
dan rekaman `cypress/videos/login.cy.js.mp4`.

### Hasil run tugas intercept

```
OrangeHRM - Login dengan Intercept
  ✓ TC-INT-001 - Intercept POST /auth/validate saat login valid
  ✓ TC-INT-002 - Intercept GET /auth/login saat halaman login dibuka
  ✓ TC-INT-003 - Intercept GET /core/i18n/messages saat login gagal
  ✓ TC-INT-004 - Intercept GET /auth/requestPasswordResetCode di halaman forgot password
  ✓ TC-INT-005 - Intercept GET /dashboard/index setelah login berhasil
  ✓ TC-INT-006 - Intercept dan modifikasi GET /api/v2/dashboard/employees/action-summary
  ✓ TC-INT-007 - Intercept GET /api/v2/dashboard/employees/time-at-work
  ✓ TC-INT-008 - Intercept GET /api/v2/dashboard/shortcuts
  ✓ TC-INT-009 - Intercept GET /api/v2/buzz/feed
  ✓ TC-INT-010 - Intercept GET /api/v2/dashboard/employees/leaves
  ✓ TC-INT-011 - Intercept GET /auth/logout saat logout
  ✓ TC-INT-012 - Intercept GET /api/v2/dashboard/employees/subunit

  12 passing (3m)
```

Bukti: `cypress/reports/hasil-intercept.png`, `cypress/reports/quiz3-intercept.html`,
dan rekaman `cypress/videos/login-intercept.cy.js.mp4`.

## 7. Tugas Intercept (Hari 16)

File: **`cypress/e2e/intercept/login-intercept.cy.js`** — 12 `it` block, **setiap test
memakai intercept dengan URL yang berbeda** (tidak ada yang diulang).

Jalankan:

```bash
npx cypress run --spec cypress/e2e/intercept/login-intercept.cy.js
```

| No | Test Case ID | Intercept (method + URL) | Tipe | Assertion pada intercept |
|----|--------------|--------------------------|------|--------------------------|
| 1 | TC-INT-001 | `POST /web/index.php/auth/validate` | Request + response | method `POST`, body `include` `username=Admin`, status `302` |
| 2 | TC-INT-002 | `GET /web/index.php/auth/login` | Response | status `200`, `content-type` `text/html`, body `include` `<title>OrangeHRM</title>` |
| 3 | TC-INT-003 | `GET /web/index.php/core/i18n/messages` | Response | status `200`, body object dan tidak kosong |
| 4 | TC-INT-004 | `GET /web/index.php/auth/requestPasswordResetCode` | Response | status `200`, body `include` `<title>OrangeHRM</title>` |
| 5 | TC-INT-005 | `GET /web/index.php/dashboard/index` | Response | status `200`, breadcrumb `Dashboard` |
| 6 | TC-INT-006 | `GET /web/index.php/api/v2/dashboard/employees/action-summary` | **Stub / modifikasi response** | `pendingActionCount` diubah jadi `7`, UI menampilkan `Leave Requests to Approve` |
| 7 | TC-INT-007 | `GET /web/index.php/api/v2/dashboard/employees/time-at-work` | Request + response | query punya `currentDate`, status `200`, body punya `data` |
| 8 | TC-INT-008 | `GET /web/index.php/api/v2/dashboard/shortcuts` | Response | status `200`, `data` punya `leave.apply_leave` |
| 9 | TC-INT-009 | `GET /web/index.php/api/v2/buzz/feed` | Request + response | query `limit` = `5`, status `200` |
| 10 | TC-INT-010 | `GET /web/index.php/api/v2/dashboard/employees/leaves` | Request + response | query punya `date`, `data` array |
| 11 | TC-INT-011 | `GET /web/index.php/auth/logout` | Response | method `GET`, status `302`, URL kembali ke `/auth/login` |
| 12 | TC-INT-012 | `GET /web/index.php/api/v2/dashboard/employees/subunit` | Response | status `200`, body punya `data` |

### Endpoint diverifikasi, bukan ditebak

Semua URL di atas direkam dari traffic nyata demo OrangeHRM (lewat `cy.intercept('**/*')`
pada satu kali login), lalu dipakai sebagai target intercept. Itulah sebabnya tiap test
mendapat URL yang benar-benar dipanggil aplikasi — bukan asumsi.

### Pola tiap test

```js
it('TC-INT-005 - Intercept GET /dashboard/index setelah login berhasil', () => {
  // Intercept
  cy.intercept('GET', '**/web/index.php/dashboard/index').as('dashboardPage');

  // Action
  cy.visit(loginUrl);
  cy.get('input[name="username"]').type('Admin');
  cy.get('input[name="password"]').type('admin123');
  cy.get('button[type="submit"]').click();

  // Assertion
  cy.wait('@dashboardPage').then(({ request, response }) => {
    expect(request.method).to.eq('GET');
    expect(response.statusCode).to.eq(200);
  });
  cy.get('.oxd-topbar-header-breadcrumb-module').should('have.text', 'Dashboard');
});
```

Setiap test tetap **action dulu → assertion sesudahnya**, dan assertion intercept
(`cy.wait('@alias')`) diletakkan sebelum assertion UI supaya bukti network-nya eksplisit.

## 8. Catatan

- `cypress/e2e/login.cy.js` (Quiz 3) dibuat **basic**: hanya memakai `cy.visit`,
  `cy.get`, `type`, `click`, `clearCookies`, dan assertion `should`. Tidak ada custom
  command, Page Object, fixture, intercept, atau looping.
- `cypress/e2e/intercept/login-intercept.cy.js` (Hari 16) menambahkan `cy.intercept`
  + `cy.wait('@alias')` sebagai lapisan verifikasi network, terpisah dari file Quiz 3.
- Demo OrangeHRM dipakai bersama publik, jadi kredensial dapat berubah sewaktu-waktu.
  Jika login gagal seluruhnya, cek kredensial terbaru di halaman demo.
- `retries: 1` pada `runMode` hanya untuk mengantisipasi latensi jaringan demo publik,
  bukan untuk menutupi kegagalan nyata.
