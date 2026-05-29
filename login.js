// ══════════════════════════════════════════════════════
// LOGIN.JS — Lógica da tela de login
// ══════════════════════════════════════════════════════
 
// ── SE JÁ ESTIVER LOGADO, REDIRECIONA ────────────────
if (sessionStorage.getItem('garfel_user')) {
    window.location.href = 'pages/registro-de-ponto.html';
}
 
// ── ELEMENTOS ─────────────────────────────────────────
var btnEntrar       = document.querySelector('.entrar');
var btnEsqueci      = document.querySelector('.esqueci-senha');
var inputEmail      = document.getElementById('email');
var inputSenha      = document.getElementById('senha');
var modalRecuperar  = document.getElementById('modal-recuperar');
var recNovaSenha    = document.getElementById('rec-nova-senha');
var recErro         = document.getElementById('rec-erro');
 
// ── LOGIN ─────────────────────────────────────────────
btnEntrar.addEventListener('click', function() {
    var email = inputEmail.value.trim();
    var senha = inputSenha.value;
 
    var attempts = JSON.parse(localStorage.getItem('garfel_attempts') || '[]');
    var usuarios = getUsuarios();
    var usuario  = usuarios.find(function(u) {
        return u.email === email && u.senha === senha;
    });
 
    if (!usuario) {
        var motivo = !email ? 'Email não preenchido' :
                    !usuarios.find(function(u) { return u.email === email; }) ?
                    'Email não encontrado' : 'Senha incorreta';
        attempts.push({
            id: Date.now(),
            email: email,
            sucesso: false,
            motivo: motivo,
            dataHora: new Date().toLocaleString('pt-BR')
        });
        salvar('garfel_attempts', attempts);
        mostrarErroLogin('Email ou senha incorretos.');
        return;
    }
 
    // VERIFICAR SE USUÁRIO ESTÁ ATIVO
    if (usuario.ativo === false) {
        attempts.push({
            id: Date.now(),
            email: email,
            sucesso: false,
            motivo: 'Usuário inativo',
            dataHora: new Date().toLocaleString('pt-BR')
        });
        salvar('garfel_attempts', attempts);
        mostrarErroLogin('Usuário inativo. Entre em contato com o RH.');
        return;
    }
 
    // LOGIN BEM SUCEDIDO
    attempts.push({
        id: Date.now(),
        email: email,
        sucesso: true,
        motivo: null,
        dataHora: new Date().toLocaleString('pt-BR')
    });
    salvar('garfel_attempts', attempts);
    sessionStorage.setItem('garfel_user', JSON.stringify(usuario));
    window.location.href = 'pages/registro-de-ponto.html';
});
 
// Permitir login com Enter
inputSenha.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') btnEntrar.click();
});
 
// ── MENSAGEM DE ERRO NO LOGIN ─────────────────────────
function mostrarErroLogin(msg) {
    var erroExistente = document.getElementById('erro-login');
    if (erroExistente) erroExistente.remove();
    var erro = document.createElement('p');
    erro.id = 'erro-login';
    erro.className = 'alerta';
    erro.style.marginTop = '12px';
    erro.textContent = msg;
    btnEntrar.parentNode.insertBefore(erro, btnEntrar);
}
 
// ── ABRIR MODAL DE RECUPERAÇÃO ────────────────────────
btnEsqueci.addEventListener('click', function(e) {
    e.preventDefault();
    modalRecuperar.classList.remove('escondido');
    recErro.classList.add('escondido');
    recNovaSenha.classList.add('escondido');
    document.getElementById('rec-email').value   = '';
    document.getElementById('rec-nasc').value    = '';
    document.getElementById('rec-cargo').value   = '';
});
 
// ── VOLTAR PARA O LOGIN ───────────────────────────────
document.getElementById('rec-btn-voltar').addEventListener('click', function() {
    modalRecuperar.classList.add('escondido');
});
 
// ── VERIFICAR DADOS E RECUPERAR SENHA ─────────────────
document.getElementById('rec-btn-verificar').addEventListener('click', function() {
 
    if (!recNovaSenha.classList.contains('escondido')) {
        var nova     = document.getElementById('rec-nova').value;
        var confirma = document.getElementById('rec-confirma').value;
        if (!nova || nova !== confirma) {
            alert('As senhas não coincidem!');
            return;
        }
        var emailRec = document.getElementById('rec-email').value.trim();
        var usuarios = getUsuarios();
        var idx      = usuarios.findIndex(function(u) { return u.email === emailRec; });
        usuarios[idx].senha = nova;
        salvar('garfel_usuarios', usuarios);
        alert('Senha alterada com sucesso!');
        modalRecuperar.classList.add('escondido');
        return;
    }
 
    var emailRec = document.getElementById('rec-email').value.trim();
    var nasc     = document.getElementById('rec-nasc').value;
    var cargo    = document.getElementById('rec-cargo').value.trim().toLowerCase();
    var usuarios = getUsuarios();
    var usuario  = usuarios.find(function(u) {
        return u.email    === emailRec &&
               u.nascimento === nasc  &&
               u.cargo.toLowerCase() === cargo;
    });
 
    if (!usuario) {
        recErro.classList.remove('escondido');
        return;
    }
 
    recErro.classList.add('escondido');
    recNovaSenha.classList.remove('escondido');
});