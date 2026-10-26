/// <reference types="cypress" />

/**
 * Hari 16 - cy.intercept() pada seluruh test scenario Login (Quiz 3)
 *
 * Setiap `it` block memakai SATU intercept, dan target URL-nya BERBEDA
 * satu sama lain (tidak ada intercept yang diulang).
 *
 *  01. POST /web/index.php/auth/validate
 *  02. GET  /web/index.php/auth/login
 *  03. GET  /web/index.php/core/i18n/messages
 *  04. GET  /web/index.php/auth/requestPasswordResetCode
 *  05. GET  /web/index.php/dashboard/index
 *  06. GET  /web/index.php/api/v2/dashboard/employees/action-summary
 *  07. GET  /web/index.php/api/v2/dashboard/employees/time-at-work
 *  08. GET  /web/index.php/api/v2/dashboard/shortcuts
 *  09. GET  /web/index.php/api/v2/buzz/feed
 *  10. GET  /web/index.php/api/v2/dashboard/employees/leaves
 *  11. GET  /web/index.php/auth/logout
 *  12. GET  /web/index.php/api/v2/dashboard/employees/subunit
 */

describe('OrangeHRM - Login dengan Intercept', () => {
  const loginUrl = '/web/index.php/auth/login';

  // TC-INT-001
  it('TC-INT-001 - Intercept POST /auth/validate saat login valid', () => {
    // Intercept
    cy.intercept('POST', '**/web/index.php/auth/validate').as('validate');

    // Action
    cy.visit(loginUrl);
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // Assertion
    cy.wait('@validate').then(({ request, response }) => {
      expect(request.method).to.eq('POST');
      expect(request.body).to.include('username=Admin');
      expect(response.statusCode).to.eq(302);
    });
    cy.url().should('include', '/dashboard/index');
  });

  // TC-INT-002
  it('TC-INT-002 - Intercept GET /auth/login saat halaman login dibuka', () => {
    // Intercept
    cy.intercept('GET', '**/web/index.php/auth/login').as('loginPage');

    // Action
    cy.visit(loginUrl);

    // Assertion
    cy.wait('@loginPage').then(({ request, response }) => {
      expect(request.method).to.eq('GET');
      expect(response.statusCode).to.eq(200);
      expect(response.headers['content-type']).to.include('text/html');
      expect(response.body).to.include('<title>OrangeHRM</title>');
    });
    cy.get('.orangehrm-login-form').should('be.visible');
  });

  // TC-INT-003
  it('TC-INT-003 - Intercept GET /core/i18n/messages saat login gagal', () => {
    // Intercept
    cy.intercept('GET', '**/web/index.php/core/i18n/messages').as('i18n');

    // Action
    cy.visit(loginUrl);
    cy.get('input[name="username"]').type('invalid_user');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // Assertion
    cy.wait('@i18n').then(({ request, response }) => {
      expect(request.method).to.eq('GET');
      expect(response.statusCode).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(Object.keys(response.body).length).to.be.greaterThan(0);
    });
    cy.get('.oxd-alert-content-text').should('contain', 'Invalid credentials');
  });

  // TC-INT-004
  it('TC-INT-004 - Intercept GET /auth/requestPasswordResetCode di halaman forgot password', () => {
    // Intercept
    cy.intercept('GET', '**/web/index.php/auth/requestPasswordResetCode').as('forgotPage');

    // Action
    cy.visit(loginUrl);
    cy.get('.orangehrm-login-forgot-header').click();

    // Assertion
    cy.wait('@forgotPage').then(({ request, response }) => {
      expect(request.method).to.eq('GET');
      expect(response.statusCode).to.eq(200);
      expect(response.body).to.include('<title>OrangeHRM</title>');
    });
    cy.url().should('include', '/auth/requestPasswordResetCode');
  });

  // TC-INT-005
  it('TC-INT-005 - Intercept GET /dashboard/index setelah login berhasil', () => {
    // Intercept
    cy.intercept('GET', '**/web/index.php/dashboard/index').as('dashboardPage');

    // Action
    cy.visit(loginUrl);
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // Assertion
    cy.wait('@dashboardPage').then(({ request, response }) => {
      expect(request.method).to.eq('GET');
      expect(response.statusCode).to.eq(200);
    });
    cy.get('.oxd-topbar-header-breadcrumb-module').should('have.text', 'Dashboard');
  });

  // TC-INT-006
  it('TC-INT-006 - Intercept dan modifikasi GET /api/v2/dashboard/employees/action-summary', () => {
    // Intercept + stub: jumlah "Leave Requests to Approve" diubah jadi 7
    cy.intercept('GET', '**/api/v2/dashboard/employees/action-summary*', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          data: [
            // 'group' harus persis seperti response asli API, karena OrangeHRM
            // memakainya sebagai key untuk label widget "My Actions".
            { id: 1, group: 'Leave Requests To Approve', pendingActionCount: 7 }
          ],
          meta: [],
          rels: []
        }
      });
    }).as('actionSummary');

    // Action
    cy.visit(loginUrl);
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/index');

    // Assertion
    cy.wait('@actionSummary', { timeout: 20000 }).then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      expect(response.body.data[0].pendingActionCount).to.eq(7);
    });
    // Widget "My Actions" dirender setelah response di atas, jadi tunggu sampai teksnya muncul.
    // Whitespace dinormalisasi karena OrangeHRM memakai non-breaking space di label widget.
    cy.get('.orangehrm-dashboard-grid', { timeout: 20000 }).should(($grid) => {
      expect($grid.text().replace(/\s+/g, ' ')).to.contain('(7) Leave Requests to Approve');
    });
  });

  // TC-INT-007
  it('TC-INT-007 - Intercept GET /api/v2/dashboard/employees/time-at-work', () => {
    // Intercept
    cy.intercept('GET', '**/web/index.php/api/v2/dashboard/employees/time-at-work**').as('timeAtWork');

    // Action
    cy.visit(loginUrl);
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/index');

    // Assertion
    cy.wait('@timeAtWork').then(({ request, response }) => {
      expect(request.query).to.have.property('currentDate');
      expect(response.statusCode).to.eq(200);
      expect(response.body).to.have.property('data');
    });
    cy.contains('Time at Work').should('be.visible');
  });

  // TC-INT-008
  it('TC-INT-008 - Intercept GET /api/v2/dashboard/shortcuts', () => {
    // Intercept
    cy.intercept('GET', '**/web/index.php/api/v2/dashboard/shortcuts').as('shortcuts');

    // Action
    cy.visit(loginUrl);
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/index');

    // Assertion
    cy.wait('@shortcuts').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      expect(response.body.data).to.have.property('leave.apply_leave');
    });
    cy.contains('Quick Launch').should('be.visible');
  });

  // TC-INT-009
  it('TC-INT-009 - Intercept GET /api/v2/buzz/feed', () => {
    // Intercept
    cy.intercept('GET', '**/web/index.php/api/v2/buzz/feed**').as('buzzFeed');

    // Action
    cy.visit(loginUrl);
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/index');

    // Assertion
    cy.wait('@buzzFeed').then(({ request, response }) => {
      expect(request.query.limit).to.eq('5');
      expect(response.statusCode).to.eq(200);
    });
    cy.contains('Buzz Latest Posts').should('be.visible');
  });

  // TC-INT-010
  it('TC-INT-010 - Intercept GET /api/v2/dashboard/employees/leaves', () => {
    // Intercept
    cy.intercept('GET', '**/web/index.php/api/v2/dashboard/employees/leaves**').as('leaves');

    // Action
    cy.visit(loginUrl);
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/index');

    // Assertion
    cy.wait('@leaves').then(({ request, response }) => {
      expect(request.query).to.have.property('date');
      expect(response.statusCode).to.eq(200);
      expect(response.body.data).to.be.an('array');
    });
    cy.contains('Employees on Leave Today').should('be.visible');
  });

  // TC-INT-011
  it('TC-INT-011 - Intercept GET /auth/logout saat logout', () => {
    // Intercept
    cy.intercept('GET', '**/web/index.php/auth/logout').as('logout');

    // Action
    cy.visit(loginUrl);
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/index');
    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('Logout').click();

    // Assertion
    cy.wait('@logout').then(({ request, response }) => {
      expect(request.method).to.eq('GET');
      expect(response.statusCode).to.eq(302);
    });
    cy.url().should('include', '/auth/login');
  });

  // TC-INT-012
  it('TC-INT-012 - Intercept GET /api/v2/dashboard/employees/subunit', () => {
    // Intercept
    cy.intercept('GET', '**/web/index.php/api/v2/dashboard/employees/subunit').as('subunit');

    // Action
    cy.visit(loginUrl);
    cy.get('input[name="username"]').type('Admin');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/index');

    // Assertion
    cy.wait('@subunit').then(({ request, response }) => {
      expect(request.method).to.eq('GET');
      expect(response.statusCode).to.eq(200);
      expect(response.body).to.have.property('data');
    });
    cy.contains('Employee Distribution by Sub Unit').should('be.visible');
  });
});
