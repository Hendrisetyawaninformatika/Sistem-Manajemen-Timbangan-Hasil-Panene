/**
 * ============================================
 * Farmers Module
 * Sistem Manajemen Timbangan Hasil Panen
 * ============================================
 */

let farmersTable = null;

// ============================================
// Farmers Page Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const page = window.location.pathname;
    
    if (page.includes('farmers.html') && !page.includes('create') && !page.includes('edit')) {
        loadFarmers();
    }
    
    if (page.includes('farmers-create.html')) {
        initCreateForm();
    }
    
    if (page.includes('farmers-edit.html')) {
        initEditForm();
    }
});

// ============================================
// Load Farmers List
// ============================================
async function loadFarmers() {
    try {
        const farmers = await db.farmers.getAll();
        
        const tbody = document.getElementById('farmersTableBody');
        if (!tbody) return;
        
        if (farmers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                        Belum ada data petani
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        farmers.forEach((farmer, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="avatar bg-primary bg-opacity-10 text-primary me-2">
                                ${farmer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div class="fw-semibold">${farmer.name}</div>
                                <small class="text-muted">${farmer.nik || '-'}</small>
                            </div>
                        </div>
                    </td>
                    <td>${farmer.phone || '-'}</td>
                    <td>${farmer.address || '-'}</td>
                    <td>
                        <span class="badge ${farmer.is_active ? 'bg-success' : 'bg-secondary'}">
                            ${farmer.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                    </td>
                    <td>${formatDate(farmer.created_at)}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <a href="farmers-edit.html?id=${farmer.id}" class="btn btn-outline-primary">
                                <i class="bi bi-pencil"></i>
                            </a>
                            <button onclick="deleteFarmer('${farmer.id}')" class="btn btn-outline-danger">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;

        // Initialize DataTable
        if (typeof $ !== 'undefined' && $('#farmersTable').length) {
            if (farmersTable) {
                farmersTable.destroy();
            }
            farmersTable = $('#farmersTable').DataTable({
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/id.json'
                },
                order: [[1, 'asc']],
                pageLength: 25
            });
        }

    } catch (error) {
        console.error('Error loading farmers:', error);
        showAlert('Gagal memuat data petani', 'danger');
    }
}

// ============================================
// Create Farmer Form
// ============================================
function initCreateForm() {
    const form = document.getElementById('farmerForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm('farmerForm')) {
            showAlert('Silakan isi semua field yang diperlukan!', 'warning');
            return;
        }

        const name = document.getElementById('name').value.trim();
        const nik = document.getElementById('nik').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const isActive = document.getElementById('is_active').checked;

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Menyimpan...';
        submitBtn.disabled = true;

        try {
            const farmer = {
                id: generateUUID(),
                name: name,
                nik: nik || null,
                phone: phone || null,
                address: address || null,
                is_active: isActive,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await db.farmers.create(farmer);

            showAlert('Data petani berhasil ditambahkan!', 'success');
            
            setTimeout(() => {
                window.location.href = 'farmers.html';
            }, 1500);

        } catch (error) {
            console.error('Error creating farmer:', error);
            showAlert('Gagal menambahkan data petani: ' + error.message, 'danger');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ============================================
// Edit Farmer Form
// ============================================
async function initEditForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const farmerId = urlParams.get('id');

    if (!farmerId) {
        showAlert('ID petani tidak ditemukan!', 'danger');
        setTimeout(() => {
            window.location.href = 'farmers.html';
        }, 2000);
        return;
    }

    try {
        const farmer = await db.farmers.getById(farmerId);
        
        if (!farmer) {
            showAlert('Data petani tidak ditemukan!', 'danger');
            setTimeout(() => {
                window.location.href = 'farmers.html';
            }, 2000);
            return;
        }

        // Fill form
        document.getElementById('name').value = farmer.name || '';
        document.getElementById('nik').value = farmer.nik || '';
        document.getElementById('phone').value = farmer.phone || '';
        document.getElementById('address').value = farmer.address || '';
        document.getElementById('is_active').checked = farmer.is_active || false;

        const form = document.getElementById('farmerForm');
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!validateForm('farmerForm')) {
                showAlert('Silakan isi semua field yang diperlukan!', 'warning');
                return;
            }

            const name = document.getElementById('name').value.trim();
            const nik = document.getElementById('nik').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim();
            const isActive = document.getElementById('is_active').checked;

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Menyimpan...';
            submitBtn.disabled = true;

            try {
                const updates = {
                    name: name,
                    nik: nik || null,
                    phone: phone || null,
                    address: address || null,
                    is_active: isActive,
                    updated_at: new Date().toISOString()
                };

                await db.farmers.update(farmerId, updates);

                showAlert('Data petani berhasil diperbarui!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'farmers.html';
                }, 1500);

            } catch (error) {
                console.error('Error updating farmer:', error);
                showAlert('Gagal memperbarui data petani: ' + error.message, 'danger');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });

    } catch (error) {
        console.error('Error loading farmer:', error);
        showAlert('Gagal memuat data petani', 'danger');
    }
}

// ============================================
// Delete Farmer
// ============================================
async function deleteFarmer(id) {
    const result = await Swal.fire({
        title: 'Konfirmasi Hapus',
        text: 'Apakah Anda yakin ingin menghapus data petani ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    try {
        // Check if farmer has transactions
        const transactions = await db.transactions.getAll();
        const hasTransactions = transactions.some(t => t.farmer_id === id);
        
        if (hasTransactions) {
            Swal.fire({
                title: 'Tidak Dapat Dihapus',
                text: 'Petani ini memiliki transaksi. Silakan hapus transaksi terlebih dahulu.',
                icon: 'error',
                confirmButtonColor: '#0d6efd'
            });
            return;
        }

        await db.farmers.delete(id);
        
        Swal.fire({
            title: 'Berhasil!',
            text: 'Data petani berhasil dihapus.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        setTimeout(() => {
            window.location.reload();
        }, 2000);

    } catch (error) {
        console.error('Error deleting farmer:', error);
        Swal.fire({
            title: 'Gagal!',
            text: 'Gagal menghapus data petani: ' + error.message,
            icon: 'error',
            confirmButtonColor: '#0d6efd'
        });
    }
}
window.deleteFarmer = deleteFarmer;