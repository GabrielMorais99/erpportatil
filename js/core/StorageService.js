/**
 * StorageService - Abstração de persistência de dados
 * Clean Architecture: Infrastructure Layer
 * 
 * Suporta: IndexedDB (preferencial) e localStorage (fallback)
 */
class StorageService {
    constructor() {
        this.dbName = 'erp_portatil_db';
        this.dbVersion = 1;
        this.db = null;
        this.useIndexedDB = 'indexedDB' in window;
        this.stores = {
            items: 'items',
            clients: 'clients',
            sales: 'sales',
            groups: 'groups',
            costs: 'costs',
            goals: 'goals',
            suppliers: 'suppliers',
            coupons: 'coupons',
            templates: 'templates',
            serviceGroups: 'serviceGroups',
            pendingOrders: 'pendingOrders',
            serviceAppointments: 'serviceAppointments',
            auditLog: 'auditLog',
            backups: 'backups',
        };
    }
    
    /**
     * Inicializa o storage (IndexedDB ou localStorage)
     */
    async init() {
        if (this.useIndexedDB) {
            try {
                await this.initIndexedDB();
            } catch (error) {
                console.warn('[StorageService] Falha ao inicializar IndexedDB, usando localStorage:', error);
                this.useIndexedDB = false;
            }
        }
    }
    
    /**
     * Inicializa IndexedDB
     */
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Criar object stores para cada entidade
                Object.values(this.stores).forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, { keyPath: 'id' });
                        store.createIndex('updatedAt', 'updatedAt', { unique: false });
                    }
                });
            };
        });
    }
    
    /**
     * Salva dados no storage
     */
    async save(storeName, data) {
        if (this.useIndexedDB && this.db) {
            return this.saveIndexedDB(storeName, data);
        } else {
            return this.saveLocalStorage(storeName, data);
        }
    }
    
    /**
     * Carrega dados do storage
     */
    async load(storeName) {
        if (this.useIndexedDB && this.db) {
            return this.loadIndexedDB(storeName);
        } else {
            return this.loadLocalStorage(storeName);
        }
    }
    
    /**
     * Remove dados do storage
     */
    async remove(storeName, id) {
        if (this.useIndexedDB && this.db) {
            return this.removeIndexedDB(storeName, id);
        } else {
            return this.removeLocalStorage(storeName, id);
        }
    }
    
    /**
     * Limpa todos os dados de um store
     */
    async clear(storeName) {
        if (this.useIndexedDB && this.db) {
            return this.clearIndexedDB(storeName);
        } else {
            return this.clearLocalStorage(storeName);
        }
    }
    
    // Métodos IndexedDB
    async saveIndexedDB(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            // Se for array, salva cada item
            if (Array.isArray(data)) {
                const requests = data.map(item => store.put({ ...item, updatedAt: Date.now() }));
                Promise.all(requests)
                    .then(() => resolve())
                    .catch(reject);
            } else {
                // Se for objeto único
                const request = store.put({ ...data, updatedAt: Date.now() });
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            }
        });
    }
    
    async loadIndexedDB(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }
    
    async removeIndexedDB(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    async clearIndexedDB(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    // Métodos localStorage (fallback)
    async saveLocalStorage(storeName, data) {
        try {
            const key = `erp_${storeName}`;
            const toSave = Array.isArray(data) ? data : [data];
            localStorage.setItem(key, JSON.stringify(toSave));
        } catch (error) {
            console.error(`[StorageService] Erro ao salvar ${storeName} no localStorage:`, error);
            throw error;
        }
    }
    
    async loadLocalStorage(storeName) {
        try {
            const key = `erp_${storeName}`;
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error(`[StorageService] Erro ao carregar ${storeName} do localStorage:`, error);
            return [];
        }
    }
    
    async removeLocalStorage(storeName, id) {
        try {
            const key = `erp_${storeName}`;
            const stored = await this.loadLocalStorage(storeName);
            const filtered = stored.filter(item => item.id !== id);
            localStorage.setItem(key, JSON.stringify(filtered));
        } catch (error) {
            console.error(`[StorageService] Erro ao remover ${storeName} do localStorage:`, error);
            throw error;
        }
    }
    
    async clearLocalStorage(storeName) {
        try {
            const key = `erp_${storeName}`;
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`[StorageService] Erro ao limpar ${storeName} do localStorage:`, error);
            throw error;
        }
    }
}

// Exportar instância singleton
window.StorageService = StorageService;
