@echo off
chcp 65001 >nul
echo ========================================
echo   Matar Processo na Porta 3000
echo ========================================
echo.

echo Procurando processo na porta 3000...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    set PID=%%a
    echo Processo encontrado: PID %%a
    echo.
    echo Tentando finalizar o processo...
    taskkill /PID %%a /F >nul 2>&1
    if %errorlevel% == 0 (
        echo [OK] Processo finalizado com sucesso!
    ) else (
        echo [ERRO] Nao foi possivel finalizar o processo.
        echo Tente executar como Administrador.
    )
    echo.
)

echo Verificando se a porta esta livre...
timeout /t 2 >nul
netstat -ano | findstr :3000 >nul
if %errorlevel% == 0 (
    echo [AVISO] A porta 3000 ainda esta em uso.
    echo Tente executar este script como Administrador.
) else (
    echo [OK] Porta 3000 esta livre agora!
    echo.
    echo Voce pode executar: npm start
)

echo.
pause

