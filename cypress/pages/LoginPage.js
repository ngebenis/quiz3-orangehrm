// cypress/pages/LoginPage.js
export class LoginPage {
    
    // Locators
    elements = {
        usernameInput: () => cy.get('input[name="username"]'),
        passwordInput: () => cy.get('input[name="password"]'),
        loginButton: () => cy.get('button[type="submit"]'),
        forgotPasswordLink: () => cy.contains('Forgot your password?'),
        loginErrorAlert: () => cy.get('.oxd-alert-content-text'),
        fieldErrors: () => cy.get('.oxd-input-field-error-message'),
        loginForm: () => cy.get('.orangehrm-login-form'),
        companyLogo: () => cy.get('.orangehrm-login-logo'),
        copyrightText: () => cy.get('.orangehrm-login-footer')
    }

    /**
     * Navigate to login page
     */
    visit() {
        cy.visit('/web/index.php/auth/login');
        return this;
    }

    /**
     * Fill username
     * @param {string} username
     */
    fillUsername(username) {
        this.elements.usernameInput().clear();
        if (username) {
            this.elements.usernameInput().type(username);
        }
        return this;
    }

    /**
     * Fill password
     * @param {string} password
     */
    fillPassword(password) {
        this.elements.passwordInput().clear();
        if (password) {
            this.elements.passwordInput().type(password);
        }
        return this;
    }

    /**
     * Click login button
     */
    clickLogin() {
        this.elements.loginButton().click();
        return this;
    }

    /**
     * Perform login with given credentials
     * @param {string} username
     * @param {string} password
     */
    login(username, password) {
        this.visit();
        this.fillUsername(username);
        this.fillPassword(password);
        this.clickLogin();
        return this;
    }

    /**
     * Verify login page is displayed
     */
    verifyLoginPage() {
        this.elements.loginForm().should('be.visible');
        this.elements.companyLogo().should('be.visible');
        return this;
    }

    /**
     * Verify error message contains text
     * @param {string} expectedText
     */
    verifyErrorMessage(expectedText) {
        this.elements.loginErrorAlert()
            .should('be.visible')
            .and('contain.text', expectedText);
        return this;
    }

    /**
     * Submit empty form to trigger browser/native required validation
     */
    submitEmpty() {
        this.clickLogin();
        return this;
    }

    /**
     * Verify inline "Required" field errors are shown
     * @param {number} count expected number of error messages
     */
    verifyFieldRequired(count = 2) {
        this.elements.fieldErrors()
            .should('have.length', count)
            .each(($el) => cy.wrap($el).should('have.text', 'Required'));
        return this;
    }

    /**
     * Verify we stayed on the login page (login rejected)
     */
    verifyStillOnLogin() {
        cy.url().should('include', '/auth/login');
        this.elements.loginForm().should('be.visible');
        return this;
    }

    /**
     * Verify copyright text is present
     */
    verifyCopyright() {
        this.elements.copyrightText()
            .should('contain.text', 'OrangeHRM OS')
            .and('be.visible');
        return this;
    }

    /**
     * Click forgot password link
     */
    clickForgotPassword() {
        this.elements.forgotPasswordLink().click();
        return this;
    }

    /**
     * Verify forgot password page is displayed
     */
    verifyForgotPasswordPage() {
        cy.get('.orangehrm-forgot-password-title')
            .should('contain.text', 'Reset Password');
        return this;
    }

    /**
     * Clear login form
     */
    clearForm() {
        this.elements.usernameInput().clear();
        this.elements.passwordInput().clear();
        return this;
    }
}
