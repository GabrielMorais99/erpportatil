// API Route para carregar dados da nuvem (Vercel Serverless Function)
module.exports = async (req, res) => {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Carregar dados do JSONBin
        const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
        const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
        
        if (JSONBIN_API_KEY && JSONBIN_BIN_ID) {
            const fetch = require('node-fetch');
            const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
                headers: {
                    'X-Master-Key': JSONBIN_API_KEY
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                return res.status(200).json({ 
                    success: true, 
                    data: result.record || {
                        items: [],
                        groups: [],
                        costs: []
                    },
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Se não houver dados na nuvem, retornar vazio
        return res.status(200).json({ 
            success: true, 
            data: {
                items: [],
                groups: [],
                costs: []
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return res.status(500).json({ 
            error: 'Erro ao carregar dados',
            message: error.message 
        });
    }
};

