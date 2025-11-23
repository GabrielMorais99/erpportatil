@echo off
chcp 65001 >nul
echo ========================================
echo   Loja - Iniciar em Porta Livre
echo ========================================
echo.

REM Verifica se node está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM Verifica se node_modules existe
if not exist "node_modules\" (
    echo [INFO] Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

REM Tenta porta 3000, se não funcionar, tenta 3001, 3002, etc.
set PORTA=3000
:testar_porta
echo Testando porta %PORTA%...
netstat -ano | findstr :%PORTA% >nul
if %errorlevel% == 0 (
    echo Porta %PORTA% esta em uso. Tentando proxima porta...
    set /a PORTA+=1
    if %PORTA% GTR 3010 (
        echo [ERRO] Nao foi possivel encontrar uma porta livre.
        echo Por favor, feche outros servidores ou use: matar-porta.bat
        pause
        exit /b 1
    )
    goto testar_porta
)

echo [OK] Porta %PORTA% esta livre!
echo.
echo Iniciando servidor na porta %PORTA%...
echo.
echo ========================================
echo   Acesse: http://localhost:%PORTA%
echo.
echo   Credenciais:
echo     Usuario: nilda
echo     Senha: 123
echo ========================================
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

set PORT=%PORTA%
node server.js

