@echo off
chcp 65001 >nul
echo ========================================
echo   Integrando Branch Emergente na Main
echo   (Priorizando visual da branch emergente)
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
    echo Deseja trocar para main? (S) Sim  (N) Nao
    set /p trocar="Escolha: "
    if /i "%trocar%"=="S" (
        git checkout main
        if %errorlevel% neq 0 (
            echo [ERRO] Falha ao trocar para main!
            pause
            exit /b 1
        )
        echo [OK] Trocado para branch main
        echo.
    ) else (
        echo Operacao cancelada.
        pause
        exit /b 0
    )
)

echo ========================================
echo   Passo 1: Salvar trabalho local
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
echo   Passo 2: Atualizar branch main
echo ========================================
echo.
echo Atualizando branch main da nuvem...
git pull origin main
if %errorlevel% neq 0 (
    echo.
    echo [AVISO] Erro ao atualizar main. Continuando mesmo assim...
    echo.
)

echo ========================================
echo   Passo 3: Buscar branch emergente
echo ========================================
echo.
echo Buscando branch emergente da nuvem...
git fetch origin emergente
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao buscar branch emergente!
    echo Verifique se a branch existe na nuvem.
    pause
    exit /b 1
)
echo [OK] Branch emergente encontrada!
echo.

echo ========================================
echo   Passo 4: Ver alteracoes da branch emergente
echo ========================================
echo.
echo Arquivos alterados na branch emergente:
git diff main..origin/emergente --name-only
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
echo   Passo 5: Integrar branch emergente
echo ========================================
echo.
echo IMPORTANTE: O visual da branch emergente sera priorizado!
echo.
echo Deseja continuar com a integracao?
echo (S) Sim  (N) Nao
set /p continuar="Escolha: "

if /i not "%continuar%"=="S" (
    echo Operacao cancelada.
    pause
    exit /b 0
)

echo.
echo Fazendo merge da branch emergente na main...
echo (Priorizando arquivos da branch emergente em caso de conflitos)
echo.

REM Fazer merge com estratégia que prioriza a branch emergente
git merge origin/emergente -X theirs --no-edit
if %errorlevel% neq 0 (
    echo.
    echo [AVISO] Conflitos detectados!
    echo.
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
        pause
        exit /b 1
    )
) else (
    echo [OK] Merge realizado com sucesso!
    echo.
)

echo ========================================
echo   Passo 6: Verificar resultado
echo ========================================
echo.
echo Status apos integracao:
git status
echo.

echo Ultimo commit:
git log --oneline -1
echo.

echo ========================================
echo   Passo 7: Enviar para nuvem
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
    )
    echo.
)

echo ========================================
echo   Integracao Concluida!
echo ========================================
echo.
echo A branch emergente foi integrada na main.
echo O visual da branch emergente foi priorizado.
echo.
echo Para testar localmente, execute:
echo   npm start
echo.
pause

