// cypress/support/intercepts/DirectoryIntercepts.js
// Lapisan intercept untuk fitur Directory.
//
// Endpoint direkam dari network asli:
//   GET /web/index.php/api/v2/directory/employees?limit=14&offset=0
import { stubbedEmployees } from '../data/directoryData';

export class DirectoryIntercepts {
  /**
   * Intercept pemuatan daftar karyawan di Directory.
   */
  static loadEmployees(alias = 'directoryEmployees') {
    cy.intercept('GET', '**/api/v2/directory/employees*').as(alias);
    return DirectoryIntercepts;
  }

  /**
   * Intercept request pencarian karyawan.
   *
   * Parameter pencarian OrangeHRM bernama `nameOrId` (bukan `employeeName`).
   * Terverifikasi dari traffic asli:
   *   GET /api/v2/directory/employees?nameOrId=Ranga
   * Pattern menuntut adanya query string agar tidak ikut menangkap request
   * daftar awal (`?limit=14&offset=0`).
   */
  static searchEmployees(alias = 'directorySearch') {
    cy.intercept('GET', '**/api/v2/directory/employees?*nameOrId=*').as(alias);
    return DirectoryIntercepts;
  }

  /**
   * Intercept khusus autocomplete nama karyawan.
   * Terverifikasi dari traffic asli: GET .../employees?nameOrId=Ranga
   */
  static autocompleteByName(alias = 'dirAutocomplete') {
    cy.intercept('GET', '**/api/v2/directory/employees?*nameOrId=*').as(alias);
    return DirectoryIntercepts;
  }

  /**
   * Intercept khusus request Search yang memakai empNumber (id karyawan
   * yang dipilih dari autocomplete).
   * Terverifikasi dari traffic asli: GET .../employees?limit=14&offset=0&empNumber=69
   */
  static searchByEmpNumber(alias = 'dirSearchEmpNumber') {
    cy.intercept('GET', '**/api/v2/directory/employees?*empNumber=*').as(alias);
    return DirectoryIntercepts;
  }

  /**
   * Intercept semua request directory (untuk menangkap request pertama
   * setelah aksi apa pun, tanpa bergantung bentuk URL).
   */
  static anyEmployeesRequest(alias = 'directoryAny') {
    cy.intercept('GET', '**/api/v2/directory/**').as(alias);
    return DirectoryIntercepts;
  }

  /**
   * Stub respons autocomplete nama karyawan.
   * Dipakai agar pengujian dropdown saran tidak bergantung pada data demo
   * yang bisa diubah/dihapus peserta lain. Request tetap divalidasi:
   * harus GET .../employees dengan query `nameOrId`.
   */
  static stubAutocomplete(suggestions, alias = 'dirAutocompleteStub') {
    cy.intercept('GET', '**/api/v2/directory/employees?*nameOrId=*', {
      statusCode: 200,
      body: {
        data: suggestions,
        meta: { total: suggestions.length },
        rels: []
      }
    }).as(alias);
    return DirectoryIntercepts;
  }

  /**
   * Stub hasil pencarian kosong — menguji empty state tanpa bergantung
   * pada data demo yang bisa berubah.
   */
  static stubEmptyResult(alias = 'directoryEmpty') {
    cy.intercept('GET', '**/api/v2/directory/employees*', {
      statusCode: 200,
      body: { data: [], meta: { total: 0 }, rels: [] }
    }).as(alias);
    return DirectoryIntercepts;
  }

  /**
   * Stub hasil pencarian berisi sejumlah karyawan tetap.
   */
  static stubEmployees(count = 2, alias = 'directoryStubbed') {
    cy.intercept('GET', '**/api/v2/directory/employees*', {
      statusCode: 200,
      body: stubbedEmployees(count)
    }).as(alias);
    return DirectoryIntercepts;
  }

  /**
   * Stub error server pada endpoint directory.
   */
  static stubServerError(alias = 'directoryError') {
    cy.intercept('GET', '**/api/v2/directory/employees*', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as(alias);
    return DirectoryIntercepts;
  }

  // ---------- Assertion helper ----------
  static verifyRequestContainsQuery(alias, key, value) {
    cy.wait(`@${alias}`).then((interception) => {
      expect(interception.request.query).to.have.property(key);
      if (value !== undefined) {
        expect(String(interception.request.query[key])).to.contain(value);
      }
    });
    return DirectoryIntercepts;
  }

  static verifyResponseOk(alias) {
    cy.wait(`@${alias}`).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.have.property('data');
      expect(interception.response.body.data).to.be.an('array');
    });
    return DirectoryIntercepts;
  }

  static verifyResponseTotal(alias, expectedTotal) {
    cy.wait(`@${alias}`).then((interception) => {
      expect(interception.response.body.data).to.have.length(expectedTotal);
    });
    return DirectoryIntercepts;
  }
}
