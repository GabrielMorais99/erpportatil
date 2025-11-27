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
        const response = await fetch(
            `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`,
            {
                headers: {
                    'X-Master-Key': JSONBIN_API_KEY,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Erro ao carregar do JSONBin (${response.status})`);
        }

        const result = await response.json();
        const allData = result.record || {};
        const usersData = allData.users || {};

        // Calcular tamanho do bin (aproximado em bytes)
        const binSize = JSON.stringify(allData).length;
        const binSizeKB = (binSize / 1024).toFixed(2);
        const binSizeMB = (binSize / (1024 * 1024)).toFixed(2);

        // Limite do plano gratuito do JSONBin: 10MB por bin
        const FREE_PLAN_LIMIT_MB = 10;
        const FREE_PLAN_LIMIT_BYTES = FREE_PLAN_LIMIT_MB * 1024 * 1024;
        const usagePercent = ((binSize / FREE_PLAN_LIMIT_BYTES) * 100).toFixed(2);
        const remainingMB = (FREE_PLAN_LIMIT_MB - parseFloat(binSizeMB)).toFixed(2);

        // Processar dados de cada usuário
        const usersStats = Object.keys(usersData).map((user) => {
            const userData = usersData[user];
            const userDataSize = JSON.stringify(userData).length;
            const userDataSizeKB = (userDataSize / 1024).toFixed(2);

            // Contar itens
            const itemsCount = (userData.items || []).length;
            const groupsCount = (userData.groups || []).length;
            const serviceGroupsCount = (userData.serviceGroups || []).length;
            const costsCount = (userData.costs || []).length;
            const goalsCount = (userData.goals || []).length;
            const completedSalesCount = (userData.completedSales || []).length;
            const pendingOrdersCount = (userData.pendingOrders || []).length;
            const serviceAppointmentsCount = (userData.serviceAppointments || []).length;

            // Calcular última atualização
            const lastUpdate = userData.lastUpdate
                ? new Date(userData.lastUpdate)
                : null;

            return {
                username: user,
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
        });

        // Ordenar por última atualização (mais recente primeiro)
        usersStats.sort((a, b) => {
            if (!a.lastUpdate) return 1;
            if (!b.lastUpdate) return -1;
            return new Date(b.lastUpdate) - new Date(a.lastUpdate);
        });

        // Calcular estatísticas gerais
        const totalUsers = usersStats.length;
        const totalItems = usersStats.reduce((sum, u) => sum + u.itemsCount, 0);
        const totalGroups = usersStats.reduce((sum, u) => sum + u.groupsCount, 0);
        const totalSales = usersStats.reduce(
            (sum, u) => sum + u.completedSalesCount,
            0
        );
        const totalAppointments = usersStats.reduce(
            (sum, u) => sum + u.serviceAppointmentsCount,
            0
        );

        // Retornar apenas dados de uso do banco de dados
        return res.status(200).json({
            success: true,
            totalUsage: {
                binSize,
                binSizeKB,
                binSizeMB,
                freePlanLimitMB: FREE_PLAN_LIMIT_MB,
                freePlanLimitBytes: FREE_PLAN_LIMIT_BYTES,
                usagePercent: parseFloat(usagePercent),
                remainingMB: parseFloat(remainingMB),
                remainingKB: (parseFloat(remainingMB) * 1024).toFixed(2),
                isNearLimit: parseFloat(usagePercent) > 80,
            },
            usersUsage: usersStats.map((user) => ({
                username: user.username,
                dataSize: user.dataSize,
                dataSizeKB: user.dataSizeKB,
                dataSizeMB: (user.dataSize / (1024 * 1024)).toFixed(4),
                usagePercent: ((user.dataSize / binSize) * 100).toFixed(2),
                lastUpdate: user.lastUpdate,
                lastUpdateFormatted: user.lastUpdateFormatted,
            })),
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

