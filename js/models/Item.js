/**
 * Item Model - Entidade de domínio para produtos
 * Clean Architecture: Domain Layer
 */
class Item {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.name = data.name || '';
        this.category = data.category || 'Roupas';
        this.price = parseFloat(data.price) || 0;
        this.cost = parseFloat(data.cost) || 0;
        this.stock = data.stock || {};
        this.qrCodeNumber = data.qrCodeNumber || null;
        this.brand = data.brand || '';
        this.style = data.style || '';
        this.size = data.size || '';
        this.gender = data.gender || '';
        this.model = data.model || '';
        this.capacity = data.capacity || '';
        this.color = data.color || '';
        this.tags = data.tags || [];
        this.notes = data.notes || '';
        this.active = data.active !== undefined ? data.active : true;
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
    }
    
    generateId() {
        return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Calcula margem de lucro
     */
    getMargin() {
        if (this.cost === 0) return 0;
        return ((this.price - this.cost) / this.cost) * 100;
    }
    
    /**
     * Verifica se tem estoque disponível
     */
    hasStock(size = '', color = '') {
        if (size || color) {
            const key = `${size}_${color}`.trim();
            return this.stock[key] > 0;
        }
        // Se não especificou, verifica se tem algum estoque
        return Object.values(this.stock).some(qty => qty > 0);
    }
    
    /**
     * Obtém quantidade em estoque
     */
    getStockQuantity(size = '', color = '') {
        if (size || color) {
            const key = `${size}_${color}`.trim();
            return this.stock[key] || 0;
        }
        // Retorna soma total
        return Object.values(this.stock).reduce((sum, qty) => sum + qty, 0);
    }
    
    /**
     * Adiciona estoque
     */
    addStock(quantity, size = '', color = '') {
        const key = `${size}_${color}`.trim();
        this.stock[key] = (this.stock[key] || 0) + quantity;
        this.updatedAt = Date.now();
    }
    
    /**
     * Remove estoque
     */
    removeStock(quantity, size = '', color = '') {
        const key = `${size}_${color}`.trim();
        const current = this.stock[key] || 0;
        this.stock[key] = Math.max(0, current - quantity);
        this.updatedAt = Date.now();
    }
    
    /**
     * Valida dados do item
     */
    validate() {
        const errors = [];
        
        if (!this.name || this.name.trim().length < 2) {
            errors.push('Nome do produto deve ter pelo menos 2 caracteres');
        }
        
        if (this.price < 0) {
            errors.push('Preço não pode ser negativo');
        }
        
        if (this.cost < 0) {
            errors.push('Custo não pode ser negativo');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Converte para objeto plano (para serialização)
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            category: this.category,
            price: this.price,
            cost: this.cost,
            stock: this.stock,
            qrCodeNumber: this.qrCodeNumber,
            brand: this.brand,
            style: this.style,
            size: this.size,
            gender: this.gender,
            model: this.model,
            capacity: this.capacity,
            color: this.color,
            tags: this.tags,
            notes: this.notes,
            active: this.active,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}

window.Item = Item;
