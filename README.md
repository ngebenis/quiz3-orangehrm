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
│   │   ├── login.cy.js              # Quiz 3  — 12 it block (action + assertion)
│   │   ├── intercept/
│   │   │   ├── login-intercept.cy.js  # Hari 16 — 12 it block dengan cy.intercept()
│   │   │   └── README-intercept.md
│   │   ├── pom/
│   │   │   ├── login-pom.cy.js        # Hari 17 — 14 it block dengan POM
│   │   │   └── README-pom.md
│   │   └── api/
│   │       ├── category-api.cy.js     # Hari 18 — 14 test case API (cy.request)
│   │       └── README-api.md
│   ├── api/
│   │   └── CategoryApi.js       # Hari 18 — service layer endpoint categories
│   ├── pages/                   # Hari 17 — Page Object
│   │   ├── LoginPage.js
│   │   └── DashboardPage.js
│   ├── support/
│   │   ├── data/
│   │   │   ├── loginData.js     # Hari 17 — data test, error message, URL
│   │   │   └── categoryData.js  # Hari 18 — payload, status code, pesan error API
│   │   └── e2e.js
│   ├── reports/                 # hasil run (HTML report + screenshot)
│   └── videos/                  # rekaman eksekusi
├── cypress.config.base.js       # konfigurasi bersama (timeout, reporter, dll)
├── cypress.config.js            # config Quiz 3          -> report-login.html
├── cypress.intercept.config.js  # config Hari 16 (intercept) -> report-intercept.html
├── cypress.pom.config.js        # config Hari 17 (POM)     -> report-pom.html
├── cypress.api.config.js        # config Hari 18 (API)     -> report-api.html
├── run-tests.bat                # shortcut Windows (double-click)
├── package.json
└── README.md
```

## 2. Cara Menjalankan

```bash
npm install
npm run test:login          # Quiz 3      -> cypress/reports/report-login.html
npm run test:intercept      # Hari 16     -> cypress/reports/report-intercept.html
npm run test:pom            # Hari 17     -> cypress/reports/report-pom.html
npm test                    # ketiga spec berurutan (headless)
npx cypress open            # mode interaktif (Test Runner)
```

Butuh **Node.js 18+**. Setelah run, laporan HTML otomatis dibuat di
`cypress/reports/`, dan rekaman video (tidak ikut di-commit karena `.gitignore`)
muncul di `cypress/videos/`.

### Windows (CMD / PowerShell)

Sama saja — semua script di `package.json` sudah portabel, tidak ada sintaks
`VAR=value` khas Linux. Jalankan di **Command Prompt** atau **PowerShell**:

```bat
cd quiz3-orangehrm
npm install
npm run test:login
npm run test:intercept
npm run test:pom
npx cypress open
```

Atau cukup **double-click `run-tests.bat`** — script itu sudah menjalankan
`npm install` (kalau `node_modules` belum ada) lalu kedua spec berurutan.

Catatan Windows:

- Install **Node.js LTS** dari <https://nodejs.org> (pilih installer `.msi`), lalu
  tutup-buka terminal supaya `node`/`npm` terbaca.
- Cypress butuh desktop — jangan dijalankan lewat SSH tanpa display. `npm run
  test:login` tetap jalan headless walau tanpa jendela terlihat.
- Jika `npm run test:*` diblokir Execution Policy di PowerShell, pakai
  `cmd /c "npm run test:login"` atau jalankan dari Command Prompt.
- Path folder pakai `\`; semua perintah `cypress run` tetap sama.
- Report dibuka dengan `start cypress\reports\report-login.html` (CMD) atau
  `start cypress/reports/report-login.html` (PowerShell).

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

Bukti: `cypress/reports/hasil-login.png` (screenshot 12 passing) dan
`cypress/reports/report-login.html` (laporan lengkap).

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

Bukti: `cypress/reports/hasil-intercept.png` (screenshot 12 passing) dan
`cypress/reports/report-intercept.html` (laporan lengkap).

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

## 9. Automation with Page Object Model (POM) — Hari 17

Automation fitur Login OrangeHRM yang ditulis ulang memakai **Page Object Model**,
dengan **14 test case** (ketentuan minimal 8).

Isi folder ini terpisah penuh dari Quiz 3 (`cypress/e2e/login.cy.js`) dan
Hari 16 (`cypress/e2e/intercept/login-intercept.cy.js`).

### Struktur POM

```
cypress/pages/LoginPage.js          # locator + aksi halaman login
cypress/pages/DashboardPage.js      # locator + aksi dashboard
cypress/support/data/loginData.js   # data test, error message, URL
cypress/e2e/pom/login-pom.cy.js     # 14 test case
cypress/e2e/pom/README-pom.md       # dokumentasi POM
cypress.pom.config.js               # config khusus POM (report-pom)
```

Pemisahan tanggung jawab:

| Lapisan | Isi | File |
|---|---|---|
| Page Object | locator + method aksi/validasi | `cypress/pages/*.js` |
| Test Data | credentials, pesan error, URL | `cypress/support/data/loginData.js` |
| Test Case | skenario uji tanpa locator mentah | `cypress/e2e/pom/login-pom.cy.js` |

### Page Objects

- **LoginPage**: `visit()`, `fillUsername()`, `fillPassword()`, `clickLogin()`,
  `login()`, `verifyLoginPage()`, `verifyErrorMessage()`, `verifyFieldRequired()`,
  `verifyStillOnLogin()`, `verifyCopyright()`, `clickForgotPassword()`,
  `verifyForgotPasswordPage()`, `submitEmpty()`.
- **DashboardPage**: `verifyDashboard()`, `logout()`, `navigateToMenu()`,
  `verifyQuickLaunch()`, `countWidgets()`, `getWelcomeMessage()`.
- **loginData**: objek credentials (valid, invalid, empty, caseSensitive,
  whitespace), `errorMessages`, `pageTitles`, dan `urls`.

### 14 Test Case

| # | Test Case | Yang divalidasi |
|---|---|---|
| 1 | TC-POM-001 | Login valid → dashboard tampil, URL & title benar |
| 2 | TC-POM-002 | Username tidak terdaftar → alert "Invalid credentials" |
| 3 | TC-POM-003 | Password salah → alert "Invalid credentials" |
| 4 | TC-POM-004 | Username kosong → 1 pesan "Required" |
| 5 | TC-POM-005 | Password kosong → 1 pesan "Required" |
| 6 | TC-POM-006 | Kedua field kosong → 2 pesan "Required" |
| 7 | TC-POM-007 | Username case-sensitive (`ADMIN` ditolak, `Admin` diterima) |
| 8 | TC-POM-008 | Alur forgot password → halaman reset tampil |
| 9 | TC-POM-009 | Login lalu logout → kembali ke halaman login |
| 10 | TC-POM-010 | Branding & copyright halaman login |
| 11 | TC-POM-011 | Spasi di credentials → ditolak sistem |
| 12 | TC-POM-012 | Tiga percobaan login berurutan (salah → kosong → benar) |
| 13 | TC-POM-013 | Navigasi Admin → PIM → Dashboard |
| 14 | TC-POM-014 | Verifikasi 7 widget dashboard + Quick Launch |

### Cara Menjalankan

```bash
# semua test POM
npm run test:pom

# mode interaktif
npm run test:pom:open

# perintah langsung
npx cypress run --config-file cypress.pom.config.js
```

Script `npm run test:pom` portabel — tidak memakai environment variable,
jadi jalan sama di Linux maupun Windows (CMD/PowerShell).

### Hasil run terakhir

```
login-pom.cy.js   05:17   14 passing   0 failing
```

Bukti:

- HTML report : `cypress/reports/report-pom.html`
- JSON report : `cypress/reports/report-pom.json`
- Screenshot  : `cypress/reports/hasil-pom.png`
- Video       : `cypress/videos/login-pom.cy.js.mp4`

### Catatan perilaku OrangeHRM

Beberapa temuan saat membuat script yang mempengaruhi cara page object ditulis:

1. Field kosong tidak memicu alert, melainkan validasi HTML5 `required` —
   muncul pesan inline `Required` di `.oxd-input-field-error-message`.
2. `cy.type('')` dilarang Cypress, jadi `fillUsername`/`fillPassword` hanya
   memanggil `.type()` kalau nilainya tidak kosong.
3. Spasi tidak di-trim sistem — `'  Admin  '` ditolak "Invalid credentials".
4. Nomor versi di footer berubah (5.7 → 5.9), jadi assertion memakai substring
   `OrangeHRM OS` agar tidak rapuh.
5. Dashboard memakai grid 7 widget, bukan `.orangehrm-dashboard-card`, jadi
   `countWidgets()` menghitung anak dari `.orangehrm-dashboard-grid`.
6. Logout bisa memicu crash di kode OrangeHRM sendiri: dashboard menembak
   beberapa request API, dan kalau logout diklik saat request masih berjalan,
   axios membatalkannya lalu kode aplikasi membaca `.response` dari hasil
   `undefined` (`Cannot read properties of undefined (reading 'response')`).
   Ini race condition — bisa lulus di satu mesin, gagal di mesin lain.
   **Perbaikan utama:** `DashboardPage.logout()` memanggil
   `waitUntilDashboardSettled()` dulu (grid terlihat, widget ter-render,
   spinner hilang) sehingga tidak ada request yang menggantung. **Jaring
   pengaman:** `cypress/support/e2e.js` mengabaikan hanya pesan error itu;
   error lain tetap menggagalkan test.
7. `pageLoadTimeout` dinaikkan ke 120 detik karena demo publik kadang lambat
   saat run dingin (pernah `Timed out after waiting 60000ms for your remote
   page to load`).

Dokumentasi lengkap: [cypress/e2e/pom/README-pom.md](cypress/e2e/pom/README-pom.md)

## 10. API Automation using Cypress — Hari 18

Testing API pada <https://fakeapi.platzi.com/en/rest/categories> memakai
`cy.request`. **14 test case** (syarat minimal 12), setiap test punya assertion
pada **status code** dan **response body value**.

```bat
npm run test:api
start cypress\reports\report-api.html
```

Struktur (folder terpisah, pola sama dengan POM):

```
cypress/api/CategoryApi.js              # service layer: URL + method request
cypress/support/data/categoryData.js    # payload, status code, pesan error
cypress/e2e/api/category-api.cy.js      # TC-API-001 … TC-API-014
cypress/e2e/api/README-api.md           # dokumentasi lengkap
cypress.api.config.js                   # baseUrl API, tanpa video/screenshot
```

Cakupan: GET list, GET by id, parameter `limit`, POST, PUT, DELETE, alur
create→read, create→update, create→delete→verify, id tidak ada, id non-numerik,
validasi name kosong, validasi image kosong, produk per kategori, dan payload kosong.

Bug API yang ditemukan dan didokumentasikan (tidak ditutupi):
**POST `/categories` dengan body `{}` mengembalikan 500 Internal Server Error**,
bukan 400 seperti field kosong lainnya. Test `TC-API-014` mengunci perilaku itu.

Dokumentasi lengkap: [cypress/e2e/api/README-api.md](cypress/e2e/api/README-api.md)
