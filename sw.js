// Service Worker para PWA - Versão 7.1
// Suporte a cache, notificações push e sincronização em background
// Estratégia: Network First (sempre busca da rede primeiro, cache como fallback)
// ATUALIZADO: 2024-12-04 - Cache bust agressivo + skipWaiting + purge total
const ASSET_VERSION = '2025120927-cache-bust-v13';
const CACHE_NAME = `loja-vendas-v16-${ASSET_VERSION}`;
const RUNTIME_CACHE = `loja-vendas-runtime-v16-${ASSET_VERSION}`;
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
const urlsToCache = [
    '/',
    `/index.html?v=${ASSET_VERSION}`,
    `/gerenciamento.html?v=${ASSET_VERSION}`,
    `/css/style.css?v=${ASSET_VERSION}`,
    `/css/style-mobile-fix.css?v=${ASSET_VERSION}`,
    `/css/tailwind.css?v=${ASSET_VERSION}`,
    `/js/login.js?v=${ASSET_VERSION}`,
    `/js/app.js?v=${ASSET_VERSION}`,
    `/js/skeleton-manager.js?v=${ASSET_VERSION}`,
    `/manifest.json?v=${ASSET_VERSION}`,
    `/images/icone-e-transicao.jpg?v=${ASSET_VERSION}`,
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker v10...');
    event.waitUntil(
        // PRIMEIRO: Limpar TODOS os caches antigos
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    console.log('[SW] Removendo cache antigo:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        })
        .then(() => {
            // DEPOIS: Criar novo cache
            return caches.open(CACHE_NAME);
        })
        .then((cache) => {
            console.log('[SW] Cache aberto:', CACHE_NAME);
            // Cachear recursos críticos
            return cache
                .addAll(
                    urlsToCache.map(
                        (url) => new Request(url, { cache: 'reload' })
                    )
                )
                .catch((error) => {
                    console.warn(
                        '[SW] Erro ao cachear alguns recursos:',
                        error
                    );
                    // Continuar mesmo se alguns recursos falharem
                });
        })
        .then(() => {
            // Forçar ativação imediata para limpar cache antigo
            return self.skipWaiting();
        })
    );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Ativando Service Worker v8.2 (Network First + Force Update)...');
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                // Remover TODOS os caches anteriores (purge total)
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        console.log('[SW] Removendo cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            })
            .then(() => {
                // Assumir controle de todas as páginas imediatamente
                return self.clients.claim();
            })
            .then(() => {
                // Notificar todos os clientes para recarregar
                return self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({ type: 'SW_UPDATED', action: 'reload' });
                    });
                });
            })
            .then(() => {
                console.log(
                    '[SW] Service Worker ativado - todos os caches removidos, forçando atualização'
                );
            })
    );
});

// Estratégia de cache: Network First com fallback para cache
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // DETECTAR LOCALHOST: Desabilitar cache em desenvolvimento
    const isLocalhost =
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.hostname === '[::1]' ||
        url.hostname.includes('.local');

    // Em localhost, sempre buscar da rede (sem cache)
    if (isLocalhost) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Não fazer cache em localhost
                    return response;
                })
                .catch(() => {
                    // Se falhar, retornar página offline se for HTML
                    if (event.request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                    throw new Error('Network request failed');
                })
        );
        return;
    }

    // Ignorar requisições de API e externas
    if (
        url.origin !== self.location.origin &&
        !url.pathname.startsWith('/api/')
    ) {
        return; // Deixar o navegador lidar com requisições externas
    }

    // version.json - SEMPRE buscar da rede, NUNCA usar cache
    // BYPASS TOTAL DO SERVICE WORKER para version.json
    if (url.pathname === '/version.json' || url.pathname.endsWith('/version.json')) {
        // IGNORAR COMPLETAMENTE o Service Worker para version.json
        // Deixar o navegador buscar diretamente da rede
        event.respondWith(
            fetch(new Request(event.request.url, { 
                method: 'GET',
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }))
                .then((response) => {
                    // Criar nova response sem cache
                    const newResponse = new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                            'Pragma': 'no-cache',
                            'Expires': '0',
                            'Content-Type': response.headers.get('Content-Type') || 'application/json'
                        }
                    });
                    // NUNCA cachear version.json
                    return newResponse;
                })
                .catch((error) => {
                    // Se falhar, retornar erro (não usar cache)
                    console.error('[SW] Erro ao buscar version.json:', error);
                    throw error;
                })
        );
        return;
    }
    
    // HTML - SEMPRE buscar da rede, NUNCA usar cache
    if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === '/index.html') {
        event.respondWith(
            fetch(new Request(event.request.url + '?t=' + Date.now(), { 
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            }))
                .then((response) => {
                    // NUNCA cachear HTML
                    return response;
                })
                .catch((error) => {
                    // Se falhar, retornar erro (não usar cache de HTML)
                    throw error;
                })
        );
        return;
    }
    
    // Para arquivos estáticos (CSS, JS), usar NETWORK FIRST
    // Sempre buscar da rede primeiro, usar cache apenas se rede falhar
    if (
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.png')
    ) {
        event.respondWith(
            fetch(new Request(event.request, { cache: 'no-store' }))
                .then((response) => {
                    // Retornar sempre rede; não cachear CSS/JS para evitar versões antigas
                    return response;
                })
                .catch((error) => {
                    // Fallback: tentar cache se rede falhar
                    return caches
                        .match(event.request)
                        .then((cachedResponse) => {
                            if (cachedResponse) return cachedResponse;
                            throw error;
                        });
                })
        );
        return;
    }

    // Para requisições de API, sempre buscar da rede primeiro
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Se estiver offline, retornar resposta em cache se disponível
                    if (!response || response.status !== 200) {
                        return caches.match(event.request);
                    }
                    return response;
                })
                .catch(() => {
                    // Se falhar, tentar cache como último recurso
                    return caches
                        .match(event.request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // Retornar resposta offline padrão
                            return new Response(
                                JSON.stringify({
                                    success: false,
                                    error: 'Offline - dados não disponíveis',
                                    offline: true,
                                }),
                                {
                                    status: 503,
                                    statusText: 'Service Unavailable',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                }
                            );
                        });
                })
        );
        return;
    }

    // Para outras requisições, usar estratégia Network First
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// ========== NOTIFICAÇÕES PUSH ==========

// Receber mensagem push
self.addEventListener('push', (event) => {
    console.log('[SW] Push recebido:', event);

    let notificationData = {
        title: 'Gerenciamento de Loja',
        body: 'Você tem uma nova notificação',
        icon: '/images/icone-e-transicao.jpg',
        badge: '/images/icone-e-transicao.jpg',
        tag: 'loja-notification',
        requireInteraction: false,
        data: {},
    };

    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                ...notificationData,
                ...data,
                data: data,
            };
        } catch (e) {
            notificationData.body = event.data.text() || notificationData.body;
        }
    }

    event.waitUntil(
        self.registration.showNotification(
            notificationData.title,
            notificationData
        )
    );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notificação clicada:', event);

    event.notification.close();

    const notificationData = event.notification.data || {};
    const urlToOpen = notificationData.url || '/gerenciamento.html';

    event.waitUntil(
        clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Verificar se já existe uma janela aberta
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }

                // Se não houver janela aberta, abrir uma nova
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Fechar notificação
self.addEventListener('notificationclose', (event) => {
    console.log('[SW] Notificação fechada:', event);
});

// ========== SINCRONIZAÇÃO EM BACKGROUND ==========

// Sincronização em background (quando conexão voltar)
self.addEventListener('sync', (event) => {
    console.log('[SW] Sincronização em background:', event.tag);

    if (event.tag === 'sync-data') {
        event.waitUntil(
            syncData()
                .then(() => {
                    console.log('[SW] Sincronização concluída');
                    return self.registration.showNotification(
                        'Gerenciamento de Loja',
                        {
                            body: 'Dados sincronizados com sucesso!',
                            icon: '/images/icone-e-transicao.jpg',
                            tag: 'sync-success',
                        }
                    );
                })
                .catch((error) => {
                    console.error('[SW] Erro na sincronização:', error);
                })
        );
    }
});

// Função de sincronização de dados
async function syncData() {
    try {
        // Buscar dados pendentes do IndexedDB ou localStorage
        // e enviar para o servidor
        const response = await fetch('/api/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Dados a serem sincronizados
                // Isso será implementado no app.js
            }),
        });

        if (response.ok) {
            console.log('[SW] Dados sincronizados com sucesso');
        } else {
            throw new Error('Erro ao sincronizar dados');
        }
    } catch (error) {
        console.error('[SW] Erro na sincronização:', error);
        throw error;
    }
}

// ========== MENSAGENS DO CLIENTE ==========

// Receber mensagens do cliente
self.addEventListener('message', (event) => {
    console.log('[SW] Mensagem recebida:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(RUNTIME_CACHE).then((cache) => {
                return cache.addAll(event.data.urls);
            })
        );
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        return caches.delete(cacheName);
                    })
                );
            })
        );
    }
});
