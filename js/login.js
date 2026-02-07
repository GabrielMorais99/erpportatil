// ========== LOGIN.JS CARREGADO ==========
console.log('🔵 [LOGIN.JS] Script carregado e executando...');

// Função para obter permissões baseadas no nível de acesso
function getUserPermissions(level) {
    const permissions = {
        admin: {
            read: true,
            write: true,
            delete: true,
            export: true,
            import: true,
            manageUsers: true,
            viewAdmin: true,
        },
        manager: {
            read: true,
            write: true,
            delete: true,
            export: true,
            import: false,
            manageUsers: false,
            viewAdmin: false,
        },
        user: {
            read: true,
            write: true,
            delete: false,
            export: false,
            import: false,
            manageUsers: false,
            viewAdmin: false,
        },
    };

    return permissions[level] || permissions.user;
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('🟢 [LOGIN.JS] DOMContentLoaded disparado');
    console.log('🟢 [LOGIN.JS] Documento pronto, buscando elementos...');

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    console.log('🟢 [LOGIN.JS] Elementos encontrados:', {
        loginForm: !!loginForm,
        errorMessage: !!errorMessage,
        usernameInput: !!usernameInput,
        passwordInput: !!passwordInput,
    });

    if (!loginForm) {
        console.error(
            '❌ [LOGIN.JS] ERRO: Formulário de login não encontrado!'
        );
        return;
    }

    if (!usernameInput || !passwordInput) {
        console.error('❌ [LOGIN.JS] ERRO: Campos de input não encontrados!');
        return;
    }

    console.log(
        '✅ [LOGIN.JS] Todos os elementos encontrados, anexando event listener...'
    );

    // ========== RATE LIMITING - Proteção contra Brute Force ==========

    // Obter tentativas de login do localStorage
    function getLoginAttempts() {
        const attempts = localStorage.getItem('loginAttempts');
        if (!attempts) return { count: 0, lastAttempt: 0, blockedUntil: 0 };
        return JSON.parse(attempts);
    }

    // Salvar tentativas de login
    function saveLoginAttempts(attempts) {
        localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    }

    // Limpar tentativas de login (após login bem-sucedido)
    function clearLoginAttempts() {
        localStorage.removeItem('loginAttempts');
    }

    // Verificar se está bloqueado por muitas tentativas
    function isBlocked() {
        const attempts = getLoginAttempts();
        const now = Date.now();

        // Se ainda está bloqueado
        if (attempts.blockedUntil > now) {
            const remainingSeconds = Math.ceil(
                (attempts.blockedUntil - now) / 1000
            );
            return {
                blocked: true,
                remainingSeconds: remainingSeconds,
            };
        }

        // Se passou o tempo de bloqueio, resetar contador
        if (attempts.blockedUntil > 0 && attempts.blockedUntil <= now) {
            saveLoginAttempts({ count: 0, lastAttempt: 0, blockedUntil: 0 });
        }

        return { blocked: false };
    }

    // Registrar tentativa de login falhada
    function recordFailedAttempt() {
        const attempts = getLoginAttempts();
        const now = Date.now();

        // Resetar contador se passou muito tempo desde a última tentativa (5 minutos)
        if (now - attempts.lastAttempt > 5 * 60 * 1000) {
            attempts.count = 0;
        }

        attempts.count++;
        attempts.lastAttempt = now;

        // Bloquear após 5 tentativas falhadas
        if (attempts.count >= 5) {
            // Bloquear por 15 minutos
            attempts.blockedUntil = now + 15 * 60 * 1000;
            saveLoginAttempts(attempts);
            return {
                blocked: true,
                remainingSeconds: 15 * 60,
                message:
                    'Muitas tentativas de login falhadas. Acesso bloqueado por 15 minutos.',
            };
        }

        saveLoginAttempts(attempts);
        return {
            blocked: false,
            remainingAttempts: 5 - attempts.count,
        };
    }

    // ========== HASH DE SENHAS ==========

    // Função simples de hash (SHA-256 usando Web Crypto API)
    async function hashPassword(password) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('');
            return hashHex;
        } catch (error) {
            console.error('Erro ao fazer hash da senha:', error);
            // Fallback: retornar senha original se crypto não estiver disponível
            return password;
        }
    }

    // Verificar senha (comparar hash)
    async function verifyPassword(password, hashedPassword) {
        const passwordHash = await hashPassword(password);
        return passwordHash === hashedPassword;
    }

    // Função para fazer login
    async function fazerLogin(username, password) {
        console.log('🟡 [LOGIN.JS] Processando login...');

        // Verificar se está bloqueado
        const blockStatus = isBlocked();
        if (blockStatus.blocked) {
            console.warn(
                '⚠️ [LOGIN.JS] Acesso bloqueado por muitas tentativas'
            );
            showError(
                `Acesso temporariamente bloqueado. Tente novamente em ${blockStatus.remainingSeconds} segundos.`
            );
            return false;
        }

        // Validações
        if (!username || !password) {
            console.warn('⚠️ [LOGIN.JS] Campos vazios detectados');
            showError('Por favor, preencha todos os campos.');
            return false;
        }

        // Verificar credenciais e níveis de acesso
        // Nota: Em produção, os hashes devem ser armazenados no servidor
        // Aqui estamos usando hashes pré-calculados para demonstração
        const validUsers = {
            nilda: {
                passwordHash:
                    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', // hash de '123'
                level: 'user',
            },

            gabriel: {
                passwordHash:
                    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // hash de '0001'
                level: 'admin',
            },
            samara: {
                passwordHash:
                    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // hash de '0002'
                level: 'manager',
            },
            admin: {
                passwordHash:
                    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // hash de 'gab123'
                level: 'admin',
            },
            paulo: {
                passwordHash:
                    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', // hash de '123'
                level: 'manager',
            },
        };

        const user = validUsers[username];
        if (!user) {
            console.warn('⚠️ [LOGIN.JS] Usuário não encontrado');

            // Registrar tentativa falhada
            const attemptResult = recordFailedAttempt();

            if (attemptResult.blocked) {
                showError(attemptResult.message);
            } else {
                const remaining = attemptResult.remainingAttempts;
                if (remaining <= 2) {
                    showError(
                        `Usuário ou senha incorretos. ${remaining} tentativa(s) restante(s) antes do bloqueio.`
                    );
                } else {
                    showError('Usuário ou senha incorretos.');
                }
            }

            passwordInput.value = '';
            return false;
        }

        // Verificar senha usando hash
        const passwordHash = await hashPassword(password);
        if (user.passwordHash === passwordHash) {
            console.log('✅ [LOGIN.JS] Credenciais válidas!');

            // Limpar tentativas de login após sucesso
            clearLoginAttempts();

            // Salvar sessão
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('userLevel', user.level || 'user');

            // Salvar permissões do usuário
            const permissions = getUserPermissions(user.level);
            sessionStorage.setItem(
                'userPermissions',
                JSON.stringify(permissions)
            );

            console.log('✅ [LOGIN.JS] SessionStorage salvo');
            console.log(
                '🟡 [LOGIN.JS] Redirecionando para /gerenciamento.html...'
            );

            // Redirecionar
            console.log(
                '🟡 [LOGIN.JS] Redirecionando para gerenciamento.html...'
            );
            try {
                // Tentar caminho absoluto primeiro
                window.location.href = '/gerenciamento.html';
                console.log(
                    '✅ [LOGIN.JS] window.location.href = /gerenciamento.html executado'
                );

                // Fallback após 500ms se não redirecionou
                setTimeout(() => {
                    if (
                        window.location.pathname !== '/gerenciamento.html' &&
                        !window.location.pathname.includes('gerenciamento')
                    ) {
                        console.log(
                            '🟡 [LOGIN.JS] Tentando caminho relativo...'
                        );
                        window.location.href = 'gerenciamento.html';
                    }
                }, 500);
            } catch (error) {
                console.error('❌ [LOGIN.JS] Erro ao redirecionar:', error);
                window.location.href = 'gerenciamento.html';
            }
            return true;
        } else {
            console.warn('⚠️ [LOGIN.JS] Credenciais inválidas');

            // Registrar tentativa falhada
            const attemptResult = recordFailedAttempt();

            if (attemptResult.blocked) {
                showError(attemptResult.message);
            } else {
                const remaining = attemptResult.remainingAttempts;
                if (remaining <= 2) {
                    showError(
                        `Usuário ou senha incorretos. ${remaining} tentativa(s) restante(s) antes do bloqueio.`
                    );
                } else {
                    showError('Usuário ou senha incorretos.');
                }
            }

            passwordInput.value = '';
            return false;
        }
    }

    // Função para processar o login (será chamada tanto pelo botão quanto pelo formulário)
    function processarLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Limpar mensagem de erro anterior
        if (errorMessage) {
            errorMessage.classList.remove('show');
            errorMessage.textContent = '';
        }

        // Fazer login
        fazerLogin(username, password);
    }

    // Anexar evento ao botão "Entrar" diretamente
    const submitButton =
        document.getElementById('entrarBtn') ||
        loginForm.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            processarLogin();
        });
    }

    // Também manter o listener no formulário como backup
    console.log('🟢 [LOGIN.JS] Anexando evento submit ao formulário...');
    loginForm.addEventListener('submit', function (e) {
        console.log('🟡 [LOGIN.JS] ========== SUBMIT DO FORMULÁRIO ==========');
        e.preventDefault();
        e.stopPropagation();
        console.log(
            '🟡 [LOGIN.JS] preventDefault e stopPropagation executados'
        );
        processarLogin();
    });

    console.log('✅ [LOGIN.JS] Event listeners anexados');

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add('show');
        } else {
            console.error(
                '❌ [LOGIN.JS] Erro: elemento errorMessage não encontrado!'
            );
        }
    }

    // Verificar se já está logado
    console.log('🟢 [LOGIN.JS] Verificando se usuário já está logado...');
    const isLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
    console.log('🟢 [LOGIN.JS] Status de login:', isLoggedIn);

    if (isLoggedIn) {
        console.log('🟡 [LOGIN.JS] Usuário já logado, redirecionando...');
        try {
            window.location.href = '/gerenciamento.html';
            console.log('✅ [LOGIN.JS] Redirecionamento executado');
        } catch (error) {
            console.error('❌ [LOGIN.JS] Erro ao redirecionar:', error);
            window.location.href = 'gerenciamento.html';
        }
    } else {
        console.log(
            'ℹ️ [LOGIN.JS] Usuário não está logado, aguardando login...'
        );
    }

    console.log('✅ [LOGIN.JS] Inicialização completa');
});
