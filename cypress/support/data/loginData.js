// cypress/support/data/loginData.js
export const loginData = {
    // Valid credentials
    valid: {
        username: 'Admin',
        password: 'admin123'
    },
    
    // Invalid credentials
    invalid: {
        username: 'InvalidUser',
        password: 'wrongpassword'
    },
    
    // Empty credentials
    empty: {
        username: '',
        password: ''
    },
    
    // Username only (empty password)
    usernameOnly: {
        username: 'Admin',
        password: ''
    },
    
    // Password only (empty username)
    passwordOnly: {
        username: '',
        password: 'admin123'
    },
    
    // Case sensitivity test
    caseSensitive: {
        username: 'ADMIN', // uppercase
        password: 'ADMIN123' // uppercase
    },
    
    // SQL injection attempt
    sqlInjection: {
        username: "' OR '1'='1",
        password: "' OR '1'='1"
    },
    
    // XSS attempt
    xssAttempt: {
        username: '<script>alert("xss")</script>',
        password: '<script>alert("xss")</script>'
    },
    
    // Very long input
    longInput: {
        username: 'a'.repeat(256),
        password: 'b'.repeat(256)
    },
    
    // Special characters
    specialChars: {
        username: 'test@email.com',
        password: 'P@ssw0rd!'
    },
    
    // Whitespace in username
    whitespaceUsername: {
        username: '  Admin  ',
        password: 'admin123'
    },
    
    // Whitespace in password
    whitespacePassword: {
        username: 'Admin',
        password: '  admin123  '
    }
}

export const errorMessages = {
    invalidCredentials: 'Invalid credentials',
    requiredUsername: 'Required',
    requiredPassword: 'Required'
}

export const pageTitles = {
    loginPage: 'OrangeHRM',
    dashboardPage: 'OrangeHRM'
}

export const urls = {
    login: '/web/index.php/auth/login',
    dashboard: '/web/index.php/dashboard/index',
    forgotPassword: '/web/index.php/auth/requestPasswordResetCode'
}
