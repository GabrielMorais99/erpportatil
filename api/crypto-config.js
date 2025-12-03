/**
 * API para fornecer configuração de criptografia de forma segura
 * Os salts são armazenados como variáveis de ambiente no servidor
 * e nunca expostos no código do cliente
 *
 * Compatível com Vercel Serverless Functions
 *
 * IMPORTANTE: O salt derivado é DETERMINÍSTICO por usuário
 * Isso garante que a mesma chave seja gerada para o mesmo usuário
 */

const crypto = require('crypto');

module.exports = async (req, res) => {
    // Habilitar CORS para funcionar na Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, X-Username, X-Session-Id'
    );

    // Tratar preflight request (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Verificar se é requisição GET
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Método não permitido',
        });
    }

    // Verificar se o usuário está autenticado
    const username = req.headers['x-username'];

    if (!username) {
        return res.status(401).json({
            success: false,
            error: 'Usuário não autenticado',
        });
    }

    try {
        // Obter salts das variáveis de ambiente
        // Em produção, esses valores DEVEM ser configurados nas variáveis de ambiente
        const secretSalt =
            process.env.CRYPTO_SECRET_SALT || generateFallbackSalt('secret');
        const encryptionSalt =
            process.env.CRYPTO_ENCRYPTION_SALT ||
            generateFallbackSalt('encryption');

        // Gerar um salt derivado DETERMINÍSTICO para o usuário
        // O mesmo usuário sempre recebe o mesmo salt derivado
        const userDerivedSalt = await deriveUserSalt(username, secretSalt);

        // Retornar configuração (os salts base nunca são expostos diretamente)
        res.status(200).json({
            success: true,
            config: {
                // O salt derivado é único e FIXO por usuário
                derivedSalt: userDerivedSalt,
                // Configurações de criptografia
                algorithm: 'AES-GCM',
                keyLength: 256,
                iterations: 100000,
                hashAlgorithm: 'SHA-256',
            },
        });
    } catch (error) {
        console.error('❌ [CRYPTO-CONFIG] Erro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao obter configuração de criptografia',
        });
    }
};

/**
 * Gera um salt de fallback para desenvolvimento
 * Em produção, SEMPRE use variáveis de ambiente
 * @param {string} type - Tipo do salt (secret ou encryption)
 * @returns {string} Salt em base64
 */
function generateFallbackSalt(type) {
    // Fallback determinístico para desenvolvimento
    // Em produção, isso NUNCA deve ser usado - configure as variáveis de ambiente!
    console.warn(
        `⚠️ [CRYPTO] Usando fallback para ${type} - configure CRYPTO_${type.toUpperCase()}_SALT!`
    );

    // Criar um salt baseado no tipo (determinístico para não quebrar entre reinícios)
    const fallbackBase = `erp-portatil-fallback-${type}-v1`;
    return crypto.createHash('sha256').update(fallbackBase).digest('base64');
}

/**
 * Deriva um salt único e DETERMINÍSTICO para cada usuário usando PBKDF2
 * O mesmo usuário sempre recebe o mesmo salt derivado
 * Isso é ESSENCIAL para que a criptografia/descriptografia funcione
 *
 * @param {string} username - Nome do usuário
 * @param {string} baseSalt - Salt base do servidor
 * @returns {Promise<string>} Salt derivado em base64
 */
async function deriveUserSalt(username, baseSalt) {
    return new Promise((resolve, reject) => {
        // PBKDF2: Password-Based Key Derivation Function 2
        // - username: a "senha" para derivar
        // - baseSalt: o salt do servidor
        // - 100000: número de iterações (segurança)
        // - 32: tamanho da chave em bytes (256 bits)
        // - sha256: algoritmo de hash
        crypto.pbkdf2(
            username,
            baseSalt,
            100000,
            32,
            'sha256',
            (err, derivedKey) => {
                if (err) {
                    console.error('❌ [CRYPTO] Erro no PBKDF2:', err);
                    reject(err);
                    return;
                }
                resolve(derivedKey.toString('base64'));
            }
        );
    });
}
