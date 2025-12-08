/**
 * Script para atualizar automaticamente a versão do sistema
 * Formato: YYYYMMDDHH (ano + mês + dia + hora)
 * 
 * Uso: node scripts/update-version.js [--auto]
 * 
 * --auto: Atualiza apenas se houver mudanças no código (para hooks de git)
 */

const fs = require('fs');
const path = require('path');

// Verificar se deve atualizar automaticamente (para hooks)
const isAuto = process.argv.includes('--auto');

// Obter data atual
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const hour = String(now.getHours()).padStart(2, '0');
const date = `${year}${month}${day}`;
const dateWithHour = `${year}${month}${day}${hour}`;
const buildDate = `${year}-${month}-${day}`;
const buildTime = now.toTimeString().split(' ')[0];

// Obter hash do último commit (se disponível)
let commitHash = 'unknown';
let commitMessage = '';
let branchName = 'unknown';
try {
    const { execSync } = require('child_process');
    commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    try {
        commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' }).trim().split('\n')[0];
    } catch (e) {}
    try {
        branchName = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    } catch (e) {}
} catch (e) {
    if (!isAuto) {
        console.warn('⚠️  Git não disponível, usando "unknown" como commit hash');
    }
}

// Caminho do arquivo de versão
const versionPath = path.join(__dirname, '..', 'version.json');

// Ler versão atual se existir
let currentVersion = null;
if (fs.existsSync(versionPath)) {
    try {
        const currentData = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
        currentVersion = currentData.version;
    } catch (e) {
        // Ignorar erro
    }
}

// Determinar nova versão
// Se for auto e a data for a mesma, incrementar hora ou usar timestamp
let newVersion = date;
if (isAuto && currentVersion && currentVersion.startsWith(date)) {
    // Se já atualizou hoje, usar formato com hora para diferenciar
    newVersion = dateWithHour;
} else if (!isAuto) {
    // Se não for auto, sempre usar data completa com hora
    newVersion = dateWithHour;
}

// Se a versão não mudou e for auto, não atualizar
if (isAuto && currentVersion === newVersion) {
    process.exit(0);
}

// Criar objeto de versão
const versionData = {
    version: newVersion,
    buildDate: buildDate,
    buildTime: buildTime,
    commit: commitHash,
    branch: branchName,
    commitMessage: commitMessage.substring(0, 100), // Limitar tamanho
    description: 'ERP Portátil - Sistema de Gestão Financeira',
    updatedAt: new Date().toISOString()
};

// Escrever arquivo de versão
fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2), 'utf-8');

if (!isAuto) {
    console.log('✅ Versão atualizada:');
    console.log(`   Versão: ${newVersion}`);
    console.log(`   Data: ${buildDate}`);
    console.log(`   Hora: ${buildTime}`);
    console.log(`   Commit: ${commitHash}`);
    console.log(`   Branch: ${branchName}`);
    console.log(`   Arquivo: ${versionPath}`);
}

// Atualizar package.json se necessário
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    // Manter version semântica no package.json, mas adicionar buildVersion
    packageJson.buildVersion = newVersion;
    packageJson.buildDate = buildDate;
    packageJson.buildTime = buildTime;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf-8');
    if (!isAuto) {
        console.log('✅ package.json atualizado com buildVersion');
    }
}
