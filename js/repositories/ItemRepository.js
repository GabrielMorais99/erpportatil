/**
 * ItemRepository - Repositório para persistência de Itens
 * Clean Architecture: Application/Infrastructure Layer
 * 
 * Responsabilidade: Abstrair acesso aos dados de Items
 */
class ItemRepository {
    constructor(storageService) {
        this.storage = storageService;
        this.storeName = 'items';
    }
    
    /**
     * Busca todos os items
     */
    async findAll() {
        const data = await this.storage.load(this.storeName);
        return data.map(item => new Item(item));
    }
    
    /**
     * Busca item por ID
     */
    async findById(id) {
        const items = await this.findAll();
        return items.find(item => item.id === id) || null;
    }
    
    /**
     * Busca items por critérios
     */
    async findBy(criteria) {
        const items = await this.findAll();
        
        return items.filter(item => {
            return Object.entries(criteria).every(([key, value]) => {
                if (key === 'search') {
                    // Busca em múltiplos campos
                    const searchLower = value.toLowerCase();
                    return (
                        item.name.toLowerCase().includes(searchLower) ||
                        item.brand?.toLowerCase().includes(searchLower) ||
                        item.category?.toLowerCase().includes(searchLower) ||
                        item.tags.some(tag => tag.toLowerCase().includes(searchLower))
                    );
                }
                return item[key] === value;
            });
        });
    }
    
    /**
     * Salva item (cria ou atualiza)
     */
    async save(item) {
        if (!(item instanceof Item)) {
            item = new Item(item);
        }
        
        // Validação
        const validation = item.validate();
        if (!validation.valid) {
            throw new Error(`Item inválido: ${validation.errors.join(', ')}`);
        }
        
        // Atualiza timestamp
        item.updatedAt = Date.now();
        
        // Busca todos os items existentes
        const items = await this.findAll();
        
        // Verifica se já existe
        const index = items.findIndex(i => i.id === item.id);
        if (index >= 0) {
            items[index] = item;
        } else {
            items.push(item);
        }
        
        // Salva no storage
        await this.storage.save(this.storeName, items);
        
        return item;
    }
    
    /**
     * Remove item por ID
     */
    async delete(id) {
        const items = await this.findAll();
        const filtered = items.filter(item => item.id !== id);
        await this.storage.save(this.storeName, filtered);
        return true;
    }
    
    /**
     * Conta total de items
     */
    async count() {
        const items = await this.findAll();
        return items.length;
    }
    
    /**
     * Busca items ativos
     */
    async findActive() {
        return this.findBy({ active: true });
    }
    
    /**
     * Busca items por categoria
     */
    async findByCategory(category) {
        return this.findBy({ category });
    }
    
    /**
     * Busca items por tag
     */
    async findByTag(tag) {
        const items = await this.findAll();
        return items.filter(item => item.tags.includes(tag));
    }
}

window.ItemRepository = ItemRepository;
