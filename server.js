const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos com caminhos absolutos
app.use(
    express.static(path.join(__dirname), {
        index: 'index.html',
        extensions: ['html', 'css', 'js', 'json', 'png', 'jpg', 'ico', 'svg'],
        setHeaders: (res, path) => {
            // Headers para cache de arquivos estáticos
            if (path.endsWith('.css') || path.endsWith('.js')) {
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

// Rota para login.html
app.get('/login.html', (req, res) => {
    const loginPath = path.join(__dirname, 'login.html');
    if (fs.existsSync(loginPath)) {
        res.sendFile(loginPath);
    } else {
        res.status(404).send('Arquivo login.html não encontrado');
    }
});

// Rota catch-all para SPA (deve ser a última)
app.get('*', (req, res) => {
    // Se for uma rota de API, não fazer nada (deixa para as API routes)
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }

    // Tentar servir o arquivo estático
    const filePath = path.join(__dirname, req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return res.sendFile(filePath);
    }

    // Se não encontrar, redirecionar para index.html (SPA)
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }

    res.status(404).send('Página não encontrada');
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
