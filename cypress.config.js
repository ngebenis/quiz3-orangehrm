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
      reportFilename: 'quiz3-login',
      html: true,
      json: true,
      overwrite: true
    }
  }
});
