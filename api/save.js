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
        
        if (JSONBIN_API_KEY && JSONBIN_BIN_ID) {
            // Salvar no JSONBin
            const fetch = require('node-fetch');
            const response = await fetch(`https://api.jsonbin.io/v3/b/${6922795b43b1c97be9bf0197 }`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_API_KEY
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ao salvar no JSONBin: ${errorText}`);
            }
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Dados salvos com sucesso',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        return res.status(500).json({ 
            error: 'Erro ao salvar dados',
            message: error.message 
        });
    }
};

