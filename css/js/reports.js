/**
 * ============================================
 * Reports Module
 * Sistem Manajemen Timbangan Hasil Panen
 * ============================================
 */

// ============================================
// Reports Page Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const page = window.location.pathname;
    
    if (page.includes('reports.html')) {
        initReportForm();
        loadReports();
    }
});

// ============================================
// Initialize Report Form
// ============================================
function initReportForm() {
    const form = document.getElementById('reportForm');
    if (!form) return;

    // Set default date range (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    document.getElementById('date_from').value = sevenDaysAgo.toISOString().split('T')[0];
    document.getElementById('date_to').value = today.toISOString().split('T')[0];

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        loadReports();
    });
}

// ============================================
// Load Reports Data
// ============================================
async function loadReports() {
    try {
        const dateFrom = document.getElementById('date_from')?.value;
        const dateTo = document.getElementById('date_to')?.value;
        const reportType = document.getElementById('report_type')?.value || 'daily';

        if (!dateFrom || !dateTo) {
            showAlert('Silakan pilih rentang tanggal!', 'warning');
            return;
        }

        // Show loading
        showReportLoading();

        // Get transactions
        const transactions = await db.transactions.getByDateRange(dateFrom, dateTo);
        
        // Generate report
        generateReport(transactions, dateFrom, dateTo, reportType);

        // Generate chart
        generateReportChart(transactions, dateFrom, dateTo);

        // Hide loading
        hideReportLoading();

    } catch (error) {
        console.error('Error loading reports:', error);
        showAlert('Gagal memuat data laporan', 'danger');
        hideReportLoading();
    }
}

// ============================================
// Generate Report
// ============================================
function generateReport(transactions, dateFrom, dateTo, reportType) {
    const container = document.getElementById('reportContainer');
    if (!container) return;

    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                <h5>Tidak ada data untuk periode ini</h5>
                <p>Silakan pilih rentang tanggal yang berbeda</p>
            </div>
        `;
        return;
    }

    // Calculate summary
    let totalTransactions = transactions.length;
    let totalRevenue = 0;
    let totalNetWeight = 0;
    const products = {};
    const farmers = {};

    transactions.forEach(t => {
        totalRevenue += parseFloat(t.total_amount || 0);
        totalNetWeight += parseFloat(t.net_weight || 0);
        
        const productName = t.products?.name || 'Unknown';
        products[productName] = (products[productName] || 0) + 1;
        
        const farmerName = t.farmers?.name || 'Unknown';
        farmers[farmerName] = (farmers[farmerName] || 0) + parseFloat(t.total_amount || 0);
    });

    // Build report HTML
    let html = `
        <div class="report-header mb-4">
            <h4 class="fw-bold">Laporan Transaksi</h4>
            <p class="text-muted">
                Periode: ${formatDate(dateFrom)} - ${formatDate(dateTo)}
                <span class="badge bg-primary ms-2">${reportType.toUpperCase()}</span>
            </p>
        </div>

        <!-- Summary Cards -->
        <div class="row g-3 mb-4">
            <div class="col-md-3">
                <div class="card bg-primary bg-opacity-10 border-0">
                    <div class="card-body">
                        <h6 class="text-muted">Total Transaksi</h6>
                        <h3 class="fw-bold">${totalTransactions}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success bg-opacity-10 border-0">
                    <div class="card-body">
                        <h6 class="text-muted">Total Pendapatan</h6>
                        <h3 class="fw-bold text-success">${formatCurrency(totalRevenue)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info bg-opacity-10 border-0">
                    <div class="card-body">
                        <h6 class="text-muted">Total Berat Bersih</h6>
                        <h3 class="fw-bold text-info">${totalNetWeight.toFixed(2)} kg</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning bg-opacity-10 border-0">
                    <div class="card-body">
                        <h6 class="text-muted">Rata-rata per Transaksi</h6>
                        <h3 class="fw-bold text-warning">${formatCurrency(totalRevenue / totalTransactions)}</h3>
                    </div>
                </div>
            </div>
        </div>

        <!-- Top Products -->
        <div class="row g-3 mb-4">
            <div class="col-md-6">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-transparent">
                        <h6 class="fw-bold mb-0">Top 5 Produk Terlaris</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Produk</th>
                                        <th>Transaksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(products)
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 5)
                                        .map(([name, count], i) => `
                                            <tr>
                                                <td>${i + 1}</td>
                                                <td>${name}</td>
                                                <td>${count}</td>
                                            </tr>
                                        `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-transparent">
                        <h6 class="fw-bold mb-0">Top 5 Petani Terbanyak</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Petani</th>
                                        <th>Total Pendapatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(farmers)
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 5)
                                        .map(([name, total], i) => `
                                            <tr>
                                                <td>${i + 1}</td>
                                                <td>${name}</td>
                                                <td>${formatCurrency(total)}</td>
                                            </tr>
                                        `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Transactions Table -->
        <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
                <h6 class="fw-bold mb-0">Detail Transaksi</h6>
                <div>
                    <button onclick="exportReportPDF()" class="btn btn-sm btn-danger">
                        <i class="bi bi-file-pdf"></i> PDF
                    </button>
                    <button onclick="exportReportExcel()" class="btn btn-sm btn-success">
                        <i class="bi bi-file-excel"></i> Excel
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover" id="reportTable">
                        <thead>
                            <tr>
                                <th>Kode</th>
                                <th>Petani</th>
                                <th>Produk</th>
                                <th>Berat Bersih</th>
                                <th>Total</th>
                                <th>Tanggal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transactions.map(t => `
                                <tr>
                                    <td><span class="badge bg-primary bg-opacity-10 text-primary">${t.transaction_code}</span></td>
                                    <td>${t.farmers?.name || '-'}</td>
                                    <td>${t.products?.name || '-'}</td>
                                    <td>${(t.net_weight || 0).toFixed(2)} kg</td>
                                    <td class="fw-bold text-success">${formatCurrency(t.total_amount || 0)}</td>
                                    <td>${formatDate(t.transaction_date)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Store data for export
    window.reportData = {
        transactions,
        dateFrom,
        dateTo,
        reportType
    };
}

// ============================================
// Generate Report Chart
// ============================================
function generateReportChart(transactions, dateFrom, dateTo) {
    const canvas = document.getElementById('reportChart');
    if (!canvas) return;

    // Destroy existing chart
    if (window.reportChart) {
        window.reportChart.destroy();
    }

    // Group by date
    const dateMap = new Map();
    transactions.forEach(t => {
        const date = t.transaction_date;
        if (dateMap.has(date)) {
            dateMap.set(date, dateMap.get(date) + parseFloat(t.total_amount || 0));
        } else {
            dateMap.set(date, parseFloat(t.total_amount || 0));
        }
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    const labels = sortedDates.map(d => formatDate(d));
    const data = sortedDates.map(d => dateMap.get(d));

    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#e4e6eb' : '#212529';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

    window.reportChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pendapatan',
                data: data,
                borderColor: 'rgba(13, 110, 253, 1)',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(13, 110, 253, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
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
                            return 'Rp ' + (value / 1000) + 'k';
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
                        color: gridColor
                    }
                }
            }
        }
    });
}

// ============================================
// Export Report to PDF
// ============================================
function exportReportPDF() {
    const element = document.getElementById('reportContainer');
    if (!element) return;

    const opt = {
        margin: 10,
        filename: `laporan-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save();
}
window.exportReportPDF = exportReportPDF;

// ============================================
// Export Report to Excel
// ============================================
function exportReportExcel() {
    const table = document.getElementById('reportTable');
    if (!table) return;

    const wb = XLSX.utils.table_to_book(table, { sheet: 'Laporan' });
    XLSX.writeFile(wb, `laporan-${new Date().toISOString().split('T')[0]}.xlsx`);
}
window.exportReportExcel = exportReportExcel;

// ============================================
// Report Loading States
// ============================================
function showReportLoading() {
    const container = document.getElementById('reportContainer');
    if (container) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Memuat data laporan...</p>
            </div>
        `;
    }
}

function hideReportLoading() {
    // Content will be replaced by generateReport
}