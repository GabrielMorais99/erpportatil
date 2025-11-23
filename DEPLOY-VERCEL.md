# 🚀 Deploy na Vercel - Guia Completo

## Pré-requisitos

1. Conta no GitHub (já tem: GabrielMorais99)
2. Conta na Vercel (gratuita): https://vercel.com
3. Projeto já commitado no GitHub

## Passo a Passo

### 1. Criar Conta na Vercel

1. Acesse: https://vercel.com
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub"
4. Autorize a Vercel a acessar seus repositórios

### 2. Fazer Deploy

#### Opção A: Via Interface Web (Recomendado)

1. Acesse: https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione o repositório: `gerenciadorloja`
4. A Vercel detectará automaticamente as configurações
5. Clique em "Deploy"
6. Aguarde alguns minutos
7. Pronto! Você receberá uma URL como: `https://gerenciadorloja.vercel.app`

#### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### 3. Configurações Importantes

O arquivo `vercel.json` já está configurado para:
- ✅ Servir arquivos estáticos (HTML, CSS, JS)
- ✅ Rodar o servidor Node.js
- ✅ Rotas corretas

### 4. Variáveis de Ambiente (se necessário)

Se precisar de variáveis de ambiente:
1. Vá em Settings > Environment Variables
2. Adicione as variáveis necessárias

### 5. Atualizações Futuras

Após o primeiro deploy, qualquer push para o GitHub:
```bash
git add .
git commit -m "Atualização"
git push
```

A Vercel fará deploy automático! 🎉

## 📱 PWA - Instalar no Celular

### Android (Chrome)

1. Abra o site no Chrome
2. Menu (3 pontos) > "Adicionar à tela inicial"
3. Confirme
4. O app aparecerá como um app nativo!

### iOS (Safari)

1. Abra o site no Safari
2. Compartilhar (ícone de compartilhar)
3. "Adicionar à Tela de Início"
4. Confirme
5. O app aparecerá na tela inicial!

## 🔧 Troubleshooting

### Erro: "Build Failed"
- Verifique se o `package.json` está correto
- Verifique se todas as dependências estão listadas

### Erro: "Module not found"
- Execute `npm install` localmente primeiro
- Verifique se `node_modules` está no `.gitignore`

### PWA não funciona
- Verifique se o site está em HTTPS (Vercel fornece automaticamente)
- Verifique se o `manifest.json` está acessível
- Verifique se o `sw.js` está registrado

## 📝 Checklist de Deploy

- [ ] Projeto commitado no GitHub
- [ ] Conta Vercel criada
- [ ] Repositório importado na Vercel
- [ ] Deploy realizado com sucesso
- [ ] Testar no navegador
- [ ] Testar PWA no celular
- [ ] Verificar se funciona offline (PWA)

## 🎯 URLs Importantes

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Documentação Vercel:** https://vercel.com/docs
- **Status do Deploy:** Aparece no dashboard da Vercel

## 💡 Dicas

1. **Domínio Personalizado:** Você pode adicionar seu próprio domínio nas configurações
2. **Preview Deploys:** Cada PR cria um preview automaticamente
3. **Analytics:** Vercel oferece analytics gratuitos
4. **SSL:** HTTPS é automático e gratuito

