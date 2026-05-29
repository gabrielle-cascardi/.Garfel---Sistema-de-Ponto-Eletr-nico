// ══════════════════════════════════════════════════════
// HORAS-MENSAIS.JS — Lógica da tela de horas mensais
// ══════════════════════════════════════════════════════
 
// ── VERIFICAR LOGIN ───────────────────────────────────
var usuario = verificarLogin();
 
// ── CONFIGURAR BARRA E MENUS ──────────────────────────
configurarBarra();
configurarMenus();
 
// ── INICIALIZAR TELA ──────────────────────────────────
function inicializarTela() {
    var agora = new Date();
 
    // Exibir mês atual
    document.getElementById('mes-atual').textContent =
        MESES[agora.getMonth()] + ' ' + agora.getFullYear();
 
    // Exibir carga horária
    document.getElementById('carga-mensal').textContent = (usuario.carga || 160) + 'h';
 
    carregarResumo();
    carregarTabela();
}
 
// ── CARREGAR RESUMO ───────────────────────────────────
function carregarResumo() {
    var agora  = new Date();
    var pontos = getPontosMes(agora.getMonth(), agora.getFullYear());
 
    var totalMinutos  = 0;
    var incompletos   = 0;
 
    pontos.forEach(function(p) {
        var m = calcularHorasMinutos(p);
        if (m !== null) {
            totalMinutos += m;
        } else {
            incompletos++;
        }
    });
 
    var carga = usuario.carga || 160;
    var pct   = Math.min(Math.round((totalMinutos / 60) / carga * 100), 100);
 
    document.getElementById('horas-realizadas').textContent  = formatarMinutos(totalMinutos);
    document.getElementById('dias-incompletos').textContent  = incompletos;
    document.getElementById('progresso-label').textContent   = formatarMinutos(totalMinutos) + ' realizadas';
    document.getElementById('progresso-pct').textContent     = pct + '%';
    document.getElementById('barra-fill').style.width        = pct + '%';
}
 
// ── CARREGAR TABELA ───────────────────────────────────
function carregarTabela() {
    var agora  = new Date();
    var pontos = getPontosMes(agora.getMonth(), agora.getFullYear())
        .sort(function(a, b) { return b.data.localeCompare(a.data); });
 
    var tbody = document.getElementById('tabela-registros');
 
    if (pontos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7"><div class="vazio">Nenhum registro este mês</div></td></tr>';
        return;
    }
 
    tbody.innerHTML = pontos.map(function(p) {
        var marcacoes = [p.entrada, p.iniAlmoco, p.fimAlmoco, p.saida].filter(Boolean);
        var completo  = marcacoes.length === 2 || marcacoes.length === 4;
        var total     = calcularHorasMinutos(p);
        var status    = completo
            ? '<span>Completo</span>'
            : '<span class="status-incompleto">Incompleto</span>';
        return '<tr>' +
            '<td>' + formatarData(p.data) + '</td>' +
            '<td>' + (p.entrada   || '—') + '</td>' +
            '<td>' + (p.iniAlmoco || '—') + '</td>' +
            '<td>' + (p.fimAlmoco || '—') + '</td>' +
            '<td>' + (p.saida     || '—') + '</td>' +
            '<td>' + (completo && total !== null ? formatarMinutos(total) : '—') + '</td>' +
            '<td>' + status + '</td>' +
        '</tr>';
    }).join('');
}
 
// ── FILTRAR PONTOS DO MÊS ─────────────────────────────
function getPontosMes(mes, ano) {
    return getPontos().filter(function(p) {
        if (p.usuarioId !== usuario.id) return false;
        var d = new Date(p.data + 'T00:00:00');
        return d.getMonth() === mes && d.getFullYear() === ano;
    });
}
 
// ── INICIALIZAR ───────────────────────────────────────
inicializarTela();