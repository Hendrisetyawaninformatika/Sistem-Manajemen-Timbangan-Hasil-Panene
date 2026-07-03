/**
 * ============================================
 * Transactions Module
 * Sistem Manajemen Timbangan Hasil Panen
 * ============================================
 */

let transactionsTable = null;

// ============================================
// Transactions Page Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const page = window.location.pathname;
    
    if (page.includes('transactions.html') && !page.includes('create') && !page.includes('detail')) {
        loadTransactions();
        initFilterForm();
    }
    
    if (page.includes('transactions-create.html')) {
        initCreateForm();
        loadDropdowns();
    }
    
    if (page.includes('transactions-detail.html')) {
        loadTransactionDetail();
    }
});

// ============================================
// Load Transactions List
// ============================================
async function loadTransactions(filters = {}) {
    try {
        let transactions = await db.transactions.getAll();
        
        // Apply filters
        if (filters.farmer_id) {
            transactions = transactions.filter(t => t.farmer_id === filters.farmer_id);
        }
        if (filters.product_id) {
            transactions = transactions.filter(t => t.product_id === filters.product_id);
        }
        if (filters.date_from) {
            transactions = transactions.filter(t => t.transaction_date >= filters.date_from);
        }
        if (filters.date_to) {
            transactions = transactions.filter(t => t.transaction_date <= filters.date_to);
        }
        
        const tbody = document.getElementById('transactionsTableBody');
        if (!tbody) return;
        
        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                        Belum ada transaksi
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        transactions.forEach((transaction, index) => {
            const total = transaction.total_amount || 0;
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <span class="badge bg-primary bg-opacity-10 text-primary">
                            ${transaction.transaction_code}
                        </span>
                    </td>
                    <td>${transaction.farmers?.name || '-'}</td>
                    <td>${transaction.products?.name || '-'}</td>
                    <td>${transaction.gross_weight || 0} kg</td>
                    <td>${transaction.net_weight ? transaction.net_weight.toFixed(2) : '0.00'} kg</td>
                    <td class="fw-bold text-success">${formatCurrency(total)}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <a href="transactions-detail.html?id=${transaction.id}" class="btn btn-outline-info">
                                <i class="bi bi-eye"></i>
                            </a>
                            <button onclick="deleteTransaction('${transaction.id}')" class="btn btn-outline-danger">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;

        // Initialize DataTable
        if (typeof $ !== 'undefined' && $('#transactionsTable').length) {
            if (transactionsTable) {
                transactionsTable.destroy();
            }
            transactionsTable = $('#transactionsTable').DataTable({
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/id.json'
                },
                order: [[1, 'desc']],
                pageLength: 25
            });
        }

        // Update total
        updateTotal(transactions);

    } catch (error) {
        console.error('Error loading transactions:', error);
        showAlert('Gagal memuat data transaksi', 'danger');
    }
}

// ============================================
// Update Total Summary
// ============================================
function updateTotal(transactions) {
    const totalElement = document.getElementById('totalTransactionsAmount');
    if (!totalElement) return;
    
    let total = 0;
    transactions.forEach(t => {
        total += parseFloat(t.total_amount || 0);
    });
    totalElement.textContent = formatCurrency(total);
}

// ============================================
// Init Filter Form
// ============================================
function initFilterForm() {
    const form = document.getElementById('filterForm');
    if (!form) return;

    // Load filter dropdowns
    loadFilterDropdowns();

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const farmerId = document.getElementById('filter_farmer')?.value;
        const productId = document.getElementById('filter_product')?.value;
        const dateFrom = document.getElementById('filter_date_from')?.value;
        const dateTo = document.getElementById('filter_date_to')?.value;
        
        const filters = {};
        if (farmerId) filters.farmer_id = farmerId;
        if (productId) filters.product_id = productId;
        if (dateFrom) filters.date_from = dateFrom;
        if (dateTo) filters.date_to = dateTo;
        
        loadTransactions(filters);
    });

    // Reset filter
    const resetBtn = document.getElementById('resetFilter');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            document.getElementById('filter_farmer').value = '';
            document.getElementById('filter_product').value = '';
            document.getElementById('filter_date_from').value = '';
            document.getElementById('filter_date_to').value = '';
            loadTransactions();
        });
    }
}

// ============================================
// Load Filter Dropdowns
// ============================================
async function loadFilterDropdowns() {
    try {
        const [farmers, products] = await Promise.all([
            db.farmers.getAll(),
            db.products.getActive()
        ]);

        const farmerSelect = document.getElementById('filter_farmer');
        const productSelect = document.getElementById('filter_product');

        if (farmerSelect) {
            let html = '<option value="">Semua Petani</option>';
            farmers.forEach(f => {
                html += `<option value="${f.id}">${f.name}</option>`;
            });
            farmerSelect.innerHTML = html;
        }

        if (productSelect) {
            let html = '<option value="">Semua Produk</option>';
            products.forEach(p => {
                html += `<option value="${p.id}">${p.name}</option>`;
            });
            productSelect.innerHTML = html;
        }

    } catch (error) {
        console.error('Error loading filter dropdowns:', error);
    }
}

// ============================================
// Load Dropdowns for Create Form
// ============================================
async function loadDropdowns() {
    try {
        const [farmers, products] = await Promise.all([
            db.farmers.getAll(),
            db.products.getActive()
        ]);

        const farmerSelect = document.getElementById('farmer_id');
        const productSelect = document.getElementById('product_id');

        if (farmerSelect) {
            let html = '<option value="">Pilih Petani</option>';
            farmers.forEach(f => {
                html += `<option value="${f.id}">${f.name}</option>`;
            });
            farmerSelect.innerHTML = html;
        }

        if (productSelect) {
            let html = '<option value="">Pilih Produk</option>';
            products.forEach(p => {
                html += `<option value="${p.id}" data-price="${p.price_per_kg}">${p.name} (${formatCurrency(p.price_per_kg)}/kg)</option>`;
            });
            productSelect.innerHTML = html;
        }

        // Auto-calculate when product changes
        if (productSelect) {
            productSelect.addEventListener('change', function() {
                const selected = this.options[this.selectedIndex];
                const price = selected.dataset.price;
                if (price) {
                    document.getElementById('price_per_kg').value = price;
                    calculateTotal();
                }
            });
        }

        // Auto-calculate on weight change
        const grossWeight = document.getElementById('gross_weight');
        const tareWeight = document.getElementById('tare_weight');
        
        if (grossWeight) {
            grossWeight.addEventListener('input', calculateTotal);
        }
        if (tareWeight) {
            tareWeight.addEventListener('input', calculateTotal);
        }

    } catch (error) {
        console.error('Error loading dropdowns:', error);
        showAlert('Gagal memuat data dropdown', 'danger');
    }
}

// ============================================
// Calculate Total
// ============================================
function calculateTotal() {
    const grossWeight = parseFloat(document.getElementById('gross_weight')?.value) || 0;
    const tareWeight = parseFloat(document.getElementById('tare_weight')?.value) || 0;
    const pricePerKg = parseFloat(document.getElementById('price_per_kg')?.value) || 0;

    const netWeight = grossWeight - tareWeight;
    const total = netWeight * pricePerKg;

    document.getElementById('net_weight').value = netWeight.toFixed(2);
    document.getElementById('total_amount').value = formatCurrency(total);
    
    // Update display
    document.getElementById('net_weight_display').textContent = netWeight.toFixed(2) + ' kg';
    document.getElementById('total_amount_display').textContent = formatCurrency(total);
}

// ============================================
// Create Transaction Form
// ============================================
function initCreateForm() {
    const form = document.getElementById('transactionForm');
    if (!form) return;

    // Set default date
    const dateInput = document.getElementById('transaction_date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm('transactionForm')) {
            showAlert('Silakan isi semua field yang diperlukan!', 'warning');
            return;
        }

        const farmerId = document.getElementById('farmer_id').value;
        const productId = document.getElementById('product_id').value;
        const grossWeight = parseFloat(document.getElementById('gross_weight').value);
        const tareWeight = parseFloat(document.getElementById('tare_weight').value) || 0;
        const pricePerKg = parseFloat(document.getElementById('price_per_kg').value);
        const transactionDate = document.getElementById('transaction_date').value;
        const notes = document.getElementById('notes').value.trim();

        if (!farmerId || !productId) {
            showAlert('Silakan pilih petani dan produk!', 'warning');
            return;
        }

        if (grossWeight <= 0) {
            showAlert('Berat kotor harus lebih dari 0!', 'warning');
            return;
        }

        if (grossWeight <= tareWeight) {
            showAlert('Berat kotor harus lebih besar dari berat tarra!', 'warning');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Menyimpan...';
        submitBtn.disabled = true;

        try {
            const user = getCurrentUser();
            const transaction = {
                id: generateUUID(),
                transaction_code: generateTransactionCode(),
                farmer_id: farmerId,
                product_id: productId,
                gross_weight: grossWeight,
                tare_weight: tareWeight,
                price_per_kg: pricePerKg,
                transaction_date: transactionDate,
                notes: notes || null,
                created_by: user?.id || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await db.transactions.create(transaction);

            showAlert('Transaksi berhasil disimpan!', 'success');
            
            // Print receipt
            setTimeout(() => {
                window.location.href = 'transactions.html';
            }, 1500);

        } catch (error) {
            console.error('Error creating transaction:', error);
            showAlert('Gagal menyimpan transaksi: ' + error.message, 'danger');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ============================================
// Load Transaction Detail
// ============================================
async function loadTransactionDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('id');

    if (!transactionId) {
        showAlert('ID transaksi tidak ditemukan!', 'danger');
        setTimeout(() => {
            window.location.href = 'transactions.html';
        }, 2000);
        return;
    }

    try {
        const transaction = await db.transactions.getById(transactionId);
        
        if (!transaction) {
            showAlert('Data transaksi tidak ditemukan!', 'danger');
            setTimeout(() => {
                window.location.href = 'transactions.html';
            }, 2000);
            return;
        }

        // Fill detail
        document.getElementById('detail_code').textContent = transaction.transaction_code;
        document.getElementById('detail_farmer').textContent = transaction.farmers?.name || '-';
        document.getElementById('detail_farmer_nik').textContent = transaction.farmers?.nik || '-';
        document.getElementById('detail_farmer_phone').textContent = transaction.farmers?.phone || '-';
        document.getElementById('detail_product').textContent = transaction.products?.name || '-';
        document.getElementById('detail_gross_weight').textContent = transaction.gross_weight + ' kg';
        document.getElementById('detail_tare_weight').textContent = transaction.tare_weight + ' kg';
        document.getElementById('detail_net_weight').textContent = (transaction.net_weight || 0).toFixed(2) + ' kg';
        document.getElementById('detail_price_per_kg').textContent = formatCurrency(transaction.price_per_kg || 0);
        document.getElementById('detail_total_amount').textContent = formatCurrency(transaction.total_amount || 0);
        document.getElementById('detail_date').textContent = formatDate(transaction.transaction_date);
        document.getElementById('detail_notes').textContent = transaction.notes || '-';
        document.getElementById('detail_created_by').textContent = transaction.users?.name || '-';
        document.getElementById('detail_created_at').textContent = formatDateTime(transaction.created_at);

        // Print button
        const printBtn = document.getElementById('printDetail');
        if (printBtn) {
            printBtn.addEventListener('click', function() {
                window.print();
            });
        }

        // WhatsApp button
        const waBtn = document.getElementById('whatsappBtn');
        if (waBtn) {
            const message = `*Sistem Manajemen Timbangan Hasil Panen*
            
*Nota Transaksi*
Kode: ${transaction.transaction_code}
Petani: ${transaction.farmers?.name || '-'}
Produk: ${transaction.products?.name || '-'}
Berat Bersih: ${(transaction.net_weight || 0).toFixed(2)} kg
Total: ${formatCurrency(transaction.total_amount || 0)}
Tanggal: ${formatDate(transaction.transaction_date)}

Terima kasih telah menggunakan layanan kami.`;
            
            waBtn.href = `https://wa.me/6281248141031?text=${encodeURIComponent(message)}`;
        }

    } catch (error) {
        console.error('Error loading transaction:', error);
        showAlert('Gagal memuat detail transaksi', 'danger');
    }
}

// ============================================
// Delete Transaction
// ============================================
async function deleteTransaction(id) {
    const result = await Swal.fire({
        title: 'Konfirmasi Hapus',
        text: 'Apakah Anda yakin ingin menghapus transaksi ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    try {
        await db.transactions.delete(id);
        
        Swal.fire({
            title: 'Berhasil!',
            text: 'Transaksi berhasil dihapus.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        setTimeout(() => {
            window.location.reload();
        }, 2000);

    } catch (error) {
        console.error('Error deleting transaction:', error);
        Swal.fire({
            title: 'Gagal!',
            text: 'Gagal menghapus transaksi: ' + error.message,
            icon: 'error',
            confirmButtonColor: '#0d6efd'
        });
    }
}
window.deleteTransaction = deleteTransaction;