document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Limpar mensagem de erro anterior
        errorMessage.classList.remove('show');
        errorMessage.textContent = '';

        // Validações
        if (!username || !password) {
            showError('Por favor, preencha todos os campos.');
            return;
        }

        // Credenciais padrão
        if (username === 'nilda' && password === '123') {
            // Salvar sessão
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('username', username);
            
            console.log('Login bem-sucedido! Redirecionando...');
            
            // Redirecionar para a tela de gestão (usar caminho absoluto)
            try {
                window.location.href = '/login.html';
            } catch (error) {
                console.error('Erro ao redirecionar:', error);
                // Fallback: tentar caminho relativo
                window.location.href = 'login.html';
            }
        } else {
            showError('Usuário ou senha incorretos.');
            passwordInput.value = '';
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }

    // Verificar se já está logado
    if (sessionStorage.getItem('loggedIn') === 'true') {
        try {
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Erro ao redirecionar:', error);
            window.location.href = 'login.html';
        }
    }
});

