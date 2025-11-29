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
        this.completedSales = []; // Vendas concluídas com dados completos
        this.pendingOrders = []; // Pedidos pendentes
        this.serviceAppointments = []; // Agendamentos de serviços
        this.currentEditingItem = null;
        this.currentGroup = null;
        this.currentServiceGroup = null;
        this.currentServiceDay = null;
        this.currentSaleDay = null;
        this.currentEditingCost = null;
        this.currentEditingGoal = null;
        this.currentQRScanner = null; // Scanner de QR code
        this.currentEditingPendingOrder = null; // Pedido pendente sendo editado
        this.currentEditingServiceAppointment = null; // Agendamento sendo editado
        this.currentDashboardType = 'sales'; // 'sales' ou 'services'
        this.avgStockChart = null; // Gráfico de média de estoque
        this.goalsChart = null; // Gráfico de metas
        this.costsChart = null; // Gráfico de custos
        this.servicesChart = null; // Gráfico de serviços
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
                    adminTabBtn.style.display = 'flex';
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

            // Event listeners (deve ser chamado primeiro)
            this.setupEventListeners();

            // Garantir que o painel de vendas seja ativado por padrão (apenas para usuários normais)
            if (username !== 'admin') {
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

            // Carregar dados apenas para usuários normais (não admin)
            if (username !== 'admin') {
                // Carregar dados (assíncrono)
                this.loadData().then(() => {
                    // Renderizar após carregar dados
                    this.renderGroups();
                    this.renderItems();
                    this.renderPendingOrders();
                    // Renderizar carrossel APÓS carregar dados com um pequeno delay para garantir que o DOM está pronto
                    setTimeout(() => {
                        this.renderLastReceiptsCarousel();
                    }, 200);
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

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
            console.log('✅ [APP.JS] Listener anexado ao exportBtn');
        } else {
            console.error('❌ [APP.JS] exportBtn não encontrado!');
        }

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
            closeTutorialBtn.addEventListener('click', () =>
                this.closeTutorialModal()
            );
        }
        if (startTutorialBtn) {
            startTutorialBtn.addEventListener('click', () =>
                this.startInteractiveTutorial()
            );
        }
        if (tutorialModalClose) {
            tutorialModalClose.addEventListener('click', () =>
                this.closeTutorialModal()
            );
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

    // ========== GESTÃO DE ITENS ==========

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

        // Desabilitar botão e mostrar loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
        }

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
        if (this.currentEditingItem && this.currentEditingItem.qrCodeNumber) {
            // Manter código existente ao editar
            item.qrCodeNumber = this.currentEditingItem.qrCodeNumber;
        } else {
            // Gerar novo código ao criar
            item.qrCodeNumber = this.generateQRCodeNumber();
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

        // Reabilitar botão
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }

        this.saveData();
        this.renderItems();
        this.closeItemModal();

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
        // Remover mensagens anteriores
        const existingError = document.querySelector('.error-message');
        const existingSuccess = document.querySelector('.success-message');
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();

        // Criar nova mensagem de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message show';
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('aria-live', 'polite');

        // Inserir no início do formulário ativo
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            const form = activeModal.querySelector('form');
            if (form) {
                form.insertBefore(errorDiv, form.firstChild);
                // Remover após 5 segundos
                setTimeout(() => {
                    errorDiv.classList.remove('show');
                    setTimeout(() => errorDiv.remove(), 300);
                }, 5000);
            }
        } else {
            // Se não houver modal, usar alert como fallback
            alert(message);
        }
    }

    showSuccess(message) {
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
        let code = '';
        const digits = '123456789';

        // Gerar código de 9 dígitos
        for (let i = 0; i < 9; i++) {
            code += digits.charAt(Math.floor(Math.random() * digits.length));
        }

        // Verificar se o código já existe (muito improvável, mas por segurança)
        const existingItem = this.items.find(
            (item) => item.qrCodeNumber === code
        );
        if (existingItem) {
            // Se existir, gerar novamente (recursão com limite)
            return this.generateQRCodeNumber();
        }

        return code;
    }

    generateQRCode(itemId) {
        if (!window.QRCode) {
            console.error('Biblioteca QRCode não carregada');
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

        QRCode.toCanvas(
            canvas,
            qrData,
            {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            },
            (error) => {
                if (error) {
                    console.error('Erro ao gerar QR code:', error);
                    alert('Erro ao gerar QR code');
                } else {
                    section.style.display = 'block';
                }
            }
        );
    }

    generateQRCodeForModal(itemId, canvasId) {
        if (!window.QRCode) {
            console.error('Biblioteca QRCode não carregada');
            return;
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Buscar o item para obter o código numérico
        const item = this.items.find((i) => i.id === itemId);
        if (!item || !item.qrCodeNumber) {
            console.error('Item não encontrado ou sem código QR');
            return;
        }

        // Usar o código numérico no QR Code
        const qrData = item.qrCodeNumber;

        // Limpar canvas antes de gerar novo QR code
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        QRCode.toCanvas(
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
                    console.log('QR code gerado com sucesso para modal:', qrData);
                }
            }
        );
    }

    showQRCodeModal(itemId) {
        const item = this.items.find((i) => i.id === itemId);
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
                alert('Erro: Não foi possível identificar o item para gerar o QR code.');
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
            alert('Erro ao baixar QR code. Tente novamente.');
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

        // Buscar item pelo código numérico QR (prioridade)
        let item = this.items.find((i) => i.qrCodeNumber === cleanData);

        // Se não encontrar pelo código numérico, tentar compatibilidade com formato antigo
        if (!item) {
            let itemId = null;

            if (cleanData.startsWith('ITEM:')) {
                itemId = cleanData.replace('ITEM:', '');
            } else {
                // Tentar como ID direto (compatibilidade com QR codes antigos)
                itemId = cleanData;
            }

            item = this.items.find((i) => i.id === itemId);
        }

        if (item) {
            const itemId = item.id;
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
                saleDayInfo.innerHTML = `<strong style="color: white;">✓ Produto selecionado: ${this.getItemName(
                    itemId
                )}</strong>`;
                setTimeout(() => {
                    saleDayInfo.style.background = originalBg;
                    saleDayInfo.innerHTML = `<strong>Dia: <span id="saleDayDisplay">${
                        this.currentSaleDay || '-'
                    }</span></strong>`;
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
                        item.color.toLowerCase().includes(search))
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
        this.updateYearFilter();
        this.closeGroupModal();
        alert('Grupo mensal criado com sucesso!');
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
            alert('Erro: Formulário incompleto. Por favor, recarregue a página.');
            // Remover loading se houver
            if (saveBtn) {
                saveBtn.classList.remove('loading');
                saveBtn.disabled = false;
            }
            return;
        }

        const itemId = saleItem.value;
        const quantity = parseInt(saleQuantity.value);
        const price = this.parsePrice(salePrice.value);
        const saleSizeInput = document.getElementById('saleSize');
        const saleColorInput = document.getElementById('saleColor');
        const size = (saleSizeInput && saleSizeInput.value) ? saleSizeInput.value.trim() : '';
        const color = (saleColorInput && saleColorInput.value) ? saleColorInput.value.trim() : '';

        if (!itemId) {
            alert('Por favor, selecione um item.');
            // Remover loading se houver
            if (saveBtn) {
                saveBtn.classList.remove('loading');
                saveBtn.disabled = false;
            }
            return;
        }

        if (price <= 0 || quantity <= 0) {
            alert('Preço e quantidade devem ser maiores que zero.');
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
            alert(`Por favor, informe o tamanho do ${item.category === 'Roupas' ? 'roupa' : 'eletrônico'}.`);
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
            alert('Por favor, informe o nome do cliente.');
            // Remover loading se houver
            if (saveBtn) {
                saveBtn.classList.remove('loading');
                saveBtn.disabled = false;
            }
            return;
        }

        // Adicionar venda ao grupo (compatibilidade)
        const sale = {
            itemId: itemId,
            quantity: quantity,
            price: price,
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
        const totalValue = price * quantity;
        const now = new Date();

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
                    price: price,
                    size: (item && (item.category === 'Roupas' || item.category === 'Eletrônicos') && size) ? size : undefined,
                    color: (item && (item.category === 'Roupas' || item.category === 'Eletrônicos') && color) ? color : undefined,
                },
            ],
            totalValue: totalValue,
            date: now.toISOString(),
            timestamp: now.getTime(),
            groupId: group.id,
            groupMonth: group.month,
            day: this.currentSaleDay,
        };

        // Adicionar à lista de vendas concluídas
        this.completedSales.push(completedSale);

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
        // Usar container fornecido ou buscar o carrossel fixo
        const carousel = container || document.getElementById('lastReceiptsCarousel');
        if (!carousel) {
            console.warn('⚠️ [CARROSSEL] Container do carrossel não encontrado. Tentando novamente em 500ms...');
            // Tentar novamente após um delay caso o elemento ainda não esteja no DOM
            setTimeout(() => {
                const retryCarousel = document.getElementById('lastReceiptsCarousel');
                if (retryCarousel) {
                    this.renderLastReceiptsCarousel(retryCarousel);
                } else {
                    console.error('❌ [CARROSSEL] Container não encontrado após retry');
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
            alert('Por favor, informe o nome do cliente.');
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

                return `
                <div class="pending-order-card" style="background: var(--white); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; box-shadow: var(--shadow-sm);">
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
            alert('Por favor, informe o nome do cliente.');
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

        return `
            <div class="service-appointment-card" style="${cardStyle}">
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
    showSuccess(message) {
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

    showError(message) {
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
                '<p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 2rem;">' +
                (yearFilter
                    ? `Nenhum grupo encontrado para o ano ${yearFilter}.`
                    : 'Nenhum grupo mensal criado ainda.') +
                '</p>';
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
                total += sale.price * sale.quantity;
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
                '<p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 2rem;">' +
                (goalsYearFilter
                    ? `Nenhuma meta encontrada para o ano ${goalsYearFilter}.`
                    : 'Nenhuma meta cadastrada ainda.') +
                '</p>';
            return;
        }

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
        // Se mudar para a aba de vendas, renderizar o carrossel novamente
        if (tab === 'salesPanel') {
            setTimeout(() => {
                this.renderLastReceiptsCarousel();
            }, 300);
        }
        // Se mudar para a aba de administração, carregar dados do admin
        if (tab === 'adminPanel') {
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
            console.warn(
                `⚠️ [SWITCH TAB] Conteúdo da aba "${tab}Tab" não encontrado`
            );
            console.warn(
                `⚠️ [SWITCH TAB] Tentando encontrar elemento com ID: ${tab}Tab`
            );
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

    // ========== GERENCIAMENTO DE TEMA ==========

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

        const data = {
            items: this.items,
            groups: this.groups,
            serviceGroups: this.serviceGroups || [], // Grupos mensais de serviços
            costs: this.costs,
            goals: this.goals,
            completedSales: this.completedSales || [],
            pendingOrders: this.pendingOrders || [],
            serviceAppointments: this.serviceAppointments || [],
            theme: currentTheme, // Salvar tema por usuário
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
                        (cloudData.serviceGroups &&
                            cloudData.serviceGroups.length > 0) ||
                        (cloudData.costs && cloudData.costs.length > 0) ||
                        (cloudData.goals && cloudData.goals.length > 0);

                    if (hasData) {
                        // Dados da nuvem encontrados
                        this.items = cloudData.items || [];
                        this.groups = cloudData.groups || [];
                        this.serviceGroups = cloudData.serviceGroups || [];
                        this.costs = cloudData.costs || [];
                        this.goals = cloudData.goals || [];
                        this.completedSales = cloudData.completedSales || [];
                        this.pendingOrders = cloudData.pendingOrders || [];
                        this.serviceAppointments =
                            cloudData.serviceAppointments || [];

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
                this.completedSales = data.completedSales || [];
                this.pendingOrders = data.pendingOrders || [];
                this.serviceAppointments = data.serviceAppointments || [];

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
