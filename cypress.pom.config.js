// cypress.pom.config.js
// Konfigurasi khusus spec POM (Hari 17).
// Memakai cypress.config.base.js supaya baseUrl/viewport/timeout sama
// dengan spec lain, hanya reportFilename yang berbeda.
const baseConfig = require('./cypress.config.base.js');

module.exports = {
  e2e: {
    ...baseConfig('report-pom'),
    specPattern: 'cypress/e2e/pom/**/*.cy.js'
  }
};
