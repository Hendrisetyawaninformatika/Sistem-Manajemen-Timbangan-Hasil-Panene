/**
 * ============================================
 * Authentication Module
 * Sistem Manajemen Timbangan Hasil Panen
 * ============================================
 */

// ============================================
// Login Form Handler
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.innerHTML = type === 'password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
            }
        });
    }

    // Check if user already logged in
    checkAuth();
});

// ============================================
// Login Handler
// ============================================
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember')?.checked || false;

    // Validate form
    if (!email || !password) {
        showAlert('Silakan isi email dan password!', 'warning');
        return;
    }

    // Show loading
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Memproses...';
    submitBtn.disabled = true;

    try {
        // Find user by email
        const user = await db.users.findByEmail(email);

        if (!user) {
            showAlert('Email atau password salah!', 'danger');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        // Verify password (simple hash check - in production use bcrypt)
        // For demo, we'll use simple comparison
        const passwordMatch = await verifyPassword(password, user.password);

        if (!passwordMatch) {
            showAlert('Email atau password salah!', 'danger');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        // Store user session
        const sessionData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            loginTime: new Date().toISOString()
        };

        if (remember) {
            localStorage.setItem('user', JSON.stringify(sessionData));
            localStorage.setItem('session', 'true');
        } else {
            sessionStorage.setItem('user', JSON.stringify(sessionData));
            sessionStorage.setItem('session', 'true');
        }

        showAlert('Login berhasil! Selamat datang, ' + user.name, 'success');

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);
        showAlert('Terjadi kesalahan. Silakan coba lagi.', 'danger');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ============================================
// Register Handler
// ============================================
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirmation = document.getElementById('password_confirmation').value;
    const terms = document.getElementById('terms')?.checked || false;

    // Validate form
    if (!name || !email || !password || !passwordConfirmation) {
        showAlert('Silakan isi semua field!', 'warning');
        return;
    }

    if (password.length < 6) {
        showAlert('Password minimal 6 karakter!', 'warning');
        return;
    }

    if (password !== passwordConfirmation) {
        showAlert('Password dan konfirmasi password tidak sama!', 'warning');
        return;
    }

    if (!terms) {
        showAlert('Silakan setujui Syarat & Ketentuan!', 'warning');
        return;
    }

    // Show loading
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Mendaftar...';
    submitBtn.disabled = true;

    try {
        // Check if email already exists
        const existingUser = await db.users.findByEmail(email);
        if (existingUser) {
            showAlert('Email sudah terdaftar!', 'danger');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        // Create new user
        const hashedPassword = await hashPassword(password);
        const newUser = {
            id: generateUUID(),
            name: name,
            email: email,
            password: hashedPassword,
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const created = await db.users.create(newUser);

        // Auto login after registration
        const sessionData = {
            id: created.id,
            name: created.name,
            email: created.email,
            role: created.role,
            loginTime: new Date().toISOString()
        };

        sessionStorage.setItem('user', JSON.stringify(sessionData));
        sessionStorage.setItem('session', 'true');

        showAlert('Registrasi berhasil! Selamat datang, ' + created.name, 'success');

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        console.error('Register error:', error);
        showAlert('Terjadi kesalahan. Silakan coba lagi.', 'danger');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ============================================
// Check Authentication
// ============================================
function checkAuth() {
    // Check if on login/register page
    const isAuthPage = window.location.pathname.includes('login.html') || 
                       window.location.pathname.includes('register.html');

    // Get user from storage
    let user = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (user) {
        user = JSON.parse(user);
        // If on auth page, redirect to dashboard
        if (isAuthPage) {
            window.location.href = 'dashboard.html';
        }
        // Update user name display
        updateUserName(user.name);
    } else {
        // If not on auth page, redirect to login
        if (!isAuthPage && !window.location.pathname.includes('index.html')) {
            window.location.href = 'login.html';
        }
    }
}

// ============================================
// Update User Name in UI
// ============================================
function updateUserName(name) {
    const nameDisplay = document.getElementById('userNameDisplay');
    if (nameDisplay) {
        nameDisplay.textContent = name;
    }
}

// ============================================
// Password Helpers (for demo - use bcrypt in production)
// ============================================
async function hashPassword(password) {
    // Simple hash for demo - in production use bcrypt
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, hashedPassword) {
    const hash = await hashPassword(password);
    return hash === hashedPassword;
}

// ============================================
// Logout Function
// ============================================
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('session');
    window.location.href = 'login.html';
}
window.logout = logout;

// ============================================
// Get Current User
// ============================================
function getCurrentUser() {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
        return JSON.parse(userData);
    }
    return null;
}
window.getCurrentUser = getCurrentUser;