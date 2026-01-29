/**
 * ========================================
 * SKELETON MANAGER - Gerenciador de Loading
 * ========================================
 * 
 * Controla a animação do skeleton loading com timeout automático.
 * Exibe estado vazio quando não há dados após o tempo limite.
 * 
 * Uso:
 * SkeletonManager.show('containerId', { timeout: 8000 });
 * SkeletonManager.hide('containerId');
 * SkeletonManager.showEmpty('containerId', 'Nenhum item encontrado');
 */

const SkeletonManager = {
    // Configuração padrão
    config: {
        defaultTimeout: 8000, // 8 segundos
        fadeOutDuration: 300
    },

    // Timers ativos
    timers: new Map(),

    /**
     * Mostra skeleton com timeout automático
     * @param {string} containerId - ID do container
     * @param {Object} options - Opções de configuração
     */
    show(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`[SkeletonManager] Container não encontrado: ${containerId}`);
            return;
        }

        const timeout = options.timeout || this.config.defaultTimeout;
        const emptyMessage = options.emptyMessage || 'Nenhum dado encontrado';
        const emptyIcon = options.emptyIcon || 'fa-inbox';
        const emptyDescription = options.emptyDescription || 'Não há itens para exibir no momento.';

        // Limpa timer anterior se existir
        this.clearTimer(containerId);

        // Remove estado vazio se existir
        this.hideEmpty(containerId);

        // Remove classe de timeout
        container.classList.remove('skeleton-timeout');

        // Mostra skeleton
        container.style.display = '';
        container.classList.add('skeleton-active');

        // Inicia timer para timeout
        const timer = setTimeout(() => {
            this.timeout(containerId, {
                message: emptyMessage,
                icon: emptyIcon,
                description: emptyDescription,
                actionText: options.actionText,
                actionCallback: options.actionCallback
            });
        }, timeout);

        this.timers.set(containerId, timer);
    },

    /**
     * Esconde skeleton (dados carregados com sucesso)
     * @param {string} containerId - ID do container
     */
    hide(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Limpa timer
        this.clearTimer(containerId);

        // Esconde skeleton com fade
        container.style.opacity = '0';
        setTimeout(() => {
            container.style.display = 'none';
            container.style.opacity = '';
            container.classList.remove('skeleton-active', 'skeleton-timeout');
        }, this.config.fadeOutDuration);

        // Remove estado vazio se existir
        this.hideEmpty(containerId);
    },

    /**
     * Chamado quando timeout é atingido (sem dados)
     * @param {string} containerId - ID do container
     * @param {Object} options - Opções para o estado vazio
     */
    timeout(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Para a animação
        container.classList.add('skeleton-timeout');

        // Esconde skeleton após breve delay
        setTimeout(() => {
            container.style.display = 'none';
            this.showEmpty(containerId, options);
        }, 500);

        // Limpa timer
        this.clearTimer(containerId);
    },

    /**
     * Mostra estado vazio
     * @param {string} containerId - ID do container de referência
     * @param {Object} options - Opções do estado vazio
     */
    showEmpty(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Remove estado vazio anterior se existir
        this.hideEmpty(containerId);

        const message = options.message || 'Nenhum dado encontrado';
        const icon = options.icon || 'fa-inbox';
        const description = options.description || 'Não há itens para exibir no momento.';
        const variant = options.variant || 'empty-items';

        // Cria elemento de estado vazio
        const emptyState = document.createElement('div');
        emptyState.className = `empty-state-container ${variant}`;
        emptyState.id = `${containerId}-empty`;
        emptyState.innerHTML = `
            <div class="empty-state-icon">
                <i class="fas ${icon}"></i>
            </div>
            <h3 class="empty-state-title">${this.escapeHtml(message)}</h3>
            <p class="empty-state-description">${this.escapeHtml(description)}</p>
            ${options.actionText ? `
                <div class="empty-state-action">
                    <button class="btn-primary" id="${containerId}-empty-action">
                        <i class="fas fa-plus"></i>
                        <span>${this.escapeHtml(options.actionText)}</span>
                    </button>
                </div>
            ` : ''}
        `;

        // Insere após o container do skeleton
        container.parentNode.insertBefore(emptyState, container.nextSibling);

        // Adiciona evento ao botão de ação se existir
        if (options.actionText && options.actionCallback) {
            const actionBtn = document.getElementById(`${containerId}-empty-action`);
            if (actionBtn) {
                actionBtn.addEventListener('click', options.actionCallback);
            }
        }
    },

    /**
     * Esconde estado vazio
     * @param {string} containerId - ID do container de referência
     */
    hideEmpty(containerId) {
        const emptyState = document.getElementById(`${containerId}-empty`);
        if (emptyState) {
            emptyState.remove();
        }
    },

    /**
     * Limpa timer de um container
     * @param {string} containerId - ID do container
     */
    clearTimer(containerId) {
        if (this.timers.has(containerId)) {
            clearTimeout(this.timers.get(containerId));
            this.timers.delete(containerId);
        }
    },

    /**
     * Limpa todos os timers
     */
    clearAll() {
        this.timers.forEach((timer) => clearTimeout(timer));
        this.timers.clear();
    },

    /**
     * Escapa HTML para prevenir XSS
     * @param {string} text - Texto para escapar
     * @returns {string} Texto escapado
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Cria skeleton cards dinamicamente
     * @param {string} containerId - ID do container
     * @param {number} count - Quantidade de cards
     * @param {string} type - Tipo: 'card', 'line', 'list'
     */
    createSkeleton(containerId, count = 4, type = 'card') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        container.className = type === 'list' ? 'skeleton-list' : 'skeleton-container';

        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = type === 'line' ? 'skeleton-line' : 'skeleton-card';

            if (type === 'card') {
                skeleton.innerHTML = `
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                `;
            }

            container.appendChild(skeleton);
        }
    }
};

// Exporta para uso global
if (typeof window !== 'undefined') {
    window.SkeletonManager = SkeletonManager;
}

// Exporta para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkeletonManager;
}

