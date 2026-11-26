/* =====================================================================
   Módulo de sinais · Outra Coisa é Possível
   Arquivo único: estilo, comportamento e cópia de reserva dos dados.

   Uso em qualquer página da gira.:

     <ocp-sinais modo="bloco"></ocp-sinais>
     <script src="/lab/signals-hub/sinais.js?v=1" defer></script>

   Atributos de <ocp-sinais>:
     modo="completo"  (padrão) cartas + página interna de cada ato / artefato (#A-001 no endereço)
     modo="bloco"     só as cartas; o clique leva para a página do hub
     destino="/lab/signals-hub/"  para onde o modo bloco leva (padrão: a pasta deste arquivo)

   O módulo é isolado (Shadow DOM): o CSS da página não entra nele e o dele não sai.
   As fontes vêm da pasta fonts/ ao lado deste arquivo. Um <ocp-sinais> por página.
   Ao atualizar este arquivo, troque o número de ?v= nas páginas que o chamam.
   ===================================================================== */
(() => {
const SCRIPT = document.currentScript;
const BASE = SCRIPT && SCRIPT.src ? new URL(".", SCRIPT.src).href : "/lab/signals-hub/";

// as fontes precisam ser declaradas na página (o Shadow DOM não registra @font-face)
if (!document.getElementById("ocp-sinais-fontes")) {
  const f = document.createElement("style"); f.id = "ocp-sinais-fontes";
  f.textContent = `@font-face{font-family:"Instrument Sans";src:url("${BASE}fonts/InstrumentSans-Variable.woff2") format("woff2");font-weight:400 700;font-stretch:75% 100%;font-style:normal;font-display:block}
@font-face{font-family:"Cormorant Garamond";src:url("${BASE}fonts/CormorantGaramond-Italic-Variable.woff2") format("woff2");font-weight:300 700;font-style:italic;font-display:swap}
@font-face{font-family:"Courier Prime";src:url("${BASE}fonts/CourierPrime-Regular.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}`;
  document.head.appendChild(f);
}

const ESTILO = "\n\n:host,.raiz{\n  --fundo:#fbf8f4; --texto:#141414; --texto-suave:#5c5852; --fio:#141414;\n  --sobre-faixa:#141414; --papel:#fbf8f4; --tinta:#141414; --mata:#1b211d;\n  --rosa:#ffc4e1; --rosa-vivo:#ff3d9a; --rosa-tipo:#b0105f;\n  --ouro:#ffe78f; --ouro-vivo:#ffc414; --ouro-tipo:#7a5800;\n  --turquesa:#9ff4ef; --turquesa-vivo:#00d2d3; --turquesa-tipo:#00626a;\n  --violeta:#e0c9ff; --violeta-vivo:#a855ff; --violeta-tipo:#6420c8;\n  --cobalto:#c7d0ff; --cobalto-vivo:#2a3cff; --cobalto-tipo:#1a2ad6;\n  --vermelho:#ffbfb5; --vermelho-vivo:#ff3b2f; --verde:#c3f5a6; --vermelho-tinta:#b01f14; --verde-tinta:#17692c; --tempo-passagem:900ms; --verde-vivo:#2fcf5a; --mata-vivo:#000000;\n  --destroy:#3a272b; --destroy-vivo:#6e2a38; /* cinza quase preto puxado para o bordô */\n  --grotesca:\"Instrument Sans\",\"Helvetica Neue\",Arial,sans-serif;\n  --serifa:\"Cormorant Garamond\",Garamond,Georgia,serif;\n  --mono:\"Courier Prime\",\"Courier New\",monospace;\n  --passo-1:8px; --passo-2:16px; --passo-3:28px; --passo-4:48px; --passo-5:96px;\n  --tempo-abre:700ms; --tempo-fecha:450ms; --tempo-escada:70ms;\n  --curva-portal:cubic-bezier(0.7,0,0.2,1); --curva-pouso:cubic-bezier(0.2,0.7,0.2,1);\n}\n*{box-sizing:border-box;margin:0;padding:0;font-family:inherit}\n:host,.raiz{display:block;background:var(--fundo);color:var(--texto)}\n:host,.raiz{font-family:var(--grotesca);font-size:17px;line-height:1.45;-webkit-font-smoothing:antialiased}\n\n/* ---------- navegador ---------- */\n.nav{padding:var(--passo-4) var(--passo-3) var(--passo-5)}\n.nav-barra{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--passo-2) var(--passo-4);\n  border-top:1px solid var(--fio);padding-top:var(--passo-2);margin-bottom:var(--passo-4)}\n.nav-cont{font-family:var(--mono);font-size:14px;color:var(--texto-suave)}\n.versal{font-size:12px;line-height:1.3;font-weight:500;letter-spacing:.12em;text-transform:uppercase}\n\n/* seleção estilo ficha: caixas com fio e o círculo à mão */\n.sel{display:flex;border:1px solid currentColor}\n.sel > *{position:relative;padding:6px 12px;border:0;background:none;color:inherit;font:inherit;cursor:pointer}\n.sel > * + *{border-left:1px solid currentColor}\n.sel .circ{position:absolute;inset:-7px -6px;width:calc(100% + 12px);height:calc(100% + 14px);pointer-events:none;\n  overflow:visible;opacity:0}\n.sel .circ path{fill:none;stroke:currentColor;stroke-width:1.4;stroke-linecap:round;stroke-dasharray:260;stroke-dashoffset:260}\n.sel [aria-pressed=\"true\"] .circ,.sel .on .circ{opacity:1}\n.sel [aria-pressed=\"true\"] .circ path,.sel .on .circ path{animation:risca var(--tempo-abre) var(--curva-pouso) forwards}\n@keyframes risca{to{stroke-dashoffset:0}}\n\n.legendas{margin-left:auto;display:grid;gap:8px}\n.legenda-verge{display:flex;flex-wrap:wrap;gap:6px 14px}\n.legenda-verge b{font-weight:500;color:var(--texto-suave);min-width:62px}\n.legenda-verge span{display:inline-flex;align-items:center;gap:6px}\n.legenda-verge i{display:inline-block;width:12px;height:12px}\n\n.busca{flex:1 1 300px;max-width:460px}\n.busca-campo{position:relative;display:flex;border:1px solid var(--fio)}\n.busca input{flex:1;min-width:0;border:0;background:transparent;color:var(--texto);font:400 16px/1.2 var(--grotesca);\n  padding:6px 12px;height:31px;outline:none;-webkit-appearance:none;appearance:none}\n.busca input::-webkit-search-cancel-button{display:none}\n.busca input::placeholder{color:var(--texto-suave)}\n.busca-campo:focus-within{outline:1px solid var(--fio);outline-offset:2px}\n.busca-campo button{border:0;border-left:1px solid var(--fio);background:none;color:var(--texto);font:400 20px/1 var(--grotesca);\n  width:34px;cursor:pointer}\n.busca-campo button:hover{background:var(--mata);color:var(--ouro-vivo)}\n.busca-res{font-family:var(--mono);font-size:14px;color:var(--texto-suave);padding-bottom:6px}\n.achado{margin-top:10px;font-family:var(--mono);font-size:12px;line-height:1.4;color:var(--texto-suave)}\n.achado b{font-weight:400;background:var(--ouro-vivo);color:var(--tinta);padding:0 3px}\n/* carrossel horizontal: arrastar, rolar ou setas; sempre na horizontal */\n.grade{--larg:380px;display:flex;align-items:stretch;gap:var(--passo-3);\n  overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;\n  margin-inline:calc(var(--passo-3) * -1);padding:0 var(--passo-3) var(--passo-2);scroll-padding-inline:var(--passo-3);\n  scrollbar-width:none;cursor:grab}\n.grade::-webkit-scrollbar{display:none}\n.grade.arrastando{cursor:grabbing;scroll-snap-type:none;user-select:none;-webkit-user-select:none}\n.grade.arrastando *{pointer-events:none}\n.grade > .carta{flex:0 0 var(--larg);width:var(--larg);min-width:0;scroll-snap-align:start}\n.grade > .vazio{flex:1}\n.grade-fim{flex:0 0 1px}\n.setas{display:flex;margin-left:auto;align-self:flex-end;border:1px solid var(--fio)}\n.setas button{width:44px;height:31px;border:0;background:none;color:var(--texto);cursor:pointer;display:grid;place-items:center}\n.setas button + button{border-left:1px solid var(--fio)}\n.setas button:hover:not(:disabled){background:var(--mata);color:var(--ouro-vivo)}\n.setas button:disabled{color:var(--texto-suave);opacity:.4;cursor:default}\n.setas svg{width:18px;height:10px;stroke:currentColor;fill:none;stroke-width:1.4}\n.vazio{font-family:var(--serifa);font-style:italic;font-size:24px}\n\n/* ---------- carta / pasta ---------- */\n.carta{--c:var(--rosa);--cv:var(--rosa-vivo);position:relative;color:var(--sobre-faixa);\n  opacity:0;transform:translateY(24px);animation:sobe var(--tempo-abre) var(--curva-portal) forwards;\n  animation-delay:calc(var(--i,0) * var(--tempo-escada))}\n@keyframes sobe{to{opacity:1;transform:none}}\n\n/* abas: os sinais */\n.abas{display:flex;align-items:flex-end;gap:3px;height:34px;width:100%;overflow:hidden}\n.aba{--t:var(--papel);position:relative;display:flex;align-items:flex-end;height:28px;flex:1 1 0;min-width:0;max-width:84px;white-space:nowrap;\n  padding:0 20px 5px 10px;background:var(--t);color:var(--sobre-faixa);\n  font-family:var(--mono);font-size:12px;line-height:1;cursor:pointer;border:0;\n  clip-path:polygon(0 0,calc(100% - 16px) 0,100% 100%,0 100%);\n  transition:height var(--tempo-fecha) var(--curva-portal)}\n.aba:hover,.aba:focus-visible{height:34px;outline:none;transition-duration:var(--tempo-abre)}\n.aba.escura{color:var(--rosa-vivo)}\n.aba.mais{--t:var(--tinta);color:var(--papel);flex:0 0 auto;padding-right:22px;letter-spacing:.04em}\n.aba-dica{position:fixed;left:0;top:0;z-index:50;width:max-content;max-width:280px;\n  background:var(--mata);color:var(--ouro-vivo);padding:6px 10px;font-family:var(--grotesca);\n  font-size:14px;font-weight:500;line-height:1.3;pointer-events:none;opacity:0;transform:translateY(calc(-100% + 4px));\n  transition:opacity 200ms,transform 200ms var(--curva-pouso)}\n.aba-dica b{display:block;font-family:var(--mono);font-weight:400;font-size:12px;color:var(--papel);margin-bottom:2px}\n.abas-wrap{position:relative}\n\n.carta{display:flex;flex-direction:column}\n.frente{background:var(--c);display:flex;flex-direction:column;flex:1}\n.frente .forcas{margin-top:auto}\n\n.zona{cursor:pointer;position:relative}\n.zona:focus-visible{outline:1px solid var(--sobre-faixa);outline-offset:-4px}\n\n/* cabeço */\n.cabeco{padding:14px 18px 18px}\n.dados{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:22px}\n.codigo{font-family:var(--mono);font-size:14px;line-height:1.4}\n.carta .sel{font-size:11px;letter-spacing:.12em;font-weight:500;text-transform:uppercase;cursor:default}\n.carta .sel > *{cursor:inherit;padding:5px 10px}\n.cabeco{position:relative;z-index:2;overflow:visible}\n.titulo{position:relative;min-height:calc(2 * .98 * 40px);font-size:40px;line-height:.98;font-weight:500;letter-spacing:-.035em;font-stretch:86%;\n  transition:font-size var(--tempo-fecha) var(--curva-portal),font-stretch var(--tempo-fecha) var(--curva-portal),\n    color var(--tempo-fecha) var(--curva-portal),line-height var(--tempo-fecha) var(--curva-portal),\n    transform var(--tempo-fecha) var(--curva-portal)}\n/* no hover: o título cresce, quebra linha para dentro da imagem e fica branco */\n.titulo.uma{display:flex;align-items:center}\n.carta:hover .titulo,.carta:focus-within .titulo{font-size:var(--tam,78px);line-height:.9;font-stretch:100%;color:var(--it,var(--ouro));transform:translateY(var(--desce,0px));\n  transition-duration:var(--tempo-abre)}\n\n/* imagem: momento vivo, em monotom */\n.imagem{background:var(--cv);aspect-ratio:4/3;overflow:hidden;position:relative;\n  transition:background var(--tempo-abre) var(--curva-portal)}\n.imagem{z-index:1}\n.imagem img{width:100%;height:100%;object-fit:cover;display:block;filter:none;\n  transition:filter var(--tempo-fecha) var(--curva-portal)}\n/* em repouso: imagem colorida. No hover: escurece com a cor da carta (monotom) */\n.imagem::after{content:\"\";position:absolute;inset:0;background:var(--if,var(--rosa-tipo));mix-blend-mode:multiply;opacity:0;\n  pointer-events:none;transition:opacity var(--tempo-fecha) var(--curva-portal)}\n.carta:hover .imagem img,.carta:focus-within .imagem img{filter:grayscale(1) contrast(1.1) brightness(1.15);transition-duration:var(--tempo-abre)}\n.carta:hover .imagem::after,.carta:focus-within .imagem::after{opacity:1;transition-duration:var(--tempo-abre)}\n.imagem .sem{position:absolute;inset:0;display:flex;align-items:flex-end;padding:14px 18px;\n  font-family:var(--mono);font-size:14px}\n.imagem .fig{position:absolute;right:12px;bottom:10px;font-family:var(--mono);font-size:12px;\n  background:var(--c);padding:2px 6px}\n\n/* marquee */\n.mq{border-top:1px solid var(--sobre-faixa);border-bottom:1px solid var(--sobre-faixa);\n  overflow:hidden;height:40px;display:flex;align-items:center;cursor:grab;touch-action:pan-y;user-select:none;-webkit-user-select:none}\n.mq.arrastando{cursor:grabbing}\n.mq-trilho{display:flex;align-items:center;white-space:nowrap;will-change:transform}\n.ev{display:inline-flex;align-items:center;gap:8px;padding:0 18px 0 0;font-size:14px;font-weight:500}\n.ev-cod{position:relative;font-family:var(--mono);font-weight:400;padding:2px 7px;background:var(--mata);color:var(--ouro-vivo)}\n.ev-steep{background:var(--st,transparent);font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:500;\n  border:1px solid currentColor;padding:2px 6px}\n.ev-txt{font-weight:400;max-width:none}\n.ev-sep{display:inline-block;width:6px;height:6px;background:var(--sobre-faixa);margin:0 18px 0 0}\n\n/* descrição */\n.desc{padding:16px 18px 20px;font-size:15px;line-height:1.45}\n.desc p{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}\n.desc strong{font-weight:600}\n\n/* forças */\n.forcas{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--sobre-faixa)}\n.forca{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;padding:10px 18px 12px;min-height:88px}\n.forca + .forca{border-left:1px solid var(--sobre-faixa)}\n.forca .n{font-size:64px;line-height:.82;font-weight:500;letter-spacing:-.05em;font-variant-numeric:tabular-nums}\n.forca .r{align-self:flex-start}\n.forca.fontes{flex-direction:row}\n.forca.sinais{flex-direction:row-reverse;text-align:right}\n.forca.fontes .n{transition:color 200ms}\n.forca[data-par=\"noite\"]{background:var(--mata);color:var(--ouro-vivo)}\n.forca[data-par=\"coroa\"]{background:var(--violeta-tipo);color:var(--ouro-vivo)}\n.forca:hover{filter:none}\n.forca[data-par=\"noite\"]:hover{background:var(--ouro-vivo);color:var(--mata)}\n.forca[data-par=\"coroa\"]:hover{background:var(--ouro-vivo);color:var(--violeta-tipo)}\n.forca{transition:background 250ms var(--curva-pouso),color 250ms var(--curva-pouso)}\n\n.zona.descricao:hover,.zona.cabeco:hover{background:color-mix(in oklch,var(--c),var(--cv) 22%)}\n.zona{transition:background var(--tempo-fecha) var(--curva-portal)}\n\n/* ================= PÁGINA INTERNA ================= */\n.detalhe{display:grid;grid-template-columns:1fr 1fr;min-height:100vh}\n.detalhe[hidden]{display:none}\n.det-esq{background:var(--c);color:var(--sobre-faixa);min-width:0}\n.det-dir{position:sticky;top:0;height:100vh;display:grid;grid-template-columns:1fr 2fr;background:var(--mata);color:var(--papel);min-width:0}\n.det-ev,.det-si{overflow-y:auto;overscroll-behavior:contain;min-width:0;scrollbar-width:thin;scrollbar-color:#ffffff33 transparent}\n.det-ev{padding:var(--passo-3) 14px var(--passo-4) var(--passo-3);border-right:1px solid #ffffff22}\n.det-si{padding:var(--passo-3) var(--passo-3) var(--passo-4) 14px}\n.det-rot{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:var(--passo-2)}\n.det-rot .codigo{color:var(--ouro-vivo)}\n\n/* esquerda */\n.esq-topo{display:flex;justify-content:space-between;align-items:center;padding:var(--passo-2) var(--passo-3);border-bottom:1px solid var(--sobre-faixa)}\n.voltar{display:inline-flex;align-items:center;gap:10px;color:inherit;text-decoration:none;padding:6px 0}\n.voltar svg{width:18px;height:10px;stroke:currentColor;fill:none;stroke-width:1.4;transition:transform var(--tempo-fecha) var(--curva-portal)}\n.voltar:hover svg{transform:translateX(-6px)}\n.esq-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);border-bottom:1px solid var(--sobre-faixa)}\n.esq-cab{padding:var(--passo-2) var(--passo-3) var(--passo-3);display:flex;flex-direction:column;min-width:0}\n.esq-cab .dados{margin-bottom:var(--passo-4)}\n.esq-cab .dados{margin-bottom:var(--passo-3)!important}\n.esq-titulo{font-size:clamp(34px,3.3vw,56px);line-height:.92;font-weight:500;letter-spacing:-.04em;text-wrap:balance}\n.esq-img{aspect-ratio:auto;min-height:260px;height:100%;background:var(--cv);overflow:hidden}\n.esq-img{position:relative}\n.esq-img img{width:100%;height:100%;object-fit:cover;display:block}\n.galeria{position:absolute;inset:0}\n.galeria img,.galeria .sem{position:absolute;inset:0;opacity:0;transition:opacity var(--tempo-abre) var(--curva-portal)}\n.galeria img.on,.galeria .sem.on{opacity:1}\n.galeria[data-n=\"1\"] img,.galeria[data-n=\"1\"] .sem{opacity:1}\n.galeria-pontos{position:absolute;left:var(--passo-2);bottom:var(--passo-2);display:flex;gap:6px;z-index:2}\n.galeria-pontos button{width:14px;height:14px;padding:0;border:1px solid var(--papel);background:transparent;cursor:pointer;\n  box-shadow:0 0 0 1px var(--tinta);transition:background 250ms var(--curva-pouso)}\n.galeria-pontos button.on{background:var(--papel)}\n.galeria-pontos button:hover:not(.on){background:color-mix(in oklch,var(--papel),transparent 50%)}\n.galeria-pontos button:focus-visible{outline:2px solid var(--ouro-vivo);outline-offset:2px}\n.esq-img .sem{display:flex;height:100%;align-items:flex-end;padding:14px var(--passo-3);font-family:var(--mono);font-size:14px}\n.esq-sub{font-family:var(--serifa);font-style:italic;font-weight:400;font-size:22px;line-height:1.15;\n  padding:0;margin-top:auto;padding-top:var(--passo-3);max-width:34ch;text-wrap:balance}\n.esq-desc{padding:0;font-size:17px;line-height:1.5;max-width:62ch}\n.esq-desc strong{font-weight:600}\n.bloco{border-top:1px solid var(--sobre-faixa);padding:var(--passo-2) var(--passo-3) var(--passo-4)}\n.bloco-cab{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:var(--passo-2)}\n.fontes-lista{list-style:none;counter-reset:f}\n.fontes-lista li{counter-increment:f;border-top:1px solid color-mix(in oklch,var(--sobre-faixa),transparent 75%)}\n.fontes-lista li:first-child{border-top:0}\n.fontes-lista a{display:flex;align-items:center;gap:14px;padding:10px 0;color:inherit;text-decoration:none;font-size:17px;font-weight:500}\n.fontes-lista a::before{content:counter(f,decimal-leading-zero);font-family:var(--mono);font-weight:400;font-size:14px;width:2ch}\n.fontes-lista a span{flex:1;overflow-wrap:anywhere}\n.fontes-lista a svg{width:18px;height:10px;stroke:currentColor;fill:none;stroke-width:1.4;transition:transform var(--tempo-fecha) var(--curva-portal)}\n.fontes-lista a:hover svg{transform:translateX(6px)}\n.fontes-lista a:hover span{text-decoration:underline;text-underline-offset:3px}\n\n/* mapa de conexões */\n.mapa{position:relative;display:grid;grid-template-columns:auto 1fr auto;column-gap:0;padding-right:56px;min-height:120px}\n.mapa svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}\n.mapa path{fill:none;stroke:var(--sobre-faixa);stroke-width:1;opacity:.32;transition:opacity 200ms,stroke-width 200ms}\n.mapa path.corr{stroke-dasharray:3 3}\n.mapa path.on{opacity:1;stroke-width:2}\n.m-col{display:flex;flex-direction:column;gap:6px;position:relative;z-index:1}\n.m-col.m-s{grid-column:3}\n.m-col.m-e{justify-content:space-around}\n.chip{--t:var(--papel);display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border:0;background:var(--t);color:var(--sobre-faixa);\n  font-family:var(--mono);font-size:12px;line-height:1.2;cursor:pointer;white-space:nowrap;\n  transition:background 200ms var(--curva-pouso),color 200ms var(--curva-pouso)}\n.chip.escura{color:var(--rosa-vivo)}\n.chip small{font-family:var(--grotesca);font-size:11px;letter-spacing:.06em;font-weight:500;opacity:.8}\n.chip:hover,.chip:focus-visible,.chip.on{background:var(--mata);color:var(--ouro-vivo);outline:none}\n.chip.fora{opacity:.45;cursor:default}\n.mapa .chip{box-shadow:inset 0 0 0 1px var(--sobre-faixa)}\n.mapa .chip.on,.mapa .chip:hover{box-shadow:none}\n.mapa .m-s .chip{max-width:min(260px,30vw)}\n.mapa .m-s .chip small{display:block;overflow:hidden;min-width:0;flex:1;text-align:left}\n.mapa .m-s .chip small span{display:inline-block;white-space:nowrap;transform:translateX(0);\n  transition:transform var(--dur,0ms) linear}\n.mapa .m-s .chip.corre small span{transform:translateX(var(--desloc,0px))}\n.mapa .m-s .chip small{-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 14px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 14px),transparent)}\n.mapa .m-s .chip.corre small,.mapa .m-s .chip.cabe small{-webkit-mask-image:none;mask-image:none}\n\n/* evidências (33%) */\n.evs{display:flex;flex-direction:column;gap:12px}\n.evc{--c:var(--papel);--cv:var(--papel);display:block;width:100%;text-align:left;border:0;padding:0;background:none;color:var(--sobre-faixa);cursor:pointer;font:inherit}\n.evc-aba{display:inline-flex;height:24px;align-items:flex-end;padding:0 22px 4px 10px;background:var(--c);font-family:var(--mono);font-size:12px;\n  clip-path:polygon(0 0,calc(100% - 14px) 0,100% 100%,0 100%);transition:background var(--tempo-abre) var(--curva-portal)}\n.evc-corpo{display:block;background:var(--c);padding:10px 12px 14px;transition:background var(--tempo-abre) var(--curva-portal)}\n.evc-steeps{display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap}\n.evc-steeps span{font-size:10px;letter-spacing:.12em;font-weight:500;padding:1px 5px;border:1px solid currentColor;background:var(--st)}\n.evc-txt{font-size:14px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}\n.evc:hover .evc-corpo,.evc:hover .evc-aba{background:color-mix(in oklch,var(--c),var(--cv) 30%)}\n.evc.on .evc-aba,.evc.on .evc-corpo{background:var(--cv)}\n.evc.on .evc-txt{display:block;-webkit-line-clamp:unset;font-size:16px;line-height:1.45}\n.evc.on.claro{color:var(--papel)}\n.evc.on.claro .evc-steeps span{color:var(--sobre-faixa);border-color:var(--papel)}\n.evc:focus-visible{outline:1px solid var(--ouro-vivo);outline-offset:3px}\n\n/* sinais (66%) */\n.si-abas{position:relative;display:flex;align-items:flex-end;gap:3px;height:34px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;\n  padding-inline:15%}\n.si-nav{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:var(--passo-2)}\n.si-nav button{display:inline-flex;align-items:center;gap:10px;height:44px;padding:0 14px;border:1px solid #ffffff55;background:none;\n  color:var(--papel);font:500 12px/1 var(--grotesca);letter-spacing:.12em;text-transform:uppercase;cursor:pointer}\n.si-nav button svg{width:18px;height:10px;stroke:currentColor;fill:none;stroke-width:1.4}\n.si-nav button:hover:not(:disabled){background:var(--ouro-vivo);color:var(--mata);border-color:var(--ouro-vivo)}\n.si-nav button:disabled{opacity:.3;cursor:default}\n.si-nav .codigo{color:var(--ouro-vivo);font-size:14px}\n.si-abas::-webkit-scrollbar{display:none}\n.si-abas{cursor:grab}\n.si-abas.arrastando{cursor:grabbing;user-select:none;-webkit-user-select:none}\n.si-abas.arrastando .aba{pointer-events:none}\n.si-abas .aba{flex:0 0 auto;min-width:66px;max-width:none}\n.si-abas .aba.on{height:34px}\n.si-card{background:var(--papel);color:var(--sobre-faixa)}\n.si-faixas{background:var(--c)}\n.si-faixas .topo{display:flex;justify-content:space-between;align-items:center;padding:14px var(--passo-3);min-height:56px}\n.si-faixas .topo .versal{font-size:14px}\n.si-faixas i{display:block;height:8px;background:var(--cv)}\n.si-faixas i:nth-child(3){background:var(--c);height:6px}\n.si-faixas i:nth-child(4){height:4px}\n.si-faixas.escura{color:var(--rosa-vivo)}\n.si-corpo{padding:var(--passo-3) var(--passo-3) var(--passo-4)}\n.si-titulo{font-size:clamp(34px,3.4vw,56px);line-height:.96;font-weight:500;letter-spacing:-.035em;text-wrap:balance;margin-bottom:var(--passo-4)}\n.ficha{border-top:1px solid var(--sobre-faixa)}\n.ficha > div{display:grid;grid-template-columns:150px minmax(0,1fr);align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--sobre-faixa)}\n.ficha dd{display:flex;flex-wrap:wrap;gap:6px}\n.chip.contorno{background:transparent;box-shadow:inset 0 0 0 1px var(--sobre-faixa)}\n.chip.contorno:hover,.chip.contorno.on{box-shadow:none;background:var(--mata);color:var(--ouro-vivo)}\n.si-texto{margin-top:var(--passo-4);font-size:22px;line-height:1.35;letter-spacing:-.01em;max-width:52ch}\n.si-texto::before{content:\"\";display:block;border-top:1px solid var(--sobre-faixa);margin-bottom:var(--passo-2)}\n.si-card.entra{animation:siEntra var(--tempo-abre) var(--curva-pouso)}\n@keyframes siEntra{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}\n\n@media (max-width:900px){\n  .detalhe{grid-template-columns:1fr}\n  .si-texto{font-size:19px}\n  .det-dir{position:static;height:auto;display:flex;flex-direction:column}\n  .det-ev,.det-si{overflow:visible}\n  .det-si{order:1;padding:var(--passo-3) var(--passo-2) var(--passo-4)}\n  .det-ev{order:2;padding:var(--passo-3) var(--passo-2) var(--passo-4);border-right:0;border-top:1px solid #ffffff22}\n  .esq-topo,.esq-cab,.bloco{padding-left:var(--passo-2);padding-right:var(--passo-2)}\n  .ficha > div{grid-template-columns:110px minmax(0,1fr)}\n}\n\n@media (max-width:640px){\n  .esq-hero{grid-template-columns:1fr}\n  .esq-img{aspect-ratio:3/2;height:auto;min-height:0}\n}\n@media (max-width:520px){\n  .nav{padding:var(--passo-3) var(--passo-2) var(--passo-4)}\n  /* mobile: a carta fica no centro da tela e as outras correm para os lados */\n  .grade{--larg:min(82vw,380px);margin-inline:calc(var(--passo-2) * -1);gap:var(--passo-2);\n    padding-inline:calc((100vw - var(--larg)) / 2);scroll-padding-inline:0}\n  .grade > .carta{scroll-snap-align:center}\n  .setas{display:none}\n  .legendas{margin-left:0}\n}\n@media (prefers-reduced-motion:reduce){\n  *,*::before,*::after{animation:none!important;transition:none!important}\n  .carta{opacity:1;transform:none}\n  .sel .circ path{stroke-dashoffset:0}\n}\n";

// Cópia de reserva da planilha: usada só se o Google não responder.
const RESERVA = {
"a": "#,A-A,Title,Subtitle,Description,Evidences,sources,Image,Image Source,other-images,other-images-source,order\nA-001,artifact,Drones com Fio,\"Drones ligados ao operador por um cabo de fibra óptica, imunes ao bloqueio de sinal, mudam a forma da guerra\",\"Um cabo físico de 30 a 50 km substitui o rádio, e o bloqueio de sinal perde efeito. A guerra eletrônica se espalhou pela frente ucraniana e deixou os drones sem fio vulneráveis. A Rússia lançou a sua versão em 2024; depois da repercussão nas redes sociais, um membro de uma rede de apoio à Ucrânia fez engenharia reversa e a DTU (Defense Tech for Ukrayne) viabilizou o primeiro uso ucraniano. São feitos com peças comerciais de uso duplo e impressão 3D. Não há defesa confiável e difundida \"\"além de se esconder\"\".\",E-001; E-002; E-003; E-004; E-005; E-006; E-007; E-008; ,https://en.majalla.com/node/331233/science-technology/how-fibre-optic-drones-are-reshaping-warfare; https://www.bbc.com/news/articles/c0r2ydlvk41o; https://www.arabnews.jp/en/middle-east/how-fiber-optic-drones-are-changing-the-face-of-modern-warfare-173992; https://en.wikipedia.org/wiki/Fiber_optic_drone; ,wired-drone.webp,https://en.wikipedia.org/wiki/Fiber_optic_drone#/media/File:UA_fiber-optic_FPV_drone_01.webp,wired-drone-2.webp; wired-drone-3.jpg; drone_pilot.jpg; ,https://www.bbc.com/news/articles/ckgn47e5qyno; https://www.arabnews.com/middle-east/how-fiber-optic-drones-are-changing-the-face-of-modern-warfare-2650668; ,1\nA-002,act,Maquiagem por Crianças,Crianças desenham sobre moldes de rosto e uma equipe de beleza traduz seus traços em maquiagem de moda,\"O projeto convidou crianças a desenhar nos moldes de rosto usados por maquiadores para planejar composições. Com os desenhos de origem publicados junto aos retratos reconhecemos os traços infantis na maquiagem, e uma leveza do possível nessa realidade. O projeto amplia a imaginação coletiva sobre o que pode aparecer num rosto, o que é ou não maquiagem e beleza, e como a arte facial pode ser feita e pensada. O gesto de ateliê está em deixar que algo surgido da brincadeira passe a orientar a técnica, inclusive quando o traço contraria hábitos do ofício. Tiziana Raimondo recriou os desenhos em rostos de modelos. Pierre-Emmanuel Testard fotografou a série, com direção criativa de Aurélie Joly e do Buro Nōto.\",E-009; E-010; E-011; E-012; E-013; ,https://www.designboom.com/art/draw-me-a-face-childrens-imagination-playful-makeup/; https://revistatop.com.mx/antes-de-limitar-la-imaginacion-draw-me-a-face/; https://visie.io/project/various-editorials-draw-me-a-face-part-1-2026;,draw-me-a-face.jpeg,https://visie.io/project/various-editorials-draw-me-a-face-part-1-2026,draw-me-a-face-2.jpg; draw-me-a-face-3.jpg; draw-me-a-face-4.jpg; draw-me-a-face-5.jpg,https://www.designboom.com/art/draw-me-a-face-childrens-imagination-playful-makeup/,",
"s": "#,verge-type,title (AI),signal,acts / artifacts,evidences,correlations\nS-001,CONNECT,Retorno às Redes Cabeadas,\"Do sem fio como infraestrutura dominante para o fio físico como garantia de não-conectividade externa. Transposição: infraestruturas civis críticas também podem voltar ao cabo, como forma de resiliência e soberania. Menor acesso sem fio permitido em espaços, e maior controle de acessos no nível dos despositivos.\",A-001;,E-001; E-007;,\nS-002,CONSUME,Guerras como Laboratórios Globais,\"De guerras locais para guerras como laboratórios compartilhados globais: táticas migram de um conflito para outro. Os conflitos são necessários tanto para as vendas, quanto para as demonstrações, quanto para os testes.\",A-001;,E-002; E-003; E-008;,S-003;\nS-003,DEFINE,Guerra como Estado Constante,\"Da guerra feita de rupturas momentâneas para a guerra como um ciclo contínuo de relacionamento, avanços, adaptação, ameaças e contra-ameaças. A guerra como estado constante do presente, no mundo físico e virtual.\",A-001;,E-005;,\nS-004,CREATE,Pequenos Labs de Grandes Tecnologias,\"Das armas e tecnologias como produtos caros da indústria estatal e corporativa para a bricolagem com material civil, peças de uso duplo e impressão 3D.\",A-001;,E-003; E-004;,S-012;\nS-005,DESTROY,O Humano entre a Morte e a Vida,\"Quanto a destruição, a guerra, a violência e as catástrofes deixam de ser um evento e viram parte da paisagem global cotidiana, há a emergência de um humano apático e um humano \"\"revolucionário\"\".\",A-001;,E-007; E-008;,S-003;\nS-006,CONSUME,Guerra como Conteúdo,\"A câmera que mira na guerra também filma. A guerra também é feita para uma audiência: a imagem do ataque faz parte do ataque. A barreira para que cada ataque se torne conteúdo de mídia e monetizável é apenas ético e moral, e cada vez mais porosa e sob ataque. \",A-001;,E-008;,S-003;\nS-007,CONNECT,Guerra como Paisagem,\"A guerra se torna parte persistente da paisagem. São armas, patrulhas, destroços, câmeras, drones, fios, veículos de duplo uso. Se não há a guerra, há a sensação e a visualização de um pré ou pós guerra contínuo.\",A-001;,E-005; E-007;,S-003;\nS-008,DEFINE,Obsoleto como Reserva Estratégica,\"O obsoleto é redefinido como reserva estratégica: o que foi superado vira repertório disponível para sobreviver em um mundo em guerra, de constante vigilância e alta volatilidade.\",A-001;,E-001;,\nS-009,CREATE,Retorno às Redes Cabeadas,\"Transposição: infraestruturas civis críticas também podem voltar ao cabo, como forma de resiliência e soberania. Menor acesso sem fio permitido em espaços, e maior controle de acessos no nível dos despositivos.\",A-001;,E-001;,S-003;\nS-010,RELATE,A Força do Pensamento de Longa-Temporalidade,\"A capacidade de pensamento e estratégia de longo-prazo da China tem se mostrado sem precedentes, jogando o jogo longo em seus avanços tecnológicos, econômicos, sociais e ambientais.\",A-001;,E-002;,S-003;\nS-011,DEFINE,Guerra como Negócio Lucrativo,\"Os negócios da Guerra estão por toda parte, de forma mais amplamente reconhecida e celebrada.\",A-001;,E-004; E-003; E-002; E-006; E-008;,S-003;\nS-012,CREATE,Engenharia Reversa em Todos Lugares,\"Com a popularização da impressão 3D se juntando à popularização das IAs de alta capacidade computacional, o custo de reprodução de tecnologias físicas e digitais caiu espantosamente. Tudo parece a um passo de ser copiado, recriado, expandido.\",A-001;,E-003; E-004;,S-004;\nS-013,RELATE,Emergência de Grupos Organizados de Enfrentamento,\"Com ameaças reais se avolumando e se aproximando, a emergência de grupos paramilitares, ONGs e coletivos organizados de ação militar, revolucionária e socioeconômica é vibrante e exponencial.\",A-001;,E-003; ,S-003;",
"e": "#,Description,STEEP #1,STEEP #2\nE-001,A guerra eletrônica se espalhou pela frente ucraniana e deixou os drones sem fio vulneráveis.,Tecnologia,\nE-002,\"Fabricantes chineses ofereciam versões de drones com fio às guerras antes da invasão em larga escala, mas não havia procura.\",Tecnologia,Economia\nE-003,\"A Rússia lançou a sua versão de um Drone sem Fio em 2024; depois da repercussão nas redes sociais, um membro de uma rede de apoio à Ucrânia fez engenharia reversa e a DTU (Defense Tech for Ukrayne) viabilizou o primeiro uso ucraniano.\",Tecnologia,Social\nE-004,\"O Drone sem Fio como uma arma simples e barata ameaça alvos muito mais caros e complexos. Ficam em espera ao longo de rotas por até 24h e atacam com cerca de 3 segundos de aviso. Entram em bunkers, trincheiras e áreas cobertas.\",Economia,\nE-005,\"Um morador diz que os mísseis pararam com o cessar-fogo e os drones começaram a vir no lugar deles. Com foguetes há 15s para chegar ao abrigo; com drones não há como saber; \"\"se você foge, ele te segue\"\".\",Social,Político\nE-006,\"A câmera do Drone de guerra permite escolher o alvo pela aparência, por exemplo pelo uniforme.\",Tecnologia,Social\nE-007,\"Na Ucrânia, cabos de fibra óptica para Drones com Fio cobrem campos, florestas e cidades; pássaros os usam em ninhos; animais, pessoas e veículos ficam enredados. Há um medo novo numa comunidade acostumada à guerra.\",Ecologia,Social\nE-008,O Hezbollah divulga vídeos editados dos ataques com trilha dramática; o exército israelense divulga vídeo de um ataque a um operador.,Social,Político"
};

const MARCACAO = "<div class=\"nav\" id=\"navegador\" aria-label=\"Navegador de cartas de sinais\">\n  <div class=\"nav-barra\">\n    <div>\n      <div class=\"versal\" style=\"margin-bottom:8px\">Mostrar</div>\n      <div class=\"sel versal\" id=\"filtro\" role=\"group\" aria-label=\"Filtrar por tipo\">\n        <button data-f=\"todos\" aria-pressed=\"true\"><span class=\"rot\">Todos</span><svg class=\"circ\" viewBox=\"0 0 100 40\" preserveAspectRatio=\"none\"><path d=\"M60 3 C88 2 98 12 97 21 C95 33 70 38 46 37 C20 36 3 30 3 19 C4 8 26 3 52 4 C60 4 66 6 70 9\"/></svg></button>\n        <button data-f=\"act\" aria-pressed=\"false\"><span class=\"rot\">Atos</span><svg class=\"circ\" viewBox=\"0 0 100 40\" preserveAspectRatio=\"none\"><path d=\"M60 3 C88 2 98 12 97 21 C95 33 70 38 46 37 C20 36 3 30 3 19 C4 8 26 3 52 4 C60 4 66 6 70 9\"/></svg></button>\n        <button data-f=\"artifact\" aria-pressed=\"false\"><span class=\"rot\">Artefatos</span><svg class=\"circ\" viewBox=\"0 0 100 40\" preserveAspectRatio=\"none\"><path d=\"M60 3 C88 2 98 12 97 21 C95 33 70 38 46 37 C20 36 3 30 3 19 C4 8 26 3 52 4 C60 4 66 6 70 9\"/></svg></button>\n      </div>\n    </div>\n    <div class=\"busca\">\n      <label class=\"versal\" for=\"busca\" style=\"display:block;margin-bottom:8px\">Buscar</label>\n      <div class=\"busca-campo\">\n        <input id=\"busca\" type=\"search\" autocomplete=\"off\" spellcheck=\"false\"\n          placeholder=\"palavras em cartas, evidências e sinais\" aria-describedby=\"busca-res\">\n        <button type=\"button\" id=\"busca-limpa\" aria-label=\"Limpar busca\" hidden>&times;</button>\n      </div>\n    </div>\n    <div class=\"busca-res\" id=\"busca-res\" aria-live=\"polite\"></div>\n    <div class=\"setas\" role=\"group\" aria-label=\"Navegar cartas\">\n      <button type=\"button\" id=\"ant\" aria-label=\"Carta anterior\"><svg viewBox=\"0 0 18 10\"><path d=\"M17 5H1M5 1L1 5l4 4\"/></svg></button>\n      <button type=\"button\" id=\"prox\" aria-label=\"Próxima carta\"><svg viewBox=\"0 0 18 10\"><path d=\"M1 5h16M13 1l4 4-4 4\"/></svg></button>\n    </div>\n  </div>\n  <div class=\"grade\" id=\"grade\" tabindex=\"0\" aria-label=\"Cartas (use as setas do teclado)\"></div>\n</div>\n\n<section class=\"detalhe\" id=\"detalhe\" hidden aria-live=\"polite\">\n  <article class=\"det-esq\" id=\"det-esq\"></article>\n  <div class=\"det-dir\">\n    <section class=\"det-ev\" id=\"det-ev\" aria-label=\"Evidências\"></section>\n    <section class=\"det-si\" id=\"det-si\" aria-label=\"Sinais\"></section>\n  </div>\n</section>\n\n<!-- Cópia local dos dados: só é usada se a planilha do Google não responder. -->";

function iniciar(HOST) {
const MODO = (HOST.getAttribute("modo") || "completo").toLowerCase();
const DESTINO = HOST.getAttribute("destino") || BASE;
const ROOT = HOST.attachShadow({ mode: "open" });
ROOT.innerHTML = "<style>" + ESTILO + "</style><div class=\"raiz\">" + MARCACAO + "</div>";

/* ================= CONFIG ================= */
// Planilha "Signals Hub" publicada na web (Arquivo → Compartilhar → Publicar na Web → Documento inteiro).
// O site baixa o documento inteiro e reconhece cada aba pelo cabeçalho:
//   atos/artefatos = tem a coluna "A-A" · sinais = tem "verge-type" · evidências = tem "STEEP".
// Os nomes das abas e a ordem delas não importam.
const PLANILHA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT0vB5txcNz0s9xstvw1mBmam9oAt8wp1BblnTIoKb1bUhCV_O-_1nMKfo2CPVD5yk4W54RxhjcewGu/pub";
// CSV por aba: o gid de cada uma (o número após "gid=" na URL publicada). Sem gids, baixa o documento inteiro.
const GIDS = { a: "0", e: "1085151918", s: "1885714069" }; // atos/artefatos · evidências · sinais
const BASE_IMAGENS = "https://gira.guru/lab/signals-hub/assets/images/";
const MAX_ABAS = 5; // depois disso vira [+N], como as abas do Chrome

// Cor de cada domínio VERGE nas abas (paleta do pássaro)
const VERGE = {
  CONNECT: { t: "var(--cobalto)",  m: "cobalto",  nome: "Connect" },  // azul
  CREATE:  { t: "var(--violeta)",  m: "violeta",  nome: "Create" },   // roxo
  CONSUME: { t: "var(--vermelho)", m: "vermelho", nome: "Consume" },  // vermelho
  DEFINE:  { t: "var(--ouro)",     m: "ouro",     nome: "Define" },   // amarelo
  DESTROY: { t: "var(--destroy)",  m: "destroy",  nome: "Destroy", escura: true }, // preto
  RELATE:  { t: "var(--verde)",    m: "verde",    nome: "Relate" },   // verde
};
// STEEP: abreviação e matiz. A cor da carta é o STEEP dominante nas suas evidências.
const STEEP = [
  { re: /^soc/i,  ab: "SOC",  nome: "Social",   matiz: "cobalto" },  // azul
  { re: /^tec/i,  ab: "TEC",  nome: "Tecnologia", matiz: "violeta" }, // roxo
  { re: /^econ/i, ab: "ECON", nome: "Economia", matiz: "vermelho" }, // vermelho
  { re: /^ecol/i, ab: "ECOL", nome: "Ecologia", matiz: "verde" },    // verde
  { re: /^pol/i,  ab: "POL",  nome: "Política", matiz: "ouro" },     // amarelo
];
const steepDe = s => STEEP.find(x => x.re.test(s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()));
function dominante(evid) {
  const n = new Map();
  evid.forEach(e => e.steep.forEach((s, k) => { const d = steepDe(s); if (d) n.set(d, (n.get(d) || 0) + (k === 0 ? 1.01 : 1)); }));
  let best = null; n.forEach((v, d) => { if (!best || v > n.get(best)) best = d; });
  return best;
}

/* ================= CSV ================= */
function parseCSV(txt) {
  const rows = []; let row = [], f = "", q = false;
  txt = txt.replace(/^﻿/, "");
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) {
      if (c === '"') { if (txt[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && txt[i + 1] === "\n") i++;
      row.push(f); f = ""; if (row.some(v => v.trim() !== "")) rows.push(row); row = [];
    } else f += c;
  }
  row.push(f); if (row.some(v => v.trim() !== "")) rows.push(row);
  if (!rows.length) return [];
  const head = rows.shift().map(h => h.trim());
  return rows.map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
}
const lista = s => (s || "").split(/[;,]/).map(x => x.trim()).filter(Boolean);
const col = (obj, re) => { const k = Object.keys(obj).find(k => re.test(k)); return k ? obj[k] : ""; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const local = chave => parseCSV(RESERVA[chave] || "");
const qual = linhas => {
  const k = Object.keys(linhas[0] || {});
  if (k.includes("A-A")) return "a";
  if (k.some(x => /verge/i.test(x))) return "s";
  if (k.some(x => /steep/i.test(x))) return "e";
  return null;
};
function carregaScript(src) {
  return new Promise((ok, erro) => { const t = document.createElement("script"); t.src = src; t.onload = ok; t.onerror = erro; document.head.appendChild(t); });
}
async function carregarTudo() {
  const dados = {};
  try {
    if (GIDS.a && GIDS.s && GIDS.e) {
      // CSV por aba
      await Promise.all(["a", "s", "e"].map(async k => {
        const r = await fetch(`${PLANILHA}?gid=${GIDS[k]}&single=true&output=csv&t=${Date.now()}`, { cache: "no-store" });
        if (!r.ok) throw new Error(r.status); dados[k] = parseCSV(await r.text());
      }));
    } else {
      // documento inteiro (.xlsx): todas as abas de uma vez, sem precisar de gid
      const [r] = await Promise.all([
        fetch(`${PLANILHA}?output=xlsx&t=${Date.now()}`, { cache: "no-store" }),
        window.XLSX ? null : carregaScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"),
      ]);
      if (!r.ok) throw new Error(r.status);
      const wb = XLSX.read(await r.arrayBuffer(), { type: "array" });
      wb.SheetNames.forEach(n => {
        const linhas = parseCSV(XLSX.utils.sheet_to_csv(wb.Sheets[n], { blankrows: false }));
        const k = qual(linhas); if (k && !dados[k]) dados[k] = linhas;
      });
    }
  } catch (e) { console.warn("Planilha do Google indisponível; usando a cópia local.", e); }
  ["a", "s", "e"].forEach(k => { if (!dados[k] || !dados[k].length) dados[k] = local(k); });
  // tira linhas sem código (linhas em branco no fim da planilha)
  ["a", "s", "e"].forEach(k => { dados[k] = dados[k].filter(l => (l["#"] || "").trim()); });
  return dados;
}

/* ================= MODELO ================= */
// Ordem das cartas: primeiro as que têm número na coluna "order" (1, 2, 3…);
// depois as sem número, pelo código A-XXX do maior para o menor (as mais novas primeiro).
function ordenar(cartas) {
  const num = c => { const n = parseFloat(String(c.ordem || "").replace(",", ".")); return isFinite(n) ? n : null; };
  const codN = c => parseInt(String(c.cod).replace(/\D/g, ""), 10) || 0;
  return cartas.sort((x, y) => {
    const a = num(x), b = num(y);
    if (a !== null && b !== null) return a - b || codN(y) - codN(x);
    if (a !== null) return -1;
    if (b !== null) return 1;
    return codN(y) - codN(x);
  });
}
const normal = t => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
let EVID = {}, SIN = {};
function montar(A, S, E) {
  const ev = Object.fromEntries(E.map(e => [e["#"], {
    cod: e["#"], txt: e.Description || "",
    steep: Object.keys(e).filter(k => /steep/i.test(k)).map(k => e[k]).filter(Boolean),
  }]));
  EVID = ev;
  SIN = Object.fromEntries(S.map(s => [s["#"], {
    cod: s["#"], tipo: (s["verge-type"] || "").toUpperCase(), titulo: col(s, /^title/i), texto: s.signal || "",
    arts: lista(col(s, /acts|artifacts/i)), evid: lista(s.evidences), corr: lista(s.correlations),
  }]));
  return A.map((a, i) => {
    const _ev = lista(a.Evidences).map(c => ev[c] || { cod: c, txt: "", steep: [] });
    const dom = dominante(_ev);
    const cod = a["#"];
    const fontes = Object.keys(a).filter(k => /source/i.test(k) && !/image/i.test(k))
      .flatMap(k => a[k].split(/;\s*|\s*\n\s*/)).map(x => x.trim()).filter(Boolean);
    const sinais = S.filter(s => lista(col(s, /acts|artifacts/i)).includes(cod)).map(s => ({
      cod: s["#"], tipo: (s["verge-type"] || "").toUpperCase(), titulo: col(s, /^title/i),
    }));
    const sinaisTxt = S.filter(s => lista(col(s, /acts|artifacts/i)).includes(cod));
    // Índice de busca: tudo do CSV, menos fontes e imagem. Cada parte guarda onde está.
    const partes = [
      ["código", cod], ["tipo", (a["A-A"] || "") + " " + ((a["A-A"] || "").toLowerCase() === "act" ? "ato" : "artefato")],
      ["título", a.Title], ["subtítulo", a.Subtitle], ["descrição", a.Description],
      ..._ev.map(e => [e.cod, [e.cod, e.txt, ...e.steep, ...e.steep.map(x => steepDe(x)?.ab || "")].join(" ")]),
      ...sinaisTxt.map(s => [s["#"], [s["#"], s["verge-type"], col(s, /^title/i), s.signal].join(" ")]),
    ].map(([onde, t]) => ({ onde, t: normal(t || "") }));
    return {
      partes,
      cod, i, tipo: (a["A-A"] || "").toLowerCase(),
      titulo: a.Title, subtitulo: a.Subtitle, desc: a.Description,
      evid: _ev, dom, matiz: dom ? dom.matiz : "rosa",
      fontes, sinais, imagem: a.Image, imagemFonte: a["Image Source"],
      ordem: col(a, /^order$|^ordem$/i),
      outras: lista((a["other-images"] || "").replace(/,/g, ";")),
      outrasFontes: (a["other-images-source"] || "").split(/;\s*|\s*\n\s*/).map(x => x.trim()).filter(Boolean),
    };
  });
}

/* ================= RENDER ================= */
const CIRC = '<svg class="circ" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path d="M60 3 C88 2 98 12 97 21 C95 33 70 38 46 37 C20 36 3 30 3 19 C4 8 26 3 52 4 C60 4 66 6 70 9"/></svg>';

function primeiroBloco(t) {
  const m = t.match(/^[\s\S]*?[.!?:](?=\s|$)/);
  return m ? [m[0], t.slice(m[0].length)] : [t, ""];
}

// Título sempre em duas linhas: corta no espaço que deixa as linhas mais parecidas em tamanho.
// Uma palavra só fica numa linha, no meio do espaço das duas.
// Par da imagem (design system: texto sobre imagem é sempre um par). A imagem se tinge com o fundo do par
// e o título que desce sobre ela usa a fonte: SOC ceu, TEC coroa, ECON lacre, ECOL musgo, POL mel; sem categoria, brasa.
const PAR_IMAGEM = {
  cobalto: ["cobalto-vivo", "ouro"], violeta: ["violeta-tipo", "ouro-vivo"], vermelho: ["vermelho-tinta", "ouro"],
  verde: ["verde-tinta", "verde"], ouro: ["ouro-tipo", "ouro"], rosa: ["rosa-tipo", "ouro"],
};
function duasLinhas(t) {
  const w = (t || "").trim().split(/\s+/); if (w.length < 2) return esc(t || "");
  let melhor = 1, dif = Infinity;
  for (let k = 1; k < w.length; k++) {
    const a = w.slice(0, k).join(" ").length, b = w.slice(k).join(" ").length, d = Math.abs(a - b);
    if (d < dif) { dif = d; melhor = k; }
  }
  return `${esc(w.slice(0, melhor).join(" "))}<br>${esc(w.slice(melhor).join(" "))}`;
}

function htmlCarta(c, onde = []) {
  const lim = innerWidth < 520 ? 3 : MAX_ABAS; // no celular, menos abas cabem
  const vis = c.sinais.slice(0, lim), resto = c.sinais.length - vis.length;
  const abas = vis.map(s => {
    const v = VERGE[s.tipo] || { t: "var(--papel)", nome: s.tipo };
    return `<button class="aba${v.escura ? " escura" : ""}" style="--t:${v.t}" data-area="sinal" data-ref="${esc(s.cod)}"
      data-dica="${esc(s.cod)} · ${esc(v.nome)}" data-titulo="${esc(s.titulo)}"
      aria-label="${esc(s.cod)} · ${esc(v.nome)} · ${esc(s.titulo)}">${esc(s.cod)}</button>`;
  }).join("") + (resto > 0 ? `<button class="aba mais" data-area="sinais" aria-label="Mais ${resto} sinais">[+${resto}]</button>` : "");

  const evs = c.evid.map(e => `<span class="ev"><span class="ev-cod">${esc(e.cod)}</span>${
      e.steep.map(s => { const d = steepDe(s); return `<span class="ev-steep" style="--st:var(--${d ? d.matiz : "papel"})" title="${esc(d ? d.nome : s)}">${esc(d ? d.ab : s)}</span>`; }).join("")}${
      e.txt ? `<span class="ev-txt">${esc(e.txt.length > 90 ? e.txt.slice(0, 88).replace(/\s+\S*$/, "") + "…" : e.txt)}</span>` : ""
    }</span><span class="ev-sep" aria-hidden="true"></span>`).join("");

  const [lead, rest] = primeiroBloco(c.desc || "");
  const ehAto = c.tipo === "act" || c.tipo === "ato";
  const img = c.imagem
    ? `<img src="${esc(BASE_IMAGENS + c.imagem)}" alt="${esc(c.subtitulo || c.titulo)}" loading="lazy" draggable="false"
         data-local="${BASE}img/${esc(c.imagem)}" onerror="ocpImgFalhou(this)">`
    : `<span class="sem">sem imagem</span>`;

  return `
  <article class="carta" style="--i:${c.i};--c:var(--${c.matiz});--cv:var(--${c.matiz}-vivo);--if:var(--${(PAR_IMAGEM[c.matiz] || PAR_IMAGEM.rosa)[0]});--it:var(--${(PAR_IMAGEM[c.matiz] || PAR_IMAGEM.rosa)[1]})" data-cod="${esc(c.cod)}" data-tipo="${ehAto ? "act" : "artifact"}">
    <div class="abas-wrap"><nav class="abas" aria-label="Sinais ligados a ${esc(c.cod)}">${abas}</nav></div>
    <div class="frente">
      <header class="zona cabeco" data-area="ficha" tabindex="0">
        <div class="dados">
          <span class="codigo">${esc(c.cod)}</span>
          <div class="sel" aria-label="Tipo">
            <span class="${ehAto ? "on" : ""}">Ato${CIRC}</span>
            <span class="${ehAto ? "" : "on"}">Artefato${CIRC}</span>
          </div>
        </div>
        <h2 class="titulo${(c.titulo || "").trim().includes(" ") ? "" : " uma"}">${duasLinhas(c.titulo)}</h2>
      </header>
      <figure class="zona imagem" data-area="imagem" tabindex="0">${img}</figure>
      <div class="zona mq" data-area="evidencias" tabindex="0" aria-label="${c.evid.length} evidências. Arraste para os lados.">
        <div class="mq-trilho">${evs}</div>
      </div>
      <div class="zona descricao desc" data-area="descricao" tabindex="0"><p><strong>${esc(lead)}</strong>${esc(rest)}</p></div>
      <footer class="forcas">
        <div class="zona forca fontes" data-par="noite" data-area="fontes" tabindex="0" aria-label="${c.fontes.length} fontes">
          <span class="n">${c.fontes.length}</span><span class="r versal">Fontes</span>
        </div>
        <div class="zona forca sinais" data-par="coroa" data-area="sinais" tabindex="0" aria-label="${c.sinais.length} sinais">
          <span class="n">${c.sinais.length}</span><span class="r versal">Sinais</span>
        </div>
      </footer>
    </div>
    ${onde.length ? `<p class="achado">encontrado em ${onde.map(o => `<b>${esc(o)}</b>`).join(" ")}</p>` : ""}
  </article>`;
}

// Imagem: tenta o servidor da gira; se bloqueado (ex.: prévia), usa a cópia local; senão, mostra o nome do arquivo.
window.ocpImgFalhou = imgFalhou;
function imgFalhou(im) {
  if (im.dataset.local && !im.dataset.tentou) { im.dataset.tentou = 1; im.src = im.dataset.local; return; }
  const s = document.createElement("span"); s.className = "sem" + (im.classList.contains("on") ? " on" : "");
  s.textContent = im.dataset.local.split("/").pop();
  const g = im.closest(".galeria"); if (g) s.dataset.k = [...g.children].indexOf(im);
  im.replaceWith(s);
}

/* ================= MARQUEE ================= */
const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
function ligarMarquee(mq) {
  const tr = mq.querySelector(".mq-trilho");
  const base = tr.innerHTML;
  // repete até cobrir a faixa, depois duplica para o laço
  let n = 1; tr.innerHTML = base;
  while (tr.scrollWidth < mq.clientWidth * 1.2 && n < 12) { tr.innerHTML += base; n++; }
  const unit = tr.innerHTML; tr.innerHTML = unit + unit;
  let w = tr.scrollWidth / 2, x = 0, vel = 0, arr = false, ultimoX = 0, moveu = 0, last = performance.now(), visivel = true;
  const VEL = reduz ? 0 : -38; // px/s
  const wrap = () => { if (x <= -w) x += w; if (x > 0) x -= w; };
  function tick(t) {
    const dt = Math.min(64, t - last) / 1000; last = t;
    if (!arr && visivel) { x += VEL * dt + vel; vel *= 0.94; if (Math.abs(vel) < .02) vel = 0; wrap(); }
    tr.style.transform = `translate3d(${x}px,0,0)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  new IntersectionObserver(es => { visivel = es[0].isIntersecting; }).observe(mq);
  addEventListener("resize", () => { w = tr.scrollWidth / 2; });
  mq.addEventListener("pointerdown", e => { e.stopPropagation(); arr = true; moveu = 0; ultimoX = e.clientX; vel = 0; mq.setPointerCapture(e.pointerId); mq.classList.add("arrastando"); });
  mq.addEventListener("pointermove", e => { if (!arr) return; const dx = e.clientX - ultimoX; ultimoX = e.clientX; moveu += Math.abs(dx); x += dx; vel = dx; wrap(); });
  const solta = () => { arr = false; mq.classList.remove("arrastando"); };
  mq.addEventListener("pointerup", solta); mq.addEventListener("pointercancel", solta);
  mq.addEventListener("click", e => { if (moveu > 4) { e.stopPropagation(); e.preventDefault(); } }, true);
  mq.addEventListener("wheel", e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); x -= e.deltaX; wrap(); } }, { passive: false });
  mq.addEventListener("keydown", e => { if (e.key === "ArrowLeft") { vel = 6; } if (e.key === "ArrowRight") { vel = -6; } });
}

// O cabeço guarda a altura de repouso: no hover o título cresce por cima da imagem, sem empurrar a carta.
// Mede cada linha do título no estilo do hover e devolve o maior tamanho (até 78px) em que todas cabem na carta.
function tamanhoQueCabe(t) {
  const linhas = [...t.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).filter(Boolean);
  if (!linhas.length) return 78;
  let m = ROOT.getElementById("mede-titulo");
  if (!m) { m = document.createElement("span"); m.id = "mede-titulo"; m.setAttribute("aria-hidden", "true");
    m.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font-weight:500;font-size:78px;font-stretch:100%;letter-spacing:-.035em;font-family:var(--grotesca)";
    ROOT.appendChild(m); }
  const maior = Math.max(...linhas.map(l => { m.textContent = l; return m.offsetWidth; }));
  const cabe = t.clientWidth - 2;
  return Math.max(40, Math.min(78, Math.floor(78 * cabe / maior)));
}
function travarCabecos() {
  ROOT.querySelectorAll(".cabeco").forEach(h => {
    h.style.height = ""; h.style.height = h.offsetHeight + "px";
    const t = h.querySelector(".titulo");
    t.style.setProperty("--desce", (h.offsetHeight - t.offsetTop + 14) + "px"); // o título desce para dentro da imagem
    t.style.setProperty("--tam", tamanhoQueCabe(t) + "px"); // no hover, cresce até 78px sem passar da carta
  });
}
addEventListener("resize", travarCabecos);
document.fonts && document.fonts.ready.then(travarCabecos);

/* ================= CARROSSEL ================= */
const grade = ROOT.getElementById("grade");
const passoCarta = () => { const c = grade.querySelector(".carta"); return c ? c.offsetWidth + parseFloat(getComputedStyle(grade).columnGap || 28) : grade.clientWidth; };
function vai(dir) { grade.scrollBy({ left: dir * passoCarta(), behavior: reduz ? "auto" : "smooth" }); }
function setas() {
  const max = grade.scrollWidth - grade.clientWidth - 2;
  ROOT.getElementById("ant").disabled = grade.scrollLeft <= 2;
  ROOT.getElementById("prox").disabled = grade.scrollLeft >= max;
}
ROOT.getElementById("ant").addEventListener("click", () => vai(-1));
ROOT.getElementById("prox").addEventListener("click", () => vai(1));
grade.addEventListener("scroll", () => { setas(); escondeDica && escondeDica(); }, { passive: true });
addEventListener("resize", setas);
grade.addEventListener("keydown", e => {
  if (e.target !== grade) return;
  if (e.key === "ArrowRight") { e.preventDefault(); vai(1); }
  if (e.key === "ArrowLeft") { e.preventDefault(); vai(-1); }
});
// roda do mouse: o vertical vira horizontal enquanto houver cartas para aquele lado
grade.addEventListener("wheel", e => {
  if (e.target.closest(".mq")) return;
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // trackpad já rola na horizontal
  const max = grade.scrollWidth - grade.clientWidth;
  const indo = e.deltaY > 0 ? grade.scrollLeft < max - 1 : grade.scrollLeft > 1;
  if (!indo) return; // no fim, devolve a rolagem para a página
  e.preventDefault(); grade.scrollLeft += e.deltaY;
}, { passive: false });
// arrastar com o mouse (no toque, o navegador já arrasta)
{
  let ini = null, x0 = 0, s0 = 0, moveu = 0, vel = 0, ult = 0;
  grade.addEventListener("pointerdown", e => {
    if (e.pointerType !== "mouse" || e.button !== 0 || e.target.closest(".mq, input, button")) return;
    ini = e.pointerId; x0 = ult = e.clientX; s0 = grade.scrollLeft; moveu = 0; vel = 0;
  });
  addEventListener("pointermove", e => {
    if (ini !== e.pointerId) return;
    const dx = e.clientX - x0; moveu = Math.max(moveu, Math.abs(dx));
    if (moveu > 4 && !grade.classList.contains("arrastando")) grade.classList.add("arrastando");
    if (moveu > 4) { vel = e.clientX - ult; ult = e.clientX; grade.scrollLeft = s0 - dx; }
  });
  const solta = e => {
    if (ini !== e.pointerId) return; ini = null;
    if (grade.classList.contains("arrastando")) {
      const alvo = grade.scrollLeft - vel * 12; // um pouco de inércia, depois o snap pousa
      grade.classList.remove("arrastando");
      grade.scrollTo({ left: alvo, behavior: reduz ? "auto" : "smooth" });
      // engole o clique que viria no fim do arraste
      const engole = ev => { ev.stopPropagation(); ev.preventDefault(); };
      addEventListener("click", engole, { capture: true, once: true });
      setTimeout(() => removeEventListener("click", engole, { capture: true }), 60);
    }
  };
  addEventListener("pointerup", solta); addEventListener("pointercancel", solta);
}

// Aquece a fonte no estado do hover (78px, largura cheia) para a troca não engasgar na primeira vez.
function aquecerFonte() {
  let w = ROOT.getElementById("aquece");
  if (!w) { w = document.createElement("div"); w.id = "aquece"; w.setAttribute("aria-hidden", "true");
    w.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;font:500 78px/.9 var(--grotesca);font-stretch:100%;letter-spacing:-.035em;white-space:nowrap";
    ROOT.appendChild(w); }
  w.textContent = CARTAS.map(c => c.titulo).join(" ") + " AÁÂÃÉÊÍÓÔÕÚÇ aáâãéêíóôõúç 0123456789";
  if (document.fonts) document.fonts.load('500 78px "Instrument Sans"', w.textContent).catch(() => {});
}

/* ================= NAVEGADOR ================= */
let CARTAS = [], FILTRO = "todos", BUSCA = [];
const ehAtoC = c => ["act","ato"].includes(c.tipo);
// todas as palavras precisam aparecer em algum lugar da carta (em partes diferentes, se for o caso)
function bate(c) {
  if (!BUSCA.length) return { ok: true, onde: [] };
  const onde = new Set();
  for (const w of BUSCA) {
    const hits = c.partes.filter(p => p.t.includes(w));
    if (!hits.length) return { ok: false };
    hits.forEach(h => onde.add(h.onde));
  }
  return { ok: true, onde: [...onde] };
}
function desenhar() {
  const g = ROOT.getElementById("grade");
  const achadas = CARTAS.map(c => ({ c, m: bate(c) })).filter(x => x.m.ok);
  const vis = achadas.filter(({ c }) => FILTRO === "todos" || (FILTRO === "act" ? ehAtoC(c) : !ehAtoC(c)));
  g.innerHTML = vis.length ? vis.map(({ c, m }, k) => htmlCarta({ ...c, i: k }, m.onde)).join("")
    : `<p class="vazio">${BUSCA.length ? "Nenhuma carta com essas palavras." : "Nenhuma carta nesta linha ainda."}</p>`;
  const nTot = achadas.length, nAto = achadas.filter(({ c }) => ehAtoC(c)).length, nArt = nTot - nAto;
  ROOT.getElementById("busca-res").textContent = BUSCA.length ? `${nTot} de ${CARTAS.length}` : "";
  const rot = { todos: `${nTot} ${nTot === 1 ? "ato / artefato" : "atos / artefatos"}`,
    act: `${nAto} ${nAto === 1 ? "ato" : "atos"}`, artifact: `${nArt} ${nArt === 1 ? "artefato" : "artefatos"}` };
  ROOT.querySelectorAll("#filtro button").forEach(b => b.querySelector(".rot").textContent = rot[b.dataset.f]);
  g.querySelectorAll(".mq").forEach(ligarMarquee);
  travarCabecos();
  aquecerFonte();
  g.scrollLeft = 0; setas();
}

// Cada área da carta abre a visão completa (próxima etapa). Por ora: hash + evento.
function abrir(cod, area, ref) {
  // o endereço guarda só a carta (#A-001); área e referência escolhem o que fica em foco
  // fora do hub (modo="bloco"), o clique leva para a página completa do hub
  if (MODO !== "completo") { location.href = DESTINO + "#" + encodeURIComponent(cod); return; }
  PEDIDO = { area, ref };
  if (location.hash === "#" + cod) rota(); else location.hash = cod;
}
ROOT.addEventListener("click", e => {
  const z = e.target.closest("[data-area]"); const carta = e.target.closest(".carta");
  if (z && carta) abrir(carta.dataset.cod, z.dataset.area, z.dataset.ref);
});
ROOT.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches(".zona[data-area]")) { e.preventDefault(); e.target.click(); }
});
// dica das abas (fora da aba, porque a aba é recortada)
const dica = Object.assign(document.createElement("div"), { className: "aba-dica" });
ROOT.appendChild(dica);
function mostraDica(a) {
  if (!a || !a.dataset.dica) return;
  dica.innerHTML = `<b>${a.dataset.dica}</b>${a.dataset.titulo}`;
  const r = a.getBoundingClientRect();
  dica.style.left = Math.min(r.left, innerWidth - 300) + "px";
  dica.style.top = (r.top - 8) + "px";
  dica.style.opacity = 1; dica.style.transform = "translateY(-100%)";
}
const escondeDica = () => { dica.style.opacity = 0; dica.style.transform = "translateY(calc(-100% + 4px))"; };
ROOT.addEventListener("pointerover", e => mostraDica(e.target.closest(".aba")));
ROOT.addEventListener("pointerout", e => { if (e.target.closest(".aba")) escondeDica(); });
ROOT.addEventListener("focusin", e => mostraDica(e.target.closest(".aba")));
ROOT.addEventListener("focusout", escondeDica);
addEventListener("scroll", escondeDica, { passive: true });

const campo = ROOT.getElementById("busca"), limpa = ROOT.getElementById("busca-limpa");
let tBusca;
function aplicaBusca() {
  BUSCA = normal(campo.value).split(/\s+/).filter(w => w.length > 0);
  limpa.hidden = !campo.value; desenhar();
}
campo.addEventListener("input", () => { clearTimeout(tBusca); tBusca = setTimeout(aplicaBusca, 160); });
campo.addEventListener("keydown", e => { if (e.key === "Escape") { campo.value = ""; aplicaBusca(); } });
limpa.addEventListener("click", () => { campo.value = ""; aplicaBusca(); campo.focus(); });

ROOT.getElementById("filtro").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  FILTRO = b.dataset.f;
  ROOT.querySelectorAll("#filtro button").forEach(x => x.setAttribute("aria-pressed", x === b));
  desenhar();
});


/* ================= PÁGINA INTERNA ================= */
let DET = null, PEDIDO = null, NAV_Y = 0;
const SETA = '<svg viewBox="0 0 18 10" aria-hidden="true"><path d="M1 5h16M13 1l4 4-4 4"/></svg>';
const SETA_V = '<svg viewBox="0 0 18 10" aria-hidden="true"><path d="M17 5H1M5 1L1 5l4 4"/></svg>';
const dominio = u => { const m = String(u).match(/:\/\/([^\/?#]+)/); return m ? m[1] : u; };
const vergeDe = t => VERGE[t] || { t: "var(--papel)", m: "papel", nome: t || "—" };
const corEv = e => { const d = e.steep.map(steepDe).find(Boolean); return d ? d.matiz : "papel"; };
const n2 = n => String(n).padStart(2, "0");
const pl = (n, um, varios) => `${n2(n)} ${n === 1 ? um : varios}`;

function rota() {
  const cod = decodeURIComponent(location.hash.slice(1));
  const c = CARTAS.find(x => x.cod === cod);
  const nav = ROOT.getElementById("navegador"), det = ROOT.getElementById("detalhe");
  if (!c) {
    if (!det.hidden) { det.hidden = true; nav.hidden = false; scrollTo(0, NAV_Y); travarCabecos(); setas(); }
    DET = null; return;
  }
  if (!nav.hidden) NAV_Y = scrollY;
  const mesma = DET && DET.cod === cod;
  const ped = PEDIDO || {}; PEDIDO = null;
  if (!mesma) DET = { cod, sinal: c.sinais[0]?.cod || null, ev: c.evid[0]?.cod || null };
  if (ped.area === "sinal" && ped.ref) DET.sinal = ped.ref;
  nav.hidden = true; det.hidden = false;
  renderEsq(c); renderSinal(true); renderEvs(false);
  if (!mesma) scrollTo(0, 0);
  const alvo = { fontes: "#fontes", sinais: ".det-si", sinal: ".det-si", evidencias: ".det-ev" }[ped.area];
  if (alvo) requestAnimationFrame(() => ROOT.querySelector(alvo)?.scrollIntoView({ behavior: reduz ? "auto" : "smooth", block: "start" }));
}
if (MODO === "completo") addEventListener("hashchange", rota);

function renderEsq(c) {
  const el = ROOT.getElementById("det-esq");
  el.style.setProperty("--c", `var(--${c.matiz})`); el.style.setProperty("--cv", `var(--${c.matiz}-vivo)`);
  const ehAto = ["act","ato"].includes(c.tipo);
  const [lead, rest] = primeiroBloco(c.desc || "");
  // imagem principal + other-images, trocando de tempos em tempos
  const imgs = [c.imagem, ...c.outras].filter(Boolean);
  const img = imgs.length ? `<div class="galeria" data-n="${imgs.length}">
      ${imgs.map((f, k) => `<img class="${k ? "" : "on"}" src="${esc(BASE_IMAGENS + f)}" alt="${esc(k ? `${c.titulo}, imagem ${k + 1}` : (c.subtitulo || c.titulo))}"
        ${k ? 'loading="lazy"' : ""} data-local="${BASE}img/${esc(f)}" onerror="ocpImgFalhou(this)">`).join("")}
      ${imgs.length > 1 ? `<div class="galeria-pontos" role="group" aria-label="Imagens">${imgs.map((_, k) =>
        `<button type="button" class="${k ? "" : "on"}" data-img="${k}" aria-label="Imagem ${k + 1} de ${imgs.length}" aria-pressed="${!k}"></button>`).join("")}</div>` : ""}
    </div>` : `<span class="sem">sem imagem</span>`;
  const fontesImg = [...new Set([c.imagemFonte, ...c.outrasFontes].filter(Boolean))];
  const link = u => `<li><a href="${esc(u)}" target="_blank" rel="noopener noreferrer"><span>${esc(dominio(u))}</span>${SETA}</a></li>`;
  el.innerHTML = `
    <div class="esq-topo">
      <a class="voltar versal" href="#">${SETA_V}Cartas</a>
      <span class="codigo">${pl(c.evid.length, "evidência", "evidências")} · ${pl(c.sinais.length, "sinal", "sinais")}</span>
    </div>
    <div class="esq-hero">
    <figure class="esq-img">${img}</figure>
    <header class="esq-cab">
      <div class="dados">
        <span class="codigo">${esc(c.cod)}</span>
        <div class="sel versal" aria-label="Tipo" style="font-size:11px">
          <span class="${ehAto ? "on" : ""}" style="padding:5px 10px">Ato${CIRC}</span>
          <span class="${ehAto ? "" : "on"}" style="padding:5px 10px">Artefato${CIRC}</span>
        </div>
      </div>
      <h1 class="esq-titulo">${esc(c.titulo)}</h1>
      ${c.subtitulo ? `<p class="esq-sub">${esc(c.subtitulo)}</p>` : ""}
    </header>
    </div>
    <section class="bloco">
      <div class="bloco-cab"><h2 class="versal">Conexões</h2><span class="codigo">E → S</span></div>
      <div class="mapa" id="mapa">
        <svg id="mapa-svg" aria-hidden="true"></svg>
        <div class="m-col m-e">${c.evid.map(e => `<button class="chip" data-ev="${esc(e.cod)}" style="--t:var(--${corEv(e)})">${esc(e.cod)}</button>`).join("")}</div>
        <div class="m-col m-s">${c.sinais.map(s => { const v = vergeDe(s.tipo);
          return `<button class="chip${v.escura ? " escura" : ""}" data-si="${esc(s.cod)}" style="--t:${v.t}" title="${esc(s.titulo)}">${esc(s.cod)} <small><span>${esc(s.titulo)}</span></small></button>`; }).join("")}</div>
      </div>
    </section>
    <section class="bloco">
      <div class="bloco-cab"><h2 class="versal">Descrição</h2></div>
      <div class="esq-desc"><p><strong>${esc(lead)}</strong>${esc(rest)}</p></div>
    </section>
    <section class="bloco" id="fontes">
      <div class="bloco-cab"><h2 class="versal">Fontes</h2><span class="codigo">${n2(c.fontes.length)}</span></div>
      <ol class="fontes-lista">${c.fontes.map(link).join("")}</ol>
    </section>
    ${fontesImg.length ? `<section class="bloco">
      <div class="bloco-cab"><h2 class="versal">${fontesImg.length === 1 ? "Fonte da imagem" : "Fontes das imagens"}</h2><span class="codigo">${n2(fontesImg.length)}</span></div>
      <ol class="fontes-lista">${fontesImg.map(link).join("")}</ol>
    </section>` : ""}
`;
  desenhaMapa();
  ligarGaleria();
}

let tGaleria = null;
function ligarGaleria() {
  clearInterval(tGaleria);
  const g = ROOT.querySelector("#det-esq .galeria"); if (!g || g.dataset.n < 2) return;
  const imgs = () => [...g.querySelectorAll("img")], pts = [...g.querySelectorAll(".galeria-pontos button")];
  let i = 0, parado = false;
  const vai = k => {
    const lista = imgs(); i = (k + pts.length) % pts.length;
    lista.forEach((im, n) => im.classList.toggle("on", n === i));
    g.querySelectorAll(".sem").forEach((sp, n) => sp.classList.toggle("on", sp.dataset.k == i));
    pts.forEach((b, n) => { b.classList.toggle("on", n === i); b.setAttribute("aria-pressed", n === i); });
  };
  pts.forEach((b, n) => b.addEventListener("click", () => { vai(n); reinicia(); }));
  g.addEventListener("pointerenter", () => parado = true);
  g.addEventListener("pointerleave", () => parado = false);
  const reinicia = () => { clearInterval(tGaleria); if (!reduz) tGaleria = setInterval(() => { if (!parado && !document.hidden) vai(i + 1); }, 4500); };
  reinicia();
}

const roMapa = new ResizeObserver(() => desenhaMapa());
function desenhaMapa() {
  const m = ROOT.getElementById("mapa"); if (!m || !DET) return;
  roMapa.observe(m);
  const c = CARTAS.find(x => x.cod === DET.cod), svg = ROOT.getElementById("mapa-svg"), R0 = m.getBoundingClientRect();
  const pos = (sel, lado) => { const el = m.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect();
    return { x: (lado === "d" ? r.right : r.left) - R0.left, y: r.top + r.height / 2 - R0.top }; };
  const nomes = new Set(c.sinais.map(s => s.cod));
  let d = "";
  c.sinais.forEach(s => {
    const S = SIN[s.cod]; if (!S) return;
    S.evid.forEach(e => {
      const a = pos(`[data-ev="${e}"]`, "d"), b = pos(`[data-si="${s.cod}"]`, "e"); if (!a || !b) return;
      const mx = (a.x + b.x) / 2, on = e === DET.ev || s.cod === DET.sinal;
      d += `<path class="${on ? "on" : ""}" data-e="${e}" data-s="${s.cod}" d="M${a.x} ${a.y}C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}"/>`;
    });
    S.corr.filter(o => nomes.has(o)).forEach(o => {
      const a = pos(`[data-si="${s.cod}"]`, "d"), b = pos(`[data-si="${o}"]`, "d"); if (!a || !b) return;
      const x = Math.max(a.x, b.x) + 18 + Math.min(34, Math.abs(a.y - b.y) / 8), on = s.cod === DET.sinal || o === DET.sinal;
      d += `<path class="corr${on ? " on" : ""}" data-s="${s.cod}" d="M${a.x} ${a.y}C${x} ${a.y} ${x} ${b.y} ${b.x} ${b.y}"/>`;
    });
  });
  svg.innerHTML = d;
  m.querySelectorAll("[data-ev]").forEach(b => b.classList.toggle("on", b.dataset.ev === DET.ev));
  m.querySelectorAll("[data-si]").forEach(b => b.classList.toggle("on", b.dataset.si === DET.sinal));
}

function renderEvs(flip) {
  const c = CARTAS.find(x => x.cod === DET.cod), box = ROOT.getElementById("det-ev");
  const antes = {}; if (flip) box.querySelectorAll(".evc").forEach(e => antes[e.dataset.ev] = e.getBoundingClientRect().top);
  const ordem = [...c.evid].sort((a, b) => (b.cod === DET.ev) - (a.cod === DET.ev)); // a evidência em foco sobe
  box.innerHTML = `<div class="det-rot"><h2 class="versal">Evidências</h2><span class="codigo">${n2(c.evid.length)}</span></div>
    <div class="evs">${ordem.map(e => { const m = corEv(e), on = e.cod === DET.ev;
      return `<button class="evc${on ? " on" : ""}${on && m === "cobalto" ? " claro" : ""}" data-ev="${esc(e.cod)}" aria-expanded="${on}"
        style="--c:var(--${m});--cv:var(--${m}-vivo)">
        <span class="evc-aba">${esc(e.cod)}</span>
        <span class="evc-corpo">
          <span class="evc-steeps">${e.steep.map(x => { const d = steepDe(x); return `<span style="--st:var(--${d ? d.matiz : "papel"})" title="${esc(d ? d.nome : x)}">${esc(d ? d.ab : x)}</span>`; }).join("")}</span>
          <span class="evc-txt">${esc(e.txt)}</span>
        </span></button>`; }).join("")}</div>`;
  if (flip && !reduz) box.querySelectorAll(".evc").forEach(e => {
    const t0 = antes[e.dataset.ev]; if (t0 == null) return;
    const dy = t0 - e.getBoundingClientRect().top; if (!dy) return;
    e.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: 700, easing: "cubic-bezier(0.7,0,0.2,1)" });
  });
}

function renderSinal(entra) {
  const c = CARTAS.find(x => x.cod === DET.cod), box = ROOT.getElementById("det-si");
  const S = SIN[DET.sinal];
  // guarda onde a faixa de abas estava, para não recomeçar do zero a cada clique
  const xAntes = box.dataset.cod === DET.cod ? (box.querySelector(".si-abas")?.scrollLeft ?? 0) : 0;
  box.dataset.cod = DET.cod;
  const abas = c.sinais.map(s => { const v = vergeDe(s.tipo);
    return `<button class="aba${v.escura ? " escura" : ""}${s.cod === DET.sinal ? " on" : ""}" style="--t:${v.t}" data-si="${esc(s.cod)}"
      aria-pressed="${s.cod === DET.sinal}" data-dica="${esc(s.cod)} · ${esc(v.nome)}" data-titulo="${esc(s.titulo)}">${esc(s.cod)}</button>`; }).join("");
  if (!S) { box.innerHTML = `<div class="det-rot"><h2 class="versal">Sinais</h2></div><p class="vazio">Nenhum sinal ligado ainda.</p>`; return; }
  const v = vergeDe(S.tipo);
  const chipA = a => { const ok = CARTAS.some(x => x.cod === a);
    return `<button class="chip contorno${a === DET.cod ? " on" : ""}${ok ? "" : " fora"}" data-art="${esc(a)}" ${ok ? "" : "disabled"}>${esc(a)}</button>`; };
  const chipE = e => { const ev = EVID[e];
    return `<button class="chip${e === DET.ev ? " on" : ""}" data-ev="${esc(e)}" style="--t:var(--${ev ? corEv(ev) : "papel"})">${esc(e)}</button>`; };
  const chipS = o => { const vv = vergeDe(SIN[o]?.tipo);
    return `<button class="chip${vv.escura ? " escura" : ""}" data-si="${esc(o)}" style="--t:${vv.t}" title="${esc(SIN[o]?.titulo || "")}">${esc(o)}</button>`; };
  box.innerHTML = `
    <div class="det-rot"><h2 class="versal">Sinais</h2><span class="codigo">${n2(c.sinais.length)}</span></div>
    <nav class="si-abas" aria-label="Sinais desta carta">${abas}</nav>
    <article class="si-card${entra ? " entra" : ""}" style="--c:var(--${v.m});--cv:var(--${v.m}-vivo)">
      <div class="si-faixas${v.escura ? " escura" : ""}">
        <div class="topo"><span class="versal">${esc(v.nome)}</span><span class="codigo">${esc(S.cod)}</span></div>
        <i></i><i></i><i></i>
      </div>
      <div class="si-corpo">
        <h2 class="si-titulo">${esc(S.titulo)}</h2>
        <dl class="ficha">
          <div><dt class="versal">${S.arts.length === 1 ? "Ato / artefato" : "Atos / artefatos"}</dt><dd>${S.arts.map(chipA).join("")}</dd></div>
          ${S.evid.length ? `<div><dt class="versal">Evidências</dt><dd>${S.evid.map(chipE).join("")}</dd></div>` : ""}
          ${S.corr.length ? `<div><dt class="versal">Correlações</dt><dd>${S.corr.map(chipS).join("")}</dd></div>` : ""}
        </dl>
        <p class="si-texto">${esc(S.texto)}</p>
      </div>
    </article>
    ${navSinal(c)}`;
  mostraAba(xAntes);
}

// a faixa só corre se a aba em foco sair da área visível (com 15% de folga), e só o necessário
function mostraAba(xAntes) {
  const box = ROOT.querySelector(".si-abas"), a = box && box.querySelector(".aba.on"); if (!box) return;
  box.scrollLeft = xAntes || 0;
  if (!a) return;
  const folga = box.clientWidth * 0.15, x = box.scrollLeft;
  const ini = a.offsetLeft - folga, fim = a.offsetLeft + a.offsetWidth + folga - box.clientWidth;
  let alvo = null;
  if (ini < x) alvo = ini; else if (fim > x) alvo = fim;
  if (alvo !== null) box.scrollTo({ left: Math.max(0, alvo), behavior: reduz ? "auto" : "smooth" });
}
function navSinal(c) {
  const i = c.sinais.findIndex(s => s.cod === DET.sinal), n = c.sinais.length;
  const ant = c.sinais[i - 1], prox = c.sinais[i + 1];
  return `<div class="si-nav">
    <button type="button" data-si="${ant ? esc(ant.cod) : ""}" ${ant ? "" : "disabled"} aria-label="Sinal anterior">${SETA_V}${ant ? esc(ant.cod) : "Início"}</button>
    <span class="codigo">${i >= 0 ? n2(i + 1) : "—"} / ${n2(n)}</span>
    <button type="button" data-si="${prox ? esc(prox.cod) : ""}" ${prox ? "" : "disabled"} aria-label="Próximo sinal">${prox ? esc(prox.cod) : "Fim"}${SETA}</button>
  </div>`;
}
// abas dos sinais: dá para puxar com o mouse (no toque, o navegador já arrasta)
{
  let ini = null, x0 = 0, s0 = 0, moveu = 0, box = null;
  ROOT.getElementById("detalhe").addEventListener("pointerdown", e => {
    box = e.target.closest(".si-abas"); if (!box || e.pointerType !== "mouse" || e.button !== 0) return;
    ini = e.pointerId; x0 = e.clientX; s0 = box.scrollLeft; moveu = 0;
  });
  addEventListener("pointermove", e => {
    if (ini !== e.pointerId) return;
    const dx = e.clientX - x0; moveu = Math.max(moveu, Math.abs(dx));
    if (moveu > 4) { box.classList.add("arrastando"); box.scrollLeft = s0 - dx; }
  });
  const solta = e => {
    if (ini !== e.pointerId) return; ini = null;
    if (box.classList.contains("arrastando")) {
      box.classList.remove("arrastando");
      const engole = ev => { ev.stopPropagation(); ev.preventDefault(); };
      addEventListener("click", engole, { capture: true, once: true });
      setTimeout(() => removeEventListener("click", engole, { capture: true }), 60);
    }
  };
  addEventListener("pointerup", solta); addEventListener("pointercancel", solta);
  // roda do mouse vertical também corre as abas
  ROOT.getElementById("detalhe").addEventListener("wheel", e => {
    const b = e.target.closest(".si-abas"); if (!b || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault(); b.scrollLeft += e.deltaY;
  }, { passive: false });
}

// setas do teclado trocam de sinal quando o foco está nas abas
ROOT.getElementById("detalhe").addEventListener("keydown", e => {
  if (!e.target.closest(".si-abas, .si-nav") || !DET) return;
  const c = CARTAS.find(x => x.cod === DET.cod), i = c.sinais.findIndex(s => s.cod === DET.sinal);
  const k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!k) return;
  const nx = c.sinais[i + k]; if (!nx) return; e.preventDefault(); escolheSinal(nx.cod);
  ROOT.querySelector(`.si-abas .aba[data-si="${nx.cod}"]`)?.focus({ preventScroll: true });
});
// título longo de sinal no mapa: corre dentro do bloco ao passar o mouse
ROOT.getElementById("detalhe").addEventListener("pointerover", e => {
  const ch = e.target.closest(".mapa .m-s .chip"); if (!ch || ch.classList.contains("corre")) return;
  const sm = ch.querySelector("small"), sp = sm && sm.querySelector("span"); if (!sp) return;
  const falta = sp.scrollWidth - sm.clientWidth;
  if (falta <= 2) { ch.classList.add("cabe"); return; }
  ch.style.setProperty("--desloc", -falta - 6 + "px");
  ch.style.setProperty("--dur", Math.max(500, falta * 22) + "ms");
  ch.classList.add("corre");
});
ROOT.getElementById("detalhe").addEventListener("pointerout", e => {
  const ch = e.target.closest(".mapa .m-s .chip"); if (!ch || ch.contains(e.relatedTarget)) return;
  ch.style.setProperty("--dur", "300ms"); ch.classList.remove("corre");
});

function escolheEv(e) {
  if (!EVID[e]) return;
  const c = CARTAS.find(x => x.cod === DET.cod);
  if (!c.evid.some(x => x.cod === e)) c.evid.push(EVID[e]);
  DET.ev = e; renderEvs(true); renderSinal(false); desenhaMapa();
  const box = ROOT.getElementById("det-ev");
  if (matchMedia("(max-width:900px)").matches) box.scrollIntoView({ behavior: reduz ? "auto" : "smooth", block: "start" });
  else box.scrollTo({ top: 0, behavior: reduz ? "auto" : "smooth" });
}
function escolheSinal(s) {
  if (!SIN[s] || s === DET.sinal) return;
  DET.sinal = s; renderSinal(true); desenhaMapa();
  const box = ROOT.getElementById("det-si");
  if (matchMedia("(max-width:900px)").matches) box.scrollIntoView({ behavior: reduz ? "auto" : "smooth", block: "start" });
  else box.scrollTo({ top: 0 });
}
ROOT.getElementById("detalhe").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b || b.disabled) return;
  if (b.dataset.art) { if (b.dataset.art !== DET.cod) { PEDIDO = null; location.hash = b.dataset.art; } return; }
  if (b.dataset.si) {
    const lado = b.closest(".si-nav") ? (b.getAttribute("aria-label") === "Próximo sinal" ? "Próximo sinal" : "Sinal anterior") : null;
    escolheSinal(b.dataset.si);
    if (lado) ROOT.querySelector(`.si-nav [aria-label="${lado}"]:not(:disabled)`)?.focus({ preventScroll: true });
    return;
  }
  if (b.dataset.ev) return escolheEv(b.dataset.ev);
});
// passar o mouse num nó do mapa acende as suas linhas
ROOT.getElementById("detalhe").addEventListener("pointerover", e => {
  const b = e.target.closest(".mapa .chip"); const svg = ROOT.getElementById("mapa-svg"); if (!svg) return;
  svg.querySelectorAll("path").forEach(p => p.classList.toggle("on", b
    ? (b.dataset.ev ? p.dataset.e === b.dataset.ev : p.dataset.s === b.dataset.si || p.dataset.e && SIN[b.dataset.si]?.evid.includes(p.dataset.e) && p.dataset.s === b.dataset.si)
    : (p.dataset.e === DET.ev || p.dataset.s === DET.sinal)));
});

carregarTudo().then(({ a: A, s: S, e: E }) => {
  CARTAS = ordenar(montar(A, S, E));
  desenhar();
  if (MODO === "completo") rota();
});

}

class OcpSinais extends HTMLElement {
  connectedCallback() { if (this.shadowRoot) return; iniciar(this); }
}
if (!customElements.get("ocp-sinais")) customElements.define("ocp-sinais", OcpSinais);
})();
