// ══════════════════════════════════════════════════════
// REGISTRO-DE-PONTO.JS — Lógica da tela de registro de ponto
// ══════════════════════════════════════════════════════
 
// ── VERIFICAR LOGIN ───────────────────────────────────
var usuario = verificarLogin();
 
// ── CONFIGURAR BARRA E MENUS ──────────────────────────
configurarBarra();
configurarMenus();
 
// ── ELEMENTOS ─────────────────────────────────────────
var btnEntrada    = document.getElementById('btn-entrada');
var btnIniAlmoco  = document.getElementById('btn-ini-almoco');
var btnFimAlmoco  = document.getElementById('btn-fim-almoco');
var btnSaida      = document.getElementById('btn-saida');
var mensagemAlerta = document.getElementById('mensagem-alerta');
var modalFundo    = document.getElementById('modal-fundo');
var btnSairSemAlmoco    = document.getElementById('btn-sair-sem-almoco');
var btnConfirmarAlmoco  = document.getElementById('btn-confirmar-almoco');
var erroAlmocoManual    = document.getElementById('erro-almoco-manual');
 
// ── INICIALIZAR TELA ──────────────────────────────────
function inicializarTela() {
    var agora = new Date();
 
    // Exibir data de hoje
    document.getElementById('data-hoje').textContent = formatarData(hojeStr());
 
    // Exibir mês/ano no histórico
    document.getElementById('mes-ano').textContent = MESES[agora.getMonth()] + ' ' + agora.getFullYear();
 
    // Carregar ponto de hoje
    carregarPontoHoje();
 
    // Carregar histórico do mês
    carregarHistorico();
}
 
// ── CARREGAR PONTO DE HOJE ────────────────────────────
function carregarPontoHoje() {
    var pontos    = getPontos();
    var pontoHoje = pontos.find(function(p) {
        return p.usuarioId === usuario.id && p.data === hojeStr();
    });

    document.getElementById('horario-entrada').textContent    = pontoHoje && pontoHoje.entrada   ? pontoHoje.entrada   : '—';
    document.getElementById('horario-ini-almoco').textContent = pontoHoje && pontoHoje.iniAlmoco ? pontoHoje.iniAlmoco : '—';
    document.getElementById('horario-fim-almoco').textContent = pontoHoje && pontoHoje.fimAlmoco ? pontoHoje.fimAlmoco : '—';
    document.getElementById('horario-saida').textContent      = pontoHoje && pontoHoje.saida     ? pontoHoje.saida     : '—';

    // SE SAÍDA JÁ REGISTRADA, BLOQUEAR TODOS OS BOTÕES
    if (pontoHoje && pontoHoje.saida) {
        [btnEntrada, btnIniAlmoco, btnFimAlmoco, btnSaida].forEach(function(btn) {
            btn.classList.add('registrado');
        });
        return;
    }

    if (pontoHoje && pontoHoje.entrada)   btnEntrada.classList.add('registrado');
    if (pontoHoje && pontoHoje.iniAlmoco) btnIniAlmoco.classList.add('registrado');
    if (pontoHoje && pontoHoje.fimAlmoco) btnFimAlmoco.classList.add('registrado');
    if (pontoHoje && pontoHoje.saida)     btnSaida.classList.add('registrado');
}
 
// ── CARREGAR HISTÓRICO DO MÊS ─────────────────────────
function carregarHistorico() {
    var agora  = new Date();
    var pontos = getPontos().filter(function(p) {
        if (p.usuarioId !== usuario.id) return false;
        var d = new Date(p.data + 'T00:00:00');
        return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
    }).sort(function(a, b) { return b.data.localeCompare(a.data); });
 
    var div = document.getElementById('historico-lista');
 
    if (pontos.length === 0) {
        div.innerHTML = '<div class="vazio"><p>Nenhum registro neste mês</p></div>';
        return;
    }
 
    div.innerHTML = pontos.map(function(p) {
        var marcacoes = [p.entrada, p.iniAlmoco, p.fimAlmoco, p.saida].filter(Boolean);
        var completo  = marcacoes.length === 2 || marcacoes.length === 4;
        var status    = completo ? 'Completo' : 'Incompleto';
        return '<div class="linha-historico">' +
            '<p>● ' + formatarData(p.data) + ' - ' + status + ' (' + marcacoes.length + ' marcações)</p>' +
        '</div>';
    }).join('');
}
 
// ── REGISTRAR PONTO ───────────────────────────────────
function registrarPonto(campo) {
    var pontos    = getPontos();
    var pontoHoje = pontos.find(function(p) {
        return p.usuarioId === usuario.id && p.data === hojeStr();
    });
 
    // Esconder alerta anterior
    mensagemAlerta.classList.add('escondido');
    mensagemAlerta.textContent = '';

    // Se não existe registro hoje, criar
    if (!pontoHoje) {
        if (campo !== 'entrada') {
            mostrarAlerta('Registre a entrada primeiro.');
            return;
        }
        pontoHoje = {
            id: Date.now(),
            usuarioId: usuario.id,
            data: hojeStr(),
            entrada: null,
            iniAlmoco: null,
            fimAlmoco: null,
            saida: null
        };
        pontos.push(pontoHoje);
    }
 
    // Verificar se já foi registrado
    if (pontoHoje[campo]) {
        mostrarAlerta('Esse horário já foi registrado.');
        return;
    }
 
    // VALIDAÇÕES
    if (campo === 'iniAlmoco' && !pontoHoje.entrada) {
        mostrarAlerta('Registre a entrada primeiro.');
        return;
    }
    if (campo === 'fimAlmoco' && !pontoHoje.iniAlmoco) {
        mostrarAlerta('Registre o início do almoço primeiro.');
        return;
    }
    if (campo === 'saida' && pontoHoje.iniAlmoco && !pontoHoje.fimAlmoco) {
        mostrarAlerta('Registre o fim do almoço antes de registrar a saída.');
        return;
    }
 
    // SAÍDA SEM ALMOÇO — exibir modal
    if (campo === 'saida' && !pontoHoje.iniAlmoco) {
        modalFundo.classList.remove('escondido');
        return;
    }
 
    // SALVAR MARCAÇÃO
    pontoHoje[campo] = horaAtual();
    salvar('garfel_pontos', pontos);
    registrarLog('Ponto registrado: ' + campo + ' às ' + horaAtual());
 
    // Verificar último dia do mês para calcular saldo
    if (campo === 'saida' && isUltimoDiaMes()) {
        calcularSaldoMes();
    }
 
    carregarPontoHoje();
    carregarHistorico();
}
 
// ── MOSTRAR ALERTA ────────────────────────────────────
function mostrarAlerta(msg) {
    mensagemAlerta.textContent = msg;
    mensagemAlerta.classList.remove('escondido');
}
 
// ── MODAL — SAIR SEM ALMOÇO ───────────────────────────
btnSairSemAlmoco.addEventListener('click', function() {
    var pontos    = getPontos();
    var pontoHoje = pontos.find(function(p) {
        return p.usuarioId === usuario.id && p.data === hojeStr();
    });
    pontoHoje.saida = horaAtual();
    salvar('garfel_pontos', pontos);
    registrarLog('Saída registrada sem almoço às ' + horaAtual());
    if (isUltimoDiaMes()) calcularSaldoMes();
    modalFundo.classList.add('escondido');
    carregarPontoHoje();
    carregarHistorico();
});
 
// ── MODAL — REGISTRAR ALMOÇO MANUAL E SAIR ───────────
btnConfirmarAlmoco.addEventListener('click', function() {
    var ini = document.getElementById('manual-ini-almoco').value;
    var fim = document.getElementById('manual-fim-almoco').value;
 
    if (!ini || !fim) {
        erroAlmocoManual.textContent = 'Preencha os dois horários.';
        erroAlmocoManual.classList.remove('escondido');
        return;
    }
 
    function toMin(t) { var p = t.split(':'); return parseInt(p[0]) * 60 + parseInt(p[1]); }
 
    var pontos    = getPontos();
    var pontoHoje = pontos.find(function(p) {
        return p.usuarioId === usuario.id && p.data === hojeStr();
    });
 
    if (toMin(ini) <= toMin(pontoHoje.entrada)) {
        erroAlmocoManual.textContent = 'Início do almoço deve ser posterior à entrada.';
        erroAlmocoManual.classList.remove('escondido');
        return;
    }
    if (toMin(fim) <= toMin(ini)) {
        erroAlmocoManual.textContent = 'Fim do almoço deve ser posterior ao início.';
        erroAlmocoManual.classList.remove('escondido');
        return;
    }
 
    pontoHoje.iniAlmoco = ini;
    pontoHoje.fimAlmoco = fim;
    pontoHoje.saida     = horaAtual();
    salvar('garfel_pontos', pontos);
    registrarLog('Almoço manual (' + ini + ' - ' + fim + ') e saída às ' + horaAtual());
 
    erroAlmocoManual.classList.add('escondido');
    document.getElementById('manual-ini-almoco').value = '';
    document.getElementById('manual-fim-almoco').value = '';
 
    if (isUltimoDiaMes()) calcularSaldoMes();
    modalFundo.classList.add('escondido');
    carregarPontoHoje();
    carregarHistorico();
});
 
// ── CALCULAR E SALVAR SALDO DO MÊS ───────────────────
function calcularSaldoMes() {
    var agora = new Date();
    var mes   = agora.getMonth() + 1;
    var ano   = agora.getFullYear();
    var saldos = getSaldos();
 
    // Verificar se saldo do mês já foi calculado
    if (saldos.find(function(s) {
        return s.usuarioId === usuario.id && s.mes === mes && s.ano === ano;
    })) return;
 
    var pontos = getPontos().filter(function(p) {
        if (p.usuarioId !== usuario.id) return false;
        var d = new Date(p.data + 'T00:00:00');
        return d.getMonth() + 1 === mes && d.getFullYear() === ano;
    });
 
    var totalMinutos = 0;
    pontos.forEach(function(p) {
        var m = calcularHorasMinutos(p);
        if (m) totalMinutos += m;
    });
 
    var horasRealizadas = totalMinutos / 60;
    var horasEsperadas  = usuario.carga || 160;
    var saldo           = horasRealizadas - horasEsperadas;
 
    saldos.push({
        id: Date.now(),
        usuarioId: usuario.id,
        mes: mes,
        ano: ano,
        horasRealizadas: horasRealizadas,
        horasEsperadas: horasEsperadas,
        saldo: saldo
    });
    salvar('garfel_saldos', saldos);
    registrarLog('Saldo mensal calculado: ' + mes + '/' + ano);
}
 
// ── EVENTOS DOS BOTÕES DE PONTO ───────────────────────
btnEntrada.addEventListener('click',   function() { registrarPonto('entrada'); });
btnIniAlmoco.addEventListener('click', function() { registrarPonto('iniAlmoco'); });
btnFimAlmoco.addEventListener('click', function() { registrarPonto('fimAlmoco'); });
btnSaida.addEventListener('click',     function() { registrarPonto('saida'); });
 
// ── INICIALIZAR ───────────────────────────────────────
inicializarTela();