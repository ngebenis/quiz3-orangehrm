// cypress/e2e/pom/login-pom.cy.js
// Automation Login OrangeHRM menggunakan Page Object Model (POM)
// Hari 17 - Create Automation with POM
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { loginData, errorMessages, pageTitles, urls } from '../../support/data/loginData';

describe('Login Automation with Page Object Model (POM) - OrangeHRM', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // TC-POM-001
  it('TC-POM-001: Login valid dengan credentials benar', () => {
    loginPage
      .visit()
      .verifyLoginPage()
      .fillUsername(loginData.valid.username)
      .fillPassword(loginData.valid.password)
      .clickLogin();

    dashboardPage.verifyDashboard();
    cy.url().should('include', urls.dashboard);
    cy.title().should('contain', pageTitles.dashboardPage);
  });

  // TC-POM-002
  it('TC-POM-002: Login dengan username tidak terdaftar', () => {
    loginPage
      .login(loginData.invalid.username, loginData.valid.password)
      .verifyErrorMessage(errorMessages.invalidCredentials)
      .verifyStillOnLogin();

    cy.url().should('include', urls.login);
  });

  // TC-POM-003
  it('TC-POM-003: Login dengan password salah', () => {
    loginPage
      .login(loginData.valid.username, loginData.invalid.password)
      .verifyErrorMessage(errorMessages.invalidCredentials)
      .verifyStillOnLogin();
  });

  // TC-POM-004
  it('TC-POM-004: Login dengan username kosong', () => {
    loginPage
      .visit()
      .fillPassword(loginData.valid.password)
      .clickLogin()
      .verifyFieldRequired(1)
      .verifyStillOnLogin();
  });

  // TC-POM-005
  it('TC-POM-005: Login dengan password kosong', () => {
    loginPage
      .visit()
      .fillUsername(loginData.valid.username)
      .clickLogin()
      .verifyFieldRequired(1)
      .verifyStillOnLogin();
  });

  // TC-POM-006
  it('TC-POM-006: Login dengan kedua field kosong', () => {
    loginPage
      .visit()
      .submitEmpty()
      .verifyFieldRequired(2)
      .verifyStillOnLogin();
  });

  // TC-POM-007
  it('TC-POM-007: Username bersifat case-sensitive', () => {
    loginPage
      .login(loginData.caseSensitive.username, loginData.caseSensitive.password)
      .verifyErrorMessage(errorMessages.invalidCredentials);

    // lalu coba dengan huruf kecil yang benar
    loginPage
      .visit()
      .fillUsername(loginData.valid.username)
      .fillPassword(loginData.valid.password)
      .clickLogin();

    dashboardPage.verifyDashboard();
  });

  // TC-POM-008
  it('TC-POM-008: Alur forgot password', () => {
    loginPage
      .visit()
      .verifyLoginPage()
      .clickForgotPassword()
      .verifyForgotPasswordPage();

    cy.url().should('include', urls.forgotPassword);
    loginPage.elements.usernameInput().should('be.visible');
  });

  // TC-POM-009
  it('TC-POM-009: Login lalu logout', () => {
    loginPage.login(loginData.valid.username, loginData.valid.password);
    dashboardPage.verifyDashboard();

    dashboardPage.logout();

    cy.url().should('include', urls.login);
    loginPage.verifyLoginPage();
  });

  // TC-POM-010
  it('TC-POM-010: Verifikasi branding dan copyright halaman login', () => {
    loginPage.visit().verifyLoginPage().verifyCopyright();

    cy.get('.orangehrm-login-logo img').should('be.visible');
    cy.get('.orangehrm-login-slot').should('be.visible');
    cy.get('.orangehrm-login-title').should('contain.text', 'Login');
  });

  // TC-POM-011
  it('TC-POM-011: Spasi di credentials ditolak sistem', () => {
    loginPage
      .login(loginData.whitespaceUsername.username, loginData.whitespacePassword.password)
      .verifyErrorMessage(errorMessages.invalidCredentials)
      .verifyStillOnLogin();
  });

  // TC-POM-012
  it('TC-POM-012: Beberapa percobaan login berurutan', () => {
    // percobaan 1 - credentials salah
    loginPage
      .login(loginData.invalid.username, loginData.invalid.password)
      .verifyErrorMessage(errorMessages.invalidCredentials);

    // percobaan 2 - password kosong
    loginPage
      .visit()
      .fillUsername(loginData.usernameOnly.username)
      .clickLogin()
      .verifyFieldRequired(1);

    // percobaan 3 - credentials benar
    loginPage
      .visit()
      .fillUsername(loginData.valid.username)
      .fillPassword(loginData.valid.password)
      .clickLogin();

    dashboardPage.verifyDashboard();
  });

  // TC-POM-013
  it('TC-POM-013: Navigasi antar module setelah login', () => {
    loginPage.login(loginData.valid.username, loginData.valid.password);
    dashboardPage.verifyDashboard();

    dashboardPage.navigateToMenu('Admin');
    cy.url().should('include', '/admin/viewSystemUsers');
    cy.contains('System Users').should('be.visible');

    dashboardPage.navigateToMenu('PIM');
    cy.url().should('include', '/pim/viewEmployeeList');
    cy.contains('Employee Information').should('be.visible');

    dashboardPage.navigateToMenu('Dashboard');
    dashboardPage.verifyDashboard();
  });

  // TC-POM-014
  it('TC-POM-014: Verifikasi widget dashboard', () => {
    loginPage.login(loginData.valid.username, loginData.valid.password);
    dashboardPage.verifyDashboard();

    dashboardPage.countWidgets().should('eq', 7);

    dashboardPage.elements.dashboardGrid()
      .should('contain.text', 'Time at Work')
      .and('contain.text', 'My Actions')
      .and('contain.text', 'Quick Launch')
      .and('contain.text', 'Buzz Latest Posts');

    dashboardPage.verifyQuickLaunch();
  });
});
