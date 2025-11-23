// Script de teste para verificar se o servidor pode ser iniciado
const express = require('express');
const path = require('path');
const fs = require('fs');

console.log('Testando configuração do servidor...\n');

// Verificar se express está instalado
try {
    require('express');
    console.log('✅ Express está instalado');
} catch (e) {
    console.log('❌ Express NÃO está instalado');
    console.log('Execute: npm install');
    process.exit(1);
}

// Verificar se os arquivos principais existem
const filesToCheck = ['index.html', 'gerenciamento.html', 'server.js'];
let allFilesExist = true;

filesToCheck.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`✅ ${file} encontrado`);
    } else {
        console.log(`❌ ${file} NÃO encontrado`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Alguns arquivos estão faltando!');
    process.exit(1);
}

console.log('\n✅ Tudo pronto! Você pode executar: npm start');
process.exit(0);

