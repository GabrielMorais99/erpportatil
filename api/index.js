// Serverless function para servir arquivos estáticos na Vercel
const fs = require('fs');
const path = require('path');

// Na Vercel, os arquivos estão na raiz do projeto
// __dirname aponta para /var/task/api, então precisamos subir um nível
const projectRoot = path.join(__dirname, '..');

module.exports = async (req, res) => {
    try {
        // Normalizar o caminho
        let filePath = req.url.split('?')[0].split('#')[0];
        
        // Se for raiz, servir index.html
        if (filePath === '/' || filePath === '') {
            filePath = '/index.html';
        }
        
        // Remover barra inicial
        const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
        
        // Caminho completo do arquivo
        const fullPath = path.join(projectRoot, cleanPath);
        
        // Verificar se o arquivo existe
        if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            
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
                    '.woff2': 'font/woff2'
                };
                
                const contentType = contentTypes[ext] || 'application/octet-stream';
                res.setHeader('Content-Type', contentType);
                
                // Headers de cache para CSS/JS
                if (ext === '.css' || ext === '.js') {
                    res.setHeader('Cache-Control', 'public, max-age=31536000');
                }
                
                // Ler e enviar arquivo
                const fileContent = fs.readFileSync(fullPath);
                return res.status(200).send(fileContent);
            }
        }
        
        // Se não encontrar, tentar servir index.html
        const indexPath = path.join(projectRoot, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.setHeader('Content-Type', 'text/html');
            const indexContent = fs.readFileSync(indexPath);
            return res.status(200).send(indexContent);
        }
        
        // 404
        res.status(404).send(`Arquivo não encontrado: ${filePath}`);
    } catch (error) {
        console.error('Erro ao servir arquivo:', error);
        res.status(500).send('Erro interno do servidor');
    }
};

