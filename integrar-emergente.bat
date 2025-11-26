@echo off
chcp 65001 >nul
echo ========================================
echo   Integrando alteracoes do Emergente.sh
echo ========================================
echo.

echo Baixando alteracoes da nuvem...
git pull origin main
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao baixar alteracoes!
    echo Verifique sua conexao e tente novamente.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Ultimas 3 alteracoes:
echo ========================================
git log --oneline -3
echo.

echo ========================================
echo   Arquivos alterados no ultimo commit:
echo ========================================
git diff HEAD~1 HEAD --name-only
echo.

echo ========================================
echo   Deseja ver as diferencas detalhadas?
echo ========================================
echo (S) Sim  (N) Nao
set /p ver_diffs="Escolha: "

if /i "%ver_diffs%"=="S" (
    echo.
    echo Mostrando diferencas do ultimo commit:
    echo ========================================
    git show HEAD
    echo.
    echo ========================================
)

echo.
echo ========================================
echo   Alteracoes integradas com sucesso!
echo ========================================
echo.
echo Revise as mudancas acima antes de continuar.
echo.
echo Para testar localmente, execute:
echo   npm start
echo.
pause

