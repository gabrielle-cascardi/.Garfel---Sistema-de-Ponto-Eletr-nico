// ══════════════════════════════════════════════════════
// GERAL.JS — Lógica compartilhada entre todas as telas
// ══════════════════════════════════════════════════════
 
// ── FUNÇÕES DE ARMAZENAMENTO ──────────────────────────
 
function getUsuarios() {
    return JSON.parse(localStorage.getItem('garfel_usuarios') || '[]');
}
 
function getPontos() {
    return JSON.parse(localStorage.getItem('garfel_pontos') || '[]');
}
 
function getAvisos() {
    return JSON.parse(localStorage.getItem('garfel_avisos') || '[]');
}
 
function getSaldos() {
    return JSON.parse(localStorage.getItem('garfel_saldos') || '[]');
}
 
function getLogs() {
    return JSON.parse(localStorage.getItem('garfel_logs') || '[]');
}
 
function salvar(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}
 
// ── USUÁRIO LOGADO ────────────────────────────────────
 
function getUsuarioLogado() {
    return JSON.parse(sessionStorage.getItem('garfel_user'));
}
 
// ── REGISTRAR LOG ─────────────────────────────────────
 
function registrarLog(acao) {
    var usuario = getUsuarioLogado();
    if (!usuario) return;
    var logs = getLogs();
    logs.push({
        id: Date.now(),
        usuarioId: usuario.id,
        acao: acao,
        dataHora: new Date().toLocaleString('pt-BR')
    });
    salvar('garfel_logs', logs);
}
 
// ── INICIALIZAÇÃO DO SISTEMA ──────────────────────────
 
function inicializarSistema() {
    if (localStorage.getItem('garfel_init')) return;
    var usuarios = [{
        id: 1,
        nome: 'Administrador',
        email: 'admin@garfel.com',
        senha: 'admin123',
        nascimento: '1990-01-01',
        cargo: 'Administrador',
        carga: 160,
        tipo: 'rh',
        adm: true,
        ativo: true
    }];
    salvar('garfel_usuarios', usuarios);
    salvar('garfel_pontos', []);
    salvar('garfel_avisos', []);
    salvar('garfel_saldos', []);
    salvar('garfel_logs', []);
    salvar('garfel_attempts', []);
    localStorage.setItem('garfel_init', 'true');
}
 
// ── VERIFICAR LOGIN ───────────────────────────────────
 
function verificarLogin() {
    var usuario = getUsuarioLogado();
    if (!usuario) {
        window.location.href = '../index.html';
    }
    return usuario;
}
 
// ── VERIFICAR SE É RH ─────────────────────────────────
 
function verificarRH() {
    var usuario = getUsuarioLogado();
    if (!usuario || usuario.tipo !== 'rh') {
        window.location.href = '../index.html';
    }
    return usuario;
}
 
// ── CONFIGURAR BARRA ──────────────────────────────────
 
function configurarBarra() {
    var usuario = getUsuarioLogado();
    if (!usuario) return;
 
    var primeroNome = usuario.nome.split(' ')[0];
    document.getElementById('btn-avatar').textContent = primeroNome;
 
    if (usuario.tipo !== 'rh') {
        var linksRh = document.querySelectorAll('.link-rh');
        linksRh.forEach(function(link) {
            link.style.display = 'none';
        });
    }
 
    document.getElementById('btn-sair').addEventListener('click', function(e) {
        e.preventDefault();
        registrarLog('Logout realizado');
        sessionStorage.removeItem('garfel_user');
        window.location.href = '../index.html';
    });
}
 
// ── MENUS ─────────────────────────────────────────────
 
function configurarMenus() {
    var menuLateral = document.getElementById('menu-lateral');
    var menuPerfil  = document.getElementById('menu-perfil');
    var btnMenu     = document.getElementById('btn-menu');
    var btnAvatar   = document.getElementById('btn-avatar');
 
    btnMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        menuLateral.classList.toggle('escondido');
        menuPerfil.classList.add('escondido');
    });
 
    btnAvatar.addEventListener('click', function(e) {
        e.stopPropagation();
        menuPerfil.classList.toggle('escondido');
        menuLateral.classList.add('escondido');
    });
 
    document.addEventListener('click', function() {
        menuLateral.classList.add('escondido');
        menuPerfil.classList.add('escondido');
    });
}
 
// ── FUNÇÕES UTILITÁRIAS ───────────────────────────────
 
function hojeStr() {
    var d = new Date();
    return d.getFullYear() + '-' +
           String(d.getMonth() + 1).padStart(2, '0') + '-' +
           String(d.getDate()).padStart(2, '0');
}
 
function horaAtual() {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
 
function formatarData(str) {
    if (!str) return '—';
    var p = str.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
}
 
function calcularHorasMinutos(ponto) {
    if (!ponto.entrada) return null;
    var marcacoes = [ponto.entrada, ponto.iniAlmoco, ponto.fimAlmoco, ponto.saida].filter(Boolean);
    if (marcacoes.length !== 2 && marcacoes.length !== 4) return null;
    function toMin(t) {
        var p = t.split(':');
        return parseInt(p[0]) * 60 + parseInt(p[1]);
    }
    if (marcacoes.length === 2) {
        return toMin(marcacoes[1]) - toMin(marcacoes[0]);
    }
    return (toMin(marcacoes[1]) - toMin(marcacoes[0])) + (toMin(marcacoes[3]) - toMin(marcacoes[2]));
}
 
function formatarMinutos(min) {
    if (min === null || min === undefined) return '—';
    var h = Math.floor(Math.abs(min) / 60);
    var m = Math.abs(min) % 60;
    return (min < 0 ? '-' : '') + h + 'h' + (m > 0 ? m + 'min' : '');
}
 
var MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
             'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
 
function isUltimoDiaMes() {
    var d = new Date();
    var amanha = new Date(d);
    amanha.setDate(d.getDate() + 1);
    return amanha.getDate() === 1;
}
 
// ── INICIALIZA AO CARREGAR ────────────────────────────
inicializarSistema();