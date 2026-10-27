// cypress/pages/DashboardPage.js
export class DashboardPage {
    
    // Locators
    elements = {
        dashboardHeader: () => cy.get('.oxd-topbar-header-breadcrumb-module'),
        userDropdown: () => cy.get('.oxd-userdropdown-tab'),
        logoutOption: () => cy.contains('Logout'),
        myActionsWidget: () => cy.get('.orangehrm-dashboard-widget'),
        leaveRequestsCount: () => cy.contains('Leave Requests to Approve').parent().find('.orangehrm-dashboard-widget-header'),
        timeAtWorkSection: () => cy.contains('Time at Work').parent(),
        quickLaunchSection: () => cy.contains('Quick Launch').parent(),
        dashboardGrid: () => cy.get('.orangehrm-dashboard-grid'),
        mainMenuItems: () => cy.get('.oxd-main-menu-item'),
        searchInput: () => cy.get('.oxd-input')
    }

    /**
     * Verify dashboard is displayed after login
     */
    verifyDashboard() {
        this.elements.dashboardHeader()
            .should('be.visible')
            .and('contain.text', 'Dashboard');
        this.elements.myActionsWidget().should('be.visible');
        return this;
    }

    /**
     * Get welcome message text
     * @returns {Cypress.Chainable<string>}
     */
    getWelcomeMessage() {
        return this.elements.dashboardHeader().invoke('text');
    }

    /**
     * Open user dropdown
     */
    openUserDropdown() {
        this.elements.userDropdown().click();
        return this;
    }

    /**
     * Perform logout
     */
    logout() {
        this.openUserDropdown();
        this.elements.logoutOption().click();
        return this;
    }

    /**
     * Verify logout successful
     */
    verifyLogout() {
        cy.url().should('include', '/auth/login');
        return new LoginPage().verifyLoginPage();
    }

    /**
     * Navigate to menu by name
     * @param {string} menuName
     */
    navigateToMenu(menuName) {
        this.elements.mainMenuItems()
            .contains(menuName)
            .click();
        return this;
    }

    /**
     * Verify leave requests count
     * @param {number} expectedCount
     */
    verifyLeaveRequestsCount(expectedCount) {
        this.elements.leaveRequestsCount()
            .should('contain.text', `(${expectedCount})`);
        return this;
    }

    /**
     * Verify quick launch buttons are present
     */
    verifyQuickLaunch() {
        cy.contains('Quick Launch').should('be.visible');
        cy.contains('Assign Leave').should('be.visible');
        cy.contains('Leave List').should('be.visible');
        cy.contains('Timesheets').should('be.visible');
        return this;
    }

    /**
     * Search in dashboard
     * @param {string} searchTerm
     */
    search(searchTerm) {
        this.elements.searchInput().type(searchTerm);
        return this;
    }

    /**
     * Count visible widgets
     * @returns {Cypress.Chainable<number>}
     */
    countWidgets() {
        return this.elements.dashboardGrid().children().its('length');
    }
}
