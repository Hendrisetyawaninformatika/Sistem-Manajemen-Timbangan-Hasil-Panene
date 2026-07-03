// ============================================
// FIREBASE CONFIGURATION
// GANTI DENGAN KONFIGURASI DARI FIREBASE ANDA
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyDi_zEip2snQx_TlCN--tcgm5WZLXgZq4Q",
  authDomain: "manajement-petani.firebaseapp.com",
  databaseURL: "https://manajement-petani-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "manajement-petani",
  storageBucket: "manajement-petani.firebasestorage.app",
  messagingSenderId: "795537405486",
  appId: "1:795537405486:web:7819bc9ac5da03d352d1bf",
  measurementId: "G-QCW5W6FVCP"
};


// Initialize Firebase
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();
const auth = firebase.auth();

// ============================================
// CRUD HELPERS FOR REALTIME DATABASE
// ============================================

const FireDB = {
    // ==========================================
    // FARMERS CRUD
    // ==========================================
    farmers: {
        async getAll() {
            const snapshot = await database.ref('farmers').once('value');
            const data = snapshot.val();
            if (!data) return [];
            return Object.keys(data).map(key => ({ id: key, ...data[key] }));
        },
        
        async getById(id) {
            const snapshot = await database.ref(`farmers/${id}`).once('value');
            const data = snapshot.val();
            if (!data) return null;
            return { id, ...data };
        },
        
        async create(data) {
            const newRef = database.ref('farmers').push();
            await newRef.set({
                ...data,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
            const snapshot = await newRef.once('value');
            return { id: newRef.key, ...snapshot.val() };
        },
        
        async update(id, data) {
            await database.ref(`farmers/${id}`).update({
                ...data,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            });
            return this.getById(id);
        },
        
        async delete(id) {
            await database.ref(`farmers/${id}`).remove();
            return true;
        }
    },

    // ==========================================
    // PRODUCTS CRUD
    // ==========================================
    products: {
        async getAll() {
            const snapshot = await database.ref('products').once('value');
            const data = snapshot.val();
            if (!data) return [];
            return Object.keys(data).map(key => ({ id: key, ...data[key] }));
        },
        
        async getById(id) {
            const snapshot = await database.ref(`products/${id}`).once('value');
            const data = snapshot.val();
            if (!data) return null;
            return { id, ...data };
        },
        
        async create(data) {
            const newRef = database.ref('products').push();
            await newRef.set({
                ...data,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
            const snapshot = await newRef.once('value');
            return { id: newRef.key, ...snapshot.val() };
        },
        
        async update(id, data) {
            await database.ref(`products/${id}`).update({
                ...data,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            });
            return this.getById(id);
        },
        
        async delete(id) {
            await database.ref(`products/${id}`).remove();
            return true;
        }
    },

    // ==========================================
    // TRANSACTIONS CRUD
    // ==========================================
    transactions: {
        async getAll() {
            const snapshot = await database.ref('transactions').once('value');
            const data = snapshot.val();
            if (!data) return [];
            return Object.keys(data).map(key => ({ id: key, ...data[key] }));
        },
        
        async getById(id) {
            const snapshot = await database.ref(`transactions/${id}`).once('value');
            const data = snapshot.val();
            if (!data) return null;
            return { id, ...data };
        },
        
        async create(data) {
            const newRef = database.ref('transactions').push();
            await newRef.set({
                ...data,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
            const snapshot = await newRef.once('value');
            return { id: newRef.key, ...snapshot.val() };
        },
        
        async update(id, data) {
            await database.ref(`transactions/${id}`).update({
                ...data,
                updatedAt: firebase.database.ServerValue.TIMESTAMP
            });
            return this.getById(id);
        },
        
        async delete(id) {
            await database.ref(`transactions/${id}`).remove();
            return true;
        },
        
        async getByDateRange(startDate, endDate) {
            const all = await this.getAll();
            return all.filter(t => t.date >= startDate && t.date <= endDate);
        }
    },

    // ==========================================
    // USERS CRUD
    // ==========================================
    users: {
        async getAll() {
            const snapshot = await database.ref('users').once('value');
            const data = snapshot.val();
            if (!data) return [];
            return Object.keys(data).map(key => ({ id: key, ...data[key] }));
        },
        
        async getById(id) {
            const snapshot = await database.ref(`users/${id}`).once('value');
            const data = snapshot.val();
            if (!data) return null;
            return { id, ...data };
        },
        
        async create(data) {
            const newRef = database.ref('users').push();
            await newRef.set({
                ...data,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
            const snapshot = await newRef.once('value');
            return { id: newRef.key, ...snapshot.val() };
        },
        
        async findByEmail(email) {
            const all = await this.getAll();
            return all.find(u => u.email === email) || null;
        }
    }
};

// Make available globally
window.FireDB = FireDB;
window.database = database;
window.auth = auth;

console.log('✅ Firebase Realtime Database connected!');
console.log('🔥 Project: manajement-petani');