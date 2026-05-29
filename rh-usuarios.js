// ══════════════════════════════════════════════════════
// RH-USUARIOS.JS — Lógica da tela de gerenciar usuários
// ══════════════════════════════════════════════════════
 
// ── VERIFICAR SE É RH ─────────────────────────────────
var usuario = verificarRH();
 
// ── CONFIGURAR BARRA E MENUS ──────────────────────────
configurarBarra();
configurarMenus();
 
// ── ELEMENTOS ─────────────────────────────────────────
var modalEditar     = document.getElementById('modal-editar');
var btnCadastrar    = document.getElementById('btn-cadastrar');
var btnSalvarEdicao = document.getElementById('btn-salvar-edicao');
var btnCancelar     = document.getElementById('btn-cancelar-edicao');
var cadMensagem     = document.getElementById('cad-mensagem');
var timeoutMensagem;
 
// ── INICIALIZAR TELA ──────────────────────────────────
function inicializarTela() {
    carregarTabelas();
}
 
// ── CARREGAR TABELAS ──────────────────────────────────
function carregarTabelas() {
    var usuarios = getUsuarios();
    var ativos   = usuarios.filter(function(u) { return u.ativo !== false; });
    var inativos = usuarios.filter(function(u) { return u.ativo === false; });
 
    renderTabela(ativos, 'tabela-usuarios-ativos', true);
    renderTabela(inativos, 'tabela-usuarios-inativos', false);
}
 
// ── RENDERIZAR TABELA ─────────────────────────────────
function renderTabela(usuarios, tbodyId, ativo) {
    var tbody = document.getElementById(tbodyId);
    var colspan = ativo ? '6' : '5';
 
    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="' + colspan + '"><div class="vazio">' +
            (ativo ? 'Nenhum usuário ativo' : 'Nenhum usuário inativo') +
            '</div></td></tr>';
        return;
    }
 
    tbody.innerHTML = usuarios.map(function(u) {
        var badge = u.tipo === 'rh'
            ? '<span class="badge-rh">RH</span>'
            : '<span class="badge-colaborador">Colaborador</span>';
 
        if (ativo) {
            return '<tr>' +
                '<td><strong>' + u.nome + '</strong></td>' +
                '<td>' + u.email + '</td>' +
                '<td>' + u.cargo + '</td>' +
                '<td>' + u.carga + '</td>' +
                '<td>' + badge + '</td>' +
                '<td>' +
                    '<button class="botao-editar" onclick="abrirEditar(' + u.id + ')">Editar</button>' +
                    '<button class="botao-inativar" onclick="alterarStatus(' + u.id + ', false)">Inativar</button>' +
                '</td>' +
            '</tr>';
        } else {
            return '<tr>' +
                '<td><strong>' + u.nome + '</strong></td>' +
                '<td>' + u.email + '</td>' +
                '<td>' + u.cargo + '</td>' +
                '<td>' + badge + '</td>' +
                '<td>' +
                    '<button class="botao-ativar" onclick="alterarStatus(' + u.id + ', true)">Ativar</button>' +
                '</td>' +
            '</tr>';
        }
    }).join('');
}
 
// ── CADASTRAR USUÁRIO ─────────────────────────────────
btnCadastrar.addEventListener('click', function() {
    var nome  = document.getElementById('cad-nome').value.trim();
    var nasc  = document.getElementById('cad-nasc').value;
    var cargo = document.getElementById('cad-cargo').value.trim();
    var carga = parseInt(document.getElementById('cad-carga').value);
    var email = document.getElementById('cad-email').value.trim();
    var senha = document.getElementById('cad-senha').value;
    var tipo  = document.getElementById('cad-tipo').value;
 
    if (!nome || !nasc || !cargo || !carga || !email || !senha) {
        mostrarMensagem('Preencha todos os campos.', true);
        return;
    }
 
    var usuarios = getUsuarios();
    if (usuarios.find(function(u) { return u.email === email; })) {
        mostrarMensagem('Email já cadastrado.', true);
        return;
    }
 
    usuarios.push({
        id: Date.now(),
        nome: nome,
        nascimento: nasc,
        cargo: cargo,
        carga: carga,
        email: email,
        senha: senha,
        tipo: tipo,
        adm: false,
        ativo: true
    });
 
    salvar('garfel_usuarios', usuarios);
    registrarLog('Usuário cadastrado: ' + nome + ' (' + tipo + ')');
    mostrarMensagem('Usuário cadastrado com sucesso!', false);
 
    ['cad-nome','cad-nasc','cad-cargo','cad-carga','cad-email','cad-senha'].forEach(function(id) {
        document.getElementById(id).value = '';
    });
 
    carregarTabelas();
});
 
// ── ALTERAR STATUS (ATIVAR / INATIVAR) ────────────────
function alterarStatus(id, novoStatus) {
    var acao = novoStatus ? 'ativar' : 'inativar';
    if (!confirm('Deseja ' + acao + ' este usuário?')) return;
 
    var usuarios = getUsuarios();
    var idx = usuarios.findIndex(function(u) { return u.id === id; });
    usuarios[idx].ativo = novoStatus;
 
    salvar('garfel_usuarios', usuarios);
    registrarLog('Usuário ' + (novoStatus ? 'ativado' : 'inativado') + ': ' + usuarios[idx].nome);
    carregarTabelas();
}
 
// ── ABRIR MODAL EDITAR ────────────────────────────────
function abrirEditar(id) {
    var usuarios = getUsuarios();
    var u = usuarios.find(function(u) { return u.id === id; });
    if (!u) return;
 
    document.getElementById('edit-id').value    = u.id;
    document.getElementById('edit-nome').value  = u.nome;
    document.getElementById('edit-nasc').value  = u.nascimento;
    document.getElementById('edit-cargo').value = u.cargo;
    document.getElementById('edit-carga').value = u.carga;
    document.getElementById('edit-email').value = u.email;
    document.getElementById('edit-senha').value = u.senha;
    document.getElementById('edit-tipo').value  = u.tipo;
 
    modalEditar.classList.remove('escondido');
}
 
// ── SALVAR EDIÇÃO ─────────────────────────────────────
btnSalvarEdicao.addEventListener('click', function() {
    var id    = parseInt(document.getElementById('edit-id').value);
    var nome  = document.getElementById('edit-nome').value.trim();
    var nasc  = document.getElementById('edit-nasc').value;
    var cargo = document.getElementById('edit-cargo').value.trim();
    var carga = parseInt(document.getElementById('edit-carga').value);
    var email = document.getElementById('edit-email').value.trim();
    var senha = document.getElementById('edit-senha').value;
    var tipo  = document.getElementById('edit-tipo').value;
 
    if (!nome || !nasc || !cargo || !carga || !email || !senha) {
        alert('Preencha todos os campos.');
        return;
    }
 
    var usuarios = getUsuarios();
    var emailDuplicado = usuarios.find(function(u) {
        return u.email === email && u.id !== id;
    });
    if (emailDuplicado) {
        alert('Email já cadastrado para outro usuário.');
        return;
    }
 
    var idx = usuarios.findIndex(function(u) { return u.id === id; });
    usuarios[idx].nome       = nome;
    usuarios[idx].nascimento = nasc;
    usuarios[idx].cargo      = cargo;
    usuarios[idx].carga      = carga;
    usuarios[idx].email      = email;
    usuarios[idx].senha      = senha;
    usuarios[idx].tipo       = tipo;
 
    salvar('garfel_usuarios', usuarios);
    registrarLog('Usuário editado: ' + nome);
 
    if (id === usuario.id) {
        sessionStorage.setItem('garfel_user', JSON.stringify(usuarios[idx]));
    }
 
    modalEditar.classList.add('escondido');
    carregarTabelas();
});
 
// ── CANCELAR EDIÇÃO ───────────────────────────────────
btnCancelar.addEventListener('click', function() {
    modalEditar.classList.add('escondido');
});
 
// ── MOSTRAR MENSAGEM ──────────────────────────────────
function mostrarMensagem(msg, erro) {
    cadMensagem.textContent = msg;
    cadMensagem.classList.remove('escondido');
    if (erro) {
        cadMensagem.style.backgroundColor = '#fff3e0';
        cadMensagem.style.color           = '#7c5a00';
        cadMensagem.style.borderColor     = '#ffe082';
    } else {
        cadMensagem.style.backgroundColor = '#e8f5e9';
        cadMensagem.style.color           = '#2e7d32';
        cadMensagem.style.borderColor     = '#a5d6a7';
    }
    clearTimeout(timeoutMensagem);
    timeoutMensagem = setTimeout(function() {
        cadMensagem.classList.add('escondido');
    }, 3000);
}
 
// ── INICIALIZAR ───────────────────────────────────────
inicializarTela();