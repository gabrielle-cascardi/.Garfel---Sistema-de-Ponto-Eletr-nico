// ══════════════════════════════════════════════════════
// MEU-PERFIL.JS — Lógica da tela de perfil do usuário
// ══════════════════════════════════════════════════════
 
// ── VERIFICAR LOGIN ───────────────────────────────────
var usuario = verificarLogin();
 
// ── CONFIGURAR BARRA E MENUS ──────────────────────────
configurarBarra();
configurarMenus();
 
// ── ELEMENTOS ─────────────────────────────────────────
var btnEditar      = document.getElementById('btn-editar');
var btnCancelar    = document.getElementById('btn-cancelar');
var btnSalvar      = document.getElementById('btn-salvar');
var btnEditarBox   = document.getElementById('btn-editar-box');
var botoesEdicao   = document.getElementById('botoes-edicao');
var perfilMensagem = document.getElementById('perfil-mensagem');
 
// Campos que PODEM ser editados pelo usuário
var camposEditaveis = ['perfil-nome', 'perfil-email', 'perfil-nasc', 'perfil-senha'];
 
// Campos que NÃO podem ser editados
var camposBloqueados = ['perfil-cargo', 'perfil-carga', 'perfil-tipo'];
 
// ── INICIALIZAR TELA ──────────────────────────────────
function inicializarTela() {
    carregarDados();
}
 
// ── CARREGAR DADOS DO USUÁRIO ─────────────────────────
function carregarDados() {
    document.getElementById('perfil-nome').value  = usuario.nome;
    document.getElementById('perfil-email').value = usuario.email;
    document.getElementById('perfil-nasc').value  = formatarData(usuario.nascimento);
    document.getElementById('perfil-cargo').value = usuario.cargo;
    document.getElementById('perfil-carga').value = usuario.carga + 'h';
    document.getElementById('perfil-tipo').value  = usuario.tipo === 'rh' ? 'RH' : 'Colaborador';
    document.getElementById('perfil-senha').value = usuario.senha;
}
 
// ── ATIVAR MODO EDIÇÃO ────────────────────────────────
btnEditar.addEventListener('click', function() {
    // Habilitar campos editáveis
    camposEditaveis.forEach(function(id) {
        var campo = document.getElementById(id);
        campo.disabled = false;
        if (id === 'perfil-senha') {
            campo.value       = '';
            campo.placeholder = 'Deixe em branco para manter a senha atual';
        }
        if (id === 'perfil-nasc') {
            // Converter para formato date ao editar
            campo.type  = 'date';
            campo.value = usuario.nascimento;
        }
    });

    camposEditaveis.forEach(function(id) {
        var campo = document.getElementById(id);
        var label = campo.previousElementSibling;
        if (label) label.style.color = '#111111';
    });
 
    btnEditarBox.classList.add('escondido');
    botoesEdicao.classList.remove('escondido');
    perfilMensagem.classList.add('escondido');
});
 
// ── CANCELAR EDIÇÃO ───────────────────────────────────
btnCancelar.addEventListener('click', function() {
    carregarDados();
    desativarEdicao();
});
 
// ── SALVAR ALTERAÇÕES ─────────────────────────────────
btnSalvar.addEventListener('click', function() {
    var nome  = document.getElementById('perfil-nome').value.trim();
    var email = document.getElementById('perfil-email').value.trim();
    var nasc  = document.getElementById('perfil-nasc').value;
    var senha = document.getElementById('perfil-senha').value;
 
    if (!nome || !email || !nasc) {
        mostrarMensagem('Preencha todos os campos obrigatórios.', true);
        return;
    }
 
    var usuarios = getUsuarios();
 
    // Verificar email duplicado
    var emailDuplicado = usuarios.find(function(u) {
        return u.email === email && u.id !== usuario.id;
    });
    if (emailDuplicado) {
        mostrarMensagem('Email já cadastrado para outro usuário.', true);
        return;
    }
 
    // Atualizar dados
    var idx = usuarios.findIndex(function(u) { return u.id === usuario.id; });
    usuarios[idx].nome       = nome;
    usuarios[idx].email      = email;
    usuarios[idx].nascimento = nasc;
    if (senha) {
        usuarios[idx].senha = senha;
    }
 
    salvar('garfel_usuarios', usuarios);
 
    // Atualizar sessão
    usuario = usuarios[idx];
    sessionStorage.setItem('garfel_user', JSON.stringify(usuario));
 
    registrarLog('Dados cadastrais alterados pelo próprio usuário');
 
    carregarDados();
    desativarEdicao();
    mostrarMensagem('Alterações salvas com sucesso!', false);
});
 
// ── DESATIVAR MODO EDIÇÃO ─────────────────────────────
function desativarEdicao() {
    camposEditaveis.forEach(function(id) {
        var campo    = document.getElementById(id);
        campo.disabled    = true;
        campo.placeholder = '';
        if (id === 'perfil-nasc') {
            campo.type = 'text';
        }
    });

    camposEditaveis.forEach(function(id) {
        var campo = document.getElementById(id);
        var label = campo.previousElementSibling;
        if (label) label.style.color = '';
    });
    
    perfilMensagem.classList.add('escondido');
    btnEditarBox.classList.remove('escondido');
    botoesEdicao.classList.add('escondido');
}
 
// ── MOSTRAR MENSAGEM ──────────────────────────────────
function mostrarMensagem(msg, erro) {
    perfilMensagem.textContent = msg;
    perfilMensagem.classList.remove('escondido');
    if (erro) {
        perfilMensagem.style.backgroundColor = '#fff3e0';
        perfilMensagem.style.color           = '#7c5a00';
        perfilMensagem.style.borderColor     = '#ffe082';
    } else {
        perfilMensagem.style.backgroundColor = '#e8f5e9';
        perfilMensagem.style.color           = '#2e7d32';
        perfilMensagem.style.borderColor     = '#2e7d32';
    }
    if (!erro) {
        setTimeout(function() {
            perfilMensagem.classList.add('escondido');
        }, 3000);
    }
}
 
// ── INICIALIZAR ───────────────────────────────────────
inicializarTela();