// cypress/support/intercepts/RecruitmentIntercepts.js
// Lapisan intercept untuk fitur Recruitment.
//
// Endpoint direkam dari network asli:
//   GET /api/v2/recruitment/candidates?limit=50&offset=0&model=list&...
//   GET /api/v2/recruitment/vacancies?limit=50&offset=0&...&model=detailed
//   GET /api/v2/recruitment/vacancies?model=summary&limit=0
//   GET /api/v2/recruitment/hiring-managers?limit=0
//   GET /api/v2/recruitment/candidates/statuses
//   GET /api/v2/admin/job-titles?limit=0
import { stubbedCandidates, stubbedVacancies } from '../data/recruitmentData';

export class RecruitmentIntercepts {
  /**
   * Intercept daftar kandidat (tabel utama halaman Candidates).
   */
  static loadCandidates(alias = 'recCandidates') {
    cy.intercept('GET', '**/api/v2/recruitment/candidates?*').as(alias);
    return RecruitmentIntercepts;
  }

  /**
   * Intercept daftar vacancy (tab Vacancies).
   */
  static loadVacancies(alias = 'recVacancies') {
    cy.intercept('GET', '**/api/v2/recruitment/vacancies?*').as(alias);
    return RecruitmentIntercepts;
  }

  /**
   * Intercept daftar hiring manager (dropdown filter).
   */
  static loadHiringManagers(alias = 'recHiringManagers') {
    cy.intercept('GET', '**/api/v2/recruitment/hiring-managers*').as(alias);
    return RecruitmentIntercepts;
  }

  /**
   * Intercept daftar status kandidat.
   */
  static loadStatuses(alias = 'recStatuses') {
    cy.intercept('GET', '**/api/v2/recruitment/candidates/statuses*').as(alias);
    return RecruitmentIntercepts;
  }

  /**
   * Intercept daftar job title.
   */
  /**
   * Intercept dropdown Vacancy pada form Add Candidate.
   * Terverifikasi dari traffic asli halaman /recruitment/addCandidate:
   *   GET /api/v2/recruitment/vacancies?model=summary&limit=0&status=true&excludeInterviewers=true
   * (halaman Add Candidate TIDAK memanggil /admin/job-titles)
   */
  static loadVacancyOptions(alias = 'recVacancyOptions') {
    cy.intercept('GET', '**/api/v2/recruitment/vacancies?*model=summary*').as(alias);
    return RecruitmentIntercepts;
  }

  static loadJobTitles(alias = 'recJobTitles') {
    cy.intercept('GET', '**/api/v2/admin/job-titles*').as(alias);
    return RecruitmentIntercepts;
  }

  /**
   * Stub daftar kandidat dengan jumlah tetap.
   */
  static stubCandidates(count = 3, alias = 'recStubCandidates') {
    cy.intercept('GET', '**/api/v2/recruitment/candidates?*', {
      statusCode: 200,
      body: stubbedCandidates(count)
    }).as(alias);
    return RecruitmentIntercepts;
  }

  /**
   * Stub daftar kandidat kosong — menguji empty state.
   */
  static stubEmptyCandidates(alias = 'recEmptyCandidates') {
    cy.intercept('GET', '**/api/v2/recruitment/candidates?*', {
      statusCode: 200,
      body: { data: [], meta: { total: 0 }, rels: [] }
    }).as(alias);
    return RecruitmentIntercepts;
  }

  /**
   * Stub daftar vacancy dengan jumlah tetap.
   */
  static stubVacancies(count = 2, alias = 'recStubVacancies') {
    cy.intercept('GET', '**/api/v2/recruitment/vacancies?*', {
      statusCode: 200,
      body: stubbedVacancies(count)
    }).as(alias);
    return RecruitmentIntercepts;
  }

  /**
   * Stub error server pada daftar kandidat.
   */
  static stubServerError(alias = 'recServerError') {
    cy.intercept('GET', '**/api/v2/recruitment/candidates?*', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as(alias);
    return RecruitmentIntercepts;
  }

  // ---------- Assertion helper ----------
  static verifyCandidatesResponse(alias) {
    cy.wait(`@${alias}`).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property('data');
      expect(interception.response.body.data).to.be.an('array');
    });
    return RecruitmentIntercepts;
  }

  static verifyResponseDataCount(alias, expectedCount) {
    cy.wait(`@${alias}`).then((interception) => {
      expect(interception.response.body.data).to.have.length(expectedCount);
    });
    return RecruitmentIntercepts;
  }

  static verifyRequestQuery(alias, key) {
    cy.wait(`@${alias}`).then((interception) => {
      expect(interception.request.query).to.have.property(key);
    });
    return RecruitmentIntercepts;
  }

  static verifyStatusCode(alias, expectedStatus) {
    cy.wait(`@${alias}`).its('response.statusCode').should('eq', expectedStatus);
    return RecruitmentIntercepts;
  }
}
