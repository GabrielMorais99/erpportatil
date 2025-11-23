# 🔧 Solução: Porta 3000 já está em uso

## ❌ Erro Comum
```
Error: listen EADDRINUSE: address already in use :::3000
```

Isso significa que a porta 3000 já está sendo usada por outro processo (provavelmente outro servidor Node.js rodando).

## ✅ Soluções Rápidas

### Solução 1: Usar Script Automático (Mais Fácil)
```bash
# Windows - Encontra porta livre automaticamente
iniciar-porta-livre.bat
```

### Solução 2: Matar Processo na Porta 3000
```bash
# Windows
matar-porta.bat

# Depois execute:
npm start
```

### Solução 3: Usar Outra Porta
```bash
# Windows (PowerShell)
$env:PORT=8000; npm start

# Windows (CMD)
set PORT=8000 && npm start

# Ou use o script npm
npm run start:8000
```

### Solução 4: Parar Servidor Anterior
1. Encontre o terminal onde o servidor está rodando
2. Pressione `Ctrl+C` para parar
3. Execute `npm start` novamente

### Solução 5: Encontrar e Matar Processo Manualmente

**Windows:**
```bash
# Encontrar processo na porta 3000
netstat -ano | findstr :3000

# Matar processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Encontrar processo
lsof -i :3000

# Matar processo
kill -9 <PID>
```

## 🎯 Recomendação

Use o script `iniciar-porta-livre.bat` - ele automaticamente encontra uma porta livre e inicia o servidor!

