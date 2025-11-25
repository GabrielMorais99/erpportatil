// ========== APP.JS CARREGADO ==========
console.log('🟣 [APP.JS] Script carregado e executando...');

// Sistema de Gestão de Loja
class LojaApp {
    constructor() {
        this.items = [];
        this.groups = [];
        this.serviceGroups = []; // Grupos mensais de serviços
        this.costs = [];
        this.goals = [];
        this.currentEditingItem = null;
        this.currentGroup = null;
        this.currentServiceGroup = null;
        this.currentServiceDay = null;
        this.currentSaleDay = null;
        this.currentEditingCost = null;
        this.currentEditingGoal = null;
        this.currentQRScanner = null; // Scanner de QR code
        this.currentDashboardType = 'sales'; // 'sales' ou 'services'
        this.avgStockChart = null; // Gráfico de média de estoque
        this.goalsChart = null; // Gráfico de metas
        this.tutorialStep = 0; // Passo atual do tutorial
        this.tutorialActive = false; // Se o tutorial está ativo

        this.init();
    }

    init() {
        console.log(
            '🟣 [APP.JS] ========== INICIALIZANDO APLICAÇÃO =========='
        );
        console.log('🟣 [APP.JS] URL atual:', window.location.href);
        console.log('🟣 [APP.JS] Document readyState:', document.readyState);
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

        // Aguardar um pouco para garantir que o DOM está totalmente pronto
        setTimeout(() => {
            addDebugLog('Iniciando setup...');

            // Carregar tema salvo
            this.loadTheme();

            // Event listeners (deve ser chamado primeiro)
            this.setupEventListeners();

            // Carregar dados (assíncrono)
            this.loadData().then(() => {
                // Renderizar após carregar dados
                this.renderItems();
                this.renderGroups();
                this.renderCosts();
                this.renderGoals();
                this.updateMonthFilter();
                this.updateOverallSummary();
            });

            // Renderizar imediatamente também
            this.renderItems();
            this.renderGroups();
            this.renderServiceGroups();
            this.renderCosts();
            this.renderGoals();
            this.updateMonthFilter();
            this.updateOverallSummary();
        }, 100);
    }

    setupEventListeners() {
        // Função para adicionar log (apenas no console)
        function addDebugLog(msg) {
            if (window.console && console.log) {
                console.log('🟣 [APP.JS] ' + msg);
            }
        }

        addDebugLog('Configurando event listeners...');

        // Botões principais
        const newItemBtn = document.getElementById('newItemBtn');
        const newGroupBtn = document.getElementById('newGroupBtn');
        const newCostBtn = document.getElementById('newCostBtn');
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

        addDebugLog(
            'Elementos encontrados: newItemBtn=' +
                !!newItemBtn +
                ', newGroupBtn=' +
                !!newGroupBtn +
                ', newCostBtn=' +
                !!newCostBtn +
                ', logoutBtn=' +
                !!logoutBtn
        );

        // Teste direto - verificar se os botões são clicáveis
        if (newItemBtn) {
            addDebugLog(
                'newItemBtn type: ' +
                    newItemBtn.type +
                    ', disabled: ' +
                    newItemBtn.disabled
            );
            addDebugLog(
                'newItemBtn style.pointerEvents: ' +
                    (window.getComputedStyle(newItemBtn).pointerEvents ||
                        'auto')
            );

            // Teste de clique direto
            newItemBtn.style.cursor = 'pointer';
            newItemBtn.style.pointerEvents = 'auto';
            const self = this; // Guardar referência ao this

            // Teste direto - adicionar onclick também como fallback
            newItemBtn.onclick = function (e) {
                addDebugLog('newItemBtn CLICADO (onclick)!');
                e.preventDefault();
                e.stopPropagation();
                addDebugLog('Chamando openItemModal()...');
                try {
                    self.openItemModal();
                    addDebugLog('openItemModal() chamado com sucesso!');
                } catch (error) {
                    addDebugLog(
                        'ERRO ao chamar openItemModal(): ' + error.message
                    );
                }
                return false;
            };

            // Também adicionar addEventListener como backup
            newItemBtn.addEventListener(
                'click',
                function (e) {
                    addDebugLog('newItemBtn CLICADO (addEventListener)!');
                    e.preventDefault();
                    e.stopPropagation();
                    addDebugLog('Chamando openItemModal()...');
                    try {
                        self.openItemModal();
                        addDebugLog('openItemModal() chamado com sucesso!');
                    } catch (error) {
                        addDebugLog(
                            'ERRO ao chamar openItemModal(): ' + error.message
                        );
                    }
                },
                true
            ); // Usar capture phase

            addDebugLog(
                'Listener anexado ao newItemBtn (onclick + addEventListener)'
            );
        } else {
            addDebugLog('ERRO: newItemBtn não encontrado!');
        }

        if (newGroupBtn) {
            const self = this;

            newGroupBtn.onclick = function (e) {
                addDebugLog('newGroupBtn CLICADO (onclick)!');
                e.preventDefault();
                e.stopPropagation();
                addDebugLog('Chamando openGroupModal()...');
                try {
                    self.openGroupModal();
                    addDebugLog('openGroupModal() chamado com sucesso!');
                } catch (error) {
                    addDebugLog(
                        'ERRO ao chamar openGroupModal(): ' + error.message
                    );
                }
                return false;
            };

            newGroupBtn.addEventListener(
                'click',
                function (e) {
                    addDebugLog('newGroupBtn CLICADO (addEventListener)!');
                    e.preventDefault();
                    e.stopPropagation();
                    addDebugLog('Chamando openGroupModal()...');
                    try {
                        self.openGroupModal();
                        addDebugLog('openGroupModal() chamado com sucesso!');
                    } catch (error) {
                        addDebugLog(
                            'ERRO ao chamar openGroupModal(): ' + error.message
                        );
                    }
                },
                true
            );

            addDebugLog(
                'Listener anexado ao newGroupBtn (onclick + addEventListener)'
            );
        } else {
            addDebugLog('ERRO: newGroupBtn não encontrado!');
        }

        if (newCostBtn) {
            const self = this;

            newCostBtn.onclick = function (e) {
                addDebugLog('newCostBtn CLICADO (onclick)!');
                e.preventDefault();
                e.stopPropagation();
                addDebugLog('Chamando openCostModal()...');
                try {
                    self.openCostModal();
                    addDebugLog('openCostModal() chamado com sucesso!');
                } catch (error) {
                    addDebugLog(
                        'ERRO ao chamar openCostModal(): ' + error.message
                    );
                }
                return false;
            };

            newCostBtn.addEventListener(
                'click',
                function (e) {
                    addDebugLog('newCostBtn CLICADO (addEventListener)!');
                    e.preventDefault();
                    e.stopPropagation();
                    addDebugLog('Chamando openCostModal()...');
                    try {
                        self.openCostModal();
                        addDebugLog('openCostModal() chamado com sucesso!');
                    } catch (error) {
                        addDebugLog(
                            'ERRO ao chamar openCostModal(): ' + error.message
                        );
                    }
                },
                true
            );

            addDebugLog(
                'Listener anexado ao newCostBtn (onclick + addEventListener)'
            );
        } else {
            addDebugLog('ERRO: newCostBtn não encontrado!');
        }

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

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
            console.log('✅ [APP.JS] Listener anexado ao exportBtn');
        } else {
            console.error('❌ [APP.JS] exportBtn não encontrado!');
        }

        // Botão de ajuda / Como usar
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.openTutorialModal());
            console.log('✅ [APP.JS] Listener anexado ao helpBtn');
        } else {
            console.error('❌ [APP.JS] helpBtn não encontrado!');
        }

        // Tutorial
        const closeTutorialBtn = document.getElementById('closeTutorialBtn');
        const startTutorialBtn = document.getElementById('startTutorialBtn');
        const tutorialModalClose = document.querySelector('#tutorialModal .close');
        const closeTutorialTooltip = document.getElementById('closeTutorialTooltip');
        const tutorialNextBtn = document.getElementById('tutorialNextBtn');
        const tutorialPrevBtn = document.getElementById('tutorialPrevBtn');
        const tutorialSkipBtn = document.getElementById('tutorialSkipBtn');

        if (closeTutorialBtn) {
            closeTutorialBtn.addEventListener('click', () => this.closeTutorialModal());
        }
        if (startTutorialBtn) {
            startTutorialBtn.addEventListener('click', () => this.startInteractiveTutorial());
        }
        if (tutorialModalClose) {
            tutorialModalClose.addEventListener('click', () => this.closeTutorialModal());
        }
        if (closeTutorialTooltip) {
            closeTutorialTooltip.addEventListener('click', () => this.closeTutorialTooltip());
        }
        if (tutorialNextBtn) {
            tutorialNextBtn.addEventListener('click', () => this.nextTutorialStep());
        }
        if (tutorialPrevBtn) {
            tutorialPrevBtn.addEventListener('click', () => this.prevTutorialStep());
        }
        if (tutorialSkipBtn) {
            tutorialSkipBtn.addEventListener('click', () => this.skipTutorial());
        }

        // Verificar se é primeira vez e mostrar tutorial
        this.checkFirstTimeUser();

        // Tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        const dashboardToggleBtn = document.getElementById('dashboardToggleBtn');
        if (tabBtns.length > 0) {
            tabBtns.forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    // Se for o botão de toggle do dashboard, chamar toggleDashboard()
                    if (btn.id === 'dashboardToggleBtn' || btn === dashboardToggleBtn) {
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
        const refreshServicesDashboard = document.getElementById('refreshServicesDashboard');
        const servicesPeriodFilter = document.getElementById('servicesPeriodFilter');

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
            searchInput.addEventListener('input', () => this.renderItems());
            console.log('✅ [APP.JS] Listener anexado ao searchInput');
        } else {
            console.error('❌ [APP.JS] searchInput não encontrado!');
        }

        if (monthFilter) {
            monthFilter.addEventListener('change', () => this.renderItems());
            console.log('✅ [APP.JS] Listener anexado ao monthFilter');
        } else {
            console.error('❌ [APP.JS] monthFilter não encontrado!');
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
            itemModalClose.addEventListener('click', () =>
                this.closeItemModal()
            );
            console.log('✅ [APP.JS] Listener anexado ao itemModal .close');
        } else {
            console.error('❌ [APP.JS] itemModal .close não encontrado!');
        }

        // QR Code - Modal de Item
        const downloadQRBtn = document.getElementById('downloadQRBtn');
        const printQRBtn = document.getElementById('printQRBtn');
        
        if (downloadQRBtn) {
            downloadQRBtn.addEventListener('click', () => {
                if (this.currentEditingItem) {
                    this.downloadQRCode('qrcodeCanvas', `qrcode-${this.currentEditingItem.id}.png`);
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
        const downloadQRModalBtn = document.getElementById('downloadQRModalBtn');
        const printQRModalBtn = document.getElementById('printQRModalBtn');
        
        if (qrcodeModalClose) {
            qrcodeModalClose.addEventListener('click', () => {
                document.getElementById('qrcodeModal').classList.remove('active');
            });
        }
        
        if (downloadQRModalBtn) {
            downloadQRModalBtn.addEventListener('click', () => {
                const itemId = downloadQRModalBtn.dataset.itemId;
                if (itemId) {
                    this.downloadQRCode('qrcodeModalCanvas', `qrcode-${itemId}.png`);
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

        // Modal de grupo de serviços
        const newServiceGroupBtn = document.getElementById('newServiceGroupBtn');
        const serviceGroupForm = document.getElementById('serviceGroupForm');
        const cancelServiceGroupBtn = document.getElementById('cancelServiceGroupBtn');
        const serviceGroupModalClose = document.querySelector('#serviceGroupModal .close');

        if (newServiceGroupBtn) {
            newServiceGroupBtn.addEventListener('click', () => this.openServiceGroupModal());
        }

        if (serviceGroupForm) {
            serviceGroupForm.addEventListener('submit', (e) => this.createServiceGroup(e));
        }

        if (cancelServiceGroupBtn) {
            cancelServiceGroupBtn.addEventListener('click', () => this.closeServiceGroupModal());
        }

        if (serviceGroupModalClose) {
            serviceGroupModalClose.addEventListener('click', () => this.closeServiceGroupModal());
        }

        // Modal de registro de serviço
        const serviceRecordForm = document.getElementById('serviceRecordForm');
        const cancelServiceRecordBtn = document.getElementById('cancelServiceRecordBtn');
        const serviceRecordModalClose = document.querySelector('#serviceRecordModal .close');
        const serviceRecordItem = document.getElementById('serviceRecordItem');

        if (serviceRecordForm) {
            serviceRecordForm.addEventListener('submit', (e) => this.saveServiceRecord(e));
        }

        if (cancelServiceRecordBtn) {
            cancelServiceRecordBtn.addEventListener('click', () => this.closeServiceRecordModal());
        }

        if (serviceRecordModalClose) {
            serviceRecordModalClose.addEventListener('click', () => this.closeServiceRecordModal());
        }

        // Preencher horas padrão ao selecionar serviço
        if (serviceRecordItem) {
            serviceRecordItem.addEventListener('change', () => {
                const itemId = serviceRecordItem.value;
                if (itemId) {
                    const item = this.items.find(i => i.id === itemId);
                    if (item && item.category === 'Serviços') {
                        const hoursInput = document.getElementById('serviceRecordHours');
                        const minutesInput = document.getElementById('serviceRecordMinutes');
                        const priceInput = document.getElementById('serviceRecordPrice');
                        
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
        const viewServiceGroupModalClose = document.querySelector('#viewServiceGroupModal .close');
        if (viewServiceGroupModalClose) {
            viewServiceGroupModalClose.addEventListener('click', () => this.closeViewServiceGroupModal());
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

        // Fechar modais ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    // ========== GESTÃO DE ITENS ==========

    toggleCategoryFields() {
        const category = document.getElementById('itemCategory').value;
        const clothingFields = document.getElementById('clothingFields');
        const electronicsFields = document.getElementById('electronicsFields');
        const servicesFields = document.getElementById('servicesFields');
        const clothingBasicFields = document.getElementById(
            'clothingBasicFields'
        );
        const itemName = document.getElementById('itemName');
        const itemBrand = document.getElementById('itemBrand');
        const serviceName = document.getElementById('serviceName');

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
            // Esconder campos de serviços
            if (servicesFields) servicesFields.style.display = 'none';
            // Remover required de serviceName quando não for Serviços
            if (serviceName) {
                serviceName.required = false;
            }
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
            if (servicesFields) servicesFields.style.display = 'none';
            // Remover required de serviceName quando não for Serviços
            if (serviceName) {
                serviceName.required = false;
            }
        }
        
        // Adicionar lógica para Serviços
        if (category === 'Serviços') {
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
            // Esconder campos específicos de roupas e eletrônicos
            if (clothingFields) clothingFields.style.display = 'none';
            if (electronicsFields) electronicsFields.style.display = 'none';
            // Mostrar campos específicos de serviços
            if (servicesFields) servicesFields.style.display = 'block';
            // Configurar nome do serviço como obrigatório
            if (serviceName) {
                serviceName.required = true;
            }
            // Limpar campos de outras categorias
            document.getElementById('itemStyle').value = '';
            document.getElementById('itemSize').value = '';
            document.getElementById('itemGender').value = '';
            document.getElementById('itemModel').value = '';
            document.getElementById('itemCapacity').value = '';
            document.getElementById('itemColor').value = '';
        } else if (category !== 'Roupas' && category !== 'Eletrônicos' && category !== 'Serviços') {
            // Se não for nenhuma categoria específica, esconder campos de serviços também
            if (servicesFields) servicesFields.style.display = 'none';
            if (serviceName) {
                serviceName.required = false;
            }
        }
        
        // Garantir que serviceName não seja required quando categoria for Roupas
        if (category === 'Roupas' && serviceName) {
            serviceName.required = false;
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
            } else if (item.category === 'Serviços') {
                document.getElementById('serviceName').value = item.name || '';
                document.getElementById('serviceDescription').value = item.description || '';
                document.getElementById('serviceDuration').value = item.duration || '';
                document.getElementById('serviceType').value = item.serviceType || '';
                document.getElementById('serviceUnit').value = item.serviceUnit || 'Unidades';
                document.getElementById('serviceDefaultHours').value = item.defaultHours || 0;
                document.getElementById('serviceDefaultMinutes').value = item.defaultMinutes || 0;
            }

            // Atualizar campos visíveis
            this.toggleCategoryFields();
            
            // Gerar QR code se estiver editando (apenas para produtos físicos)
            if (item.id && item.category !== 'Serviços') {
                this.generateQRCode(item.id);
            } else if (item.category === 'Serviços') {
                // Esconder seção de QR code para serviços
                const qrcodeSection = document.getElementById('qrcodeSection');
                if (qrcodeSection) qrcodeSection.style.display = 'none';
            }
        } else {
            title.textContent = 'Novo Produto';
            form.reset();
            // Esconder campos específicos ao criar novo item
            document.getElementById('clothingFields').style.display = 'none';
            document.getElementById('electronicsFields').style.display = 'none';
            const servicesFields = document.getElementById('servicesFields');
            if (servicesFields) servicesFields.style.display = 'none';
            
            // Remover required de serviceName ao criar novo item
            const serviceName = document.getElementById('serviceName');
            if (serviceName) {
                serviceName.required = false;
            }
            
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
    }

    closeItemModal() {
        document.getElementById('itemModal').classList.remove('active');
        this.currentEditingItem = null;
        
        // Esconder seção de QR code
        const qrcodeSection = document.getElementById('qrcodeSection');
        if (qrcodeSection) qrcodeSection.style.display = 'none';
    }

    saveItem(e) {
        e.preventDefault();

        const category = document.getElementById('itemCategory').value;

        const item = {
            id: this.currentEditingItem
                ? this.currentEditingItem.id
                : Date.now().toString(),
            category: category,
            price: this.parsePrice(document.getElementById('itemPrice').value),
        };

        // Adicionar campos baseado na categoria
        if (category === 'Roupas') {
            item.name = document.getElementById('itemName').value.trim() || '';
            item.brand = document.getElementById('itemBrand').value.trim();
            item.style =
                document.getElementById('itemStyle').value.trim() || '';
            item.size = document.getElementById('itemSize').value.trim() || '';
            item.gender = document.getElementById('itemGender').value || '';
        } else if (category === 'Eletrônicos') {
            // Para eletrônicos, usar modelo como nome (ou modelo + capacidade + cor)
            const model = document.getElementById('itemModel').value.trim();
            const capacity = document
                .getElementById('itemCapacity')
                .value.trim();
            const color = document.getElementById('itemColor').value.trim();

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
        } else if (category === 'Serviços') {
            item.name = document.getElementById('serviceName').value.trim();
            item.description = document.getElementById('serviceDescription').value.trim() || '';
            item.duration = document.getElementById('serviceDuration').value.trim() || '';
            item.serviceType = document.getElementById('serviceType').value || '';
            item.serviceUnit = document.getElementById('serviceUnit').value || 'Unidades';
            // Horas padrão do serviço
            const defaultHours = parseInt(document.getElementById('serviceDefaultHours').value) || 0;
            const defaultMinutes = parseInt(document.getElementById('serviceDefaultMinutes').value) || 0;
            item.defaultHours = defaultHours;
            item.defaultMinutes = defaultMinutes;
            item.brand = ''; // Não usado para serviços
        }

        // Validações
        if (!category) {
            alert('Por favor, selecione uma categoria.');
            return;
        }

        if (category === 'Roupas') {
            if (!item.brand) {
                alert('Por favor, preencha a marca.');
                return;
            }
        } else if (category === 'Eletrônicos') {
            if (!item.model) {
                alert('Por favor, preencha o modelo.');
                return;
            }
        } else if (category === 'Serviços') {
            if (!item.name) {
                alert('Por favor, preencha o nome do serviço.');
                return;
            }
        }

        if (item.price <= 0) {
            alert('O preço deve ser maior que zero.');
            return;
        }

        if (this.currentEditingItem) {
            const index = this.items.findIndex(
                (i) => i.id === this.currentEditingItem.id
            );
            if (index !== -1) {
                this.items[index] = item;
            }
        } else {
            this.items.push(item);
        }

        this.saveData();
        this.renderItems();
        this.closeItemModal();
        
        // Gerar QR code após salvar (apenas para produtos físicos)
        if (item.id && item.category !== 'Serviços') {
            this.generateQRCode(item.id);
        } else if (item.category === 'Serviços') {
            // Esconder seção de QR code para serviços
            const qrcodeSection = document.getElementById('qrcodeSection');
            if (qrcodeSection) qrcodeSection.style.display = 'none';
        }
    }

    // ========== FUNÇÕES QR CODE ==========
    
    generateQRCode(itemId) {
        if (!window.QRCode) {
            console.error('Biblioteca QRCode não carregada');
            return;
        }

        const canvas = document.getElementById('qrcodeCanvas');
        const section = document.getElementById('qrcodeSection');
        
        if (!canvas || !section) return;

        const qrData = `ITEM:${itemId}`;
        
        QRCode.toCanvas(canvas, qrData, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }, (error) => {
            if (error) {
                console.error('Erro ao gerar QR code:', error);
                alert('Erro ao gerar QR code');
            } else {
                section.style.display = 'block';
            }
        });
    }

    generateQRCodeForModal(itemId, canvasId) {
        if (!window.QRCode) {
            console.error('Biblioteca QRCode não carregada');
            return;
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const qrData = `ITEM:${itemId}`;
        
        QRCode.toCanvas(canvas, qrData, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }, (error) => {
            if (error) {
                console.error('Erro ao gerar QR code:', error);
                alert('Erro ao gerar QR code');
            }
        });
    }

    showQRCodeModal(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return;

        const modal = document.getElementById('qrcodeModal');
        const canvas = document.getElementById('qrcodeModalCanvas');
        const itemNameEl = document.getElementById('qrcodeItemName');
        const downloadBtn = document.getElementById('downloadQRModalBtn');
        
        if (!modal || !canvas || !itemNameEl) return;

        itemNameEl.textContent = this.getItemName(itemId);
        if (downloadBtn) downloadBtn.dataset.itemId = itemId;
        this.generateQRCodeForModal(itemId, 'qrcodeModalCanvas');
        modal.classList.add('active');
    }

    downloadQRCode(canvasId, filename) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = filename || `qrcode-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
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
            alert('Biblioteca de scanner não carregada. Verifique sua conexão.');
            return;
        }

        const container = document.getElementById('qrScannerContainer');
        const readerDiv = document.getElementById('qrReader');
        
        if (!container || !readerDiv) return;

        // Limpar conteúdo anterior
        readerDiv.innerHTML = '';

        container.style.display = 'block';

        const html5QrCode = new Html5Qrcode("qrReader");
        
        html5QrCode.start(
            { facingMode: "environment" }, // Câmera traseira
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            (decodedText, decodedResult) => {
                // QR code lido com sucesso
                this.handleQRScanned(decodedText);
                html5QrCode.stop().then(() => {
                    container.style.display = 'none';
                }).catch((err) => {
                    console.error('Erro ao parar scanner:', err);
                });
            },
            (errorMessage) => {
                // Erro ignorado (continua escaneando)
                // console.log('Erro de escaneamento:', errorMessage);
            }
        );
        
        this.currentQRScanner = html5QrCode;
    }

    stopQRScanner() {
        const container = document.getElementById('qrScannerContainer');
        
        if (this.currentQRScanner) {
            this.currentQRScanner.stop().then(() => {
                if (container) container.style.display = 'none';
                this.currentQRScanner = null;
            }).catch((err) => {
                console.error('Erro ao parar scanner:', err);
                if (container) container.style.display = 'none';
                this.currentQRScanner = null;
            });
        } else {
            if (container) container.style.display = 'none';
        }
    }

    handleQRScanned(qrData) {
        // Extrair ID do produto
        let itemId = null;
        
        if (qrData.startsWith('ITEM:')) {
            itemId = qrData.replace('ITEM:', '');
        } else {
            // Tentar como ID direto (compatibilidade)
            itemId = qrData;
        }

        const item = this.items.find(i => i.id === itemId);
        
        if (item) {
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
            
            // Feedback visual
            const saleDayInfo = document.getElementById('saleDayInfo');
            if (saleDayInfo) {
                const originalBg = saleDayInfo.style.background;
                saleDayInfo.style.background = '#28a745';
                saleDayInfo.innerHTML = `<strong style="color: white;">✓ Produto selecionado: ${this.getItemName(itemId)}</strong>`;
                setTimeout(() => {
                    saleDayInfo.style.background = originalBg;
                    saleDayInfo.innerHTML = `<strong>Dia: <span id="saleDayDisplay">${this.currentSaleDay || '-'}</span></strong>`;
                }, 2000);
            }
        } else {
            alert('Produto não encontrado! Verifique se o QR code é válido.');
        }
    }

    deleteItem(id) {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            this.items = this.items.filter((item) => item.id !== id);
            // Remover vendas relacionadas
            this.groups.forEach((group) => {
                group.days.forEach((day) => {
                    day.sales = day.sales.filter((sale) => sale.itemId !== id);
                });
            });
            this.saveData();
            this.renderItems();
            this.renderGroups();
        }
    }

    renderItems() {
        const grid = document.getElementById('itemsGrid');
        const searchTerm = document
            .getElementById('searchInput')
            .value.toLowerCase();
        const monthFilter = document.getElementById('monthFilter').value;

        let filteredItems = this.items;

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
                    (category === 'Serviços' &&
                        item.name &&
                        item.name.toLowerCase().includes(search)) ||
                    (category === 'Serviços' &&
                        item.description &&
                        item.description.toLowerCase().includes(search)) ||
                    (category === 'Serviços' &&
                        item.serviceType &&
                        item.serviceType.toLowerCase().includes(search))
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

        if (filteredItems.length === 0) {
            grid.innerHTML =
                '<p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 2rem;">Nenhum item encontrado.</p>';
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
                } else if (category === 'Serviços') {
                    categoryInfo = `
                    ${
                        item.description
                            ? `<div class="item-info">${this.escapeHtml(
                                  item.description.length > 100 
                                      ? item.description.substring(0, 100) + '...'
                                      : item.description
                              )}</div>`
                            : ''
                    }
                    ${
                        item.duration
                            ? `<div class="item-info">Duração: ${this.escapeHtml(
                                  item.duration
                              )}</div>`
                            : ''
                    }
                    ${
                        item.serviceType
                            ? `<div class="item-info">Tipo: ${this.escapeHtml(
                                  item.serviceType
                              )}</div>`
                            : ''
                    }
                    ${
                        item.serviceUnit
                            ? `<div class="item-info">Unidade: ${this.escapeHtml(
                                  item.serviceUnit
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
                } else if (category === 'Serviços') {
                    displayName = item.name || 'Serviço';
                } else {
                    displayName = item.name || 'Item';
                }

                // Determinar classe do badge baseado na categoria
                let badgeClass = '';
                if (category === 'Serviços') {
                    badgeClass = 'services-badge';
                } else if (category === 'Eletrônicos') {
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
                <div class="item-price">R$ ${item.price
                    .toFixed(2)
                    .replace('.', ',')}</div>
                <div class="item-actions">
                    ${category !== 'Serviços' 
                        ? `<button class="btn-small btn-secondary" onclick="app.showQRCodeModal('${item.id}')" title="Ver QR Code">
                            <i class="fas fa-qrcode"></i> QR Code
                        </button>`
                        : ''
                    }
                    <button class="btn-small btn-edit" onclick="app.openItemModal(${JSON.stringify(
                        item
                    ).replace(/"/g, '&quot;')})">Editar</button>
                    <button class="btn-small btn-delete" onclick="app.deleteItem('${
                        item.id
                    }')">Excluir</button>
                </div>
            </div>
        `;
            })
            .join('');
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
            alert('Já existe um grupo para este mês.');
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
        this.closeGroupModal();
    }

    viewGroup(groupId) {
        const group = this.groups.find((g) => g.id === groupId);
        if (!group) return;

        this.currentGroup = group;
        const modal = document.getElementById('viewGroupModal');
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
        modal.classList.add('active');
    }

    calculateTotalAllMonths() {
        let totalSalesAll = 0;
        let totalValueAll = 0;

        this.groups.forEach((group) => {
            group.days.forEach((day) => {
                day.sales.forEach((sale) => {
                    totalSalesAll += sale.quantity;
                    totalValueAll += sale.price * sale.quantity;
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
                totalValue += sale.price * sale.quantity;

                if (!itemsSummary[sale.itemId]) {
                    itemsSummary[sale.itemId] = {
                        name: this.getItemName(sale.itemId),
                        quantity: 0,
                        total: 0,
                    };
                }
                itemsSummary[sale.itemId].quantity += sale.quantity;
                itemsSummary[sale.itemId].total += sale.price * sale.quantity;
            });
        });

        // Atualizar totais do mês
        document.getElementById('totalSales').textContent = totalSales;
        document.getElementById('totalValue').textContent = `R$ ${totalValue
            .toFixed(2)
            .replace('.', ',')}`;

        // Calcular e atualizar totais de todos os meses
        const allMonthsTotal = this.calculateTotalAllMonths();
        document.getElementById('totalSalesAll').textContent =
            allMonthsTotal.totalSales;
        document.getElementById(
            'totalValueAll'
        ).textContent = `R$ ${allMonthsTotal.totalValue
            .toFixed(2)
            .replace('.', ',')}`;

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
                '<p style="text-align: center; color: var(--gray);">Nenhuma venda registrada ainda.</p>';
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
        if (!group) return;

        this.currentGroup = group;
        this.currentSaleDay = day;
        const dayData = group.days.find((d) => d.day === day);

        // Popular select de itens (incluindo serviços)
        const saleItemSelect = document.getElementById('saleItem');
        saleItemSelect.innerHTML =
            '<option value="">Selecione um item...</option>' +
            this.items
                .map((item) => {
                    const category = item.category || 'Roupas';
                    let displayName;
                    
                    if (category === 'Eletrônicos') {
                        displayName = item.model || item.name;
                    } else if (category === 'Serviços') {
                        displayName = item.name || 'Serviço';
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
        document.getElementById('saleForm').reset();
        
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

        document.getElementById('saleModal').classList.add('active');
    }

    updateSaleModalForItem(itemId) {
        const item = itemId ? this.items.find(i => i.id === itemId) : null;
        const scanQRBtn = document.getElementById('scanQRBtn');
        const qrScannerContainer = document.getElementById('qrScannerContainer');
        const serviceInfo = document.getElementById('serviceInfo');
        const saleQuantityLabel = document.getElementById('saleQuantityLabel');
        const stockInfo = document.getElementById('stockInfo');
        
        if (!item) {
            // Resetar para padrão (produto físico)
            if (scanQRBtn) scanQRBtn.style.display = 'inline-block';
            if (serviceInfo) serviceInfo.style.display = 'none';
            if (saleQuantityLabel) saleQuantityLabel.textContent = 'Quantidade *';
            if (stockInfo) stockInfo.style.display = 'block';
            return;
        }
        
        if (item.category === 'Serviços') {
            // Configuração para SERVIÇOS
            // Esconder QR Code
            if (scanQRBtn) scanQRBtn.style.display = 'none';
            if (qrScannerContainer) qrScannerContainer.style.display = 'none';
            
            // Mostrar info do serviço
            if (serviceInfo) {
                serviceInfo.style.display = 'block';
                const descText = document.getElementById('serviceDescriptionText');
                if (descText) {
                    let info = `<strong>${this.getItemName(itemId)}</strong>`;
                    if (item.description) {
                        info += `<br><span style="color: #6c757d;">${this.escapeHtml(item.description)}</span>`;
                    }
                    if (item.duration) {
                        info += `<br><small style="color: #6c757d;">⏱️ Duração: ${this.escapeHtml(item.duration)}</small>`;
                    }
                    if (item.serviceType) {
                        info += `<br><small style="color: #6c757d;">📋 Tipo: ${this.escapeHtml(item.serviceType)}</small>`;
                    }
                    descText.innerHTML = info;
                }
            }
            
            // Atualizar label de quantidade
            const unit = item.serviceUnit || 'Unidades';
            if (saleQuantityLabel) {
                saleQuantityLabel.textContent = `Quantidade (${unit}) *`;
            }
            
            // Esconder info de estoque
            if (stockInfo) {
                stockInfo.style.display = 'none';
            }
        } else {
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
        }
    }

    updateStockInfo() {
        if (!this.currentGroup || !this.currentSaleDay) return;

        const itemId = document.getElementById('saleItem').value;
        const stockInfo = document.getElementById('stockInfo');

        if (!itemId || !stockInfo) return;

        // Verificar se é serviço (serviços não têm estoque físico)
        const item = this.items.find(i => i.id === itemId);
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

        const stockQuantity = dayData.stock[itemId] || 0;
        const soldQuantity = dayData.sales
            .filter((sale) => sale.itemId === itemId)
            .reduce((sum, sale) => sum + sale.quantity, 0);
        const availableStock = stockQuantity - soldQuantity;

        if (stockQuantity > 0) {
            stockInfo.textContent = `Estoque disponível: ${availableStock} un. (Total: ${stockQuantity} un. - Vendido: ${soldQuantity} un.)`;
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
                            )}</strong><br>
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
                        }, ${index})">Excluir</button>
                    </div>
                `;
                })
                .join('')}
        `;

        // Inserir antes do formulário
        const form = document.getElementById('saleForm');
        form.parentNode.insertBefore(salesList, form);
    }

    deleteSale(day, saleIndex) {
        // Buscar o grupo atualizado do array principal
        const group = this.groups.find((g) => g.id === this.currentGroup.id);
        if (!group) return;

        const dayData = group.days.find((d) => d.day === day);
        if (dayData && dayData.sales[saleIndex]) {
            if (confirm('Deseja excluir esta venda?')) {
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
            }
        }
    }

    closeSaleModal() {
        // Parar scanner se estiver ativo
        this.stopQRScanner();
        
        document.getElementById('saleModal').classList.remove('active');

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

        const itemId = document.getElementById('saleItem').value;
        const quantity = parseInt(
            document.getElementById('saleQuantity').value
        );
        const price = this.parsePrice(
            document.getElementById('salePrice').value
        );

        if (!itemId) {
            alert('Por favor, selecione um item.');
            return;
        }

        if (price <= 0 || quantity <= 0) {
            alert('Preço e quantidade devem ser maiores que zero.');
            return;
        }

        // Buscar o grupo atualizado do array principal
        const group = this.groups.find((g) => g.id === this.currentGroup.id);
        if (!group) return;

        const dayData = group.days.find((d) => d.day === this.currentSaleDay);
        if (!dayData) return;

        // Verificar se é serviço (serviços não têm estoque físico)
        const item = this.items.find(i => i.id === itemId);
        const isService = item && item.category === 'Serviços';

        // Verificar estoque disponível (apenas para produtos físicos)
        if (!isService) {
            // Garantir que stock existe
            if (!dayData.stock) {
                dayData.stock = {};
            }

            const stockQuantity = dayData.stock[itemId] || 0;
            const soldQuantity = dayData.sales
                .filter((sale) => sale.itemId === itemId)
                .reduce((sum, sale) => sum + sale.quantity, 0);
            const availableStock = stockQuantity - soldQuantity;

            if (stockQuantity > 0 && quantity > availableStock) {
                if (
                    !confirm(
                        `Atenção! Estoque disponível: ${availableStock} un. Deseja registrar ${quantity} un. mesmo assim?`
                    )
                ) {
                    return;
                }
            }
        }

        // Adicionar venda
        dayData.sales.push({
            itemId: itemId,
            quantity: quantity,
            price: price,
        });

        // Atualizar referência do grupo atual
        this.currentGroup = group;

        this.saveData();

        // Atualizar o resumo do grupo no modal (se estiver aberto)
        const viewGroupModal = document.getElementById('viewGroupModal');
        if (viewGroupModal && viewGroupModal.classList.contains('active')) {
            this.renderGroupView(group);
        }

        // Atualizar resumo geral na lista de grupos (se estiver na aba de grupos)
        const groupsTab = document.getElementById('groupsTab');
        if (groupsTab && groupsTab.classList.contains('active')) {
            this.renderGroups();
        }

        // Atualizar resumo geral
        this.updateOverallSummary();

        // Reabrir modal de venda para mostrar a nova venda
        this.openSaleModal(group.id, this.currentSaleDay);
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
            this.updateOverallSummary();
        }
    }

    renderGroups() {
        const list = document.getElementById('groupsList');

        // Atualizar resumo geral de todos os meses
        const allMonthsTotal = this.calculateTotalAllMonths();
        const overallTotalSalesEl =
            document.getElementById('overallTotalSales');
        const overallTotalValueEl =
            document.getElementById('overallTotalValue');

        if (overallTotalSalesEl) {
            overallTotalSalesEl.textContent = allMonthsTotal.totalSales;
        }
        if (overallTotalValueEl) {
            overallTotalValueEl.textContent = `R$ ${allMonthsTotal.totalValue
                .toFixed(2)
                .replace('.', ',')}`;
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

        if (this.groups.length === 0) {
            list.innerHTML =
                '<p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 2rem;">Nenhum grupo mensal criado ainda.</p>';
            return;
        }

        list.innerHTML = this.groups
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
                            (s, sale) => s + sale.price * sale.quantity,
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
                        <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--gray-200);">
                            <div style="color: #0c5460;"><strong>Estoque Total:</strong> ${totalStock} un.</div>
                            <div style="color: #856404;"><strong>Estoque Vendido:</strong> ${totalStockSold} un.</div>
                            <div style="color: ${totalStockAvailable < 0 ? '#dc3545' : totalStockAvailable === 0 ? '#ffc107' : '#155724'};"><strong>Estoque Disponível:</strong> ${totalStockAvailable} un.</div>
                        </div>
                    </div>
                    <div class="group-actions">
                        <button class="btn-small btn-edit" onclick="app.viewGroup('${
                            group.id
                        }')">Ver Detalhes</button>
                        <button class="btn-small btn-delete" onclick="app.deleteGroup('${
                            group.id
                        }')">Excluir</button>
                    </div>
                </div>
            `;
            })
            .join('');
    }

    updateMonthFilter() {
        const select = document.getElementById('monthFilter');
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
        this.renderServiceGroups();
        this.closeServiceGroupModal();
    }

    openServiceRecordModal(serviceGroupId, day) {
        const serviceGroup = this.serviceGroups.find((g) => g.id === serviceGroupId);
        if (!serviceGroup) return;

        this.currentServiceGroup = serviceGroup;
        this.currentServiceDay = day;
        const dayData = serviceGroup.days.find((d) => d.day === day);

        // Popular select apenas com serviços
        const serviceItemSelect = document.getElementById('serviceRecordItem');
        const serviceItems = this.items.filter(item => item.category === 'Serviços');
        
        serviceItemSelect.innerHTML =
            '<option value="">Selecione um serviço...</option>' +
            serviceItems
                .map((item) => {
                    return `<option value="${item.id}">${this.escapeHtml(item.name)}</option>`;
                })
                .join('');

        // Resetar formulário
        document.getElementById('serviceRecordForm').reset();
        
        // Atualizar exibição do dia
        const serviceDayDisplay = document.getElementById('serviceRecordDayDisplay');
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

        document.getElementById('serviceRecordModal').classList.add('active');
    }

    showDayServices(dayData) {
        const container = document.getElementById('serviceRecordModal');
        let servicesList = document.getElementById('dayServicesList');
        
        if (!servicesList) {
            servicesList = document.createElement('div');
            servicesList.id = 'dayServicesList';
            servicesList.style.cssText = 'margin-bottom: 1.5rem; padding: 1rem; background: var(--light-gray); border-radius: 5px;';
            const form = document.getElementById('serviceRecordForm');
            form.insertBefore(servicesList, form.firstChild);
        }

        servicesList.innerHTML = '<h4 style="margin-bottom: 0.75rem;">Serviços Registrados:</h4>' +
            dayData.services.map((service, index) => {
                const item = this.items.find((i) => i.id === service.itemId);
                const hours = service.hours || 0;
                const minutes = service.minutes || 0;
                const total = service.price || 0;
                
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; margin-bottom: 0.5rem; border-radius: 5px; border: 1px solid var(--border-color);">
                        <div>
                            <strong>${this.escapeHtml(this.getItemName(service.itemId))}</strong>
                            <div style="font-size: 0.85rem; color: var(--gray); margin-top: 0.25rem;">
                                ${hours}h ${minutes}min - R$ ${total.toFixed(2).replace('.', ',')}
                            </div>
                        </div>
                        <button type="button" class="btn-small btn-delete" onclick="app.deleteServiceRecord(${this.currentServiceDay}, ${index})">
                            Excluir
                        </button>
                    </div>
                `;
            }).join('');
    }

    saveServiceRecord(e) {
        e.preventDefault();

        if (!this.currentServiceGroup || !this.currentServiceDay) return;

        const itemId = document.getElementById('serviceRecordItem').value;
        const hours = parseInt(document.getElementById('serviceRecordHours').value) || 0;
        const minutes = parseInt(document.getElementById('serviceRecordMinutes').value) || 0;
        const price = this.parsePrice(document.getElementById('serviceRecordPrice').value);

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
        const serviceGroup = this.serviceGroups.find((g) => g.id === this.currentServiceGroup.id);
        if (!serviceGroup) return;

        const dayData = serviceGroup.days.find((d) => d.day === this.currentServiceDay);
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
        const viewServiceGroupModal = document.getElementById('viewServiceGroupModal');
        if (viewServiceGroupModal && viewServiceGroupModal.classList.contains('active')) {
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

        const serviceGroup = this.serviceGroups.find((g) => g.id === this.currentServiceGroup.id);
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
        document.getElementById('serviceRecordModal').classList.remove('active');
        this.currentServiceGroup = null;
        this.currentServiceDay = null;
    }

    viewServiceGroup(serviceGroupId) {
        const serviceGroup = this.serviceGroups.find((g) => g.id === serviceGroupId);
        if (!serviceGroup) return;

        this.currentServiceGroup = serviceGroup;
        this.renderServiceGroupView(serviceGroup);
        document.getElementById('viewServiceGroupModal').classList.add('active');
    }

    renderServiceGroupView(serviceGroup) {
        const [year, monthNum] = serviceGroup.month.split('-');
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        const monthName = monthNames[parseInt(monthNum) - 1];
        
        document.getElementById('serviceGroupTitle').textContent = `Serviços - ${monthName}/${year}`;

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

        document.getElementById('serviceGroupTotalHours').textContent = `${totalHours}h ${totalMinutes}min`;
        document.getElementById('serviceGroupTotalRevenue').textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;

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

        document.getElementById('serviceGroupTotalHoursAll').textContent = `${allHours}h ${allMinutes}min`;
        document.getElementById('serviceGroupTotalRevenueAll').textContent = `R$ ${allRevenue.toFixed(2).replace('.', ',')}`;

        // Renderizar dias
        const daysList = document.getElementById('serviceDaysList');
        daysList.innerHTML = serviceGroup.days.map((day) => {
            const dayServices = day.services.length;
            const dayTotal = day.services.reduce((sum, s) => sum + (s.price || 0), 0);
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
                    <button type="button" class="btn-small btn-primary" onclick="app.openServiceRecordModal('${serviceGroup.id}', ${day.day})">
                        ${dayServices > 0 ? 'Editar' : 'Registrar'}
                    </button>
                </div>
            `;
        }).join('');

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
        itemsSummaryList.innerHTML = Object.entries(itemsSummary)
            .map(([itemId, data]) => {
                const totalHours = data.hours + Math.floor(data.minutes / 60);
                const totalMinutes = data.minutes % 60;
                return `
                    <div class="summary-item">
                        <div>
                            <strong>${this.escapeHtml(data.name)}</strong>
                            <div style="font-size: 0.85rem; color: var(--gray); margin-top: 0.25rem;">
                                ${totalHours}h ${totalMinutes}min - R$ ${data.total.toFixed(2).replace('.', ',')}
                            </div>
                        </div>
                    </div>
                `;
            })
            .join('') || '<p style="text-align: center; color: var(--gray); padding: 1rem;">Nenhum serviço registrado ainda.</p>';
    }

    closeViewServiceGroupModal() {
        document.getElementById('viewServiceGroupModal').classList.remove('active');
        this.currentServiceGroup = null;
    }

    deleteServiceGroup(serviceGroupId) {
        if (confirm('Tem certeza que deseja excluir este grupo de serviços? Todos os registros serão perdidos.')) {
            this.serviceGroups = this.serviceGroups.filter((g) => g.id !== serviceGroupId);
            this.saveData();
            this.renderServiceGroups();
            this.updateServiceSummary();
        }
    }

    renderServiceGroups() {
        const list = document.getElementById('servicesList');
        if (!list) return;

        if (this.serviceGroups.length === 0) {
            list.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 2rem;">Nenhum mês de serviços cadastrado ainda.</p>';
            return;
        }

        list.innerHTML = this.serviceGroups.map((serviceGroup) => {
            const [year, monthNum] = serviceGroup.month.split('-');
            const monthNames = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
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
                        <div><strong>Total Faturado:</strong> R$ ${totalRevenue.toFixed(2).replace('.', ',')}</div>
                        <div><strong>Serviços Registrados:</strong> ${totalServices}</div>
                    </div>
                    <div class="group-actions">
                        <button class="btn-small btn-edit" onclick="app.viewServiceGroup('${serviceGroup.id}')">Ver Detalhes</button>
                        <button class="btn-small btn-delete" onclick="app.deleteServiceGroup('${serviceGroup.id}')">Excluir</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateServiceSummary() {
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
                    totalHoursDecimal += hours + (minutes / 60);
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

        const totalHoursEl = document.getElementById('servicesTotalHours');
        const avgHoursEl = document.getElementById('servicesAvgHours');
        const totalRevenueEl = document.getElementById('servicesTotalRevenue');
        const totalCountEl = document.getElementById('servicesTotalCount');
        const avgValuePerHourEl = document.getElementById('servicesAvgValuePerHour');
        const avgHoursPerServiceEl = document.getElementById('servicesAvgHoursPerService');

        if (totalHoursEl) totalHoursEl.textContent = `${totalHours}h ${totalMinutes}min`;
        if (avgHoursEl) avgHoursEl.textContent = `${avgHours}h ${avgMinutes}min`;
        if (totalRevenueEl) totalRevenueEl.textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
        if (totalCountEl) totalCountEl.textContent = totalCount;
        if (avgValuePerHourEl) avgValuePerHourEl.textContent = `R$ ${avgValuePerHour.toFixed(2).replace('.', ',')}`;
        if (avgHoursPerServiceEl) avgHoursPerServiceEl.textContent = `${avgHoursPerService}h ${avgMinutesPerService}min`;
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
        const physicalItems = this.items.filter(item => item.category !== 'Serviços');
        
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

        if (cost) {
            title.textContent = 'Editar Custo';
            document.getElementById('costItem').value = cost.itemId;
            document.getElementById('costDate').value = cost.date;
            document.getElementById('costQuantity').value = cost.quantity;
            document.getElementById('costPrice').value = cost.price;
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

        const cost = {
            id: this.currentEditingCost
                ? this.currentEditingCost.id
                : Date.now().toString(),
            itemId: itemId,
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

        if (this.costs.length === 0) {
            list.innerHTML =
                '<p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 2rem;">Nenhum custo cadastrado ainda.</p>';
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
                        }')">Excluir</button>
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
        this.closeGoalModal();
    }

    deleteGoal(goalId) {
        if (confirm('Tem certeza que deseja excluir esta meta?')) {
            this.goals = this.goals.filter((g) => g.id !== goalId);
            this.saveData();
            this.renderGoals();
        }
    }

    getMonthSales(month) {
        const group = this.groups.find((g) => g.month === month);
        if (!group) return 0;

        let total = 0;
        group.days.forEach((day) => {
            day.sales.forEach((sale) => {
                total += sale.price * sale.quantity;
            });
        });
        return total;
    }

    renderGoals() {
        const list = document.getElementById('goalsList');
        const currentMonthGoalEl = document.getElementById('currentMonthGoal');
        const currentMonthSalesEl =
            document.getElementById('currentMonthSales');
        const goalProgressEl = document.getElementById('goalProgress');
        const goalStatusEl = document.getElementById('goalStatus');
        const goalProgressItem = document.getElementById('goalProgressItem');
        const goalStatusItem = document.getElementById('goalStatusItem');

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

        if (this.goals.length === 0) {
            list.innerHTML =
                '<p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 2rem;">Nenhuma meta cadastrada ainda.</p>';
            return;
        }

        // Ordenar por mês (mais recente primeiro)
        const sortedGoals = [...this.goals].sort((a, b) =>
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

                return `
                <div class="goal-card">
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
                        }')">Excluir</button>
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

        // Obter últimos 6 meses de metas
        const now = new Date();
        const months = [];
        const goalsData = [];
        const salesData = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            
            months.push(`${monthNames[date.getMonth()]}/${String(date.getFullYear()).slice(-2)}`);
            
            const goal = this.goals.find(g => g.month === monthKey);
            const sales = this.getMonthSales(monthKey);
            
            goalsData.push(goal ? goal.amount : 0);
            salesData.push(sales);
        }

        // Destruir gráfico anterior se existir
        if (this.goalsChart) {
            this.goalsChart.destroy();
        }

        // Obter cor primária do tema
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#dc3545';

        // Criar novo gráfico
        this.goalsChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Meta',
                        data: goalsData,
                        backgroundColor: primaryColor.replace('rgb', 'rgba').replace(')', ', 0.6)'),
                        borderColor: primaryColor,
                        borderWidth: 2
                    },
                    {
                        label: 'Vendas',
                        data: salesData,
                        backgroundColor: '#28a745',
                        borderColor: '#28a745',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': R$ ' + context.parsed.y.toFixed(2).replace('.', ',');
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(0);
                            },
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
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
                    const item = this.items.find(i => i.id === itemId);
                    if (item && item.category === 'Roupas' && item.size) {
                        const sku = this.getSKU(itemId, item.size);
                        if (!skuStock[sku]) {
                            skuStock[sku] = {
                                itemId: itemId,
                                size: item.size,
                                stockValues: [],
                                sold: 0
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
                                sold: 0
                            };
                        }
                        skuStock[sku].stockValues.push(day.stock[itemId] || 0);
                    }
                });

                // Processar vendas por SKU
                day.sales.forEach((sale) => {
                    const item = this.items.find(i => i.id === sale.itemId);
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
                const avgStock = data.stockValues.length > 0
                    ? data.stockValues.reduce((sum, val) => sum + val, 0) / data.stockValues.length
                    : 0;
                
                if (!stockByMonth[monthKey][sku]) {
                    stockByMonth[monthKey][sku] = {
                        itemId: data.itemId,
                        size: data.size,
                        avgStock: 0,
                        totalSold: 0
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
        const avgStockData = months.map(month => {
            const skus = Object.values(stockByMonth[month]);
            const totalAvg = skus.reduce((sum, sku) => sum + sku.avgStock, 0);
            return totalAvg;
        });

        // Formatar labels dos meses
        const monthLabels = months.map(month => {
            const [year, monthNum] = month.split('-');
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            return `${monthNames[parseInt(monthNum) - 1]}/${year.slice(-2)}`;
        });

        // Destruir gráfico anterior se existir
        if (this.avgStockChart) {
            this.avgStockChart.destroy();
        }

        // Obter cor primária do tema
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#dc3545';

        // Criar novo gráfico
        this.avgStockChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Média de Estoque',
                    data: avgStockData,
                    borderColor: primaryColor,
                    backgroundColor: primaryColor.replace('rgb', 'rgba').replace(')', ', 0.1)'),
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 10,
                        titleFont: {
                            size: 12
                        },
                        bodyFont: {
                            size: 11
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
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
                const item = this.items.find(i => i.id === data.itemId);
                if (!item || item.category === 'Serviços') return;

                // Calcular taxa de venda mensal
                const monthlySales = data.totalSold;
                const avgStock = data.avgStock;
                
                // Sugerir reposição se:
                // 1. Estoque médio é baixo (< 5 unidades) OU
                // 2. Taxa de venda é alta (> 3 unidades/mês) e estoque está abaixo da média de vendas
                if (avgStock < 5 || (monthlySales > 3 && avgStock < monthlySales * 1.5)) {
                    const itemName = this.getItemName(data.itemId);
                    const priority = avgStock < 3 ? 'high' : (avgStock < 5 ? 'medium' : 'low');
                    const suggestedQty = Math.max(monthlySales * 2, 10); // Sugerir pelo menos 2x a venda mensal ou 10 unidades

                    suggestions.push({
                        itemName: itemName,
                        sku: sku,
                        currentStock: avgStock,
                        monthlySales: monthlySales,
                        suggestedQty: suggestedQty,
                        priority: priority,
                        month: month
                    });
                }
            });
        });

        // Ordenar por prioridade e estoque atual
        suggestions.sort((a, b) => {
            if (a.priority !== b.priority) {
                const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return a.currentStock - b.currentStock;
        });

        // Limitar a 10 sugestões
        const topSuggestions = suggestions.slice(0, 10);

        if (topSuggestions.length === 0) {
            container.innerHTML = '<p style="color: var(--gray-500); font-size: 0.9rem; text-align: center; padding: 1rem;">Nenhuma sugestão de reposição no momento.</p>';
            return;
        }

        container.innerHTML = topSuggestions.map(suggestion => {
            const priorityColor = suggestion.priority === 'high' ? '#dc3545' : 
                                 suggestion.priority === 'medium' ? '#ffc107' : '#28a745';
            const priorityText = suggestion.priority === 'high' ? 'Urgente' : 
                                suggestion.priority === 'medium' ? 'Atenção' : 'Sugestão';
            
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; margin-bottom: 0.5rem; border-radius: 5px; border-left: 3px solid ${priorityColor};">
                    <div style="flex: 1;">
                        <strong style="font-size: 0.9rem;">${this.escapeHtml(suggestion.itemName)}</strong>
                        <div style="font-size: 0.75rem; color: var(--gray-600); margin-top: 0.25rem;">
                            Estoque atual: ${suggestion.currentStock} un. | Vendas/mês: ${suggestion.monthlySales} un.
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.75rem; color: ${priorityColor}; font-weight: 600; margin-bottom: 0.25rem;">${priorityText}</div>
                        <div style="font-size: 0.85rem; color: var(--gray-700);">Sugerido: ${suggestion.suggestedQty} un.</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ========== UTILITÁRIOS ==========

    toggleDashboard() {
        // Verificar qual dashboard está atualmente visível
        const salesDashboard = document.getElementById('dashboardTab');
        const servicesDashboard = document.getElementById('servicesDashboardTab');
        const isSalesActive = salesDashboard && salesDashboard.classList.contains('active');
        const isServicesActive = servicesDashboard && servicesDashboard.classList.contains('active');
        
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
            .forEach((content) => content.classList.remove('active'));

        // Adicionar active ao botão da aba selecionada
        const tabBtn = document.querySelector(`[data-tab="${tab}"]`);
        if (tabBtn) {
            tabBtn.classList.add('active');
        } else {
            // Se não encontrar pelo data-tab, tentar pelo ID (para dashboard toggle)
            if (tab === 'dashboard' || tab === 'servicesDashboard') {
                const dashboardBtn = document.getElementById('dashboardToggleBtn');
                if (dashboardBtn) {
                    dashboardBtn.classList.add('active');
                }
            } else {
                console.warn(
                    `⚠️ [SWITCH TAB] Botão da aba "${tab}" não encontrado`
                );
            }
        }

        // Adicionar active ao conteúdo da aba selecionada
        let tabContent = document.getElementById(`${tab}Tab`);
        
        // Se não encontrar, pode ser que o tab seja 'servicesDashboard' mas o ID seja diferente
        if (!tabContent && tab === 'servicesDashboard') {
            tabContent = document.getElementById('servicesDashboardTab');
        }
        
        if (tabContent) {
            tabContent.classList.add('active');
        } else {
            console.warn(
                `⚠️ [SWITCH TAB] Conteúdo da aba "${tab}Tab" não encontrado`
            );
            console.warn(`⚠️ [SWITCH TAB] Tentando encontrar elemento com ID: ${tab}Tab`);
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

        // Se for a aba services, renderizar os serviços
        if (tab === 'services') {
            this.renderServiceGroups();
            this.updateServiceSummary();
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
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        if (!hasSeenTutorial) {
            // Aguardar um pouco para a página carregar completamente
            setTimeout(() => {
                this.openTutorialModal();
            }, 2000);
        }
    }

    openTutorialModal() {
        const modal = document.getElementById('tutorialModal');
        if (!modal) return;

        const content = document.getElementById('tutorialContent');
        if (content) {
            content.innerHTML = `
                <div style="line-height: 1.8; color: var(--gray-700);">
                    <h3 style="color: var(--primary-color); margin-bottom: 1rem;">Bem-vindo ao Sistema de Gestão Financeira!</h3>
                    
                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">📦 Cadastro de Produtos</h4>
                        <p>Cadastre seus produtos (Roupas, Eletrônicos ou Serviços) através do botão "Novo Produto". Para produtos físicos, você pode gerar um QR Code único para cada item.</p>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">📱 QR Code - Como usar</h4>
                        <p><strong>1. Cadastrar QR Code de um produto:</strong></p>
                        <ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
                            <li>Cadastre um produto (Roupas ou Eletrônicos)</li>
                            <li>Após salvar, o QR Code será gerado automaticamente</li>
                            <li>Clique em "QR Code" no card do produto para visualizar, baixar ou imprimir</li>
                        </ul>
                        <p><strong>2. Realizar leitura do QR Code:</strong></p>
                        <ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
                            <li>Vá em "Grupos Mensais" e abra um mês</li>
                            <li>Clique em "Adicionar Venda" em um dia</li>
                            <li>Clique no botão de QR Code ao lado do campo "Item"</li>
                            <li>Permita o acesso à câmera quando solicitado</li>
                            <li>Aponte a câmera para o QR Code do produto</li>
                            <li>O produto será selecionado automaticamente</li>
                        </ul>
                        <p><strong>3. Como a leitura impacta o sistema:</strong></p>
                        <ul style="margin-left: 1.5rem;">
                            <li>O produto é identificado automaticamente</li>
                            <li>O estoque é atualizado automaticamente quando você registra a venda</li>
                            <li>As estatísticas de vendas são atualizadas em tempo real</li>
                            <li>Facilita o controle de estoque e vendas</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">📊 Grupos Mensais</h4>
                        <p>Crie grupos mensais para organizar suas vendas por mês. Cada grupo permite registrar vendas por dia, gerenciar estoque e visualizar estatísticas do período.</p>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">💼 Serviços</h4>
                        <p>Cadastre serviços (aulas, consultorias, etc.) e registre as horas trabalhadas por mês. O sistema calcula automaticamente o faturamento e estatísticas de serviços.</p>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">📈 Dashboards</h4>
                        <p>Visualize gráficos e estatísticas de vendas e serviços. Use os filtros para analisar diferentes períodos.</p>
                    </div>

                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">🎯 Metas</h4>
                        <p>Defina metas mensais de vendas e acompanhe seu progresso em tempo real.</p>
                    </div>

                    <div style="background: #e7f3ff; padding: 1rem; border-radius: 5px; border-left: 3px solid #007bff;">
                        <p style="margin: 0;"><strong>💡 Dica:</strong> Use o botão "Iniciar Tutorial Interativo" abaixo para ver um guia passo a passo com balões explicativos em cada funcionalidade!</p>
                    </div>
                </div>
            `;
        }

        modal.classList.add('active');
    }

    closeTutorialModal() {
        const modal = document.getElementById('tutorialModal');
        if (modal) {
            modal.classList.remove('active');
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
            alert('🎉 Tutorial concluído! Você já conhece as principais funcionalidades do sistema.');
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
                content: 'Este é um tutorial interativo que vai te mostrar as principais funcionalidades do sistema. Clique em "Próximo" para continuar.',
                target: null,
                position: 'center'
            },
            {
                title: 'Cadastro de Produtos',
                content: 'Clique em "Novo Produto" para cadastrar seus itens. Você pode cadastrar Roupas, Eletrônicos ou Serviços. Para produtos físicos, um QR Code será gerado automaticamente.',
                target: 'newItemBtn',
                position: 'bottom'
            },
            {
                title: 'QR Code - Cadastro',
                content: 'Após cadastrar um produto físico, você verá um botão "QR Code" no card. Clique nele para visualizar, baixar ou imprimir o QR Code do produto.',
                target: null,
                position: 'center'
            },
            {
                title: 'Grupos Mensais',
                content: 'Use "Grupo Mensal" para criar um mês de vendas. Depois, abra o mês para registrar vendas por dia.',
                target: 'newGroupBtn',
                position: 'bottom'
            },
            {
                title: 'QR Code - Leitura',
                content: 'Ao adicionar uma venda, clique no botão de QR Code ao lado do campo "Item" para escanear o código do produto. Isso seleciona automaticamente o produto e atualiza o estoque.',
                target: null,
                position: 'center'
            },
            {
                title: 'Dashboard',
                content: 'Visualize gráficos e estatísticas de vendas no Dashboard. Use o botão para alternar entre Dashboard de Vendas e Dashboard de Serviços.',
                target: 'dashboardToggleBtn',
                position: 'bottom'
            },
            {
                title: 'Serviços',
                content: 'Na aba "Serviços", você pode cadastrar meses de serviços e registrar horas trabalhadas. Ideal para profissionais que vendem serviços.',
                target: null,
                position: 'center'
            },
            {
                title: 'Metas',
                content: 'Defina metas mensais de vendas na aba "Metas" e acompanhe seu progresso em tempo real.',
                target: null,
                position: 'center'
            }
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
                        left = rect.left + (rect.width / 2) - 175; // 175 = metade da largura do tooltip
                        break;
                    case 'top':
                        top = rect.top - 200;
                        left = rect.left + (rect.width / 2) - 175;
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
                tooltip.style.top = (window.innerHeight / 2 - 100) + 'px';
                tooltip.style.left = (window.innerWidth / 2 - 175) + 'px';
            }
        } else {
            // Centralizar se não houver target
            tooltip.style.top = (window.innerHeight / 2 - 100) + 'px';
            tooltip.style.left = (window.innerWidth / 2 - 175) + 'px';
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
        ).textContent = `Gerenciar Estoque - ${
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
        const physicalItems = this.items.filter(item => item.category !== 'Serviços');
        
        if (physicalItems.length === 0) {
            stockItemsList.innerHTML =
                '<p style="text-align: center; color: var(--gray); padding: 1rem;">Nenhum produto físico cadastrado.</p>';
            return;
        }

        stockItemsList.innerHTML = physicalItems
            .map((item) => {
                const stockQuantity = dayData.stock[item.id] || 0;
                const soldQuantity = dayData.sales
                    .filter((sale) => sale.itemId === item.id)
                    .reduce((sum, sale) => sum + sale.quantity, 0);
                const availableStock = stockQuantity - soldQuantity;

                return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: white; margin-bottom: 0.5rem; border-radius: 5px; border: 1px solid var(--border-color);">
                    <div style="flex: 1;">
                        <strong>${this.escapeHtml(
                            item.name
                        )}</strong> - ${this.escapeHtml(item.brand)}
                        <div style="font-size: 0.85rem; color: var(--gray); margin-top: 0.25rem;">
                            Estoque: ${stockQuantity} un. | Vendido: ${soldQuantity} un. | Disponível: ${availableStock} un.
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <input 
                            type="number" 
                            id="stock_${item.id}" 
                            value="${stockQuantity}" 
                            min="0" 
                            style="width: 80px; padding: 0.5rem; border: 2px solid var(--border-color); border-radius: 5px;"
                            placeholder="0"
                        />
                        <span style="font-size: 0.9rem; color: var(--gray);">un.</span>
                    </div>
                </div>
            `;
            })
            .join('');
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

        // Salvar estoque de cada item
        this.items.forEach((item) => {
            const input = document.getElementById(`stock_${item.id}`);
            if (input) {
                const quantity = parseInt(input.value) || 0;
                if (quantity >= 0) {
                    dayData.stock[item.id] = quantity;
                }
            }
        });

        this.saveData();
        this.updateStockItemsList();
        this.renderGroupView(this.currentGroup);

        alert('Estoque salvo com sucesso!');
    }

    closeViewGroupModal() {
        document.getElementById('viewGroupModal').classList.remove('active');
        this.currentGroup = null;
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
                    monthlyData[key].value += sale.price * sale.quantity;
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
                    monthlyData[key].profit += sale.price * sale.quantity;
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
                    monthlyData[key].sales += sale.price * sale.quantity;
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
                    monthlyTotals[key] += sale.price * sale.quantity;
                    totalSales += sale.price * sale.quantity;
                });
            });
        });

        const avgMonthly = monthCount > 0 ? totalSales / monthCount : 0;
        const avgEl = document.getElementById('avgMonthlySales');
        if (avgEl) {
            avgEl.textContent = `R$ ${avgMonthly.toFixed(2).replace('.', ',')}`;
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
            marginEl.textContent = `${profitMargin.toFixed(1)}%`;
        }

        // Total de itens
        const itemsEl = document.getElementById('totalItemsCount');
        if (itemsEl) {
            itemsEl.textContent = this.items.length;
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
            
            // Alerta de estoque baixo (menos de 5 unidades ou negativo)
            if (available <= 5 && item) {
                lowStockItems.push({
                    name: this.getItemName(itemId),
                    available: available,
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

        const groupStockAvailableEl = document.getElementById('groupStockAvailable');
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
        const groupLowStockAlertEl = document.getElementById('groupLowStockAlert');
        const groupLowStockItemsEl = document.getElementById('groupLowStockItems');
        if (groupLowStockAlertEl && groupLowStockItemsEl) {
            if (lowStockItems.length > 0) {
                groupLowStockAlertEl.style.display = 'block';
                groupLowStockItemsEl.innerHTML = lowStockItems
                    .map(
                        (item) =>
                            `<strong>${this.escapeHtml(item.name)}</strong>: ${item.available} un.`
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
            console.warn('⚠️ [CHART] Canvas stockConsumptionChart não encontrado');
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

    // ========== GERENCIAMENTO DE TEMA ==========

    loadTheme() {
        const savedTheme = localStorage.getItem('appTheme');
        if (savedTheme === 'blue') {
            document.body.classList.add('theme-blue');
            this.updateThemeColor('#007bff');
        } else {
            document.body.classList.remove('theme-blue');
            this.updateThemeColor('#dc3545');
        }
    }

    toggleTheme() {
        const isBlue = document.body.classList.contains('theme-blue');
        if (isBlue) {
            document.body.classList.remove('theme-blue');
            localStorage.setItem('appTheme', 'red');
            this.updateThemeColor('#dc3545');
        } else {
            document.body.classList.add('theme-blue');
            localStorage.setItem('appTheme', 'blue');
            this.updateThemeColor('#007bff');
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
            console.warn('⚠️ [SERVICES DASHBOARD] Chart.js não está carregado, aguardando...');
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
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
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
                datasets: [{
                    label: 'Horas Trabalhadas',
                    data: hours,
                    backgroundColor: 'rgba(40, 167, 69, 0.6)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1) + 'h';
                            }
                        }
                    }
                }
            }
        });
    }

    renderRevenueByMonthChart(groups) {
        const ctx = document.getElementById('revenueByMonthChart');
        if (!ctx) return;

        const months = [];
        const revenues = [];

        groups.forEach((group) => {
            const [year, monthNum] = group.month.split('-');
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
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
                datasets: [{
                    label: 'Faturamento (R$)',
                    data: revenues,
                    borderColor: 'rgba(0, 123, 255, 1)',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2).replace('.', ',');
                            }
                        }
                    }
                }
            }
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
                            name: this.getItemName(service.itemId)
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
            data.name.length > 15 ? data.name.substring(0, 15) + '...' : data.name
        );
        const counts = sortedServices.map(([id, data]) => data.count);

        if (this.servicesCharts.topServices) {
            this.servicesCharts.topServices.destroy();
        }

        this.servicesCharts.topServices = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
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
                        'rgba(233, 30, 99, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    renderHoursEvolutionChart(groups) {
        const ctx = document.getElementById('hoursEvolutionChart');
        if (!ctx) return;

        const months = [];
        const hours = [];

        groups.forEach((group) => {
            const [year, monthNum] = group.month.split('-');
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
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
                datasets: [{
                    label: 'Horas Trabalhadas',
                    data: hours,
                    borderColor: 'rgba(40, 167, 69, 1)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1) + 'h';
                            }
                        }
                    }
                }
            }
        });
    }

    renderAvgHoursPerDayChart(groups) {
        const ctx = document.getElementById('avgHoursPerDayChart');
        if (!ctx) return;

        const months = [];
        const avgHours = [];

        groups.forEach((group) => {
            const [year, monthNum] = group.month.split('-');
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
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
                const totalHoursDecimal = totalHours + (totalMinutes / 60);
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
                datasets: [{
                    label: 'Média de Horas por Dia',
                    data: avgHours,
                    backgroundColor: 'rgba(255, 193, 7, 0.6)',
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1) + 'h';
                            }
                        }
                    }
                }
            }
        });
    }

    renderAvgValuePerHourChart(groups) {
        const ctx = document.getElementById('avgValuePerHourChart');
        if (!ctx) return;

        const months = [];
        const avgValues = [];

        groups.forEach((group) => {
            const [year, monthNum] = group.month.split('-');
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
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

            const totalHoursDecimal = totalHours + (totalMinutes / 60);
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
                datasets: [{
                    label: 'Valor Médio por Hora (R$)',
                    data: avgValues,
                    borderColor: 'rgba(111, 66, 193, 1)',
                    backgroundColor: 'rgba(111, 66, 193, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2).replace('.', ',');
                            }
                        }
                    }
                }
            }
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
            const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            monthStats.push({
                month: `${monthNames[parseInt(monthNum) - 1]}/${year}`,
                hours: monthHours + (monthMinutes / 60),
                revenue: monthRevenue
            });
        });

        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;

        const monthCount = groups.length;
        const avgHours = monthCount > 0 ? (totalHours + (totalMinutes / 60)) / monthCount : 0;
        const avgHoursInt = Math.floor(avgHours);
        const avgMinutesInt = Math.floor((avgHours - avgHoursInt) * 60);

        const avgRevenue = monthCount > 0 ? totalRevenue / monthCount : 0;

        const bestMonthHours = monthStats.length > 0 
            ? monthStats.reduce((best, current) => current.hours > best.hours ? current : best, monthStats[0])
            : null;

        const bestMonthRevenue = monthStats.length > 0
            ? monthStats.reduce((best, current) => current.revenue > best.revenue ? current : best, monthStats[0])
            : null;

        const totalHoursDecimal = totalHours + (totalMinutes / 60);
        const avgValuePerHour = totalHoursDecimal > 0 ? totalRevenue / totalHoursDecimal : 0;

        // Atualizar elementos
        const avgMonthlyHoursEl = document.getElementById('servicesAvgMonthlyHours');
        const bestMonthHoursEl = document.getElementById('servicesBestMonthHours');
        const avgMonthlyRevenueEl = document.getElementById('servicesAvgMonthlyRevenue');
        const bestMonthRevenueEl = document.getElementById('servicesBestMonthRevenue');
        const avgValuePerHourEl = document.getElementById('servicesAvgValuePerHour');
        const totalServicesEl = document.getElementById('servicesTotalServices');

        if (avgMonthlyHoursEl) {
            avgMonthlyHoursEl.textContent = `${avgHoursInt}h ${avgMinutesInt}min`;
        }
        if (bestMonthHoursEl) {
            bestMonthHoursEl.textContent = bestMonthHours ? bestMonthHours.month : '-';
        }
        if (avgMonthlyRevenueEl) {
            avgMonthlyRevenueEl.textContent = `R$ ${avgRevenue.toFixed(2).replace('.', ',')}`;
        }
        if (bestMonthRevenueEl) {
            bestMonthRevenueEl.textContent = bestMonthRevenue ? bestMonthRevenue.month : '-';
        }
        if (avgValuePerHourEl) {
            avgValuePerHourEl.textContent = `R$ ${avgValuePerHour.toFixed(2).replace('.', ',')}`;
        }
        if (totalServicesEl) {
            totalServicesEl.textContent = totalServices;
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

        const data = {
            items: this.items,
            groups: this.groups,
            serviceGroups: this.serviceGroups || [], // Grupos mensais de serviços
            costs: this.costs,
            goals: this.goals,
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
            const response = await fetch('/api/save', {
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
                const response = await fetch(
                    `/api/load?username=${encodeURIComponent(username)}`
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
                        (cloudData.serviceGroups && cloudData.serviceGroups.length > 0) ||
                        (cloudData.costs && cloudData.costs.length > 0) ||
                        (cloudData.goals && cloudData.goals.length > 0);

                    if (hasData) {
                        // Dados da nuvem encontrados
                        this.items = cloudData.items || [];
                        this.groups = cloudData.groups || [];
                        this.serviceGroups = cloudData.serviceGroups || [];
                        this.costs = cloudData.costs || [];
                        this.goals = cloudData.goals || [];

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
                            `📊 [LOAD DATA] Items: ${this.items.length} | Grupos: ${this.groups.length} | Custos: ${this.costs.length} | Metas: ${this.goals.length}`
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

        alert('Dados exportados com sucesso!');
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
