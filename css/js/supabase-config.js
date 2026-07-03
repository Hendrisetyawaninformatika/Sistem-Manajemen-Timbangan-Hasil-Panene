// Supabase Configuration
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-supabase-anon-key';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Export for use in other files
window.supabase = supabaseClient;

// Helper functions
const db = {
    // Users
    users: {
        async getAll() {
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        async getById(id) {
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        async create(user) {
            const { data, error } = await supabaseClient
                .from('users')
                .insert([user])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        async update(id, updates) {
            const { data, error } = await supabaseClient
                .from('users')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        async delete(id) {
            const { error } = await supabaseClient
                .from('users')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        },
        async findByEmail(email) {
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('email', email)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        }
    },

    // Farmers
    farmers: {
        async getAll() {
            const { data, error } = await supabaseClient
                .from('farmers')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        async getById(id) {
            const { data, error } = await supabaseClient
                .from('farmers')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        async create(farmer) {
            const { data, error } = await supabaseClient
                .from('farmers')
                .insert([farmer])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        async update(id, updates) {
            const { data, error } = await supabaseClient
                .from('farmers')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        async delete(id) {
            const { error } = await supabaseClient
                .from('farmers')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        },
        async search(query) {
            const { data, error } = await supabaseClient
                .from('farmers')
                .select('*')
                .or(`name.ilike.%${query}%,nik.ilike.%${query}%,phone.ilike.%${query}%`)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    },

    // Products
    products: {
        async getAll() {
            const { data, error } = await supabaseClient
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        async getActive() {
            const { data, error } = await supabaseClient
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('name');
            if (error) throw error;
            return data;
        },
        async getById(id) {
            const { data, error } = await supabaseClient
                .from('products')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        async create(product) {
            const { data, error } = await supabaseClient
                .from('products')
                .insert([product])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        async update(id, updates) {
            const { data, error } = await supabaseClient
                .from('products')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        async delete(id) {
            const { error } = await supabaseClient
                .from('products')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        }
    },

    // Transactions
    transactions: {
        async getAll() {
            const { data, error } = await supabaseClient
                .from('transactions')
                .select(`
                    *,
                    farmers:farmer_id (name, nik),
                    products:product_id (name, unit),
                    users:created_by (name)
                `)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        async getById(id) {
            const { data, error } = await supabaseClient
                .from('transactions')
                .select(`
                    *,
                    farmers:farmer_id (name, nik, phone, address),
                    products:product_id (name, description, unit),
                    users:created_by (name)
                `)
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        async create(transaction) {
            const { data, error } = await supabaseClient
                .from('transactions')
                .insert([transaction])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        async update(id, updates) {
            const { data, error } = await supabaseClient
                .from('transactions')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        async delete(id) {
            const { error } = await supabaseClient
                .from('transactions')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        },
        async getByDateRange(startDate, endDate) {
            const { data, error } = await supabaseClient
                .from('transactions')
                .select(`
                    *,
                    farmers:farmer_id (name, nik),
                    products:product_id (name, unit)
                `)
                .gte('transaction_date', startDate)
                .lte('transaction_date', endDate)
                .order('transaction_date', { ascending: false });
            if (error) throw error;
            return data;
        },
        async getDaily(date) {
            const { data, error } = await supabaseClient
                .from('transactions')
                .select(`
                    *,
                    farmers:farmer_id (name),
                    products:product_id (name)
                `)
                .eq('transaction_date', date)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
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
        },
        async getStats() {
            const { data, error } = await supabaseClient
                .from('transactions')
                .select('total_amount, transaction_date');
            if (error) throw error;
            return data;
        }
    },

    // Settings
    settings: {
        async getAll() {
            const { data, error } = await supabaseClient
                .from('settings')
                .select('*');
            if (error) throw error;
            return data;
        },
        async getByKey(key) {
            const { data, error } = await supabaseClient
                .from('settings')
                .select('*')
                .eq('key', key)
                .single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        },
        async set(key, value, description = null) {
            const existing = await this.getByKey(key);
            if (existing) {
                const { data, error } = await supabaseClient
                    .from('settings')
                    .update({ value, description, updated_at: new Date() })
                    .eq('key', key)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            } else {
                const { data, error } = await supabaseClient
                    .from('settings')
                    .insert([{ key, value, description }])
                    .select()
                    .single();
                if (error) throw error;
                return data;
            }
        }
    }
};

// Make db available globally
window.db = db;

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
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
}
window.formatCurrency = formatCurrency;

// Format date
function formatDate(dateString) {
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