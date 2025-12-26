/**
 * ItemController - Controller para Items
 * Clean Architecture: Presentation/Application Layer
 * 
 * Responsabilidade: Coordenar entre UI e Services, gerenciar estado de UI
 */
class ItemController {
    constructor(itemService, eventBus) {
        this.service = itemService;
        this.eventBus = eventBus || window.eventBus;
        this.currentEditingItem = null;
        
        // Bind métodos
        this.handleCreate = this.handleCreate.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
    }
    
    /**
     * Inicializa o controller (registra event listeners)
     */
    init() {
        // Registrar listeners de eventos
        this.eventBus.on('item:create', this.handleCreate);
        this.eventBus.on('item:update', this.handleUpdate);
        this.eventBus.on('item:delete', this.handleDelete);
        this.eventBus.on('item:search', this.handleSearch);
    }
    
    /**
     * Lista todos os items
     */
    async listItems(filters = {}) {
        try {
            const items = await this.service.listItems(filters);
            this.eventBus.emit('item:listed', items);
            return items;
        } catch (error) {
            this.eventBus.emit('item:error', { action: 'list', error });
            throw error;
        }
    }
    
    /**
     * Busca item por ID
     */
    async getItem(id) {
        try {
            const item = await this.service.getItem(id);
            this.eventBus.emit('item:loaded', item);
            return item;
        } catch (error) {
            this.eventBus.emit('item:error', { action: 'get', error });
            throw error;
        }
    }
    
    /**
     * Cria novo item (handler de evento)
     */
    async handleCreate(data) {
        try {
            const item = await this.service.createItem(data);
            this.eventBus.emit('item:created', item);
            return item;
        } catch (error) {
            this.eventBus.emit('item:error', { action: 'create', error });
            throw error;
        }
    }
    
    /**
     * Atualiza item existente (handler de evento)
     */
    async handleUpdate({ id, data }) {
        try {
            const item = await this.service.updateItem(id, data);
            this.eventBus.emit('item:updated', item);
            return item;
        } catch (error) {
            this.eventBus.emit('item:error', { action: 'update', error });
            throw error;
        }
    }
    
    /**
     * Remove item (handler de evento)
     */
    async handleDelete(id) {
        try {
            await this.service.deleteItem(id);
            this.eventBus.emit('item:deleted', { id });
            return true;
        } catch (error) {
            this.eventBus.emit('item:error', { action: 'delete', error });
            throw error;
        }
    }
    
    /**
     * Busca items (handler de evento)
     */
    async handleSearch(searchTerm) {
        try {
            const items = await this.service.searchItems(searchTerm);
            this.eventBus.emit('item:searched', { searchTerm, items });
            return items;
        } catch (error) {
            this.eventBus.emit('item:error', { action: 'search', error });
            throw error;
        }
    }
    
    /**
     * Adiciona estoque
     */
    async addStock(itemId, quantity, size = '', color = '') {
        try {
            const item = await this.service.addStock(itemId, quantity, size, color);
            this.eventBus.emit('item:stock:added', { itemId, quantity, item });
            return item;
        } catch (error) {
            this.eventBus.emit('item:error', { action: 'addStock', error });
            throw error;
        }
    }
    
    /**
     * Remove estoque
     */
    async removeStock(itemId, quantity, size = '', color = '') {
        try {
            const item = await this.service.removeStock(itemId, quantity, size, color);
            this.eventBus.emit('item:stock:removed', { itemId, quantity, item });
            return item;
        } catch (error) {
            this.eventBus.emit('item:error', { action: 'removeStock', error });
            throw error;
        }
    }
    
    /**
     * Busca items com estoque baixo
     */
    async getLowStockItems(threshold = 5) {
        try {
            const items = await this.service.findLowStockItems(threshold);
            this.eventBus.emit('item:lowStock', items);
            return items;
        } catch (error) {
            this.eventBus.emit('item:error', { action: 'lowStock', error });
            throw error;
        }
    }
    
    /**
     * Define item atual sendo editado
     */
    setCurrentEditingItem(item) {
        this.currentEditingItem = item;
        this.eventBus.emit('item:editing:changed', item);
    }
    
    /**
     * Limpa item atual sendo editado
     */
    clearCurrentEditingItem() {
        this.currentEditingItem = null;
        this.eventBus.emit('item:editing:cleared');
    }
}

window.ItemController = ItemController;
