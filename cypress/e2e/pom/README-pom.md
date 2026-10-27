# Hari 17 — Automation Login dengan Page Object Model (POM)

Folder ini berisi automation fitur **Login OrangeHRM** yang ditulis ulang memakai
**Page Object Model (POM)**. Isinya terpisah penuh dari `cypress/e2e/login.cy.js`
(Quiz 3) dan `cypress/e2e/intercept/login-intercept.cy.js` (Hari 16).

## Apa itu POM

POM memisahkan tiga hal yang sebelumnya tercampur dalam satu file test:

| Lapisan | Isi | File |
|---|---|---|
| Page Object | locator + method aksi/validasi per halaman | `cypress/pages/*.js` |
| Test Data | credentials, pesan error, URL, konstanta | `cypress/support/data/loginData.js` |
| Test Case | skenario uji, tanpa locator mentah | `cypress/e2e/pom/login-pom.cy.js` |

Keuntungannya: kalau OrangeHRM mengganti selector (misal `.oxd-input` berubah),
cukup perbaiki satu baris di page object — 14 test case tidak perlu disentuh.

## Struktur file

```
cypress/
├── pages/
│   ├── LoginPage.js          → locator + aksi halaman login
│   └── DashboardPage.js      → locator + aksi halaman dashboard
├── support/data/
│   └── loginData.js          → data test + error message + URL
└── e2e/pom/
    ├── login-pom.cy.js       → 14 test case
    └── README-pom.md         → dokumen ini
cypress.pom.config.js         → config khusus POM (report-pom)
```

## Page Object: LoginPage

Method yang tersedia:

| Method | Kegunaan |
|---|---|
| `visit()` | buka halaman login |
| `fillUsername(u)` | isi username (aman untuk string kosong) |
| `fillPassword(p)` | isi password (aman untuk string kosong) |
| `clickLogin()` | klik tombol submit |
| `login(u, p)` | visit + isi keduanya + submit |
| `verifyLoginPage()` | pastikan form login tampil |
| `verifyErrorMessage(t)` | pastikan alert error memuat teks tertentu |
| `verifyFieldRequired(n)` | pastikan ada n pesan "Required" |
| `verifyStillOnLogin()` | pastikan tetap di halaman login |
| `verifyCopyright()` | cek footer branding |
| `clickForgotPassword()` | buka halaman reset password |
| `verifyForgotPasswordPage()` | pastikan halaman reset tampil |
| `submitEmpty()` | submit form tanpa mengisi apa pun |

## Page Object: DashboardPage

| Method | Kegunaan |
|---|---|
| `verifyDashboard()` | pastikan dashboard termuat |
| `logout()` | buka dropdown user lalu klik Logout |
| `navigateToMenu(name)` | pindah modul lewat main menu |
| `verifyQuickLaunch()` | cek widget Quick Launch |
| `countWidgets()` | hitung jumlah widget dashboard |
| `getWelcomeMessage()` | ambil teks breadcrumb module |

## Test Data: loginData.js

Berisi objek `loginData` (valid, invalid, empty, caseSensitive, whitespace, …),
`errorMessages`, `pageTitles`, dan `urls`. Semua nilai uji diambil dari sini —
tidak ada string credentials yang ditulis langsung di dalam test case.

## 14 Test Case

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

Jumlah minimum tugas adalah 8 test case; di sini ada 14.

## Cara menjalankan

```bash
# semua test POM
npm run test:pom

# mode interaktif
npm run test:pom:open

# perintah langsung
npx cypress run --config-file cypress.pom.config.js
```

Di Windows, script `npm run test:pom` sudah portabel (tidak memakai env var).

## Output

- HTML report : `cypress/reports/report-pom.html`
- JSON report : `cypress/reports/report-pom.json`
- Video       : `cypress/videos/login-pom.cy.js.mp4`
- Screenshot  : `cypress/reports/hasil-pom.png` (bukti run)

## Hasil run terakhir

```
login-pom.cy.js   05:28   14 passing   0 failing
```

## Catatan implementasi

Beberapa perilaku OrangeHRM yang ditemukan saat pembuatan script dan
mempengaruhi cara page object ditulis:

1. **Field kosong tidak memicu alert**, melainkan validasi HTML5 `required`
   sehingga yang muncul adalah pesan inline `Required` di bawah input
   (`.oxd-input-field-error-message`), bukan `.oxd-alert-content-text`.
2. **`cy.type('')` dilarang Cypress**, jadi `fillUsername`/`fillPassword`
   hanya memanggil `.type()` kalau nilainya tidak kosong.
3. **Spasi tidak di-trim** oleh sistem — `'  Admin  '` ditolak dengan
   "Invalid credentials". Karena itu TC-POM-011 mengharapkan kegagalan login,
   bukan sukses.
4. **Versi footer berubah** (5.7 → 5.9), jadi assertion memakai substring
   `OrangeHRM OS` tanpa nomor versi agar tidak rapuh.
5. **Dashboard memakai grid 7 widget**, bukan class `.orangehrm-dashboard-card`,
   jadi `countWidgets()` menghitung anak dari `.orangehrm-dashboard-grid`.
