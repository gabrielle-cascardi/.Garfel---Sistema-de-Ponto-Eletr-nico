// ══════════════════════════════════════════════════════
// RH-AVISOS.JS — Lógica da tela de gerenciar avisos (RH)
// ══════════════════════════════════════════════════════
 
// ── VERIFICAR SE É RH ─────────────────────────────────
var usuario = verificarRH();
 
// ── CONFIGURAR BARRA E MENUS ──────────────────────────
configurarBarra();
configurarMenus();
 
// ── ELEMENTOS ─────────────────────────────────────────
var modalVisualizacoes = document.getElementById('modal-visualizacoes');
var btnFecharModal     = document.getElementById('btn-fechar-modal');
var btnPublicar        = document.getElementById('btn-publicar');
var avMensagem         = document.getElementById('av-mensagem');
var avTipo             = document.getElementById('av-tipo');
var campoDestinatarios = document.getElementById('campo-destinatarios');
var selectDest         = document.getElementById('select-destinatarios');
var tagsDest           = document.getElementById('tags-destinatarios');
 
// Lista de IDs selecionados como destinatários
var destinatariosSelecionados = [];
 
// ── INICIALIZAR TELA ──────────────────────────────────
function inicializarTela() {
    preencherSelectDestinatarios();
    carregarAvisos();
}
 
// ── PREENCHER SELECT DE DESTINATÁRIOS ────────────────
function preencherSelectDestinatarios() {
    var usuarios = getUsuarios().filter(function(u) {
        return u.id !== usuario.id;
    });
    usuarios.forEach(function(u) {
        var option = document.createElement('option');
        option.value       = u.id;
        option.textContent = u.nome;
        selectDest.appendChild(option);
    });
}
 
// ── TOGGLE CAMPO DESTINATÁRIOS ────────────────────────
avTipo.addEventListener('change', function() {
    if (avTipo.value === 'especifico') {
        campoDestinatarios.classList.remove('escondido');
    } else {
        campoDestinatarios.classList.add('escondido');
        limparDestinatarios();
    }
});
 
// ── ADICIONAR TAG AO SELECIONAR DESTINATÁRIO ─────────
selectDest.addEventListener('change', function() {
    var id   = selectDest.value;
    var nome = selectDest.options[selectDest.selectedIndex].text;
    if (!id) return;
 
    destinatariosSelecionados.push({ id: parseInt(id), nome: nome });
    selectDest.options[selectDest.selectedIndex].style.display = 'none';
    selectDest.value = '';
    renderTags();
});
 
// ── RENDERIZAR TAGS ───────────────────────────────────
function renderTags() {
    if (destinatariosSelecionados.length === 0) {
        tagsDest.innerHTML = '';
        return;
    }
    tagsDest.innerHTML = destinatariosSelecionados.map(function(d) {
        return '<div class="tag">' +
            d.nome +
            '<span class="tag-remover" onclick="removerTag(' + d.id + ')">×</span>' +
        '</div>';
    }).join('');
}
 
// ── REMOVER TAG ───────────────────────────────────────
function removerTag(id) {
    // Reexibir opção no select
    for (var i = 0; i < selectDest.options.length; i++) {
        if (parseInt(selectDest.options[i].value) === id) {
            selectDest.options[i].style.display = '';
        }
    }
    destinatariosSelecionados = destinatariosSelecionados.filter(function(d) {
        return d.id !== id;
    });
    renderTags();
}
 
// ── LIMPAR DESTINATÁRIOS ──────────────────────────────
function limparDestinatarios() {
    destinatariosSelecionados = [];
    for (var i = 0; i < selectDest.options.length; i++) {
        selectDest.options[i].style.display = '';
    }
    renderTags();
}
 
// ── PUBLICAR AVISO ────────────────────────────────────
btnPublicar.addEventListener('click', function() {
    var titulo   = document.getElementById('av-titulo').value.trim();
    var descricao = document.getElementById('av-descricao').value.trim();
    var tipo     = avTipo.value;
 
    if (!titulo || !descricao) {
        mostrarMensagem('Preencha o título e a descrição.', true);
        return;
    }
    if (tipo === 'especifico' && destinatariosSelecionados.length === 0) {
        mostrarMensagem('Selecione ao menos um destinatário.', true);
        return;
    }
 
    var destinatarios = [];
    if (tipo === 'geral') {
        // Para aviso geral, adicionar todos os usuários como destinatários
        destinatarios = getUsuarios().map(function(u) {
            return { usuarioId: u.id, nome: u.nome, visto: false, vistoEm: null };
        });
    } else {
        destinatarios = destinatariosSelecionados.map(function(d) {
            return { usuarioId: d.id, nome: d.nome, visto: false, vistoEm: null };
        });
    }
 
    var avisos = getAvisos();
    avisos.push({
        id: Date.now(),
        titulo: titulo,
        descricao: descricao,
        tipo: tipo,
        criadoPor: usuario.id,
        criadoEm: new Date().toLocaleDateString('pt-BR'),
        destinatarios: destinatarios
    });
 
    salvar('garfel_avisos', avisos);
    registrarLog('Aviso criado: "' + titulo + '" (' + tipo + ')');
 
    // Limpar formulário
    document.getElementById('av-titulo').value    = '';
    document.getElementById('av-descricao').value = '';
    avTipo.value = 'geral';
    campoDestinatarios.classList.add('escondido');
    limparDestinatarios();
 
    mostrarMensagem('Aviso publicado com sucesso!', false);
    carregarAvisos();
});
 
// ── CARREGAR AVISOS PUBLICADOS ────────────────────────
function carregarAvisos() {
    var avisos = getAvisos().reverse();
    var div    = document.getElementById('lista-avisos');
 
    if (avisos.length === 0) {
        div.innerHTML = '<div class="vazio">Nenhum aviso publicado</div>';
        return;
    }
 
    div.innerHTML = avisos.map(function(a) {
        var total  = a.destinatarios ? a.destinatarios.length : 0;
        var vistos = a.destinatarios ? a.destinatarios.filter(function(d) { return d.visto; }).length : 0;
        return '<div class="aviso-publicado">' +
            '<div class="aviso-conteudo">' +
                '<p class="aviso-titulo">' + a.titulo + '</p>' +
                '<p class="aviso-descricao">' + a.descricao + '</p>' +
                '<p class="aviso-rodape">' + a.criadoEm + ' ● ' + (a.tipo === 'geral' ? 'Geral' : 'Específico') + '</p>' +
            '</div>' +
            '<div class="aviso-acoes">' +
                '<button class="botao-acao" onclick="verVisualizacoes(' + a.id + ')">Ver visualizações (' + vistos + '/' + total + ')</button>' +
                '<button class="botao-excluir" onclick="excluirAviso(' + a.id + ')">Excluir</button>' +
            '</div>' +
        '</div>';
    }).join('');
}
 
// ── VER VISUALIZAÇÕES ─────────────────────────────────
function verVisualizacoes(avisoId) {
    var avisos = getAvisos();
    var aviso  = avisos.find(function(a) { return a.id === avisoId; });
    if (!aviso) return;
 
    document.getElementById('modal-av-titulo').textContent   = aviso.titulo;
    document.getElementById('modal-av-descricao').textContent = aviso.descricao;
 
    var lista = document.getElementById('lista-visualizacoes');
    if (!aviso.destinatarios || aviso.destinatarios.length === 0) {
        lista.innerHTML = '<p style="color:#aaaaaa;font-size:14px;">Nenhum destinatário.</p>';
    } else {
        lista.innerHTML = aviso.destinatarios.map(function(d) {
            return '<div class="linha-visualizacao">' +
                '<span>' + d.nome + '</span>' +
                (d.visto
                    ? '<span class="visto-sim">Visto em ' + d.vistoEm + '</span>'
                    : '<span class="visto-nao">Não visto</span>') +
            '</div>';
        }).join('');
    }
 
    modalVisualizacoes.classList.remove('escondido');
}
 
// ── FECHAR MODAL ──────────────────────────────────────
btnFecharModal.addEventListener('click', function() {
    modalVisualizacoes.classList.add('escondido');
});
 
// ── EXCLUIR AVISO ─────────────────────────────────────
function excluirAviso(id) {
    if (!confirm('Deseja excluir este aviso?')) return;
    var avisos = getAvisos().filter(function(a) { return a.id !== id; });
    salvar('garfel_avisos', avisos);
    registrarLog('Aviso #' + id + ' excluído');
    carregarAvisos();
}
 
// ── MOSTRAR MENSAGEM ──────────────────────────────────
function mostrarMensagem(msg, erro) {
    avMensagem.textContent = msg;
    avMensagem.classList.remove('escondido');
    if (erro) {
        avMensagem.style.backgroundColor = '#fff3e0';
        avMensagem.style.color = '#7c5a00';
        avMensagem.style.borderColor = '#7c5a00';
    } else {
        avMensagem.style.backgroundColor = '#e8f5e9';
        avMensagem.style.color = '#2e7d32';
        avMensagem.style.borderColor = '#2e7d32';
    }
    setTimeout(function() {
        avMensagem.classList.add('escondido');
    }, 3000);
}
 
// ── INICIALIZAR ───────────────────────────────────────
inicializarTela();