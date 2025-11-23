# ☁️ Configurar Armazenamento na Nuvem

## Opção 1: JSONBin.io (Recomendado - Gratuito)

### Passo 1: Criar conta no JSONBin.io

1. Acesse: https://jsonbin.io
2. Crie uma conta gratuita
3. Crie um novo "Bin" (recipiente de dados)
4. Copie o **Bin ID** e a **Master Key**

### Passo 2: Configurar na Vercel

1. Acesse seu projeto na Vercel
2. Vá em **Settings > Environment Variables**
3. Adicione as variáveis:

```
JSONBIN_API_KEY = $2a$10$vk4a5ozqEcYILl/fYt9vPOoR6sLXWXysmXHqC3IN5DNT8z/Ea0mIO
JSONBIN_BIN_ID = 6922795b43b1c97be9bf0197
```

4. Clique em **Save**
5. Faça um novo deploy (ou aguarde o deploy automático)

### Passo 3: Testar

1. Acesse seu site na Vercel
2. Faça login e adicione alguns dados
3. Os dados serão salvos automaticamente na nuvem!

## Opção 2: Vercel KV (Redis) - Pago

Se preferir usar Vercel KV (mais robusto, mas pago):

1. Acesse: https://vercel.com/dashboard
2. Vá em **Storage > Create Database**
3. Escolha **KV** (Redis)
4. Siga as instruções
5. Atualize os arquivos `api/save.js` e `api/load.js`

## Opção 3: MongoDB Atlas (Gratuito)

1. Crie conta em: https://www.mongodb.com/cloud/atlas
2. Crie um cluster gratuito
3. Obtenha a connection string
4. Configure na Vercel como variável de ambiente
5. Atualize os arquivos da API

## ✅ Como Funciona

O sistema agora funciona em **modo híbrido**:

1. **Sempre salva no localStorage** (funciona offline)
2. **Tenta salvar na nuvem** (quando disponível)
3. **Carrega da nuvem primeiro**, depois do localStorage

### Vantagens:

-   ✅ Funciona offline (localStorage)
-   ✅ Sincroniza na nuvem quando online
-   ✅ Dados disponíveis em qualquer dispositivo
-   ✅ Backup automático

## 🔄 Sincronização

-   **Salvar:** Dados são salvos localmente E na nuvem
-   **Carregar:** Tenta carregar da nuvem primeiro, depois do localStorage
-   **Offline:** Funciona normalmente com localStorage

## 🆘 Troubleshooting

### Dados não salvam na nuvem

1. Verifique se as variáveis de ambiente estão configuradas
2. Verifique os logs na Vercel (Functions > Logs)
3. Verifique se o JSONBin está ativo

### Erro 401 (Unauthorized)

-   Verifique se a Master Key está correta
-   Verifique se o Bin ID está correto

### Dados não aparecem

-   Limpe o localStorage do navegador
-   Recarregue a página
-   Os dados serão carregados da nuvem

## 📝 Notas

-   O sistema funciona mesmo sem configuração na nuvem (usa apenas localStorage)
-   A configuração na nuvem é opcional, mas recomendada
-   Dados locais têm prioridade se houver conflito
