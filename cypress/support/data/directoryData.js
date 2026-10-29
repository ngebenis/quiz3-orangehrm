// cypress/support/data/directoryData.js
// Data test untuk fitur Directory.
//
// Semua nilai diverifikasi langsung ke OrangeHRM demo:
//   * Directory menampilkan kartu karyawan (`.orangehrm-directory-card`),
//     bukan tabel — 14 kartu per halaman dengan teks "(N) Records Found".
//   * Filter: Employee Name (autocomplete), Job Title (dropdown), Location (dropdown).
//   * Hasil pencarian kosong menampilkan "No Records Found".
//   * Data karyawan di demo publik milik peserta lain dan bisa berubah,
//     jadi assertion hanya memakai nilai yang stabil (jumlah > 0, struktur,
//     bukan nama orang tertentu).

export const directoryUrls = {
  view: '/web/index.php/directory/viewDirectory'
};

// Endpoint yang di-intercept. Diverifikasi dari network asli saat halaman dibuka.
export const directoryEndpoints = {
  // GET /api/v2/directory/employees?limit=14&offset=0
  employees: '**/api/v2/directory/employees*'
};

// Karyawan yang pasti ada di data seed demo (dipakai untuk pencarian positif).
export const seededEmployee = {
  firstName: 'Ranga',
  fullName: 'Ranga Akunuri'
};

/**
 * Saran autocomplete untuk pengujian dropdown. Bentuknya meniru respons
 * asli `GET /api/v2/directory/employees?nameOrId=...`.
 */
export const autocompleteSuggestions = [
  { employeeNumber: 'AUTO001', firstName: 'Ranga', middleName: 'Devi', lastName: 'Akunuri', terminationId: null },
  { employeeNumber: 'AUTO002', firstName: 'Ranga', middleName: 'Devi', lastName: 'Perera', terminationId: null }
];

// Nama yang dijamin tidak ada — untuk menguji empty state.
export const nonExistentEmployee = 'ZzTidakAdaKaryawan999';

export const directoryTexts = {
  pageHeader: 'Directory',
  recordsFound: 'Records Found',
  recordFound: 'Record Found',
  noRecords: 'No Records Found',
  resetButton: 'Reset',
  searchButton: 'Search'
};

export const directoryLabels = {
  employeeName: 'Employee Name',
  jobTitle: 'Job Title',
  location: 'Location'
};

// Jumlah baris per halaman yang diminta API (limit=14).
export const recordsPerPage = 14;

/**
 * Payload stub untuk intercept — dipakai saat menguji tampilan tanpa
 * bergantung pada data asli demo yang bisa diubah peserta lain.
 */
export const stubbedEmployees = (count = 2) => ({
  data: Array.from({ length: count }, (_, i) => ({
    employeeNumber: `STUB${String(i + 1).padStart(3, '0')}`,
    firstName: `StubFirst${i + 1}`,
    middleName: '',
    lastName: `StubLast${i + 1}`,
    jobTitle: 'QA Engineer',
    location: 'Colombo',
    unit: 'Engineering'
  })),
  meta: { total: count },
  rels: []
});
