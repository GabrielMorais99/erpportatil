# 🔒 Isolamento de Dados por Usuário

## ✅ **SIM, cada usuário tem seus próprios dados salvos separadamente!**

---

## 📍 **Como Funciona**

### **1. Localhost (Desenvolvimento Local)**

#### **localStorage (Armazenamento Local)**
- **Chave única por usuário**: `lojaData_${username}`
- **Exemplo**: 
  - Usuário "nilda" → `lojaData_nilda`
  - Usuário "admin" → `lojaData_admin`
  - Usuário "deivson" → `lojaData_deivson`

#### **Código de Referência:**
```javascript
// Salvar (saveData)
const localStorageKey = username ? `lojaData_${username}` : 'lojaData';
localStorage.setItem(localStorageKey, JSON.stringify(data));

// Carregar (loadData)
const localStorageKey = username ? `lojaData_${username}` : 'lojaData';
let saved = localStorage.getItem(localStorageKey);
```

#### **Tema por Usuário:**
- **Chave**: `appTheme_${username}`
- Cada usuário pode ter seu próprio tema (vermelho/azul)

---

### **2. Vercel (Produção - Nuvem)**

#### **JSONBin.io (Armazenamento na Nuvem)**
- **Estrutura**: Um único bin JSON com todos os usuários
- **Isolamento**: Dados separados por usuário dentro do bin

#### **Estrutura no JSONBin:**
```json
{
  "users": {
    "nilda": {
      "items": [...],
      "groups": [...],
      "costs": [...],
      "goals": [...],
      "clients": [...],
      "completedSales": [...],
      "lastUpdate": "2025-01-29T..."
    },
    "admin": {
      "items": [...],
      "groups": [...],
      "costs": [...],
      "goals": [...],
      "clients": [...],
      "completedSales": [...],
      "lastUpdate": "2025-01-29T..."
    },
    "deivson": {
      "items": [...],
      "groups": [...],
      "costs": [...],
      "goals": [...],
      "clients": [...],
      "completedSales": [...],
      "lastUpdate": "2025-01-29T..."
    }
  }
}
```

#### **Código de Referência (api/save.js):**
```javascript
// Atualizar apenas os dados do usuário atual
allUsersData.users[username] = {
    items: userData.items || [],
    groups: userData.groups || [],
    costs: userData.costs || [],
    goals: userData.goals || [],
    clients: userData.clients || [],
    completedSales: userData.completedSales || [],
    lastUpdate: new Date().toISOString(),
};
```

#### **Código de Referência (api/load.js):**
```javascript
// Buscar dados do usuário específico
if (allData.users && allData.users[username]) {
    userData = allData.users[username];
}
```

---

## 🔐 **Segurança e Isolamento**

### **1. Identificação do Usuário**
- **Fonte**: `sessionStorage.getItem('username')`
- **Validação**: Verificado em cada operação de save/load
- **Sem username**: Dados salvos em chave genérica `lojaData` (não recomendado)

### **2. Criptografia (Opcional)**
- **Clientes e Fornecedores**: Podem ser criptografados por usuário
- **Chave de criptografia**: Gerada por usuário (`encryptionKeys[username]`)
- **Ativado**: `encryptionEnabled` por usuário

### **3. Permissões**
- **Níveis**: `admin`, `manager`, `user`
- **Isolamento**: Cada usuário só acessa seus próprios dados
- **Admin**: Pode ver dados de todos os usuários (via painel admin)

---

## 📊 **Fluxo de Dados**

### **Salvar (saveData):**
1. ✅ Obter `username` do `sessionStorage`
2. ✅ Salvar no `localStorage` com chave `lojaData_${username}`
3. ✅ Se estiver na Vercel, salvar na nuvem via `/api/save`
4. ✅ API atualiza apenas `allUsersData.users[username]`

### **Carregar (loadData):**
1. ✅ Obter `username` do `sessionStorage`
2. ✅ Tentar carregar da nuvem via `/api/load?username=${username}`
3. ✅ API retorna apenas `allUsersData.users[username]`
4. ✅ Se falhar, carregar do `localStorage` com chave `lojaData_${username}`
5. ✅ Migração automática: se não encontrar dados por usuário, tenta dados antigos

---

## 🧪 **Como Testar**

### **Teste 1: Localhost**
1. Fazer login como "nilda"
2. Adicionar alguns produtos
3. Fazer logout
4. Fazer login como "admin"
5. **Resultado esperado**: Admin não vê os produtos da "nilda"

### **Teste 2: Vercel**
1. Fazer login como "nilda" na Vercel
2. Adicionar alguns produtos
3. Fazer logout
4. Fazer login como "admin" na Vercel
5. **Resultado esperado**: Admin não vê os produtos da "nilda"

### **Teste 3: Verificar localStorage**
1. Abrir DevTools (F12)
2. Ir em "Application" → "Local Storage"
3. Verificar chaves:
   - `lojaData_nilda`
   - `lojaData_admin`
   - `appTheme_nilda`
   - `appTheme_admin`

---

## ⚠️ **Importante**

### **1. Sessão (sessionStorage)**
- **Duração**: Apenas enquanto a aba está aberta
- **Fechar aba**: Usuário precisa fazer login novamente
- **Segurança**: Não persiste entre sessões

### **2. Dados Antigos (Migração)**
- Se houver dados salvos na chave antiga `lojaData` (sem username)
- Sistema migra automaticamente para `lojaData_${username}` na primeira carga
- Dados antigos são preservados durante a migração

### **3. Admin (Usuário Especial)**
- **Painel Admin**: Pode ver dados de todos os usuários
- **Dados próprios**: Admin também tem seus próprios dados isolados
- **Acesso**: Via `/api/admin` (apenas para usuário "admin")

---

## 📝 **Resumo**

| Ambiente | Armazenamento | Isolamento | Chave |
|----------|---------------|------------|-------|
| **Localhost** | localStorage | ✅ Por usuário | `lojaData_${username}` |
| **Vercel** | JSONBin.io | ✅ Por usuário | `users[username]` |
| **Tema** | localStorage | ✅ Por usuário | `appTheme_${username}` |

---

## ✅ **Conclusão**

**SIM, cada usuário tem seus próprios dados salvos separadamente!**

- ✅ **Localhost**: Dados isolados por usuário no `localStorage`
- ✅ **Vercel**: Dados isolados por usuário no JSONBin.io
- ✅ **Segurança**: Identificação via `sessionStorage` e validação em cada operação
- ✅ **Migração**: Sistema migra dados antigos automaticamente
- ✅ **Admin**: Pode ver todos os dados, mas também tem seus próprios dados isolados

