/**
 * ============================================
 * DASHBOARD MODULE
 * Sistem Manajemen Timbangan Hasil Panen
 * ============================================
 */

// Chart instances
let revenueChart = null;
let distributionChart = null;
let transactionsTable = null;

// ============================================
// 1. DASHBOARD INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Check if on dashboard page
    if (document.getElementById('revenueChart')) {
        // Initialize dashboard after loading screen hides
        setTimeout(function() {
            loadDashboardData();
        }, 500);
    }
});

// ============================================
// 2. LOAD DASHBOARD DATA
// ============================================
async function loadDashboardData() {
    try {
        // Show loading state on stats
        showStatsLoading();

        // Load all data in parallel
        const [farmers, products, transactions, todayRevenue, monthlyRevenue] = await Promise.all([
            getFarmersData(),
            getProductsData(),
            getTransactionsData(),
            getTodayRevenue(),
            getMonthlyRevenue()
        ]);

        // Update statistics
        updateStats(farmers, products, transactions, todayRevenue, monthlyRevenue);

        // Load charts
        await loadCharts(transactions);

        // Load recent transactions
        await loadRecentTransactions(transactions);

        // Update welcome message
        updateWelcomeMessage();

        // Hide loading state
        hideStatsLoading();

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('Gagal memuat data dashboard. Silakan refresh halaman.', 'danger');
        hideStatsLoading();
    }
}

// ============================================
// 3. GET DATA FUNCTIONS
// ============================================

async function getFarmersData() {
    try {
        if (window.FireDB && FireDB.farmers) {
            const data = await FireDB.farmers.getAll();
            return data || [];
        }
        // Demo data fallback
        return getDemoFarmers();
    } catch (error) {
        console.error('Error getting farmers:', error);
        return getDemoFarmers();
    }
}

async function getProductsData() {
    try {
        if (window.FireDB && FireDB.products) {
            const data = await FireDB.products.getAll();
            return data || [];
        }
        return getDemoProducts();
    } catch (error) {
        console.error('Error getting products:', error);
        return getDemoProducts();
    }
}

async function getTransactionsData() {
    try {
        if (window.FireDB && FireDB.transactions) {
            const data = await FireDB.transactions.getAll();
            return data || [];
        }
        return getDemoTransactions();
    } catch (error) {
        console.error('Error getting transactions:', error);
        return getDemoTransactions();
    }
}

async function getTodayRevenue() {
    try {
        const today = new Date().toISOString().split('T')[0];
        if (window.FireDB && FireDB.transactions) {
            const data = await FireDB.transactions.getDaily(today);
            let total = 0;
            data.forEach(t => { total += parseFloat(t.totalAmount || t.total_amount || 0); });
            return total;
        }
        // Demo: random revenue between 500k - 5M
        return Math.floor(Math.random() * 4500000) + 500000;
    } catch (error) {
        console.error('Error getting today revenue:', error);
        return Math.floor(Math.random() * 4500000) + 500000;
    }
}

async function getMonthlyRevenue() {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        if (window.FireDB && FireDB.transactions) {
            const data = await FireDB.transactions.getMonthly(month, year);
            let total = 0;
            data.forEach(t => { total += parseFloat(t.totalAmount || t.total_amount || 0); });
            return total;
        }
        return Math.floor(Math.random() * 50000000) + 10000000;
    } catch (error) {
        console.error('Error getting monthly revenue:', error);
        return Math.floor(Math.random() * 50000000) + 10000000;
    }
}

// ============================================
// 4. DEMO DATA (Fallback)
// ============================================

function getDemoFarmers() {
    return [
        { id: '1', name: 'Budi Pranoto', nik: '1234567890123456', phone: '081234567890', isActive: true },
        { id: '2', name: 'Siti Rahayu', nik: '2345678901234567', phone: '081234567891', isActive: true },
        { id: '3', name: 'Ahmad Hidayat', nik: '3456789012345678', phone: '081234567892', isActive: true },
        { id: '4', name: 'Dewi Sartika', nik: '4567890123456789', phone: '081234567893', isActive: false },
        { id: '5', name: 'Eko Prasetyo', nik: '5678901234567890', phone: '081234567894', isActive: true }
    ];
}

function getDemoProducts() {
    return [
        { id: '1', name: 'Padi', price_per_kg: 12000, unit: 'kg', isActive: true },
        { id: '2', name: 'Jagung', price_per_kg: 8000, unit: 'kg', isActive: true },
        { id: '3', name: 'Kedelai', price_per_kg: 10000, unit: 'kg', isActive: true },
        { id: '4', name: 'Cabai', price_per_kg: 25000, unit: 'kg', isActive: true },
        { id: '5', name: 'Bawang Merah', price_per_kg: 30000, unit: 'kg', isActive: false }
    ];
}

function getDemoTransactions() {
    const transactions = [];
    const farmers = getDemoFarmers();
    const products = getDemoProducts();
    const today = new Date();
    
    for (let i = 0; i < 50; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        const farmer = farmers[Math.floor(Math.random() * farmers.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        const grossWeight = Math.floor(Math.random() * 100) + 10;
        const tareWeight = Math.floor(Math.random() * 5);
        const netWeight = grossWeight - tareWeight;
        const totalAmount = netWeight * (product.price_per_kg || 10000);
        
        transactions.push({
            id: `T${String(i+1).padStart(4, '0')}`,
            transactionCode: `TRX${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}${String(Math.random().toString(36).substring(2, 6)).toUpperCase()}`,
            farmerId: farmer.id,
            farmerName: farmer.name,
            productId: product.id,
            productName: product.name,
            grossWeight: grossWeight,
            tareWeight: tareWeight,
            netWeight: netWeight,
            pricePerKg: product.price_per_kg || 10000,
            totalAmount: totalAmount,
            transactionDate: date.toISOString().split('T')[0],
            createdAt: date.toISOString()
        });
    }
    
    // Sort by date descending
    return transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ============================================
// 5. UPDATE STATISTICS
// ============================================

function updateStats(farmers, products, transactions, todayRevenue, monthlyRevenue) {
    // Update counts
    document.getElementById('totalFarmers').textContent = farmers.length || 0;
    document.getElementById('totalProducts').textContent = products.length || 0;
    document.getElementById('totalTransactions').textContent = transactions.length || 0;
    document.getElementById('todayRevenue').textContent = formatCurrency(todayRevenue || 0);
    
    // Update growth indicators (simulated)
    updateGrowthIndicators();
}

function updateGrowthIndicators() {
    const indicators = [
        { id: 'transactionGrowth', value: 12.5 },
        { id: 'farmersGrowth', value: 8.3 },
        { id: 'productsGrowth', value: 5.2 },
        { id: 'revenueGrowth', value: 15.7 }
    ];
    
    indicators.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
            const isPositive = item.value > 0;
            el.innerHTML = `
                <i class="bi bi-arrow-${isPositive ? 'up' : 'down'}"></i>
                ${Math.abs(item.value)}%
            `;
            el.className = isPositive ? 'text-success' : 'text-danger';
        }
    });
}

// ============================================
// 6. LOAD CHARTS
// ============================================

async function loadCharts(transactions) {
    try {
        // Get last 7 days data
        const chartData = getChartData(transactions);
        
        // Create revenue chart
        createRevenueChart(chartData);
        
        // Create distribution chart
        createDistributionChart(transactions);
        
    } catch (error) {
        console.error('Error loading charts:', error);
    }
}

function getChartData(transactions) {
    const labels = [];
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        labels.push(date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }));
        
        let total = 0;
        transactions.forEach(t => {
            if (t.transactionDate === dateStr) {
                total += parseFloat(t.totalAmount || t.total_amount || 0);
            }
        });
        data.push(total);
    }
    
    return { labels, data };
}

function createRevenueChart(data) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (revenueChart) {
        revenueChart.destroy();
        revenueChart = null;
    }

    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#e4e6eb' : '#212529';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Pendapatan (Rp)',
                data: data.data,
                backgroundColor: [
                    'rgba(13, 110, 253, 0.7)',
                    'rgba(13, 110, 253, 0.6)',
                    'rgba(13, 110, 253, 0.5)',
                    'rgba(13, 110, 253, 0.4)',
                    'rgba(13, 110, 253, 0.5)',
                    'rgba(13, 110, 253, 0.6)',
                    'rgba(13, 110, 253, 0.7)'
                ],
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Rp ' + new Intl.NumberFormat('id-ID').format(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            if (value >= 1000000) {
                                return 'Rp ' + (value / 1000000) + 'jt';
                            } else if (value >= 1000) {
                                return 'Rp ' + (value / 1000) + 'k';
                            }
                            return 'Rp ' + value;
                        }
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

function createDistributionChart(transactions) {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (distributionChart) {
        distributionChart.destroy();
        distributionChart = null;
    }

    try {
        // Group by product
        const productMap = new Map();
        transactions.forEach(t => {
            const name = t.productName || t.products?.name || 'Unknown';
            if (productMap.has(name)) {
                productMap.set(name, productMap.get(name) + 1);
            } else {
                productMap.set(name, 1);
            }
        });

        const labels = Array.from(productMap.keys());
        const data = Array.from(productMap.values());

        // If no data, show placeholder
        if (labels.length === 0) {
            labels.push('Belum Ada Data');
            data.push(1);
        }

        const isDark = document.body.classList.contains('dark-mode');
        const textColor = isDark ? '#e4e6eb' : '#212529';
        
        const colors = [
            'rgba(13, 110, 253, 0.8)',
            'rgba(25, 135, 84, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(220, 53, 69, 0.8)',
            'rgba(13, 202, 240, 0.8)',
            'rgba(111, 66, 193, 0.8)',
            'rgba(253, 126, 20, 0.8)',
            'rgba(32, 201, 151, 0.8)'
        ];

        distributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 3,
                    borderColor: isDark ? '#141824' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            padding: 12,
                            boxWidth: 12,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                                return context.label + ': ' + context.raw + ' (' + percentage + '%)';
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });

        // Update legend
        updateProductLegend(labels, data, colors);

    } catch (error) {
        console.error('Error creating distribution chart:', error);
    }
}

function updateProductLegend(labels, data, colors) {
    const container = document.getElementById('productLegend');
    if (!container) return;

    if (labels.length === 0 || (labels.length === 1 && labels[0] === 'Belum Ada Data')) {
        container.innerHTML = `
            <div class="text-center text-muted py-2">
                <small>Belum ada data produk</small>
            </div>
        `;
        return;
    }

    let html = '';
    const total = data.reduce((a, b) => a + b, 0);
    
    labels.slice(0, 5).forEach((label, index) => {
        const percentage = total > 0 ? ((data[index] / total) * 100).toFixed(1) : 0;
        html += `
            <div class="d-flex justify-content-between align-items-center py-1">
                <div class="d-flex align-items-center">
                    <span style="width:10px;height:10px;border-radius:50%;background:${colors[index]};display:inline-block;margin-right:8px;"></span>
                    <span class="small">${label}</span>
                </div>
                <span class="small fw-bold">${percentage}%</span>
            </div>
        `;
    });

    if (labels.length > 5) {
        html += `
            <div class="text-center text-muted mt-1">
                <small>+${labels.length - 5} produk lainnya</small>
            </div>
        `;
    }

    container.innerHTML = html;
}

// ============================================
// 7. LOAD RECENT TRANSACTIONS
// ============================================

async function loadRecentTransactions(transactions) {
    try {
        const tbody = document.getElementById('recentTransactionsBody');
        if (!tbody) return;

        // Get 10 most recent
        const recent = transactions.slice(0, 10);

        if (recent.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                        Belum ada transaksi
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        recent.forEach((t, index) => {
            const total = parseFloat(t.totalAmount || t.total_amount || 0);
            const farmerName = t.farmerName || t.farmers?.name || '-';
            const productName = t.productName || t.products?.name || '-';
            const netWeight = parseFloat(t.netWeight || t.net_weight || 0);
            
            html += `
                <tr>
                    <td>
                        <span class="badge bg-primary bg-opacity-10 text-primary transaction-code">
                            ${t.transactionCode || t.transaction_code || '-'}
                        </span>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="avatar bg-primary bg-opacity-10 text-primary me-2">
                                ${farmerName.charAt(0).toUpperCase()}
                            </div>
                            ${farmerName}
                        </div>
                    </td>
                    <td>${productName}</td>
                    <td>${netWeight.toFixed(2)} kg</td>
                    <td class="fw-bold text-success">${formatCurrency(total)}</td>
                    <td>${formatDate(t.transactionDate || t.transaction_date)}</td>
                    <td>
                        <span class="badge bg-success">Selesai</span>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;

        // Initialize DataTable if exists
        if (typeof $ !== 'undefined' && $('#recentTransactionsTable').length) {
            if (transactionsTable) {
                transactionsTable.destroy();
            }
            transactionsTable = $('#recentTransactionsTable').DataTable({
                searching: false,
                paging: false,
                info: false,
                order: [],
                language: {
                    emptyTable: 'Tidak ada transaksi terbaru'
                }
            });
        }

    } catch (error) {
        console.error('Error loading recent transactions:', error);
    }
}

// ============================================
// 8. UPDATE WELCOME MESSAGE
// ============================================

function updateWelcomeMessage() {
    const welcomeName = document.getElementById('welcomeName');
    if (welcomeName) {
        const user = getCurrentUser();
        welcomeName.textContent = user?.name || 'Admin';
    }

    // Set current date
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('id-ID', options);
    }
}

// ============================================
// 9. GET CURRENT USER
// ============================================

function getCurrentUser() {
    try {
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userData) {
            return JSON.parse(userData);
        }
    } catch (e) {
        console.error('Error getting user:', e);
    }
    return null;
}

// ============================================
// 10. LOADING STATES
// ============================================

function showStatsLoading() {
    const statElements = document.querySelectorAll('.stat-card h3');
    statElements.forEach(el => {
        el.innerHTML = `
            <span class="placeholder-glow">
                <span class="placeholder col-8"></span>
            </span>
        `;
    });
}

function hideStatsLoading() {
    // Stats will be updated by updateStats()
}

// ============================================
// 11. SHOW ALERT
// ============================================

function showAlert(message, type = 'success') {
    const container = document.getElementById('alertContainer');
    if (!container) return;

    const icons = {
        success: 'bi-check-circle-fill',
        danger: 'bi-exclamation-triangle-fill',
        warning: 'bi-exclamation-circle-fill',
        info: 'bi-info-circle-fill'
    };

    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="bi ${icons[type] || 'bi-info-circle-fill'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    setTimeout(() => {
        const alert = container.querySelector('.alert');
        if (alert) {
            alert.style.transition = 'opacity 0.5s ease';
            alert.style.opacity = '0';
            setTimeout(() => {
                if (alert.parentNode) alert.remove();
            }, 500);
        }
    }, 5000);
}

// ============================================
// 12. FORMAT HELPERS
// ============================================

function formatCurrency(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(amount));
}

function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return '-';
    }
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return '-';
    }
}

// ============================================
// 13. PERIOD BUTTON HANDLERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Period buttons for chart
    const periodBtns = document.querySelectorAll('[data-period]');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            periodBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // In a real app, you would reload data for the selected period
            showAlert('Memuat data untuk periode ' + this.textContent, 'info');
        });
    });
});

// ============================================
// 14. DARK MODE CHART UPDATE
// ============================================

// Listen for dark mode toggle
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        const observer = new MutationObserver(function() {
            // Re-render charts when dark mode changes
            if (revenueChart) {
                const data = revenueChart.data;
                revenueChart.destroy();
                revenueChart = null;
                createRevenueChart(getChartData(getDemoTransactions()));
            }
            if (distributionChart) {
                distributionChart.destroy();
                distributionChart = null;
                createDistributionChart(getDemoTransactions());
            }
        });
        
        // Observe body class changes
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
});

// ============================================
// 15. LOG
// ============================================

console.log('✅ Dashboard JS loaded successfully!');
console.log('📊 Dashboard siap digunakan');