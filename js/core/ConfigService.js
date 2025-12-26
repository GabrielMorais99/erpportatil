/**
 * ConfigService - Gerenciamento centralizado de configurações
 * Clean Architecture: Infrastructure Layer
 */
class ConfigService {
    constructor() {
        this.config = {
            // Configurações de pagamento
            payment: {
                pagseguro: { enabled: false, email: '', token: '' },
                mercadoPago: { enabled: false, accessToken: '', publicKey: '' },
                stripe: { enabled: false, publishableKey: '', secretKey: '' },
                pix: { enabled: true, key: '', merchantName: '', merchantCity: '' },
            },
            
            // Configurações de e-commerce
            ecommerce: {
                woocommerce: {
                    enabled: false,
                    url: '',
                    consumerKey: '',
                    consumerSecret: '',
                },
                shopify: { enabled: false, shop: '', apiKey: '', apiSecret: '' },
                mercadoLivre: {
                    enabled: false,
                    clientId: '',
                    clientSecret: '',
                    accessToken: '',
                },
            },
            
            // Configurações de ERP
            erp: {
                totvs: { enabled: false, url: '', user: '', password: '' },
                sap: { enabled: false, url: '', user: '', password: '' },
            },
            
            // Configurações de email
            email: {
                enabled: false,
                provider: 'smtp', // smtp, sendgrid, ses, mailgun
                smtp: {
                    host: '',
                    port: 587,
                    secure: false,
                    user: '',
                    password: '',
                },
            },
            
            // Configurações de SMS
            sms: {
                enabled: false,
                provider: 'twilio', // twilio, zenvia, totalvoice
                twilio: { accountSid: '', authToken: '', from: '' },
            },
            
            // Configurações de WhatsApp
            whatsapp: {
                enabled: false,
                provider: 'business', // business, twilio
                business: { apiUrl: '', accessToken: '', phoneNumberId: '' },
            },
            
            // Configurações gerais
            general: {
                currency: 'R$',
                language: 'pt-BR',
                timezone: 'America/Sao_Paulo',
                maxDiscount: 50,
            },
            
            // Configurações de cache
            cache: {
                charts: { ttl: 5 * 60 * 1000 }, // 5 minutos
                data: { ttl: 1 * 60 * 1000 }, // 1 minuto
                images: { ttl: 24 * 60 * 60 * 1000 }, // 24 horas
            },
            
            // Configurações de segurança
            security: {
                inactivityTimeout: 30 * 60 * 1000, // 30 minutos
                maxAuditLogSize: 1000,
                encryptionEnabled: true,
            },
        };
    }
    
    /**
     * Obtém configuração por caminho (ex: 'payment.pix.enabled')
     */
    get(path, defaultValue = null) {
        const keys = path.split('.');
        let value = this.config;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    }
    
    /**
     * Define configuração por caminho
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let target = this.config;
        
        for (const key of keys) {
            if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {};
            }
            target = target[key];
        }
        
        target[lastKey] = value;
    }
    
    /**
     * Carrega configurações do storage
     */
    async load() {
        try {
            const stored = localStorage.getItem('app_config');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.config = { ...this.config, ...parsed };
            }
        } catch (error) {
            console.error('[ConfigService] Erro ao carregar configurações:', error);
        }
    }
    
    /**
     * Salva configurações no storage
     */
    async save() {
        try {
            localStorage.setItem('app_config', JSON.stringify(this.config));
        } catch (error) {
            console.error('[ConfigService] Erro ao salvar configurações:', error);
        }
    }
    
    /**
     * Reseta configurações para padrão
     */
    reset() {
        this.config = new ConfigService().config;
    }
}

// Exportar instância singleton
window.ConfigService = ConfigService;
