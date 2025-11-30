/**
 * ========================================
 * SISTEMA ERP - GESTÃO FINANCEIRA
 * ========================================
 * 
 * @fileoverview Sistema ERP completo para gestão de loja/vendas
 * @description Sistema Full Stack (HTML, CSS, JavaScript) sem frameworks pesados
 * 
 * MÓDULOS PRINCIPAIS:
 * - Gestão de Produtos (Estoque, Categorias, Tags)
 * - Gestão de Vendas (Vendas, Pedidos Pendentes, Recibos)
 * - Gestão de Clientes (Cadastro, Fidelidade, Notificações)
 * - Gestão de Fornecedores
 * - Gestão Financeira (Custos, Metas, Relatórios)
 * - Serviços (Agendamentos, Grupos Mensais)
 * - Integrações (E-commerce, ERP, Email, SMS, WhatsApp)
 * - Multiusuário (Permissões, Auditoria, LGPD)
 * 
 * PERSISTÊNCIA:
 * - localStorage (fallback)
 * - IndexedDB (quando disponível)
 * - JSONBin.io (sincronização na nuvem)
 * 
 * ARQUITETURA:
 * - Classe principal: LojaApp
 * - Sistema de notificações: ToastSystem
 * - Sistema de confirmações: ConfirmSystem
 * - Sistema de loading: LoadingOverlay
 * - Validação de campos: FieldValidator
 * 
 * PARA IAs (GitHub Copilot / Continue.dev):
 * - Use comentários descritivos para gerar código
 * - Funções seguem padrão: nomeDescritivo(parametros)
 * - Validações sempre verificam permissões
 * - Regras de negócio documentadas nos comentários
 * 
 * @author Sistema ERP
 * @version 2.0
 * @since 2024
 */

// ========== APP.JS CARREGADO ==========
console.log('🟣 [APP.JS] Script carregado e executando...');

// ========================================
// SISTEMA DE NOTIFICAÇÕES TOAST
// ========================================
class ToastSystem {
    constructor() {
        this.container = this.createContainer();
        this.toasts = [];
    }

    createContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            
            // Aguardar DOM estar pronto
            if (document.body) {
                document.body.appendChild(container);
            } else {
                // Se body não existe ainda, aguardar
                const initContainer = () => {
                    if (document.body) {
                        document.body.appendChild(container);
                    } else {
                        setTimeout(initContainer, 10);
                    }
                };
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initContainer);
                } else {
                    initContainer();
                }
            }
        }
        return container;
    }

    show(message, type = 'info', duration = 3000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Animar entrada
        requestAnimationFrame(() => {
            setTimeout(() => toast.classList.add('show'), 10);
        });

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => this.hide(toast), duration);
        }

        return toast;
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = this.getIcon(type);
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="toast-message">${this.escapeHtml(message)}</div>
            <button class="toast-close" aria-label="Fechar notificação" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Adicionar evento de clique no toast para fechar
        toast.addEventListener('click', (e) => {
            if (e.target.classList.contains('toast-close') || e.target.closest('.toast-close')) {
                this.hide(toast);
            }
        });

        return toast;
    }

    hide(toast) {
        if (!toast || !toast.parentElement) return;
        
        toast.classList.add('hiding');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 200);
    }

    getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Métodos de conveniência
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
}

// ========================================
// SISTEMA DE CONFIRMAÇÃO CUSTOMIZADO
// ========================================
class ConfirmSystem {
    constructor() {
        this.modal = this.createModal();
    }

    createModal() {
        let modal = document.getElementById('confirm-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'confirm-modal';
            modal.className = 'confirm-modal';
            modal.innerHTML = `
                <div class="confirm-modal-content">
                    <div class="confirm-modal-header">
                        <div class="confirm-modal-icon" id="confirm-modal-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 class="confirm-modal-title" id="confirm-modal-title">Confirmar ação</h3>
                    </div>
                    <div class="confirm-modal-body" id="confirm-modal-body">
                        Tem certeza que deseja continuar?
                    </div>
                    <div class="confirm-modal-actions">
                        <button class="confirm-modal-btn confirm-modal-btn-cancel" id="confirm-modal-cancel">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button class="confirm-modal-btn confirm-modal-btn-confirm" id="confirm-modal-confirm">
                            <i class="fas fa-check"></i> Confirmar
                        </button>
                    </div>
                </div>
            `;
            
            // Aguardar DOM estar pronto
            const appendModal = () => {
                if (document.body) {
                    document.body.appendChild(modal);
                } else {
                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', appendModal);
                    } else {
                        setTimeout(appendModal, 10);
                    }
                }
            };
            appendModal();

            // Fechar ao clicar fora
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close();
                }
            });

            // Fechar com ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    this.close();
                }
            });
        }
        return modal;
    }

    show(options = {}) {
        return new Promise((resolve) => {
            const {
                title = 'Confirmar ação',
                message = 'Tem certeza que deseja continuar?',
                type = 'warning', // warning, danger, info
                confirmText = 'Confirmar',
                cancelText = 'Cancelar',
                confirmButtonClass = 'confirm-modal-btn-confirm',
                icon = null
            } = options;

            const iconEl = this.modal.querySelector('#confirm-modal-icon');
            const titleEl = this.modal.querySelector('#confirm-modal-title');
            const bodyEl = this.modal.querySelector('#confirm-modal-body');
            const confirmBtn = this.modal.querySelector('#confirm-modal-confirm');
            const cancelBtn = this.modal.querySelector('#confirm-modal-cancel');

            // Configurar ícone
            iconEl.className = `confirm-modal-icon ${type}`;
            if (icon) {
                iconEl.innerHTML = `<i class="fas fa-${icon}"></i>`;
            } else {
                const defaultIcons = {
                    warning: 'exclamation-triangle',
                    danger: 'exclamation-circle',
                    info: 'info-circle'
                };
                iconEl.innerHTML = `<i class="fas fa-${defaultIcons[type] || 'exclamation-triangle'}"></i>`;
            }

            // Configurar conteúdo
            titleEl.textContent = title;
            bodyEl.textContent = message;
            confirmBtn.textContent = confirmText;
            confirmBtn.className = `confirm-modal-btn ${confirmButtonClass}`;
            cancelBtn.textContent = cancelText;

            // Remover listeners anteriores
            const newConfirmBtn = confirmBtn.cloneNode(true);
            const newCancelBtn = cancelBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

            // Adicionar novos listeners
            newConfirmBtn.addEventListener('click', () => {
                this.close();
                resolve(true);
            });

            newCancelBtn.addEventListener('click', () => {
                this.close();
                resolve(false);
            });

            // Mostrar modal
            this.modal.classList.add('active');
            
            // Focar no botão de cancelar por padrão (mais seguro)
            setTimeout(() => newCancelBtn.focus(), 100);
        });
    }

    close() {
        this.modal.classList.remove('active');
    }

    // Métodos de conveniência
    confirm(message, title = 'Confirmar ação') {
        return this.show({ message, title, type: 'warning' });
    }

    danger(message, title = 'Atenção!') {
        return this.show({ 
            message, 
            title, 
            type: 'danger',
            confirmButtonClass: 'confirm-modal-btn-danger',
            confirmText: 'Excluir'
        });
    }

    info(message, title = 'Informação') {
        return this.show({ message, title, type: 'info' });
    }
}

// Instâncias globais (serão inicializadas quando o DOM estiver pronto)
let toast;
let confirmDialog;

// Inicializar instâncias quando DOM estiver pronto
const initToastAndConfirm = () => {
    if (!toast) {
        toast = new ToastSystem();
    }
    if (!confirmDialog) {
        confirmDialog = new ConfirmSystem();
    }
};

// Tentar inicializar imediatamente se DOM já estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToastAndConfirm);
} else {
    // DOM já está pronto
    initToastAndConfirm();
}

// ========================================
// SISTEMA DE LOADING OVERLAY
// ========================================
class LoadingOverlay {
    constructor() {
        this.overlay = this.createOverlay();
    }

    createOverlay() {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-overlay-content">
                    <div class="loading-overlay-spinner"></div>
                    <div class="loading-overlay-message" id="loading-overlay-message">Carregando...</div>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    show(message = 'Carregando...') {
        const messageEl = this.overlay.querySelector('#loading-overlay-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
        this.overlay.classList.add('active');
    }

    hide() {
        this.overlay.classList.remove('active');
    }
}

// Instância global de LoadingOverlay
let loadingOverlay;

const initLoadingOverlay = () => {
    if (!loadingOverlay) {
        loadingOverlay = new LoadingOverlay();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoadingOverlay);
} else {
    initLoadingOverlay();
}

// ========================================
// SISTEMA DE VALIDAÇÃO EM TEMPO REAL
// ========================================
class FieldValidator {
    constructor() {
        this.validators = {
            required: (value) => value.trim().length > 0,
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            minLength: (value, min) => value.length >= min,
            maxLength: (value, max) => value.length <= max,
            cpf: (value) => {
                const clean = value.replace(/\D/g, '');
                return clean.length === 11;
            },
            phone: (value) => {
                const clean = value.replace(/\D/g, '');
                return clean.length >= 10 && clean.length <= 11;
            },
            number: (value) => !isNaN(value) && value !== '',
            positive: (value) => parseFloat(value) > 0,
        };
    }

    validateField(field, rules = {}) {
        const value = field.value;
        const errors = [];
        let isValid = true;

        // Validação required
        if (rules.required && !this.validators.required(value)) {
            errors.push('Este campo é obrigatório');
            isValid = false;
        }

        // Validação email
        if (rules.email && value && !this.validators.email(value)) {
            errors.push('Email inválido');
            isValid = false;
        }

        // Validação minLength
        if (rules.minLength && value && !this.validators.minLength(value, rules.minLength)) {
            errors.push(`Mínimo de ${rules.minLength} caracteres`);
            isValid = false;
        }

        // Validação maxLength
        if (rules.maxLength && value && !this.validators.maxLength(value, rules.maxLength)) {
            errors.push(`Máximo de ${rules.maxLength} caracteres`);
            isValid = false;
        }

        // Validação CPF
        if (rules.cpf && value && !this.validators.cpf(value)) {
            errors.push('CPF inválido');
            isValid = false;
        }

        // Validação phone
        if (rules.phone && value && !this.validators.phone(value)) {
            errors.push('Telefone inválido');
            isValid = false;
        }

        // Validação number
        if (rules.number && value && !this.validators.number(value)) {
            errors.push('Deve ser um número');
            isValid = false;
        }

        // Validação positive
        if (rules.positive && value && !this.validators.positive(value)) {
            errors.push('Deve ser maior que zero');
            isValid = false;
        }

        return { isValid, errors };
    }

    setupFieldValidation(field, rules = {}) {
        // Criar wrapper se não existir
        let wrapper = field.parentElement;
        if (!wrapper.classList.contains('field-wrapper')) {
            wrapper = document.createElement('div');
            wrapper.className = 'field-wrapper';
            field.parentElement.insertBefore(wrapper, field);
            wrapper.appendChild(field);
        }

        // Adicionar ícone de status
        let statusIcon = wrapper.querySelector('.field-status');
        if (!statusIcon) {
            statusIcon = document.createElement('i');
            statusIcon.className = 'field-status fas';
            wrapper.appendChild(statusIcon);
        }

        // Adicionar mensagem de erro
        let messageEl = wrapper.querySelector('.field-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'field-message';
            wrapper.appendChild(messageEl);
        }

        // Adicionar contador de caracteres se maxLength
        let charCounter = null;
        if (rules.maxLength) {
            charCounter = wrapper.querySelector('.char-counter');
            if (!charCounter) {
                charCounter = document.createElement('div');
                charCounter.className = 'char-counter';
                wrapper.appendChild(charCounter);
            }
        }

        // Função de validação
        const validate = () => {
            const { isValid, errors } = this.validateField(field, rules);

            // Atualizar classes
            field.classList.remove('valid', 'invalid');
            if (field.value.trim() !== '') {
                field.classList.add(isValid ? 'valid' : 'invalid');
            }

            // Atualizar ícone
            statusIcon.className = 'field-status fas';
            if (field.value.trim() !== '') {
                statusIcon.classList.add(isValid ? 'fa-check-circle' : 'fa-exclamation-circle', isValid ? 'valid' : 'invalid');
            } else {
                statusIcon.classList.remove('fa-check-circle', 'fa-exclamation-circle', 'valid', 'invalid');
            }

            // Atualizar mensagem
            messageEl.className = 'field-message';
            if (errors.length > 0) {
                messageEl.classList.add('error', 'show');
                messageEl.textContent = errors[0];
            } else if (field.value.trim() !== '' && isValid) {
                messageEl.classList.add('success', 'show');
                messageEl.textContent = 'Campo válido';
            } else {
                messageEl.classList.remove('show');
            }

            // Atualizar contador
            if (charCounter) {
                const length = field.value.length;
                const max = rules.maxLength;
                charCounter.textContent = `${length}/${max}`;
                charCounter.classList.remove('warning', 'error');
                if (length > max * 0.9) {
                    charCounter.classList.add('error');
                } else if (length > max * 0.75) {
                    charCounter.classList.add('warning');
                }
            }

            return isValid;
        };

        // Event listeners
        field.addEventListener('input', validate);
        field.addEventListener('blur', validate);

        // Validação inicial
        if (field.value) {
            validate();
        }
    }
}

// Instância global de FieldValidator
const fieldValidator = new FieldValidator();

/**
 * ========================================
 * CLASSE PRINCIPAL: LojaApp
 * ========================================
 * 
 * @class LojaApp
 * @description Classe principal do sistema ERP de gestão financeira
 * 
 * RESPONSABILIDADES:
 * - Gerenciar estado da aplicação (produtos, vendas, clientes, etc.)
 * - Coordenar operações entre módulos
 * - Gerenciar persistência de dados
 * - Controlar UI e interações do usuário
 * - Validar permissões e regras de negócio
 * 
 * ESTRUTURA DE DADOS:
 * - items: Array de produtos
 * - clients: Array de clientes
 * - suppliers: Array de fornecedores
 * - completedSales: Array de vendas concluídas
 * - pendingOrders: Array de pedidos pendentes
 * - costs: Array de custos
 * - goals: Array de metas
 * 
 * PARA IAs:
 * - Ao criar novas funções, seguir padrão de nomenclatura
 * - Sempre validar permissões antes de operações críticas
 * - Documentar regras de negócio nos comentários
 * - Usar this.logAction() para auditoria
 */
class LojaApp {
    /**
     * @constructor
     * @description Inicializa todas as propriedades e estruturas de dados do sistema
     * 
     * INICIALIZA:
     * - Arrays de dados (items, clients, sales, etc.)
     * - Configurações (payment, ecommerce, erp, email, sms, whatsapp)
     * - Sistemas auxiliares (cache, timers, locks)
     * - Chama this.init() para setup completo
     */
    constructor() {
        this.items = [];
        this.groups = [];
        this.serviceGroups = []; // Grupos mensais de serviços
        this.costs = [];
        this.goals = [];
        this.clients = []; // Clientes cadastrados
        this.clientNotifications = []; // Notificações para clientes
        this.suppliers = []; // Fornecedores cadastrados
        this.completedSales = []; // Vendas concluídas com dados completos
        this.pendingOrders = []; // Pedidos pendentes
        this.serviceAppointments = []; // Agendamentos de serviços
        this.currentEditingItem = null;
        this.currentEditingClient = null;
        this.currentEditingCoupon = null;
        this.currentEditingSupplier = null;
        this.currentGroup = null;
        this.currentServiceGroup = null;
        this.currentServiceDay = null;
        this.currentSaleDay = null;
        this.currentEditingCost = null;
        this.currentEditingGoal = null;
        this.currentQRScanner = null; // Scanner de QR code
        this.advancedSearchQRScanner = null; // Scanner QR para busca avançada
        this.currentEditingPendingOrder = null; // Pedido pendente sendo editado
        this.currentEditingServiceAppointment = null; // Agendamento sendo editado
        this.currentDashboardType = 'sales'; // 'sales' ou 'services'
        this.avgStockChart = null; // Gráfico de média de estoque
        this.goalsChart = null; // Gráfico de metas
        this.costsChart = null; // Gráfico de custos
        this.servicesChart = null; // Gráfico de serviços
        this.chartCache = {}; // Cache de dados de gráficos: { chartId: { data, timestamp, ttl } }
        this.cacheStrategies = {
            charts: { ttl: 5 * 60 * 1000 }, // 5 minutos
            data: { ttl: 1 * 60 * 1000 }, // 1 minuto
            images: { ttl: 24 * 60 * 60 * 1000 }, // 24 horas
        };
        this.tutorialStep = 0; // Passo atual do tutorial
        this.tutorialActive = false; // Se o tutorial está ativo
        this.searchHistory = []; // Histórico de buscas
        this.searchDebounceTimer = null; // Timer para debounce de busca
        this.clientSearchDebounceTimer = null; // Timer para debounce de busca de clientes
        this.supplierSearchDebounceTimer = null; // Timer para debounce de busca de fornecedores
        this.coupons = []; // Cupons de desconto
        this.auditLog = []; // Histórico de alterações
        this.templates = []; // Templates de produtos, vendas, serviços
        this.currentEditingTemplate = null;
        this.itemTags = {}; // Tags por item: { itemId: ['tag1', 'tag2'] }
        this.dataAccessLogs = []; // Logs de acesso a dados pessoais (LGPD)
        this.cookieConsent = null; // Consentimento de cookies
        this.actionThrottle = {}; // Throttling de ações: { action: timestamp }
        this.requestQueue = []; // Fila de requisições para rate limiting
        this.lastRequestTime = 0; // Timestamp da última requisição
        this.requestCount = 0; // Contador de requisições no período
        this.requestWindowStart = Date.now(); // Início da janela de rate limiting
        this.inactivityTimer = null; // Timer para logout automático
        this.inactivityTimeout = 30 * 60 * 1000; // 30 minutos de inatividade
        this.lastActivityTime = Date.now(); // Última atividade do usuário
        this.backupHistory = []; // Histórico de backups: [{ id, timestamp, data, checksum }]
        this.encryptionKeys = {}; // Chaves de criptografia por usuário: { username: CryptoKey }
        this.encryptionEnabled = true; // Habilitar criptografia por padrão
        this.backupInterval = null; // Intervalo de backup automático
        this.lastBackupTime = null; // Última vez que o backup foi feito
        this.userPermissions = {}; // Permissões por usuário: { username: { level, permissions } }
        this.entityLocks = {}; // Locks de entidades: { entityType_entityId: { username, timestamp } }
        this.maxAuditLogSize = 1000; // Limitar tamanho do log para performance
        this.indexedDB = null; // Instância do IndexedDB
        this.paymentConfig = { // Configurações de pagamento
            pagseguro: { enabled: false, email: '', token: '' },
            mercadoPago: { enabled: false, accessToken: '', publicKey: '' },
            stripe: { enabled: false, publishableKey: '', secretKey: '' },
            pix: { enabled: true, key: '', merchantName: '', merchantCity: '' }
        };
        this.ecommerceConfig = { // Configurações de e-commerce
            woocommerce: { enabled: false, url: '', consumerKey: '', consumerSecret: '' },
            shopify: { enabled: false, shop: '', apiKey: '', apiSecret: '' },
            mercadoLivre: { enabled: false, clientId: '', clientSecret: '', accessToken: '' }
        };
        this.erpConfig = { // Configurações de ERPs
            totvs: { enabled: false, url: '', username: '', password: '', database: '' },
            sap: { enabled: false, url: '', username: '', password: '', client: '' },
            outros: []
        };
        this.emailConfig = { // Configurações de email
            enabled: false,
            provider: 'smtp',
            smtp: { host: '', port: 587, secure: false, username: '', password: '' },
            sendgrid: { apiKey: '' },
            ses: { accessKeyId: '', secretAccessKey: '', region: 'us-east-1' },
            mailgun: { apiKey: '', domain: '' }
        };
        this.smsConfig = { // Configurações de SMS
            enabled: false,
            provider: 'twilio',
            twilio: { accountSid: '', authToken: '', fromNumber: '' },
            zenvia: { apiKey: '', fromNumber: '' },
            totalvoice: { accessToken: '', fromNumber: '' }
        };
        this.useIndexedDB = false; // Flag para usar IndexedDB quando disponível
        this.dbName = 'LojaGestaoDB';
        this.dbVersion = 1;
        this.voiceRecognition = null; // Instância do reconhecimento de voz
        this.voiceRecognitionActive = false; // Flag para controle de reconhecimento de voz
        this.voiceCommands = {}; // Mapeamento de comandos de voz
        this.pullToRefresh = {
            startY: 0,
            currentY: 0,
            isPulling: false,
            threshold: 80, // Distância mínima para ativar refresh
            maxPull: 120, // Distância máxima de pull
        };
        this.scheduledReports = []; // Relatórios agendados: [{ id, config, scheduleDate, frequency, lastRun, nextRun }]
        this.sharedReports = []; // Relatórios compartilhados: [{ id, config, sharedWith, sharedAt, message }]
        this.scheduledExports = []; // Exportações agendadas: [{ id, config, scheduleDate, frequency, lastRun, nextRun }]
        this.scheduleCheckInterval = null; // Intervalo para verificar agendamentos
        this.exportScheduleCheckInterval = null; // Intervalo para verificar agendamentos de exportações
        this.emailTracking = {}; // Tracking de abertura de emails: { emailId: { sentAt, openedAt, openedCount, recipients } }
        this.whatsappConfig = { // Configurações de WhatsApp
            enabled: false,
            provider: 'whatsapp_business',
            apiKey: '',
            phoneNumberId: '',
            businessAccountId: '',
            webhookUrl: ''
        };
        this.whatsappChats = []; // Chats com clientes: [{ id, clientId, messages, lastMessageAt, unreadCount }]
        this.whatsappAutomations = []; // Automações de mensagens: [{ id, trigger, message, enabled }]

        this.init();
    }

    // ========== AUDIT LOG (Histórico de Alterações) ==========

    /**
     * Registrar ação no log de auditoria
     * @param {string} action - Tipo de ação ('create', 'update', 'delete', 'view', 'export')
     * @param {string} entityType - Tipo de entidade ('item', 'client', 'supplier', etc.)
     * @param {string} entityId - ID da entidade
     * @param {string} entityName - Nome da entidade
     * @param {Object} details - Detalhes adicionais (pode incluir previousData para reversão)
     * 
     * NOTA: Para ações de 'update', é recomendado passar previousData em details ANTES de fazer a atualização
     * Exemplo: logAction('update', 'item', itemId, itemName, { previousData: dadosAntigos })
     */
    logAction(action, entityType, entityId, entityName, details = {}) {
        const username = sessionStorage.getItem('username') || 'unknown';
        const timestamp = new Date().toISOString();
        
        // Se previousData já foi fornecido em details, usar ele
        // Caso contrário, tentar buscar (pode não funcionar se já foi atualizado)
        let previousData = details.previousData || null;
        if (action === 'update' && !previousData && entityId) {
            // Tentar buscar do histórico de logs (última versão antes desta atualização)
            previousData = this.getPreviousDataFromAuditLog(entityType, entityId);
        }
        
        if (previousData) {
            details.previousData = previousData;
        }
        
        const logEntry = {
            id: 'AUDIT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            action: action, // 'create', 'update', 'delete', 'view', 'export', etc.
            entityType: entityType, // 'item', 'client', 'supplier', 'coupon', 'sale', 'cost', 'goal', etc.
            entityId: entityId,
            entityName: entityName,
            username: username,
            timestamp: timestamp,
            details: details, // Informações adicionais sobre a alteração (pode incluir previousData)
            reversible: (action === 'update' && previousData !== null) || (action === 'create' && entityId !== null), // Flag para indicar se pode ser revertido
        };

        this.auditLog.unshift(logEntry); // Adicionar no início

        // Limitar tamanho do log (manter apenas os últimos N registros)
        if (this.auditLog.length > this.maxAuditLogSize) {
            this.auditLog = this.auditLog.slice(0, this.maxAuditLogSize);
        }

        // Salvar automaticamente (mas não bloquear a operação principal)
        setTimeout(() => {
            this.saveData();
        }, 100);
    }

    /**
     * Obter dados anteriores do audit log (última versão antes da atualização atual)
     * @param {string} entityType - Tipo de entidade
     * @param {string} entityId - ID da entidade
     * @returns {Object|null} Dados anteriores ou null
     */
    getPreviousDataFromAuditLog(entityType, entityId) {
        try {
            // Buscar no audit log a última entrada de update ou create para esta entidade
            // (excluindo a entrada atual que está sendo criada)
            const relevantLogs = this.auditLog
                .filter(log => 
                    log.entityType === entityType && 
                    log.entityId === entityId && 
                    (log.action === 'update' || log.action === 'create')
                )
                .slice(1); // Pular a primeira (que é a atual sendo criada)
            
            if (relevantLogs.length > 0) {
                const lastLog = relevantLogs[0];
                // Se o último log tinha previousData, podemos tentar reconstruir
                // Mas o ideal é que as funções de update passem previousData diretamente
                return null; // Por enquanto retornar null, pois não temos dados anteriores confiáveis
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar dados anteriores do audit log:', error);
            return null;
        }
    }

    renderAuditLog(containerId = 'auditLogList', limit = 100) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Aplicar filtros
        const actionFilter = document.getElementById('auditLogFilter')?.value || 'all';
        const entityFilter = document.getElementById('auditLogEntityFilter')?.value || 'all';
        
        let filteredLogs = this.auditLog;
        
        if (actionFilter !== 'all') {
            filteredLogs = filteredLogs.filter(log => log.action === actionFilter);
        }
        
        if (entityFilter !== 'all') {
            filteredLogs = filteredLogs.filter(log => log.entityType === entityFilter);
        }

        const logs = filteredLogs.slice(0, limit);

        if (logs.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">
                        <i class="fas fa-history"></i>
                    </div>
                    <h3 class="empty-state-title">Nenhuma alteração registrada</h3>
                    <p class="empty-state-message">
                        O histórico de alterações aparecerá aqui conforme você usar o sistema.
                    </p>
                </div>`;
            return;
        }

        const actionIcons = {
            create: 'fa-plus-circle',
            update: 'fa-edit',
            delete: 'fa-trash',
            view: 'fa-eye',
            export: 'fa-download',
            import: 'fa-upload',
            login: 'fa-sign-in-alt',
            logout: 'fa-sign-out-alt',
        };

        const actionColors = {
            create: '#28a745',
            update: '#ffc107',
            delete: '#dc3545',
            view: '#17a2b8',
            export: '#6c757d',
            import: '#6c757d',
            login: '#28a745',
            logout: '#dc3545',
        };

        const entityTypeNames = {
            item: 'Produto',
            client: 'Cliente',
            supplier: 'Fornecedor',
            coupon: 'Cupom',
            sale: 'Venda',
            cost: 'Custo',
            goal: 'Meta',
            group: 'Grupo Mensal',
            serviceGroup: 'Grupo de Serviços',
            pendingOrder: 'Pedido Pendente',
            serviceAppointment: 'Agendamento',
        };

        container.innerHTML = logs
            .map((log) => {
                const actionName = {
                    create: 'Criou',
                    update: 'Atualizou',
                    delete: 'Excluiu',
                    view: 'Visualizou',
                    export: 'Exportou',
                    import: 'Importou',
                    login: 'Entrou',
                    logout: 'Saiu',
                }[log.action] || log.action;

                const icon = actionIcons[log.action] || 'fa-circle';
                const color = actionColors[log.action] || '#6c757d';
                const entityName = entityTypeNames[log.entityType] || log.entityType;
                const date = new Date(log.timestamp);
                const dateStr = date.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
                const timeStr = date.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                });

                // Verificar se pode reverter
                // - update: pode reverter se tiver previousData ou flag reversible
                // - create: pode reverter (deletar)
                // - delete: não pode reverter automaticamente (precisa backup)
                const canRevert = (
                    (log.action === 'update' && (log.reversible || (log.details && log.details.previousData))) ||
                    (log.action === 'create' && log.entityId && log.entityType)
                ) && log.entityId && log.entityType;
                
                return `
                <div class="item-card" style="border-left: 4px solid ${color}; position: relative;">
                    <div class="item-header">
                        <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
                            <i class="fas ${icon}" style="color: ${color}; font-size: 1.1rem;"></i>
                            <div style="flex: 1;">
                                <h3 style="margin: 0; font-size: 0.95rem; font-weight: 600;">${actionName} ${entityName}</h3>
                                ${log.entityName ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--gray-600);"><i class="fas fa-tag"></i> ${this.escapeHtml(log.entityName)}</p>` : ''}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem;">
                            <div style="font-size: 0.75rem; color: var(--gray-500);">
                                ${dateStr}
                            </div>
                            <div style="font-size: 0.75rem; color: var(--gray-500);">
                                ${timeStr}
                            </div>
                        </div>
                    </div>
                    <div class="item-details" style="padding-top: 0.75rem; border-top: 1px solid var(--border-color); margin-top: 0.75rem;">
                        <p style="margin: 0.5rem 0;"><i class="fas fa-user" style="color: var(--primary-color);"></i> <strong>Usuário:</strong> ${this.escapeHtml(log.username)}</p>
                        ${log.details && Object.keys(log.details).length > 0 ? `
                            <details style="margin-top: 0.5rem;">
                                <summary style="cursor: pointer; color: var(--primary-color); font-size: 0.85rem; font-weight: 500;">
                                    <i class="fas fa-info-circle"></i> Ver Detalhes
                                </summary>
                                <div style="margin-top: 0.5rem; padding: 0.75rem; background: var(--light-gray); border-radius: var(--radius-sm); font-size: 0.85rem;">
                                    ${Object.entries(log.details).map(([key, value]) => 
                                        `<p style="margin: 0.25rem 0;"><strong>${this.escapeHtml(key)}:</strong> ${this.escapeHtml(String(value))}</p>`
                                    ).join('')}
                                </div>
                            </details>
                        ` : ''}
                        ${canRevert ? `
                            <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-color);">
                                <button class="btn-small btn-secondary" onclick="app.revertAuditLogAction('${log.id}')" style="font-size: 0.8rem;">
                                    <i class="fas fa-undo"></i> Reverter Ação
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            })
            .join('');
    }

    /**
     * Reverter ação do audit log
     * @description Restaura dados anteriores de uma atualização ou informa sobre limitações
     * @param {string} logId - ID do log a ser revertido
     */
    revertAuditLogAction(logId) {
        const log = this.auditLog.find(l => l.id === logId);
        if (!log) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Registro de log não encontrado.', 3000);
            }
            return;
        }

        if (!log.entityId || !log.entityType) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Esta ação não pode ser revertida (dados insuficientes).', 3000);
            }
            return;
        }

        const performRevert = async (confirmed) => {
            if (!confirmed) return;

            try {
                if (log.action === 'delete') {
                    // Reverter exclusão - não é possível restaurar dados deletados sem backup
                    if (typeof toast !== 'undefined' && toast) {
                        toast.warning('Não é possível reverter exclusões automaticamente. Use o backup para restaurar dados.', 4000);
                    }
                    return;
                } else if (log.action === 'update') {
                    // Reverter atualização - restaurar dados anteriores
                    if (log.details && log.details.previousData) {
                        const previousData = log.details.previousData;
                        const success = this.restoreEntityData(log.entityType, log.entityId, previousData);
                        
                        if (success) {
                            // Salvar alterações
                            this.saveData();
                            
                            // Atualizar UI
                            this.updateUIAfterRevert(log.entityType);
                            
                            // Registrar reversão no audit log
                            this.logAction('revert', log.entityType, log.entityId, log.entityName, {
                                revertedFrom: log.id,
                                revertedAction: log.action,
                                revertedAt: log.timestamp
                            });
                            
                            if (typeof toast !== 'undefined' && toast) {
                                toast.success(`Ação revertida com sucesso! ${log.entityName || log.entityType} restaurado.`, 3000);
                            }
                        } else {
                            if (typeof toast !== 'undefined' && toast) {
                                toast.error('Erro ao restaurar dados. A entidade pode não existir mais.', 4000);
                            }
                        }
                    } else {
                        if (typeof toast !== 'undefined' && toast) {
                            toast.warning('Dados anteriores não disponíveis para reversão. Esta ação foi registrada antes da implementação de reversão.', 4000);
                        }
                    }
                } else if (log.action === 'create') {
                    // Reverter criação = deletar
                    const success = this.deleteEntityForRevert(log.entityType, log.entityId);
                    
                    if (success) {
                        this.saveData();
                        this.updateUIAfterRevert(log.entityType);
                        
                        this.logAction('revert', log.entityType, log.entityId, log.entityName, {
                            revertedFrom: log.id,
                            revertedAction: log.action
                        });
                        
                        if (typeof toast !== 'undefined' && toast) {
                            toast.success(`Criação revertida. ${log.entityName || log.entityType} removido.`, 3000);
                        }
                    } else {
                        if (typeof toast !== 'undefined' && toast) {
                            toast.error('Erro ao reverter criação. A entidade pode não existir mais.', 4000);
                        }
                    }
                }
            } catch (error) {
                console.error('Erro ao reverter ação:', error);
                if (typeof toast !== 'undefined' && toast) {
                    toast.error('Erro ao reverter ação. Verifique o console para mais detalhes.', 4000);
                }
            }
        };

        if (typeof confirmDialog !== 'undefined' && confirmDialog) {
            confirmDialog.confirm(
                `Tem certeza que deseja reverter a ação "${log.action}" em "${log.entityName || log.entityType}"?`,
                'Reverter Ação',
                { type: 'warning' }
            ).then(performRevert);
        } else {
            if (confirm(`Tem certeza que deseja reverter a ação "${log.action}"?`)) {
                performRevert(true);
            }
        }
    }

    /**
     * Restaurar dados de uma entidade
     * @param {string} entityType - Tipo de entidade
     * @param {string} entityId - ID da entidade
     * @param {Object} previousData - Dados anteriores
     * @returns {boolean} Se a restauração foi bem-sucedida
     */
    restoreEntityData(entityType, entityId, previousData) {
        try {
            switch (entityType) {
                case 'item':
                    const itemIndex = this.items.findIndex(i => i.id === entityId);
                    if (itemIndex !== -1) {
                        this.items[itemIndex] = JSON.parse(JSON.stringify(previousData));
                        return true;
                    }
                    break;
                case 'client':
                    const clientIndex = this.clients.findIndex(c => c.id === entityId);
                    if (clientIndex !== -1) {
                        this.clients[clientIndex] = JSON.parse(JSON.stringify(previousData));
                        return true;
                    }
                    break;
                case 'supplier':
                    const supplierIndex = this.suppliers.findIndex(s => s.id === entityId);
                    if (supplierIndex !== -1) {
                        this.suppliers[supplierIndex] = JSON.parse(JSON.stringify(previousData));
                        return true;
                    }
                    break;
                case 'cost':
                    const costIndex = this.costs.findIndex(c => c.id === entityId);
                    if (costIndex !== -1) {
                        this.costs[costIndex] = JSON.parse(JSON.stringify(previousData));
                        return true;
                    }
                    break;
                case 'goal':
                    const goalIndex = this.goals.findIndex(g => g.id === entityId);
                    if (goalIndex !== -1) {
                        this.goals[goalIndex] = JSON.parse(JSON.stringify(previousData));
                        return true;
                    }
                    break;
            }
            return false;
        } catch (error) {
            console.error('Erro ao restaurar dados:', error);
            return false;
        }
    }

    /**
     * Deletar entidade para reverter criação
     * @param {string} entityType - Tipo de entidade
     * @param {string} entityId - ID da entidade
     * @returns {boolean} Se a deleção foi bem-sucedida
     */
    deleteEntityForRevert(entityType, entityId) {
        try {
            switch (entityType) {
                case 'item':
                    const itemIndex = this.items.findIndex(i => i.id === entityId);
                    if (itemIndex !== -1) {
                        this.items.splice(itemIndex, 1);
                        return true;
                    }
                    break;
                case 'client':
                    const clientIndex = this.clients.findIndex(c => c.id === entityId);
                    if (clientIndex !== -1) {
                        this.clients.splice(clientIndex, 1);
                        return true;
                    }
                    break;
                case 'supplier':
                    const supplierIndex = this.suppliers.findIndex(s => s.id === entityId);
                    if (supplierIndex !== -1) {
                        this.suppliers.splice(supplierIndex, 1);
                        return true;
                    }
                    break;
                case 'cost':
                    const costIndex = this.costs.findIndex(c => c.id === entityId);
                    if (costIndex !== -1) {
                        this.costs.splice(costIndex, 1);
                        return true;
                    }
                    break;
                case 'goal':
                    const goalIndex = this.goals.findIndex(g => g.id === entityId);
                    if (goalIndex !== -1) {
                        this.goals.splice(goalIndex, 1);
                        return true;
                    }
                    break;
            }
            return false;
        } catch (error) {
            console.error('Erro ao deletar entidade para reversão:', error);
            return false;
        }
    }

    /**
     * Atualizar UI após reversão
     * @param {string} entityType - Tipo de entidade revertida
     */
    updateUIAfterRevert(entityType) {
        switch (entityType) {
            case 'item':
                this.renderItems();
                break;
            case 'client':
                this.renderClients();
                break;
            case 'supplier':
                this.renderSuppliers();
                break;
            case 'cost':
                this.renderCosts();
                break;
            case 'goal':
                this.renderGoals();
                break;
        }
        
        // Atualizar audit log também
        this.renderAuditLog();
    }

    init() {
        // Verificar se está em modo de teste
        const isTestMode = window.TEST_MODE === true;
        
        console.log(
            '🟣 [APP.JS] ========== INICIALIZANDO APLICAÇÃO =========='
        );
        console.log('🟣 [APP.JS] URL atual:', window.location.href);
        console.log('🟣 [APP.JS] Document readyState:', document.readyState);
        console.log('🟣 [APP.JS] Modo de teste:', isTestMode);
        console.log('🟣 [APP.JS] SessionStorage:', {
            loggedIn: sessionStorage.getItem('loggedIn'),
            username: sessionStorage.getItem('username'),
            allKeys: Object.keys(sessionStorage),
        });

        // Verificar autenticação
        const isLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
        console.log('🟣 [APP.JS] Verificando autenticação...');
        console.log('🟣 [APP.JS] Status de login:', isLoggedIn);

        if (!isLoggedIn) {
            // Em modo de teste, não redirecionar, apenas avisar
            if (isTestMode) {
                console.log('ℹ️ [APP.JS] Modo de teste: pulando redirecionamento de autenticação');
            } else {
                console.warn('⚠️ [APP.JS] Usuário NÃO autenticado!');
                console.log('🟡 [APP.JS] Redirecionando para /index.html...');
                try {
                    window.location.href = '/index.html';
                    console.log('✅ [APP.JS] Redirecionamento executado');
                } catch (error) {
                    console.error('❌ [APP.JS] Erro ao redirecionar:', error);
                    window.location.href = 'index.html';
                }
                return;
            }
        }

        console.log(
            '✅ [APP.JS] Usuário autenticado! Continuando inicialização...'
        );

        // Função para adicionar log (apenas no console)
        const addDebugLog = (msg) => {
            if (window.console && console.log) {
                console.log('🟣 [APP.JS] ' + msg);
            }
        };

        addDebugLog('Usuário autenticado, continuando...');

        // Verificar se é admin ANTES de qualquer coisa
        const username = sessionStorage.getItem('username');
        if (username === 'admin') {
            // Esconder botão "Como usar" e modal de tutorial imediatamente
            const helpBtn = document.getElementById('helpBtn');
            if (helpBtn) {
                helpBtn.style.display = 'none';
            }
            // Esconder modal de tutorial se estiver visível
            const tutorialModal = document.getElementById('tutorialModal');
            if (tutorialModal) {
                tutorialModal.classList.remove('active');
                tutorialModal.style.display = 'none';
            }
        }

        // Aguardar um pouco para garantir que o DOM está totalmente pronto
        setTimeout(() => {
            addDebugLog('Iniciando setup...');

            // Verificar se é admin e mostrar apenas aba de administração
            if (username === 'admin') {
                // Esconder todas as outras abas
                const allTabBtns = document.querySelectorAll('.tab-btn');
                allTabBtns.forEach((btn) => {
                    const tab = btn.getAttribute('data-tab');
                    if (tab !== 'adminPanel') {
                        btn.style.display = 'none';
                    }
                });

                // Mostrar apenas a aba de administração
                const adminTabBtn = document.getElementById('adminTabBtn');
                if (adminTabBtn) {
                    // Verificar permissão de visualizar admin
                    if (this.checkPermission('viewAdmin')) {
                        adminTabBtn.style.display = 'flex';
                    } else {
                        adminTabBtn.style.display = 'none';
                    }
                }

                // Esconder todas as outras seções de conteúdo
                const allTabContents = document.querySelectorAll('.tab-content');
                allTabContents.forEach((content) => {
                    if (content.id !== 'adminPanelTab') {
                        content.style.display = 'none';
                    }
                });

                // Esconder toolbar principal (não necessário para admin)
                const mainToolbar = document.getElementById('mainToolbar');
                if (mainToolbar) {
                    mainToolbar.style.display = 'none';
                }

                // Garantir que o botão "Como usar" está escondido
                const helpBtnAgain = document.getElementById('helpBtn');
                if (helpBtnAgain) {
                    helpBtnAgain.style.display = 'none';
                }

                // Não carregar dados desnecessários para admin
                // Apenas carregar dados do admin
                setTimeout(() => {
                    this.switchTab('adminPanel');
                }, 100);
            }

            // Carregar tema salvo
            this.loadTheme();

            // Verificar consentimento de cookies (LGPD)
            this.checkCookieConsent();

            // Iniciar monitoramento de inatividade (logout automático)
            this.startInactivityMonitoring();

            // Inicializar PWA
            this.initPWA();

            // Inicializar lazy loading
            this.initLazyLoading();

            // Inicializar navegação por teclado
            this.initKeyboardNavigation();

            // Inicializar cache inteligente
            this.initCacheCleanup();

            // Configurar throttle de scroll
            this.setupScrollThrottle();

            // Inicializar IndexedDB
            this.initIndexedDB();

            // Inicializar navegação por voz
            this.initVoiceNavigation();

            // Inicializar pull-to-refresh
            this.initPullToRefresh();

            // Inicializar verificador de agendamentos de relatórios
            if (this.scheduledReports && this.scheduledReports.length > 0) {
                this.initScheduleChecker();
            }
            
            // Inicializar verificador de agendamentos de exportações
            if (this.scheduledExports && this.scheduledExports.length > 0) {
                this.initExportScheduleChecker();
            }

            // Event listeners (deve ser chamado primeiro)
            this.setupEventListeners();

            // Garantir que o painel de vendas seja ativado por padrão (apenas para usuários normais)
            // Em modo de teste, pular renderizações de UI
            if (!isTestMode && username !== 'admin') {
                // Remover active de todas as tabs primeiro
                document.querySelectorAll('.tab-content').forEach((content) => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                });
                document.querySelectorAll('.tab-btn').forEach((btn) => {
                    btn.classList.remove('active');
                });

                // Ativar painel de vendas por padrão
                setTimeout(() => {
                    this.switchTab('salesPanel');
                }, 50);
            }

            // Carregar histórico de buscas
            this.loadSearchHistory();
            
            // Carregar dados apenas para usuários normais (não admin)
            if (username !== 'admin') {
                // Carregar dados (assíncrono)
                this.loadData().then(() => {
                    // Renderizar após carregar dados
                    this.renderGroups();
                    this.updateTagFilter(); // Atualizar lista de tags antes de renderizar
                    this.renderItems();
                    this.renderClients();
                    this.renderSuppliers();
                    this.renderTemplates();
                    this.renderCoupons();
                    this.renderPendingOrders();
                    
                    // Verificar alertas após carregar dados
                    setTimeout(() => {
                        this.checkPendingOrdersAlerts();
                        this.checkGoalsAlerts();
                        this.checkAppointmentsReminders();
                    }, 1000);
                    
                    // Carregar e iniciar backup automático se configurado
                    this.loadBackupHistory();
                    const username = sessionStorage.getItem('username');
                    if (username) {
                        const configStr = localStorage.getItem(`autoBackupConfig_${username}`);
                        if (configStr) {
                            try {
                                const config = JSON.parse(configStr);
                                if (config.enabled) {
                                    this.startAutoBackup(config.frequency || 'daily');
                                }
                            } catch (e) {
                                console.error('Erro ao carregar configuração de backup:', e);
                            }
                        }
                    }
                    // Renderizar carrossel APÓS carregar dados com um pequeno delay para garantir que o DOM está pronto
                    // Em modo de teste, pular renderizações de UI
                    if (!isTestMode) {
                        setTimeout(() => {
                            this.renderLastReceiptsCarousel();
                        }, 200);
                    }
                    this.renderServiceAppointments();
                    this.renderServiceGroups();
                    this.renderCosts();
                    this.renderGoals();
                this.updateMonthFilter();
                this.updateYearFilter();
                this.updateGoalsYearFilter();
                this.updateServicesYearFilter();
                this.updateOverallSummary();
                });
            }
        }, 100);
    }

    setupEventListeners() {
        // Verificar se está em modo de teste
        const isTestMode = window.TEST_MODE === true;
        const suppressWarnings = window.SUPPRESS_UI_WARNINGS === true;
        
        // Em modo de teste, pular configuração de event listeners
        if (isTestMode) {
            return;
        }
        
        // Função para adicionar log (apenas no console)
        function addDebugLog(msg) {
            if (window.console && console.log) {
                console.log('🟣 [APP.JS] ' + msg);
            }
        }

        addDebugLog('Configurando event listeners...');

        // Botões principais
        const logoutBtn = document.getElementById('logoutBtn');
        const themeToggleBtn = document.getElementById('themeToggleBtn');

        // Botão de troca de tema
        if (themeToggleBtn) {
            const self = this;
            themeToggleBtn.addEventListener('click', function () {
                self.toggleTheme();
            });
            addDebugLog('Listener anexado ao themeToggleBtn');
        }

        // Botão de dark mode
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.toggleDarkMode();
            });
            addDebugLog('Listener anexado ao darkModeToggle');
            // Carregar estado salvo
            this.loadDarkMode();
        }

        addDebugLog(
            'Elementos encontrados: logoutBtn=' +
                !!logoutBtn +
                ', themeToggleBtn=' +
                !!themeToggleBtn
        );

        if (logoutBtn) {
            const self = this;

            logoutBtn.onclick = function (e) {
                addDebugLog('logoutBtn CLICADO (onclick)!');
                e.preventDefault();
                e.stopPropagation();
                addDebugLog('Chamando logout()...');
                try {
                    self.logout();
                    addDebugLog('logout() chamado com sucesso!');
                } catch (error) {
                    addDebugLog('ERRO ao chamar logout(): ' + error.message);
                }
                return false;
            };

            logoutBtn.addEventListener(
                'click',
                function (e) {
                    addDebugLog('logoutBtn CLICADO (addEventListener)!');
                    e.preventDefault();
                    e.stopPropagation();
                    addDebugLog('Chamando logout()...');
                    try {
                        self.logout();
                        addDebugLog('logout() chamado com sucesso!');
                    } catch (error) {
                        addDebugLog(
                            'ERRO ao chamar logout(): ' + error.message
                        );
                    }
                },
                true
            );

            addDebugLog(
                'Listener anexado ao logoutBtn (onclick + addEventListener)'
            );
        } else {
            addDebugLog('ERRO: logoutBtn não encontrado!');
        }

        // Importar/Exportar
        const helpBtn = document.getElementById('helpBtn');
        const importBtn = document.getElementById('importBtn');
        const importFile = document.getElementById('importFile');
        const exportBtn = document.getElementById('exportBtn');
        
        // Verificar se é admin e esconder botão "Como usar" e modal de tutorial
        const currentUsername = sessionStorage.getItem('username');
        if (currentUsername === 'admin') {
            if (helpBtn) {
                helpBtn.style.display = 'none';
            }
            // Esconder modal de tutorial se estiver visível
            const tutorialModal = document.getElementById('tutorialModal');
            if (tutorialModal) {
                tutorialModal.classList.remove('active');
                tutorialModal.style.display = 'none';
            }
        }

        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => {
                importFile.click();
            });
            console.log('✅ [APP.JS] Listener anexado ao importBtn');
        } else {
            console.error(
                '❌ [APP.JS] importBtn ou importFile não encontrado!'
            );
        }

        if (importFile) {
            importFile.addEventListener('change', (e) => this.importData(e));
            console.log('✅ [APP.JS] Listener anexado ao importFile');
        }

        // Export button agora abre modal (removido listener direto)
        // O botão já tem onclick="app.openExportModal()" no HTML

        // Botão de ajuda / Como usar (apenas para usuários não-admin)
        if (helpBtn && currentUsername !== 'admin') {
            helpBtn.addEventListener('click', () => this.openTutorialModal());
            console.log('✅ [APP.JS] Listener anexado ao helpBtn');
        } else if (helpBtn && currentUsername === 'admin') {
            // Garantir que está escondido para admin
            helpBtn.style.display = 'none';
            console.log('ℹ️ [APP.JS] helpBtn escondido para admin');
        } else {
            console.error('❌ [APP.JS] helpBtn não encontrado!');
        }

        // Tutorial
        const closeTutorialBtn = document.getElementById('closeTutorialBtn');
        const startTutorialBtn = document.getElementById('startTutorialBtn');
        const tutorialModalClose = document.querySelector(
            '#tutorialModal .close'
        );
        const closeTutorialTooltip = document.getElementById(
            'closeTutorialTooltip'
        );
        const tutorialNextBtn = document.getElementById('tutorialNextBtn');
        const tutorialPrevBtn = document.getElementById('tutorialPrevBtn');
        const tutorialSkipBtn = document.getElementById('tutorialSkipBtn');

        if (closeTutorialBtn) {
            closeTutorialBtn.addEventListener('click', (e) => {
                console.log('🟢 [TUTORIAL] Botão Fechar clicado');
                e.preventDefault();
                e.stopPropagation();
                this.closeTutorialModal();
            });
            // Também adicionar onclick como fallback
            closeTutorialBtn.onclick = (e) => {
                console.log('🟢 [TUTORIAL] Botão Fechar (onclick) clicado');
                e.preventDefault();
                e.stopPropagation();
                this.closeTutorialModal();
            };
        } else {
            console.error('❌ [TUTORIAL] closeTutorialBtn não encontrado!');
        }
        if (startTutorialBtn) {
            startTutorialBtn.addEventListener('click', () =>
                this.startInteractiveTutorial()
            );
        }
        if (tutorialModalClose) {
            tutorialModalClose.addEventListener('click', (e) => {
                console.log('🟢 [TUTORIAL] Botão X (close) clicado');
                e.preventDefault();
                e.stopPropagation();
                this.closeTutorialModal();
            });
            // Também adicionar onclick como fallback
            tutorialModalClose.onclick = (e) => {
                console.log('🟢 [TUTORIAL] Botão X (onclick) clicado');
                e.preventDefault();
                e.stopPropagation();
                this.closeTutorialModal();
            };
        } else {
            console.error('❌ [TUTORIAL] tutorialModalClose não encontrado!');
        }

        // Fechar modal ao clicar no overlay (fora do conteúdo)
        const tutorialModal = document.getElementById('tutorialModal');
        if (tutorialModal) {
            tutorialModal.addEventListener('click', (e) => {
                console.log('🟢 [TUTORIAL] Overlay clicado, target:', e.target, 'currentTarget:', e.currentTarget);
                // Se clicou diretamente no modal (overlay), fechar
                if (e.target === tutorialModal || e.target.id === 'tutorialModal') {
                    console.log('🟢 [TUTORIAL] Fechando modal via overlay');
                    this.closeTutorialModal();
                }
            }, true); // Usar capture phase para garantir que o evento seja capturado

            // Fechar modal com tecla ESC (usar capture no document)
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && tutorialModal.classList.contains('active')) {
                    console.log('🟢 [TUTORIAL] Tecla ESC pressionada');
                    e.preventDefault();
                    e.stopPropagation();
                    this.closeTutorialModal();
                }
            }, true);
        } else {
            console.error('❌ [TUTORIAL] tutorialModal não encontrado!');
        }
        if (closeTutorialTooltip) {
            closeTutorialTooltip.addEventListener('click', () =>
                this.closeTutorialTooltip()
            );
        }
        if (tutorialNextBtn) {
            tutorialNextBtn.addEventListener('click', () =>
                this.nextTutorialStep()
            );
        }
        if (tutorialPrevBtn) {
            tutorialPrevBtn.addEventListener('click', () =>
                this.prevTutorialStep()
            );
        }
        if (tutorialSkipBtn) {
            tutorialSkipBtn.addEventListener('click', () =>
                this.skipTutorial()
            );
        }

        // Verificar se é primeira vez e mostrar tutorial
        this.checkFirstTimeUser();

        // Tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        const dashboardToggleBtn =
            document.getElementById('dashboardToggleBtn');
        if (tabBtns.length > 0) {
            tabBtns.forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    // Se for o botão de toggle do dashboard, chamar toggleDashboard()
                    if (
                        btn.id === 'dashboardToggleBtn' ||
                        btn === dashboardToggleBtn
                    ) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.toggleDashboard();
                        return;
                    }
                    // Usar currentTarget para garantir que pegamos o botão, não o elemento filho (ícone/texto)
                    const tab = e.currentTarget.dataset.tab || btn.dataset.tab;
                    if (tab) {
                        this.switchTab(tab);
                    }
                });
            });
            console.log(
                '✅ [APP.JS] Listeners anexados aos tabs (' +
                    tabBtns.length +
                    ' tabs)'
            );
        } else {
            console.error('❌ [APP.JS] Nenhum tab-btn encontrado!');
        }

        // Dashboard
        const refreshDashboardBtn = document.getElementById('refreshDashboard');
        const periodFilter = document.getElementById('periodFilter');

        if (refreshDashboardBtn) {
            refreshDashboardBtn.addEventListener('click', () => {
                this.renderDashboard();
            });
        }

        if (periodFilter) {
            periodFilter.addEventListener('change', () => {
                this.renderDashboard();
            });
        }

        // Dashboard de Serviços
        const refreshServicesDashboard = document.getElementById(
            'refreshServicesDashboard'
        );
        const servicesPeriodFilter = document.getElementById(
            'servicesPeriodFilter'
        );

        if (refreshServicesDashboard) {
            refreshServicesDashboard.addEventListener('click', () => {
                this.renderServicesDashboard();
            });
        }

        if (servicesPeriodFilter) {
            servicesPeriodFilter.addEventListener('change', () => {
                this.renderServicesDashboard();
            });
        }

        // Pesquisa e filtro
        const searchInput = document.getElementById('searchInput');
        const monthFilter = document.getElementById('monthFilter');

        if (searchInput) {
            // Debounce para melhorar performance (padrão emergente.sh)
            searchInput.addEventListener('input', (e) => {
                // Limpar timer anterior
                if (this.searchDebounceTimer) {
                    clearTimeout(this.searchDebounceTimer);
                }
                
                // Novo timer com delay de 300ms (padrão emergente.sh)
                this.searchDebounceTimer = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
            
            // Salvar busca no histórico ao pressionar Enter
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && searchInput.value.trim()) {
                    this.addToSearchHistory(searchInput.value.trim());
                }
            });
            
            // Mostrar histórico ao focar
            searchInput.addEventListener('focus', () => {
                if (searchInput.value.trim() === '') {
                    this.showSearchHistory();
                }
            });
            
            // Esconder histórico ao clicar fora
            document.addEventListener('click', (e) => {
                const historyContainer = document.getElementById('searchHistoryContainer');
                if (historyContainer && !historyContainer.contains(e.target) && e.target !== searchInput) {
                    this.hideSearchHistory();
                }
            });
            
            console.log('✅ [APP.JS] Listener anexado ao searchInput (com debounce)');
        } else {
            console.error('❌ [APP.JS] searchInput não encontrado!');
        }

        if (monthFilter) {
            monthFilter.addEventListener('change', () => this.renderItems());
            console.log('✅ [APP.JS] Listener anexado ao monthFilter');
        } else {
            console.error('❌ [APP.JS] monthFilter não encontrado!');
        }

        // Filtro de ano para grupos mensais
        const yearFilter = document.getElementById('yearFilter');
        if (yearFilter) {
            yearFilter.addEventListener('change', () => this.renderGroups());
            console.log('✅ [APP.JS] Listener anexado ao yearFilter');
        } else {
            console.error('❌ [APP.JS] yearFilter não encontrado!');
        }

        // Filtro de ano para metas
        const goalsYearFilter = document.getElementById('goalsYearFilter');
        if (goalsYearFilter) {
            goalsYearFilter.addEventListener('change', () =>
                this.renderGoals()
            );
            console.log('✅ [APP.JS] Listener anexado ao goalsYearFilter');
        } else {
            console.error('❌ [APP.JS] goalsYearFilter não encontrado!');
        }

        // Filtro de ano para serviços
        const servicesYearFilter = document.getElementById('servicesYearFilter');
        if (servicesYearFilter) {
            servicesYearFilter.addEventListener('change', () => {
                this.renderServiceGroups();
                this.updateServicesChart();
            });
            console.log('✅ [APP.JS] Listener anexado ao servicesYearFilter');
        } else {
            console.error('❌ [APP.JS] servicesYearFilter não encontrado!');
        }

        // Formulário de construtor de relatórios
        const reportBuilderForm = document.getElementById('reportBuilderForm');
        if (reportBuilderForm) {
            reportBuilderForm.addEventListener('submit', (e) => this.generateCustomReport(e));
            console.log('✅ [APP.JS] Listener anexado ao reportBuilderForm');
        } else {
            console.error('❌ [APP.JS] reportBuilderForm não encontrado!');
        }

        // Modal de item
        const itemForm = document.getElementById('itemForm');
        const cancelBtn = document.getElementById('cancelBtn');
        const itemModalClose = document.querySelector('#itemModal .close');
        const itemCategory = document.getElementById('itemCategory');

        if (itemForm) {
            itemForm.addEventListener('submit', (e) => this.saveItem(e));
            console.log('✅ [APP.JS] Listener anexado ao itemForm');
        } else {
            console.error('❌ [APP.JS] itemForm não encontrado!');
        }

        // Formulário de Exportação
        const exportForm = document.getElementById('exportForm');
        if (exportForm) {
            exportForm.addEventListener('submit', (e) => this.exportData(e));
            console.log('✅ [APP.JS] Listener anexado ao exportForm');
        }

        // Formulário de Cliente
        const clientForm = document.getElementById('clientForm');
        const clientModalClose = document.querySelector('#clientModal .close');
        const clientSearch = document.getElementById('clientSearch');

        if (clientForm) {
            clientForm.addEventListener('submit', (e) => this.saveClient(e));
            console.log('✅ [APP.JS] Listener anexado ao clientForm');
        }

        if (clientModalClose) {
            clientModalClose.addEventListener('click', () => this.closeClientModal());
        }

        if (clientSearch) {
            // Debounce para busca de clientes também (padrão emergente.sh)
            clientSearch.addEventListener('input', (e) => {
                // Limpar timer anterior
                if (this.clientSearchDebounceTimer) {
                    clearTimeout(this.clientSearchDebounceTimer);
                }
                
                // Novo timer com delay de 300ms
                this.clientSearchDebounceTimer = setTimeout(() => {
                    this.renderClients();
                }, 300);
            });
            console.log('✅ [APP.JS] Listener anexado ao clientSearch (com debounce)');
        }

        // Modal de fornecedor
        const supplierForm = document.getElementById('supplierForm');
        const supplierModalClose = document.querySelector('#supplierModal .close');
        const supplierRating = document.getElementById('supplierRating');
        
        if (supplierForm) {
            supplierForm.addEventListener('submit', (e) => this.saveSupplier(e));
            console.log('✅ [APP.JS] Listener anexado ao supplierForm');
        }
        
        if (supplierModalClose) {
            supplierModalClose.addEventListener('click', () => this.closeSupplierModal());
            console.log('✅ [APP.JS] Listener anexado ao supplierModal .close');
        }
        
        if (supplierRating) {
            supplierRating.addEventListener('input', () => this.updateSupplierRatingDisplay());
            console.log('✅ [APP.JS] Listener anexado ao supplierRating');
        }

        const supplierSearch = document.getElementById('supplierSearch');
        if (supplierSearch) {
            supplierSearch.addEventListener('input', (e) => {
                if (this.supplierSearchDebounceTimer) {
                    clearTimeout(this.supplierSearchDebounceTimer);
                }
                this.supplierSearchDebounceTimer = setTimeout(() => {
                    this.renderSuppliers();
                }, 300);
            });
            console.log('✅ [APP.JS] Listener anexado ao supplierSearch (com debounce)');
        }

        // Modal de cupom
        const couponForm = document.getElementById('couponForm');
        const couponModalClose = document.querySelector('#couponModal .close');
        
        if (couponForm) {
            couponForm.addEventListener('submit', (e) => this.saveCoupon(e));
            console.log('✅ [APP.JS] Listener anexado ao couponForm');
        }
        
        if (couponModalClose) {
            couponModalClose.addEventListener('click', () => this.closeCouponModal());
            console.log('✅ [APP.JS] Listener anexado ao couponModal .close');
        }

        // Máscaras para CPF e Telefone
        const clientCPF = document.getElementById('clientCPF');
        const clientPhone = document.getElementById('clientPhone');

        if (clientCPF) {
            clientCPF.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                    e.target.value = value;
                }
            });
        }

        if (clientPhone) {
            clientPhone.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    if (value.length <= 10) {
                        value = value.replace(/(\d{2})(\d)/, '($1) $2');
                        value = value.replace(/(\d{4})(\d)/, '$1-$2');
                    } else {
                        value = value.replace(/(\d{2})(\d)/, '($1) $2');
                        value = value.replace(/(\d{5})(\d)/, '$1-$2');
                    }
                    e.target.value = value;
                }
            });
        }

        if (itemCategory) {
            itemCategory.addEventListener('change', () =>
                this.toggleCategoryFields()
            );
            console.log('✅ [APP.JS] Listener anexado ao itemCategory');
        } else {
            console.error('❌ [APP.JS] itemCategory não encontrado!');
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeItemModal());
            console.log('✅ [APP.JS] Listener anexado ao cancelBtn');
        } else {
            console.error('❌ [APP.JS] cancelBtn não encontrado!');
        }

        if (itemModalClose) {
            itemModalClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeItemModal();
            });
            console.log('✅ [APP.JS] Listener anexado ao itemModal .close');
        } else {
            console.error('❌ [APP.JS] itemModal .close não encontrado!');
        }

        // Fechar modal ao clicar fora dele
        const itemModal = document.getElementById('itemModal');
        if (itemModal) {
            itemModal.addEventListener('click', (e) => {
                if (e.target === itemModal) {
                    this.closeItemModal();
                }
            });
        }

        // QR Code - Modal de Item
        const downloadQRBtn = document.getElementById('downloadQRBtn');
        const printQRBtn = document.getElementById('printQRBtn');

        if (downloadQRBtn) {
            downloadQRBtn.addEventListener('click', () => {
                if (this.currentEditingItem) {
                    this.downloadQRCode(
                        'qrcodeCanvas',
                        `qrcode-${this.currentEditingItem.id}.png`
                    );
                }
            });
        }

        if (printQRBtn) {
            printQRBtn.addEventListener('click', () => {
                this.printQRCode('qrcodeCanvas');
            });
        }

        // QR Code - Modal de Venda (Scanner)
        const scanQRBtn = document.getElementById('scanQRBtn');
        const stopScanBtn = document.getElementById('stopScanBtn');

        if (scanQRBtn) {
            scanQRBtn.addEventListener('click', () => {
                this.startQRScanner();
            });
        }

        if (stopScanBtn) {
            stopScanBtn.addEventListener('click', () => {
                this.stopQRScanner();
            });
        }

        // QR Code - Modal Dedicado
        const qrcodeModalClose = document.querySelector('#qrcodeModal .close');
        const downloadQRModalBtn =
            document.getElementById('downloadQRModalBtn');
        const printQRModalBtn = document.getElementById('printQRModalBtn');

        if (qrcodeModalClose) {
            qrcodeModalClose.addEventListener('click', () => {
                document
                    .getElementById('qrcodeModal')
                    .classList.remove('active');
            });
        }

        if (downloadQRModalBtn) {
            downloadQRModalBtn.addEventListener('click', () => {
                const itemId = downloadQRModalBtn.dataset.itemId;
                if (itemId) {
                    this.downloadQRCode(
                        'qrcodeModalCanvas',
                        `qrcode-${itemId}.png`
                    );
                }
            });
        }

        if (printQRModalBtn) {
            printQRModalBtn.addEventListener('click', () => {
                this.printQRCode('qrcodeModalCanvas');
            });
        }

        // Modal de grupo
        const groupForm = document.getElementById('groupForm');
        const cancelGroupBtn = document.getElementById('cancelGroupBtn');
        const groupModalClose = document.querySelector('#groupModal .close');

        if (groupForm) {
            groupForm.addEventListener('submit', (e) => this.createGroup(e));
            console.log('✅ [APP.JS] Listener anexado ao groupForm');
        } else {
            console.error('❌ [APP.JS] groupForm não encontrado!');
        }

        if (cancelGroupBtn) {
            cancelGroupBtn.addEventListener('click', () =>
                this.closeGroupModal()
            );
        }

        if (groupModalClose) {
            groupModalClose.addEventListener('click', () =>
                this.closeGroupModal()
            );
        }

        // Modal de grupo de serviços
        const newServiceGroupBtn =
            document.getElementById('newServiceGroupBtn');
        const serviceGroupForm = document.getElementById('serviceGroupForm');
        const cancelServiceGroupBtn = document.getElementById(
            'cancelServiceGroupBtn'
        );
        const serviceGroupModalClose = document.querySelector(
            '#serviceGroupModal .close'
        );

        if (newServiceGroupBtn) {
            newServiceGroupBtn.addEventListener('click', () =>
                this.openServiceGroupModal()
            );
        }

        if (serviceGroupForm) {
            serviceGroupForm.addEventListener('submit', (e) =>
                this.createServiceGroup(e)
            );
        }

        if (cancelServiceGroupBtn) {
            cancelServiceGroupBtn.addEventListener('click', () =>
                this.closeServiceGroupModal()
            );
        }

        if (serviceGroupModalClose) {
            serviceGroupModalClose.addEventListener('click', () =>
                this.closeServiceGroupModal()
            );
        }

        // Modal de registro de serviço
        const serviceRecordForm = document.getElementById('serviceRecordForm');
        const cancelServiceRecordBtn = document.getElementById(
            'cancelServiceRecordBtn'
        );
        const serviceRecordModalClose = document.querySelector(
            '#serviceRecordModal .close'
        );
        const serviceRecordItem = document.getElementById('serviceRecordItem');

        if (serviceRecordForm) {
            serviceRecordForm.addEventListener('submit', (e) =>
                this.saveServiceRecord(e)
            );
        }

        if (cancelServiceRecordBtn) {
            cancelServiceRecordBtn.addEventListener('click', () =>
                this.closeServiceRecordModal()
            );
        }

        if (serviceRecordModalClose) {
            serviceRecordModalClose.addEventListener('click', () =>
                this.closeServiceRecordModal()
            );
        }

        // Preencher horas padrão ao selecionar serviço
        if (serviceRecordItem) {
            serviceRecordItem.addEventListener('change', () => {
                const itemId = serviceRecordItem.value;
                if (itemId) {
                    const item = this.items.find((i) => i.id === itemId);
                    if (item && item.category === 'Serviços') {
                        const hoursInput =
                            document.getElementById('serviceRecordHours');
                        const minutesInput = document.getElementById(
                            'serviceRecordMinutes'
                        );
                        const priceInput =
                            document.getElementById('serviceRecordPrice');

                        if (hoursInput && item.defaultHours !== undefined) {
                            hoursInput.value = item.defaultHours || 0;
                        }
                        if (minutesInput && item.defaultMinutes !== undefined) {
                            minutesInput.value = item.defaultMinutes || 0;
                        }
                        if (priceInput && item.price) {
                            priceInput.value = item.price;
                        }
                    }
                }
            });
        }

        // Modal de visualização de grupo de serviços
        const viewServiceGroupModalClose = document.querySelector(
            '#viewServiceGroupModal .close'
        );
        if (viewServiceGroupModalClose) {
            viewServiceGroupModalClose.addEventListener('click', () =>
                this.closeViewServiceGroupModal()
            );
        }

        if (cancelGroupBtn) {
            cancelGroupBtn.addEventListener('click', () =>
                this.closeGroupModal()
            );
            console.log('✅ [APP.JS] Listener anexado ao cancelGroupBtn');
        } else {
            console.error('❌ [APP.JS] cancelGroupBtn não encontrado!');
        }

        if (groupModalClose) {
            groupModalClose.addEventListener('click', () =>
                this.closeGroupModal()
            );
            console.log('✅ [APP.JS] Listener anexado ao groupModal .close');
        } else {
            console.error('❌ [APP.JS] groupModal .close não encontrado!');
        }

        // Modal de venda
        const saleForm = document.getElementById('saleForm');
        const cancelSaleBtn = document.getElementById('cancelSaleBtn');
        const saleModalClose = document.querySelector('#saleModal .close');

        if (saleForm) {
            saleForm.addEventListener('submit', (e) => this.saveSale(e));
            console.log('✅ [APP.JS] Listener anexado ao saleForm');
        } else {
            console.error('❌ [APP.JS] saleForm não encontrado!');
        }

        if (cancelSaleBtn) {
            cancelSaleBtn.addEventListener('click', () =>
                this.closeSaleModal()
            );
            console.log('✅ [APP.JS] Listener anexado ao cancelSaleBtn');
        } else {
            console.error('❌ [APP.JS] cancelSaleBtn não encontrado!');
        }

        if (saleModalClose) {
            saleModalClose.addEventListener('click', () =>
                this.closeSaleModal()
            );
            console.log('✅ [APP.JS] Listener anexado ao saleModal .close');
        } else {
            console.error('❌ [APP.JS] saleModal .close não encontrado!');
        }

        // Modal de recibo
        const closeReceiptBtn = document.getElementById('closeReceiptBtn');
        const printReceiptBtn = document.getElementById('printReceiptBtn');
        const receiptModalClose = document.querySelector(
            '#receiptPreviewModal .close'
        );

        if (closeReceiptBtn) {
            closeReceiptBtn.addEventListener('click', () =>
                this.closeReceiptPreview()
            );
        }
        if (printReceiptBtn) {
            printReceiptBtn.addEventListener('click', () =>
                this.printReceipt()
            );
        }
        if (receiptModalClose) {
            receiptModalClose.addEventListener('click', () =>
                this.closeReceiptPreview()
            );
        }

        // Modal de pedido pendente
        const pendingOrderForm = document.getElementById('pendingOrderForm');
        const cancelPendingOrderBtn = document.getElementById(
            'cancelPendingOrderBtn'
        );
        const pendingOrderModalClose = document.querySelector(
            '#pendingOrderModal .close'
        );
        const addPendingOrderItemBtn = document.getElementById(
            'addPendingOrderItemBtn'
        );

        if (pendingOrderForm) {
            pendingOrderForm.addEventListener('submit', (e) =>
                this.savePendingOrder(e)
            );
        }
        if (cancelPendingOrderBtn) {
            cancelPendingOrderBtn.addEventListener('click', () =>
                this.closePendingOrderModal()
            );
        }
        if (pendingOrderModalClose) {
            pendingOrderModalClose.addEventListener('click', () =>
                this.closePendingOrderModal()
            );
        }
        if (addPendingOrderItemBtn) {
            addPendingOrderItemBtn.addEventListener('click', () =>
                this.addPendingOrderItemRow()
            );
        }

        // Modal de agendamento de serviço
        const serviceAppointmentForm = document.getElementById(
            'serviceAppointmentForm'
        );
        const cancelServiceAppointmentBtn = document.getElementById(
            'cancelServiceAppointmentBtn'
        );
        const serviceAppointmentModalClose = document.querySelector(
            '#serviceAppointmentModal .close'
        );

        if (serviceAppointmentForm) {
            serviceAppointmentForm.addEventListener('submit', (e) =>
                this.saveServiceAppointment(e)
            );
        }
        if (cancelServiceAppointmentBtn) {
            cancelServiceAppointmentBtn.addEventListener('click', () =>
                this.closeServiceAppointmentModal()
            );
        }
        if (serviceAppointmentModalClose) {
            serviceAppointmentModalClose.addEventListener('click', () =>
                this.closeServiceAppointmentModal()
            );
        }

        // Modal de calendário
        const calendarModal = document.getElementById('calendarModal');
        const calendarModalClose = document.querySelector(
            '#calendarModal .close'
        );

        if (calendarModalClose) {
            calendarModalClose.addEventListener('click', () =>
                this.closeCalendarModal()
            );
        }

        // Fechar modal ao clicar fora
        if (calendarModal) {
            calendarModal.addEventListener('click', (e) => {
                if (e.target === calendarModal) {
                    this.closeCalendarModal();
                }
            });
        }

        // Modal de busca de comprovantes
        const receiptSearchModal =
            document.getElementById('receiptSearchModal');
        if (receiptSearchModal) {
            receiptSearchModal.addEventListener('click', (e) => {
                if (e.target === receiptSearchModal) {
                    this.closeReceiptSearchModal();
                }
            });
        }

        // Suporte a arrastar no carrossel de últimos comprovantes
        this.setupReceiptCarouselDrag();

        // Modal de visualização de grupo
        const viewGroupModalClose = document.querySelector(
            '#viewGroupModal .close'
        );
        if (viewGroupModalClose) {
            viewGroupModalClose.addEventListener('click', () =>
                this.closeViewGroupModal()
            );
            console.log(
                '✅ [APP.JS] Listener anexado ao viewGroupModal .close'
            );
        } else {
            console.error('❌ [APP.JS] viewGroupModal .close não encontrado!');
        }

        // Modal de custo
        const costForm = document.getElementById('costForm');
        const cancelCostBtn = document.getElementById('cancelCostBtn');
        const costModalClose = document.querySelector('#costModal .close');
        const costQuantity = document.getElementById('costQuantity');
        const costPrice = document.getElementById('costPrice');

        if (costForm) {
            costForm.addEventListener('submit', (e) => this.saveCost(e));
            console.log('✅ [APP.JS] Listener anexado ao costForm');
        } else {
            console.error('❌ [APP.JS] costForm não encontrado!');
        }

        if (cancelCostBtn) {
            cancelCostBtn.addEventListener('click', () =>
                this.closeCostModal()
            );
            console.log('✅ [APP.JS] Listener anexado ao cancelCostBtn');
        } else {
            console.error('❌ [APP.JS] cancelCostBtn não encontrado!');
        }

        if (costModalClose) {
            costModalClose.addEventListener('click', () =>
                this.closeCostModal()
            );
            console.log('✅ [APP.JS] Listener anexado ao costModal .close');
        } else {
            console.error('❌ [APP.JS] costModal .close não encontrado!');
        }

        // Calcular custo total automaticamente
        if (costQuantity) {
            costQuantity.addEventListener('input', () =>
                this.calculateCostTotal()
            );
            console.log('✅ [APP.JS] Listener anexado ao costQuantity');
        } else {
            console.error('❌ [APP.JS] costQuantity não encontrado!');
        }

        if (costPrice) {
            costPrice.addEventListener('input', () =>
                this.calculateCostTotal()
            );
            // Converter vírgula em ponto automaticamente
            costPrice.addEventListener('input', (e) => {
                let value = e.target.value;
                if (value.includes(',')) {
                    e.target.value = value.replace(',', '.');
                }
            });
            console.log('✅ [APP.JS] Listener anexado ao costPrice');
        } else {
            console.error('❌ [APP.JS] costPrice não encontrado!');
        }

        // Adicionar conversão de vírgula para ponto em todos os campos de preço
        const itemPrice = document.getElementById('itemPrice');
        const salePrice = document.getElementById('salePrice');
        const goalAmount = document.getElementById('goalAmount');

        if (itemPrice) {
            itemPrice.addEventListener('input', (e) => {
                let value = e.target.value;
                if (value.includes(',')) {
                    e.target.value = value.replace(',', '.');
                }
            });
        }

        if (salePrice) {
            salePrice.addEventListener('input', (e) => {
                let value = e.target.value;
                if (value.includes(',')) {
                    e.target.value = value.replace(',', '.');
                }
                // Atualizar cálculo de desconto em tempo real
                this.updateDiscountCalculation();
            });
        }
        
        // Event listeners para desconto
        const saleQuantity = document.getElementById('saleQuantity');
        const saleDiscountType = document.getElementById('saleDiscountType');
        const saleDiscountValue = document.getElementById('saleDiscountValue');
        
        if (saleQuantity) {
            saleQuantity.addEventListener('input', () => {
                this.updateDiscountCalculation();
            });
        }
        
        if (saleDiscountType) {
            saleDiscountType.addEventListener('change', () => {
                this.updateDiscountCalculation();
            });
        }
        
        if (saleDiscountValue) {
            saleDiscountValue.addEventListener('input', () => {
                this.updateDiscountCalculation();
            });
        }

        if (goalAmount) {
            goalAmount.addEventListener('input', (e) => {
                let value = e.target.value;
                if (value.includes(',')) {
                    e.target.value = value.replace(',', '.');
                }
            });
        }

        // Modal de meta
        const goalForm = document.getElementById('goalForm');
        const newGoalBtn = document.getElementById('newGoalBtn');
        const cancelGoalBtn = document.getElementById('cancelGoalBtn');
        const goalModalClose = document.querySelector('#goalModal .close');

        if (newGoalBtn) {
            newGoalBtn.addEventListener('click', () => this.openGoalModal());
            console.log('✅ [APP.JS] Listener anexado ao newGoalBtn');
        }

        if (goalForm) {
            goalForm.addEventListener('submit', (e) => this.saveGoal(e));
            console.log('✅ [APP.JS] Listener anexado ao goalForm');
        }

        if (cancelGoalBtn) {
            cancelGoalBtn.addEventListener('click', () =>
                this.closeGoalModal()
            );
            console.log('✅ [APP.JS] Listener anexado ao cancelGoalBtn');
        }

        if (goalModalClose) {
            goalModalClose.addEventListener('click', () =>
                this.closeGoalModal()
            );
            console.log('✅ [APP.JS] Listener anexado ao goalModal .close');
        }

        // Modal de estoque
        const manageStockBtn = document.getElementById('manageStockBtn');
        const saveStockBtn = document.getElementById('saveStockBtn');
        const cancelStockBtn = document.getElementById('cancelStockBtn');
        const stockModalClose = document.querySelector('#stockModal .close');
        const stockDay = document.getElementById('stockDay');

        if (manageStockBtn) {
            manageStockBtn.addEventListener('click', () =>
                this.openStockModal()
            );
            console.log('✅ [APP.JS] Listener anexado ao manageStockBtn');
        }

        if (saveStockBtn) {
            saveStockBtn.addEventListener('click', () => this.saveStock());
            console.log('✅ [APP.JS] Listener anexado ao saveStockBtn');
        }

        if (cancelStockBtn) {
            cancelStockBtn.addEventListener('click', () =>
                this.closeStockModal()
            );
            console.log('✅ [APP.JS] Listener anexado ao cancelStockBtn');
        }

        if (stockModalClose) {
            stockModalClose.addEventListener('click', () =>
                this.closeStockModal()
            );
            console.log('✅ [APP.JS] Listener anexado ao stockModal .close');
        }

        if (stockDay) {
            stockDay.addEventListener('change', () =>
                this.updateStockItemsList()
            );
            console.log('✅ [APP.JS] Listener anexado ao stockDay');
        }

        // Atualizar estoque disponível ao selecionar item no modal de venda
        const saleItem = document.getElementById('saleItem');
        if (saleItem) {
            saleItem.addEventListener('change', () => {
                const itemId = saleItem.value;
                this.updateSaleModalForItem(itemId);
                this.updateStockInfo();
            });
            console.log(
                '✅ [APP.JS] Listener anexado ao saleItem para atualizar estoque'
            );
        }

        // Listener para campo de tamanho (atualizar estoque quando tamanho mudar)
        const saleSize = document.getElementById('saleSize');
        if (saleSize) {
            saleSize.addEventListener('input', () => {
                this.updateStockInfo();
            });
            console.log('✅ [APP.JS] Listener anexado ao saleSize para atualizar estoque');
        }

        // Listener para campo de cor (atualizar estoque quando cor mudar)
        const saleColor = document.getElementById('saleColor');
        if (saleColor) {
            saleColor.addEventListener('input', () => {
                this.updateStockInfo();
            });
            console.log('✅ [APP.JS] Listener anexado ao saleColor para atualizar estoque');
        }

        // Fechar modais ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    /**
     * ========================================
     * MÓDULO: GESTÃO DE PRODUTOS/ITENS
     * ========================================
     * 
     * @description Gerencia produtos, estoque, categorias e tags
     * 
     * FUNCIONALIDADES:
     * - CRUD de produtos (criar, ler, atualizar, deletar)
     * - Controle de estoque (entrada, saída, mínimo)
     * - Gestão de categorias e grupos
     * - Sistema de tags para organização
     * - QR Code para produtos
     * - Templates de produtos
     * 
     * REGRAS DE NEGÓCIO:
     * - Estoque não pode ser negativo
     * - Estoque mínimo deve ser >= 0
     * - Preço deve ser > 0
     * - Produto precisa de nome e categoria
     * 
     * PERMISSÕES:
     * - Criar: user, manager, admin
     * - Editar: user, manager, admin
     * - Deletar: manager, admin
     * 
     * PARA IAs:
     * - Ao criar funções de estoque, validar regras acima
     * - Sempre verificar permissões antes de operações
     * - Usar this.logAction() para auditoria
     * - Considerar multiusuário ao manipular dados
     */
    // ========== GESTÃO DE ITENS ==========

    /**
     * Alterna campos de formulário baseado na categoria selecionada
     * @description Mostra/oculta campos específicos para Roupas ou Eletrônicos
     * @example toggleCategoryFields() // Mostra campos de roupas se categoria for "Roupas"
     */
    toggleCategoryFields() {
        const category = document.getElementById('itemCategory').value;
        const clothingFields = document.getElementById('clothingFields');
        const electronicsFields = document.getElementById('electronicsFields');
        const clothingBasicFields = document.getElementById(
            'clothingBasicFields'
        );
        const itemName = document.getElementById('itemName');
        const itemBrand = document.getElementById('itemBrand');

        if (category === 'Roupas') {
            // Mostrar campos básicos (Nome e Marca)
            if (clothingBasicFields)
                clothingBasicFields.style.display = 'block';
            if (itemName) {
                itemName.required = false; // Nome da roupa é opcional
                itemName.parentElement.style.display = 'block';
            }
            if (itemBrand) {
                itemBrand.required = true;
                itemBrand.parentElement.style.display = 'block';
            }
            // Mostrar campos específicos de roupas
            if (clothingFields) clothingFields.style.display = 'block';
            if (electronicsFields) electronicsFields.style.display = 'none';
            // Limpar campos de eletrônicos
            document.getElementById('itemModel').value = '';
            document.getElementById('itemCapacity').value = '';
            document.getElementById('itemColor').value = '';
        } else if (category === 'Eletrônicos') {
            // Esconder campos básicos (Nome e Marca)
            if (clothingBasicFields) clothingBasicFields.style.display = 'none';
            if (itemName) {
                itemName.required = false;
                itemName.parentElement.style.display = 'none';
                itemName.value = '';
            }
            if (itemBrand) {
                itemBrand.required = false;
                itemBrand.parentElement.style.display = 'none';
                itemBrand.value = '';
            }
            // Esconder campos específicos de roupas
            if (clothingFields) clothingFields.style.display = 'none';
            // Mostrar campos específicos de eletrônicos
            if (electronicsFields) electronicsFields.style.display = 'block';
            // Limpar campos de roupas
            document.getElementById('itemStyle').value = '';
            document.getElementById('itemSize').value = '';
            document.getElementById('itemGender').value = '';
        } else {
            // Nenhuma categoria selecionada
            if (clothingBasicFields) clothingBasicFields.style.display = 'none';
            if (itemName) {
                itemName.required = false;
                itemName.parentElement.style.display = 'none';
            }
            if (itemBrand) {
                itemBrand.required = false;
                itemBrand.parentElement.style.display = 'none';
            }
            if (clothingFields) clothingFields.style.display = 'none';
            if (electronicsFields) electronicsFields.style.display = 'none';
        }
    }

    openItemModal(item = null) {
        this.currentEditingItem = item;
        const modal = document.getElementById('itemModal');
        const form = document.getElementById('itemForm');
        const title = document.getElementById('modalTitle');

        if (item) {
            title.textContent = 'Editar Item';
            document.getElementById('itemCategory').value =
                item.category || 'Roupas';
            // Exibir preço com ponto (input type="number" usa ponto)
            document.getElementById('itemPrice').value = item.price || '';
            // Preencher custo se existir
            const itemCostInput = document.getElementById('itemCost');
            if (itemCostInput) {
                itemCostInput.value = item.cost || '';
            }

            // Preencher campos baseado na categoria
            if (item.category === 'Roupas') {
                document.getElementById('itemName').value = item.name || '';
                document.getElementById('itemBrand').value = item.brand || '';
                document.getElementById('itemStyle').value = item.style || '';
                document.getElementById('itemSize').value = item.size || '';
                document.getElementById('itemGender').value = item.gender || '';
            } else if (item.category === 'Eletrônicos') {
                document.getElementById('itemModel').value = item.model || '';
                document.getElementById('itemCapacity').value =
                    item.capacity || '';
                document.getElementById('itemColor').value = item.color || '';
            }

            // Atualizar campos visíveis
            this.toggleCategoryFields();

            // Gerar QR code se estiver editando
            if (item.id) {
                // Se não tiver código QR, gerar um
                if (!item.qrCodeNumber) {
                    item.qrCodeNumber = this.generateQRCodeNumber();
                    // Atualizar no array
                    const index = this.items.findIndex((i) => i.id === item.id);
                    if (index !== -1) {
                        this.items[index] = item;
                        this.saveData();
                    }
                }
                this.generateQRCode(item.id);
            }
        } else {
            title.textContent = 'Novo Produto';
            form.reset();
            // Esconder campos específicos ao criar novo item
            document.getElementById('clothingFields').style.display = 'none';
            document.getElementById('electronicsFields').style.display = 'none';

            // Mostrar campos básicos por padrão (serão escondidos quando categoria for selecionada)
            const clothingBasicFields = document.getElementById(
                'clothingBasicFields'
            );
            if (clothingBasicFields)
                clothingBasicFields.style.display = 'block';

            // Esconder seção de QR code ao criar novo item
            const qrcodeSection = document.getElementById('qrcodeSection');
            if (qrcodeSection) qrcodeSection.style.display = 'none';
        }

        modal.classList.add('active');

        // Configurar validação em tempo real
        if (typeof fieldValidator !== 'undefined') {
            const itemName = document.getElementById('itemName');
            const itemPrice = document.getElementById('itemPrice');
            const itemModel = document.getElementById('itemModel');
            const itemEmail = document.getElementById('itemEmail');

            if (itemName) {
                fieldValidator.setupFieldValidation(itemName, { required: true, minLength: 2 });
            }
            if (itemPrice) {
                fieldValidator.setupFieldValidation(itemPrice, { required: true, number: true, positive: true });
            }
            if (itemModel) {
                fieldValidator.setupFieldValidation(itemModel, { minLength: 2 });
            }
        }
    }

    closeItemModal() {
        const modal = document.getElementById('itemModal');
        if (modal) {
            // Animação ao fechar modal
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.classList.remove('active');
                modal.style.display = 'none';
                modal.style.opacity = '';
            }, 300);
        }
        this.currentEditingItem = null;

        // Esconder seção de QR code
        const qrcodeSection = document.getElementById('qrcodeSection');
        if (qrcodeSection) qrcodeSection.style.display = 'none';

        // Limpar formulário
        const form = document.getElementById('itemForm');
        if (form) {
            form.reset();
        }
    }

    saveItem(e) {
        e.preventDefault();
        
        // Verificar permissão de escrita
        if (!this.checkPermission('write', 'item')) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Você não tem permissão para criar/editar produtos.', 3000);
            } else {
                alert('Você não tem permissão para criar/editar produtos.');
            }
            return;
        }
        
        // Verificar e bloquear entidade se estiver editando
        if (this.currentEditingItem) {
            const lockResult = this.checkEntityLock('item', this.currentEditingItem.id);
            if (lockResult.locked && !lockResult.isOwner) {
                if (typeof toast !== 'undefined' && toast) {
                    toast.warning(`Este item está sendo editado por ${lockResult.lockedBy}. Aguarde alguns minutos.`, 4000);
                } else {
                    alert(`Este item está sendo editado por ${lockResult.lockedBy}. Aguarde alguns minutos.`);
                }
                return;
            }
            
            // Bloquear entidade
            if (!this.lockEntity('item', this.currentEditingItem.id)) {
                if (typeof toast !== 'undefined' && toast) {
                    toast.error('Não foi possível bloquear o item para edição.', 3000);
                }
                return;
            }
        }

        // Desabilitar botão e mostrar loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
        }

        const category = document.getElementById('itemCategory').value;

        const minStockInput = document.getElementById('itemMinStock');
        const minStock = minStockInput && minStockInput.value ? parseInt(minStockInput.value) : null;
        const tagsInput = document.getElementById('itemTags');
        const tags = tagsInput && tagsInput.value ? tagsInput.value.split(',').map(t => t.trim()).filter(t => t) : [];
        const notesInput = document.getElementById('itemNotes');
        const notes = notesInput && notesInput.value ? notesInput.value.trim() : '';
        
        const itemCostInput = document.getElementById('itemCost');
        const itemCost = itemCostInput && itemCostInput.value ? this.parsePrice(itemCostInput.value) : undefined;
        
        const item = {
            id: this.currentEditingItem
                ? this.currentEditingItem.id
                : Date.now().toString(),
            category: category,
            price: this.parsePrice(document.getElementById('itemPrice').value),
            cost: itemCost, // Custo de compra para cálculo de ROI
            minStock: minStock || undefined, // Estoque mínimo configurável
            notes: notes || undefined, // Notas/comentários
        };
        
        // Salvar tags separadamente
        if (tags.length > 0) {
            this.itemTags[item.id] = tags;
        } else if (this.itemTags[item.id]) {
            delete this.itemTags[item.id];
        }

        // Adicionar campos baseado na categoria
        if (category === 'Roupas') {
            // Formatar nome, marca e estilo automaticamente
            item.name = this.formatText(document.getElementById('itemName').value) || '';
            item.brand = this.formatText(document.getElementById('itemBrand').value);
            item.style = this.formatText(document.getElementById('itemStyle').value) || '';
            item.size = document.getElementById('itemSize').value.trim() || '';
            item.gender = document.getElementById('itemGender').value || '';
        } else if (category === 'Eletrônicos') {
            // Para eletrônicos, usar modelo como nome (ou modelo + capacidade + cor)
            const model = this.formatText(document.getElementById('itemModel').value);
            const capacity = this.formatText(document.getElementById('itemCapacity').value);
            const color = this.formatText(document.getElementById('itemColor').value);

            // Criar nome composto para eletrônicos
            let nameParts = [];
            if (model) nameParts.push(model);
            if (capacity) nameParts.push(capacity);
            if (color) nameParts.push(color);

            item.name =
                nameParts.length > 0 ? nameParts.join(' ') : 'Eletrônico';
            item.brand = ''; // Marca não é usada para eletrônicos
            item.model = model || '';
            item.capacity = capacity || '';
            item.color = color || '';
        }

        // Validações com feedback visual
        if (!category) {
            this.showError('Por favor, selecione uma categoria.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
            return;
        }

        if (category === 'Roupas') {
            if (!item.brand) {
                this.showError('Por favor, preencha a marca.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                }
                return;
            }
        } else if (category === 'Eletrônicos') {
            if (!item.model) {
                this.showError('Por favor, preencha o modelo.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                }
                return;
            }
        }

        if (item.price <= 0 || isNaN(item.price)) {
            this.showError(
                'O preço deve ser um valor numérico maior que zero.'
            );
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
            return;
        }

        // Gerar código QR numérico exclusivo para produtos físicos
        // IMPORTANTE: Cada produto físico DEVE ter um QR code único para identificação nas vendas
        if (this.currentEditingItem && this.currentEditingItem.qrCodeNumber) {
            // Manter código existente ao editar (preservar identificação única)
            item.qrCodeNumber = this.currentEditingItem.qrCodeNumber;
            console.log(`✅ Mantendo QR Code existente: ${item.qrCodeNumber} para produto ${item.name || item.id}`);
        } else {
            // Gerar novo código único ao criar produto
            item.qrCodeNumber = this.generateQRCodeNumber();
            console.log(`✅ Novo QR Code gerado: ${item.qrCodeNumber} para produto ${item.name || 'novo'}`);
        }

        // Validação de segurança: garantir que o QR code é único
        const duplicateItem = this.items.find(
            (i) => i.id !== item.id && i.qrCodeNumber === item.qrCodeNumber
        );
        if (duplicateItem) {
            console.error(`❌ ERRO: QR Code duplicado detectado! Produto ${item.name} tem o mesmo QR Code que ${this.getItemName(duplicateItem.id)}`);
            // Gerar novo código único
            item.qrCodeNumber = this.generateQRCodeNumber();
            console.log(`✅ Novo QR Code único gerado após detecção de duplicata: ${item.qrCodeNumber}`);
        }

        // Salvar dados anteriores antes de atualizar (para reversão)
        let previousData = null;
        if (this.currentEditingItem) {
            const index = this.items.findIndex(
                (i) => i.id === this.currentEditingItem.id
            );
            if (index !== -1) {
                // Salvar cópia dos dados anteriores antes de atualizar
                previousData = JSON.parse(JSON.stringify(this.items[index]));
                this.items[index] = item;
            }
        } else {
            this.items.push(item);
        }

        // Reabilitar botão
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }

        // Desbloquear entidade após salvar
        if (this.currentEditingItem) {
            this.unlockEntity('item', this.currentEditingItem.id);
        }
        
        this.saveData();
        this.updateTagFilter(); // Atualizar lista de tags após salvar
        this.renderItems();
        this.closeItemModal();

        // Registrar no audit log (incluir dados anteriores para reversão)
        this.logAction(
            this.currentEditingItem ? 'update' : 'create',
            'item',
            item.id,
            this.getItemName(item.id),
            {
                category: item.category,
                price: item.price,
                minStock: item.minStock || null,
                previousData: previousData, // Dados anteriores para reversão
            }
        );

        // Mostrar mensagem de sucesso
        this.showSuccess(
            this.currentEditingItem
                ? 'Item atualizado com sucesso!'
                : 'Item cadastrado com sucesso!'
        );

        // Gerar QR code após salvar
        if (item.id) {
            this.generateQRCode(item.id);
        }
    }

    // Função auxiliar para animar valores numéricos
    animateValue(element, startValue, endValue, duration = 400, format = null) {
        if (!element) return;

        const startTime = performance.now();
        const isNumeric = typeof endValue === 'number';

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);

            if (isNumeric) {
                const currentValue =
                    startValue + (endValue - startValue) * easeOut;
                if (format) {
                    element.textContent = format(currentValue);
                } else {
                    element.textContent = Math.round(currentValue);
                }
            } else {
                // Para valores não numéricos, apenas aplicar fade in
                element.style.opacity = easeOut;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Garantir valor final
                if (isNumeric) {
                    if (format) {
                        element.textContent = format(endValue);
                    } else {
                        element.textContent = endValue;
                    }
                }
                element.style.opacity = '1';
                element.classList.add('animated-value');
                setTimeout(() => {
                    element.classList.remove('animated-value');
                }, 500);
            }
        };

        requestAnimationFrame(animate);
    }

    // Função auxiliar para atualizar valor com animação
    updateValueWithAnimation(elementId, value, format = null) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const currentValue = element.textContent.trim();
        let startValue = 0;

        // Tentar extrair número do valor atual
        if (format) {
            const match = currentValue.match(/[\d,]+\.?\d*/);
            if (match) {
                startValue = parseFloat(match[0].replace(',', '.')) || 0;
            }
        } else {
            startValue = parseInt(currentValue) || 0;
        }

        this.animateValue(element, startValue, value, 300, format);
    }

    // ========== QR CODE LIBRARY LOADER ==========
    
    // Carregar biblioteca QRCode dinamicamente se não estiver carregada
    loadQRCodeLibrary() {
        return new Promise((resolve, reject) => {
            // Verificar se já está carregada (múltiplas formas de acesso)
            const QRCodeLib = window.QRCode || window.qrcode || (window.QRCodeLib && window.QRCodeLib.default);
            if (QRCodeLib) {
                console.log('✅ Biblioteca QRCode já está carregada');
                resolve();
                return;
            }

            // Verificar se já existe um script carregando
            const existingScript = document.querySelector('script[src*="qrcode"]');
            if (existingScript) {
                console.log('📦 Script QRCode já existe no DOM, aguardando carregamento...');
                console.log('🔍 Verificando window.QRCode:', typeof window.QRCode);
                console.log('🔍 Verificando window.qrcode:', typeof window.qrcode);
                console.log('🔍 Verificando window.qrcodeLoaded:', window.qrcodeLoaded);
                
                // Se o script falhou ao carregar (qrcodeLoaded é false), tentar recarregar
                if (window.qrcodeLoaded === false) {
                    console.warn('⚠️ Script QRCode falhou ao carregar anteriormente. Tentando recarregar...');
                    // Remover script antigo
                    existingScript.remove();
                    // Continuar para carregar dinamicamente abaixo (não retornar)
                } else if (window.qrcodeLoaded === true) {
                    // Script marcado como carregado, mas biblioteca não encontrada
                    console.log('📦 Script marcado como carregado, mas biblioteca não encontrada. Verificando formas alternativas...');
                    // Tentar acessar diretamente (pode estar em escopo global sem window)
                    try {
                        if (typeof QRCode !== 'undefined') {
                            window.QRCode = QRCode;
                            console.log('✅ Biblioteca QRCode encontrada como QRCode global!');
                            resolve();
                            return;
                        }
                    } catch (e) {
                        console.log('⚠️ QRCode não encontrado como variável global');
                    }
                }
                
                // Se qrcodeLoaded é undefined, o script ainda está carregando
                let attempts = 0;
                let shouldContinue = false; // Flag para indicar se deve continuar para carregar dinamicamente
                const maxAttempts = 30; // 3 segundos (30 * 100ms) - reduzido para detectar falha mais rápido
                const checkInterval = setInterval(() => {
                    attempts++;
                    // Verificar múltiplas formas de acesso
                    let QRCodeLib = window.QRCode || window.qrcode || (window.QRCodeLib && window.QRCodeLib.default);
                    
                    // Tentar acessar diretamente se ainda não encontrado
                    if (!QRCodeLib && typeof QRCode !== 'undefined') {
                        window.QRCode = QRCode;
                        QRCodeLib = QRCode;
                        console.log('✅ Biblioteca QRCode encontrada como QRCode global!');
                    }
                    
                    if (QRCodeLib) {
                        clearInterval(checkInterval);
                        console.log('✅ Biblioteca QRCode carregada após', attempts, 'tentativas!');
                        resolve();
                        return;
                    }
                    
                    // Se o script foi marcado como falhou, parar de esperar
                    if (window.qrcodeLoaded === false) {
                        clearInterval(checkInterval);
                        console.error('❌ Script QRCode falhou ao carregar. Tentando recarregar...');
                        existingScript.remove();
                        shouldContinue = true; // Marcar para continuar
                        return;
                    }
                    
                    // Log a cada 10 tentativas
                    if (attempts % 10 === 0) {
                        console.log(`⏳ Aguardando biblioteca QRCode... (${attempts}/${maxAttempts})`);
                        console.log('🔍 window.QRCode:', typeof window.QRCode);
                        console.log('🔍 window.qrcode:', typeof window.qrcode);
                        console.log('🔍 typeof QRCode:', typeof QRCode);
                        console.log('🔍 window.qrcodeLoaded:', window.qrcodeLoaded);
                    }
                    
                    if (attempts >= maxAttempts) {
                        clearInterval(checkInterval);
                        console.error('❌ Timeout: Biblioteca QRCode não foi carregada após', maxAttempts, 'tentativas');
                        console.error('🔍 Estado final - window.QRCode:', typeof window.QRCode);
                        console.error('🔍 Estado final - window.qrcode:', typeof window.qrcode);
                        console.error('🔍 Estado final - typeof QRCode:', typeof QRCode);
                        console.error('🔍 Estado final - window.qrcodeLoaded:', window.qrcodeLoaded);
                        console.warn('🔄 Tentando recarregar script QRCode...');
                        // Remover script antigo e tentar recarregar
                        existingScript.remove();
                        shouldContinue = true; // Marcar para continuar
                    }
                }, 100);
                
                // Se o script ainda está carregando normalmente, aguardar
                if (!shouldContinue && window.qrcodeLoaded !== false) {
                    return; // Ainda está aguardando
                }
                // Se chegou aqui, o script falhou ou deu timeout - continuar para carregar dinamicamente
            }

            // Carregar script dinamicamente
            console.log('📥 Carregando biblioteca QRCode dinamicamente...');
            const script = document.createElement('script');
            
            // Tentar múltiplas URLs do CDN (não tentar local - sempre usar CDN)
            const cdnUrls = [
                'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js',
                'https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.3/qrcode.min.js'
            ];
            
            let currentUrlIndex = 0;
            
            const tryLoadScript = (urlIndex) => {
                if (urlIndex >= cdnUrls.length) {
                    console.error('❌ Todas as URLs do CDN falharam ao carregar');
                    console.error('💡 Possíveis causas:');
                    console.error('   1. Problema de conexão com a internet');
                    console.error('   2. Firewall ou proxy bloqueando CDNs');
                    console.error('   3. Problema de CORS no servidor local');
                    console.error('   4. CDNs temporariamente indisponíveis');
                    console.error('💡 Soluções:');
                    console.error('   - Verifique sua conexão com a internet');
                    console.error('   - Verifique configurações de firewall/proxy');
                    console.error('   - Tente acessar os CDNs diretamente no navegador');
                    console.error('   - Considere usar uma versão local da biblioteca QRCode');
                    
                    const errorMsg = 'Não foi possível carregar a biblioteca QRCode. Verifique sua conexão com a internet ou configurações de firewall.';
                    alert(errorMsg);
                    reject(new Error(errorMsg));
                    return;
                }
                
                const url = cdnUrls[urlIndex];
                console.log(`📥 Tentando carregar de: ${url}`);
                
                // Criar novo script para cada tentativa (evitar reutilizar script com erro)
                const newScript = document.createElement('script');
                newScript.src = url;
                
                newScript.onload = () => {
                    console.log('✅ Script QRCode carregado, verificando disponibilidade...');
                    window.qrcodeLoaded = true;
                    
                    // Aguardar um pouco para garantir que a biblioteca está disponível
                    setTimeout(() => {
                        // Verificar múltiplas formas de acesso
                        let QRCodeLib = window.QRCode || window.qrcode || (window.QRCodeLib && window.QRCodeLib.default);
                        
                        // Tentar acessar diretamente
                        if (!QRCodeLib && typeof QRCode !== 'undefined') {
                            window.QRCode = QRCode;
                            QRCodeLib = QRCode;
                        }
                        
                        if (QRCodeLib) {
                            console.log('✅ Biblioteca QRCode disponível!');
                            resolve();
                        } else {
                            console.error('❌ Biblioteca QRCode não encontrada após carregamento do script');
                            console.error('🔍 window.QRCode:', typeof window.QRCode);
                            console.error('🔍 window.qrcode:', typeof window.qrcode);
                            console.error('🔍 typeof QRCode:', typeof QRCode);
                            // Tentar próxima URL
                            tryLoadScript(urlIndex + 1);
                        }
                    }, 300);
                };
                
                newScript.onerror = (error) => {
                    console.error(`❌ Erro ao carregar de ${url}`);
                    console.error('🔍 Detalhes do erro:', error);
                    window.qrcodeLoaded = false;
                    
                    // Verificar se é problema de rede
                    if (urlIndex === 0) {
                        console.warn('⚠️ Primeira tentativa falhou. Verificando conectividade...');
                        // Tentar fazer uma requisição simples para verificar conectividade
                        fetch('https://www.google.com/favicon.ico', { 
                            method: 'HEAD', 
                            mode: 'no-cors',
                            cache: 'no-cache'
                        }).then(() => {
                            console.log('✅ Conectividade com internet OK');
                        }).catch(() => {
                            console.error('❌ Problema de conectividade detectado');
                        });
                    }
                    
                    // Tentar próxima URL
                    tryLoadScript(urlIndex + 1);
                };
                
                // Adicionar script ao DOM
                document.head.appendChild(newScript);
            };
            
            tryLoadScript(0);
        });
    }

    // ========== SKELETON LOADING ==========
    
    // Criar HTML do skeleton
    createSkeletonHTML(count = 6, isSmall = false) {
        const skeletonClass = isSmall ? 'skeleton-card-small' : 'skeleton-card';
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="${skeletonClass}">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                </div>
            `;
        }
        return html;
    }
    
    // Mostrar skeleton em um container
    showSkeleton(containerId, count = 6, isSmall = false) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const skeletonContainer = document.createElement('div');
        skeletonContainer.className = isSmall ? 'skeleton-list' : 'skeleton-container';
        skeletonContainer.id = `${containerId}-skeleton`;
        skeletonContainer.innerHTML = this.createSkeletonHTML(count, isSmall);
        
        container.innerHTML = '';
        container.appendChild(skeletonContainer);
    }
    
    // Ocultar skeleton
    hideSkeleton(containerId) {
        const skeleton = document.getElementById(`${containerId}-skeleton`);
        if (skeleton) {
            skeleton.remove();
        }
    }

    // Funções auxiliares para feedback visual
    showError(message) {
        // Usar sistema de Toast para erros
        if (typeof toast !== 'undefined' && toast) {
            toast.error(message, 5000);
        } else {
            // Fallback para alert se toast não estiver disponível
            alert(message);
        }
    }

    showSuccess(message) {
        // Usar sistema de Toast para sucessos
        if (typeof toast !== 'undefined' && toast) {
            toast.success(message, 3000);
        } else {
            // Fallback silencioso (não usar alert para sucesso)
            console.log('✅', message);
        }
    }

    // Método auxiliar para mostrar warning
    showWarning(message) {
        if (typeof toast !== 'undefined' && toast) {
            toast.warning(message, 4000);
        } else {
            alert(message);
        }
    }

    // Método auxiliar para mostrar info
    showInfo(message) {
        if (typeof toast !== 'undefined' && toast) {
            toast.info(message, 3000);
        } else {
            console.log('ℹ️', message);
        }
    }

    // Método auxiliar antigo (manter compatibilidade)
    showSuccessOld(message) {
        // Remover mensagens anteriores
        const existingError = document.querySelector('.error-message');
        const existingSuccess = document.querySelector('.success-message');
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();

        // Criar nova mensagem de sucesso
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message show';
        successDiv.textContent = message;
        successDiv.setAttribute('role', 'status');
        successDiv.setAttribute('aria-live', 'polite');

        // Inserir no início do formulário ativo ou no topo da página
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            const form = activeModal.querySelector('form');
            if (form) {
                form.insertBefore(successDiv, form.firstChild);
            } else {
                activeModal
                    .querySelector('.modal-content')
                    .insertBefore(
                        successDiv,
                        activeModal.querySelector('.modal-content').firstChild
                    );
            }
        } else {
            // Se não houver modal, inserir no topo do main-content
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.insertBefore(successDiv, mainContent.firstChild);
            }
        }

        // Remover após 3 segundos
        setTimeout(() => {
            successDiv.classList.remove('show');
            setTimeout(() => successDiv.remove(), 300);
        }, 3000);
    }

    // ========== FUNÇÕES QR CODE ==========

    // Gerar código numérico único (9 dígitos usando apenas 1-9)
    generateQRCodeNumber() {
        // Gerar código único de 9 dígitos para identificar o produto
        // Formato: 9 dígitos numéricos (1-9, excluindo 0 para evitar confusão)
        let code = '';
        const digits = '123456789';
        const maxAttempts = 100; // Limite de tentativas para evitar loop infinito
        let attempts = 0;

        do {
            code = '';
            // Gerar código de 9 dígitos
            for (let i = 0; i < 9; i++) {
                code += digits.charAt(Math.floor(Math.random() * digits.length));
            }
            attempts++;

            // Verificar se o código já existe
            const existingItem = this.items.find(
                (item) => item.qrCodeNumber === code
            );
            
            if (!existingItem) {
                // Código único encontrado
                console.log(`✅ QR Code único gerado: ${code} (tentativa ${attempts})`);
                return code;
            }
            
            // Se chegou ao limite de tentativas, adicionar timestamp para garantir unicidade
            if (attempts >= maxAttempts) {
                console.warn(`⚠️ Muitas tentativas para gerar QR code único. Adicionando timestamp...`);
                // Adicionar últimos 4 dígitos do timestamp para garantir unicidade
                const timestamp = Date.now().toString().slice(-4);
                code = code.slice(0, 5) + timestamp;
                // Verificar novamente
                const stillExists = this.items.find(
                    (item) => item.qrCodeNumber === code
                );
                if (!stillExists) {
                    console.log(`✅ QR Code único gerado com timestamp: ${code}`);
                    return code;
                }
            }
        } while (attempts < maxAttempts * 2); // Limite máximo de segurança

        // Último recurso: usar timestamp completo (menos legível, mas garantido único)
        const fallbackCode = Date.now().toString().slice(-9);
        console.warn(`⚠️ Usando código de fallback baseado em timestamp: ${fallbackCode}`);
        return fallbackCode;
    }

    generateQRCode(itemId) {
        // Verificar se a biblioteca está carregada (múltiplas formas de acesso)
        const QRCodeLib = window.QRCode || window.qrcode || (window.QRCodeLib && window.QRCodeLib.default);
        
        if (!QRCodeLib) {
            console.warn('⚠️ Biblioteca QRCode não encontrada imediatamente');
            console.log('🔄 Tentando carregar biblioteca QRCode...');
            // Tentar carregar a biblioteca dinamicamente
            this.loadQRCodeLibrary().then(() => {
                console.log('✅ Biblioteca QRCode carregada, tentando gerar novamente...');
                this.generateQRCode(itemId);
            }).catch((error) => {
                console.error('❌ Erro ao carregar biblioteca QRCode:', error);
            });
            return;
        }

        const canvas = document.getElementById('qrcodeCanvas');
        const section = document.getElementById('qrcodeSection');

        if (!canvas || !section) return;

        // Buscar o item para obter o código numérico
        const item = this.items.find((i) => i.id === itemId);
        if (!item || !item.qrCodeNumber) {
            console.error('Item não encontrado ou sem código QR');
            return;
        }

        // Usar o código numérico no QR Code
        const qrData = item.qrCodeNumber;
        console.log('Gerando QR code para:', qrData);

        // Limpar canvas antes de gerar novo QR code
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Usar a biblioteca já verificada anteriormente
        QRCodeLib.toCanvas(
            canvas,
            qrData,
            {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
                errorCorrectionLevel: 'M',
            },
            (error) => {
                if (error) {
                    console.error('Erro ao gerar QR code:', error);
                    alert('Erro ao gerar QR code: ' + error.message);
                } else {
                    console.log('QR code gerado com sucesso para:', qrData);
                    // Verificar se o QR code foi realmente desenhado
                    setTimeout(() => {
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        // Um QR code válido terá pixels pretos (0,0,0) e brancos (255,255,255)
                        // Verificar se há pixels pretos (que indicam que o QR code foi desenhado)
                        let blackPixels = 0;
                        let whitePixels = 0;
                        for (let i = 0; i < imageData.data.length; i += 4) {
                            const r = imageData.data[i];
                            const g = imageData.data[i + 1];
                            const b = imageData.data[i + 2];
                            // Pixel preto (ou quase preto)
                            if (r < 50 && g < 50 && b < 50) {
                                blackPixels++;
                            }
                            // Pixel branco (ou quase branco)
                            else if (r > 200 && g > 200 && b > 200) {
                                whitePixels++;
                            }
                        }
                        const totalPixels = (canvas.width * canvas.height);
                        const blackPercentage = (blackPixels / totalPixels) * 100;
                        const whitePercentage = (whitePixels / totalPixels) * 100;
                        
                        // Um QR code válido deve ter pelo menos alguns pixels pretos e brancos
                        if (blackPixels === 0 && whitePixels === 0) {
                            console.warn('⚠️ Canvas está completamente vazio após geração');
                        } else if (blackPixels === 0) {
                            console.warn('⚠️ Canvas não contém pixels pretos (QR code pode estar incorreto)');
                        } else {
                            console.log(`✅ QR code verificado: ${blackPixels} pixels pretos (${blackPercentage.toFixed(2)}%), ${whitePixels} pixels brancos (${whitePercentage.toFixed(2)}%)`);
                        }
                    }, 200);
                    
                    if (section) {
                        section.style.display = 'block';
                    }
                }
            }
        );
    }

    generateQRCodeForModal(itemId, canvasId) {
        // Verificar se a biblioteca está carregada (múltiplas formas de acesso)
        const QRCodeLib = window.QRCode || window.qrcode || (window.QRCodeLib && window.QRCodeLib.default);
        
        if (!QRCodeLib) {
            console.warn('⚠️ Biblioteca QRCode não encontrada imediatamente');
            console.log('📦 Verificando se script está no DOM...');
            const existingScript = document.querySelector('script[src*="qrcode"]');
            if (existingScript) {
                console.log('📦 Script encontrado no DOM, aguardando carregamento...');
            }
            console.log('🔄 Tentando carregar biblioteca QRCode...');
            
            // Tentar carregar a biblioteca dinamicamente
            this.loadQRCodeLibrary().then(() => {
                console.log('✅ Biblioteca QRCode carregada, tentando gerar novamente...');
                this.generateQRCodeForModal(itemId, canvasId);
            }).catch((error) => {
                console.error('❌ Erro ao carregar biblioteca QRCode:', error);
                console.error('💡 Dica: Recarregue a página ou verifique sua conexão com a internet.');
                alert('Erro ao carregar biblioteca QRCode. Verifique sua conexão e recarregue a página.');
            });
            return;
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas não encontrado:', canvasId);
            return;
        }

        // Buscar o item para obter o código numérico
        const item = this.items.find((i) => i.id === itemId);
        if (!item) {
            console.error('Item não encontrado:', itemId);
            return;
        }

        if (!item.qrCodeNumber) {
            console.error('Item sem código QR:', itemId);
            alert('Item não possui código QR. Um código será gerado agora.');
            item.qrCodeNumber = this.generateQRCodeNumber();
            this.saveData();
        }

        // Usar o código numérico no QR Code
        const qrData = item.qrCodeNumber;
        console.log('Gerando QR code no canvas:', canvasId, 'com dados:', qrData);

        // Limpar canvas antes de gerar novo QR code
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width || 300, canvas.height || 300);

        // Garantir que o canvas tenha dimensões
        if (!canvas.width || !canvas.height) {
            canvas.width = 300;
            canvas.height = 300;
        }

        // Usar a biblioteca já verificada anteriormente
        QRCodeLib.toCanvas(
            canvas,
            qrData,
            {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
                errorCorrectionLevel: 'M',
            },
            (error) => {
                if (error) {
                    console.error('Erro ao gerar QR code:', error);
                    alert('Erro ao gerar QR code: ' + error.message);
                } else {
                    console.log('✅ QR code gerado com sucesso no modal:', qrData);
                    // Verificar se o QR code foi realmente desenhado
                    // Aguardar um pouco para garantir que o canvas foi renderizado
                    setTimeout(() => {
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        // Um QR code válido terá pixels pretos (0,0,0) e brancos (255,255,255)
                        // Verificar se há pixels pretos (que indicam que o QR code foi desenhado)
                        let blackPixels = 0;
                        let whitePixels = 0;
                        for (let i = 0; i < imageData.data.length; i += 4) {
                            const r = imageData.data[i];
                            const g = imageData.data[i + 1];
                            const b = imageData.data[i + 2];
                            // Pixel preto (ou quase preto)
                            if (r < 50 && g < 50 && b < 50) {
                                blackPixels++;
                            }
                            // Pixel branco (ou quase branco)
                            else if (r > 200 && g > 200 && b > 200) {
                                whitePixels++;
                            }
                        }
                        const totalPixels = (canvas.width * canvas.height);
                        const blackPercentage = (blackPixels / totalPixels) * 100;
                        const whitePercentage = (whitePixels / totalPixels) * 100;
                        
                        // Um QR code válido deve ter pelo menos alguns pixels pretos e brancos
                        if (blackPixels === 0 && whitePixels === 0) {
                            console.warn('⚠️ Canvas está completamente vazio após geração');
                        } else if (blackPixels === 0) {
                            console.warn('⚠️ Canvas não contém pixels pretos (QR code pode estar incorreto)');
                        } else {
                            console.log(`✅ QR code verificado: ${blackPixels} pixels pretos (${blackPercentage.toFixed(2)}%), ${whitePixels} pixels brancos (${whitePercentage.toFixed(2)}%)`);
                        }
                    }, 200);
                }
            }
        );
    }

    showQRCodeModal(itemId) {
        const item = this.items.find((i) => i.id === itemId);
        if (!item) {
            console.error('Item não encontrado:', itemId);
            return;
        }

        // Verificar se o item tem código QR
        if (!item.qrCodeNumber) {
            // Gerar código QR se não existir
            item.qrCodeNumber = this.generateQRCodeNumber();
            this.saveData();
            console.log('Código QR gerado para item:', item.qrCodeNumber);
        }

        const modal = document.getElementById('qrcodeModal');
        const canvas = document.getElementById('qrcodeModalCanvas');
        const itemNameEl = document.getElementById('qrcodeItemName');
        const downloadBtn = document.getElementById('downloadQRModalBtn');

        if (!modal || !canvas || !itemNameEl) {
            console.error('Elementos do modal não encontrados');
            return;
        }

        // Atualizar nome do item
        itemNameEl.textContent = this.getItemName(itemId);
        if (downloadBtn) downloadBtn.dataset.itemId = itemId;

        // Abrir modal primeiro para garantir que o canvas esteja visível
        modal.classList.add('active');

        // Aguardar um pouco para o modal renderizar antes de gerar o QR code
        setTimeout(() => {
            console.log('Gerando QR code no modal para:', item.qrCodeNumber);
            this.generateQRCodeForModal(itemId, 'qrcodeModalCanvas');
        }, 100);
    }

    downloadQRCode(canvasId, filename) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas não encontrado:', canvasId);
            return;
        }

        // Verificar se o canvas tem conteúdo
        const context = canvas.getContext('2d');
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const hasContent = imageData.data.some(channel => channel !== 0);

        // Se o canvas estiver vazio, tentar gerar o QR code primeiro
        if (!hasContent || canvas.width === 0 || canvas.height === 0) {
            console.warn('Canvas vazio, tentando gerar QR code...');
            
            // Tentar obter o itemId do contexto
            let itemId = null;
            if (canvasId === 'qrcodeCanvas' && this.currentEditingItem) {
                itemId = this.currentEditingItem.id;
            } else if (canvasId === 'qrcodeModalCanvas') {
                const downloadBtn = document.getElementById('downloadQRModalBtn');
                if (downloadBtn && downloadBtn.dataset.itemId) {
                    itemId = downloadBtn.dataset.itemId;
                }
            }

            if (itemId) {
                // Gerar QR code primeiro
                if (canvasId === 'qrcodeCanvas') {
                    this.generateQRCode(itemId);
                } else if (canvasId === 'qrcodeModalCanvas') {
                    this.generateQRCodeForModal(itemId, canvasId);
                }
                
                // Aguardar um pouco para o QR code ser gerado
                setTimeout(() => {
                    this.downloadQRCode(canvasId, filename);
                }, 500);
                return;
            } else {
                toast.error('Erro: Não foi possível identificar o item para gerar o QR code.', 4000);
                return;
            }
        }

        // Gerar o download
        try {
            const link = document.createElement('a');
            link.download = filename || `qrcode-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log('QR code baixado com sucesso:', filename);
        } catch (error) {
            console.error('Erro ao baixar QR code:', error);
            toast.error('Erro ao baixar QR code. Tente novamente.', 4000);
        }
    }

    printQRCode(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Imprimir QR Code</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 20px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                        @media print {
                            body { margin: 0; padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <img src="${dataUrl}" alt="QR Code" />
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }

    startQRScanner() {
        if (!window.Html5Qrcode) {
            alert(
                'Biblioteca de scanner não carregada. Verifique sua conexão.'
            );
            return;
        }

        const container = document.getElementById('qrScannerContainer');
        const readerDiv = document.getElementById('qrReader');

        if (!container || !readerDiv) return;

        // Parar scanner anterior se existir
        if (this.currentQRScanner) {
            this.stopQRScanner();
        }

        // Limpar conteúdo anterior
        readerDiv.innerHTML = '';

        container.style.display = 'block';

        const html5QrCode = new Html5Qrcode('qrReader');

        // Armazenar referência ANTES de iniciar
        this.currentQRScanner = html5QrCode;

        html5QrCode
            .start(
                { facingMode: 'environment' }, // Câmera traseira
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText, decodedResult) => {
                    // QR code lido com sucesso
                    this.handleQRScanned(decodedText);
                    html5QrCode
                        .stop()
                        .then(() => {
                            container.style.display = 'none';
                            this.currentQRScanner = null;
                        })
                        .catch((err) => {
                            console.error('Erro ao parar scanner:', err);
                            container.style.display = 'none';
                            this.currentQRScanner = null;
                        });
                },
                (errorMessage) => {
                    // Erro ignorado (continua escaneando)
                    // console.log('Erro de escaneamento:', errorMessage);
                }
            )
            .catch((err) => {
                // Erro ao iniciar scanner (ex: permissão negada)
                console.error('Erro ao iniciar scanner:', err);
                alert(
                    'Erro ao acessar a câmera. Verifique as permissões ou tente novamente.'
                );
                container.style.display = 'none';
                this.currentQRScanner = null;
            });
    }

    stopQRScanner() {
        const container = document.getElementById('qrScannerContainer');
        const readerDiv = document.getElementById('qrReader');

        if (this.currentQRScanner) {
            this.currentQRScanner
                .stop()
                .then(() => {
                    if (container) container.style.display = 'none';
                    if (readerDiv) readerDiv.innerHTML = '';
                    this.currentQRScanner = null;
                })
                .catch((err) => {
                    console.error('Erro ao parar scanner:', err);
                    // Mesmo com erro, esconder o container
                    if (container) container.style.display = 'none';
                    if (readerDiv) readerDiv.innerHTML = '';
                    this.currentQRScanner = null;
                });
        } else {
            // Se não houver scanner ativo, apenas esconder o container
            if (container) container.style.display = 'none';
            if (readerDiv) readerDiv.innerHTML = '';
        }
    }

    handleQRScanned(qrData) {
        // Limpar espaços e caracteres especiais
        const cleanData = qrData.trim();
        console.log(`📱 QR Code escaneado: "${cleanData}"`);

        // Buscar item pelo código numérico QR (prioridade - método atual)
        let item = this.items.find((i) => i.qrCodeNumber === cleanData);

        if (item) {
            console.log(`✅ Produto encontrado pelo QR Code: ${this.getItemName(item.id)} (ID: ${item.id})`);
        } else {
            console.log(`⚠️ Produto não encontrado pelo QR Code "${cleanData}". Tentando compatibilidade com formato antigo...`);
            
            // Se não encontrar pelo código numérico, tentar compatibilidade com formato antigo
            let itemId = null;

            if (cleanData.startsWith('ITEM:')) {
                itemId = cleanData.replace('ITEM:', '');
                console.log(`🔍 Tentando buscar por ID (formato ITEM:): ${itemId}`);
            } else {
                // Tentar como ID direto (compatibilidade com QR codes antigos)
                itemId = cleanData;
                console.log(`🔍 Tentando buscar por ID direto: ${itemId}`);
            }

            item = this.items.find((i) => i.id === itemId);
            
            if (item) {
                console.log(`✅ Produto encontrado por ID (formato antigo): ${this.getItemName(item.id)}`);
            } else {
                console.error(`❌ Produto não encontrado. QR Code: "${cleanData}"`);
            }
        }

        if (item) {
            const itemId = item.id;
            const itemName = this.getItemName(itemId);
            
            // Preencher campo de item
            const saleItemSelect = document.getElementById('saleItem');
            if (saleItemSelect) {
                saleItemSelect.value = itemId;

                // Disparar evento change para atualizar outros campos
                saleItemSelect.dispatchEvent(new Event('change'));
            }

            // Preencher preço automaticamente
            const salePriceInput = document.getElementById('salePrice');
            if (salePriceInput && item.price) {
                salePriceInput.value = item.price;
            }

            // Atualizar informações de estoque
            this.updateStockInfo();

            // Feedback visual melhorado
            const saleDayInfo = document.getElementById('saleDayInfo');
            if (saleDayInfo) {
                const originalBg = saleDayInfo.style.background;
                saleDayInfo.style.background = '#28a745';
                saleDayInfo.innerHTML = `<strong style="color: white;">✓ Produto identificado: ${itemName}</strong>`;
                setTimeout(() => {
                    saleDayInfo.style.background = originalBg;
                    saleDayInfo.innerHTML = `<strong>Dia: <span id="saleDayDisplay">${
                        this.currentSaleDay || '-'
                    }</span></strong>`;
                }, 3000);
            }

            // Mostrar notificação de sucesso
            this.showSuccess(`Produto "${itemName}" identificado pelo QR Code!`);
        } else {
            // Mensagem de erro mais informativa
            const errorMsg = `Produto não encontrado!\n\nQR Code escaneado: "${cleanData}"\n\nVerifique se:\n- O QR code pertence a um produto cadastrado\n- O produto não foi excluído\n- O QR code está correto`;
            alert(errorMsg);
            console.error('❌ Produto não encontrado pelo QR Code:', cleanData);
            console.log('📋 Produtos disponíveis:', this.items.map(i => ({ id: i.id, name: this.getItemName(i.id), qrCode: i.qrCodeNumber })));
        }
    }

    deleteItem(id) {
        // Verificar permissão de exclusão
        if (!this.checkPermission('delete', 'item')) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Você não tem permissão para excluir produtos.', 3000);
            } else {
                alert('Você não tem permissão para excluir produtos.');
            }
            return;
        }
        
        const item = this.items.find(i => i.id === id);
        const itemName = item ? this.getItemName(id) : 'este item';
        
        const performDelete = (confirmed) => {
            if (!confirmed) return;
            
            this.items = this.items.filter((item) => item.id !== id);
            // Remover tags relacionadas
            if (this.itemTags[id]) {
                delete this.itemTags[id];
            }
            // Remover vendas relacionadas
            this.groups.forEach((group) => {
                group.days.forEach((day) => {
                    day.sales = day.sales.filter((sale) => sale.itemId !== id);
                });
            });
            this.saveData();
            this.updateTagFilter(); // Atualizar lista de tags após deletar
            this.renderItems();
            this.renderGroups();
            
            // Registrar no audit log
            this.logAction('delete', 'item', id, itemName);
            if (typeof toast !== 'undefined' && toast) {
                toast.success(`Produto "${itemName}" excluído com sucesso!`, 3000);
            }
        };
        
        if (typeof confirmDialog !== 'undefined' && confirmDialog) {
            confirmDialog.danger(
                `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
                'Excluir Produto'
            ).then(performDelete);
        } else {
            // Fallback para confirm nativo
            if (confirm(`Tem certeza que deseja excluir "${itemName}"?`)) {
                performDelete(true);
            }
        }
    }

    // ========================================
    // SISTEMA DE BUSCA AVANÇADA
    // Padrões Emergente.sh
    // ========================================
    
    handleSearch(searchTerm) {
        if (!searchTerm || !searchTerm.trim()) {
            // Se busca vazia, renderizar normalmente
            this.renderItems();
            this.renderClients();
            this.hideSearchHistory();
            return;
        }
        
        const term = searchTerm.trim().toLowerCase();
        
        // Renderizar itens e clientes com busca
        this.renderItems();
        this.renderClients();
        
        // Mostrar contador de resultados
        this.showSearchResults(term);
    }
    
    addToSearchHistory(searchTerm) {
        if (!searchTerm || !searchTerm.trim()) return;
        
        const term = searchTerm.trim();
        
        // Remover se já existe
        this.searchHistory = this.searchHistory.filter(h => h !== term);
        
        // Adicionar no início
        this.searchHistory.unshift(term);
        
        // Limitar a 10 itens
        if (this.searchHistory.length > 10) {
            this.searchHistory = this.searchHistory.slice(0, 10);
        }
        
        // Salvar no localStorage
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }
    
    loadSearchHistory() {
        const saved = localStorage.getItem('searchHistory');
        if (saved) {
            try {
                this.searchHistory = JSON.parse(saved);
            } catch (e) {
                this.searchHistory = [];
            }
        }
    }
    
    showSearchHistory() {
        if (this.searchHistory.length === 0) return;
        
        let historyContainer = document.getElementById('searchHistoryContainer');
        if (!historyContainer) {
            historyContainer = document.createElement('div');
            historyContainer.id = 'searchHistoryContainer';
            historyContainer.className = 'search-history-container';
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.parentElement) {
                searchInput.parentElement.appendChild(historyContainer);
            }
        }
        
        historyContainer.innerHTML = `
            <div class="search-history-header">
                <span>Buscas recentes</span>
                <button class="search-history-clear" onclick="app.clearSearchHistory()" aria-label="Limpar histórico">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="search-history-list">
                ${this.searchHistory.map(term => `
                    <button class="search-history-item" onclick="app.selectSearchHistory('${term.replace(/'/g, "\\'")}')">
                        <i class="fas fa-history"></i>
                        <span>${this.escapeHtml(term)}</span>
                    </button>
                `).join('')}
            </div>
        `;
        
        historyContainer.style.display = 'block';
    }
    
    hideSearchHistory() {
        const historyContainer = document.getElementById('searchHistoryContainer');
        if (historyContainer) {
            historyContainer.style.display = 'none';
        }
    }
    
    selectSearchHistory(term) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = term;
            this.handleSearch(term);
            this.hideSearchHistory();
        }
    }
    
    clearSearchHistory() {
        this.searchHistory = [];
        localStorage.removeItem('searchHistory');
        this.hideSearchHistory();
        if (typeof toast !== 'undefined' && toast) {
            toast.info('Histórico de buscas limpo', 2000);
        }
    }
    
    showSearchResults(searchTerm) {
        // Contar resultados
        const itemsGrid = document.getElementById('itemsGrid');
        const clientsList = document.getElementById('clientsList');
        
        let itemsCount = 0;
        let clientsCount = 0;
        
        if (itemsGrid) {
            itemsCount = itemsGrid.querySelectorAll('.item-card').length;
        }
        
        if (clientsList) {
            clientsCount = clientsList.querySelectorAll('.client-card, .item-card').length;
        }
        
        const totalResults = itemsCount + clientsCount;
        
        // Mostrar toast com resultados (se houver)
        if (totalResults > 0 && typeof toast !== 'undefined' && toast) {
            // Não mostrar toast a cada busca, apenas se for uma busca nova
            // (evitar spam de notificações)
        }
    }

    // Renderizar tags de um item com cores
    renderItemTags(itemId) {
        const tags = this.itemTags[itemId] || [];
        if (tags.length === 0) return '';

        // Cores predefinidas para tags (paleta consistente)
        const tagColors = [
            '#dc3545', '#28a745', '#007bff', '#ffc107', '#17a2b8',
            '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6610f2'
        ];

        const getTagColor = (tag) => {
            // Gerar índice baseado no hash da tag para consistência
            let hash = 0;
            for (let i = 0; i < tag.length; i++) {
                hash = tag.charCodeAt(i) + ((hash << 5) - hash);
            }
            return tagColors[Math.abs(hash) % tagColors.length];
        };

        return `
            <div class="item-tags" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.75rem 0;">
                ${tags.map(tag => {
                    const color = getTagColor(tag);
                    const textColor = this.getContrastColor(color);
                    return `
                        <span class="item-tag" 
                              style="background-color: ${color}; color: ${textColor}; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500; display: inline-flex; align-items: center; gap: 0.25rem; cursor: pointer; transition: all 0.2s;"
                              onclick="app.filterByTag('${tag.replace(/'/g, "\\'")}')"
                              title="Clique para filtrar por esta tag">
                            <i class="fas fa-tag" style="font-size: 0.65rem;"></i>
                            ${this.escapeHtml(tag)}
                        </span>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Filtrar por tag
    filterByTag(tag) {
        const tagFilter = document.getElementById('tagFilter');
        if (tagFilter) {
            tagFilter.value = tag;
            // Disparar evento change para atualizar a lista
            tagFilter.dispatchEvent(new Event('change'));
        }
    }

    // Atualizar lista de tags disponíveis no filtro
    updateTagFilter() {
        const tagFilter = document.getElementById('tagFilter');
        if (!tagFilter) return;

        // Coletar todas as tags únicas
        const allTags = new Set();
        Object.values(this.itemTags || {}).forEach(tags => {
            tags.forEach(tag => allTags.add(tag));
        });

        const currentValue = tagFilter.value;
        tagFilter.innerHTML = '<option value="">Todas as tags</option>';
        
        Array.from(allTags).sort().forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });

        // Restaurar valor anterior se existir
        if (currentValue && allTags.has(currentValue)) {
            tagFilter.value = currentValue;
        }
    }

    // Calcular cor de texto contrastante
    getContrastColor(hexColor) {
        // Converter hex para RGB
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        
        // Calcular luminosidade relativa
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Retornar branco ou preto baseado na luminosidade
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    renderItems() {
        const grid = document.getElementById('itemsGrid');
        // Se a seção de produtos não existe, não renderizar
        if (!grid) return;
        
        // Mostrar skeleton enquanto carrega (apenas se não houver dados ainda)
        if (this.items.length === 0 && !grid.querySelector('.item-card')) {
            this.showSkeleton('itemsGrid', 6, false);
            return;
        }
        
        const searchInput = document.getElementById('searchInput');
        const monthFilterEl = document.getElementById('monthFilter');
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const monthFilter = monthFilterEl ? monthFilterEl.value : '';

        // Filtrar apenas produtos físicos (excluir serviços) para o Painel de Vendas
        let filteredItems = this.items.filter(
            (item) => item.category !== 'Serviços'
        );

        // Filtro de pesquisa
        if (searchTerm) {
            filteredItems = filteredItems.filter((item) => {
                const search = searchTerm.toLowerCase();
                const category = item.category || 'Roupas';

                return (
                    item.name.toLowerCase().includes(search) ||
                    (category === 'Roupas' &&
                        item.brand &&
                        item.brand.toLowerCase().includes(search)) ||
                    (category === 'Roupas' &&
                        item.style &&
                        item.style.toLowerCase().includes(search)) ||
                    (category === 'Roupas' &&
                        item.size &&
                        item.size.toLowerCase().includes(search)) ||
                    (category === 'Eletrônicos' &&
                        item.model &&
                        item.model.toLowerCase().includes(search)) ||
                    (category === 'Eletrônicos' &&
                        item.capacity &&
                        item.capacity.toLowerCase().includes(search)) ||
                    (category === 'Eletrônicos' &&
                        item.color &&
                        item.color.toLowerCase().includes(search)) ||
                    (item.notes && item.notes.toLowerCase().includes(search))
                );
            });
        }

        // Filtro por mês (itens vendidos no mês)
        if (monthFilter) {
            const [year, month] = monthFilter.split('-');
            filteredItems = filteredItems.filter((item) => {
                return this.groups.some((group) => {
                    if (group.month === monthFilter) {
                        return group.days.some((day) =>
                            day.sales.some((sale) => sale.itemId === item.id)
                        );
                    }
                    return false;
                });
            });
        }

        // Filtro por tag
        const tagFilter = document.getElementById('tagFilter')?.value;
        if (tagFilter) {
            filteredItems = filteredItems.filter((item) => {
                const itemTags = this.itemTags[item.id] || [];
                return itemTags.includes(tagFilter);
            });
        }

        if (filteredItems.length === 0) {
            grid.innerHTML =
                `<div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">
                        <i class="fas fa-box-open"></i>
                    </div>
                    <h3 class="empty-state-title">${searchTerm ? 'Nenhum item encontrado' : 'Nenhum produto cadastrado'}</h3>
                    <p class="empty-state-message">
                        ${searchTerm 
                            ? 'Tente ajustar os filtros de pesquisa ou adicionar um novo produto.' 
                            : 'Comece adicionando seu primeiro produto ao sistema. Clique no botão abaixo para começar!'}
                    </p>
                    ${!searchTerm ? `
                        <div class="empty-state-action">
                            <button class="btn-primary" onclick="app.openItemModal()">
                                <i class="fas fa-plus"></i> Adicionar Primeiro Produto
                            </button>
                        </div>
                    ` : ''}
                </div>`;
            return;
        }

        grid.innerHTML = filteredItems
            .map((item) => {
                const category = item.category || 'Roupas'; // Compatibilidade com itens antigos
                let categoryInfo = '';

                if (category === 'Roupas') {
                    categoryInfo = `
                    ${
                        item.style
                            ? `<div class="item-info">Estilo: ${this.escapeHtml(
                                  item.style
                              )}</div>`
                            : ''
                    }
                    ${
                        item.size
                            ? `<div class="item-info">Tamanho: ${this.escapeHtml(
                                  item.size
                              )}</div>`
                            : ''
                    }
                    ${
                        item.gender
                            ? `<div class="item-info">Gênero: ${this.escapeHtml(
                                  item.gender
                              )}</div>`
                            : ''
                    }
                `;
                } else if (category === 'Eletrônicos') {
                    categoryInfo = `
                    ${
                        item.model
                            ? `<div class="item-info">Modelo: ${this.escapeHtml(
                                  item.model
                              )}</div>`
                            : ''
                    }
                    ${
                        item.capacity
                            ? `<div class="item-info">Capacidade: ${this.escapeHtml(
                                  item.capacity
                              )}</div>`
                            : ''
                    }
                    ${
                        item.color
                            ? `<div class="item-info">Cor: ${this.escapeHtml(
                                  item.color
                              )}</div>`
                            : ''
                    }
                `;
                }

                // Para eletrônicos, mostrar modelo como título principal
                // Para roupas, se não tiver nome, usar marca + estilo ou apenas marca
                // Para serviços, usar nome do serviço
                let displayName;
                if (category === 'Eletrônicos' && item.model) {
                    displayName = item.model;
                } else if (category === 'Roupas') {
                    if (item.name) {
                        displayName = item.name;
                    } else {
                        // Se não tiver nome, usar marca + estilo ou apenas marca
                        const parts = [item.brand || ''];
                        if (item.style) parts.push(item.style);
                        displayName =
                            parts.filter((p) => p).join(' - ') || 'Roupa';
                    }
                    // Adicionar tamanho ao nome se existir
                    if (item.size) {
                        displayName += ` – tamanho ${item.size}`;
                    }
                } else {
                    displayName = item.name || 'Item';
                }

                // Determinar classe do badge baseado na categoria
                let badgeClass = '';
                if (category === 'Eletrônicos') {
                    badgeClass = 'electronics-badge';
                } else if (category === 'Roupas') {
                    badgeClass = 'clothing-badge';
                }

                return `
            <div class="item-card">
                <div class="item-category-badge ${badgeClass}">${this.escapeHtml(
                    category
                )}</div>
                <h3>${this.escapeHtml(displayName)}</h3>
                ${
                    category === 'Roupas' && item.name
                        ? `<div class="item-info">Marca: ${this.escapeHtml(
                              item.brand
                          )}</div>`
                        : ''
                }
                ${categoryInfo}
                ${this.renderItemTags(item.id)}
                <div class="item-price">R$ ${item.price
                    .toFixed(2)
                    .replace('.', ',')}</div>
                <div class="item-actions">
                    ${
                        category !== 'Serviços'
                            ? `<button class="btn-small btn-secondary" onclick="app.showQRCodeModal('${item.id}')" title="Ver QR Code">
                            <i class="fas fa-qrcode"></i> QR Code
                        </button>`
                            : ''
                    }
                    <div class="item-actions-row">
                        <button class="btn-small btn-edit" onclick="app.openItemModal(${JSON.stringify(
                            item
                        ).replace(/"/g, '&quot;')})">Editar</button>
                        <button class="btn-small btn-delete" onclick="app.deleteItem('${
                            item.id
                        }')" title="Excluir"><i class="fas fa-times"></i></button>
                    </div>
                </div>
            </div>
        `;
            })
            .join('');
    }

    // ========== CLIENTES ==========

    openClientModal(clientId = null) {
        const modal = document.getElementById('clientModal');
        const form = document.getElementById('clientForm');
        const title = document.getElementById('clientModalTitle');

        if (!modal || !form || !title) {
            console.error('Elementos do modal de cliente não encontrados');
            return;
        }

        this.currentEditingClient = clientId
            ? this.clients.find((c) => c.id === clientId)
            : null;

        if (this.currentEditingClient) {
            title.textContent = 'Editar Cliente';
            form.clientName.value = this.currentEditingClient.name || '';
            form.clientCPF.value = this.currentEditingClient.cpf || '';
            form.clientPhone.value = this.currentEditingClient.phone || '';
            form.clientEmail.value = this.currentEditingClient.email || '';
            form.clientAddress.value = this.currentEditingClient.address || '';
            form.clientNotes.value = this.currentEditingClient.notes || '';
            form.clientLoyaltyPoints.value = this.currentEditingClient.loyaltyPoints || 0;
            form.clientReceiveNotifications.checked = this.currentEditingClient.receiveNotifications !== false;
        } else {
            title.textContent = 'Novo Cliente';
            form.reset();
        }

        modal.classList.add('active');

        // Configurar validação em tempo real
        if (typeof fieldValidator !== 'undefined') {
            const clientName = form.clientName;
            const clientCPF = form.clientCPF;
            const clientPhone = form.clientPhone;
            const clientEmail = form.clientEmail;
            const clientNotes = form.clientNotes;

            if (clientName) {
                fieldValidator.setupFieldValidation(clientName, { required: true, minLength: 2, maxLength: 100 });
            }
            if (clientCPF) {
                fieldValidator.setupFieldValidation(clientCPF, { cpf: true });
            }
            if (clientPhone) {
                fieldValidator.setupFieldValidation(clientPhone, { phone: true });
            }
            if (clientEmail) {
                fieldValidator.setupFieldValidation(clientEmail, { email: true });
            }
            if (clientNotes) {
                fieldValidator.setupFieldValidation(clientNotes, { maxLength: 500 });
            }
        }
    }

    closeClientModal() {
        const modal = document.getElementById('clientModal');
        const form = document.getElementById('clientForm');
        if (modal) {
            modal.classList.remove('active');
        }
        if (form) {
            form.reset();
        }
        this.currentEditingClient = null;
    }

    saveClient(e) {
        if (e) e.preventDefault();
        
        // Verificar permissão de escrita
        if (!this.checkPermission('write', 'client')) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Você não tem permissão para criar/editar clientes.', 3000);
            }
            return;
        }

        const form = document.getElementById('clientForm');
        if (!form) return;

        const name = form.clientName.value.trim();
        if (!name) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Por favor, informe o nome do cliente.', 3000);
            } else {
                alert('Por favor, informe o nome do cliente.');
            }
            return;
        }

        const loyaltyPoints = parseInt(form.clientLoyaltyPoints.value) || 0;
        const receiveNotifications = form.clientReceiveNotifications.checked;
        
        const client = {
            id: this.currentEditingClient
                ? this.currentEditingClient.id
                : Date.now().toString(),
            name: name,
            cpf: form.clientCPF.value.trim(),
            phone: form.clientPhone.value.trim(),
            email: form.clientEmail.value.trim(),
            address: form.clientAddress.value.trim(),
            notes: form.clientNotes.value.trim(),
            loyaltyPoints: loyaltyPoints,
            receiveNotifications: receiveNotifications,
            createdAt: this.currentEditingClient
                ? this.currentEditingClient.createdAt
                : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Salvar dados anteriores antes de atualizar (para reversão)
        let previousData = null;
        if (this.currentEditingClient) {
            const index = this.clients.findIndex(
                (c) => c.id === this.currentEditingClient.id
            );
            if (index !== -1) {
                // Salvar cópia dos dados anteriores antes de atualizar
                previousData = JSON.parse(JSON.stringify(this.clients[index]));
                this.clients[index] = client;
            }
        } else {
            this.clients.push(client);
        }

        this.saveData();
        this.renderClients();
        this.closeClientModal();

        // Registrar no audit log (incluir dados anteriores para reversão)
        this.logAction(
            this.currentEditingClient ? 'update' : 'create',
            'client',
            client.id,
            client.name,
            {
                cpf: client.cpf || null,
                phone: client.phone || null,
                previousData: previousData, // Dados anteriores para reversão
            }
        );

        // Registrar acesso a dados pessoais (LGPD)
        this.logDataAccess(
            this.currentEditingClient ? 'update' : 'create',
            'client',
            client.id,
            `${this.currentEditingClient ? 'Atualização' : 'Criação'} de cliente: ${client.name}`
        );

        if (typeof toast !== 'undefined' && toast) {
            toast.success(
                this.currentEditingClient
                    ? 'Cliente atualizado com sucesso!'
                    : 'Cliente cadastrado com sucesso!',
                3000
            );
        }
    }

    deleteClient(clientId) {
        // Verificar permissão de exclusão
        if (!this.checkPermission('delete', 'client')) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Você não tem permissão para excluir clientes.', 3000);
            }
            return;
        }
        
        const client = this.clients.find((c) => c.id === clientId);
        const clientName = client ? client.name : 'este cliente';

        const performDelete = (confirmed) => {
            if (!confirmed) return;

            this.clients = this.clients.filter((c) => c.id !== clientId);
            
            // Registrar acesso a dados pessoais (LGPD)
            this.logDataAccess('delete', 'client', clientId, `Exclusão de cliente: ${clientName}`);
            
            this.saveData();
            this.renderClients();

            if (typeof toast !== 'undefined' && toast) {
                toast.success(`Cliente "${clientName}" excluído com sucesso!`, 3000);
            }
        };

        if (typeof confirmDialog !== 'undefined' && confirmDialog) {
            confirmDialog.danger(
                `Tem certeza que deseja excluir "${clientName}"? Esta ação não pode ser desfeita.`,
                'Excluir Cliente'
            ).then(performDelete);
        } else {
            if (confirm(`Tem certeza que deseja excluir "${clientName}"?`)) {
                performDelete(true);
            }
        }
    }

    renderClients() {
        const container = document.getElementById('clientsList');
        if (!container) return;

        const searchTerm = document.getElementById('clientSearch')
            ? document.getElementById('clientSearch').value.toLowerCase()
            : '';

        let filteredClients = this.clients;
        if (searchTerm) {
            filteredClients = this.clients.filter(
                (client) =>
                    client.name.toLowerCase().includes(searchTerm) ||
                    (client.cpf && client.cpf.includes(searchTerm)) ||
                    (client.phone && client.phone.includes(searchTerm))
            );
        }

        if (filteredClients.length === 0 && !container.querySelector('.item-card')) {
            this.showSkeleton('clientsList', 6, false);
            return;
        }

        this.hideSkeleton('clientsList');

        if (filteredClients.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3 class="empty-state-title">${searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</h3>
                    <p class="empty-state-message">
                        ${searchTerm 
                            ? 'Tente ajustar os termos de busca ou cadastrar um novo cliente.' 
                            : 'Comece cadastrando seus clientes para facilitar o controle de vendas e histórico de compras.'}
                    </p>
                    ${!searchTerm ? `
                        <div class="empty-state-action">
                            <button class="btn-primary" onclick="app.openClientModal()">
                                <i class="fas fa-user-plus"></i> Cadastrar Primeiro Cliente
                            </button>
                        </div>
                    ` : ''}
                </div>`;
            return;
        }

        container.innerHTML = filteredClients
            .map((client) => {
                const purchaseCount = this.completedSales.filter(
                    (sale) => sale.customerName === client.name
                ).length;
                const totalSpent = this.completedSales
                    .filter((sale) => sale.customerName === client.name)
                    .reduce((sum, sale) => sum + (sale.totalValue || 0), 0);

                return `
                <div class="item-card">
                    <div class="item-header">
                        <h3>${this.escapeHtml(client.name)}</h3>
                        <div class="item-actions">
                            <button class="btn-small btn-edit" onclick="app.openClientModal('${client.id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-small btn-delete" onclick="app.deleteClient('${client.id}')" title="Excluir">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="item-details">
                        ${client.cpf ? `<p><i class="fas fa-id-card"></i> CPF: ${this.escapeHtml(client.cpf)}</p>` : ''}
                        ${client.phone ? `<p><i class="fas fa-phone"></i> ${this.escapeHtml(client.phone)}</p>` : ''}
                        ${client.email ? `<p><i class="fas fa-envelope"></i> ${this.escapeHtml(client.email)}</p>` : ''}
                        ${purchaseCount > 0 ? `<p><i class="fas fa-shopping-cart"></i> ${purchaseCount} compra${purchaseCount > 1 ? 's' : ''}</p>` : ''}
                        ${totalSpent > 0 ? `<p><i class="fas fa-dollar-sign"></i> Total: R$ ${totalSpent.toFixed(2).replace('.', ',')}</p>` : ''}
                        ${client.loyaltyPoints > 0 ? `<p><i class="fas fa-star" style="color: #ffc107;"></i> ${client.loyaltyPoints} pontos de fidelidade</p>` : ''}
                        ${client.receiveNotifications ? `<p><i class="fas fa-bell" style="color: #28a745;"></i> Recebe notificações</p>` : ''}
                    </div>
                </div>
            `;
            })
            .join('');
    }

    // ========== FORNECEDORES ==========

    openSupplierModal(supplierId = null) {
        const modal = document.getElementById('supplierModal');
        const form = document.getElementById('supplierForm');
        const title = document.getElementById('supplierModalTitle');

        if (!modal || !form || !title) {
            console.error('Elementos do modal de fornecedor não encontrados');
            return;
        }

        this.currentEditingSupplier = supplierId
            ? this.suppliers.find((s) => s.id === supplierId)
            : null;

        if (this.currentEditingSupplier) {
            title.textContent = 'Editar Fornecedor';
            form.supplierName.value = this.currentEditingSupplier.name || '';
            form.supplierCNPJ.value = this.currentEditingSupplier.cnpj || '';
            form.supplierContactName.value = this.currentEditingSupplier.contactName || '';
            form.supplierPhone.value = this.currentEditingSupplier.phone || '';
            form.supplierEmail.value = this.currentEditingSupplier.email || '';
            form.supplierAddress.value = this.currentEditingSupplier.address || '';
            form.supplierRating.value = this.currentEditingSupplier.rating || 3;
            form.supplierNotes.value = this.currentEditingSupplier.notes || '';
            this.updateSupplierRatingDisplay();
        } else {
            title.textContent = 'Novo Fornecedor';
            form.reset();
            form.supplierRating.value = 3;
            this.updateSupplierRatingDisplay();
        }

        modal.classList.add('active');
    }

    updateSupplierRatingDisplay() {
        const ratingInput = document.getElementById('supplierRating');
        const ratingDisplay = document.getElementById('supplierRatingDisplay');
        if (ratingInput && ratingDisplay) {
            const rating = parseInt(ratingInput.value);
            ratingDisplay.textContent = `${rating} ${'⭐'.repeat(rating)}`;
        }
    }

    closeSupplierModal() {
        const modal = document.getElementById('supplierModal');
        const form = document.getElementById('supplierForm');
        if (modal) {
            modal.classList.remove('active');
        }
        if (form) {
            form.reset();
        }
        this.currentEditingSupplier = null;
    }

    saveSupplier(e) {
        if (e) e.preventDefault();
        
        // Verificar permissão de escrita
        if (!this.checkPermission('write', 'supplier')) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Você não tem permissão para criar/editar fornecedores.', 3000);
            }
            return;
        }

        const form = document.getElementById('supplierForm');
        if (!form) return;

        const name = form.supplierName.value.trim();
        if (!name) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Por favor, informe o nome do fornecedor.', 3000);
            }
            return;
        }

        const supplier = {
            id: this.currentEditingSupplier
                ? this.currentEditingSupplier.id
                : this.generateSupplierId(),
            name: name,
            cnpj: form.supplierCNPJ.value.trim(),
            contactName: form.supplierContactName.value.trim(),
            phone: form.supplierPhone.value.trim(),
            email: form.supplierEmail.value.trim(),
            address: form.supplierAddress.value.trim(),
            rating: parseInt(form.supplierRating.value) || 3,
            notes: form.supplierNotes.value.trim(),
            createdAt: this.currentEditingSupplier
                ? this.currentEditingSupplier.createdAt
                : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Salvar dados anteriores antes de atualizar (para reversão)
        let previousData = null;
        if (this.currentEditingSupplier) {
            const index = this.suppliers.findIndex(
                (s) => s.id === this.currentEditingSupplier.id
            );
            if (index !== -1) {
                // Salvar cópia dos dados anteriores antes de atualizar
                previousData = JSON.parse(JSON.stringify(this.suppliers[index]));
                this.suppliers[index] = supplier;
            }
        } else {
            this.suppliers.push(supplier);
        }

        this.saveData();
        this.renderSuppliers();
        this.closeSupplierModal();

        // Registrar no audit log (incluir dados anteriores para reversão)
        this.logAction(
            this.currentEditingSupplier ? 'update' : 'create',
            'supplier',
            supplier.id,
            supplier.name,
            {
                name: supplier.name,
                rating: supplier.rating,
                previousData: previousData, // Dados anteriores para reversão
            }
        );

        // Registrar acesso a dados pessoais (LGPD)
        this.logDataAccess(
            this.currentEditingSupplier ? 'update' : 'create',
            'supplier',
            supplier.id,
            `${this.currentEditingSupplier ? 'Atualização' : 'Criação'} de fornecedor: ${supplier.name}`
        );

        if (typeof toast !== 'undefined' && toast) {
            toast.success(
                this.currentEditingSupplier
                    ? 'Fornecedor atualizado com sucesso!'
                    : 'Fornecedor cadastrado com sucesso!',
                3000
            );
        }
    }

    deleteSupplier(supplierId) {
        // Verificar permissão de exclusão
        if (!this.checkPermission('delete', 'supplier')) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Você não tem permissão para excluir fornecedores.', 3000);
            }
            return;
        }
        
        const supplier = this.suppliers.find(s => s.id === supplierId);
        const supplierName = supplier ? supplier.name : 'este fornecedor';
        
        const performDelete = (confirmed) => {
            if (!confirmed) return;
            
            this.suppliers = this.suppliers.filter((s) => s.id !== supplierId);
            
            // Registrar acesso a dados pessoais (LGPD)
            this.logDataAccess('delete', 'supplier', supplierId, `Exclusão de fornecedor: ${supplierName}`);
            
            this.saveData();
            this.renderSuppliers();
            
            // Registrar no audit log
            this.logAction('delete', 'supplier', supplierId, supplierName);
            
            if (typeof toast !== 'undefined' && toast) {
                toast.success(`Fornecedor "${supplierName}" excluído com sucesso!`, 3000);
            }
        };
        
        if (typeof confirmDialog !== 'undefined' && confirmDialog) {
            confirmDialog.danger(
                `Tem certeza que deseja excluir o fornecedor "${supplierName}"? Esta ação não pode ser desfeita.`,
                'Excluir Fornecedor'
            ).then(performDelete);
        } else {
            if (confirm(`Tem certeza que deseja excluir o fornecedor "${supplierName}"?`)) {
                performDelete(true);
            }
        }
    }

    renderSuppliers() {
        const container = document.getElementById('suppliersList');
        if (!container) return;

        const searchTerm = document.getElementById('supplierSearch')
            ? document.getElementById('supplierSearch').value.toLowerCase()
            : '';

        let filteredSuppliers = this.suppliers;
        if (searchTerm) {
            filteredSuppliers = this.suppliers.filter(
                (supplier) =>
                    supplier.name.toLowerCase().includes(searchTerm) ||
                    (supplier.cnpj && supplier.cnpj.includes(searchTerm)) ||
                    (supplier.phone && supplier.phone.includes(searchTerm))
            );
        }

        if (filteredSuppliers.length === 0 && !container.querySelector('.item-card')) {
            this.showSkeleton('suppliersList', 6, false);
            return;
        }

        this.hideSkeleton('suppliersList');

        if (filteredSuppliers.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">
                        <i class="fas fa-truck"></i>
                    </div>
                    <h3 class="empty-state-title">${searchTerm ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}</h3>
                    <p class="empty-state-message">
                        ${searchTerm 
                            ? 'Tente ajustar os termos de busca ou cadastrar um novo fornecedor.' 
                            : 'Comece cadastrando seus fornecedores para facilitar o controle de compras e custos.'}
                    </p>
                    ${!searchTerm ? `
                        <div class="empty-state-action">
                            <button class="btn-primary" onclick="app.openSupplierModal()">
                                <i class="fas fa-truck"></i> Cadastrar Primeiro Fornecedor
                            </button>
                        </div>
                    ` : ''}
                </div>`;
            return;
        }

        container.innerHTML = filteredSuppliers
            .map((supplier) => {
                // Calcular histórico de compras (custos relacionados)
                const purchaseCount = this.costs.filter(
                    (cost) => cost.supplierId === supplier.id
                ).length;
                const totalPurchases = this.costs
                    .filter((cost) => cost.supplierId === supplier.id)
                    .reduce((sum, cost) => sum + (cost.total || 0), 0);

                return `
                <div class="item-card">
                    <div class="item-header">
                        <h3>${this.escapeHtml(supplier.name)}</h3>
                        <div class="item-actions">
                            <button class="btn-small btn-edit" onclick="app.openSupplierModal('${supplier.id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-small btn-delete" onclick="app.deleteSupplier('${supplier.id}')" title="Excluir">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="item-details">
                        ${supplier.cnpj ? `<p><i class="fas fa-id-card"></i> CNPJ: ${this.escapeHtml(supplier.cnpj)}</p>` : ''}
                        ${supplier.contactName ? `<p><i class="fas fa-user"></i> Contato: ${this.escapeHtml(supplier.contactName)}</p>` : ''}
                        ${supplier.phone ? `<p><i class="fas fa-phone"></i> ${this.escapeHtml(supplier.phone)}</p>` : ''}
                        ${supplier.email ? `<p><i class="fas fa-envelope"></i> ${this.escapeHtml(supplier.email)}</p>` : ''}
                        <p><i class="fas fa-star" style="color: #ffc107;"></i> Avaliação: ${'⭐'.repeat(supplier.rating || 3)} (${supplier.rating || 3}/5)</p>
                        ${purchaseCount > 0 ? `<p><i class="fas fa-shopping-cart"></i> ${purchaseCount} compra${purchaseCount > 1 ? 's' : ''}</p>` : ''}
                        ${totalPurchases > 0 ? `<p><i class="fas fa-dollar-sign"></i> Total: R$ ${totalPurchases.toFixed(2).replace('.', ',')}</p>` : ''}
                    </div>
                </div>
            `;
            })
            .join('');
    }

    generateSupplierId() {
        let id;
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
            id = 'SUPPLIER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
            attempts++;
        } while (this.suppliers.find(s => s.id === id) && attempts < maxAttempts);
        
        if (attempts >= maxAttempts) {
            id = 'SUPPLIER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        }
        
        return id;
    }

    // ========== CUPONS DE DESCONTO ==========

    openCouponModal(couponId = null) {
        const modal = document.getElementById('couponModal');
        const form = document.getElementById('couponForm');
        const title = document.getElementById('couponModalTitle');

        if (!modal || !form || !title) {
            console.error('Elementos do modal de cupom não encontrados');
            return;
        }

        this.currentEditingCoupon = couponId
            ? this.coupons.find((c) => c.id === couponId)
            : null;

        if (this.currentEditingCoupon) {
            title.textContent = 'Editar Cupom';
            form.couponCode.value = this.currentEditingCoupon.code || '';
            form.couponType.value = this.currentEditingCoupon.type || '';
            form.couponValue.value = this.currentEditingCoupon.value || '';
            form.couponDescription.value = this.currentEditingCoupon.description || '';
            form.couponStartsAt.value = this.currentEditingCoupon.startsAt || '';
            form.couponExpiresAt.value = this.currentEditingCoupon.expiresAt || '';
            form.couponMaxUses.value = this.currentEditingCoupon.maxUses || '';
            form.couponMinQuantity.value = this.currentEditingCoupon.minQuantity || '';
            form.couponActive.checked = this.currentEditingCoupon.active !== false;
        } else {
            title.textContent = 'Novo Cupom';
            form.reset();
            form.couponActive.checked = true;
        }

        modal.classList.add('active');
    }

    closeCouponModal() {
        const modal = document.getElementById('couponModal');
        const form = document.getElementById('couponForm');
        if (modal) {
            modal.classList.remove('active');
        }
        if (form) {
            form.reset();
        }
        this.currentEditingCoupon = null;
    }

    saveCoupon(e) {
        if (e) e.preventDefault();

        const form = document.getElementById('couponForm');
        if (!form) return;

        const code = form.couponCode.value.trim().toUpperCase();
        const type = form.couponType.value;
        const value = parseFloat(form.couponValue.value);
        const description = form.couponDescription.value.trim();
        const expiresAt = form.couponExpiresAt.value || null;
        const maxUses = form.couponMaxUses.value ? parseInt(form.couponMaxUses.value) : null;
        const active = form.couponActive.checked;

        if (!code) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Por favor, informe o código do cupom.', 3000);
            }
            return;
        }

        if (!type) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Por favor, selecione o tipo de desconto.', 3000);
            }
            return;
        }

        if (!value || value <= 0) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Por favor, informe um valor válido para o desconto.', 3000);
            }
            return;
        }

        if (type === 'percent' && value > 100) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('O desconto percentual não pode ser maior que 100%.', 3000);
            }
            return;
        }

        // Verificar se código já existe (exceto se estiver editando o mesmo cupom)
        const existingCoupon = this.coupons.find(
            (c) => c.code === code && (!this.currentEditingCoupon || c.id !== this.currentEditingCoupon.id)
        );
        if (existingCoupon) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Já existe um cupom com este código.', 3000);
            }
            return;
        }

        const coupon = {
            id: this.currentEditingCoupon
                ? this.currentEditingCoupon.id
                : this.generateCouponId(),
            code: code,
            type: type,
            value: value,
            description: description,
            startsAt: startsAt,
            expiresAt: expiresAt,
            maxUses: maxUses,
            minQuantity: minQuantity, // Quantidade mínima para aplicar desconto
            active: active,
            uses: this.currentEditingCoupon ? (this.currentEditingCoupon.uses || 0) : 0,
            createdAt: this.currentEditingCoupon
                ? this.currentEditingCoupon.createdAt
                : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Salvar dados anteriores antes de atualizar (para reversão)
        let previousData = null;
        if (this.currentEditingCoupon) {
            const index = this.coupons.findIndex(
                (c) => c.id === this.currentEditingCoupon.id
            );
            if (index !== -1) {
                // Salvar cópia dos dados anteriores antes de atualizar
                previousData = JSON.parse(JSON.stringify(this.coupons[index]));
                this.coupons[index] = coupon;
            }
        } else {
            this.coupons.push(coupon);
        }

        this.saveData();
        this.renderCoupons();
        this.closeCouponModal();
        
        // Registrar no audit log (incluir dados anteriores para reversão)
        this.logAction(
            this.currentEditingCoupon ? 'update' : 'create',
            'coupon',
            coupon.id,
            coupon.code,
            {
                type: coupon.type,
                value: coupon.value,
                previousData: previousData, // Dados anteriores para reversão
            }
        );

        if (typeof toast !== 'undefined' && toast) {
            toast.success(
                this.currentEditingCoupon
                    ? 'Cupom atualizado com sucesso!'
                    : 'Cupom cadastrado com sucesso!',
                3000
            );
        }
    }

    deleteCoupon(couponId) {
        const coupon = this.coupons.find(c => c.id === couponId);
        const couponCode = coupon ? coupon.code : 'este cupom';
        
        const performDelete = (confirmed) => {
            if (!confirmed) return;
            
            this.coupons = this.coupons.filter((c) => c.id !== couponId);
            this.saveData();
            this.renderCoupons();
            if (typeof toast !== 'undefined' && toast) {
                toast.success(`Cupom "${couponCode}" excluído com sucesso!`, 3000);
            }
        };
        
        if (typeof confirmDialog !== 'undefined' && confirmDialog) {
            confirmDialog.danger(
                `Tem certeza que deseja excluir o cupom "${couponCode}"? Esta ação não pode ser desfeita.`,
                'Excluir Cupom'
            ).then(performDelete);
        } else {
            if (confirm(`Tem certeza que deseja excluir o cupom "${couponCode}"?`)) {
                performDelete(true);
            }
        }
    }

    renderCoupons() {
        const container = document.getElementById('couponsList');
        if (!container) return;

        if (this.coupons.length === 0 && !container.querySelector('.item-card')) {
            this.showSkeleton('couponsList', 6, false);
            return;
        }

        this.hideSkeleton('couponsList');

        if (this.coupons.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">
                        <i class="fas fa-tag"></i>
                    </div>
                    <h3 class="empty-state-title">Nenhum cupom cadastrado</h3>
                    <p class="empty-state-message">
                        Comece criando cupons de desconto para oferecer promoções aos seus clientes.
                    </p>
                    <div class="empty-state-action">
                        <button class="btn-primary" onclick="app.openCouponModal()">
                            <i class="fas fa-tag"></i> Criar Primeiro Cupom
                        </button>
                    </div>
                </div>`;
            return;
        }

        container.innerHTML = this.coupons
            .map((coupon) => {
                const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                const isMaxUsesReached = coupon.maxUses && coupon.uses >= coupon.maxUses;
                const isActive = coupon.active && !isExpired && !isMaxUsesReached;

                return `
                <div class="item-card ${!isActive ? 'opacity-50' : ''}">
                    <div class="item-header">
                        <h3>${this.escapeHtml(coupon.code)}</h3>
                        <div class="item-actions">
                            <button class="btn-small btn-edit" onclick="app.openCouponModal('${coupon.id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-small btn-delete" onclick="app.deleteCoupon('${coupon.id}')" title="Excluir">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="item-details">
                        <p><i class="fas fa-percent"></i> Tipo: ${coupon.type === 'percent' ? 'Percentual' : 'Valor Fixo'}</p>
                        <p><i class="fas fa-dollar-sign"></i> Desconto: ${coupon.type === 'percent' ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2).replace('.', ',')}`}</p>
                        ${coupon.description ? `<p><i class="fas fa-info-circle"></i> ${this.escapeHtml(coupon.description)}</p>` : ''}
                        ${coupon.startsAt ? `<p><i class="fas fa-calendar-check"></i> Início: ${new Date(coupon.startsAt).toLocaleDateString('pt-BR')}</p>` : ''}
                        ${coupon.expiresAt ? `<p><i class="fas fa-calendar-times"></i> Expira em: ${new Date(coupon.expiresAt).toLocaleDateString('pt-BR')}</p>` : ''}
                        ${coupon.minQuantity ? `<p><i class="fas fa-shopping-bag"></i> Qtd. mínima: ${coupon.minQuantity} unidade(s)</p>` : ''}
                        ${coupon.maxUses ? `<p><i class="fas fa-times-circle"></i> Limite: ${coupon.maxUses} uso${coupon.maxUses > 1 ? 's' : ''}</p>` : ''}
                        <p><i class="fas fa-chart-line"></i> Usado: ${coupon.uses || 0} vez${(coupon.uses || 0) !== 1 ? 'es' : ''}</p>
                        <p><i class="fas fa-${isActive ? 'check-circle' : 'times-circle'}" style="color: ${isActive ? '#28a745' : '#dc3545'};"></i> Status: ${isActive ? 'Ativo' : isExpired ? 'Expirado' : isMaxUsesReached ? 'Limite atingido' : 'Inativo'}</p>
                    </div>
                </div>
            `;
            })
            .join('');
    }

    generateCouponId() {
        let id;
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
            id = 'COUPON_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
            attempts++;
        } while (this.coupons.find(c => c.id === id) && attempts < maxAttempts);
        
        if (attempts >= maxAttempts) {
            id = 'COUPON_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        }
        
        return id;
    }

    applyCouponCode() {
        const couponCodeInput = document.getElementById('saleCouponCode');
        if (!couponCodeInput) return;

        const code = couponCodeInput.value.trim().toUpperCase();
        if (!code) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Por favor, informe o código do cupom.', 3000);
            }
            return;
        }

        const coupon = this.coupons.find(
            (c) => c.code === code && c.active
        );

        if (!coupon) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Cupom não encontrado ou inativo.', 3000);
            }
            return;
        }

        // Verificar se está dentro do período válido
        const now = new Date();
        if (coupon.startsAt && new Date(coupon.startsAt) > now) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error(`Este cupom ainda não está ativo. Válido a partir de ${new Date(coupon.startsAt).toLocaleDateString('pt-BR')}.`, 4000);
            }
            return;
        }
        
        if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Este cupom está expirado.', 3000);
            }
            return;
        }

        // Verificar limite de uso
        if (coupon.maxUses && coupon.uses >= coupon.maxUses) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Este cupom atingiu o limite de uso.', 3000);
            }
            return;
        }

        // Verificar quantidade mínima (desconto por quantidade)
        const saleQuantity = parseInt(document.getElementById('saleQuantity')?.value || 0);
        if (coupon.minQuantity && saleQuantity < coupon.minQuantity) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning(`Este cupom requer compra mínima de ${coupon.minQuantity} unidade(s). Quantidade atual: ${saleQuantity}.`, 4000);
            }
            return;
        }

        // Aplicar desconto
        const discountType = document.getElementById('saleDiscountType');
        const discountValue = document.getElementById('saleDiscountValue');
        
        if (discountType && discountValue) {
            discountType.value = coupon.type;
            discountValue.value = coupon.value;
            
            // Armazenar código do cupom para salvar na venda
            if (!window.currentSaleCouponCode) {
                window.currentSaleCouponCode = coupon.code;
            }
            
            if (typeof this.updateSaleTotals === 'function') {
                this.updateSaleTotals();
            } else if (typeof this.updateDiscountCalculation === 'function') {
                this.updateDiscountCalculation();
            }
            
            if (typeof toast !== 'undefined' && toast) {
                toast.success(`Cupom "${coupon.code}" aplicado com sucesso!`, 3000);
            }
        }
    }

    // Alias para compatibilidade com HTML
    applyCoupon() {
        this.applyCouponCode();
    }

    // ========== TEMPLATES ==========

    openTemplateModal(templateId = null) {
        const modal = document.getElementById('templateModal');
        const form = document.getElementById('templateForm');
        const title = document.getElementById('templateModalTitle');

        if (!modal || !form || !title) {
            console.error('Elementos do modal de template não encontrados');
            return;
        }

        this.currentEditingTemplate = templateId
            ? this.templates.find((t) => t.id === templateId)
            : null;

        if (this.currentEditingTemplate) {
            title.textContent = 'Editar Template';
            form.templateName.value = this.currentEditingTemplate.name || '';
            form.templateType.value = this.currentEditingTemplate.type || '';
            form.templateDescription.value = this.currentEditingTemplate.description || '';
            
            // Preencher campos específicos do tipo
            if (this.currentEditingTemplate.type === 'product') {
                form.templateCategory.value = this.currentEditingTemplate.data?.category || '';
                form.templatePrice.value = this.currentEditingTemplate.data?.price || '';
            } else if (this.currentEditingTemplate.type === 'sale') {
                form.templateSaleQuantity.value = this.currentEditingTemplate.data?.quantity || '';
                form.templateSaleDiscount.value = this.currentEditingTemplate.data?.discount || '';
            } else if (this.currentEditingTemplate.type === 'service') {
                form.templateServiceHours.value = this.currentEditingTemplate.data?.hours || '';
                form.templateServiceMinutes.value = this.currentEditingTemplate.data?.minutes || '';
            } else if (this.currentEditingTemplate.type === 'report') {
                form.templateReportType.value = this.currentEditingTemplate.data?.reportType || '';
                form.templateReportPeriod.value = this.currentEditingTemplate.data?.period || 'month';
                form.templateReportFormat.value = this.currentEditingTemplate.data?.format || 'pdf';
                form.templateReportColumns.value = this.currentEditingTemplate.data?.columns || '';
                form.templateReportIncludeCharts.checked = this.currentEditingTemplate.data?.includeCharts || false;
            }
            
            this.toggleTemplateFields(this.currentEditingTemplate.type);
        } else {
            title.textContent = 'Novo Template';
            form.reset();
        }

        modal.classList.add('active');
    }

    toggleTemplateFields(type) {
        const productFields = document.getElementById('templateProductFields');
        const saleFields = document.getElementById('templateSaleFields');
        const serviceFields = document.getElementById('templateServiceFields');
        const reportFields = document.getElementById('templateReportFields');
        
        if (productFields) productFields.style.display = type === 'product' ? 'block' : 'none';
        if (saleFields) saleFields.style.display = type === 'sale' ? 'block' : 'none';
        if (serviceFields) serviceFields.style.display = type === 'service' ? 'block' : 'none';
        if (reportFields) reportFields.style.display = type === 'report' ? 'block' : 'none';
    }

    closeTemplateModal() {
        const modal = document.getElementById('templateModal');
        const form = document.getElementById('templateForm');
        if (modal) {
            modal.classList.remove('active');
        }
        if (form) {
            form.reset();
        }
        this.currentEditingTemplate = null;
    }

    saveTemplate(e) {
        if (e) e.preventDefault();

        const form = document.getElementById('templateForm');
        if (!form) return;

        const name = form.templateName.value.trim();
        const type = form.templateType.value;
        const description = form.templateDescription.value.trim();

        if (!name) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Por favor, informe o nome do template.', 3000);
            }
            return;
        }

        if (!type) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Por favor, selecione o tipo de template.', 3000);
            }
            return;
        }

        // Coletar dados específicos do tipo
        let templateData = {};
        if (type === 'product') {
            templateData = {
                category: form.templateCategory.value || '',
                price: parseFloat(form.templatePrice.value) || 0,
            };
        } else if (type === 'sale') {
            templateData = {
                quantity: parseInt(form.templateSaleQuantity.value) || 1,
                discount: parseFloat(form.templateSaleDiscount.value) || 0,
            };
        } else if (type === 'service') {
            templateData = {
                hours: parseInt(form.templateServiceHours.value) || 0,
                minutes: parseInt(form.templateServiceMinutes.value) || 0,
            };
        } else if (type === 'report') {
            const reportType = form.templateReportType.value;
            if (!reportType) {
                if (typeof toast !== 'undefined' && toast) {
                    toast.warning('Por favor, selecione o tipo de relatório.', 3000);
                }
                return;
            }
            templateData = {
                reportType: reportType,
                period: form.templateReportPeriod.value || 'month',
                format: form.templateReportFormat.value || 'pdf',
                columns: form.templateReportColumns.value.split(',').map(c => c.trim()).filter(c => c) || [],
                includeCharts: form.templateReportIncludeCharts.checked || false,
            };
        }

        const template = {
            id: this.currentEditingTemplate
                ? this.currentEditingTemplate.id
                : this.generateTemplateId(),
            name: name,
            type: type,
            description: description,
            data: templateData,
            createdAt: this.currentEditingTemplate
                ? this.currentEditingTemplate.createdAt
                : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (this.currentEditingTemplate) {
            const index = this.templates.findIndex(
                (t) => t.id === this.currentEditingTemplate.id
            );
            if (index !== -1) {
                this.templates[index] = template;
            }
        } else {
            this.templates.push(template);
        }

        this.saveData();
        this.renderTemplates();
        this.closeTemplateModal();

        // Registrar no audit log
        this.logAction(
            this.currentEditingTemplate ? 'update' : 'create',
            'template',
            template.id,
            template.name,
            { type: template.type }
        );

        if (typeof toast !== 'undefined' && toast) {
            toast.success(
                this.currentEditingTemplate
                    ? 'Template atualizado com sucesso!'
                    : 'Template criado com sucesso!',
                3000
            );
        }
    }

    deleteTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        const templateName = template ? template.name : 'este template';
        
        const performDelete = (confirmed) => {
            if (!confirmed) return;
            
            this.templates = this.templates.filter((t) => t.id !== templateId);
            this.saveData();
            this.renderTemplates();
            
            // Registrar no audit log
            this.logAction('delete', 'template', templateId, templateName);
            
            if (typeof toast !== 'undefined' && toast) {
                toast.success(`Template "${templateName}" excluído com sucesso!`, 3000);
            }
        };
        
        if (typeof confirmDialog !== 'undefined' && confirmDialog) {
            confirmDialog.danger(
                `Tem certeza que deseja excluir o template "${templateName}"? Esta ação não pode ser desfeita.`,
                'Excluir Template'
            ).then(performDelete);
        } else {
            if (confirm(`Tem certeza que deseja excluir o template "${templateName}"?`)) {
                performDelete(true);
            }
        }
    }

    renderTemplates() {
        const container = document.getElementById('templatesList');
        if (!container) return;

        if (this.templates.length === 0 && !container.querySelector('.item-card')) {
            this.showSkeleton('templatesList', 6, false);
            return;
        }

        this.hideSkeleton('templatesList');

        if (this.templates.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <h3 class="empty-state-title">Nenhum template cadastrado</h3>
                    <p class="empty-state-message">
                        Crie templates para agilizar o cadastro de produtos, vendas e serviços frequentes.
                    </p>
                    <div class="empty-state-action">
                        <button class="btn-primary" onclick="app.openTemplateModal()">
                            <i class="fas fa-file-alt"></i> Criar Primeiro Template
                        </button>
                    </div>
                </div>`;
            return;
        }

        const typeNames = {
            product: 'Produto',
            sale: 'Venda',
            service: 'Serviço',
            report: 'Relatório',
        };

        const typeIcons = {
            product: 'fa-box',
            sale: 'fa-shopping-cart',
            service: 'fa-tools',
            report: 'fa-chart-bar',
        };

        container.innerHTML = this.templates
            .map((template) => {
                let details = '';
                if (template.type === 'product' && template.data) {
                    details = `<p><i class="fas fa-tag"></i> Categoria: ${template.data.category || 'N/A'}</p>
                               <p><i class="fas fa-dollar-sign"></i> Preço: R$ ${(template.data.price || 0).toFixed(2).replace('.', ',')}</p>`;
                } else if (template.type === 'sale' && template.data) {
                    details = `<p><i class="fas fa-shopping-bag"></i> Qtd. padrão: ${template.data.quantity || 1}</p>
                               <p><i class="fas fa-percent"></i> Desconto: ${(template.data.discount || 0).toFixed(1)}%</p>`;
                } else if (template.type === 'service' && template.data) {
                    details = `<p><i class="fas fa-clock"></i> Duração: ${template.data.hours || 0}h ${template.data.minutes || 0}min</p>`;
                } else if (template.type === 'report' && template.data) {
                    const reportTypeNames = {
                        sales: 'Vendas',
                        services: 'Serviços',
                        products: 'Produtos',
                        clients: 'Clientes',
                        financial: 'Financeiro',
                        custom: 'Personalizado'
                    };
                    details = `<p><i class="fas fa-chart-line"></i> Tipo: ${reportTypeNames[template.data.reportType] || template.data.reportType}</p>
                               <p><i class="fas fa-calendar"></i> Período: ${template.data.period || 'Este Mês'}</p>
                               <p><i class="fas fa-file"></i> Formato: ${template.data.format?.toUpperCase() || 'PDF'}</p>`;
                }

                return `
                <div class="item-card">
                    <div class="item-header">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas ${typeIcons[template.type] || 'fa-file'}" style="color: var(--primary-color);"></i>
                            <h3>${this.escapeHtml(template.name)}</h3>
                        </div>
                        <div class="item-actions">
                            <button class="btn-small btn-secondary" onclick="app.useTemplate('${template.id}')" title="Usar Template">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn-small btn-edit" onclick="app.openTemplateModal('${template.id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-small btn-delete" onclick="app.deleteTemplate('${template.id}')" title="Excluir">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="item-details">
                        <p><i class="fas fa-file-alt"></i> Tipo: ${typeNames[template.type] || template.type}</p>
                        ${template.description ? `<p><i class="fas fa-info-circle"></i> ${this.escapeHtml(template.description)}</p>` : ''}
                        ${details}
                    </div>
                </div>
            `;
            })
            .join('');
    }

    useTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        if (template.type === 'product') {
            // Abrir modal de produto e preencher com dados do template
            this.openItemModal();
            setTimeout(() => {
                if (template.data.category) {
                    document.getElementById('itemCategory').value = template.data.category;
                    this.toggleCategoryFields();
                }
                if (template.data.price) {
                    document.getElementById('itemPrice').value = template.data.price;
                }
                if (typeof toast !== 'undefined' && toast) {
                    toast.success(`Template "${template.name}" aplicado! Preencha os campos restantes.`, 3000);
                }
            }, 100);
        } else if (template.type === 'sale') {
            // Aplicar template na venda atual (se modal estiver aberto)
            const saleQuantity = document.getElementById('saleQuantity');
            const saleDiscountValue = document.getElementById('saleDiscountValue');
            const saleDiscountType = document.getElementById('saleDiscountType');
            
            if (saleQuantity && template.data.quantity) {
                saleQuantity.value = template.data.quantity;
            }
            if (saleDiscountValue && template.data.discount) {
                saleDiscountValue.value = template.data.discount;
                if (saleDiscountType) {
                    saleDiscountType.value = 'percent';
                }
                this.updateDiscountCalculation();
            }
            if (typeof toast !== 'undefined' && toast) {
                toast.success(`Template "${template.name}" aplicado!`, 3000);
            }
        } else if (template.type === 'service') {
            // Aplicar template em serviço (se modal estiver aberto)
            const serviceHours = document.getElementById('serviceRecordHours');
            const serviceMinutes = document.getElementById('serviceRecordMinutes');
            
            if (serviceHours && template.data.hours !== undefined) {
                serviceHours.value = template.data.hours;
            }
            if (serviceMinutes && template.data.minutes !== undefined) {
                serviceMinutes.value = template.data.minutes;
            }
            if (typeof toast !== 'undefined' && toast) {
                toast.success(`Template "${template.name}" aplicado!`, 3000);
            }
        } else if (template.type === 'report') {
            // Aplicar template de relatório - gerar relatório com configurações do template
            if (typeof toast !== 'undefined' && toast) {
                toast.info(`Gerando relatório com template "${template.name}"...`, 3000);
            }
            
            // Armazenar configurações do template para uso posterior
            sessionStorage.setItem('reportTemplate', JSON.stringify(template.data));
            
            // Navegar para a aba de relatórios ou abrir modal de relatórios se existir
            const reportTab = document.querySelector('[data-tab="reports"]') || 
                             document.querySelector('button[onclick*="report"]') ||
                             document.querySelector('a[href*="report"]');
            
            if (reportTab) {
                reportTab.click();
            }
            
            // Notificar que o template foi aplicado
            setTimeout(() => {
                if (typeof toast !== 'undefined' && toast) {
                    toast.success(`Template de relatório "${template.name}" aplicado! Configure o período e gere o relatório.`, 4000);
                }
            }, 500);
        }
    }

    generateTemplateId() {
        let id;
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
            id = 'TEMPLATE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
            attempts++;
        } while (this.templates.find(t => t.id === id) && attempts < maxAttempts);
        
        if (attempts >= maxAttempts) {
            id = 'TEMPLATE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        }
        
        return id;
    }

    // Exportar templates
    exportTemplates() {
        if (!this.checkPermission('export')) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Você não tem permissão para exportar templates.', 3000);
            } else {
                alert('Você não tem permissão para exportar templates.');
            }
            return;
        }

        if (this.templates.length === 0) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Não há templates para exportar.', 3000);
            } else {
                alert('Não há templates para exportar.');
            }
            return;
        }

        const exportData = {
            templates: this.templates,
            version: '1.0',
            exportDate: new Date().toISOString(),
            exportedBy: sessionStorage.getItem('username') || 'unknown',
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `templates_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Registrar no audit log
        this.logAction('export', 'template', null, `Exportação de ${this.templates.length} template(s)`);

        if (typeof toast !== 'undefined' && toast) {
            toast.success(`${this.templates.length} template(s) exportado(s) com sucesso!`, 3000);
        } else {
            alert(`${this.templates.length} template(s) exportado(s) com sucesso!`);
        }
    }

    // Importar templates
    importTemplates(event) {
        if (!this.checkPermission('import')) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Você não tem permissão para importar templates.', 3000);
            } else {
                alert('Você não tem permissão para importar templates.');
            }
            return;
        }

        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (!data.templates || !Array.isArray(data.templates)) {
                    if (typeof toast !== 'undefined' && toast) {
                        toast.error('Arquivo inválido. O arquivo deve conter um array de templates.', 3000);
                    } else {
                        alert('Arquivo inválido. O arquivo deve conter um array de templates.');
                    }
                    return;
                }

                const importCount = data.templates.length;
                let importedCount = 0;
                let skippedCount = 0;

                data.templates.forEach((template) => {
                    // Validar template
                    if (!template.name || !template.type) {
                        skippedCount++;
                        return;
                    }

                    // Verificar se já existe template com mesmo nome e tipo
                    const existing = this.templates.find(
                        (t) => t.name === template.name && t.type === template.type
                    );

                    if (existing) {
                        // Perguntar se deseja substituir
                        if (confirm(`Template "${template.name}" (${template.type}) já existe. Deseja substituir?`)) {
                            const index = this.templates.findIndex((t) => t.id === existing.id);
                            if (index !== -1) {
                                // Manter ID original, atualizar dados
                                template.id = existing.id;
                                template.updatedAt = new Date().toISOString();
                                this.templates[index] = template;
                                importedCount++;
                            }
                        } else {
                            skippedCount++;
                        }
                    } else {
                        // Gerar novo ID para evitar conflitos
                        template.id = this.generateTemplateId();
                        template.createdAt = template.createdAt || new Date().toISOString();
                        template.updatedAt = new Date().toISOString();
                        this.templates.push(template);
                        importedCount++;
                    }
                });

                this.saveData();
                this.renderTemplates();

                // Registrar no audit log
                this.logAction('import', 'template', null, `Importação de ${importedCount} template(s)`);

                if (typeof toast !== 'undefined' && toast) {
                    if (skippedCount > 0) {
                        toast.success(`${importedCount} template(s) importado(s), ${skippedCount} ignorado(s).`, 4000);
                    } else {
                        toast.success(`${importedCount} template(s) importado(s) com sucesso!`, 3000);
                    }
                } else {
                    alert(`${importedCount} template(s) importado(s)${skippedCount > 0 ? `, ${skippedCount} ignorado(s)` : ''}.`);
                }

                // Limpar input
                event.target.value = '';
            } catch (error) {
                console.error('Erro ao importar templates:', error);
                if (typeof toast !== 'undefined' && toast) {
                    toast.error('Erro ao importar templates. Verifique se o arquivo está no formato correto.', 4000);
                } else {
                    alert('Erro ao importar templates. Verifique se o arquivo está no formato correto.');
                }
                event.target.value = '';
            }
        };

        reader.onerror = () => {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Erro ao ler o arquivo.', 3000);
            } else {
                alert('Erro ao ler o arquivo.');
            }
            event.target.value = '';
        };

        reader.readAsText(file);
    }

    // Função para quando cliente é selecionado no select
    onClientSelectChange(type) {
        const selectId = type === 'sale' ? 'saleCustomerSelect' : 
                         type === 'pending' ? 'pendingOrderCustomerSelect' : 
                         'appointmentCustomerSelect';
        const inputId = type === 'sale' ? 'saleCustomerName' : 
                       type === 'pending' ? 'pendingOrderCustomerName' : 
                       'appointmentCustomerName';
        
        const select = document.getElementById(selectId);
        const input = document.getElementById(inputId);
        
        if (select && input) {
            if (select.value) {
                // Cliente selecionado - preencher input e buscar dados do cliente
                input.value = select.value;
                const client = this.clients.find(c => c.name === select.value);
                if (client) {
                    // Preencher CPF se existir campo
                    const cpfField = document.getElementById(type === 'sale' ? 'saleCustomerCPF' : 
                                                           type === 'pending' ? 'pendingOrderCustomerCPF' : null);
                    if (cpfField && client.cpf) {
                        cpfField.value = client.cpf;
                    }
                }
            } else {
                // Nenhum cliente selecionado - limpar input
                input.value = '';
            }
        }
    }

    // ========== GRUPOS MENSAIS ==========

    openGroupModal() {
        document.getElementById('groupModal').classList.add('active');
    }

    closeGroupModal() {
        document.getElementById('groupModal').classList.remove('active');
        document.getElementById('groupForm').reset();
    }

    createGroup(e) {
        e.preventDefault();
        const month = document.getElementById('groupMonth').value;

        if (this.groups.some((g) => g.month === month)) {
            toast.warning('Já existe um grupo para este mês.', 4000);
            return;
        }

        const group = {
            id: Date.now().toString(),
            month: month,
            days: [],
        };

        // Criar dias do mês
        const [year, monthNum] = month.split('-');
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayObj = {
                day: day,
                sales: [],
            };
            // Adicionar stock apenas se não existir (para compatibilidade)
            if (!dayObj.stock) {
                dayObj.stock = {};
            }
            group.days.push(dayObj);
        }

        this.groups.push(group);
        this.groups.sort((a, b) => b.month.localeCompare(a.month));
        this.saveData();
        this.renderGroups();
        this.updateMonthFilter();
        this.updateYearFilter();
        this.closeGroupModal();
        toast.success('Grupo mensal criado com sucesso!', 3000);
    }

    viewGroup(groupId) {
        const group = this.groups.find((g) => g.id === groupId);
        if (!group) return;

        // Fechar modal de recibo se estiver aberto
        const receiptModal = document.getElementById('receiptPreviewModal');
        if (receiptModal && receiptModal.classList.contains('active')) {
            this.closeReceiptPreview();
        }

        this.currentGroup = group;
        const modal = document.getElementById('viewGroupModal');
        if (!modal) {
            console.error('❌ [VIEW GROUP] Modal não encontrado!');
            return;
        }

        const [year, month] = group.month.split('-');
        const monthNames = [
            'Janeiro',
            'Fevereiro',
            'Março',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro',
        ];

        document.getElementById('groupTitle').textContent = `${
            monthNames[parseInt(month) - 1]
        } ${year}`;

        this.renderGroupView(group);
        
        // Restaurar opacidade e z-index do viewGroupModal se foi reduzida
        console.log('🔧 [VIEW GROUP] Restaurando z-index do viewGroupModal');
        modal.style.opacity = '1';
        modal.style.display = 'flex';
        modal.style.setProperty('z-index', '1000', 'important');
        modal.style.pointerEvents = 'auto';
        
        // Garantir que o botão de fechar esteja clicável
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.style.pointerEvents = 'auto';
            closeBtn.style.opacity = '1';
            closeBtn.style.zIndex = '1001';
            closeBtn.style.position = 'relative';
        }
        
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.zIndex = '';
            modalContent.style.pointerEvents = 'auto';
        }
        
        // Garantir que todos os botões estejam clicáveis
        const buttons = modal.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
        });
        
        requestAnimationFrame(() => {
            modal.classList.add('active');
            modal.style.display = 'flex';
            modal.style.pointerEvents = 'auto';
        });
    }

    // Função helper para calcular valor total de uma venda (considerando desconto)
    getSaleTotalValue(sale) {
        const baseTotal = sale.price * sale.quantity;
        if (sale.discount && sale.discount.amount) {
            return baseTotal - sale.discount.amount;
        }
        return baseTotal;
    }

    calculateTotalAllMonths() {
        let totalSalesAll = 0;
        let totalValueAll = 0;

        this.groups.forEach((group) => {
            group.days.forEach((day) => {
                day.sales.forEach((sale) => {
                    totalSalesAll += sale.quantity;
                    totalValueAll += this.getSaleTotalValue(sale);
                });
            });
        });

        return {
            totalSales: totalSalesAll,
            totalValue: totalValueAll,
        };
    }

    renderGroupView(group) {
        // Calcular totais do mês atual
        let totalSales = 0;
        let totalValue = 0;
        const itemsSummary = {};

        group.days.forEach((day) => {
            day.sales.forEach((sale) => {
                totalSales += sale.quantity;
                const saleTotal = this.getSaleTotalValue(sale);
                totalValue += saleTotal;

                if (!itemsSummary[sale.itemId]) {
                    itemsSummary[sale.itemId] = {
                        name: this.getItemName(sale.itemId),
                        quantity: 0,
                        total: 0,
                    };
                }
                itemsSummary[sale.itemId].quantity += sale.quantity;
                itemsSummary[sale.itemId].total += saleTotal;
            });
        });

        // Atualizar totais do mês com animação
        this.updateValueWithAnimation('totalSales', totalSales);
        this.updateValueWithAnimation(
            'totalValue',
            totalValue,
            (val) => `R$ ${val.toFixed(2).replace('.', ',')}`
        );

        // Calcular e atualizar totais de todos os meses com animação
        const allMonthsTotal = this.calculateTotalAllMonths();
        this.updateValueWithAnimation(
            'totalSalesAll',
            allMonthsTotal.totalSales
        );
        this.updateValueWithAnimation(
            'totalValueAll',
            allMonthsTotal.totalValue,
            (val) => `R$ ${val.toFixed(2).replace('.', ',')}`
        );

        // Renderizar dias
        const daysList = document.getElementById('daysList');
        daysList.innerHTML = group.days
            .map((day) => {
                const daySales = day.sales.reduce(
                    (sum, s) => sum + s.quantity,
                    0
                );
                const dayTotal = day.sales.reduce(
                    (sum, s) => sum + s.price * s.quantity,
                    0
                );

                return `
                <div class="day-card">
                    <h4>Dia ${day.day}</h4>
                    <div class="day-sales">${daySales} venda(s)</div>
                    <div class="day-total">R$ ${dayTotal
                        .toFixed(2)
                        .replace('.', ',')}</div>
                    <button class="btn-small btn-edit" style="margin-top: 0.5rem; width: 100%;" 
                            onclick="app.openSaleModal('${group.id}', ${
                    day.day
                })">
                        ${daySales > 0 ? 'Editar' : 'Registrar'}
                    </button>
                </div>
            `;
            })
            .join('');

        // Atualizar estatísticas de estoque do grupo
        this.updateGroupStockStats(group);

        // Renderizar resumo por item
        const itemsSummaryList = document.getElementById('itemsSummary');
        const itemsArray = Object.values(itemsSummary);

        if (itemsArray.length === 0) {
            itemsSummaryList.innerHTML =
                `<div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h3 class="empty-state-title">Nenhuma venda registrada</h3>
                    <p class="empty-state-message">
                        Comece registrando suas vendas para acompanhar o desempenho do negócio.
                    </p>
                </div>`;
        } else {
            itemsSummaryList.innerHTML = itemsArray
                .map(
                    (item) => `
                <div class="summary-item">
                    <span class="summary-item-name">${this.escapeHtml(
                        item.name
                    )}</span>
                    <span class="summary-item-total">
                        ${item.quantity} un. - R$ ${item.total
                        .toFixed(2)
                        .replace('.', ',')}
                    </span>
                </div>
            `
                )
                .join('');
        }
    }

    openSaleModal(groupId, day) {
        // Sempre buscar o grupo atualizado do array principal
        const group = this.groups.find((g) => g.id === groupId);
        if (!group) {
            console.error('❌ [SALE MODAL] Grupo não encontrado:', groupId);
            return;
        }

        this.currentGroup = group;
        this.currentSaleDay = day;
        const dayData = group.days.find((d) => d.day === day);

        // Verificar se o viewGroupModal está aberto e aumentar z-index do saleModal
        const viewGroupModal = document.getElementById('viewGroupModal');
        const saleModal = document.getElementById('saleModal');
        
        if (!saleModal) {
            console.error('❌ [SALE MODAL] Modal de venda não encontrado no DOM');
            return;
        }

        // Garantir que o modal esteja visível e com z-index correto
        if (
            viewGroupModal &&
            viewGroupModal.classList.contains('active') &&
            saleModal
        ) {
            saleModal.classList.add('modal-overlay');
            // Garantir z-index inline para sobrescrever qualquer estilo conflitante
            saleModal.style.zIndex = '1001';
        } else {
            // Remover classe de overlay se o viewGroupModal não estiver aberto
            saleModal.classList.remove('modal-overlay');
            saleModal.style.zIndex = '';
        }

        // Popular select de clientes
        const saleCustomerSelect = document.getElementById('saleCustomerSelect');
        if (saleCustomerSelect) {
            saleCustomerSelect.innerHTML =
                '<option value="">Selecione um cliente ou digite novo nome...</option>' +
                this.clients
                    .map((client) => {
                        return `<option value="${this.escapeHtml(client.name)}">${this.escapeHtml(client.name)}${client.phone ? ` - ${this.escapeHtml(client.phone)}` : ''}</option>`;
                    })
                    .join('');
        }

        // Popular select de itens (incluindo serviços)
        const saleItemSelect = document.getElementById('saleItem');
        if (!saleItemSelect) {
            console.error('❌ [SALE MODAL] saleItem não encontrado!');
            return;
        }
        saleItemSelect.innerHTML =
            '<option value="">Selecione um item...</option>' +
            this.items
                .map((item) => {
                    const category = item.category || 'Roupas';
                    let displayName;

                    if (category === 'Eletrônicos') {
                        displayName = item.model || item.name;
                    } else {
                        // Para roupas, se não tiver nome, usar marca + estilo ou apenas marca
                        if (item.name) {
                            displayName = `${item.name} - ${item.brand || ''}`;
                        } else {
                            const parts = [item.brand || ''];
                            if (item.style) parts.push(item.style);
                            displayName =
                                parts.filter((p) => p).join(' - ') || 'Roupa';
                        }
                    }
                    return `<option value="${item.id}">${this.escapeHtml(
                        displayName
                    )}</option>`;
                })
                .join('');

        // Resetar formulário
        const saleForm = document.getElementById('saleForm');
        if (saleForm) {
            saleForm.reset();
        } else {
            console.error('❌ [SALE MODAL] saleForm não encontrado!');
        }

        // Atualizar exibição do dia
        const saleDayDisplay = document.getElementById('saleDayDisplay');
        if (saleDayDisplay) {
            saleDayDisplay.textContent = day;
        }

        // Resetar modal para estado padrão
        this.updateSaleModalForItem(null);

        // Atualizar informação de estoque
        this.updateStockInfo();

        // Se houver vendas, mostrar lista antes do formulário
        if (dayData && dayData.sales.length > 0) {
            this.showDaySales(dayData);
        } else {
            const salesList = document.getElementById('daySalesList');
            if (salesList) {
                salesList.remove();
            }
        }

        // Garantir que o modal seja exibido corretamente
        if (saleModal) {
            // Forçar display antes de adicionar active para garantir que o modal apareça
            saleModal.style.display = 'flex';
            // Garantir que o z-index esteja correto antes de adicionar active
            if (saleModal.classList.contains('modal-overlay')) {
                saleModal.style.zIndex = '1001';
            }
            
            // Pequeno delay para garantir que o DOM esteja pronto e evitar conflitos
            requestAnimationFrame(() => {
                saleModal.classList.add('active');
                // Garantir novamente o z-index após adicionar active
                if (saleModal.classList.contains('modal-overlay')) {
                    saleModal.style.zIndex = '1001';
                    const modalContent = saleModal.querySelector('.modal-content');
                    if (modalContent) {
                        modalContent.style.zIndex = '1002';
                    }
                }
            });
        } else {
            console.error('❌ [SALE MODAL] Não foi possível abrir o modal - elemento não encontrado');
        }
    }

    // Função auxiliar para gerar chave de estoque
    getStockKey(itemId, size, color) {
        const parts = [itemId];
        
        // Adicionar tamanho se existir
        if (size && size.trim()) {
            parts.push(size.trim());
        }
        
        // Adicionar cor se existir
        if (color && color.trim()) {
            parts.push(color.trim());
        }
        
        // Se tiver tamanho ou cor, retornar chave composta
        if (parts.length > 1) {
            return parts.join('_');
        }
        
        // Para produtos sem tamanho nem cor, usar apenas itemId
        return itemId;
    }

    updateSaleModalForItem(itemId) {
        const item = itemId ? this.items.find((i) => i.id === itemId) : null;
        const scanQRBtn = document.getElementById('scanQRBtn');
        const qrScannerContainer =
            document.getElementById('qrScannerContainer');
        const serviceInfo = document.getElementById('serviceInfo');
        const saleQuantityLabel = document.getElementById('saleQuantityLabel');
        const stockInfo = document.getElementById('stockInfo');
        const saleSizeGroup = document.getElementById('saleSizeGroup');
        const saleSize = document.getElementById('saleSize');
        const saleColorGroup = document.getElementById('saleColorGroup');
        const saleColor = document.getElementById('saleColor');

        if (!item) {
            // Resetar para padrão (produto físico)
            if (scanQRBtn) scanQRBtn.style.display = 'inline-block';
            if (serviceInfo) serviceInfo.style.display = 'none';
            if (saleQuantityLabel)
                saleQuantityLabel.textContent = 'Quantidade *';
            if (stockInfo) stockInfo.style.display = 'block';
            if (saleSizeGroup) saleSizeGroup.style.display = 'none';
            if (saleColorGroup) saleColorGroup.style.display = 'none';
            if (saleSize) {
                saleSize.required = false;
                saleSize.value = '';
            }
            if (saleColor) {
                saleColor.value = '';
            }
            return;
        }

        // Configuração para PRODUTOS FÍSICOS
        // Mostrar QR Code
        if (scanQRBtn) scanQRBtn.style.display = 'inline-block';

        // Esconder info do serviço
        if (serviceInfo) serviceInfo.style.display = 'none';

        // Label padrão
        if (saleQuantityLabel) {
            saleQuantityLabel.textContent = 'Quantidade (unidades) *';
        }

        // Mostrar info de estoque (se existir elemento)
        if (stockInfo) {
            stockInfo.style.display = 'block';
        }

        // Mostrar/esconder campos de tamanho e cor para roupas e eletrônicos
        const needsSize = item.category === 'Roupas' || item.category === 'Eletrônicos';
        const needsColor = item.category === 'Roupas' || item.category === 'Eletrônicos';

        if (saleSizeGroup && saleSize) {
            if (needsSize) {
                saleSizeGroup.style.display = 'block';
                saleSize.required = true;
                // Preencher com o tamanho do item se existir
                if (item.size) {
                    saleSize.value = item.size;
                } else {
                    saleSize.value = '';
                }
            } else {
                saleSizeGroup.style.display = 'none';
                saleSize.required = false;
                saleSize.value = '';
            }
        }

        if (saleColorGroup && saleColor) {
            if (needsColor) {
                saleColorGroup.style.display = 'block';
                saleColor.required = false; // Cor é opcional
                // Preencher com a cor do item se existir
                if (item.color) {
                    saleColor.value = item.color;
                } else {
                    saleColor.value = '';
                }
            } else {
                saleColorGroup.style.display = 'none';
                saleColor.value = '';
            }
        }
    }

    updateStockInfo() {
        if (!this.currentGroup || !this.currentSaleDay) return;

        const itemId = document.getElementById('saleItem').value;
        const stockInfo = document.getElementById('stockInfo');
        const saleSize = document.getElementById('saleSize');
        const saleColor = document.getElementById('saleColor');

        if (!itemId || !stockInfo) return;

        // Verificar se é serviço (serviços não têm estoque físico)
        const item = this.items.find((i) => i.id === itemId);
        if (item && item.category === 'Serviços') {
            stockInfo.textContent = 'Serviço - Não possui estoque físico.';
            stockInfo.style.color = '#6c757d';
            return;
        }

        const dayData = this.currentGroup.days.find(
            (d) => d.day === this.currentSaleDay
        );
        if (!dayData) return;

        // Garantir que stock existe
        if (!dayData.stock) {
            dayData.stock = {};
        }

        // Obter tamanho e cor
        const size = (saleSize && saleSize.value) ? saleSize.value.trim() : '';
        const color = (saleColor && saleColor.value) ? saleColor.value.trim() : '';
        const stockKey = this.getStockKey(itemId, size, color);

        const stockQuantity = dayData.stock[stockKey] || 0;
        const soldQuantity = dayData.sales
            .filter((sale) => {
                // Para roupas e eletrônicos, considerar tamanho e cor na venda
                if (item && (item.category === 'Roupas' || item.category === 'Eletrônicos')) {
                    const saleSize = sale.size || '';
                    const saleColor = sale.color || '';
                    const saleStockKey = this.getStockKey(sale.itemId, saleSize, saleColor);
                    return saleStockKey === stockKey;
                }
                // Para outros produtos, apenas itemId
                return sale.itemId === itemId;
            })
            .reduce((sum, sale) => sum + sale.quantity, 0);
        const availableStock = stockQuantity - soldQuantity;

        // Montar mensagem de estoque
        let stockMessage = '';
        const needsSize = item && (item.category === 'Roupas' || item.category === 'Eletrônicos');
        if (needsSize) {
            let details = [];
            if (size) details.push(`Tamanho: ${size}`);
            if (color) details.push(`Cor: ${color}`);
            if (details.length > 0) {
                stockMessage = `Estoque disponível (${details.join(', ')}): ${availableStock} un. (Total: ${stockQuantity} un. - Vendido: ${soldQuantity} un.)`;
            } else {
                stockMessage = `Estoque disponível: ${availableStock} un. (Total: ${stockQuantity} un. - Vendido: ${soldQuantity} un.)`;
            }
        } else {
            stockMessage = `Estoque disponível: ${availableStock} un. (Total: ${stockQuantity} un. - Vendido: ${soldQuantity} un.)`;
        }

        if (stockQuantity > 0) {
            stockInfo.textContent = stockMessage;
            if (availableStock < 0) {
                stockInfo.style.color = '#dc3545';
                stockInfo.textContent += ' ⚠️ Estoque negativo!';
            } else if (availableStock === 0) {
                stockInfo.style.color = '#ffc107';
            } else {
                stockInfo.style.color = '#28a745';
            }
        } else {
            stockInfo.textContent =
                'Nenhum estoque cadastrado para este item neste dia.';
            stockInfo.style.color = '#6c757d';
        }
    }

    showDaySales(dayData) {
        // Remover lista anterior se existir
        const existingList = document.getElementById('daySalesList');
        if (existingList) {
            existingList.remove();
        }

        // Criar lista de vendas do dia
        const salesList = document.createElement('div');
        salesList.id = 'daySalesList';
        salesList.style.marginBottom = '1.5rem';
        salesList.style.padding = '1rem';
        salesList.style.background = 'var(--light-gray)';
        salesList.style.borderRadius = '8px';
        salesList.style.border = '2px solid var(--border-color)';

        salesList.innerHTML = `
            <h4 style="color: var(--primary-red); margin-bottom: 1rem;">Vendas do Dia ${
                dayData.day
            }</h4>
            ${dayData.sales
                .map((sale, index) => {
                    const item = this.items.find((i) => i.id === sale.itemId);
                    return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; margin-bottom: 0.5rem; border-radius: 5px; border: 1px solid var(--border-color);">
                        <div>
                            <strong>${this.escapeHtml(
                                item ? item.name : 'Item não encontrado'
                            )}</strong>${sale.size || sale.color ? ` <span style="color: var(--primary-color); font-weight: 600;">(${sale.size ? `Tamanho: ${this.escapeHtml(sale.size)}` : ''}${sale.size && sale.color ? ', ' : ''}${sale.color ? `Cor: ${this.escapeHtml(sale.color)}` : ''})</span>` : ''}<br>
                            <small style="color: var(--gray);">${
                                sale.quantity
                            } un. × R$ ${sale.price
                        .toFixed(2)
                        .replace('.', ',')} = R$ ${(sale.quantity * sale.price)
                        .toFixed(2)
                        .replace('.', ',')}</small>
                        </div>
                        <button class="btn-small btn-delete" onclick="app.deleteSale(${
                            this.currentSaleDay
                        }, ${index})" title="Excluir"><i class="fas fa-times"></i></button>
                    </div>
                `;
                })
                .join('')}
        `;

        // Inserir antes do formulário
        const form = document.getElementById('saleForm');
        if (form && form.parentNode) {
            form.parentNode.insertBefore(salesList, form);
        } else {
            console.error('❌ [SHOW DAY SALES] saleForm não encontrado!');
        }
    }

    deleteSale(day, saleIndex) {
        // Buscar o grupo atualizado do array principal
        const group = this.groups.find((g) => g.id === this.currentGroup.id);
        if (!group) return;

        const dayData = group.days.find((d) => d.day === day);
        if (dayData && dayData.sales[saleIndex]) {
            const performDelete = (confirmed) => {
                if (!confirmed) return;
                dayData.sales.splice(saleIndex, 1);

                // Atualizar referência do grupo atual
                this.currentGroup = group;

                this.saveData();
                this.renderGroupView(group);

                // Atualizar resumo geral na lista de grupos (se estiver na aba de grupos)
                const groupsTab = document.getElementById('groupsTab');
                if (groupsTab && groupsTab.classList.contains('active')) {
                    this.renderGroups();
                }

                // Atualizar resumo geral
                this.updateOverallSummary();

                this.openSaleModal(group.id, day);
                if (typeof toast !== 'undefined' && toast) {
                    toast.success('Venda excluída com sucesso!', 3000);
                }
            };
            
            if (typeof confirmDialog !== 'undefined' && confirmDialog) {
                confirmDialog.danger('Deseja excluir esta venda?', 'Excluir Venda').then(performDelete);
            } else {
                if (confirm('Deseja excluir esta venda?')) {
                    performDelete(true);
                }
            }
        }
    }

    closeSaleModal() {
        // Parar scanner se estiver ativo
        this.stopQRScanner();

        const modal = document.getElementById('saleModal');
        if (modal) {
            // Remover classe de overlay se existir
            modal.classList.remove('modal-overlay');
            // Remover z-index inline
            modal.style.zIndex = '';

            // Animação ao fechar modal
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.classList.remove('active');
                modal.style.display = 'none';
                modal.style.opacity = '';
            }, 300);
        }

        // Limpar campos de desconto
        const discountFields = document.getElementById('discountFields');
        const discountSummary = document.getElementById('discountSummary');
        const toggleDiscountBtn = document.getElementById('toggleDiscountBtn');
        if (discountFields) discountFields.style.display = 'none';
        if (discountSummary) discountSummary.style.display = 'none';
        if (toggleDiscountBtn) toggleDiscountBtn.innerHTML = '<i class="fas fa-plus"></i> Aplicar';
        
        const discountType = document.getElementById('saleDiscountType');
        const discountValue = document.getElementById('saleDiscountValue');
        const couponCode = document.getElementById('saleCouponCode');
        if (discountType) discountType.value = '';
        if (discountValue) discountValue.value = '';
        if (couponCode) couponCode.value = '';

        // Se o modal do grupo estiver aberto, atualizar o resumo
        const viewGroupModal = document.getElementById('viewGroupModal');
        if (
            viewGroupModal &&
            viewGroupModal.classList.contains('active') &&
            this.currentGroup
        ) {
            // Buscar o grupo atualizado do array principal
            const group = this.groups.find(
                (g) => g.id === this.currentGroup.id
            );
            if (group) {
                this.currentGroup = group;
                this.renderGroupView(group);
            }
        }

        // Atualizar resumo geral na lista de grupos (se estiver na aba de grupos)
        const groupsTab = document.getElementById('groupsTab');
        if (groupsTab && groupsTab.classList.contains('active')) {
            this.renderGroups();
        }

        this.currentSaleDay = null;
    }

    saveSale(e) {
        e.preventDefault();

        if (!this.currentGroup || !this.currentSaleDay) return;

        // Adicionar loading no botão de salvar
        const saveBtn = e.target.querySelector('button[type="submit"]') || 
                       document.querySelector('#saleForm button[type="submit"]');
        if (saveBtn) {
            saveBtn.classList.add('loading');
            saveBtn.disabled = true;
        }

        const saleItem = document.getElementById('saleItem');
        const saleQuantity = document.getElementById('saleQuantity');
        const salePrice = document.getElementById('salePrice');

        if (!saleItem || !saleQuantity || !salePrice) {
            console.error('❌ [SAVE SALE] Elementos do formulário não encontrados!');
            toast.error('Erro: Formulário incompleto. Por favor, recarregue a página.', 5000);
            // Remover loading se houver
            if (saveBtn) {
                saveBtn.classList.remove('loading');
                saveBtn.disabled = false;
            }
            return;
        }

        const itemId = saleItem.value;
        const quantity = parseInt(saleQuantity.value);
        const basePrice = this.parsePrice(salePrice.value);
        const saleSizeInput = document.getElementById('saleSize');
        const saleColorInput = document.getElementById('saleColor');
        const size = (saleSizeInput && saleSizeInput.value) ? saleSizeInput.value.trim() : '';
        const color = (saleColorInput && saleColorInput.value) ? saleColorInput.value.trim() : '';
        
        // Calcular desconto (o desconto é aplicado ao total, não ao preço unitário)
        // Calcular desconto (a função já verifica o cupom do campo)
        const discountInfo = this.calculateDiscount(basePrice, quantity);
        // O preço unitário permanece o mesmo, o desconto é aplicado ao total
        const price = basePrice;

        if (!itemId) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Por favor, selecione um item.', 3000);
            } else {
                alert('Por favor, selecione um item.');
            }
            // Remover loading se houver
            if (saveBtn) {
                saveBtn.classList.remove('loading');
                saveBtn.disabled = false;
            }
            return;
        }

        if (price <= 0 || quantity <= 0) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Preço e quantidade devem ser maiores que zero.', 3000);
            } else {
                alert('Preço e quantidade devem ser maiores que zero.');
            }
            // Remover loading se houver
            if (saveBtn) {
                saveBtn.classList.remove('loading');
                saveBtn.disabled = false;
            }
            return;
        }

        // Buscar o grupo atualizado do array principal
        const group = this.groups.find((g) => g.id === this.currentGroup.id);
        if (!group) {
            // Remover loading se houver
            if (saveBtn) {
                saveBtn.classList.remove('loading');
                saveBtn.disabled = false;
            }
            return;
        }

        const dayData = group.days.find((d) => d.day === this.currentSaleDay);
        if (!dayData) {
            // Remover loading se houver
            if (saveBtn) {
                saveBtn.classList.remove('loading');
                saveBtn.disabled = false;
            }
            return;
        }

        // Verificar se é serviço (serviços não têm estoque físico)
        const item = this.items.find((i) => i.id === itemId);
        const isService = item && item.category === 'Serviços';

        // Verificar se é roupa ou eletrônico e se tamanho foi informado
        if (item && (item.category === 'Roupas' || item.category === 'Eletrônicos') && !size) {
            toast.warning(`Por favor, informe o tamanho do ${item.category === 'Roupas' ? 'roupa' : 'eletrônico'}.`, 3000);
            // Remover loading se houver
            if (saveBtn) {
                saveBtn.classList.remove('loading');
                saveBtn.disabled = false;
            }
            return;
        }

        // Verificar estoque disponível (apenas para produtos físicos)
        if (!isService) {
            // Garantir que stock existe
            if (!dayData.stock) {
                dayData.stock = {};
            }

            const stockKey = this.getStockKey(itemId, size, color);
            const stockQuantity = dayData.stock[stockKey] || 0;
            const soldQuantity = dayData.sales
                .filter((sale) => {
                    // Para roupas e eletrônicos, considerar tamanho e cor na venda
                    if (item && (item.category === 'Roupas' || item.category === 'Eletrônicos')) {
                        const saleSize = sale.size || '';
                        const saleColor = sale.color || '';
                        const saleStockKey = this.getStockKey(sale.itemId, saleSize, saleColor);
                        return saleStockKey === stockKey;
                    }
                    // Para outros produtos, apenas itemId
                    return sale.itemId === itemId;
                })
                .reduce((sum, sale) => sum + sale.quantity, 0);
            const availableStock = stockQuantity - soldQuantity;

            if (stockQuantity > 0 && quantity > availableStock) {
                if (
                    !confirm(
                        `Atenção! Estoque disponível: ${availableStock} un. Deseja registrar ${quantity} un. mesmo assim?`
                    )
                ) {
                    // Remover loading se houver
                    if (saveBtn) {
                        saveBtn.classList.remove('loading');
                        saveBtn.disabled = false;
                    }
                    return;
                }
            }
        }

        // Obter dados do cliente
        // Formatar nome do cliente automaticamente
        const customerName = this.formatText(
            document.getElementById('saleCustomerName').value
        );
        const customerCPF = document
            .getElementById('saleCustomerCPF')
            .value.trim()
            .replace(/\D/g, '');

        if (!customerName) {
            toast.warning('Por favor, informe o nome do cliente.', 3000);
            // Remover loading se houver
            if (saveBtn) {
                saveBtn.classList.remove('loading');
                saveBtn.disabled = false;
            }
            return;
        }

        // Calcular base total antes de descontos
        const baseTotal = basePrice * quantity;
        
        // Verificar e aplicar desconto automático de fidelidade
        let loyaltyDiscount = 0;
        let loyaltyPointsUsed = 0;
        const client = this.clients.find(c => c.name === customerName);
        if (client && client.loyaltyPoints > 0) {
            const loyaltyDiscountInfo = this.calculateLoyaltyDiscount(customerName, baseTotal);
            loyaltyDiscount = loyaltyDiscountInfo.discount;
            loyaltyPointsUsed = loyaltyDiscountInfo.pointsUsed;
        }

        // Combinar desconto manual/cupom com desconto de fidelidade
        const totalDiscount = discountInfo.discount + loyaltyDiscount;
        const finalDiscountInfo = {
            ...discountInfo,
            discount: totalDiscount,
            loyaltyDiscount: loyaltyDiscount,
            loyaltyPointsUsed: loyaltyPointsUsed,
        };

        // Adicionar venda ao grupo (compatibilidade)
        // O preço unitário permanece o mesmo, o desconto é aplicado ao total
        const sale = {
            itemId: itemId,
            quantity: quantity,
            price: basePrice, // Preço unitário original (sem desconto)
            basePrice: basePrice, // Preço original antes do desconto
            discount: totalDiscount > 0 ? {
                type: discountInfo.discountType || 'loyalty',
                value: discountInfo.discountValue || loyaltyDiscount,
                amount: totalDiscount,
                couponCode: discountInfo.couponCode || null,
                loyaltyDiscount: loyaltyDiscount,
                loyaltyPointsUsed: loyaltyPointsUsed,
            } : null
        };
        
        // Incluir tamanho e cor se for roupa ou eletrônico
        if (item && (item.category === 'Roupas' || item.category === 'Eletrônicos')) {
            if (size) {
                sale.size = size;
            }
            if (color) {
                sale.color = color;
            }
        }
        
        dayData.sales.push(sale);

        // Criar venda completa para histórico
        const orderCode = this.generateOrderCode();
        // Usar 'item' que já foi declarado anteriormente na linha 2807
        const itemName = item
            ? this.getItemName(itemId)
            : 'Item não encontrado';
        // Calcular totalValue considerando desconto (já calculado acima)
        const totalValue = totalDiscount > 0 
            ? baseTotal - totalDiscount 
            : baseTotal;
        const now = new Date();

        // Coletar notas da venda
        const saleNotesInput = document.getElementById('saleNotes');
        const saleNotes = saleNotesInput && saleNotesInput.value ? saleNotesInput.value.trim() : null;

        const completedSale = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            orderCode: orderCode,
            customerName: customerName,
            customerCPF: customerCPF || null,
            items: [
                {
                    itemId: itemId,
                    name: itemName,
                    quantity: quantity,
                    price: basePrice, // Preço unitário original
                    size: (item && (item.category === 'Roupas' || item.category === 'Eletrônicos') && size) ? size : undefined,
                    color: (item && (item.category === 'Roupas' || item.category === 'Eletrônicos') && color) ? color : undefined,
                },
            ],
            totalValue: totalValue, // Total final com desconto aplicado
            discount: sale.discount, // Informações do desconto
            notes: saleNotes, // Notas/observações da venda
            date: now.toISOString(),
            timestamp: now.getTime(),
            groupId: group.id,
            groupMonth: group.month,
            day: this.currentSaleDay,
        };

        // Adicionar à lista de vendas concluídas
        this.completedSales.push(completedSale);

        // Incrementar uso do cupom se foi aplicado
        if (completedSale.discount && completedSale.discount.couponCode) {
            const coupon = this.coupons.find(c => c.code === completedSale.discount.couponCode);
            if (coupon) {
                coupon.uses = (coupon.uses || 0) + 1;
                this.saveData();
                this.renderCoupons();
            }
        }
        
        // Limpar código do cupom da venda atual
        if (window.currentSaleCouponCode) {
            delete window.currentSaleCouponCode;
        }

        // Adicionar pontos de fidelidade após a venda
        if (client) {
            // Descontar pontos usados
            if (loyaltyPointsUsed > 0 && client.loyaltyPoints >= loyaltyPointsUsed) {
                client.loyaltyPoints -= loyaltyPointsUsed;
            }
            // Adicionar novos pontos (1 ponto para cada R$ 10,00 gastos)
            this.addLoyaltyPoints(customerName, totalValue);
            
            // Criar notificação se o cliente optou por receber
            if (client.receiveNotifications) {
                this.createClientNotification(
                    client.id,
                    'Nova Compra Registrada',
                    `Sua compra de R$ ${totalValue.toFixed(2).replace('.', ',')} foi registrada com sucesso!${loyaltyPointsUsed > 0 ? ` Você usou ${loyaltyPointsUsed} ponto(s) de fidelidade.` : ''}`,
                    'success'
                );
            }
        } else if (customerName) {
            // Se o cliente não está cadastrado, criar automaticamente com pontos
            const newClient = {
                id: Date.now().toString(),
                name: customerName,
                cpf: customerCPF || '',
                loyaltyPoints: Math.floor(totalValue / 10), // Adicionar pontos iniciais
                receiveNotifications: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            this.clients.push(newClient);
            if (typeof toast !== 'undefined' && toast) {
                toast.info(`Cliente "${customerName}" foi cadastrado automaticamente e ganhou ${newClient.loyaltyPoints} ponto(s)!`, 4000);
            }
        }

        // Atualizar referência do grupo atual
        this.currentGroup = group;

        this.saveData();

        // Atualizar carrossel de últimos comprovantes na seção fixa
        this.renderLastReceiptsCarousel();

        // Verificar e reduzir z-index do viewGroupModal ANTES de fechar o modal de venda
        const viewGroupModal = document.getElementById('viewGroupModal');
        if (viewGroupModal && viewGroupModal.classList.contains('active')) {
            console.log('🔧 [SAVE SALE] viewGroupModal está ativo, reduzindo z-index antes de mostrar recibo');
            viewGroupModal.style.setProperty('z-index', '999', 'important');
            viewGroupModal.style.pointerEvents = 'none';
            viewGroupModal.style.opacity = '0.3';
            const viewGroupContent = viewGroupModal.querySelector('.modal-content');
            if (viewGroupContent) {
                viewGroupContent.style.setProperty('z-index', '999', 'important');
            }
        }

        // Fechar modal de venda antes de mostrar o recibo
        this.closeSaleModal();

        // Aguardar um pouco para garantir que o modal de venda foi fechado
        setTimeout(() => {
            // Mostrar preview de recibo
            console.log('🔧 [SAVE SALE] Mostrando preview de recibo');
            this.showReceiptPreview(completedSale);

            // Atualizar o resumo do grupo no modal (se estiver aberto)
            // IMPORTANTE: Não renderizar novamente aqui para evitar quebrar os event listeners
            // O renderGroupView será chamado quando o recibo for fechado
        }, 150);

        // Atualizar resumo geral na lista de grupos (se estiver na aba de grupos)
        const groupsTab = document.getElementById('groupsTab');
        if (groupsTab && groupsTab.classList.contains('active')) {
            this.renderGroups();
        }

        // Atualizar resumo geral
        this.updateOverallSummary();

        // Remover loading do botão após salvar
        if (saveBtn) {
            // Pequeno delay para garantir que a animação seja visível
            setTimeout(() => {
                saveBtn.classList.remove('loading');
                saveBtn.disabled = false;
            }, 300);
        }
    }

    // Gerar código de pedido único
    generateOrderCode() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0');
        return `PED-${year}${month}${day}-${random}`;
    }

    // Mostrar preview de recibo
    showReceiptPreview(sale) {
        const modal = document.getElementById('receiptPreviewModal');
        if (!modal) {
            // Criar modal se não existir
            this.createReceiptPreviewModal();
        }

        const modalElement = document.getElementById('receiptPreviewModal');
        const receiptContent = document.getElementById('receiptContent');

        if (!receiptContent || !modalElement) return;

        // Garantir que o modal esteja visível e com z-index correto
        modalElement.style.display = 'flex';
        modalElement.style.zIndex = '1003';

        const date = new Date(sale.date);
        const formattedDate = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        receiptContent.innerHTML = `
            <div class="receipt-header">
                <h2>Recibo de Venda</h2>
                <p class="receipt-order-code">Código: ${this.escapeHtml(
                    sale.orderCode
                )}</p>
            </div>
            <div class="receipt-info">
                <div class="receipt-section">
                    <h3>Dados do Cliente</h3>
                    <p><strong>Nome:</strong> ${this.escapeHtml(
                        sale.customerName
                    )}</p>
                    ${
                        sale.customerCPF
                            ? `<p><strong>CPF:</strong> ${this.formatCPF(
                                  sale.customerCPF
                              )}</p>`
                            : ''
                    }
                </div>
                <div class="receipt-section">
                    <h3>Data e Horário</h3>
                    <p>${formattedDate}</p>
                </div>
                <div class="receipt-section">
                    <h3>Itens Comprados</h3>
                    <div class="receipt-items">
                        ${sale.items
                            .map(
                                (item) => `
                            <div class="receipt-item">
                                <div class="receipt-item-name">${this.escapeHtml(
                                    item.name
                                )}</div>
                                <div class="receipt-item-details">
                                    ${item.quantity} un. × R$ ${item.price
                                    .toFixed(2)
                                    .replace('.', ',')} = 
                                    <strong>R$ ${(item.quantity * item.price)
                                        .toFixed(2)
                                        .replace('.', ',')}</strong>
                                </div>
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                </div>
                <div class="receipt-total">
                    <h3>Valor Total</h3>
                    <p class="receipt-total-value">R$ ${sale.totalValue
                        .toFixed(2)
                        .replace('.', ',')}</p>
                </div>
            </div>
        `;

        // Garantir que o modal seja exibido corretamente e acima de todos os outros
        // Mover o modal para o final do body para garantir que apareça acima (ordem no DOM)
        if (modalElement.parentNode !== document.body) {
            document.body.appendChild(modalElement);
        }
        
        // Desabilitar cliques e reduzir z-index do viewGroupModal quando o recibo estiver aberto
        const viewGroupModal = document.getElementById('viewGroupModal');
        if (viewGroupModal && viewGroupModal.classList.contains('active')) {
            console.log('🔧 [RECEIPT] Reduzindo z-index do viewGroupModal');
            // Reduzir z-index para garantir que fique atrás do recibo
            viewGroupModal.style.setProperty('z-index', '999', 'important');
            viewGroupModal.style.pointerEvents = 'none';
            // Reduzir opacidade visual para deixar claro que está atrás
            viewGroupModal.style.opacity = '0.3';
            // Também reduzir z-index do conteúdo do modal
            const viewGroupContent = viewGroupModal.querySelector('.modal-content');
            if (viewGroupContent) {
                viewGroupContent.style.setProperty('z-index', '999', 'important');
            }
        }
        
        // Primeiro, garantir que o modal esteja visível e com z-index correto
        console.log('🔧 [RECEIPT] Configurando z-index do receiptPreviewModal');
        modalElement.style.setProperty('z-index', '10000', 'important');
        modalElement.style.display = 'flex';
        modalElement.style.pointerEvents = 'auto';
        modalElement.style.opacity = '1';
        modalElement.style.position = 'fixed';
        
        requestAnimationFrame(() => {
            modalElement.classList.add('active');
            
            const modalContent = modalElement.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.setProperty('z-index', '10001', 'important');
                modalContent.style.pointerEvents = 'auto';
                modalContent.style.position = 'relative';
            }
            
            // Forçar z-index novamente após animação para garantir
            setTimeout(() => {
                console.log('🔧 [RECEIPT] Forçando z-index novamente após animação');
                modalElement.style.setProperty('z-index', '10000', 'important');
                modalElement.style.position = 'fixed';
                if (modalContent) {
                    modalContent.style.setProperty('z-index', '10001', 'important');
                }
                // Verificar se viewGroupModal ainda está ativo e reduzir novamente
                if (viewGroupModal && viewGroupModal.classList.contains('active')) {
                    viewGroupModal.style.setProperty('z-index', '999', 'important');
                }
            }, 100);
        });
    }

    // Criar modal de preview de recibo
    createReceiptPreviewModal() {
        const modal = document.createElement('div');
        modal.id = 'receiptPreviewModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>Recibo de Venda</h2>
                    <span class="close" aria-label="Fechar modal" role="button" tabindex="0">&times;</span>
                </div>
                <div id="receiptContent" class="receipt-content">
                    <!-- Conteúdo do recibo será inserido aqui -->
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" id="closeReceiptBtn">
                        Fechar
                    </button>
                    <button type="button" class="btn-primary" id="printReceiptBtn">
                        <i class="fas fa-print"></i> Imprimir
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Event listeners
        const closeBtn = document.getElementById('closeReceiptBtn');
        const printBtn = document.getElementById('printReceiptBtn');
        const closeIcon = modal.querySelector('.close');

        if (closeBtn) {
            closeBtn.addEventListener('click', () =>
                this.closeReceiptPreview()
            );
        }
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printReceipt());
        }
        if (closeIcon) {
            closeIcon.addEventListener('click', () =>
                this.closeReceiptPreview()
            );
        }
    }

    // Fechar preview de recibo
    closeReceiptPreview() {
        const modal = document.getElementById('receiptPreviewModal');
        if (modal) {
            console.log('🔧 [CLOSE RECEIPT] Fechando modal de recibo');
            // Animação ao fechar modal
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none'; // Desabilitar cliques durante animação
            
            // Reabilitar cliques e opacidade no viewGroupModal IMEDIATAMENTE
            const viewGroupModal = document.getElementById('viewGroupModal');
            if (viewGroupModal) {
                console.log('🔧 [CLOSE RECEIPT] Restaurando viewGroupModal completamente');
                // Restaurar todos os estilos do viewGroupModal
                viewGroupModal.style.setProperty('z-index', '1000', 'important');
                viewGroupModal.style.pointerEvents = 'auto';
                viewGroupModal.style.opacity = '1';
                viewGroupModal.style.display = 'flex';
                
                // Garantir que o modal esteja ativo
                if (!viewGroupModal.classList.contains('active')) {
                    viewGroupModal.classList.add('active');
                }
                
                const viewGroupContent = viewGroupModal.querySelector('.modal-content');
                if (viewGroupContent) {
                    viewGroupContent.style.zIndex = '';
                    viewGroupContent.style.pointerEvents = 'auto';
                }
                
                // Garantir que todos os botões dentro do modal sejam clicáveis
                const buttons = viewGroupModal.querySelectorAll('button');
                buttons.forEach(btn => {
                    btn.style.pointerEvents = 'auto';
                    btn.style.opacity = '1';
                    btn.disabled = false; // Garantir que não esteja desabilitado
                });
                
                // Re-renderizar a view do grupo para garantir que os event listeners estejam ativos
                if (this.currentGroup) {
                    console.log('🔧 [CLOSE RECEIPT] Re-renderizando viewGroup para restaurar event listeners');
                    this.renderGroupView(this.currentGroup);
                }
                
                console.log('✅ [CLOSE RECEIPT] viewGroupModal totalmente restaurado');
            }
            
            setTimeout(() => {
                modal.classList.remove('active');
                modal.style.display = 'none';
                modal.style.opacity = '';
                modal.style.zIndex = '';
                modal.style.pointerEvents = '';
                modal.style.position = '';
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.style.zIndex = '';
                }
            }, 300);
        }
    }

    // Imprimir recibo
    printReceipt() {
        const receiptContent = document.getElementById('receiptContent');
        if (!receiptContent) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Recibo de Venda</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .receipt-header { text-align: center; margin-bottom: 20px; }
                    .receipt-section { margin-bottom: 15px; }
                    .receipt-item { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #ddd; }
                    .receipt-total { margin-top: 20px; padding-top: 15px; border-top: 2px solid #000; text-align: right; }
                    .receipt-total-value { font-size: 1.5em; font-weight: bold; }
                </style>
            </head>
            <body>
                ${receiptContent.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    // Formatar CPF
    formatCPF(cpf) {
        const cleaned = cpf.replace(/\D/g, '');
        if (cleaned.length !== 11) return cpf;
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    // ========== BUSCA DE COMPROVANTES ==========

    openReceiptSearchModal() {
        const modal = document.getElementById('receiptSearchModal');
        if (!modal) return;

        modal.classList.add('active');

        // Limpar busca e mostrar todos os comprovantes
        const nameInput = document.getElementById('receiptSearchName');
        const cpfInput = document.getElementById('receiptSearchCPF');
        if (nameInput) nameInput.value = '';
        if (cpfInput) cpfInput.value = '';
        this.searchReceipts();
    }

    closeReceiptSearchModal() {
        const modal = document.getElementById('receiptSearchModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    renderReceiptCarousel() {
        // Renderizar carrossel no modal (mantido para compatibilidade)
        const carousel = document.getElementById('receiptCarousel');
        if (carousel) {
            this.renderLastReceiptsCarousel(carousel);
        }
    }

    renderLastReceiptsCarousel(container = null) {
        // Verificar se está em modo de teste
        const isTestMode = window.TEST_MODE === true;
        const suppressWarnings = window.SUPPRESS_UI_WARNINGS === true;
        
        // Em modo de teste, não tentar renderizar
        if (isTestMode) {
            return;
        }
        
        // Usar container fornecido ou buscar o carrossel fixo
        const carousel = container || document.getElementById('lastReceiptsCarousel');
        if (!carousel) {
            // Em modo de teste ou com warnings suprimidos, não gerar warnings
            if (!suppressWarnings) {
                console.warn('⚠️ [CARROSSEL] Container do carrossel não encontrado. Tentando novamente em 500ms...');
            }
            // Tentar novamente após um delay caso o elemento ainda não esteja no DOM
            setTimeout(() => {
                const retryCarousel = document.getElementById('lastReceiptsCarousel');
                if (retryCarousel) {
                    this.renderLastReceiptsCarousel(retryCarousel);
                } else {
                    if (!suppressWarnings) {
                        console.error('❌ [CARROSSEL] Container não encontrado após retry');
                    }
                }
            }, 500);
            return;
        }

        // Debug: verificar se há comprovantes
        console.log(`📊 [CARROSSEL] Total de comprovantes: ${this.completedSales.length}`);
        console.log(`📊 [CARROSSEL] Array completedSales:`, this.completedSales);
        if (this.completedSales.length > 0) {
            console.log('📋 [CARROSSEL] Primeiros 3 comprovantes:', this.completedSales.slice(0, 3).map(s => ({
                id: s.id,
                name: s.customerName,
                date: s.date,
                total: s.totalValue
            })));
        } else {
            console.warn('⚠️ [CARROSSEL] Nenhum comprovante encontrado no array completedSales');
        }

        // Ordenar comprovantes por data (mais recentes primeiro)
        const sortedSales = [...this.completedSales].sort(
            (a, b) => {
                // Usar timestamp se disponível, senão usar date
                const timeA = a.timestamp || new Date(a.date).getTime();
                const timeB = b.timestamp || new Date(b.date).getTime();
                return timeB - timeA;
            }
        );

        // Pegar sempre os 3 últimos (se houver mais de 3, remover automaticamente o mais antigo)
        const lastThree = sortedSales.slice(0, 3);

        console.log(`🎯 [CARROSSEL] Renderizando ${lastThree.length} comprovantes`);

        if (lastThree.length === 0) {
            carousel.innerHTML =
                '<p style="text-align: center; color: var(--gray-600); padding: 2rem; width: 100%;">Nenhum comprovante encontrado.</p>';
            return;
        }

        try {
            carousel.innerHTML = lastThree
                .map((sale, index) => {
                    // Verificar se a data é válida
                    let formattedDate = 'Data inválida';
                    try {
                        const date = new Date(sale.date);
                        if (!isNaN(date.getTime())) {
                            formattedDate = date.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                            });
                        }
                    } catch (e) {
                        console.error('❌ [CARROSSEL] Erro ao formatar data:', e, sale);
                    }

                    // Verificar se os dados necessários existem
                    if (!sale.customerName || !sale.totalValue) {
                        console.error('❌ [CARROSSEL] Dados incompletos no comprovante:', sale);
                        return '';
                    }

                    return `
                <div class="receipt-mini-card" 
                     style="
                         flex: 0 0 auto;
                         width: 280px; 
                         min-width: 280px;
                         max-width: 280px;
                         background: var(--white); 
                         border: 1px solid var(--gray-300); 
                         border-radius: var(--radius-md); 
                         padding: 1.25rem; 
                         box-shadow: var(--shadow-sm);
                         cursor: pointer;
                         transition: all var(--transition-base);
                         animation: slideInUp 0.3s ease-out ${
                             index * 0.1
                         }s both;
                     "
                     onclick="app.viewFullReceipt('${sale.id}')"
                     onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow-md)'; this.style.borderColor='var(--primary-color)';"
                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)'; this.style.borderColor='var(--gray-300)';">
                    <div style="margin-bottom: 0.75rem;">
                        <h4 style="margin: 0 0 0.5rem 0; color: var(--dark-gray); font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${this.escapeHtml(sale.customerName)}
                        </h4>
                        <p style="margin: 0; color: var(--gray-600); font-size: 0.85rem;">
                            📅 ${formattedDate}
                        </p>
                        ${
                            sale.customerCPF
                                ? `<p style="margin: 0.25rem 0 0 0; color: var(--gray-500); font-size: 0.8rem;">
                                    🆔 ${this.formatCPF(sale.customerCPF)}
                                </p>`
                                : ''
                        }
                    </div>
                    <div style="border-top: 1px solid var(--gray-200); padding-top: 0.75rem;">
                        <p style="margin: 0; color: var(--primary-color); font-weight: 600; font-size: 1.2rem;">
                            R$ ${sale.totalValue.toFixed(2).replace('.', ',')}
                        </p>
                        <p style="margin: 0.25rem 0 0 0; color: var(--gray-500); font-size: 0.75rem;">
                            ${sale.items.length} ${
                    sale.items.length === 1 ? 'item' : 'itens'
                }
                        </p>
                    </div>
                </div>
            `;
                })
                .filter(html => html !== '') // Remover strings vazias
                .join('');

            // Configurar drag após renderizar (para ambos os carrosséis)
            setTimeout(() => {
                this.setupReceiptCarouselDrag(carousel);
            }, 100);
        } catch (error) {
            console.error('❌ [CARROSSEL] Erro ao renderizar carrossel:', error);
            carousel.innerHTML =
                '<p style="text-align: center; color: var(--gray-600); padding: 2rem; width: 100%;">Erro ao carregar comprovantes.</p>';
        }
    }

    searchReceipts() {
        const nameInput = document.getElementById('receiptSearchName');
        const cpfInput = document.getElementById('receiptSearchCPF');
        const resultsList = document.getElementById('receiptResultsList');

        if (!nameInput || !cpfInput || !resultsList) return;

        const searchName = nameInput.value.toLowerCase().trim();
        const searchCPF = cpfInput.value.replace(/\D/g, '').trim();

        // Filtrar comprovantes - usar cópia do array para evitar problemas de referência
        let filtered = [...this.completedSales];

        if (searchName) {
            filtered = filtered.filter((sale) => {
                if (!sale.customerName) return false;
                return sale.customerName.toLowerCase().includes(searchName);
            });
        }

        if (searchCPF) {
            filtered = filtered.filter((sale) => {
                if (!sale.customerCPF) return false;
                const saleCPF = sale.customerCPF.replace(/\D/g, '');
                return saleCPF.includes(searchCPF);
            });
        }

        // Ordenar por data (mais recentes primeiro) - usar timestamp se disponível
        filtered.sort((a, b) => {
            const timeA = a.timestamp || new Date(a.date).getTime();
            const timeB = b.timestamp || new Date(b.date).getTime();
            return timeB - timeA;
        });

        // Renderizar resultados
        if (filtered.length === 0) {
            resultsList.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--gray-600);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p style="margin: 0;">Nenhum comprovante encontrado.</p>
                </div>
            `;
            return;
        }

        resultsList.innerHTML = filtered
            .map((sale, index) => {
                const date = new Date(sale.date);
                const formattedDate = date.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });

                return `
                <div class="receipt-result-card" 
                     style="
                         background: var(--white); 
                         border: 1px solid var(--gray-300); 
                         border-radius: var(--radius-md); 
                         padding: 1.25rem; 
                         margin-bottom: 1rem;
                         box-shadow: var(--shadow-sm);
                         cursor: pointer;
                         transition: all var(--transition-base);
                         animation: slideInLeft 0.3s ease-out ${
                             index * 0.05
                         }s both;
                     "
                     onclick="app.viewFullReceipt('${sale.id}')"
                     onmouseover="this.style.transform='translateX(4px)'; this.style.boxShadow='var(--shadow-md)'; this.style.borderColor='var(--primary-color)';"
                     onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='var(--shadow-sm)'; this.style.borderColor='var(--gray-300)';">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 0.5rem 0; color: var(--dark-gray); font-size: 1rem;">
                                ${this.escapeHtml(sale.customerName)}
                            </h4>
                            <p style="margin: 0; color: var(--gray-600); font-size: 0.9rem;">
                                📅 ${formattedDate}
                            </p>
                            ${
                                sale.customerCPF
                                    ? `
                                <p style="margin: 0.25rem 0 0 0; color: var(--gray-600); font-size: 0.85rem;">
                                    🆔 ${this.formatCPF(sale.customerCPF)}
                                </p>
                            `
                                    : ''
                            }
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 0; color: var(--primary-color); font-weight: 600; font-size: 1.2rem;">
                                R$ ${sale.totalValue
                                    .toFixed(2)
                                    .replace('.', ',')}
                            </p>
                            <p style="margin: 0.25rem 0 0 0; color: var(--gray-500); font-size: 0.85rem;">
                                Código: ${this.escapeHtml(sale.orderCode)}
                            </p>
                        </div>
                    </div>
                    <div style="border-top: 1px solid var(--gray-200); padding-top: 0.75rem;">
                        <p style="margin: 0; color: var(--gray-600); font-size: 0.9rem;">
                            <strong>Itens:</strong> ${sale.items
                                .map(
                                    (item) =>
                                        `${item.quantity}x ${this.escapeHtml(
                                            item.name
                                        )}`
                                )
                                .join(', ')}
                        </p>
                    </div>
                </div>
            `;
            })
            .join('');
    }

    viewFullReceipt(saleId) {
        const sale = this.completedSales.find((s) => s.id === saleId);
        if (!sale) {
            this.showError('Comprovante não encontrado.');
            return;
        }

        // Fechar modal de busca (se estiver aberto)
        this.closeReceiptSearchModal();

        // Mostrar preview completo
        this.showReceiptPreview(sale);
    }

    setupReceiptCarouselDrag(container = null) {
        // Usar container fornecido ou buscar o carrossel fixo
        const carousel = container || document.getElementById('lastReceiptsCarousel');
        if (!carousel) return;

        // Remover listeners antigos se existirem (evitar duplicação)
        // Criar um identificador único para os listeners
        if (carousel.dataset.dragSetup === 'true') {
            // Já foi configurado, não configurar novamente
            return;
        }
        carousel.dataset.dragSetup = 'true';

        let isDown = false;
        let startX;
        let scrollLeft;

        // Mouse events
        let mouseMoved = false;
        carousel.addEventListener('mousedown', (e) => {
            mouseMoved = false;
            isDown = true;
            carousel.style.cursor = 'grabbing';
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
            // Não prevenir default para permitir click nos cards
        });

        carousel.addEventListener('mouseleave', () => {
            isDown = false;
            carousel.style.cursor = 'grab';
        });

        carousel.addEventListener('mouseup', (e) => {
            if (isDown && !mouseMoved) {
                // Se não houve movimento, pode ser um click no card
                const card = e.target.closest('.receipt-mini-card');
                if (card && card.onclick) {
                    // Executar click no card
                    setTimeout(() => {
                        const clickEvent = new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        card.dispatchEvent(clickEvent);
                    }, 10);
                }
            }
            isDown = false;
            mouseMoved = false;
            carousel.style.cursor = 'grab';
        });

        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            const moved = Math.abs(e.pageX - startX - carousel.offsetLeft) > 5;
            if (moved) {
                mouseMoved = true;
                e.preventDefault();
                const x = e.pageX - carousel.offsetLeft;
                const walk = (x - startX) * 2; // Velocidade do scroll
                carousel.scrollLeft = scrollLeft - walk;
            }
        });

        // Touch events (para mobile)
        let touchStartX = 0;
        let touchScrollLeft = 0;
        let touchStartTime = 0;
        let touchMoved = false;

        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].pageX - carousel.offsetLeft;
            touchScrollLeft = carousel.scrollLeft;
            touchStartTime = Date.now();
            touchMoved = false;
        }, { passive: true });

        carousel.addEventListener('touchmove', (e) => {
            if (!touchStartX) return;
            const x = e.touches[0].pageX - carousel.offsetLeft;
            const walk = (x - touchStartX) * 2;
            if (Math.abs(walk) > 5) {
                touchMoved = true;
            }
            carousel.scrollLeft = touchScrollLeft - walk;
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            // Se foi um toque rápido sem movimento, pode ser um click no card
            const touchDuration = Date.now() - touchStartTime;
            if (!touchMoved && touchDuration < 300) {
                const touch = e.changedTouches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                const card = element?.closest('.receipt-mini-card');
                if (card && card.onclick) {
                    // Executar click no card
                    setTimeout(() => card.click(), 10);
                }
            }
            touchStartX = 0;
            touchMoved = false;
        });
    }

    // Formatar CPF no input (máscara)
    formatCPFInput(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 0) {
            if (value.length <= 3) {
                input.value = value;
            } else if (value.length <= 6) {
                input.value = value.replace(/(\d{3})(\d+)/, '$1.$2');
            } else if (value.length <= 9) {
                input.value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
            } else {
                input.value = value.replace(
                    /(\d{3})(\d{3})(\d{3})(\d+)/,
                    '$1.$2.$3-$4'
                );
            }
        } else {
            input.value = '';
        }
    }

    // ========== PEDIDOS PENDENTES ==========

    openPendingOrderModal(order = null) {
        const modal = document.getElementById('pendingOrderModal');
        if (!modal) {
            console.error('Modal de pedido pendente não encontrado');
            return;
        }

        const form = document.getElementById('pendingOrderForm');
        const title = document.getElementById('pendingOrderModalTitle');
        const itemsList = document.getElementById('pendingOrderItemsList');
        const totalInput = document.getElementById('pendingOrderTotal');

        if (title) {
            title.textContent = order
                ? 'Editar Pedido Pendente'
                : 'Novo Pedido Pendente';
        }

        // Limpar formulário
        if (form) {
            form.reset();
            if (itemsList) itemsList.innerHTML = '';
        }

        // Preencher se for edição
        if (order) {
            document.getElementById('pendingOrderCustomerName').value =
                order.customerName || '';
            document.getElementById('pendingOrderCustomerCPF').value =
                order.customerCPF ? this.formatCPF(order.customerCPF) : '';
            document.getElementById('pendingOrderStatus').value =
                order.status || 'pending';
            document.getElementById('pendingOrderDueDate').value =
                order.dueDate || '';

            // Adicionar itens
            if (order.items && itemsList) {
                order.items.forEach((item, index) => {
                    this.addPendingOrderItemRow(item, index);
                });
            }

            if (totalInput) {
                totalInput.value = order.totalValue || 0;
            }

            this.currentEditingPendingOrder = order.id;
        } else {
            this.currentEditingPendingOrder = null;
            // Adicionar primeiro item vazio
            if (itemsList) {
                this.addPendingOrderItemRow();
            }
            if (totalInput) {
                totalInput.value = '0.00';
            }
        }

        // Aplicar máscara de CPF
        const cpfInput = document.getElementById('pendingOrderCustomerCPF');
        if (cpfInput) {
            cpfInput.addEventListener('input', () =>
                this.formatCPFInput(cpfInput)
            );
        }

        modal.classList.add('active');
    }

    addPendingOrderItemRow(item = null, index = null) {
        const itemsList = document.getElementById('pendingOrderItemsList');
        if (!itemsList) return;

        const rowIndex = index !== null ? index : itemsList.children.length;
        const row = document.createElement('div');
        row.className = 'pending-order-item-row';
        row.style.cssText =
            'display: flex; gap: 0.5rem; align-items: flex-start; margin-bottom: 0.5rem;';

        const itemSelect = document.createElement('select');
        itemSelect.required = true;
        itemSelect.style.cssText = 'flex: 2;';
        itemSelect.innerHTML = '<option value="">Selecione um item...</option>';
        this.items
            .filter((i) => i.category !== 'Serviços')
            .forEach((i) => {
                const option = document.createElement('option');
                option.value = i.id;
                option.textContent = this.getItemName(i.id);
                if (item && item.itemId === i.id) option.selected = true;
                itemSelect.appendChild(option);
            });

        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.min = '1';
        qtyInput.required = true;
        qtyInput.placeholder = 'Qtd';
        qtyInput.style.cssText = 'flex: 1; max-width: 80px;';
        if (item) qtyInput.value = item.quantity || 1;

        const priceInput = document.createElement('input');
        priceInput.type = 'number';
        priceInput.step = '0.01';
        priceInput.min = '0.01';
        priceInput.required = true;
        priceInput.placeholder = 'Preço';
        priceInput.style.cssText = 'flex: 1; max-width: 100px;';
        if (item) priceInput.value = item.price || 0;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn-secondary';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.style.cssText = 'min-width: 36px; padding: 0.5rem;';
        removeBtn.onclick = () => {
            row.remove();
            this.updatePendingOrderTotal();
        };

        // Atualizar total quando valores mudarem
        [itemSelect, qtyInput, priceInput].forEach((input) => {
            input.addEventListener('change', () =>
                this.updatePendingOrderTotal()
            );
        });

        row.appendChild(itemSelect);
        row.appendChild(qtyInput);
        row.appendChild(priceInput);
        row.appendChild(removeBtn);
        itemsList.appendChild(row);
    }

    updatePendingOrderTotal() {
        const itemsList = document.getElementById('pendingOrderItemsList');
        const totalInput = document.getElementById('pendingOrderTotal');
        if (!itemsList || !totalInput) return;

        let total = 0;
        itemsList.querySelectorAll('.pending-order-item-row').forEach((row) => {
            const qty =
                parseFloat(
                    row.querySelector('input[type="number"]:nth-of-type(1)')
                        .value
                ) || 0;
            const price =
                parseFloat(
                    row.querySelector('input[type="number"]:nth-of-type(2)')
                        .value
                ) || 0;
            total += qty * price;
        });

        totalInput.value = total.toFixed(2);
    }

    savePendingOrder(e) {
        e.preventDefault();

        // Formatar nome do cliente automaticamente
        const customerName = this.formatText(
            document.getElementById('pendingOrderCustomerName').value
        );
        const customerCPF = document
            .getElementById('pendingOrderCustomerCPF')
            .value.replace(/\D/g, '');
        const status = document.getElementById('pendingOrderStatus').value;
        const dueDate = document.getElementById('pendingOrderDueDate').value;
        const itemsList = document.getElementById('pendingOrderItemsList');
        const totalInput = document.getElementById('pendingOrderTotal');

        if (!customerName) {
            toast.warning('Por favor, informe o nome do cliente.', 3000);
            return;
        }

        const items = [];
        itemsList.querySelectorAll('.pending-order-item-row').forEach((row) => {
            const itemId = row.querySelector('select').value;
            const quantity =
                parseInt(
                    row.querySelector('input[type="number"]:nth-of-type(1)')
                        .value
                ) || 0;
            const price =
                parseFloat(
                    row.querySelector('input[type="number"]:nth-of-type(2)')
                        .value
                ) || 0;

            if (itemId && quantity > 0 && price > 0) {
                const item = this.items.find((i) => i.id === itemId);
                items.push({
                    itemId: itemId,
                    name: item
                        ? this.getItemName(itemId)
                        : 'Item não encontrado',
                    quantity: quantity,
                    price: price,
                });
            }
        });

        if (items.length === 0) {
            alert('Por favor, adicione pelo menos um item.');
            return;
        }

        const totalValue = parseFloat(totalInput.value) || 0;

        const orderData = {
            id:
                this.currentEditingPendingOrder ||
                Date.now().toString() + Math.random().toString(36).substr(2, 9),
            customerName: customerName,
            customerCPF: customerCPF || null,
            items: items,
            totalValue: totalValue,
            status: status,
            dueDate: dueDate || null,
            createdAt: this.currentEditingPendingOrder
                ? this.pendingOrders.find(
                      (o) => o.id === this.currentEditingPendingOrder
                  )?.createdAt || new Date().toISOString()
                : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (this.currentEditingPendingOrder) {
            const index = this.pendingOrders.findIndex(
                (o) => o.id === this.currentEditingPendingOrder
            );
            if (index !== -1) {
                this.pendingOrders[index] = orderData;
            }
        } else {
            this.pendingOrders.push(orderData);
        }

        this.saveData();
        this.renderPendingOrders();
        this.closePendingOrderModal();
        this.showSuccess('Pedido pendente salvo com sucesso!');
    }

    closePendingOrderModal() {
        const modal = document.getElementById('pendingOrderModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentEditingPendingOrder = null;
        const form = document.getElementById('pendingOrderForm');
        if (form) form.reset();
    }

    renderPendingOrders() {
        const container = document.getElementById('pendingOrdersList');
        if (!container) return;

        if (this.pendingOrders.length === 0) {
            container.innerHTML =
                '<p style="text-align: center; color: var(--gray); padding: 2rem;">Nenhum pedido pendente cadastrado.</p>';
            return;
        }

        container.innerHTML = this.pendingOrders
            .map((order) => {
                const statusClass = `order-status-${order.status}`;
                const statusText =
                    {
                        pending: 'Pendente',
                        confirmed: 'Confirmado',
                        cancelled: 'Cancelado',
                    }[order.status] || order.status;

                const date = new Date(order.createdAt);
                const formattedDate = date.toLocaleDateString('pt-BR');

                // Verificar vencimento
                let dueDateAlert = '';
                let cardBorderColor = 'var(--border-color)';
                if (order.dueDate && order.status !== 'cancelled' && order.status !== 'completed') {
                    const dueDate = new Date(order.dueDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    dueDate.setHours(0, 0, 0, 0);
                    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                    
                    if (daysUntilDue < 0) {
                        // Vencido
                        dueDateAlert = `<div style="padding: 0.75rem; background: #fee; border: 2px solid #dc3545; border-radius: var(--radius-sm); margin-bottom: 0.75rem;">
                            <p style="margin: 0; color: #721c24; font-weight: 600;">
                                <i class="fas fa-exclamation-triangle"></i> VENCIDO há ${Math.abs(daysUntilDue)} dia(s)
                            </p>
                        </div>`;
                        cardBorderColor = '#dc3545';
                    } else if (daysUntilDue <= 3) {
                        // Próximo do vencimento
                        dueDateAlert = `<div style="padding: 0.75rem; background: #fff3cd; border: 2px solid #ffc107; border-radius: var(--radius-sm); margin-bottom: 0.75rem;">
                            <p style="margin: 0; color: #856404; font-weight: 600;">
                                <i class="fas fa-clock"></i> Vence em ${daysUntilDue} dia(s)
                            </p>
                        </div>`;
                        cardBorderColor = '#ffc107';
                    }
                }

                return `
                <div class="pending-order-card" style="background: var(--white); border: 2px solid ${cardBorderColor}; border-radius: var(--radius-md); padding: 1.25rem; box-shadow: var(--shadow-sm);">
                    ${dueDateAlert}
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <div>
                            <h3 style="margin: 0 0 0.5rem 0; color: var(--dark-gray);">${this.escapeHtml(
                                order.customerName
                            )}</h3>
                            ${
                                order.customerCPF
                                    ? `<p style="margin: 0; color: var(--gray-600); font-size: 0.9rem;">CPF: ${this.formatCPF(
                                          order.customerCPF
                                      )}</p>`
                                    : ''
                            }
                        </div>
                        <span class="order-status ${statusClass}">${statusText}</span>
                    </div>
                    <div style="margin-bottom: 0.75rem;">
                        <p style="margin: 0 0 0.5rem 0; color: var(--gray-600); font-size: 0.9rem;"><strong>Itens:</strong></p>
                        <ul style="margin: 0; padding-left: 1.25rem; color: var(--dark-gray);">
                            ${order.items
                                .map(
                                    (item) =>
                                        `<li>${this.escapeHtml(item.name)} - ${
                                            item.quantity
                                        } un. × R$ ${item.price
                                            .toFixed(2)
                                            .replace('.', ',')}</li>`
                                )
                                .join('')}
                        </ul>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <p style="margin: 0; color: var(--dark-gray);"><strong>Total:</strong> R$ ${order.totalValue
                            .toFixed(2)
                            .replace('.', ',')}</p>
                        <p style="margin: 0; color: var(--gray-600); font-size: 0.85rem;">${formattedDate}</p>
                    </div>
                    ${
                        order.dueDate
                            ? `<p style="margin: 0 0 0.75rem 0; color: var(--gray-600); font-size: 0.85rem;"><strong>Vencimento:</strong> ${new Date(
                                  order.dueDate
                              ).toLocaleDateString('pt-BR')}</p>`
                            : ''
                    }
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button type="button" class="btn-secondary" onclick="app.editPendingOrder('${
                            order.id
                        }')" style="flex: 1; min-width: 80px;">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        ${
                            order.status !== 'cancelled' &&
                            order.status !== 'completed'
                                ? `
                            <button type="button" class="btn-primary" onclick="app.completePendingOrder('${order.id}')" style="flex: 1; min-width: 120px;">
                                <i class="fas fa-check"></i> Finalizar
                            </button>
                        `
                                : ''
                        }
                        <button type="button" class="btn-delete" onclick="app.deletePendingOrder('${
                            order.id
                        }')" style="min-width: 36px; padding: 0.5rem;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
            })
            .join('');
    }

    editPendingOrder(orderId) {
        const order = this.pendingOrders.find((o) => o.id === orderId);
        if (order) {
            this.openPendingOrderModal(order);
        }
    }

    deletePendingOrder(orderId) {
        if (confirm('Tem certeza que deseja excluir este pedido pendente?')) {
            this.pendingOrders = this.pendingOrders.filter(
                (o) => o.id !== orderId
            );
            this.saveData();
            this.renderPendingOrders();
            this.showSuccess('Pedido pendente excluído com sucesso!');
        }
    }

    completePendingOrder(orderId) {
        const order = this.pendingOrders.find((o) => o.id === orderId);
        if (!order) return;

        if (
            confirm(
                'Deseja finalizar o pagamento e converter este pedido em venda concluída?'
            )
        ) {
            // Usar data de vencimento ou data atual
            const finalizationDate = order.dueDate
                ? new Date(order.dueDate)
                : new Date();

            // Obter ano e mês da data de finalização
            const year = finalizationDate.getFullYear();
            const month = String(finalizationDate.getMonth() + 1).padStart(
                2,
                '0'
            );
            const day = finalizationDate.getDate();
            const groupMonth = `${year}-${month}`;

            // Encontrar ou criar grupo mensal
            let group = this.groups.find((g) => g.month === groupMonth);

            if (!group) {
                // Criar novo grupo mensal se não existir
                group = {
                    id: Date.now().toString(),
                    month: groupMonth,
                    days: [],
                };

                // Criar dias do mês
                const daysInMonth = new Date(
                    year,
                    parseInt(month),
                    0
                ).getDate();
                for (let d = 1; d <= daysInMonth; d++) {
                    group.days.push({
                        day: d,
                        sales: [],
                        stock: {},
                    });
                }

                this.groups.push(group);
                this.groups.sort((a, b) => b.month.localeCompare(a.month));
            }

            // Encontrar ou criar dia
            let dayData = group.days.find((d) => d.day === day);
            if (!dayData) {
                dayData = {
                    day: day,
                    sales: [],
                    stock: {},
                };
                group.days.push(dayData);
                group.days.sort((a, b) => a.day - b.day);
            }

            // Garantir que stock existe
            if (!dayData.stock) {
                dayData.stock = {};
            }

            // Adicionar vendas e estoque para cada item
            order.items.forEach((orderItem) => {
                const item = this.items.find((i) => i.id === orderItem.itemId);
                const isService = item && item.category === 'Serviços';

                // Adicionar venda ao dia
                dayData.sales.push({
                    itemId: orderItem.itemId,
                    quantity: orderItem.quantity,
                    price: orderItem.price,
                });

                // Adicionar ao estoque (apenas para produtos físicos)
                if (!isService) {
                    if (!dayData.stock[orderItem.itemId]) {
                        dayData.stock[orderItem.itemId] = 0;
                    }
                    // Adicionar quantidade ao estoque do dia
                    dayData.stock[orderItem.itemId] += orderItem.quantity;
                }
            });

            // Criar venda concluída com informações completas
            const completedSale = {
                id:
                    Date.now().toString() +
                    Math.random().toString(36).substr(2, 9),
                orderCode: this.generateOrderCode(),
                customerName: order.customerName,
                customerCPF: order.customerCPF || null,
                items: order.items.map((item) => {
                    const itemObj = this.items.find(
                        (i) => i.id === item.itemId
                    );
                    return {
                        itemId: item.itemId,
                        name: itemObj
                            ? this.getItemName(item.itemId)
                            : 'Item não encontrado',
                        quantity: item.quantity,
                        price: item.price,
                    };
                }),
                totalValue: order.totalValue,
                date: finalizationDate.toISOString(),
                timestamp: finalizationDate.getTime(),
                groupId: group.id,
                groupMonth: groupMonth,
                day: day,
                fromPendingOrder: true,
            };

            // Adicionar à lista de vendas concluídas
            this.completedSales.push(completedSale);

            // Remover pedido pendente
            this.pendingOrders = this.pendingOrders.filter(
                (o) => o.id !== orderId
            );

            this.saveData();
            this.renderPendingOrders();
            // Atualizar carrossel de últimos comprovantes na seção fixa
            this.renderLastReceiptsCarousel();
            this.renderGroups();
            this.updateYearFilter();

            // Atualizar resumo geral
            this.updateOverallSummary();

            this.showReceiptPreview(completedSale);
            this.showSuccess(
                'Pedido finalizado e convertido em venda concluída! Venda registrada no grupo mensal e estoque atualizado.'
            );
        }
    }

    // ========== AGENDAMENTOS DE SERVIÇOS ==========

    openServiceAppointmentModal(appointment = null) {
        const modal = document.getElementById('serviceAppointmentModal');
        if (!modal) {
            console.error('Modal de agendamento não encontrado');
            return;
        }

        const form = document.getElementById('serviceAppointmentForm');
        const title = document.getElementById('serviceAppointmentModalTitle');
        const serviceSelect = document.getElementById('appointmentServiceType');

        if (title) {
            title.textContent = appointment
                ? 'Editar Agendamento'
                : 'Novo Agendamento';
        }

        // Preencher select de serviços
        if (serviceSelect) {
            serviceSelect.innerHTML =
                '<option value="">Selecione um serviço...</option>';
            this.items
                .filter((i) => i.category === 'Serviços')
                .forEach((service) => {
                    const option = document.createElement('option');
                    option.value = service.id;
                    option.textContent = service.name || 'Serviço';
                    if (appointment && appointment.serviceTypeId === service.id)
                        option.selected = true;
                    serviceSelect.appendChild(option);
                });
        }

        // Limpar ou preencher formulário
        if (form) {
            if (appointment) {
                document.getElementById('appointmentServiceType').value =
                    appointment.serviceTypeId || '';
                document.getElementById('appointmentCustomerName').value =
                    appointment.customerName || '';
                document.getElementById('appointmentCustomerContact').value =
                    appointment.customerContact || '';
                document.getElementById('appointmentDate').value =
                    appointment.date || '';
                document.getElementById('appointmentTime').value =
                    appointment.time || '';
                document.getElementById('appointmentPrice').value =
                    appointment.price || '';
                document.getElementById('appointmentStatus').value =
                    appointment.status || 'pending';
                document.getElementById('appointmentNotes').value =
                    appointment.notes || '';
                this.currentEditingServiceAppointment = appointment.id;
            } else {
                form.reset();
                // Definir data padrão como hoje
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('appointmentDate').value = today;
                this.currentEditingServiceAppointment = null;
            }
        }

        modal.classList.add('active');
    }

    saveServiceAppointment(e) {
        e.preventDefault();

        const serviceTypeId = document.getElementById(
            'appointmentServiceType'
        ).value;
        // Formatar nome do cliente automaticamente
        const customerName = this.formatText(
            document.getElementById('appointmentCustomerName').value
        );
        const customerContact = document
            .getElementById('appointmentCustomerContact')
            .value.trim();
        const date = document.getElementById('appointmentDate').value;
        const time = document.getElementById('appointmentTime').value;
        const price =
            parseFloat(document.getElementById('appointmentPrice').value) || 0;
        const status = document.getElementById('appointmentStatus').value;
        // Formatar observações automaticamente
        const notes = this.formatText(document.getElementById('appointmentNotes').value);

        if (!serviceTypeId) {
            alert('Por favor, selecione um tipo de serviço.');
            return;
        }

        if (!customerName) {
            toast.warning('Por favor, informe o nome do cliente.', 3000);
            return;
        }

        if (!date || !time) {
            alert('Por favor, informe a data e horário do agendamento.');
            return;
        }

        if (price <= 0) {
            alert('Por favor, informe um preço válido.');
            return;
        }

        const appointmentData = {
            id:
                this.currentEditingServiceAppointment ||
                Date.now().toString() + Math.random().toString(36).substr(2, 9),
            serviceTypeId: serviceTypeId,
            customerName: customerName,
            customerContact: customerContact || null,
            date: date,
            time: time,
            price: price,
            status: status,
            notes: notes || null,
            createdAt: this.currentEditingServiceAppointment
                ? this.serviceAppointments.find(
                      (a) => a.id === this.currentEditingServiceAppointment
                  )?.createdAt || new Date().toISOString()
                : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (this.currentEditingServiceAppointment) {
            const index = this.serviceAppointments.findIndex(
                (a) => a.id === this.currentEditingServiceAppointment
            );
            if (index !== -1) {
                this.serviceAppointments[index] = appointmentData;
            }
        } else {
            this.serviceAppointments.push(appointmentData);
        }

        this.saveData();
        this.renderServiceAppointments();
        this.closeServiceAppointmentModal();
        this.showSuccess('Agendamento salvo com sucesso!');
    }

    closeServiceAppointmentModal() {
        const modal = document.getElementById('serviceAppointmentModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentEditingServiceAppointment = null;
        const form = document.getElementById('serviceAppointmentForm');
        if (form) form.reset();
    }

    renderServiceAppointments() {
        const container = document.getElementById('serviceAppointmentsList');
        if (!container) return;

        if (this.serviceAppointments.length === 0) {
            container.innerHTML =
                '<p style="text-align: center; color: var(--gray); padding: 2rem;">Nenhum agendamento cadastrado.</p>';
            return;
        }

        // Separar agendamentos futuros e passados
        const now = new Date();
        const future = [];
        const past = [];

        this.serviceAppointments.forEach((appointment) => {
            const appointmentDateTime = new Date(
                `${appointment.date}T${appointment.time}`
            );
            if (appointmentDateTime >= now) {
                future.push(appointment);
            } else {
                past.push(appointment);
            }
        });

        // Ordenar: futuros por data/hora crescente, passados por data/hora decrescente
        future.sort(
            (a, b) =>
                new Date(`${a.date}T${a.time}`) -
                new Date(`${b.date}T${b.time}`)
        );
        past.sort(
            (a, b) =>
                new Date(`${b.date}T${b.time}`) -
                new Date(`${a.date}T${a.time}`)
        );

        let html = '';

        if (future.length > 0) {
            html +=
                '<h3 style="margin: 0 0 1rem 0; color: var(--dark-gray); font-size: 1.1rem;">Próximos Agendamentos</h3>';
            html += future
                .map((appointment) =>
                    this.renderServiceAppointmentCard(appointment)
                )
                .join('');
        }

        if (past.length > 0) {
            html +=
                '<h3 style="margin: 1.5rem 0 1rem 0; color: var(--dark-gray); font-size: 1.1rem;">Agendamentos Passados</h3>';
            html +=
                '<div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">';
            html += past
                .map((appointment) =>
                    this.renderServiceAppointmentCard(appointment, true)
                )
                .join('');
            html += '</div>';
        }

        container.innerHTML = html;

        // Verificar e exibir lembretes de agendamentos próximos
        this.checkAppointmentsReminders();

        // Renderizar mini calendário
        this.renderMiniCalendar();
    }

    renderMiniCalendar() {
        const container = document.getElementById('miniCalendarContainer');
        if (!container) return;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentDate = now.getDate();

        // Obter dias com agendamentos no mês atual
        const daysWithAppointments = this.getDaysWithAppointments(
            currentYear,
            currentMonth
        );

        // Nomes dos dias da semana (abreviados)
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        // Primeiro dia do mês
        const firstDay = new Date(currentYear, currentMonth, 1);
        const firstDayWeek = firstDay.getDay();

        // Último dia do mês
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const totalDays = lastDay.getDate();

        let html = `
            <div class="mini-calendar" onclick="app.openCalendarModal()">
                <div class="mini-calendar-header">
                    <span class="mini-calendar-month">${this.getMonthName(
                        currentMonth
                    )}</span>
                    <span class="mini-calendar-year">${currentYear}</span>
                </div>
                <div class="mini-calendar-weekdays">
                    ${weekDays
                        .map(
                            (day) =>
                                `<span class="mini-calendar-weekday">${day}</span>`
                        )
                        .join('')}
                </div>
                <div class="mini-calendar-days">
        `;

        // Espaços vazios antes do primeiro dia
        for (let i = 0; i < firstDayWeek; i++) {
            html += '<div class="mini-calendar-day empty"></div>';
        }

        // Dias do mês
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
                2,
                '0'
            )}-${String(day).padStart(2, '0')}`;
            const hasAppointment = daysWithAppointments.includes(day);
            const isToday = day === currentDate;

            html += `
                <div class="mini-calendar-day ${
                    hasAppointment ? 'has-appointment' : ''
                } ${isToday ? 'today' : ''}" 
                     data-day="${day}">
                    <span class="day-number">${day}</span>
                    ${
                        hasAppointment
                            ? '<span class="appointment-dot"></span>'
                            : ''
                    }
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    getDaysWithAppointments(year, month) {
        const days = [];
        this.serviceAppointments.forEach((appointment) => {
            // Parse da data de forma segura, considerando apenas a parte da data (sem hora/timezone)
            let appointmentDate;
            if (typeof appointment.date === 'string') {
                // Se for string ISO, pegar apenas a parte da data (YYYY-MM-DD)
                const datePart = appointment.date.split('T')[0].split(' ')[0];
                const [yearStr, monthStr, dayStr] = datePart.split('-');
                appointmentDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
            } else {
                appointmentDate = new Date(appointment.date);
            }
            
            // Comparar apenas ano, mês e dia (ignorar hora/timezone)
            if (
                appointmentDate.getFullYear() === year &&
                appointmentDate.getMonth() === month
            ) {
                const day = appointmentDate.getDate();
                if (!days.includes(day)) {
                    days.push(day);
                }
            }
        });
        return days;
    }

    getMonthName(monthIndex) {
        const months = [
            'Janeiro',
            'Fevereiro',
            'Março',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro',
        ];
        return months[monthIndex];
    }

    openCalendarModal() {
        const modal = document.getElementById('calendarModal');
        if (!modal) return;

        this.currentCalendarMonth = new Date().getMonth();
        this.currentCalendarYear = new Date().getFullYear();

        this.renderFullCalendar(
            this.currentCalendarYear,
            this.currentCalendarMonth
        );
        modal.classList.add('active');
    }

    closeCalendarModal() {
        const modal = document.getElementById('calendarModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    renderFullCalendar(year, month) {
        const monthYearEl = document.getElementById('calendarMonthYear');
        const gridEl = document.getElementById('calendarGrid');

        if (!monthYearEl || !gridEl) return;

        monthYearEl.textContent = `${this.getMonthName(month)} ${year}`;

        // Obter dias com agendamentos
        const daysWithAppointments = this.getDaysWithAppointments(year, month);
        const appointmentsByDay = this.getAppointmentsByDay(year, month);

        // Nomes dos dias da semana
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        // Primeiro dia do mês
        const firstDay = new Date(year, month, 1);
        const firstDayWeek = firstDay.getDay();

        // Último dia do mês
        const lastDay = new Date(year, month + 1, 0);
        const totalDays = lastDay.getDate();

        const now = new Date();
        const isCurrentMonth =
            now.getMonth() === month && now.getFullYear() === year;
        const today = now.getDate();

        let html = '';

        // Cabeçalho dos dias da semana
        weekDays.forEach((day) => {
            html += `<div class="calendar-weekday">${day}</div>`;
        });

        // Espaços vazios antes do primeiro dia
        for (let i = 0; i < firstDayWeek; i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        // Dias do mês
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(
                2,
                '0'
            )}-${String(day).padStart(2, '0')}`;
            const hasAppointment = daysWithAppointments.includes(day);
            const isToday = isCurrentMonth && day === today;
            const dayAppointments = appointmentsByDay[day] || [];

            html += `
                <div class="calendar-day ${
                    hasAppointment ? 'has-appointment' : ''
                } ${isToday ? 'today' : ''}" 
                     data-day="${day}" data-date="${dateStr}">
                    <span class="calendar-day-number">${day}</span>
                    ${
                        hasAppointment
                            ? `<div class="calendar-appointment-indicator">${dayAppointments.length}</div>`
                            : ''
                    }
                    ${
                        dayAppointments.length > 0
                            ? `
                        <div class="calendar-day-tooltip">
                            ${dayAppointments
                                .map(
                                    (apt) => `
                                <div class="tooltip-item">
                                    <strong>${apt.time}</strong> - ${apt.customerName}
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    `
                            : ''
                    }
                </div>
            `;
        }

        gridEl.innerHTML = html;

        // Adicionar event listeners para navegação
        const prevBtn = document.getElementById('prevMonthBtn');
        const nextBtn = document.getElementById('nextMonthBtn');

        if (prevBtn) {
            prevBtn.onclick = () => {
                if (this.currentCalendarMonth === 0) {
                    this.currentCalendarMonth = 11;
                    this.currentCalendarYear--;
                } else {
                    this.currentCalendarMonth--;
                }
                this.renderFullCalendar(
                    this.currentCalendarYear,
                    this.currentCalendarMonth
                );
            };
        }

        if (nextBtn) {
            nextBtn.onclick = () => {
                if (this.currentCalendarMonth === 11) {
                    this.currentCalendarMonth = 0;
                    this.currentCalendarYear++;
                } else {
                    this.currentCalendarMonth++;
                }
                this.renderFullCalendar(
                    this.currentCalendarYear,
                    this.currentCalendarMonth
                );
            };
        }
    }

    getAppointmentsByDay(year, month) {
        const appointmentsByDay = {};
        this.serviceAppointments.forEach((appointment) => {
            // Parse da data de forma segura, considerando apenas a parte da data (sem hora/timezone)
            let appointmentDate;
            if (typeof appointment.date === 'string') {
                // Se for string ISO, pegar apenas a parte da data (YYYY-MM-DD)
                const datePart = appointment.date.split('T')[0].split(' ')[0];
                const [yearStr, monthStr, dayStr] = datePart.split('-');
                appointmentDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
            } else {
                appointmentDate = new Date(appointment.date);
            }
            
            // Comparar apenas ano, mês e dia (ignorar hora/timezone)
            if (
                appointmentDate.getFullYear() === year &&
                appointmentDate.getMonth() === month
            ) {
                const day = appointmentDate.getDate();
                if (!appointmentsByDay[day]) {
                    appointmentsByDay[day] = [];
                }
                appointmentsByDay[day].push({
                    time: appointment.time,
                    customerName: appointment.customerName,
                    serviceTypeId: appointment.serviceTypeId,
                });
            }
        });
        return appointmentsByDay;
    }

    renderServiceAppointmentCard(appointment, isPast = false) {
        const service = this.items.find(
            (i) => i.id === appointment.serviceTypeId
        );
        const serviceName = service ? service.name : 'Serviço não encontrado';

        const statusClass = `appointment-status-${appointment.status}`;
        const statusText =
            {
                pending: 'Pendente',
                confirmed: 'Confirmado',
                completed: 'Concluído',
                cancelled: 'Cancelado',
            }[appointment.status] || appointment.status;

        const appointmentDate = new Date(
            `${appointment.date}T${appointment.time}`
        );
        const formattedDate = appointmentDate.toLocaleDateString('pt-BR');
        const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        });

        // Estilos diferentes para agendamentos passados
        const cardStyle = isPast
            ? `background: var(--white); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.875rem; box-shadow: var(--shadow-sm); width: 100%; max-width: 400px; margin: 0 auto;`
            : `background: var(--white); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; box-shadow: var(--shadow-sm); margin-bottom: 1rem;`;

        const titleStyle = isPast
            ? `margin: 0 0 0.4rem 0; color: var(--dark-gray); font-size: 0.95rem;`
            : `margin: 0 0 0.5rem 0; color: var(--dark-gray);`;

        const textStyle = isPast
            ? `margin: 0; color: var(--gray-600); font-size: 0.85rem;`
            : `margin: 0; color: var(--gray-600); font-size: 0.9rem;`;

        const detailStyle = isPast
            ? `margin: 0 0 0.2rem 0; color: var(--dark-gray); font-size: 0.85rem;`
            : `margin: 0 0 0.25rem 0; color: var(--dark-gray);`;
        
        // Verificar se é hoje ou amanhã para exibir alerta
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(23, 59, 59, 999);
        
        let reminderAlert = '';
        let cardBorderColor = 'var(--border-color)';
        if (!isPast && appointment.status !== 'completed' && appointment.status !== 'cancelled') {
            if (appointmentDate >= now && appointmentDate <= todayEnd) {
                reminderAlert = `<div style="padding: 0.75rem; background: #d1ecf1; border: 2px solid #17a2b8; border-radius: var(--radius-sm); margin-bottom: 0.75rem;">
                    <p style="margin: 0; color: #0c5460; font-weight: 600;">
                        <i class="fas fa-bell"></i> Agendamento HOJE às ${formattedTime}
                    </p>
                </div>`;
                cardBorderColor = '#17a2b8';
            } else if (appointmentDate >= tomorrow && appointmentDate <= tomorrowEnd) {
                reminderAlert = `<div style="padding: 0.75rem; background: #fff3cd; border: 2px solid #ffc107; border-radius: var(--radius-sm); margin-bottom: 0.75rem;">
                    <p style="margin: 0; color: #856404; font-weight: 600;">
                        <i class="fas fa-clock"></i> Agendamento AMANHÃ às ${formattedTime}
                    </p>
                </div>`;
                cardBorderColor = '#ffc107';
            }
        }

        return `
            <div class="service-appointment-card" style="${cardStyle}; border: 2px solid ${cardBorderColor};">
                ${reminderAlert}
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: ${
                    isPast ? '0.75rem' : '1rem'
                };">
                    <div style="flex: 1; min-width: 0;">
                        <h3 style="${titleStyle}">${this.escapeHtml(
            serviceName
        )}</h3>
                        <p style="${textStyle}">${this.escapeHtml(
            appointment.customerName
        )}</p>
                        ${
                            appointment.customerContact
                                ? `<p style="margin: 0.2rem 0 0 0; color: var(--gray-600); font-size: 0.8rem;">📞 ${this.escapeHtml(
                                      appointment.customerContact
                                  )}</p>`
                                : ''
                        }
                    </div>
                    <span class="appointment-status ${statusClass}" style="flex-shrink: 0; margin-left: 0.5rem;">${statusText}</span>
                </div>
                <div style="margin-bottom: ${isPast ? '0.5rem' : '0.75rem'};">
                    <p style="${detailStyle}"><strong>📅 Data:</strong> ${formattedDate}</p>
                    <p style="${detailStyle}"><strong>🕐 Horário:</strong> ${formattedTime}</p>
                    <p style="margin: 0; color: var(--dark-gray); font-size: ${
                        isPast ? '0.85rem' : '1rem'
                    };"><strong>💰 Preço:</strong> R$ ${appointment.price
            .toFixed(2)
            .replace('.', ',')}</p>
                </div>
                ${
                    appointment.notes
                        ? `<p style="margin: 0 0 ${
                              isPast ? '0.5rem' : '0.75rem'
                          } 0; color: var(--gray-600); font-size: ${
                              isPast ? '0.8rem' : '0.9rem'
                          }; font-style: italic;">${this.escapeHtml(
                              appointment.notes
                          )}</p>`
                        : ''
                }
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button type="button" class="btn-secondary" onclick="app.editServiceAppointment('${
                        appointment.id
                    }')" style="flex: 1; min-width: 80px; font-size: ${
            isPast ? '0.85rem' : '0.95rem'
        }; padding: ${isPast ? '0.5rem' : '0.625rem'};">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button type="button" class="btn-delete" onclick="app.deleteServiceAppointment('${
                        appointment.id
                    }')" style="min-width: 36px; padding: ${
            isPast ? '0.4rem' : '0.5rem'
        }; font-size: ${isPast ? '0.85rem' : '0.95rem'};">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }

    editServiceAppointment(appointmentId) {
        const appointment = this.serviceAppointments.find(
            (a) => a.id === appointmentId
        );
        if (appointment) {
            this.openServiceAppointmentModal(appointment);
        }
    }

    deleteServiceAppointment(appointmentId) {
        if (confirm('Tem certeza que deseja excluir este agendamento?')) {
            this.serviceAppointments = this.serviceAppointments.filter(
                (a) => a.id !== appointmentId
            );
            this.saveData();
            this.renderServiceAppointments();
            // Atualizar calendário após excluir
            this.renderMiniCalendar();
            this.showSuccess('Agendamento excluído com sucesso!');
        }
    }

    // Função auxiliar para escapar HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Função para corrigir acentos automaticamente
    fixAccents(text) {
        if (!text || typeof text !== 'string') return text;
        
        // Mapa de correções comuns de acentos
        const accentMap = {
            // Palavras comuns sem acento -> com acento
            'acao': 'ação',
            'aviao': 'avião',
            'cao': 'cão',
            'coracao': 'coração',
            'edicao': 'edição',
            'eleicao': 'eleição',
            'funcao': 'função',
            'informacao': 'informação',
            'nacao': 'nação',
            'opcao': 'opção',
            'previsao': 'previsão',
            'sessao': 'sessão',
            'situacao': 'situação',
            'televisao': 'televisão',
            'transacao': 'transação',
            'camisa': 'camisa',
            'calca': 'calça',
            'blusa': 'blusa',
            'vestido': 'vestido',
            'sapato': 'sapato',
            'tenis': 'tênis',
            'bone': 'boné',
            'oculos': 'óculos',
            'relogio': 'relógio',
            'celular': 'celular',
            'tablet': 'tablet',
            'notebook': 'notebook',
            'computador': 'computador',
            'televisao': 'televisão',
            'som': 'som',
            'fone': 'fone',
            'mouse': 'mouse',
            'teclado': 'teclado',
        };

        // Primeiro, tentar corrigir palavras completas
        let corrected = text;
        for (const [wrong, correct] of Object.entries(accentMap)) {
            // Usar regex para substituir palavras inteiras (case insensitive)
            const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
            corrected = corrected.replace(regex, (match) => {
                // Manter o case original
                if (match === match.toUpperCase()) {
                    return correct.toUpperCase();
                } else if (match[0] === match[0].toUpperCase()) {
                    return correct.charAt(0).toUpperCase() + correct.slice(1);
                }
                return correct;
            });
        }

        return corrected;
    }

    // Função para capitalizar palavras (primeira letra maiúscula)
    capitalizeWords(text) {
        if (!text || typeof text !== 'string') return text;
        
        // Lista de palavras que não devem ser capitalizadas (artigos, preposições, etc.)
        const lowercaseWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos', 'para', 'por', 'com', 'sem', 'a', 'o', 'as', 'os'];
        
        return text
            .split(' ')
            .map((word, index) => {
                // Se for a primeira palavra ou não estiver na lista de exceções, capitalizar
                if (index === 0 || !lowercaseWords.includes(word.toLowerCase())) {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }
                return word.toLowerCase();
            })
            .join(' ');
    }

    // Função para formatar texto (corrigir acentos e capitalizar)
    formatText(text) {
        if (!text || typeof text !== 'string') return text;
        
        // Primeiro corrigir acentos, depois capitalizar
        let formatted = this.fixAccents(text.trim());
        formatted = this.capitalizeWords(formatted);
        
        return formatted;
    }

    // Funções de feedback para o usuário
    // Métodos showSuccess e showError já foram atualizados acima para usar Toast
    // Este método antigo é mantido apenas para compatibilidade
    showSuccessOld2(message) {
        // Criar elemento de mensagem
        const messageEl = document.createElement('div');
        messageEl.style.cssText =
            'position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 10000; animation: slideInRight 0.3s ease-out;';
        messageEl.textContent = message;
        document.body.appendChild(messageEl);

        // Remover após 3 segundos
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    // Método antigo mantido para compatibilidade
    showErrorOld(message) {
        // Criar elemento de mensagem
        const messageEl = document.createElement('div');
        messageEl.style.cssText =
            'position: fixed; top: 20px; right: 20px; background: #dc3545; color: white; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 10000; animation: slideInRight 0.3s ease-out;';
        messageEl.textContent = message;
        document.body.appendChild(messageEl);

        // Remover após 4 segundos (erros ficam mais tempo)
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 4000);
    }

    deleteGroup(groupId) {
        if (
            confirm(
                'Tem certeza que deseja excluir este grupo mensal? Todas as vendas serão perdidas.'
            )
        ) {
            this.groups = this.groups.filter((g) => g.id !== groupId);
            this.saveData();
            this.renderGroups();
            this.updateMonthFilter();
            this.updateYearFilter();
            this.updateOverallSummary();
        }
    }

    renderGroups() {
        const list = document.getElementById('groupsList');
        if (!list) return;
        
        // Mostrar skeleton enquanto carrega (apenas se não houver dados ainda)
        if (this.groups.length === 0 && !list.querySelector('.group-card')) {
            this.showSkeleton('groupsList', 6, true);
            return;
        }

        // Obter filtro de ano
        const yearFilter = document.getElementById('yearFilter')?.value || '';

        // Filtrar grupos por ano se houver filtro
        let filteredGroups = this.groups;
        if (yearFilter) {
            filteredGroups = this.groups.filter((group) => {
                const [year] = group.month.split('-');
                return year === yearFilter;
            });
        }

        // Atualizar resumo geral de todos os meses
        const allMonthsTotal = this.calculateTotalAllMonths();
        const overallTotalSalesEl =
            document.getElementById('overallTotalSales');
        const overallTotalValueEl =
            document.getElementById('overallTotalValue');

        if (overallTotalSalesEl) {
            this.updateValueWithAnimation(
                'overallTotalSales',
                allMonthsTotal.totalSales
            );
        }
        if (overallTotalValueEl) {
            this.updateValueWithAnimation(
                'overallTotalValue',
                allMonthsTotal.totalValue,
                (val) => `R$ ${val.toFixed(2).replace('.', ',')}`
            );
        }

        // Atualizar resumo geral completo (sem estoque, pois agora está nos cards)
        const totalCosts = this.calculateTotalCosts();
        const netProfit = allMonthsTotal.totalValue - totalCosts;

        const overallTotalCostsEl =
            document.getElementById('overallTotalCosts');
        const overallNetProfitEl = document.getElementById('overallNetProfit');

        if (overallTotalCostsEl) {
            overallTotalCostsEl.textContent = `R$ ${totalCosts
                .toFixed(2)
                .replace('.', ',')}`;
        }

        if (overallNetProfitEl) {
            overallNetProfitEl.textContent = `R$ ${netProfit
                .toFixed(2)
                .replace('.', ',')}`;
            // Mudar cor se for negativo
            if (netProfit < 0) {
                overallNetProfitEl.style.color = '#dc3545';
            } else {
                overallNetProfitEl.style.color = '#155724';
            }
        }

        if (filteredGroups.length === 0) {
            list.innerHTML =
                `<div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <h3 class="empty-state-title">${yearFilter
                        ? `Nenhum grupo encontrado para ${yearFilter}`
                        : 'Nenhum grupo mensal criado ainda'}</h3>
                    <p class="empty-state-message">
                        ${yearFilter
                            ? 'Tente selecionar outro ano ou criar um novo grupo mensal.'
                            : 'Comece criando um grupo mensal para organizar suas vendas por mês.'}
                    </p>
                </div>`;
            return;
        }

        list.innerHTML = filteredGroups
            .map((group) => {
                const [year, month] = group.month.split('-');
                const monthNames = [
                    'Janeiro',
                    'Fevereiro',
                    'Março',
                    'Abril',
                    'Maio',
                    'Junho',
                    'Julho',
                    'Agosto',
                    'Setembro',
                    'Outubro',
                    'Novembro',
                    'Dezembro',
                ];
                const monthName = monthNames[parseInt(month) - 1];

                const totalSales = group.days.reduce(
                    (sum, day) =>
                        sum +
                        day.sales.reduce((s, sale) => s + sale.quantity, 0),
                    0
                );
                const totalValue = group.days.reduce(
                    (sum, day) =>
                        sum +
                        day.sales.reduce(
                            (s, sale) => s + this.getSaleTotalValue(sale),
                            0
                        ),
                    0
                );

                // Calcular estoque do grupo
                const itemStockStatus = {};
                group.days.forEach((day) => {
                    if (!day.stock) {
                        day.stock = {};
                    }
                    // Somar estoque total de cada item (pegar o maior estoque registrado)
                    Object.keys(day.stock).forEach((itemId) => {
                        if (!itemStockStatus[itemId]) {
                            itemStockStatus[itemId] = {
                                stock: 0,
                                sold: 0,
                            };
                        }
                        itemStockStatus[itemId].stock = Math.max(
                            itemStockStatus[itemId].stock,
                            day.stock[itemId] || 0
                        );
                    });
                    // Somar vendas
                    day.sales.forEach((sale) => {
                        if (!itemStockStatus[sale.itemId]) {
                            itemStockStatus[sale.itemId] = {
                                stock: 0,
                                sold: 0,
                            };
                        }
                        itemStockStatus[sale.itemId].sold += sale.quantity;
                    });
                });

                const totalStock = Object.values(itemStockStatus).reduce(
                    (sum, data) => sum + data.stock,
                    0
                );
                const totalStockSold = Object.values(itemStockStatus).reduce(
                    (sum, data) => sum + data.sold,
                    0
                );
                const totalStockAvailable = totalStock - totalStockSold;

                return `
                <div class="group-card">
                    <h3>${monthName} ${year}</h3>
                    <div class="group-info">
                        <div><strong>Total de Vendas:</strong> ${totalSales}</div>
                        <div><strong>Valor Total:</strong> R$ ${totalValue
                            .toFixed(2)
                            .replace('.', ',')}</div>
                        <div class="stock-section">
                            <div class="stock-total"><strong>Estoque Total:</strong> ${totalStock} un.</div>
                            <div class="stock-sold"><strong>Estoque Vendido:</strong> ${totalStockSold} un.</div>
                            <div class="stock-available ${
                                totalStockAvailable < 0
                                    ? 'danger'
                                    : totalStockAvailable === 0
                                    ? 'warning'
                                    : ''
                            }"><strong>Estoque Disponível:</strong> ${totalStockAvailable} un.</div>
                        </div>
                    </div>
                    <div class="group-actions">
                        <button class="btn-small btn-edit" onclick="app.viewGroup('${
                            group.id
                        }')">Ver Detalhes</button>
                        <button class="btn-small btn-delete" onclick="app.deleteGroup('${
                            group.id
                        }')" title="Excluir"><i class="fas fa-times"></i></button>
                    </div>
                </div>
            `;
            })
            .join('');
    }

    updateMonthFilter() {
        const select = document.getElementById('monthFilter');
        if (!select) return;

        const currentOptions = Array.from(select.options)
            .slice(1)
            .map((opt) => opt.value);

        this.groups.forEach((group) => {
            if (!currentOptions.includes(group.month)) {
                const [year, month] = group.month.split('-');
                const monthNames = [
                    'Janeiro',
                    'Fevereiro',
                    'Março',
                    'Abril',
                    'Maio',
                    'Junho',
                    'Julho',
                    'Agosto',
                    'Setembro',
                    'Outubro',
                    'Novembro',
                    'Dezembro',
                ];
                const option = document.createElement('option');
                option.value = group.month;
                option.textContent = `${
                    monthNames[parseInt(month) - 1]
                } ${year}`;
                select.appendChild(option);
            }
        });
    }

    updateYearFilter() {
        const select = document.getElementById('yearFilter');
        if (!select) return;

        // Obter todos os anos únicos dos grupos
        const years = new Set();
        this.groups.forEach((group) => {
            const [year] = group.month.split('-');
            years.add(year);
        });

        // Ordenar anos (mais recente primeiro)
        const sortedYears = Array.from(years).sort(
            (a, b) => parseInt(b) - parseInt(a)
        );

        // Limpar opções existentes (exceto "Todos os anos")
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Adicionar anos
        sortedYears.forEach((year) => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        });
    }

    updateGoalsYearFilter() {
        const select = document.getElementById('goalsYearFilter');
        if (!select) return;

        // Obter todos os anos únicos das metas
        const years = new Set();
        this.goals.forEach((goal) => {
            if (goal.month) {
                const [year] = goal.month.split('-');
                years.add(year);
            }
        });

        // Ordenar anos (mais recente primeiro)
        const sortedYears = Array.from(years).sort(
            (a, b) => parseInt(b) - parseInt(a)
        );

        // Limpar opções existentes (exceto "Todos os anos")
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Adicionar anos ao select
        sortedYears.forEach((year) => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        });
    }

    updateServicesYearFilter() {
        const select = document.getElementById('servicesYearFilter');
        if (!select) return;

        // Obter todos os anos únicos dos grupos de serviços
        const years = new Set();
        this.serviceGroups.forEach((serviceGroup) => {
            if (serviceGroup.month) {
                const [year] = serviceGroup.month.split('-');
                years.add(year);
            }
        });

        // Ordenar anos (mais recente primeiro)
        const sortedYears = Array.from(years).sort(
            (a, b) => parseInt(b) - parseInt(a)
        );

        // Limpar opções existentes (exceto "Todos os anos")
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Adicionar anos ao select
        sortedYears.forEach((year) => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        });
    }

    // ========== SERVIÇOS MENSAIS ==========

    openServiceGroupModal() {
        document.getElementById('serviceGroupModal').classList.add('active');
    }

    closeServiceGroupModal() {
        document.getElementById('serviceGroupModal').classList.remove('active');
        document.getElementById('serviceGroupForm').reset();
    }

    createServiceGroup(e) {
        e.preventDefault();
        const month = document.getElementById('serviceGroupMonth').value;

        if (this.serviceGroups.some((g) => g.month === month)) {
            alert('Já existe um grupo de serviços para este mês.');
            return;
        }

        const serviceGroup = {
            id: Date.now().toString(),
            month: month,
            days: [],
        };

        // Criar dias do mês
        const [year, monthNum] = month.split('-');
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayObj = {
                day: day,
                services: [], // Array de serviços registrados no dia
            };
            serviceGroup.days.push(dayObj);
        }

        this.serviceGroups.push(serviceGroup);
        this.serviceGroups.sort((a, b) => b.month.localeCompare(a.month));
        this.saveData();
        this.updateServicesYearFilter();
        this.renderServiceGroups();
        this.closeServiceGroupModal();
    }

    openServiceRecordModal(serviceGroupId, day) {
        const serviceGroup = this.serviceGroups.find(
            (g) => g.id === serviceGroupId
        );
        if (!serviceGroup) return;

        this.currentServiceGroup = serviceGroup;
        this.currentServiceDay = day;
        const dayData = serviceGroup.days.find((d) => d.day === day);

        // Popular select apenas com serviços
        const serviceItemSelect = document.getElementById('serviceRecordItem');
        const serviceItems = this.items.filter(
            (item) => item.category === 'Serviços'
        );

        serviceItemSelect.innerHTML =
            '<option value="">Selecione um serviço...</option>' +
            serviceItems
                .map((item) => {
                    return `<option value="${item.id}">${this.escapeHtml(
                        item.name
                    )}</option>`;
                })
                .join('');

        // Resetar formulário
        document.getElementById('serviceRecordForm').reset();

        // Atualizar exibição do dia
        const serviceDayDisplay = document.getElementById(
            'serviceRecordDayDisplay'
        );
        if (serviceDayDisplay) {
            serviceDayDisplay.textContent = day;
        }

        // Se houver serviços registrados, mostrar lista
        if (dayData && dayData.services.length > 0) {
            this.showDayServices(dayData);
        } else {
            const servicesList = document.getElementById('dayServicesList');
            if (servicesList) {
                servicesList.remove();
            }
        }

        // Verificar se o modal de visualização está aberto e adicionar classe para z-index maior
        const viewServiceGroupModal = document.getElementById(
            'viewServiceGroupModal'
        );
        const serviceRecordModal =
            document.getElementById('serviceRecordModal');

        if (
            viewServiceGroupModal &&
            viewServiceGroupModal.classList.contains('active')
        ) {
            serviceRecordModal.classList.add('modal-overlay');
        }

        serviceRecordModal.classList.add('active');
    }

    showDayServices(dayData) {
        const container = document.getElementById('serviceRecordModal');
        let servicesList = document.getElementById('dayServicesList');

        if (!servicesList) {
            servicesList = document.createElement('div');
            servicesList.id = 'dayServicesList';
            servicesList.style.cssText =
                'margin-bottom: 1.5rem; padding: 1rem; background: var(--light-gray); border-radius: 5px;';
            const form = document.getElementById('serviceRecordForm');
            form.insertBefore(servicesList, form.firstChild);
        }

        servicesList.innerHTML =
            '<h4 style="margin-bottom: 0.75rem;">Serviços Registrados:</h4>' +
            dayData.services
                .map((service, index) => {
                    const item = this.items.find(
                        (i) => i.id === service.itemId
                    );
                    const hours = service.hours || 0;
                    const minutes = service.minutes || 0;
                    const total = service.price || 0;

                    return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; margin-bottom: 0.5rem; border-radius: 5px; border: 1px solid var(--border-color);">
                        <div>
                            <strong>${this.escapeHtml(
                                this.getItemName(service.itemId)
                            )}</strong>
                            <div style="font-size: 0.85rem; color: var(--gray); margin-top: 0.25rem;">
                                ${hours}h ${minutes}min - R$ ${total
                        .toFixed(2)
                        .replace('.', ',')}
                            </div>
                        </div>
                        <button type="button" class="btn-small btn-delete" onclick="app.deleteServiceRecord(${
                            this.currentServiceDay
                        }, ${index})" title="Excluir">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                })
                .join('');
    }

    saveServiceRecord(e) {
        e.preventDefault();

        if (!this.currentServiceGroup || !this.currentServiceDay) return;

        const itemId = document.getElementById('serviceRecordItem').value;
        const hours =
            parseInt(document.getElementById('serviceRecordHours').value) || 0;
        const minutes =
            parseInt(document.getElementById('serviceRecordMinutes').value) ||
            0;
        const price = this.parsePrice(
            document.getElementById('serviceRecordPrice').value
        );

        if (!itemId) {
            alert('Por favor, selecione um serviço.');
            return;
        }

        if (price <= 0) {
            alert('O preço deve ser maior que zero.');
            return;
        }

        if (hours === 0 && minutes === 0) {
            alert('Por favor, informe pelo menos 1 minuto trabalhado.');
            return;
        }

        // Buscar o grupo atualizado
        const serviceGroup = this.serviceGroups.find(
            (g) => g.id === this.currentServiceGroup.id
        );
        if (!serviceGroup) return;

        const dayData = serviceGroup.days.find(
            (d) => d.day === this.currentServiceDay
        );
        if (!dayData) return;

        // Adicionar serviço
        dayData.services.push({
            itemId: itemId,
            hours: hours,
            minutes: minutes,
            price: price,
        });

        this.currentServiceGroup = serviceGroup;
        this.saveData();

        // Atualizar visualização
        const viewServiceGroupModal = document.getElementById(
            'viewServiceGroupModal'
        );
        if (
            viewServiceGroupModal &&
            viewServiceGroupModal.classList.contains('active')
        ) {
            this.renderServiceGroupView(serviceGroup);
        }

        // Atualizar lista de grupos
        const servicesTab = document.getElementById('servicesTab');
        if (servicesTab && servicesTab.classList.contains('active')) {
            this.renderServiceGroups();
        }

        // Atualizar resumo
        this.updateServiceSummary();

        // Reabrir modal
        this.openServiceRecordModal(serviceGroup.id, this.currentServiceDay);
    }

    deleteServiceRecord(day, serviceIndex) {
        if (!this.currentServiceGroup) return;

        const serviceGroup = this.serviceGroups.find(
            (g) => g.id === this.currentServiceGroup.id
        );
        if (!serviceGroup) return;

        const dayData = serviceGroup.days.find((d) => d.day === day);
        if (dayData && dayData.services[serviceIndex]) {
            if (confirm('Deseja excluir este registro de serviço?')) {
                dayData.services.splice(serviceIndex, 1);
                this.currentServiceGroup = serviceGroup;
                this.saveData();
                this.renderServiceGroupView(serviceGroup);

                const servicesTab = document.getElementById('servicesTab');
                if (servicesTab && servicesTab.classList.contains('active')) {
                    this.renderServiceGroups();
                }

                this.updateServiceSummary();
                this.openServiceRecordModal(serviceGroup.id, day);
            }
        }
    }

    closeServiceRecordModal() {
        const serviceRecordModal =
            document.getElementById('serviceRecordModal');
        if (serviceRecordModal) {
            serviceRecordModal.classList.remove('active');
            serviceRecordModal.classList.remove('modal-overlay');
        }
        this.currentServiceGroup = null;
        this.currentServiceDay = null;
    }

    viewServiceGroup(serviceGroupId) {
        const serviceGroup = this.serviceGroups.find(
            (g) => g.id === serviceGroupId
        );
        if (!serviceGroup) return;

        this.currentServiceGroup = serviceGroup;
        this.renderServiceGroupView(serviceGroup);
        document
            .getElementById('viewServiceGroupModal')
            .classList.add('active');
    }

    renderServiceGroupView(serviceGroup) {
        const [year, monthNum] = serviceGroup.month.split('-');
        const monthNames = [
            'Janeiro',
            'Fevereiro',
            'Março',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro',
        ];
        const monthName = monthNames[parseInt(monthNum) - 1];

        document.getElementById(
            'serviceGroupTitle'
        ).textContent = `Serviços - ${monthName}/${year}`;

        // Calcular totais do mês
        let totalHours = 0;
        let totalMinutes = 0;
        let totalRevenue = 0;

        serviceGroup.days.forEach((day) => {
            day.services.forEach((service) => {
                totalHours += service.hours || 0;
                totalMinutes += service.minutes || 0;
                totalRevenue += service.price || 0;
            });
        });

        // Converter minutos extras em horas
        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;

        document.getElementById(
            'serviceGroupTotalHours'
        ).textContent = `${totalHours}h ${totalMinutes}min`;
        document.getElementById(
            'serviceGroupTotalRevenue'
        ).textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;

        // Calcular totais de todos os meses
        let allHours = 0;
        let allMinutes = 0;
        let allRevenue = 0;

        this.serviceGroups.forEach((sg) => {
            sg.days.forEach((day) => {
                day.services.forEach((service) => {
                    allHours += service.hours || 0;
                    allMinutes += service.minutes || 0;
                    allRevenue += service.price || 0;
                });
            });
        });

        allHours += Math.floor(allMinutes / 60);
        allMinutes = allMinutes % 60;

        document.getElementById(
            'serviceGroupTotalHoursAll'
        ).textContent = `${allHours}h ${allMinutes}min`;
        document.getElementById(
            'serviceGroupTotalRevenueAll'
        ).textContent = `R$ ${allRevenue.toFixed(2).replace('.', ',')}`;

        // Renderizar dias
        const daysList = document.getElementById('serviceDaysList');
        daysList.innerHTML = serviceGroup.days
            .map((day) => {
                const dayServices = day.services.length;
                const dayTotal = day.services.reduce(
                    (sum, s) => sum + (s.price || 0),
                    0
                );
                let dayHours = 0;
                let dayMinutes = 0;
                day.services.forEach((s) => {
                    dayHours += s.hours || 0;
                    dayMinutes += s.minutes || 0;
                });
                dayHours += Math.floor(dayMinutes / 60);
                dayMinutes = dayMinutes % 60;

                return `
                <div class="day-card">
                    <div class="day-header">
                        <h4>Dia ${day.day}</h4>
                        <span class="day-badge">${dayServices} serviço(s)</span>
                    </div>
                    <div class="day-info">
                        <span>${dayHours}h ${dayMinutes}min</span>
                        <span>R$ ${dayTotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <button type="button" class="btn-small btn-primary" onclick="app.openServiceRecordModal('${
                        serviceGroup.id
                    }', ${day.day})">
                        ${dayServices > 0 ? 'Editar' : 'Registrar'}
                    </button>
                </div>
            `;
            })
            .join('');

        // Resumo por serviço
        const itemsSummary = {};
        serviceGroup.days.forEach((day) => {
            day.services.forEach((service) => {
                if (!itemsSummary[service.itemId]) {
                    itemsSummary[service.itemId] = {
                        name: this.getItemName(service.itemId),
                        hours: 0,
                        minutes: 0,
                        total: 0,
                    };
                }
                itemsSummary[service.itemId].hours += service.hours || 0;
                itemsSummary[service.itemId].minutes += service.minutes || 0;
                itemsSummary[service.itemId].total += service.price || 0;
            });
        });

        const itemsSummaryList = document.getElementById('serviceItemsSummary');
        itemsSummaryList.innerHTML =
            Object.entries(itemsSummary)
                .map(([itemId, data]) => {
                    const totalHours =
                        data.hours + Math.floor(data.minutes / 60);
                    const totalMinutes = data.minutes % 60;
                    return `
                    <div class="summary-item">
                        <div>
                            <strong>${this.escapeHtml(data.name)}</strong>
                            <div style="font-size: 0.85rem; color: var(--gray); margin-top: 0.25rem;">
                                ${totalHours}h ${totalMinutes}min - R$ ${data.total
                        .toFixed(2)
                        .replace('.', ',')}
                            </div>
                        </div>
                    </div>
                `;
                })
                .join('') ||
            '<p style="text-align: center; color: var(--gray); padding: 1rem;">Nenhum serviço registrado ainda.</p>';
    }

    closeViewServiceGroupModal() {
        document
            .getElementById('viewServiceGroupModal')
            .classList.remove('active');
        this.currentServiceGroup = null;
    }

    deleteServiceGroup(serviceGroupId) {
        if (
            confirm(
                'Tem certeza que deseja excluir este grupo de serviços? Todos os registros serão perdidos.'
            )
        ) {
            this.serviceGroups = this.serviceGroups.filter(
                (g) => g.id !== serviceGroupId
            );
            this.saveData();
            this.updateServicesYearFilter();
            this.renderServiceGroups();
            this.updateServiceSummary();
        }
    }

    renderServiceGroups() {
        const list = document.getElementById('servicesList');
        if (!list) return;

        // Obter filtro de ano
        const servicesYearFilterEl = document.getElementById('servicesYearFilter');
        const servicesYearFilter = servicesYearFilterEl
            ? servicesYearFilterEl.value
            : '';

        // Filtrar grupos de serviços por ano se houver filtro
        let filteredServiceGroups = this.serviceGroups;
        if (servicesYearFilter && servicesYearFilter !== '') {
            filteredServiceGroups = this.serviceGroups.filter((serviceGroup) => {
                if (!serviceGroup.month) return false;
                const [year] = serviceGroup.month.split('-');
                return year === servicesYearFilter;
            });
        }

        if (filteredServiceGroups.length === 0) {
            list.innerHTML =
                '<p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 2rem;">' +
                (servicesYearFilter
                    ? `Nenhum mês de serviços encontrado para o ano ${servicesYearFilter}.`
                    : 'Nenhum mês de serviços cadastrado ainda.') +
                '</p>';
            return;
        }

        list.innerHTML = filteredServiceGroups
            .map((serviceGroup) => {
                const [year, monthNum] = serviceGroup.month.split('-');
                const monthNames = [
                    'Janeiro',
                    'Fevereiro',
                    'Março',
                    'Abril',
                    'Maio',
                    'Junho',
                    'Julho',
                    'Agosto',
                    'Setembro',
                    'Outubro',
                    'Novembro',
                    'Dezembro',
                ];
                const monthName = monthNames[parseInt(monthNum) - 1];

                // Calcular totais do mês
                let totalHours = 0;
                let totalMinutes = 0;
                let totalRevenue = 0;
                let totalServices = 0;

                serviceGroup.days.forEach((day) => {
                    day.services.forEach((service) => {
                        totalHours += service.hours || 0;
                        totalMinutes += service.minutes || 0;
                        totalRevenue += service.price || 0;
                        totalServices++;
                    });
                });

                totalHours += Math.floor(totalMinutes / 60);
                totalMinutes = totalMinutes % 60;

                return `
                <div class="group-card">
                    <h3>${monthName}/${year}</h3>
                    <div class="group-info">
                        <div><strong>Total de Horas:</strong> ${totalHours}h ${totalMinutes}min</div>
                        <div><strong>Total Faturado:</strong> R$ ${totalRevenue
                            .toFixed(2)
                            .replace('.', ',')}</div>
                        <div><strong>Serviços Registrados:</strong> ${totalServices}</div>
                    </div>
                    <div class="group-actions">
                        <button class="btn-small btn-edit" onclick="app.viewServiceGroup('${
                            serviceGroup.id
                        }')">Ver Detalhes</button>
                        <button class="btn-small btn-delete" onclick="app.deleteServiceGroup('${
                            serviceGroup.id
                        }')" title="Excluir"><i class="fas fa-times"></i></button>
                    </div>
                </div>
            `;
            })
            .join('');
    }

    updateServiceSummary() {
        // Verificar se os elementos do resumo de serviços existem
        const totalHoursEl = document.getElementById('servicesTotalHours');
        if (!totalHoursEl) {
            // Seção de resumo não existe, não atualizar
            return;
        }

        // Calcular totais de todos os meses
        let totalHours = 0;
        let totalMinutes = 0;
        let totalRevenue = 0;
        let totalCount = 0;
        let totalHoursDecimal = 0; // Para cálculos precisos

        this.serviceGroups.forEach((serviceGroup) => {
            serviceGroup.days.forEach((day) => {
                day.services.forEach((service) => {
                    const hours = service.hours || 0;
                    const minutes = service.minutes || 0;
                    totalHours += hours;
                    totalMinutes += minutes;
                    totalRevenue += service.price || 0;
                    totalCount++;
                    // Calcular horas totais em decimal para cálculos precisos
                    totalHoursDecimal += hours + minutes / 60;
                });
            });
        });

        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;

        // Calcular média de horas por mês
        const monthCount = this.serviceGroups.length;
        let avgHours = 0;
        let avgMinutes = 0;
        if (monthCount > 0) {
            const totalMinutesAll = totalHours * 60 + totalMinutes;
            const avgMinutesAll = Math.floor(totalMinutesAll / monthCount);
            avgHours = Math.floor(avgMinutesAll / 60);
            avgMinutes = avgMinutesAll % 60;
        }

        // Calcular valor médio por hora
        let avgValuePerHour = 0;
        if (totalHoursDecimal > 0) {
            avgValuePerHour = totalRevenue / totalHoursDecimal;
        }

        // Calcular média de horas por serviço
        let avgHoursPerService = 0;
        let avgMinutesPerService = 0;
        if (totalCount > 0) {
            const totalMinutesAll = totalHours * 60 + totalMinutes;
            const avgMinutesPerServiceDecimal = totalMinutesAll / totalCount;
            avgHoursPerService = Math.floor(avgMinutesPerServiceDecimal / 60);
            avgMinutesPerService = Math.round(avgMinutesPerServiceDecimal % 60);
        }

        const avgHoursEl = document.getElementById('servicesAvgHours');
        const totalRevenueEl = document.getElementById('servicesTotalRevenue');
        const totalCountEl = document.getElementById('servicesTotalCount');
        const avgValuePerHourEl = document.getElementById(
            'servicesAvgValuePerHour'
        );
        const avgHoursPerServiceEl = document.getElementById(
            'servicesAvgHoursPerService'
        );

        if (totalHoursEl)
            totalHoursEl.textContent = `${totalHours}h ${totalMinutes}min`;
        if (avgHoursEl)
            avgHoursEl.textContent = `${avgHours}h ${avgMinutes}min`;
        if (totalRevenueEl)
            totalRevenueEl.textContent = `R$ ${totalRevenue
                .toFixed(2)
                .replace('.', ',')}`;
        if (totalCountEl) totalCountEl.textContent = totalCount;
        if (avgValuePerHourEl)
            avgValuePerHourEl.textContent = `R$ ${avgValuePerHour
                .toFixed(2)
                .replace('.', ',')}`;
        if (avgHoursPerServiceEl)
            avgHoursPerServiceEl.textContent = `${avgHoursPerService}h ${avgMinutesPerService}min`;

        // Atualizar gráfico de serviços
        this.updateServicesChart();
    }

    // ========== CUSTOS DE COMPRA ==========

    openCostModal(cost = null) {
        this.currentEditingCost = cost;
        const modal = document.getElementById('costModal');
        const form = document.getElementById('costForm');
        const title = document.getElementById('costModalTitle');

        // Popular select de itens
        const costItemSelect = document.getElementById('costItem');
        // Filtrar apenas produtos físicos (excluir serviços)
        const physicalItems = this.items.filter(
            (item) => item.category !== 'Serviços'
        );

        costItemSelect.innerHTML =
            '<option value="">Selecione um item...</option>' +
            physicalItems
                .map((item) => {
                    const category = item.category || 'Roupas';
                    if (category === 'Eletrônicos') {
                        const displayName = item.model || item.name;
                        return `<option value="${item.id}">${this.escapeHtml(
                            displayName
                        )}</option>`;
                    } else {
                        // Para roupas, se não tiver nome, usar marca + estilo ou apenas marca
                        let displayName;
                        if (item.name) {
                            displayName = `${item.name} - ${item.brand || ''}`;
                        } else {
                            const parts = [item.brand || ''];
                            if (item.style) parts.push(item.style);
                            displayName =
                                parts.filter((p) => p).join(' - ') || 'Roupa';
                        }
                        return `<option value="${item.id}">${this.escapeHtml(
                            displayName
                        )}</option>`;
                    }
                })
                .join('');

        // Popular select de fornecedores
        const costSupplier = document.getElementById('costSupplier');
        if (costSupplier) {
            costSupplier.innerHTML = '<option value="">Selecione um fornecedor ou deixe em branco...</option>' +
                this.suppliers.map(supplier => 
                    `<option value="${supplier.id}">${this.escapeHtml(supplier.name)}</option>`
                ).join('');
        }

        if (cost) {
            title.textContent = 'Editar Custo';
            document.getElementById('costItem').value = cost.itemId;
            document.getElementById('costDate').value = cost.date;
            document.getElementById('costQuantity').value = cost.quantity;
            document.getElementById('costPrice').value = cost.price;
            if (costSupplier && cost.supplierId) {
                costSupplier.value = cost.supplierId;
            }
            this.calculateCostTotal();
        } else {
            title.textContent = 'Cadastrar Novo Custo';
            form.reset();
            document.getElementById('costDate').value = new Date()
                .toISOString()
                .split('T')[0];
        }

        modal.classList.add('active');
    }

    closeCostModal() {
        document.getElementById('costModal').classList.remove('active');
        this.currentEditingCost = null;
    }

    calculateCostTotal() {
        const quantity =
            parseFloat(document.getElementById('costQuantity').value) || 0;
        const price = this.parsePrice(
            document.getElementById('costPrice').value
        );
        const total = quantity * price;
        document.getElementById('costTotal').value = total.toFixed(2);
    }

    saveCost(e) {
        e.preventDefault();

        const itemId = document.getElementById('costItem').value;
        const date = document.getElementById('costDate').value;
        const quantity = parseInt(
            document.getElementById('costQuantity').value
        );
        const price = this.parsePrice(
            document.getElementById('costPrice').value
        );

        if (!itemId) {
            alert('Por favor, selecione um item.');
            return;
        }

        if (price <= 0 || quantity <= 0) {
            alert('Preço e quantidade devem ser maiores que zero.');
            return;
        }

        const supplierId = document.getElementById('costSupplier')?.value || null;
        
        const cost = {
            id: this.currentEditingCost
                ? this.currentEditingCost.id
                : Date.now().toString(),
            itemId: itemId,
            supplierId: supplierId,
            date: date,
            quantity: quantity,
            price: price,
            total: quantity * price,
        };

        if (this.currentEditingCost) {
            const index = this.costs.findIndex(
                (c) => c.id === this.currentEditingCost.id
            );
            if (index !== -1) {
                this.costs[index] = cost;
            }
        } else {
            this.costs.push(cost);
        }

        this.saveData();
        this.renderCosts();
        this.updateOverallSummary();
        this.closeCostModal();
    }

    deleteCost(costId) {
        if (confirm('Tem certeza que deseja excluir este custo?')) {
            this.costs = this.costs.filter((c) => c.id !== costId);
            this.saveData();
            this.renderCosts();
            this.updateOverallSummary();
        }
    }

    renderCosts() {
        const list = document.getElementById('costsList');
        // Se a seção de custos foi removida, não renderizar
        if (!list) return;
        
        // Mostrar skeleton enquanto carrega (apenas se não houver dados ainda)
        if (this.costs.length === 0 && !list.querySelector('.cost-card')) {
            this.showSkeleton('costsList', 4, true);
            return;
        }
        
        const countEl = document.getElementById('totalCostsCount');
        const valueEl = document.getElementById('totalCostsValue');

        // Calcular totais
        const totalCosts = this.costs.length;
        const totalValue = this.costs.reduce(
            (sum, cost) => sum + cost.total,
            0
        );

        if (countEl) {
            countEl.textContent = totalCosts;
        }
        if (valueEl) {
            valueEl.textContent = `R$ ${totalValue
                .toFixed(2)
                .replace('.', ',')}`;
        }

        // Atualizar gráfico de custos
        this.updateCostsChart();

        if (this.costs.length === 0) {
            list.innerHTML =
                `<div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <h3 class="empty-state-title">Nenhum custo cadastrado ainda</h3>
                    <p class="empty-state-message">
                        Comece registrando seus custos para ter um controle financeiro completo.
                    </p>
                    <div class="empty-state-action">
                        <button class="btn-primary" onclick="app.openCostModal()">
                            <i class="fas fa-plus"></i> Adicionar Primeiro Custo
                        </button>
                    </div>
                </div>`;
            return;
        }

        // Ordenar por data (mais recente primeiro)
        const sortedCosts = [...this.costs].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );

        list.innerHTML = sortedCosts
            .map((cost) => {
                const item = this.items.find((i) => i.id === cost.itemId);
                const dateObj = new Date(cost.date);
                const formattedDate = dateObj.toLocaleDateString('pt-BR');

                return `
                <div class="cost-card">
                    <h3>${this.escapeHtml(
                        item ? item.name : 'Item não encontrado'
                    )}</h3>
                    <div class="cost-info"><strong>Data:</strong> ${formattedDate}</div>
                    <div class="cost-info"><strong>Quantidade:</strong> ${
                        cost.quantity
                    } un.</div>
                    <div class="cost-info"><strong>Custo Unitário:</strong> R$ ${cost.price
                        .toFixed(2)
                        .replace('.', ',')}</div>
                    <div class="cost-total">Total: R$ ${cost.total
                        .toFixed(2)
                        .replace('.', ',')}</div>
                    <div class="cost-actions">
                        <button class="btn-small btn-edit" onclick="app.openCostModal(${JSON.stringify(
                            cost
                        ).replace(/"/g, '&quot;')})">Editar</button>
                        <button class="btn-small btn-delete" onclick="app.deleteCost('${
                            cost.id
                        }')" title="Excluir"><i class="fas fa-times"></i></button>
                    </div>
                </div>
            `;
            })
            .join('');
    }

    // ========== GERENCIAMENTO DE METAS ==========

    openGoalModal(goal = null) {
        this.currentEditingGoal = goal;
        const modal = document.getElementById('goalModal');
        const form = document.getElementById('goalForm');
        const title = document.getElementById('goalModalTitle');

        if (goal) {
            title.textContent = 'Editar Meta';
            document.getElementById('goalMonth').value = goal.month;
            document.getElementById('goalAmount').value = goal.amount;
            document.getElementById('goalDescription').value =
                goal.description || '';
        } else {
            title.textContent = 'Criar Nova Meta';
            // Definir mês atual como padrão
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(
                now.getMonth() + 1
            ).padStart(2, '0')}`;
            document.getElementById('goalMonth').value = currentMonth;
            form.reset();
            document.getElementById('goalMonth').value = currentMonth;
        }

        modal.classList.add('active');
    }

    closeGoalModal() {
        document.getElementById('goalModal').classList.remove('active');
        document.getElementById('goalForm').reset();
        this.currentEditingGoal = null;
    }

    saveGoal(e) {
        e.preventDefault();

        const month = document.getElementById('goalMonth').value;
        const amount = this.parsePrice(
            document.getElementById('goalAmount').value
        );
        const description = document
            .getElementById('goalDescription')
            .value.trim();

        if (amount <= 0) {
            alert('O valor da meta deve ser maior que zero.');
            return;
        }

        const goal = {
            id: this.currentEditingGoal
                ? this.currentEditingGoal.id
                : Date.now().toString(),
            month: month,
            amount: amount,
            description: description,
            createdAt: this.currentEditingGoal
                ? this.currentEditingGoal.createdAt
                : new Date().toISOString(),
        };

        if (this.currentEditingGoal) {
            const index = this.goals.findIndex(
                (g) => g.id === this.currentEditingGoal.id
            );
            if (index !== -1) {
                this.goals[index] = goal;
            }
        } else {
            // Verificar se já existe meta para este mês
            const existingGoal = this.goals.find((g) => g.month === month);
            if (existingGoal) {
                if (
                    !confirm(
                        'Já existe uma meta para este mês. Deseja substituí-la?'
                    )
                ) {
                    return;
                }
                this.goals = this.goals.filter((g) => g.month !== month);
            }
            this.goals.push(goal);
        }

        this.saveData();
        this.renderGoals();
        this.updateGoalsYearFilter();
        this.closeGoalModal();
    }

    deleteGoal(goalId) {
        if (confirm('Tem certeza que deseja excluir esta meta?')) {
            this.goals = this.goals.filter((g) => g.id !== goalId);
            this.saveData();
            this.renderGoals();
            this.updateGoalsYearFilter();
        }
    }

    getMonthSales(month) {
        const group = this.groups.find((g) => g.month === month);
        if (!group) return 0;

        let total = 0;
        group.days.forEach((day) => {
            day.sales.forEach((sale) => {
                total += this.getSaleTotalValue(sale);
            });
        });
        return total;
    }

    renderGoals() {
        const list = document.getElementById('goalsList');
        if (!list) return;
        
        // Mostrar skeleton enquanto carrega (apenas se não houver dados ainda)
        if (this.goals.length === 0 && !list.querySelector('.goal-card')) {
            this.showSkeleton('goalsList', 4, true);
            return;
        }
        
        const currentMonthGoalEl = document.getElementById('currentMonthGoal');
        const currentMonthSalesEl =
            document.getElementById('currentMonthSales');
        const goalProgressEl = document.getElementById('goalProgress');
        const goalStatusEl = document.getElementById('goalStatus');
        const goalProgressItem = document.getElementById('goalProgressItem');
        const goalStatusItem = document.getElementById('goalStatusItem');

        // Obter filtro de ano
        const goalsYearFilterEl = document.getElementById('goalsYearFilter');
        const goalsYearFilter = goalsYearFilterEl
            ? goalsYearFilterEl.value
            : '';

        // Filtrar metas por ano se houver filtro
        let filteredGoals = this.goals;
        if (goalsYearFilter && goalsYearFilter !== '') {
            filteredGoals = this.goals.filter((goal) => {
                if (!goal.month) return false;
                const [year] = goal.month.split('-');
                return year === goalsYearFilter;
            });
        }

        // Calcular meta e vendas do mês atual
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, '0')}`;
        const currentGoal = this.goals.find((g) => g.month === currentMonth);
        const currentSales = this.getMonthSales(currentMonth);

        if (currentGoal) {
            const progress = (currentSales / currentGoal.amount) * 100;
            const remaining = currentGoal.amount - currentSales;

            if (currentMonthGoalEl) {
                currentMonthGoalEl.textContent = `R$ ${currentGoal.amount
                    .toFixed(2)
                    .replace('.', ',')}`;
            }
            if (currentMonthSalesEl) {
                currentMonthSalesEl.textContent = `R$ ${currentSales
                    .toFixed(2)
                    .replace('.', ',')}`;
            }
            if (goalProgressEl) {
                goalProgressEl.textContent = `${Math.min(progress, 100).toFixed(
                    1
                )}%`;
            }
            if (goalStatusEl) {
                if (progress >= 100) {
                    goalStatusEl.textContent = '✅ Meta Atingida!';
                    goalStatusEl.style.color = '#28a745';
                    if (goalProgressItem) {
                        goalProgressItem
                            .querySelector('.goal-progress-fill')
                            ?.classList.add('success');
                    }
                } else if (progress >= 75) {
                    goalStatusEl.textContent = '🟡 Quase lá!';
                    goalStatusEl.style.color = '#ffc107';
                } else {
                    goalStatusEl.textContent = `Faltam R$ ${remaining
                        .toFixed(2)
                        .replace('.', ',')}`;
                    goalStatusEl.style.color = '#dc3545';
                }
            }
        } else {
            if (currentMonthGoalEl) currentMonthGoalEl.textContent = 'R$ 0,00';
            if (currentMonthSalesEl)
                currentMonthSalesEl.textContent = `R$ ${currentSales
                    .toFixed(2)
                    .replace('.', ',')}`;
            if (goalProgressEl) goalProgressEl.textContent = '-';
            if (goalStatusEl) {
                goalStatusEl.textContent = 'Sem meta definida';
                goalStatusEl.style.color = '#6c757d';
            }
        }

        if (filteredGoals.length === 0) {
            list.innerHTML =
                `<div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">
                        <i class="fas fa-bullseye"></i>
                    </div>
                    <h3 class="empty-state-title">${goalsYearFilter
                        ? `Nenhuma meta encontrada para ${goalsYearFilter}`
                        : 'Nenhuma meta cadastrada ainda'}</h3>
                    <p class="empty-state-message">
                        ${goalsYearFilter
                            ? 'Tente selecionar outro ano ou criar uma nova meta.'
                            : 'Comece definindo suas metas financeiras para acompanhar o desempenho do negócio.'}
                    </p>
                    ${!goalsYearFilter ? `
                        <div class="empty-state-action">
                            <button class="btn-primary" onclick="app.openGoalModal()">
                                <i class="fas fa-bullseye"></i> Criar Primeira Meta
                            </button>
                        </div>
                    ` : ''}
                </div>`;
                '</p>';
            return;
        }

        // Verificar e exibir alertas de metas próximas
        this.checkGoalsAlerts();

        // Ordenar por mês (mais recente primeiro)
        const sortedGoals = [...filteredGoals].sort((a, b) =>
            b.month.localeCompare(a.month)
        );

        list.innerHTML = sortedGoals
            .map((goal) => {
                const [year, month] = goal.month.split('-');
                const monthNames = [
                    'Janeiro',
                    'Fevereiro',
                    'Março',
                    'Abril',
                    'Maio',
                    'Junho',
                    'Julho',
                    'Agosto',
                    'Setembro',
                    'Outubro',
                    'Novembro',
                    'Dezembro',
                ];
                const monthName = monthNames[parseInt(month) - 1];
                const sales = this.getMonthSales(goal.month);
                const progress = (sales / goal.amount) * 100;
                const progressClass =
                    progress >= 100
                        ? 'success'
                        : progress >= 75
                        ? 'warning'
                        : 'danger';
                
                // Verificar se está próximo de atingir (75-95%)
                const isNearGoal = progress >= 75 && progress < 100;
                const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
                const now = new Date();
                const isCurrentMonth = goal.month === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                const daysRemaining = isCurrentMonth ? daysInMonth - now.getDate() : null;
                const isNearEndOfMonth = isCurrentMonth && daysRemaining !== null && daysRemaining <= 7;

                return `
                <div class="goal-card" ${isNearGoal || isNearEndOfMonth ? 'style="border: 2px solid #ffc107;"' : ''}>
                    ${isNearGoal ? `
                        <div style="padding: 0.75rem; background: #fff3cd; border: 2px solid #ffc107; border-radius: var(--radius-sm); margin-bottom: 1rem;">
                            <p style="margin: 0; color: #856404; font-weight: 600;">
                                <i class="fas fa-bullseye"></i> Meta quase atingida! ${progress.toFixed(1)}% concluído
                            </p>
                        </div>
                    ` : ''}
                    ${isNearEndOfMonth && progress < 100 ? `
                        <div style="padding: 0.75rem; background: #fff3cd; border: 2px solid #ffc107; border-radius: var(--radius-sm); margin-bottom: 1rem;">
                            <p style="margin: 0; color: #856404; font-weight: 600;">
                                <i class="fas fa-clock"></i> Faltam ${daysRemaining} dia(s) para o fim do mês! Progresso: ${progress.toFixed(1)}%
                            </p>
                        </div>
                    ` : ''}
                    <h3>${monthName}/${year}</h3>
                    ${
                        goal.description
                            ? `<div class="goal-info"><strong>Descrição:</strong> ${this.escapeHtml(
                                  goal.description
                              )}</div>`
                            : ''
                    }
                    <div class="goal-info"><strong>Meta:</strong> R$ ${goal.amount
                        .toFixed(2)
                        .replace('.', ',')}</div>
                    <div class="goal-info"><strong>Vendas:</strong> R$ ${sales
                        .toFixed(2)
                        .replace('.', ',')}</div>
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill ${progressClass}" style="width: ${Math.min(
                    progress,
                    100
                )}%">
                            ${Math.min(progress, 100).toFixed(1)}%
                        </div>
                    </div>
                    <div class="goal-actions">
                        <button class="btn-small btn-edit" onclick="app.openGoalModal(${JSON.stringify(
                            goal
                        ).replace(/"/g, '&quot;')})">Editar</button>
                        <button class="btn-small btn-delete" onclick="app.deleteGoal('${
                            goal.id
                        }')" title="Excluir"><i class="fas fa-times"></i></button>
                    </div>
                </div>
            `;
            })
            .join('');

        // Atualizar gráfico de metas
        this.updateGoalsChart();
    }

    // Atualizar gráfico de metas
    updateGoalsChart() {
        const canvas = document.getElementById('goalsChart');
        if (!canvas) return;

        // Verificar se Chart.js está disponível
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js não está disponível ainda');
            return;
        }

        // Obter filtro de ano
        const goalsYearFilterEl = document.getElementById('goalsYearFilter');
        const goalsYearFilter = goalsYearFilterEl
            ? goalsYearFilterEl.value
            : '';

        // Filtrar metas por ano se houver filtro
        let filteredGoals = this.goals;
        if (goalsYearFilter && goalsYearFilter !== '') {
            filteredGoals = this.goals.filter((goal) => {
                if (!goal.month) return false;
                const [year] = goal.month.split('-');
                return year === goalsYearFilter;
            });
        }

        // Se houver filtro de ano, usar apenas os meses desse ano
        // Caso contrário, usar últimos 6 meses
        const months = [];
        const goalsData = [];
        const salesData = [];
        const monthNames = [
            'Jan',
            'Fev',
            'Mar',
            'Abr',
            'Mai',
            'Jun',
            'Jul',
            'Ago',
            'Set',
            'Out',
            'Nov',
            'Dez',
        ];

        if (goalsYearFilter && goalsYearFilter !== '') {
            // Se há filtro de ano, mostrar todos os meses desse ano que têm metas
            const year = parseInt(goalsYearFilter);
            for (let month = 1; month <= 12; month++) {
                const monthKey = `${year}-${String(month).padStart(2, '0')}`;
                const goal = filteredGoals.find((g) => g.month === monthKey);
                const sales = this.getMonthSales(monthKey);
                
                months.push(`${monthNames[month - 1]}/${String(year).slice(-2)}`);
                goalsData.push(goal ? goal.amount : 0);
                salesData.push(sales);
            }
        } else {
            // Sem filtro, usar últimos 6 meses
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, '0')}`;

                months.push(
                    `${monthNames[date.getMonth()]}/${String(
                        date.getFullYear()
                    ).slice(-2)}`
                );

                const goal = this.goals.find((g) => g.month === monthKey);
                const sales = this.getMonthSales(monthKey);

                goalsData.push(goal ? goal.amount : 0);
                salesData.push(sales);
            }
        }

        // Destruir gráfico anterior se existir
        if (this.goalsChart) {
            this.goalsChart.destroy();
        }

        // Obter cor primária do tema
        const primaryColor =
            getComputedStyle(document.documentElement).getPropertyValue(
                '--primary-color'
            ) || '#dc3545';

        // Criar novo gráfico
        this.goalsChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Meta',
                        data: goalsData,
                        backgroundColor: primaryColor
                            .replace('rgb', 'rgba')
                            .replace(')', ', 0.6)'),
                        borderColor: primaryColor,
                        borderWidth: 2,
                    },
                    {
                        label: 'Vendas',
                        data: salesData,
                        backgroundColor: '#28a745',
                        borderColor: '#28a745',
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 14,
                                weight: 'bold',
                            },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                        },
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold',
                        },
                        bodyFont: {
                            size: 13,
                            weight: '600',
                        },
                        callbacks: {
                            label: function (context) {
                                return (
                                    context.dataset.label +
                                    ': R$ ' +
                                    context.parsed.y
                                        .toFixed(2)
                                        .replace('.', ',')
                                );
                            },
                        },
                    },
                },
                elements: {
                    bar: {
                        borderWidth: 3,
                        borderRadius: 4,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return 'R$ ' + value.toFixed(0);
                            },
                            font: {
                                size: 12,
                                weight: '600',
                            },
                            color: 'rgba(0, 0, 0, 0.8)',
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.08)',
                            lineWidth: 1,
                        },
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 12,
                                weight: '600',
                            },
                            color: 'rgba(0, 0, 0, 0.8)',
                        },
                        grid: {
                            display: false,
                        },
                    },
                },
            },
        });
    }

    // Atualizar gráfico de custos
    updateCostsChart() {
        const canvas = document.getElementById('costsChart');
        if (!canvas) return;

        // Verificar se Chart.js está disponível
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js não está disponível ainda');
            return;
        }

        // Agrupar custos por mês
        const costsByMonth = {};
        this.costs.forEach((cost) => {
            const date = new Date(cost.date);
            const monthKey = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, '0')}`;

            if (!costsByMonth[monthKey]) {
                costsByMonth[monthKey] = {
                    total: 0,
                    count: 0,
                };
            }
            costsByMonth[monthKey].total += cost.total || 0;
            costsByMonth[monthKey].count += 1;
        });

        // Obter últimos 6 meses
        const now = new Date();
        const months = [];
        const costsData = [];
        const countsData = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, '0')}`;
            const monthNames = [
                'Jan',
                'Fev',
                'Mar',
                'Abr',
                'Mai',
                'Jun',
                'Jul',
                'Ago',
                'Set',
                'Out',
                'Nov',
                'Dez',
            ];

            months.push(
                `${monthNames[date.getMonth()]}/${String(
                    date.getFullYear()
                ).slice(-2)}`
            );

            const monthData = costsByMonth[monthKey] || { total: 0, count: 0 };
            costsData.push(monthData.total);
            countsData.push(monthData.count);
        }

        // Destruir gráfico anterior se existir
        if (this.costsChart) {
            this.costsChart.destroy();
        }

        // Obter cor primária do tema
        const primaryColor =
            getComputedStyle(document.documentElement).getPropertyValue(
                '--primary-color'
            ) || '#dc3545';

        // Criar novo gráfico
        this.costsChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Valor Total',
                        data: costsData,
                        backgroundColor: primaryColor
                            .replace('rgb', 'rgba')
                            .replace(')', ', 0.6)'),
                        borderColor: primaryColor,
                        borderWidth: 2,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Quantidade de Compras',
                        data: countsData,
                        backgroundColor: '#ffc107',
                        borderColor: '#ffc107',
                        borderWidth: 2,
                        yAxisID: 'y1',
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 14,
                                weight: 'bold',
                            },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                        },
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold',
                        },
                        bodyFont: {
                            size: 13,
                            weight: '600',
                        },
                        callbacks: {
                            label: function (context) {
                                if (context.datasetIndex === 0) {
                                    return (
                                        context.dataset.label +
                                        ': R$ ' +
                                        context.parsed.y
                                            .toFixed(2)
                                            .replace('.', ',')
                                    );
                                } else {
                                    return (
                                        context.dataset.label +
                                        ': ' +
                                        context.parsed.y +
                                        ' compras'
                                    );
                                }
                            },
                        },
                    },
                },
                elements: {
                    bar: {
                        borderWidth: 3,
                        borderRadius: 4,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        position: 'left',
                        ticks: {
                            callback: function (value) {
                                return 'R$ ' + value.toFixed(0);
                            },
                            font: {
                                size: 12,
                                weight: '600',
                            },
                            color: 'rgba(0, 0, 0, 0.8)',
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.08)',
                            lineWidth: 1,
                        },
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        ticks: {
                            font: {
                                size: 12,
                                weight: '600',
                            },
                            color: 'rgba(0, 0, 0, 0.8)',
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 12,
                                weight: '600',
                            },
                            color: 'rgba(0, 0, 0, 0.8)',
                        },
                        grid: {
                            display: false,
                        },
                    },
                },
            },
        });
    }

    // Atualizar gráfico de serviços
    updateServicesChart() {
        const canvas = document.getElementById('servicesChart');
        if (!canvas) return;

        // Verificar se Chart.js está disponível
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js não está disponível ainda');
            return;
        }

        // Obter filtro de ano
        const servicesYearFilterEl = document.getElementById('servicesYearFilter');
        const servicesYearFilter = servicesYearFilterEl
            ? servicesYearFilterEl.value
            : '';

        // Filtrar grupos de serviços por ano se houver filtro
        let filteredServiceGroups = this.serviceGroups;
        if (servicesYearFilter && servicesYearFilter !== '') {
            filteredServiceGroups = this.serviceGroups.filter((serviceGroup) => {
                if (!serviceGroup.month) return false;
                const [year] = serviceGroup.month.split('-');
                return year === servicesYearFilter;
            });
        }

        // Agrupar serviços por mês
        const servicesByMonth = {};
        filteredServiceGroups.forEach((serviceGroup) => {
            const monthKey = serviceGroup.month;
            if (!servicesByMonth[monthKey]) {
                servicesByMonth[monthKey] = {
                    revenue: 0,
                    hours: 0,
                    minutes: 0,
                    count: 0,
                };
            }

            serviceGroup.days.forEach((day) => {
                day.services.forEach((service) => {
                    servicesByMonth[monthKey].revenue += service.price || 0;
                    servicesByMonth[monthKey].hours += service.hours || 0;
                    servicesByMonth[monthKey].minutes += service.minutes || 0;
                    servicesByMonth[monthKey].count += 1;
                });
            });
        });

        const months = [];
        const revenueData = [];
        const hoursData = [];
        const monthNames = [
            'Jan',
            'Fev',
            'Mar',
            'Abr',
            'Mai',
            'Jun',
            'Jul',
            'Ago',
            'Set',
            'Out',
            'Nov',
            'Dez',
        ];

        if (servicesYearFilter && servicesYearFilter !== '') {
            // Se há filtro de ano, mostrar todos os meses desse ano
            const year = parseInt(servicesYearFilter);
            for (let month = 1; month <= 12; month++) {
                const monthKey = `${year}-${String(month).padStart(2, '0')}`;
                const monthData = servicesByMonth[monthKey] || {
                    revenue: 0,
                    hours: 0,
                    minutes: 0,
                    count: 0,
                };
                
                months.push(`${monthNames[month - 1]}/${String(year).slice(-2)}`);
                revenueData.push(monthData.revenue);
                const totalHours = monthData.hours + monthData.minutes / 60;
                hoursData.push(totalHours);
            }
        } else {
            // Sem filtro, usar últimos 6 meses
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, '0')}`;

                months.push(
                    `${monthNames[date.getMonth()]}/${String(
                        date.getFullYear()
                    ).slice(-2)}`
                );

                const monthData = servicesByMonth[monthKey] || {
                    revenue: 0,
                    hours: 0,
                    minutes: 0,
                    count: 0,
                };
                revenueData.push(monthData.revenue);
                const totalHours = monthData.hours + monthData.minutes / 60;
                hoursData.push(totalHours);
            }
        }

        // Destruir gráfico anterior se existir
        if (this.servicesChart) {
            this.servicesChart.destroy();
        }

        // Obter cor primária do tema
        const primaryColor =
            getComputedStyle(document.documentElement).getPropertyValue(
                '--primary-color'
            ) || '#dc3545';

        // Criar novo gráfico
        this.servicesChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Faturamento',
                        data: revenueData,
                        backgroundColor: '#28a745',
                        borderColor: '#28a745',
                        borderWidth: 2,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Horas Trabalhadas',
                        data: hoursData,
                        backgroundColor: primaryColor
                            .replace('rgb', 'rgba')
                            .replace(')', ', 0.6)'),
                        borderColor: primaryColor,
                        borderWidth: 2,
                        yAxisID: 'y1',
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 14,
                                weight: 'bold',
                            },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                        },
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold',
                        },
                        bodyFont: {
                            size: 13,
                            weight: '600',
                        },
                        callbacks: {
                            label: function (context) {
                                if (context.datasetIndex === 0) {
                                    return (
                                        context.dataset.label +
                                        ': R$ ' +
                                        context.parsed.y
                                            .toFixed(2)
                                            .replace('.', ',')
                                    );
                                } else {
                                    return (
                                        context.dataset.label +
                                        ': ' +
                                        context.parsed.y.toFixed(1) +
                                        'h'
                                    );
                                }
                            },
                        },
                    },
                },
                elements: {
                    bar: {
                        borderWidth: 3,
                        borderRadius: 4,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        position: 'left',
                        ticks: {
                            callback: function (value) {
                                return 'R$ ' + value.toFixed(0);
                            },
                            font: {
                                size: 12,
                                weight: '600',
                            },
                            color: 'rgba(0, 0, 0, 0.8)',
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.08)',
                            lineWidth: 1,
                        },
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        ticks: {
                            callback: function (value) {
                                return value.toFixed(1) + 'h';
                            },
                            font: {
                                size: 12,
                                weight: '600',
                            },
                            color: 'rgba(0, 0, 0, 0.8)',
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 12,
                                weight: '600',
                            },
                            color: 'rgba(0, 0, 0, 0.8)',
                        },
                        grid: {
                            display: false,
                        },
                    },
                },
            },
        });
    }

    calculateTotalCosts() {
        return this.costs.reduce((sum, cost) => sum + cost.total, 0);
    }

    updateOverallSummary() {
        const allMonthsTotal = this.calculateTotalAllMonths();
        const totalCosts = this.calculateTotalCosts();
        const netProfit = allMonthsTotal.totalValue - totalCosts;

        const overallTotalCostsEl =
            document.getElementById('overallTotalCosts');
        const overallNetProfitEl = document.getElementById('overallNetProfit');

        if (overallTotalCostsEl) {
            overallTotalCostsEl.textContent = `R$ ${totalCosts
                .toFixed(2)
                .replace('.', ',')}`;
        }

        if (overallNetProfitEl) {
            overallNetProfitEl.textContent = `R$ ${netProfit
                .toFixed(2)
                .replace('.', ',')}`;
            // Mudar cor se for negativo
            if (netProfit < 0) {
                overallNetProfitEl.style.color = '#dc3545';
            } else {
                overallNetProfitEl.style.color = '#155724';
            }
        }

        // Atualizar gráfico de média de estoque e sugestões de reposição
        this.updateAvgStockChart();
        this.updateRestockSuggestions();
    }

    // Função auxiliar para gerar SKU único (itemId + size)
    getSKU(itemId, size = '') {
        return size ? `${itemId}_${size}` : itemId;
    }

    // Calcular média de estoque por mês
    calculateAvgStockByMonth() {
        const stockByMonth = {};

        this.groups.forEach((group) => {
            const monthKey = group.month;
            if (!stockByMonth[monthKey]) {
                stockByMonth[monthKey] = {};
            }

            // Calcular estoque médio por SKU no mês
            const skuStock = {};
            group.days.forEach((day) => {
                if (!day.stock) day.stock = {};
                if (!day.sales) day.sales = [];

                // Processar estoque por SKU (itemId + size)
                Object.keys(day.stock).forEach((itemId) => {
                    const item = this.items.find((i) => i.id === itemId);
                    if (item && item.category === 'Roupas' && item.size) {
                        const sku = this.getSKU(itemId, item.size);
                        if (!skuStock[sku]) {
                            skuStock[sku] = {
                                itemId: itemId,
                                size: item.size,
                                stockValues: [],
                                sold: 0,
                            };
                        }
                        skuStock[sku].stockValues.push(day.stock[itemId] || 0);
                    } else {
                        // Para itens sem tamanho ou não-roupas, usar apenas itemId
                        const sku = this.getSKU(itemId);
                        if (!skuStock[sku]) {
                            skuStock[sku] = {
                                itemId: itemId,
                                size: '',
                                stockValues: [],
                                sold: 0,
                            };
                        }
                        skuStock[sku].stockValues.push(day.stock[itemId] || 0);
                    }
                });

                // Processar vendas por SKU
                day.sales.forEach((sale) => {
                    const item = this.items.find((i) => i.id === sale.itemId);
                    if (item && item.category === 'Roupas' && item.size) {
                        const sku = this.getSKU(sale.itemId, item.size);
                        if (skuStock[sku]) {
                            skuStock[sku].sold += sale.quantity;
                        }
                    } else {
                        const sku = this.getSKU(sale.itemId);
                        if (skuStock[sku]) {
                            skuStock[sku].sold += sale.quantity;
                        }
                    }
                });
            });

            // Calcular média de estoque por SKU
            Object.keys(skuStock).forEach((sku) => {
                const data = skuStock[sku];
                const avgStock =
                    data.stockValues.length > 0
                        ? data.stockValues.reduce((sum, val) => sum + val, 0) /
                          data.stockValues.length
                        : 0;

                if (!stockByMonth[monthKey][sku]) {
                    stockByMonth[monthKey][sku] = {
                        itemId: data.itemId,
                        size: data.size,
                        avgStock: 0,
                        totalSold: 0,
                    };
                }
                stockByMonth[monthKey][sku].avgStock = Math.round(avgStock);
                stockByMonth[monthKey][sku].totalSold += data.sold;
            });
        });

        return stockByMonth;
    }

    // Atualizar gráfico de média de estoque
    updateAvgStockChart() {
        const canvas = document.getElementById('avgStockChart');
        if (!canvas) return;

        // Verificar se Chart.js está disponível
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js não está disponível ainda');
            return;
        }

        const stockByMonth = this.calculateAvgStockByMonth();
        const months = Object.keys(stockByMonth).sort();

        if (months.length === 0) {
            // Limpar gráfico se não houver dados
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Destruir gráfico anterior se existir
            if (this.avgStockChart) {
                this.avgStockChart.destroy();
                this.avgStockChart = null;
            }
            return;
        }

        // Calcular média total de estoque por mês (soma de todos os SKUs)
        const avgStockData = months.map((month) => {
            const skus = Object.values(stockByMonth[month]);
            const totalAvg = skus.reduce((sum, sku) => sum + sku.avgStock, 0);
            return totalAvg;
        });

        // Formatar labels dos meses
        const monthLabels = months.map((month) => {
            const [year, monthNum] = month.split('-');
            const monthNames = [
                'Jan',
                'Fev',
                'Mar',
                'Abr',
                'Mai',
                'Jun',
                'Jul',
                'Ago',
                'Set',
                'Out',
                'Nov',
                'Dez',
            ];
            return `${monthNames[parseInt(monthNum) - 1]}/${year.slice(-2)}`;
        });

        // Destruir gráfico anterior se existir
        if (this.avgStockChart) {
            this.avgStockChart.destroy();
        }

        // Obter cor primária do tema
        const primaryColor =
            getComputedStyle(document.documentElement).getPropertyValue(
                '--primary-color'
            ) || '#dc3545';

        // Criar novo gráfico
        this.avgStockChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: monthLabels,
                datasets: [
                    {
                        label: 'Média de Estoque',
                        data: avgStockData,
                        borderColor: primaryColor,
                        backgroundColor: primaryColor
                            .replace('rgb', 'rgba')
                            .replace(')', ', 0.1)'),
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 10,
                        titleFont: {
                            size: 12,
                        },
                        bodyFont: {
                            size: 11,
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            font: {
                                size: 10,
                            },
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                        },
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 10,
                            },
                        },
                        grid: {
                            display: false,
                        },
                    },
                },
            },
        });
    }

    // Atualizar sugestões de reposição
    updateRestockSuggestions() {
        const container = document.getElementById('restockSuggestions');
        if (!container) return;

        const stockByMonth = this.calculateAvgStockByMonth();
        const suggestions = [];

        // Analisar cada mês para encontrar SKUs que precisam de reposição
        Object.keys(stockByMonth).forEach((month) => {
            const skus = stockByMonth[month];
            Object.keys(skus).forEach((sku) => {
                const data = skus[sku];
                const item = this.items.find((i) => i.id === data.itemId);
                if (!item || item.category === 'Serviços') return;

                // Calcular taxa de venda mensal
                const monthlySales = data.totalSold;
                const avgStock = data.avgStock;

                // Sugerir reposição se:
                // 1. Estoque médio é baixo (< 5 unidades) OU
                // 2. Taxa de venda é alta (> 3 unidades/mês) e estoque está abaixo da média de vendas
                if (
                    avgStock < 5 ||
                    (monthlySales > 3 && avgStock < monthlySales * 1.5)
                ) {
                    const itemName = this.getItemName(data.itemId);
                    const priority =
                        avgStock < 3 ? 'high' : avgStock < 5 ? 'medium' : 'low';
                    const suggestedQty = Math.max(monthlySales * 2, 10); // Sugerir pelo menos 2x a venda mensal ou 10 unidades

                    suggestions.push({
                        itemName: itemName,
                        sku: sku,
                        currentStock: avgStock,
                        monthlySales: monthlySales,
                        suggestedQty: suggestedQty,
                        priority: priority,
                        month: month,
                    });
                }
            });
        });

        // Ordenar por prioridade e estoque atual
        suggestions.sort((a, b) => {
            if (a.priority !== b.priority) {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return a.currentStock - b.currentStock;
        });

        // Limitar a 10 sugestões
        const topSuggestions = suggestions.slice(0, 10);

        if (topSuggestions.length === 0) {
            container.innerHTML =
                '<p style="color: var(--gray-500); font-size: 0.9rem; text-align: center; padding: 1rem;">Nenhuma sugestão de reposição no momento.</p>';
            return;
        }

        container.innerHTML = topSuggestions
            .map((suggestion) => {
                const priorityColor =
                    suggestion.priority === 'high'
                        ? '#dc3545'
                        : suggestion.priority === 'medium'
                        ? '#ffc107'
                        : '#28a745';
                const priorityText =
                    suggestion.priority === 'high'
                        ? 'Urgente'
                        : suggestion.priority === 'medium'
                        ? 'Atenção'
                        : 'Sugestão';

                return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; margin-bottom: 0.5rem; border-radius: 5px; border-left: 3px solid ${priorityColor};">
                    <div style="flex: 1;">
                        <strong style="font-size: 0.9rem;">${this.escapeHtml(
                            suggestion.itemName
                        )}</strong>
                        <div style="font-size: 0.75rem; color: var(--gray-600); margin-top: 0.25rem;">
                            Estoque atual: ${
                                suggestion.currentStock
                            } un. | Vendas/mês: ${suggestion.monthlySales} un.
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.75rem; color: ${priorityColor}; font-weight: 600; margin-bottom: 0.25rem;">${priorityText}</div>
                        <div style="font-size: 0.85rem; color: var(--gray-700);">Sugerido: ${
                            suggestion.suggestedQty
                        } un.</div>
                    </div>
                </div>
            `;
            })
            .join('');
    }

    // ========== UTILITÁRIOS ==========

    toggleDashboard() {
        // Verificar qual dashboard está atualmente visível
        const salesDashboard = document.getElementById('dashboardTab');
        const servicesDashboard = document.getElementById(
            'servicesDashboardTab'
        );
        const isSalesActive =
            salesDashboard && (salesDashboard.classList.contains('active') || salesDashboard.style.display === 'block');
        const isServicesActive =
            servicesDashboard && (servicesDashboard.classList.contains('active') || servicesDashboard.style.display === 'block');

        // Alternar entre dashboard de vendas e serviços
        if (isServicesActive) {
            // Se serviços está ativo, mostrar vendas
            this.currentDashboardType = 'sales';
            this.switchTab('dashboard');
            this.updateDashboardButtonText('sales');
        } else if (isSalesActive) {
            // Se vendas está ativo, mostrar serviços
            this.currentDashboardType = 'services';
            this.switchTab('servicesDashboard');
            this.updateDashboardButtonText('services');
        } else {
            // Se nenhum está ativo, mostrar vendas primeiro (padrão)
            this.currentDashboardType = 'sales';
            this.switchTab('dashboard');
            this.updateDashboardButtonText('sales');
        }
    }

    updateDashboardButtonText(type) {
        const btn = document.getElementById('dashboardToggleBtn');
        if (!btn) return;

        const icon = btn.querySelector('i');
        const text = btn.querySelector('.btn-text');

        if (type === 'services') {
            if (icon) icon.className = 'fas fa-chart-pie';
            if (text) text.textContent = 'Dashboard Serviços';
            btn.title = 'Dashboard Serviços';
        } else {
            if (icon) icon.className = 'fas fa-chart-line';
            if (text) text.textContent = 'Dashboard Vendas';
            btn.title = 'Dashboard Vendas';
        }
    }

    switchTab(tab) {
        // Verificar se está em modo de teste
        const isTestMode = window.TEST_MODE === true;
        const suppressWarnings = window.SUPPRESS_UI_WARNINGS === true;
        
        // Se mudar para a aba de vendas, renderizar o carrossel novamente
        // Em modo de teste, pular renderizações de UI
        if (!isTestMode && tab === 'salesPanel') {
            setTimeout(() => {
                this.renderLastReceiptsCarousel();
            }, 300);
        }
        // Se mudar para a aba de administração, carregar dados do admin
        if (tab === 'adminPanel') {
            // Popular select de produtos para ROI quando abrir o painel admin
            setTimeout(() => {
                this.populateROIProductSelect();
            }, 100);
            const username = sessionStorage.getItem('username');
            if (username === 'admin') {
                // Aguardar um pouco para garantir que o DOM está pronto
                setTimeout(() => {
                    this.loadAdminData();
                }, 200);
            } else {
                console.warn('⚠️ [ADMIN] Acesso negado - apenas administradores');
                return;
            }
        }
        if (!tab) {
            console.warn('⚠️ [SWITCH TAB] Tab não especificado');
            return;
        }

        // Remover active de todos os botões e conteúdos
        document
            .querySelectorAll('.tab-btn')
            .forEach((btn) => btn.classList.remove('active'));
        document
            .querySelectorAll('.tab-content')
            .forEach((content) => {
                content.classList.remove('active');
                content.style.display = 'none';
            });

        // Adicionar active ao botão da aba selecionada
        const tabBtn = document.querySelector(`[data-tab="${tab}"]`);
        if (tabBtn) {
            tabBtn.classList.add('active');
        } else {
            // Se não encontrar pelo data-tab, tentar pelo ID (para dashboard toggle)
            if (tab === 'dashboard' || tab === 'servicesDashboard') {
                const dashboardBtn =
                    document.getElementById('dashboardToggleBtn');
                if (dashboardBtn) {
                    dashboardBtn.classList.add('active');
                }
            } else {
                // Em modo de teste, não gerar warnings
                if (!suppressWarnings) {
                    console.warn(
                        `⚠️ [SWITCH TAB] Botão da aba "${tab}" não encontrado`
                    );
                }
            }
        }

        // Adicionar active ao conteúdo da aba selecionada
        let tabContent = document.getElementById(`${tab}Tab`);

        // Se não encontrar, pode ser que o tab seja 'servicesDashboard' mas o ID seja diferente
        if (!tabContent && tab === 'servicesDashboard') {
            tabContent = document.getElementById('servicesDashboardTab');
        }

        // Se não encontrar, pode ser que o tab seja 'adminPanel' mas o ID seja diferente
        if (!tabContent && tab === 'adminPanel') {
            tabContent = document.getElementById('adminPanelTab');
        }

        if (tabContent) {
            // Mostrar o conteúdo antes de animar
            tabContent.style.display = 'block';
            
            // Animação rápida ao trocar de tab
            tabContent.style.opacity = '0';
            tabContent.style.transform = 'translateX(10px)';
            tabContent.classList.add('active');

            // Forçar reflow para garantir que a animação funcione
            void tabContent.offsetWidth;

            // Aplicar animação rápida
            setTimeout(() => {
                tabContent.style.opacity = '1';
                tabContent.style.transform = 'translateX(0)';
            }, 5);
        } else {
            // Em modo de teste, não gerar warnings
            if (!suppressWarnings) {
                console.warn(
                    `⚠️ [SWITCH TAB] Conteúdo da aba "${tab}Tab" não encontrado`
                );
                console.warn(
                    `⚠️ [SWITCH TAB] Tentando encontrar elemento com ID: ${tab}Tab`
                );
            }
        }

        // Se for a aba dashboard, renderizar os gráficos
        if (tab === 'dashboard') {
            // Aguardar um pouco para garantir que o DOM está pronto e Chart.js está carregado
            setTimeout(() => {
                this.renderDashboard();
            }, 100);
        }

        // Se for a aba servicesDashboard, renderizar os gráficos de serviços
        if (tab === 'servicesDashboard') {
            setTimeout(() => {
                this.renderServicesDashboard();
            }, 100);
        }

        // Se for a aba goals, renderizar as metas
        if (tab === 'goals') {
            this.renderGoals();
        }

        // Se for o painel de vendas, renderizar grupos, produtos, pedidos pendentes e custos
        if (tab === 'salesPanel') {
            this.renderGroups();
            this.renderItems();
            this.renderPendingOrders();
            this.renderCosts();
        }

        // Se for o painel de serviços, renderizar agendamentos, resumo e grupos de serviços
        if (tab === 'servicesPanel') {
            this.renderServiceAppointments();
            this.renderServiceGroups();
            this.updateServiceSummary();
            // Aguardar um pouco para garantir que o DOM está pronto e Chart.js está carregado
            setTimeout(() => {
                this.updateServicesChart();
            }, 100);
        }
    }

    getItemName(itemId) {
        const item = this.items.find((i) => i.id === itemId);
        if (!item) return 'Item não encontrado';

        const category = item.category || 'Roupas';

        if (category === 'Eletrônicos') {
            return item.model || item.name || 'Eletrônico';
        } else if (category === 'Roupas') {
            let name;
            if (item.name) {
                name = item.name;
            } else {
                // Se não tiver nome, usar marca + estilo ou apenas marca
                const parts = [item.brand || ''];
                if (item.style) parts.push(item.style);
                name = parts.filter((p) => p).join(' - ') || 'Roupa';
            }
            // Adicionar tamanho ao nome se existir
            if (item.size) {
                name += ` – tamanho ${item.size}`;
            }
            return name;
        } else if (category === 'Serviços') {
            return item.name || 'Serviço';
        }

        return item.name || 'Item';
    }

    // ========== TUTORIAL ==========

    checkFirstTimeUser() {
        // Não mostrar tutorial para admin
        const username = sessionStorage.getItem('username');
        if (username === 'admin') {
            return;
        }
        
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        if (!hasSeenTutorial) {
            // Aguardar um pouco para a página carregar completamente
            setTimeout(() => {
                this.openTutorialModal();
            }, 2000);
        }
    }

    openTutorialModal() {
        // Não abrir tutorial para admin
        const username = sessionStorage.getItem('username');
        if (username === 'admin') {
            // Garantir que o modal está fechado
            const modal = document.getElementById('tutorialModal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
            return;
        }
        
        const modal = document.getElementById('tutorialModal');
        if (!modal) return;

        // Garantir que o modal está visível
        modal.style.display = 'flex';
        
        const content = document.getElementById('tutorialContent');
        if (content) {
            content.innerHTML = `
                <div style="line-height: 1.8; color: var(--gray-700);">
                    <h3 style="color: var(--primary-color); margin-bottom: 1rem;">Bem-vindo ao Sistema de Gestão Financeira!</h3>
                    
                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">📦 Cadastro de Produtos</h4>
                        <p>Cadastre seus produtos (Roupas, Eletrônicos ou Serviços) através do botão "Novo Produto". Para produtos físicos, um <strong>QR Code exclusivo com código numérico de 9 dígitos</strong> será gerado automaticamente para cada item.</p>
                        <p style="margin-top: 0.5rem;"><strong>💡 Dica:</strong> O sistema valida automaticamente os campos e mostra mensagens de erro ou sucesso para facilitar o cadastro.</p>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">📱 QR Code - Sistema Exclusivo</h4>
                        <p><strong>1. Geração automática de QR Code:</strong></p>
                        <ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
                            <li>Cadastre um produto físico (Roupas ou Eletrônicos)</li>
                            <li>O sistema gera automaticamente um <strong>código numérico exclusivo de 9 dígitos</strong> (usando apenas números de 1 a 9)</li>
                            <li>Esse código é convertido em QR Code e armazenado no produto</li>
                            <li>Após salvar, o QR Code aparece no modal de edição</li>
                            <li>Clique em "QR Code" no card do produto para visualizar, baixar ou imprimir</li>
                        </ul>
                        <p><strong>2. Realizar leitura do QR Code:</strong></p>
                        <ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
                            <li>Vá em "Grupos Mensais" e abra um mês</li>
                            <li>Clique em "Adicionar Venda" em um dia específico</li>
                            <li>Clique no botão <i class="fas fa-qrcode"></i> ao lado do campo "Item"</li>
                            <li>Permita o acesso à câmera quando solicitado</li>
                            <li>Aponte a câmera para o QR Code do produto</li>
                            <li>O sistema identifica o produto pelo código numérico e seleciona automaticamente</li>
                            <li>Se a permissão for negada, você pode fechar o scanner e tentar novamente</li>
                        </ul>
                        <p><strong>3. Como a leitura impacta o sistema:</strong></p>
                        <ul style="margin-left: 1.5rem;">
                            <li>O produto é identificado pelo código numérico exclusivo</li>
                            <li>O estoque é atualizado automaticamente quando você registra a venda</li>
                            <li>As estatísticas de vendas são atualizadas em tempo real</li>
                            <li>Facilita o controle de estoque e vendas no caixa</li>
                            <li>Reduz erros de digitação e acelera o processo de venda</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">📊 Grupos Mensais</h4>
                        <p>Crie grupos mensais para organizar suas vendas por mês. Cada grupo permite:</p>
                        <ul style="margin-left: 1.5rem;">
                            <li>Registrar vendas por dia (o dia é automaticamente definido quando você abre o modal)</li>
                            <li>Gerenciar estoque inicial e acompanhar vendas</li>
                            <li>Visualizar estatísticas do período</li>
                            <li>Ver sugestões de reposição de estoque baseadas nas vendas</li>
                            <li>Consultar gráfico de média de estoque por SKU</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">💼 Serviços</h4>
                        <p>Cadastre serviços (aulas, consultorias, etc.) e registre as horas trabalhadas por mês. O sistema oferece:</p>
                        <ul style="margin-left: 1.5rem;">
                            <li>Cadastro de serviços com horas e minutos padrão</li>
                            <li>Registro mensal de serviços prestados</li>
                            <li>Cálculo automático de faturamento e estatísticas</li>
                            <li>Indicadores: valor médio por hora, média de horas por serviço</li>
                            <li>Gráficos de evolução de horas e faturamento</li>
                            <li>Dashboard dedicado para serviços (alterna com Dashboard de Vendas)</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">📈 Dashboards</h4>
                        <p>Visualize gráficos e estatísticas detalhadas:</p>
                        <ul style="margin-left: 1.5rem; margin-bottom: 0.5rem;">
                            <li><strong>Dashboard de Vendas:</strong> Gráficos de vendas, lucro, estoque, e evolução mensal</li>
                            <li><strong>Dashboard de Serviços:</strong> Gráficos de horas trabalhadas, faturamento e top serviços</li>
                            <li>Use o botão "Dashboard" para alternar entre Vendas e Serviços</li>
                            <li>Filtros por período (último mês, 3 meses, 6 meses, ano)</li>
                        </ul>
                        <p style="margin-top: 0.5rem;"><strong>📊 Gráficos nos Resumos:</strong></p>
                        <ul style="margin-left: 1.5rem;">
                            <li><strong>Resumo Geral:</strong> Gráfico de média de estoque por SKU e sugestões de reposição</li>
                            <li><strong>Resumo de Custos:</strong> Gráfico de evolução de custos por mês (valor total e quantidade de compras)</li>
                            <li><strong>Resumo de Serviços:</strong> Gráfico de evolução de serviços por mês (faturamento e horas trabalhadas)</li>
                            <li><strong>Resumo de Metas:</strong> Gráfico comparativo de metas vs vendas</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">🎯 Metas</h4>
                        <p>Defina metas mensais de vendas e acompanhe seu progresso:</p>
                        <ul style="margin-left: 1.5rem;">
                            <li>Crie metas por mês/ano</li>
                            <li>Visualize o progresso em tempo real</li>
                            <li>Gráfico comparativo de metas vs vendas reais</li>
                            <li>Estatísticas de cumprimento de metas</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">💰 Custos de Compra</h4>
                        <p>Registre os custos de compra dos produtos:</p>
                        <ul style="margin-left: 1.5rem;">
                            <li>Cadastre custos por produto e data</li>
                            <li>Acompanhe o valor total de custos</li>
                            <li>Visualize gráfico de evolução de custos por mês</li>
                            <li>Compare custos com vendas para calcular lucro</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">🛒 Pedidos Pendentes</h4>
                        <p>Gerencie pedidos que ainda não foram pagos:</p>
                        <ul style="margin-left: 1.5rem;">
                            <li>Acesse pelo <strong>Painel de Vendas</strong> → Seção "Pedidos Pendentes"</li>
                            <li>Crie pedidos pendentes com nome do cliente, CPF, itens e valor total</li>
                            <li>Adicione múltiplos itens ao pedido</li>
                            <li>Defina status: Pendente, Confirmado ou Cancelado</li>
                            <li>Configure data de vencimento para acompanhamento</li>
                            <li>Edite ou exclua pedidos pendentes a qualquer momento</li>
                            <li><strong>Finalizar Pedido:</strong> Converta um pedido pendente em venda concluída quando o pagamento for realizado</li>
                            <li>Após finalizar, um recibo é gerado automaticamente</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">📅 Agenda de Serviços</h4>
                        <p>Organize seus agendamentos de serviços:</p>
                        <ul style="margin-left: 1.5rem;">
                            <li>Acesse pelo <strong>Painel de Serviços</strong> → Seção "Agenda de Serviços"</li>
                            <li>Cadastre agendamentos com tipo de serviço, cliente, data, horário e preço</li>
                            <li>Adicione contato do cliente (telefone ou e-mail) e observações</li>
                            <li>Controle status: Pendente, Confirmado, Concluído ou Cancelado</li>
                            <li>Visualize agendamentos futuros e passados separadamente</li>
                            <li>Agendamentos futuros são ordenados por data/hora (mais próximos primeiro)</li>
                            <li>Agendamentos passados são ordenados por data/hora (mais recentes primeiro)</li>
                            <li>Edite ou exclua agendamentos conforme necessário</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">🧾 Preview de Recibo</h4>
                        <p>Visualize e imprima recibos de vendas:</p>
                        <ul style="margin-left: 1.5rem;">
                            <li>Após registrar uma venda ou finalizar um pedido pendente, um <strong>preview de recibo</strong> é exibido automaticamente</li>
                            <li>O recibo mostra: nome do cliente, CPF, itens comprados, quantidade, valor total, data/hora e código do pedido</li>
                            <li>Use o botão "Imprimir" para imprimir o recibo diretamente</li>
                            <li>O código do pedido é gerado automaticamente no formato: <strong>PED-YYYYMMDD-XXXX</strong></li>
                            <li>Todos os recibos são salvos no histórico de vendas concluídas</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">✨ Melhorias e Recursos</h4>
                        <ul style="margin-left: 1.5rem;">
                            <li><strong>Feedback Visual:</strong> Mensagens de sucesso/erro, estados de loading nos botões</li>
                            <li><strong>Validações:</strong> Validação automática de campos com feedback visual</li>
                            <li><strong>Acessibilidade:</strong> Navegação por teclado, leitores de tela, contraste adequado</li>
                            <li><strong>Responsividade:</strong> Interface adaptada para desktop, tablet e mobile</li>
                            <li><strong>Sugestões de Reposição:</strong> Sistema identifica produtos com estoque baixo baseado nas vendas</li>
                            <li><strong>SKU Inteligente:</strong> Para roupas, combina produto + tamanho para controle preciso</li>
                            <li><strong>Armazenamento na Nuvem:</strong> Dados sincronizados via JSONBin para acesso de qualquer dispositivo</li>
                            <li><strong>Tema Personalizado:</strong> Escolha entre tema vermelho ou azul, salvo por usuário</li>
                        </ul>
                    </div>

                    <div style="background: #e7f3ff; padding: 1rem; border-radius: 5px; border-left: 3px solid #007bff;">
                        <p style="margin: 0;"><strong>💡 Dica:</strong> Use o botão "Iniciar Tutorial Interativo" abaixo para ver um guia passo a passo com balões explicativos em cada funcionalidade!</p>
                    </div>
                </div>
            `;
        }

        // Garantir que não há loading overlay bloqueando
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay && loadingOverlay.classList.contains('active')) {
            loadingOverlay.classList.remove('active');
            loadingOverlay.style.display = 'none';
        }
        
        // Garantir que o modal está visível e ativo
        modal.style.display = 'flex';
        modal.classList.add('active');
        
        // Garantir que o app está disponível globalmente para onclick inline
        if (typeof window !== 'undefined') {
            window.app = this;
        }
        
        // Garantir que o modal está acima de tudo
        modal.style.zIndex = '10003';
        modal.style.pointerEvents = 'auto';
        
        // Re-anexar event listeners quando o modal é aberto (garantir que funcionem)
        setTimeout(() => {
            const closeBtn = modal.querySelector('.close');
            const closeTutorialBtn = document.getElementById('closeTutorialBtn');
            
            if (closeBtn) {
                // Remover listeners antigos e adicionar novos
                const newCloseBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                newCloseBtn.addEventListener('click', (e) => {
                    console.log('🟢 [TUTORIAL] Botão X clicado (re-anexado)');
                    e.preventDefault();
                    e.stopPropagation();
                    this.closeTutorialModal();
                });
                newCloseBtn.onclick = (e) => {
                    console.log('🟢 [TUTORIAL] Botão X (onclick) clicado (re-anexado)');
                    e.preventDefault();
                    e.stopPropagation();
                    this.closeTutorialModal();
                };
            }
            
            if (closeTutorialBtn) {
                // Remover listeners antigos e adicionar novos
                const newCloseTutorialBtn = closeTutorialBtn.cloneNode(true);
                closeTutorialBtn.parentNode.replaceChild(newCloseTutorialBtn, closeTutorialBtn);
                newCloseTutorialBtn.addEventListener('click', (e) => {
                    console.log('🟢 [TUTORIAL] Botão Fechar clicado (re-anexado)');
                    e.preventDefault();
                    e.stopPropagation();
                    this.closeTutorialModal();
                });
                newCloseTutorialBtn.onclick = (e) => {
                    console.log('🟢 [TUTORIAL] Botão Fechar (onclick) clicado (re-anexado)');
                    e.preventDefault();
                    e.stopPropagation();
                    this.closeTutorialModal();
                };
            }
            
            // Focar no botão de fechar para acessibilidade
            const finalCloseBtn = modal.querySelector('.close');
            if (finalCloseBtn) {
                finalCloseBtn.focus();
            }
        }, 100);
    }

    closeTutorialModal() {
        console.log('🔴 [TUTORIAL] closeTutorialModal() chamado');
        const modal = document.getElementById('tutorialModal');
        if (modal) {
            console.log('🔴 [TUTORIAL] Modal encontrado, fechando...');
            
            // Forçar fechamento de múltiplas formas
            modal.classList.remove('active');
            modal.style.display = 'none';
            modal.style.opacity = '0';
            modal.style.visibility = 'hidden';
            modal.style.pointerEvents = 'none';
            modal.style.zIndex = '-1';
            
            // Garantir que o modal-content também está escondido
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.display = 'none';
            }
            
            // Salvar que o usuário viu o tutorial
            localStorage.setItem('hasSeenTutorial', 'true');
            
            console.log('✅ [TUTORIAL] Modal fechado com sucesso');
        } else {
            console.error('❌ [TUTORIAL] Modal não encontrado!');
        }
    }

    startInteractiveTutorial() {
        this.closeTutorialModal();
        this.tutorialActive = true;
        this.tutorialStep = 0;
        localStorage.setItem('hasSeenTutorial', 'true');
        this.showTutorialStep(0);
    }

    skipTutorial() {
        this.closeTutorialTooltip();
        localStorage.setItem('hasSeenTutorial', 'true');
        this.tutorialActive = false;
    }

    closeTutorialTooltip() {
        const overlay = document.getElementById('tutorialOverlay');
        const tooltip = document.getElementById('tutorialTooltip');
        if (overlay) overlay.style.display = 'none';
        if (tooltip) tooltip.style.display = 'none';
        this.tutorialActive = false;
    }

    nextTutorialStep() {
        if (this.tutorialStep < this.getTutorialSteps().length - 1) {
            this.tutorialStep++;
            this.showTutorialStep(this.tutorialStep);
        } else {
            this.closeTutorialTooltip();
            alert(
                '🎉 Tutorial concluído! Você já conhece as principais funcionalidades do sistema.'
            );
        }
    }

    prevTutorialStep() {
        if (this.tutorialStep > 0) {
            this.tutorialStep--;
            this.showTutorialStep(this.tutorialStep);
        }
    }

    getTutorialSteps() {
        return [
            {
                title: 'Bem-vindo!',
                content:
                    'Este é um tutorial interativo que vai te mostrar as principais funcionalidades do sistema. Clique em "Próximo" para continuar.',
                target: null,
                position: 'center',
            },
            {
                title: 'Cadastro de Produtos',
                content:
                    'Clique em "Novo Produto" para cadastrar seus itens. Você pode cadastrar Roupas, Eletrônicos ou Serviços. Para produtos físicos, um QR Code exclusivo com código numérico de 9 dígitos será gerado automaticamente.',
                target: 'newItemBtn',
                position: 'bottom',
            },
            {
                title: 'QR Code Exclusivo - Cadastro',
                content:
                    'Após cadastrar um produto físico, o sistema gera automaticamente um código numérico exclusivo de 9 dígitos (1-9) e converte em QR Code. Você verá um botão "QR Code" no card. Clique nele para visualizar, baixar ou imprimir o QR Code do produto.',
                target: null,
                position: 'center',
            },
            {
                title: 'Grupos Mensais',
                content:
                    'Use "Grupo Mensal" para criar um mês de vendas. Depois, abra o mês para registrar vendas por dia.',
                target: 'newGroupBtn',
                position: 'bottom',
            },
            {
                title: 'QR Code - Leitura',
                content:
                    'Ao adicionar uma venda, clique no botão de QR Code ao lado do campo "Item" para escanear o código numérico do produto. O sistema identifica o produto pelo código de 9 dígitos, seleciona automaticamente e atualiza o estoque quando você registra a venda.',
                target: null,
                position: 'center',
            },
            {
                title: 'Dashboards',
                content:
                    'Visualize gráficos e estatísticas detalhadas. Use o botão "Dashboard" para alternar entre Dashboard de Vendas (gráficos de vendas, lucro, estoque) e Dashboard de Serviços (horas trabalhadas, faturamento, top serviços). Cada resumo também tem gráficos específicos.',
                target: 'dashboardToggleBtn',
                position: 'bottom',
            },
            {
                title: 'Serviços',
                content:
                    'Na aba "Serviços", você pode cadastrar meses de serviços e registrar horas trabalhadas. O sistema calcula automaticamente faturamento, valor médio por hora e média de horas por serviço. Visualize gráficos de evolução no resumo.',
                target: null,
                position: 'center',
            },
            {
                title: 'Metas',
                content:
                    'Defina metas mensais de vendas na aba "Metas" e acompanhe seu progresso em tempo real. O sistema mostra um gráfico comparativo de metas vs vendas reais nos últimos 6 meses.',
                target: null,
                position: 'center',
            },
            {
                title: 'Custos',
                content:
                    'Registre os custos de compra dos produtos na aba "Custos". Visualize gráficos de evolução de custos por mês no resumo, mostrando valor total e quantidade de compras.',
                target: null,
                position: 'center',
            },
            {
                title: 'Pedidos Pendentes',
                content:
                    'No Painel de Vendas, use "Pedidos Pendentes" para gerenciar vendas que ainda não foram pagas. Crie pedidos com múltiplos itens, defina status e data de vencimento. Quando o pagamento for realizado, finalize o pedido para convertê-lo em venda concluída e gerar o recibo automaticamente.',
                target: null,
                position: 'center',
            },
            {
                title: 'Agenda de Serviços',
                content:
                    'No Painel de Serviços, use "Agenda de Serviços" para organizar seus agendamentos. Cadastre clientes, escolha o tipo de serviço, defina data/horário, preço e status. Visualize agendamentos futuros e passados separadamente, ordenados automaticamente.',
                target: null,
                position: 'center',
            },
            {
                title: 'Preview de Recibo',
                content:
                    'Após registrar uma venda ou finalizar um pedido pendente, um preview de recibo é exibido automaticamente mostrando todos os detalhes da compra. Use o botão "Imprimir" para imprimir o recibo. O código do pedido é gerado automaticamente no formato PED-YYYYMMDD-XXXX.',
                target: null,
                position: 'center',
            },
            {
                title: 'Feedback e Validações',
                content:
                    'O sistema mostra mensagens de sucesso/erro, estados de loading nos botões durante operações, e valida automaticamente os campos com feedback visual. Isso facilita o uso e reduz erros.',
                target: null,
                position: 'center',
            },
        ];
    }

    showTutorialStep(stepIndex) {
        const steps = this.getTutorialSteps();
        const step = steps[stepIndex];
        if (!step) return;

        const overlay = document.getElementById('tutorialOverlay');
        const tooltip = document.getElementById('tutorialTooltip');
        const content = document.getElementById('tutorialTooltipContent');
        const prevBtn = document.getElementById('tutorialPrevBtn');
        const nextBtn = document.getElementById('tutorialNextBtn');

        if (!overlay || !tooltip || !content) return;

        // Mostrar overlay
        overlay.style.display = 'block';

        // Atualizar título e conteúdo
        const tooltipTitle = tooltip.querySelector('h3');
        if (tooltipTitle) {
            tooltipTitle.textContent = step.title;
        }
        content.innerHTML = step.content;

        // Posicionar tooltip
        if (step.target) {
            const targetElement = document.getElementById(step.target);
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                let top, left;

                switch (step.position) {
                    case 'bottom':
                        top = rect.bottom + 20;
                        left = rect.left + rect.width / 2 - 175; // 175 = metade da largura do tooltip
                        break;
                    case 'top':
                        top = rect.top - 200;
                        left = rect.left + rect.width / 2 - 175;
                        break;
                    case 'right':
                        top = rect.top;
                        left = rect.right + 20;
                        break;
                    case 'left':
                        top = rect.top;
                        left = rect.left - 370;
                        break;
                    default:
                        top = window.innerHeight / 2 - 100;
                        left = window.innerWidth / 2 - 175;
                }

                // Garantir que o tooltip não saia da tela
                top = Math.max(20, Math.min(top, window.innerHeight - 300));
                left = Math.max(20, Math.min(left, window.innerWidth - 370));

                tooltip.style.top = top + 'px';
                tooltip.style.left = left + 'px';
            } else {
                // Se não encontrar o elemento, centralizar
                tooltip.style.top = window.innerHeight / 2 - 100 + 'px';
                tooltip.style.left = window.innerWidth / 2 - 175 + 'px';
            }
        } else {
            // Centralizar se não houver target
            tooltip.style.top = window.innerHeight / 2 - 100 + 'px';
            tooltip.style.left = window.innerWidth / 2 - 175 + 'px';
        }

        // Atualizar botões
        if (prevBtn) {
            prevBtn.disabled = stepIndex === 0;
            prevBtn.style.opacity = stepIndex === 0 ? '0.5' : '1';
        }
        if (nextBtn) {
            const isLast = stepIndex === steps.length - 1;
            nextBtn.textContent = isLast ? 'Concluir' : 'Próximo';
        }

        // Mostrar tooltip
        tooltip.style.display = 'block';

        // Destacar elemento alvo se existir
        if (step.target) {
            const targetElement = document.getElementById(step.target);
            if (targetElement) {
                targetElement.style.transition = 'all 0.3s';
                targetElement.style.transform = 'scale(1.05)';
                targetElement.style.zIndex = '10000';
                targetElement.style.position = 'relative';
                setTimeout(() => {
                    if (targetElement) {
                        targetElement.style.transform = '';
                    }
                }, 500);
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Função para converter vírgula em ponto (formato brasileiro para formato numérico)
    parsePrice(value) {
        if (!value) return 0;
        // Converter string para número, substituindo vírgula por ponto
        const stringValue = String(value).trim();
        const normalizedValue = stringValue.replace(',', '.');
        const parsed = parseFloat(normalizedValue);
        return isNaN(parsed) ? 0 : parsed;
    }

    // ========== GERENCIAMENTO DE ESTOQUE ==========

    openStockModal() {
        if (!this.currentGroup) {
            alert('Por favor, abra um grupo mensal primeiro.');
            return;
        }

        const modal = document.getElementById('stockModal');
        const [year, month] = this.currentGroup.month.split('-');
        const monthNames = [
            'Janeiro',
            'Fevereiro',
            'Março',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro',
        ];

        document.getElementById(
            'stockModalTitle'
        ).textContent = `Gerenciar Estoque do Mês - ${
            monthNames[parseInt(month) - 1]
        } ${year}`;

        // Definir dia padrão como 1
        document.getElementById('stockDay').value = 1;
        this.updateStockItemsList();

        modal.classList.add('active');
    }

    closeStockModal() {
        document.getElementById('stockModal').classList.remove('active');
    }

    updateStockItemsList() {
        if (!this.currentGroup) return;

        const day = parseInt(document.getElementById('stockDay').value);
        if (!day || day < 1 || day > 31) {
            document.getElementById('stockItemsList').innerHTML =
                '<p style="text-align: center; color: var(--gray); padding: 1rem;">Selecione um dia válido.</p>';
            return;
        }

        const dayData = this.currentGroup.days.find((d) => d.day === day);
        if (!dayData) {
            document.getElementById('stockItemsList').innerHTML =
                '<p style="text-align: center; color: var(--gray); padding: 1rem;">Dia não encontrado.</p>';
            return;
        }

        // Garantir que stock existe
        if (!dayData.stock) {
            dayData.stock = {};
        }

        const stockItemsList = document.getElementById('stockItemsList');

        if (this.items.length === 0) {
            stockItemsList.innerHTML =
                '<p style="text-align: center; color: var(--gray); padding: 1rem;">Nenhum item cadastrado.</p>';
            return;
        }

        // Filtrar apenas produtos físicos (excluir serviços)
        const physicalItems = this.items.filter(
            (item) => item.category !== 'Serviços'
        );

        if (physicalItems.length === 0) {
            stockItemsList.innerHTML =
                '<p style="text-align: center; color: var(--gray); padding: 1rem;">Nenhum produto físico cadastrado.</p>';
            return;
        }

        // Separar roupas e eletrônicos de outros produtos
        const itemsWithVariations = physicalItems.filter(item => item.category === 'Roupas' || item.category === 'Eletrônicos');
        const otherItems = physicalItems.filter(item => item.category !== 'Roupas' && item.category !== 'Eletrônicos');

        let html = '';

        // Processar roupas e eletrônicos (com controle por tamanho e cor)
        if (itemsWithVariations.length > 0) {
            itemsWithVariations.forEach((item) => {
                // Coletar todas as combinações únicas de tamanho e cor que têm estoque ou vendas
                const variations = new Map(); // Map<"size_color", {size, color}>
                
                // Adicionar variações do estoque
                Object.keys(dayData.stock).forEach(key => {
                    if (key.startsWith(item.id + '_')) {
                        // Extrair tamanho e cor da chave
                        const parts = key.substring(item.id.length + 1).split('_');
                        const size = parts[0] || '';
                        const color = parts[1] || '';
                        const variationKey = `${size}|||${color}`;
                        if (!variations.has(variationKey)) {
                            variations.set(variationKey, { size, color });
                        }
                    } else if (key === item.id) {
                        // Estoque antigo sem tamanho/cor - manter compatibilidade
                        variations.set('|||', { size: '', color: '' });
                    }
                });
                
                // Adicionar variações das vendas
                dayData.sales
                    .filter(sale => sale.itemId === item.id)
                    .forEach(sale => {
                        const size = sale.size || '';
                        const color = sale.color || '';
                        const variationKey = `${size}|||${color}`;
                        if (!variations.has(variationKey)) {
                            variations.set(variationKey, { size, color });
                        }
                    });

                // Se não houver variações, adicionar um campo vazio para permitir cadastro
                if (variations.size === 0) {
                    variations.set('|||', { size: '', color: '' });
                }

                // Criar entrada para cada variação (tamanho + cor)
                variations.forEach((variation, variationKey) => {
                    const { size, color } = variation;
                    const stockKey = this.getStockKey(item.id, size, color);
                    const stockQuantity = dayData.stock[stockKey] || 0;
                    const soldQuantity = dayData.sales
                        .filter((sale) => {
                            const saleSize = sale.size || '';
                            const saleColor = sale.color || '';
                            const saleStockKey = this.getStockKey(sale.itemId, saleSize, saleColor);
                            return saleStockKey === stockKey;
                        })
                        .reduce((sum, sale) => sum + sale.quantity, 0);
                    const availableStock = stockQuantity - soldQuantity;
                    const sizeLabel = size || '(sem tamanho)';
                    const colorLabel = color || '(sem cor)';

                    html += `
                    <div class="stock-variation-item">
                        <div class="stock-variation-info">
                            <div class="stock-variation-name">${this.escapeHtml(item.name || item.model || item.brand)}${item.brand ? ' - ' + this.escapeHtml(item.brand) : ''}</div>
                            <div class="stock-variation-details">
                                Tamanho: ${this.escapeHtml(sizeLabel)}${color ? ` | Cor: ${this.escapeHtml(colorLabel)}` : ''}
                            </div>
                            <div class="stock-variation-stats">
                                Estoque: ${stockQuantity} un. | Vendido: ${soldQuantity} un. | Disponível: ${availableStock} un.
                            </div>
                        </div>
                        <div class="stock-inputs-group">
                            <input 
                                type="text" 
                                id="stock_size_${item.id}_${variationKey}" 
                                class="stock-input"
                                value="${this.escapeHtml(size)}" 
                                placeholder="Tamanho"
                            />
                            <input 
                                type="text" 
                                id="stock_color_${item.id}_${variationKey}" 
                                class="stock-input"
                                value="${this.escapeHtml(color)}" 
                                placeholder="Cor"
                            />
                            <input 
                                type="number" 
                                id="stock_${stockKey}" 
                                class="stock-input"
                                value="${stockQuantity}" 
                                min="0" 
                                placeholder="0"
                            />
                            <span class="stock-unit-label">un.</span>
                        </div>
                    </div>
                    `;
                });
            });
        }

        // Processar outros produtos (sem controle por tamanho/cor)
        otherItems.forEach((item) => {
            const stockKey = this.getStockKey(item.id, '', '');
            const stockQuantity = dayData.stock[stockKey] || 0;
            const soldQuantity = dayData.sales
                .filter((sale) => sale.itemId === item.id)
                .reduce((sum, sale) => sum + sale.quantity, 0);
            const availableStock = stockQuantity - soldQuantity;

            html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: white; margin-bottom: 0.5rem; border-radius: 5px; border: 1px solid var(--border-color);">
                <div style="flex: 1;">
                    <strong>${this.escapeHtml(
                        item.name || item.model || 'Item'
                    )}</strong>${item.brand ? ' - ' + this.escapeHtml(item.brand) : ''}
                    <div style="font-size: 0.85rem; color: var(--gray); margin-top: 0.25rem;">
                        Estoque: ${stockQuantity} un. | Vendido: ${soldQuantity} un. | Disponível: ${availableStock} un.
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <input 
                        type="number" 
                        id="stock_${stockKey}" 
                        value="${stockQuantity}" 
                        min="0" 
                        style="width: 80px; padding: 0.5rem; border: 2px solid var(--border-color); border-radius: 5px;"
                        placeholder="0"
                    />
                    <span style="font-size: 0.9rem; color: var(--gray);">un.</span>
                </div>
            </div>
            `;
        });

        stockItemsList.innerHTML = html;
    }

    saveStock() {
        if (!this.currentGroup) return;

        const day = parseInt(document.getElementById('stockDay').value);
        if (!day || day < 1 || day > 31) {
            alert('Por favor, selecione um dia válido.');
            return;
        }

        const dayData = this.currentGroup.days.find((d) => d.day === day);
        if (!dayData) {
            alert('Dia não encontrado.');
            return;
        }

        // Garantir que stock existe
        if (!dayData.stock) {
            dayData.stock = {};
        }

        // Salvar estoque - percorrer todos os inputs de estoque (excluir inputs de tamanho e cor)
        const stockInputs = document.querySelectorAll('input[id^="stock_"]:not([id^="stock_size_"]):not([id^="stock_color_"])');
        stockInputs.forEach(input => {
            const stockKey = input.id.replace('stock_', '');
            const quantity = parseInt(input.value) || 0;
            if (quantity >= 0) {
                dayData.stock[stockKey] = quantity;
            } else if (quantity === 0) {
                // Remover estoque zero (opcional - pode manter se quiser)
                // delete dayData.stock[stockKey];
                dayData.stock[stockKey] = 0;
            }
        });

        this.saveData();
        this.updateStockItemsList();
        this.renderGroupView(this.currentGroup);

        alert('Estoque salvo com sucesso!');
    }

    closeViewGroupModal() {
        console.log('🔧 [CLOSE VIEW GROUP] Fechando viewGroupModal');
        const viewGroupModal = document.getElementById('viewGroupModal');
        if (viewGroupModal) {
            // Restaurar todos os estilos antes de fechar
            viewGroupModal.style.opacity = '';
            viewGroupModal.style.pointerEvents = '';
            viewGroupModal.style.zIndex = '';
            viewGroupModal.style.display = '';
            
            // Garantir que o botão de fechar esteja clicável
            const closeBtn = viewGroupModal.querySelector('.close');
            if (closeBtn) {
                closeBtn.style.pointerEvents = 'auto';
                closeBtn.style.opacity = '1';
                closeBtn.style.zIndex = '1001';
            }
            
            // Garantir que todos os botões dentro do modal estejam clicáveis
            const buttons = viewGroupModal.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.style.pointerEvents = 'auto';
                btn.style.opacity = '1';
            });
            
            // Restaurar estilos do modal-content
            const modalContent = viewGroupModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.zIndex = '';
                modalContent.style.pointerEvents = '';
            }
            
            // Fechar modal com animação
            viewGroupModal.style.opacity = '0';
            setTimeout(() => {
                viewGroupModal.classList.remove('active');
                viewGroupModal.style.display = 'none';
                viewGroupModal.style.opacity = '';
            }, 300);
        }
        this.currentGroup = null;
        console.log('✅ [CLOSE VIEW GROUP] viewGroupModal fechado');
    }

    closeAllModals() {
        document
            .querySelectorAll('.modal')
            .forEach((modal) => modal.classList.remove('active'));
        this.currentEditingItem = null;
        this.currentGroup = null;
        this.currentSaleDay = null;
        this.currentEditingCost = null;
        this.currentEditingGoal = null;
    }

    // ========== DASHBOARD E GRÁFICOS ==========

    charts = {
        salesByMonth: null,
        profitVsCosts: null,
        topItems: null,
        profitEvolution: null,
        stockConsumption: null,
        stockRotation: null,
    };

    servicesCharts = {
        hoursByMonth: null,
        revenueByMonth: null,
        topServices: null,
        hoursEvolution: null,
        avgHoursPerDay: null,
        avgValuePerHour: null,
    };

    renderDashboard() {
        console.log(
            '📊 [DASHBOARD] ========== INICIANDO RENDERIZAÇÃO DO DASHBOARD =========='
        );
        console.log('📊 [DASHBOARD] Verificando Chart.js...');
        console.log('📊 [DASHBOARD] typeof Chart:', typeof Chart);
        console.log(
            '📊 [DASHBOARD] window.chartJsLoaded:',
            window.chartJsLoaded
        );

        // Verificar se Chart.js está carregado, se não, aguardar
        if (typeof Chart === 'undefined' || window.chartJsLoaded === false) {
            console.warn(
                '⚠️ [DASHBOARD] Chart.js não está carregado ainda, aguardando...'
            );
            // Tentar novamente após 500ms
            setTimeout(() => {
                if (typeof Chart !== 'undefined') {
                    console.log(
                        '✅ [DASHBOARD] Chart.js carregado, renderizando gráficos...'
                    );
                    this.renderDashboard();
                } else {
                    console.error(
                        '❌ [DASHBOARD] Chart.js não está disponível após aguardar. Verifique se o CDN está acessível.'
                    );
                    // Tentar carregar Chart.js manualmente
                    if (!document.querySelector('script[src*="chart.js"]')) {
                        console.log(
                            '🔄 [DASHBOARD] Tentando carregar Chart.js manualmente...'
                        );
                        const script = document.createElement('script');
                        script.src =
                            'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
                        script.onload = () => {
                            window.chartJsLoaded = true;
                            console.log(
                                '✅ [DASHBOARD] Chart.js carregado manualmente, renderizando...'
                            );
                            this.renderDashboard();
                        };
                        script.onerror = () => {
                            console.error(
                                '❌ [DASHBOARD] Erro ao carregar Chart.js do CDN'
                            );
                        };
                        document.head.appendChild(script);
                    } else {
                        // Script já existe, aguardar mais um pouco
                        console.log(
                            '⏳ [DASHBOARD] Script Chart.js já existe, aguardando carregamento...'
                        );
                        setTimeout(() => {
                            if (typeof Chart !== 'undefined') {
                                console.log(
                                    '✅ [DASHBOARD] Chart.js carregado após espera, renderizando...'
                                );
                                this.renderDashboard();
                            } else {
                                console.error(
                                    '❌ [DASHBOARD] Chart.js ainda não está disponível após 1.5s'
                                );
                            }
                        }, 1000);
                    }
                }
            }, 500);
            return;
        }

        console.log('✅ [DASHBOARD] Chart.js está disponível!');
        console.log('📊 [DASHBOARD] Renderizando dashboard...');
        console.log('📊 [DASHBOARD] Groups:', this.groups.length);
        console.log('📊 [DASHBOARD] Costs:', this.costs.length);
        console.log('📊 [DASHBOARD] Items:', this.items.length);

        // Destruir gráficos existentes
        Object.values(this.charts).forEach((chart) => {
            if (chart) {
                chart.destroy();
            }
        });

        // Renderizar gráficos
        this.renderSalesByMonthChart();
        this.renderProfitVsCostsChart();
        this.renderTopItemsChart();
        this.renderProfitEvolutionChart();
        this.renderStockConsumptionChart();
        this.renderStockRotationChart();
        this.updateDashboardStats();
    }

    getFilteredData() {
        const period = document.getElementById('periodFilter')?.value || 'all';
        const now = new Date();
        let cutoffDate = null;

        switch (period) {
            case 'month':
                cutoffDate = new Date(
                    now.getFullYear(),
                    now.getMonth() - 1,
                    now.getDate()
                );
                break;
            case '3months':
                cutoffDate = new Date(
                    now.getFullYear(),
                    now.getMonth() - 3,
                    now.getDate()
                );
                break;
            case '6months':
                cutoffDate = new Date(
                    now.getFullYear(),
                    now.getMonth() - 6,
                    now.getDate()
                );
                break;
            case 'year':
                cutoffDate = new Date(
                    now.getFullYear() - 1,
                    now.getMonth(),
                    now.getDate()
                );
                break;
        }

        let filteredGroups = this.groups;
        if (cutoffDate) {
            filteredGroups = this.groups.filter((group) => {
                const [year, month] = group.month.split('-');
                const groupDate = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    1
                );
                return groupDate >= cutoffDate;
            });
        }

        return filteredGroups;
    }

    renderSalesByMonthChart() {
        console.log('📊 [CHART] Iniciando renderSalesByMonthChart...');

        if (typeof Chart === 'undefined') {
            console.error(
                '❌ [CHART] Chart.js não está disponível para renderSalesByMonthChart'
            );
            return;
        }

        console.log('✅ [CHART] Chart.js está disponível');

        const ctx = document.getElementById('salesByMonthChart');
        if (!ctx) {
            console.error('❌ [CHART] Canvas salesByMonthChart não encontrado');
            return;
        }

        console.log('✅ [CHART] Canvas salesByMonthChart encontrado');

        // Verificar dimensões do canvas antes de criar o gráfico
        const canvasRect = ctx.getBoundingClientRect();
        console.log(
            `📏 [CHART] Dimensões do canvas: width=${canvasRect.width}px, height=${canvasRect.height}px`
        );
        console.log(
            `📏 [CHART] Canvas offsetWidth: ${ctx.offsetWidth}, offsetHeight: ${ctx.offsetHeight}`
        );

        // Garantir que o canvas tenha dimensões mínimas
        if (canvasRect.width === 0 || canvasRect.height === 0) {
            console.warn(
                '⚠️ [CHART] Canvas tem dimensões zero! Tentando forçar dimensões...'
            );
            const parent = ctx.parentElement;
            if (parent) {
                const parentRect = parent.getBoundingClientRect();
                console.log(
                    `📏 [CHART] Dimensões do parent: width=${parentRect.width}px, height=${parentRect.height}px`
                );
            }
        }

        const filteredGroups = this.getFilteredData();
        console.log(`📊 [CHART] Grupos filtrados: ${filteredGroups.length}`);

        const monthlyData = {};

        // CORRIGIDO: Percorrer days -> sales
        filteredGroups.forEach((group) => {
            const key = `${group.month.split('-')[1]}/${
                group.month.split('-')[0]
            }`;
            if (!monthlyData[key]) {
                monthlyData[key] = { sales: 0, value: 0 };
            }

            group.days.forEach((day) => {
                day.sales.forEach((sale) => {
                    monthlyData[key].sales += sale.quantity;
                    monthlyData[key].value += this.getSaleTotalValue(sale);
                });
            });
        });

        const labels = Object.keys(monthlyData).sort((a, b) => {
            const [m1, y1] = a.split('/').map(Number);
            const [m2, y2] = b.split('/').map(Number);
            return y1 === y2 ? m1 - m2 : y1 - y2;
        });

        const salesData = labels.map((label) => monthlyData[label].sales);
        const valuesData = labels.map((label) => monthlyData[label].value);

        console.log(`📊 [CHART] Labels: ${labels.join(', ')}`);
        console.log(`📊 [CHART] Sales Data: ${salesData.join(', ')}`);
        console.log(`📊 [CHART] Values Data: ${valuesData.join(', ')}`);

        if (labels.length === 0) {
            console.warn(
                '⚠️ [CHART] Nenhum dado para renderizar, limpando canvas'
            );
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            return;
        }

        console.log('📊 [CHART] Criando gráfico Chart.js...');

        // Destruir gráfico anterior se existir
        if (this.charts.salesByMonth) {
            console.log('🔄 [CHART] Destruindo gráfico anterior');
            this.charts.salesByMonth.destroy();
        }

        try {
            this.charts.salesByMonth = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Quantidade de Vendas',
                            data: salesData,
                            borderColor: '#dc3545',
                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                            tension: 0.4,
                        },
                        {
                            label: 'Valor (R$)',
                            data: valuesData,
                            borderColor: '#28a745',
                            backgroundColor: 'rgba(40, 167, 69, 0.1)',
                            tension: 0.4,
                            yAxisID: 'y1',
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    aspectRatio: 2,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Quantidade',
                            },
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: 'Valor (R$)',
                            },
                            grid: {
                                drawOnChartArea: false,
                            },
                        },
                    },
                },
            });
            console.log('✅ [CHART] Gráfico salesByMonth criado com sucesso!');
            console.log('📊 [CHART] Chart instance:', this.charts.salesByMonth);

            // Verificar dimensões após criação
            setTimeout(() => {
                const canvasAfter =
                    document.getElementById('salesByMonthChart');
                if (canvasAfter) {
                    const rectAfter = canvasAfter.getBoundingClientRect();
                    console.log(
                        `📏 [CHART] Dimensões após criação: width=${rectAfter.width}px, height=${rectAfter.height}px`
                    );
                    console.log(
                        `📏 [CHART] Canvas width/height attributes: ${canvasAfter.width}x${canvasAfter.height}`
                    );

                    // Verificar se o gráfico foi renderizado
                    const chartInstance = this.charts.salesByMonth;
                    if (chartInstance) {
                        console.log(
                            `📊 [CHART] Chart width: ${chartInstance.width}, height: ${chartInstance.height}`
                        );
                        console.log(
                            `📊 [CHART] Chart canvas width: ${chartInstance.canvas.width}, height: ${chartInstance.canvas.height}`
                        );
                    }
                }
            }, 100);
        } catch (error) {
            console.error(
                '❌ [CHART] Erro ao criar gráfico salesByMonth:',
                error
            );
            console.error('❌ [CHART] Erro stack:', error.stack);
        }
    }

    renderProfitVsCostsChart() {
        if (typeof Chart === 'undefined') {
            console.warn(
                '⚠️ [CHART] Chart.js não está disponível para renderProfitVsCostsChart'
            );
            return;
        }

        const ctx = document.getElementById('profitVsCostsChart');
        if (!ctx) {
            console.warn('⚠️ [CHART] Canvas profitVsCostsChart não encontrado');
            return;
        }

        const filteredGroups = this.getFilteredData();
        const monthlyData = {};

        // CORRIGIDO: Percorrer days -> sales
        filteredGroups.forEach((group) => {
            const key = `${group.month.split('-')[1]}/${
                group.month.split('-')[0]
            }`;
            if (!monthlyData[key]) {
                monthlyData[key] = { profit: 0, costs: 0 };
            }

            group.days.forEach((day) => {
                day.sales.forEach((sale) => {
                    monthlyData[key].profit += this.getSaleTotalValue(sale);
                });
            });
        });

        // Adicionar custos
        this.costs.forEach((cost) => {
            const costDate = new Date(cost.date);
            const key = `${costDate.getMonth() + 1}/${costDate.getFullYear()}`;
            if (monthlyData[key]) {
                monthlyData[key].costs += cost.totalCost;
            } else {
                monthlyData[key] = { profit: 0, costs: cost.totalCost };
            }
        });

        const labels = Object.keys(monthlyData).sort((a, b) => {
            const [m1, y1] = a.split('/').map(Number);
            const [m2, y2] = b.split('/').map(Number);
            return y1 === y2 ? m1 - m2 : y1 - y2;
        });

        const profitData = labels.map((label) => monthlyData[label].profit);
        const costsData = labels.map((label) => monthlyData[label].costs || 0);

        if (labels.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            return;
        }

        this.charts.profitVsCosts = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Lucro (R$)',
                        data: profitData,
                        backgroundColor: 'rgba(40, 167, 69, 0.7)',
                        borderColor: '#28a745',
                        borderWidth: 1,
                    },
                    {
                        label: 'Custos (R$)',
                        data: costsData,
                        backgroundColor: 'rgba(255, 193, 7, 0.7)',
                        borderColor: '#ffc107',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Valor (R$)',
                        },
                    },
                },
            },
        });
    }

    renderTopItemsChart() {
        if (typeof Chart === 'undefined') {
            console.warn(
                '⚠️ [CHART] Chart.js não está disponível para renderTopItemsChart'
            );
            return;
        }

        const ctx = document.getElementById('topItemsChart');
        if (!ctx) {
            console.warn('⚠️ [CHART] Canvas topItemsChart não encontrado');
            return;
        }

        const itemSales = {};
        const filteredGroups = this.getFilteredData();

        // CORRIGIDO: Percorrer days -> sales
        filteredGroups.forEach((group) => {
            group.days.forEach((day) => {
                day.sales.forEach((sale) => {
                    if (!itemSales[sale.itemId]) {
                        itemSales[sale.itemId] = {
                            quantity: 0,
                            name: this.getItemName(sale.itemId),
                        };
                    }
                    itemSales[sale.itemId].quantity += sale.quantity;
                });
            });
        });

        const sortedItems = Object.entries(itemSales)
            .sort((a, b) => b[1].quantity - a[1].quantity)
            .slice(0, 10);

        if (sortedItems.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            return;
        }

        const labels = sortedItems.map(([id, data]) =>
            data.name.length > 15
                ? data.name.substring(0, 15) + '...'
                : data.name
        );
        const data = sortedItems.map(([id, data]) => data.quantity);

        this.charts.topItems = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [
                    {
                        data: data,
                        backgroundColor: [
                            '#dc3545',
                            '#28a745',
                            '#ffc107',
                            '#17a2b8',
                            '#6f42c1',
                            '#e83e8c',
                            '#fd7e14',
                            '#20c997',
                            '#6610f2',
                            '#6c757d',
                        ],
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                },
            },
        });
    }

    renderProfitEvolutionChart() {
        if (typeof Chart === 'undefined') {
            console.warn(
                '⚠️ [CHART] Chart.js não está disponível para renderProfitEvolutionChart'
            );
            return;
        }

        const ctx = document.getElementById('profitEvolutionChart');
        if (!ctx) {
            console.warn(
                '⚠️ [CHART] Canvas profitEvolutionChart não encontrado'
            );
            return;
        }

        const filteredGroups = this.getFilteredData();
        const monthlyData = {};

        // CORRIGIDO: Percorrer days -> sales
        filteredGroups.forEach((group) => {
            const key = `${group.month.split('-')[1]}/${
                group.month.split('-')[0]
            }`;
            if (!monthlyData[key]) {
                monthlyData[key] = { sales: 0, costs: 0 };
            }

            group.days.forEach((day) => {
                day.sales.forEach((sale) => {
                    monthlyData[key].sales += this.getSaleTotalValue(sale);
                });
            });
        });

        // Adicionar custos
        this.costs.forEach((cost) => {
            const costDate = new Date(cost.date);
            const key = `${costDate.getMonth() + 1}/${costDate.getFullYear()}`;
            if (monthlyData[key]) {
                monthlyData[key].costs += cost.totalCost;
            } else {
                monthlyData[key] = { sales: 0, costs: cost.totalCost };
            }
        });

        const labels = Object.keys(monthlyData).sort((a, b) => {
            const [m1, y1] = a.split('/').map(Number);
            const [m2, y2] = b.split('/').map(Number);
            return y1 === y2 ? m1 - m2 : y1 - y2;
        });

        const profitData = labels.map(
            (label) =>
                monthlyData[label].sales - (monthlyData[label].costs || 0)
        );

        if (labels.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            return;
        }

        this.charts.profitEvolution = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Lucro Líquido (R$)',
                        data: profitData,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        fill: true,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Lucro (R$)',
                        },
                    },
                },
            },
        });
    }

    updateDashboardStats() {
        const filteredGroups = this.getFilteredData();

        // Média mensal de vendas
        let totalSales = 0;
        let monthCount = 0;
        const monthlyTotals = {};

        // CORRIGIDO: Percorrer days -> sales
        filteredGroups.forEach((group) => {
            const key = `${group.month.split('-')[1]}/${
                group.month.split('-')[0]
            }`;
            if (!monthlyTotals[key]) {
                monthlyTotals[key] = 0;
                monthCount++;
            }

            group.days.forEach((day) => {
                day.sales.forEach((sale) => {
                    monthlyTotals[key] += this.getSaleTotalValue(sale);
                    totalSales += this.getSaleTotalValue(sale);
                });
            });
        });

        const avgMonthly = monthCount > 0 ? totalSales / monthCount : 0;
        const avgEl = document.getElementById('avgMonthlySales');
        if (avgEl) {
            const avgText = `R$ ${avgMonthly.toFixed(2).replace('.', ',')}`;
            avgEl.textContent = avgText;
            avgEl.setAttribute('title', avgText);
        }

        // Melhor mês
        let bestMonth = '-';
        let bestValue = 0;
        Object.entries(monthlyTotals).forEach(([month, value]) => {
            if (value > bestValue) {
                bestValue = value;
                bestMonth = month;
            }
        });
        const bestMonthEl = document.getElementById('bestMonth');
        if (bestMonthEl) {
            bestMonthEl.textContent = bestMonth !== '-' ? bestMonth : '-';
            // Adicionar tooltip com o valor completo
            if (bestMonth !== '-') {
                bestMonthEl.setAttribute('title', bestMonth);
            } else {
                bestMonthEl.removeAttribute('title');
            }
        }

        // Margem de lucro média
        let totalCosts = 0;
        this.costs.forEach((cost) => {
            totalCosts += cost.total || 0;
        });
        const profitMargin =
            totalSales > 0 ? ((totalSales - totalCosts) / totalSales) * 100 : 0;
        const marginEl = document.getElementById('avgProfitMargin');
        if (marginEl) {
            const marginText = `${profitMargin.toFixed(1)}%`;
            marginEl.textContent = marginText;
            marginEl.setAttribute('title', marginText);
        }

        // Total de itens
        const itemsEl = document.getElementById('totalItemsCount');
        if (itemsEl) {
            const itemsText = this.items.length.toString();
            itemsEl.textContent = itemsText;
            itemsEl.setAttribute(
                'title',
                `Total: ${itemsText} itens cadastrados`
            );
        }
    }

    updateGroupStockStats(group) {
        if (!group) return;

        let totalStock = 0;
        let totalSold = 0;
        const itemStockStatus = {};
        const lowStockItems = [];

        // Calcular estoque total e vendido do grupo
        group.days.forEach((day) => {
            // Garantir que stock existe
            if (!day.stock) {
                day.stock = {};
            }

            // Somar estoque total de cada item (pegar o maior estoque registrado no mês)
            Object.keys(day.stock).forEach((itemId) => {
                if (!itemStockStatus[itemId]) {
                    itemStockStatus[itemId] = {
                        stock: 0,
                        sold: 0,
                    };
                }
                // Pegar o maior estoque registrado no mês (estoque inicial)
                itemStockStatus[itemId].stock = Math.max(
                    itemStockStatus[itemId].stock,
                    day.stock[itemId] || 0
                );
            });

            // Somar vendas
            day.sales.forEach((sale) => {
                if (!itemStockStatus[sale.itemId]) {
                    itemStockStatus[sale.itemId] = {
                        stock: 0,
                        sold: 0,
                    };
                }
                itemStockStatus[sale.itemId].sold += sale.quantity;
            });
        });

        // Calcular totais e verificar estoque baixo
        Object.entries(itemStockStatus).forEach(([itemId, data]) => {
            totalStock += data.stock;
            totalSold += data.sold;

            const available = data.stock - data.sold;
            const item = this.items.find((i) => i.id === itemId);

            // Alerta de estoque baixo (usar minStock do item ou padrão de 5)
            const minStock = item?.minStock || 5;
            if (available <= minStock && item) {
                lowStockItems.push({
                    name: this.getItemName(itemId),
                    available: available,
                    minStock: minStock,
                });
            }
        });

        // Atualizar cards de estoque do grupo
        const groupStockTotalEl = document.getElementById('groupStockTotal');
        if (groupStockTotalEl) {
            groupStockTotalEl.textContent = `${totalStock} un.`;
        }

        const groupStockSoldEl = document.getElementById('groupStockSold');
        if (groupStockSoldEl) {
            groupStockSoldEl.textContent = `${totalSold} un.`;
        }

        const groupStockAvailableEl = document.getElementById(
            'groupStockAvailable'
        );
        if (groupStockAvailableEl) {
            const available = totalStock - totalSold;
            groupStockAvailableEl.textContent = `${available} un.`;
            // Mudar cor se for negativo
            if (available < 0) {
                groupStockAvailableEl.style.color = '#dc3545';
            } else if (available === 0) {
                groupStockAvailableEl.style.color = '#ffc107';
            } else {
                groupStockAvailableEl.style.color = '#155724';
            }
        }

        // Alerta de estoque baixo
        const groupLowStockAlertEl =
            document.getElementById('groupLowStockAlert');
        const groupLowStockItemsEl =
            document.getElementById('groupLowStockItems');
        if (groupLowStockAlertEl && groupLowStockItemsEl) {
            if (lowStockItems.length > 0) {
                groupLowStockAlertEl.style.display = 'block';
                groupLowStockItemsEl.innerHTML = lowStockItems
                    .map(
                        (item) =>
                            `<strong>${this.escapeHtml(item.name)}</strong>: ${
                                item.available
                            } un.`
                    )
                    .join('<br>');
            } else {
                groupLowStockAlertEl.style.display = 'none';
            }
        }
    }

    renderStockConsumptionChart() {
        if (typeof Chart === 'undefined') {
            console.warn(
                '⚠️ [CHART] Chart.js não está disponível para renderStockConsumptionChart'
            );
            return;
        }

        const ctx = document.getElementById('stockConsumptionChart');
        if (!ctx) {
            console.warn(
                '⚠️ [CHART] Canvas stockConsumptionChart não encontrado'
            );
            return;
        }

        const filteredGroups = this.getFilteredData();
        const monthlyData = {};

        // Calcular consumo de estoque (quantidade vendida) por mês
        filteredGroups.forEach((group) => {
            const key = `${group.month.split('-')[1]}/${
                group.month.split('-')[0]
            }`;
            if (!monthlyData[key]) {
                monthlyData[key] = 0;
            }

            group.days.forEach((day) => {
                day.sales.forEach((sale) => {
                    monthlyData[key] += sale.quantity;
                });
            });
        });

        const labels = Object.keys(monthlyData).sort((a, b) => {
            const [m1, y1] = a.split('/').map(Number);
            const [m2, y2] = b.split('/').map(Number);
            return y1 === y2 ? m1 - m2 : y1 - y2;
        });

        const consumptionData = labels.map((label) => monthlyData[label] || 0);

        if (labels.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            return;
        }

        // Destruir gráfico anterior se existir
        if (this.charts.stockConsumption) {
            this.charts.stockConsumption.destroy();
        }

        this.charts.stockConsumption = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Quantidade Vendida (un.)',
                        data: consumptionData,
                        backgroundColor: 'rgba(23, 162, 184, 0.7)',
                        borderColor: '#17a2b8',
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 2,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantidade (un.)',
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                    },
                },
            },
        });
    }

    renderStockRotationChart() {
        if (typeof Chart === 'undefined') {
            console.warn(
                '⚠️ [CHART] Chart.js não está disponível para renderStockRotationChart'
            );
            return;
        }

        const ctx = document.getElementById('stockRotationChart');
        if (!ctx) {
            console.warn('⚠️ [CHART] Canvas stockRotationChart não encontrado');
            return;
        }

        const itemSales = {};
        const filteredGroups = this.getFilteredData();

        // Calcular quantidade vendida por item
        filteredGroups.forEach((group) => {
            group.days.forEach((day) => {
                day.sales.forEach((sale) => {
                    if (!itemSales[sale.itemId]) {
                        itemSales[sale.itemId] = {
                            quantity: 0,
                            name: this.getItemName(sale.itemId),
                        };
                    }
                    itemSales[sale.itemId].quantity += sale.quantity;
                });
            });
        });

        const sortedItems = Object.entries(itemSales)
            .sort((a, b) => b[1].quantity - a[1].quantity)
            .slice(0, 10);

        if (sortedItems.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            return;
        }

        const labels = sortedItems.map(([id, data]) =>
            data.name.length > 20
                ? data.name.substring(0, 20) + '...'
                : data.name
        );
        const data = sortedItems.map(([id, data]) => data.quantity);

        // Destruir gráfico anterior se existir
        if (this.charts.stockRotation) {
            this.charts.stockRotation.destroy();
        }

        this.charts.stockRotation = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Quantidade Vendida (un.)',
                        data: data,
                        backgroundColor: [
                            'rgba(220, 53, 69, 0.7)',
                            'rgba(40, 167, 69, 0.7)',
                            'rgba(255, 193, 7, 0.7)',
                            'rgba(23, 162, 184, 0.7)',
                            'rgba(111, 66, 193, 0.7)',
                            'rgba(232, 62, 140, 0.7)',
                            'rgba(253, 126, 20, 0.7)',
                            'rgba(32, 201, 151, 0.7)',
                            'rgba(102, 16, 242, 0.7)',
                            'rgba(108, 117, 125, 0.7)',
                        ],
                        borderColor: [
                            '#dc3545',
                            '#28a745',
                            '#ffc107',
                            '#17a2b8',
                            '#6f42c1',
                            '#e83e8c',
                            '#fd7e14',
                            '#20c997',
                            '#6610f2',
                            '#6c757d',
                        ],
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 2,
                indexAxis: 'y', // Gráfico horizontal
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantidade Vendida (un.)',
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        enabled: true,
                    },
                },
            },
        });
    }

    logout() {
        if (confirm('Deseja realmente sair?')) {
            sessionStorage.removeItem('loggedIn');
            sessionStorage.removeItem('username');
            try {
                window.location.href = '/index.html';
            } catch (error) {
                console.error('Erro ao redirecionar:', error);
                window.location.href = 'index.html';
            }
        }
    }

    // ========== GERENCIAMENTO DE TEMA E ACESSIBILIDADE ==========

    loadTheme() {
        // Carregar tema do usuário atual
        const username = sessionStorage.getItem('username');
        const themeKey = username ? `appTheme_${username}` : 'appTheme';
        const savedTheme = localStorage.getItem(themeKey);

        if (savedTheme === 'blue') {
            document.body.classList.add('theme-blue');
            this.updateThemeColor('#007bff');
        } else {
            document.body.classList.remove('theme-blue');
            this.updateThemeColor('#dc3545');
        }

        // Carregar preferências de acessibilidade
        this.loadAccessibilitySettings();
    }

    // Carregar configurações de acessibilidade
    loadAccessibilitySettings() {
        const username = sessionStorage.getItem('username');
        const settingsKey = username ? `accessibilitySettings_${username}` : 'accessibilitySettings';
        const settingsStr = localStorage.getItem(settingsKey);
        
        if (settingsStr) {
            try {
                const settings = JSON.parse(settingsStr);
                
                // Aplicar alto contraste
                if (settings.highContrast) {
                    document.body.classList.add('high-contrast');
                } else {
                    document.body.classList.remove('high-contrast');
                }
                
                // Aplicar tamanho de fonte
                document.body.classList.remove('font-small', 'font-normal', 'font-large', 'font-extra-large');
                if (settings.fontSize) {
                    document.body.classList.add(`font-${settings.fontSize}`);
                } else {
                    document.body.classList.add('font-normal');
                }
                
                // Aplicar espaçamento
                document.body.classList.remove('spacing-compact', 'spacing-normal', 'spacing-comfortable');
                if (settings.spacing) {
                    document.body.classList.add(`spacing-${settings.spacing}`);
                } else {
                    document.body.classList.add('spacing-normal');
                }
            } catch (error) {
                console.error('Erro ao carregar configurações de acessibilidade:', error);
            }
        }
    }

    // Salvar configurações de acessibilidade
    saveAccessibilitySettings() {
        const username = sessionStorage.getItem('username');
        const settingsKey = username ? `accessibilitySettings_${username}` : 'accessibilitySettings';
        
        const settings = {
            highContrast: document.body.classList.contains('high-contrast'),
            fontSize: this.getCurrentFontSize(),
            spacing: this.getCurrentSpacing(),
        };
        
        localStorage.setItem(settingsKey, JSON.stringify(settings));
    }

    // Obter tamanho de fonte atual
    getCurrentFontSize() {
        if (document.body.classList.contains('font-small')) return 'small';
        if (document.body.classList.contains('font-large')) return 'large';
        if (document.body.classList.contains('font-extra-large')) return 'extra-large';
        return 'normal';
    }

    // Obter espaçamento atual
    getCurrentSpacing() {
        if (document.body.classList.contains('spacing-compact')) return 'compact';
        if (document.body.classList.contains('spacing-comfortable')) return 'comfortable';
        return 'normal';
    }

    // Alternar modo alto contraste
    toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
        this.saveAccessibilitySettings();
        
        if (typeof toast !== 'undefined' && toast) {
            const isEnabled = document.body.classList.contains('high-contrast');
            toast.info(isEnabled ? 'Modo alto contraste ativado' : 'Modo alto contraste desativado', 2000);
        }
    }

    // Definir tamanho de fonte
    setFontSize(size) {
        document.body.classList.remove('font-small', 'font-normal', 'font-large', 'font-extra-large');
        if (size && size !== 'normal') {
            document.body.classList.add(`font-${size}`);
        } else {
            document.body.classList.add('font-normal');
        }
        this.saveAccessibilitySettings();
    }

    // Definir espaçamento
    setSpacing(spacing) {
        document.body.classList.remove('spacing-compact', 'spacing-normal', 'spacing-comfortable');
        if (spacing && spacing !== 'normal') {
            document.body.classList.add(`spacing-${spacing}`);
        } else {
            document.body.classList.add('spacing-normal');
        }
        this.saveAccessibilitySettings();
    }

    // Abrir modal de acessibilidade
    openAccessibilityModal() {
        const modal = document.getElementById('accessibilityModal');
        if (!modal) return;

        // Carregar configurações atuais
        const highContrastToggle = document.getElementById('highContrastToggle');
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        const spacingSelect = document.getElementById('spacingSelect');

        if (highContrastToggle) {
            highContrastToggle.checked = document.body.classList.contains('high-contrast');
        }
        if (fontSizeSelect) {
            fontSizeSelect.value = this.getCurrentFontSize();
        }
        if (spacingSelect) {
            spacingSelect.value = this.getCurrentSpacing();
        }

        modal.classList.add('active');
    }

    // Fechar modal de acessibilidade
    closeAccessibilityModal() {
        const modal = document.getElementById('accessibilityModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Restaurar configurações padrão de acessibilidade
    resetAccessibilitySettings() {
        document.body.classList.remove('high-contrast');
        document.body.classList.remove('font-small', 'font-normal', 'font-large', 'font-extra-large');
        document.body.classList.remove('spacing-compact', 'spacing-normal', 'spacing-comfortable');
        document.body.classList.add('font-normal', 'spacing-normal');

        // Atualizar controles
        const highContrastToggle = document.getElementById('highContrastToggle');
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        const spacingSelect = document.getElementById('spacingSelect');

        if (highContrastToggle) highContrastToggle.checked = false;
        if (fontSizeSelect) fontSizeSelect.value = 'normal';
        if (spacingSelect) spacingSelect.value = 'normal';

        this.saveAccessibilitySettings();

        if (typeof toast !== 'undefined' && toast) {
            toast.success('Configurações de acessibilidade restauradas para os padrões', 3000);
        }
    }

    toggleTheme() {
        const isBlue = document.body.classList.contains('theme-blue');
        const username = sessionStorage.getItem('username');
        const themeKey = username ? `appTheme_${username}` : 'appTheme';

        if (isBlue) {
            document.body.classList.remove('theme-blue');
            localStorage.setItem(themeKey, 'red');
            this.updateThemeColor('#dc3545');
        } else {
            document.body.classList.add('theme-blue');
            localStorage.setItem(themeKey, 'blue');
            this.updateThemeColor('#007bff');
        }

        // Salvar tema no JSONBin junto com os dados do usuário
        this.saveData();
    }

    // ========================================
    // DARK MODE
    // ========================================
    toggleDarkMode() {
        const isDark = document.body.classList.contains('dark-mode');
        const username = sessionStorage.getItem('username');
        const darkModeKey = username ? `darkMode_${username}` : 'darkMode';

        if (isDark) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem(darkModeKey, 'false');
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem(darkModeKey, 'true');
        }

        // Atualizar toggle visual
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.classList.toggle('active', !isDark);
        }
    }

    loadDarkMode() {
        const username = sessionStorage.getItem('username');
        const darkModeKey = username ? `darkMode_${username}` : 'darkMode';
        const savedDarkMode = localStorage.getItem(darkModeKey);

        if (savedDarkMode === 'true') {
            document.body.classList.add('dark-mode');
            const darkModeToggle = document.getElementById('darkModeToggle');
            if (darkModeToggle) {
                darkModeToggle.classList.add('active');
            }
        }
    }

    updateThemeColor(color) {
        const metaThemeColor = document.getElementById('theme-color-meta');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', color);
        }
    }

    // ========== DASHBOARD DE SERVIÇOS ==========

    getFilteredServiceData() {
        const periodFilter = document.getElementById('servicesPeriodFilter');
        const period = periodFilter ? periodFilter.value : 'all';
        const now = new Date();
        let cutoffDate = null;

        if (period === 'month') {
            cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        } else if (period === '3months') {
            cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        } else if (period === '6months') {
            cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        } else if (period === 'year') {
            cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        }

        if (!cutoffDate) {
            return this.serviceGroups || [];
        }

        return (this.serviceGroups || []).filter((group) => {
            const groupDate = new Date(group.month + '-01');
            return groupDate >= cutoffDate;
        });
    }

    renderServicesDashboard() {
        console.log('📊 [SERVICES DASHBOARD] Iniciando renderização...');

        if (typeof Chart === 'undefined' || window.chartJsLoaded === false) {
            console.warn(
                '⚠️ [SERVICES DASHBOARD] Chart.js não está carregado, aguardando...'
            );
            setTimeout(() => this.renderServicesDashboard(), 500);
            return;
        }

        const filteredGroups = this.getFilteredServiceData();
        this.renderHoursByMonthChart(filteredGroups);
        this.renderRevenueByMonthChart(filteredGroups);
        this.renderTopServicesChart(filteredGroups);
        this.renderHoursEvolutionChart(filteredGroups);
        this.renderAvgHoursPerDayChart(filteredGroups);
        this.renderAvgValuePerHourChart(filteredGroups);
        this.updateServicesDashboardStats(filteredGroups);
    }

    renderHoursByMonthChart(groups) {
        const ctx = document.getElementById('hoursByMonthChart');
        if (!ctx) return;

        const months = [];
        const hours = [];

        groups.forEach((group) => {
            const [year, monthNum] = group.month.split('-');
            const monthNames = [
                'Jan',
                'Fev',
                'Mar',
                'Abr',
                'Mai',
                'Jun',
                'Jul',
                'Ago',
                'Set',
                'Out',
                'Nov',
                'Dez',
            ];
            months.push(`${monthNames[parseInt(monthNum) - 1]}/${year}`);

            let totalHours = 0;
            let totalMinutes = 0;
            group.days.forEach((day) => {
                day.services.forEach((service) => {
                    totalHours += service.hours || 0;
                    totalMinutes += service.minutes || 0;
                });
            });
            totalHours += Math.floor(totalMinutes / 60);
            hours.push(totalHours + (totalMinutes % 60) / 60);
        });

        if (this.servicesCharts.hoursByMonth) {
            this.servicesCharts.hoursByMonth.destroy();
        }

        this.servicesCharts.hoursByMonth = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Horas Trabalhadas',
                        data: hours,
                        backgroundColor: 'rgba(40, 167, 69, 0.6)',
                        borderColor: 'rgba(40, 167, 69, 1)',
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return value.toFixed(1) + 'h';
                            },
                        },
                    },
                },
            },
        });
    }

    renderRevenueByMonthChart(groups) {
        const ctx = document.getElementById('revenueByMonthChart');
        if (!ctx) return;

        const months = [];
        const revenues = [];

        groups.forEach((group) => {
            const [year, monthNum] = group.month.split('-');
            const monthNames = [
                'Jan',
                'Fev',
                'Mar',
                'Abr',
                'Mai',
                'Jun',
                'Jul',
                'Ago',
                'Set',
                'Out',
                'Nov',
                'Dez',
            ];
            months.push(`${monthNames[parseInt(monthNum) - 1]}/${year}`);

            let totalRevenue = 0;
            group.days.forEach((day) => {
                day.services.forEach((service) => {
                    totalRevenue += service.price || 0;
                });
            });
            revenues.push(totalRevenue);
        });

        if (this.servicesCharts.revenueByMonth) {
            this.servicesCharts.revenueByMonth.destroy();
        }

        this.servicesCharts.revenueByMonth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Faturamento (R$)',
                        data: revenues,
                        borderColor: 'rgba(0, 123, 255, 1)',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return (
                                    'R$ ' + value.toFixed(2).replace('.', ',')
                                );
                            },
                        },
                    },
                },
            },
        });
    }

    renderTopServicesChart(groups) {
        const ctx = document.getElementById('topServicesChart');
        if (!ctx) return;

        const serviceCounts = {};
        groups.forEach((group) => {
            group.days.forEach((day) => {
                day.services.forEach((service) => {
                    if (!serviceCounts[service.itemId]) {
                        serviceCounts[service.itemId] = {
                            count: 0,
                            name: this.getItemName(service.itemId),
                        };
                    }
                    serviceCounts[service.itemId].count++;
                });
            });
        });

        const sortedServices = Object.entries(serviceCounts)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10);

        if (sortedServices.length === 0) {
            if (this.servicesCharts.topServices) {
                this.servicesCharts.topServices.destroy();
            }
            return;
        }

        const labels = sortedServices.map(([id, data]) =>
            data.name.length > 15
                ? data.name.substring(0, 15) + '...'
                : data.name
        );
        const counts = sortedServices.map(([id, data]) => data.count);

        if (this.servicesCharts.topServices) {
            this.servicesCharts.topServices.destroy();
        }

        this.servicesCharts.topServices = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [
                    {
                        data: counts,
                        backgroundColor: [
                            'rgba(40, 167, 69, 0.8)',
                            'rgba(0, 123, 255, 0.8)',
                            'rgba(255, 193, 7, 0.8)',
                            'rgba(220, 53, 69, 0.8)',
                            'rgba(108, 117, 125, 0.8)',
                            'rgba(23, 162, 184, 0.8)',
                            'rgba(111, 66, 193, 0.8)',
                            'rgba(253, 126, 20, 0.8)',
                            'rgba(32, 201, 151, 0.8)',
                            'rgba(233, 30, 99, 0.8)',
                        ],
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            },
        });
    }

    renderHoursEvolutionChart(groups) {
        const ctx = document.getElementById('hoursEvolutionChart');
        if (!ctx) return;

        const months = [];
        const hours = [];

        groups.forEach((group) => {
            const [year, monthNum] = group.month.split('-');
            const monthNames = [
                'Jan',
                'Fev',
                'Mar',
                'Abr',
                'Mai',
                'Jun',
                'Jul',
                'Ago',
                'Set',
                'Out',
                'Nov',
                'Dez',
            ];
            months.push(`${monthNames[parseInt(monthNum) - 1]}/${year}`);

            let totalHours = 0;
            let totalMinutes = 0;
            group.days.forEach((day) => {
                day.services.forEach((service) => {
                    totalHours += service.hours || 0;
                    totalMinutes += service.minutes || 0;
                });
            });
            totalHours += Math.floor(totalMinutes / 60);
            hours.push(totalHours + (totalMinutes % 60) / 60);
        });

        if (this.servicesCharts.hoursEvolution) {
            this.servicesCharts.hoursEvolution.destroy();
        }

        this.servicesCharts.hoursEvolution = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Horas Trabalhadas',
                        data: hours,
                        borderColor: 'rgba(40, 167, 69, 1)',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return value.toFixed(1) + 'h';
                            },
                        },
                    },
                },
            },
        });
    }

    renderAvgHoursPerDayChart(groups) {
        const ctx = document.getElementById('avgHoursPerDayChart');
        if (!ctx) return;

        const months = [];
        const avgHours = [];

        groups.forEach((group) => {
            const [year, monthNum] = group.month.split('-');
            const monthNames = [
                'Jan',
                'Fev',
                'Mar',
                'Abr',
                'Mai',
                'Jun',
                'Jul',
                'Ago',
                'Set',
                'Out',
                'Nov',
                'Dez',
            ];
            months.push(`${monthNames[parseInt(monthNum) - 1]}/${year}`);

            let totalHours = 0;
            let totalMinutes = 0;
            let daysWithServices = 0;

            group.days.forEach((day) => {
                if (day.services.length > 0) {
                    daysWithServices++;
                    day.services.forEach((service) => {
                        totalHours += service.hours || 0;
                        totalMinutes += service.minutes || 0;
                    });
                }
            });

            if (daysWithServices > 0) {
                const totalHoursDecimal = totalHours + totalMinutes / 60;
                avgHours.push(totalHoursDecimal / daysWithServices);
            } else {
                avgHours.push(0);
            }
        });

        if (this.servicesCharts.avgHoursPerDay) {
            this.servicesCharts.avgHoursPerDay.destroy();
        }

        this.servicesCharts.avgHoursPerDay = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Média de Horas por Dia',
                        data: avgHours,
                        backgroundColor: 'rgba(255, 193, 7, 0.6)',
                        borderColor: 'rgba(255, 193, 7, 1)',
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return value.toFixed(1) + 'h';
                            },
                        },
                    },
                },
            },
        });
    }

    renderAvgValuePerHourChart(groups) {
        const ctx = document.getElementById('avgValuePerHourChart');
        if (!ctx) return;

        const months = [];
        const avgValues = [];

        groups.forEach((group) => {
            const [year, monthNum] = group.month.split('-');
            const monthNames = [
                'Jan',
                'Fev',
                'Mar',
                'Abr',
                'Mai',
                'Jun',
                'Jul',
                'Ago',
                'Set',
                'Out',
                'Nov',
                'Dez',
            ];
            months.push(`${monthNames[parseInt(monthNum) - 1]}/${year}`);

            let totalHours = 0;
            let totalMinutes = 0;
            let totalRevenue = 0;

            group.days.forEach((day) => {
                day.services.forEach((service) => {
                    totalHours += service.hours || 0;
                    totalMinutes += service.minutes || 0;
                    totalRevenue += service.price || 0;
                });
            });

            const totalHoursDecimal = totalHours + totalMinutes / 60;
            if (totalHoursDecimal > 0) {
                avgValues.push(totalRevenue / totalHoursDecimal);
            } else {
                avgValues.push(0);
            }
        });

        if (this.servicesCharts.avgValuePerHour) {
            this.servicesCharts.avgValuePerHour.destroy();
        }

        this.servicesCharts.avgValuePerHour = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Valor Médio por Hora (R$)',
                        data: avgValues,
                        borderColor: 'rgba(111, 66, 193, 1)',
                        backgroundColor: 'rgba(111, 66, 193, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return (
                                    'R$ ' + value.toFixed(2).replace('.', ',')
                                );
                            },
                        },
                    },
                },
            },
        });
    }

    updateServicesDashboardStats(groups) {
        let totalHours = 0;
        let totalMinutes = 0;
        let totalRevenue = 0;
        let totalServices = 0;
        const monthStats = [];

        groups.forEach((group) => {
            let monthHours = 0;
            let monthMinutes = 0;
            let monthRevenue = 0;
            let monthServices = 0;

            group.days.forEach((day) => {
                day.services.forEach((service) => {
                    monthHours += service.hours || 0;
                    monthMinutes += service.minutes || 0;
                    monthRevenue += service.price || 0;
                    monthServices++;
                });
            });

            monthHours += Math.floor(monthMinutes / 60);
            monthMinutes = monthMinutes % 60;

            totalHours += monthHours;
            totalMinutes += monthMinutes;
            totalRevenue += monthRevenue;
            totalServices += monthServices;

            const [year, monthNum] = group.month.split('-');
            const monthNames = [
                'Janeiro',
                'Fevereiro',
                'Março',
                'Abril',
                'Maio',
                'Junho',
                'Julho',
                'Agosto',
                'Setembro',
                'Outubro',
                'Novembro',
                'Dezembro',
            ];
            monthStats.push({
                month: `${monthNames[parseInt(monthNum) - 1]}/${year}`,
                hours: monthHours + monthMinutes / 60,
                revenue: monthRevenue,
            });
        });

        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;

        const monthCount = groups.length;
        const avgHours =
            monthCount > 0 ? (totalHours + totalMinutes / 60) / monthCount : 0;
        const avgHoursInt = Math.floor(avgHours);
        const avgMinutesInt = Math.floor((avgHours - avgHoursInt) * 60);

        const avgRevenue = monthCount > 0 ? totalRevenue / monthCount : 0;

        const bestMonthHours =
            monthStats.length > 0
                ? monthStats.reduce(
                      (best, current) =>
                          current.hours > best.hours ? current : best,
                      monthStats[0]
                  )
                : null;

        const bestMonthRevenue =
            monthStats.length > 0
                ? monthStats.reduce(
                      (best, current) =>
                          current.revenue > best.revenue ? current : best,
                      monthStats[0]
                  )
                : null;

        const totalHoursDecimal = totalHours + totalMinutes / 60;
        const avgValuePerHour =
            totalHoursDecimal > 0 ? totalRevenue / totalHoursDecimal : 0;

        // Atualizar elementos
        const avgMonthlyHoursEl = document.getElementById(
            'servicesAvgMonthlyHours'
        );
        const bestMonthHoursEl = document.getElementById(
            'servicesBestMonthHours'
        );
        const avgMonthlyRevenueEl = document.getElementById(
            'servicesAvgMonthlyRevenue'
        );
        const bestMonthRevenueEl = document.getElementById(
            'servicesBestMonthRevenue'
        );
        const avgValuePerHourEl = document.getElementById(
            'servicesDashboardAvgValuePerHour'
        );
        const totalServicesEl = document.getElementById(
            'servicesDashboardTotalServices'
        );

        if (avgMonthlyHoursEl) {
            const hoursText = `${avgHoursInt}h ${avgMinutesInt}min`;
            avgMonthlyHoursEl.textContent = hoursText;
            avgMonthlyHoursEl.setAttribute('title', hoursText);
        }
        if (bestMonthHoursEl) {
            const monthText = bestMonthHours ? bestMonthHours.month : '-';
            bestMonthHoursEl.textContent = monthText;
            // Adicionar tooltip com o valor completo
            if (bestMonthHours) {
                const tooltipText = `${
                    bestMonthHours.month
                } - ${bestMonthHours.hours.toFixed(1)}h`;
                bestMonthHoursEl.setAttribute('title', tooltipText);
            } else {
                bestMonthHoursEl.removeAttribute('title');
            }
        }
        if (avgMonthlyRevenueEl) {
            const revenueText = `R$ ${avgRevenue.toFixed(2).replace('.', ',')}`;
            avgMonthlyRevenueEl.textContent = revenueText;
            avgMonthlyRevenueEl.setAttribute('title', revenueText);
        }
        if (bestMonthRevenueEl) {
            const monthText = bestMonthRevenue ? bestMonthRevenue.month : '-';
            bestMonthRevenueEl.textContent = monthText;
            // Adicionar tooltip com o valor completo
            if (bestMonthRevenue) {
                const tooltipText = `${
                    bestMonthRevenue.month
                } - R$ ${bestMonthRevenue.revenue
                    .toFixed(2)
                    .replace('.', ',')}`;
                bestMonthRevenueEl.setAttribute('title', tooltipText);
            } else {
                bestMonthRevenueEl.removeAttribute('title');
            }
        }
        if (avgValuePerHourEl) {
            const valueText = `R$ ${avgValuePerHour
                .toFixed(2)
                .replace('.', ',')}`;
            avgValuePerHourEl.textContent = valueText;
            avgValuePerHourEl.setAttribute('title', valueText);
        }
        if (totalServicesEl) {
            const totalText = totalServices.toString();
            totalServicesEl.textContent = totalText;
            totalServicesEl.setAttribute(
                'title',
                `Total: ${totalText} serviços`
            );
        }
    }

    // ========== PERSISTÊNCIA DE DADOS ==========

    async saveData() {
        // Obter username do sessionStorage
        const username = sessionStorage.getItem('username');

        if (!username) {
            console.warn(
                '⚠️ [SAVE DATA] Username não encontrado no sessionStorage, salvando apenas localmente'
            );
        }

        // Obter tema atual do usuário
        const themeKey = username ? `appTheme_${username}` : 'appTheme';
        const currentTheme = localStorage.getItem(themeKey) || 'red';

        // Preparar dados (criptografar campos sensíveis se habilitado)
        let clientsData = this.clients || [];
        let suppliersData = this.suppliers || [];
        
        if (this.encryptionEnabled && username) {
            try {
                clientsData = await this.encryptClientData(clientsData, username);
                suppliersData = await this.encryptClientData(suppliersData, username);
            } catch (error) {
                console.error('Erro ao criptografar dados antes de salvar:', error);
                // Continuar sem criptografia em caso de erro
            }
        }

        const data = {
            items: this.items,
            groups: this.groups,
            serviceGroups: this.serviceGroups || [], // Grupos mensais de serviços
            costs: this.costs,
            goals: this.goals,
            clients: clientsData, // Clientes (criptografados se habilitado)
            clientNotifications: this.clientNotifications || [], // Notificações para clientes
            suppliers: suppliersData, // Fornecedores (criptografados se habilitado)
            completedSales: this.completedSales || [],
            pendingOrders: this.pendingOrders || [],
            serviceAppointments: this.serviceAppointments || [],
            coupons: this.coupons || [], // Cupons de desconto
            auditLog: this.auditLog || [], // Histórico de alterações
            templates: this.templates || [], // Templates
            itemTags: this.itemTags || {}, // Tags por item
            categoryHierarchy: this.categoryHierarchy || {}, // Hierarquia de categorias
            paymentConfig: this.paymentConfig || {}, // Configurações de pagamento
            ecommerceConfig: this.ecommerceConfig || {}, // Configurações de e-commerce
            erpConfig: this.erpConfig || {}, // Configurações de ERPs
            emailConfig: this.emailConfig || {}, // Configurações de email
            smsConfig: this.smsConfig || {}, // Configurações de SMS
            dataAccessLogs: this.dataAccessLogs || [], // Logs de acesso a dados pessoais (LGPD)
            scheduledReports: this.scheduledReports || [], // Relatórios agendados
            sharedReports: this.sharedReports || [], // Relatórios compartilhados
            scheduledExports: this.scheduledExports || [], // Exportações agendadas
            emailTracking: this.emailTracking || {}, // Tracking de abertura de emails
            whatsappConfig: this.whatsappConfig || {}, // Configurações de WhatsApp
            whatsappChats: this.whatsappChats || [], // Chats com clientes
            whatsappAutomations: this.whatsappAutomations || [], // Automações de mensagens
            theme: currentTheme, // Salvar tema por usuário
            encryptionEnabled: this.encryptionEnabled, // Flag de criptografia
            version: '1.0',
            lastUpdate: new Date().toISOString(),
        };

        // Salvar no localStorage por usuário (sempre)
        try {
            const localStorageKey = username
                ? `lojaData_${username}`
                : 'lojaData';
            localStorage.setItem(localStorageKey, JSON.stringify(data));
            console.log(
                `💾 [SAVE DATA] Dados salvos no localStorage (chave: ${localStorageKey})`
            );
        } catch (e) {
            console.error('❌ [SAVE DATA] Erro ao salvar no localStorage:', e);
        }

        // Tentar salvar na nuvem (se estiver na Vercel e tiver username)
        if (!username) {
            console.warn(
                '⚠️ [SAVE DATA] Username não disponível, pulando salvamento na nuvem'
            );
            return;
        }

        try {
            console.log(
                `☁️ [SAVE DATA] Tentando salvar na nuvem (API: /api/save) para usuário: ${username}...`
            );
            
            // Verificar rate limiting antes de fazer requisição
            const rateLimitCheck = this.canMakeRequest();
            if (!rateLimitCheck.allowed) {
                console.warn(`⚠️ [SAVE DATA] Rate limit atingido. Aguardando ${rateLimitCheck.remainingSeconds} segundos...`);
                if (typeof toast !== 'undefined' && toast) {
                    toast.warning(`Muitas requisições. Aguarde ${rateLimitCheck.remainingSeconds} segundos.`, 3000);
                }
                // Salvar localmente mesmo assim
                return;
            }
            
            const response = await this.makeRequestWithRateLimit('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    data: data,
                }),
            });

            console.log(
                `📡 [SAVE DATA] Status HTTP: ${response.status} ${response.statusText}`
            );

            // Tratar erro 504 (Gateway Timeout) especificamente
            if (response.status === 504) {
                const text = await response.text();
                console.warn('⚠️ [SAVE DATA] Erro 504 (Gateway Timeout) - A API demorou muito para responder');
                console.warn('💾 [SAVE DATA] Dados foram salvos localmente, mas não na nuvem');
                console.warn('💡 [SAVE DATA] Isso pode acontecer se o servidor estiver sobrecarregado');
                // Não lançar erro para não bloquear a interface
                return;
            }

            // Verificar se a resposta é JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ [SAVE DATA] Resposta da API não é JSON!');
                console.error(`❌ [SAVE DATA] Status: ${response.status}`);
                console.error(
                    `❌ [SAVE DATA] Resposta (primeiros 200 chars):`,
                    text.substring(0, 200)
                );

                if (response.status === 404) {
                    console.error(
                        '❌ [SAVE DATA] Erro 404: Rota /api/save não encontrada'
                    );
                    console.error(
                        '💡 [SAVE DATA] Verifique se a API está configurada corretamente na Vercel'
                    );
                }

                // Para outros erros, não bloquear a interface
                if (response.status >= 500) {
                    console.warn('⚠️ [SAVE DATA] Erro do servidor - dados salvos apenas localmente');
                    return;
                }

                throw new Error(
                    `Resposta da API não é JSON (Status: ${response.status})`
                );
            }

            const result = await response.json();
            console.log('📦 [SAVE DATA] Resposta JSON recebida:', {
                success: result.success,
                hasError: !!result.error,
                hasMessage: !!result.message,
            });

            if (response.ok && result.success) {
                console.log(
                    '✅ [SAVE DATA] Dados salvos na nuvem com sucesso!'
                );
            } else {
                if (
                    result.error &&
                    result.error.includes('não estão definidas')
                ) {
                    console.warn(
                        '⚠️ [SAVE DATA] Variáveis de ambiente não configuradas na Vercel'
                    );
                    console.warn(
                        '💡 [SAVE DATA] Configure JSONBIN_API_KEY e JSONBIN_BIN_ID no painel da Vercel para habilitar sincronização na nuvem'
                    );
                } else {
                    console.warn(
                        '⚠️ [SAVE DATA] Erro ao salvar na nuvem:',
                        result.error || result.message
                    );
                    console.warn(
                        '💾 [SAVE DATA] Dados salvos apenas localmente (localStorage)'
                    );
                }
                if (!response.ok) {
                    console.error(
                        `❌ [SAVE DATA] HTTP ${response.status}: ${response.statusText}`
                    );
                }
            }
        } catch (error) {
            // Se não houver API, usar apenas localStorage (modo offline)
            console.warn('⚠️ [SAVE DATA] Erro ao salvar na nuvem:', error);
            console.warn(
                '⚠️ [SAVE DATA] Tipo do erro:',
                error.constructor.name
            );
            console.warn('⚠️ [SAVE DATA] Mensagem:', error.message);
            console.log(
                '📱 [SAVE DATA] Modo offline: dados salvos apenas localmente'
            );
            console.log(
                'ℹ️ [SAVE DATA] Isso é normal se você estiver testando localmente (localhost)'
            );
        }
    }

    async loadData() {
        console.log('🔄 [LOAD DATA] Iniciando carregamento de dados...');

        // Obter username do sessionStorage
        const username = sessionStorage.getItem('username');

        if (!username) {
            console.warn(
                '⚠️ [LOAD DATA] Username não encontrado no sessionStorage, carregando apenas do localStorage'
            );
        }

        // Tentar carregar da nuvem primeiro (se tiver username)
        if (username) {
            try {
                console.log(
                    `☁️ [LOAD DATA] Tentando carregar da nuvem (API: /api/load) para usuário: ${username}...`
                );
                
                // Verificar rate limiting antes de fazer requisição
                const rateLimitCheck = this.canMakeRequest();
                if (!rateLimitCheck.allowed) {
                    console.warn(`⚠️ [LOAD DATA] Rate limit atingido. Aguardando ${rateLimitCheck.remainingSeconds} segundos...`);
                    // Continuar com localStorage como fallback
                } else {
                    const response = await this.makeRequestWithRateLimit(
                        `/api/load?username=${encodeURIComponent(username)}`,
                        {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    console.log(
                        `📡 [LOAD DATA] Status HTTP: ${response.status} ${response.statusText}`
                    );

                    // Verificar se a resposta é JSON antes de fazer parse
                    const contentType = response.headers.get('content-type');
                    console.log(
                        `📋 [LOAD DATA] Content-Type: ${
                            contentType || 'não especificado'
                        }`
                    );

                    if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('❌ [LOAD DATA] Resposta da API não é JSON!');
                    console.error(`❌ [LOAD DATA] Status: ${response.status}`);
                    console.error(
                        `❌ [LOAD DATA] Resposta (primeiros 200 chars):`,
                        text.substring(0, 200)
                    );

                    if (response.status === 404) {
                        console.error(
                            '❌ [LOAD DATA] Erro 404: Rota /api/load não encontrada'
                        );
                        console.error(
                            '💡 [LOAD DATA] Verifique se a API está configurada corretamente na Vercel'
                        );
                    } else if (response.status >= 500) {
                        console.error('❌ [LOAD DATA] Erro do servidor (5xx)');
                    }

                        throw new Error(
                            `Resposta da API não é JSON (Status: ${response.status}). Possível erro 404 ou rota não encontrada.`
                        );
                    }

                    const result = await response.json();
                    console.log('📦 [LOAD DATA] Resposta JSON recebida:', {
                    success: result.success,
                    hasData: !!result.data,
                    hasError: !!result.error,
                        hasMessage: !!result.message,
                    });

                    if (response.ok && result.success && result.data) {
                    const cloudData = result.data;

                    // Verificar se há dados ou se é apenas estrutura vazia
                    const hasData =
                        (cloudData.items && cloudData.items.length > 0) ||
                        (cloudData.groups && cloudData.groups.length > 0) ||
                        (cloudData.serviceGroups &&
                            cloudData.serviceGroups.length > 0) ||
                        (cloudData.costs && cloudData.costs.length > 0) ||
                        (cloudData.goals && cloudData.goals.length > 0) ||
                        (cloudData.clients && cloudData.clients.length > 0);

                    if (hasData) {
                        // Dados da nuvem encontrados
                        this.items = cloudData.items || [];
                        this.groups = cloudData.groups || [];
                        this.serviceGroups = cloudData.serviceGroups || [];
                        this.costs = cloudData.costs || [];
                        this.goals = cloudData.goals || [];
                        
                        // Descriptografar dados sensíveis se necessário
                        let clientsData = cloudData.clients || [];
                        let suppliersData = cloudData.suppliers || [];
                        
                        if (cloudData.encryptionEnabled && username) {
                            try {
                                clientsData = await this.decryptClientData(clientsData, username);
                                suppliersData = await this.decryptClientData(suppliersData, username);
                            } catch (error) {
                                console.error('Erro ao descriptografar dados ao carregar:', error);
                                // Continuar com dados criptografados em caso de erro
                            }
                        }
                        
                        this.clients = clientsData;
                        this.clientNotifications = cloudData.clientNotifications || [];
                        this.suppliers = suppliersData;
                        
                        // Atualizar flag de criptografia
                        if (cloudData.encryptionEnabled !== undefined) {
                            this.encryptionEnabled = cloudData.encryptionEnabled;
                        }
                        this.completedSales = cloudData.completedSales || [];
                        this.pendingOrders = cloudData.pendingOrders || [];
                        this.serviceAppointments =
                            cloudData.serviceAppointments || [];
                        this.coupons = cloudData.coupons || [];
                        this.auditLog = cloudData.auditLog || [];
                        this.templates = cloudData.templates || [];
                        this.itemTags = cloudData.itemTags || {};
                        this.categoryHierarchy = cloudData.categoryHierarchy || {};
                        this.paymentConfig = cloudData.paymentConfig || this.paymentConfig;
                        this.ecommerceConfig = cloudData.ecommerceConfig || this.ecommerceConfig;
                        this.erpConfig = cloudData.erpConfig || this.erpConfig;
                        this.emailConfig = cloudData.emailConfig || this.emailConfig;
                        this.smsConfig = cloudData.smsConfig || this.smsConfig;
                        this.scheduledReports = cloudData.scheduledReports || [];
                        this.sharedReports = cloudData.sharedReports || [];
                        this.scheduledExports = cloudData.scheduledExports || [];
                        this.emailTracking = cloudData.emailTracking || {};
                        this.whatsappConfig = cloudData.whatsappConfig || this.whatsappConfig;
                        this.whatsappChats = cloudData.whatsappChats || [];
                        this.whatsappAutomations = cloudData.whatsappAutomations || [];
                        
                        // Gerar tags automáticas se habilitado
                        if (this.autoTagsEnabled) {
                            setTimeout(() => {
                                this.generateAutoTagsFromSales();
                            }, 2000); // Aguardar 2 segundos após carregar dados
                        }
                        
                        // Gerar tags automáticas se habilitado
                        if (this.autoTagsEnabled) {
                            setTimeout(() => {
                                this.generateAutoTagsFromSales();
                            }, 2000); // Aguardar 2 segundos após carregar dados
                        }

                        console.log(
                            `📋 [LOAD DATA] Comprovantes carregados: ${this.completedSales.length}`
                        );
                        if (this.completedSales.length > 0) {
                            console.log(
                                '📋 [LOAD DATA] Primeiro comprovante:',
                                {
                                    id: this.completedSales[0].id,
                                    name: this.completedSales[0].customerName,
                                    date: this.completedSales[0].date,
                                    total: this.completedSales[0].totalValue
                                }
                            );
                        }

                        // Carregar tema do JSONBin se existir
                        if (cloudData.theme) {
                            const themeKey = username
                                ? `appTheme_${username}`
                                : 'appTheme';
                            localStorage.setItem(themeKey, cloudData.theme);
                            // Aplicar tema imediatamente
                            if (cloudData.theme === 'blue') {
                                document.body.classList.add('theme-blue');
                                this.updateThemeColor('#007bff');
                            } else {
                                document.body.classList.remove('theme-blue');
                                this.updateThemeColor('#dc3545');
                            }
                        }

                        // Migração: adicionar categoria "Roupas" para itens antigos sem categoria
                        let needsSave = false;
                        this.items = this.items.map((item) => {
                            if (!item.category) {
                                item.category = 'Roupas';
                                needsSave = true;
                            }
                            return item;
                        });

                        // Migração: adicionar stock: {} para dias antigos sem estoque
                        this.groups.forEach((group) => {
                            group.days.forEach((day) => {
                                if (!day.stock) {
                                    day.stock = {};
                                    needsSave = true;
                                }
                            });
                        });

                        // Se houve migração, salvar novamente
                        if (needsSave) {
                            const updatedData = {
                                items: this.items,
                                groups: this.groups,
                                serviceGroups: this.serviceGroups || [],
                                costs: this.costs,
                                goals: this.goals,
                            };
                            localStorage.setItem(
                                'lojaData',
                                JSON.stringify(updatedData)
                            );
                            this.saveData(); // Salvar na nuvem também
                        } else {
                            // Sincronizar com localStorage
                            localStorage.setItem(
                                'lojaData',
                                JSON.stringify(cloudData)
                            );
                        }

                        console.log(
                            '✅ [LOAD DATA] Dados carregados da nuvem com sucesso!'
                        );
                        console.log(
                            `📊 [LOAD DATA] Items: ${this.items.length} | Grupos: ${this.groups.length} | Custos: ${this.costs.length} | Metas: ${this.goals.length} | Comprovantes: ${this.completedSales.length}`
                        );
                        return Promise.resolve();
                    } else {
                        console.log(
                            'ℹ️ [LOAD DATA] Nenhum dado encontrado na nuvem (bin vazio ou apenas estrutura vazia)'
                        );
                        console.log(
                            `📊 [LOAD DATA] Estrutura: Items: ${
                                cloudData.items?.length || 0
                            } | Grupos: ${
                                cloudData.groups?.length || 0
                            } | Custos: ${
                                cloudData.costs?.length || 0
                            } | Metas: ${cloudData.goals?.length || 0}`
                        );
                    }
                } else {
                    // Resposta não OK ou sem sucesso
                    if (result.error) {
                        console.error(
                            '❌ [LOAD DATA] Erro na resposta da API:',
                            result.error
                        );
                        if (result.error.includes('não estão definidas')) {
                            console.warn(
                                '⚠️ [LOAD DATA] Variáveis de ambiente não configuradas na Vercel'
                            );
                            console.warn(
                                '💡 [LOAD DATA] Configure JSONBIN_API_KEY e JSONBIN_BIN_ID no painel da Vercel'
                            );
                        }
                    }
                    if (result.message) {
                        console.warn(
                            '⚠️ [LOAD DATA] Mensagem da API:',
                            result.message
                        );
                    }
                    if (!response.ok) {
                        console.error(
                            `❌ [LOAD DATA] HTTP ${response.status}: ${response.statusText}`
                        );
                    }
                }
                }
            } catch (error) {
                console.error(
                    '❌ [LOAD DATA] Erro ao carregar da nuvem:',
                    error
                );
                console.error(
                    '❌ [LOAD DATA] Tipo do erro:',
                    error.constructor.name
                );
                console.error('❌ [LOAD DATA] Mensagem:', error.message);
                if (error.stack) {
                    console.error('❌ [LOAD DATA] Stack:', error.stack);
                }
                console.log(
                    '💾 [LOAD DATA] Usando localStorage como fallback...'
                );
            }
        } else {
            console.log(
                '💾 [LOAD DATA] Username não disponível, carregando apenas do localStorage...'
            );
        }

        // Fallback: carregar do localStorage (por usuário)
        console.log('💾 [LOAD DATA] Verificando localStorage...');
        const localStorageKey = username ? `lojaData_${username}` : 'lojaData';
        let saved = localStorage.getItem(localStorageKey);

        // Migração: Se não encontrou dados por usuário, tentar dados antigos (sem username)
        if (!saved && username) {
            const oldData = localStorage.getItem('lojaData');
            if (oldData) {
                console.log(
                    '🔄 [LOAD DATA] Dados antigos encontrados (sem username), migrando...'
                );
                // Migrar dados antigos para a nova chave do usuário
                localStorage.setItem(localStorageKey, oldData);
                saved = oldData;
                console.log(
                    `✅ [LOAD DATA] Dados migrados para chave: ${localStorageKey}`
                );
            }
        }

        if (saved) {
            try {
                console.log(
                    '📦 [LOAD DATA] Dados encontrados no localStorage, parseando...'
                );
                const data = JSON.parse(saved);
                this.items = data.items || [];
                this.groups = data.groups || [];
                this.serviceGroups = data.serviceGroups || [];
                this.costs = data.costs || [];
                this.goals = data.goals || [];
                this.clients = data.clients || [];
                this.clientNotifications = data.clientNotifications || [];
                this.suppliers = data.suppliers || [];
                this.completedSales = data.completedSales || [];
                this.pendingOrders = data.pendingOrders || [];
                this.serviceAppointments = data.serviceAppointments || [];
                this.coupons = data.coupons || [];
                this.auditLog = data.auditLog || [];
                this.templates = data.templates || [];
                this.itemTags = data.itemTags || {};
                this.categoryHierarchy = data.categoryHierarchy || {};
                this.paymentConfig = data.paymentConfig || this.paymentConfig;
                this.ecommerceConfig = data.ecommerceConfig || this.ecommerceConfig;
                this.erpConfig = data.erpConfig || this.erpConfig;
                this.emailConfig = data.emailConfig || this.emailConfig;
                this.smsConfig = data.smsConfig || this.smsConfig;
                this.dataAccessLogs = data.dataAccessLogs || [];
                this.scheduledReports = data.scheduledReports || [];
                this.sharedReports = data.sharedReports || [];
                this.scheduledExports = data.scheduledExports || [];
                this.emailTracking = data.emailTracking || {};
                this.whatsappConfig = data.whatsappConfig || this.whatsappConfig;
                this.whatsappChats = data.whatsappChats || [];
                this.whatsappAutomations = data.whatsappAutomations || [];

                console.log(
                    `📋 [LOAD DATA] Comprovantes carregados do localStorage: ${this.completedSales.length}`
                );
                if (this.completedSales.length > 0) {
                    console.log(
                        '📋 [LOAD DATA] Primeiro comprovante:',
                        {
                            id: this.completedSales[0].id,
                            name: this.completedSales[0].customerName,
                            date: this.completedSales[0].date,
                            total: this.completedSales[0].totalValue
                        }
                    );
                }

                // Carregar tema do localStorage se existir
                if (data.theme) {
                    const themeKey = username
                        ? `appTheme_${username}`
                        : 'appTheme';
                    localStorage.setItem(themeKey, data.theme);
                    // Aplicar tema imediatamente
                    if (data.theme === 'blue') {
                        document.body.classList.add('theme-blue');
                        this.updateThemeColor('#007bff');
                    } else {
                        document.body.classList.remove('theme-blue');
                        this.updateThemeColor('#dc3545');
                    }
                    console.log(
                        `✅ [LOAD DATA] Tema carregado do localStorage: ${data.theme}`
                    );
                }

                // Migração: adicionar categoria "Roupas" para itens antigos sem categoria
                let needsSave = false;
                this.items = this.items.map((item) => {
                    if (!item.category) {
                        item.category = 'Roupas';
                        needsSave = true;
                    }
                    return item;
                });

                // Migração: adicionar stock: {} para dias antigos sem estoque
                this.groups.forEach((group) => {
                    group.days.forEach((day) => {
                        if (!day.stock) {
                            day.stock = {};
                            needsSave = true;
                        }
                    });
                });

                // Se houve migração, salvar novamente
                if (needsSave) {
                    console.log(
                        '🔄 [LOAD DATA] Migração de dados detectada, salvando...'
                    );
                    const updatedData = {
                        items: this.items,
                        groups: this.groups,
                        serviceGroups: this.serviceGroups || [],
                        costs: this.costs,
                        goals: this.goals,
                    };
                    localStorage.setItem(
                        localStorageKey,
                        JSON.stringify(updatedData)
                    );
                    this.saveData(); // Salvar na nuvem também
                }

                console.log(
                    '✅ [LOAD DATA] Dados carregados do localStorage com sucesso!'
                );
                console.log(
                    `📊 [LOAD DATA] Items: ${this.items.length} | Grupos: ${this.groups.length} | Custos: ${this.costs.length} | Metas: ${this.goals.length}`
                );
            } catch (e) {
                console.error(
                    '❌ [LOAD DATA] Erro ao carregar dados do localStorage:',
                    e
                );
                console.error(
                    '❌ [LOAD DATA] Tipo do erro:',
                    e.constructor.name
                );
                console.error('❌ [LOAD DATA] Mensagem:', e.message);
                if (e.stack) {
                    console.error('❌ [LOAD DATA] Stack:', e.stack);
                }
                console.warn(
                    '⚠️ [LOAD DATA] Inicializando com dados vazios devido ao erro'
                );
                this.items = [];
                this.groups = [];
                this.costs = [];
                this.goals = [];
            }
        } else {
            console.log(
                'ℹ️ [LOAD DATA] Nenhum dado encontrado no localStorage, iniciando vazio'
            );
        }

        console.log('✅ [LOAD DATA] Carregamento de dados concluído');
        return Promise.resolve();
    }

    exportData() {
        // Verificar permissão de exportação
        if (!this.checkPermission('export')) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Você não tem permissão para exportar dados.', 3000);
            } else {
                alert('Você não tem permissão para exportar dados.');
            }
            return;
        }
        
        const data = {
            items: this.items,
            groups: this.groups,
            costs: this.costs,
            goals: this.goals,
            version: '1.0',
            exportDate: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'text/plain',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `loja_backup_${
            new Date().toISOString().split('T')[0]
        }.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ========== SISTEMA DE BACKUP AUTOMÁTICO ==========

    // Criar checksum simples para verificação de integridade
    generateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16);
    }

    // Criar backup manual
    async createManualBackup() {
        const username = sessionStorage.getItem('username');
        if (!username) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Usuário não autenticado. Faça login novamente.', 3000);
            }
            return;
        }

        try {
            // Preparar dados do backup (criptografar se habilitado)
            let backupData = {
                items: this.items,
                groups: this.groups,
                serviceGroups: this.serviceGroups,
                costs: this.costs,
                goals: this.goals,
                clients: this.clients,
                clientNotifications: this.clientNotifications,
                suppliers: this.suppliers,
                completedSales: this.completedSales,
                pendingOrders: this.pendingOrders,
                serviceAppointments: this.serviceAppointments,
                coupons: this.coupons,
                auditLog: this.auditLog,
                templates: this.templates,
                itemTags: this.itemTags,
                version: '1.0',
                timestamp: new Date().toISOString(),
            };

            // Criptografar backup se habilitado
            if (this.encryptionEnabled && username) {
                try {
                    backupData = await this.encryptBackup(backupData, username);
                    backupData.encrypted = true;
                } catch (error) {
                    console.error('Erro ao criptografar backup:', error);
                    // Continuar sem criptografia em caso de erro
                }
            }

            const checksum = this.generateChecksum(backupData);
            const backup = {
                id: 'BACKUP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                data: backupData,
                checksum: checksum,
                type: 'manual',
                username: username,
            };

            // Adicionar ao histórico (limitar a 50 backups)
            this.backupHistory.unshift(backup);
            if (this.backupHistory.length > 50) {
                this.backupHistory = this.backupHistory.slice(0, 50);
            }

            // Salvar histórico no localStorage
            const backupHistoryKey = `backupHistory_${username}`;
            localStorage.setItem(backupHistoryKey, JSON.stringify(this.backupHistory));

            this.lastBackupTime = new Date();
            this.saveData();
            this.renderBackupHistory();

            // Registrar no audit log
            this.logAction('export', 'backup', backup.id, 'Backup Manual', {
                checksum: checksum,
                itemsCount: this.items.length,
                groupsCount: this.groups.length,
            });

            if (typeof toast !== 'undefined' && toast) {
                toast.success('Backup criado com sucesso!', 3000);
            }
        } catch (error) {
            console.error('Erro ao criar backup:', error);
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Erro ao criar backup. Verifique o console para mais detalhes.', 4000);
            }
        }
    }

    // Configurar backup automático
    configureAutoBackup() {
        const enabled = document.getElementById('autoBackupEnabled')?.checked || false;
        const frequency = document.getElementById('autoBackupFrequency')?.value || 'daily';

        if (enabled) {
            this.startAutoBackup(frequency);
        } else {
            this.stopAutoBackup();
        }

        // Salvar configuração
        const username = sessionStorage.getItem('username');
        if (username) {
            const config = {
                enabled: enabled,
                frequency: frequency,
            };
            localStorage.setItem(`autoBackupConfig_${username}`, JSON.stringify(config));
        }
    }

    // Iniciar backup automático
    startAutoBackup(frequency = 'daily') {
        this.stopAutoBackup(); // Parar qualquer backup automático existente

        const intervalMs = frequency === 'daily' 
            ? 24 * 60 * 60 * 1000 // 24 horas
            : 7 * 24 * 60 * 60 * 1000; // 7 dias

        this.backupInterval = setInterval(() => {
            this.createAutoBackup();
        }, intervalMs);

        // Criar backup imediatamente se ainda não foi criado hoje
        if (!this.lastBackupTime || this.shouldCreateBackup(frequency)) {
            this.createAutoBackup();
        }

        if (typeof toast !== 'undefined' && toast) {
            toast.info(`Backup automático ${frequency === 'daily' ? 'diário' : 'semanal'} ativado!`, 3000);
        }
    }

    // Parar backup automático
    stopAutoBackup() {
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
            this.backupInterval = null;
        }
    }

    // Verificar se deve criar backup
    shouldCreateBackup(frequency) {
        if (!this.lastBackupTime) return true;

        const now = new Date();
        const lastBackup = new Date(this.lastBackupTime);
        const diffMs = now - lastBackup;

        if (frequency === 'daily') {
            return diffMs >= 24 * 60 * 60 * 1000; // 24 horas
        } else {
            return diffMs >= 7 * 24 * 60 * 60 * 1000; // 7 dias
        }
    }

    /**
     * Criar backup automático com múltiplos pontos de armazenamento
     * @description Cria backup em localStorage, IndexedDB, JSONBin (nuvem) e opcionalmente download
     * @returns {Promise<void>}
     */
    async createAutoBackup() {
        const username = sessionStorage.getItem('username');
        if (!username) return;

        try {
            // Preparar dados do backup (criptografar se habilitado)
            let backupData = {
                items: this.items,
                groups: this.groups,
                serviceGroups: this.serviceGroups,
                costs: this.costs,
                goals: this.goals,
                clients: this.clients,
                clientNotifications: this.clientNotifications,
                suppliers: this.suppliers,
                completedSales: this.completedSales,
                pendingOrders: this.pendingOrders,
                serviceAppointments: this.serviceAppointments,
                coupons: this.coupons,
                auditLog: this.auditLog,
                templates: this.templates,
                itemTags: this.itemTags,
                version: '1.0',
                timestamp: new Date().toISOString(),
            };

            // Criptografar backup se habilitado
            if (this.encryptionEnabled && username) {
                try {
                    backupData = await this.encryptBackup(backupData, username);
                    backupData.encrypted = true;
                } catch (error) {
                    console.error('Erro ao criptografar backup automático:', error);
                    // Continuar sem criptografia em caso de erro
                }
            }

            const checksum = this.generateChecksum(backupData);
            const backup = {
                id: 'BACKUP_AUTO_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                data: backupData,
                checksum: checksum,
                type: 'auto',
                username: username,
                storagePoints: [], // Array para rastrear onde o backup foi salvo
            };

            // PONTO 1: localStorage (sempre disponível)
            try {
                const backupHistoryKey = `backupHistory_${username}`;
                this.backupHistory.unshift(backup);
                if (this.backupHistory.length > 50) {
                    this.backupHistory = this.backupHistory.slice(0, 50);
                }
                localStorage.setItem(backupHistoryKey, JSON.stringify(this.backupHistory));
                backup.storagePoints.push('localStorage');
                console.log('✅ [BACKUP] Backup salvo em localStorage');
            } catch (error) {
                console.error('❌ [BACKUP] Erro ao salvar em localStorage:', error);
            }

            // PONTO 2: IndexedDB (quando disponível)
            if (this.useIndexedDB && this.indexedDB) {
                try {
                    await this.saveBackupToIndexedDB(backup);
                    backup.storagePoints.push('indexedDB');
                    console.log('✅ [BACKUP] Backup salvo em IndexedDB');
                } catch (error) {
                    console.error('❌ [BACKUP] Erro ao salvar em IndexedDB:', error);
                }
            }

            // PONTO 3: JSONBin (nuvem - quando configurado)
            try {
                await this.saveBackupToCloud(backupData, backup.id);
                backup.storagePoints.push('cloud');
                console.log('✅ [BACKUP] Backup salvo na nuvem (JSONBin)');
            } catch (error) {
                console.warn('⚠️ [BACKUP] Erro ao salvar na nuvem (pode não estar configurado):', error.message);
            }

            // PONTO 4: Download automático (opcional - apenas se configurado)
            const autoDownloadEnabled = localStorage.getItem(`autoBackupDownload_${username}`) === 'true';
            if (autoDownloadEnabled) {
                try {
                    this.downloadBackupFile(backupData, backup.id);
                    backup.storagePoints.push('download');
                    console.log('✅ [BACKUP] Backup baixado automaticamente');
                } catch (error) {
                    console.error('❌ [BACKUP] Erro ao baixar backup:', error);
                }
            }

            this.lastBackupTime = new Date();
            this.saveData();
            this.renderBackupHistory();

            // Notificação de backup automático com informações de pontos
            const pointsCount = backup.storagePoints.length;
            const pointsText = pointsCount > 1 ? `salvo em ${pointsCount} locais` : 'salvo';
            if (typeof toast !== 'undefined' && toast) {
                toast.success(`Backup automático criado com sucesso! (${pointsText})`, 3000);
            }

            // Registrar no audit log
            this.logAction('export', 'backup', backup.id, 'Backup Automático', {
                checksum: checksum,
                storagePoints: backup.storagePoints,
                pointsCount: pointsCount,
            });
        } catch (error) {
            console.error('Erro ao criar backup automático:', error);
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Erro ao criar backup automático. Verifique o console.', 4000);
            }
        }
    }

    /**
     * Salvar backup no IndexedDB
     * @param {Object} backup - Objeto de backup
     * @returns {Promise<void>}
     */
    async saveBackupToIndexedDB(backup) {
        return new Promise((resolve, reject) => {
            if (!this.indexedDB || !this.useIndexedDB) {
                reject(new Error('IndexedDB não disponível'));
                return;
            }

            const transaction = this.indexedDB.transaction(['backups'], 'readwrite');
            const store = transaction.objectStore('backups');
            const request = store.add(backup);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error('Erro ao salvar backup no IndexedDB'));
            };
        });
    }

    /**
     * Salvar backup na nuvem (JSONBin)
     * @param {Object} backupData - Dados do backup
     * @param {string} backupId - ID do backup
     * @returns {Promise<void>}
     */
    async saveBackupToCloud(backupData, backupId) {
        // Usar a mesma lógica de saveData mas com identificador de backup
        try {
            await this.saveData();
            console.log('✅ [BACKUP] Backup sincronizado na nuvem via saveData');
        } catch (error) {
            throw new Error('Erro ao salvar backup na nuvem: ' + error.message);
        }
    }

    /**
     * Baixar arquivo de backup
     * @param {Object} backupData - Dados do backup
     * @param {string} backupId - ID do backup
     */
    downloadBackupFile(backupData, backupId) {
        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${backupId}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Toggle backup automático
    toggleAutoBackup() {
        const enabled = document.getElementById('autoBackupEnabled')?.checked || false;
        const frequency = document.getElementById('autoBackupFrequency')?.value || 'daily';

        if (enabled) {
            this.startAutoBackup(frequency);
        } else {
            this.stopAutoBackup();
        }

        this.configureAutoBackup();
    }

    // Atualizar frequência do backup automático
    updateAutoBackupFrequency() {
        const enabled = document.getElementById('autoBackupEnabled')?.checked || false;
        if (enabled) {
            const frequency = document.getElementById('autoBackupFrequency')?.value || 'daily';
            this.startAutoBackup(frequency);
        }
        this.configureAutoBackup();
    }

    // Abrir modal de backup
    openBackupModal() {
        const modal = document.getElementById('backupModal');
        if (!modal) return;

        // Carregar histórico de backups
        this.loadBackupHistory();
        this.renderBackupHistory();

        // Carregar configuração de backup automático
        const username = sessionStorage.getItem('username');
        if (username) {
            const configStr = localStorage.getItem(`autoBackupConfig_${username}`);
            if (configStr) {
                try {
                    const config = JSON.parse(configStr);
                    const enabledCheckbox = document.getElementById('autoBackupEnabled');
                    const frequencySelect = document.getElementById('autoBackupFrequency');
                    if (enabledCheckbox) enabledCheckbox.checked = config.enabled || false;
                    if (frequencySelect) frequencySelect.value = config.frequency || 'daily';
                } catch (e) {
                    console.error('Erro ao carregar configuração de backup:', e);
                }
            }
        }

        modal.classList.add('active');
    }

    // Fechar modal de backup
    closeBackupModal() {
        const modal = document.getElementById('backupModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Carregar histórico de backups
    loadBackupHistory() {
        const username = sessionStorage.getItem('username');
        if (!username) {
            this.backupHistory = [];
            return;
        }

        const backupHistoryKey = `backupHistory_${username}`;
        const historyStr = localStorage.getItem(backupHistoryKey);
        if (historyStr) {
            try {
                this.backupHistory = JSON.parse(historyStr) || [];
            } catch (e) {
                console.error('Erro ao carregar histórico de backups:', e);
                this.backupHistory = [];
            }
        } else {
            this.backupHistory = [];
        }
    }

    // Renderizar histórico de backups
    renderBackupHistory() {
        const container = document.getElementById('backupHistoryList');
        if (!container) return;

        if (this.backupHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 2rem;">
                    <div class="empty-state-icon">
                        <i class="fas fa-database"></i>
                    </div>
                    <h3 class="empty-state-title">Nenhum backup encontrado</h3>
                    <p class="empty-state-message">
                        Crie seu primeiro backup para começar a proteger seus dados.
                    </p>
                </div>`;
            return;
        }

        container.innerHTML = this.backupHistory
            .map((backup) => {
                const date = new Date(backup.timestamp);
                const dateStr = date.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });

                // Verificar integridade
                const currentChecksum = this.generateChecksum(backup.data);
                const isIntegrityOk = currentChecksum === backup.checksum;

                // Mostrar pontos de armazenamento
                const storagePoints = backup.storagePoints || [];
                const pointsLabels = {
                    localStorage: 'Local',
                    indexedDB: 'IndexedDB',
                    cloud: 'Nuvem',
                    download: 'Download'
                };
                const pointsText = storagePoints.length > 0 
                    ? storagePoints.map(p => pointsLabels[p] || p).join(', ')
                    : 'Local';
                const pointsCount = storagePoints.length || 1;

                return `
                    <div class="item-card" style="margin-bottom: 1rem; border-left: 4px solid ${backup.type === 'auto' ? '#28a745' : '#007bff'};">
                        <div class="item-header">
                            <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
                                <i class="fas ${backup.type === 'auto' ? 'fa-clock' : 'fa-save'}" style="color: ${backup.type === 'auto' ? '#28a745' : '#007bff'};"></i>
                                <div style="flex: 1;">
                                    <h3 style="margin: 0; font-size: 0.95rem; font-weight: 600;">
                                        ${backup.type === 'auto' ? 'Backup Automático' : 'Backup Manual'}
                                    </h3>
                                    <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--gray-600);">
                                        <i class="fas fa-calendar"></i> ${dateStr}
                                    </p>
                                    ${pointsCount > 1 ? `
                                        <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: var(--primary-color);">
                                            <i class="fas fa-database"></i> Armazenado em ${pointsCount} locais: ${pointsText}
                                        </p>
                                    ` : ''}
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.5rem; flex-direction: column; align-items: flex-end;">
                                ${isIntegrityOk ? 
                                    '<span style="color: #28a745; font-size: 0.75rem;"><i class="fas fa-check-circle"></i> Íntegro</span>' : 
                                    '<span style="color: #dc3545; font-size: 0.75rem;"><i class="fas fa-exclamation-circle"></i> Corrompido</span>'
                                }
                                ${pointsCount > 1 ? `
                                    <span style="color: var(--primary-color); font-size: 0.7rem;" title="Múltiplos pontos de backup">
                                        <i class="fas fa-shield-alt"></i> ${pointsCount}x
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                        <div class="item-details" style="padding-top: 0.75rem; border-top: 1px solid var(--border-color); margin-top: 0.75rem;">
                            <p style="margin: 0.5rem 0; font-size: 0.85rem;">
                                <i class="fas fa-box"></i> <strong>Itens:</strong> ${backup.data.items?.length || 0} | 
                                <i class="fas fa-users"></i> <strong>Clientes:</strong> ${backup.data.clients?.length || 0} | 
                                <i class="fas fa-shopping-cart"></i> <strong>Vendas:</strong> ${backup.data.completedSales?.length || 0}
                            </p>
                            <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                                <button class="btn-small btn-secondary" onclick="app.restoreBackup('${backup.id}')" ${!isIntegrityOk ? 'disabled title="Backup corrompido"' : ''}>
                                    <i class="fas fa-undo"></i> Restaurar
                                </button>
                                <button class="btn-small btn-secondary" onclick="app.downloadBackup('${backup.id}')">
                                    <i class="fas fa-download"></i> Baixar
                                </button>
                                <button class="btn-small btn-delete" onclick="app.deleteBackup('${backup.id}')">
                                    <i class="fas fa-times"></i> Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            })
            .join('');
    }

    // Restaurar backup
    async restoreBackup(backupId) {
        const backup = this.backupHistory.find(b => b.id === backupId);
        if (!backup) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Backup não encontrado.', 3000);
            }
            return;
        }

        const username = sessionStorage.getItem('username');
        
        // Descriptografar backup se necessário
        let backupData = backup.data;
        if (backupData.encrypted && username) {
            try {
                backupData = await this.decryptBackup(backupData, username);
            } catch (error) {
                console.error('Erro ao descriptografar backup:', error);
                if (typeof toast !== 'undefined' && toast) {
                    toast.error('Erro ao descriptografar backup. Verifique se você está usando a mesma conta.', 4000);
                }
                return;
            }
        }

        // Verificar integridade (usar dados descriptografados)
        const currentChecksum = this.generateChecksum(backupData);
        if (currentChecksum !== backup.checksum) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Backup pode estar corrompido. Continuar mesmo assim?', 5000);
            }
        }

        const performRestore = (confirmed) => {
            if (!confirmed) return;

            try {
                // Restaurar dados (já descriptografados)
                this.items = backupData.items || [];
                this.groups = backupData.groups || [];
                this.serviceGroups = backupData.serviceGroups || [];
                this.costs = backupData.costs || [];
                this.goals = backupData.goals || [];
                this.clients = backupData.clients || [];
                this.clientNotifications = backupData.clientNotifications || [];
                this.suppliers = backupData.suppliers || [];
                this.completedSales = backupData.completedSales || [];
                this.pendingOrders = backupData.pendingOrders || [];
                this.serviceAppointments = backupData.serviceAppointments || [];
                this.coupons = backupData.coupons || [];
                this.auditLog = backupData.auditLog || [];
                this.templates = backupData.templates || [];
                this.itemTags = backupData.itemTags || {};

                this.saveData();
                this.renderItems();
                this.renderGroups();
                this.renderClients();
                this.renderSuppliers();
                this.renderCoupons();
                this.renderTemplates();
                this.updateTagFilter();

                // Registrar no audit log
                this.logAction('import', 'backup', backupId, 'Restauração de Backup', {
                    backupTimestamp: backup.timestamp,
                });

                if (typeof toast !== 'undefined' && toast) {
                    toast.success('Backup restaurado com sucesso!', 3000);
                }

                this.closeBackupModal();
            } catch (error) {
                console.error('Erro ao restaurar backup:', error);
                if (typeof toast !== 'undefined' && toast) {
                    toast.error('Erro ao restaurar backup. Verifique o console para mais detalhes.', 4000);
                }
            }
        };

        if (typeof confirmDialog !== 'undefined' && confirmDialog) {
            confirmDialog.danger(
                'Tem certeza que deseja restaurar este backup? Todos os dados atuais serão substituídos pelos dados do backup.',
                'Restaurar Backup'
            ).then(performRestore);
        } else {
            if (confirm('Tem certeza que deseja restaurar este backup?')) {
                performRestore(true);
            }
        }
    }

    // Baixar backup
    downloadBackup(backupId) {
        const backup = this.backupHistory.find(b => b.id === backupId);
        if (!backup) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Backup não encontrado.', 3000);
            }
            return;
        }

        const blob = new Blob([JSON.stringify(backup.data, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${backupId}_${new Date(backup.timestamp).toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof toast !== 'undefined' && toast) {
            toast.success('Backup baixado com sucesso!', 3000);
        }
    }

    // Excluir backup
    deleteBackup(backupId) {
        const backup = this.backupHistory.find(b => b.id === backupId);
        const backupName = backup ? (backup.type === 'auto' ? 'Backup Automático' : 'Backup Manual') : 'este backup';

        const performDelete = (confirmed) => {
            if (!confirmed) return;

            this.backupHistory = this.backupHistory.filter(b => b.id !== backupId);
            const username = sessionStorage.getItem('username');
            if (username) {
                const backupHistoryKey = `backupHistory_${username}`;
                localStorage.setItem(backupHistoryKey, JSON.stringify(this.backupHistory));
            }

            this.renderBackupHistory();

            if (typeof toast !== 'undefined' && toast) {
                toast.success(`Backup "${backupName}" excluído com sucesso!`, 3000);
            }
        };

        if (typeof confirmDialog !== 'undefined' && confirmDialog) {
            confirmDialog.danger(
                `Tem certeza que deseja excluir o ${backupName}?`,
                'Excluir Backup'
            ).then(performDelete);
        } else {
            if (confirm(`Tem certeza que deseja excluir o ${backupName}?`)) {
                performDelete(true);
            }
        }
    }

    // Exportar lista de clientes
    exportClients() {
        if (this.clients.length === 0) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Não há clientes cadastrados para exportar.', 3000);
            } else {
                alert('Não há clientes cadastrados para exportar.');
            }
            return;
        }

        // Criar CSV
        const headers = ['Nome', 'CPF', 'Telefone', 'E-mail', 'Endereço', 'Pontos de Fidelidade', 'Total Gasto', 'Número de Compras', 'Observações'];
        const rows = this.clients.map(client => {
            const purchaseCount = this.completedSales.filter(sale => sale.customerName === client.name).length;
            const totalSpent = this.completedSales
                .filter(sale => sale.customerName === client.name)
                .reduce((sum, sale) => sum + (sale.totalValue || 0), 0);
            
            return [
                client.name || '',
                client.cpf || '',
                client.phone || '',
                client.email || '',
                client.address || '',
                (client.loyaltyPoints || 0).toString(),
                totalSpent.toFixed(2).replace('.', ','),
                purchaseCount.toString(),
                (client.notes || '').replace(/"/g, '""') // Escapar aspas no CSV
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Adicionar BOM para Excel reconhecer UTF-8
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Registrar no audit log
        this.logAction('export', 'client', null, 'Lista de Clientes', {
            totalClients: this.clients.length
        });

        if (typeof toast !== 'undefined' && toast) {
            toast.success(`Lista de ${this.clients.length} cliente(s) exportada com sucesso!`, 3000);
        }
    }

    // Calcular desconto automático baseado em pontos de fidelidade
    calculateLoyaltyDiscount(clientName, totalValue) {
        const client = this.clients.find(c => c.name === clientName);
        if (!client || !client.loyaltyPoints) {
            return { discount: 0, pointsUsed: 0 };
        }

        // Regra: 1 ponto = R$ 0,10 de desconto
        // Máximo de 50% do valor total
        const maxDiscountFromPoints = client.loyaltyPoints * 0.10;
        const maxDiscountPercent = totalValue * 0.50;
        const discount = Math.min(maxDiscountFromPoints, maxDiscountPercent);
        const pointsUsed = Math.ceil(discount / 0.10);

        return {
            discount: Math.round(discount * 100) / 100, // Arredondar para 2 casas decimais
            pointsUsed: pointsUsed
        };
    }

    // Adicionar pontos de fidelidade após uma venda
    addLoyaltyPoints(clientName, saleValue) {
        const client = this.clients.find(c => c.name === clientName);
        if (!client) return;

        // Regra: 1 ponto para cada R$ 10,00 gastos
        const pointsEarned = Math.floor(saleValue / 10);
        
        if (!client.loyaltyPoints) {
            client.loyaltyPoints = 0;
        }
        
        client.loyaltyPoints += pointsEarned;
        client.updatedAt = new Date().toISOString();
        
        this.saveData();
        
        if (pointsEarned > 0 && typeof toast !== 'undefined' && toast) {
            toast.info(`Cliente "${clientName}" ganhou ${pointsEarned} ponto(s) de fidelidade!`, 3000);
        }
    }

    // Criar notificação para cliente
    createClientNotification(clientId, title, message, type = 'info') {
        const notification = {
            id: 'NOTIF_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            clientId: clientId,
            title: title,
            message: message,
            type: type, // 'info', 'success', 'warning', 'promotion'
            read: false,
            createdAt: new Date().toISOString(),
        };

        this.clientNotifications.push(notification);
        this.saveData();

        return notification;
    }

    // Marcar notificação como lida
    markNotificationAsRead(notificationId) {
        const notification = this.clientNotifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            notification.readAt = new Date().toISOString();
            this.saveData();
        }
    }

    // Obter notificações de um cliente
    getClientNotifications(clientId) {
        return this.clientNotifications
            .filter(n => n.clientId === clientId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Calcular desconto baseado em campos do formulário
    calculateDiscount(basePrice, quantity) {
        const discountType = document.getElementById('saleDiscountType')?.value || '';
        const discountValue = parseFloat(document.getElementById('saleDiscountValue')?.value || 0);
        const couponCode = document.getElementById('saleCouponCode')?.value.trim().toUpperCase() || '';
        
        let discount = 0;
        let appliedCoupon = null;
        
        // Verificar se há cupom aplicado
        if (couponCode) {
            const coupon = this.coupons.find(c => c.code === couponCode && c.active);
            if (coupon) {
                // Verificar período
                const now = new Date();
                const isValidPeriod = (!coupon.startsAt || new Date(coupon.startsAt) <= now) &&
                                     (!coupon.expiresAt || new Date(coupon.expiresAt) >= now);
                
                // Verificar quantidade mínima
                const hasMinQuantity = !coupon.minQuantity || quantity >= coupon.minQuantity;
                
                // Verificar limite de uso
                const hasUsesLeft = !coupon.maxUses || (coupon.uses || 0) < coupon.maxUses;
                
                if (isValidPeriod && hasMinQuantity && hasUsesLeft) {
                    appliedCoupon = coupon;
                    if (coupon.type === 'percent') {
                        discount = (basePrice * quantity * coupon.value) / 100;
                    } else {
                        discount = coupon.value;
                    }
                }
            }
        }
        
        // Se não houver cupom ou cupom não aplicável, verificar desconto manual
        if (!appliedCoupon && discountType && discountValue > 0) {
            if (discountType === 'percent') {
                discount = (basePrice * quantity * discountValue) / 100;
            } else {
                discount = discountValue;
            }
        }
        
        // Limitar desconto ao valor total
        const total = basePrice * quantity;
        discount = Math.min(discount, total);
        
        return {
            discount: Math.round(discount * 100) / 100,
            discountType: discountType || (appliedCoupon ? appliedCoupon.type : ''),
            discountValue: discountValue || (appliedCoupon ? appliedCoupon.value : 0),
            couponCode: appliedCoupon ? appliedCoupon.code : null,
        };
    }

    // Atualizar cálculo de desconto em tempo real
    updateDiscountCalculation() {
        const salePrice = document.getElementById('salePrice');
        const saleQuantity = document.getElementById('saleQuantity');
        const discountType = document.getElementById('saleDiscountType');
        const discountValue = document.getElementById('saleDiscountValue');
        const discountSummary = document.getElementById('discountSummary');
        
        if (!salePrice || !saleQuantity || !discountSummary) return;
        
        const basePrice = this.parsePrice(salePrice.value) || 0;
        const quantity = parseInt(saleQuantity.value) || 0;
        const baseTotal = basePrice * quantity;
        
        let discount = 0;
        
        if (discountType && discountValue && discountType.value && discountValue.value) {
            const type = discountType.value;
            const value = parseFloat(discountValue.value);
            
            if (type === 'percent') {
                discount = (baseTotal * value) / 100;
            } else {
                discount = value;
            }
            
            discount = Math.min(discount, baseTotal);
        }
        
        const total = baseTotal - discount;
        
        discountSummary.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; text-align: center;">
                <div>
                    <div style="font-size: 0.75rem; color: var(--gray-600); margin-bottom: 0.25rem;">Subtotal</div>
                    <div style="font-weight: 600; color: var(--gray-800);">R$ ${baseTotal.toFixed(2).replace('.', ',')}</div>
                </div>
                <div>
                    <div style="font-size: 0.75rem; color: var(--gray-600); margin-bottom: 0.25rem;">Desconto</div>
                    <div style="font-weight: 600; color: ${discount > 0 ? '#28a745' : 'var(--gray-800)'};">R$ ${discount.toFixed(2).replace('.', ',')}</div>
                </div>
                <div>
                    <div style="font-size: 0.75rem; color: var(--gray-600); margin-bottom: 0.25rem;">Total</div>
                    <div style="font-weight: 700; font-size: 1.1rem; color: var(--primary-color);">R$ ${total.toFixed(2).replace('.', ',')}</div>
                </div>
            </div>
        `;
        discountSummary.style.display = 'block';
    }

    // Atualizar totais da venda (alias para updateDiscountCalculation)
    updateSaleTotals() {
        this.updateDiscountCalculation();
    }

    // Toggle campos de desconto
    toggleDiscountFields() {
        const discountFields = document.getElementById('discountFields');
        const discountSummary = document.getElementById('discountSummary');
        const toggleBtn = document.getElementById('toggleDiscountBtn');
        
        if (discountFields && discountSummary && toggleBtn) {
            const isVisible = discountFields.style.display !== 'none';
            
            if (isVisible) {
                discountFields.style.display = 'none';
                discountSummary.style.display = 'none';
                toggleBtn.innerHTML = '<i class="fas fa-plus"></i> Aplicar';
                
                // Limpar campos
                const discountType = document.getElementById('saleDiscountType');
                const discountValue = document.getElementById('saleDiscountValue');
                const couponCode = document.getElementById('saleCouponCode');
                if (discountType) discountType.value = '';
                if (discountValue) discountValue.value = '';
                if (couponCode) couponCode.value = '';
            } else {
                discountFields.style.display = 'block';
                toggleBtn.innerHTML = '<i class="fas fa-times"></i> Remover';
                this.updateDiscountCalculation();
            }
        }
    }

    // ========== ADMINISTRAÇÃO ==========

    async loadAdminData() {
        const username = sessionStorage.getItem('username');
        console.log('🟢 [ADMIN] loadAdminData chamado, username:', username);
        
        if (username !== 'admin') {
            console.warn('⚠️ [ADMIN] Acesso negado - apenas administradores');
            return;
        }

        try {
            console.log('🟢 [ADMIN] Carregando dados do admin...');
            console.log('🟢 [ADMIN] Fazendo fetch para /api/admin?username=' + username);
            
            const response = await fetch(
                `/api/admin?username=${username}`
            );
            
            console.log('🟢 [ADMIN] Response status:', response.status);
            console.log('🟢 [ADMIN] Response ok:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [ADMIN] Erro HTTP:', response.status, errorText);
                throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log('🟢 [ADMIN] Dados recebidos:', result);
            console.log('🟢 [ADMIN] Result.success:', result.success);

            if (result.success) {
                console.log('🟢 [ADMIN] Renderizando dashboards...');
                console.log('🟢 [ADMIN] totalUsage:', result.totalUsage);
                console.log('🟢 [ADMIN] usersUsage:', result.usersUsage);
                
                if (result.totalUsage) {
                    this.renderAdminTotalUsageDashboard(result.totalUsage);
                } else {
                    console.error('❌ [ADMIN] totalUsage não encontrado no resultado');
                }
                
                if (result.usersUsage) {
                    this.renderAdminUsersUsageDashboard(result.usersUsage, result.totalUsage);
                } else {
                    console.error('❌ [ADMIN] usersUsage não encontrado no resultado');
                }
                
                console.log('✅ [ADMIN] Dashboards renderizados com sucesso!');
            } else {
                console.error('❌ [ADMIN] Erro ao carregar dados:', result.error);
                const errorMsg = result.error || result.message || 'Erro desconhecido';
                this.showError(`Erro ao carregar dados de administração: ${errorMsg}`);
            }
        } catch (error) {
            console.error('❌ [ADMIN] Erro ao carregar dados:', error);
            console.error('❌ [ADMIN] Stack:', error.stack);
            this.showError(`Erro ao carregar dados de administração: ${error.message}`);
        }
    }

    refreshAdminData() {
        this.loadAdminData();
        this.showSuccess('Dados atualizados com sucesso!');
    }

    renderAdminTotalUsageDashboard(totalUsage) {
        const container = document.getElementById('adminTotalUsageDashboard');
        if (!container) return;

        const usageColor =
            totalUsage.usagePercent > 80
                ? '#dc3545'
                : totalUsage.usagePercent > 60
                ? '#ffc107'
                : '#28a745';

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div class="admin-stat-card" style="background: var(--white); padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); border-left: 4px solid ${usageColor};">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                        <h3 style="margin: 0; color: var(--gray-600); font-size: 0.9rem; font-weight: 600;">Espaço Utilizado</h3>
                        <i class="fas fa-database" style="color: ${usageColor}; font-size: 1.5rem;"></i>
                    </div>
                    <p style="margin: 0; font-size: 2rem; font-weight: 700; color: var(--dark-gray);">${totalUsage.binSizeMB} MB</p>
                    <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: var(--gray-500);">${totalUsage.binSizeKB} KB</p>
                </div>
                <div class="admin-stat-card" style="background: var(--white); padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); border-left: 4px solid #28a745;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                        <h3 style="margin: 0; color: var(--gray-600); font-size: 0.9rem; font-weight: 600;">Espaço Restante</h3>
                        <i class="fas fa-hdd" style="color: #28a745; font-size: 1.5rem;"></i>
                    </div>
                    <p style="margin: 0; font-size: 2rem; font-weight: 700; color: var(--dark-gray);">${totalUsage.remainingMB} MB</p>
                    <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: var(--gray-500);">${totalUsage.remainingKB} KB</p>
                </div>
                <div class="admin-stat-card" style="background: var(--white); padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); border-left: 4px solid #007bff;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                        <h3 style="margin: 0; color: var(--gray-600); font-size: 0.9rem; font-weight: 600;">Limite do Plano</h3>
                        <i class="fas fa-chart-pie" style="color: #007bff; font-size: 1.5rem;"></i>
                    </div>
                    <p style="margin: 0; font-size: 2rem; font-weight: 700; color: var(--dark-gray);">${totalUsage.freePlanLimitMB} MB</p>
                    <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: var(--gray-500);">Plano gratuito JSONBin</p>
                </div>
                <div class="admin-stat-card" style="background: var(--white); padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); border-left: 4px solid ${usageColor};">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                        <h3 style="margin: 0; color: var(--gray-600); font-size: 0.9rem; font-weight: 600;">Percentual de Uso</h3>
                        <i class="fas fa-percentage" style="color: ${usageColor}; font-size: 1.5rem;"></i>
                    </div>
                    <p style="margin: 0; font-size: 2rem; font-weight: 700; color: var(--dark-gray);">${totalUsage.usagePercent}%</p>
                    <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: ${totalUsage.isNearLimit ? '#dc3545' : 'var(--gray-500)'};">
                        ${totalUsage.isNearLimit ? '⚠️ Próximo do limite!' : 'Disponível'}
                    </p>
                </div>
            </div>

            <div style="background: var(--white); padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
                <h3 style="margin: 0 0 1rem 0; color: var(--dark-gray); font-size: 1.1rem;">
                    <i class="fas fa-chart-pie"></i> Comparação Visual: Utilizado vs Restante
                </h3>
                <div style="height: 350px; position: relative;">
                    <canvas id="adminTotalUsageChart"></canvas>
                </div>
            </div>
        `;

        // Renderizar gráfico de comparação
        setTimeout(() => {
            this.renderAdminTotalUsageChart(totalUsage);
        }, 100);
    }

    renderAdminTotalUsageChart(totalUsage) {
        const canvas = document.getElementById('adminTotalUsageChart');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');

        // Destruir gráfico anterior se existir
        if (this.adminTotalUsageChart) {
            this.adminTotalUsageChart.destroy();
        }

        const usedMB = parseFloat(totalUsage.binSizeMB);
        const remainingMB = parseFloat(totalUsage.remainingMB);

        this.adminTotalUsageChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Espaço Utilizado', 'Espaço Restante'],
                datasets: [
                    {
                        data: [usedMB, remainingMB],
                        backgroundColor: [
                            totalUsage.usagePercent > 80
                                ? '#dc3545'
                                : totalUsage.usagePercent > 60
                                ? '#ffc107'
                                : '#28a745',
                            '#e9ecef',
                        ],
                        borderColor: ['#fff', '#fff'],
                        borderWidth: 3,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${value.toFixed(2)} MB (${((value / totalUsage.freePlanLimitMB) * 100).toFixed(2)}%)`;
                            },
                        },
                    },
                },
            },
        });
    }

    renderAdminUsersUsageDashboard(usersUsage, totalUsage) {
        const container = document.getElementById('adminUsersUsageDashboard');
        if (!container) return;

        // Ordenar por tamanho de dados (maior primeiro)
        const sortedUsers = [...usersUsage].sort(
            (a, b) => b.dataSize - a.dataSize
        );

        container.innerHTML = `
            <div style="background: var(--white); padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); margin-bottom: 2rem;">
                <h3 style="margin: 0 0 1rem 0; color: var(--dark-gray); font-size: 1.1rem;">
                    <i class="fas fa-chart-bar"></i> Gráfico de Consumo por Usuário
                </h3>
                <div style="height: 350px; position: relative;">
                    <canvas id="adminUsersUsageChart"></canvas>
                </div>
            </div>

            <div style="background: var(--white); padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
                <h3 style="margin: 0 0 1rem 0; color: var(--dark-gray); font-size: 1.1rem;">
                    <i class="fas fa-table"></i> Análise de Uso Individual por Usuário
                </h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--gray-50); border-bottom: 2px solid var(--gray-200);">
                                <th style="padding: 0.75rem; text-align: left; font-weight: 600; color: var(--dark-gray);">Usuário</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: var(--dark-gray);">Tamanho (KB)</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: var(--dark-gray);">Tamanho (MB)</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: var(--dark-gray);">% do Total</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: var(--dark-gray);">Última Atualização</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedUsers
                                .map(
                                    (user) => {
                                        const usagePercent = parseFloat(user.usagePercent);
                                        const rowColor =
                                            usagePercent > 30
                                                ? '#fff5f5'
                                                : usagePercent > 15
                                                ? '#fffbf0'
                                                : 'transparent';
                                        return `
                                <tr style="border-bottom: 1px solid var(--gray-200); background: ${rowColor};">
                                    <td style="padding: 0.75rem; font-weight: 600; color: var(--dark-gray);">
                                        <i class="fas fa-user" style="margin-right: 0.5rem; color: var(--primary-color);"></i>
                                        ${this.escapeHtml(user.username)}
                                    </td>
                                    <td style="padding: 0.75rem; text-align: center; color: var(--gray-700); font-weight: 600;">${user.dataSizeKB} KB</td>
                                    <td style="padding: 0.75rem; text-align: center; color: var(--gray-700); font-weight: 600;">${user.dataSizeMB} MB</td>
                                    <td style="padding: 0.75rem; text-align: center; color: var(--gray-700); font-weight: 600;">
                                        <span style="padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); background: ${usagePercent > 30 ? '#fee' : usagePercent > 15 ? '#fff3cd' : '#d4edda'}; color: ${usagePercent > 30 ? '#721c24' : usagePercent > 15 ? '#856404' : '#155724'};">
                                            ${usagePercent}%
                                        </span>
                                    </td>
                                    <td style="padding: 0.75rem; text-align: center; color: var(--gray-600); font-size: 0.85rem;">${user.lastUpdateFormatted}</td>
                                </tr>
                            `;
                                    }
                                )
                                .join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Renderizar gráfico de consumo por usuário
        setTimeout(() => {
            this.renderAdminUsersUsageChart(sortedUsers);
        }, 100);
    }

    renderAdminUsersUsageChart(usersUsage) {
        const canvas = document.getElementById('adminUsersUsageChart');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');

        // Destruir gráfico anterior se existir
        if (this.adminUsersUsageChart) {
            this.adminUsersUsageChart.destroy();
        }

        const labels = usersUsage.map((u) => u.username);
        const dataMB = usersUsage.map((u) => parseFloat(u.dataSizeMB));
        const colors = usersUsage.map((u) => {
            const percent = parseFloat(u.usagePercent);
            return percent > 30
                ? 'rgba(220, 53, 69, 0.7)'
                : percent > 15
                ? 'rgba(255, 193, 7, 0.7)'
                : 'rgba(40, 167, 69, 0.7)';
        });

        this.adminUsersUsageChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Consumo (MB)',
                        data: dataMB,
                        backgroundColor: colors,
                        borderColor: usersUsage.map((u) => {
                            const percent = parseFloat(u.usagePercent);
                            return percent > 30
                                ? '#dc3545'
                                : percent > 15
                                ? '#ffc107'
                                : '#28a745';
                        }),
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const user = usersUsage[context.dataIndex];
                                return `Consumo: ${user.dataSizeMB} MB (${user.usagePercent}% do total)`;
                            },
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Consumo em MB',
                        },
                    },
                },
            },
        });
    }

    // ========== CALCULADORA FINANCEIRA ==========

    // Calcular ROI por produto
    calculateProductROI() {
        const productSelect = document.getElementById('roiProductSelect');
        const resultsDiv = document.getElementById('roiResults');
        
        if (!productSelect || !resultsDiv) return;
        
        const productId = productSelect.value;
        if (!productId) {
            resultsDiv.style.display = 'none';
            return;
        }
        
        const product = this.items.find(item => item.id === productId);
        if (!product) {
            resultsDiv.style.display = 'none';
            return;
        }
        
        const salePrice = product.price || 0;
        const cost = product.cost || 0;
        
        if (cost <= 0) {
            resultsDiv.innerHTML = `
                <div style="text-align: center; padding: 1rem; color: var(--gray-600);">
                    <i class="fas fa-info-circle"></i> Este produto não possui custo cadastrado.
                    <br><small style="font-size: 0.75rem; margin-top: 0.5rem; display: block;">Adicione o custo de compra no cadastro do produto para calcular o ROI.</small>
                </div>
            `;
            resultsDiv.style.display = 'block';
            return;
        }
        
        const profit = salePrice - cost;
        const margin = salePrice > 0 ? ((profit / salePrice) * 100) : 0;
        const roi = cost > 0 ? ((profit / cost) * 100) : 0;
        
        document.getElementById('roiSalePrice').textContent = `R$ ${salePrice.toFixed(2).replace('.', ',')}`;
        document.getElementById('roiCost').textContent = `R$ ${cost.toFixed(2).replace('.', ',')}`;
        document.getElementById('roiProfit').textContent = `R$ ${profit.toFixed(2).replace('.', ',')}`;
        document.getElementById('roiMargin').textContent = `${margin.toFixed(2)}%`;
        document.getElementById('roiValue').textContent = `${roi.toFixed(2)}%`;
        
        resultsDiv.style.display = 'block';
    }

    // Simular preço baseado em custo e margem
    simulatePrice() {
        const costInput = document.getElementById('simulatorCost');
        const marginInput = document.getElementById('simulatorMargin');
        const discountInput = document.getElementById('simulatorDiscount');
        
        if (!costInput || !marginInput || !discountInput) return;
        
        const cost = parseFloat(costInput.value) || 0;
        const margin = parseFloat(marginInput.value) || 0;
        const discount = parseFloat(discountInput.value) || 0;
        
        if (cost <= 0) {
            document.getElementById('simulatorPrice').textContent = 'R$ 0,00';
            document.getElementById('simulatorProfit').textContent = 'R$ 0,00';
            document.getElementById('simulatorFinalPrice').textContent = 'R$ 0,00';
            return;
        }
        
        // Calcular preço de venda: custo / (1 - margem/100)
        const suggestedPrice = cost / (1 - (margin / 100));
        const profit = suggestedPrice - cost;
        const finalPrice = suggestedPrice * (1 - (discount / 100));
        
        document.getElementById('simulatorPrice').textContent = `R$ ${suggestedPrice.toFixed(2).replace('.', ',')}`;
        document.getElementById('simulatorProfit').textContent = `R$ ${profit.toFixed(2).replace('.', ',')}`;
        document.getElementById('simulatorFinalPrice').textContent = `R$ ${finalPrice.toFixed(2).replace('.', ',')}`;
    }

    // Popular select de produtos para ROI
    populateROIProductSelect() {
        const select = document.getElementById('roiProductSelect');
        if (!select) return;
        
        // Limpar opções existentes (exceto a primeira)
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Adicionar produtos que tenham custo cadastrado
        this.items.forEach(item => {
            if (item.cost && item.cost > 0) {
                const option = document.createElement('option');
                option.value = item.id;
                const itemName = item.name || item.brand || item.model || `Produto ${item.id}`;
                option.textContent = `${itemName} - R$ ${(item.price || 0).toFixed(2).replace('.', ',')}`;
                select.appendChild(option);
            }
        });
        
        // Se não houver produtos com custo, adicionar todos os produtos
        if (select.options.length === 1) {
            this.items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                const itemName = item.name || item.brand || item.model || `Produto ${item.id}`;
                option.textContent = `${itemName} - R$ ${(item.price || 0).toFixed(2).replace('.', ',')}`;
                select.appendChild(option);
            });
        }
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (
                    confirm(
                        'Isso irá substituir todos os dados atuais. Deseja continuar?'
                    )
                ) {
                    this.items = data.items || [];
                    this.groups = data.groups || [];
                    this.serviceGroups = data.serviceGroups || [];
                    this.costs = data.costs || [];
                    this.goals = data.goals || [];

                    // Migração: adicionar categoria "Roupas" para itens antigos sem categoria
                    this.items = this.items.map((item) => {
                        if (!item.category) {
                            item.category = 'Roupas';
                        }
                        return item;
                    });

                    this.saveData();
                    this.renderItems();
                    this.renderGroups();
                    this.renderCosts();
                    this.renderGoals();
                    this.updateMonthFilter();
                    this.updateOverallSummary();
                    alert('Dados importados com sucesso!');
                }
            } catch (error) {
                alert(
                    'Erro ao importar arquivo. Verifique se o arquivo está no formato correto.'
                );
                console.error('Erro ao importar:', error);
            }
        };
        reader.readAsText(file);

        // Limpar input
        event.target.value = '';
    }

    // ========== BUSCA POR NOTAS ==========

    // Abrir modal de busca por notas
    openNotesSearchModal() {
        const modal = document.getElementById('notesSearchModal');
        if (!modal) {
            console.error('Modal de busca por notas não encontrado');
            return;
        }
        
        const searchInput = document.getElementById('notesSearchInput');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        
        const resultsContainer = document.getElementById('notesSearchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = '<p style="text-align: center; color: var(--gray-600); padding: 2rem;">Digite um termo para buscar nas notas...</p>';
        }
        
        modal.classList.add('active');
    }

    // Fechar modal de busca por notas
    closeNotesSearchModal() {
        const modal = document.getElementById('notesSearchModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Buscar por notas em todos os lugares
    searchNotes(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return {
                items: [],
                clients: [],
                suppliers: [],
                sales: [],
                appointments: []
            };
        }

        const search = searchTerm.toLowerCase().trim();
        const results = {
            items: [],
            clients: [],
            suppliers: [],
            sales: [],
            appointments: []
        };

        // Buscar em produtos
        this.items.forEach(item => {
            if (item.notes && item.notes.toLowerCase().includes(search)) {
                results.items.push({
                    id: item.id,
                    name: item.name || item.brand || item.model || `Produto ${item.id}`,
                    notes: item.notes,
                    type: 'item'
                });
            }
        });

        // Buscar em clientes
        this.clients.forEach(client => {
            if (client.notes && client.notes.toLowerCase().includes(search)) {
                results.clients.push({
                    id: client.id,
                    name: client.name,
                    notes: client.notes,
                    type: 'client'
                });
            }
        });

        // Buscar em fornecedores
        this.suppliers.forEach(supplier => {
            if (supplier.notes && supplier.notes.toLowerCase().includes(search)) {
                results.suppliers.push({
                    id: supplier.id,
                    name: supplier.name,
                    notes: supplier.notes,
                    type: 'supplier'
                });
            }
        });

        // Buscar em vendas
        this.completedSales.forEach(sale => {
            if (sale.notes && sale.notes.toLowerCase().includes(search)) {
                results.sales.push({
                    id: sale.id,
                    name: sale.customerName,
                    notes: sale.notes,
                    date: sale.date,
                    type: 'sale'
                });
            }
        });

        // Buscar em agendamentos
        this.serviceAppointments.forEach(appointment => {
            if (appointment.notes && appointment.notes.toLowerCase().includes(search)) {
                results.appointments.push({
                    id: appointment.id,
                    name: appointment.customerName,
                    notes: appointment.notes,
                    date: appointment.date,
                    type: 'appointment'
                });
            }
        });

        return results;
    }

    // Executar busca por notas e renderizar resultados
    executeNotesSearch() {
        const searchInput = document.getElementById('notesSearchInput');
        const resultsContainer = document.getElementById('notesSearchResults');
        
        if (!searchInput || !resultsContainer) return;
        
        const searchTerm = searchInput.value.trim();
        
        if (!searchTerm) {
            resultsContainer.innerHTML = '<p style="text-align: center; color: var(--gray-600); padding: 2rem;">Digite um termo para buscar nas notas...</p>';
            return;
        }
        
        const results = this.searchNotes(searchTerm);
        const totalResults = results.items.length + results.clients.length + 
                           results.suppliers.length + results.sales.length + 
                           results.appointments.length;

        if (totalResults === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3 class="empty-state-title">Nenhum resultado encontrado</h3>
                    <p class="empty-state-message">
                        Não foram encontradas notas contendo "${this.escapeHtml(searchTerm)}"
                    </p>
                </div>
            `;
            return;
        }

        let html = `<div style="grid-column: 1/-1; margin-bottom: 1rem; padding: 1rem; background: var(--light-gray); border-radius: var(--radius-md);">
            <h3 style="margin: 0 0 0.5rem 0; color: var(--primary-color);">
                <i class="fas fa-search"></i> Resultados da busca: "${this.escapeHtml(searchTerm)}"
            </h3>
            <p style="margin: 0; color: var(--gray-600); font-size: 0.9rem;">
                Encontrados ${totalResults} resultado(s)
            </p>
        </div>`;

        // Produtos
        if (results.items.length > 0) {
            html += `<div style="grid-column: 1/-1; margin-bottom: 0.5rem;">
                <h4 style="margin: 0 0 0.75rem 0; color: var(--dark-gray); font-size: 1rem;">
                    <i class="fas fa-box"></i> Produtos (${results.items.length})
                </h4>
            </div>`;
            results.items.forEach(item => {
                html += `
                    <div class="item-card">
                        <div class="item-header">
                            <h3>${this.escapeHtml(item.name)}</h3>
                            <span style="font-size: 0.75rem; color: var(--gray-600);">Produto</span>
                        </div>
                        <div class="item-details">
                            <p><i class="fas fa-sticky-note"></i> <strong>Nota:</strong> ${this.escapeHtml(item.notes)}</p>
                        </div>
                    </div>
                `;
            });
        }

        // Clientes
        if (results.clients.length > 0) {
            html += `<div style="grid-column: 1/-1; margin-top: 1rem; margin-bottom: 0.5rem;">
                <h4 style="margin: 0 0 0.75rem 0; color: var(--dark-gray); font-size: 1rem;">
                    <i class="fas fa-user"></i> Clientes (${results.clients.length})
                </h4>
            </div>`;
            results.clients.forEach(client => {
                html += `
                    <div class="item-card">
                        <div class="item-header">
                            <h3>${this.escapeHtml(client.name)}</h3>
                            <span style="font-size: 0.75rem; color: var(--gray-600);">Cliente</span>
                        </div>
                        <div class="item-details">
                            <p><i class="fas fa-sticky-note"></i> <strong>Nota:</strong> ${this.escapeHtml(client.notes)}</p>
                        </div>
                    </div>
                `;
            });
        }

        // Fornecedores
        if (results.suppliers.length > 0) {
            html += `<div style="grid-column: 1/-1; margin-top: 1rem; margin-bottom: 0.5rem;">
                <h4 style="margin: 0 0 0.75rem 0; color: var(--dark-gray); font-size: 1rem;">
                    <i class="fas fa-truck"></i> Fornecedores (${results.suppliers.length})
                </h4>
            </div>`;
            results.suppliers.forEach(supplier => {
                html += `
                    <div class="item-card">
                        <div class="item-header">
                            <h3>${this.escapeHtml(supplier.name)}</h3>
                            <span style="font-size: 0.75rem; color: var(--gray-600);">Fornecedor</span>
                        </div>
                        <div class="item-details">
                            <p><i class="fas fa-sticky-note"></i> <strong>Nota:</strong> ${this.escapeHtml(supplier.notes)}</p>
                        </div>
                    </div>
                `;
            });
        }

        // Vendas
        if (results.sales.length > 0) {
            html += `<div style="grid-column: 1/-1; margin-top: 1rem; margin-bottom: 0.5rem;">
                <h4 style="margin: 0 0 0.75rem 0; color: var(--dark-gray); font-size: 1rem;">
                    <i class="fas fa-shopping-cart"></i> Vendas (${results.sales.length})
                </h4>
            </div>`;
            results.sales.forEach(sale => {
                const saleDate = sale.date ? new Date(sale.date).toLocaleDateString('pt-BR') : 'N/A';
                html += `
                    <div class="item-card">
                        <div class="item-header">
                            <h3>${this.escapeHtml(sale.name)}</h3>
                            <span style="font-size: 0.75rem; color: var(--gray-600);">Venda - ${saleDate}</span>
                        </div>
                        <div class="item-details">
                            <p><i class="fas fa-sticky-note"></i> <strong>Nota:</strong> ${this.escapeHtml(sale.notes)}</p>
                        </div>
                    </div>
                `;
            });
        }

        // Agendamentos
        if (results.appointments.length > 0) {
            html += `<div style="grid-column: 1/-1; margin-top: 1rem; margin-bottom: 0.5rem;">
                <h4 style="margin: 0 0 0.75rem 0; color: var(--dark-gray); font-size: 1rem;">
                    <i class="fas fa-calendar-check"></i> Agendamentos (${results.appointments.length})
                </h4>
            </div>`;
            results.appointments.forEach(appointment => {
                const appointmentDate = appointment.date ? new Date(appointment.date).toLocaleDateString('pt-BR') : 'N/A';
                html += `
                    <div class="item-card">
                        <div class="item-header">
                            <h3>${this.escapeHtml(appointment.name)}</h3>
                            <span style="font-size: 0.75rem; color: var(--gray-600);">Agendamento - ${appointmentDate}</span>
                        </div>
                        <div class="item-details">
                            <p><i class="fas fa-sticky-note"></i> <strong>Nota:</strong> ${this.escapeHtml(appointment.notes)}</p>
                        </div>
                    </div>
                `;
            });
        }

        resultsContainer.innerHTML = html;
    }

    // ========== BUSCA AVANÇADA ==========

    // Abrir modal de busca avançada
    openAdvancedSearchModal() {
        const modal = document.getElementById('advancedSearchModal');
        if (!modal) {
            console.error('Modal de busca avançada não encontrado');
            return;
        }
        
        const searchInput = document.getElementById('advancedSearchTerm');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        
        const resultsContainer = document.getElementById('advancedSearchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = '<p style="text-align: center; color: var(--gray-600); padding: 2rem;">Digite um termo e selecione onde buscar...</p>';
        }
        
        modal.classList.add('active');
    }

    // Fechar modal de busca avançada
    closeAdvancedSearchModal() {
        const modal = document.getElementById('advancedSearchModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Limpar busca avançada
    clearAdvancedSearch() {
        const searchInput = document.getElementById('advancedSearchTerm');
        const categorySelect = document.getElementById('advancedSearchCategory');
        const dateRangeSelect = document.getElementById('advancedSearchDateRange');
        const resultsContainer = document.getElementById('advancedSearchResults');
        
        if (searchInput) searchInput.value = '';
        if (categorySelect) categorySelect.value = '';
        if (dateRangeSelect) dateRangeSelect.value = '';
        if (resultsContainer) {
            resultsContainer.innerHTML = '<p style="text-align: center; color: var(--gray-600); padding: 2rem;">Digite um termo e selecione onde buscar...</p>';
        }
    }

    // Iniciar scanner QR na busca avançada
    startAdvancedSearchQRScanner() {
        if (!window.Html5Qrcode) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Biblioteca de scanner não carregada. Verifique sua conexão.', 3000);
            } else {
                alert('Biblioteca de scanner não carregada. Verifique sua conexão.');
            }
            return;
        }

        const container = document.getElementById('advancedSearchQRContainer');
        const readerDiv = document.getElementById('advancedSearchQRReader');

        if (!container || !readerDiv) return;

        // Parar scanner anterior se existir
        if (this.advancedSearchQRScanner) {
            this.stopAdvancedSearchQRScanner();
        }

        // Limpar conteúdo anterior
        readerDiv.innerHTML = '';
        container.style.display = 'block';

        const html5QrCode = new Html5Qrcode('advancedSearchQRReader');
        this.advancedSearchQRScanner = html5QrCode;

        html5QrCode
            .start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    // QR code lido - preencher campo de busca e executar
                    const searchInput = document.getElementById('advancedSearchTerm');
                    if (searchInput) {
                        searchInput.value = decodedText.trim();
                    }
                    this.stopAdvancedSearchQRScanner();
                    this.executeAdvancedSearch();
                    
                    if (typeof toast !== 'undefined' && toast) {
                        toast.success('QR Code escaneado! Buscando...', 2000);
                    }
                },
                (errorMessage) => {
                    // Erro ignorado (continua escaneando)
                }
            )
            .catch((err) => {
                console.error('Erro ao iniciar scanner:', err);
                if (typeof toast !== 'undefined' && toast) {
                    toast.error('Erro ao acessar a câmera. Verifique as permissões.', 3000);
                }
                container.style.display = 'none';
                this.advancedSearchQRScanner = null;
            });
    }

    // Parar scanner QR na busca avançada
    stopAdvancedSearchQRScanner() {
        const container = document.getElementById('advancedSearchQRContainer');
        const readerDiv = document.getElementById('advancedSearchQRReader');

        if (this.advancedSearchQRScanner) {
            this.advancedSearchQRScanner
                .stop()
                .then(() => {
                    if (container) container.style.display = 'none';
                    if (readerDiv) readerDiv.innerHTML = '';
                    this.advancedSearchQRScanner = null;
                })
                .catch((err) => {
                    console.error('Erro ao parar scanner:', err);
                    if (container) container.style.display = 'none';
                    if (readerDiv) readerDiv.innerHTML = '';
                    this.advancedSearchQRScanner = null;
                });
        } else {
            if (container) container.style.display = 'none';
            if (readerDiv) readerDiv.innerHTML = '';
        }
    }

    // Toggle busca por voz na busca avançada
    toggleAdvancedSearchVoice() {
        const voiceBtn = document.getElementById('advancedSearchVoiceBtn');
        const searchInput = document.getElementById('advancedSearchTerm');
        
        if (!voiceBtn || !searchInput) return;

        if (this.voiceRecognitionActive) {
            // Parar reconhecimento
            this.stopVoiceRecognition();
            voiceBtn.classList.remove('active');
            voiceBtn.style.background = '';
            if (typeof toast !== 'undefined' && toast) {
                toast.info('Busca por voz desativada', 2000);
            }
        } else {
            // Iniciar reconhecimento específico para busca
            this.startAdvancedSearchVoice();
            voiceBtn.classList.add('active');
            voiceBtn.style.background = 'var(--primary-color)';
            voiceBtn.style.color = 'white';
            if (typeof toast !== 'undefined' && toast) {
                toast.info('Fale o termo de busca...', 2000);
            }
        }
    }

    // Iniciar busca por voz na busca avançada
    startAdvancedSearchVoice() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Reconhecimento de voz não suportado neste navegador', 3000);
            }
            return;
        }

        if (this.voiceRecognitionActive) {
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            this.voiceRecognitionActive = true;
            console.log('🎤 [VOICE SEARCH] Reconhecimento de voz iniciado para busca');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('🎤 [VOICE SEARCH] Texto reconhecido:', transcript);
            
            // Preencher campo de busca
            const searchInput = document.getElementById('advancedSearchTerm');
            if (searchInput) {
                searchInput.value = transcript.trim();
            }
            
            // Executar busca automaticamente
            setTimeout(() => {
                this.executeAdvancedSearch();
            }, 500);
            
            if (typeof toast !== 'undefined' && toast) {
                toast.success(`Buscando: "${transcript}"`, 2000);
            }
        };

        recognition.onerror = (event) => {
            console.error('❌ [VOICE SEARCH] Erro no reconhecimento:', event.error);
            this.voiceRecognitionActive = false;
            const voiceBtn = document.getElementById('advancedSearchVoiceBtn');
            if (voiceBtn) {
                voiceBtn.classList.remove('active');
                voiceBtn.style.background = '';
            }
            
            if (event.error === 'no-speech') {
                if (typeof toast !== 'undefined' && toast) {
                    toast.warning('Nenhum áudio detectado. Tente novamente.', 2000);
                }
            } else {
                if (typeof toast !== 'undefined' && toast) {
                    toast.error('Erro no reconhecimento de voz', 2000);
                }
            }
        };

        recognition.onend = () => {
            this.voiceRecognitionActive = false;
            const voiceBtn = document.getElementById('advancedSearchVoiceBtn');
            if (voiceBtn) {
                voiceBtn.classList.remove('active');
                voiceBtn.style.background = '';
            }
            console.log('🎤 [VOICE SEARCH] Reconhecimento de voz finalizado');
        };

        this.voiceRecognition = recognition;
        recognition.start();
    }

    // Executar busca avançada
    executeAdvancedSearch() {
        const searchTerm = document.getElementById('advancedSearchTerm')?.value.trim();
        const resultsContainer = document.getElementById('advancedSearchResults');
        
        if (!resultsContainer) return;
        
        if (!searchTerm) {
            resultsContainer.innerHTML = '<p style="text-align: center; color: var(--gray-600); padding: 2rem;">Digite um termo para buscar...</p>';
            return;
        }
        
        const search = searchTerm.toLowerCase();
        const results = {
            items: [],
            clients: [],
            suppliers: [],
            sales: [],
            appointments: []
        };
        
        // Verificar quais entidades buscar
        const searchInProducts = document.getElementById('searchInProducts')?.checked || false;
        const searchInClients = document.getElementById('searchInClients')?.checked || false;
        const searchInSuppliers = document.getElementById('searchInSuppliers')?.checked || false;
        const searchInSales = document.getElementById('searchInSales')?.checked || false;
        const searchInAppointments = document.getElementById('searchInAppointments')?.checked || false;
        const searchInNotes = document.getElementById('searchInNotes')?.checked || false;
        const categoryFilter = document.getElementById('advancedSearchCategory')?.value || '';
        const dateRangeFilter = document.getElementById('advancedSearchDateRange')?.value || '';
        
        // Calcular range de datas se necessário
        let dateStart = null;
        let dateEnd = null;
        if (dateRangeFilter) {
            const now = new Date();
            switch (dateRangeFilter) {
                case 'today':
                    dateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    dateEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                    break;
                case 'week':
                    const dayOfWeek = now.getDay();
                    dateStart = new Date(now);
                    dateStart.setDate(now.getDate() - dayOfWeek);
                    dateStart.setHours(0, 0, 0, 0);
                    dateEnd = new Date(dateStart);
                    dateEnd.setDate(dateStart.getDate() + 7);
                    break;
                case 'month':
                    dateStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    dateEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                    break;
                case 'quarter':
                    const quarter = Math.floor(now.getMonth() / 3);
                    dateStart = new Date(now.getFullYear(), quarter * 3, 1);
                    dateEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 1);
                    break;
                case 'year':
                    dateStart = new Date(now.getFullYear(), 0, 1);
                    dateEnd = new Date(now.getFullYear() + 1, 0, 1);
                    break;
            }
        }
        
        // Buscar em produtos
        if (searchInProducts) {
            this.items.forEach(item => {
                if (categoryFilter && item.category !== categoryFilter) return;
                
                const itemName = item.name || item.brand || item.model || '';
                const itemBrand = item.brand || '';
                const itemModel = item.model || '';
                const itemStyle = item.style || '';
                
                const matches = 
                    itemName.toLowerCase().includes(search) ||
                    itemBrand.toLowerCase().includes(search) ||
                    itemModel.toLowerCase().includes(search) ||
                    itemStyle.toLowerCase().includes(search) ||
                    (searchInNotes && item.notes && item.notes.toLowerCase().includes(search));
                
                if (matches) {
                    results.items.push({
                        id: item.id,
                        name: itemName || itemBrand || itemModel || `Produto ${item.id}`,
                        category: item.category,
                        price: item.price,
                        type: 'item'
                    });
                }
            });
        }
        
        // Buscar em clientes
        if (searchInClients) {
            this.clients.forEach(client => {
                const matches = 
                    client.name.toLowerCase().includes(search) ||
                    (client.cpf && client.cpf.toLowerCase().includes(search)) ||
                    (client.email && client.email.toLowerCase().includes(search)) ||
                    (client.phone && client.phone.toLowerCase().includes(search)) ||
                    (searchInNotes && client.notes && client.notes.toLowerCase().includes(search));
                
                if (matches) {
                    results.clients.push({
                        id: client.id,
                        name: client.name,
                        cpf: client.cpf,
                        email: client.email,
                        type: 'client'
                    });
                }
            });
        }
        
        // Buscar em fornecedores
        if (searchInSuppliers) {
            this.suppliers.forEach(supplier => {
                const matches = 
                    supplier.name.toLowerCase().includes(search) ||
                    (supplier.cnpj && supplier.cnpj.toLowerCase().includes(search)) ||
                    (supplier.email && supplier.email.toLowerCase().includes(search)) ||
                    (supplier.phone && supplier.phone.toLowerCase().includes(search)) ||
                    (searchInNotes && supplier.notes && supplier.notes.toLowerCase().includes(search));
                
                if (matches) {
                    results.suppliers.push({
                        id: supplier.id,
                        name: supplier.name,
                        cnpj: supplier.cnpj,
                        type: 'supplier'
                    });
                }
            });
        }
        
        // Buscar em vendas
        if (searchInSales) {
            this.completedSales.forEach(sale => {
                // Filtrar por data se necessário
                if (dateStart && dateEnd) {
                    const saleDate = new Date(sale.date);
                    if (saleDate < dateStart || saleDate >= dateEnd) return;
                }
                
                const matches = 
                    sale.customerName.toLowerCase().includes(search) ||
                    (sale.orderCode && sale.orderCode.toLowerCase().includes(search)) ||
                    (sale.items && sale.items.some(item => item.name && item.name.toLowerCase().includes(search))) ||
                    (searchInNotes && sale.notes && sale.notes.toLowerCase().includes(search));
                
                if (matches) {
                    results.sales.push({
                        id: sale.id,
                        name: sale.customerName,
                        orderCode: sale.orderCode,
                        totalValue: sale.totalValue,
                        date: sale.date,
                        type: 'sale'
                    });
                }
            });
        }
        
        // Buscar em agendamentos
        if (searchInAppointments) {
            this.serviceAppointments.forEach(appointment => {
                // Filtrar por data se necessário
                if (dateStart && dateEnd) {
                    const appointmentDate = new Date(appointment.date);
                    if (appointmentDate < dateStart || appointmentDate >= dateEnd) return;
                }
                
                const service = this.items.find(item => item.id === appointment.serviceTypeId);
                const serviceName = service ? (service.name || service.brand || service.model) : '';
                
                const matches = 
                    appointment.customerName.toLowerCase().includes(search) ||
                    (appointment.customerContact && appointment.customerContact.toLowerCase().includes(search)) ||
                    (serviceName && serviceName.toLowerCase().includes(search)) ||
                    (searchInNotes && appointment.notes && appointment.notes.toLowerCase().includes(search));
                
                if (matches) {
                    results.appointments.push({
                        id: appointment.id,
                        name: appointment.customerName,
                        serviceName: serviceName,
                        date: appointment.date,
                        time: appointment.time,
                        status: appointment.status,
                        type: 'appointment'
                    });
                }
            });
        }
        
        // Renderizar resultados
        this.renderAdvancedSearchResults(results, searchTerm);
    }

    // Renderizar resultados da busca avançada
    renderAdvancedSearchResults(results, searchTerm) {
        const resultsContainer = document.getElementById('advancedSearchResults');
        if (!resultsContainer) return;
        
        const totalResults = results.items.length + results.clients.length + 
                           results.suppliers.length + results.sales.length + 
                           results.appointments.length;

        if (totalResults === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3 class="empty-state-title">Nenhum resultado encontrado</h3>
                    <p class="empty-state-message">
                        Não foram encontrados resultados para "${this.escapeHtml(searchTerm)}"
                    </p>
                </div>
            `;
            return;
        }

        let html = `<div style="grid-column: 1/-1; margin-bottom: 1rem; padding: 1rem; background: var(--light-gray); border-radius: var(--radius-md);">
            <h3 style="margin: 0 0 0.5rem 0; color: var(--primary-color);">
                <i class="fas fa-search"></i> Resultados da busca: "${this.escapeHtml(searchTerm)}"
            </h3>
            <p style="margin: 0; color: var(--gray-600); font-size: 0.9rem;">
                Encontrados ${totalResults} resultado(s)
            </p>
        </div>`;

        // Produtos
        if (results.items.length > 0) {
            html += `<div style="grid-column: 1/-1; margin-bottom: 0.5rem;">
                <h4 style="margin: 0 0 0.75rem 0; color: var(--dark-gray); font-size: 1rem;">
                    <i class="fas fa-box"></i> Produtos (${results.items.length})
                </h4>
            </div>`;
            results.items.forEach(item => {
                html += `
                    <div class="item-card">
                        <div class="item-header">
                            <h3>${this.escapeHtml(item.name)}</h3>
                            <span style="font-size: 0.75rem; color: var(--gray-600);">${item.category || 'Produto'}</span>
                        </div>
                        <div class="item-details">
                            <p><i class="fas fa-dollar-sign"></i> Preço: R$ ${(item.price || 0).toFixed(2).replace('.', ',')}</p>
                        </div>
                    </div>
                `;
            });
        }

        // Clientes
        if (results.clients.length > 0) {
            html += `<div style="grid-column: 1/-1; margin-top: 1rem; margin-bottom: 0.5rem;">
                <h4 style="margin: 0 0 0.75rem 0; color: var(--dark-gray); font-size: 1rem;">
                    <i class="fas fa-user"></i> Clientes (${results.clients.length})
                </h4>
            </div>`;
            results.clients.forEach(client => {
                html += `
                    <div class="item-card">
                        <div class="item-header">
                            <h3>${this.escapeHtml(client.name)}</h3>
                            <span style="font-size: 0.75rem; color: var(--gray-600);">Cliente</span>
                        </div>
                        <div class="item-details">
                            ${client.cpf ? `<p><i class="fas fa-id-card"></i> CPF: ${this.escapeHtml(client.cpf)}</p>` : ''}
                            ${client.email ? `<p><i class="fas fa-envelope"></i> ${this.escapeHtml(client.email)}</p>` : ''}
                        </div>
                    </div>
                `;
            });
        }

        // Fornecedores
        if (results.suppliers.length > 0) {
            html += `<div style="grid-column: 1/-1; margin-top: 1rem; margin-bottom: 0.5rem;">
                <h4 style="margin: 0 0 0.75rem 0; color: var(--dark-gray); font-size: 1rem;">
                    <i class="fas fa-truck"></i> Fornecedores (${results.suppliers.length})
                </h4>
            </div>`;
            results.suppliers.forEach(supplier => {
                html += `
                    <div class="item-card">
                        <div class="item-header">
                            <h3>${this.escapeHtml(supplier.name)}</h3>
                            <span style="font-size: 0.75rem; color: var(--gray-600);">Fornecedor</span>
                        </div>
                        <div class="item-details">
                            ${supplier.cnpj ? `<p><i class="fas fa-building"></i> CNPJ: ${this.escapeHtml(supplier.cnpj)}</p>` : ''}
                        </div>
                    </div>
                `;
            });
        }

        // Vendas
        if (results.sales.length > 0) {
            html += `<div style="grid-column: 1/-1; margin-top: 1rem; margin-bottom: 0.5rem;">
                <h4 style="margin: 0 0 0.75rem 0; color: var(--dark-gray); font-size: 1rem;">
                    <i class="fas fa-shopping-cart"></i> Vendas (${results.sales.length})
                </h4>
            </div>`;
            results.sales.forEach(sale => {
                const saleDate = sale.date ? new Date(sale.date).toLocaleDateString('pt-BR') : 'N/A';
                html += `
                    <div class="item-card">
                        <div class="item-header">
                            <h3>${this.escapeHtml(sale.name)}</h3>
                            <span style="font-size: 0.75rem; color: var(--gray-600);">Venda - ${saleDate}</span>
                        </div>
                        <div class="item-details">
                            ${sale.orderCode ? `<p><i class="fas fa-barcode"></i> Código: ${this.escapeHtml(sale.orderCode)}</p>` : ''}
                            <p><i class="fas fa-dollar-sign"></i> Total: R$ ${(sale.totalValue || 0).toFixed(2).replace('.', ',')}</p>
                        </div>
                    </div>
                `;
            });
        }

        // Agendamentos
        if (results.appointments.length > 0) {
            html += `<div style="grid-column: 1/-1; margin-top: 1rem; margin-bottom: 0.5rem;">
                <h4 style="margin: 0 0 0.75rem 0; color: var(--dark-gray); font-size: 1rem;">
                    <i class="fas fa-calendar-check"></i> Agendamentos (${results.appointments.length})
                </h4>
            </div>`;
            results.appointments.forEach(appointment => {
                const appointmentDate = appointment.date ? new Date(appointment.date).toLocaleDateString('pt-BR') : 'N/A';
                const statusNames = {
                    pending: 'Pendente',
                    confirmed: 'Confirmado',
                    completed: 'Concluído',
                    cancelled: 'Cancelado'
                };
                html += `
                    <div class="item-card">
                        <div class="item-header">
                            <h3>${this.escapeHtml(appointment.name)}</h3>
                            <span style="font-size: 0.75rem; color: var(--gray-600);">Agendamento - ${appointmentDate}</span>
                        </div>
                        <div class="item-details">
                            ${appointment.serviceName ? `<p><i class="fas fa-tools"></i> Serviço: ${this.escapeHtml(appointment.serviceName)}</p>` : ''}
                            ${appointment.time ? `<p><i class="fas fa-clock"></i> Horário: ${this.escapeHtml(appointment.time)}</p>` : ''}
                            <p><i class="fas fa-info-circle"></i> Status: ${statusNames[appointment.status] || appointment.status}</p>
                        </div>
                    </div>
                `;
            });
        }

        resultsContainer.innerHTML = html;
    }

    // ========== HISTÓRICO DE PROMOÇÕES ==========

    // Abrir modal de histórico de promoções
    openPromotionHistoryModal() {
        const modal = document.getElementById('promotionHistoryModal');
        if (!modal) {
            console.error('Modal de histórico de promoções não encontrado');
            return;
        }
        
        this.populatePromotionHistoryFilter();
        this.renderPromotionHistory();
        modal.classList.add('active');
    }

    // Fechar modal de histórico de promoções
    closePromotionHistoryModal() {
        const modal = document.getElementById('promotionHistoryModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Popular filtro de cupons no histórico
    populatePromotionHistoryFilter() {
        const filter = document.getElementById('promotionHistoryFilter');
        if (!filter) return;
        
        // Limpar opções existentes (exceto a primeira)
        while (filter.options.length > 1) {
            filter.remove(1);
        }
        
        // Adicionar cupons
        this.coupons.forEach(coupon => {
            const option = document.createElement('option');
            option.value = coupon.code;
            option.textContent = `${coupon.code} - ${coupon.description || 'Sem descrição'}`;
            filter.appendChild(option);
        });
    }

    // Renderizar histórico de promoções
    renderPromotionHistory() {
        const container = document.getElementById('promotionHistoryList');
        const filter = document.getElementById('promotionHistoryFilter');
        
        if (!container) return;
        
        const selectedCouponCode = filter ? filter.value : '';
        
        // Buscar vendas que usaram cupons
        const salesWithCoupons = this.completedSales.filter(sale => 
            sale.discount && sale.discount.couponCode &&
            (!selectedCouponCode || sale.discount.couponCode === selectedCouponCode)
        );
        
        if (salesWithCoupons.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">
                        <i class="fas fa-history"></i>
                    </div>
                    <h3 class="empty-state-title">Nenhum uso de cupom encontrado</h3>
                    <p class="empty-state-message">
                        ${selectedCouponCode ? 'Este cupom ainda não foi usado em nenhuma venda.' : 'Ainda não há vendas que utilizaram cupons de desconto.'}
                    </p>
                </div>
            `;
            return;
        }
        
        // Agrupar por cupom
        const historyByCoupon = {};
        salesWithCoupons.forEach(sale => {
            const couponCode = sale.discount.couponCode;
            if (!historyByCoupon[couponCode]) {
                const coupon = this.coupons.find(c => c.code === couponCode);
                historyByCoupon[couponCode] = {
                    coupon: coupon,
                    sales: [],
                    totalDiscount: 0,
                    totalValue: 0
                };
            }
            historyByCoupon[couponCode].sales.push(sale);
            historyByCoupon[couponCode].totalDiscount += sale.discount.amount || 0;
            historyByCoupon[couponCode].totalValue += sale.totalValue || 0;
        });
        
        let html = '';
        
        // Renderizar por cupom
        Object.keys(historyByCoupon).forEach(couponCode => {
            const history = historyByCoupon[couponCode];
            const coupon = history.coupon;
            
            html += `
                <div style="margin-bottom: 2rem; padding: 1.5rem; background: var(--white); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border-color);">
                        <div>
                            <h3 style="margin: 0; color: var(--primary-color);">
                                <i class="fas fa-tag"></i> ${this.escapeHtml(couponCode)}
                            </h3>
                            ${coupon ? `
                                <p style="margin: 0.5rem 0 0 0; color: var(--gray-600); font-size: 0.9rem;">
                                    ${coupon.type === 'percent' ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2).replace('.', ',')}`} de desconto
                                    ${coupon.description ? ` - ${this.escapeHtml(coupon.description)}` : ''}
                                </p>
                            ` : ''}
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 0; font-size: 0.85rem; color: var(--gray-600);">Total de usos</p>
                            <p style="margin: 0.25rem 0 0 0; font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">
                                ${history.sales.length}
                            </p>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="padding: 1rem; background: var(--light-gray); border-radius: var(--radius-sm);">
                            <p style="margin: 0; font-size: 0.85rem; color: var(--gray-600);">Total em Descontos</p>
                            <p style="margin: 0.25rem 0 0 0; font-size: 1.2rem; font-weight: 600; color: #28a745;">
                                R$ ${history.totalDiscount.toFixed(2).replace('.', ',')}
                            </p>
                        </div>
                        <div style="padding: 1rem; background: var(--light-gray); border-radius: var(--radius-sm);">
                            <p style="margin: 0; font-size: 0.85rem; color: var(--gray-600);">Valor Total das Vendas</p>
                            <p style="margin: 0.25rem 0 0 0; font-size: 1.2rem; font-weight: 600; color: var(--primary-color);">
                                R$ ${history.totalValue.toFixed(2).replace('.', ',')}
                            </p>
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="margin: 0 0 1rem 0; color: var(--dark-gray); font-size: 1rem;">
                            <i class="fas fa-shopping-cart"></i> Vendas que usaram este cupom (${history.sales.length})
                        </h4>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            ${history.sales.map(sale => {
                                const saleDate = sale.date ? new Date(sale.date).toLocaleDateString('pt-BR') : 'N/A';
                                const saleTime = sale.date ? new Date(sale.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
                                return `
                                    <div style="padding: 1rem; background: var(--light-gray); border-radius: var(--radius-sm); border-left: 3px solid var(--primary-color);">
                                        <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 0.5rem;">
                                            <div style="flex: 1;">
                                                <p style="margin: 0; font-weight: 600; color: var(--dark-gray);">
                                                    ${this.escapeHtml(sale.customerName || 'Cliente não informado')}
                                                </p>
                                                <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--gray-600);">
                                                    <i class="fas fa-calendar"></i> ${saleDate} ${saleTime ? `às ${saleTime}` : ''}
                                                    ${sale.orderCode ? ` | <i class="fas fa-barcode"></i> ${this.escapeHtml(sale.orderCode)}` : ''}
                                                </p>
                                            </div>
                                            <div style="text-align: right;">
                                                <p style="margin: 0; font-size: 0.85rem; color: var(--gray-600);">Desconto aplicado</p>
                                                <p style="margin: 0.25rem 0 0 0; font-weight: 600; color: #28a745;">
                                                    - R$ ${(sale.discount.amount || 0).toFixed(2).replace('.', ',')}
                                                </p>
                                                <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--gray-600);">
                                                    Total: R$ ${(sale.totalValue || 0).toFixed(2).replace('.', ',')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    // ========== SISTEMA DE ALERTAS ==========

    // Verificar alertas de metas próximas
    checkGoalsAlerts() {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const currentGoal = this.goals.find((g) => g.month === currentMonth);
        
        if (!currentGoal) return;
        
        const currentSales = this.getMonthSales(currentMonth);
        const progress = (currentSales / currentGoal.amount) * 100;
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInMonth - now.getDate();
        
        // Alerta se está entre 75-95% e faltam menos de 7 dias
        if (progress >= 75 && progress < 100 && daysRemaining <= 7) {
            const remaining = currentGoal.amount - currentSales;
            if (typeof toast !== 'undefined' && toast) {
                toast.warning(
                    `Meta do mês: ${progress.toFixed(1)}% concluída. Faltam R$ ${remaining.toFixed(2).replace('.', ',')} e ${daysRemaining} dia(s) restante(s)!`,
                    5000
                );
            }
        }
    }

    // Verificar lembretes de agendamentos
    checkAppointmentsReminders() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        
        // Agendamentos hoje
        const todayAppointments = this.serviceAppointments.filter(apt => {
            if (apt.status === 'completed' || apt.status === 'cancelled') return false;
            const aptDate = new Date(`${apt.date}T${apt.time}`);
            return aptDate >= now && aptDate <= todayEnd;
        });
        
        // Agendamentos amanhã
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(23, 59, 59, 999);
        const tomorrowAppointments = this.serviceAppointments.filter(apt => {
            if (apt.status === 'completed' || apt.status === 'cancelled') return false;
            const aptDate = new Date(`${apt.date}T${apt.time}`);
            return aptDate >= tomorrow && aptDate <= tomorrowEnd;
        });
        
        // Mostrar alertas (apenas uma vez por sessão)
        if (todayAppointments.length > 0 && !sessionStorage.getItem('todayAppointmentsAlerted')) {
            if (typeof toast !== 'undefined' && toast) {
                toast.info(
                    `Você tem ${todayAppointments.length} agendamento(s) hoje!`,
                    4000
                );
                sessionStorage.setItem('todayAppointmentsAlerted', 'true');
            }
        }
        
        if (tomorrowAppointments.length > 0 && !sessionStorage.getItem('tomorrowAppointmentsAlerted')) {
            if (typeof toast !== 'undefined' && toast) {
                toast.info(
                    `Você tem ${tomorrowAppointments.length} agendamento(s) amanhã!`,
                    4000
                );
                sessionStorage.setItem('tomorrowAppointmentsAlerted', 'true');
            }
        }
    }

    // Verificar pedidos vencidos ou próximos do vencimento
    checkPendingOrdersAlerts() {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        const expiredOrders = this.pendingOrders.filter(order => {
            if (!order.dueDate || order.status === 'cancelled' || order.status === 'completed') return false;
            const dueDate = new Date(order.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < now;
        });
        
        const expiringSoonOrders = this.pendingOrders.filter(order => {
            if (!order.dueDate || order.status === 'cancelled' || order.status === 'completed') return false;
            const dueDate = new Date(order.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
            return daysUntilDue >= 0 && daysUntilDue <= 3;
        });
        
        if (expiredOrders.length > 0 && !sessionStorage.getItem('expiredOrdersAlerted')) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error(
                    `Atenção! ${expiredOrders.length} pedido(s) vencido(s) precisam de atenção.`,
                    5000
                );
                sessionStorage.setItem('expiredOrdersAlerted', 'true');
            }
        }
        
        if (expiringSoonOrders.length > 0 && !sessionStorage.getItem('expiringSoonOrdersAlerted')) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning(
                    `${expiringSoonOrders.length} pedido(s) vence(m) em até 3 dias!`,
                    4000
                );
                sessionStorage.setItem('expiringSoonOrdersAlerted', 'true');
            }
        }
    }

    // ========== CONSTRUTOR DE RELATÓRIOS PERSONALIZADOS ==========

    // Abrir modal de construtor de relatórios
    openReportBuilderModal() {
        const modal = document.getElementById('reportBuilderModal');
        if (!modal) {
            console.error('Modal de construtor de relatórios não encontrado');
            return;
        }
        
        // Limpar formulário
        const form = document.getElementById('reportBuilderForm');
        if (form) form.reset();
        
        // Definir datas padrão (mês atual)
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const startDateInput = document.getElementById('reportBuilderStartDate');
        const endDateInput = document.getElementById('reportBuilderEndDate');
        if (startDateInput) {
            startDateInput.value = firstDay.toISOString().split('T')[0];
        }
        if (endDateInput) {
            endDateInput.value = lastDay.toISOString().split('T')[0];
        }
        
        modal.classList.add('active');
    }

    // Fechar modal de construtor de relatórios
    closeReportBuilderModal() {
        const modal = document.getElementById('reportBuilderModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Atualizar campos do construtor baseado no tipo
    updateReportBuilderFields() {
        const type = document.getElementById('reportBuilderType')?.value;
        const filtersDiv = document.getElementById('reportBuilderFilters');
        
        if (!filtersDiv) return;
        
        // Mostrar/ocultar filtros específicos baseado no tipo
        const categoryFilter = document.getElementById('reportBuilderCategory')?.parentElement;
        const statusFilter = document.getElementById('reportBuilderStatus')?.parentElement;
        
        if (categoryFilter) {
            categoryFilter.style.display = (type === 'products' || type === 'sales') ? 'block' : 'none';
        }
        if (statusFilter) {
            statusFilter.style.display = (type === 'sales' || type === 'services') ? 'block' : 'none';
        }
    }

    // Definir período pré-definido
    setReportBuilderPeriod() {
        const period = document.getElementById('reportBuilderPeriod')?.value;
        if (!period || period === '') return;
        
        const now = new Date();
        let startDate, endDate;
        
        switch (period) {
            case 'today':
                startDate = new Date(now);
                endDate = new Date(now);
                break;
            case 'week':
                const dayOfWeek = now.getDay();
                startDate = new Date(now);
                startDate.setDate(now.getDate() - dayOfWeek);
                endDate = new Date(now);
                endDate.setDate(now.getDate() + (6 - dayOfWeek));
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'lastQuarter':
                const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
                const lastQuarterYear = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
                const lastQuarterMonth = lastQuarter < 0 ? 9 : lastQuarter * 3;
                startDate = new Date(lastQuarterYear, lastQuarterMonth, 1);
                endDate = new Date(lastQuarterYear, lastQuarterMonth + 3, 0);
                break;
            case 'lastYear':
                startDate = new Date(now.getFullYear() - 1, 0, 1);
                endDate = new Date(now.getFullYear() - 1, 11, 31);
                break;
            default:
                return;
        }
        
        const startDateInput = document.getElementById('reportBuilderStartDate');
        const endDateInput = document.getElementById('reportBuilderEndDate');
        if (startDateInput) startDateInput.value = startDate.toISOString().split('T')[0];
        if (endDateInput) endDateInput.value = endDate.toISOString().split('T')[0];
    }

    // Gerar relatório personalizado
    generateCustomReport(e) {
        if (e) e.preventDefault();
        
        const type = document.getElementById('reportBuilderType')?.value;
        const startDate = document.getElementById('reportBuilderStartDate')?.value;
        const endDate = document.getElementById('reportBuilderEndDate')?.value;
        const format = document.getElementById('reportBuilderFormat')?.value;
        const includeCharts = document.getElementById('reportBuilderIncludeCharts')?.checked || false;
        const includeSummary = document.getElementById('reportBuilderIncludeSummary')?.checked || false;
        const category = document.getElementById('reportBuilderCategory')?.value || '';
        const status = document.getElementById('reportBuilderStatus')?.value || '';
        
        if (!type || !format) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Por favor, preencha todos os campos obrigatórios.', 3000);
            }
            return;
        }
        
        if (!startDate || !endDate) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Por favor, selecione o período do relatório.', 3000);
            }
            return;
        }
        
        // Coletar dados baseado no tipo
        let reportData = {};
        let reportTitle = '';
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        switch (type) {
            case 'sales':
                reportTitle = 'Relatório de Vendas';
                reportData = this.generateSalesReport(start, end, category, status);
                break;
            case 'services':
                reportTitle = 'Relatório de Serviços';
                reportData = this.generateServicesReport(start, end, status);
                break;
            case 'products':
                reportTitle = 'Relatório de Produtos';
                reportData = this.generateProductsReport(start, end, category);
                break;
            case 'clients':
                reportTitle = 'Relatório de Clientes';
                reportData = this.generateClientsReport(start, end);
                break;
            case 'financial':
                reportTitle = 'Relatório Financeiro';
                reportData = this.generateFinancialReport(start, end);
                break;
            case 'custom':
                reportTitle = 'Relatório Personalizado';
                reportData = this.generateCustomCombinedReport(start, end, category, status);
                break;
        }
        
        // Verificar se é agendamento ou compartilhamento
        const isScheduled = document.getElementById('reportBuilderSchedule')?.checked || false;
        const isShared = document.getElementById('reportBuilderShare')?.checked || false;
        
        // Configuração do relatório
        const reportConfig = {
            type,
            startDate,
            endDate,
            format,
            includeCharts,
            includeSummary,
            category,
            status,
            title: reportTitle
        };
        
        // Agendar relatório se solicitado
        if (isScheduled) {
            const scheduleDate = document.getElementById('reportBuilderScheduleDate')?.value;
            const scheduleTime = document.getElementById('reportBuilderScheduleTime')?.value;
            const frequency = document.getElementById('reportBuilderScheduleFrequency')?.value || 'once';
            
            if (scheduleDate && scheduleTime) {
                this.scheduleReport(reportConfig, scheduleDate, scheduleTime, frequency);
                if (typeof toast !== 'undefined' && toast) {
                    toast.success('Relatório agendado com sucesso!', 3000);
                }
            } else {
                if (typeof toast !== 'undefined' && toast) {
                    toast.warning('Por favor, preencha data e hora do agendamento.', 3000);
                }
                return;
            }
        }
        
        // Compartilhar relatório se solicitado
        if (isShared) {
            const shareEmails = document.getElementById('reportBuilderShareEmails')?.value;
            const shareMessage = document.getElementById('reportBuilderShareMessage')?.value || '';
            
            if (shareEmails) {
                this.shareReport(reportConfig, shareEmails, shareMessage);
                if (typeof toast !== 'undefined' && toast) {
                    toast.success('Relatório compartilhado com sucesso!', 3000);
                }
            } else {
                if (typeof toast !== 'undefined' && toast) {
                    toast.warning('Por favor, informe pelo menos um email para compartilhamento.', 3000);
                }
                return;
            }
        }
        
        // Se não for agendamento, gerar imediatamente
        if (!isScheduled) {
            // Exportar no formato selecionado
            this.exportReport(reportData, reportTitle, format, includeCharts, includeSummary);
            
            // Fechar modal
            this.closeReportBuilderModal();
            
            if (typeof toast !== 'undefined' && toast) {
                toast.success('Relatório gerado com sucesso!', 3000);
            }
        } else {
            // Se for agendamento, apenas fechar modal
            this.closeReportBuilderModal();
        }
    }
    
    // Toggle campos de agendamento
    toggleScheduleFields() {
        const scheduleCheckbox = document.getElementById('reportBuilderSchedule');
        const scheduleFields = document.getElementById('scheduleFields');
        
        if (scheduleCheckbox && scheduleFields) {
            scheduleFields.style.display = scheduleCheckbox.checked ? 'block' : 'none';
            
            // Definir data/hora padrão se estiver marcado
            if (scheduleCheckbox.checked) {
                const now = new Date();
                const scheduleDate = document.getElementById('reportBuilderScheduleDate');
                const scheduleTime = document.getElementById('reportBuilderScheduleTime');
                
                if (scheduleDate) {
                    scheduleDate.value = now.toISOString().split('T')[0];
                }
                if (scheduleTime) {
                    scheduleTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                }
            }
        }
    }
    
    // Toggle campos de compartilhamento
    toggleShareFields() {
        const shareCheckbox = document.getElementById('reportBuilderShare');
        const shareFields = document.getElementById('shareFields');
        
        if (shareCheckbox && shareFields) {
            shareFields.style.display = shareCheckbox.checked ? 'block' : 'none';
        }
    }
    
    // Agendar relatório
    scheduleReport(config, scheduleDate, scheduleTime, frequency) {
        const scheduleDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        const now = new Date();
        
        if (scheduleDateTime <= now && frequency === 'once') {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('A data/hora do agendamento deve ser no futuro.', 3000);
            }
            return;
        }
        
        const scheduledReport = {
            id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            config,
            scheduleDate: scheduleDateTime.toISOString(),
            frequency,
            createdAt: new Date().toISOString(),
            lastRun: null,
            nextRun: scheduleDateTime.toISOString(),
            active: true
        };
        
        this.scheduledReports.push(scheduledReport);
        this.saveData();
        
        console.log('✅ [SCHEDULE] Relatório agendado:', scheduledReport);
        
        // Iniciar verificação de agendamentos se ainda não estiver rodando
        if (!this.scheduleCheckInterval) {
            this.initScheduleChecker();
        }
    }
    
    // Compartilhar relatório
    shareReport(config, emails, message) {
        const emailList = emails.split(',').map(email => email.trim()).filter(email => email);
        
        if (emailList.length === 0) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Nenhum email válido fornecido.', 3000);
            }
            return;
        }
        
        const sharedReport = {
            id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            config,
            sharedWith: emailList,
            message,
            sharedAt: new Date().toISOString(),
            sent: false // Será marcado como true quando enviado (simulado)
        };
        
        this.sharedReports.push(sharedReport);
        this.saveData();
        
        console.log('✅ [SHARE] Relatório compartilhado:', sharedReport);
        
        // Simular envio (em produção, isso chamaria a API de email)
        this.sendSharedReport(sharedReport);
    }
    
    // Enviar relatório compartilhado (simulado)
    async sendSharedReport(sharedReport) {
        // Em produção, isso chamaria a API de email configurada
        // Por enquanto, apenas simula o envio
        console.log('📧 [SHARE] Simulando envio de relatório para:', sharedReport.sharedWith);
        
        // Marcar como enviado após simulação
        setTimeout(() => {
            sharedReport.sent = true;
            this.saveData();
            if (typeof toast !== 'undefined' && toast) {
                toast.info(`Relatório compartilhado com ${sharedReport.sharedWith.length} destinatário(s)`, 3000);
            }
        }, 1000);
    }
    
    // Inicializar verificador de agendamentos
    initScheduleChecker() {
        // Verificar a cada minuto
        this.scheduleCheckInterval = setInterval(() => {
            this.checkScheduledReports();
        }, 60000); // 1 minuto
        
        // Verificar imediatamente também
        this.checkScheduledReports();
        
        console.log('✅ [SCHEDULE] Verificador de agendamentos iniciado');
    }
    
    // Verificar e executar relatórios agendados
    checkScheduledReports() {
        const now = new Date();
        let hasChanges = false;
        
        this.scheduledReports.forEach(scheduled => {
            if (!scheduled.active) return;
            
            const nextRun = new Date(scheduled.nextRun);
            
            // Se chegou a hora de executar
            if (nextRun <= now) {
                console.log('⏰ [SCHEDULE] Executando relatório agendado:', scheduled.id);
                
                // Gerar relatório
                this.executeScheduledReport(scheduled);
                
                // Atualizar próxima execução baseado na frequência
                scheduled.lastRun = new Date().toISOString();
                
                if (scheduled.frequency === 'once') {
                    scheduled.active = false;
                } else {
                    // Calcular próxima execução
                    const nextDate = new Date(nextRun);
                    switch (scheduled.frequency) {
                        case 'daily':
                            nextDate.setDate(nextDate.getDate() + 1);
                            break;
                        case 'weekly':
                            nextDate.setDate(nextDate.getDate() + 7);
                            break;
                        case 'monthly':
                            nextDate.setMonth(nextDate.getMonth() + 1);
                            break;
                    }
                    scheduled.nextRun = nextDate.toISOString();
                }
                
                hasChanges = true;
            }
        });
        
        // Remover agendamentos inativos
        this.scheduledReports = this.scheduledReports.filter(s => s.active);
        
        if (hasChanges) {
            this.saveData();
        }
    }
    
    // Executar relatório agendado
    executeScheduledReport(scheduled) {
        const { config } = scheduled;
        const start = new Date(config.startDate);
        const end = new Date(config.endDate);
        end.setHours(23, 59, 59, 999);
        
        let reportData = {};
        let reportTitle = config.title || 'Relatório Agendado';
        
        // Gerar dados do relatório
        switch (config.type) {
            case 'sales':
                reportData = this.generateSalesReport(start, end, config.category, config.status);
                break;
            case 'services':
                reportData = this.generateServicesReport(start, end, config.status);
                break;
            case 'products':
                reportData = this.generateProductsReport(start, end, config.category);
                break;
            case 'clients':
                reportData = this.generateClientsReport(start, end);
                break;
            case 'financial':
                reportData = this.generateFinancialReport(start, end);
                break;
            case 'custom':
                reportData = this.generateCustomCombinedReport(start, end, config.category, config.status);
                break;
        }
        
        // Exportar relatório
        this.exportReport(reportData, reportTitle, config.format, config.includeCharts, config.includeSummary);
        
        // Notificar usuário
        if (typeof toast !== 'undefined' && toast) {
            toast.success(`Relatório agendado "${reportTitle}" gerado automaticamente!`, 5000);
        }
        
        console.log('✅ [SCHEDULE] Relatório agendado executado:', scheduled.id);
    }

    // Gerar relatório de vendas
    generateSalesReport(startDate, endDate, category, status) {
        const sales = this.completedSales.filter(sale => {
            const saleDate = sale.date ? new Date(sale.date) : new Date(sale.createdAt);
            const matchesDate = saleDate >= startDate && saleDate <= endDate;
            const matchesCategory = !category || sale.items?.some(item => {
                const product = this.items.find(i => i.id === item.itemId);
                return product && product.category === category;
            });
            const matchesStatus = !status || sale.status === status;
            return matchesDate && matchesCategory && matchesStatus;
        });
        
        const totalValue = sales.reduce((sum, sale) => sum + (sale.totalValue || 0), 0);
        const totalDiscount = sales.reduce((sum, sale) => sum + (sale.discount?.amount || 0), 0);
        const totalItems = sales.reduce((sum, sale) => sum + (sale.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0), 0);
        
        return {
            type: 'sales',
            period: { start: startDate, end: endDate },
            summary: {
                totalSales: sales.length,
                totalValue: totalValue,
                totalDiscount: totalDiscount,
                totalItems: totalItems,
                averageTicket: sales.length > 0 ? totalValue / sales.length : 0
            },
            data: sales,
            generatedAt: new Date().toISOString()
        };
    }

    // Gerar relatório de serviços
    generateServicesReport(startDate, endDate, status) {
        const services = this.serviceAppointments.filter(apt => {
            const aptDate = new Date(`${apt.date}T${apt.time || '00:00'}`);
            const matchesDate = aptDate >= startDate && aptDate <= endDate;
            const matchesStatus = !status || apt.status === status;
            return matchesDate && matchesStatus;
        });
        
        const totalValue = services.reduce((sum, apt) => sum + (apt.price || 0), 0);
        const totalHours = services.reduce((sum, apt) => {
            const service = this.items.find(i => i.id === apt.serviceTypeId);
            if (service && service.duration) {
                const [hours, minutes] = service.duration.split(':').map(Number);
                return sum + hours + (minutes / 60);
            }
            return sum;
        }, 0);
        
        return {
            type: 'services',
            period: { start: startDate, end: endDate },
            summary: {
                totalServices: services.length,
                totalValue: totalValue,
                totalHours: totalHours,
                averageValue: services.length > 0 ? totalValue / services.length : 0
            },
            data: services,
            generatedAt: new Date().toISOString()
        };
    }

    // Gerar relatório de produtos
    generateProductsReport(startDate, endDate, category) {
        const filteredItems = this.items.filter(item => {
            if (item.category === 'Serviços') return false;
            const matchesCategory = !category || item.category === category;
            return matchesCategory;
        });
        
        // Calcular estatísticas de vendas por produto
        const productStats = filteredItems.map(item => {
            const sales = this.completedSales.filter(sale => {
                const saleDate = sale.date ? new Date(sale.date) : new Date(sale.createdAt);
                return saleDate >= startDate && saleDate <= endDate &&
                       sale.items?.some(i => i.itemId === item.id);
            });
            
            const quantitySold = sales.reduce((sum, sale) => {
                const saleItem = sale.items?.find(i => i.itemId === item.id);
                return sum + (saleItem?.quantity || 0);
            }, 0);
            
            const revenue = sales.reduce((sum, sale) => {
                const saleItem = sale.items?.find(i => i.itemId === item.id);
                return sum + ((saleItem?.price || 0) * (saleItem?.quantity || 0));
            }, 0);
            
            return {
                item: item,
                quantitySold: quantitySold,
                revenue: revenue,
                salesCount: sales.length
            };
        });
        
        return {
            type: 'products',
            period: { start: startDate, end: endDate },
            summary: {
                totalProducts: filteredItems.length,
                totalRevenue: productStats.reduce((sum, p) => sum + p.revenue, 0),
                totalQuantitySold: productStats.reduce((sum, p) => sum + p.quantitySold, 0)
            },
            data: productStats,
            generatedAt: new Date().toISOString()
        };
    }

    // Gerar relatório de clientes
    generateClientsReport(startDate, endDate) {
        const clientStats = this.clients.map(client => {
            const sales = this.completedSales.filter(sale => {
                const saleDate = sale.date ? new Date(sale.date) : new Date(sale.createdAt);
                return sale.customerName === client.name &&
                       saleDate >= startDate && saleDate <= endDate;
            });
            
            const totalSpent = sales.reduce((sum, sale) => sum + (sale.totalValue || 0), 0);
            
            return {
                client: client,
                salesCount: sales.length,
                totalSpent: totalSpent,
                averageTicket: sales.length > 0 ? totalSpent / sales.length : 0
            };
        });
        
        return {
            type: 'clients',
            period: { start: startDate, end: endDate },
            summary: {
                totalClients: this.clients.length,
                activeClients: clientStats.filter(c => c.salesCount > 0).length,
                totalRevenue: clientStats.reduce((sum, c) => sum + c.totalSpent, 0)
            },
            data: clientStats,
            generatedAt: new Date().toISOString()
        };
    }

    // Gerar relatório financeiro
    generateFinancialReport(startDate, endDate) {
        const sales = this.completedSales.filter(sale => {
            const saleDate = sale.date ? new Date(sale.date) : new Date(sale.createdAt);
            return saleDate >= startDate && saleDate <= endDate;
        });
        
        const costs = this.costs.filter(cost => {
            const costDate = cost.date ? new Date(cost.date) : new Date(cost.createdAt);
            return costDate >= startDate && costDate <= endDate;
        });
        
        const revenue = sales.reduce((sum, sale) => sum + (sale.totalValue || 0), 0);
        const totalCosts = costs.reduce((sum, cost) => sum + (cost.amount || 0), 0);
        const profit = revenue - totalCosts;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        
        return {
            type: 'financial',
            period: { start: startDate, end: endDate },
            summary: {
                revenue: revenue,
                costs: totalCosts,
                profit: profit,
                margin: margin,
                salesCount: sales.length,
                costsCount: costs.length
            },
            sales: sales,
            costs: costs,
            generatedAt: new Date().toISOString()
        };
    }

    // Gerar relatório personalizado combinado
    generateCustomCombinedReport(startDate, endDate, category, status) {
        return {
            type: 'custom',
            period: { start: startDate, end: endDate },
            sales: this.generateSalesReport(startDate, endDate, category, status),
            services: this.generateServicesReport(startDate, endDate, status),
            products: this.generateProductsReport(startDate, endDate, category),
            clients: this.generateClientsReport(startDate, endDate),
            financial: this.generateFinancialReport(startDate, endDate),
            generatedAt: new Date().toISOString()
        };
    }

    // Exportar relatório no formato selecionado
    exportReport(reportData, title, format, includeCharts, includeSummary) {
        const filename = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
        
        switch (format) {
            case 'html':
                this.exportReportHTML(reportData, title, filename, includeCharts, includeSummary);
                break;
            case 'json':
                this.exportReportJSON(reportData, filename);
                break;
            case 'csv':
                this.exportReportCSV(reportData, filename);
                break;
            case 'txt':
                this.exportReportTXT(reportData, title, filename, includeSummary);
                break;
        }
    }

    // Exportar relatório em HTML
    exportReportHTML(reportData, title, filename, includeCharts, includeSummary) {
        let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        h1 { color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px; }
        h2 { color: #666; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #dc3545; color: white; }
        .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .summary-item { margin: 10px 0; }
        .summary-label { font-weight: bold; color: #666; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <p><strong>Período:</strong> ${new Date(reportData.period.start).toLocaleDateString('pt-BR')} a ${new Date(reportData.period.end).toLocaleDateString('pt-BR')}</p>
    <p><strong>Gerado em:</strong> ${new Date(reportData.generatedAt).toLocaleString('pt-BR')}</p>
`;
        
        if (includeSummary && reportData.summary) {
            html += '<div class="summary"><h2>Resumo Executivo</h2>';
            Object.entries(reportData.summary).forEach(([key, value]) => {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const formattedValue = typeof value === 'number' && value % 1 !== 0 
                    ? value.toFixed(2).replace('.', ',') 
                    : value;
                html += `<div class="summary-item"><span class="summary-label">${label}:</span> ${formattedValue}</div>`;
            });
            html += '</div>';
        }
        
        // Adicionar dados específicos do tipo de relatório
        html += this.formatReportDataHTML(reportData);
        
        html += `</body></html>`;
        
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Formatar dados do relatório para HTML
    formatReportDataHTML(reportData) {
        // Implementação básica - pode ser expandida
        return '<h2>Dados Detalhados</h2><p>Dados completos disponíveis no formato JSON.</p>';
    }

    // Exportar relatório em JSON
    exportReportJSON(reportData, filename) {
        const json = JSON.stringify(reportData, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Exportar relatório em CSV
    exportReportCSV(reportData, filename) {
        // Implementação básica - pode ser expandida
        let csv = 'Tipo,Valor\n';
        if (reportData.summary) {
            Object.entries(reportData.summary).forEach(([key, value]) => {
                csv += `${key},${value}\n`;
            });
        }
        
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Exportar relatório em TXT
    exportReportTXT(reportData, title, filename, includeSummary) {
        let txt = `${title}\n`;
        txt += `${'='.repeat(title.length)}\n\n`;
        txt += `Período: ${new Date(reportData.period.start).toLocaleDateString('pt-BR')} a ${new Date(reportData.period.end).toLocaleDateString('pt-BR')}\n`;
        txt += `Gerado em: ${new Date(reportData.generatedAt).toLocaleString('pt-BR')}\n\n`;
        
        if (includeSummary && reportData.summary) {
            txt += 'RESUMO EXECUTIVO\n';
            txt += '-'.repeat(20) + '\n';
            Object.entries(reportData.summary).forEach(([key, value]) => {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                txt += `${label}: ${value}\n`;
            });
            txt += '\n';
        }
        
        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ========== EXPORTAÇÃO AVANÇADA ==========
    
    // Abrir modal de exportação
    openExportModal() {
        // Verificar permissão de exportação
        if (!this.checkPermission('export')) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Você não tem permissão para exportar dados.', 3000);
            } else {
                alert('Você não tem permissão para exportar dados.');
            }
            return;
        }
        
        const modal = document.getElementById('exportModal');
        if (!modal) {
            console.error('Modal de exportação não encontrado');
            return;
        }
        
        // Limpar formulário
        const form = document.getElementById('exportForm');
        if (form) form.reset();
        
        modal.classList.add('active');
    }

    // Fechar modal de exportação
    closeExportModal() {
        const modal = document.getElementById('exportModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Exportar dados (função principal)
    exportData(e) {
        if (e) e.preventDefault();
        
        const format = document.getElementById('exportFormat')?.value;
        const dataType = document.getElementById('exportDataType')?.value;
        const includeCharts = document.getElementById('exportIncludeCharts')?.checked || false;
        const includeSummary = document.getElementById('exportIncludeSummary')?.checked || false;
        
        if (!format || !dataType) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Por favor, preencha todos os campos obrigatórios.', 3000);
            }
            return;
        }
        
        // Preparar dados baseado no tipo
        let exportDataObj = {};
        switch (dataType) {
            case 'all':
                exportDataObj = {
                    items: this.items,
                    groups: this.groups,
                    costs: this.costs,
                    goals: this.goals,
                    clients: this.clients,
                    suppliers: this.suppliers,
                    completedSales: this.completedSales,
                    serviceAppointments: this.serviceAppointments,
                    coupons: this.coupons,
                    version: '1.0',
                    exportDate: new Date().toISOString(),
                };
                break;
            case 'items':
                exportDataObj = {
                    items: this.items,
                    version: '1.0',
                    exportDate: new Date().toISOString(),
                };
                break;
            case 'sales':
                exportDataObj = {
                    completedSales: this.completedSales,
                    groups: this.groups,
                    version: '1.0',
                    exportDate: new Date().toISOString(),
                };
                break;
            case 'clients':
                exportDataObj = {
                    clients: this.clients,
                    version: '1.0',
                    exportDate: new Date().toISOString(),
                };
                break;
            case 'financial':
                exportDataObj = {
                    groups: this.groups,
                    costs: this.costs,
                    goals: this.goals,
                    completedSales: this.completedSales,
                    version: '1.0',
                    exportDate: new Date().toISOString(),
                };
                break;
        }
        
        // Verificar se é agendamento ou email automático
        const isScheduled = document.getElementById('exportSchedule')?.checked || false;
        const isEmail = document.getElementById('exportEmail')?.checked || false;
        
        // Configuração da exportação
        const exportConfig = {
            format,
            dataType,
            includeCharts,
            includeSummary,
            exportDataObj
        };
        
        // Agendar exportação se solicitado
        if (isScheduled) {
            const scheduleDate = document.getElementById('exportScheduleDate')?.value;
            const scheduleTime = document.getElementById('exportScheduleTime')?.value;
            const frequency = document.getElementById('exportScheduleFrequency')?.value || 'once';
            
            if (scheduleDate && scheduleTime) {
                this.scheduleExport(exportConfig, scheduleDate, scheduleTime, frequency, isEmail);
                if (typeof toast !== 'undefined' && toast) {
                    toast.success('Exportação agendada com sucesso!', 3000);
                }
            } else {
                if (typeof toast !== 'undefined' && toast) {
                    toast.warning('Por favor, preencha data e hora do agendamento.', 3000);
                }
                return;
            }
        }
        
        // Enviar por email se solicitado
        if (isEmail && !isScheduled) {
            const emailRecipients = document.getElementById('exportEmailRecipients')?.value;
            const emailSubject = document.getElementById('exportEmailSubject')?.value || 'Exportação de Dados - Loja';
            
            if (emailRecipients) {
                this.sendExportByEmail(exportConfig, emailRecipients, emailSubject);
                if (typeof toast !== 'undefined' && toast) {
                    toast.success('Exportação enviada por email!', 3000);
                }
            } else {
                if (typeof toast !== 'undefined' && toast) {
                    toast.warning('Por favor, informe pelo menos um email.', 3000);
                }
                return;
            }
        }
        
        // Se não for agendamento, exportar imediatamente
        if (!isScheduled) {
            // Exportar no formato selecionado
            const filename = `loja_export_${dataType}_${new Date().toISOString().split('T')[0]}`;
            
            switch (format) {
                case 'json':
                    this.exportAsJSON(exportDataObj, filename);
                    break;
                case 'pdf':
                    this.exportAsPDF(exportDataObj, dataType, filename, includeCharts, includeSummary);
                    break;
                case 'excel':
                    this.exportAsExcel(exportDataObj, dataType, filename);
                    break;
                case 'csv':
                    this.exportAsCSV(exportDataObj, dataType, filename);
                    break;
            }
            
            // Fechar modal
            this.closeExportModal();
            
            if (typeof toast !== 'undefined' && toast) {
                toast.success('Dados exportados com sucesso!', 3000);
            }
        } else {
            // Se for agendamento, apenas fechar modal
            this.closeExportModal();
        }
    }
    
    // Toggle campos de agendamento de exportação
    toggleExportScheduleFields() {
        const scheduleCheckbox = document.getElementById('exportSchedule');
        const scheduleFields = document.getElementById('exportScheduleFields');
        
        if (scheduleCheckbox && scheduleFields) {
            scheduleFields.style.display = scheduleCheckbox.checked ? 'block' : 'none';
            
            // Definir data/hora padrão se estiver marcado
            if (scheduleCheckbox.checked) {
                const now = new Date();
                const scheduleDate = document.getElementById('exportScheduleDate');
                const scheduleTime = document.getElementById('exportScheduleTime');
                
                if (scheduleDate) {
                    scheduleDate.value = now.toISOString().split('T')[0];
                }
                if (scheduleTime) {
                    scheduleTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                }
            }
        }
    }
    
    // Toggle campos de email de exportação
    toggleExportEmailFields() {
        const emailCheckbox = document.getElementById('exportEmail');
        const emailFields = document.getElementById('exportEmailFields');
        
        if (emailCheckbox && emailFields) {
            emailFields.style.display = emailCheckbox.checked ? 'block' : 'none';
        }
    }
    
    // Agendar exportação
    scheduleExport(config, scheduleDate, scheduleTime, frequency, sendEmail = false) {
        const scheduleDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        const now = new Date();
        
        if (scheduleDateTime <= now && frequency === 'once') {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('A data/hora do agendamento deve ser no futuro.', 3000);
            }
            return;
        }
        
        const scheduledExport = {
            id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            config,
            scheduleDate: scheduleDateTime.toISOString(),
            frequency,
            sendEmail,
            emailRecipients: sendEmail ? document.getElementById('exportEmailRecipients')?.value : null,
            emailSubject: sendEmail ? (document.getElementById('exportEmailSubject')?.value || 'Exportação de Dados - Loja') : null,
            createdAt: new Date().toISOString(),
            lastRun: null,
            nextRun: scheduleDateTime.toISOString(),
            active: true
        };
        
        this.scheduledExports.push(scheduledExport);
        this.saveData();
        
        console.log('✅ [EXPORT SCHEDULE] Exportação agendada:', scheduledExport);
        
        // Iniciar verificação de agendamentos se ainda não estiver rodando
        if (!this.exportScheduleCheckInterval) {
            this.initExportScheduleChecker();
        }
    }
    
    // Enviar exportação por email
    async sendExportByEmail(config, recipients, subject) {
        const emailList = recipients.split(',').map(email => email.trim()).filter(email => email);
        
        if (emailList.length === 0) {
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Nenhum email válido fornecido.', 3000);
            }
            return;
        }
        
        // Preparar dados para exportação
        const filename = `loja_export_${config.dataType}_${new Date().toISOString().split('T')[0]}`;
        
        // Simular envio (em produção, isso chamaria a API de email configurada)
        console.log('📧 [EXPORT EMAIL] Simulando envio de exportação para:', emailList);
        console.log('📧 [EXPORT EMAIL] Assunto:', subject);
        console.log('📧 [EXPORT EMAIL] Formato:', config.format);
        console.log('📧 [EXPORT EMAIL] Tipo de dados:', config.dataType);
        
        // Em produção, aqui seria feita a chamada à API de email
        // Por enquanto, apenas simula
        setTimeout(() => {
            if (typeof toast !== 'undefined' && toast) {
                toast.info(`Exportação enviada para ${emailList.length} destinatário(s)`, 3000);
            }
        }, 1000);
    }
    
    // Inicializar verificador de agendamentos de exportação
    initExportScheduleChecker() {
        // Verificar a cada minuto
        this.exportScheduleCheckInterval = setInterval(() => {
            this.checkScheduledExports();
        }, 60000); // 1 minuto
        
        // Verificar imediatamente também
        this.checkScheduledExports();
        
        console.log('✅ [EXPORT SCHEDULE] Verificador de agendamentos de exportação iniciado');
    }
    
    // Verificar e executar exportações agendadas
    checkScheduledExports() {
        const now = new Date();
        let hasChanges = false;
        
        this.scheduledExports.forEach(scheduled => {
            if (!scheduled.active) return;
            
            const nextRun = new Date(scheduled.nextRun);
            
            // Se chegou a hora de executar
            if (nextRun <= now) {
                console.log('⏰ [EXPORT SCHEDULE] Executando exportação agendada:', scheduled.id);
                
                // Executar exportação
                this.executeScheduledExport(scheduled);
                
                // Atualizar próxima execução baseado na frequência
                scheduled.lastRun = new Date().toISOString();
                
                if (scheduled.frequency === 'once') {
                    scheduled.active = false;
                } else {
                    // Calcular próxima execução
                    const nextDate = new Date(nextRun);
                    switch (scheduled.frequency) {
                        case 'daily':
                            nextDate.setDate(nextDate.getDate() + 1);
                            break;
                        case 'weekly':
                            nextDate.setDate(nextDate.getDate() + 7);
                            break;
                        case 'monthly':
                            nextDate.setMonth(nextDate.getMonth() + 1);
                            break;
                    }
                    scheduled.nextRun = nextDate.toISOString();
                }
                
                hasChanges = true;
            }
        });
        
        // Remover exportações inativas
        this.scheduledExports = this.scheduledExports.filter(s => s.active);
        
        if (hasChanges) {
            this.saveData();
        }
    }
    
    // Executar exportação agendada
    executeScheduledExport(scheduled) {
        const { config } = scheduled;
        const filename = `loja_export_${config.dataType}_${new Date().toISOString().split('T')[0]}`;
        
        // Exportar no formato configurado
        switch (config.format) {
            case 'json':
                this.exportAsJSON(config.exportDataObj, filename);
                break;
            case 'pdf':
                this.exportAsPDF(config.exportDataObj, config.dataType, filename, config.includeCharts, config.includeSummary);
                break;
            case 'excel':
                this.exportAsExcel(config.exportDataObj, config.dataType, filename);
                break;
            case 'csv':
                this.exportAsCSV(config.exportDataObj, config.dataType, filename);
                break;
        }
        
        // Enviar por email se configurado
        if (scheduled.sendEmail && scheduled.emailRecipients) {
            this.sendExportByEmail(config, scheduled.emailRecipients, scheduled.emailSubject || 'Exportação de Dados - Loja');
        }
        
        // Notificar usuário
        if (typeof toast !== 'undefined' && toast) {
            toast.success(`Exportação agendada executada automaticamente!`, 5000);
        }
        
        console.log('✅ [EXPORT SCHEDULE] Exportação agendada executada:', scheduled.id);
    }

    // Exportar como JSON
    exportAsJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Exportar dados como PDF com formatação avançada
     * @param {Object} data - Dados para exportar
     * @param {string} dataType - Tipo de dados ('products', 'sales', 'clients', 'financial')
     * @param {string} filename - Nome do arquivo
     * @param {boolean} includeCharts - Incluir gráficos (quando disponível)
     * @param {boolean} includeSummary - Incluir resumo executivo
     */
    exportAsPDF(data, dataType, filename, includeCharts, includeSummary) {
        if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Biblioteca jsPDF não está disponível. Tente outro formato.', 3000);
            } else {
                alert('Biblioteca jsPDF não está disponível. Tente outro formato.');
            }
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        let yPos = margin;
        
        // Cabeçalho com logo/ícone
        doc.setFillColor(220, 53, 69); // Cor primária
        doc.rect(0, 0, pageWidth, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Relatório de Exportação', margin, 20);
        
        // Informações do relatório
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        yPos = 40;
        doc.text(`Exportado em: ${new Date().toLocaleString('pt-BR')}`, margin, yPos);
        yPos += 6;
        doc.text(`Tipo de dados: ${this.getDataTypeLabel(dataType)}`, margin, yPos);
        yPos += 6;
        const username = sessionStorage.getItem('username') || 'Usuário';
        doc.text(`Usuário: ${username}`, margin, yPos);
        yPos += 10;
        
        // Linha separadora
        doc.setDrawColor(220, 53, 69);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;
        
        // Resumo executivo melhorado
        if (includeSummary) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(220, 53, 69);
            doc.text('Resumo Executivo', margin, yPos);
            yPos += 8;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            
            if (data.items) {
                const totalValue = data.items.reduce((sum, item) => sum + ((item.price || 0) * (item.stock || 0)), 0);
                doc.text(`Total de Produtos: ${data.items.length}`, margin, yPos);
                yPos += 6;
                doc.text(`Valor Total em Estoque: R$ ${totalValue.toFixed(2).replace('.', ',')}`, margin, yPos);
                yPos += 6;
            }
            if (data.completedSales) {
                const totalSales = data.completedSales.reduce((sum, sale) => sum + (sale.totalValue || 0), 0);
                const avgSale = data.completedSales.length > 0 ? totalSales / data.completedSales.length : 0;
                doc.text(`Total de Vendas: ${data.completedSales.length}`, margin, yPos);
                yPos += 6;
                doc.text(`Valor Total: R$ ${totalSales.toFixed(2).replace('.', ',')}`, margin, yPos);
                yPos += 6;
                doc.text(`Ticket Médio: R$ ${avgSale.toFixed(2).replace('.', ',')}`, margin, yPos);
                yPos += 6;
            }
            if (data.clients) {
                doc.text(`Total de Clientes: ${data.clients.length}`, margin, yPos);
                yPos += 6;
            }
            if (data.costs) {
                const totalCosts = data.costs.reduce((sum, cost) => sum + (cost.amount || 0), 0);
                doc.text(`Total de Custos: R$ ${totalCosts.toFixed(2).replace('.', ',')}`, margin, yPos);
                yPos += 6;
            }
            if (data.completedSales && data.costs) {
                const totalSales = data.completedSales.reduce((sum, sale) => sum + (sale.totalValue || 0), 0);
                const totalCosts = data.costs.reduce((sum, cost) => sum + (cost.amount || 0), 0);
                const profit = totalSales - totalCosts;
                const marginPercent = totalSales > 0 ? (profit / totalSales * 100) : 0;
                doc.text(`Lucro Líquido: R$ ${profit.toFixed(2).replace('.', ',')}`, margin, yPos);
                yPos += 6;
                doc.text(`Margem de Lucro: ${marginPercent.toFixed(2).replace('.', ',')}%`, margin, yPos);
                yPos += 6;
            }
            yPos += 5;
        }
        
        // Tabela de dados melhorada
        if (data.items && data.items.length > 0) {
            if (yPos > pageHeight - 60) {
                doc.addPage();
                yPos = margin;
            }
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(220, 53, 69);
            doc.text('Produtos', margin, yPos);
            yPos += 8;
            
            const tableData = data.items.map(item => [
                (item.name || 'Sem nome').substring(0, 30), // Limitar tamanho
                item.category || '',
                `R$ ${(item.price || 0).toFixed(2).replace('.', ',')}`,
                (item.stock || 0).toString(),
                item.minStock ? (item.stock < item.minStock ? '⚠️' : '✓') : '-'
            ]);
            
            doc.autoTable({
                startY: yPos,
                head: [['Nome', 'Categoria', 'Preço', 'Estoque', 'Status']],
                body: tableData,
                theme: 'striped',
                headStyles: { 
                    fillColor: [220, 53, 69],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 3
                },
                columnStyles: {
                    0: { cellWidth: 60 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 30, halign: 'right' },
                    3: { cellWidth: 25, halign: 'center' },
                    4: { cellWidth: 20, halign: 'center' }
                },
                margin: { left: margin, right: margin }
            });
            
            yPos = doc.lastAutoTable.finalY + 10;
        }
        
        // Adicionar vendas se disponível
        if (data.completedSales && data.completedSales.length > 0) {
            if (yPos > pageHeight - 60) {
                doc.addPage();
                yPos = margin;
            }
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(220, 53, 69);
            doc.text('Vendas Recentes', margin, yPos);
            yPos += 8;
            
            const salesData = data.completedSales.slice(0, 20).map(sale => {
                const date = new Date(sale.date || sale.timestamp);
                return [
                    date.toLocaleDateString('pt-BR'),
                    sale.clientName || 'Cliente não identificado',
                    `R$ ${(sale.totalValue || 0).toFixed(2).replace('.', ',')}`,
                    sale.items?.length || 0
                ];
            });
            
            doc.autoTable({
                startY: yPos,
                head: [['Data', 'Cliente', 'Valor', 'Itens']],
                body: salesData,
                theme: 'striped',
                headStyles: { 
                    fillColor: [220, 53, 69],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 3
                },
                margin: { left: margin, right: margin }
            });
        }
        
        // Rodapé em todas as páginas
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
                `Página ${i} de ${totalPages} | Gerado em ${new Date().toLocaleString('pt-BR')}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }
        
        // Salvar PDF
        doc.save(`${filename}.pdf`);
    }

    // Exportar como Excel (CSV formatado)
    exportAsExcel(data, dataType, filename) {
        let csv = '';
        
        // Adicionar BOM para Excel reconhecer UTF-8
        csv = '\uFEFF';
        
        if (data.items && data.items.length > 0) {
            csv += 'Produtos\n';
            csv += 'Nome,Categoria,Preço,Estoque,Descrição\n';
            data.items.forEach(item => {
                csv += `"${(item.name || '').replace(/"/g, '""')}","${(item.category || '').replace(/"/g, '""')}",${(item.price || 0).toFixed(2)},${item.stock || 0},"${(item.description || '').replace(/"/g, '""')}"\n`;
            });
            csv += '\n';
        }
        
        // Vendas
        if (data.completedSales && data.completedSales.length > 0) {
            csv += 'VENDAS\n';
            csv += 'Data,Cliente,CPF Cliente,Valor Total,Desconto,Itens,Forma de Pagamento\n';
            data.completedSales.forEach(sale => {
                const date = sale.date ? new Date(sale.date).toLocaleDateString('pt-BR') : (sale.timestamp ? new Date(sale.timestamp).toLocaleDateString('pt-BR') : '');
                const clientName = sale.clientName || sale.customerName || 'Cliente não identificado';
                const clientCPF = sale.clientCPF || sale.customerCPF || '';
                const discount = sale.discount || sale.discountValue || 0;
                const paymentMethod = sale.paymentMethod || sale.payment || 'Não informado';
                csv += `"${date}","${clientName.replace(/"/g, '""')}","${clientCPF.replace(/"/g, '""')}",${(sale.totalValue || 0).toFixed(2)},${discount.toFixed(2)},${(sale.items || []).length},"${paymentMethod.replace(/"/g, '""')}"\n`;
            });
            csv += '\n';
        }
        
        // Clientes
        if (data.clients && data.clients.length > 0) {
            csv += 'CLIENTES\n';
            csv += 'Nome,CPF,Telefone,Email,Endereço,Pontos de Fidelidade,Total Gasto,Total de Compras\n';
            data.clients.forEach(client => {
                const totalSpent = client.totalSpent || 0;
                const totalPurchases = client.totalPurchases || 0;
                csv += `"${(client.name || '').replace(/"/g, '""')}","${(client.cpf || '').replace(/"/g, '""')}","${(client.phone || '').replace(/"/g, '""')}","${(client.email || '').replace(/"/g, '""')}","${(client.address || '').replace(/"/g, '""')}",${client.loyaltyPoints || 0},${totalSpent.toFixed(2)},${totalPurchases}\n`;
            });
            csv += '\n';
        }
        
        // Custos
        if (data.costs && data.costs.length > 0) {
            csv += 'CUSTOS\n';
            csv += 'Data,Descrição,Categoria,Valor,Observações\n';
            data.costs.forEach(cost => {
                const date = cost.date ? new Date(cost.date).toLocaleDateString('pt-BR') : '';
                csv += `"${date}","${(cost.description || '').replace(/"/g, '""')}","${(cost.category || '').replace(/"/g, '""')}",${(cost.amount || 0).toFixed(2)},"${(cost.notes || '').replace(/"/g, '""')}"\n`;
            });
            csv += '\n';
        }
        
        // Metas
        if (data.goals && data.goals.length > 0) {
            csv += 'METAS\n';
            csv += 'Mês,Valor da Meta,Valor Alcançado,Percentual,Status\n';
            data.goals.forEach(goal => {
                const month = goal.month || '';
                const target = goal.amount || 0;
                const achieved = this.getMonthSales(month);
                const percent = target > 0 ? (achieved / target * 100) : 0;
                const status = percent >= 100 ? 'Atingida' : percent >= 75 ? 'Em andamento' : 'Abaixo do esperado';
                csv += `"${month}",${target.toFixed(2)},${achieved.toFixed(2)},${percent.toFixed(2)}%,"${status}"\n`;
            });
            csv += '\n';
        }
        
        // Fornecedores
        if (data.suppliers && data.suppliers.length > 0) {
            csv += 'FORNECEDORES\n';
            csv += 'Nome,CNPJ,Telefone,Email,Endereço,Contato\n';
            data.suppliers.forEach(supplier => {
                csv += `"${(supplier.name || '').replace(/"/g, '""')}","${(supplier.cnpj || '').replace(/"/g, '""')}","${(supplier.phone || '').replace(/"/g, '""')}","${(supplier.email || '').replace(/"/g, '""')}","${(supplier.address || '').replace(/"/g, '""')}","${(supplier.contact || '').replace(/"/g, '""')}"\n`;
            });
            csv += '\n';
        }
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Exportar como CSV simples
    exportAsCSV(data, dataType, filename) {
        this.exportAsExcel(data, dataType, filename);
    }

    // Obter label do tipo de dados
    getDataTypeLabel(dataType) {
        const labels = {
            'all': 'Todos os Dados',
            'items': 'Produtos',
            'sales': 'Vendas',
            'clients': 'Clientes',
            'financial': 'Dados Financeiros'
        };
        return labels[dataType] || dataType;
    }

    // ========== ANÁLISE PREDITIVA ==========

    // Abrir modal de análise preditiva
    openPredictiveAnalysisModal() {
        const modal = document.getElementById('predictiveAnalysisModal');
        if (!modal) {
            console.error('Modal de análise preditiva não encontrado');
            return;
        }
        
        modal.classList.add('active');
        this.updatePredictiveAnalysis();
    }

    // Fechar modal de análise preditiva
    closePredictiveAnalysisModal() {
        const modal = document.getElementById('predictiveAnalysisModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Atualizar análise preditiva
    updatePredictiveAnalysis() {
        const period = parseInt(document.getElementById('predictivePeriod')?.value || 6);
        
        // Calcular previsão de vendas (melhorada)
        const forecast = this.calculateSalesForecast(period);
        const forecastEl = document.getElementById('salesForecast');
        if (forecastEl) {
            const confidenceBadge = forecast.confidence >= 70 ? '🟢' : forecast.confidence >= 50 ? '🟡' : '🔴';
            forecastEl.innerHTML = `R$ ${forecast.value.toFixed(2).replace('.', ',')} <span style="font-size: 0.8em; color: var(--gray-600);" title="Confiança: ${forecast.confidence}%">${confidenceBadge}</span>`;
        }
        
        // Mostrar detalhes da previsão se disponível
        const forecastDetailsEl = document.getElementById('salesForecastDetails');
        if (forecastDetailsEl && forecast.method) {
            let details = `Confiança: ${forecast.confidence}%`;
            if (forecast.trend) {
                details += ` | Tendência: ${forecast.trend > 0 ? '+' : ''}${forecast.trend.toFixed(2)}`;
            }
            if (forecast.seasonalAdjustment) {
                details += ` | Ajuste sazonal: ${forecast.seasonalAdjustment > 0 ? '+' : ''}${forecast.seasonalAdjustment.toFixed(2)}`;
            }
            forecastDetailsEl.textContent = details;
            forecastDetailsEl.style.display = 'block';
        }
        
        // Calcular tendência (melhorada)
        const trend = this.calculateSalesTrend(period);
        const trendEl = document.getElementById('salesTrend');
        if (trendEl) {
            const trendIcon = trend.direction === 'up' ? '📈' : trend.direction === 'down' ? '📉' : '➡️';
            const trendColor = trend.direction === 'up' ? '#28a745' : trend.direction === 'down' ? '#dc3545' : '#6c757d';
            const strengthIcon = trend.strength === 'strong' ? '💪' : trend.strength === 'moderate' ? '👍' : '👎';
            trendEl.innerHTML = `${trendIcon} <span style="color: ${trendColor};">${trend.percentage > 0 ? '+' : ''}${trend.percentage.toFixed(1)}%</span> <span style="font-size: 0.8em;" title="Força da tendência: ${trend.strength} (R²=${trend.rSquared})">${strengthIcon}</span>`;
        }
        
        // Mostrar detalhes da tendência
        const trendDetailsEl = document.getElementById('salesTrendDetails');
        if (trendDetailsEl && trend.strength) {
            trendDetailsEl.innerHTML = `Força: <strong>${trend.strength === 'strong' ? 'Forte' : trend.strength === 'moderate' ? 'Moderada' : 'Fraca'}</strong> (R²=${trend.rSquared})`;
            trendDetailsEl.style.display = 'block';
        }
        
        // Calcular crescimento esperado
        const growth = this.calculateExpectedGrowth(period);
        const growthEl = document.getElementById('expectedGrowth');
        if (growthEl) {
            const growthColor = growth > 0 ? '#28a745' : growth < 0 ? '#dc3545' : '#6c757d';
            growthEl.innerHTML = `<span style="color: ${growthColor};">${growth > 0 ? '+' : ''}${growth.toFixed(1)}%</span>`;
        }
        
        // Gerar insights
        this.generatePredictiveInsights(period, forecast, trend, growth);
        
        // Gerar recomendações
        this.generateRecommendations(period, forecast, trend);
    }

    // Calcular previsão de vendas
    calculateSalesForecast(months = 6) {
        const now = new Date();
        const salesByMonth = [];
        
        // Coletar vendas dos últimos N meses
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const sales = this.getMonthSales(monthKey);
            salesByMonth.push(sales);
        }
        
        if (salesByMonth.length === 0) {
            return { value: 0, confidence: 0 };
        }
        
        // Calcular média móvel simples (últimos 3 meses)
        const recentMonths = salesByMonth.slice(-3);
        const average = recentMonths.reduce((sum, val) => sum + val, 0) / recentMonths.length;
        
        // Calcular tendência linear simples
        let trend = 0;
        if (salesByMonth.length >= 2) {
            const firstHalf = salesByMonth.slice(0, Math.floor(salesByMonth.length / 2));
            const secondHalf = salesByMonth.slice(Math.floor(salesByMonth.length / 2));
            const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
            trend = (secondAvg - firstAvg) / firstHalf.length;
        }
        
        // Previsão melhorada: média ponderada (últimos meses têm mais peso) + tendência + sazonalidade
        let weightedAverage = 0;
        let totalWeight = 0;
        salesByMonth.forEach((sales, index) => {
            const weight = index + 1; // Últimos meses têm mais peso
            weightedAverage += sales * weight;
            totalWeight += weight;
        });
        weightedAverage = totalWeight > 0 ? weightedAverage / totalWeight : average;
        
        // Detectar sazonalidade (comparar mês atual com mesmo mês em anos anteriores)
        const currentMonth = now.getMonth();
        const seasonalAdjustment = this.calculateSeasonalAdjustment(currentMonth, salesByMonth);
        
        // Previsão = média ponderada + tendência + ajuste sazonal
        const forecast = weightedAverage + trend + seasonalAdjustment;
        
        // Calcular confiança melhorada baseada em múltiplos fatores
        const variance = salesByMonth.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / salesByMonth.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = average > 0 ? stdDev / average : 1;
        
        // Confiança baseada em: baixa variância, tendência consistente, dados suficientes
        let confidence = 100;
        confidence -= Math.min(50, coefficientOfVariation * 100); // Penalizar alta variância
        if (salesByMonth.length < 3) confidence -= 20; // Penalizar poucos dados
        if (Math.abs(trend) > average * 0.5) confidence -= 10; // Penalizar tendências muito fortes (instabilidade)
        
        confidence = Math.max(0, Math.min(100, confidence));
        
        return {
            value: Math.max(0, forecast),
            confidence: Math.round(confidence),
            trend: trend,
            seasonalAdjustment: seasonalAdjustment,
            method: 'weighted_average_with_seasonality'
        };
    }
    
    // Calcular ajuste sazonal
    calculateSeasonalAdjustment(currentMonth, salesByMonth) {
        if (salesByMonth.length < 12) {
            // Não há dados suficientes para análise sazonal completa
            return 0;
        }
        
        // Calcular média por mês do ano
        const monthlyAverages = {};
        salesByMonth.forEach((sales, index) => {
            const monthIndex = (currentMonth - (salesByMonth.length - 1 - index) + 12) % 12;
            if (!monthlyAverages[monthIndex]) {
                monthlyAverages[monthIndex] = [];
            }
            monthlyAverages[monthIndex].push(sales);
        });
        
        // Calcular média geral
        const overallAverage = salesByMonth.reduce((sum, val) => sum + val, 0) / salesByMonth.length;
        
        // Calcular ajuste para o mês atual
        if (monthlyAverages[currentMonth] && monthlyAverages[currentMonth].length > 0) {
            const monthAverage = monthlyAverages[currentMonth].reduce((sum, val) => sum + val, 0) / monthlyAverages[currentMonth].length;
            return monthAverage - overallAverage;
        }
        
        return 0;
    }

    // Calcular tendência de vendas
    calculateSalesTrend(months = 6) {
        const now = new Date();
        const salesByMonth = [];
        
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const sales = this.getMonthSales(monthKey);
            salesByMonth.push(sales);
        }
        
        if (salesByMonth.length < 2) {
            return { direction: 'stable', percentage: 0 };
        }
        
        const firstHalf = salesByMonth.slice(0, Math.floor(salesByMonth.length / 2));
        const secondHalf = salesByMonth.slice(Math.floor(salesByMonth.length / 2));
        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
        
        if (firstAvg === 0) {
            return { direction: secondAvg > 0 ? 'up' : 'stable', percentage: 0 };
        }
        
        const percentage = ((secondAvg - firstAvg) / firstAvg) * 100;
        const direction = percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable';
        
        return { direction, percentage };
    }

    // Calcular crescimento esperado
    calculateExpectedGrowth(months = 6) {
        const trend = this.calculateSalesTrend(months);
        return trend.percentage;
    }

    // Gerar insights preditivos
    generatePredictiveInsights(period, forecast, trend, growth) {
        const container = document.getElementById('predictiveInsights');
        if (!container) return;
        
        let insights = [];
        
        // Insight sobre previsão
        if (forecast.value > 0) {
            insights.push({
                type: 'info',
                icon: '📊',
                title: 'Previsão de Vendas',
                message: `Baseado nos últimos ${period} meses, a previsão para o próximo mês é de R$ ${forecast.value.toFixed(2).replace('.', ',')} (confiança: ${forecast.confidence.toFixed(0)}%)`
            });
        }
        
        // Insight sobre tendência
        if (trend.direction === 'up') {
            insights.push({
                type: 'success',
                icon: '📈',
                title: 'Tendência Positiva',
                message: `Vendas estão em crescimento de ${trend.percentage.toFixed(1)}% comparado ao período anterior`
            });
        } else if (trend.direction === 'down') {
            insights.push({
                type: 'warning',
                icon: '📉',
                title: 'Tendência Negativa',
                message: `Vendas estão em declínio de ${Math.abs(trend.percentage).toFixed(1)}% comparado ao período anterior`
            });
        }
        
        // Insight sobre produtos mais vendidos
        const topProducts = this.getTopSellingProducts(period);
        if (topProducts.length > 0) {
            insights.push({
                type: 'info',
                icon: '⭐',
                title: 'Produtos em Destaque',
                message: `${topProducts[0].name} é o produto mais vendido com ${topProducts[0].quantity} unidades nos últimos ${period} meses`
            });
        }
        
        // Renderizar insights
        container.innerHTML = insights.map(insight => `
            <div style="padding: 1rem; background: ${insight.type === 'success' ? '#d4edda' : insight.type === 'warning' ? '#fff3cd' : '#d1ecf1'}; border-left: 4px solid ${insight.type === 'success' ? '#28a745' : insight.type === 'warning' ? '#ffc107' : '#17a2b8'}; border-radius: var(--radius-sm); margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: start; gap: 0.75rem;">
                    <span style="font-size: 1.5rem;">${insight.icon}</span>
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 0.25rem 0; color: var(--dark-gray); font-size: 0.95rem; font-weight: 600;">${insight.title}</h4>
                        <p style="margin: 0; color: var(--gray-700); font-size: 0.9rem;">${insight.message}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Gerar recomendações
    generateRecommendations(period, forecast, trend) {
        const container = document.getElementById('recommendationsList');
        if (!container) return;
        
        let recommendations = [];
        
        // Recomendação baseada em tendência
        if (trend.direction === 'down') {
            recommendations.push({
                priority: 'high',
                title: 'Ação Necessária: Vendas em Declínio',
                message: 'Considere criar promoções ou campanhas de marketing para reverter a tendência de queda nas vendas.'
            });
        }
        
        // Recomendação baseada em produtos
        const lowStockItems = this.items.filter(item => {
            if (item.category === 'Serviços') return false;
            return item.stock && item.minStock && item.stock < item.minStock;
        });
        
        if (lowStockItems.length > 0) {
            recommendations.push({
                priority: 'medium',
                title: 'Reposição de Estoque',
                message: `${lowStockItems.length} produto(s) estão com estoque abaixo do mínimo. Considere fazer reposição.`
            });
        }
        
        // Recomendação baseada em metas
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const currentGoal = this.goals.find(g => g.month === currentMonth);
        if (currentGoal) {
            const currentSales = this.getMonthSales(currentMonth);
            const progress = (currentSales / currentGoal.amount) * 100;
            const daysRemaining = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
            
            if (progress < 75 && daysRemaining <= 7) {
                recommendations.push({
                    priority: 'high',
                    title: 'Meta em Risco',
                    message: `A meta do mês está em ${progress.toFixed(1)}% com apenas ${daysRemaining} dia(s) restante(s). Ação imediata recomendada.`
                });
            }
        }
        
        // Recomendação baseada em previsão
        if (forecast.value > 0 && forecast.confidence > 70) {
            recommendations.push({
                priority: 'low',
                title: 'Oportunidade de Crescimento',
                message: `A previsão indica vendas de R$ ${forecast.value.toFixed(2).replace('.', ',')} no próximo mês. Prepare-se para atender essa demanda.`
            });
        }
        
        // Renderizar recomendações
        if (recommendations.length === 0) {
            container.innerHTML = '<p style="color: var(--gray-600); font-style: italic;">Nenhuma recomendação no momento.</p>';
        } else {
            container.innerHTML = recommendations.map(rec => `
                <div style="padding: 1rem; background: ${rec.priority === 'high' ? '#fee' : rec.priority === 'medium' ? '#fff3cd' : '#f8f9fa'}; border-left: 4px solid ${rec.priority === 'high' ? '#dc3545' : rec.priority === 'medium' ? '#ffc107' : '#6c757d'}; border-radius: var(--radius-sm); margin-bottom: 0.75rem;">
                    <h4 style="margin: 0 0 0.5rem 0; color: var(--dark-gray); font-size: 0.95rem; font-weight: 600;">${rec.title}</h4>
                    <p style="margin: 0; color: var(--gray-700); font-size: 0.9rem;">${rec.message}</p>
                </div>
            `).join('');
        }
    }

    // Obter produtos mais vendidos
    getTopSellingProducts(months = 6) {
        const now = new Date();
        const productSales = {};
        
        // Coletar vendas dos últimos N meses
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const group = this.groups.find(g => g.month === monthKey);
            
            if (group) {
                group.days.forEach(day => {
                    day.sales.forEach(sale => {
                        sale.items.forEach(item => {
                            if (!productSales[item.itemId]) {
                                productSales[item.itemId] = {
                                    itemId: item.itemId,
                                    quantity: 0,
                                    revenue: 0
                                };
                            }
                            productSales[item.itemId].quantity += item.quantity || 0;
                            productSales[item.itemId].revenue += (item.price || 0) * (item.quantity || 0);
                        });
                    });
                });
            }
        }
        
        // Converter para array e ordenar
        return Object.values(productSales)
            .map(ps => ({
                ...ps,
                name: this.getItemName(ps.itemId)
            }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
    }

    // ========== LGPD COMPLIANCE ==========

    // Verificar e solicitar consentimento de cookies
    checkCookieConsent() {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Mostrar banner de consentimento
            this.showCookieConsentBanner();
        } else {
            this.cookieConsent = JSON.parse(consent);
            this.updateCookieConsentStatus();
        }
    }

    // Mostrar banner de consentimento de cookies
    showCookieConsentBanner() {
        // Remover banner existente se houver
        const existingBanner = document.getElementById('cookieConsentBanner');
        if (existingBanner) {
            existingBanner.remove();
        }

        const banner = document.createElement('div');
        banner.id = 'cookieConsentBanner';
        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--dark-gray);
            color: var(--white);
            padding: 1rem 1.5rem;
            z-index: 10000;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
        `;
        
        banner.innerHTML = `
            <div style="flex: 1; min-width: 250px;">
                <p style="margin: 0; font-size: 0.9rem;">
                    <i class="fas fa-cookie-bite"></i> Este site utiliza cookies e armazenamento local para melhorar sua experiência. 
                    <a href="#" onclick="app.openPrivacyPolicyModal(); return false;" style="color: var(--primary-color); text-decoration: underline;">Saiba mais</a>
                </p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="app.acceptCookieConsent()" style="padding: 0.5rem 1rem; background: var(--primary-color); color: var(--white); border: none; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600;">
                    Aceitar
                </button>
                <button onclick="app.rejectCookieConsent()" style="padding: 0.5rem 1rem; background: transparent; color: var(--white); border: 1px solid var(--white); border-radius: var(--radius-sm); cursor: pointer;">
                    Recusar
                </button>
            </div>
        `;
        
        document.body.appendChild(banner);
    }

    // Aceitar consentimento de cookies
    acceptCookieConsent() {
        const consent = {
            accepted: true,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        localStorage.setItem('cookieConsent', JSON.stringify(consent));
        this.cookieConsent = consent;
        this.updateCookieConsentStatus();
        this.hideCookieConsentBanner();
        
        if (typeof toast !== 'undefined' && toast) {
            toast.success('Consentimento de cookies aceito.', 3000);
        }
    }

    // Recusar consentimento de cookies
    rejectCookieConsent() {
        const consent = {
            accepted: false,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        localStorage.setItem('cookieConsent', JSON.stringify(consent));
        this.cookieConsent = consent;
        this.updateCookieConsentStatus();
        this.hideCookieConsentBanner();
        
        // Limpar dados não essenciais
        localStorage.removeItem('appTheme');
        localStorage.removeItem('searchHistory');
        
        if (typeof toast !== 'undefined' && toast) {
            toast.info('Consentimento recusado. Alguns recursos podem não funcionar corretamente.', 4000);
        }
    }

    // Ocultar banner de consentimento
    hideCookieConsentBanner() {
        const banner = document.getElementById('cookieConsentBanner');
        if (banner) {
            banner.remove();
        }
    }

    // Atualizar status de consentimento
    updateCookieConsentStatus() {
        const statusEl = document.getElementById('cookieConsentStatus');
        if (!statusEl) return;
        
        if (this.cookieConsent) {
            const date = new Date(this.cookieConsent.timestamp);
            const status = this.cookieConsent.accepted ? 'Aceito' : 'Recusado';
            const color = this.cookieConsent.accepted ? '#28a745' : '#dc3545';
            statusEl.innerHTML = `
                <span style="color: ${color}; font-weight: 600;">${status}</span> em ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR')}
            `;
        } else {
            statusEl.textContent = 'Não definido';
        }
    }

    // Abrir modal de política de privacidade
    openPrivacyPolicyModal() {
        const modal = document.getElementById('privacyPolicyModal');
        if (!modal) {
            console.error('Modal de política de privacidade não encontrado');
            return;
        }
        
        // Atualizar data
        const dateEl = document.getElementById('privacyPolicyDate');
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString('pt-BR');
        }
        
        modal.classList.add('active');
        this.logDataAccess('view', 'privacy_policy', null, 'Visualização da política de privacidade');
    }

    // Fechar modal de política de privacidade
    closePrivacyPolicyModal() {
        const modal = document.getElementById('privacyPolicyModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Exportar política de privacidade
    exportPrivacyPolicy() {
        const content = document.getElementById('privacyPolicyContent')?.innerText || '';
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `politica_privacidade_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (typeof toast !== 'undefined' && toast) {
            toast.success('Política de privacidade exportada com sucesso!', 3000);
        }
    }

    // Exportar dados pessoais (LGPD)
    exportPersonalData() {
        const username = sessionStorage.getItem('username');
        if (!username) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Usuário não identificado.', 3000);
            }
            return;
        }

        // Coletar todos os dados pessoais do usuário
        const personalData = {
            username: username,
            exportedAt: new Date().toISOString(),
            clients: this.clients || [],
            suppliers: this.suppliers || [],
            userData: {
                items: this.items || [],
                groups: this.groups || [],
                costs: this.costs || [],
                goals: this.goals || [],
                completedSales: this.completedSales || [],
                pendingOrders: this.pendingOrders || [],
                serviceAppointments: this.serviceAppointments || [],
            },
            preferences: {
                theme: localStorage.getItem(`appTheme_${username}`) || 'red',
            },
            auditLog: (this.auditLog || []).filter(log => 
                log.username === username
            ),
            dataAccessLogs: (this.dataAccessLogs || []).filter(log => 
                log.username === username
            ),
        };

        // Exportar como JSON
        const blob = new Blob([JSON.stringify(personalData, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meus_dados_${username}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Registrar acesso
        this.logDataAccess('export', 'personal_data', username, 'Exportação de dados pessoais');
        
        if (typeof toast !== 'undefined' && toast) {
            toast.success('Dados pessoais exportados com sucesso!', 3000);
        }
    }

    // Solicitar exclusão de dados (direito ao esquecimento)
    requestDataDeletion() {
        const username = sessionStorage.getItem('username');
        if (!username) {
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Usuário não identificado.', 3000);
            }
            return;
        }

        const confirmMessage = `Tem certeza que deseja solicitar a exclusão de todos os seus dados pessoais?\n\nEsta ação irá:\n- Excluir todos os clientes cadastrados\n- Excluir todos os fornecedores cadastrados\n- Excluir todos os dados de vendas associados\n- Excluir preferências e configurações\n\nEsta ação NÃO PODE ser desfeita!`;

        if (typeof confirmDialog !== 'undefined' && confirmDialog) {
            confirmDialog.danger(
                confirmMessage,
                'Solicitar Exclusão de Dados'
            ).then((confirmed) => {
                if (confirmed) {
                    this.performDataDeletion(username);
                }
            });
        } else {
            if (confirm(confirmMessage)) {
                this.performDataDeletion(username);
            }
        }
    }

    // Realizar exclusão de dados
    performDataDeletion(username) {
        try {
            // Registrar solicitação
            this.logDataAccess('delete_request', 'personal_data', username, 'Solicitação de exclusão de dados (LGPD)');

            // Excluir dados pessoais
            this.clients = [];
            this.suppliers = [];
            
            // Excluir dados do localStorage
            const localStorageKey = `lojaData_${username}`;
            localStorage.removeItem(localStorageKey);
            
            // Excluir preferências
            localStorage.removeItem(`appTheme_${username}`);
            
            // Limpar dados relacionados
            this.completedSales = this.completedSales.filter(sale => {
                // Manter apenas vendas sem dados pessoais identificáveis
                return !sale.clientName || sale.clientName === 'Cliente não cadastrado';
            });

            // Salvar alterações
            this.saveData();

            // Registrar exclusão
            this.logDataAccess('delete', 'personal_data', username, 'Exclusão de dados pessoais realizada');

            if (typeof toast !== 'undefined' && toast) {
                toast.success('Dados pessoais excluídos com sucesso!', 3000);
            }

            // Recarregar página após 2 segundos
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Erro ao excluir dados:', error);
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Erro ao excluir dados. Verifique o console.', 4000);
            }
        }
    }

    // Visualizar logs de acesso a dados pessoais
    viewDataAccessLogs() {
        const modal = document.getElementById('dataAccessLogsModal');
        if (!modal) {
            console.error('Modal de logs de acesso não encontrado');
            return;
        }
        
        modal.classList.add('active');
        this.renderDataAccessLogs();
    }

    // Fechar modal de logs de acesso
    closeDataAccessLogsModal() {
        const modal = document.getElementById('dataAccessLogsModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Renderizar logs de acesso
    renderDataAccessLogs(filter = 'all') {
        const container = document.getElementById('dataAccessLogsList');
        if (!container) return;

        let logs = this.dataAccessLogs || [];
        
        // Filtrar logs
        if (filter !== 'all') {
            logs = logs.filter(log => {
                if (filter === 'client') return log.entityType === 'client';
                if (filter === 'supplier') return log.entityType === 'supplier';
                if (filter === 'export') return log.action === 'export';
                if (filter === 'delete') return log.action === 'delete' || log.action === 'delete_request';
                return true;
            });
        }

        // Ordenar por data (mais recente primeiro)
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (logs.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--gray-600); padding: 2rem;">Nenhum log de acesso encontrado.</p>';
            return;
        }

        container.innerHTML = logs.map(log => {
            const date = new Date(log.timestamp);
            const actionIcon = {
                'view': '👁️',
                'export': '📥',
                'delete': '🗑️',
                'delete_request': '⚠️',
                'update': '✏️',
                'create': '➕'
            }[log.action] || '📋';
            
            const actionColor = {
                'view': '#17a2b8',
                'export': '#28a745',
                'delete': '#dc3545',
                'delete_request': '#ffc107',
                'update': '#007bff',
                'create': '#6c757d'
            }[log.action] || '#6c757d';

            return `
                <div style="padding: 1rem; background: var(--white); border-left: 4px solid ${actionColor}; border-radius: var(--radius-sm); margin-bottom: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: start; gap: 0.75rem;">
                        <span style="font-size: 1.5rem;">${actionIcon}</span>
                        <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.25rem;">
                                <h4 style="margin: 0; color: var(--dark-gray); font-size: 0.95rem; font-weight: 600;">
                                    ${log.action === 'view' ? 'Visualização' : 
                                      log.action === 'export' ? 'Exportação' : 
                                      log.action === 'delete' ? 'Exclusão' : 
                                      log.action === 'delete_request' ? 'Solicitação de Exclusão' : 
                                      log.action === 'update' ? 'Atualização' : 
                                      log.action === 'create' ? 'Criação' : log.action}
                                </h4>
                                <span style="font-size: 0.85rem; color: var(--gray-600);">
                                    ${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR')}
                                </span>
                            </div>
                            <p style="margin: 0 0 0.25rem 0; color: var(--gray-700); font-size: 0.9rem;">
                                <strong>Tipo:</strong> ${log.entityType === 'client' ? 'Cliente' : 
                                                       log.entityType === 'supplier' ? 'Fornecedor' : 
                                                       log.entityType === 'personal_data' ? 'Dados Pessoais' : 
                                                       log.entityType || 'N/A'}
                            </p>
                            <p style="margin: 0 0 0.25rem 0; color: var(--gray-700); font-size: 0.9rem;">
                                <strong>Usuário:</strong> ${log.username || 'N/A'}
                            </p>
                            ${log.description ? `<p style="margin: 0; color: var(--gray-600); font-size: 0.85rem; font-style: italic;">${log.description}</p>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Filtrar logs de acesso
    filterDataAccessLogs() {
        const filter = document.getElementById('dataAccessLogsFilter')?.value || 'all';
        this.renderDataAccessLogs(filter);
    }

    // Exportar logs de acesso
    exportDataAccessLogs() {
        const logs = this.dataAccessLogs || [];
        const blob = new Blob([JSON.stringify(logs, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs_acesso_dados_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (typeof toast !== 'undefined' && toast) {
            toast.success('Logs de acesso exportados com sucesso!', 3000);
        }
    }

    // Registrar acesso a dados pessoais (LGPD)
    logDataAccess(action, entityType, entityId, description) {
        const username = sessionStorage.getItem('username') || 'unknown';
        const timestamp = new Date().toISOString();
        
        const logEntry = {
            id: 'DATA_ACCESS_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            action: action, // 'view', 'export', 'delete', 'delete_request', etc.
            entityType: entityType, // 'client', 'supplier', 'personal_data', etc.
            entityId: entityId,
            username: username,
            timestamp: timestamp,
            description: description,
        };

        this.dataAccessLogs.unshift(logEntry);

        // Limitar tamanho do log (manter apenas os últimos 500 registros)
        if (this.dataAccessLogs.length > 500) {
            this.dataAccessLogs = this.dataAccessLogs.slice(0, 500);
        }

        // Salvar automaticamente
        setTimeout(() => {
            this.saveData();
        }, 100);
    }

    // ========== CRIPTOGRAFIA DE DADOS SENSÍVEIS ==========

    // Gerar chave de criptografia para o usuário
    async generateEncryptionKey(username, password) {
        try {
            // Usar senha do usuário + username como material para derivar chave
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(username + password + 'loja-secret-salt'),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            // Derivar chave usando PBKDF2
            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: new TextEncoder().encode('loja-encryption-salt'),
                    iterations: 100000,
                    hash: 'SHA-256',
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );

            this.encryptionKeys[username] = key;
            return key;
        } catch (error) {
            console.error('Erro ao gerar chave de criptografia:', error);
            return null;
        }
    }

    // Obter chave de criptografia do usuário
    async getEncryptionKey(username) {
        if (this.encryptionKeys[username]) {
            return this.encryptionKeys[username];
        }

        // Tentar gerar chave baseada na senha (se disponível)
        // Nota: Em produção, isso deveria ser feito no login
        const password = sessionStorage.getItem('userPasswordHash');
        if (password) {
            return await this.generateEncryptionKey(username, password);
        }

        return null;
    }

    // Criptografar dados sensíveis
    async encryptSensitiveData(data, username) {
        if (!this.encryptionEnabled) {
            return data;
        }

        try {
            const key = await this.getEncryptionKey(username);
            if (!key) {
                console.warn('⚠️ [ENCRYPT] Chave de criptografia não disponível, dados não serão criptografados');
                return data;
            }

            // Converter dados para string JSON
            const dataString = JSON.stringify(data);
            const dataBuffer = new TextEncoder().encode(dataString);

            // Gerar IV (Initialization Vector) aleatório
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // Criptografar usando AES-GCM
            const encryptedData = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                },
                key,
                dataBuffer
            );

            // Combinar IV + dados criptografados
            const combined = new Uint8Array(iv.length + encryptedData.byteLength);
            combined.set(iv, 0);
            combined.set(new Uint8Array(encryptedData), iv.length);

            // Converter para base64 para armazenamento
            const base64 = btoa(String.fromCharCode(...combined));
            
            return {
                encrypted: true,
                data: base64,
                algorithm: 'AES-GCM',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Erro ao criptografar dados:', error);
            return data; // Retornar dados não criptografados em caso de erro
        }
    }

    // Descriptografar dados sensíveis
    async decryptSensitiveData(encryptedData, username) {
        if (!encryptedData || !encryptedData.encrypted) {
            return encryptedData; // Dados não estão criptografados
        }

        try {
            const key = await this.getEncryptionKey(username);
            if (!key) {
                console.warn('⚠️ [DECRYPT] Chave de criptografia não disponível, dados não podem ser descriptografados');
                return encryptedData;
            }

            // Converter de base64 para Uint8Array
            const combined = Uint8Array.from(atob(encryptedData.data), c => c.charCodeAt(0));

            // Extrair IV (primeiros 12 bytes)
            const iv = combined.slice(0, 12);
            const encrypted = combined.slice(12);

            // Descriptografar
            const decryptedBuffer = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                },
                key,
                encrypted
            );

            // Converter de volta para objeto
            const decryptedString = new TextDecoder().decode(decryptedBuffer);
            return JSON.parse(decryptedString);
        } catch (error) {
            console.error('Erro ao descriptografar dados:', error);
            return encryptedData; // Retornar dados criptografados em caso de erro
        }
    }

    // Criptografar dados de clientes (dados pessoais sensíveis)
    async encryptClientData(clients, username) {
        if (!this.encryptionEnabled || !clients || clients.length === 0) {
            return clients;
        }

        try {
            const encryptedClients = [];
            for (const client of clients) {
                // Criptografar apenas campos sensíveis
                const sensitiveFields = {
                    cpf: client.cpf,
                    phone: client.phone,
                    email: client.email,
                    address: client.address,
                };

                const encryptedFields = await this.encryptSensitiveData(sensitiveFields, username);
                
                encryptedClients.push({
                    ...client,
                    sensitiveData: encryptedFields,
                    cpf: null, // Remover campos sensíveis do objeto principal
                    phone: null,
                    email: null,
                    address: null,
                });
            }

            return encryptedClients;
        } catch (error) {
            console.error('Erro ao criptografar dados de clientes:', error);
            return clients;
        }
    }

    // Descriptografar dados de clientes
    async decryptClientData(clients, username) {
        if (!clients || clients.length === 0) {
            return clients;
        }

        try {
            const decryptedClients = [];
            for (const client of clients) {
                if (client.sensitiveData && client.sensitiveData.encrypted) {
                    // Descriptografar campos sensíveis
                    const decryptedFields = await this.decryptSensitiveData(client.sensitiveData, username);
                    
                    decryptedClients.push({
                        ...client,
                        ...decryptedFields,
                        sensitiveData: undefined, // Remover campo criptografado
                    });
                } else {
                    decryptedClients.push(client);
                }
            }

            return decryptedClients;
        } catch (error) {
            console.error('Erro ao descriptografar dados de clientes:', error);
            return clients;
        }
    }

    // Criptografar backup
    async encryptBackup(backupData, username) {
        if (!this.encryptionEnabled) {
            return backupData;
        }

        try {
            // Criptografar dados sensíveis do backup (clientes, fornecedores)
            const encryptedBackup = {
                ...backupData,
                clients: await this.encryptClientData(backupData.clients || [], username),
                suppliers: await this.encryptClientData(backupData.suppliers || [], username),
            };

            return encryptedBackup;
        } catch (error) {
            console.error('Erro ao criptografar backup:', error);
            return backupData;
        }
    }

    // Descriptografar backup
    async decryptBackup(backupData, username) {
        try {
            // Descriptografar dados sensíveis do backup
            const decryptedBackup = {
                ...backupData,
                clients: await this.decryptClientData(backupData.clients || [], username),
                suppliers: await this.decryptClientData(backupData.suppliers || [], username),
            };

            return decryptedBackup;
        } catch (error) {
            console.error('Erro ao descriptografar backup:', error);
            return backupData;
        }
    }

    // ========== RATE LIMITING ==========

    // Verificar se pode fazer requisição (rate limiting)
    canMakeRequest() {
        const now = Date.now();
        const windowMs = 60 * 1000; // Janela de 1 minuto
        const maxRequests = 30; // Máximo de 30 requisições por minuto

        // Resetar janela se passou 1 minuto
        if (now - this.requestWindowStart >= windowMs) {
            this.requestWindowStart = now;
            this.requestCount = 0;
        }

        // Verificar se excedeu o limite
        if (this.requestCount >= maxRequests) {
            const remainingSeconds = Math.ceil(
                (windowMs - (now - this.requestWindowStart)) / 1000
            );
            return {
                allowed: false,
                remainingSeconds: remainingSeconds,
            };
        }

        return { allowed: true };
    }

    // Fazer requisição com rate limiting
    async makeRequestWithRateLimit(url, options = {}) {
        // Verificar rate limit
        const rateLimitCheck = this.canMakeRequest();
        if (!rateLimitCheck.allowed) {
            throw new Error(
                `Rate limit atingido. Aguarde ${rateLimitCheck.remainingSeconds} segundos.`
            );
        }

        // Incrementar contador
        this.requestCount++;

        // Garantir delay mínimo entre requisições (200ms)
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < 200) {
            await new Promise((resolve) =>
                setTimeout(resolve, 200 - timeSinceLastRequest)
            );
        }

        this.lastRequestTime = Date.now();

        // Fazer requisição
        return fetch(url, options);
    }

    // ========== MONITORAMENTO DE INATIVIDADE ==========

    // Iniciar monitoramento de inatividade
    startInactivityMonitoring() {
        // Resetar timer ao detectar atividade
        this.resetInactivityTimer();

        // Eventos que indicam atividade do usuário
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        activityEvents.forEach((event) => {
            document.addEventListener(event, () => {
                this.resetInactivityTimer();
            }, { passive: true });
        });

        console.log('✅ [INACTIVITY] Monitoramento de inatividade iniciado');
    }

    // Resetar timer de inatividade
    resetInactivityTimer() {
        // Limpar timer anterior
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }

        // Atualizar última atividade
        this.lastActivityTime = Date.now();

        // Configurar novo timer
        this.inactivityTimer = setTimeout(() => {
            this.logoutUser();
        }, this.inactivityTimeout);

        // Avisar 5 minutos antes do logout
        const warningTime = this.inactivityTimeout - (5 * 60 * 1000); // 5 minutos antes
        setTimeout(() => {
            if (this.inactivityTimer) {
                if (typeof toast !== 'undefined' && toast) {
                    toast.warning('Você será desconectado em 5 minutos por inatividade. Mova o mouse ou pressione uma tecla para continuar.', 10000);
                }
            }
        }, warningTime);
    }

    // Fazer logout do usuário
    logoutUser() {
        console.log('⚠️ [INACTIVITY] Logout automático por inatividade');
        
        // Limpar timer
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }

        // Limpar sessionStorage
        sessionStorage.removeItem('loggedIn');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('userRole');

        // Mostrar mensagem
        if (typeof toast !== 'undefined' && toast) {
            toast.error('Você foi desconectado por inatividade. Faça login novamente.', 5000);
        }

        // Redirecionar para login após 2 segundos
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 2000);
    }

    // ========== PWA E NOTIFICAÇÕES PUSH ==========

    // Solicitar permissão para notificações
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('⚠️ [PWA] Notificações não suportadas neste navegador');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    // Enviar notificação local
    async showNotification(title, options = {}) {
        const hasPermission = await this.requestNotificationPermission();
        if (!hasPermission) {
            console.warn('⚠️ [PWA] Permissão de notificações negada');
            return;
        }

        const defaultOptions = {
            body: options.body || '',
            icon: '/images/icone-e-transicao.jpg',
            badge: '/images/icone-e-transicao.jpg',
            tag: options.tag || 'loja-notification',
            requireInteraction: options.requireInteraction || false,
            data: options.data || {},
            actions: options.actions || [],
        };

        try {
            // Tentar usar Service Worker para notificação
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(title, defaultOptions);
            } else {
                // Fallback para notificação do navegador
                new Notification(title, defaultOptions);
            }
        } catch (error) {
            console.error('Erro ao exibir notificação:', error);
        }
    }

    // Enviar notificação push (requer Service Worker)
    async sendPushNotification(title, body, data = {}) {
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ [PWA] Service Worker não disponível');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
                body: body,
                icon: '/images/icone-e-transicao.jpg',
                badge: '/images/icone-e-transicao.jpg',
                tag: 'loja-push',
                data: data,
                requireInteraction: false,
            });
        } catch (error) {
            console.error('Erro ao enviar notificação push:', error);
        }
    }

    // Verificar se está online
    isOnline() {
        return navigator.onLine;
    }

    // Sincronizar dados quando voltar online
    async syncWhenOnline() {
        if (!this.isOnline()) {
            return;
        }

        try {
            // Registrar sincronização em background
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('sync-data');
            } else {
                // Fallback: sincronizar imediatamente
                await this.saveData();
            }
        } catch (error) {
            console.error('Erro ao sincronizar dados:', error);
        }
    }

    // Verificar instalação do PWA
    async checkPWAInstallation() {
        // Verificar se já está instalado
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return true;
        }

        // Verificar se pode ser instalado
        if ('BeforeInstallPromptEvent' in window) {
            return false; // Pode ser instalado
        }

        return null; // Não suportado
    }

    // Solicitar instalação do PWA
    async promptPWAInstallation() {
        if (!('BeforeInstallPromptEvent' in window)) {
            console.warn('⚠️ [PWA] Instalação não suportada');
            return false;
        }

        // O evento beforeinstallprompt será capturado quando disponível
        return false;
    }

    // Inicializar PWA
    async initPWA() {
        // Verificar se está instalado
        const isInstalled = await this.checkPWAInstallation();
        if (isInstalled) {
            console.log('✅ [PWA] Aplicativo instalado');
        }

        // Configurar listener para instalação
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Mostrar botão de instalação se necessário
            const installButton = document.getElementById('installPWAButton');
            if (installButton) {
                installButton.style.display = 'block';
                installButton.addEventListener('click', async () => {
                    if (deferredPrompt) {
                        deferredPrompt.prompt();
                        const { outcome } = await deferredPrompt.userChoice;
                        console.log(`[PWA] Instalação: ${outcome}`);
                        deferredPrompt = null;
                        installButton.style.display = 'none';
                    }
                });
            }
        });

        // Listener para quando o app é instalado
        window.addEventListener('appinstalled', () => {
            console.log('✅ [PWA] Aplicativo instalado com sucesso!');
            if (typeof toast !== 'undefined' && toast) {
                toast.success('Aplicativo instalado com sucesso!', 3000);
            }
        });

        // Monitorar status de conexão
        window.addEventListener('online', () => {
            console.log('✅ [PWA] Conexão restaurada');
            this.syncWhenOnline();
            if (typeof toast !== 'undefined' && toast) {
                toast.info('Conexão restaurada. Sincronizando dados...', 3000);
            }
        });

        window.addEventListener('offline', () => {
            console.warn('⚠️ [PWA] Conexão perdida');
            if (typeof toast !== 'undefined' && toast) {
                toast.warning('Você está offline. Algumas funcionalidades podem estar limitadas.', 4000);
            }
        });
    }

    // ========== INTEGRAÇÕES COM APIs EXTERNAS ==========

    // Buscar endereço por CEP (API ViaCEP)
    async buscarCEP(cep) {
        try {
            // Remover caracteres não numéricos
            const cepLimpo = cep.replace(/\D/g, '');
            
            if (cepLimpo.length !== 8) {
                throw new Error('CEP deve conter 8 dígitos');
            }

            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            
            if (!response.ok) {
                throw new Error('Erro ao buscar CEP');
            }

            const data = await response.json();
            
            if (data.erro) {
                throw new Error('CEP não encontrado');
            }

            return {
                cep: data.cep,
                logradouro: data.logradouro || '',
                complemento: data.complemento || '',
                bairro: data.bairro || '',
                cidade: data.localidade || '',
                estado: data.uf || '',
                enderecoCompleto: `${data.logradouro || ''}, ${data.bairro || ''}, ${data.localidade || ''} - ${data.uf || ''}`.replace(/^,\s*|,\s*$/g, ''),
            };
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            throw error;
        }
    }

    // Preencher endereço automaticamente ao digitar CEP
    async preencherEnderecoPorCEP(cepInput, enderecoInput, cidadeInput, estadoInput) {
        const cep = cepInput.value;
        
        if (cep.replace(/\D/g, '').length === 8) {
            try {
                const endereco = await this.buscarCEP(cep);
                
                if (enderecoInput) {
                    enderecoInput.value = endereco.logradouro || '';
                }
                if (cidadeInput) {
                    cidadeInput.value = endereco.cidade || '';
                }
                if (estadoInput) {
                    estadoInput.value = endereco.estado || '';
                }
                
                if (typeof toast !== 'undefined' && toast) {
                    toast.success('Endereço preenchido automaticamente!', 2000);
                }
            } catch (error) {
                console.error('Erro ao preencher endereço:', error);
                if (typeof toast !== 'undefined' && toast) {
                    toast.error('CEP não encontrado ou inválido', 3000);
                }
            }
        }
    }

    // Validar CPF (algoritmo)
    validarCPF(cpf) {
        const cpfLimpo = cpf.replace(/\D/g, '');
        
        if (cpfLimpo.length !== 11) {
            return false;
        }

        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cpfLimpo)) {
            return false;
        }

        // Validar dígitos verificadores
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
        }
        let digito = 11 - (soma % 11);
        if (digito >= 10) digito = 0;
        if (digito !== parseInt(cpfLimpo.charAt(9))) {
            return false;
        }

        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
        }
        digito = 11 - (soma % 11);
        if (digito >= 10) digito = 0;
        if (digito !== parseInt(cpfLimpo.charAt(10))) {
            return false;
        }

        return true;
    }

    // Validar CNPJ (algoritmo)
    validarCNPJ(cnpj) {
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        
        if (cnpjLimpo.length !== 14) {
            return false;
        }

        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1{13}$/.test(cnpjLimpo)) {
            return false;
        }

        // Validar dígitos verificadores
        let tamanho = cnpjLimpo.length - 2;
        let numeros = cnpjLimpo.substring(0, tamanho);
        let digitos = cnpjLimpo.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado !== parseInt(digitos.charAt(0))) {
            return false;
        }

        tamanho = tamanho + 1;
        numeros = cnpjLimpo.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado !== parseInt(digitos.charAt(1))) {
            return false;
        }

        return true;
    }

    // Buscar cotação de moedas (API ExchangeRate-API)
    async buscarCotacaoMoedas(baseCurrency = 'BRL', targetCurrency = 'USD') {
        try {
            // Usar API gratuita (sem chave necessária)
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
            
            if (!response.ok) {
                throw new Error('Erro ao buscar cotação');
            }

            const data = await response.json();
            
            return {
                base: data.base,
                date: data.date,
                rates: data.rates,
                targetRate: data.rates[targetCurrency] || null,
            };
        } catch (error) {
            console.error('Erro ao buscar cotação:', error);
            throw error;
        }
    }

    // Converter valor entre moedas
    async converterMoeda(valor, deMoeda, paraMoeda) {
        try {
            const cotacao = await this.buscarCotacaoMoedas(deMoeda, paraMoeda);
            
            if (!cotacao.targetRate) {
                throw new Error(`Taxa de câmbio não encontrada para ${paraMoeda}`);
            }

            return valor * cotacao.targetRate;
        } catch (error) {
            console.error('Erro ao converter moeda:', error);
            throw error;
        }
    }

    // Buscar informações de geolocalização (via API do navegador)
    async obterGeolocalizacao() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalização não suportada'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        });
    }

    // Buscar endereço por coordenadas (reverse geocoding - usando API Nominatim)
    async buscarEnderecoPorCoordenadas(latitude, longitude) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                {
                    headers: {
                        'User-Agent': 'LojaGestaoApp/1.0',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao buscar endereço');
            }

            const data = await response.json();
            
            return {
                endereco: data.display_name || '',
                cidade: data.address?.city || data.address?.town || '',
                estado: data.address?.state || '',
                cep: data.address?.postcode || '',
            };
        } catch (error) {
            console.error('Erro ao buscar endereço por coordenadas:', error);
            throw error;
        }
    }

    // Calcular distância entre duas coordenadas (Haversine)
    calcularDistancia(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
                Math.cos(this.toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distância em km
    }

    toRad(degrees) {
        return (degrees * Math.PI) / 180;
    }

    // Buscar informações de um CNPJ (API ReceitaWS)
    async buscarInfoCNPJ(cnpj) {
        try {
            const cnpjLimpo = cnpj.replace(/\D/g, '');
            
            if (cnpjLimpo.length !== 14) {
                throw new Error('CNPJ deve conter 14 dígitos');
            }

            const response = await fetch(`https://www.receitaws.com.br/v1/${cnpjLimpo}`);
            
            if (!response.ok) {
                throw new Error('Erro ao buscar CNPJ');
            }

            const data = await response.json();
            
            if (data.status === 'ERROR') {
                throw new Error(data.message || 'CNPJ não encontrado');
            }

            return {
                cnpj: data.cnpj,
                nome: data.nome || '',
                fantasia: data.fantasia || '',
                situacao: data.situacao || '',
                abertura: data.abertura || '',
                tipo: data.tipo || '',
                logradouro: data.logradouro || '',
                numero: data.numero || '',
                complemento: data.complemento || '',
                bairro: data.bairro || '',
                municipio: data.municipio || '',
                uf: data.uf || '',
                cep: data.cep || '',
                telefone: data.telefone || '',
                email: data.email || '',
            };
        } catch (error) {
            console.error('Erro ao buscar CNPJ:', error);
            throw error;
        }
    }

    // ========== INDEXEDDB ==========

    // Inicializar IndexedDB
    initIndexedDB() {
        if (!window.indexedDB) {
            console.warn('⚠️ [INDEXEDDB] IndexedDB não suportado neste navegador');
            this.useIndexedDB = false;
            return;
        }

        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onerror = (event) => {
            console.error('❌ [INDEXEDDB] Erro ao abrir banco de dados:', event);
            this.useIndexedDB = false;
        };

        request.onsuccess = (event) => {
            this.indexedDB = event.target.result;
            this.useIndexedDB = true;
            console.log('✅ [INDEXEDDB] Banco de dados aberto com sucesso');
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Criar object stores se não existirem
            if (!db.objectStoreNames.contains('data')) {
                const dataStore = db.createObjectStore('data', { keyPath: 'username' });
                dataStore.createIndex('username', 'username', { unique: true });
            }

            if (!db.objectStoreNames.contains('backups')) {
                const backupStore = db.createObjectStore('backups', { keyPath: 'id', autoIncrement: true });
                backupStore.createIndex('username', 'username', { unique: false });
                backupStore.createIndex('timestamp', 'timestamp', { unique: false });
            }

            console.log('✅ [INDEXEDDB] Estrutura do banco de dados criada/atualizada');
        };
    }

    // ========== VOICE NAVIGATION ==========

    // Inicializar navegação por voz
    initVoiceNavigation() {
        // Verificar se Web Speech API está disponível
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('⚠️ [VOICE] Web Speech API não suportada neste navegador');
            return;
        }

        // Configurar comandos de voz
        this.setupVoiceCommands();

        console.log('✅ [VOICE] Navegação por voz inicializada');
    }

    // Configurar comandos de voz
    setupVoiceCommands() {
        this.voiceCommands = {
            'abrir produtos': () => this.switchTab('itemsPanel'),
            'abrir clientes': () => this.switchTab('clientsPanel'),
            'abrir vendas': () => this.switchTab('salesPanel'),
            'abrir fornecedores': () => this.switchTab('suppliersPanel'),
            'abrir admin': () => this.switchTab('adminPanel'),
            'novo produto': () => this.openItemModal(),
            'novo cliente': () => this.openClientModal(),
            'nova venda': () => this.openSaleModal(),
            'salvar': () => this.saveData(),
            'fechar': () => this.closeAllModals(),
            'ajuda': () => {
                const helpBtn = document.getElementById('helpBtn');
                if (helpBtn) helpBtn.click();
            }
        };
    }

    // Iniciar reconhecimento de voz
    startVoiceRecognition() {
        if (this.voiceRecognitionActive) {
            console.log('ℹ️ [VOICE] Reconhecimento de voz já está ativo');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('❌ [VOICE] SpeechRecognition não disponível');
            return;
        }

        this.voiceRecognition = new SpeechRecognition();
        this.voiceRecognition.lang = 'pt-BR';
        this.voiceRecognition.continuous = false;
        this.voiceRecognition.interimResults = false;

        this.voiceRecognition.onstart = () => {
            this.voiceRecognitionActive = true;
            console.log('🎤 [VOICE] Reconhecimento de voz iniciado');
            if (typeof toast !== 'undefined' && toast) {
                toast.info('Ouvindo...', 2000);
            }
        };

        this.voiceRecognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase().trim();
            console.log('🎤 [VOICE] Comando reconhecido:', command);
            this.processVoiceCommand(command);
        };

        this.voiceRecognition.onerror = (event) => {
            console.error('❌ [VOICE] Erro no reconhecimento:', event.error);
            this.voiceRecognitionActive = false;
        };

        this.voiceRecognition.onend = () => {
            this.voiceRecognitionActive = false;
            console.log('🛑 [VOICE] Reconhecimento de voz finalizado');
        };

        try {
            this.voiceRecognition.start();
        } catch (error) {
            console.error('❌ [VOICE] Erro ao iniciar reconhecimento:', error);
        }
    }

    // Parar reconhecimento de voz
    stopVoiceRecognition() {
        if (this.voiceRecognition && this.voiceRecognitionActive) {
            this.voiceRecognition.stop();
            this.voiceRecognitionActive = false;
            console.log('🛑 [VOICE] Reconhecimento de voz parado');
        }
    }

    // Processar comando de voz
    processVoiceCommand(command) {
        // Buscar comando correspondente
        for (const [key, action] of Object.entries(this.voiceCommands)) {
            if (command.includes(key)) {
                console.log(`✅ [VOICE] Executando comando: ${key}`);
                action();
                if (typeof toast !== 'undefined' && toast) {
                    toast.success(`Comando executado: ${key}`, 2000);
                }
                return;
            }
        }

        console.log('⚠️ [VOICE] Comando não reconhecido:', command);
        if (typeof toast !== 'undefined' && toast) {
            toast.warning('Comando não reconhecido', 2000);
        }
    }

    // Alternar reconhecimento de voz
    toggleVoiceRecognition() {
        if (this.voiceRecognitionActive) {
            this.stopVoiceRecognition();
        } else {
            this.startVoiceRecognition();
        }
    }

    // Anunciar mudanças para leitores de tela (ARIA live regions)
    announceLiveRegion(message, politeness = 'polite') {
        let liveRegion = document.getElementById('aria-live-region');
        
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'aria-live-region';
            liveRegion.setAttribute('role', 'status');
            liveRegion.setAttribute('aria-live', politeness);
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            liveRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = message;
        
        // Limpar após um tempo para permitir novas mensagens
        setTimeout(() => {
            if (liveRegion) {
                liveRegion.textContent = '';
            }
        }, 1000);
    }

    // ========== PULL-TO-REFRESH ==========

    // Inicializar pull-to-refresh
    initPullToRefresh() {
        // Apenas em dispositivos móveis
        if (!this.isMobileDevice()) {
            return;
        }

        const mainContent = document.querySelector('.main-content') || document.body;
        let pullIndicator = document.getElementById('pullToRefreshIndicator');

        // Criar indicador visual se não existir
        if (!pullIndicator) {
            pullIndicator = document.createElement('div');
            pullIndicator.id = 'pullToRefreshIndicator';
            pullIndicator.style.cssText = `
                position: fixed;
                top: -60px;
                left: 50%;
                transform: translateX(-50%);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--primary-color);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                transition: top 0.3s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            `;
            pullIndicator.innerHTML = '<i class="fas fa-sync-alt"></i>';
            document.body.appendChild(pullIndicator);
        }

        let touchStartY = 0;
        let touchCurrentY = 0;
        let isPulling = false;
        let isRefreshing = false;
        let initialScrollY = 0;
        let hasScrolled = false;

        // Touch start
        mainContent.addEventListener('touchstart', (e) => {
            if (isRefreshing) return;
            
            // Verificar se está realmente no topo da página (com margem de erro)
            const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            const scrollTop = mainContent.scrollTop || 0;
            const isAtTop = scrollY <= 5 && scrollTop <= 5; // Margem de 5px para evitar problemas de precisão
            
            if (isAtTop) {
                touchStartY = e.touches[0].clientY;
                initialScrollY = scrollY;
                isPulling = false;
                hasScrolled = false;
            } else {
                touchStartY = 0; // Resetar se não estiver no topo
            }
        }, { passive: true });

        // Touch move
        mainContent.addEventListener('touchmove', (e) => {
            if (isRefreshing || touchStartY === 0) return;

            const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            const currentScrollTop = mainContent.scrollTop || 0;
            
            // Se o usuário já fez scroll para baixo, não permitir pull-to-refresh
            if (currentScrollY > initialScrollY + 5 || currentScrollTop > 5) {
                hasScrolled = true;
                touchStartY = 0; // Cancelar pull-to-refresh
                return;
            }

            touchCurrentY = e.touches[0].clientY;
            const pullDistance = touchCurrentY - touchStartY;

            // Só permitir pull para baixo E se ainda estiver no topo
            if (pullDistance > 0 && currentScrollY <= 5 && currentScrollTop <= 5 && !hasScrolled) {
                isPulling = true;
                
                // Só prevenir scroll padrão se realmente estiver fazendo pull
                if (pullDistance > 10) {
                    e.preventDefault(); // Prevenir scroll padrão apenas quando pull é significativo
                }

                const maxPull = 120;
                const threshold = 80;
                const pullAmount = Math.min(pullDistance, maxPull);
                const progress = Math.min(pullAmount / threshold, 1);

                // Atualizar posição do indicador
                pullIndicator.style.top = `${Math.min(pullAmount - 20, 60)}px`;
                
                // Rotacionar ícone baseado no progresso
                const rotation = progress * 360;
                pullIndicator.querySelector('i').style.transform = `rotate(${rotation}deg)`;

                // Mudar cor quando passar do threshold
                if (pullAmount >= threshold) {
                    pullIndicator.style.background = 'var(--primary-color)';
                    pullIndicator.style.transform = 'translateX(-50%) scale(1.1)';
                } else {
                    pullIndicator.style.background = 'var(--gray-500)';
                    pullIndicator.style.transform = 'translateX(-50%) scale(1)';
                }
            } else if (pullDistance < 0) {
                // Se o usuário está movendo para cima, cancelar pull
                touchStartY = 0;
                isPulling = false;
                this.resetPullToRefreshIndicator(pullIndicator);
            }
        }, { passive: false });

        // Touch end
        mainContent.addEventListener('touchend', () => {
            if (isRefreshing) {
                this.resetPullToRefreshIndicator(pullIndicator);
                return;
            }

            if (isPulling && touchStartY > 0 && !hasScrolled) {
                const pullDistance = touchCurrentY - touchStartY;

                if (pullDistance >= this.pullToRefresh.threshold) {
                    // Ativar refresh
                    this.triggerPullToRefresh(pullIndicator);
                } else {
                    // Resetar indicador
                    this.resetPullToRefreshIndicator(pullIndicator);
                }
            } else {
                // Resetar se não completou o pull
                this.resetPullToRefreshIndicator(pullIndicator);
            }

            touchStartY = 0;
            touchCurrentY = 0;
            isPulling = false;
            hasScrolled = false;
            initialScrollY = 0;
        }, { passive: true });

        console.log('✅ [PULL-TO-REFRESH] Inicializado');
    }

    // Ativar pull-to-refresh
    async triggerPullToRefresh(indicator) {
        if (this.pullToRefresh.isRefreshing) return;

        this.pullToRefresh.isRefreshing = true;
        const indicatorElement = indicator || document.getElementById('pullToRefreshIndicator');

        // Mostrar indicador
        if (indicatorElement) {
            indicatorElement.style.top = '20px';
            indicatorElement.querySelector('i').classList.add('fa-spin');
        }

        // Anunciar para leitores de tela
        this.announceLiveRegion('Atualizando dados...');

        try {
            // Recarregar dados
            await this.loadData();

            // Feedback visual
            if (typeof toast !== 'undefined' && toast) {
                toast.success('Dados atualizados!', 2000);
            }

            this.announceLiveRegion('Dados atualizados com sucesso');
        } catch (error) {
            console.error('❌ [PULL-TO-REFRESH] Erro ao atualizar:', error);
            if (typeof toast !== 'undefined' && toast) {
                toast.error('Erro ao atualizar dados', 3000);
            }
            this.announceLiveRegion('Erro ao atualizar dados');
        } finally {
            // Resetar indicador após um delay
            setTimeout(() => {
                this.resetPullToRefreshIndicator(indicatorElement);
                this.pullToRefresh.isRefreshing = false;
            }, 500);
        }
    }

    // Resetar indicador de pull-to-refresh
    resetPullToRefreshIndicator(indicator) {
        const indicatorElement = indicator || document.getElementById('pullToRefreshIndicator');
        if (indicatorElement) {
            indicatorElement.style.top = '-60px';
            indicatorElement.querySelector('i').classList.remove('fa-spin');
            indicatorElement.querySelector('i').style.transform = 'rotate(0deg)';
            indicatorElement.style.background = 'var(--gray-500)';
            indicatorElement.style.transform = 'translateX(-50%) scale(1)';
        }
    }

    // ========== ANÁLISE DE CONCORRÊNCIA ==========

    // Analisar concorrência (preços, produtos, tendências)
    analyzeCompetition(period = 6) {
        const analysis = {
            priceComparison: this.comparePrices(period),
            productComparison: this.compareProducts(period),
            marketTrends: this.analyzeMarketTrends(period),
            competitiveAdvantages: this.identifyCompetitiveAdvantages(period),
            recommendations: []
        };

        // Gerar recomendações baseadas na análise
        analysis.recommendations = this.generateCompetitiveRecommendations(analysis);

        return analysis;
    }

    // Comparar preços com mercado
    comparePrices(period = 6) {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - period, 1);
        
        // Calcular preço médio dos produtos vendidos
        const soldItems = this.completedSales
            .filter(sale => new Date(sale.date) >= startDate)
            .flatMap(sale => sale.items || [])
            .map(item => {
                const product = this.items.find(i => i.id === item.id || i.name === item.name);
                return product ? { price: item.price || product.price, cost: product.cost || 0 } : null;
            })
            .filter(item => item !== null);

        const avgPrice = soldItems.length > 0
            ? soldItems.reduce((sum, item) => sum + (item.price || 0), 0) / soldItems.length
            : 0;

        const avgMargin = soldItems.length > 0
            ? soldItems.reduce((sum, item) => {
                const margin = item.cost > 0 ? ((item.price - item.cost) / item.price) * 100 : 0;
                return sum + margin;
            }, 0) / soldItems.length
            : 0;

        // Comparar com benchmarks do mercado (valores simulados - em produção, usar dados reais)
        const marketAvgPrice = avgPrice * 1.1; // Assumir que mercado é 10% mais caro
        const marketAvgMargin = 35; // Margem média do mercado: 35%

        return {
            ourAvgPrice: avgPrice,
            marketAvgPrice: marketAvgPrice,
            priceDifference: ((avgPrice - marketAvgPrice) / marketAvgPrice) * 100,
            ourAvgMargin: avgMargin,
            marketAvgMargin: marketAvgMargin,
            marginDifference: avgMargin - marketAvgMargin,
            competitiveness: avgPrice < marketAvgPrice ? 'competitivo' : avgPrice > marketAvgPrice ? 'acima' : 'similar'
        };
    }

    // Comparar produtos com mercado
    compareProducts(period = 6) {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - period, 1);
        
        // Analisar categorias mais vendidas
        const categorySales = {};
        this.completedSales
            .filter(sale => new Date(sale.date) >= startDate)
            .forEach(sale => {
                (sale.items || []).forEach(item => {
                    const product = this.items.find(i => i.id === item.id || i.name === item.name);
                    if (product && product.category) {
                        categorySales[product.category] = (categorySales[product.category] || 0) + 1;
                    }
                });
            });

        const topCategories = Object.entries(categorySales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category, count]) => ({ category, sales: count }));

        // Analisar diversidade de produtos
        const uniqueProducts = new Set();
        this.completedSales
            .filter(sale => new Date(sale.date) >= startDate)
            .forEach(sale => {
                (sale.items || []).forEach(item => {
                    uniqueProducts.add(item.id || item.name);
                });
            });

        return {
            topCategories: topCategories,
            productDiversity: uniqueProducts.size,
            totalProducts: this.items.length,
            diversityScore: (uniqueProducts.size / this.items.length) * 100,
            marketShare: this.calculateMarketShare(period)
        };
    }

    // Analisar tendências de mercado
    analyzeMarketTrends(period = 6) {
        const now = new Date();
        const monthlyData = [];

        for (let i = period - 1; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            
            const monthSales = this.completedSales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= monthDate && saleDate <= monthEnd;
            });

            const monthTotal = monthSales.reduce((sum, sale) => sum + (sale.totalValue || 0), 0);
            const monthCount = monthSales.length;

            monthlyData.push({
                month: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`,
                total: monthTotal,
                count: monthCount,
                avgTicket: monthCount > 0 ? monthTotal / monthCount : 0
            });
        }

        // Calcular tendência
        const firstHalf = monthlyData.slice(0, Math.floor(monthlyData.length / 2));
        const secondHalf = monthlyData.slice(Math.floor(monthlyData.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, m) => sum + m.total, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, m) => sum + m.total, 0) / secondHalf.length;
        
        const trend = secondAvg > firstAvg ? 'crescimento' : secondAvg < firstAvg ? 'declínio' : 'estável';
        const trendPercentage = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

        return {
            monthlyData: monthlyData,
            trend: trend,
            trendPercentage: trendPercentage,
            avgMonthlyGrowth: this.calculateAverageGrowth(monthlyData),
            seasonality: this.detectSeasonality(monthlyData)
        };
    }

    // Identificar vantagens competitivas
    identifyCompetitiveAdvantages(period = 6) {
        const advantages = [];
        
        // Verificar preços competitivos
        const priceComparison = this.comparePrices(period);
        if (priceComparison.competitiveness === 'competitivo') {
            advantages.push({
                type: 'preço',
                description: 'Preços abaixo da média do mercado',
                impact: 'alto',
                value: Math.abs(priceComparison.priceDifference)
            });
        }

        // Verificar margem de lucro
        if (priceComparison.ourAvgMargin > priceComparison.marketAvgMargin) {
            advantages.push({
                type: 'margem',
                description: 'Margem de lucro acima da média',
                impact: 'alto',
                value: priceComparison.marginDifference
            });
        }

        // Verificar diversidade de produtos
        const productComparison = this.compareProducts(period);
        if (productComparison.diversityScore > 70) {
            advantages.push({
                type: 'diversidade',
                description: 'Boa diversidade de produtos',
                impact: 'médio',
                value: productComparison.diversityScore
            });
        }

        // Verificar tendência de crescimento
        const trends = this.analyzeMarketTrends(period);
        if (trends.trend === 'crescimento' && trends.trendPercentage > 5) {
            advantages.push({
                type: 'crescimento',
                description: 'Crescimento consistente',
                impact: 'alto',
                value: trends.trendPercentage
            });
        }

        return advantages;
    }

    // Calcular participação de mercado (simulado)
    calculateMarketShare(period = 6) {
        // Em produção, isso usaria dados reais do mercado
        // Por enquanto, simula baseado em vendas próprias
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - period, 1);
        
        const ourSales = this.completedSales
            .filter(sale => new Date(sale.date) >= startDate)
            .reduce((sum, sale) => sum + (sale.totalValue || 0), 0);

        // Simular mercado total (assumir que representamos 5% do mercado)
        const estimatedMarketTotal = ourSales * 20;
        
        return {
            ourSales: ourSales,
            estimatedMarketTotal: estimatedMarketTotal,
            marketShare: estimatedMarketTotal > 0 ? (ourSales / estimatedMarketTotal) * 100 : 0
        };
    }

    // Calcular crescimento médio
    calculateAverageGrowth(monthlyData) {
        if (monthlyData.length < 2) return 0;

        const growthRates = [];
        for (let i = 1; i < monthlyData.length; i++) {
            const prev = monthlyData[i - 1].total;
            const curr = monthlyData[i].total;
            if (prev > 0) {
                growthRates.push(((curr - prev) / prev) * 100);
            }
        }

        return growthRates.length > 0
            ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
            : 0;
    }

    // Detectar sazonalidade
    detectSeasonality(monthlyData) {
        // Análise básica de sazonalidade
        const monthTotals = {};
        monthlyData.forEach(data => {
            const month = parseInt(data.month.split('-')[1]);
            if (!monthTotals[month]) {
                monthTotals[month] = [];
            }
            monthTotals[month].push(data.total);
        });

        const monthAverages = {};
        Object.keys(monthTotals).forEach(month => {
            const totals = monthTotals[month];
            monthAverages[month] = totals.reduce((sum, val) => sum + val, 0) / totals.length;
        });

        const overallAvg = Object.values(monthAverages).reduce((sum, val) => sum + val, 0) / Object.keys(monthAverages).length;
        
        const seasonality = {};
        Object.keys(monthAverages).forEach(month => {
            seasonality[month] = ((monthAverages[month] - overallAvg) / overallAvg) * 100;
        });

        return {
            hasSeasonality: Math.max(...Object.values(seasonality)) - Math.min(...Object.values(seasonality)) > 20,
            monthVariations: seasonality,
            peakMonth: Object.keys(monthAverages).reduce((a, b) => monthAverages[a] > monthAverages[b] ? a : b),
            lowMonth: Object.keys(monthAverages).reduce((a, b) => monthAverages[a] < monthAverages[b] ? a : b)
        };
    }

    // Gerar recomendações competitivas
    generateCompetitiveRecommendations(analysis) {
        const recommendations = [];

        // Recomendações baseadas em preços
        if (analysis.priceComparison.competitiveness === 'acima') {
            recommendations.push({
                type: 'preço',
                priority: 'alta',
                title: 'Ajustar Preços',
                description: `Seus preços estão ${analysis.priceComparison.priceDifference.toFixed(1)}% acima da média do mercado. Considere revisar preços para aumentar competitividade.`,
                action: 'Revisar estratégia de precificação'
            });
        }

        // Recomendações baseadas em margem
        if (analysis.priceComparison.marginDifference < -5) {
            recommendations.push({
                type: 'margem',
                priority: 'alta',
                title: 'Melhorar Margem de Lucro',
                description: `Sua margem está ${Math.abs(analysis.priceComparison.marginDifference).toFixed(1)}% abaixo da média. Considere negociar melhores condições com fornecedores ou ajustar preços.`,
                action: 'Negociar com fornecedores'
            });
        }

        // Recomendações baseadas em diversidade
        if (analysis.productComparison.diversityScore < 50) {
            recommendations.push({
                type: 'produto',
                priority: 'média',
                title: 'Aumentar Diversidade de Produtos',
                description: `Sua diversidade de produtos está baixa (${analysis.productComparison.diversityScore.toFixed(1)}%). Considere expandir o catálogo.`,
                action: 'Adicionar novos produtos'
            });
        }

        // Recomendações baseadas em tendências
        if (analysis.marketTrends.trend === 'declínio' && analysis.marketTrends.trendPercentage < -10) {
            recommendations.push({
                type: 'tendência',
                priority: 'alta',
                title: 'Reversão de Tendência',
                description: `Vendas em declínio de ${Math.abs(analysis.marketTrends.trendPercentage).toFixed(1)}%. Considere campanhas promocionais ou ajustes estratégicos.`,
                action: 'Criar campanha promocional'
            });
        }

        // Recomendações baseadas em vantagens competitivas
        if (analysis.competitiveAdvantages.length === 0) {
            recommendations.push({
                type: 'geral',
                priority: 'média',
                title: 'Desenvolver Vantagens Competitivas',
                description: 'Identifique e desenvolva diferenciais competitivos para se destacar no mercado.',
                action: 'Análise estratégica'
            });
        }

        return recommendations;
    }

    // Abrir modal de análise de concorrência
    openCompetitiveAnalysisModal() {
        const modal = document.getElementById('competitiveAnalysisModal');
        if (!modal) {
            console.error('Modal de análise de concorrência não encontrado');
            return;
        }
        
        modal.classList.add('active');
        this.updateCompetitiveAnalysis();
    }

    // Fechar modal de análise de concorrência
    closeCompetitiveAnalysisModal() {
        const modal = document.getElementById('competitiveAnalysisModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Atualizar análise de concorrência
    updateCompetitiveAnalysis() {
        const period = parseInt(document.getElementById('competitivePeriod')?.value || 6);
        this.renderCompetitiveAnalysis(period);
    }

    // Exportar análise de concorrência
    exportCompetitiveAnalysis() {
        const period = parseInt(document.getElementById('competitivePeriod')?.value || 6);
        const analysis = this.analyzeCompetition(period);
        
        const exportData = {
            period: period,
            analysis: analysis,
            generatedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analise_concorrencia_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (typeof toast !== 'undefined' && toast) {
            toast.success('Análise de concorrência exportada com sucesso!', 3000);
        }
    }

    // Renderizar análise de concorrência
    renderCompetitiveAnalysis(period = 6) {
        const analysis = this.analyzeCompetition(period);
        const container = document.getElementById('competitiveAnalysisContainer');
        
        if (!container) return;

        let html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="padding: 1rem; background: var(--light-gray); border-radius: var(--radius-sm);">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: var(--gray-600);">Competitividade de Preços</h3>
                    <p style="margin: 0; font-size: 1.2rem; font-weight: 600; color: ${analysis.priceComparison.competitiveness === 'competitivo' ? '#28a745' : analysis.priceComparison.competitiveness === 'acima' ? '#dc3545' : '#6c757d'};">
                        ${analysis.priceComparison.competitiveness === 'competitivo' ? '✓ Competitivo' : analysis.priceComparison.competitiveness === 'acima' ? '↑ Acima' : '→ Similar'}
                    </p>
                    <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--gray-600);">
                        ${analysis.priceComparison.priceDifference > 0 ? '+' : ''}${analysis.priceComparison.priceDifference.toFixed(1)}% vs mercado
                    </p>
                </div>
                <div style="padding: 1rem; background: var(--light-gray); border-radius: var(--radius-sm);">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: var(--gray-600);">Margem de Lucro</h3>
                    <p style="margin: 0; font-size: 1.2rem; font-weight: 600; color: ${analysis.priceComparison.ourAvgMargin > analysis.priceComparison.marketAvgMargin ? '#28a745' : '#dc3545'};">
                        ${analysis.priceComparison.ourAvgMargin.toFixed(1)}%
                    </p>
                    <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--gray-600);">
                        ${analysis.priceComparison.marginDifference > 0 ? '+' : ''}${analysis.priceComparison.marginDifference.toFixed(1)}% vs mercado
                    </p>
                </div>
                <div style="padding: 1rem; background: var(--light-gray); border-radius: var(--radius-sm);">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: var(--gray-600);">Diversidade de Produtos</h3>
                    <p style="margin: 0; font-size: 1.2rem; font-weight: 600; color: ${analysis.productComparison.diversityScore > 70 ? '#28a745' : analysis.productComparison.diversityScore > 50 ? '#ffc107' : '#dc3545'};">
                        ${analysis.productComparison.diversityScore.toFixed(1)}%
                    </p>
                    <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--gray-600);">
                        ${analysis.productComparison.productDiversity} produtos únicos
                    </p>
                </div>
                <div style="padding: 1rem; background: var(--light-gray); border-radius: var(--radius-sm);">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: var(--gray-600);">Tendência de Mercado</h3>
                    <p style="margin: 0; font-size: 1.2rem; font-weight: 600; color: ${analysis.marketTrends.trend === 'crescimento' ? '#28a745' : analysis.marketTrends.trend === 'declínio' ? '#dc3545' : '#6c757d'};">
                        ${analysis.marketTrends.trend === 'crescimento' ? '📈 Crescimento' : analysis.marketTrends.trend === 'declínio' ? '📉 Declínio' : '➡️ Estável'}
                    </p>
                    <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--gray-600);">
                        ${analysis.marketTrends.trendPercentage > 0 ? '+' : ''}${analysis.marketTrends.trendPercentage.toFixed(1)}%
                    </p>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <h3 style="margin: 0 0 1rem 0; color: var(--dark-gray); font-size: 1rem;">
                    <i class="fas fa-trophy"></i> Vantagens Competitivas
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
                    ${analysis.competitiveAdvantages.length > 0
                        ? analysis.competitiveAdvantages.map(adv => `
                            <div style="padding: 0.75rem; background: ${adv.impact === 'alto' ? '#d4edda' : '#fff3cd'}; border-left: 3px solid ${adv.impact === 'alto' ? '#28a745' : '#ffc107'}; border-radius: var(--radius-sm);">
                                <strong style="display: block; margin-bottom: 0.25rem; color: var(--dark-gray);">${adv.type.charAt(0).toUpperCase() + adv.type.slice(1)}</strong>
                                <p style="margin: 0; font-size: 0.85rem; color: var(--gray-700);">${adv.description}</p>
                            </div>
                        `).join('')
                        : '<p style="color: var(--gray-600);">Nenhuma vantagem competitiva identificada no período.</p>'
                    }
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <h3 style="margin: 0 0 1rem 0; color: var(--dark-gray); font-size: 1rem;">
                    <i class="fas fa-lightbulb"></i> Recomendações
                </h3>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${analysis.recommendations.map(rec => `
                        <div style="padding: 1rem; background: ${rec.priority === 'alta' ? '#f8d7da' : '#fff3cd'}; border-left: 4px solid ${rec.priority === 'alta' ? '#dc3545' : '#ffc107'}; border-radius: var(--radius-sm);">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                <strong style="color: var(--dark-gray);">${rec.title}</strong>
                                <span style="padding: 0.25rem 0.5rem; background: ${rec.priority === 'alta' ? '#dc3545' : '#ffc107'}; color: white; border-radius: var(--radius-sm); font-size: 0.75rem;">
                                    ${rec.priority === 'alta' ? 'Alta' : 'Média'}
                                </span>
                            </div>
                            <p style="margin: 0 0 0.5rem 0; color: var(--gray-700); font-size: 0.9rem;">${rec.description}</p>
                            <p style="margin: 0; font-size: 0.85rem; color: var(--gray-600);"><strong>Ação:</strong> ${rec.action}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // ========== CACHE CLEANUP ==========

    // Inicializar limpeza automática de cache
    initCacheCleanup() {
        // Limpar cache de gráficos expirados periodicamente
        setInterval(() => {
            const now = Date.now();
            Object.keys(this.chartCache).forEach(chartId => {
                const cacheEntry = this.chartCache[chartId];
                if (cacheEntry && cacheEntry.timestamp) {
                    const age = now - cacheEntry.timestamp;
                    const ttl = this.cacheStrategies.charts.ttl || (5 * 60 * 1000);
                    
                    if (age > ttl) {
                        delete this.chartCache[chartId];
                        console.log(`🗑️ [CACHE] Cache expirado removido: ${chartId}`);
                    }
                }
            });
        }, 60000); // Verificar a cada minuto

        console.log('✅ [CACHE] Limpeza automática de cache inicializada');
    }

    // Configurar throttle de scroll
    setupScrollThrottle() {
        // Função throttle genérica
        const throttle = (func, limit) => {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        };

        // Aplicar throttle em eventos de scroll
        const scrollableElements = document.querySelectorAll('.items-list, .clients-list, .suppliers-list, .main-content');
        scrollableElements.forEach(element => {
            if (element) {
                element.addEventListener('scroll', throttle(() => {
                    // Scroll throttled - pode adicionar lógica aqui se necessário
                }, 100), { passive: true });
            }
        });

        console.log('✅ [SCROLL] Throttle de scroll configurado');
    }

    // ========== LAZY LOADING ==========

    // Inicializar lazy loading de imagens
    initLazyLoading() {
        // Usar Intersection Observer para lazy loading de imagens
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px', // Carregar 50px antes de entrar na viewport
            });

            // Observar todas as imagens com data-src
            document.querySelectorAll('img[data-src]').forEach((img) => {
                imageObserver.observe(img);
            });

            console.log('✅ [LAZY LOADING] Lazy loading de imagens inicializado');
        } else {
            // Fallback para navegadores sem Intersection Observer
            document.querySelectorAll('img[data-src]').forEach((img) => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }

    // Renderizar lista com virtual scrolling (paginção)
    renderListWithVirtualScrolling(containerId, items, renderItem, itemsPerPage = 20) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let currentPage = 1;
        const totalPages = Math.ceil(items.length / itemsPerPage);

        // Renderizar primeira página
        const renderPage = (page) => {
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageItems = items.slice(start, end);

            // Limpar container
            container.innerHTML = '';

            // Renderizar itens da página
            pageItems.forEach((item, index) => {
                const itemElement = renderItem(item, start + index);
                if (itemElement) {
                    container.appendChild(itemElement);
                }
            });

            // Adicionar botões de paginação se necessário
            if (totalPages > 1) {
                const pagination = document.createElement('div');
                pagination.className = 'pagination';
                pagination.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-top: 1rem; padding: 1rem;';

                // Botão anterior
                const prevBtn = document.createElement('button');
                prevBtn.className = 'btn-small btn-secondary';
                prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Anterior';
                prevBtn.disabled = currentPage === 1;
                prevBtn.addEventListener('click', () => {
                    if (currentPage > 1) {
                        currentPage--;
                        renderPage(currentPage);
                    }
                });
                pagination.appendChild(prevBtn);

                // Informação de página
                const pageInfo = document.createElement('span');
                pageInfo.textContent = `Página ${currentPage} de ${totalPages} (${items.length} itens)`;
                pageInfo.style.cssText = 'padding: 0 1rem; color: var(--gray-600);';
                pagination.appendChild(pageInfo);

                // Botão próximo
                const nextBtn = document.createElement('button');
                nextBtn.className = 'btn-small btn-secondary';
                nextBtn.innerHTML = 'Próximo <i class="fas fa-chevron-right"></i>';
                nextBtn.disabled = currentPage === totalPages;
                nextBtn.addEventListener('click', () => {
                    if (currentPage < totalPages) {
                        currentPage++;
                        renderPage(currentPage);
                    }
                });
                pagination.appendChild(nextBtn);

                container.appendChild(pagination);
            }
        };

        renderPage(1);
        return { renderPage, currentPage, totalPages };
    }

    // Carregar dados sob demanda (infinite scroll)
    initInfiniteScroll(containerId, loadMoreCallback, threshold = 200) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let isLoading = false;
        let hasMore = true;

        const checkScroll = () => {
            if (isLoading || !hasMore) return;

            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;

            // Verificar se está próximo do fim
            if (scrollTop + clientHeight >= scrollHeight - threshold) {
                isLoading = true;
                loadMoreCallback().then((result) => {
                    isLoading = false;
                    if (result && result.hasMore !== undefined) {
                        hasMore = result.hasMore;
                    }
                }).catch((error) => {
                    console.error('Erro ao carregar mais itens:', error);
                    isLoading = false;
                });
            }
        };

        container.addEventListener('scroll', checkScroll, { passive: true });
        
        // Verificar inicialmente
        checkScroll();

        return {
            reset: () => {
                hasMore = true;
                isLoading = false;
            },
            setHasMore: (value) => {
                hasMore = value;
            },
        };
    }

    // Carregar componente sob demanda (code splitting simulado)
    async loadComponent(componentName) {
        // Em um sistema real, isso carregaria um módulo separado
        // Por enquanto, apenas retorna uma Promise resolvida
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`✅ [LAZY LOADING] Componente ${componentName} carregado`);
                resolve(true);
            }, 100);
        });
    }

    // Renderizar imagem com lazy loading
    createLazyImage(src, alt = '', className = '') {
        const img = document.createElement('img');
        img.className = className;
        img.alt = alt;
        img.dataset.src = src; // Usar data-src para lazy loading
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E'; // Placeholder 1x1
        img.style.cssText = 'opacity: 0; transition: opacity 0.3s;';
        
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });

        // Observar quando entrar na viewport
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '50px' });
            
            observer.observe(img);
        } else {
            // Fallback: carregar imediatamente
            img.src = src;
        }

        return img;
    }

    // ========== FUNCIONALIDADES MOBILE-SPECIFIC ==========

    // Solicitar acesso à câmera
    async requestCameraAccess() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } // Câmera traseira
            });
            return stream;
        } catch (error) {
            console.error('Erro ao acessar câmera:', error);
            throw error;
        }
    }

    // Capturar foto da câmera
    async capturePhoto(videoElement) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoElement, 0, 0);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    resolve({ blob, url, dataUrl: canvas.toDataURL('image/jpeg', 0.8) });
                } else {
                    reject(new Error('Erro ao capturar foto'));
                }
            }, 'image/jpeg', 0.8);
        });
    }

    // Solicitar geolocalização
    async requestGeolocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalização não suportada'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        });
    }

    // Compartilhar conteúdo (Web Share API)
    async shareContent(data) {
        if (!navigator.share) {
            // Fallback: copiar para área de transferência
            if (data.text) {
                await navigator.clipboard.writeText(data.text);
                if (typeof toast !== 'undefined' && toast) {
                    toast.success('Conteúdo copiado para área de transferência!', 3000);
                }
            }
            return false;
        }

        try {
            await navigator.share(data);
            return true;
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Erro ao compartilhar:', error);
            }
            return false;
        }
    }

    // Abrir calendário nativo (para agendamentos)
    openNativeCalendar(event) {
        const startDate = event.startDate || new Date().toISOString().split('T')[0];
        const endDate = event.endDate || startDate;
        const title = event.title || 'Agendamento';
        const description = event.description || '';
        const location = event.location || '';

        // Formato para Google Calendar
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate.replace(/-/g, '')}/${endDate.replace(/-/g, '')}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
        
        window.open(googleCalendarUrl, '_blank');
    }

    // Adicionar contato aos contatos do dispositivo
    async addToContacts(contact) {
        // Usar Web Share API se disponível
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.name || ''}
TEL:${contact.phone || ''}
EMAIL:${contact.email || ''}
ADR:${contact.address || ''}
END:VCARD`;

        const blob = new Blob([vcard], { type: 'text/vcard' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${contact.name || 'contato'}.vcf`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        if (typeof toast !== 'undefined' && toast) {
            toast.success('Contato salvo! Abra o arquivo .vcf para adicionar aos seus contatos.', 4000);
        }
    }

    // Detectar se está em dispositivo móvel
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768);
    }

    // Detectar orientação do dispositivo
    getDeviceOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    // ========== NAVEGAÇÃO POR TECLADO ==========

    // Inicializar navegação por teclado
    initKeyboardNavigation() {
        // Atalhos globais
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: Busca rápida
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // Esc: Fechar modais
            if (e.key === 'Escape') {
                this.closeAllModals();
            }

            // Ctrl/Cmd + S: Salvar (prevenir comportamento padrão e salvar dados)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveData();
                if (typeof toast !== 'undefined' && toast) {
                    toast.info('Dados salvos!', 2000);
                }
            }

            // Navegação por tabs com setas
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const activeTab = document.querySelector('.tab-btn.active');
                if (activeTab) {
                    const tabs = Array.from(document.querySelectorAll('.tab-btn'));
                    const currentIndex = tabs.indexOf(activeTab);
                    let nextIndex;

                    if (e.key === 'ArrowRight') {
                        nextIndex = (currentIndex + 1) % tabs.length;
                    } else {
                        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                    }

                    if (tabs[nextIndex]) {
                        tabs[nextIndex].click();
                    }
                }
            }
        });

        // Navegação por teclado em listas
        this.setupListKeyboardNavigation();

        // Navegação por teclado em modais
        this.setupModalKeyboardNavigation();

        console.log('✅ [KEYBOARD] Navegação por teclado inicializada');
    }

    // Configurar navegação por teclado em listas
    setupListKeyboardNavigation() {
        const lists = document.querySelectorAll('.items-list, .clients-list, .suppliers-list');
        
        lists.forEach((list) => {
            list.setAttribute('tabindex', '0');
            list.setAttribute('role', 'listbox');
            
            list.addEventListener('keydown', (e) => {
                const items = Array.from(list.querySelectorAll('[role="listitem"], .item-card, .client-card, .supplier-card'));
                const currentIndex = items.findIndex(item => item === document.activeElement || item.contains(document.activeElement));
                
                let nextIndex = currentIndex;
                
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        nextIndex = (currentIndex + 1) % items.length;
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        nextIndex = (currentIndex - 1 + items.length) % items.length;
                        break;
                    case 'Home':
                        e.preventDefault();
                        nextIndex = 0;
                        break;
                    case 'End':
                        e.preventDefault();
                        nextIndex = items.length - 1;
                        break;
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        if (items[currentIndex]) {
                            const button = items[currentIndex].querySelector('button, a');
                            if (button) button.click();
                        }
                        return;
                }
                
                if (items[nextIndex]) {
                    items[nextIndex].focus();
                    items[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        });
    }

    // Configurar navegação por teclado em modais
    setupModalKeyboardNavigation() {
        const modals = document.querySelectorAll('.modal');
        
        modals.forEach((modal) => {
            modal.addEventListener('keydown', (e) => {
                // Tab: Navegar entre campos
                if (e.key === 'Tab') {
                    const focusableElements = modal.querySelectorAll(
                        'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])'
                    );
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (e.shiftKey) {
                        // Shift + Tab
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        // Tab
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            });
        });
    }

    // Fechar todos os modais
    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach((modal) => {
            modal.classList.remove('active');
        });
    }

    // Exportar análise preditiva
    exportPredictiveAnalysis() {
        const period = parseInt(document.getElementById('predictivePeriod')?.value || 6);
        const forecast = this.calculateSalesForecast(period);
        const trend = this.calculateSalesTrend(period);
        const growth = this.calculateExpectedGrowth(period);
        
        const analysis = {
            period: period,
            forecast: forecast,
            trend: trend,
            growth: growth,
            topProducts: this.getTopSellingProducts(period),
            generatedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(analysis, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analise_preditiva_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (typeof toast !== 'undefined' && toast) {
            toast.success('Análise preditiva exportada com sucesso!', 3000);
        }
    }
}

// Inicializar aplicação
let app;

// Função para inicializar a aplicação
function inicializarApp() {
    console.log('🟣 [APP.JS] ========== INICIALIZANDO APLICAÇÃO ==========');
    console.log('🟣 [APP.JS] Criando instância de LojaApp...');
    console.log('🟣 [APP.JS] SessionStorage:', {
        loggedIn: sessionStorage.getItem('loggedIn'),
        username: sessionStorage.getItem('username'),
    });

    try {
        if (!window.app) {
            window.app = new LojaApp();
            app = window.app;
            console.log('✅ [APP.JS] Instância de LojaApp criada com sucesso!');
        } else {
            console.log('ℹ️ [APP.JS] Instância de LojaApp já existe');
            app = window.app;
        }
    } catch (error) {
        console.error('❌ [APP.JS] ERRO ao criar LojaApp:', error);
        console.error('❌ [APP.JS] Stack:', error.stack);
    }
}

// Tentar inicializar quando DOMContentLoaded disparar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🟣 [APP.JS] ========== DOMContentLoaded DISPARADO ==========');
    inicializarApp();
});

// Se o DOM já estiver pronto quando o script carregar, inicializar imediatamente
if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
) {
    console.log(
        '🟣 [APP.JS] DOM já está pronto, inicializando imediatamente...'
    );
    setTimeout(inicializarApp, 100);
}
