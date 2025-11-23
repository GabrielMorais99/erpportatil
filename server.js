// Carregar variáveis de ambiente do arquivo .env (apenas em desenvolvimento local)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    try {
        require('dotenv').config();
        console.log('📝 [SERVER] Variáveis de ambiente carregadas do arquivo .env');
    } catch (e) {
        // dotenv não instalado ou arquivo .env não existe - isso é OK
        console.log('ℹ️ [SERVER] Arquivo .env não encontrado - usando apenas localStorage (modo offline)');
    }
}

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsing JSON
app.use(express.json());

// Rotas da API (serverless functions) - DEVEM VIR ANTES do express.static
app.get('/api/load', async (req, res) => {
    try {
        const loadFunction = require('./api/load.js');
        await loadFunction(req, res);
    } catch (error) {
        console.error('Erro ao executar api/load.js:', error);
        res.status(500).json({ 
            error: 'Erro ao carregar dados',
            message: error.message 
        });
    }
});

app.post('/api/save', async (req, res) => {
    try {
        const saveFunction = require('./api/save.js');
        await saveFunction(req, res);
    } catch (error) {
        console.error('Erro ao executar api/save.js:', error);
        res.status(500).json({ 
            error: 'Erro ao salvar dados',
            message: error.message 
        });
    }
});

// Servir arquivos estáticos com caminhos absolutos
// IMPORTANTE: Excluir pasta /api/ do static para não servir arquivos .js como estáticos
app.use(
    express.static(path.join(__dirname), {
        index: 'index.html',
        extensions: ['html', 'css', 'js', 'json', 'png', 'jpg', 'ico', 'svg'],
        setHeaders: (res, filePath) => {
            // Headers para cache de arquivos estáticos
            if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
                res.setHeader('Cache-Control', 'public, max-age=31536000');
            }
        },
    })
);

// Rota principal - redireciona para index.html
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Arquivo index.html não encontrado');
    }
});

// Rota para gerenciamento.html
app.get('/gerenciamento.html', (req, res) => {
    const gerenciamentoPath = path.join(__dirname, 'gerenciamento.html');
    if (fs.existsSync(gerenciamentoPath)) {
        res.sendFile(gerenciamentoPath);
    } else {
        res.status(404).send('Arquivo gerenciamento.html não encontrado');
    }
});

// Rota catch-all para servir arquivos estáticos ou index.html
app.get('*', (req, res) => {
    // Ignorar rotas de API - elas são funções serverless, não arquivos estáticos
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ 
            error: 'API route not found',
            message: 'Esta rota deve ser tratada por uma função serverless'
        });
    }

    // Normalizar o caminho (remover query string e hash)
    let filePath = req.path.split('?')[0].split('#')[0];

    // Se for raiz, servir index.html
    if (filePath === '/' || filePath === '') {
        const indexPath = path.join(__dirname, 'index.html');
        if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath);
        }
    }

    // Tentar servir arquivo estático se existir
    const fullPath = path.join(__dirname, filePath);

    // Verificar se o arquivo existe
    if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        if (stats.isFile()) {
            return res.sendFile(fullPath);
        }
    }

    // Se não encontrar arquivo, tentar servir index.html (SPA fallback)
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }

    // Último recurso: 404
    res.status(404).send(`Página não encontrada: ${req.path}`);
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).send('Erro interno do servidor');
});

// Exportar app para Vercel
module.exports = app;

// Iniciar servidor apenas se não estiver na Vercel
if (process.env.VERCEL !== '1') {
    const server = app.listen(PORT, (err) => {
        if (err) {
            if (err.code === 'EADDRINUSE') {
                console.error('========================================');
                console.error('   ERRO: Porta já está em uso!');
                console.error('========================================');
                console.error(`\n❌ A porta ${PORT} já está sendo usada.`);
                console.error('\n💡 Soluções:');
                console.error(
                    `   1. Pare o servidor anterior (Ctrl+C no terminal onde está rodando)`
                );
                console.error(`   2. Ou use outra porta: PORT=8000 npm start`);
                console.error(`   3. Ou mate o processo na porta ${PORT}`);
                console.error('\n');
                process.exit(1);
            } else {
                console.error('Erro ao iniciar servidor:', err);
                process.exit(1);
            }
        }

        console.log('========================================');
        console.log('   Loja - Sistema de Gestão');
        console.log('   Projeto por Nilda');
        console.log('========================================');
        console.log(`\n✅ Servidor rodando em: http://localhost:${PORT}`);
        console.log(`\n📋 Credenciais de acesso:`);
        console.log(`   Usuário: nilda`);
        console.log(`   Senha: 123`);
        console.log(`\n💡 Pressione Ctrl+C para parar o servidor\n`);
    });

    // Tratamento de erros do servidor
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error('========================================');
            console.error('   ERRO: Porta já está em uso!');
            console.error('========================================');
            console.error(`\n❌ A porta ${PORT} já está sendo usada.`);
            console.error('\n💡 Soluções:');
            console.error(
                `   1. Pare o servidor anterior (Ctrl+C no terminal onde está rodando)`
            );
            console.error(`   2. Ou use outra porta: PORT=8000 npm start`);
            console.error(`   3. Ou mate o processo na porta ${PORT}`);
            console.error('\n');
        } else {
            console.error('Erro no servidor:', err);
        }
        process.exit(1);
    });
}
