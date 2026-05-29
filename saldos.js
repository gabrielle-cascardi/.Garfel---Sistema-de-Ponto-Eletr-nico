// ══════════════════════════════════════════════════════
// SALDOS.JS — Lógica da tela de saldos mensais
// ══════════════════════════════════════════════════════
 
// ── VERIFICAR LOGIN ───────────────────────────────────
var usuario = verificarLogin();
 
// ── CONFIGURAR BARRA E MENUS ──────────────────────────
configurarBarra();
configurarMenus();
 
// ── INICIALIZAR TELA ──────────────────────────────────
function inicializarTela() {
    carregarSaldos();
}
 
// ── CARREGAR SALDOS ───────────────────────────────────
function carregarSaldos() {
    var saldos = getSaldos().filter(function(s) {
        return s.usuarioId === usuario.id;
    }).sort(function(a, b) {
        if (a.ano !== b.ano) return a.ano - b.ano;
        return b.mes - a.mes;
    });
 
    var tbody = document.getElementById('tabela-saldos');
 
    if (saldos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4"><div class="vazio">Nenhum saldo disponível ainda</div></td></tr>';
        return;
    }
 
    tbody.innerHTML = saldos.map(function(s) {
        var positivo = s.saldo >= 0;
        var saldoFormatado = (positivo ? '+' : '') + formatarMinutos(Math.abs(s.saldo) * 60);
        if (!positivo) saldoFormatado = '-' + formatarMinutos(Math.abs(s.saldo) * 60);
        var classe = positivo ? 'saldo-positivo' : 'saldo-negativo';
        return '<tr>' +
            '<td>' + MESES[s.mes - 1] + ' ' + s.ano + '</td>' +
            '<td>' + formatarMinutos(s.horasEsperadas * 60) + '</td>' +
            '<td>' + formatarMinutos(s.horasRealizadas * 60) + '</td>' +
            '<td><span class="' + classe + '">' + saldoFormatado + '</span></td>' +
        '</tr>';
    }).join('');
}
 
// ── INICIALIZAR ───────────────────────────────────────
inicializarTela();