/**
 * ========================================
 * CORREÇÃO ESPECÍFICA PARA CHROME ANDROID - VERSÃO AGRESSIVA
 * ========================================
 * 
 * Este script detecta Chrome Android e aplica correções ULTRA AGRESSIVAS
 * para o problema de backdrop-filter que causa tela transparente
 * após fechar modais.
 * 
 * ESTRATÉGIA:
 * - Remove COMPLETAMENTE backdrop-filter no Android
 * - Remove classes Tailwind que podem causar conflito
 * - Força repaint do body após fechar modal
 * - Usa MutationObserver para detectar fechamento
 * - Cria overlay separado que é removido completamente
 */

(function() {
    'use strict';
    
    // Detectar Chrome Android
    const ua = navigator.userAgent;
    const isAndroid = /Android/i.test(ua);
    const isChrome = /Chrome/i.test(ua) && !/Edge|Opera|OPR/i.test(ua);
    const isAndroidChrome = isAndroid && isChrome;
    
    if (!isAndroidChrome) {
        // Não é Chrome Android, não aplicar correções
        return;
    }
    
    console.log('🔧 [ANDROID FIX] Chrome Android detectado - Aplicando correções ULTRA AGRESSIVAS');
    
    // Função para inicializar quando DOM estiver pronto
    const initAndroidFix = () => {
        if (!document.body) {
            // DOM ainda não está pronto, tentar novamente
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initAndroidFix);
                return;
            } else {
                // Timeout de segurança
                setTimeout(initAndroidFix, 100);
                return;
            }
        }
        
        // Adicionar classe ao body para CSS específico
        document.documentElement.classList.add('android-chrome');
        document.body.classList.add('android-chrome');
        
        // Continuar com o resto da inicialização
        continueInit();
    };
    
    // Continuar inicialização após DOM estar pronto
    const continueInit = () => {
		
		
        if (!document.body) return; // Segurança extra
		
		  // ⛔ NÃO rodar fix antes do app estar pronto
	  if (!document.body.classList.contains('app-ready')) {
		console.warn('⏸️ [ANDROID FIX] aguardando app-ready');
		setTimeout(continueInit, 100);
		return;
	  }
        
        // CSS ULTRA AGRESSIVO - Remove TUDO relacionado a backdrop
        const style = document.createElement('style');
        style.id = 'android-modal-fix';
        style.textContent = `
        /* REMOVER COMPLETAMENTE backdrop-filter no Android Chrome */
        .android-chrome .modal,
        .android-chrome .modal.active,
        .android-chrome .modal:not(.active),
        .android-chrome [class*="backdrop"],
        .android-chrome [class*="backdrop-blur"] {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            will-change: auto !important;
        }
        
        /* Remover classes Tailwind que podem causar problema */
        .android-chrome .backdrop-blur-sm,
        .android-chrome .backdrop-blur,
        .android-chrome [class*="bg-opacity"] {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }
        
        /* Usar background sólido ESCURO ao invés de backdrop-filter */
        /* IMPORTANTE: NÃO usar !important em display/visibility aqui para permitir que JS sobrescreva */
        .android-chrome .modal.active {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            z-index: 10000 !important;
            background-color: rgba(0, 0, 0, 0.85) !important;
            background: rgba(0, 0, 0, 0.85) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
        }
        
        /* GARANTIR reset COMPLETO quando fechado */
        .android-chrome .modal:not(.active) {
            display: none !important;
            opacity: 0 !important;
            background-color: transparent !important;
            background: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            pointer-events: none !important;
            visibility: hidden !important;
            transform: none !important;
            z-index: -1 !important;
        }
        
        /* Garantir que body/html não tenham backdrop NUNCA */
        .android-chrome body,
        .android-chrome html,
        .android-chrome .modal,
		.android-chrome .modal * {
		  backdrop-filter: none !important;
		  -webkit-backdrop-filter: none !important;
        }
        
        /* Forçar opacidade normal no body quando não há modal */
        .android-chrome body:not(.modal-open) {
            opacity: 1 !important;
            visibility: visible !important;
        }
        `;
        document.head.appendChild(style);
        
        // Expor função global para forçar abertura de modal (bypass das proteções)
        window.forceOpenModal = function(modalElement) {
        if (!modalElement) return;
        
        // Adicionar classe active primeiro
        modalElement.classList.add('active');
        
        // Usar requestAnimationFrame para garantir que o DOM processou a mudança
        requestAnimationFrame(() => {
            // Forçar propriedades com cssText (sobrescreve TUDO)
            modalElement.style.cssText = `
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
                z-index: 10000 !important;
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background-color: rgba(0, 0, 0, 0.85) !important;
                background: rgba(0, 0, 0, 0.85) !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
            `;
            
            document.body.classList.add('modal-open');
            
            // Forçar novamente após pequenos delays
            setTimeout(() => {
                if (modalElement.classList.contains('active')) {
                    modalElement.style.cssText = `
                        display: flex !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        pointer-events: auto !important;
                        z-index: 10000 !important;
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        background-color: rgba(0, 0, 0, 0.85) !important;
                        background: rgba(0, 0, 0, 0.85) !important;
                        backdrop-filter: none !important;
                        -webkit-backdrop-filter: none !important;
                    `;
                }
            }, 10);
            
            setTimeout(() => {
                // Última verificação
                if (modalElement.classList.contains('active')) {
                    modalElement.style.cssText = `
                        display: flex !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        pointer-events: auto !important;
                        z-index: 10000 !important;
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        background-color: rgba(0, 0, 0, 0.85) !important;
                        background: rgba(0, 0, 0, 0.85) !important;
                        backdrop-filter: none !important;
                        -webkit-backdrop-filter: none !important;
                    `;
                }
            }, 50);
        });
        };
        
        // Expor função para desabilitar completamente o fix (último recurso)
        window.disableAndroidModalFix = function() {
        const styleElement = document.getElementById('android-modal-fix');
        if (styleElement) {
            styleElement.remove();
            console.log('🔧 [ANDROID FIX] CSS removido completamente');
        }
    };
    
        // Função para forçar repaint do body
        const forceRepaint = () => {
		  document.body.style.transform = 'translateZ(0)';
		  requestAnimationFrame(() => {
			document.body.style.transform = '';
		  });
		};

    
        
        // Limpar TODOS os modais
        const cleanAndroidModals = () => {
		document.body.classList.remove('modal-open');

		  const modals = document.querySelectorAll('.modal:not(.active)');
		  modals.forEach(modal => {
			modal.style.cssText = `
			  display: none !important;
			  opacity: 0 !important;
			  visibility: hidden !important;
			  pointer-events: none !important;
			  background: transparent !important;
			  z-index: -1 !important;
			`;
		  });

		  forceRepaint();
		};

        
        // Limpar body e html COMPLETAMENTE
        document.body.style.removeProperty('backdrop-filter');
        document.body.style.removeProperty('-webkit-backdrop-filter');
        document.body.style.removeProperty('opacity');
        document.body.style.removeProperty('visibility');
        document.documentElement.style.removeProperty('backdrop-filter');
        document.documentElement.style.removeProperty('-webkit-backdrop-filter');
        
        // Forçar repaint
        forceRepaint();
    };
    
        // MutationObserver para detectar quando modais são abertos/fechados
        const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList && target.classList.contains('modal')) {
                    if (target.classList.contains('active')) {
                        // Modal foi aberto - FORÇAR propriedades visíveis com cssText (sobrescreve TUDO)
                        // Usar requestAnimationFrame para garantir que o DOM está pronto
                        requestAnimationFrame(() => {
                            target.style.cssText = `
                                display: flex !important;
                                visibility: visible !important;
                                opacity: 1 !important;
                                pointer-events: auto !important;
                                z-index: 10000 !important;
                                position: fixed !important;
                                left: 0 !important;
                                top: 0 !important;
                                width: 100% !important;
                                height: 100% !important;
                                background-color: rgba(0, 0, 0, 0.85) !important;
                                background: rgba(0, 0, 0, 0.85) !important;
                                backdrop-filter: none !important;
                                -webkit-backdrop-filter: none !important;
                            `;
                            document.body.classList.add('modal-open');
                            
                            // Forçar novamente após pequenos delays para garantir renderização
                            setTimeout(() => {
                                target.style.cssText = `
                                    display: flex !important;
                                    visibility: visible !important;
                                    opacity: 1 !important;
                                    pointer-events: auto !important;
                                    z-index: 10000 !important;
                                    position: fixed !important;
                                    left: 0 !important;
                                    top: 0 !important;
                                    width: 100% !important;
                                    height: 100% !important;
                                    background-color: rgba(0, 0, 0, 0.85) !important;
                                    background: rgba(0, 0, 0, 0.85) !important;
                                    backdrop-filter: none !important;
                                    -webkit-backdrop-filter: none !important;
                                `;
                            }, 10);
                            
                            setTimeout(() => {
                                // Última verificação - garantir que ainda está ativo
                                if (target.classList.contains('active')) {
                                    target.style.cssText = `
                                        display: flex !important;
                                        visibility: visible !important;
                                        opacity: 1 !important;
                                        pointer-events: auto !important;
                                        z-index: 10000 !important;
                                        position: fixed !important;
                                        left: 0 !important;
                                        top: 0 !important;
                                        width: 100% !important;
                                        height: 100% !important;
                                        background-color: rgba(0, 0, 0, 0.85) !important;
                                        background: rgba(0, 0, 0, 0.85) !important;
                                        backdrop-filter: none !important;
                                        -webkit-backdrop-filter: none !important;
                                    `;
                                }
                            }, 50);
                        });
                    } else {
                        // Modal foi fechado
                        setTimeout(() => {
                            cleanAndroidModals();
                            forceRepaint();
                        }, 50);
                    }
                }
            }
        });
    });
    
        // Observar TODOS os modais
        const observeModals = () => {
        document.querySelectorAll('.modal').forEach(modal => {
            observer.observe(modal, {
                attributes: true,
                attributeFilter: ['class']
            });
        });
    };
    
	let lastModalClose = 0;

function scheduleClean() {
  clearTimeout(lastModalClose);
  lastModalClose = setTimeout(() => {
    cleanAndroidModals();
  }, 300);
}

	
        // Iniciar observação
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', observeModals);
        } else {
            observeModals();
        }
        
        // Observar novos modais adicionados ao DOM
        const domObserver = new MutationObserver(() => {
            observeModals();
        });
        domObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Executar limpeza periodicamente (a cada 200ms) quando não há modais ativos
        // IMPORTANTE: Só executar se houver modais na página (não executar na página de login)
        const modalsOnPage = document.querySelectorAll('.modal');
        if (modalsOnPage.length > 0) {
            // Só criar interval se houver modais na página
            scheduleClean();
        }
        
        // Interceptar TODOS os eventos de fechamento
        document.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal && e.target === modal) {
                // Clicou no backdrop
               scheduleClean();
			   forceRepaint();

            }
        }, true);
        
        // Limpar ao pressionar ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              scheduleClean();
			  forceRepaint();

            }
        });
        
        // Interceptar remove de classe active
        const originalRemove = DOMTokenList.prototype.remove;
        DOMTokenList.prototype.remove = function(...args) {
		  const result = originalRemove.apply(this, args);

		  if (
			this.ownerElement &&
			this.ownerElement.classList.contains('modal') &&
			args.includes('active')
		  ) {
			scheduleClean();
			forceRepaint();
		  }

		  return result;
		};


        
    // Limpar ao fechar página/app
	  window.addEventListener('beforeunload', () => {
	  cleanAndroidModals();
	});

        
        // Limpar quando página fica visível novamente
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                scheduleClean();
                forceRepaint();
				
            }
        });
        
        // Expor função global para limpeza manual
        window.cleanAndroidModals = () => {
            cleanAndroidModals();
            forceRepaint();
        };
        
        console.log('✅ [ANDROID FIX] Correções ULTRA AGRESSIVAS aplicadas');
        console.log('✅ [ANDROID FIX] Use window.cleanAndroidModals() para limpeza manual');
    };
    
    // Iniciar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAndroidFix);
    } else {
        initAndroidFix();
    }
})();
