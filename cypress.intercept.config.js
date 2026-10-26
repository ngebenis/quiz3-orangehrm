const { defineConfig } = require('cypress');
const buildE2EConfig = require('./cypress.config.base');

// Dipakai untuk tugas Hari 16 (cypress/e2e/intercept/login-intercept.cy.js)
// -> cypress/reports/report-intercept.html
module.exports = defineConfig({
  e2e: buildE2EConfig('report-intercept')
});
