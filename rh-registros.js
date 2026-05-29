// ══════════════════════════════════════════════════════
// RH-REGISTROS.JS — Lógica da tela de registros de ponto (RH)
// ══════════════════════════════════════════════════════
 
// ── VERIFICAR SE É RH ─────────────────────────────────
var usuario = verificarRH();
 
// ── CONFIGURAR BARRA E MENUS ──────────────────────────
configurarBarra();
configurarMenus();
 
// ── ELEMENTOS ─────────────────────────────────────────
var modalEditar     = document.getElementById('modal-editar');
var btnSalvarEdicao = document.getElementById('btn-salvar-edicao');
var btnCancelar     = document.getElementById('btn-cancelar-edicao');
var filtroUsuario   = document.getElementById('filtro-usuario');
var filtroMes       = document.getElementById('filtro-mes');
 
// ── INICIALIZAR TELA ──────────────────────────────────
function inicializarTela() {
    preencherFiltroUsuarios();
    carregarIncompletos();
    carregarTabela();
}
 
// ── PREENCHER FILTRO DE USUÁRIOS ──────────────────────
function preencherFiltroUsuarios() {
    var usuarios = getUsuarios();
    usuarios.forEach(function(u) {
        var option = document.createElement('option');
        option.value       = u.id;
        option.textContent = u.nome;
        filtroUsuario.appendChild(option);
    });
}
 
// ── CARREGAR REGISTROS INCOMPLETOS ────────────────────
function carregarIncompletos() {
    var usuarios = getUsuarios();
    var pontos   = getPontos().filter(function(p) {
        var marcacoes = [p.entrada, p.iniAlmoco, p.fimAlmoco, p.saida].filter(Boolean);
        return marcacoes.length === 1 || marcacoes.length === 3;
    });
 
    var div = document.getElementById('lista-incompletos');
 
    if (pontos.length === 0) {
        div.innerHTML = '<div class="vazio">Nenhum registro incompleto</div>';
        return;
    }
 
    div.innerHTML = pontos.map(function(p) {
        var u         = usuarios.find(function(x) { return x.id === p.usuarioId; });
        var marcacoes = [p.entrada, p.iniAlmoco, p.fimAlmoco, p.saida].filter(Boolean);
        return '<div class="linha-incompleto">' +
            '<div class="incompleto-info">' +
                '<span class="badge-incompleto">' + marcacoes.length + ' marcações</span>' +
                '<span>' + (u ? u.nome : '—') + ' · ' + formatarData(p.data) + '</span>' +
            '</div>' +
            '<button class="botao-acao" onclick="abrirEditar(' + p.id + ')">Editar</button>' +
        '</div>';
    }).join('');
}
 
// ── CARREGAR TABELA ───────────────────────────────────
function carregarTabela() {
    var usuarios      = getUsuarios();
    var filtroUserId  = parseInt(filtroUsuario.value) || null;
    var filtroMesVal  = filtroMes.value;
 
    var pontos = getPontos().filter(function(p) {
        if (filtroUserId && p.usuarioId !== filtroUserId) return false;
        if (filtroMesVal && !p.data.startsWith(filtroMesVal)) return false;
        return true;
    }).sort(function(a, b) { return b.data.localeCompare(a.data); });
 
    var tbody = document.getElementById('tabela-registros');
 
    if (pontos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8"><div class="vazio">Nenhum registro encontrado</div></td></tr>';
        return;
    }
 
    tbody.innerHTML = pontos.map(function(p) {
        var u         = usuarios.find(function(x) { return x.id === p.usuarioId; });
        var marcacoes = [p.entrada, p.iniAlmoco, p.fimAlmoco, p.saida].filter(Boolean);
        var completo  = marcacoes.length === 2 || marcacoes.length === 4;
        var status    = completo ? '✓' : '<span class="badge-incompleto">!</span>';
        return '<tr>' +
            '<td>' + (u ? u.nome : '—') + '</td>' +
            '<td>' + formatarData(p.data) + '</td>' +
            '<td>' + (p.entrada   || '—') + '</td>' +
            '<td>' + (p.iniAlmoco || '—') + '</td>' +
            '<td>' + (p.fimAlmoco || '—') + '</td>' +
            '<td>' + (p.saida     || '—') + '</td>' +
            '<td>' + status + '</td>' +
            '<td>' +
                '<button class="botao-acao" onclick="abrirEditar(' + p.id + ')">Editar</button>' +
                '<button class="botao-acao" onclick="excluirRegistro(' + p.id + ')">Excluir</button>' +
            '</td>' +
        '</tr>';
    }).join('');
}
 
// ── ABRIR MODAL EDITAR ────────────────────────────────
function abrirEditar(id) {
    var pontos = getPontos();
    var p = pontos.find(function(p) { return p.id === id; });
    if (!p) return;
 
    document.getElementById('edit-id').value        = p.id;
    document.getElementById('edit-entrada').value   = p.entrada   || '';
    document.getElementById('edit-ini-almoco').value = p.iniAlmoco || '';
    document.getElementById('edit-fim-almoco').value = p.fimAlmoco || '';
    document.getElementById('edit-saida').value     = p.saida     || '';
 
    modalEditar.classList.remove('escondido');
}
 
// ── SALVAR EDIÇÃO ─────────────────────────────────────
btnSalvarEdicao.addEventListener('click', function() {
    var id = parseInt(document.getElementById('edit-id').value);
    var pontos = getPontos();
    var idx    = pontos.findIndex(function(p) { return p.id === id; });
 
    pontos[idx].entrada   = document.getElementById('edit-entrada').value   || null;
    pontos[idx].iniAlmoco = document.getElementById('edit-ini-almoco').value || null;
    pontos[idx].fimAlmoco = document.getElementById('edit-fim-almoco').value || null;
    pontos[idx].saida     = document.getElementById('edit-saida').value     || null;
 
    salvar('garfel_pontos', pontos);
    registrarLog('Registro de ponto #' + id + ' editado pelo RH');
 
    modalEditar.classList.add('escondido');
    carregarIncompletos();
    carregarTabela();
});
 
// ── CANCELAR EDIÇÃO ───────────────────────────────────
btnCancelar.addEventListener('click', function() {
    modalEditar.classList.add('escondido');
});
 
// ── EXCLUIR REGISTRO ──────────────────────────────────
function excluirRegistro(id) {
    if (!confirm('Deseja excluir este registro de ponto?')) return;
    var pontos = getPontos().filter(function(p) { return p.id !== id; });
    salvar('garfel_pontos', pontos);
    registrarLog('Registro de ponto #' + id + ' excluído pelo RH');
    carregarIncompletos();
    carregarTabela();
}
 
// ── FILTROS ───────────────────────────────────────────
filtroUsuario.addEventListener('change', carregarTabela);
filtroMes.addEventListener('change', carregarTabela);
 
// ── INICIALIZAR ───────────────────────────────────────
inicializarTela();