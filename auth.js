const API_BASE = 'http://localhost:5000/api/auth';

class Auth {
    static showAlert(message, type = 'error') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        const container = document.querySelector('.auth-container');
        container.insertBefore(alertDiv, container.firstChild);
        
        setTimeout(() => alertDiv.remove(), 5000);
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePassword(password) {
        return password.length >= 6;
    }

    static checkPasswordStrength(password) {
        if (password.length === 0) return '';
        if (password.length < 6) return 'weak';
        if (password.length < 8) return 'medium';
        return 'strong';
    }

    static async register(userData) {
        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async login(loginData) {
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }

    static isLoggedIn() {
        return !!localStorage.getItem('token');
    }

    static async getCurrentUser() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;

            const response = await fetch(`${API_BASE}/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get user data');
            }

            return await response.json();
        } catch (error) {
            this.logout();
            return null;
        }
    }
}

if (window.location.pathname.includes('register.html') || window.location.pathname === '/register.html') {
    document.addEventListener('DOMContentLoaded', function() {
        const registerForm = document.getElementById('registerForm');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm_password');
        const passwordStrength = document.getElementById('passwordStrength');

        passwordInput.addEventListener('input', function() {
            const strength = Auth.checkPasswordStrength(this.value);
            passwordStrength.textContent = strength ? `Password strength: ${strength}` : '';
            passwordStrength.className = `password-strength strength-${strength}`;
        });

        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const userData = {
                full_name: formData.get('full_name'),
                email: formData.get('email'),
                username: formData.get('username'),
                password: formData.get('password'),
                confirm_password: formData.get('confirm_password')
            };

            if (!Auth.validateEmail(userData.email)) {
                Auth.showAlert('Please enter a valid email address');
                return;
            }

            if (!Auth.validatePassword(userData.password)) {
                Auth.showAlert('Password must be at least 6 characters long');
                return;
            }

            if (userData.password !== userData.confirm_password) {
                Auth.showAlert('Passwords do not match');
                return;
            }

            try {
                const result = await Auth.register(userData);
                Auth.showAlert('Registration successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } catch (error) {
                Auth.showAlert(error.message);
            }
        });
    });
}

if (window.location.pathname.includes('login.html') || window.location.pathname === '/login.html') {
    document.addEventListener('DOMContentLoaded', function() {
        const loginForm = document.getElementById('loginForm');

        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const loginData = {
                login: formData.get('login'),
                password: formData.get('password')
            };

            try {
                const result = await Auth.login(loginData);
                Auth.showAlert('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } catch (error) {
                Auth.showAlert(error.message);
            }
        });
    });
}

if (window.location.pathname.includes('dashboard.html') || window.location.pathname === '/dashboard.html') {
    document.addEventListener('DOMContentLoaded', async function() {
        if (!Auth.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const userData = await Auth.getCurrentUser();
            if (userData) {
                document.getElementById('userFullName').textContent = userData.data.user.full_name;
                document.getElementById('userEmail').textContent = userData.data.user.email;
                document.getElementById('userUsername').textContent = userData.data.user.username;
                document.getElementById('userCreatedAt').textContent = new Date(userData.data.user.created_at).toLocaleDateString();
            }
        } catch (error) {
            Auth.showAlert('Failed to load user data');
        }

        document.getElementById('logoutBtn').addEventListener('click', function() {
            Auth.logout();
        });
    });
}