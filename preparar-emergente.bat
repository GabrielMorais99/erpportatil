@echo off
chcp 65001 >nul
echo ========================================
echo   Preparando para usar Emergente.sh
echo ========================================
echo.

echo Verificando status do Git...
git status
echo.

echo.
echo Deseja salvar trabalho local antes de usar Emergente.sh?
echo (S) Sim  (N) Nao
set /p resposta="Escolha: "

if /i "%resposta%"=="S" (
    echo.
    echo Salvando trabalho local...
    git add -A
    git commit -m "Backup antes de usar emergente.sh - %date% %time%"
    echo [OK] Trabalho local salvo!
    echo.
)

echo.
echo Sincronizando com nuvem...
git pull origin main
if %errorlevel% neq 0 (
    echo.
    echo [AVISO] Erro ao sincronizar. Verifique sua conexao.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Pronto! Pode usar o Emergente.sh
echo ========================================
echo.
echo Apos usar o Emergente.sh, execute:
echo   integrar-emergente.bat
echo.
pause

