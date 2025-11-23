// Serverless function para servir arquivos estáticos na Vercel
const fs = require('fs');
const path = require('path');

// Na Vercel, os arquivos estão na raiz do projeto
// __dirname aponta para /var/task/api, então precisamos subir um nível
const projectRoot = path.join(__dirname, '..');

module.exports = async (req, res) => {
    try {
        // Normalizar o caminho - Vercel usa req.url
        let filePath = (req.url || req.path || '/').split('?')[0].split('#')[0];

        // Log para debug
        console.log('=== DEBUG ===');
        console.log('Request URL:', req.url);
        console.log('Request Path:', req.path);
        console.log('Normalized Path:', filePath);

        // Se for raiz, servir index.html
        if (filePath === '/' || filePath === '') {
            filePath = '/index.html';
        }

        // Remover barra inicial
        const cleanPath = filePath.startsWith('/')
            ? filePath.slice(1)
            : filePath;

        // Caminho completo do arquivo
        const fullPath = path.join(projectRoot, cleanPath);

        console.log('Clean Path:', cleanPath);
        console.log('Full Path:', fullPath);
        console.log('File Exists:', fs.existsSync(fullPath));

        // Verificar se o arquivo existe
        if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            console.log('Is File:', stats.isFile());

            if (stats.isFile()) {
                // Determinar Content-Type
                const ext = path.extname(fullPath).toLowerCase();
                const contentTypes = {
                    '.html': 'text/html',
                    '.css': 'text/css',
                    '.js': 'application/javascript',
                    '.json': 'application/json',
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.ico': 'image/x-icon',
                    '.svg': 'image/svg+xml',
                    '.woff': 'font/woff',
                    '.woff2': 'font/woff2',
                };

                const contentType =
                    contentTypes[ext] || 'application/octet-stream';

                // Adicionar charset para arquivos de texto
                let finalContentType = contentType;
                if (['.html', '.css', '.js', '.json'].includes(ext)) {
                    finalContentType = `${contentType}; charset=utf-8`;
                }

                res.setHeader('Content-Type', finalContentType);

                // Headers AGRESSIVOS para evitar cache (forçar sempre 200 OK)
                // IMPORTANTE: Sempre retornar 200, nunca 304
                // Vercel CDN também respeita esses headers
                res.setHeader(
                    'Cache-Control',
                    'no-cache, no-store, must-revalidate, max-age=0, private, proxy-revalidate'
                );
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
                res.setHeader('X-Content-Type-Options', 'nosniff');

                // Sempre atualizar Last-Modified para forçar recarregamento
                const now = new Date();
                res.setHeader('Last-Modified', now.toUTCString());
                
                // Adicionar header para evitar cache do Vercel CDN
                res.setHeader('Vary', '*');

                // Remover headers que podem causar 304
                res.removeHeader('ETag');
                res.removeHeader('If-Modified-Since');
                res.removeHeader('If-None-Match');
                
                // IMPORTANTE: Garantir que Vercel CDN não faça cache
                res.setHeader('CDN-Cache-Control', 'no-cache');
                res.setHeader('Surrogate-Control', 'no-store');

                // CORS headers (caso necessário)
                res.setHeader('Access-Control-Allow-Origin', '*');

                // IMPORTANTE: Garantir que sempre retorna 200, não 304
                // Se o navegador enviar If-Modified-Since, ignorar e retornar 200
                if (
                    req.headers['if-modified-since'] ||
                    req.headers['if-none-match']
                ) {
                    console.log(
                        'Navegador enviou If-Modified-Since/If-None-Match - IGNORANDO e retornando 200'
                    );
                }

                // Ler e enviar arquivo
                try {
                    const fileContent = fs.readFileSync(fullPath, 'utf8');

                    // Log para debug CSS
                    if (ext === '.css') {
                        console.log('CSS sendo servido:', cleanPath);
                        console.log(
                            'Tamanho do CSS:',
                            fileContent.length,
                            'caracteres'
                        );
                        console.log(
                            'Primeiros 100 caracteres:',
                            fileContent.substring(0, 100)
                        );
                    }

                    return res.status(200).send(fileContent);
                } catch (readError) {
                    console.error('Erro ao ler arquivo:', readError);
                    return res.status(500).send('Erro ao ler arquivo');
                }
            }
        }

        // Se não encontrar, tentar servir index.html
        const indexPath = path.join(projectRoot, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            const indexContent = fs.readFileSync(indexPath, 'utf8');
            return res.status(200).send(indexContent);
        }

        // 404
        res.status(404).send(`Arquivo não encontrado: ${filePath}`);
    } catch (error) {
        console.error('Erro ao servir arquivo:', error);
        res.status(500).send('Erro interno do servidor');
    }
};
