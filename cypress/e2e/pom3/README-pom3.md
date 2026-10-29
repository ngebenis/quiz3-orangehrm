# Tugas 3 Fitur — Login, Directory, Recruitment (POM + Intercept)

Automasi Cypress untuk **https://opensource-demo.orangehrmlive.com** pada tiga fitur:
**Login**, **menu Directory**, dan **menu Recruitment**.

Setiap fitur punya **8 test case**, semuanya memakai format **POM** yang memisahkan:

| Lapisan | Folder | Isi |
| --- | --- | --- |
| **Action / Locator** | `cypress/pages/` | `LoginPage.js`, `DirectoryPage.js`, `RecruitmentPage.js` |
| **Data** | `cypress/support/data/` | `loginData.js`, `directoryData.js`, `recruitmentData.js` |
| **Intercept** | `cypress/support/intercepts/` | `LoginIntercepts.js`, `DirectoryIntercepts.js`, `RecruitmentIntercepts.js` |
| **Test Case + Assertion** | `cypress/e2e/pom3/` | `login.cy.js`, `directory.cy.js`, `recruitment.cy.js` |

Pola setiap test konsisten: **Intercept → Action → Assertion**.

---

## 1. Cara Menjalankan

```bash
npm install

# satu fitur
npm run test:fitur:login          # Login       (8 test case)
npm run test:fitur:directory      # Directory   (8 test case)
npm run test:fitur:recruitment    # Recruitment (8 test case)

# membuka Cypress UI
npm run test:fitur:open
```

Windows (CMD) juga bisa langsung:

```bat
npx cypress run --config-file cypress.pom3.config.js --spec cypress/e2e/pom3/login.cy.js
```

Konfigurasi khusus tugas ini ada di **`cypress.pom3.config.js`**
(`video: true`, `pageLoadTimeout: 120000`, `experimentalMemoryManagement: true`)
dengan report `cypress/reports/report-pom3.html`.

---

## 2. Login — 8 Test Case (`cypress/e2e/pom3/login.cy.js`)

| TC | Skenario | Intercept | Assertion utama |
| --- | --- | --- | --- |
| TC-LGN-001 | Login valid berhasil dan request validate terkirim dengan benar | `validateLogin`, `loadDashboard` | method POST, body membawa username, status **302**, `headers.location` = `/dashboard/index`, URL akhir dashboard |
| TC-LGN-002 | Username tidak terdaftar ditolak dan request tetap terkirim | `validateLogin` | request POST terkirim, status bukan 302, alert error tampil, tetap di halaman login |
| TC-LGN-003 | Password salah ditolak dan tidak pindah halaman | `validateLogin` | status gagal, URL tetap `/auth/login`, pesan error tampil |
| TC-LGN-004 | Username kosong tidak mengirim request validate ke server | `validateLogin` | **tidak ada** request `validate`, muncul 1 pesan `Required` |
| TC-LGN-005 | Password kosong tidak mengirim request validate ke server | `validateLogin` | tidak ada request `validate`, muncul 1 pesan `Required` |
| TC-LGN-006 | Kedua field kosong memunculkan dua pesan Required | `validateLogin` | tidak ada request, muncul **2** pesan `Required` |
| TC-LGN-007 | Stub respons login gagal menampilkan pesan error tanpa menyentuh server | `stubLoginFailure` | status stub 500, pesan error tampil, server asli tidak dihubungi |
| TC-LGN-008 | Halaman login memuat messages i18n, response 200 | `loadMessages` | status 200, `content-type` JSON, body memuat kunci terjemahan |

Request login yang diverifikasi: `POST /web/index.php/auth/validate`
(form-urlencoded) → **302** dengan `location: /dashboard/index`.

---

## 3. Directory — 8 Test Case (`cypress/e2e/pom3/directory.cy.js`)

| TC | Skenario | Intercept | Assertion utama |
| --- | --- | --- | --- |
| TC-DIR-001 | Halaman Directory tampil dengan kartu dan filter | `loadEmployees` | kartu ≥ 1, field Employee Name, dropdown Job Title & Location, tombol Search/Reset |
| TC-DIR-002 | Request daftar membawa `limit` dan mengembalikan array | `loadEmployees` | `query.limit` = 14, `query.offset` = 0, status 200, `body.data` array |
| TC-DIR-003 | Jumlah kartu = jumlah data dari API | `loadEmployees` | `kartu.length === response.body.data.length` |
| TC-DIR-004 | Kolom Employee Name memakai autocomplete `nameOrId` | `autocompleteByName` (stub saran) | `query.nameOrId` berisi nama, status 200, dropdown berisi 2 saran, saran terpilih masuk ke field |
| TC-DIR-005 | Hasil kosong menampilkan `No Records Found` | `stubEmptyResult` | status 200, `data` kosong, teks `No Records Found` |
| TC-DIR-006 | 3 karyawan dari stub dirender tepat 3 kartu | `stubEmployees(3)` | `data.length` = 3, kartu = 3, nama stub tampil |
| TC-DIR-007 | Tombol Reset mengosongkan filter dan memuat ulang data | `searchByEmpNumber`, `loadEmployees` | sebelum reset field terisi, setelah reset field kosong dan daftar dimuat ulang |
| TC-DIR-008 | Stub error 500 tetap menampilkan state valid | `stubServerError` | status 500, halaman tetap menampilkan filter/tombol Search |

### Perilaku nyata Directory (hasil rekaman traffic, bukan asumsi)

- Daftar awal: `GET /api/v2/directory/employees?limit=14&offset=0` → **14 kartu**.
- Mengetik nama memicu `GET /api/v2/directory/employees?nameOrId=<ketikan>`
  (parameter bernama **`nameOrId`**, bukan `employeeName`).
- Tombol **Search** bertipe `submit` → submit form/reload, bukan XHR.
- Tombol **Reset** bertipe `reset`, dan baru mengosongkan field setelah Search dijalankan.
- Kartu memakai `.orangehrm-directory-card` (bukan tabel), teks `(N) Records Found`.

---

## 4. Recruitment — 8 Test Case (`cypress/e2e/pom3/recruitment.cy.js`)

| TC | Skenario | Intercept | Assertion utama |
| --- | --- | --- | --- |
| TC-REC-001 | Halaman Candidates tampil dengan tabel dan filter | `loadCandidates`, `loadVacancies` | tabel tampil, kolom lengkap, tab Candidates aktif, status 200 |
| TC-REC-002 | Request kandidat membawa `limit` dan `model=list` | `loadCandidates` | `query.limit` ada, `query.model` = `list`, `body.data` array |
| TC-REC-003 | Tab Vacancies menampilkan tabel vacancy | `loadVacancies` | tab aktif, kolom vacancy tampil, status 200 |
| TC-REC-004 | Pencarian kandidat mengirim query dan dijawab 200 | `loadCandidates` | request terkirim setelah aksi pencarian, status 200 |
| TC-REC-005 | Stub 3 kandidat dirender tepat 3 baris | `stubCandidates(3)` | `data.length` = 3, baris tabel = 3 |
| TC-REC-006 | Stub daftar kosong menampilkan `No Records Found` | `stubEmptyCandidates` | `data` kosong, teks `No Records Found` |
| TC-REC-007 | Form Add Candidate memuat opsi Vacancy dan field wajib | `loadVacancyOptions` | `query.model` = `summary`, status 200, field wajib + tombol Save tampil |
| TC-REC-008 | Simpan Add Candidate tanpa nama memunculkan validasi | `loadVacancyOptions` | pesan `Required` muncul pada field nama |

### Perilaku nyata Recruitment

- Daftar kandidat: `GET /api/v2/recruitment/candidates?limit=50&offset=0&model=list…`
- Daftar vacancy: `GET /api/v2/recruitment/vacancies?limit=…&model=detailed`
- Halaman **Add Candidate** memanggil `vacancies?model=summary&limit=0&status=true&excludeInterviewers=true`
  — **bukan** `/admin/job-titles`. Intercept disesuaikan dengan fakta ini.
- Kolom tabel: Vacancy | Candidate | Hiring Manager | Date of Application | Status | Actions.

---

## 5. Hasil Eksekusi Terakhir

| Fitur | Hasil | Durasi |
| --- | --- | --- |
| Login | **8 passing** | ± 4 menit |
| Directory | **8 passing** | ± 7 menit |
| Recruitment | **8 passing** | ± 6 menit |

Ringkasan HTML: `cypress/reports/report-pom3.html`.
Video rekaman: `cypress/videos/*.mp4` (dihasilkan karena `video: true`).

Jumlah test case total: **24** (8 per fitur).
