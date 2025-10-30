// Main application controller
const App = {
    init: function() {
        console.log('🚀 EduPortal App Initializing...');
        this.bindNavigationEvents();
        this.checkAuthStatus();
        Auth.init();
        
        // Initialize chat if user is already logged in
        if (Utils.isLoggedIn()) {
            console.log('User is logged in, initializing chat...');
            setTimeout(() => {
                if (typeof Chat !== 'undefined') {
                    Chat.init();
                }
            }, 1000);
        }
    },

    bindNavigationEvents: function() {
        console.log('Binding navigation events...');
        
        // Navigation links
        const homeLink = document.getElementById('homeLink');
        const loginLink = document.getElementById('loginLink');
        const registerLink = document.getElementById('registerLink');
        const dashboardLink = document.getElementById('dashboardLink');
        const logoutLink = document.getElementById('logoutLink');

        if (homeLink) {
            homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection('home');
            });
        }

        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection('login');
            });
        }

        if (registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection('register');
            });
        }

        if (dashboardLink) {
            dashboardLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection('dashboard');
            });
        }

        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                Auth.logout();
            });
        }

        // Get Started button
        const getStartedBtn = document.getElementById('getStartedBtn');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => {
                this.showSection('login');
            });
        }

        // Student/Teacher register buttons
        const studentRegisterBtn = document.getElementById('studentRegisterBtn');
        if (studentRegisterBtn) {
            studentRegisterBtn.addEventListener('click', () => {
                this.showSection('register');
                // Activate student tab after a short delay to ensure DOM is ready
                setTimeout(() => {
                    const studentBtn = document.querySelector('.user-type-btn[data-user-type="student"]');
                    if (studentBtn) studentBtn.click();
                }, 100);
            });
        }

        const teacherRegisterBtn = document.getElementById('teacherRegisterBtn');
        if (teacherRegisterBtn) {
            teacherRegisterBtn.addEventListener('click', () => {
                this.showSection('register');
                // Activate teacher tab after a short delay to ensure DOM is ready
                setTimeout(() => {
                    const teacherBtn = document.querySelector('.user-type-btn[data-user-type="teacher"]');
                    if (teacherBtn) teacherBtn.click();
                }, 100);
            });
        }

        console.log('Navigation events bound successfully');
    },

    checkAuthStatus: function() {
        const isLoggedIn = Utils.isLoggedIn();
        console.log('Auth status check - Logged in:', isLoggedIn);
        
        if (isLoggedIn) {
            this.showSection('dashboard');
        } else {
            this.showSection('home');
        }
    },

    showSection: function(sectionName) {
        console.log('Showing section:', sectionName);
        
        // Hide all sections
        const sections = ['homeSection', 'loginSection', 'registerSection', 'dashboardSection'];
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                Utils.hideElement(element);
            }
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName + 'Section');
        if (targetSection) {
            Utils.showElement(targetSection);
        } else {
            console.error('Target section not found:', sectionName + 'Section');
        }

        // Update navigation
        this.updateNavigation(sectionName);

        // Initialize section-specific functionality
        this.initializeSection(sectionName);
    },

    updateNavigation: function(sectionName) {
        const isLoggedIn = Utils.isLoggedIn();
        console.log('Updating navigation - Logged in:', isLoggedIn, 'Section:', sectionName);

        const homeLink = document.getElementById('homeLink');
        const loginLink = document.getElementById('loginLink');
        const registerLink = document.getElementById('registerLink');
        const dashboardLink = document.getElementById('dashboardLink');
        const logoutLink = document.getElementById('logoutLink');
        const floatingChatBtn = document.getElementById('floatingChatBtn');

        if (isLoggedIn) {
            // User is logged in
            if (homeLink) homeLink.style.display = 'block';
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (dashboardLink) dashboardLink.style.display = 'block';
            if (logoutLink) logoutLink.style.display = 'block';
            
            // Show floating chat button only on dashboard
            if (floatingChatBtn) {
                if (sectionName === 'dashboard') {
                    Utils.showElement(floatingChatBtn);
                } else {
                    Utils.hideElement(floatingChatBtn);
                }
            }
        } else {
            // User is not logged in
            if (homeLink) homeLink.style.display = 'block';
            if (loginLink) loginLink.style.display = 'block';
            if (registerLink) registerLink.style.display = 'block';
            if (dashboardLink) dashboardLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'none';
            
            // Hide floating chat button
            if (floatingChatBtn) {
                Utils.hideElement(floatingChatBtn);
            }
        }
    },

    initializeSection: function(sectionName) {
        console.log('Initializing section:', sectionName);
        
        switch (sectionName) {
            case 'dashboard':
                // Initialize dashboard with a small delay to ensure DOM is ready
                setTimeout(() => {
                    if (typeof Dashboard !== 'undefined') {
                        Dashboard.init();
                    } else {
                        console.error('Dashboard module not found');
                    }
                    
                    // Initialize chat when dashboard loads
                    setTimeout(() => {
                        if (typeof Chat !== 'undefined') {
                            Chat.init();
                            console.log('Chat system initialized for dashboard');
                        } else {
                            console.error('Chat module not found');
                        }
                    }, 500);
                }, 100);
                break;
                
            case 'login':
                // Reset login form
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    loginForm.reset();
                    // Set default user type to student
                    const studentBtn = document.querySelector('.user-type-btn[data-user-type="student"]');
                    if (studentBtn) studentBtn.click();
                }
                break;
                
            case 'register':
                // Reset register form
                const registerForm = document.getElementById('registerForm');
                if (registerForm) {
                    registerForm.reset();
                    // Set default user type to student
                    const studentBtn = document.querySelector('.user-type-btn[data-user-type="student"]');
                    if (studentBtn) studentBtn.click();
                }
                break;
                
            case 'home':
                // Any home section specific initialization
                console.log('Home section initialized');
                break;
        }
    }
};

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Content Loaded - Starting App...');
    App.init();
});

// Handle page refresh or navigation
window.addEventListener('beforeunload', function() {
    console.log('🔄 Page unloading, cleaning up...');
    if (typeof Chat !== 'undefined' && Chat.socket) {
        console.log('Disconnecting chat socket...');
        Chat.socket.disconnect();
    }
});

// Handle page visibility changes (tab switching)
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // Page became visible again, reinitialize if needed
        if (Utils.isLoggedIn() && typeof Chat !== 'undefined' && (!Chat.socket || !Chat.socket.connected)) {
            console.log('Page visible, reinitializing chat...');
            setTimeout(() => {
                Chat.init();
            }, 1000);
        }
    }
});
