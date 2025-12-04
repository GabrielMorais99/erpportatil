# 🎨 Configuração do Tailwind CSS - ERP Portátil

## ✅ Instalação Completa

O Tailwind CSS foi configurado para trabalhar **junto** com seu CSS existente, sem quebrar nada!

## 📦 Instalar Dependências

```bash
npm install
```

## 🔨 Compilar Tailwind CSS

### Modo Desenvolvimento (watch mode - recompila automaticamente)
```bash
npm run build:css
```

### Modo Produção (minificado)
```bash
npm run build:css:prod
```

## 📁 Arquivos Criados

- `tailwind.config.js` - Configuração do Tailwind com suas cores e variáveis
- `postcss.config.js` - Configuração do PostCSS
- `css/input.css` - Arquivo de entrada do Tailwind
- `css/tailwind.css` - Arquivo compilado (gerado após build)

## 🎯 Como Usar

### 1. Primeiro, compile o Tailwind:
```bash
npm run build:css
```

### 2. Use classes Tailwind no HTML:

```html
<!-- Exemplo: Botão usando Tailwind -->
<button class="bg-primary-red text-white px-6 py-3 rounded-lg shadow-lg hover:bg-primary-red-dark">
  Clique Aqui
</button>

<!-- Exemplo: Card usando Tailwind -->
<div class="bg-white rounded-lg shadow-md p-6">
  <h2 class="text-gray-800 text-xl font-bold">Título</h2>
  <p class="text-gray-600 mt-2">Conteúdo do card</p>
</div>
```

### 3. Use suas variáveis CSS existentes:

```html
<!-- Classes que usam suas variáveis CSS -->
<div class="bg-primary text-primary border-primary">
  Usa var(--primary-color)
</div>

<!-- Sombras customizadas -->
<div class="shadow-custom-lg">
  Usa var(--shadow-lg)
</div>

<!-- Border radius customizado -->
<div class="rounded-custom-md">
  Usa var(--radius-md)
</div>
```

## 🎨 Cores Disponíveis

### Cores Primárias
- `bg-primary-red` / `text-primary-red` - #dc3545
- `bg-primary-red-dark` / `text-primary-red-dark` - #c82333
- `bg-primary-red-light` / `text-primary-red-light` - #e85563
- `bg-primary-blue` / `text-primary-blue` - #007bff
- `bg-primary-blue-dark` / `text-primary-blue-dark` - #0056b3
- `bg-primary-blue-light` / `text-primary-blue-light` - #4da3ff

### Cores usando Variáveis CSS
- `bg-primary` - usa `var(--primary-color)`
- `text-primary` - usa `var(--primary-color)`
- `border-primary` - usa `var(--primary-color)`

### Escala de Cinzas
- `bg-gray-50` até `bg-gray-900`
- `text-gray-50` até `text-gray-900`

## 🔧 Componentes Customizados

Já criados em `css/input.css`:

- `.btn-primary-tailwind` - Botão primário estilizado
- `.card-tailwind` - Card com sombra e hover
- `.input-tailwind` - Input com foco estilizado

## ⚠️ Importante

1. **Não quebra CSS existente**: O `preflight: false` garante que o Tailwind não sobrescreva seus estilos
2. **Use junto**: Você pode usar classes Tailwind E suas classes CSS existentes no mesmo elemento
3. **Variáveis CSS**: Todas as suas variáveis CSS (`--primary-color`, `--shadow-lg`, etc.) continuam funcionando
4. **Compile sempre**: Após instalar dependências, execute `npm run build:css` para gerar o arquivo `tailwind.css`

## 🚀 Próximos Passos

1. Execute `npm install` para instalar dependências
2. Execute `npm run build:css` para compilar Tailwind
3. Comece a usar classes Tailwind nos seus HTMLs
4. Use `emergent.sh` para auxiliar no design (conforme regras do projeto)

## 📚 Documentação

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Tailwind CSS Utilities](https://tailwindcss.com/docs/utility-first)

