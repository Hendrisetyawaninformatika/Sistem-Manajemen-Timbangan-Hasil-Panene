// ============================================
// FIREBASE CONFIGURATION
// GANTI DENGAN KONFIGURASI DARI FIREBASE ANDA
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz12345",  // GANTI DENGAN API KEY ANDA
    authDomain: "sistem-timbangan-panen.firebaseapp.com", // GANTI
    projectId: "sistem-timbangan-panen",                   // GANTI
    storageBucket: "sistem-timbangan-panen.appspot.com",   // GANTI
    messagingSenderId: "123456789012",                     // GANTI
    appId: "1:123456789012:web:abcdef1234567890"           // GANTI
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Initialize Auth
const auth = firebase.auth();

// ============================================
// DATABASE HELPER FUNCTIONS
// ============================================

const FireDB = {
    // ==========================================
    // USERS COLLECTION
    // ==========================================
    users: {
        async getAll() {
            const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        
        async getById(id) {
            const doc = await db.collection('users').doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() };
        },
        
        async create(data) {
            const docRef = await db.collection('users').add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            const doc = await docRef.get();
            return { id: docRef.id, ...doc.data() };
        },
        
        async update(id, data) {
            await db.collection('users').doc(id).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return this.getById(id);
        },
        
        async delete(id) {
            await db.collection('users').doc(id).delete();
            return true;
        },
        
        async findByEmail(email) {
            const snapshot = await db.collection('users')
                .where('email', '==', email)
                .limit(1)
                .get();
            if (snapshot.empty) return null;
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
    },

    // ==========================================
    // FARMERS COLLECTION
    // ==========================================
    farmers: {
        async getAll() {
            const snapshot = await db.collection('farmers')
                .orderBy('createdAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        
        async getActive() {
            const snapshot = await db.collection('farmers')
                .where('isActive', '==', true)
                .orderBy('name')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        
        async getById(id) {
            const doc = await db.collection('farmers').doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() };
        },
        
        async create(data) {
            const docRef = await db.collection('farmers').add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            const doc = await docRef.get();
            return { id: docRef.id, ...doc.data() };
        },
        
        async update(id, data) {
            await db.collection('farmers').doc(id).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return this.getById(id);
        },
        
        async delete(id) {
            await db.collection('farmers').doc(id).delete();
            return true;
        },
        
        async search(query) {
            const snapshot = await db.collection('farmers')
                .where('name', '>=', query)
                .where('name', '<=', query + '\uf8ff')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    },

    // ==========================================
    // PRODUCTS COLLECTION
    // ==========================================
    products: {
        async getAll() {
            const snapshot = await db.collection('products')
                .orderBy('createdAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        
        async getActive() {
            const snapshot = await db.collection('products')
                .where('isActive', '==', true)
                .orderBy('name')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        
        async getById(id) {
            const doc = await db.collection('products').doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() };
        },
        
        async create(data) {
            const docRef = await db.collection('products').add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            const doc = await docRef.get();
            return { id: docRef.id, ...doc.data() };
        },
        
        async update(id, data) {
            await db.collection('products').doc(id).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return this.getById(id);
        },
        
        async delete(id) {
            await db.collection('products').doc(id).delete();
            return true;
        }
    },

    // ==========================================
    // TRANSACTIONS COLLECTION
    // ==========================================
    transactions: {
        async getAll() {
            const snapshot = await db.collection('transactions')
                .orderBy('createdAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        
        async getById(id) {
            const doc = await db.collection('transactions').doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() };
        },
        
        async create(data) {
            const docRef = await db.collection('transactions').add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            const doc = await docRef.get();
            return { id: docRef.id, ...doc.data() };
        },
        
        async update(id, data) {
            await db.collection('transactions').doc(id).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return this.getById(id);
        },
        
        async delete(id) {
            await db.collection('transactions').doc(id).delete();
            return true;
        },
        
        async getByDateRange(startDate, endDate) {
            const snapshot = await db.collection('transactions')
                .where('transactionDate', '>=', startDate)
                .where('transactionDate', '<=', endDate)
                .orderBy('transactionDate', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        
        async getDaily(date) {
            const snapshot = await db.collection('transactions')
                .where('transactionDate', '==', date)
                .orderBy('createdAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        
        async getMonthly(month, year) {
            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
            return this.getByDateRange(startDate, endDate);
        },
        
        async getYearly(year) {
            const startDate = `${year}-01-01`;
            const endDate = `${year}-12-31`;
            return this.getByDateRange(startDate, endDate);
        }
    },

    // ==========================================
    // SETTINGS COLLECTION
    // ==========================================
    settings: {
        async getAll() {
            const snapshot = await db.collection('settings').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        
        async getByKey(key) {
            const snapshot = await db.collection('settings')
                .where('key', '==', key)
                .limit(1)
                .get();
            if (snapshot.empty) return null;
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        },
        
        async set(key, value, description = null) {
            const existing = await this.getByKey(key);
            if (existing) {
                await db.collection('settings').doc(existing.id).update({
                    value,
                    description,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return this.getByKey(key);
            } else {
                const docRef = await db.collection('settings').add({
                    key,
                    value,
                    description,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                const doc = await docRef.get();
                return { id: docRef.id, ...doc.data() };
            }
        }
    }
};

// Make FireDB available globally
window.FireDB = FireDB;
window.auth = auth;
window.db = db;

// ============================================
// HELPER FUNCTIONS
// ============================================

// Generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
window.generateUUID = generateUUID;

// Format currency
function formatCurrency(amount) {
    if (amount === undefined || amount === null) return 'Rp 0';
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
}
window.formatCurrency = formatCurrency;

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}
window.formatDate = formatDate;

// Format datetime
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
window.formatDateTime = formatDateTime;

// Generate transaction code
function generateTransactionCode() {
    const prefix = 'TRX';
    const date = new Date();
    const dateStr = date.getFullYear() +
        String(date.getMonth() + 1).padStart(2, '0') +
        String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return prefix + dateStr + random;
}
window.generateTransactionCode = generateTransactionCode;

console.log('✅ Firebase connected successfully!');
console.log('🔥 Firestore database ready!');