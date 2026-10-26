const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://opensource-demo.orangehrmlive.com',
    specPattern: 'cypress/e2e/**/*.cy.js',
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    video: true,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 1,
      openMode: 0
    },
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports',
      // Nama file report bisa diganti per-spec lewat env REPORT_NAME
      // (lihat script test:login / test:intercept di package.json).
      reportFilename: process.env.REPORT_NAME || 'report-login',
      html: true,
      json: true,
      overwrite: true
    }
  }
});
