/**
 * ========================================
 * CORREÇÃO ESPECÍFICA PARA CHROME ANDROID
 * ========================================
 * 
 * Este script detecta Chrome Android e aplica correções específicas
 * para o problema de backdrop-filter que causa tela transparente
 * após fechar modais.
 */

(function() {
    'use strict';
    
    // Detectar Chrome Android
    const ua = navigator.userAgent;
    const isAndroidChrome = /Android.*Chrome\/[.0-9]* Mobile/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isChrome = /Chrome/i.test(ua) && !/Edge|Opera|OPR/i.test(ua);
    
    // Detectar se é Chrome Android (instalado via Play Store)
    const isAndroidChromeApp = isAndroid && isChrome && 
        (window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone ||
         document.referrer.includes('android-app://'));
    
    const isAndroidChromeBrowser = isAndroidChrome || (isAndroid && isChrome);
    
    if (!isAndroidChromeBrowser) {
        // Não é Chrome Android, não aplicar correções
        return;
    }
    
    console.log('🔧 [ANDROID FIX] Chrome Android detectado - Aplicando correções de modal');
    
    // Adicionar classe ao body para CSS específico
    document.documentElement.classList.add('android-chrome');
    document.body.classList.add('android-chrome');
    
    // Desabilitar backdrop-filter via CSS inline (força)
    const style = document.createElement('style');
    style.id = 'android-modal-fix';
    style.textContent = `
        /* FORÇAR desabilitar backdrop-filter no Android Chrome */
        .android-chrome .modal,
        .android-chrome .modal.active,
        .android-chrome .modal:not(.active) {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }
        
        /* Usar background sólido ao invés de backdrop-filter */
        .android-chrome .modal.active {
            background-color: rgba(0, 0, 0, 0.75) !important;
            background: rgba(0, 0, 0, 0.75) !important;
        }
        
        /* Garantir reset completo quando fechado */
        .android-chrome .modal:not(.active) {
            display: none !important;
            opacity: 0 !important;
            background-color: rgba(0, 0, 0, 0) !important;
            background: rgba(0, 0, 0, 0) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            pointer-events: none !important;
            visibility: hidden !important;
            transform: none !important;
        }
        
        /* Garantir que body/html não tenham backdrop */
        .android-chrome body,
        .android-chrome html {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }
    `;
    document.head.appendChild(style);
    
    // Função para limpar modais no Android
    const cleanAndroidModals = () => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (!modal.classList.contains('active')) {
                // Forçar reset completo
                modal.style.cssText = `
                    display: none !important;
                    opacity: 0 !important;
                    background: rgba(0, 0, 0, 0) !important;
                    backdrop-filter: none !important;
                    -webkit-backdrop-filter: none !important;
                    pointer-events: none !important;
                    visibility: hidden !important;
                `;
            }
        });
        
        // Limpar body e html
        document.body.style.setProperty('backdrop-filter', 'none', 'important');
        document.body.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
        document.documentElement.style.setProperty('backdrop-filter', 'none', 'important');
        document.documentElement.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
    };
    
    // Executar limpeza periodicamente (a cada 500ms) quando não há modais ativos
    setInterval(() => {
        const activeModals = document.querySelectorAll('.modal.active');
        if (activeModals.length === 0) {
            cleanAndroidModals();
        }
    }, 500);
    
    // Limpar quando qualquer modal é fechado
    const originalRemove = DOMTokenList.prototype.remove;
    DOMTokenList.prototype.remove = function(...args) {
        const result = originalRemove.apply(this, args);
        if (this.contains && !this.contains('active') && args.includes('active')) {
            // Modal foi fechado, limpar tudo
            setTimeout(cleanAndroidModals, 100);
        }
        return result;
    };
    
    // Interceptar fechamento de modais
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') || e.target.closest('.modal')) {
            setTimeout(cleanAndroidModals, 300);
        }
    }, true);
    
    // Limpar ao pressionar ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            setTimeout(cleanAndroidModals, 300);
        }
    });
    
    // Expor função global para limpeza manual
    window.cleanAndroidModals = cleanAndroidModals;
    
    console.log('✅ [ANDROID FIX] Correções aplicadas - backdrop-filter desabilitado no Android');
})();

