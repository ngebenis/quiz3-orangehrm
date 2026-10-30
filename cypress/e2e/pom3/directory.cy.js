// cypress/e2e/pom3/directory.cy.js
// Tugas 3 Fitur — DIRECTORY (8 test case)
// Format POM: Page Object (DirectoryPage), Data (directoryData), Intercept (DirectoryIntercepts)
//
// Pola setiap test: Intercept -> Action -> Assertion.
import { DirectoryPage } from '../../pages/DirectoryPage';
import { LoginPage } from '../../pages/LoginPage';
import { DirectoryIntercepts } from '../../support/intercepts/DirectoryIntercepts';
import { loginData, urls } from '../../support/data/loginData';
import {
  seededEmployee,
  autocompleteSuggestions,
  directoryTexts,
  recordsPerPage
} from '../../support/data/directoryData';

describe('Directory - POM + Intercept (8 test case)', () => {
  const directoryPage = new DirectoryPage();
  const loginPage = new LoginPage();

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Directory butuh sesi login
    loginPage.login(loginData.valid.username, loginData.valid.password);
    cy.url().should('include', urls.dashboard);
  });

  // TC-DIR-001
  it('TC-DIR-001: Halaman Directory tampil dengan kartu karyawan dan filter lengkap', () => {
    // Intercept
    DirectoryIntercepts.loadEmployees();

    // Action
    directoryPage.visit();

    // Assertion
    DirectoryIntercepts.verifyResponseOk('directoryEmployees');
    directoryPage.verifyPage();
    directoryPage.verifyFilterFieldsPresent();
    directoryPage.verifyCardsVisible();
  });

  // TC-DIR-002
  it('TC-DIR-002: Request directory membawa limit 14 dan mengembalikan data array', () => {
    // Intercept
    DirectoryIntercepts.loadEmployees('dirLimit');

    // Action
    directoryPage.visit();

    // Assertion
    cy.wait('@dirLimit').then((interception) => {
      expect(interception.request.query.limit).to.eq(String(recordsPerPage));
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body.data).to.be.an('array');
      expect(interception.response.body.meta).to.have.property('total');
    });
    directoryPage.verifyRecordsCount();
  });

  // TC-DIR-003
  it('TC-DIR-003: Jumlah kartu yang dirender sama dengan jumlah data dari API', () => {
    // Intercept
    DirectoryIntercepts.loadEmployees('dirCount');

    // Action
    directoryPage.visit();
    directoryPage.waitForLoad();

    // Assertion: jumlah kartu di UI harus konsisten dengan response API
    cy.wait('@dirCount').then((interception) => {
      const apiCount = interception.response.body.data.length;
      expect(apiCount).to.be.greaterThan(0);
      cy.get('.orangehrm-directory-card').should('have.length', apiCount);
    });
  });

  // TC-DIR-004
  it('TC-DIR-004: Kolom Employee Name memakai autocomplete nameOrId dan menampilkan saran', () => {
    // Perilaku nyata Directory (hasil rekaman traffic):
    //  - mengetik nama memicu GET /api/v2/directory/employees?nameOrId=<ketikan>
    //  - respons inilah yang mengisi dropdown saran autocomplete
    // Respons di-stub agar test tidak bergantung pada data demo yang bisa
    // diubah peserta lain; yang divalidasi adalah request + pemakaian data.
    DirectoryIntercepts.stubAutocomplete(autocompleteSuggestions, 'dirAutocomplete');

    directoryPage.visit();
    directoryPage.waitForLoad();

    // Action: ketik nama karyawan
    directoryPage.elements
      .employeeNameInput()
      .clear()
      .type(seededEmployee.firstName, { delay: 120 });

    // Assertion 1: request memakai parameter nameOrId dan dijawab 200
    cy.wait('@dirAutocomplete', { timeout: 30000 }).then((interception) => {
      expect(interception.request.method, 'method').to.eq('GET');
      expect(interception.request.url, 'endpoint').to.include('/directory/employees');
      expect(interception.request.query, 'query string').to.have.property('nameOrId');
      expect(interception.request.query.nameOrId).to.include(seededEmployee.firstName);
      expect(interception.response.statusCode, 'status code').to.eq(200);
      expect(interception.response.body.data, 'jumlah saran').to.have.length(2);
    });

    // Assertion 2: dropdown saran berisi data dari respons API
    directoryPage.elements
      .autocompleteOptions({ timeout: 30000 })
      .should('have.length', autocompleteSuggestions.length)
      .then(($opsi) => {
        expect($opsi.eq(0)).to.contain.text('Ranga');
        expect($opsi.eq(1)).to.contain.text('Perera');
      });

    // Action: pilih saran pertama
    directoryPage.elements.autocompleteOptions().first().click();

    // Assertion 3: saran terpilih masuk ke field dan dropdown tertutup
    directoryPage.elements.employeeNameInput().should(($input) => {
      expect($input.val(), 'nilai field').to.include('Ranga');
    });
    directoryPage.elements.autocompleteOptions().should('not.exist');
  });

  // TC-DIR-005
  it('TC-DIR-005: Stub hasil kosong menampilkan pesan No Records Found', () => {
    // Intercept: paksa API mengembalikan data kosong
    DirectoryIntercepts.stubEmptyResult('dirEmpty');

    // Action
    directoryPage.visit();

    // Assertion: UI harus mengikuti data stub, bukan data asli
    DirectoryIntercepts.verifyResponseTotal('dirEmpty', 0);
    directoryPage.verifyNoRecords();
  });

  // TC-DIR-006
  it('TC-DIR-006: Stub 3 karyawan membuat UI merender tepat 3 kartu', () => {
    // Intercept: jumlah data ditentukan test, bukan server
    DirectoryIntercepts.stubEmployees(3, 'dirStub3');

    // Action
    directoryPage.visit();

    // Assertion
    DirectoryIntercepts.verifyResponseTotal('dirStub3', 3);
    cy.get('.orangehrm-directory-card').should('have.length', 3);
    cy.get('.orangehrm-directory-card-header').first().should('contain.text', 'StubFirst1');
  });

  // TC-DIR-007
  it('TC-DIR-007: Tombol Reset mengosongkan filter dan memuat ulang seluruh data', () => {
    DirectoryIntercepts.anyEmployeesRequest('dirReset');

    directoryPage.visit();
    directoryPage.waitForLoad();

    // Action 1: lakukan pencarian dulu supaya ada filter yang bisa di-reset
    directoryPage.searchByEmployeeName(seededEmployee.firstName);
    directoryPage.searchWithoutFilter();
    directoryPage.elements.employeeNameInput().should('not.have.value', '');

    // Action 2: klik Reset
    directoryPage.clickReset();

    // Assertion: field kosong kembali dan daftar penuh (14 kartu) dimuat ulang
    directoryPage.verifyFiltersCleared();
    directoryPage.elements.cards().should('have.length.at.least', 2);
    cy.get('@dirReset.all').should((calls) => {
      const reload = calls.filter((c) => {
        const q = c.request.query || {};
        return !q.nameOrId && String(q.limit) === '14';
      });
      expect(reload, 'request daftar ulang setelah Reset').to.have.length.at.least(1);
    });
  });

  // TC-DIR-008
  it('TC-DIR-008: Stub error 500 membuat halaman tetap menampilkan state yang valid', () => {
    // Server error disuntikkan SENGAJA oleh test, jadi reaksi aplikasi
    // (unhandled rejection dari kode OrangeHRM) diabaikan hanya di test ini.
    // Handler global tetap ketat: error lain masih menggagalkan test lain.
    cy.on('uncaught:exception', (err) => {
      if (String(err && err.message).includes('Request failed with status code 500')) {
        return false;
      }
      return true;
    });

    // Intercept: server error
    DirectoryIntercepts.stubServerError('dirError');

    // Action
    directoryPage.visit();

    // Assertion: intercept menangkap 500 dan halaman tetap utuh
    cy.wait('@dirError').its('response.statusCode').should('eq', 500);
    cy.contains(directoryTexts.pageHeader).should('be.visible');
    directoryPage.verifyCopyright();
  });
});

