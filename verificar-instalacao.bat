@echo off
echo ========================================
echo   Verificacao de Instalacao
echo ========================================
echo.

REM Verifica Node.js
echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js: https://nodejs.org/
    pause
    exit /b 1
) else (
    node --version
    echo [OK] Node.js instalado
)
echo.

REM Verifica npm
echo Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] npm nao encontrado!
    pause
    exit /b 1
) else (
    npm --version
    echo [OK] npm instalado
)
echo.

REM Verifica node_modules
echo Verificando dependencias...
if not exist "node_modules\" (
    echo [AVISO] Dependencias nao instaladas!
    echo.
    echo Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependencias!
        pause
        exit /b 1
    )
    echo [OK] Dependencias instaladas
) else (
    echo [OK] Dependencias encontradas
)
echo.

REM Verifica Express
if exist "node_modules\express\" (
    echo [OK] Express instalado
) else (
    echo [ERRO] Express nao encontrado!
    echo Tentando instalar...
    call npm install express
)
echo.

echo ========================================
echo   Verificacao concluida!
echo ========================================
echo.
echo Agora voce pode executar: npm start
echo.
pause

