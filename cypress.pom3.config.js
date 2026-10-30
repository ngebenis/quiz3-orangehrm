// cypress.pom3.config.js
// Config untuk tugas 3 fitur (Login, Directory, Recruitment) dengan POM + intercept.
//
// Video SENGAJA aktif: tugas meminta video simulasi aplikasi, jadi setiap spec
// direkam. Report dipisah per spec lewat script npm (--config reportFilename).
const baseConfig = require('./cypress.config.base.js');

module.exports = {
  e2e: {
    ...baseConfig('report-pom3'),
    specPattern: 'cypress/e2e/pom3/**/*.cy.js',
    video: true,
    videoCompression: 32,
    screenshotOnRunFailure: true,
    // 3 spec berurutan ke demo publik: beri ruang lebih
    pageLoadTimeout: 120000,
    // Halaman Directory/Recruitment memuat banyak kartu + tabel; renderer
    // Electron sempat crash karena memori. Dua opsi ini membatasi memori
    // yang ditahan Cypress antar test.
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 0
  }
};
