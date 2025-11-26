@echo off
chcp 65001 >nul
echo ========================================
echo   Visualizar Branch Emergente
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
echo   Comparacao: Main vs Emergente
echo ========================================
echo.

echo Arquivos diferentes:
git diff main..origin/emergente --name-only
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
)

echo.
echo Deseja ver apenas arquivos CSS alterados? (S) Sim  (N) Nao
set /p ver_css="Escolha: "

if /i "%ver_css%"=="S" (
    echo.
    echo ========================================
    echo   Alteracoes em arquivos CSS:
    echo ========================================
    git diff main..origin/emergente -- "*.css"
    echo.
    echo ========================================
)

echo.
echo Deseja ver apenas arquivos HTML alterados? (S) Sim  (N) Nao
set /p ver_html="Escolha: "

if /i "%ver_html%"=="S" (
    echo.
    echo ========================================
    echo   Alteracoes em arquivos HTML:
    echo ========================================
    git diff main..origin/emergente -- "*.html"
    echo.
    echo ========================================
)

echo.
echo ========================================
echo   Resumo
echo ========================================
echo.
echo Commits na branch emergente que nao estao na main:
git log main..origin/emergente --oneline
echo.

echo.
echo Para integrar a branch emergente, execute:
echo   integrar-branch-emergente.bat
echo.
pause

