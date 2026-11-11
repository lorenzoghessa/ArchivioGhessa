/* ===== 8d. Traguardi =====
   Ogni traguardo ha un valore di oggi, un obiettivo e uno stato: in linea, vicino, fuori, senza dati.
   Li calcola Claude dai dati dell'archivio e li riscrive a ogni verifica: qui si mostrano soltanto.
   Nel quadro generale una riga per cartella, che si apre; in ogni cartella l'elenco completo con il modo di misurarli. */
const STATO_TRAGUARDO = { fuori: ['ritardo', 'Fuori strada'], 'senza dati': ['vuota', 'Senza dati'], vicino: ['vuota', 'Vicino'], 'in linea': ['ok', 'In linea'] };
const ORDINE_STATO = Object.keys(STATO_TRAGUARDO);
const traguardiDi = idArea => voci(idArea, 'traguardo').sort((a, b) => ORDINE_STATO.indexOf(a.stato) - ORDINE_STATO.indexOf(b.stato) || (a.ordine ?? 99) - (b.ordine ?? 99));
const contaStati = l => ORDINE_STATO.map(s => [s, l.filter(v => v.stato === s).length]).filter(([, n]) => n);
const NOME_STATI = { fuori: n => 'fuori strada', 'senza dati': n => 'senza dati', vicino: n => (n === 1 ? 'vicino' : 'vicini'), 'in linea': n => 'in linea' };
const testoStati = l => contaStati(l).map(([s, n]) => `${n} ${NOME_STATI[s](n)}`).join(', ');
function rigaTraguardo(v, conNota) {
  const [tipo, nome] = STATO_TRAGUARDO[v.stato] || ['vuota', v.stato || ''];
  return h('li', { class: 'traguardo' },
    h('div', { class: 'tra' }, h('strong', {}, v.titolo), stato(tipo, nome)),
    h('div', { class: 'elenco-nota' }, h('span', { class: 'num' }, v.valore == null ? '' : String(v.valore)), v.obiettivo ? h('span', { class: 'attenuato' }, ` · traguardo: ${v.obiettivo}`) : null),
    typeof v.avanzamento === 'number' ? h('span', { class: 'traguardo-pista' }, h('span', { class: 'traguardo-barra ' + tipo, style: `width:${Math.max(2, Math.min(100, v.avanzamento))}%` })) : null,
    conNota && v.nota ? h('div', { class: 'attenuato piccolo testo-lungo' }, v.nota) : null);
}
function pannelloTraguardi(idArea) {
  const l = traguardiDi(idArea); if (!l.length) return null;
  const agg = l.reduce((m, v) => ((v.data || '') > m ? v.data : m), '');
  return h('section', { class: 'pannello traguardi-pannello' }, h('h2', {}, 'Traguardi'),
    h('p', { class: 'attenuato piccolo' }, `${testoStati(l)}. Calcolati da Claude sui tuoi dati` + (agg ? `, aggiornati il ${fmtData(agg)}.` : '.')),
    h('ul', { class: 'elenco traguardi' }, l.map(v => rigaTraguardo(v, true))));
}
function traguardiCasa() {
  const gruppi = aree().map(a => [a, traguardiDi(a.id)]).filter(([, l]) => l.length);
  if (!gruppi.length) return null;
  const tutti = gruppi.flatMap(([, l]) => l);
  return h('section', { class: 'pannello traguardi-pannello' }, h('h2', {}, 'Traguardi'),
    h('div', { class: 'dati' }, contaStati(tutti).map(([s, n]) => dato(STATO_TRAGUARDO[s][1], n, '', s === 'fuori' ? 'allerta' : ''))),
    gruppi.map(([a, l]) => h('details', { class: 'traguardi-gruppo' },
      h('summary', {}, h('strong', {}, a.nome), h('span', { class: 'attenuato' }, ` ${testoStati(l)}`)),
      h('ul', { class: 'elenco traguardi' }, l.map(v => rigaTraguardo(v, false))),
      h('p', { class: 'piccolo' }, h('a', { href: '#/a/' + a.id }, 'Come si misurano, nella cartella')))));
}
