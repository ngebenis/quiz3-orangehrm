const { defineConfig } = require('cypress');
const buildE2EConfig = require('./cypress.config.base');

// Dipakai untuk Quiz 3 (cypress/e2e/login.cy.js) -> cypress/reports/report-login.html
module.exports = defineConfig({
  e2e: buildE2EConfig('report-login')
});
