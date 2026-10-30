// cypress/e2e/pom3/recruitment.cy.js
// Tugas 3 Fitur — RECRUITMENT (8 test case)
// Format POM: Page Object (RecruitmentPage), Data (recruitmentData),
// Intercept (RecruitmentIntercepts)
//
// Pola setiap test: Intercept -> Action -> Assertion.
import { RecruitmentPage } from '../../pages/RecruitmentPage';
import { LoginPage } from '../../pages/LoginPage';
import { RecruitmentIntercepts } from '../../support/intercepts/RecruitmentIntercepts';
import { loginData, urls } from '../../support/data/loginData';
import {
  seededCandidate,
  recruitmentTexts,
  uniqueCandidate
} from '../../support/data/recruitmentData';

describe('Recruitment - POM + Intercept (8 test case)', () => {
  const recruitmentPage = new RecruitmentPage();
  const loginPage = new LoginPage();

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Recruitment butuh sesi login
    loginPage.login(loginData.valid.username, loginData.valid.password);
    cy.url().should('include', urls.dashboard);
  });

  // TC-REC-001
  it('TC-REC-001: Halaman Candidates tampil dengan tabel dan filter lengkap', () => {
    // Intercept
    RecruitmentIntercepts.loadCandidates();

    // Action
    recruitmentPage.visitCandidates();

    // Assertion
    RecruitmentIntercepts.verifyCandidatesResponse('recCandidates');
    recruitmentPage.verifyCandidatesPage();
    recruitmentPage.verifyCandidateTableHeaders();
    recruitmentPage.verifyTableHasRows();
  });

  // TC-REC-002
  it('TC-REC-002: Request kandidat membawa query limit dan model=list', () => {
    // Intercept
    RecruitmentIntercepts.loadCandidates('recQuery');

    // Action
    recruitmentPage.visitCandidates();

    // Assertion
    cy.wait('@recQuery').then((interception) => {
      expect(interception.request.query).to.have.property('limit');
      expect(interception.request.query.model).to.eq('list');
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body.data).to.be.an('array');
    });
    recruitmentPage.verifyRecordsCountVisible();
  });

  // TC-REC-003
  it('TC-REC-003: Tab Vacancies menampilkan tabel vacancy dengan kolom yang benar', () => {
    recruitmentPage.visitCandidates();
    recruitmentPage.verifyCandidatesPage();

    // Intercept
    RecruitmentIntercepts.loadVacancies('recVac');

    // Action
    recruitmentPage.openVacanciesTab();

    // Assertion
    cy.wait('@recVac').its('response.statusCode').should('eq', 200);
    recruitmentPage.verifyVacanciesPage();
    recruitmentPage.verifyVacancyTableHeaders();
  });

  // TC-REC-004
  it('TC-REC-004: Pencarian kandidat mengirim query dan response 200', () => {
    recruitmentPage.visitCandidates();
    recruitmentPage.verifyCandidatesPage();

    RecruitmentIntercepts.loadCandidates('recSearch');

    // Action
    recruitmentPage.searchCandidateByName(seededCandidate.name);
    recruitmentPage.searchWithoutFilter();

    // Assertion
    cy.wait('@recSearch').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property('data');
    });
    cy.url().should('include', urls.recruitmentCandidates);
  });

  // TC-REC-005
  it('TC-REC-005: Stub 3 kandidat membuat tabel merender tepat 3 baris', () => {
    // Intercept: jumlah baris ditentukan test
    RecruitmentIntercepts.stubCandidates(3, 'recStub3');

    // Action
    recruitmentPage.visitCandidates();

    // Assertion
    RecruitmentIntercepts.verifyResponseDataCount('recStub3', 3);
    cy.get('.oxd-table-body .oxd-table-row').should('have.length', 3);
  });

  // TC-REC-006
  it('TC-REC-006: Stub daftar kandidat kosong menampilkan No Records Found', () => {
    // Intercept
    RecruitmentIntercepts.stubEmptyCandidates('recEmpty');

    // Action
    recruitmentPage.visitCandidates();

    // Assertion
    RecruitmentIntercepts.verifyResponseDataCount('recEmpty', 0);
    recruitmentPage.verifyNoRecords();
  });

  // TC-REC-007
  it('TC-REC-007: Form Add Candidate memuat opsi Vacancy dan menampilkan field wajib', () => {
    // Intercept — halaman Add Candidate memuat daftar vacancy untuk dropdown
    RecruitmentIntercepts.loadVacancyOptions('recVacancyOptions');

    // Action
    recruitmentPage.visitAddCandidate();

    // Assertion: request opsi vacancy benar
    cy.wait('@recVacancyOptions', { timeout: 60000 }).then((interception) => {
      expect(interception.request.method, 'method').to.eq('GET');
      expect(interception.request.query.model, 'model').to.eq('summary');
      expect(interception.response.statusCode, 'status code').to.eq(200);
      expect(interception.response.body.data, 'daftar vacancy').to.be.an('array');
    });

    // Assertion: halaman dan field wajib tampil
    recruitmentPage.verifyAddCandidatePage();
    recruitmentPage.verifyAddCandidateFormFields();
  });

  // TC-REC-008
  it('TC-REC-008: Simpan Add Candidate tanpa nama memunculkan pesan validasi', () => {
    // Intercept
    RecruitmentIntercepts.loadJobTitles('recJobTitles2');

    // Action
    recruitmentPage.visitAddCandidate();
    recruitmentPage.verifyAddCandidatePage();
    recruitmentPage.clickSave();

    // Assertion: field wajib menolak submit
    recruitmentPage.verifyRequiredFieldErrors(1);
    cy.url().should('include', urls.addCandidate);
    cy.contains(recruitmentTexts.requiredMark).should('be.visible');
  });
});
