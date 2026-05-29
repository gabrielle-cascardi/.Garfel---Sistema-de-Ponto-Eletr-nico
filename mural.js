// ══════════════════════════════════════════════════════
// MURAL.JS — Lógica da tela de mural de avisos
// ══════════════════════════════════════════════════════
 
// ── VERIFICAR LOGIN ───────────────────────────────────
var usuario = verificarLogin();
 
// ── CONFIGURAR BARRA E MENUS ──────────────────────────
configurarBarra();
configurarMenus();
 
// ── INICIALIZAR TELA ──────────────────────────────────
function inicializarTela() {
    carregarAvisos();
}
 
// ── CARREGAR AVISOS ───────────────────────────────────
function carregarAvisos() {
    var avisos = getAvisos().filter(function(a) {
        if (a.tipo === 'geral') return true;
        return a.destinatarios && a.destinatarios.some(function(d) {
            return d.usuarioId === usuario.id;
        });
    }).reverse();
 
    var div = document.getElementById('lista-avisos');
 
    if (avisos.length === 0) {
        div.innerHTML = '<div class="vazio">Nenhum aviso disponível</div>';
        return;
    }
 
    div.innerHTML = avisos.map(function(a) {
        var dest  = a.destinatarios && a.destinatarios.find(function(d) {
            return d.usuarioId === usuario.id;
        });
        var visto = dest && dest.visto;
        var acaoBtn = visto
            ? '<span class="visto-em">Visto em ' + dest.vistoEm + '</span>'
            : '<button class="botao-visto" onclick="marcarVisto(' + a.id + ')">Marcar como visto</button>';
 
        return '<div class="aviso">' +
            '<div class="aviso-conteudo">' +
                '<p class="aviso-titulo">' + a.titulo + '</p>' +
                '<p class="aviso-descricao">' + a.descricao + '</p>' +
                '<p class="aviso-data">' + a.criadoEm + ' ● ' + (a.tipo === 'geral' ? 'Geral' : 'Específico') + '</p>' +
            '</div>' +
            acaoBtn +
        '</div>';
    }).join('');
}
 
// ── MARCAR AVISO COMO VISTO ───────────────────────────
function marcarVisto(avisoId) {
    var avisos = getAvisos();
    var aviso  = avisos.find(function(a) { return a.id === avisoId; });
    if (!aviso) return;
 
    if (!aviso.destinatarios) aviso.destinatarios = [];
 
    var dest = aviso.destinatarios.find(function(d) {
        return d.usuarioId === usuario.id;
    });
 
    if (!dest) {
        aviso.destinatarios.push({
            usuarioId: usuario.id,
            nome: usuario.nome,
            visto: true,
            vistoEm: new Date().toLocaleString('pt-BR')
        });
    } else {
        dest.visto   = true;
        dest.vistoEm = new Date().toLocaleString('pt-BR');
    }
 
    salvar('garfel_avisos', avisos);
    registrarLog('Aviso "' + aviso.titulo + '" marcado como visto');
    carregarAvisos();
}
 
// ── INICIALIZAR ───────────────────────────────────────
inicializarTela();