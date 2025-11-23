# Loja - Sistema de Gestão de Roupas

Sistema web para gestão de itens (roupas), vendas e controle mensal desenvolvido para Nilda.

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js instalado (versão 14 ou superior)
- npm (geralmente vem com Node.js)

### Instalação e Execução

1. **Instalar as dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o servidor:**
   ```bash
   npm start
   ```

3. **Acessar o projeto:**
   - Abra seu navegador e acesse: `http://localhost:3000`
   - O projeto será carregado automaticamente

### Scripts Disponíveis

- `npm start` - Inicia o servidor na porta 3000
- `npm run dev` - Inicia o servidor (mesmo que start)
- `npm test` - Verifica se tudo está configurado corretamente
- `npm run start:8000` - Inicia o servidor na porta 8000 (se 3000 estiver ocupada)

### Scripts Windows (.bat)

- `iniciar.bat` - Inicia o servidor (instala dependências se necessário)
- `iniciar-porta-livre.bat` - Encontra uma porta livre automaticamente
- `matar-porta.bat` - Finaliza processos usando a porta 3000

## 🔐 Credenciais de Acesso

- **Usuário:** `nilda`
- **Senha:** `123`

## 📋 Funcionalidades

- ✅ Tela de login com autenticação
- ✅ Cadastro e gestão de itens (roupas)
- ✅ Criação de grupos mensais
- ✅ Registro de vendas por dia
- ✅ Resumo mensal com estatísticas
- ✅ Importar/Exportar dados em arquivo .txt
- ✅ Pesquisa e filtros
- ✅ Design responsivo com paleta vermelho/branco

## 📁 Estrutura do Projeto

```
Projetos-financeiros/
├── index.html          # Tela de login
├── login.html          # Tela principal de gestão
├── css/
│   └── style.css      # Estilos do projeto
├── js/
│   ├── login.js       # Lógica de autenticação
│   └── app.js         # Sistema principal de gestão
├── server.js          # Servidor Node.js/Express
├── package.json       # Configuração do projeto Node.js
└── README.md          # Este arquivo
```

## 💾 Armazenamento de Dados

Os dados são salvos no `localStorage` do navegador. Você pode:
- **Exportar:** Salvar todos os dados em um arquivo .txt para backup
- **Importar:** Carregar dados de um arquivo .txt previamente exportado

## 🎨 Design

- **Cores principais:** Vermelho (#dc3545) e Branco (#ffffff)
- **Layout:** Responsivo, adaptável para desktop, tablet e mobile
- **Assinatura:** "Projeto Loja — por Nilda"

## 🔧 Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js com Express
- **Servidor:** Express (servindo arquivos estáticos)

## 📝 Notas

- O projeto utiliza HTML, CSS e JavaScript puro no frontend
- Node.js é usado apenas para servir os arquivos estáticos
- Dados são armazenados localmente no navegador (localStorage)
- Funciona em qualquer navegador moderno

## 🌐 Porta do Servidor

Por padrão, o servidor roda na porta **3000**. 

### Se a porta 3000 estiver ocupada:

**Opção 1:** Use outra porta diretamente:
```bash
PORT=8000 npm start
# ou
npm run start:8000
```

**Opção 2 (Windows):** Use o script que encontra porta livre automaticamente:
```bash
iniciar-porta-livre.bat
```

**Opção 3 (Windows):** Mate o processo na porta 3000:
```bash
matar-porta.bat
# Depois execute:
npm start
```

**Opção 4:** Pare o servidor anterior:
- Encontre o terminal onde o servidor está rodando
- Pressione `Ctrl+C` para parar
- Execute `npm start` novamente

