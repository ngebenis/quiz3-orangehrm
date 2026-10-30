// cypress/support/intercepts/LoginIntercepts.js
// Lapisan intercept untuk fitur Login.
//
// Semua `cy.intercept` untuk Login dikumpulkan di sini supaya spec tetap
// bersih: spec memanggil nama aksi, bukan menulis pattern URL.
// Endpoint di bawah direkam dari network asli OrangeHRM demo.
import { loginData } from '../data/loginData';

export class LoginIntercepts {
  /**
   * Intercept request validasi login (POST /auth/validate).
   * Ini request inti: form login mengirim username+password ke sini.
   */
  static validateLogin(alias = 'validateLogin') {
    cy.intercept('POST', '**/web/index.php/auth/validate').as(alias);
    return LoginIntercepts;
  }

  /**
   * Intercept pemuatan halaman login (GET /auth/login).
   */
  static loadLoginPage(alias = 'loadLoginPage') {
    cy.intercept('GET', '**/web/index.php/auth/login').as(alias);
    return LoginIntercepts;
  }

  /**
   * Intercept file terjemahan (i18n). Muncul di setiap halaman.
   */
  static loadMessages(alias = 'loadMessages') {
    cy.intercept('GET', '**/web/index.php/core/i18n/messages').as(alias);
    return LoginIntercepts;
  }

  /**
   * Intercept request lupa password.
   */
  static requestPasswordReset(alias = 'requestReset') {
    cy.intercept('GET', '**/web/index.php/auth/requestPasswordResetCode').as(alias);
    return LoginIntercepts;
  }

  /**
   * Intercept pemuatan dashboard setelah login berhasil.
   */
  static loadDashboard(alias = 'loadDashboard') {
    cy.intercept('GET', '**/web/index.php/dashboard/index').as(alias);
    return LoginIntercepts;
  }

  /**
   * Intercept logout.
   */
  static logout(alias = 'logout') {
    cy.intercept('GET', '**/web/index.php/auth/logout').as(alias);
    return LoginIntercepts;
  }

  /**
   * Stub respons login GAGAL, tanpa menyentuh server.
   * Dipakai untuk menguji penanganan error di sisi UI secara deterministik.
   */
  static stubLoginFailure(alias = 'stubLoginFail') {
    cy.intercept('POST', '**/web/index.php/auth/validate', {
      statusCode: 302,
      headers: { location: '/web/index.php/auth/login' },
      body: ''
    }).as(alias);
    return LoginIntercepts;
  }

  /**
   * Stub respons server error saat login (500).
   */
  static stubLoginServerError(alias = 'stubLogin500') {
    cy.intercept('POST', '**/web/index.php/auth/validate', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as(alias);
    return LoginIntercepts;
  }

  /**
   * Stub payload sukses login untuk menguji skenario tanpa kredensial asli.
   */
  static stubLoginSuccess(alias = 'stubLoginOk') {
    cy.intercept('POST', '**/web/index.php/auth/validate', {
      statusCode: 302,
      headers: { location: '/web/index.php/dashboard/index' }
    }).as(alias);
    return LoginIntercepts;
  }

  // ---------- Assertion helper ----------
  static verifyRequestSent(alias, expectedUsername) {
    cy.wait(`@${alias}`).then((interception) => {
      expect(interception.request.method).to.eq('POST');
      expect(interception.request.body).to.include(`username=${expectedUsername}`);
    });
    return LoginIntercepts;
  }

  static verifyStatusCode(alias, expectedStatus) {
    cy.wait(`@${alias}`).its('response.statusCode').should('eq', expectedStatus);
    return LoginIntercepts;
  }
}
