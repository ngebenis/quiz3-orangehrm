// cypress.api.config.js
// Konfigurasi khusus API test (Hari 18).
//
// Beda dengan config UI: API test tidak butuh browser, viewport, video,
// atau screenshotOnRunFailure. Yang penting hanya baseUrl API dan reporter
// dengan nama file sendiri supaya tidak menimpa report spec lain.
//
// baseUrl di sini menunjuk ke host API (bukan website OrangeHRM), sehingga
// cy.request bisa memakai path relatif.
const baseConfig = require('./cypress.config.base.js');

module.exports = {
  e2e: {
    ...baseConfig('report-api'),
    baseUrl: 'https://api.escuelajs.co/api/v1',
    specPattern: 'cypress/e2e/api/**/*.cy.js',
    video: false,
    screenshotOnRunFailure: false
  }
};
