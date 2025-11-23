// Service Worker para PWA
// IMPORTANTE: Versão atualizada para forçar atualização do cache
const CACHE_NAME = 'loja-vendas-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/css/style.css',
  '/js/login.js',
  '/js/app.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Para CSS e JS, sempre buscar da rede primeiro (evitar cache)
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Buscar da rede primeiro, não usar cache
          return response;
        })
        .catch(() => {
          // Se falhar, tentar do cache como fallback
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Para outros arquivos, usar cache primeiro
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retornar do cache se disponível, senão buscar da rede
        return response || fetch(event.request);
      })
  );
});

