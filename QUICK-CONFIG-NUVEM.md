# ⚡ Configuração Rápida - Armazenamento na Nuvem

## 🎯 Passos (5 minutos)

### 1️⃣ Criar conta no JSONBin.io

1. Acesse: **https://jsonbin.io**
2. Clique em **"Sign Up"** (gratuito)
3. Crie sua conta
4. Após login, clique em **"Create Bin"**
5. Cole este JSON inicial:
```json
{
  "items": [],
  "groups": [],
  "costs": []
}
```
6. Clique em **"Create"**
7. Na página do Bin, copie:
   - **Bin ID** (ex: `507df1f3-0260-48b7-a304-920b8c5eddf1`)
   - **Master Key** (ex: `$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxx`)

### 2️⃣ Configurar na Vercel

1. Acesse: **https://vercel.com/dashboard**
2. Selecione seu projeto
3. Vá em **Settings > Environment Variables**
4. Adicione:

**Variável 1:**
- Name: `JSONBIN_API_KEY`
- Value: `sua_master_key_aqui`
- Environment: Production, Preview, Development (marque todos)

**Variável 2:**
- Name: `JSONBIN_BIN_ID`
- Value: `seu_bin_id_aqui`
- Environment: Production, Preview, Development (marque todos)

5. Clique em **Save** em cada uma
6. Faça um novo deploy (ou aguarde o automático)

### 3️⃣ Testar

1. Acesse seu site na Vercel
2. Faça login
3. Adicione um item ou venda
4. Os dados serão salvos automaticamente na nuvem! ☁️

## ✅ Como Funciona Agora

- ✅ **Salva localmente** (localStorage) - funciona offline
- ✅ **Salva na nuvem** (JSONBin) - quando online
- ✅ **Carrega da nuvem primeiro**, depois do localStorage
- ✅ **Sincronização automática**

## 🔄 Sincronização

Quando você:
- ✅ Adiciona um item → Salva local + nuvem
- ✅ Adiciona uma venda → Salva local + nuvem
- ✅ Adiciona um custo → Salva local + nuvem
- ✅ Abre o app → Carrega da nuvem primeiro

## 📱 Funciona em Qualquer Dispositivo

Agora seus dados estão na nuvem! Você pode:
- ✅ Acessar de qualquer computador
- ✅ Acessar do celular
- ✅ Dados sincronizados automaticamente

## 🆘 Problemas?

### "Dados não salvam na nuvem"
- Verifique se as variáveis de ambiente estão configuradas
- Verifique se fez um novo deploy após configurar
- Veja os logs: Vercel Dashboard > Functions > Logs

### "Erro 401"
- Verifique se a Master Key está correta
- Verifique se o Bin ID está correto

### "Dados não aparecem"
- Limpe o localStorage: F12 > Application > Local Storage > Clear
- Recarregue a página
- Os dados serão carregados da nuvem

## 📝 Notas

- ✅ Funciona mesmo sem JSONBin (usa apenas localStorage)
- ✅ JSONBin é gratuito até 10.000 requisições/mês
- ✅ Dados são criptografados
- ✅ Backup automático na nuvem

