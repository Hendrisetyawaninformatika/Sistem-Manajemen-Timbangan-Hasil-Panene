/**
 * ============================================
 * Main Application Script
 * Sistem Manajemen Timbangan Hasil Panen
 * ============================================
 */

// ============================================
// Loading Screen - HIDE AFTER PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen after page loads
    setTimeout(function() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            // Force display none after transition
            setTimeout(function() {
                loadingScreen.style.display = 'none';
            }, 600);
        }
    }, 1000);

    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50
        });
    }

    // Initialize dark mode
    initDarkMode();

    // Initialize sidebar toggle
    initSidebar();

    // Initialize logout
    initLogout();

    // Initialize counter animation
    animateCounters();

    // Auto-hide alerts
    autoHideAlerts();

    // Set current date in welcome banner
    setCurrentDate();

    // Get current user
    updateUserInfo();
});

// ============================================
// Set Current Date
// ============================================
function setCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('id-ID', options);
    }
}

// ============================================
// Update User Info
// ============================================
function updateUserInfo() {
    const user = getCurrentUser();
    if (user) {
        const nameElements = document.querySelectorAll('#userNameDisplay, #welcomeName');
        nameElements.forEach(el => {
            if (el) el.textContent = user.name || 'Admin';
        });
        
        const initialElements = document.querySelectorAll('#userInitial');
        initialElements.forEach(el => {
            if (el) el.textContent = (user.name || 'A').charAt(0).toUpperCase();
        });
    }
}

// ============================================
// Dark Mode Toggle
// ============================================
function initDarkMode() {
    const toggleBtn = document.getElementById('darkModeToggle');
    if (!toggleBtn) return;

    // Check stored preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        toggleBtn.innerHTML = '<i class="bi bi-sun fs-5"></i>';
    }

    toggleBtn.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        this.innerHTML = isDark ? '<i class="bi bi-sun fs-5"></i>' : '<i class="bi bi-moon fs-5"></i>';
        
        // Re-render charts if they exist
        if (window.revenueChart) {
            window.revenueChart.destroy();
            window.revenueChart = null;
        }
        if (window.distributionChart) {
            window.distributionChart.destroy();
            window.distributionChart = null;
        }
        if (window.reportChart) {
            window.reportChart.destroy();
            window.reportChart = null;
        }
        
        // Reload dashboard data if on dashboard page
        if (document.getElementById('revenueChart')) {
            loadDashboardData();
        }
    });
}

// ============================================
// Sidebar Toggle
// ============================================
function initSidebar() {
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    const overlay = document.getElementById('sidebarOverlay');

    if (!toggleBtn || !sidebar) return;

    // Desktop toggle
    toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (window.innerWidth > 992) {
            sidebar.classList.toggle('collapsed');
            if (mainContent) {
                mainContent.classList.toggle('expanded');
            }
        } else {
            sidebar.classList.toggle('active');
            if (overlay) {
                overlay.classList.toggle('active');
            }
        }
    });

    // Close sidebar on overlay click (mobile)
    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Close sidebar on window resize to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            if (overlay) {
                overlay.classList.remove('active');
            }
        }
    });
}

// ============================================
// Logout Functionality
// ============================================
function initLogout() {
    const logoutBtns = [
        document.getElementById('logoutBtn'),
        document.getElementById('logoutDropdown')
    ];

    logoutBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Konfirmasi Logout',
                        text: 'Apakah Anda yakin ingin logout?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#dc3545',
                        cancelButtonColor: '#6c757d',
                        confirmButtonText: 'Ya, Logout!',
                        cancelButtonText: 'Batal'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            logout();
                        }
                    });
                } else {
                    logout();
                }
            });
        }
    });
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
        try {
            return JSON.parse(userData);
        } catch (e) {
            return null;
        }
    }
    return null;
}
window.getCurrentUser = getCurrentUser;

// ============================================
// Counter Animation
// ============================================
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        if (isNaN(target)) return;
        
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        let animationId = null;
        
        const updateCounter = () => {
            current += increment;
            if (current >= target) {
                counter.textContent = target + (target > 100 ? '+' : '%');
                return;
            }
            counter.textContent = Math.floor(current);
            animationId = requestAnimationFrame(updateCounter);
        };
        
        // Start animation when element is in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

// ============================================
// Auto-hide Alerts
// ============================================
function autoHideAlerts() {
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s ease';
            alert.style.opacity = '0';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 500);
        }, 5000);
    });
}

// ============================================
// Show Alert Function
// ============================================
function showAlert(message, type = 'success', containerId = 'alertContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.style.animation = 'slideDown 0.4s ease';
    
    const iconMap = {
        success: 'bi-check-circle-fill',
        danger: 'bi-exclamation-triangle-fill',
        warning: 'bi-exclamation-circle-fill',
        info: 'bi-info-circle-fill'
    };
    
    alertDiv.innerHTML = `
        <i class="bi ${iconMap[type] || 'bi-info-circle-fill'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    container.appendChild(alertDiv);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.style.transition = 'opacity 0.5s ease';
            alertDiv.style.opacity = '0';
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 500);
        }
    }, 5000);
}
window.showAlert = showAlert;

// ============================================
// Form Validation Helper
// ============================================
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;
    
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}
window.validateForm = validateForm;

// ============================================
// Refresh Table Function
// ============================================
function refreshTable() {
    const currentPage = window.location.pathname;
    if (currentPage.includes('farmers.html')) {
        loadFarmers();
    } else if (currentPage.includes('products.html')) {
        loadProducts();
    } else if (currentPage.includes('transactions.html')) {
        loadTransactions();
    }
    showAlert('Data berhasil diperbarui', 'success');
}
window.refreshTable = refreshTable;

// ============================================
// Export Functions (placeholder)
// ============================================
function exportFarmersExcel() {
    showAlert('Fitur export Excel sedang dalam pengembangan', 'info');
}
window.exportFarmersExcel = exportFarmersExcel;

function exportFarmersPDF() {
    showAlert('Fitur export PDF sedang dalam pengembangan', 'info');
}
window.exportFarmersPDF = exportFarmersPDF;

function exportProductsExcel() {
    showAlert('Fitur export Excel sedang dalam pengembangan', 'info');
}
window.exportProductsExcel = exportProductsExcel;

function exportProductsPDF() {
    showAlert('Fitur export PDF sedang dalam pengembangan', 'info');
}
window.exportProductsPDF = exportProductsPDF;

function exportTransactionsExcel() {
    showAlert('Fitur export Excel sedang dalam pengembangan', 'info');
}
window.exportTransactionsExcel = exportTransactionsExcel;

function exportTransactionsPDF() {
    showAlert('Fitur export PDF sedang dalam pengembangan', 'info');
}
window.exportTransactionsPDF = exportTransactionsPDF;

// ============================================
// Initialize AOS
// ============================================
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 800,
        once: true,
        offset: 50
    });
}

console.log('✅ Sistem Manajemen Timbangan Hasil Panen loaded successfully');