/**
 * Video Simulasi Aplikasi OrangeHRM Demo
 * ---------------------------------------
 * Spec ini BUKAN bagian dari penilaian test case (tidak masuk specPattern
 * cypress.pom3.config.js). Tujuannya hanya merekam simulasi pemakaian
 * aplikasi untuk tiga fitur: Login -> Directory -> Recruitment.
 *
 * CATATAN PENTING:
 * Cypress menghapus cookie/localStorage di antara setiap `it`, sehingga
 * alur harus berada dalam SATU `it` agar sesi login tetap hidup saat
 * berpindah ke Directory dan Recruitment.
 *
 * Dijalankan dengan:
 *   npx cypress run --config-file cypress.pom3.config.js \
 *     --spec cypress/e2e/demo/simulasi.cy.js --config video=true
 */
import { LoginPage } from '../../pages/LoginPage';
import { DirectoryPage } from '../../pages/DirectoryPage';
import { RecruitmentPage } from '../../pages/RecruitmentPage';
import { loginData, urls } from '../../support/data/loginData';
import { seededEmployee } from '../../support/data/directoryData';

const jeda = (ms) => cy.wait(ms);

/** Gulir jendela dengan aman (tanpa cek "scrollable" yang sering gagal). */
const gulir = (posisi) => {
  cy.window().then((win) => {
    win.scrollTo({ top: posisi === 'bottom' ? win.document.body.scrollHeight : 0, behavior: 'smooth' });
  });
};

describe('SIMULASI APLIKASI - Login, Directory, Recruitment', () => {
  const loginPage = new LoginPage();
  const directoryPage = new DirectoryPage();
  const recruitmentPage = new RecruitmentPage();

  it('Simulasi pemakaian aplikasi: Login, Directory, Recruitment', () => {
    // ---------- 1. LOGIN ----------
    loginPage.visit();
    jeda(2500);

    // Mengetik lambat agar terlihat jelas di video
    loginPage.elements.usernameInput().type(loginData.valid.username, { delay: 140 });
    jeda(900);
    loginPage.elements.passwordInput().type(loginData.valid.password, { delay: 140 });
    jeda(900);
    loginPage.elements.loginButton().click();

    cy.url({ timeout: 60000 }).should('include', urls.dashboard);
    jeda(3500);

    // ---------- 2. DIRECTORY ----------
    directoryPage.visit();
    directoryPage.waitForLoad();
    jeda(3000);

    // Gulir daftar karyawan agar kartu terlihat
    gulir('bottom');
    jeda(2000);
    gulir('top');
    jeda(1500);

    // Pakai autocomplete nama karyawan
    directoryPage.elements.employeeNameInput().clear().type(seededEmployee.firstName, { delay: 200 });
    jeda(3500);

    // Kosongkan kembali agar halaman bersih sebelum pindah fitur
    directoryPage.elements.employeeNameInput().clear();
    jeda(1500);

    // ---------- 3. RECRUITMENT ----------
    recruitmentPage.visitCandidates();
    jeda(3500);

    // Gulir tabel kandidat
    gulir('bottom');
    jeda(2000);
    gulir('top');
    jeda(1500);
    jeda(2000);

    // Pindah ke tab Vacancies
    recruitmentPage.openVacanciesTab();
    jeda(3500);

    // Buka form Add Candidate
    recruitmentPage.visitAddCandidate();
    jeda(3000);

    cy.contains('button', 'Save').should('be.visible');
    jeda(2500);
  });
});
