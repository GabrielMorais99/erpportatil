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
        const body =
            typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const userData = body?.data; // Dados do usuário (items, groups, costs, goals)
        const username = body?.username; // Nome do usuário

        console.log('🧭 [SAVE API] Requisição recebida', {
            username: username || null,
            hasData: !!userData,
            contentType: req.headers['content-type'] || 'unknown',
        });

        // Validar dados
        if (!userData || typeof userData !== 'object') {
            return res.status(400).json({ error: 'Dados inválidos' });
        }

        if (!username || typeof username !== 'string') {
            return res.status(400).json({ error: 'Username é obrigatório' });
        }

        console.log('📦 [SAVE API] Contagem de dados', {
            items: userData.items?.length || 0,
            groups: userData.groups?.length || 0,
            serviceGroups: userData.serviceGroups?.length || 0,
            costs: userData.costs?.length || 0,
            goals: userData.goals?.length || 0,
            completedSales: userData.completedSales?.length || 0,
            pendingOrders: userData.pendingOrders?.length || 0,
            serviceAppointments: userData.serviceAppointments?.length || 0,
        });

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

        // Carregar dados existentes do bin completo
        let allUsersData = { users: {} };
        try {
            const getResponse = await fetch(
                `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`,
                {
                    headers: {
                        'X-Master-Key': JSONBIN_API_KEY,
                    },
                }
            );

            if (getResponse.ok) {
                const getResult = await getResponse.json();
                const existingData = getResult.record || {};

                // Se os dados antigos não têm estrutura de usuários, migrar
                if (existingData.items || existingData.groups || existingData.costs || existingData.goals) {
                    // Dados antigos: migrar para estrutura de usuários
                    // Atribuir ao usuário "default" ou ao primeiro usuário que salvar
                    console.log('🔄 [SAVE] Migrando dados antigos para estrutura de usuários...');
                    allUsersData.users = {
                        [username]: {
                            items: existingData.items || [],
                            serviceGroups: existingData.serviceGroups || [],
                            groups: existingData.groups || [],
                            costs: existingData.costs || [],
                            goals: existingData.goals || [],
                            completedSales: existingData.completedSales || [],
                            pendingOrders: existingData.pendingOrders || [],
                            serviceAppointments: existingData.serviceAppointments || [],
                        }
                    };
                } else if (existingData.users) {
                    // Já está na nova estrutura
                    allUsersData = existingData;
                }
            }
        } catch (error) {
            console.warn('⚠️ [SAVE] Erro ao carregar dados existentes (bin pode estar vazio):', error.message);
            // Continuar com estrutura vazia
        }

        // Atualizar apenas os dados do usuário atual
        if (!allUsersData.users) {
            allUsersData.users = {};
        }
        allUsersData.users[username] = {
            items: userData.items || [],
            serviceGroups: userData.serviceGroups || [],
            serviceTypes: userData.serviceTypes || [],
            groups: userData.groups || [],
            costs: userData.costs || [],
            goals: userData.goals || [],
            completedSales: userData.completedSales || [],
            pendingOrders: userData.pendingOrders || [],
            serviceAppointments: userData.serviceAppointments || [],
            lastUpdate: new Date().toISOString(),
        };

        // Salvar no JSONBin - usar fetch nativo do Node.js 18+ (Vercel usa Node.js 18+)
        const response = await fetch(
            `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_API_KEY,
                },
                body: JSON.stringify(allUsersData),
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
