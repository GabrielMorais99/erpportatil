// API Route para salvar dados na nuvem (Vercel Serverless Function)
module.exports = async (req, res) => {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = req.body;

        // Validar dados
        if (!data || typeof data !== 'object') {
            return res.status(400).json({ error: 'Dados inválidos' });
        }

        // Usar JSONBin.io (gratuito) para armazenar na nuvem
        const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
        const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;

        if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) {
            return res.status(200).json({
                success: false,
                message: 'Variáveis de ambiente não configuradas',
                error: 'JSONBIN_API_KEY ou JSONBIN_BIN_ID não estão definidas. Configure-as no painel da Vercel.',
                timestamp: new Date().toISOString(),
            });
        }

        // Salvar no JSONBin
        const fetch = require('node-fetch');
        const response = await fetch(
            `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_API_KEY,
                },
                body: JSON.stringify(data),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Erro ao salvar no JSONBin (${response.status})`;
            
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }
            
            throw new Error(errorMessage);
        }

        const result = await response.json();
        return res.status(200).json({
            success: true,
            message: 'Dados salvos na nuvem com sucesso',
            timestamp: new Date().toISOString(),
            binId: JSONBIN_BIN_ID,
        });
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        return res.status(500).json({
            error: 'Erro ao salvar dados',
            message: error.message,
        });
    }
};
