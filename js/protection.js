/**
 * Sistema de Proteção de Código Fonte
 * Protege contra cópia, inspeção e manipulação via navegador
 */

(function() {
    'use strict';

    // Desabilitar seleção de texto
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });

    // Desabilitar arrastar
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });

    // Desabilitar botão direito do mouse
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // Desabilitar atalhos de teclado
    document.addEventListener('keydown', function(e) {
        // F12 - DevTools
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+I - DevTools
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+J - Console
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+C - Inspect Element
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            return false;
        }

        // Ctrl+U - View Source
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }

        // Ctrl+S - Save Page
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            return false;
        }

        // Ctrl+A - Select All
        if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            return false;
        }

        // Ctrl+C - Copy
        if (e.ctrlKey && e.key === 'c') {
            // Permitir apenas em campos de input/textarea
            const target = e.target;
            if (target.tagName !== 'INPUT' && 
                target.tagName !== 'TEXTAREA' && 
                !target.isContentEditable) {
                e.preventDefault();
                return false;
            }
        }

        // Ctrl+P - Print (pode ser útil, mas pode ser desabilitado)
        // if (e.ctrlKey && e.key === 'p') {
        //     e.preventDefault();
        //     return false;
        // }
    });

    // Detectar abertura de DevTools
    let devtools = {
        open: false,
        orientation: null
    };

    const threshold = 160;
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                handleDevToolsOpen();
            }
        } else {
            if (devtools.open) {
                devtools.open = false;
            }
        }
    }, 500);

    function handleDevToolsOpen() {
        // Limpar console
        console.clear();
        
        // Aviso
        console.log('%c⚠️ ACESSO NEGADO ⚠️', 'color: red; font-size: 50px; font-weight: bold;');
        console.log('%cEste código é propriedade protegida.', 'color: red; font-size: 20px;');
        console.log('%cA cópia não autorizada é ilegal.', 'color: red; font-size: 16px;');
        
        // Opcional: Redirecionar ou bloquear
        // window.location.href = '/';
        // document.body.innerHTML = '<h1>Acesso Negado</h1>';
    }

    // Proteger contra inspeção de elementos
    document.addEventListener('keydown', function(e) {
        // Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.keyCode === 73)) {
            e.preventDefault();
            return false;
        }
    });

    // Desabilitar cópia via menu do navegador
    document.addEventListener('copy', function(e) {
        const target = e.target;
        // Permitir cópia apenas em campos de input/textarea
        if (target.tagName !== 'INPUT' && 
            target.tagName !== 'TEXTAREA' && 
            !target.isContentEditable) {
            e.preventDefault();
            e.clipboardData.setData('text/plain', '');
            return false;
        }
    });

    // Desabilitar recortar
    document.addEventListener('cut', function(e) {
        const target = e.target;
        if (target.tagName !== 'INPUT' && 
            target.tagName !== 'TEXTAREA' && 
            !target.isContentEditable) {
            e.preventDefault();
            return false;
        }
    });

    // Proteger imagens (desabilitar arrastar)
    document.addEventListener('DOMContentLoaded', function() {
        const images = document.querySelectorAll('img');
        images.forEach(function(img) {
            img.addEventListener('dragstart', function(e) {
                e.preventDefault();
                return false;
            });
            img.setAttribute('draggable', 'false');
        });
    });

    // Adicionar aviso de copyright no console
    console.log('%c🔒 Código Protegido', 'color: #dc3545; font-size: 16px; font-weight: bold;');
    console.log('%cEste código é propriedade protegida por direitos autorais.', 'color: #666; font-size: 12px;');
    console.log('%cCópia não autorizada é ilegal e pode resultar em ações legais.', 'color: #666; font-size: 12px;');

    // Proteger contra debugger
    setInterval(function() {
        const start = performance.now();
        debugger;
        const end = performance.now();
        if (end - start > 100) {
            // DevTools está aberto
            handleDevToolsOpen();
        }
    }, 1000);

})();

