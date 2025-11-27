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

Usuários disponíveis:
- **Usuário:** `nilda` | **Senha:** `123`
- **Usuário:** `deivson` | **Senha:** `123`
- **Usuário:** `isaac` | **Senha:** `123`
- **Usuário:** `vinicius` | **Senha:** `123`

> Cada usuário possui seus próprios dados isolados e sincronizados na nuvem.

## 📋 Funcionalidades

- ✅ Tela de login com autenticação
- ✅ Cadastro e gestão de itens (roupas e eletrônicos)
- ✅ Criação de grupos mensais
- ✅ Registro de vendas por dia
- ✅ Resumo mensal com estatísticas
- ✅ Importar/Exportar dados em arquivo .txt
- ✅ Pesquisa e filtros
- ✅ Design responsivo com paleta vermelho/branco
- ✅ **NOVO:** Sistema de busca de comprovantes (por nome ou CPF)
- ✅ **NOVO:** Carrossel de últimos comprovantes na seção Pedidos Pendentes
- ✅ **NOVO:** Visualização completa de comprovantes de vendas
- ✅ **NOVO:** Agenda de serviços com calendário interativo
- ✅ **NOVO:** Pedidos pendentes com finalização e geração de comprovante
- ✅ **NOVO:** Armazenamento na nuvem (JSONBin) para sincronização entre dispositivos

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

Os dados são salvos de forma híbrida:
- **LocalStorage:** Armazenamento local no navegador para acesso rápido
- **Nuvem (JSONBin):** Sincronização automática na nuvem para acesso de qualquer dispositivo
- **Exportar:** Salvar todos os dados em um arquivo .txt para backup
- **Importar:** Carregar dados de um arquivo .txt previamente exportado

### Sincronização na Nuvem
- Os dados são automaticamente sincronizados com a nuvem (JSONBin) quando você faz login
- Cada usuário tem seus próprios dados isolados
- A sincronização acontece automaticamente ao salvar qualquer alteração

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

## 🆕 Novas Funcionalidades

### 🔍 Busca de Comprovantes
- Acesse pelo **Painel de Vendas** → Seção "Pedidos Pendentes" → Botão "Buscar Comprovantes"
- Busque comprovantes por:
  - **Nome do cliente:** Digite o nome completo ou parcial
  - **CPF:** Digite o CPF com ou sem formatação (o sistema formata automaticamente)
- A busca é realizada em tempo real conforme você digita
- Clique em um comprovante nos resultados para visualizar o recibo completo
- Todos os comprovantes de vendas finalizadas são salvos automaticamente

### 📋 Carrossel de Últimos Comprovantes
- Na seção **"Pedidos Pendentes"**, você encontrará o carrossel "Últimos Comprovantes"
- Exibe automaticamente os **3 comprovantes mais recentes**
- Navegação horizontal: arraste com o mouse ou toque na tela para ver os outros comprovantes
- Clique em qualquer comprovante para visualizar o recibo completo
- Atualização automática: quando um novo pedido é finalizado, o carrossel é atualizado automaticamente
- O carrossel sempre mantém apenas os 3 mais recentes (remove automaticamente o mais antigo)

### 📄 Visualização de Comprovantes
- Após finalizar uma venda ou pedido pendente, um preview do comprovante é exibido automaticamente
- O comprovante completo mostra:
  - Código do pedido (formato: PED-YYYYMMDD-XXXX)
  - Nome e CPF do cliente
  - Lista completa de itens com quantidades e valores
  - Valor total da compra
  - Data e hora da finalização
- Use o botão "Imprimir" para imprimir o comprovante diretamente
- Todos os comprovantes ficam salvos e podem ser buscados posteriormente

### 📅 Agenda de Serviços
- Acesse pelo **Painel de Serviços** → Seção "Agenda de Serviços"
- **Calendário Interativo:**
  - Visualize um mini calendário com os agendamentos do mês atual
  - Dias com agendamentos são destacados em amarelo
  - Clique no calendário para abrir o calendário completo
  - Navegue entre meses usando as setas
  - O calendário marca corretamente os dias com agendamentos (corrigido para ignorar problemas de timezone)
- **Próximos Agendamentos:**
  - Cards centralizados e com tamanho fixo (não esticam em telas grandes)
  - Ordenados por data/hora (mais próximos primeiro)
  - Agendamentos passados aparecem em tamanho menor e centralizados
  - Edite ou exclua agendamentos conforme necessário
- **Cadastro de Agendamentos:**
  - Tipo de serviço, cliente, data, horário e preço
  - Contato do cliente (telefone ou e-mail) e observações
  - Status: Pendente, Confirmado, Concluído ou Cancelado

### 🛒 Pedidos Pendentes Aprimorado
- Crie pedidos pendentes com múltiplos itens
- Defina data de vencimento para acompanhamento
- Status: Pendente, Confirmado ou Cancelado
- **Finalizar Pedido:** Converta em venda concluída quando o pagamento for realizado
- Após finalizar, um comprovante é gerado automaticamente e adicionado ao carrossel
- Todos os comprovantes ficam disponíveis para busca posterior

### 🎨 Melhorias de Interface
- **Cards de Agendamentos:** Tamanho fixo e centralizados em todas as resoluções
- **Calendário:** Correção na marcação de datas (ignora problemas de timezone)
- **Carrossel:** Navegação suave com arrastar (mouse e touch)
- **Responsividade:** Interface otimizada para desktop, tablet e mobile
- **Sem scrollbars visíveis:** Navegação dinâmica com mouse ou toque

