const Auth = {
    init: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }

        const userTypeBtns = document.querySelectorAll('.user-type-btn');
        userTypeBtns.forEach(btn => {
            btn.addEventListener('click', this.handleUserTypeChange.bind(this));
        });

        document.getElementById('goToRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            App.showSection('register');
        });

        document.getElementById('goToLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            App.showSection('login');
        });
    },

    handleUserTypeChange: function(e) {
        const buttons = document.querySelectorAll('.user-type-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        const userType = e.target.getAttribute('data-user-type');
        this.toggleUserTypeFields(userType);
    },

    toggleUserTypeFields: function(userType) {
        const studentFields = document.getElementById('studentFields');
        const teacherFields = document.getElementById('teacherFields');

        if (userType === 'student') {
            Utils.showElement(studentFields);
            Utils.hideElement(teacherFields);
            
            document.getElementById('studentId').required = true;
            document.getElementById('teacherId').required = false;
            document.getElementById('department').required = false;
        } else {
            Utils.hideElement(studentFields);
            Utils.showElement(teacherFields);
            
            document.getElementById('studentId').required = false;
            document.getElementById('teacherId').required = true;
            document.getElementById('department').required = true;
        }
    },

    handleLogin: async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const userType = document.querySelector('.user-type-btn.active').getAttribute('data-user-type');
        const loginBtn = document.getElementById('loginBtn');

        Utils.setLoading(loginBtn, true, 'Logging in...');

        try {
            const response = await fetch(`${Utils.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, type: userType })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                
                Utils.showToast('Success', data.message, 'success');
                App.showSection('dashboard');
            } else {
                Utils.showToast('Error', data.message, 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            Utils.showToast('Error', 'Login failed. Please check your connection and try again.', 'danger');
        } finally {
            Utils.setLoading(loginBtn, false);
        }
    },

    handleRegister: async function(e) {
        e.preventDefault();
        
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            type: document.querySelector('.user-type-btn.active').getAttribute('data-user-type')
        };

        if (formData.password !== formData.confirmPassword) {
            Utils.showToast('Error', 'Passwords do not match!', 'danger');
            return;
        }

        if (formData.password.length < 6) {
            Utils.showToast('Error', 'Password must be at least 6 characters long!', 'danger');
            return;
        }

        if (formData.type === 'student') {
            formData.studentId = document.getElementById('studentId').value;
            if (!formData.studentId) {
                Utils.showToast('Error', 'Student ID is required!', 'danger');
                return;
            }
        } else {
            formData.teacherId = document.getElementById('teacherId').value;
            formData.department = document.getElementById('department').value;
            if (!formData.teacherId || !formData.department) {
                Utils.showToast('Error', 'Teacher ID and Department are required!', 'danger');
                return;
            }
        }

        const registerBtn = document.getElementById('registerBtn');
        Utils.setLoading(registerBtn, true, 'Registering...');

        try {
            const response = await fetch(`${Utils.API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                Utils.showToast('Success', data.message, 'success');
                
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                App.showSection('dashboard');
            } else {
                Utils.showToast('Error', data.message, 'danger');
            }
        } catch (error) {
            console.error('Registration error:', error);
            Utils.showToast('Error', 'Registration failed. Please check your connection and try again.', 'danger');
        } finally {
            Utils.setLoading(registerBtn, false);
        }
    },

    logout: function() {
        if (Chat.socket) {
            Chat.socket.disconnect();
        }
        
        Utils.clearUserData();
        Utils.showToast('Success', 'Logged out successfully!', 'success');
        App.showSection('home');
    }
};