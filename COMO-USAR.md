# Como Usar o Projeto

## 🚀 Iniciar o Servidor

### Opção 1: npm start (Recomendado)
```bash
npm start
```

### Opção 2: Script automático (Windows)
```bash
# Clique duas vezes em:
iniciar.bat
```

### Opção 3: Testar antes de iniciar
```bash
# Verificar se tudo está configurado
npm test

# Depois iniciar
npm start
```

## 📋 Passos Completos

1. **Instalar dependências (primeira vez apenas):**
   ```bash
   npm install
   ```

2. **Iniciar o servidor:**
   ```bash
   npm start
   ```

3. **Acessar no navegador:**
   - URL: `http://localhost:3000`
   - Usuário: `nilda`
   - Senha: `123`

## 🔧 Solução de Problemas

### Erro: "Cannot find module 'express'"
```bash
npm install
```

### Erro: "Port 3000 already in use"
Use outra porta:
```bash
PORT=8000 npm start
```

### Verificar se está tudo OK
```bash
npm test
```

## ✅ Funcionalidades Corrigidas

- ✅ Modal de grupo mensal agora fecha corretamente (botão X e clicando fora)
- ✅ npm start funciona diretamente no terminal
- ✅ Script de teste para verificar configuração

