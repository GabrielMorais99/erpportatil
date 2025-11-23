# Guia de Configuração Git

## Problema: "git push -u origin main" dando erro

O erro ocorre porque **não há commits ainda** no repositório. Você precisa fazer o primeiro commit antes de fazer push.

## ⚠️ ERRO IDENTIFICADO

**Erro:** `error: src refspec main does not match any`  
**Causa:** Não há commits ainda no repositório local.

## Solução Passo a Passo

### Opção 1: Script Automático (Recomendado)

```bash
# Execute o arquivo:
fazer-commit-push.bat
```

### Opção 2: Manual

#### 1. Verificar se os arquivos estão no staging

```bash
git status
```

Se aparecer "Changes to be committed", pule para o passo 2.  
Se aparecer "Untracked files", execute:

```bash
git add .
```

#### 2. Fazer o primeiro commit (OBRIGATÓRIO)

```bash
git commit -m "Initial commit: Sistema de gestão de loja"
```

#### 3. Fazer o push para o repositório remoto

```bash
git push -u origin main
```

## Comandos Completos (copie e cole)

```bash
# 1. Adicionar arquivos
git add .

# 2. Fazer commit
git commit -m "Initial commit: Sistema de gestão de loja"

# 3. Fazer push
git push -u origin main
```

## Se ainda der erro

### Erro: "branch 'main' does not exist"

```bash
# Criar branch main se não existir
git branch -M main
git push -u origin main
```

### Erro: "Authentication failed"

Você precisa configurar suas credenciais do GitHub:

```bash
# Configurar usuário
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
```

### Erro: "Permission denied"

-   Verifique se você tem permissão no repositório
-   Use um Personal Access Token em vez de senha
-   Ou configure SSH keys

## Verificar Status

```bash
# Ver status do repositório
git status

# Ver commits
git log

# Ver remote configurado
git remote -v
```

## Próximos Passos

Após o primeiro push, para futuras atualizações:

```bash
git add .
git commit -m "Descrição das alterações"
git push
```
