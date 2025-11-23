@echo off
chcp 65001 >nul
echo ========================================
echo   Forcar Deploy na Vercel
echo ========================================
echo.

echo Verificando status do Git...
git status
echo.

echo Ultimos commits:
git log --oneline -5
echo.

echo.
echo Opcoes:
echo 1. Fazer commit e push (deploy automatico)
echo 2. Apenas mostrar status
echo 3. Sair
echo.
set /p opcao="Escolha uma opcao (1-3): "

if "%opcao%"=="1" (
    echo.
    echo Adicionando arquivos...
    git add .
    
    echo.
    echo Fazendo commit...
    git commit -m "Atualizacao - %date% %time%"
    
    if %errorlevel% == 0 (
        echo.
        echo Commit realizado!
        echo.
        echo Fazendo push (dispara deploy automatico)...
        git push
        
        if %errorlevel% == 0 (
            echo.
            echo ========================================
            echo   Push realizado com sucesso!
            echo ========================================
            echo.
            echo O deploy automatico sera iniciado na Vercel.
            echo Aguarde 2-3 minutos e verifique:
            echo https://vercel.com/dashboard
            echo.
        ) else (
            echo.
            echo ERRO ao fazer push!
        )
    ) else (
        echo.
        echo ERRO ao fazer commit!
    )
) else if "%opcao%"=="2" (
    echo.
    echo Status atual:
    git status
) else (
    echo Saindo...
    exit /b 0
)

echo.
pause

