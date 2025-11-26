@echo off
chcp 65001 >nul
echo ========================================
echo   Integrar Branch Emergente na Main
echo ========================================
echo.

REM Garantir que está na main
git checkout main 2>nul

REM Atualizar todas as referências
echo Atualizando referencias do Git...
git fetch --all --prune

echo.
echo Verificando se branch emergente existe na nuvem...
git ls-remote --heads origin emergente >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Branch emergente nao encontrada na nuvem!
    echo.
    echo Verifique se:
    echo 1. A branch emergente foi criada
    echo 2. As alteracoes foram enviadas (git push origin emergente)
    echo.
    pause
    exit /b 1
)

echo [OK] Branch emergente encontrada!
echo.

REM Buscar branch emergente
echo Buscando branch emergente...
git fetch origin emergente:emergente 2>&1
if %errorlevel% neq 0 (
    echo [AVISO] Tentando fetch simples...
    git fetch origin emergente
)

echo.
echo Verificando diferencas entre main e emergente...
git diff main..origin/emergente --quiet 2>nul
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   NENHUMA ALTERACAO ENCONTRADA!
    echo ========================================
    echo.
    echo A branch emergente esta identica a main.
    echo Nao ha necessidade de integracao.
    echo.
    pause
    exit /b 0
)

echo [INFO] Alteracoes encontradas!
echo.

echo Arquivos diferentes:
git diff main..origin/emergente --name-only 2>nul
echo.

echo Commits na branch emergente:
git log main..origin/emergente --oneline 2>nul
echo.

echo.
echo ========================================
echo   Integrando branch emergente na main
echo   (Priorizando visual da branch emergente)
echo ========================================
echo.

REM Salvar trabalho local
git add -A
git commit -m "Backup antes de integrar emergente - %date% %time%" 2>nul

REM Atualizar main
git pull origin main 2>nul

REM Fazer merge priorizando emergente
echo Fazendo merge...
git merge origin/emergente -X theirs -m "Integrar branch emergente - visual profissional - %date% %time%" 2>&1

if %errorlevel% neq 0 (
    echo.
    echo Resolvendo possiveis conflitos...
    
    REM Resolver conflitos automaticamente (priorizar emergente)
    for /f "tokens=*" %%f in ('git diff --name-only --diff-filter=U 2^>nul') do (
        echo Resolvendo: %%f
        git checkout --theirs "%%f" 2>nul
        git add "%%f" 2>nul
    )
    
    git commit -m "Integrar branch emergente - visual profissional - %date% %time%" 2>nul
)

echo.
echo ========================================
echo   Verificando resultado...
echo ========================================
echo.

git status

echo.
echo Ultimo commit:
git log --oneline -1

echo.
echo ========================================
echo   Deseja enviar para nuvem?
echo ========================================
echo (S) Sim  (N) Nao
set /p enviar="Escolha: "

if /i "%enviar%"=="S" (
    echo.
    echo Enviando para nuvem...
    git push origin main
    if %errorlevel% equ 0 (
        echo.
        echo [OK] Integracao concluida e enviada para nuvem!
    ) else (
        echo.
        echo [ERRO] Falha ao enviar. Tente: git push origin main
    )
)

echo.
echo ========================================
echo   Integracao Concluida!
echo ========================================
echo.
pause

