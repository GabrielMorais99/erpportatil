/**
 * App Bootstrap - Inicialização da aplicação com Clean Architecture
 * 
 * Responsabilidade: Configurar e inicializar todos os módulos
 */
class AppBootstrap {
    constructor() {
        this.storage = null;
        this.config = null;
        this.repositories = {};
        this.services = {};
        this.controllers = {};
        this.eventBus = null;
    }
    
    /**
     * Inicializa a aplicação
     */
    async init() {
        try {
            console.log('[AppBootstrap] Inicializando aplicação...');
            
            // 1. Inicializar EventBus
            this.eventBus = window.eventBus || new EventBus();
            console.log('[AppBootstrap] ✅ EventBus inicializado');
            
            // 2. Inicializar ConfigService
            this.config = new ConfigService();
            await this.config.load();
            console.log('[AppBootstrap] ✅ ConfigService inicializado');
            
            // 3. Inicializar StorageService
            this.storage = new StorageService();
            await this.storage.init();
            console.log('[AppBootstrap] ✅ StorageService inicializado');
            
            // 4. Criar Repositories
            this.initRepositories();
            console.log('[AppBootstrap] ✅ Repositories inicializados');
            
            // 5. Criar Services
            this.initServices();
            console.log('[AppBootstrap] ✅ Services inicializados');
            
            // 6. Criar Controllers
            this.initControllers();
            console.log('[AppBootstrap] ✅ Controllers inicializados');
            
            // 7. Expor instâncias globalmente (compatibilidade)
            this.exposeGlobally();
            
            console.log('[AppBootstrap] ✅ Aplicação inicializada com sucesso!');
            
            return {
                storage: this.storage,
                config: this.config,
                repositories: this.repositories,
                services: this.services,
                controllers: this.controllers,
                eventBus: this.eventBus
            };
            
        } catch (error) {
            console.error('[AppBootstrap] ❌ Erro ao inicializar aplicação:', error);
            throw error;
        }
    }
    
    /**
     * Inicializa repositories
     */
    initRepositories() {
        // ItemRepository
        if (typeof ItemRepository !== 'undefined') {
            this.repositories.item = new ItemRepository(this.storage);
        }
        
        // Adicionar outros repositories aqui conforme forem criados
        // this.repositories.client = new ClientRepository(this.storage);
        // this.repositories.sale = new SaleRepository(this.storage);
    }
    
    /**
     * Inicializa services
     */
    initServices() {
        // ItemService
        if (typeof ItemService !== 'undefined' && this.repositories.item) {
            this.services.item = new ItemService(this.repositories.item);
        }
        
        // Adicionar outros services aqui conforme forem criados
        // this.services.client = new ClientService(this.repositories.client);
        // this.services.sale = new SaleService(this.repositories.sale, this.services.item);
    }
    
    /**
     * Inicializa controllers
     */
    initControllers() {
        // ItemController
        if (typeof ItemController !== 'undefined' && this.services.item) {
            this.controllers.item = new ItemController(this.services.item, this.eventBus);
            this.controllers.item.init();
        }
        
        // Adicionar outros controllers aqui conforme forem criados
        // this.controllers.client = new ClientController(this.services.client, this.eventBus);
        // this.controllers.sale = new SaleController(this.services.sale, this.eventBus);
    }
    
    /**
     * Expõe instâncias globalmente (para compatibilidade com código legado)
     */
    exposeGlobally() {
        window.appBootstrap = this;
        window.storageService = this.storage;
        window.configService = this.config;
        window.eventBus = this.eventBus;
        
        // Expor controllers
        if (this.controllers.item) {
            window.itemController = this.controllers.item;
        }
        
        // Expor services (se necessário)
        if (this.services.item) {
            window.itemService = this.services.item;
        }
    }
    
    /**
     * Obtém instância de um controller
     */
    getController(name) {
        return this.controllers[name] || null;
    }
    
    /**
     * Obtém instância de um service
     */
    getService(name) {
        return this.services[name] || null;
    }
    
    /**
     * Obtém instância de um repository
     */
    getRepository(name) {
        return this.repositories[name] || null;
    }
}

window.AppBootstrap = AppBootstrap;
