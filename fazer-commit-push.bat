@echo off
chcp 65001 >nul
echo ========================================
echo   Git: Commit e Push
echo ========================================
echo.

echo Verificando status do Git...
git status
echo.

echo Fazer commit e push? (S/N)
set /p resposta=

if /i "%resposta%"=="S" (
    echo.
    echo Fazendo commit...
    git commit -m "Initial commit: Sistema de gestao de loja"
    
    if %errorlevel% == 0 (
        echo.
        echo Commit realizado com sucesso!
        echo.
        echo Fazendo push para o GitHub...
        git push -u origin main
        
        if %errorlevel% == 0 (
            echo.
            echo ========================================
            echo   Push realizado com sucesso!
            echo ========================================
        ) else (
            echo.
            echo ========================================
            echo   ERRO ao fazer push!
            echo ========================================
            echo.
            echo Possiveis causas:
            echo - Problema de autenticacao
            echo - Repositorio remoto nao existe
            echo - Sem permissao no repositorio
            echo.
            echo Verifique suas credenciais do GitHub.
        )
    ) else (
        echo.
        echo ERRO ao fazer commit!
    )
) else (
    echo Operacao cancelada.
)

echo.
pause

