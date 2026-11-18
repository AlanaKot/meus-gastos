// Testes automáticos do Meus Gastos. Abrem o app num navegador invisível e conferem as funções principais.
// Como rodar (na pasta do projeto):   node testes/testar.js
// Precisa do Node e do Playwright (a biblioteca que controla o navegador). No fim aparece o que passou (✓) e o que falhou (✗).
// Todos os dados usados aqui são inventados.
const { chromium, devices } = require("playwright");
const http = require("http"), fs = require("fs"), os = require("os"), path = require("path");

const RAIZ = path.join(__dirname, "..");
const TIPOS = { ".html":"text/html; charset=utf-8", ".js":"text/javascript", ".png":"image/png", ".webmanifest":"application/manifest+json" };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "meus-gastos-"));
let falhas = 0, feitos = 0;
const ok = (nome, cond, detalhe = "") => { feitos++; if (cond) console.log("  ✓ " + nome); else { falhas++; console.log("  ✗ " + nome + (detalhe ? "  →  " + detalhe : "")); } };
const titulo = t => console.log("\n" + t);

// datas sempre em relação a hoje, para os testes valerem em qualquer dia
const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const dias = n => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
const mesMais = n => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + n); return iso(d).slice(0, 7); };
const HOJE = dias(0);
// o app escreve "R$ 50,00" com um espaço que não quebra linha; aqui ele vira espaço comum, para comparar textos
const T = s => String(s || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ");

(async () => {
  // servidor simples só para o teste: entrega os arquivos da pasta do projeto
  const srv = http.createServer((req, res) => {
    const arq = path.join(RAIZ, decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html");
    if (!arq.startsWith(RAIZ) || !fs.existsSync(arq) || fs.statSync(arq).isDirectory()){ res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": TIPOS[path.extname(arq)] || "application/octet-stream" }); res.end(fs.readFileSync(arq));
  });
  await new Promise(r => srv.listen(0, "127.0.0.1", r));
  const U = `http://127.0.0.1:${srv.address().port}/index.html`;

  const nav = await chromium.launch(), erros = [];
  const novoApp = async (opcoes = { ...devices["iPhone 14"] }) => {
    const ctx = await nav.newContext({ ...opcoes, permissions: ["clipboard-read", "clipboard-write"] });
    await ctx.route(/accounts\.google\.com/, r => r.abort()); // o teste não fala com o Google
    const p = await ctx.newPage();
    p.on("pageerror", e => erros.push(e.message));
    p.on("console", m => { if (m.type() === "error" && !/google|ERR_FAILED|net::/.test(m.text())) erros.push(m.text()); });
    await p.goto(U); await p.waitForSelector(".mesnav");
    return p;
  };
  const p = await novoApp();
  const dados = () => p.evaluate(() => JSON.parse(localStorage.getItem("meus-gastos-v1")));
  const ir = async aba => { await p.goto(U + "#" + aba); await p.waitForTimeout(200); };
  const salvarForm = async () => { await p.click("#frm button[type=submit]"); await p.waitForTimeout(200); };
  const aberto = () => p.evaluate(() => document.querySelector("#dlg").open);
  const aviso = () => p.textContent("#toast");
  const categoria = async (nome, limite = "") => { await p.click('[data-novo="categorias"]'); await p.fill("#f_nome", nome); await p.fill("#f_orcamento", limite); await salvarForm(); };
  const gasto = async (d, valor, o = {}) => { await p.click('[data-novo="gastos"]'); await p.fill("#f_descricao", d); await p.fill("#f_valor", valor);
    if (o.data) await p.fill("#f_data", o.data); if (o.cat) await p.selectOption("#f_categoriaId", { label: o.cat }); if (o.pag) await p.selectOption("#f_pagamento", o.pag);
    if (o.parcelas) await p.fill("#f_parcelas", o.parcelas); if (o.fixa) await p.check("#f_fixa"); await salvarForm(); };
  const conta = async (d, valor, data, antes) => { await p.click('[data-novo="contas"]'); await p.fill("#f_descricao", d); await p.fill("#f_valor", valor); await p.fill("#f_data", data); if (antes) await antes(); await salvarForm(); };

  titulo("Primeiros passos e categorias");
  ok("app vazio mostra os primeiros passos", (await p.textContent("#view")).includes("Primeiros passos"));
  await p.click('[data-novo="gastos"]'); await p.waitForTimeout(200);
  ok("sem categoria, o + leva para Categorias", (await p.evaluate(() => location.hash)) === "#categorias");
  await categoria("Mercado", "600"); await categoria("Lazer");
  ok("categorias criadas com _t", (await dados()).categorias.length === 2 && (await dados()).categorias.every(c => c._t));

  titulo("Gastos");
  await ir("gastos");
  for (const [digitado, esperado] of [["12,50", 12.5], ["12.50", 12.5], ["1.250,00", 1250], ["1.250", 1250], ["R$ 5", 5], ["12,345", 12.35]]){
    await gasto("Valor " + digitado, digitado, { cat: "Mercado" });
    const g = (await dados()).gastos.at(-1); ok(`valor "${digitado}" vira ${esperado}`, g && g.valor === esperado, String(g && g.valor)); }
  for (const ruim of ["abc", "-5", "0", ""]){
    await p.click('[data-novo="gastos"]'); await p.fill("#f_descricao", "x"); await p.fill("#f_valor", ruim); await p.click("#frm button[type=submit]"); await p.waitForTimeout(100);
    ok(`valor "${ruim}" é recusado com aviso`, await aberto() && !!(await p.textContent("#erro"))); await p.click("#cancel"); }
  const antesParc = (await dados()).gastos.length;
  await gasto("Notebook", "1.000,00", { parcelas: "3", pag: "credito", cat: "Lazer" });
  const parc = (await dados()).gastos.filter(g => g.grupo);
  ok("3 parcelas de R$ 1.000 = 333,34 + 333,33 + 333,33", parc.map(g => g.valor).join() === "333.34,333.33,333.33", parc.map(g => g.valor).join());
  ok("cada parcela cai num mês", new Set(parc.map(g => g.data.slice(0, 7))).size === 3 && (await dados()).gastos.length === antesParc + 3);
  await gasto("Assinatura", "39,90", { data: mesMais(-3) + "-15", fixa: true, cat: "Lazer" });
  const fixos = () => dados().then(d => d.gastos.filter(g => g.descricao === "Assinatura"));
  ok("gasto fixo de 3 meses atrás gera as cópias até o mês atual", (await fixos()).length === 4, String((await fixos()).length));
  await p.reload(); await p.waitForTimeout(300);
  ok("recarregar não duplica os fixos", (await fixos()).length === 4);
  await ir("gastos"); await p.click('[data-mes="0"]').catch(() => {}); await p.waitForTimeout(150);
  const antesApagar = (await dados()).gastos.length;
  await p.click('.row[data-edit="gastos"]'); await p.click("#del"); await p.waitForTimeout(200);
  const d1 = await dados(); ok("apagar tira o gasto e anota em S.apagados", d1.gastos.length === antesApagar - 1 && Object.keys(d1.apagados).length >= 1);
  await p.click("#toast button"); await p.waitForTimeout(200);
  ok("Desfazer traz o gasto de volta", (await dados()).gastos.length === antesApagar);

  titulo("Contas da casa");
  await ir("contas");
  await p.click('[data-acao="pessoas"]'); await p.fill("#c_pes", "Ana, Bia"); await p.fill("#c_pix", "chave-de-teste"); await salvarForm();
  await conta("Luz", "150", dias(5)); await conta("Internet", "90", dias(6), () => p.uncheck('[name="p1"]'));
  const cartao = async nome => (await p.$$eval(".conta", (e, n) => e.filter(x => x.innerText.includes(n)).map(x => x.innerText), nome)).map(T)[0] || "";
  ok("conta dividida por 3 mostra R$ 50,00 para cada", (await cartao("Luz")).includes("R$ 50,00 para cada"), await cartao("Luz"));
  ok("conta só com Ana mostra R$ 45,00 e não tem a chave da Bia", (await cartao("Internet")).includes("R$ 45,00") && !(await cartao("Internet")).includes("Bia"));
  await p.click('.conta:has-text("Luz") [data-chk="paga"]'); await p.waitForTimeout(250);
  let d2 = await dados();
  ok('"Paguei a conta" guarda a data e cria a categoria Casa', d2.contas.find(c => c.descricao === "Luz").pagaEm === HOJE && d2.categorias.some(c => c.nome === "Casa"));
  await ir("painel");
  ok("a parte da conta paga aparece no Painel, na categoria Casa", (await p.$$eval('[data-acao="vercat"]', e => e.map(x => x.innerText).join(" "))).replace(/\s+/g, " ").includes("Casa"));
  await ir("contas");
  await p.click('.conta:has-text("Luz") .row[data-edit]'); await p.fill("#f_v0", "80"); await salvarForm();
  ok("partes diferentes: Ana R$ 80, Bia e você R$ 35", (await cartao("Luz")).includes("R$ 80,00") && (await cartao("Luz")).includes("R$ 35,00"), await cartao("Luz"));
  await p.click('.conta:has-text("Luz") .row[data-edit]'); await p.fill("#f_v0", "999"); await p.click("#frm button[type=submit]"); await p.waitForTimeout(100);
  ok("partes maiores que a conta são recusadas", await aberto()); await p.click("#cancel");
  await p.evaluate(() => { navigator.share = undefined; });
  await p.click('[data-acao="cobrar"]'); await p.waitForTimeout(200);
  const msg = await p.evaluate(() => navigator.clipboard.readText());
  ok("Cobrar monta a mensagem com contas, total e Pix", /Ana/.test(msg) && /Luz/.test(msg) && /Total: R\$ 125,00/.test(T(msg)) && /chave-de-teste/.test(msg), msg.replace(/\n/g, " / "));
  await conta("Água", "90", dias(8));
  const devendoAna = () => dados().then(d => d.contas.filter(c => !(c.fora || []).includes(0) && !(c.recebido || [])[0]).length);
  const antesRec = await devendoAna();
  await p.click('[data-acao="recebi"][data-i="0"]'); await p.waitForTimeout(300);
  ok('"Recebi tudo" marca todas as contas em aberto da Ana', antesRec >= 2 && (await devendoAna()) === 0, `${antesRec} → ${await devendoAna()}`);
  await p.click("#toast button"); await p.waitForTimeout(300);
  ok("Desfazer devolve as contas em aberto", (await devendoAna()) === antesRec);
  await p.click('.conta:has-text("Água") .row[data-edit]'); await p.click("#del"); await p.waitForTimeout(200);
  await p.click('[data-acao="lembretes"]');
  const [ics] = await Promise.all([p.waitForEvent("download"), p.click("#lmAgenda")]); await ics.saveAs(path.join(tmp, "c.ics")); await p.click("#cancel");
  const txtIcs = fs.readFileSync(path.join(tmp, "c.ics"), "utf8");
  ok("arquivo da agenda traz só a conta não paga, com alarme", /SUMMARY:Pagar: Internet/.test(txtIcs) && !/Pagar: Luz/.test(txtIcs) && /TRIGGER:-PT15H/.test(txtIcs));
  await conta("Gás", "60", dias(1)); await ir("painel");
  ok("aviso no topo para conta que vence amanhã", ((await p.textContent(".notice").catch(() => "")) || "").includes("Gás"));

  titulo("Entradas e cartão");
  await p.click('[data-novo="receitas"]'); await p.fill("#f_descricao", "Salário"); await p.fill("#f_valor", "3.000,00"); await salvarForm();
  ok('"Sobrou no mês" aparece com a entrada', T(await p.$$eval(".w", e => e.map(x => x.innerText).join(" "))).includes("Entrou R$ 3.000,00"));
  await p.click('[data-acao="meta"]'); await p.fill("#c_meta", "5.000,00"); await salvarForm();
  ok("meta de economia mostra quanto falta", /Faltam R\$ [\d.]+ para a meta de guardar R\$ 5\.000/.test(T(await p.$eval('[data-acao="meta"]', e => e.innerText))), T(await p.$eval('[data-acao="meta"]', e => e.innerText)));
  await p.click('[data-acao="meta"]'); await p.fill("#c_meta", "10"); await salvarForm();
  ok("meta pequena aparece como batida", T(await p.$eval('[data-acao="meta"]', e => e.innerText)).includes("batida"));
  await p.click('[data-acao="cartao"]'); await p.fill('[name="cf"]', "40"); await p.click("#frm button[type=submit]"); await p.waitForTimeout(100);
  ok("dia de fechamento 40 é recusado", await aberto());
  await p.fill('[name="cn"]', "Roxo"); await p.fill('[name="cf"]', "28"); await salvarForm();
  ok("fatura aberta soma a parcela no crédito", /Fatura aberta.*333,3[34]/.test(T(await p.$$eval(".sec", e => e.filter(x => x.innerText.includes("Cartão")).map(x => x.innerText).join(" ")))));

  // segundo cartão: o gasto no crédito pergunta em qual foi, e cada cartão tem a sua fatura
  await p.click('[data-acao="cartao"]'); await p.click("#c_mais"); await p.fill('[data-cartao] >> nth=1 >> [name="cn"]', "Azul"); await p.fill('[data-cartao] >> nth=1 >> [name="cf"]', "28"); await salvarForm();
  await p.click('[data-novo="gastos"]'); await p.fill("#f_descricao", "Livro"); await p.fill("#f_valor", "70"); await p.selectOption("#f_categoriaId", { label: "Lazer" });
  ok("campo Cartão fica escondido fora do crédito", !(await p.isVisible("#f_cartaoId")));
  await p.selectOption("#f_pagamento", "credito");
  ok("campo Cartão aparece no crédito", await p.isVisible("#f_cartaoId"));
  await p.selectOption("#f_cartaoId", { label: "Azul" }); await salvarForm(); await ir("painel");
  const secCartao = T(await p.$$eval(".sec", e => e.filter(x => x.innerText.includes("Cartões")).map(x => x.innerText).join(" ")));
  ok("cada cartão mostra a sua fatura", /Roxo.*333,3[34]/.test(secCartao) && /Azul.*R\$ 70,00/.test(secCartao), secCartao);

  titulo("Painel recolhível e resumo do ano");
  const nQuadros = () => p.$$eval("#view .sec .grupo", e => e.length);
  const antesDobra = await nQuadros();
  await p.click('[data-dobra="dia"]'); await p.waitForTimeout(150);
  ok("tocar no título recolhe o quadro", (await nQuadros()) === antesDobra - 1 && (await p.getAttribute('[data-dobra="dia"]', "aria-expanded")) === "false");
  await p.reload(); await p.waitForSelector(".mesnav"); await p.waitForTimeout(200);
  ok("o quadro continua recolhido depois de recarregar", (await p.getAttribute('[data-dobra="dia"]', "aria-expanded")) === "false");
  await p.click('[data-dobra="dia"]'); await p.waitForTimeout(150);
  ok("tocar de novo abre o quadro", (await nQuadros()) === antesDobra);
  const grafico = () => p.$eval(".meses6", e => e.innerText.replace(/\s+/g, " ") + "|" + e.getAttribute("aria-label"));
  const todasCat = await grafico();
  await p.selectOption("#gCat", { label: "Lazer" }); await p.waitForTimeout(150);
  const soLazer = await grafico();
  ok("gráfico dos 6 meses filtra por categoria", soLazer !== todasCat && soLazer.includes("Lazer"), soLazer);
  await p.selectOption("#gCat", ""); await p.waitForTimeout(150);
  ok("voltar para Todas mostra o gráfico completo", (await grafico()) === todasCat);
  await p.click('[data-acao="ano"]'); await p.waitForTimeout(200);
  const ano = T(await p.$eval("#frm", e => e.innerText));
  ok("resumo do ano mostra categorias, total de gastos e entradas", /Lazer/.test(ano) && /Gastos/.test(ano) && /Entradas/.test(ano) && /Sobrou/.test(ano), ano.slice(0, 160));
  ok("a tabela do ano não alarga a janela", await p.evaluate(() => document.querySelector("#dlg").scrollWidth <= document.querySelector("#dlg").clientWidth + 1));
  await p.click("#a_menos"); await p.waitForTimeout(150);
  ok("ano anterior sem dados avisa que está vazio", T(await p.$eval("#frm", e => e.innerText)).includes("Nenhum gasto em " + (new Date().getFullYear() - 1)));
  await p.click("#cancel");

  titulo("Extrato do banco (OFX)");
  await gasto("Feira", "80", { cat: "Mercado" });
  const tr = (tipo, data, valor, id, memo) => `<STMTTRN>\r\n<TRNTYPE>${tipo}\r\n<DTPOSTED>${data.replace(/-/g, "")}\r\n<TRNAMT>${valor}\r\n<FITID>${id}\r\n<MEMO>${memo}\r\n</STMTTRN>\r\n`;
  const ofx = "OFXHEADER:100\r\nCHARSET:1252\r\n\r\n<OFX><BANKTRANLIST>\r\n"
    + tr("DEBIT", HOJE, "-80.00", "t1", "Compra no débito - HORTIFRUTI") + tr("DEBIT", HOJE, "-60.00", "t2", "Pagamento de boleto - GAS")
    + tr("DEBIT", HOJE, "-1.234,56", "t3", "Compra no débito - LOJA NOVA 01") + tr("DEBIT", HOJE, "-900.00", "t4", "Pagamento de fatura")
    + tr("DEBIT", HOJE, "-500.00", "t5", "Aplicação RDB") + tr("CREDIT", HOJE, "45.00", "t6", "Transferência recebida pelo Pix - ANA")
    + tr("CREDIT", HOJE, "3000.00", "t7", "Transferência recebida - SALARIO EMPRESA") + tr("DEBIT", HOJE, "abc", "t8", "Ilegível")
    + "</BANKTRANLIST></OFX>";
  fs.writeFileSync(path.join(tmp, "extrato.ofx"), Buffer.from(ofx, "latin1"));
  await ir("gastos");
  const abrirOfx = async () => { const [fc] = await Promise.all([p.waitForEvent("filechooser"), p.click('[data-acao="ofx"]')]); await fc.setFiles(path.join(tmp, "extrato.ofx")); await p.waitForSelector(".imp"); };
  await abrirOfx();
  const linhas = (await p.$$eval(".imp", e => e.map(x => ({ marcado: x.querySelector("input").checked, txt: x.innerText })))).map(l => ({ ...l, txt: T(l.txt) }));
  const linha = t => linhas.find(l => l.txt.includes(t)) || { txt: "" };
  ok("lê acentos (Windows-1252) e valor 1.234,56", linha("débito - LOJA NOVA").txt.includes("R$ 1.234,56"), linha("LOJA NOVA").txt);
  ok("gasto digitado à mão é reconhecido como já anotado", linha("HORTIFRUTI").txt.includes("já anotado") && linha("HORTIFRUTI").marcado);
  ok("boleto com o valor de uma conta da casa é reconhecido", linha("GAS").txt.includes("conta da casa"));
  ok("pagamento de fatura e aplicação vêm desmarcados", !linha("Pagamento de fatura").marcado && !linha("Aplicação").marcado);
  ok("Pix com o valor que Ana deve marca que ela pagou", linha("ANA").txt.includes("recebido") && linha("ANA").marcado, linha("ANA").txt);
  ok("entrada parecida com o Salário já anotado vem marcada como renda", linha("SALARIO EMPRESA").marcado, linha("SALARIO").txt);
  ok("lançamento ilegível fica de fora com aviso", ((await p.textContent("#frm .erro").catch(() => "")) || "").includes("não pôde ser lida"));
  const iNova = linhas.findIndex(l => l.txt.includes("LOJA NOVA"));
  await p.selectOption(`.imp >> nth=${iNova} >> select`, { label: "Lazer" });
  const antesOfx = (await dados()).gastos.length;
  await salvarForm(); await p.waitForTimeout(300);
  const d3 = await dados();
  ok("só o gasto novo é criado (nada em dobro)", d3.gastos.length === antesOfx + 1, `${antesOfx} → ${d3.gastos.length}`);
  ok("o gasto já anotado ganha a marca do extrato", !!d3.gastos.find(g => g.descricao === "Feira").ofx);
  ok("a conta Gás fica paga e a Internet recebida de Ana", d3.contas.find(c => c.descricao === "Gás").paga === true && d3.contas.find(c => c.descricao === "Internet").recebido[0] === true);
  ok("a entrada marcada vira entrada do mês", d3.receitas.length === 2, String(d3.receitas.length));
  ok("o app aprende a categoria da loja", Object.values(d3.config.regras || {}).length === 1, JSON.stringify(d3.config.regras));
  await abrirOfx();
  ok("conferir o mesmo extrato de novo não marca nada do que já entrou", (await p.$$eval(".imp", e => e.filter(x => x.querySelector("input").checked && !/SALARIO|fatura|Aplica/.test(x.innerText)).length)) === 0);
  await p.click("#cancel");

  titulo("Busca, planilha e backup");
  await p.click("#buscar"); await p.fill("#q_busca", "salar");
  ok("busca sem acento acha as entradas de salário", (await p.$$eval(".achado", e => e.length)) === 2); await p.click("#cancel");
  await p.click("#bkp");
  const [csv] = await Promise.all([p.waitForEvent("download"), p.click("#bkCsv")]); await csv.saveAs(path.join(tmp, "g.csv"));
  ok("CSV com cabeçalho e vírgula decimal", /^﻿Data;Descrição;Categoria;Pagamento;Valor/.test(fs.readFileSync(path.join(tmp, "g.csv"), "utf8")) && /;80,00;/.test(fs.readFileSync(path.join(tmp, "g.csv"), "utf8")));
  const [bk] = await Promise.all([p.waitForEvent("download"), p.click("#bkDown")]); await bk.saveAs(path.join(tmp, "bk.json")); await p.click("#cancel");
  const total = await dados();
  const q = await novoApp({ viewport: { width: 1200, height: 900 } });
  const dadosQ = () => q.evaluate(() => JSON.parse(localStorage.getItem("meus-gastos-v1") || "{}"));
  const importar = async arq => { await q.click("#bkp"); await q.setInputFiles("#bkFile", arq); await q.waitForTimeout(700); if (await q.evaluate(() => document.querySelector("#dlg").open)) await q.click("#cancel"); };
  await importar(path.join(tmp, "bk.json"));
  const dq = await dadosQ();
  ok("backup importado em outro aparelho traz tudo", ["categorias", "gastos", "contas", "receitas", "desejos"].every(c => dq[c].length === total[c].length) && dq.config.pessoas.join() === "Ana,Bia");
  await importar(path.join(tmp, "bk.json"));
  ok("importar duas vezes não duplica", (await dadosQ()).gastos.length === total.gastos.length);
  fs.writeFileSync(path.join(tmp, "ruim.json"), '{"app":"outro"}'); await importar(path.join(tmp, "ruim.json"));
  ok("arquivo que não é backup é recusado", (await q.textContent("#toast")).includes("inválido"));
  ok("telas largas: abas em pílula no topo", (await q.$eval("#tabs", e => getComputedStyle(e).position)) === "sticky");

  titulo("Segurança dos dados");
  // regra de juntar dois aparelhos (a mesma da sincronização com o Google Drive)
  const junto = await p.evaluate(() => { const j = window.__meusGastosTeste.juntar, v = Object.fromEntries(["categorias", "contas", "receitas"].map(c => [c, []]));
    const T0 = Date.now() - 100000, t = n => T0 + n; // horas de hoje: a regra ignora registros de exclusão com mais de 180 dias
    const local = { ...v, apagados: { sumiu: t(50), voltou: t(5) }, gastos: [{ id: "a", valor: 1, _t: t(10) }, { id: "b", valor: 2, _t: t(30) }, { id: "voltou", valor: 9, _t: t(20) }],
      config: { meta: 100, orcamento: 900, _t: t(40), _ts: { meta: t(40), orcamento: t(10) } } };
    const remoto = { ...v, apagados: {}, gastos: [{ id: "a", valor: 7, _t: t(20) }, { id: "b", valor: 8, _t: t(20) }, { id: "sumiu", valor: 3, _t: t(40) }, { id: "novo", valor: 4, _t: t(5) }],
      config: { meta: 50, orcamento: 800, cartoes: [{ id: "", nome: "Roxo", fechamento: 5 }], _t: t(30), _ts: { meta: t(20), orcamento: t(30), cartoes: t(30) } } };
    const r = j(local, remoto); return { gastos: Object.fromEntries(r.gastos.map(g => [g.id, g.valor])), config: r.config }; });
  ok("juntar: em cada item vale a versão mais nova", junto.gastos.a === 7 && junto.gastos.b === 2, JSON.stringify(junto.gastos));
  ok("juntar: item apagado não volta, item restaurado depois de apagado fica", !("sumiu" in junto.gastos) && junto.gastos.voltou === 9 && junto.gastos.novo === 4, JSON.stringify(junto.gastos));
  ok("juntar: cada ajuste vale o mais novo (meta de um aparelho, orçamento e cartão do outro)", junto.config.meta === 100 && junto.config.orcamento === 800 && junto.config.cartoes.length === 1, JSON.stringify(junto.config));
  // trocar os nomes de quem divide: as marcações acompanham a pessoa
  await ir("contas");
  const flags = () => dados().then(d => { const c = d.contas.find(c => c.descricao === "Internet"); return { rec: c.recebido, fora: c.fora, nomes: d.config.pessoas }; });
  const f0 = await flags(); // Internet: só Ana divide, e ela já pagou
  await p.click('[data-acao="pessoas"]'); await p.fill("#c_pes", "Bia, Ana, Cris"); await salvarForm(); await p.waitForTimeout(300);
  const f1 = await flags();
  ok("mudar a ordem dos nomes mantém quem pagou e quem divide", f0.rec[0] === true && f1.rec[1] === true && f1.rec[0] === false && f1.fora.includes(0) && !f1.fora.includes(1), JSON.stringify(f1));
  ok("quem entra agora fica de fora das contas antigas", f1.fora.includes(2), JSON.stringify(f1.fora));
  await p.click('[data-acao="pessoas"]'); await p.fill("#c_pes", "Bia, Ana Paula, Cris"); await salvarForm(); await p.waitForTimeout(300);
  ok("renomear uma pessoa mantém as marcações dela", (await flags()).rec[1] === true);
  await p.click('[data-acao="pessoas"]'); await p.fill("#c_pes", "Ana Paula, Bia"); await salvarForm(); await p.waitForTimeout(300);
  const f3 = await flags();
  ok("tirar uma pessoa e reordenar continua certo", f3.rec[0] === true && f3.rec.length === 2 && f3.fora.join() === "1", JSON.stringify(f3));
  await p.click('[data-acao="pessoas"]'); await p.fill("#c_pes", "Ana, Bia"); await salvarForm(); await p.waitForTimeout(300);
  // backup mais velho não passa por cima de mudança mais nova
  fs.writeFileSync(path.join(tmp, "velho.json"), JSON.stringify({ app: "meus-gastos", gastos: [{ ...(await dados()).gastos.find(g => g.descricao === "Feira"), descricao: "Feira antiga", _t: 1 }, { id: "torto", descricao: 5, valor: "x", data: 20261101, _t: 1 }], config: { meta: 123, novoAjuste: "sim" } }));
  await p.click("#bkp"); await p.setInputFiles("#bkFile", path.join(tmp, "velho.json")); await p.waitForTimeout(600);
  const d5 = await dados();
  ok("backup mais velho não troca um gasto mudado depois", d5.gastos.some(g => g.descricao === "Feira") && !d5.gastos.some(g => g.descricao === "Feira antiga") && (await aviso()).includes("mais novo"), await aviso());
  ok("ajuste que já existe fica, ajuste que faltava entra", d5.config.meta === 10 && d5.config.novoAjuste === "sim", JSON.stringify({ meta: d5.config.meta, novo: d5.config.novoAjuste }));
  await ir("gastos"); await ir("painel");
  ok("item torto de um arquivo mexido à mão não quebra as telas", d5.gastos.find(g => g.id === "torto").data === "" && await p.isVisible(".wg"));
  await p.evaluate(() => { const d = JSON.parse(localStorage.getItem("meus-gastos-v1")); d.gastos = d.gastos.filter(g => g.id !== "torto"); localStorage.setItem("meus-gastos-v1", JSON.stringify(d)); }); await p.reload(); await p.waitForSelector(".mesnav");

  titulo("Categorias, aparência e telas");
  await ir("categorias");
  ok("categoria aprendida aparece para corrigir", (await p.$$eval("[data-regra]", e => e.length)) === 1);
  const nMerc = (await dados()).gastos.filter(g => g.categoriaId === (total.categorias.find(c => c.nome === "Mercado") || {}).id).length;
  await p.click('.card:has-text("Mercado") [data-edit="categorias"]'); await p.click("#del");
  ok("apagar categoria pede confirmação e avisa dos gastos", (await p.textContent("#del")).includes(nMerc + " gasto"), await p.textContent("#del"));
  const antesCat = (await dados()).gastos.length; await p.click("#del"); await p.waitForTimeout(300);
  ok("apagar a categoria apaga os gastos dela", (await dados()).gastos.length === antesCat - nMerc);
  await p.click("#tema"); await p.click('#ap_tema [data-v="dark"]'); await p.click('label[for="ap_cor1"]'); await p.click("#cancel");
  ok("tema escuro e cor bordô ficam guardados no aparelho", await p.evaluate(() => document.documentElement.dataset.theme === "dark" && document.documentElement.dataset.cor === "bordo" && localStorage.getItem("meus-gastos-tema") === "dark"));
  titulo("Ordem dos quadros do Painel");
  await ir("painel");
  const titulos = () => p.$$eval(".grid2 .col:nth-child(2) h3", e => e.map(x => x.innerText.replace(/\s*›\s*$/, "").trim()));
  ok("ordem original da segunda coluna", (await titulos()).join("|") === "Gasto por dia|Últimos gastos|Entradas do mês", (await titulos()).join("|"));
  await p.click('[data-acao="ordem"]'); await p.waitForTimeout(150);
  ok("Reorganizar mostra as setas e esconde o conteúdo", (await p.$$('[data-mover]')).length >= 6 && !(await p.isVisible(".barras")));
  await p.click('[data-mover="dia"][data-dir="1"]'); await p.waitForTimeout(150);
  ok("descer o primeiro quadro troca com o segundo", (await titulos()).join("|") === "Últimos gastos|Gasto por dia|Entradas do mês", (await titulos()).join("|"));
  await p.click('[data-mover="ent"][data-dir="1"]'); await p.waitForTimeout(150);
  ok("descer o último quadro não muda nada", (await titulos()).join("|") === "Últimos gastos|Gasto por dia|Entradas do mês");
  await p.click('[data-acao="ordem"]'); await p.waitForTimeout(150); await p.reload(); await p.waitForSelector(".grid2");
  ok("a ordem escolhida fica guardada depois de recarregar", (await titulos()).join("|") === "Últimos gastos|Gasto por dia|Entradas do mês" && await p.isVisible(".barras"));
  ok("a ordem não entra no backup (fica só no aparelho)", !JSON.stringify(await dados()).includes("meus-gastos-ordem"));
  await p.click('[data-acao="ordem"]'); await p.waitForTimeout(150); await p.click('[data-acao="ordem-padrao"]'); await p.waitForTimeout(150); await p.click('[data-acao="ordem"]'); await p.waitForTimeout(150);
  ok("Voltar à ordem original desfaz a escolha", (await titulos()).join("|") === "Gasto por dia|Últimos gastos|Entradas do mês" && (await p.evaluate(() => localStorage.getItem("meus-gastos-ordem"))) === null);

  titulo("Desejos (lista do que quero comprar)");
  const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAHqS5hQAAAABJRU5ErkJggg==", "base64");
  await ir("desejos");
  ok("lista vazia convida a anotar o primeiro desejo", (await p.textContent("#view")).includes("Nada na lista"));
  await p.click('[data-novo="desejos"]'); await p.fill("#f_nome", "Tênis de teste"); await p.fill("#f_preco", "300"); await p.fill("#f_guardado", "75,50");
  await p.selectOption("#f_prio", "muito"); await p.setInputFiles("#dFoto", { name: "foto.png", mimeType: "image/png", buffer: PNG }); await p.waitForSelector("#dFotoBox img");
  await p.fill("#f_link", "loja.com"); await salvarForm();
  ok("link sem http é recusado", await aberto()); await p.fill("#f_link", "https://loja.com/tenis"); await salvarForm();
  const w1 = (await dados()).desejos[0];
  ok("desejo salvo com _t, preço, guardado e foto em JPEG reduzida", w1 && w1._t && w1.preco === 300 && w1.guardado === 75.5 && /^data:image\/jpeg;base64,/.test(w1.foto) && w1.criado === HOJE, JSON.stringify(w1 && { ...w1, foto: (w1.foto || "").slice(0, 30) }));
  const cartaoW = T(await p.textContent("#view"));
  ok("mostra foto, progresso e quanto falta", await p.isVisible("img.foto") && cartaoW.includes("Guardado R$ 76 de R$ 300") && cartaoW.includes("faltam R$ 225") && cartaoW.includes("Quero muito"), cartaoW);
  await p.click('[data-edit="desejos"]'); await p.fill("#f_guardado", "400"); await salvarForm();
  ok("guardado acima do preço mostra que já dá para comprar", T(await p.textContent("#view")).includes("já dá para comprar"));
  await p.click('[data-edit="desejos"]'); await p.click("#dTira"); await salvarForm();
  ok("tirar a foto remove do item", (await dados()).desejos[0].foto === "" && !(await p.isVisible("img.foto")));
  await p.click('[data-edit="desejos"]'); await p.click("#del"); await p.waitForTimeout(200);
  ok("excluir desejo anota em S.apagados e Desfazer traz de volta", (await dados()).desejos.length === 0 && Object.keys((await dados()).apagados).includes(w1.id));
  await p.click("#toast button"); await p.waitForTimeout(200);
  ok("desfazer devolve o desejo", (await dados()).desejos.length === 1);
  const gastosAntes = (await dados()).gastos.length;
  await p.click('[data-edit="desejos"]'); await p.click("#dComprei"); await p.waitForTimeout(300);
  ok('"Comprei" abre o gasto já preenchido e arquiva o desejo', (await p.inputValue("#f_descricao")) === "Tênis de teste" && (await p.inputValue("#f_valor")) === "300,00" && (await dados()).desejos[0].estado === "comprado");
  await salvarForm();
  ok("o gasto do desejo comprado é criado uma vez", (await dados()).gastos.length === gastosAntes + 1);
  ok("desejo comprado sai da lista principal e vai para Já resolvidos", T(await p.textContent("#view")).includes("Já resolvidos") && T(await p.textContent("#view")).includes("Comprei"));
  await p.click('[data-edit="desejos"]'); await p.click("#dVolta"); await p.waitForTimeout(200);
  ok("Voltar para a lista tira o arquivo", !(await dados()).desejos[0].estado);
  await p.click('[data-edit="desejos"]'); await p.click("#dDesisti"); await p.waitForTimeout(200);
  ok('"Desisti" mostra quanto economizou', T(await p.textContent("#view")).includes("Economizei R$ 300"), T(await p.textContent("#view")));
  // foto torta vinda de um arquivo mexido à mão não pode quebrar a tela nem entrar como imagem
  await p.evaluate(() => { const d = JSON.parse(localStorage.getItem("meus-gastos-v1")); d.desejos.push({ id:"torto", nome:"<b>x</b>", preco:"abc", foto:'javascript:alert(1)" onerror="alert(2)', criado:"", _t:1 }); localStorage.setItem("meus-gastos-v1", JSON.stringify(d)); });
  await ir("desejos"); await p.reload(); await p.waitForSelector(".bar");
  ok("desejo com dados tortos não quebra a tela nem vira imagem", await p.isVisible("#view .grupo") && (await p.$$eval("img.foto", e => e.every(i => i.src.startsWith("data:image/jpeg")))) && !(await p.textContent("#view")).includes("Não deu para mostrar"));
  await p.evaluate(() => { const d = JSON.parse(localStorage.getItem("meus-gastos-v1")); d.desejos = d.desejos.filter(x => x.id !== "torto"); localStorage.setItem("meus-gastos-v1", JSON.stringify(d)); });
  await p.reload(); await p.waitForSelector(".bar");

  titulo("Saldo acumulado entre meses");
  {
    const r = await novoApp();
    const dia = (m, d) => m + "-" + d, base = { app: "meus-gastos", categorias: [{ id: "c1", nome: "Mercado", cor: "#3b6fd8", _t: 1 }], contas: [], desejos: [], apagados: {}, config: {} };
    const gr = (id, m, v) => ({ id, descricao: "g" + id, valor: v, data: dia(m, "10"), categoriaId: "c1", pagamento: "pix", _t: 1 });
    const rc = (id, m, v) => ({ id, descricao: "r" + id, valor: v, data: dia(m, "05"), _t: 1 });
    const m2 = mesMais(-2), m1 = mesMais(-1), m0 = mesMais(0);
    const poe = async d => { await r.evaluate(x => localStorage.setItem("meus-gastos-v1", x), JSON.stringify({ ...base, ...d })); await r.goto(U + "#painel"); await r.reload(); await r.waitForSelector(".wg"); };
    const wid = async () => T(await r.$eval('[data-acao="meta"]', e => e.innerText));
    await poe({ receitas: [rc("a", m2, 1000), rc("b", m1, 500), rc("c", m0, 200)], gastos: [gr("1", m2, 300), gr("2", m1, 800), gr("3", m0, 100)] });
    ok("saldo acumulado soma o que sobrou nos meses anteriores", (await wid()).includes("Saldo acumulado: R$ 500,00 (vindo de R$ 400,00 dos meses anteriores)"), await wid());
    await poe({ receitas: [rc("a", m1, 100), rc("c", m0, 200)], gastos: [gr("2", m1, 800), gr("3", m0, 100)] });
    ok("mês anterior no vermelho aparece como devendo", (await wid()).includes("Saldo acumulado: -R$ 600,00 (devendo R$ 700,00 dos meses anteriores)"), await wid());
    await poe({ receitas: [rc("c", m0, 200)], gastos: [gr("3", m0, 100)] });
    ok("sem mês anterior com entrada, o saldo acumulado não aparece", !(await wid()).includes("Saldo acumulado"), await wid());
    await poe({ receitas: [rc("a", m2, 1000), rc("c", m0, 200)], gastos: [gr("1", m0, 100)] });
    ok("mês sem nada no meio continua somando", (await wid()).includes("Saldo acumulado: R$ 1.100,00 (vindo de R$ 1.000,00"), await wid());
    await r.context().close();
  }

  titulo("Linhas de orçamento e meta no gráfico dos 6 meses");
  {
    const r = await novoApp(), m0 = mesMais(0);
    const dados6 = (config, orcCat) => JSON.stringify({ app: "meus-gastos", categorias: [{ id: "c1", nome: "Mercado", cor: "#3b6fd8", orcamento: orcCat, _t: 1 }], contas: [], desejos: [], apagados: {}, config,
      receitas: [{ id: "r1", descricao: "Salário", valor: 1000, data: m0 + "-05", _t: 1 }], gastos: [{ id: "g1", descricao: "Feira", valor: 400, data: m0 + "-10", categoriaId: "c1", pagamento: "pix", _t: 1 }] });
    const abrir6 = async d => { await r.evaluate(x => localStorage.setItem("meus-gastos-v1", x), d); await r.goto(U + "#painel"); await r.reload(); await r.waitForSelector(".meses6"); };
    const linhas = () => r.$$eval(".meses6 .lin", e => e.map(x => x.classList.contains("meta") ? "meta" : "orc").join(","));
    await abrir6(dados6({}, null));
    ok("sem orçamento e sem meta, o gráfico não tem linhas nem legenda", (await linhas()) === "" && (await r.$$(".legenda")).length === 0);
    await abrir6(dados6({ orcamento: 500, meta: 300 }, 200));
    ok("orçamento aparece em cada mês e a meta só no mês com entrada", (await linhas()) === "orc,orc,orc,orc,orc,orc,meta" || (await linhas()).split(",").filter(x => x === "orc").length === 6 && (await linhas()).split(",").filter(x => x === "meta").length === 1, await linhas());
    const leg = T(await r.textContent(".legenda"));
    ok("legenda explica o orçamento e a meta", leg.includes("Orçamento R$ 500") && leg.includes("bater a meta"), leg);
    await r.selectOption("#gCat", "c1"); await r.waitForTimeout(200);
    const leg2 = T(await r.textContent(".legenda"));
    ok("com categoria escolhida, vale o limite dela e some a linha da meta", leg2.includes("Limite da categoria R$ 200") && !leg2.includes("meta") && !(await linhas()).includes("meta"), leg2);
    await r.context().close();
  }

  for (const largura of [320, 390, 768]){
    const r = await novoApp({ viewport: { width: largura, height: 800 }, isMobile: largura < 700, hasTouch: largura < 700 });
    await r.evaluate(x => localStorage.setItem("meus-gastos-v1", x), JSON.stringify(await dados())); await r.reload(); await r.waitForSelector(".mesnav");
    let sobra = [];
    for (const aba of ["painel", "gastos", "contas", "categorias", "desejos"]){ await r.goto(U + "#" + aba); await r.waitForTimeout(150);
      if (await r.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) sobra.push(aba); }
    ok(`sem rolagem lateral em ${largura}px`, !sobra.length, sobra.join(", "));
    await r.context().close(); }

  titulo("Modo aplicativo");
  await ir("painel"); // a aba Desejos não tem troca de mês, e o teste abaixo espera por ela
  await p.waitForTimeout(1500);
  ok("service worker registrado e manifesto ligado", await p.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()) && !!document.querySelector("link[rel=manifest]")));
  await p.context().setOffline(true); await p.reload().catch(() => {});
  ok("abre sem internet", await p.waitForSelector(".mesnav", { timeout: 5000 }).then(() => true).catch(() => false));
  await p.context().setOffline(false);
  const arq = await (await nav.newContext()).newPage(); arq.on("pageerror", e => erros.push(e.message));
  await arq.goto("file://" + path.join(RAIZ, "index.html"));
  ok("abre direto do arquivo (dois cliques)", await arq.waitForSelector(".mesnav", { timeout: 5000 }).then(() => true).catch(() => false));
  ok("nenhum erro no console", !erros.length, erros.slice(0, 3).join(" | "));

  await nav.close(); srv.close(); fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`\n${feitos - falhas} de ${feitos} conferências passaram.` + (falhas ? ` ${falhas} FALHARAM.` : " Tudo certo."));
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error("\nO teste parou no meio:", e.message.split("\n")[0]); process.exit(1); });
