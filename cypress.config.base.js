// Konfigurasi dasar yang dipakai bersama oleh cypress.config.js dan
// cypress.intercept.config.js. Dipisah supaya tiap spec menulis report-nya
// sendiri tanpa perlu environment variable (yang sintaksnya beda antara
// Linux/macOS dan Windows).
const baseConfig = {
  baseUrl: 'https://opensource-demo.orangehrmlive.com',
  specPattern: 'cypress/e2e/**/*.cy.js',
  viewportWidth: 1366,
  viewportHeight: 768,
  defaultCommandTimeout: 10000,
  // Demo OrangeHRM publik kadang lambat saat run dingin; 60 detik terbukti
  // sempat habis ("Timed out after waiting 60000ms for your remote page to
  // load"). 120 detik memberi ruang tanpa menyembunyikan kegagalan nyata.
  pageLoadTimeout: 120000,
  video: true,
  screenshotOnRunFailure: true,
  retries: {
    runMode: 1,
    openMode: 0
  },
  reporter: 'mochawesome',
  html: true,
  json: true,
  overwrite: true
};

// reportName: nama file HTML/JSON di cypress/reports/
module.exports = (reportName) => ({
  ...baseConfig,
  reporterOptions: {
    reportDir: 'cypress/reports',
    reportFilename: reportName,
    html: true,
    json: true,
    overwrite: true
  }
});
