/* ===== 7b. Importi riservati =====
   Un pulsante in alto a destra, uguale su ogni pagina, sfoca tutte le cifre in euro: utile quando la pagina
   si mostra ad altri. Ogni testo che entra nella pagina passa da marcaSoldi, così non serve ricordarsene
   nelle singole viste. I grafici di importi si dichiarano con grafico(..., { soldi: true }).
   La scelta vale per questo dispositivo e resta anche dopo il blocco. */
const CHIAVE_RISERVATO = 'archivio-riservato';
const RE_SOLDI = /[-−+]?\d{1,3}(?:\.\d{3})*(?:,\d+)?\s?€/g;
const NON_TOCCARE = 'option, select, textarea, script, style, svg, title, .soldi';
const riservato = () => document.documentElement.classList.contains('riservato');

function marcaSoldi(radice) {
  if (!radice || !(radice.nodeType === 1 || radice.nodeType === 11)) return;
  const w = document.createTreeWalker(radice, NodeFilter.SHOW_TEXT, {
    acceptNode: n => (n.nodeValue.includes('€') && n.parentElement && !n.parentElement.closest(NON_TOCCARE) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const nodi = []; while (w.nextNode()) nodi.push(w.currentNode);
  for (const n of nodi) {
    const t = n.nodeValue; let ultimo = 0, m, pezzi = [];
    RE_SOLDI.lastIndex = 0;
    while ((m = RE_SOLDI.exec(t))) { pezzi.push(t.slice(ultimo, m.index), h('span', { class: 'soldi' }, m[0])); ultimo = RE_SOLDI.lastIndex; }
    if (!pezzi.length) continue;
    pezzi.push(t.slice(ultimo));
    n.replaceWith(...pezzi.filter(p => p !== ''));
  }
}
new MutationObserver(l => { for (const r of l) for (const n of r.addedNodes) marcaSoldi(n.nodeType === 3 ? n.parentElement : n); })
  .observe(document.body, { childList: true, subtree: true });

function impostaRiservato(si) {
  document.documentElement.classList.toggle('riservato', si);
  try { if (si) localStorage.setItem(CHIAVE_RISERVATO, '1'); else localStorage.removeItem(CHIAVE_RISERVATO); } catch (e) { /* memoria del browser non disponibile: vale fino alla chiusura */ }
  const b = $('#riservato'); if (b) b.replaceWith(pulsanteRiservato());
}
try { if (localStorage.getItem(CHIAVE_RISERVATO)) document.documentElement.classList.add('riservato'); } catch (e) { /* idem */ }

function iconaOcchio(chiuso) {
  return s('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    s('path', { d: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z' }), s('circle', { cx: 12, cy: 12, r: 3 }),
    chiuso ? s('path', { d: 'M3 3l18 18' }) : null);
}
function pulsanteRiservato() {
  const si = riservato(), testo = si ? 'Mostra gli importi' : 'Nascondi gli importi';
  return h('button', { id: 'riservato', type: 'button', class: 'btn piatto occhio' + (si ? ' attivo' : ''), 'aria-pressed': si ? 'true' : 'false', 'aria-label': testo, title: testo, onclick: () => impostaRiservato(!riservato()) },
    iconaOcchio(si), h('span', { class: 'occhio-testo' }, si ? 'Importi nascosti' : 'Nascondi importi'));
}
