// cypress/pages/RecruitmentPage.js
// Page Object untuk fitur Recruitment (tab Candidates dan Vacancies).
//
// Semua locator, action, dan assertion halaman Recruitment ada di sini.
import {
  recruitmentUrls,
  recruitmentTexts,
  recruitmentLabels,
  candidateColumns,
  vacancyColumns,
  nonExistentCandidate
} from '../support/data/recruitmentData';

export class RecruitmentPage {
  // ---------- Locators ----------
  elements = {
    pageHeader: () => cy.get('.oxd-topbar-header-breadcrumb-module'),
    tabCandidates: () => cy.contains('.oxd-topbar-body-nav-tab-item', recruitmentTexts.tabCandidates),
    tabVacancies: () => cy.contains('.oxd-topbar-body-nav-tab-item', recruitmentTexts.tabVacancies),
    addButton: () => cy.contains('button', recruitmentTexts.addButton),
    searchButton: () => cy.contains('button[type="submit"]', recruitmentTexts.searchButton),
    resetButton: () => cy.contains('button[type="reset"]', recruitmentTexts.resetButton),
    tableRows: () => cy.get('.oxd-table-body .oxd-table-row'),
    tableHeaders: () => cy.get('.oxd-table-header .oxd-table-th'),
    recordsText: () => cy.contains(/\(\d+\)\s+Records?\s+Found/i),
    candidateNameInput: () =>
      cy.contains('.oxd-input-group', recruitmentLabels.candidateName).find('input'),
    keywordsInput: () => cy.get('input[placeholder="Enter comma seperated words..."]'),
    firstNameInput: () => cy.get('input[name="firstName"]'),
    middleNameInput: () => cy.get('input[name="middleName"]'),
    lastNameInput: () => cy.get('input[name="lastName"]'),
    saveButton: () => cy.contains('button[type="submit"]', recruitmentTexts.saveButton),
    cancelButton: () => cy.contains('button', recruitmentTexts.cancelButton),
    requiredMark: () => cy.contains(recruitmentTexts.requiredMark),
    toasts: () => cy.get('.oxd-toast')
  };

  // ---------- Actions ----------
  visitCandidates() {
    cy.visit(recruitmentUrls.candidates);
    return this;
  }

  visitVacancies() {
    cy.visit(recruitmentUrls.vacancies);
    return this;
  }

  visitAddCandidate() {
    cy.visit(recruitmentUrls.addCandidate);
    return this;
  }

  openCandidatesTab() {
    this.elements.tabCandidates().click();
    return this;
  }

  openVacanciesTab() {
    this.elements.tabVacancies().click();
    return this;
  }

  clickAdd() {
    this.elements.addButton().click();
    return this;
  }

  searchCandidateByName(name) {
    this.elements.candidateNameInput().clear().type(name);
    cy.get('.oxd-autocomplete-option', { timeout: 15000 }).should('have.length.at.least', 1);
    cy.get('.oxd-autocomplete-option').first().click();
    return this;
  }

  searchWithoutFilter() {
    this.elements.searchButton().click();
    return this;
  }

  searchNonExistentCandidate() {
    this.elements.candidateNameInput().clear().type(nonExistentCandidate);
    this.elements.searchButton().click();
    return this;
  }

  clickReset() {
    this.elements.resetButton().click();
    return this;
  }

  fillCandidateName({ firstName, middleName, lastName }) {
    if (firstName) this.elements.firstNameInput().clear().type(firstName);
    if (middleName) this.elements.middleNameInput().clear().type(middleName);
    if (lastName) this.elements.lastNameInput().clear().type(lastName);
    return this;
  }

  clickSave() {
    this.elements.saveButton().click();
    return this;
  }

  clickCancel() {
    this.elements.cancelButton().click();
    return this;
  }

  selectVacancyByIndex(index = 1) {
    cy.contains('.oxd-input-group', recruitmentLabels.vacancy).find('.oxd-select-text').click();
    cy.get('.oxd-select-option').eq(index).click();
    return this;
  }

  // ---------- Assertions ----------
  verifyCandidatesPage() {
    this.elements.pageHeader().should('be.visible').and('contain.text', recruitmentTexts.pageHeader);
    cy.url().should('include', recruitmentUrls.candidates);
    this.elements.tabCandidates().should('be.visible');
    this.elements.tabVacancies().should('be.visible');
    return this;
  }

  verifyVacanciesPage() {
    cy.url().should('include', recruitmentUrls.vacancies);
    this.elements.tabVacancies().should('be.visible');
    return this;
  }

  verifyAddCandidatePage() {
    cy.url().should('include', recruitmentUrls.addCandidate);
    cy.contains(recruitmentTexts.addCandidateTitle).should('be.visible');
    return this;
  }

  verifyCandidateTableHeaders() {
    candidateColumns.forEach((col) => {
      this.elements.tableHeaders().should('contain.text', col);
    });
    return this;
  }

  verifyVacancyTableHeaders() {
    vacancyColumns.forEach((col) => {
      this.elements.tableHeaders().should('contain.text', col);
    });
    return this;
  }

  verifyTableHasRows() {
    this.elements.tableRows().should('have.length.at.least', 1);
    return this;
  }

  verifyRecordsCountVisible() {
    this.elements.recordsText().should('be.visible');
    return this;
  }

  verifyNoRecords() {
    cy.contains(recruitmentTexts.noRecords).should('be.visible');
    return this;
  }

  verifyAddCandidateFormFields() {
    this.elements.firstNameInput().should('be.visible');
    this.elements.lastNameInput().should('be.visible');
    cy.contains('.oxd-label', recruitmentLabels.email).should('be.visible');
    cy.contains('.oxd-label', recruitmentLabels.contactNumber).should('be.visible');
    cy.contains('.oxd-label', recruitmentLabels.resume).should('be.visible');
    this.elements.requiredMark().should('be.visible');
    return this;
  }

  verifyRequiredFieldErrors(minCount = 1) {
    cy.get('.oxd-input-field-error-message').should('have.length.at.least', minCount);
    return this;
  }

  verifyValueInSearchField(expectedValue) {
    this.elements.candidateNameInput().should('have.value', expectedValue);
    return this;
  }

  verifyFiltersCleared() {
    this.elements.keywordsInput().should('have.value', '');
    return this;
  }

  verifyCopyright() {
    cy.contains('OrangeHRM OS').should('be.visible');
    return this;
  }
}
