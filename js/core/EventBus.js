/**
 * EventBus - Sistema de eventos pub/sub
 * Clean Architecture: Infrastructure Layer
 * 
 * Permite comunicação desacoplada entre módulos
 */
class EventBus {
    constructor() {
        this.events = new Map();
    }
    
    /**
     * Registra um listener para um evento
     */
    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName).push(callback);
        
        // Retorna função para remover listener
        return () => this.off(eventName, callback);
    }
    
    /**
     * Remove um listener
     */
    off(eventName, callback) {
        if (!this.events.has(eventName)) return;
        
        const callbacks = this.events.get(eventName);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }
    
    /**
     * Emite um evento
     */
    emit(eventName, data = null) {
        if (!this.events.has(eventName)) return;
        
        const callbacks = this.events.get(eventName);
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`[EventBus] Erro ao executar callback para evento ${eventName}:`, error);
            }
        });
    }
    
    /**
     * Remove todos os listeners de um evento
     */
    clear(eventName) {
        if (eventName) {
            this.events.delete(eventName);
        } else {
            this.events.clear();
        }
    }
    
    /**
     * Retorna quantidade de listeners para um evento
     */
    listenerCount(eventName) {
        return this.events.has(eventName) ? this.events.get(eventName).length : 0;
    }
}

// Exportar instância singleton global
window.EventBus = EventBus;
window.eventBus = new EventBus();
