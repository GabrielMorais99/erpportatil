// ========== APP.JS CARREGADO ==========
console.log('🟣 [APP.JS] Script carregado e executando...');

// Sistema de Gestão de Loja
class LojaApp {
    constructor() {
        this.items = [];
        this.groups = [];
        this.costs = [];
        this.currentEditingItem = null;
        this.currentGroup = null;
        this.currentSaleDay = null;
        this.currentEditingCost = null;
        
        this.init();
    }

    init() {
        console.log('🟣 [APP.JS] ========== INICIALIZANDO APLICAÇÃO ==========');
        console.log('🟣 [APP.JS] URL atual:', window.location.href);
        console.log('🟣 [APP.JS] Document readyState:', document.readyState);
        console.log('🟣 [APP.JS] SessionStorage:', {
            loggedIn: sessionStorage.getItem('loggedIn'),
            username: sessionStorage.getItem('username'),
            allKeys: Object.keys(sessionStorage)
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
        
        console.log('✅ [APP.JS] Usuário autenticado! Continuando inicialização...');
        
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
            
            // Event listeners (deve ser chamado primeiro)
            this.setupEventListeners();

            // Carregar dados (assíncrono)
            this.loadData().then(() => {
                // Renderizar após carregar dados
                this.renderItems();
                this.renderGroups();
                this.renderCosts();
                this.updateMonthFilter();
                this.updateOverallSummary();
            });

            // Renderizar imediatamente também
            this.renderItems();
            this.renderGroups();
            this.renderCosts();
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
        
        addDebugLog('Elementos encontrados: newItemBtn=' + !!newItemBtn + ', newGroupBtn=' + !!newGroupBtn + ', newCostBtn=' + !!newCostBtn + ', logoutBtn=' + !!logoutBtn);
        
        // Teste direto - verificar se os botões são clicáveis
        if (newItemBtn) {
            addDebugLog('newItemBtn type: ' + newItemBtn.type + ', disabled: ' + newItemBtn.disabled);
            addDebugLog('newItemBtn style.pointerEvents: ' + (window.getComputedStyle(newItemBtn).pointerEvents || 'auto'));
            
            // Teste de clique direto
            newItemBtn.style.cursor = 'pointer';
            newItemBtn.style.pointerEvents = 'auto';
            const self = this; // Guardar referência ao this
            
            // Teste direto - adicionar onclick também como fallback
            newItemBtn.onclick = function(e) {
                addDebugLog('newItemBtn CLICADO (onclick)!');
                e.preventDefault();
                e.stopPropagation();
                addDebugLog('Chamando openItemModal()...');
                try {
                    self.openItemModal();
                    addDebugLog('openItemModal() chamado com sucesso!');
                } catch (error) {
                    addDebugLog('ERRO ao chamar openItemModal(): ' + error.message);
                }
                return false;
            };
            
            // Também adicionar addEventListener como backup
            newItemBtn.addEventListener('click', function(e) {
                addDebugLog('newItemBtn CLICADO (addEventListener)!');
                e.preventDefault();
                e.stopPropagation();
                addDebugLog('Chamando openItemModal()...');
                try {
                    self.openItemModal();
                    addDebugLog('openItemModal() chamado com sucesso!');
                } catch (error) {
                    addDebugLog('ERRO ao chamar openItemModal(): ' + error.message);
                }
            }, true); // Usar capture phase
            
            addDebugLog('Listener anexado ao newItemBtn (onclick + addEventListener)');
        } else {
            addDebugLog('ERRO: newItemBtn não encontrado!');
        }
        
        if (newGroupBtn) {
            const self = this;
            
            newGroupBtn.onclick = function(e) {
                addDebugLog('newGroupBtn CLICADO (onclick)!');
                e.preventDefault();
                e.stopPropagation();
                addDebugLog('Chamando openGroupModal()...');
                try {
                    self.openGroupModal();
                    addDebugLog('openGroupModal() chamado com sucesso!');
                } catch (error) {
                    addDebugLog('ERRO ao chamar openGroupModal(): ' + error.message);
                }
                return false;
            };
            
            newGroupBtn.addEventListener('click', function(e) {
                addDebugLog('newGroupBtn CLICADO (addEventListener)!');
                e.preventDefault();
                e.stopPropagation();
                addDebugLog('Chamando openGroupModal()...');
                try {
                    self.openGroupModal();
                    addDebugLog('openGroupModal() chamado com sucesso!');
                } catch (error) {
                    addDebugLog('ERRO ao chamar openGroupModal(): ' + error.message);
                }
            }, true);
            
            addDebugLog('Listener anexado ao newGroupBtn (onclick + addEventListener)');
        } else {
            addDebugLog('ERRO: newGroupBtn não encontrado!');
        }
        
        if (newCostBtn) {
            const self = this;
            
            newCostBtn.onclick = function(e) {
                addDebugLog('newCostBtn CLICADO (onclick)!');
                e.preventDefault();
                e.stopPropagation();
                addDebugLog('Chamando openCostModal()...');
                try {
                    self.openCostModal();
                    addDebugLog('openCostModal() chamado com sucesso!');
                } catch (error) {
                    addDebugLog('ERRO ao chamar openCostModal(): ' + error.message);
                }
                return false;
            };
            
            newCostBtn.addEventListener('click', function(e) {
                addDebugLog('newCostBtn CLICADO (addEventListener)!');
                e.preventDefault();
                e.stopPropagation();
                addDebugLog('Chamando openCostModal()...');
                try {
                    self.openCostModal();
                    addDebugLog('openCostModal() chamado com sucesso!');
                } catch (error) {
                    addDebugLog('ERRO ao chamar openCostModal(): ' + error.message);
                }
            }, true);
            
            addDebugLog('Listener anexado ao newCostBtn (onclick + addEventListener)');
        } else {
            addDebugLog('ERRO: newCostBtn não encontrado!');
        }
        
        if (logoutBtn) {
            const self = this;
            
            logoutBtn.onclick = function(e) {
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
            
            logoutBtn.addEventListener('click', function(e) {
                addDebugLog('logoutBtn CLICADO (addEventListener)!');
                e.preventDefault();
                e.stopPropagation();
                addDebugLog('Chamando logout()...');
                try {
                    self.logout();
                    addDebugLog('logout() chamado com sucesso!');
                } catch (error) {
                    addDebugLog('ERRO ao chamar logout(): ' + error.message);
                }
            }, true);
            
            addDebugLog('Listener anexado ao logoutBtn (onclick + addEventListener)');
        } else {
            addDebugLog('ERRO: logoutBtn não encontrado!');
        }
        
        // Importar/Exportar
        const importBtn = document.getElementById('importBtn');
        const importFile = document.getElementById('importFile');
        const exportBtn = document.getElementById('exportBtn');
        
        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => {
                importFile.click();
            });
            console.log('✅ [APP.JS] Listener anexado ao importBtn');
        } else {
            console.error('❌ [APP.JS] importBtn ou importFile não encontrado!');
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

        // Tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        if (tabBtns.length > 0) {
            tabBtns.forEach(btn => {
                btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
            });
            console.log('✅ [APP.JS] Listeners anexados aos tabs (' + tabBtns.length + ' tabs)');
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
        
        if (itemForm) {
            itemForm.addEventListener('submit', (e) => this.saveItem(e));
            console.log('✅ [APP.JS] Listener anexado ao itemForm');
        } else {
            console.error('❌ [APP.JS] itemForm não encontrado!');
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeItemModal());
            console.log('✅ [APP.JS] Listener anexado ao cancelBtn');
        } else {
            console.error('❌ [APP.JS] cancelBtn não encontrado!');
        }
        
        if (itemModalClose) {
            itemModalClose.addEventListener('click', () => this.closeItemModal());
            console.log('✅ [APP.JS] Listener anexado ao itemModal .close');
        } else {
            console.error('❌ [APP.JS] itemModal .close não encontrado!');
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
            cancelGroupBtn.addEventListener('click', () => this.closeGroupModal());
            console.log('✅ [APP.JS] Listener anexado ao cancelGroupBtn');
        } else {
            console.error('❌ [APP.JS] cancelGroupBtn não encontrado!');
        }
        
        if (groupModalClose) {
            groupModalClose.addEventListener('click', () => this.closeGroupModal());
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
            cancelSaleBtn.addEventListener('click', () => this.closeSaleModal());
            console.log('✅ [APP.JS] Listener anexado ao cancelSaleBtn');
        } else {
            console.error('❌ [APP.JS] cancelSaleBtn não encontrado!');
        }
        
        if (saleModalClose) {
            saleModalClose.addEventListener('click', () => this.closeSaleModal());
            console.log('✅ [APP.JS] Listener anexado ao saleModal .close');
        } else {
            console.error('❌ [APP.JS] saleModal .close não encontrado!');
        }

        // Modal de visualização de grupo
        const viewGroupModalClose = document.querySelector('#viewGroupModal .close');
        if (viewGroupModalClose) {
            viewGroupModalClose.addEventListener('click', () => this.closeViewGroupModal());
            console.log('✅ [APP.JS] Listener anexado ao viewGroupModal .close');
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
            cancelCostBtn.addEventListener('click', () => this.closeCostModal());
            console.log('✅ [APP.JS] Listener anexado ao cancelCostBtn');
        } else {
            console.error('❌ [APP.JS] cancelCostBtn não encontrado!');
        }
        
        if (costModalClose) {
            costModalClose.addEventListener('click', () => this.closeCostModal());
            console.log('✅ [APP.JS] Listener anexado ao costModal .close');
        } else {
            console.error('❌ [APP.JS] costModal .close não encontrado!');
        }
        
        // Calcular custo total automaticamente
        if (costQuantity) {
            costQuantity.addEventListener('input', () => this.calculateCostTotal());
            console.log('✅ [APP.JS] Listener anexado ao costQuantity');
        } else {
            console.error('❌ [APP.JS] costQuantity não encontrado!');
        }
        
        if (costPrice) {
            costPrice.addEventListener('input', () => this.calculateCostTotal());
            console.log('✅ [APP.JS] Listener anexado ao costPrice');
        } else {
            console.error('❌ [APP.JS] costPrice não encontrado!');
        }

        // Fechar modais ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    // ========== GESTÃO DE ITENS ==========
    
    openItemModal(item = null) {
        this.currentEditingItem = item;
        const modal = document.getElementById('itemModal');
        const form = document.getElementById('itemForm');
        const title = document.getElementById('modalTitle');

        if (item) {
            title.textContent = 'Editar Item';
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemBrand').value = item.brand;
            document.getElementById('itemSize').value = item.size;
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemGender').value = item.gender;
        } else {
            title.textContent = 'Cadastrar Novo Item';
            form.reset();
        }

        modal.classList.add('active');
    }

    closeItemModal() {
        document.getElementById('itemModal').classList.remove('active');
        this.currentEditingItem = null;
    }

    saveItem(e) {
        e.preventDefault();

        const item = {
            id: this.currentEditingItem ? this.currentEditingItem.id : Date.now().toString(),
            name: document.getElementById('itemName').value.trim(),
            brand: document.getElementById('itemBrand').value.trim(),
            size: document.getElementById('itemSize').value.trim(),
            price: parseFloat(document.getElementById('itemPrice').value),
            gender: document.getElementById('itemGender').value
        };

        // Validações
        if (item.price <= 0) {
            alert('O preço deve ser maior que zero.');
            return;
        }

        if (this.currentEditingItem) {
            const index = this.items.findIndex(i => i.id === this.currentEditingItem.id);
            if (index !== -1) {
                this.items[index] = item;
            }
        } else {
            this.items.push(item);
        }

        this.saveData();
        this.renderItems();
        this.closeItemModal();
    }

    deleteItem(id) {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            this.items = this.items.filter(item => item.id !== id);
            // Remover vendas relacionadas
            this.groups.forEach(group => {
                group.days.forEach(day => {
                    day.sales = day.sales.filter(sale => sale.itemId !== id);
                });
            });
            this.saveData();
            this.renderItems();
            this.renderGroups();
        }
    }

    renderItems() {
        const grid = document.getElementById('itemsGrid');
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const monthFilter = document.getElementById('monthFilter').value;

        let filteredItems = this.items;

        // Filtro de pesquisa
        if (searchTerm) {
            filteredItems = filteredItems.filter(item => 
                item.name.toLowerCase().includes(searchTerm) ||
                item.brand.toLowerCase().includes(searchTerm)
            );
        }

        // Filtro por mês (itens vendidos no mês)
        if (monthFilter) {
            const [year, month] = monthFilter.split('-');
            filteredItems = filteredItems.filter(item => {
                return this.groups.some(group => {
                    if (group.month === monthFilter) {
                        return group.days.some(day => 
                            day.sales.some(sale => sale.itemId === item.id)
                        );
                    }
                    return false;
                });
            });
        }

        if (filteredItems.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 2rem;">Nenhum item encontrado.</p>';
            return;
        }

        grid.innerHTML = filteredItems.map(item => `
            <div class="item-card">
                <h3>${this.escapeHtml(item.name)}</h3>
                <div class="item-info">Marca: ${this.escapeHtml(item.brand)}</div>
                <div class="item-info">Tamanho: ${this.escapeHtml(item.size)}</div>
                <div class="item-info">Gênero: ${this.escapeHtml(item.gender)}</div>
                <div class="item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                <div class="item-actions">
                    <button class="btn-small btn-edit" onclick="app.openItemModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">Editar</button>
                    <button class="btn-small btn-delete" onclick="app.deleteItem('${item.id}')">Excluir</button>
                </div>
            </div>
        `).join('');
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

        if (this.groups.some(g => g.month === month)) {
            alert('Já existe um grupo para este mês.');
            return;
        }

        const group = {
            id: Date.now().toString(),
            month: month,
            days: []
        };

        // Criar dias do mês
        const [year, monthNum] = month.split('-');
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            group.days.push({
                day: day,
                sales: []
            });
        }

        this.groups.push(group);
        this.groups.sort((a, b) => b.month.localeCompare(a.month));
        this.saveData();
        this.renderGroups();
        this.updateMonthFilter();
        this.closeGroupModal();
    }

    viewGroup(groupId) {
        const group = this.groups.find(g => g.id === groupId);
        if (!group) return;

        this.currentGroup = group;
        const modal = document.getElementById('viewGroupModal');
        const [year, month] = group.month.split('-');
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        
        document.getElementById('groupTitle').textContent = 
            `${monthNames[parseInt(month) - 1]} ${year}`;

        this.renderGroupView(group);
        modal.classList.add('active');
    }

    calculateTotalAllMonths() {
        let totalSalesAll = 0;
        let totalValueAll = 0;

        this.groups.forEach(group => {
            group.days.forEach(day => {
                day.sales.forEach(sale => {
                    totalSalesAll += sale.quantity;
                    totalValueAll += sale.price * sale.quantity;
                });
            });
        });

        return {
            totalSales: totalSalesAll,
            totalValue: totalValueAll
        };
    }

    renderGroupView(group) {
        // Calcular totais do mês atual
        let totalSales = 0;
        let totalValue = 0;
        const itemsSummary = {};

        group.days.forEach(day => {
            day.sales.forEach(sale => {
                totalSales += sale.quantity;
                totalValue += sale.price * sale.quantity;
                
                if (!itemsSummary[sale.itemId]) {
                    itemsSummary[sale.itemId] = {
                        name: this.getItemName(sale.itemId),
                        quantity: 0,
                        total: 0
                    };
                }
                itemsSummary[sale.itemId].quantity += sale.quantity;
                itemsSummary[sale.itemId].total += sale.price * sale.quantity;
            });
        });

        // Atualizar totais do mês
        document.getElementById('totalSales').textContent = totalSales;
        document.getElementById('totalValue').textContent = 
            `R$ ${totalValue.toFixed(2).replace('.', ',')}`;

        // Calcular e atualizar totais de todos os meses
        const allMonthsTotal = this.calculateTotalAllMonths();
        document.getElementById('totalSalesAll').textContent = allMonthsTotal.totalSales;
        document.getElementById('totalValueAll').textContent = 
            `R$ ${allMonthsTotal.totalValue.toFixed(2).replace('.', ',')}`;

        // Renderizar dias
        const daysList = document.getElementById('daysList');
        daysList.innerHTML = group.days.map(day => {
            const daySales = day.sales.reduce((sum, s) => sum + s.quantity, 0);
            const dayTotal = day.sales.reduce((sum, s) => sum + (s.price * s.quantity), 0);
            
            return `
                <div class="day-card">
                    <h4>Dia ${day.day}</h4>
                    <div class="day-sales">${daySales} venda(s)</div>
                    <div class="day-total">R$ ${dayTotal.toFixed(2).replace('.', ',')}</div>
                    <button class="btn-small btn-edit" style="margin-top: 0.5rem; width: 100%;" 
                            onclick="app.openSaleModal('${group.id}', ${day.day})">
                        ${daySales > 0 ? 'Editar' : 'Registrar'}
                    </button>
                </div>
            `;
        }).join('');

        // Renderizar resumo por item
        const itemsSummaryList = document.getElementById('itemsSummary');
        const itemsArray = Object.values(itemsSummary);
        
        if (itemsArray.length === 0) {
            itemsSummaryList.innerHTML = '<p style="text-align: center; color: var(--gray);">Nenhuma venda registrada ainda.</p>';
        } else {
            itemsSummaryList.innerHTML = itemsArray.map(item => `
                <div class="summary-item">
                    <span class="summary-item-name">${this.escapeHtml(item.name)}</span>
                    <span class="summary-item-total">
                        ${item.quantity} un. - R$ ${item.total.toFixed(2).replace('.', ',')}
                    </span>
                </div>
            `).join('');
        }
    }

    openSaleModal(groupId, day) {
        // Sempre buscar o grupo atualizado do array principal
        const group = this.groups.find(g => g.id === groupId);
        if (!group) return;

        this.currentGroup = group;
        this.currentSaleDay = day;
        const dayData = group.days.find(d => d.day === day);

        // Popular select de itens
        const saleItemSelect = document.getElementById('saleItem');
        saleItemSelect.innerHTML = '<option value="">Selecione um item...</option>' +
            this.items.map(item => 
                `<option value="${item.id}">${this.escapeHtml(item.name)} - ${this.escapeHtml(item.brand)}</option>`
            ).join('');

        // Resetar formulário
        document.getElementById('saleForm').reset();
        document.getElementById('saleDate').value = day;

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
            <h4 style="color: var(--primary-red); margin-bottom: 1rem;">Vendas do Dia ${dayData.day}</h4>
            ${dayData.sales.map((sale, index) => {
                const item = this.items.find(i => i.id === sale.itemId);
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; margin-bottom: 0.5rem; border-radius: 5px; border: 1px solid var(--border-color);">
                        <div>
                            <strong>${this.escapeHtml(item ? item.name : 'Item não encontrado')}</strong><br>
                            <small style="color: var(--gray);">${sale.quantity} un. × R$ ${sale.price.toFixed(2).replace('.', ',')} = R$ ${(sale.quantity * sale.price).toFixed(2).replace('.', ',')}</small>
                        </div>
                        <button class="btn-small btn-delete" onclick="app.deleteSale(${this.currentSaleDay}, ${index})">Excluir</button>
                    </div>
                `;
            }).join('')}
        `;

        // Inserir antes do formulário
        const form = document.getElementById('saleForm');
        form.parentNode.insertBefore(salesList, form);
    }

    deleteSale(day, saleIndex) {
        // Buscar o grupo atualizado do array principal
        const group = this.groups.find(g => g.id === this.currentGroup.id);
        if (!group) return;

        const dayData = group.days.find(d => d.day === day);
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
        document.getElementById('saleModal').classList.remove('active');
        
        // Se o modal do grupo estiver aberto, atualizar o resumo
        const viewGroupModal = document.getElementById('viewGroupModal');
        if (viewGroupModal && viewGroupModal.classList.contains('active') && this.currentGroup) {
            // Buscar o grupo atualizado do array principal
            const group = this.groups.find(g => g.id === this.currentGroup.id);
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
        const quantity = parseInt(document.getElementById('saleQuantity').value);
        const price = parseFloat(document.getElementById('salePrice').value);

        if (!itemId) {
            alert('Por favor, selecione um item.');
            return;
        }

        if (price <= 0 || quantity <= 0) {
            alert('Preço e quantidade devem ser maiores que zero.');
            return;
        }

        // Buscar o grupo atualizado do array principal
        const group = this.groups.find(g => g.id === this.currentGroup.id);
        if (!group) return;

        const dayData = group.days.find(d => d.day === this.currentSaleDay);
        if (!dayData) return;

        // Adicionar venda
        dayData.sales.push({
            itemId: itemId,
            quantity: quantity,
            price: price
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
        if (confirm('Tem certeza que deseja excluir este grupo mensal? Todas as vendas serão perdidas.')) {
            this.groups = this.groups.filter(g => g.id !== groupId);
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
        const overallTotalSalesEl = document.getElementById('overallTotalSales');
        const overallTotalValueEl = document.getElementById('overallTotalValue');
        
        if (overallTotalSalesEl) {
            overallTotalSalesEl.textContent = allMonthsTotal.totalSales;
        }
        if (overallTotalValueEl) {
            overallTotalValueEl.textContent = `R$ ${allMonthsTotal.totalValue.toFixed(2).replace('.', ',')}`;
        }

        // Atualizar resumo geral completo
        this.updateOverallSummary();

        if (this.groups.length === 0) {
            list.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 2rem;">Nenhum grupo mensal criado ainda.</p>';
            return;
        }

        list.innerHTML = this.groups.map(group => {
            const [year, month] = group.month.split('-');
            const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                               'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            const monthName = monthNames[parseInt(month) - 1];

            const totalSales = group.days.reduce((sum, day) => 
                sum + day.sales.reduce((s, sale) => s + sale.quantity, 0), 0);
            const totalValue = group.days.reduce((sum, day) => 
                sum + day.sales.reduce((s, sale) => s + (sale.price * sale.quantity), 0), 0);

            return `
                <div class="group-card">
                    <h3>${monthName} ${year}</h3>
                    <div class="group-info">
                        <div><strong>Total de Vendas:</strong> ${totalSales}</div>
                        <div><strong>Valor Total:</strong> R$ ${totalValue.toFixed(2).replace('.', ',')}</div>
                    </div>
                    <div class="group-actions">
                        <button class="btn-small btn-edit" onclick="app.viewGroup('${group.id}')">Ver Detalhes</button>
                        <button class="btn-small btn-delete" onclick="app.deleteGroup('${group.id}')">Excluir</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateMonthFilter() {
        const select = document.getElementById('monthFilter');
        const currentOptions = Array.from(select.options).slice(1).map(opt => opt.value);
        
        this.groups.forEach(group => {
            if (!currentOptions.includes(group.month)) {
                const [year, month] = group.month.split('-');
                const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                const option = document.createElement('option');
                option.value = group.month;
                option.textContent = `${monthNames[parseInt(month) - 1]} ${year}`;
                select.appendChild(option);
            }
        });
    }

    // ========== CUSTOS DE COMPRA ==========

    openCostModal(cost = null) {
        this.currentEditingCost = cost;
        const modal = document.getElementById('costModal');
        const form = document.getElementById('costForm');
        const title = document.getElementById('costModalTitle');

        // Popular select de itens
        const costItemSelect = document.getElementById('costItem');
        costItemSelect.innerHTML = '<option value="">Selecione um item...</option>' +
            this.items.map(item => 
                `<option value="${item.id}">${this.escapeHtml(item.name)} - ${this.escapeHtml(item.brand)}</option>`
            ).join('');

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
            document.getElementById('costDate').value = new Date().toISOString().split('T')[0];
        }

        modal.classList.add('active');
    }

    closeCostModal() {
        document.getElementById('costModal').classList.remove('active');
        this.currentEditingCost = null;
    }

    calculateCostTotal() {
        const quantity = parseFloat(document.getElementById('costQuantity').value) || 0;
        const price = parseFloat(document.getElementById('costPrice').value) || 0;
        const total = quantity * price;
        document.getElementById('costTotal').value = total.toFixed(2);
    }

    saveCost(e) {
        e.preventDefault();

        const itemId = document.getElementById('costItem').value;
        const date = document.getElementById('costDate').value;
        const quantity = parseInt(document.getElementById('costQuantity').value);
        const price = parseFloat(document.getElementById('costPrice').value);

        if (!itemId) {
            alert('Por favor, selecione um item.');
            return;
        }

        if (price <= 0 || quantity <= 0) {
            alert('Preço e quantidade devem ser maiores que zero.');
            return;
        }

        const cost = {
            id: this.currentEditingCost ? this.currentEditingCost.id : Date.now().toString(),
            itemId: itemId,
            date: date,
            quantity: quantity,
            price: price,
            total: quantity * price
        };

        if (this.currentEditingCost) {
            const index = this.costs.findIndex(c => c.id === this.currentEditingCost.id);
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
            this.costs = this.costs.filter(c => c.id !== costId);
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
        const totalValue = this.costs.reduce((sum, cost) => sum + cost.total, 0);

        if (countEl) {
            countEl.textContent = totalCosts;
        }
        if (valueEl) {
            valueEl.textContent = `R$ ${totalValue.toFixed(2).replace('.', ',')}`;
        }

        if (this.costs.length === 0) {
            list.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--gray); padding: 2rem;">Nenhum custo cadastrado ainda.</p>';
            return;
        }

        // Ordenar por data (mais recente primeiro)
        const sortedCosts = [...this.costs].sort((a, b) => new Date(b.date) - new Date(a.date));

        list.innerHTML = sortedCosts.map(cost => {
            const item = this.items.find(i => i.id === cost.itemId);
            const dateObj = new Date(cost.date);
            const formattedDate = dateObj.toLocaleDateString('pt-BR');

            return `
                <div class="cost-card">
                    <h3>${this.escapeHtml(item ? item.name : 'Item não encontrado')}</h3>
                    <div class="cost-info"><strong>Data:</strong> ${formattedDate}</div>
                    <div class="cost-info"><strong>Quantidade:</strong> ${cost.quantity} un.</div>
                    <div class="cost-info"><strong>Custo Unitário:</strong> R$ ${cost.price.toFixed(2).replace('.', ',')}</div>
                    <div class="cost-total">Total: R$ ${cost.total.toFixed(2).replace('.', ',')}</div>
                    <div class="cost-actions">
                        <button class="btn-small btn-edit" onclick="app.openCostModal(${JSON.stringify(cost).replace(/"/g, '&quot;')})">Editar</button>
                        <button class="btn-small btn-delete" onclick="app.deleteCost('${cost.id}')">Excluir</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    calculateTotalCosts() {
        return this.costs.reduce((sum, cost) => sum + cost.total, 0);
    }

    updateOverallSummary() {
        const allMonthsTotal = this.calculateTotalAllMonths();
        const totalCosts = this.calculateTotalCosts();
        const netProfit = allMonthsTotal.totalValue - totalCosts;

        const overallTotalCostsEl = document.getElementById('overallTotalCosts');
        const overallNetProfitEl = document.getElementById('overallNetProfit');

        if (overallTotalCostsEl) {
            overallTotalCostsEl.textContent = `R$ ${totalCosts.toFixed(2).replace('.', ',')}`;
        }

        if (overallNetProfitEl) {
            overallNetProfitEl.textContent = `R$ ${netProfit.toFixed(2).replace('.', ',')}`;
            // Mudar cor se for negativo
            if (netProfit < 0) {
                overallNetProfitEl.style.color = '#dc3545';
            } else {
                overallNetProfitEl.style.color = '#155724';
            }
        }
    }

    // ========== UTILITÁRIOS ==========

    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}Tab`).classList.add('active');
        
        // Se for a aba dashboard, renderizar os gráficos
        if (tab === 'dashboard') {
            this.renderDashboard();
        }
    }

    getItemName(itemId) {
        const item = this.items.find(i => i.id === itemId);
        return item ? item.name : 'Item não encontrado';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    closeViewGroupModal() {
        document.getElementById('viewGroupModal').classList.remove('active');
        this.currentGroup = null;
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
        this.currentEditingItem = null;
        this.currentGroup = null;
        this.currentSaleDay = null;
        this.currentEditingCost = null;
    }

    // ========== DASHBOARD E GRÁFICOS ==========
    
    charts = {
        salesByMonth: null,
        profitVsCosts: null,
        topItems: null,
        profitEvolution: null
    };

    renderDashboard() {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js não está carregado!');
            return;
        }

        console.log('📊 [DASHBOARD] Renderizando dashboard...');
        console.log('📊 [DASHBOARD] Groups:', this.groups.length);
        console.log('📊 [DASHBOARD] Costs:', this.costs.length);
        console.log('📊 [DASHBOARD] Items:', this.items.length);

        // Destruir gráficos existentes
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });

        // Renderizar gráficos
        this.renderSalesByMonthChart();
        this.renderProfitVsCostsChart();
        this.renderTopItemsChart();
        this.renderProfitEvolutionChart();
        this.updateDashboardStats();
    }

    getFilteredData() {
        const period = document.getElementById('periodFilter')?.value || 'all';
        const now = new Date();
        let cutoffDate = null;

        switch(period) {
            case 'month':
                cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case '3months':
                cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case '6months':
                cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                break;
            case 'year':
                cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
        }

        let filteredGroups = this.groups;
        if (cutoffDate) {
            filteredGroups = this.groups.filter(group => {
                const [year, month] = group.month.split('-');
                const groupDate = new Date(parseInt(year), parseInt(month) - 1, 1);
                return groupDate >= cutoffDate;
            });
        }

        return filteredGroups;
    }

    renderSalesByMonthChart() {
        const ctx = document.getElementById('salesByMonthChart');
        if (!ctx) return;

        const filteredGroups = this.getFilteredData();
        const monthlyData = {};

        // CORRIGIDO: Percorrer days -> sales
        filteredGroups.forEach(group => {
            const key = `${group.month.split('-')[1]}/${group.month.split('-')[0]}`;
            if (!monthlyData[key]) {
                monthlyData[key] = { sales: 0, value: 0 };
            }
            
            group.days.forEach(day => {
                day.sales.forEach(sale => {
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

        const salesData = labels.map(label => monthlyData[label].sales);
        const valuesData = labels.map(label => monthlyData[label].value);

        if (labels.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            return;
        }

        this.charts.salesByMonth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantidade de Vendas',
                    data: salesData,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Valor (R$)',
                    data: valuesData,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantidade'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Valor (R$)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    renderProfitVsCostsChart() {
        const ctx = document.getElementById('profitVsCostsChart');
        if (!ctx) return;

        const filteredGroups = this.getFilteredData();
        const monthlyData = {};

        // CORRIGIDO: Percorrer days -> sales
        filteredGroups.forEach(group => {
            const key = `${group.month.split('-')[1]}/${group.month.split('-')[0]}`;
            if (!monthlyData[key]) {
                monthlyData[key] = { profit: 0, costs: 0 };
            }
            
            group.days.forEach(day => {
                day.sales.forEach(sale => {
                    monthlyData[key].profit += sale.price * sale.quantity;
                });
            });
        });

        // Adicionar custos
        this.costs.forEach(cost => {
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

        const profitData = labels.map(label => monthlyData[label].profit);
        const costsData = labels.map(label => monthlyData[label].costs || 0);

        if (labels.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            return;
        }

        this.charts.profitVsCosts = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Lucro (R$)',
                    data: profitData,
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: '#28a745',
                    borderWidth: 1
                }, {
                    label: 'Custos (R$)',
                    data: costsData,
                    backgroundColor: 'rgba(255, 193, 7, 0.7)',
                    borderColor: '#ffc107',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Valor (R$)'
                        }
                    }
                }
            }
        });
    }

    renderTopItemsChart() {
        const ctx = document.getElementById('topItemsChart');
        if (!ctx) return;

        const itemSales = {};
        const filteredGroups = this.getFilteredData();

        // CORRIGIDO: Percorrer days -> sales
        filteredGroups.forEach(group => {
            group.days.forEach(day => {
                day.sales.forEach(sale => {
                    if (!itemSales[sale.itemId]) {
                        itemSales[sale.itemId] = { quantity: 0, name: this.getItemName(sale.itemId) };
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

        const labels = sortedItems.map(([id, data]) => data.name.length > 15 ? data.name.substring(0, 15) + '...' : data.name);
        const data = sortedItems.map(([id, data]) => data.quantity);

        this.charts.topItems = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#dc3545', '#28a745', '#ffc107', '#17a2b8', '#6f42c1',
                        '#e83e8c', '#fd7e14', '#20c997', '#6610f2', '#6c757d'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderProfitEvolutionChart() {
        const ctx = document.getElementById('profitEvolutionChart');
        if (!ctx) return;

        const filteredGroups = this.getFilteredData();
        const monthlyData = {};

        // CORRIGIDO: Percorrer days -> sales
        filteredGroups.forEach(group => {
            const key = `${group.month.split('-')[1]}/${group.month.split('-')[0]}`;
            if (!monthlyData[key]) {
                monthlyData[key] = { sales: 0, costs: 0 };
            }
            
            group.days.forEach(day => {
                day.sales.forEach(sale => {
                    monthlyData[key].sales += sale.price * sale.quantity;
                });
            });
        });

        // Adicionar custos
        this.costs.forEach(cost => {
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

        const profitData = labels.map(label => monthlyData[label].sales - (monthlyData[label].costs || 0));

        if (labels.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            return;
        }

        this.charts.profitEvolution = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Lucro Líquido (R$)',
                    data: profitData,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Lucro (R$)'
                        }
                    }
                }
            }
        });
    }

    updateDashboardStats() {
        const filteredGroups = this.getFilteredData();
        
        // Média mensal de vendas
        let totalSales = 0;
        let monthCount = 0;
        const monthlyTotals = {};

        // CORRIGIDO: Percorrer days -> sales
        filteredGroups.forEach(group => {
            const key = `${group.month.split('-')[1]}/${group.month.split('-')[0]}`;
            if (!monthlyTotals[key]) {
                monthlyTotals[key] = 0;
                monthCount++;
            }
            
            group.days.forEach(day => {
                day.sales.forEach(sale => {
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
        this.costs.forEach(cost => {
            totalCosts += cost.totalCost;
        });
        const profitMargin = totalSales > 0 ? ((totalSales - totalCosts) / totalSales * 100) : 0;
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

    // ========== PERSISTÊNCIA DE DADOS ==========

    async saveData() {
        const data = {
            items: this.items,
            groups: this.groups,
            costs: this.costs,
            version: '1.0',
            lastUpdate: new Date().toISOString()
        };
        
        // Salvar no localStorage (sempre)
        localStorage.setItem('lojaData', JSON.stringify(data));
        
        // Tentar salvar na nuvem (se estiver na Vercel)
        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                console.log('✅ Dados salvos na nuvem com sucesso');
            } else {
                if (result.error && result.error.includes('não estão definidas')) {
                    console.warn('⚠️ Variáveis de ambiente não configuradas na Vercel. Dados salvos apenas localmente.');
                    console.warn('💡 Configure JSONBIN_API_KEY e JSONBIN_BIN_ID no painel da Vercel para habilitar sincronização na nuvem.');
                } else {
                    console.warn('⚠️ Erro ao salvar na nuvem:', result.error || result.message);
                    console.warn('💾 Dados salvos apenas localmente (localStorage)');
                }
            }
        } catch (error) {
            // Se não houver API, usar apenas localStorage (modo offline)
            console.log('📱 Modo offline: dados salvos apenas localmente');
            console.log('ℹ️ Isso é normal se você estiver testando localmente (localhost)');
        }
    }

    async loadData() {
        // Tentar carregar da nuvem primeiro
        try {
            const response = await fetch('/api/load');
            const result = await response.json();
            
            if (response.ok && result.success && result.data) {
                const cloudData = result.data;
                
                // Verificar se há dados ou se é apenas estrutura vazia
                const hasData = (cloudData.items && cloudData.items.length > 0) ||
                               (cloudData.groups && cloudData.groups.length > 0) ||
                               (cloudData.costs && cloudData.costs.length > 0);
                
                if (hasData) {
                    // Dados da nuvem encontrados
                    this.items = cloudData.items || [];
                    this.groups = cloudData.groups || [];
                    this.costs = cloudData.costs || [];
                    
                    // Sincronizar com localStorage
                    localStorage.setItem('lojaData', JSON.stringify(cloudData));
                    console.log('✅ Dados carregados da nuvem');
                    console.log(`📊 Items: ${this.items.length} | Grupos: ${this.groups.length} | Custos: ${this.costs.length}`);
                    return Promise.resolve();
                } else {
                    console.log('ℹ️ Nenhum dado encontrado na nuvem (bin vazio)');
                }
            } else if (result.error && result.error.includes('não estão definidas')) {
                console.warn('⚠️ Variáveis de ambiente não configuradas na Vercel');
                console.warn('💡 Configure JSONBIN_API_KEY e JSONBIN_BIN_ID no painel da Vercel');
            }
        } catch (error) {
            console.log('⚠️ Não foi possível carregar da nuvem:', error.message);
            console.log('💾 Usando localStorage como fallback');
        }
        
        // Fallback: carregar do localStorage
        const saved = localStorage.getItem('lojaData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.items = data.items || [];
                this.groups = data.groups || [];
                this.costs = data.costs || [];
                console.log('✅ Dados carregados do localStorage');
            } catch (e) {
                console.error('❌ Erro ao carregar dados:', e);
                this.items = [];
                this.groups = [];
                this.costs = [];
            }
        } else {
            console.log('ℹ️ Nenhum dado encontrado, iniciando vazio');
        }
        
        return Promise.resolve();
    }

    exportData() {
        const data = {
            items: this.items,
            groups: this.groups,
            costs: this.costs,
            version: '1.0',
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `loja_backup_${new Date().toISOString().split('T')[0]}.txt`;
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
                
                if (confirm('Isso irá substituir todos os dados atuais. Deseja continuar?')) {
                    this.items = data.items || [];
                    this.groups = data.groups || [];
                    this.costs = data.costs || [];
                    this.saveData();
                    this.renderItems();
                    this.renderGroups();
                    this.renderCosts();
                    this.updateMonthFilter();
                    this.updateOverallSummary();
                    alert('Dados importados com sucesso!');
                }
            } catch (error) {
                alert('Erro ao importar arquivo. Verifique se o arquivo está no formato correto.');
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
        username: sessionStorage.getItem('username')
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
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('🟣 [APP.JS] DOM já está pronto, inicializando imediatamente...');
    setTimeout(inicializarApp, 100);
}

