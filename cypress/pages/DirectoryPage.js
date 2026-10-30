// cypress/pages/DirectoryPage.js
// Page Object untuk fitur Directory.
//
// Semua locator, action, dan assertion terkait halaman Directory ada di sini.
// Spec tidak boleh menyentuh selector langsung — cukup memanggil method.
import {
  directoryUrls,
  directoryEndpoints,
  directoryTexts,
  directoryLabels,
  recordsPerPage,
  nonExistentEmployee
} from '../support/data/directoryData';

export class DirectoryPage {
  // ---------- Locators ----------
  elements = {
    pageHeader: () => cy.get('.oxd-topbar-header-breadcrumb-module'),
    employeeNameInput: () =>
      cy.get('.oxd-autocomplete-text-input input[placeholder="Type for hints..."]'),
    jobTitleDropdown: () => cy.contains('.oxd-input-group', directoryLabels.jobTitle),
    locationDropdown: () => cy.contains('.oxd-input-group', directoryLabels.location),
    autocompleteOptions: (options) => cy.get('.oxd-autocomplete-option', options),

  searchButton: () => cy.contains('button[type="submit"]', directoryTexts.searchButton),
    resetButton: () => cy.contains('button[type="reset"]', directoryTexts.resetButton),
    recordsText: () => cy.contains(/\(\d+\)\s+Records?\s+Found/i),
    cards: (options) => cy.get('.orangehrm-directory-card', options),
    cardNames: () => cy.get('.orangehrm-directory-card-header'),
    autocompleteOption: () => cy.get('.oxd-autocomplete-option'),
    formGroup: () => cy.get('.oxd-input-group')
  };

  // ---------- Actions ----------
  visit() {
    cy.visit(directoryUrls.view);
    return this;
  }

  /**
   * Tunggu kartu karyawan ter-render.
   * Demo publik kadang butuh >10 detik untuk memuat 14 kartu, jadi timeout
   * bawaan dinaikkan (bisa diatur per pemanggilan).
   */
  waitForLoad(timeout = 60000) {
    this.elements.cards({ timeout }).should('have.length.at.least', 1);
    return this;
  }

  searchByEmployeeName(name) {
    this.elements
      .employeeNameInput()
      .clear()
      .type(name);
    // Autocomplete butuh waktu memuat saran; tunggu sampai muncul
    cy.get('.oxd-autocomplete-option', { timeout: 15000 }).should('have.length.at.least', 1);
    this.elements.autocompleteOption().first().click();
    return this;
  }

  searchWithoutFilter() {
    this.elements.searchButton().click();
    return this;
  }

  clickReset() {
    this.elements.resetButton().click();
    return this;
  }

  selectDropdownByLabel(label, optionText) {
    cy.contains('.oxd-input-group', label).find('.oxd-select-text').click();
    cy.contains('.oxd-select-option', optionText).click();
    return this;
  }

  /**
   * Search dengan nama yang dijamin tidak ada, untuk menguji empty state.
   */
  searchNonExistent() {
    this.elements.employeeNameInput().clear().type(nonExistentEmployee);
    this.elements.searchButton().click();
    return this;
  }

  // ---------- Assertions ----------
  verifyPage() {
    this.elements.pageHeader().should('be.visible').and('contain.text', directoryTexts.pageHeader);
    cy.url().should('include', directoryUrls.view);
    return this;
  }

  verifyFilterFieldsPresent() {
    cy.contains('.oxd-label', directoryLabels.employeeName).should('be.visible');
    cy.contains('.oxd-label', directoryLabels.jobTitle).should('be.visible');
    cy.contains('.oxd-label', directoryLabels.location).should('be.visible');
    return this;
  }

  verifyCardsVisible() {
    this.elements.cards().should('have.length.at.least', 1);
    this.elements.cards().first().should('be.visible');
    return this;
  }

  verifyRecordsCount() {
    this.elements.recordsText().should('be.visible');
    return this;
  }

  verifyHasEmployeeCards(count = recordsPerPage) {
    this.elements.cards().should('have.length', count);
    return this;
  }

  verifyNoRecords() {
    cy.contains(directoryTexts.noRecords).should('be.visible');
    return this;
  }

  verifySearchResultContains(name) {
    this.elements.recordsText().should('be.visible');
    this.elements.cardNames().should('contain.text', name);
    return this;
  }

  verifyFiltersCleared() {
    this.elements.employeeNameInput().should('have.value', '');
    return this;
  }

  verifyCopyright() {
    cy.contains('OrangeHRM OS').should('be.visible');
    return this;
  }
}
