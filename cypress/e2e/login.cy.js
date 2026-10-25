/// <reference types="cypress" />

/**
 * Quiz 3 - UI Automation Login OrangeHRM
 * Test case mengacu pada Quiz 2 (TC-LOGIN-001 s/d TC-LOGIN-012)
 * URL : https://opensource-demo.orangehrmlive.com
 *
 * Struktur: 1 test case = 1 it block (action dulu, lalu assertion)
 */

describe('OrangeHRM - Login Feature', () => {
  const loginUrl = '/web/index.php/auth/login';

  beforeEach(() => {
    cy.visit(loginUrl);
  });

  // TC-LOGIN-001
  it('TC-LOGIN-001 - Login dengan kredensial valid', () => {
    // Action
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // Assertion
    cy.url().should('include', '/dashboard/index');
    cy.get('.oxd-topbar-header-breadcrumb-module').should('have.text', 'Dashboard');
    cy.get('.oxd-main-menu').should('be.visible');
  });

  // TC-LOGIN-002
  it('TC-LOGIN-002 - Login dengan username tidak valid', () => {
    // Action
    cy.get('input[name="username"]').type('invalid_user');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // Assertion
    cy.get('.oxd-alert-content-text').should('contain', 'Invalid credentials');
    cy.url().should('include', '/auth/login');
  });

  // TC-LOGIN-003
  it('TC-LOGIN-003 - Login dengan password tidak valid', () => {
    // Action
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('WrongPass123');
    cy.get('button[type="submit"]').click();

    // Assertion
    cy.get('.oxd-alert-content-text').should('contain', 'Invalid credentials');
    cy.url().should('include', '/auth/login');
  });

  // TC-LOGIN-004
  it('TC-LOGIN-004 - Submit form kosong', () => {
    // Action
    cy.get('button[type="submit"]').click();

    // Assertion
    cy.get('.oxd-input-field-error-message').should('have.length', 2);
    cy.get('.oxd-input-field-error-message').eq(0).should('have.text', 'Required');
    cy.get('.oxd-input-field-error-message').eq(1).should('have.text', 'Required');
    cy.url().should('include', '/auth/login');
  });

  // TC-LOGIN-005
  it('TC-LOGIN-005 - Username kosong', () => {
    // Action
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // Assertion
    cy.get('.oxd-input-field-error-message').should('have.length', 1);
    cy.get('.oxd-input-field-error-message').should('have.text', 'Required');
    cy.url().should('include', '/auth/login');
  });

  // TC-LOGIN-006
  it('TC-LOGIN-006 - Password kosong', () => {
    // Action
    cy.get('input[name="username"]').type('Admin');
    cy.get('button[type="submit"]').click();

    // Assertion
    cy.get('.oxd-input-field-error-message').should('have.length', 1);
    cy.get('.oxd-input-field-error-message').should('have.text', 'Required');
    cy.url().should('include', '/auth/login');
  });

  // TC-LOGIN-007
  it('TC-LOGIN-007 - Password ditampilkan sebagai karakter tersembunyi', () => {
    // Action
    cy.get('input[name="password"]').type('admin123');

    // Assertion
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    cy.get('input[name="password"]').should('have.value', 'admin123');
  });

  // TC-LOGIN-008
  it('TC-LOGIN-008 - Submit form menggunakan tombol Enter', () => {
    // Action
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123{enter}');

    // Assertion
    cy.url().should('include', '/dashboard/index');
    cy.get('.oxd-topbar-header-breadcrumb-module').should('have.text', 'Dashboard');
  });

  // TC-LOGIN-009
  it('TC-LOGIN-009 - Username dengan spasi di awal dan akhir', () => {
    // Action
    cy.get('input[name="username"]').type('  Admin  ');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // Assertion
    cy.get('.oxd-alert-content-text').should('contain', 'Invalid credentials');
    cy.url().should('include', '/auth/login');
  });

  // TC-LOGIN-010
  it('TC-LOGIN-010 - Username tidak membedakan huruf besar kecil', () => {
    // Action
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // Assertion
    cy.url().should('include', '/dashboard/index');
    cy.get('.oxd-topbar-header-breadcrumb-module').should('have.text', 'Dashboard');
  });

  // TC-LOGIN-011
  it('TC-LOGIN-011 - Navigasi Forgot your password', () => {
    // Action
    cy.get('.orangehrm-login-forgot-header').click();

    // Assertion
    cy.url().should('include', '/auth/requestPasswordResetCode');
    cy.get('.orangehrm-forgot-password-title').should('contain', 'Reset Password');
    cy.get('input[name="username"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  // TC-LOGIN-012
  it('TC-LOGIN-012 - Akses URL Dashboard tanpa login', () => {
    // Action
    cy.clearCookies();
    cy.visit('/web/index.php/dashboard/index');

    // Assertion
    cy.url().should('include', '/auth/login');
    cy.get('.orangehrm-login-form').should('be.visible');
    cy.get('input[name="username"]').should('be.visible');
  });
});
