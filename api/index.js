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

        // NÃO servir arquivos da pasta /api/ - eles são funções serverless
        if (filePath.startsWith('/api/')) {
            return res.status(404).json({ 
                error: 'Not found',
                message: 'API routes should be handled by serverless functions, not static file server'
            });
        }

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

        // Tentar múltiplos caminhos possíveis
        const possiblePaths = [
            path.join(projectRoot, cleanPath),
            path.join(__dirname, '..', cleanPath),
            path.join(process.cwd(), cleanPath),
            path.join('/var/task', cleanPath),
            path.join('/var/task', '..', cleanPath)
        ];

        let fullPath = null;
        for (const testPath of possiblePaths) {
            if (fs.existsSync(testPath)) {
                fullPath = testPath;
                console.log('Arquivo encontrado em:', testPath);
                break;
            }
        }

        // Se não encontrou, usar o primeiro caminho como padrão
        if (!fullPath) {
            fullPath = possiblePaths[0];
        }

        console.log('Clean Path:', cleanPath);
        console.log('Full Path:', fullPath);
        console.log('File Exists:', fs.existsSync(fullPath));
        console.log('Project Root:', projectRoot);
        console.log('__dirname:', __dirname);
        console.log('process.cwd():', process.cwd());
        
        // Debug: listar arquivos na raiz do projeto
        try {
            if (fs.existsSync(projectRoot)) {
                const rootFiles = fs.readdirSync(projectRoot);
                console.log('Arquivos na raiz do projeto:', rootFiles.slice(0, 20));
            }
            if (fs.existsSync(path.join(projectRoot, 'images'))) {
                const imageFiles = fs.readdirSync(path.join(projectRoot, 'images'));
                console.log('Arquivos na pasta images:', imageFiles);
            }
        } catch (err) {
            console.log('Erro ao listar arquivos:', err.message);
        }

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

                // Headers diferentes para imagens vs outros arquivos
                if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp'].includes(ext)) {
                    // Imagens: permitir cache mas forçar validação
                    res.setHeader(
                        'Cache-Control',
                        'public, max-age=31536000, immutable'
                    );
                } else {
                    // Outros arquivos: headers AGRESSIVOS para evitar cache
                    res.setHeader(
                        'Cache-Control',
                        'no-cache, no-store, must-revalidate, max-age=0, private, proxy-revalidate'
                    );
                    res.setHeader('Pragma', 'no-cache');
                    res.setHeader('Expires', '0');
                }
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
                
                // IMPORTANTE: Para CSS, garantir que o Content-Type está correto
                if (ext === '.css') {
                    res.setHeader('Content-Type', 'text/css; charset=utf-8');
                    console.log('Content-Type definido explicitamente para CSS');
                }

                // Ler e enviar arquivo
                try {
                    // Para imagens, ler como buffer binário
                    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp'].includes(ext)) {
                        const fileBuffer = fs.readFileSync(fullPath);
                        return res.status(200).send(fileBuffer);
                    }
                    
                    const fileContent = fs.readFileSync(fullPath, 'utf8');
                    
                    // Verificar se o arquivo CSS não está vazio
                    if (ext === '.css' && fileContent.length === 0) {
                        console.error('ERRO: Arquivo CSS está vazio!');
                        res.status(500).send('CSS file is empty');
                        return;
                    }

                    // Log para debug CSS
                    if (ext === '.css') {
                        console.log('=== CSS SENDO SERVIDO ===');
                        console.log('CSS Path:', cleanPath);
                        console.log('Full Path:', fullPath);
                        console.log('Content-Type:', res.getHeader('Content-Type'));
                        console.log('Tamanho do CSS:', fileContent.length, 'caracteres');
                        console.log('Primeiros 200 caracteres:', fileContent.substring(0, 200));
                        console.log('Últimos 50 caracteres:', fileContent.substring(fileContent.length - 50));
                    }
                    
                    // Log para debug JS
                    if (ext === '.js') {
                        console.log('=== JS SENDO SERVIDO ===');
                        console.log('JS Path:', cleanPath);
                        console.log('Content-Type:', res.getHeader('Content-Type'));
                        console.log('Tamanho do JS:', fileContent.length, 'caracteres');
                        
                        // Verificar se não é HTML disfarçado
                        if (fileContent.trim().startsWith('<!DOCTYPE') || fileContent.trim().startsWith('<html')) {
                            console.error('ERRO: Arquivo JS contém HTML!');
                            return res.status(404).send('File not found');
                        }
                    }
                    
                    // Log para debug de imagens
                    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp'].includes(ext)) {
                        console.log('=== IMAGEM SENDO SERVIDA ===');
                        console.log('Image Path:', cleanPath);
                        console.log('Content-Type:', res.getHeader('Content-Type'));
                    }

                    // Garantir que o CSS está sendo enviado corretamente
                    if (ext === '.css') {
                        console.log('Enviando CSS com status 200 OK');
                    }
                    
                    return res.status(200).send(fileContent);
                } catch (readError) {
                    console.error('Erro ao ler arquivo:', readError);
                    return res.status(500).send('Erro ao ler arquivo');
                }
            }
        }

        // Se não encontrar, tentar caminhos alternativos
        // Primeiro para JS (login.js e app.js)
        if (cleanPath.includes('js/login.js') || cleanPath.includes('login.js')) {
            const jsAltPaths = [
                path.join(projectRoot, 'js', 'login.js'),
                path.join(__dirname, '..', 'js', 'login.js'),
                path.join(process.cwd(), 'js', 'login.js')
            ];
            
            for (const altPath of jsAltPaths) {
                if (fs.existsSync(altPath)) {
                    console.log('login.js encontrado em caminho alternativo:', altPath);
                    const fileContent = fs.readFileSync(altPath, 'utf8');
                    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
                    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
                    res.setHeader('Pragma', 'no-cache');
                    res.setHeader('Expires', '0');
                    return res.status(200).send(fileContent);
                }
            }
            // Se não encontrou, retornar 404 em vez de HTML
            console.error('login.js não encontrado');
            return res.status(404).json({ error: 'login.js not found' });
        }
        
        if (cleanPath.includes('js/app.js') || cleanPath.includes('app.js') || filePath.includes('js/app.js')) {
            const jsAltPaths = [
                path.join(projectRoot, 'js', 'app.js'),
                path.join(__dirname, '..', 'js', 'app.js'),
                path.join(process.cwd(), 'js', 'app.js')
            ];
            
            for (const altPath of jsAltPaths) {
                if (fs.existsSync(altPath)) {
                    console.log('app.js encontrado em caminho alternativo:', altPath);
                    const fileContent = fs.readFileSync(altPath, 'utf8');
                    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
                    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
                    res.setHeader('Pragma', 'no-cache');
                    res.setHeader('Expires', '0');
                    return res.status(200).send(fileContent);
                }
            }
        }
        
        // Para CSS (prioridade)
        if (cleanPath.includes('css/style.css') || cleanPath.includes('style.css') || filePath.includes('css')) {
            const cssAltPaths = [
                path.join(projectRoot, 'css', 'style.css'),
                path.join(__dirname, '..', 'css', 'style.css'),
                path.join(process.cwd(), 'css', 'style.css'),
                path.join(projectRoot, 'style.css')
            ];
            
            for (const altPath of cssAltPaths) {
                if (fs.existsSync(altPath)) {
                    console.log('CSS encontrado em caminho alternativo:', altPath);
                    const fileContent = fs.readFileSync(altPath, 'utf8');
                    res.setHeader('Content-Type', 'text/css; charset=utf-8');
                    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
                    res.setHeader('Pragma', 'no-cache');
                    res.setHeader('Expires', '0');
                    return res.status(200).send(fileContent);
                }
            }
        }
        
        // Para gerenciamento.html
        if (cleanPath.includes('gerenciamento.html') || filePath.includes('gerenciamento.html')) {
            const htmlAltPaths = [
                path.join(projectRoot, 'gerenciamento.html'),
                path.join(__dirname, '..', 'gerenciamento.html'),
                path.join(process.cwd(), 'gerenciamento.html')
            ];
            
            for (const altPath of htmlAltPaths) {
                if (fs.existsSync(altPath)) {
                    console.log('gerenciamento.html encontrado em caminho alternativo:', altPath);
                    const fileContent = fs.readFileSync(altPath, 'utf8');
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
                    res.setHeader('Pragma', 'no-cache');
                    res.setHeader('Expires', '0');
                    return res.status(200).send(fileContent);
                }
            }
        }
        
        // Para manifest.json, tentar caminhos alternativos
        if (cleanPath.includes('manifest.json') || filePath.includes('manifest.json')) {
            const manifestAltPaths = [
                path.join(projectRoot, 'manifest.json'),
                path.join(__dirname, '..', 'manifest.json'),
                path.join(process.cwd(), 'manifest.json'),
                path.join('/var/task', 'manifest.json'),
                path.join('/var/task', '..', 'manifest.json')
            ];
            
            for (const altPath of manifestAltPaths) {
                if (fs.existsSync(altPath)) {
                    console.log('manifest.json encontrado em caminho alternativo:', altPath);
                    const fileContent = fs.readFileSync(altPath, 'utf8');
                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                    res.setHeader('Cache-Control', 'public, max-age=3600');
                    return res.status(200).send(fileContent);
                }
            }
            console.error('manifest.json não encontrado em nenhum caminho');
            console.error('Caminhos tentados:', manifestAltPaths);
            return res.status(404).json({ error: 'manifest.json not found' });
        }
        
        // Para imagens, tentar caminhos alternativos antes de retornar 404
        if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp'].some(ext => cleanPath.endsWith(ext))) {
            const imageAltPaths = [
                path.join(projectRoot, cleanPath),
                path.join(__dirname, '..', cleanPath),
                path.join(process.cwd(), cleanPath),
                path.join('/var/task', cleanPath),
                path.join('/var/task', '..', cleanPath)
            ];
            
            for (const altPath of imageAltPaths) {
                if (fs.existsSync(altPath)) {
                    console.log('Imagem encontrada em caminho alternativo:', altPath);
                    const ext = path.extname(altPath).toLowerCase();
                    const contentTypes = {
                        '.png': 'image/png',
                        '.jpg': 'image/jpeg',
                        '.jpeg': 'image/jpeg',
                        '.gif': 'image/gif',
                        '.svg': 'image/svg+xml',
                        '.ico': 'image/x-icon',
                        '.webp': 'image/webp'
                    };
                    const contentType = contentTypes[ext] || 'image/png';
                    res.setHeader('Content-Type', contentType);
                    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                    const fileBuffer = fs.readFileSync(altPath);
                    return res.status(200).send(fileBuffer);
                }
            }
            console.error('Imagem não encontrada em nenhum caminho:', cleanPath);
            console.error('Caminhos tentados:', imageAltPaths);
            return res.status(404).send('Image not found');
        }
        
        // Para arquivos JS, retornar 404 se não encontrado (não servir HTML)
        if (cleanPath.endsWith('.js')) {
            console.error('Arquivo JS não encontrado:', cleanPath);
            return res.status(404).json({ error: 'JavaScript file not found' });
        }
        
        // Se não encontrar, tentar servir index.html como fallback APENAS para rotas HTML
        if (cleanPath.endsWith('.html') || filePath === '/' || filePath === '') {
            const indexPath = path.join(projectRoot, 'index.html');
            if (fs.existsSync(indexPath)) {
                console.log('Servindo index.html como fallback');
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                const indexContent = fs.readFileSync(indexPath, 'utf8');
                return res.status(200).send(indexContent);
            }
        }

        // 404
        console.error('Arquivo não encontrado:', filePath);
        console.error('Caminhos tentados:', {
            fullPath: fullPath,
            projectRoot: projectRoot,
            cleanPath: cleanPath
        });
        res.status(404).send(`Arquivo não encontrado: ${filePath}`);
    } catch (error) {
        console.error('Erro ao servir arquivo:', error);
        res.status(500).send('Erro interno do servidor');
    }
};
