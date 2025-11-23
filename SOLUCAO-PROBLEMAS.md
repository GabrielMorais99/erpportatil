# Solução de Problemas - Loja Sistema

## Erro: "Cannot find module 'express'"

**Causa:** As dependências não foram instaladas.

**Solução:**
```bash
npm install
```

Ou execute o script:
```bash
verificar-instalacao.bat
```

## Erro: "Node.js não encontrado"

**Causa:** Node.js não está instalado ou não está no PATH.

**Solução:**
1. Baixe e instale o Node.js: https://nodejs.org/
2. Reinicie o terminal após a instalação
3. Verifique a instalação: `node --version`

## Erro: "Port 3000 is already in use"

**Causa:** A porta 3000 já está sendo usada por outro processo.

**Solução 1:** Pare o processo que está usando a porta
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

**Solução 2:** Use outra porta
```bash
PORT=8000 npm start
```

Ou edite o arquivo `server.js` e altere:
```javascript
const PORT = process.env.PORT || 8000; // Mude de 3000 para 8000
```

## Erro: "npm não é reconhecido"

**Causa:** npm não está instalado ou não está no PATH.

**Solução:**
1. Reinstale o Node.js (npm vem junto)
2. Verifique se está no PATH do sistema
3. Reinicie o terminal

## Erro ao executar npm install

**Possíveis causas:**
- Sem conexão com internet
- Problemas com proxy/firewall
- Permissões insuficientes

**Soluções:**
1. Verifique sua conexão com a internet
2. Execute o terminal como administrador
3. Configure proxy se necessário:
   ```bash
   npm config set proxy http://proxy:port
   npm config set https-proxy http://proxy:port
   ```

## Erro: "EACCES: permission denied"

**Causa:** Problemas de permissão no Windows.

**Solução:**
1. Execute o terminal como administrador
2. Ou instale as dependências globalmente (não recomendado)

## O servidor inicia mas não carrega a página

**Possíveis causas:**
- Arquivos HTML não encontrados
- Problema com caminhos

**Solução:**
1. Verifique se os arquivos `index.html` e `login.html` existem na raiz do projeto
2. Verifique se a estrutura de pastas está correta:
   ```
   Projetos-financeiros/
   ├── index.html
   ├── login.html
   ├── css/
   ├── js/
   └── server.js
   ```

## Como verificar se tudo está correto

Execute o script de verificação:
```bash
verificar-instalacao.bat
```

Este script verifica:
- ✅ Node.js instalado
- ✅ npm instalado
- ✅ Dependências instaladas
- ✅ Express instalado

## Comandos úteis

```bash
# Verificar versão do Node.js
node --version

# Verificar versão do npm
npm --version

# Instalar dependências
npm install

# Iniciar servidor
npm start

# Ver processos na porta 3000
netstat -ano | findstr :3000
```

## Ainda com problemas?

1. Verifique se está na pasta correta do projeto
2. Execute `npm install` novamente
3. Delete a pasta `node_modules` e execute `npm install` novamente
4. Verifique os logs de erro no terminal

