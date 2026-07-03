/**
 * ============================================
 * Main Application Script
 * Sistem Manajemen Timbangan Hasil Panen
 * ============================================
 */

// ============================================
// Loading Screen
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen after page loads
    setTimeout(function() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 800);

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
});

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
                        // Clear session
                        localStorage.removeItem('user');
                        localStorage.removeItem('session');
                        // Redirect to login
                        window.location.href = 'login.html';
                    }
                });
            });
        }
    });
}

// ============================================
// Counter Animation
// ============================================
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current >= target) {
                counter.textContent = target + (target > 100 ? '+' : '%');
                return;
            }
            counter.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        };
        
        // Start animation when element is in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        
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
                alert.remove();
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
// Export Functions
// ============================================
function exportTableToExcel(tableId, filename = 'export') {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Data' });
    XLSX.writeFile(wb, `${filename}.xlsx`);
}
window.exportTableToExcel = exportTableToExcel;

function exportTableToPDF(tableId, filename = 'export') {
    const element = document.getElementById(tableId);
    if (!element) return;
    
    const opt = {
        margin: 10,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save();
}
window.exportTableToPDF = exportTableToPDF;