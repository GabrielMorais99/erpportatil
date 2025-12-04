/**
 * ========================================
 * SCRIPT LOADER - CARREGADOR INTELIGENTE
 * ========================================
 * 
 * Detecta automaticamente o ambiente:
 * - PRODUÇÃO (Vercel): Carrega arquivos ofuscados de /dist/js/
 * - DESENVOLVIMENTO (localhost): Carrega arquivos originais de /js/
 * 
 * Uso: 
 * ScriptLoader.load('app.js', callback);
 * ScriptLoader.load('login.js', callback);
 */

const ScriptLoader = (function() {
    'use strict';
    
    // ========== CONFIGURAÇÃO ==========
    const config = {
        // Detectar se está em produção
        isProduction: !['localhost', '127.0.0.1', ''].includes(window.location.hostname.split(':')[0]) 
                      || window.location.hostname.includes('vercel.app'),
        
        // Caminhos
        paths: {
            development: '/js/',
            production: '/dist/js/'
        },
        
        // Arquivos disponíveis para ofuscação
        obfuscatedFiles: ['app.js', 'login.js', 'skeleton-manager.js'],
        
        // Cache de scripts já carregados
        loadedScripts: new Set(),
        
        // Debug
        debug: true
    };
    
    // ========== FUNÇÕES INTERNAS ==========
    
    function log(...args) {
        if (config.debug) {
            console.log('🔧 [ScriptLoader]', ...args);
        }
    }
    
    function warn(...args) {
        console.warn('⚠️ [ScriptLoader]', ...args);
    }
    
    function error(...args) {
        console.error('❌ [ScriptLoader]', ...args);
    }
    
    /**
     * Retorna o caminho correto para o arquivo
     */
    function getPath(filename) {
        // Se está em produção E o arquivo tem versão ofuscada
        if (config.isProduction && config.obfuscatedFiles.includes(filename)) {
            return config.paths.production + filename;
        }
        // Caso contrário, usar o arquivo original
        return config.paths.development + filename;
    }
    
    /**
     * Carrega um script dinamicamente
     */
    function loadScript(filename, onSuccess, onError) {
        // Evitar carregar o mesmo script duas vezes
        if (config.loadedScripts.has(filename)) {
            log(`Script já carregado: ${filename}`);
            if (onSuccess) onSuccess();
            return;
        }
        
        const path = getPath(filename);
        const fullUrl = path + '?v=' + Date.now(); // Cache busting
        
        log(`Ambiente: ${config.isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
        log(`Carregando: ${fullUrl}`);
        
        const script = document.createElement('script');
        script.src = fullUrl;
        script.async = false; // Garantir ordem de execução
        
        script.onload = function() {
            config.loadedScripts.add(filename);
            log(`✅ Carregado com sucesso: ${filename}`);
            if (onSuccess) onSuccess();
        };
        
        script.onerror = function(e) {
            error(`Falha ao carregar: ${path}`);
            
            // Se falhou em produção, tentar o arquivo original
            if (config.isProduction && path.includes('/dist/')) {
                warn('Tentando fallback para arquivo original...');
                const fallbackPath = config.paths.development + filename + '?v=' + Date.now();
                
                const fallbackScript = document.createElement('script');
                fallbackScript.src = fallbackPath;
                
                fallbackScript.onload = function() {
                    config.loadedScripts.add(filename);
                    log(`✅ Fallback carregado: ${filename}`);
                    if (onSuccess) onSuccess();
                };
                
                fallbackScript.onerror = function() {
                    error(`Falha total ao carregar: ${filename}`);
                    if (onError) onError(e);
                };
                
                document.head.appendChild(fallbackScript);
            } else {
                if (onError) onError(e);
            }
        };
        
        document.head.appendChild(script);
    }
    
    // ========== API PÚBLICA ==========
    
    return {
        /**
         * Carrega um script
         * @param {string} filename - Nome do arquivo (ex: 'app.js')
         * @param {Function} onSuccess - Callback de sucesso
         * @param {Function} onError - Callback de erro
         */
        load: function(filename, onSuccess, onError) {
            loadScript(filename, onSuccess, onError);
        },
        
        /**
         * Carrega múltiplos scripts em sequência
         * @param {Array} filenames - Array de nomes de arquivos
         * @param {Function} onComplete - Callback quando todos carregarem
         */
        loadAll: function(filenames, onComplete) {
            let index = 0;
            
            function loadNext() {
                if (index >= filenames.length) {
                    if (onComplete) onComplete();
                    return;
                }
                
                loadScript(filenames[index], function() {
                    index++;
                    loadNext();
                }, function() {
                    error(`Falha ao carregar: ${filenames[index]}`);
                    index++;
                    loadNext();
                });
            }
            
            loadNext();
        },
        
        /**
         * Verifica se está em produção
         */
        isProduction: function() {
            return config.isProduction;
        },
        
        /**
         * Retorna informações do ambiente
         */
        getInfo: function() {
            return {
                isProduction: config.isProduction,
                hostname: window.location.hostname,
                basePath: config.isProduction ? config.paths.production : config.paths.development,
                loadedScripts: Array.from(config.loadedScripts)
            };
        },
        
        /**
         * Ativa/desativa modo debug
         */
        setDebug: function(enabled) {
            config.debug = enabled;
        }
    };
})();

// Log inicial
console.log('🔧 [ScriptLoader] Inicializado:', ScriptLoader.getInfo());

