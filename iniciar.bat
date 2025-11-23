@echo off
chcp 65001 >nul
echo ========================================
echo   Loja - Sistema de Gestao
echo   Projeto por Nilda
echo ========================================
echo.

REM Verifica se node está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
node --version
echo.

REM Verifica se node_modules existe
if not exist "node_modules\" (
    echo [INFO] Instalando dependencias...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERRO] Falha ao instalar dependencias!
        echo Verifique sua conexao com a internet e tente novamente.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencias instaladas com sucesso!
    echo.
) else (
    echo [OK] Dependencias ja instaladas
    echo.
)

echo Iniciando servidor...
echo.
echo ========================================
echo   Acesse: http://localhost:3000
echo.
echo   Credenciais:
echo     Usuario: nilda
echo     Senha: 123
echo ========================================
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

npm start

