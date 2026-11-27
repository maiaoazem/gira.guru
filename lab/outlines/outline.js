/* =====================================================================
   Módulo de outline · Outra Coisa é Possível
   Arquivo único: estilo e comportamento. Os dados vêm de CSVs.

   Uso em qualquer página da gira.:

     <ocp-outline></ocp-outline>
     <script src="/lab/outlines/outline.js?v=23" defer></script>

   Atributos de <ocp-outline>:
     filme="RVL"                    qual filme abrir (sem ele: o do endereço #RVL, ou o primeiro do índice)
     indice="https://…output=csv"   o índice de filmes (padrão: INDICE abaixo; se falhar, filmes.csv ao lado deste arquivo)
     imagens="https://…/images/"    a pasta dos pôsteres (padrão: BASE_IMAGENS)
     outlines="/lab/outlines/"      a pasta dos CSVs de outline (padrão: OUTLINES)

   Índice (uma aba de planilha publicada como CSV): uma linha por filme, colunas
     movie-code · o código do filme, usado no endereço (#RVL) · Filme · Gênero · Roteiristas (separados por ;)
     Sinopse · Logline · Ano · Image (arquivo na pasta de imagens) · Link (o documento do outline)
     combo-cor (1 a 5) · outline-csv (nome do arquivo na pasta /lab/outlines/, ou um link CSV completo)
     project-code: os prêmios do roteiro (as linhas do CSV de reconhecimentos, RECONHECIMENTOS abaixo,
     cuja coluna project é o project-code viram laureis: recognition, title, category, country, year)
     Opcionais: ordem · Duração. Sem "ordem", vale a ordem das linhas.
     Sem "Outline", vale OUTLINE (a aba padrão). Se a aba de outline tiver uma coluna movie-code,
     só as linhas daquele filme entram. Outline: Ato, Cena, Bloco, Minuto, Descrição, Título, Emoção
     (e, se quiser, Nome do Ato).

   Cor: cada filme usa um combo de cor (lista COMBOS abaixo, de 1 a 5): o gradiente por onde
   as cenas andam, do primeiro ao último bloco, sem nunca voltar, e o par do DS que pinta o
   cabeçalho, o "você está assistindo" e o The End. Sem combo-cor, vale o combo do gênero (GENEROS).

   Endereços: #RVL, #RVL/ato-2, #RVL/RVL12 (o código da cena, coluna # do outline).
   O módulo é isolado (Shadow DOM). As fontes vêm da pasta fonts/ ao lado deste arquivo.
   Ao atualizar este arquivo, troque o número de ?v= nas páginas que o chamam.
   ===================================================================== */
(() => {
const SCRIPT = document.currentScript;
const BASE = SCRIPT && SCRIPT.src ? new URL(".", SCRIPT.src).href : "/lab/outlines/";

if (!document.getElementById("ocp-outline-fontes")) {
  const f = document.createElement("style"); f.id = "ocp-outline-fontes";
  f.textContent = `@font-face{font-family:"Instrument Sans";src:url("${BASE}fonts/InstrumentSans-Variable.woff2") format("woff2");font-weight:400 700;font-stretch:75% 100%;font-style:normal;font-display:block}
@font-face{font-family:"Cormorant Garamond";src:url("${BASE}fonts/CormorantGaramond-Italic-Variable.woff2") format("woff2");font-weight:300 700;font-style:italic;font-display:swap}
@font-face{font-family:"Courier Prime";src:url("${BASE}fonts/CourierPrime-Regular.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}`;
  document.head.appendChild(f);
}

/* ================= CONFIG ================= */
// Cores do DS (para os gradientes).
const CORES = {
  papel: "#fbf8f4", tinta: "#141414", mata: "#1b211d",
  rosa: "#ffc4e1", "rosa-vivo": "#ff3d9a", "rosa-tipo": "#b0105f",
  ouro: "#ffe78f", "ouro-vivo": "#ffc414", "ouro-tipo": "#7a5800",
  turquesa: "#9ff4ef", "turquesa-vivo": "#00d2d3", "turquesa-tipo": "#00626a",
  violeta: "#e0c9ff", "violeta-vivo": "#a855ff", "violeta-tipo": "#6420c8",
  cobalto: "#c7d0ff", "cobalto-vivo": "#2a3cff", "cobalto-tipo": "#1a2ad6",
  verde: "#c3f5a6", "verde-vivo": "#2fcf5a", "verde-tinta": "#17692c",
  vermelho: "#ffbfb5", "vermelho-vivo": "#ff3b2f", "vermelho-tinta": "#b01f14",
};
// Combos de cor. de/para: o gradiente das cenas (claro → profundo). par: fundo e fonte de um par do DS
// (cabeçalho, painel e The End). texto: fontes possíveis sobre as faixas dos atos (vale a de maior contraste).
const COMBOS = {
  1: { nome: "violeta → cobalto", de: "violeta", para: "cobalto-tipo", par: ["violeta-tipo", "ouro-vivo"], parNome: "coroa", texto: ["violeta-tipo", "cobalto-tipo", "ouro", "ouro-vivo"] },
  2: { nome: "rosa → magenta", de: "rosa", para: "rosa-tipo", par: ["rosa-tipo", "ouro"], parNome: "brasa", texto: ["rosa-tipo", "violeta-tipo", "ouro", "ouro-vivo"] },
  3: { nome: "ouro → magenta (pôr do sol)", de: "ouro", para: "rosa-tipo", par: ["ouro-vivo", "cobalto-tipo"], parNome: "face", texto: ["cobalto-tipo", "rosa-tipo", "ouro"] },
  4: { nome: "turquesa → petróleo", de: "turquesa", para: "turquesa-tipo", par: ["turquesa-tipo", "turquesa"], parNome: "mare", texto: ["turquesa-tipo", "cobalto-tipo", "turquesa", "ouro"] },
  5: { nome: "ouro → petróleo", de: "ouro", para: "turquesa-tipo", par: ["mata", "ouro-vivo"], parNome: "noite", texto: ["ouro-tipo", "turquesa-tipo", "ouro", "ouro-vivo"] },
};
// Combo de cada gênero, quando o índice não diz qual usar (coluna combo-cor). O primeiro que casar vale.
const GENEROS = [
  { re: /fic[cç][aã]o cient|sci-?fi|science fiction/i, combo: 1 },
  { re: /drama|romance/i, combo: 2 },
  { re: /com[eé]dia|comedy/i, combo: 3 },
];
const COMBO_PADRAO = 5;
const BASE_IMAGENS = "https://gira.guru/lab/repo/images/"; // pasta das imagens (atributo imagens="..." troca)
// O índice de filmes e a aba de outline padrão (planilha publicada como CSV)
const INDICE = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR7xAMwCNcFR8ih2nDzPaJPSjN0h96rzF5_EgGqLT1IeCcfA1CRHpY9iHUf1sl7gxTa6r32bEIOoYp3/pub?gid=1342308574&single=true&output=csv";
const OUTLINE = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR7xAMwCNcFR8ih2nDzPaJPSjN0h96rzF5_EgGqLT1IeCcfA1CRHpY9iHUf1sl7gxTa6r32bEIOoYp3/pub?gid=0&single=true&output=csv";
const RESERVA = "filmes.csv";
// Reconhecimentos de todos os projetos (planilha publicada como CSV). Vale para todos os filmes;
// uma coluna recognitions-csv no índice, se preenchida, troca só para aquele filme.
const RECONHECIMENTOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRHS_E6qH44g4yZ6OEt8Vvqh5S4KGSmCEq4H5tQt6bVwQU1jBu6C3qrdowUGY_1WplSl_SDvGLihpQd/pub?gid=1180840986&single=true&output=csv";
const OUTLINES = "/lab/outlines/"; // pasta fixa dos CSVs de outline (outline-csv com só o nome do arquivo busca aqui) // cópia local do índice, ao lado deste arquivo, usada se a planilha não responder
const ATOS_MAX_NOMES = 6; // com mais atos que isso (ou sem espaço para o nome), a linha do tempo mostra só o número: 1, 2, 3…
const DESTAQUE_MAX = 100; // primeira e última frase em destaque só até este número de caracteres
const SALTO_BLOCO = 4;    // na troca de bloco, a cor pula este número de passos do gradiente (dentro do bloco, 1 por cena)
const EMO_VOLTA = 9;      // segundos para a linha de emoção percorrer o filme todo
const EMO_RASTRO = 0.32;  // quanto do desenho fica visível de cada vez (o resto vai se apagando)
const CORRIDA = 38;
// cor da linha de emoção: preto no zero, verde no alto, vermelho no baixo (cores de dado do DS)
const EMO_ALTO = ["verde-vivo", "verde-tinta", 0.45], EMO_BAIXO = ["vermelho-vivo", "vermelho-tinta", 0.3];       // px/s do título que corre dentro da caixa da cena (Corrida do DS)

/* ================= CSV ================= */
function lerCSV(txt) {
  const linhas = []; let campo = "", linha = [], aspas = false;
  txt = txt.replace(/^﻿/, "");
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (aspas) {
      if (c === '"') { if (txt[i + 1] === '"') { campo += '"'; i++; } else aspas = false; }
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ",") { linha.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && txt[i + 1] === "\n") i++;
      linha.push(campo); linhas.push(linha); linha = []; campo = "";
    } else campo += c;
  }
  if (campo !== "" || linha.length) { linha.push(campo); linhas.push(linha); }
  return linhas.filter(l => l.some(v => v.trim() !== ""));
}
const chave = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
function tabela(txt) {
  const [cab, ...resto] = lerCSV(txt);
  const nomes = (cab || []).map(chave);
  return resto.map(l => { const o = {}; nomes.forEach((n, i) => { if (n) o[n] = (l[i] || "").trim(); }); return o; });
}
const num = v => { const n = parseFloat(String(v || "").replace("−", "-").replace(",", ".")); return isFinite(n) ? n : 0; };
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pega = url => fetch(url, { cache: "no-cache", signal: AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined }).then(r => { if (!r.ok) throw new Error(r.status + " " + url); return r.text(); });

/* ================= COR (OKLCH, como as passagens do DS) ================= */
const hexRGB = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const gam = c => c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
function paraOklch(hex) {
  const [r, g, b] = hexRGB(hex).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return [L, Math.hypot(A, B), Math.atan2(B, A)];
}
function deOklch([L, C, H]) {
  const A = C * Math.cos(H), B = C * Math.sin(H);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.2914855480 * B) ** 3;
  const rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
  return "#" + rgb.map(c => Math.round(Math.max(0, Math.min(1, gam(c))) * 255).toString(16).padStart(2, "0")).join("");
}
function mistura(a, b, t) {
  const x = paraOklch(a), y = paraOklch(b);
  let dh = y[2] - x[2]; if (dh > Math.PI) dh -= 2 * Math.PI; if (dh < -Math.PI) dh += 2 * Math.PI;
  return deOklch([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + dh * t]);
}
const luz = hex => { const [r, g, b] = hexRGB(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
// texto preto sobre cor clara, papel sobre cor escura (o que tiver mais contraste)
const textoSobre = hex => { const L = luz(hex), cTinta = (L + 0.05) / (luz(CORES.tinta) + 0.05), cPapel = (luz(CORES.papel) + 0.05) / (L + 0.05); return cTinta >= cPapel ? CORES.tinta : CORES.papel; };

/* ================= DADOS ================= */
const codigoDe = f => (f["movie-code"] || f["movie code"] || f.codigo || f.code || f.filme || "").trim();
const cacheTxt = new Map();
const pegaUmaVez = url => { if (!cacheTxt.has(url)) cacheTxt.set(url, pega(url).catch(e => { cacheTxt.delete(url); throw e; })); return cacheTxt.get(url); };
// o índice: tenta cada endereço na ordem
async function lerIndice(urls, pastaOutlines) {
  let erro;
  for (const u of urls) {
    try {
      const linhas = tabela(await pegaUmaVez(u)).filter(f => codigoDe(f));
      if (!linhas.length) throw new Error("índice vazio");
      const temOrdem = linhas.some(f => f.ordem);
      if (temOrdem) linhas.sort((a, b) => num(a.ordem) - num(b.ordem));
      const filmes = linhas.map(f => ({
        codigo: codigoDe(f), filme: f.filme || codigoDe(f), genero: f.genero || "", ano: f.ano || "",
        roteiristas: (f.roteiristas || f.roteirista || "").split(";").map(x => x.trim()).filter(Boolean),
        sinopse: f.sinopse || "", logline: f.logline || "", imagem: f.image || f.imagem || "", link: f.link || "",
        combo: parseInt(f["combo-cor"] || f["combo cor"] || f.combo || "", 10), gradiente: f.gradiente || "",
        duracao: f.duracao ? num(f.duracao) : null,
        outline: (() => { const o = f["outline-csv"] || f.outline || ""; return o ? (/^[a-z]+:\/\//i.test(o) ? o : new URL(o, pastaOutlines).href) : OUTLINE; })(),
        projeto: (f["project-code"] || f.projeto || "").trim(),
        premios: f["recognitions-csv"] || f.reconhecimentos || RECONHECIMENTOS,
      }));
      return filmes;
    } catch (e) { erro = e; }
  }
  throw erro || new Error("sem índice");
}
// as linhas do outline de um filme (se a aba tiver movie-code, só as dele)
async function linhasOutline(f) {
  const todas = tabela(await pegaUmaVez(f.outline));
  const comCodigo = todas.some(c => c["movie-code"] || c["movie code"]);
  return comCodigo ? todas.filter(c => (c["movie-code"] || c["movie code"] || "").trim().toLowerCase() === f.codigo.toLowerCase()) : todas;
}
// prêmios do roteiro: linhas do CSV de reconhecimentos com o project-code do filme
async function premiosDe(f) {
  if (!f.projeto || !f.premios) return [];
  try {
    return tabela(await pegaUmaVez(new URL(f.premios, location.href).href))
      .filter(r => (r.project || r.projeto || "").trim().toLowerCase() === f.projeto.toLowerCase())
      .map(r => ({ rec: r.recognition || r.reconhecimento || "", titulo: r.title || r.titulo || "", cat: r.category || r.categoria || "", pais: r.country || r.pais || "", ano: r.year || r.ano || "" }))
      .filter(r => r.rec || r.titulo);
  } catch (e) { return []; }
}
async function duracaoDe(f) {
  if (f.duracao != null) return f.duracao;
  const ls = await linhasOutline(f);
  f.duracao = Math.max(0, ...ls.filter(c => c.minuto !== "" && c.minuto != null).map(c => num(c.minuto)));
  return f.duracao;
}
async function carregar(filmes, pedido) {
  const f = filmes.find(x => x.codigo.toLowerCase() === String(pedido).toLowerCase()) || filmes[0];
  const genero = f.genero;
  let grad = COMBOS[f.combo] || COMBOS[(GENEROS.find(g => g.re.test(genero)) || {}).combo] || COMBOS[COMBO_PADRAO];
  const proprio = f.gradiente.split(";").map(x => chave(x)).filter(x => CORES[x]);
  if (proprio.length === 2) grad = { ...grad, de: proprio[0], para: proprio[1] };
  const g0 = CORES[grad.de], g1 = CORES[grad.para];
  // outline
  const cenas = (await linhasOutline(f)).filter(c => c.cena !== "" && c.cena != null && c.minuto !== "" && c.minuto != null)
    .map((c, i) => ({
      i, ato: num(c.ato), cena: num(c.cena), bloco: num(c.bloco), min: num(c.minuto),
      texto: c.descricao || "", titulo: c.titulo || "", emo: num(c.emocao),
      nomeAto: c["nome do ato"] || c["ato nome"] || c["nome ato"] || "",
      cod: (c["#"] || c.codigo || c["scene-code"] || "").trim().replace(/[^A-Za-z0-9_-]/g, ""),
    }))
    .sort((a, b) => a.min - b.min || a.cena - b.cena);
  if (!cenas.length) throw new Error("outline vazio");
  const premios = await premiosDe(f);
  cenas.forEach((c, k) => { c.i = k; c.id = c.cod || `cena-${c.cena}`; });
  const tmax = Math.max(0, ...cenas.map(c => c.min));
  f.duracao = f.duracao ?? tmax;
  // duração real (até a próxima cena) e duração no desenho (no mínimo 1 min, para a última cena aparecer)
  cenas.forEach((c, k) => {
    const prox = cenas[k + 1];
    c.fim = prox ? prox.min : tmax;
    c.dur = c.fim - c.min;
    c.durV = Math.max(c.dur, 1);
  });
  let acc = 0; cenas.forEach(c => { c.v0 = acc; acc += c.durV; c.v1 = acc; });
  const total = acc;
  // cor: cada cena anda um passo no gradiente e, na troca de bloco, pula alguns; nunca volta
  const blocos = [];
  cenas.forEach(c => { const b = c.ato + "/" + c.bloco; if (blocos[blocos.length - 1] !== b) blocos.push(b); c.nb = blocos.length - 1; });
  const passoFinal = (cenas.length - 1) + SALTO_BLOCO * (blocos.length - 1) || 1;
  cenas.forEach((c, k) => { c.cor = mistura(g0, g1, (k + SALTO_BLOCO * c.nb) / passoFinal); });
  const contraste = (a, b) => { const x = luz(a) + 0.05, y = luz(b) + 0.05; return Math.max(x, y) / Math.min(x, y); };
  const fontePar = bg => (grad.texto || ["tinta", "papel"]).map(n => CORES[n]).filter(Boolean)
    .sort((a, b) => contraste(bg, b) - contraste(bg, a))[0] || textoSobre(bg);
  // atos
  const atos = [];
  cenas.forEach(c => {
    let a = atos[atos.length - 1];
    if (!a || a.n !== c.ato) { a = { n: c.ato, cenas: [], nome: "" }; atos.push(a); }
    if (!a.nome && c.nomeAto) a.nome = c.nomeAto;
    a.cenas.push(c);
  });
  atos.forEach(a => {
    a.min = a.cenas[0].min; a.fim = a.cenas[a.cenas.length - 1].fim;
    a.v0 = a.cenas[0].v0; a.v1 = a.cenas[a.cenas.length - 1].v1;
    a.cor = a.cenas[0].cor; a.texto = fontePar(a.cor);
  });
  cenas.forEach(c => { c.tx = textoSobre(c.cor); });
  return {
    slug: f.codigo, filme: f.filme, genero, ano: f.ano,
    link: f.link, imagem: f.imagem, sinopse: f.sinopse, logline: f.logline, premios,
    roteiristas: f.roteiristas, cenas, atos, tmax, total, g0, g1,
    pf: CORES[grad.par[0]], pt: CORES[grad.par[1]],
  };
}

/* ================= TEXTO DAS CENAS ================= */
// Quebra a descrição em unidades: frases de texto e trechos entre colchetes (flair).
function unidades(desc) {
  const out = []; const re = /\[([^\]]*)\]([.,;:!?…]*)/g; let ult = 0, m;
  const frases = t => {
    // fim de frase: . ! ? … (com aspas de fechamento coladas) ou aspas de fechamento, seguidos de espaço
    const partes = t.split(/(?<=[.!?…]["”’']*|[”"])\s+(?=\S)/);
    partes.map(s => s.trim()).filter(s => s && !/^[.,;:!?…]+$/.test(s)).forEach(s => out.push({ tipo: "frase", t: s }));
  };
  while ((m = re.exec(desc))) {
    frases(desc.slice(ult, m.index));
    const p = (m[2] || "").replace(/^,/, "");
    const t = (m[1].trim() + p).trim();
    if (t) out.push({ tipo: "flair", t });
    ult = re.lastIndex;
  }
  frases(desc.slice(ult));
  return out;
}
function textoCena(desc) {
  const u = unidades(desc);
  const primeira = u[0] && u[0].tipo === "frase" ? 0 : -1;
  const ultima = u.length > 1 && u[u.length - 1].tipo === "frase" ? u.length - 1 : -1;
  let html = "", meio = [];
  const solta = () => { if (meio.length) { html += `<p class="meio">${meio.map(esc).join(" ")}</p>`; meio = []; } };
  u.forEach((x, k) => {
    if (x.tipo === "flair") { solta(); html += `<p class="flair">${esc(x.t)}</p>`; return; }
    if (k === primeira || k === ultima) {
      solta();
      const forte = x.t.length <= DESTAQUE_MAX;
      html += `<p class="ponta${k === primeira ? " abre" : ""}${forte ? " forte" : ""}">${esc(x.t)}</p>`;
      return;
    }
    meio.push(x.t);
  });
  solta();
  return html || `<p class="meio">${esc(desc)}</p>`;
}

/* ================= ESTILO ================= */
const ESTILO = `
/* carregando: o loading padrão. Uma fagulha do laborateliê no meio da tela: os dois triângulos giram em cortes,
   reaparecendo em outros ângulos e montando várias fagulhas; [loading] embaixo */
.ocp-carregando{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;background:var(--fundo,#fbf8f4);color:var(--tinta,#141414)}
.ocp-carregando svg{width:56px;height:56px;overflow:visible}
.ocp-carregando path{fill:currentColor;transform-box:fill-box;transform-origin:center;animation:ocp-corte-a 2400ms step-end infinite}
.ocp-carregando .t2{animation-name:ocp-corte-b}
.ocp-carregando-texto{font-family:"Courier Prime","Courier New",monospace;font-size:14px;line-height:1.4;color:var(--texto-suave,#5c5852)}
/* cortes secos: cada triângulo salta para outro ângulo, sem passar pelo meio */
@keyframes ocp-corte-a{0%{transform:rotate(0)}12.5%{transform:rotate(40deg)}25%{transform:rotate(-25deg)}37.5%{transform:rotate(90deg)}50%{transform:rotate(15deg)}62.5%{transform:rotate(-60deg)}75%{transform:rotate(120deg)}87.5%{transform:rotate(-15deg)}}
@keyframes ocp-corte-b{0%{transform:rotate(0)}12.5%{transform:rotate(-35deg)}25%{transform:rotate(20deg)}37.5%{transform:rotate(-80deg)}50%{transform:rotate(45deg)}62.5%{transform:rotate(10deg)}75%{transform:rotate(-110deg)}87.5%{transform:rotate(30deg)}}
@media (prefers-reduced-motion:reduce){.ocp-carregando path{animation:none}}

:host,.raiz{
  --fundo:#fbf8f4; --texto:#141414; --texto-suave:#5c5852; --fio:#141414;
  --sobre-faixa:#141414; --papel:#fbf8f4; --tinta:#141414; --mata:#1b211d;
  --ouro-vivo:#ffc414;
  --grotesca:"Instrument Sans","Helvetica Neue",Arial,sans-serif;
  --serifa:"Cormorant Garamond",Garamond,Georgia,serif;
  --mono:"Courier Prime","Courier New",monospace;
  --passo-1:8px; --passo-2:16px; --passo-3:28px; --passo-4:48px; --passo-5:96px;
  --faixa-feixe:8px; --faixa-alta:160px; --passagem-longa:160px;
  --tempo-abre:700ms; --tempo-fecha:450ms; --tempo-escada:70ms;
  --curva-portal:cubic-bezier(0.7,0,0.2,1); --curva-pouso:cubic-bezier(0.2,0.7,0.2,1);
}
*{box-sizing:border-box;margin:0;padding:0;font-family:inherit}
:host{display:block}
.raiz{overflow-x:clip;background:var(--fundo);color:var(--texto);font-family:var(--grotesca);font-size:17px;line-height:1.45;-webkit-font-smoothing:antialiased}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;text-align:left}
.mono{font-family:var(--mono);font-size:14px;line-height:1.4;font-weight:400}
.versal{font-size:12px;line-height:1.3;font-weight:500;letter-spacing:.12em;text-transform:uppercase}
.estado{padding:var(--passo-4) var(--passo-3);color:var(--texto-suave)}

/* ---------- cabeçalho do filme (par noite) ---------- */
.cabeco{background:var(--pf);color:var(--pt)}
.pe-feixe{display:flex;flex-direction:column}
.pe-feixe i{display:block;height:var(--faixa-feixe);background:var(--c)}
.cabeco-corpo{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr)}
.cartaz{margin:0;align-self:start}
.cartaz img{display:block;width:100%;height:auto}
.ficha{display:flex;flex-direction:column;padding:var(--passo-4) var(--passo-3) var(--passo-4) var(--passo-4);min-width:0}
.ficha-titulo{font-size:120px;line-height:.92;font-weight:500;letter-spacing:-.04em;text-wrap:balance}
.ficha-logline{font-family:var(--serifa);font-style:italic;font-weight:400;font-size:28px;line-height:1.15;margin-top:var(--passo-3);max-width:30ch}
.ficha-campos{margin-top:var(--passo-4);max-width:640px}
.campo{display:grid;grid-template-columns:140px minmax(0,1fr);gap:var(--passo-2);padding:12px 0;border-top:1px solid currentColor;align-items:baseline}
.campo:last-child{border-bottom:1px solid currentColor}
.campo dd{margin:0;font-size:17px;line-height:1.35}
/* pôster sempre inteiro (2:3), centrado na coluna; o que sobra fica escuro */
.coluna-cartaz{position:relative;overflow:clip;display:flex;align-items:center;justify-content:center;min-width:0;background:var(--mata);container-type:inline-size}
/* atrás do pôster: o próprio pôster, 200% maior, com blur forte e 70% de opacidade sobre o escuro */
.coluna-cartaz::before{content:"";position:absolute;inset:-80px;background:var(--pst,none) center/200% auto no-repeat;filter:blur(48px);opacity:.7;pointer-events:none}
/* centrado quando sobra espaço; com a rolagem, desce junto, sempre no meio da tela (até o fim da coluna) */
.cartaz{margin:0;width:100%;z-index:1;position:sticky;top:max(0px,calc(50vh - 75cqw));bottom:max(0px,calc(50vh - 75cqw))}
.cartaz img{display:block;width:100%;height:auto}
/* seletor de filmes, no topo */
.seletor{position:relative;z-index:6;background:var(--mata);color:var(--papel)}
.seletor-botao{display:flex;align-items:center;gap:var(--passo-2);width:100%;height:48px;padding:0 var(--passo-3);color:inherit}
.seletor-botao .versal{color:#c9c4bb}
.seletor-atual{font-size:17px;font-weight:500;letter-spacing:-.01em;color:var(--ouro-vivo)}
.mais{position:relative;width:14px;height:14px;margin-left:auto;flex:none}
.mais::before,.mais::after{content:"";position:absolute;left:0;top:50%;width:100%;height:1.5px;margin-top:-.75px;background:currentColor;transition:transform var(--tempo-fecha) var(--curva-portal)}
.mais::after{transform:rotate(90deg)}
.seletor[data-aberto] .mais::after{transform:rotate(0)}
.seletor-lista{position:absolute;left:0;right:0;top:100%;background:var(--mata);overflow:hidden;max-height:0;transition:max-height var(--tempo-fecha) var(--curva-portal)}
.seletor[data-aberto] .seletor-lista{max-height:80vh;overflow-y:auto;transition-duration:var(--tempo-abre)}
.seletor-filme{display:grid;grid-template-columns:56px minmax(0,1fr) auto;align-items:center;gap:var(--passo-3);width:100%;padding:12px var(--passo-3);border-top:1px solid #3a413c;color:var(--papel)}
.seletor-filme:last-child{border-bottom:1px solid #3a413c}
.seletor-filme .pst{display:block;width:56px;aspect-ratio:2/3;background:#2b322d;overflow:hidden}
.seletor-filme .pst img{display:block;width:100%;height:100%;object-fit:contain}
.seletor-filme b{font-size:28px;line-height:1.1;font-weight:500;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.seletor-filme .dados{color:#c9c4bb;white-space:nowrap}
.seletor-filme[aria-current] b,.seletor-filme:hover b,.seletor-filme:focus-visible b{color:var(--ouro-vivo)}
.seletor-filme:focus-visible{outline:1px solid var(--ouro-vivo);outline-offset:-4px}
.ficha-sinopse{margin-top:auto;padding-top:var(--passo-4);max-width:58ch;font-size:17px;line-height:1.5}
/* corrida: o letreiro das cenas, como os outros da marca, sobre a mata (neon no escuro) */
.corrida{display:flex;align-items:center;height:40px;overflow:hidden;background:var(--mata);color:var(--papel);border-top:1px solid var(--mata);cursor:grab;touch-action:pan-y;user-select:none;-webkit-user-select:none}
.corrida[data-arrastando]{cursor:grabbing}
.corrida-trilho{display:flex;align-items:center;white-space:nowrap;will-change:transform}
.corrida-ato{display:inline-flex;align-items:center;padding:4px 8px;margin-right:18px;background:var(--neon);color:var(--mata);font-size:12px;line-height:1.2;font-weight:500;letter-spacing:.12em;text-transform:uppercase}
.corrida-item{display:inline-flex;align-items:center;gap:8px;padding-right:18px;font-size:14px;font-weight:400;color:inherit}
.corrida-item::after{content:"";width:6px;height:6px;margin-left:10px;background:var(--neon)}
.corrida-item .t{font-family:var(--mono);font-size:14px;color:#c9c4bb}
.corrida-item b{font-weight:500;font-size:15px;letter-spacing:-.01em;color:var(--neon)}
.corrida-item:hover b,.corrida-item:focus-visible b{color:var(--papel)}
.corrida-item:focus-visible{outline:1px solid var(--neon);outline-offset:-4px}

/* laureis: os prêmios do roteiro passando, no par do filme */
.laureis{overflow:hidden;cursor:grab;touch-action:pan-y;user-select:none;-webkit-user-select:none;margin-top:var(--passo-4);padding:4px 0}
.laureis[data-arrastando]{cursor:grabbing}
.laureis-trilho{display:flex;align-items:center;width:max-content;will-change:transform}
.laurel{display:inline-flex;align-items:center;gap:6px;margin-right:var(--passo-5);color:inherit}
.laurel .ramo{width:40px;height:96px;flex:none}
.laurel .ramo.dir{transform:scaleX(-1)}
.laurel-txt{display:flex;flex-direction:column;align-items:center;text-align:center;line-height:1.1;max-width:240px}
.lr-rec{font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase}
.lr-tit{font-size:20px;font-weight:500;letter-spacing:-.01em;margin-top:4px;white-space:normal;text-wrap:balance}
.lr-cat{font-family:var(--serifa);font-style:italic;font-size:17px;margin-top:4px}
.lr-loc{font-family:var(--mono);font-size:12px;margin-top:6px}
.fim .laureis{margin:var(--passo-4) calc(-1*var(--passo-3)) 0}

/* ---------- linha do tempo: um feixe de cenas ---------- */
.tempo{padding:var(--passo-4) var(--passo-3) var(--passo-4)}
.tempo-rotulo{font-size:14px;line-height:1.3;font-weight:500;color:var(--texto-suave);margin-bottom:88px}
.trilho{position:relative;height:var(--alt);--alt:300px;--banda:28px}
.colunas{position:absolute;inset:0;display:flex}
.col{position:relative;flex:var(--g) 1 0;min-width:2px;height:100%;overflow:hidden;border-left:1px solid var(--texto-suave);outline:none}
.col:first-child{border-left:0}
/* a cor fica embaixo, numa banda fina; com o cursor ela sobe e enche a coluna (o feixe abre) */
.col-cor{position:absolute;left:0;right:0;bottom:0;height:var(--banda);background:var(--bg);
  transition:height var(--tempo-fecha) var(--curva-portal)}
.col:hover .col-cor,.col:focus-visible .col-cor,.col.is-on .col-cor{height:100%;transition-duration:var(--tempo-abre)}
/* o título mora escondido na divisão: em pé, cortado pela largura da coluna */
.col.is-on .col-cor{height:100%}
/* a caixa da cena: cresce sobre as outras e acima da linha, com o título inteiro em pé */
.caixa{position:absolute;bottom:0;width:60px;height:var(--banda);z-index:2;background:var(--bg);color:var(--tx);overflow:hidden;pointer-events:none;opacity:0;
  transition:height var(--tempo-fecha) var(--curva-portal),opacity 0s linear var(--tempo-fecha)}
.caixa[data-on]{opacity:1;height:calc(100% + 56px);transition:height var(--tempo-abre) var(--curva-portal),opacity 0s}
.caixa-janela{position:absolute;left:0;right:0;top:var(--passo-2);bottom:44px;overflow:hidden}
.caixa-texto{position:absolute;top:0;left:8px;writing-mode:vertical-rl;white-space:nowrap;font-size:40px;line-height:1.1;font-weight:500;letter-spacing:-.02em;word-spacing:.12em}
.caixa-texto i{font-style:normal;display:inline-block;padding-bottom:var(--passo-4)}
.caixa-num{position:absolute;left:8px;bottom:12px}
.emocao{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.emocao path{fill:none;stroke-width:1.5;stroke-linecap:butt;stroke-linejoin:round}
/* linhas dos atos: altas, número em cima; a última termina com um quadrado */
.atos{position:absolute;inset:0;pointer-events:none}
.ato-marca{position:absolute;top:-32px;bottom:-32px;width:0;border-left:1px solid var(--fio)}
.zero{position:absolute;top:50%;left:0;width:14px;height:1.5px;background:var(--tinta);transform:translate(-50%,-50%)}
.ato-fim{display:inline-block;width:9px;height:9px;background:var(--texto-suave);vertical-align:1px}
/* embaixo: o nome de cada ato e o minuto em que começa */
.nomes{position:relative;height:72px;margin-top:40px}
.nome-ato{position:absolute;top:0;padding-left:10px;padding-right:12px;overflow:hidden;cursor:pointer;text-align:left}
.nome-ato b{display:block;font-size:17px;line-height:1.25;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nome-ato span{display:block;color:var(--texto-suave);margin-top:4px}
.nome-ato:hover b,.nome-ato:focus-visible b{color:var(--texto-suave)}
.nome-curto{display:none}
.nomes[data-curto] .nome-longo{display:none}
.nomes[data-curto] .nome-curto{display:inline}
.nome-ato.nome-fim{left:auto;right:0;padding:0 0 0 0;text-align:right;cursor:default;transform:translateX(4.5px)}
/* minutagem da cena sob a caixa, antes dos nomes dos atos */
.cena-min{position:absolute;top:calc(100% + 8px);left:0;white-space:nowrap;color:var(--texto);background:var(--fundo);padding:0 4px;z-index:2;
  opacity:0;transition:opacity var(--tempo-fecha) var(--curva-portal)}
.cena-min[data-on]{opacity:1;transition-duration:var(--tempo-abre)}
/* com o cursor na linha do tempo: o que está passando */
.assistindo{position:absolute;left:28px;top:0;width:340px;padding:20px 24px 22px;background:var(--pf);color:var(--pt);z-index:3;
  pointer-events:none;opacity:0;transform:translateY(-8px);transition:opacity var(--tempo-fecha) var(--curva-portal),transform var(--tempo-fecha) var(--curva-portal)}
.assistindo[data-on]{opacity:1;transform:none;transition-duration:var(--tempo-abre)}
.assistindo .vc{font-family:var(--serifa);font-style:italic;font-size:24px;line-height:1.25;font-weight:400}
.assistindo .nf{font-size:28px;line-height:1.1;font-weight:500;letter-spacing:-.02em;margin-top:6px}
.assistindo .agora{margin-top:14px}
.assistindo .agora b{display:block;font-family:var(--grotesca);font-weight:500;font-size:17px;line-height:1.3;margin-top:2px}

/* ---------- outline ---------- */
.corpo{display:grid;grid-template-columns:120px minmax(0,1fr);column-gap:var(--passo-3);padding:0 var(--passo-3) 0 0;position:relative}
.rolo{grid-column:1;grid-row:1;position:relative;z-index:2}
.rolo-fixo{position:sticky;top:var(--passo-4);height:calc(100vh - 2*var(--passo-4));padding-left:var(--passo-3)}
.rolo-barra{position:relative;height:100%;width:var(--faixa-feixe);cursor:pointer;touch-action:manipulation}
.rolo-barra::before{content:"";position:absolute;left:50%;top:0;bottom:0;border-left:1px solid var(--texto-suave)}
.rolo-barra i{position:absolute;inset:0;display:block;background:linear-gradient(180deg,var(--g0),var(--g1));background:linear-gradient(180deg in oklch,var(--g0),var(--g1))}
.rolo-barra .carregado{opacity:.32;clip-path:inset(0 0 calc(100% - var(--b,0%)) 0)}
.rolo-barra .visto{clip-path:inset(0 0 calc(100% - var(--w,0%)) 0)}
.cabeca{position:absolute;left:-4px;width:16px;height:2px;background:var(--tinta);top:var(--p,0%);transition:top 120ms linear}
.rolo-mira{position:absolute;left:-2px;width:12px;height:1px;background:var(--tinta);opacity:0;pointer-events:none}
.rolo-mira[data-on]{opacity:1}
.outline{grid-column:2;grid-row:1;min-width:0}
.ato{scroll-margin-top:var(--passo-4)}
.outline-cabeca{display:flex;align-items:baseline;flex-wrap:wrap;gap:8px var(--passo-4);padding:0 var(--passo-3) var(--passo-3) calc(120px + var(--passo-3))}
.outline-titulo{font-size:120px;line-height:.92;font-weight:500;letter-spacing:-.04em}
.outline-link{display:inline-flex;align-self:center;color:var(--texto);padding:0 2px 5px;border-bottom:1.5px solid currentColor}
.outline-link:hover,.outline-link:focus-visible{color:var(--texto-suave);outline:none}
.outline-link svg{width:13px;height:17px;display:block}
.ato-faixa{min-height:var(--faixa-alta);background:var(--bg);color:var(--tx);display:flex;align-items:flex-end;gap:var(--passo-3);
  padding:var(--passo-3) var(--passo-3) var(--passo-2);margin:0 calc(-1*var(--passo-3)) 0 calc(-120px - var(--passo-3));padding-left:calc(120px + var(--passo-3))}
.ato-titulo{font-size:64px;line-height:.98;font-weight:500;letter-spacing:-.035em}
.ato-cenas{display:flex;flex-wrap:wrap;gap:6px var(--passo-4);font-size:14px;line-height:1.3;font-weight:500;padding-bottom:.5em}
.cenas-lista{padding:var(--passo-4) 0 var(--passo-4)}
.cena{display:grid;grid-template-columns:96px minmax(0,512px);column-gap:var(--passo-3);scroll-margin-top:var(--passo-4)}
.cena+.cena{margin-top:var(--passo-4)}
.cena+.cena[data-novo]{margin-top:144px}
.cena-num{color:var(--texto-suave);padding-top:2px}
.cena-texto>p:first-child{margin-top:0}
.cena-texto p+p{margin-top:12px}
.cena-texto .ponta{color:var(--texto);font-weight:400}
.cena-texto .ponta.forte{font-weight:500}
.cena-texto .ponta.abre{font-size:24px;line-height:1.3;letter-spacing:-.01em}
.cena-num{padding-top:7px}
.cena-texto .meio{color:var(--texto-suave)}
.cena-texto .flair{font-family:var(--serifa);font-style:italic;font-weight:400;font-size:24px;line-height:1.25;color:var(--texto);margin-top:16px;margin-bottom:4px}
.cena-texto .flair+p{margin-top:16px}
.cena.is-alvo .cena-num{color:var(--texto)}

/* ---------- fim ---------- */
/* o gradiente do papel para a mata ocupa --passagem; o texto começa antes de ele acabar (em --entra) */
.fim{--passagem:max(360px,50vh);min-height:calc(100vh + var(--passagem)*var(--entra));color:var(--pt);display:flex;flex-direction:column;justify-content:flex-start;
  padding:calc(var(--passagem)*var(--entra)) var(--passo-3) var(--passo-5);
  background:linear-gradient(180deg,var(--papel),var(--pf) var(--passagem));background:linear-gradient(180deg in oklch,var(--papel),var(--pf) var(--passagem))}
.fim .l{display:block;overflow:hidden}
.fim .l>span{display:block;transform:translateY(105%);transition:transform var(--tempo-abre) var(--curva-pouso);transition-delay:calc(var(--k)*var(--tempo-escada)*2)}
.fim.is-on .l>span{transform:none}
.the-end{font-family:var(--serifa);font-style:italic;font-weight:300;font-size:132px;line-height:.9;letter-spacing:-.02em;padding-bottom:.08em;margin-top:var(--passo-5)}
.um-filme{font-family:var(--serifa);font-style:italic;font-weight:400;font-size:24px;line-height:1.25;margin-top:var(--passo-5)}
.roteiro{font-size:28px;line-height:1.1;font-weight:500;letter-spacing:-.02em;margin-top:var(--passo-1)}
.titulo-filme{font-size:64px;line-height:.98;font-weight:500;letter-spacing:-.035em}
.genero{margin-top:var(--passo-2)}
/* voltar ao topo: botão no par do filme; com o cursor, o par se inverte subindo por baixo */
.topo{align-self:flex-start;display:inline-flex;align-items:center;gap:10px;margin-top:var(--passo-5);padding:12px 18px;font-size:14px;font-weight:500;
  color:var(--pf);background:linear-gradient(var(--pf),var(--pf)) bottom/100% 0 no-repeat,var(--pt);transition:background-size var(--tempo-abre) var(--curva-portal),color var(--tempo-abre) var(--curva-portal)}
.topo:hover,.topo:focus-visible{background-size:100% 100%,auto;color:var(--pt);outline:none;box-shadow:inset 0 0 0 1px var(--pt)}
.topo svg{width:14px;height:14px}

@media (max-width:760px){
  .tempo{padding:var(--passo-4) var(--passo-2) var(--passo-4)}
  .outline-cabeca{padding:0 var(--passo-2) var(--passo-3) calc(28px + var(--passo-2))}
  .outline-titulo{font-size:64px}
  .cabeco-corpo{grid-template-columns:minmax(0,1fr)}
  .cartaz{width:auto;position:relative;top:auto;bottom:auto}
  .cartaz img{width:auto;max-width:100%;max-height:72vh}
  .seletor-botao{padding:0 var(--passo-2)}
  .seletor-filme{grid-template-columns:44px minmax(0,1fr);padding:10px var(--passo-2);gap:var(--passo-2)}
  .seletor-filme .pst{width:44px}
  .seletor-filme b{font-size:20px}
  .seletor-filme .dados{grid-column:2}
  .ficha{padding:var(--passo-3) var(--passo-2) var(--passo-4)}
  .ficha-titulo{font-size:64px}
  .ficha-logline{font-size:24px}
  .campo{grid-template-columns:96px minmax(0,1fr)}
  .ficha-sinopse{margin-top:0}

  .assistindo{width:260px;left:20px}
  .trilho{--alt:200px;--banda:20px}
  .caixa{width:44px}
  .caixa-texto{font-size:28px;left:6px}
  .nome-ato{padding-left:6px;padding-right:4px}
  .nome-ato b{font-size:12px}
  .nome-ato span{font-size:11px}
  .corpo{grid-template-columns:28px minmax(0,1fr);column-gap:var(--passo-2);padding-right:var(--passo-2)}
  .rolo-fixo{padding-left:var(--passo-2)}
  .ato-faixa{margin:0 calc(-1*var(--passo-2)) 0 calc(-28px - var(--passo-2));padding-left:calc(28px + var(--passo-2));padding-right:var(--passo-2)}
  .ato-titulo{font-size:48px}
  .cena{grid-template-columns:minmax(0,1fr);row-gap:8px}
  .the-end{font-size:88px}
  .titulo-filme{font-size:44px}
  .fim{padding-left:var(--passo-2);padding-right:var(--passo-2)}
}
@media (prefers-reduced-motion:reduce){
  *{transition:none!important;animation:none!important}
}
`;

/* ================= LAUREL ================= */
// um ramo de louro (o da esquerda; o da direita é o espelho), desenhado em currentColor
const RAMO = (() => {
  const cx = 46, cy = 50, r = 38, folhas = [];
  for (let i = 0; i < 9; i++) {
    const th = (112 + i * 16) * Math.PI / 180, x = cx + r * Math.cos(th), y = cy + r * Math.sin(th);
    const tg = Math.atan2(Math.cos(th), -Math.sin(th)) * 180 / Math.PI; // direção da haste, subindo
    folhas.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7.5" ry="3" transform="rotate(${(tg + 40).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)}) translate(-5 0)"/>`);
    folhas.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7.5" ry="3" transform="rotate(${(tg - 40).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)}) translate(-5 0)"/>`);
  }
  const a0 = 104 * Math.PI / 180, a1 = 248 * Math.PI / 180;
  const haste = `<path d="M${(cx + r * Math.cos(a0)).toFixed(1)},${(cy + r * Math.sin(a0)).toFixed(1)} A${r},${r} 0 0 1 ${(cx + r * Math.cos(a1)).toFixed(1)},${(cy + r * Math.sin(a1)).toFixed(1)}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;
  return `<svg class="ramo" viewBox="0 0 48 100" aria-hidden="true">${haste}<g fill="currentColor">${folhas.join("")}</g></svg>`;
})();
const laurel = p => `<div class="laurel" role="listitem">${RAMO}<div class="laurel-txt">`
  + (p.rec ? `<span class="lr-rec">${esc(p.rec)}</span>` : "")
  + (p.titulo ? `<span class="lr-tit">${esc(p.titulo)}</span>` : "")
  + (p.cat ? `<span class="lr-cat">${esc(p.cat)}</span>` : "")
  + `<span class="lr-loc">${[p.pais, p.ano].filter(Boolean).map(esc).join(" · ")}</span>`
  + `</div>${RAMO.replace('class="ramo"', 'class="ramo dir"')}</div>`;

/* ================= CURVAS ================= */
// Catmull-Rom → Bézier: curva macia que passa por todos os pontos; os controles ficam dentro de [lo, hi].
function caminho(pts, lo, hi) {
  const cl = y => Math.max(lo, Math.min(hi, y));
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, cl(p1[1] + (p2[1] - p0[1]) / 6)];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, cl(p2[1] - (p3[1] - p1[1]) / 6)];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}
// média móvel gaussiana; fora das pontas a emoção é 0 (a linha nasce e morre no zero)
function suaviza(v, sigma) {
  const r = Math.ceil(sigma * 3);
  return v.map((_, i) => {
    let s = 0, w = 0;
    for (let k = -r; k <= r; k++) { const p = Math.exp(-(k * k) / (2 * sigma * sigma)); s += p * (v[i + k] || 0); w += p; }
    return s / w;
  });
}

/* ================= CARREGANDO (loading padrão do DS) ================= */
const CARREGANDO = `<div class="ocp-carregando" role="status" aria-live="polite" aria-label="Carregando">
  <svg viewBox="0 0 100 100" aria-hidden="true"><path class="t1" d="M53 8L91 72H15Z"/><path class="t2" d="M43 94L9 36H77Z"/></svg>
  <p class="ocp-carregando-texto">[loading]</p>
</div>`;

/* ================= COMPONENTE ================= */
function iniciar(HOST) {
  const ROOT = HOST.attachShadow({ mode: "open" });
  ROOT.innerHTML = `<style>${ESTILO}</style><div class="raiz" lang="pt-BR">${CARREGANDO}</div>`;
  const RAIZ = ROOT.querySelector(".raiz");
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const urlsIndice = HOST.hasAttribute("indice")
    ? [new URL(HOST.getAttribute("indice"), location.href).href, new URL(RESERVA, BASE).href]
    : [INDICE, new URL(RESERVA, BASE).href];
  const IMAGENS = HOST.getAttribute("imagens") || BASE_IMAGENS;
  const pastaOutlines = new URL(HOST.getAttribute("outlines") || OUTLINES, location.href).href;
  const pastaImg = new URL(IMAGENS, location.href);
  const hash = () => decodeURIComponent(location.hash.slice(1)).split("/");
  let FILMES = [], atual = "", ctl = null;

  function abrir(codigo) {
    if (ctl) ctl.abort();
    if (FILMES.length && RAIZ.querySelector(".cabeco")) { RAIZ.innerHTML = CARREGANDO; scrollTo({ top: Math.max(0, HOST.getBoundingClientRect().top + scrollY) }); }
    ctl = new AbortController();
    const sinal = ctl.signal;
    carregar(FILMES, codigo).then(F => {
      if (sinal.aborted) return;
      atual = F.slug;
      montar(F, sinal);
    }).catch(e => {
      if (!sinal.aborted) RAIZ.innerHTML = `<p class="estado mono">Não foi possível carregar o filme (${esc(e.message)}).</p>`;
    });
  }
  lerIndice(urlsIndice, pastaOutlines).then(filmes => {
    FILMES = filmes;
    abrir(HOST.getAttribute("filme") || hash()[0] || "");
    addEventListener("hashchange", () => {
      const c = hash()[0];
      if (c && c.toLowerCase() !== atual.toLowerCase() && FILMES.some(f => f.codigo.toLowerCase() === c.toLowerCase())) {
        abrir(c);
        HOST.scrollIntoView({ block: "start" });
      }
    });
  }).catch(e => { RAIZ.innerHTML = `<p class="estado mono">Não foi possível carregar o índice de filmes (${esc(e.message)}).</p>`; });

  function montar(F, sinal) {
        const minTxt = m => `${Math.round(m * 10) / 10}′`;
    const faixaMin = c => c.dur > 0 ? `${minTxt(c.min)} → ${minTxt(c.fim)}` : minTxt(c.min);
    const n2 = n => String(n).padStart(2, "0");

    const cols = F.cenas.map(c => `<button type="button" class="col" data-cena="${c.i}" style="--g:${c.durV};--bg:${c.cor};--tx:${c.tx}" aria-label="Cena ${c.cena} · ${esc(c.titulo)} · ${faixaMin(c)}">`
      + `<span class="col-cor"></span></button>`).join("");
    const marcas = F.atos.map((a, k) => `<span class="ato-marca" data-ato="${a.n}">${k ? "" : `<i class="zero"></i>`}</span>`).join("")
      + `<span class="ato-marca final" style="left:100%"><i class="zero"></i></span>`;
    const nomes = F.atos.map(a => `<button type="button" class="nome-ato" data-ato="${a.n}"><b><span class="nome-longo">${esc(a.nome || "Ato " + a.n)}</span><span class="nome-curto">${a.n}</span></b><span class="mono">${minTxt(a.min)}</span></button>`).join("")
      + `<span class="nome-ato nome-fim" aria-hidden="true"><b><i class="ato-fim"></i></b><span class="mono">${minTxt(F.tmax)}</span></span>`;

    const atosHTML = F.atos.map(a => {
      const c0 = a.cenas[0].cena, c1 = a.cenas[a.cenas.length - 1].cena;
      const cenas = a.cenas.map(c => `
        <article class="cena" id="${esc(c.id)}" data-i="${c.i}"${c.i && F.cenas[c.i - 1].nb !== c.nb ? " data-novo" : ""}>
          <span class="cena-num mono">${n2(c.cena)}</span>
          <div class="cena-texto">${textoCena(c.texto)}</div>
        </article>`).join("");
      return `<section class="ato" id="ato-${a.n}">
        <header class="ato-faixa" style="--bg:${a.cor};--tx:${a.texto}">
          <h2 class="ato-titulo">Ato ${a.n}</h2><span class="ato-cenas"><span>${c0 === c1 ? `Cena ${c0}` : `Cenas ${c0}–${c1}`}</span><span>${minTxt(a.min)} → ${minTxt(a.fim)}</span></span>
        </header>
        <div class="cenas-lista">${cenas}</div>
      </section>`;
    }).join("");

    const linha = (t, cls, k) => `<span class="l ${cls}" style="--k:${k}"><span>${t}</span></span>`;
    let k = 0;
    const feixe = [1, .75, .5, .25, 0].map(x => `<i style="--c:${mistura(F.g0, F.g1, x)}"></i>`).join("");
    // laureis repetidos até encher bem mais que a tela, em duas metades iguais (o laço da corrida)
    const laureisHTML = F.premios.length ? (() => {
      const um = F.premios.map(laurel).join(""), vezes = Math.max(1, Math.ceil(8 / F.premios.length));
      const metade = um.repeat(vezes);
      return `<div class="laureis" role="list" aria-label="Prêmios e seleções"><div class="laureis-trilho">${metade}${metade}</div></div>`;
    })() : "";
    const fimHTML = `<section class="fim" aria-label="Créditos">
        ${linha(esc(F.filme), "titulo-filme", k++)}
        ${F.genero ? linha(esc(F.genero), "genero versal", k++) : ""}
        ${linha("The End.", "the-end", k++)}
        ${laureisHTML}
        ${F.roteiristas.length ? linha("um filme de", "um-filme", k++) : ""}
        ${F.roteiristas.map(r => linha(esc(r), "roteiro", k++)).join("")}
        <button type="button" class="topo">Voltar ao topo <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 13V2M2 7l5-5 5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button>
      </section>
      <div class="pe-feixe" aria-hidden="true">${feixe}</div>`;

    const seta = `<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 12 12 2M4 2h8v8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;
    const doc = `<svg viewBox="0 0 44 56" aria-hidden="true"><path d="M2 2h29l11 11v41H2z M31 2v11h11" fill="none" stroke="currentColor" stroke-width="4"/><path d="M10 27h24M10 36h24M10 45h15" stroke="currentColor" stroke-width="4"/></svg>`;
    const duracao = `${Math.round(F.tmax)} min`;
    // o nome do ato e, depois, as suas cenas com o minuto de início; cada ato num neon
    const NEONS = ["#ffc414", "#ff3d9a", "#00d2d3", "#a855ff", "#ffe78f"]; // ouro-vivo, rosa-vivo, turquesa-vivo, violeta-vivo, ouro
    const itens = F.atos.map((a, k) => `<span class="corrida-ato" style="--neon:${NEONS[k % NEONS.length]}">${esc(a.nome || "Ato " + a.n)}</span>`
      + a.cenas.map(c => `<button type="button" class="corrida-item" data-cena="${esc(c.id)}" tabindex="-1" style="--neon:${NEONS[k % NEONS.length]}"><span class="t">${minTxt(c.min)}</span><b>${esc(c.titulo)}</b></button>`).join("")).join("");
    const campos = [["Gênero", F.genero], ["Roteiro", F.roteiristas.join(", ")], ["Duração", duracao]].filter(x => x[1])
      .map(([r, v]) => `<div class="campo"><dt class="versal">${r}</dt><dd>${esc(v)}</dd></div>`).join("");
    const seletor = `<nav class="seletor" aria-label="Filmes">
        <button type="button" class="seletor-botao" aria-expanded="false"><span class="versal">Filmes</span><span class="seletor-atual">${esc(F.filme)}</span><i class="mais" aria-hidden="true"></i></button>
        <div class="seletor-lista">${FILMES.map(f => `<button type="button" class="seletor-filme" data-codigo="${esc(f.codigo)}"${f.codigo === F.slug ? ` aria-current="true"` : ""} tabindex="-1">`
          + `<span class="pst">${f.imagem ? `<img src="${esc(new URL(f.imagem, pastaImg).href)}" alt="" loading="lazy">` : ""}</span>`
          + `<b>${esc(f.filme)}</b><span class="dados mono">${[f.ano, f.duracao != null ? `${Math.round(f.duracao)} min` : "… min"].filter(Boolean).map(esc).join(" · ")}</span></button>`).join("")}</div>
      </nav>`;
    const cabeco = `<header class="cabeco" style="--g0:${F.g0}">
        <div class="cabeco-corpo">
          <div class="coluna-cartaz"${F.imagem ? ` style="--pst:url('${esc(new URL(F.imagem, pastaImg).href)}')"` : ""}>${F.imagem ? `<figure class="cartaz"><img src="${esc(new URL(F.imagem, pastaImg).href)}" alt="${esc(F.filme)}" loading="eager"></figure>` : ""}</div>
          <div class="ficha">
            <h1 class="ficha-titulo">${esc(F.filme)}</h1>
            ${F.logline ? `<p class="ficha-logline">${esc(F.logline)}</p>` : ""}
            ${laureisHTML}
            <dl class="ficha-campos">${campos}</dl>
            ${F.sinopse ? `<p class="ficha-sinopse">${esc(F.sinopse)}</p>` : ""}
          </div>
        </div>
        <div class="corrida" aria-label="Cenas"><div class="corrida-trilho">${itens}${itens}</div></div>
      </header>
`;

    RAIZ.style.setProperty("--pf", F.pf); RAIZ.style.setProperty("--pt", F.pt);
    {
      const contr = (a, b) => { const x = luz(a) + 0.05, y = luz(b) + 0.05; return Math.max(x, y) / Math.min(x, y); };
      let e = 0.6; while (e < 1 && contr(mistura(CORES.papel, F.pf, e), F.pt) < 3.2) e += 0.02;
      RAIZ.style.setProperty("--entra", Math.min(1, e).toFixed(2));
    }
    RAIZ.innerHTML = `
      ${seletor}
      ${cabeco}
      <section class="tempo" aria-label="Linha do tempo de ${esc(F.filme)}">
        <p class="tempo-rotulo">Navegue pelas cenas:</p>
        <div class="trilho">
          <div class="colunas">${cols}</div>
          <div class="caixa" aria-hidden="true"><div class="caixa-janela"><span class="caixa-texto"></span></div><span class="caixa-num mono"></span></div>
          <svg class="emocao" aria-hidden="true"><path/></svg>
          <div class="atos">${marcas}</div>
          <span class="cena-min mono" aria-hidden="true"></span>
        </div>
        <div class="nomes">${nomes}</div>
      </section>
      <div class="outline-cabeca"><h2 class="outline-titulo">Outline</h2>${F.link ? `<a class="outline-link" href="${esc(F.link)}" target="_blank" rel="noopener" aria-label="Abrir o documento do outline" title="Abrir o documento do outline">${doc}</a>` : ""}</div>
      <div class="corpo">
        <div class="rolo" aria-hidden="true"><div class="rolo-fixo"><div class="rolo-barra" style="--g0:${F.g0};--g1:${F.g1}">
          <i class="carregado"></i><i class="visto"></i><span class="cabeca"></span><span class="rolo-mira"></span>
          <div class="assistindo" role="status" aria-live="polite"><p class="vc">Você está assistindo:</p><p class="nf">${esc(F.filme)}</p><p class="agora mono"></p></div>
        </div></div></div>
        <div class="outline">${atosHTML}</div>
      </div>
      ${fimHTML}`;

    const $ = s => RAIZ.querySelector(s), $$ = s => [...RAIZ.querySelectorAll(s)];
    const trilho = $(".trilho"), svg = $(".emocao"), path = svg.querySelector("path");
    const nomesBox = $(".nomes"), colEl = $$(".col"), marcaEl = $$(".ato-marca[data-ato]"), nomeEl = $$(".nome-ato[data-ato]");

    /* ----- emoção: o desenho real vai se fazendo em pedaços e se apagando, sem parar ----- */
    const real = F.cenas.map(c => c.emo), picoR = Math.max(1e-6, ...real.map(Math.abs));
    const PEDACOS = 10;
    // gradiente vertical: verde no pico de cima, tinta no zero, vermelho no pico de baixo (passos em OKLCH)
    const alto = mistura(CORES[EMO_ALTO[0]], CORES[EMO_ALTO[1]], EMO_ALTO[2]), baixo = mistura(CORES[EMO_BAIXO[0]], CORES[EMO_BAIXO[1]], EMO_BAIXO[2]);
    const paradas = [];
    for (let i = 0; i <= 10; i++) { const u = i / 10; paradas.push(`<stop offset="${u}" stop-color="${u < .5 ? mistura(alto, CORES.tinta, u * 2) : mistura(CORES.tinta, baixo, (u - .5) * 2)}"/>`); }
    svg.innerHTML = `<defs><linearGradient id="emo-cor" gradientUnits="userSpaceOnUse" x1="0" x2="0">${paradas.join("")}</linearGradient></defs>`
      + Array.from({ length: PEDACOS }, () => `<path stroke="url(#emo-cor)"/>`).join("");
    const emoCor = svg.querySelector("#emo-cor");
    const pedacos = [...svg.querySelectorAll("path")];
    let geo = null, L = 0;
    function medir() {
      const W = trilho.clientWidth, H = trilho.clientHeight; if (!W) return null;
      const xs = colEl.map(e => e.offsetLeft + e.offsetWidth / 2);
      // atos: a linha na divisão antes da primeira cena; o nome embaixo, até o próximo ato
      const xAto = F.atos.map(a => colEl[a.cenas[0].i].offsetLeft);
      marcaEl.forEach((m, k) => { m.style.left = xAto[k] + "px"; });
      nomeEl.forEach((n, k) => { n.style.left = xAto[k] + "px"; n.style.width = ((xAto[k + 1] ?? W) - xAto[k]) + "px"; });
      const estreito = xAto.some((x, k) => (xAto[k + 1] ?? W) - x < 72);
      nomesBox.toggleAttribute("data-curto", F.atos.length > ATOS_MAX_NOMES || estreito);
      return { W, H, meio: H / 2, amp: H / 2 - 10, sobra: Math.min(24, W * .03), xs };
    }
    function redimensiona() {
      geo = medir(); if (!geo) return;
      const { W, H, meio, amp, sobra, xs } = geo;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("width", W); svg.setAttribute("height", H);
      emoCor.setAttribute("y1", meio - amp); emoCor.setAttribute("y2", meio + amp);
      const d = caminho([[-sobra, meio], ...xs.map((x, k) => [x, meio - real[k] / picoR * amp]), [W + sobra, meio]], 2, H - 2);
      pedacos.forEach(p => p.setAttribute("d", d));
      L = pedacos[0].getTotalLength();
      if (reduz) pedacos.forEach((p, k) => { p.style.opacity = k ? 0 : 1; });
    }
    redimensiona();
    const roT = new ResizeObserver(redimensiona); roT.observe(trilho);
    sinal.addEventListener("abort", () => roT.disconnect());
    if (!reduz) {
      let cabeca = 0, antes = performance.now();
      const anda = now => {
        if (sinal.aborted) return;
        const dt = Math.min(0.05, (now - antes) / 1000); antes = now;
        if (L && !document.hidden) {
          const rastro = L * EMO_RASTRO, k = rastro / PEDACOS;
          cabeca += dt * (L + rastro) / EMO_VOLTA;
          if (cabeca > L + rastro) cabeca = 0;
          pedacos.forEach((p, i) => {
            const ini = cabeca - (i + 1) * k;
            p.style.strokeDasharray = `${k + 0.6} ${L * 3}`;
            p.style.strokeDashoffset = -ini;
            p.style.opacity = (1 - i / PEDACOS) ** 1.6;
          });
        }
        requestAnimationFrame(anda);
      };
      requestAnimationFrame(anda);
    }

    /* ----- a caixa da cena e o "você está assistindo" ----- */
    const caixa = $(".caixa"), cxTexto = $(".caixa-texto"), cxNum = $(".caixa-num"), cenaMin = $(".cena-min");
    let corre = null, cenaOn = null;
    function abre(el) {
      if (cenaOn === el) return;
      if (cenaOn) cenaOn.classList.remove("is-on");
      cenaOn = el; el.classList.add("is-on");
      const c = F.cenas[+el.dataset.cena], W = trilho.clientWidth, w = caixa.offsetWidth;
      caixa.style.setProperty("--bg", c.cor); caixa.style.setProperty("--tx", c.tx);
      caixa.style.left = Math.max(0, Math.min(W - w, el.offsetLeft + el.offsetWidth / 2 - w / 2)) + "px";
      cxNum.textContent = n2(c.cena);
      if (corre) { corre.cancel(); corre = null; }
      cxTexto.innerHTML = `<i>${esc(c.titulo)}</i>`;
      caixa.setAttribute("data-on", "");
      // se o título não cabe, corre dentro da caixa (marquee)
      requestAnimationFrame(() => {
        const janela = caixa.querySelector(".caixa-janela"), alto = trilho.clientHeight + 56 - 16 - 44;
        const um = cxTexto.firstChild.offsetHeight;
        if (um > alto && !reduz) {
          cxTexto.innerHTML = `<i>${esc(c.titulo)}</i><i>${esc(c.titulo)}</i>`;
          corre = cxTexto.animate([{ transform: "translateY(0)" }, { transform: `translateY(${-um}px)` }], { duration: um / CORRIDA * 1000, iterations: Infinity, delay: 500 });
        }
      });
      cenaMin.textContent = faixaMin(c);
      const lm = cenaMin.offsetWidth;
      cenaMin.style.left = Math.max(0, Math.min(W - lm, el.offsetLeft + el.offsetWidth / 2 - lm / 2)) + "px";
      cenaMin.setAttribute("data-on", "");
    }
    function fecha() {
      if (cenaOn) cenaOn.classList.remove("is-on");
      cenaOn = null; caixa.removeAttribute("data-on"); cenaMin.removeAttribute("data-on");
      if (corre) { corre.cancel(); corre = null; }
    }
    colEl.forEach(el => { el.addEventListener("pointerenter", () => abre(el)); el.addEventListener("focus", () => abre(el)); });
    trilho.addEventListener("pointerleave", fecha);
    trilho.addEventListener("focusout", e => { if (!trilho.contains(e.relatedTarget)) fecha(); });

    colEl.forEach(el => el.addEventListener("click", () => vai(F.cenas[+el.dataset.cena].id)));
    $$(".nome-ato[data-ato]").forEach(b => b.addEventListener("click", () => vai("ato-" + b.dataset.ato)));

    /* ----- seletor de filmes ----- */
    {
      const nav = $(".seletor"), bt = nav.querySelector(".seletor-botao"), itensF = [...nav.querySelectorAll(".seletor-filme")];
      const fecha = () => { nav.removeAttribute("data-aberto"); bt.setAttribute("aria-expanded", "false"); itensF.forEach(i => i.tabIndex = -1); };
      const abre = () => {
        nav.setAttribute("data-aberto", ""); bt.setAttribute("aria-expanded", "true"); itensF.forEach(i => i.tabIndex = 0);
        // a duração dos outros filmes vem dos seus outlines, só quando o seletor abre
        itensF.forEach(el => {
          const f = FILMES.find(x => x.codigo === el.dataset.codigo), d = el.querySelector(".dados");
          if (f && f.duracao == null) duracaoDe(f).then(m => { d.textContent = [f.ano, `${Math.round(m)} min`].filter(Boolean).join(" · "); }).catch(() => { d.textContent = f.ano; });
        });
      };
      bt.addEventListener("click", () => nav.hasAttribute("data-aberto") ? fecha() : abre());
      itensF.forEach(el => el.addEventListener("click", () => {
        fecha();
        if (el.dataset.codigo !== F.slug) location.hash = el.dataset.codigo;
      }));
      document.addEventListener("pointerdown", e => { if (!e.composedPath().includes(nav)) fecha(); }, { signal: sinal });
      document.addEventListener("keydown", e => { if (e.key === "Escape") fecha(); }, { signal: sinal });
    }

    /* ----- corridas: o letreiro das cenas e os laureis. Correm a 38px/s, param com o cursor, puxam com inércia ----- */
    function correr(pista, trilhoC, aoClicar) {
      let x = 0, vel = 0, arrasto = null, antes = performance.now(), moveu = 0;
      const metade = () => trilhoC.scrollWidth / 2;
      const quadro = now => {
        if (sinal.aborted || !pista.isConnected) return;
        const dt = Math.min(0.05, (now - antes) / 1000); antes = now;
        if (!arrasto && !document.hidden && !(pista.matches(":hover") && Math.abs(vel) <= 1)) {
          if (Math.abs(vel) > 1) { x += vel * dt; vel *= Math.pow(0.04, dt); } else x -= (reduz ? 0 : CORRIDA) * dt;
        }
        const m = metade(); if (m) { while (x <= -m) x += m; while (x > 0) x -= m; }
        trilhoC.style.transform = `translateX(${x}px)`;
        requestAnimationFrame(quadro);
      };
      requestAnimationFrame(quadro);
      pista.addEventListener("pointerdown", e => { arrasto = { x0: e.clientX, x: x, t: performance.now(), ult: e.clientX }; moveu = 0; vel = 0; pista.setPointerCapture(e.pointerId); pista.setAttribute("data-arrastando", ""); });
      pista.addEventListener("pointermove", e => {
        if (!arrasto) return;
        const now = performance.now(), dx = e.clientX - arrasto.ult;
        vel = dx / Math.max(1, now - arrasto.t) * 1000; arrasto.t = now; arrasto.ult = e.clientX;
        x = arrasto.x + (e.clientX - arrasto.x0); moveu = Math.max(moveu, Math.abs(e.clientX - arrasto.x0));
      });
      const solta = () => { arrasto = null; pista.removeAttribute("data-arrastando"); };
      pista.addEventListener("pointerup", solta); pista.addEventListener("pointercancel", solta);
      if (aoClicar) pista.addEventListener("click", e => { if (moveu < 6) aoClicar(e); });
    }
    correr($(".corrida"), $(".corrida-trilho"), e => { const b = e.target.closest(".corrida-item"); if (b) vai(b.dataset.cena); });
    $$(".laureis").forEach(l => correr(l, l.querySelector(".laureis-trilho")));

    /* ----- navegação ----- */
    function vai(id, suave = true) {
      let el = ROOT.getElementById(id);
      // endereços antigos (#RVL/cena-12) ainda levam à cena
      if (!el && /^cena-\d+$/.test(id)) { const c = F.cenas.find(x => x.cena === +id.slice(5)); if (c) { id = c.id; el = ROOT.getElementById(id); } }
      if (!el) return;
      el.scrollIntoView({ behavior: suave && !reduz ? "smooth" : "auto", block: "start" });
      history.replaceState(null, "", `#${F.slug}/${id}`);
      $$(".cena.is-alvo").forEach(x => x.classList.remove("is-alvo"));
      if (el.classList.contains("cena")) el.classList.add("is-alvo");
    }
    const alvo = hash();
    if (alvo[0] === F.slug && alvo[1]) requestAnimationFrame(() => vai(alvo[1], false));

    /* ----- rolo: o filme carregando e o quanto já foi visto ----- */
    const cenasEl = $$(".cena"), cabeca = $(".cabeca"), barra = $(".rolo-barra"), fimEl = $("section.fim");
    const assist = $(".assistindo"), agora = assist.querySelector(".agora"), mira = $(".rolo-mira");
    let carregado = 0, visto = 0;
    function minutoAtual() {
      const linhaY = innerHeight * .4;
      const fimTop = fimEl.getBoundingClientRect().top;
      if (fimTop < linhaY) return F.total;
      let atual = -1;
      for (let k = 0; k < cenasEl.length; k++) { if (cenasEl[k].getBoundingClientRect().top <= linhaY) atual = k; else break; }
      if (atual < 0) return 0;
      const el = cenasEl[atual], c = F.cenas[+el.dataset.i];
      const r = el.getBoundingClientRect();
      const prox = cenasEl[atual + 1] ? cenasEl[atual + 1].getBoundingClientRect().top : fimTop;
      const frac = Math.max(0, Math.min(1, (linhaY - r.top) / Math.max(1, prox - r.top)));
      return c.v0 + frac * c.durV;
    }
    const cenaEm = x => F.cenas.find(c => x >= c.v0 && x < c.v1) || F.cenas[F.cenas.length - 1];
    const realEm = x => { const c = cenaEm(x); return c.min + (c.dur > 0 ? Math.min(1, (x - c.v0) / c.durV) * c.dur : 0); };
    function pinta() {
      const v = visto / F.total, b = Math.max(carregado, v);
      barra.style.setProperty("--w", (v * 100) + "%");
      barra.style.setProperty("--b", (b * 100) + "%");
      cabeca.style.setProperty("--p", (v * 100) + "%");
    }
    let quadro = 0;
    const aoRolar = () => {
      if (quadro) return;
      quadro = requestAnimationFrame(() => {
        quadro = 0;
        visto = minutoAtual();
        carregado = Math.max(carregado, Math.min(1, visto / F.total + .12));
        pinta();
      });
    };
    addEventListener("scroll", aoRolar, { passive: true, signal: sinal });
    addEventListener("resize", aoRolar, { signal: sinal });
    // o filme vai carregando sozinho, como num streaming, até o fim
    const inicio = performance.now();
    const carrega = now => {
      if (sinal.aborted) return;
      const alvoC = Math.min(1, ((now - inicio) / 1000) * 0.006 + 0.08);
      if (alvoC > carregado) { carregado = alvoC; pinta(); }
      if (carregado < 1) setTimeout(() => requestAnimationFrame(carrega), 400);
    };
    requestAnimationFrame(carrega);
    aoRolar();
    // passar o cursor mostra a minutagem; clicar leva para aquele ponto do filme
    const pontoEm = e => { const r = barra.getBoundingClientRect(); const f = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)); return { f, x: f * F.total }; };
    barra.addEventListener("pointermove", e => {
      const { f, x } = pontoEm(e), c = cenaEm(x);
      agora.innerHTML = `${minTxt(Math.round(realEm(x)))} · cena ${n2(c.cena)}<b>${esc(c.titulo)}</b>`;
      const h = barra.clientHeight, a = assist.offsetHeight;
      assist.style.top = Math.max(0, Math.min(h - a, f * h - a / 2)) + "px"; mira.style.top = (f * 100) + "%";
      assist.setAttribute("data-on", ""); mira.setAttribute("data-on", "");
    });
    barra.addEventListener("pointerleave", () => { assist.removeAttribute("data-on"); mira.removeAttribute("data-on"); });
    barra.addEventListener("click", e => vai(cenaEm(pontoEm(e).x).id));

    $(".topo").addEventListener("click", () => {
      scrollTo({ top: Math.max(0, HOST.getBoundingClientRect().top + scrollY), behavior: reduz ? "auto" : "smooth" });
      history.replaceState(null, "", `#${F.slug}`);
    });

    /* ----- fim: escurece e os créditos sobem ----- */
    new IntersectionObserver((es, ob) => es.forEach(e => {
      if (e.isIntersecting) { fimEl.classList.add("is-on"); ob.disconnect(); }
    }), { threshold: .35 }).observe(fimEl);
  }
}

class OcpOutline extends HTMLElement {
  connectedCallback() { if (!this.shadowRoot) iniciar(this); }
}
if (!customElements.get("ocp-outline")) customElements.define("ocp-outline", OcpOutline);
})();
