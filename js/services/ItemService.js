/**
 * ItemService - Lógica de negócio para Items
 * Clean Architecture: Application Layer
 * 
 * Responsabilidade: Regras de negócio e orquestração relacionadas a Items
 */
class ItemService {
    constructor(itemRepository) {
        this.repository = itemRepository;
    }
    
    /**
     * Lista todos os items
     */
    async listItems(filters = {}) {
        if (Object.keys(filters).length === 0) {
            return await this.repository.findAll();
        }
        return await this.repository.findBy(filters);
    }
    
    /**
     * Busca item por ID
     */
    async getItem(id) {
        if (!id) {
            throw new Error('ID do item é obrigatório');
        }
        return await this.repository.findById(id);
    }
    
    /**
     * Cria novo item
     */
    async createItem(data) {
        // Item deve estar disponível globalmente ou via import
        const ItemClass = window.Item || Item;
        const item = new ItemClass(data);
        
        // Gerar QR code se não tiver
        if (!item.qrCodeNumber) {
            item.qrCodeNumber = this.generateQRCodeNumber();
        }
        
        return await this.repository.save(item);
    }
    
    /**
     * Atualiza item existente
     */
    async updateItem(id, data) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new Error(`Item com ID ${id} não encontrado`);
        }
        
        // Mescla dados
        const updated = new Item({ ...existing.toJSON(), ...data, id });
        return await this.repository.save(updated);
    }
    
    /**
     * Remove item
     */
    async deleteItem(id) {
        const item = await this.repository.findById(id);
        if (!item) {
            throw new Error(`Item com ID ${id} não encontrado`);
        }
        
        // Regra de negócio: não permitir deletar item com vendas associadas
        // (isso seria verificado em um SalesService)
        
        return await this.repository.delete(id);
    }
    
    /**
     * Adiciona estoque ao item
     */
    async addStock(itemId, quantity, size = '', color = '') {
        const item = await this.repository.findById(itemId);
        if (!item) {
            throw new Error(`Item com ID ${itemId} não encontrado`);
        }
        
        if (quantity <= 0) {
            throw new Error('Quantidade deve ser maior que zero');
        }
        
        item.addStock(quantity, size, color);
        return await this.repository.save(item);
    }
    
    /**
     * Remove estoque do item
     */
    async removeStock(itemId, quantity, size = '', color = '') {
        const item = await this.repository.findById(itemId);
        if (!item) {
            throw new Error(`Item com ID ${itemId} não encontrado`);
        }
        
        const available = item.getStockQuantity(size, color);
        if (quantity > available) {
            throw new Error(`Estoque insuficiente. Disponível: ${available}`);
        }
        
        item.removeStock(quantity, size, color);
        return await this.repository.save(item);
    }
    
    /**
     * Busca items com estoque baixo
     */
    async findLowStockItems(threshold = 5) {
        const items = await this.repository.findActive();
        return items.filter(item => {
            const totalStock = item.getStockQuantity();
            return totalStock > 0 && totalStock <= threshold;
        });
    }
    
    /**
     * Gera número de QR code único
     */
    generateQRCodeNumber() {
        return `QR${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
    
    /**
     * Busca items por termo de busca
     */
    async searchItems(searchTerm) {
        if (!searchTerm || searchTerm.trim().length < 2) {
            return [];
        }
        
        return await this.repository.findBy({ search: searchTerm });
    }
}

window.ItemService = ItemService;
