/**
 * ============================================
 * Products Module
 * Sistem Manajemen Timbangan Hasil Panen
 * ============================================
 */

let productsTable = null;

// ============================================
// Products Page Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const page = window.location.pathname;
    
    if (page.includes('products.html') && !page.includes('create') && !page.includes('edit')) {
        loadProducts();
    }
    
    if (page.includes('products-create.html')) {
        initCreateForm();
    }
    
    if (page.includes('products-edit.html')) {
        initEditForm();
    }
});

// ============================================
// Load Products List
// ============================================
async function loadProducts() {
    try {
        const products = await db.products.getAll();
        
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;
        
        if (products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                        Belum ada data produk
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        products.forEach((product, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="avatar bg-success bg-opacity-10 text-success me-2">
                                ${product.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div class="fw-semibold">${product.name}</div>
                                <small class="text-muted">${product.unit || 'kg'}</small>
                            </div>
                        </div>
                    </td>
                    <td>${product.description || '-'}</td>
                    <td class="fw-bold text-primary">${formatCurrency(product.price_per_kg)}</td>
                    <td>
                        <span class="badge ${product.is_active ? 'bg-success' : 'bg-secondary'}">
                            ${product.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                    </td>
                    <td>${formatDate(product.created_at)}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <a href="products-edit.html?id=${product.id}" class="btn btn-outline-primary">
                                <i class="bi bi-pencil"></i>
                            </a>
                            <button onclick="deleteProduct('${product.id}')" class="btn btn-outline-danger">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;

        // Initialize DataTable
        if (typeof $ !== 'undefined' && $('#productsTable').length) {
            if (productsTable) {
                productsTable.destroy();
            }
            productsTable = $('#productsTable').DataTable({
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/id.json'
                },
                order: [[1, 'asc']],
                pageLength: 25
            });
        }

    } catch (error) {
        console.error('Error loading products:', error);
        showAlert('Gagal memuat data produk', 'danger');
    }
}

// ============================================
// Create Product Form
// ============================================
function initCreateForm() {
    const form = document.getElementById('productForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm('productForm')) {
            showAlert('Silakan isi semua field yang diperlukan!', 'warning');
            return;
        }

        const name = document.getElementById('name').value.trim();
        const description = document.getElementById('description').value.trim();
        const price_per_kg = parseFloat(document.getElementById('price_per_kg').value);
        const unit = document.getElementById('unit').value || 'kg';
        const isActive = document.getElementById('is_active').checked;

        if (isNaN(price_per_kg) || price_per_kg <= 0) {
            showAlert('Harga per kg harus diisi dengan angka positif!', 'warning');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Menyimpan...';
        submitBtn.disabled = true;

        try {
            const product = {
                id: generateUUID(),
                name: name,
                description: description || null,
                price_per_kg: price_per_kg,
                unit: unit,
                is_active: isActive,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await db.products.create(product);

            showAlert('Data produk berhasil ditambahkan!', 'success');
            
            setTimeout(() => {
                window.location.href = 'products.html';
            }, 1500);

        } catch (error) {
            console.error('Error creating product:', error);
            showAlert('Gagal menambahkan data produk: ' + error.message, 'danger');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ============================================
// Edit Product Form
// ============================================
async function initEditForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        showAlert('ID produk tidak ditemukan!', 'danger');
        setTimeout(() => {
            window.location.href = 'products.html';
        }, 2000);
        return;
    }

    try {
        const product = await db.products.getById(productId);
        
        if (!product) {
            showAlert('Data produk tidak ditemukan!', 'danger');
            setTimeout(() => {
                window.location.href = 'products.html';
            }, 2000);
            return;
        }

        // Fill form
        document.getElementById('name').value = product.name || '';
        document.getElementById('description').value = product.description || '';
        document.getElementById('price_per_kg').value = product.price_per_kg || '';
        document.getElementById('unit').value = product.unit || 'kg';
        document.getElementById('is_active').checked = product.is_active || false;

        const form = document.getElementById('productForm');
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (!validateForm('productForm')) {
                showAlert('Silakan isi semua field yang diperlukan!', 'warning');
                return;
            }

            const name = document.getElementById('name').value.trim();
            const description = document.getElementById('description').value.trim();
            const price_per_kg = parseFloat(document.getElementById('price_per_kg').value);
            const unit = document.getElementById('unit').value || 'kg';
            const isActive = document.getElementById('is_active').checked;

            if (isNaN(price_per_kg) || price_per_kg <= 0) {
                showAlert('Harga per kg harus diisi dengan angka positif!', 'warning');
                return;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Menyimpan...';
            submitBtn.disabled = true;

            try {
                const updates = {
                    name: name,
                    description: description || null,
                    price_per_kg: price_per_kg,
                    unit: unit,
                    is_active: isActive,
                    updated_at: new Date().toISOString()
                };

                await db.products.update(productId, updates);

                showAlert('Data produk berhasil diperbarui!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'products.html';
                }, 1500);

            } catch (error) {
                console.error('Error updating product:', error);
                showAlert('Gagal memperbarui data produk: ' + error.message, 'danger');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });

    } catch (error) {
        console.error('Error loading product:', error);
        showAlert('Gagal memuat data produk', 'danger');
    }
}

// ============================================
// Delete Product
// ============================================
async function deleteProduct(id) {
    const result = await Swal.fire({
        title: 'Konfirmasi Hapus',
        text: 'Apakah Anda yakin ingin menghapus data produk ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    try {
        // Check if product has transactions
        const transactions = await db.transactions.getAll();
        const hasTransactions = transactions.some(t => t.product_id === id);
        
        if (hasTransactions) {
            Swal.fire({
                title: 'Tidak Dapat Dihapus',
                text: 'Produk ini memiliki transaksi. Silakan hapus transaksi terlebih dahulu.',
                icon: 'error',
                confirmButtonColor: '#0d6efd'
            });
            return;
        }

        await db.products.delete(id);
        
        Swal.fire({
            title: 'Berhasil!',
            text: 'Data produk berhasil dihapus.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        setTimeout(() => {
            window.location.reload();
        }, 2000);

    } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire({
            title: 'Gagal!',
            text: 'Gagal menghapus data produk: ' + error.message,
            icon: 'error',
            confirmButtonColor: '#0d6efd'
        });
    }
}
window.deleteProduct = deleteProduct;