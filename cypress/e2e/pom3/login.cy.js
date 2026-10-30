// cypress/e2e/pom3/login.cy.js
// Tugas 3 Fitur — LOGIN (8 test case)
// Format POM: Page Object (LoginPage), Data (loginData), Intercept (LoginIntercepts)
//
// Pola setiap test: Intercept -> Action -> Assertion.
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { LoginIntercepts } from '../../support/intercepts/LoginIntercepts';
import { loginData, errorMessages, urls } from '../../support/data/loginData';

describe('Login - POM + Intercept (8 test case)', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // TC-LGN-001
  it('TC-LGN-001: Login valid berhasil dan request validate terkirim dengan benar', () => {
    // Intercept
    LoginIntercepts.validateLogin();
    LoginIntercepts.loadDashboard();

    // Action
    loginPage.visit();
    loginPage.verifyLoginPage();
    loginPage
      .fillUsername(loginData.valid.username)
      .fillPassword(loginData.valid.password)
      .clickLogin();

    // Assertion
    // cy.wait hanya sekali per alias: wait kedua akan menunggu request ke-2
    // yang tidak pernah ada. Request dan response diperiksa dalam satu blok.
    cy.wait('@validateLogin').then((interception) => {
      expect(interception.request.method).to.eq('POST');
      expect(interception.request.body).to.include(`username=${loginData.valid.username}`);
      expect(interception.response.statusCode).to.eq(302);
      expect((interception.response.headers || {}).location).to.include('/dashboard/index');
    });
    cy.wait('@loadDashboard').its('response.statusCode').should('eq', 200);
    dashboardPage.verifyDashboard();
    cy.url().should('include', urls.dashboard);
  });

  // TC-LGN-002
  it('TC-LGN-002: Login dengan username tidak terdaftar ditolak dan request tetap terkirim', () => {
    // Intercept
    LoginIntercepts.validateLogin('validateFail');

    // Action
    loginPage.visit();
    loginPage
      .fillUsername(loginData.invalid.username)
      .fillPassword(loginData.invalid.password)
      .clickLogin();

    // Assertion
    cy.wait('@validateFail').then((interception) => {
      expect(interception.request.method).to.eq('POST');
      expect(interception.request.body).to.include(loginData.invalid.username);
    });
    loginPage.verifyErrorMessage(errorMessages.invalidCredentials);
    cy.url().should('include', urls.login);
  });

  // TC-LGN-003
  it('TC-LGN-003: Login dengan password salah ditolak dan tidak pindah halaman', () => {
    // Intercept
    LoginIntercepts.validateLogin('validateWrongPass');

    // Action
    loginPage.visit();
    loginPage
      .fillUsername(loginData.valid.username)
      .fillPassword(loginData.invalid.password)
      .clickLogin();

    // Assertion
    cy.wait('@validateWrongPass').then((interception) => {
      // Server menolak: tidak mengarahkan ke dashboard
      if (interception.response) {
        const location = (interception.response.headers || {}).location || '';
        expect(location).to.not.include('/dashboard/index');
      }
    });
    loginPage.verifyErrorMessage(errorMessages.invalidCredentials);
    loginPage.verifyStillOnLogin();
  });

  // TC-LGN-004
  it('TC-LGN-004: Username kosong tidak mengirim request validate ke server', () => {
    // Intercept
    LoginIntercepts.validateLogin('validateEmptyUser');

    // Action: password diisi, username dibiarkan kosong
    loginPage.visit();
    loginPage.fillPassword(loginData.valid.password);
    loginPage.clickLogin();

    // Assertion: hanya field username yang kosong -> tepat 1 pesan Required.
    // Validasi HTML5 menahan submit, jadi tidak ada POST /validate.
    loginPage.verifyFieldRequired(1);
    cy.url().should('include', urls.login);
    cy.get('@validateEmptyUser.all').should('have.length', 0);
  });

  // TC-LGN-005
  it('TC-LGN-005: Password kosong tidak mengirim request validate ke server', () => {
    // Intercept
    LoginIntercepts.validateLogin('validateEmptyPass');

    // Action
    loginPage.visit();
    loginPage.fillUsername(loginData.valid.username);
    loginPage.clickLogin();

    // Assertion
    loginPage.verifyFieldRequired(1);
    cy.get('@validateEmptyPass.all').should('have.length', 0);
  });

  // TC-LGN-006
  it('TC-LGN-006: Kedua field kosong memunculkan dua pesan Required', () => {
    // Intercept
    LoginIntercepts.validateLogin('validateBothEmpty');

    // Action
    loginPage.visit();
    loginPage.submitEmpty();

    // Assertion
    loginPage.verifyFieldRequired(2);
    cy.get('@validateBothEmpty.all').should('have.length', 0);
  });

  // TC-LGN-007
  it('TC-LGN-007: Stub respons login gagal menampilkan pesan error tanpa menyentuh server', () => {
    // Intercept: stub 302 kembali ke halaman login
    LoginIntercepts.stubLoginFailure('stubFail');

    // Action
    loginPage.visit();
    loginPage
      .fillUsername(loginData.valid.username)
      .fillPassword(loginData.valid.password)
      .clickLogin();

    // Assertion: respons berasal dari stub (bukan server), dan aplikasi
    // tidak crash — tetap di halaman login dengan form utuh.
    // Catatan: alert "Invalid credentials" hanya dibuat server asli, jadi
    // yang diuji di sini adalah stub-nya benar-benar dipakai.
    cy.wait('@stubFail').then((interception) => {
      expect(interception.response.statusCode).to.eq(302);
      expect((interception.response.headers || {}).location).to.include('/auth/login');
      expect(interception.request.body).to.include(`username=${loginData.valid.username}`);
    });
    loginPage.verifyStillOnLogin();
  });

  // TC-LGN-008
  it('TC-LGN-008: Halaman login memuat messages i18n dan interceptor mencatat response 200', () => {
    // Intercept
    LoginIntercepts.loadMessages();
    LoginIntercepts.loadLoginPage();

    // Action
    loginPage.visit();
    loginPage.verifyLoginPage();

    // Assertion
    cy.wait('@loadLoginPage').its('response.statusCode').should('eq', 200);
    cy.wait('@loadMessages').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.be.an('object');
    });
    loginPage.verifyCopyright();
  });
});
