@echo off
chcp 65001 >nul
echo ========================================
echo   Verificar e Integrar Branch Emergente
echo ========================================
echo.

REM Verificar se estamos na branch main
git branch --show-current > temp_branch.txt
set /p CURRENT_BRANCH=<temp_branch.txt
del temp_branch.txt

if not "%CURRENT_BRANCH%"=="main" (
    echo [AVISO] Voce nao esta na branch main!
    echo Branch atual: %CURRENT_BRANCH%
    echo.
    echo Trocando para branch main...
    git checkout main
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao trocar para main!
        pause
        exit /b 1
    )
    echo [OK] Trocado para branch main
    echo.
)

echo ========================================
echo   Passo 1: Atualizar branches da nuvem
echo ========================================
echo.
echo Buscando atualizacoes da nuvem...
git fetch origin main
git fetch origin emergente

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao buscar branches da nuvem!
    echo Verifique sua conexao e se a branch emergente existe.
    pause
    exit /b 1
)

echo [OK] Branches atualizadas!
echo.

REM Atualizar main local
echo Atualizando branch main local...
git pull origin main
if %errorlevel% neq 0 (
    echo [AVISO] Erro ao atualizar main local. Continuando...
    echo.
)

echo ========================================
echo   Passo 2: Verificar se branch emergente existe
echo ========================================
echo.
git ls-remote --heads origin emergente >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Branch emergente nao encontrada na nuvem!
    echo Verifique se a branch foi criada e enviada.
    pause
    exit /b 1
)

echo [OK] Branch emergente encontrada na nuvem!
echo.

echo ========================================
echo   Passo 3: Verificar diferencas
echo ========================================
echo.

REM Verificar se há diferenças
git diff main..origin/emergente --quiet
if %errorlevel% equ 0 (
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

echo [INFO] Alteracoes encontradas na branch emergente!
echo.

echo Arquivos diferentes entre main e emergente:
git diff main..origin/emergente --name-only
echo.

echo Numero de arquivos alterados:
git diff main..origin/emergente --name-only | find /c /v ""
echo.

echo ========================================
echo   Passo 4: Mostrar resumo das alteracoes
echo ========================================
echo.
echo Commits na branch emergente que nao estao na main:
git log main..origin/emergente --oneline
echo.

echo.
echo Deseja ver detalhes das alteracoes? (S) Sim  (N) Nao
set /p ver_detalhes="Escolha: "

if /i "%ver_detalhes%"=="S" (
    echo.
    echo ========================================
    echo   Detalhes das alteracoes:
    echo ========================================
    git diff main..origin/emergente
    echo.
    echo ========================================
    pause
)

echo ========================================
echo   Passo 5: Salvar trabalho local
echo ========================================
echo.
git status
echo.
echo Deseja salvar alteracoes locais antes de integrar?
echo (S) Sim  (N) Nao
set /p salvar="Escolha: "

if /i "%salvar%"=="S" (
    echo.
    echo Salvando trabalho local...
    git add -A
    git commit -m "Backup antes de integrar branch emergente - %date% %time%"
    if %errorlevel% neq 0 (
        echo [AVISO] Nenhuma alteracao para salvar ou erro ao commitar.
    ) else (
        echo [OK] Trabalho local salvo!
    )
    echo.
)

echo ========================================
echo   Passo 6: Integrar branch emergente
echo ========================================
echo.
echo IMPORTANTE: O visual da branch emergente sera priorizado!
echo.
echo Deseja continuar com a integracao?
echo (S) Sim  (N) Nao
set /p continuar="Escolha: "

if /i not "%continuar%"=="S" (
    echo.
    echo Operacao cancelada pelo usuario.
    pause
    exit /b 0
)

echo.
echo Fazendo merge da branch emergente na main...
echo (Priorizando arquivos da branch emergente em caso de conflitos)
echo.

REM Fazer merge com estratégia que prioriza a branch emergente
git merge origin/emergente -X theirs --no-edit
set MERGE_RESULT=%errorlevel%

if %MERGE_RESULT% neq 0 (
    echo.
    echo [AVISO] Conflitos detectados ou merge ja realizado!
    echo.
    
    REM Verificar se já está mergeado
    git merge-base --is-ancestor origin/emergente HEAD
    if %errorlevel% equ 0 (
        echo [INFO] A branch emergente ja esta integrada na main!
        echo Nenhuma acao necessaria.
        echo.
    ) else (
        echo Resolvendo conflitos priorizando branch emergente...
        echo.
        
        REM Listar arquivos com conflito
        echo Arquivos com conflito:
        git diff --name-only --diff-filter=U
        echo.
        
        REM Para cada arquivo com conflito, usar versão da branch emergente
        for /f "tokens=*" %%f in ('git diff --name-only --diff-filter=U') do (
            echo Resolvendo conflito em: %%f
            git checkout --theirs "%%f"
            git add "%%f"
        )
        
        echo.
        echo Finalizando merge...
        git commit -m "Integrar branch emergente - priorizando visual profissional - %date% %time%"
        
        if %errorlevel% neq 0 (
            echo.
            echo [ERRO] Falha ao finalizar merge!
            echo Revise os conflitos manualmente.
            echo.
            echo Status atual:
            git status
            pause
            exit /b 1
        )
    )
) else (
    echo [OK] Merge realizado com sucesso!
    echo.
)

echo ========================================
echo   Passo 7: Verificar resultado
echo ========================================
echo.
echo Status apos integracao:
git status
echo.

echo Ultimo commit:
git log --oneline -1
echo.

REM Verificar se ainda há diferenças (não deveria haver)
git diff main..origin/emergente --quiet
if %errorlevel% equ 0 (
    echo [OK] Integracao completa! Main e emergente estao sincronizadas.
) else (
    echo [AVISO] Ainda ha diferencas. Verifique manualmente.
    git diff main..origin/emergente --name-only
)
echo.

echo ========================================
echo   Passo 8: Enviar para nuvem
echo ========================================
echo.
echo Deseja enviar as alteracoes para a nuvem?
echo (S) Sim  (N) Nao
set /p enviar="Escolha: "

if /i "%enviar%"=="S" (
    echo.
    echo Enviando para nuvem...
    git push origin main
    if %errorlevel% neq 0 (
        echo.
        echo [ERRO] Falha ao enviar para nuvem!
        echo Tente novamente manualmente: git push origin main
    ) else (
        echo.
        echo [OK] Alteracoes enviadas para nuvem com sucesso!
        echo.
        echo A branch main agora contem o visual profissional da branch emergente!
    )
    echo.
)

echo ========================================
echo   Integracao Concluida!
echo ========================================
echo.
echo Resumo:
echo - Branch emergente verificada
echo - Alteracoes integradas na main
echo - Visual profissional priorizado
echo.
echo Para testar localmente, execute:
echo   npm start
echo.
pause

