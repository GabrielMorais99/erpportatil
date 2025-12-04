# 🎨 Guia de Migração para Tailwind CSS

## ✅ O que já foi migrado

### Arquivos atualizados:
- ✅ `css/input.css` - Componentes Tailwind criados
- ✅ `index.html` - Login migrado para Tailwind
- ✅ `gerenciamento.html` - Header e modais principais migrados

### Componentes Tailwind disponíveis:

#### Botões
```html
<!-- Botão primário -->
<button class="btn-primary">Texto</button>

<!-- Botão secundário -->
<button class="btn-secondary">Texto</button>

<!-- Botão pequeno -->
<button class="btn-small">Texto</button>
```

#### Cards
```html
<!-- Cards existentes continuam funcionando -->
<div class="item-card">...</div>
<div class="group-card">...</div>
<div class="cost-card">...</div>
<div class="summary-card">...</div>
```

#### Modais
```html
<div class="modal fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
    <div class="modal-content bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="modal-header px-6 py-4 text-white relative">
            <h2 class="text-xl font-semibold text-white">Título</h2>
            <span class="close absolute top-4 right-4 text-white text-2xl cursor-pointer hover:text-gray-200 transition-colors">&times;</span>
        </div>
        <div class="modal-body px-6 py-4 overflow-y-auto flex-1">
            <!-- Conteúdo -->
        </div>
        <div class="modal-footer px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
            <!-- Botões -->
        </div>
    </div>
</div>
```

#### Formulários
```html
<div class="form-group mb-4">
    <label class="block mb-2 text-sm font-medium text-gray-700">Label</label>
    <input type="text" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
</div>
```

## 📋 Próximos passos para migração completa

### 1. Toolbar e Search
**Localização:** `gerenciamento.html` linha ~423

**Antes:**
```html
<div class="toolbar">
    <div class="search-filter">
        <input type="text" id="globalSearchInput" />
    </div>
</div>
```

**Depois (Tailwind):**
```html
<div class="toolbar flex items-center gap-4 p-4 bg-white rounded-lg shadow-md mb-4">
    <div class="search-filter flex-1 relative">
        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        <input type="text" id="globalSearchInput" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
</div>
```

### 2. Tabs
**Localização:** `gerenciamento.html` (procure por `.content-tabs`)

**Antes:**
```html
<div class="content-tabs">
    <button class="tab-btn active">Tab 1</button>
    <button class="tab-btn">Tab 2</button>
</div>
```

**Depois (Tailwind):**
```html
<div class="content-tabs flex gap-2 border-b border-gray-200 mb-4 overflow-x-auto">
    <button class="tab-btn px-4 py-2 font-medium text-gray-600 border-b-2 border-transparent transition-colors active:text-primary active:border-primary">Tab 1</button>
    <button class="tab-btn px-4 py-2 font-medium text-gray-600 border-b-2 border-transparent transition-colors">Tab 2</button>
</div>
```

### 3. Grid de Itens
**Localização:** `gerenciamento.html` (procure por `.items-grid`)

**Antes:**
```html
<div class="items-grid">
    <div class="item-card">...</div>
</div>
```

**Depois (Tailwind):**
```html
<div class="items-grid grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
    <div class="item-card bg-white rounded-lg shadow-md p-4 transition-all hover:shadow-lg hover:-translate-y-0.5">...</div>
</div>
```

### 4. Cards de Estatísticas
**Localização:** `gerenciamento.html` (procure por `.stat-card`, `.summary-card`)

**Antes:**
```html
<div class="stat-card">
    <h3>Título</h3>
    <p>Valor</p>
</div>
```

**Depois (Tailwind):**
```html
<div class="stat-card bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
    <h3 class="text-lg font-semibold text-gray-800 mb-2">Título</h3>
    <p class="text-2xl font-bold text-primary">Valor</p>
</div>
```

### 5. Footer
**Localização:** `gerenciamento.html` linha ~1374

**Antes:**
```html
<footer class="footer">
    <p class="footer-text-cursive">Gerenciamento</p>
</footer>
```

**Depois (Tailwind):**
```html
<footer class="footer bg-gray-800 text-white py-4 px-6 text-center text-sm">
    <p class="footer-text-cursive" style="font-family: 'Dancing Script', cursive; font-size: 1.1rem;">Gerenciamento</p>
</footer>
```

## 🎯 Classes Tailwind Úteis

### Espaçamento
- `p-4` = padding 1rem
- `px-6` = padding horizontal 1.5rem
- `py-4` = padding vertical 1rem
- `mb-4` = margin-bottom 1rem
- `gap-4` = gap 1rem (flex/grid)

### Cores
- `bg-white` = fundo branco
- `text-gray-700` = texto cinza
- `border-gray-300` = borda cinza clara
- `text-primary` = usa `var(--primary-color)`
- `bg-primary` = usa `var(--primary-color)`

### Layout
- `flex` = display flex
- `flex-col` = flex-direction column
- `items-center` = align-items center
- `justify-between` = justify-content space-between
- `grid` = display grid
- `hidden` = display none

### Efeitos
- `rounded-lg` = border-radius grande
- `shadow-md` = sombra média
- `hover:shadow-lg` = sombra maior no hover
- `transition-all` = transição suave
- `focus:ring-2` = anel de foco

## ⚠️ Importante

1. **Mantenha classes existentes**: Não remova classes CSS antigas ainda, elas garantem compatibilidade
2. **Migre gradualmente**: Faça uma seção por vez e teste
3. **Use variáveis CSS**: Classes como `text-primary` e `bg-primary` usam suas variáveis CSS existentes
4. **Teste responsividade**: Sempre teste em mobile após migrar uma seção

## 🔄 Processo de Migração

1. Identifique a seção a migrar
2. Adicione classes Tailwind mantendo classes antigas
3. Teste a funcionalidade
4. Remova classes CSS antigas se tudo funcionar
5. Compile Tailwind: `npm run build:css`

## 📚 Recursos

- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [Tailwind Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- Componentes criados em `css/input.css`

## 🎨 Exemplo Completo: Card de Produto

**Antes:**
```html
<div class="item-card">
    <h3>Produto</h3>
    <p>R$ 99,90</p>
    <button class="btn-primary">Comprar</button>
</div>
```

**Depois (Tailwind):**
```html
<div class="item-card bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg hover:-translate-y-0.5">
    <h3 class="text-lg font-semibold text-gray-800 mb-2">Produto</h3>
    <p class="text-2xl font-bold text-primary mb-4">R$ 99,90</p>
    <button class="btn-primary w-full">Comprar</button>
</div>
```

---

**Dica:** Use o modo watch do Tailwind (`npm run build:css`) para ver mudanças em tempo real!

