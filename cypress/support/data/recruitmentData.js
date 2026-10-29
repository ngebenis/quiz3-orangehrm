// cypress/support/data/recruitmentData.js
// Data test untuk fitur Recruitment (Candidates + Vacancies).
//
// Perilaku yang diverifikasi langsung ke OrangeHRM demo:
//   * Halaman Candidates memakai tabel (`.oxd-table-body .oxd-table-row`),
//     kolom: Vacancy | Candidate | Hiring Manager | Date of Application | Status | Actions.
//   * Tab di atas: "Candidates" dan "Vacancies".
//   * Filter Candidates: Job Title, Vacancy, Hiring Manager, Status, Candidate
//     Name, Keywords, Date of Application, Method of Application.
//   * Status kandidat berasal dari endpoint /recruitment/candidates/statuses.
//   * Form Add Candidate: firstName/middleName/lastName, Vacancy (dropdown),
//     Email, Contact Number, Resume (file), Keywords, Date, Consent.
//   * Data kandidat demo milik peserta lain dan bisa berubah kapan saja,
//     jadi test yang butuh angka pasti memakai stub intercept.

export const recruitmentUrls = {
  candidates: '/web/index.php/recruitment/viewCandidates',
  vacancies: '/web/index.php/recruitment/viewJobVacancy',
  addCandidate: '/web/index.php/recruitment/addCandidate'
};

// Endpoint asli yang direkam dari network saat halaman dibuka.
export const recruitmentEndpoints = {
  candidates:
    '**/api/v2/recruitment/candidates?limit=*&offset=*&model=list*',
  candidatesAny: '**/api/v2/recruitment/candidates*',
  vacancies: '**/api/v2/recruitment/vacancies*',
  hiringManagers: '**/api/v2/recruitment/hiring-managers*',
  statuses: '**/api/v2/recruitment/candidates/statuses*',
  jobTitles: '**/api/v2/admin/job-titles*'
};

export const recruitmentTexts = {
  pageHeader: 'Recruitment',
  tabCandidates: 'Candidates',
  tabVacancies: 'Vacancies',
  addButton: 'Add',
  saveButton: 'Save',
  cancelButton: 'Cancel',
  searchButton: 'Search',
  resetButton: 'Reset',
  recordsFound: 'Records Found',
  recordFound: 'Record Found',
  noRecords: 'No Records Found',
  requiredMark: '* Required',
  addCandidateTitle: 'Add Candidate'
};

export const recruitmentLabels = {
  jobTitle: 'Job Title',
  vacancy: 'Vacancy',
  hiringManager: 'Hiring Manager',
  status: 'Status',
  candidateName: 'Candidate Name',
  keywords: 'Keywords',
  dateOfApplication: 'Date of Application',
  methodOfApplication: 'Method of Application',
  fullName: 'Full Name',
  email: 'Email',
  contactNumber: 'Contact Number',
  resume: 'Resume',
  consent: 'Consent to keep data'
};

// Header kolom tabel yang harus ada (diverifikasi dari DOM).
export const candidateColumns = [
  'Vacancy',
  'Candidate',
  'Hiring Manager',
  'Date of Application',
  'Status',
  'Actions'
];

export const vacancyColumns = [
  'Vacancy',
  'Job Title',
  'Hiring Manager',
  'Status',
  'Actions'
];

// Kandidat seed demo yang dipakai untuk assertion pencarian positif.
export const seededCandidate = {
  name: 'Manoj Regmi'
};

export const nonExistentCandidate = 'ZzKandidatTidakAda999';

/**
 * Nama unik per run untuk Add Candidate — mencegah bentrok dengan data
 * peserta lain di demo publik.
 */
export const uniqueCandidate = (prefix = 'QACandidate') => {
  const stamp = Date.now().toString().slice(-8);
  return {
    firstName: prefix,
    middleName: 'Test',
    lastName: `Auto${stamp}`,
    email: `qa.auto.${stamp}@example.com`,
    contactNumber: '08123456789',
    keywords: 'automation, cypress'
  };
};

/**
 * Payload stub untuk daftar kandidat — dipakai saat test butuh jumlah pasti.
 * Bentuk mengikuti response asli endpoint /recruitment/candidates.
 */
export const stubbedCandidates = (count = 3) => ({
  data: Array.from({ length: count }, (_, i) => ({
    id: 900 + i,
    firstName: `StubCand${i + 1}`,
    middleName: '',
    lastName: 'Test',
    vacancy: { id: 1, name: 'QA Intern', status: true },
    hiringManager: null,
    dateOfApplication: '2026-01-15',
    status: { id: 1, label: 'Application Initiated' }
  })),
  meta: { total: count },
  rels: []
});

/**
 * Payload stub untuk daftar vacancy.
 */
export const stubbedVacancies = (count = 2) => ({
  data: Array.from({ length: count }, (_, i) => ({
    id: 500 + i,
    name: `Stub Vacancy ${i + 1}`,
    jobTitle: { id: 1, title: 'QA Engineer', isDeleted: false },
    hiringManager: null,
    status: true
  })),
  meta: { total: count },
  rels: []
});

// Pesan validasi form Add Candidate (diverifikasi: field wajib memakai
// validasi HTML5 / pesan "Required" di bawah field).
export const candidateValidation = {
  required: 'Required',
  invalidEmail: 'Expected format: admin@example.com'
};
