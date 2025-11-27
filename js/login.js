// ========== LOGIN.JS CARREGADO ==========
console.log('🔵 [LOGIN.JS] Script carregado e executando...');

document.addEventListener('DOMContentLoaded', function() {
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
        passwordInput: !!passwordInput
    });
    
    if (!loginForm) {
        console.error('❌ [LOGIN.JS] ERRO: Formulário de login não encontrado!');
        return;
    }
    
    if (!usernameInput || !passwordInput) {
        console.error('❌ [LOGIN.JS] ERRO: Campos de input não encontrados!');
        return;
    }
    
    console.log('✅ [LOGIN.JS] Todos os elementos encontrados, anexando event listener...');
    
    // Função para fazer login
    function fazerLogin(username, password) {
        console.log('🟡 [LOGIN.JS] Processando login...');
        
        // Validações
        if (!username || !password) {
            console.warn('⚠️ [LOGIN.JS] Campos vazios detectados');
            showError('Por favor, preencha todos os campos.');
            return false;
        }
        
        // Verificar credenciais
        const validUsers = {
            'nilda': '123',
            'admin': 'gab123', // Usuário administrador
            'usuarioteste1': '123',
            'usuarioteste2': '123',
            'usuarioteste3': '123',
            'usuarioteste4': '123',
            'usuarioteste5': '123',
            'deivson': '123',
            'isaac': '123',
            'vinicius': '123'
        };
        
        if (validUsers[username] && validUsers[username] === password) {
            console.log('✅ [LOGIN.JS] Credenciais válidas!');
            
            // Salvar sessão
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('username', username);
            
            console.log('✅ [LOGIN.JS] SessionStorage salvo');
            console.log('🟡 [LOGIN.JS] Redirecionando para /gerenciamento.html...');
            
            // Redirecionar
            console.log('🟡 [LOGIN.JS] Redirecionando para gerenciamento.html...');
            try {
                // Tentar caminho absoluto primeiro
                window.location.href = '/gerenciamento.html';
                console.log('✅ [LOGIN.JS] window.location.href = /gerenciamento.html executado');
                
                // Fallback após 500ms se não redirecionou
                setTimeout(() => {
                    if (window.location.pathname !== '/gerenciamento.html' && !window.location.pathname.includes('gerenciamento')) {
                        console.log('🟡 [LOGIN.JS] Tentando caminho relativo...');
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
            showError('Usuário ou senha incorretos.');
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
    const submitButton = document.getElementById('entrarBtn') || loginForm.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            processarLogin();
        });
    }
    
    // Também manter o listener no formulário como backup
    console.log('🟢 [LOGIN.JS] Anexando evento submit ao formulário...');
    loginForm.addEventListener('submit', function(e) {
        console.log('🟡 [LOGIN.JS] ========== SUBMIT DO FORMULÁRIO ==========');
        e.preventDefault();
        e.stopPropagation();
        console.log('🟡 [LOGIN.JS] preventDefault e stopPropagation executados');
        processarLogin();
    });
    
    console.log('✅ [LOGIN.JS] Event listeners anexados');

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add('show');
        } else {
            console.error('❌ [LOGIN.JS] Erro: elemento errorMessage não encontrado!');
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
        console.log('ℹ️ [LOGIN.JS] Usuário não está logado, aguardando login...');
    }
    
    console.log('✅ [LOGIN.JS] Inicialização completa');
});

