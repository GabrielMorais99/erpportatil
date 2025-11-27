// API Route para administração (apenas para usuário admin)
module.exports = async (req, res) => {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Verificar se é requisição GET (obter dados) ou POST (obter estatísticas)
        const username = req.query.username || req.body.username;
        const action = req.query.action || req.body.action || 'all';

        // Verificar se é admin
        if (username !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Acesso negado. Apenas administradores podem acessar esta API.',
            });
        }

        // Carregar dados do JSONBin
        const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
        const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;

        if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) {
            return res.status(200).json({
                success: false,
                message: 'Variáveis de ambiente não configuradas',
                error: 'JSONBIN_API_KEY ou JSONBIN_BIN_ID não estão definidas.',
            });
        }

        // Obter dados do bin
        let response;
        let result;
        let allData = {};
        let usersData = {};

        try {
            response = await fetch(
                `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`,
                {
                    headers: {
                        'X-Master-Key': JSONBIN_API_KEY,
                    },
                }
            );

            if (!response.ok) {
                // Se o bin não existe ou está vazio, retornar dados vazios
                if (response.status === 404) {
                    console.log('Bin não encontrado, retornando dados vazios');
                    allData = {};
                    usersData = {};
                } else {
                    throw new Error(`Erro ao carregar do JSONBin (${response.status})`);
                }
            } else {
                result = await response.json();
                allData = result.record || {};
                usersData = allData.users || {};
            }
        } catch (fetchError) {
            console.error('Erro ao buscar dados do JSONBin:', fetchError);
            // Retornar dados vazios em caso de erro
            allData = {};
            usersData = {};
        }

        // Verificar se há dados válidos
        if (!allData || typeof allData !== 'object') {
            // Retornar dados vazios se não houver dados
            return res.status(200).json({
                success: true,
                totalUsage: {
                    binSize: 0,
                    binSizeKB: '0.00',
                    binSizeMB: '0.00',
                    freePlanLimitMB: 10,
                    freePlanLimitBytes: 10485760,
                    usagePercent: 0,
                    remainingMB: '10.00',
                    remainingKB: '10240.00',
                    isNearLimit: false,
                },
                usersUsage: [],
                timestamp: new Date().toISOString(),
            });
        }

        // Calcular tamanho do bin (aproximado em bytes)
        let binSize = 0;
        try {
            binSize = JSON.stringify(allData).length;
        } catch (e) {
            binSize = 0;
        }
        const binSizeKB = (binSize / 1024).toFixed(2);
        const binSizeMB = (binSize / (1024 * 1024)).toFixed(2);

        // Limite do plano gratuito do JSONBin: 10MB por bin
        const FREE_PLAN_LIMIT_MB = 10;
        const FREE_PLAN_LIMIT_BYTES = FREE_PLAN_LIMIT_MB * 1024 * 1024;
        const usagePercent = binSize > 0 ? ((binSize / FREE_PLAN_LIMIT_BYTES) * 100).toFixed(2) : '0.00';
        const remainingMBValue = FREE_PLAN_LIMIT_MB - parseFloat(binSizeMB);
        const remainingMB = remainingMBValue > 0 ? remainingMBValue.toFixed(2) : '0.00';

        // Processar dados de cada usuário
        let usersStats = [];
        try {
            if (usersData && typeof usersData === 'object' && Object.keys(usersData).length > 0) {
                usersStats = Object.keys(usersData).map((user) => {
                    try {
                        const userData = usersData[user] || {};
                        let userDataSize = 0;
                        try {
                            userDataSize = JSON.stringify(userData).length;
                        } catch (e) {
                            userDataSize = 0;
                        }
                        const userDataSizeKB = (userDataSize / 1024).toFixed(2);

                        // Contar itens
                        const itemsCount = Array.isArray(userData.items) ? userData.items.length : 0;
                        const groupsCount = Array.isArray(userData.groups) ? userData.groups.length : 0;
                        const serviceGroupsCount = Array.isArray(userData.serviceGroups) ? userData.serviceGroups.length : 0;
                        const costsCount = Array.isArray(userData.costs) ? userData.costs.length : 0;
                        const goalsCount = Array.isArray(userData.goals) ? userData.goals.length : 0;
                        const completedSalesCount = Array.isArray(userData.completedSales) ? userData.completedSales.length : 0;
                        const pendingOrdersCount = Array.isArray(userData.pendingOrders) ? userData.pendingOrders.length : 0;
                        const serviceAppointmentsCount = Array.isArray(userData.serviceAppointments) ? userData.serviceAppointments.length : 0;

                        // Calcular última atualização
                        let lastUpdate = null;
                        try {
                            if (userData.lastUpdate) {
                                lastUpdate = new Date(userData.lastUpdate);
                                if (isNaN(lastUpdate.getTime())) {
                                    lastUpdate = null;
                                }
                            }
                        } catch (e) {
                            lastUpdate = null;
                        }

                        return {
                            username: user || 'unknown',
                            dataSize: userDataSize,
                            dataSizeKB: userDataSizeKB,
                            itemsCount,
                            groupsCount,
                            serviceGroupsCount,
                            costsCount,
                            goalsCount,
                            completedSalesCount,
                            pendingOrdersCount,
                            serviceAppointmentsCount,
                            lastUpdate: lastUpdate
                                ? lastUpdate.toISOString()
                                : null,
                            lastUpdateFormatted: lastUpdate
                                ? lastUpdate.toLocaleString('pt-BR')
                                : 'Nunca',
                        };
                    } catch (e) {
                        console.error(`Erro ao processar usuário ${user}:`, e);
                        return {
                            username: user || 'unknown',
                            dataSize: 0,
                            dataSizeKB: '0.00',
                            itemsCount: 0,
                            groupsCount: 0,
                            serviceGroupsCount: 0,
                            costsCount: 0,
                            goalsCount: 0,
                            completedSalesCount: 0,
                            pendingOrdersCount: 0,
                            serviceAppointmentsCount: 0,
                            lastUpdate: null,
                            lastUpdateFormatted: 'Nunca',
                        };
                    }
                });
            }
        } catch (e) {
            console.error('Erro ao processar usuários:', e);
            usersStats = [];
        }

        // Ordenar por última atualização (mais recente primeiro)
        try {
            usersStats.sort((a, b) => {
                try {
                    if (!a.lastUpdate) return 1;
                    if (!b.lastUpdate) return -1;
                    const dateA = new Date(a.lastUpdate);
                    const dateB = new Date(b.lastUpdate);
                    if (isNaN(dateA.getTime())) return 1;
                    if (isNaN(dateB.getTime())) return -1;
                    return dateB.getTime() - dateA.getTime();
                } catch (e) {
                    return 0;
                }
            });
        } catch (e) {
            console.error('Erro ao ordenar usuários:', e);
        }

        // Evitar divisão por zero
        const safeBinSize = binSize > 0 ? binSize : 1;

        // Retornar apenas dados de uso do banco de dados
        return res.status(200).json({
            success: true,
            totalUsage: {
                binSize,
                binSizeKB,
                binSizeMB,
                freePlanLimitMB: FREE_PLAN_LIMIT_MB,
                freePlanLimitBytes: FREE_PLAN_LIMIT_BYTES,
                usagePercent: parseFloat(usagePercent) || 0,
                remainingMB: parseFloat(remainingMB) || 0,
                remainingKB: (parseFloat(remainingMB) * 1024).toFixed(2) || '0.00',
                isNearLimit: parseFloat(usagePercent) > 80,
            },
            usersUsage: (usersStats || []).map((user) => {
                try {
                    const dataSizeMB = user.dataSize > 0 ? (user.dataSize / (1024 * 1024)).toFixed(4) : '0.0000';
                    const usagePercent = safeBinSize > 0 && user.dataSize > 0 ? ((user.dataSize / safeBinSize) * 100).toFixed(2) : '0.00';
                    return {
                        username: user.username || 'unknown',
                        dataSize: user.dataSize || 0,
                        dataSizeKB: user.dataSizeKB || '0.00',
                        dataSizeMB: dataSizeMB,
                        usagePercent: usagePercent,
                        lastUpdate: user.lastUpdate || null,
                        lastUpdateFormatted: user.lastUpdateFormatted || 'Nunca',
                    };
                } catch (e) {
                    return {
                        username: user.username || 'unknown',
                        dataSize: 0,
                        dataSizeKB: '0.00',
                        dataSizeMB: '0.0000',
                        usagePercent: '0.00',
                        lastUpdate: null,
                        lastUpdateFormatted: 'Nunca',
                    };
                }
            }),
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Erro na API de administração:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao processar requisição',
            message: error.message,
        });
    }
};

