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
        // Obter username da query string
        const username = req.query.username;

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ 
                success: false,
                error: 'Username é obrigatório na query string (?username=...)',
                data: {
                    items: [],
                    groups: [],
                    serviceGroups: [],
                    costs: [],
                    goals: [],
                    completedSales: [],
                    pendingOrders: [],
                    serviceAppointments: []
                },
                timestamp: new Date().toISOString()
            });
        }

        // Carregar dados do JSONBin
        const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
        const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
        
        if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) {
            return res.status(200).json({ 
                success: false,
                message: 'Variáveis de ambiente não configuradas',
                error: 'JSONBIN_API_KEY ou JSONBIN_BIN_ID não estão definidas. Configure-as no painel da Vercel.',
                data: {
                    items: [],
                    groups: [],
                    serviceGroups: [],
                    costs: [],
                    goals: [],
                    completedSales: [],
                    pendingOrders: [],
                    serviceAppointments: []
                },
                timestamp: new Date().toISOString()
            });
        }
        
        // Usar fetch nativo do Node.js 18+ (Vercel usa Node.js 18+)
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            const allData = result.record || {};
            
            // Verificar se é estrutura antiga (sem users) ou nova (com users)
            let userData = {
                items: [],
                groups: [],
                serviceGroups: [],
                costs: [],
                goals: [],
                completedSales: [],
                pendingOrders: [],
                serviceAppointments: []
            };

            if (allData.users && allData.users[username]) {
                // Nova estrutura: buscar dados do usuário específico
                userData = allData.users[username];
            } else if (allData.items || allData.groups || allData.costs || allData.goals) {
                // Estrutura antiga: retornar dados antigos apenas se for o primeiro acesso
                // (migração será feita no save)
                console.log('🔄 [LOAD] Dados antigos detectados, retornando vazios para forçar migração no próximo save');
                userData = {
                    items: [],
                    groups: [],
                    serviceGroups: [],
                    costs: [],
                    goals: [],
                    completedSales: [],
                    pendingOrders: [],
                    serviceAppointments: []
                };
            }

            return res.status(200).json({ 
                success: true, 
                data: userData,
                timestamp: new Date().toISOString(),
                binId: JSONBIN_BIN_ID,
                username: username
            });
        } else if (response.status === 404) {
            // Bin não encontrado ou vazio - retornar vazio
            return res.status(200).json({ 
                success: true,
                message: 'Bin não encontrado ou vazio',
                data: {
                    items: [],
                    groups: [],
                    serviceGroups: [],
                    costs: [],
                    goals: [],
                    completedSales: [],
                    pendingOrders: [],
                    serviceAppointments: []
                },
                timestamp: new Date().toISOString()
            });
        } else {
            const errorText = await response.text();
            throw new Error(`Erro ao carregar do JSONBin (${response.status}): ${errorText}`);
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return res.status(500).json({ 
            error: 'Erro ao carregar dados',
            message: error.message 
        });
    }
};

