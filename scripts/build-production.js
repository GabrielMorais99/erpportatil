/**
 * ========================================
 * SCRIPT DE BUILD PARA PRODUÇÃO
 * ========================================
 * 
 * Este script:
 * 1. Minifica o JavaScript (remove espaços, comentários)
 * 2. Ofusca o código (torna difícil de ler)
 * 3. Gera arquivos otimizados na pasta /dist
 * 
 * Uso: npm run build:js
 */

const fs = require('fs');
const path = require('path');

// Verificar se as dependências estão instaladas
let Terser, JavaScriptObfuscator;

try {
    Terser = require('terser');
} catch (e) {
    console.error('❌ Terser não instalado. Execute: npm install terser --save-dev');
    process.exit(1);
}

try {
    JavaScriptObfuscator = require('javascript-obfuscator');
} catch (e) {
    console.error('❌ javascript-obfuscator não instalado. Execute: npm install javascript-obfuscator --save-dev');
    process.exit(1);
}

// Configuração
const config = {
    // Arquivos JS para processar
    inputFiles: [
        'js/app.js',
        'js/login.js',
        'js/skeleton-manager.js'
    ],
    // Pasta de saída
    outputDir: 'dist/js',
    // Nível de ofuscação: 'low', 'medium', 'high', 'none' (só minifica)
    obfuscationLevel: 'low'
};

// Configurações de ofuscação por nível
const obfuscationConfigs = {
    none: null, // Só minifica, não ofusca
    low: {
        compact: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        debugProtection: false,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: false,
        renameGlobals: false,
        selfDefending: false,
        simplify: true,
        splitStrings: false,
        stringArray: true,
        stringArrayCallsTransform: false,
        stringArrayEncoding: [],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 1,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 2,
        stringArrayWrappersType: 'variable',
        stringArrayThreshold: 0.75,
        unicodeEscapeSequence: false
    },
    medium: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.5,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.3,
        debugProtection: false,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: true,
        renameGlobals: false,
        selfDefending: false,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 10,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayCallsTransformThreshold: 0.5,
        stringArrayEncoding: ['base64'],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 2,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 4,
        stringArrayWrappersType: 'function',
        stringArrayThreshold: 0.75,
        transformObjectKeys: true,
        unicodeEscapeSequence: false
    },
    high: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: true,
        debugProtectionInterval: 2000,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: true,
        renameGlobals: true,
        selfDefending: true,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 5,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayCallsTransformThreshold: 0.75,
        stringArrayEncoding: ['rc4'],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 5,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 5,
        stringArrayWrappersType: 'function',
        stringArrayThreshold: 1,
        transformObjectKeys: true,
        unicodeEscapeSequence: true
    }
};

// Criar pasta de saída
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Pasta criada: ${dir}`);
    }
}

// Processar arquivo
async function processFile(inputPath) {
    const fileName = path.basename(inputPath);
    const outputPath = path.join(config.outputDir, fileName);
    
    console.log(`\n🔧 Processando: ${inputPath}`);
    
    // Verificar se arquivo existe
    if (!fs.existsSync(inputPath)) {
        console.log(`   ⚠️  Arquivo não encontrado: ${inputPath}`);
        return null;
    }
    
    // Ler arquivo original
    const originalCode = fs.readFileSync(inputPath, 'utf8');
    const originalSize = Buffer.byteLength(originalCode, 'utf8');
    console.log(`   📄 Tamanho original: ${formatBytes(originalSize)}`);
    
    try {
        // Passo 1: Minificar com Terser
        console.log(`   ⚡ Minificando...`);
        const minified = await Terser.minify(originalCode, {
            compress: {
                drop_console: false, // Manter console.log (mude para true em produção real)
                drop_debugger: true,
                dead_code: true,
                unused: true,
                passes: 2
            },
            mangle: {
                toplevel: false,
                reserved: ['app', 'LojaApp', 'initApp'] // Preservar nomes importantes
            },
            format: {
                comments: false
            }
        });
        
        if (minified.error) {
            throw minified.error;
        }
        
        const minifiedSize = Buffer.byteLength(minified.code, 'utf8');
        console.log(`   📦 Após minificação: ${formatBytes(minifiedSize)} (${((1 - minifiedSize/originalSize) * 100).toFixed(1)}% menor)`);
        
        let finalCode = minified.code;
        
        // Passo 2: Ofuscar (se não for 'none')
        if (config.obfuscationLevel !== 'none' && obfuscationConfigs[config.obfuscationLevel]) {
            console.log(`   🔒 Ofuscando (nível: ${config.obfuscationLevel})...`);
            const obfuscationResult = JavaScriptObfuscator.obfuscate(
                minified.code,
                obfuscationConfigs[config.obfuscationLevel]
            );
            finalCode = obfuscationResult.getObfuscatedCode();
        } else {
            console.log(`   ⚡ Só minificação (sem ofuscação)`);
        }
        
        const finalSize = Buffer.byteLength(finalCode, 'utf8');
        
        // Salvar arquivo
        fs.writeFileSync(outputPath, finalCode);
        
        console.log(`   ✅ Salvo: ${outputPath}`);
        console.log(`   📊 Tamanho final: ${formatBytes(finalSize)}`);
        
        return {
            file: fileName,
            originalSize,
            minifiedSize,
            finalSize,
            reduction: ((1 - minifiedSize/originalSize) * 100).toFixed(1)
        };
        
    } catch (error) {
        console.error(`   ❌ Erro: ${error.message}`);
        return null;
    }
}

// Formatar bytes
function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Função principal
async function main() {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║     🔐 BUILD DE PRODUÇÃO - ERP PORTÁTIL    ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log('║  Minificação + Ofuscação de JavaScript     ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    // Criar pasta de saída
    ensureDir(config.outputDir);
    
    // Processar todos os arquivos
    const results = [];
    for (const file of config.inputFiles) {
        const result = await processFile(file);
        if (result) {
            results.push(result);
        }
    }
    
    // Resumo
    console.log('\n════════════════════════════════════════════');
    console.log('📊 RESUMO DO BUILD');
    console.log('════════════════════════════════════════════');
    
    let totalOriginal = 0;
    let totalFinal = 0;
    
    for (const r of results) {
        totalOriginal += r.originalSize;
        totalFinal += r.finalSize;
        console.log(`   ${r.file}: ${formatBytes(r.originalSize)} → ${formatBytes(r.finalSize)} (-${r.reduction}%)`);
    }
    
    console.log('────────────────────────────────────────────');
    console.log(`   TOTAL: ${formatBytes(totalOriginal)} → ${formatBytes(totalFinal)}`);
    console.log(`   Redução: ${((1 - totalFinal/totalOriginal) * 100).toFixed(1)}%`);
    console.log('════════════════════════════════════════════\n');
    
    console.log('✅ Build concluído!');
    console.log('📁 Arquivos de produção em: ' + config.outputDir);
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   Para usar em produção, atualize os links no HTML:');
    console.log('   <script src="/dist/js/app.js"></script>');
}

// Executar
main().catch(console.error);

