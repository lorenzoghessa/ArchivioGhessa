/* ===== 8c. Compiti e aggiornamenti: la zona dove Lorenzo scrive e Claude legge =====
   In ogni cartella. Un compito ha un titolo, chi lo fa (Lorenzo o Claude), lo stato e una serie di aggiornamenti
   scritti da entrambi. Claude li legge con `strumenti/archivio.py compiti` e risponde con `archivio.py aggiorna`. */
const CHIUSI = ['fatto', 'annullato'];
const aperto = v => !CHIUSI.includes(v.stato);
const ultimoDi = (v, chi) => (v.aggiornamenti || []).filter(x => !chi || x.chi === chi).reduce((m, x) => ((x.quando || '') > (m.quando || '') ? x : m), {});
/* Da leggere per Claude: mai letto, oppure Lorenzo ha scritto dopo l'ultima lettura (anche se poi l'ha chiuso). */
const daLeggere = v => !v.letto || (ultimoDi(v, 'Lorenzo').quando || '') > v.letto;
/* Risposta nuova: l'ultimo a scrivere è stato Claude, negli ultimi 3 giorni. */
const rispostaNuova = v => { const u = ultimoDi(v); return u.chi === 'Claude' && giorniDa(u.quando || '2000-01-01') <= 3; };
const scaduto = v => aperto(v) && v.scadenza && v.scadenza < oggi();
function ordinaCompiti(l) {
  return [...l].sort((a, b) => (+a.priorita || 9) - (+b.priorita || 9) || (a.scadenza || '9999').localeCompare(b.scadenza || '9999') || (b.creato || '').localeCompare(a.creato || ''));
}
/* Nella cartella Lavoro i compiti collegati alle cose da fare di Claudio stanno sotto la loro riga. */
const compitiAperti = idArea => ordinaCompiti(voci(idArea, 'compito').filter(v => aperto(v) && !(idArea === 'lavoro' && /^c-\d+/.test(v.rif || ''))));

function scriviAggiornamento(v, testo, campi = {}) {
  const t = (testo || '').trim() || (campi.stato === 'fatto' ? 'Segnato come fatto.' : '');
  const nuovo = { ...v, ...campi, aggiornamenti: [...(v.aggiornamenti || [])] };
  if (t) nuovo.aggiornamenti.push({ quando: adesso(), chi: 'Lorenzo', testo: t });
  metti(nuovo);
}
function nuovoCompito(idArea, testo, chi, scadenza, extra = {}) {
  let t = (testo || '').trim(); if (!t) return null;
  let [titolo, ...resto] = t.split(/\r?\n/);
  titolo = titolo.trim();
  if (titolo.length > 140) { const taglio = titolo.lastIndexOf(' ', 130); resto.unshift(titolo.slice(taglio > 60 ? taglio + 1 : 130)); titolo = titolo.slice(0, taglio > 60 ? taglio : 130) + '…'; }
  return metti({ area: idArea, tipo: 'compito', persona: personaPredefinita(), data: oggi(), titolo, nota: resto.join('\n').trim() || undefined,
    chi: chi || 'Claude', stato: 'da fare', scadenza: scadenza || undefined, aggiornamenti: [], ...extra });
}

const testoQuando = iso => { const g = giorniDa(iso || ''); return g <= 0 ? 'oggi ' + new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : g === 1 ? 'ieri' : fmtData(iso); };
const rigaAggiornamento = x => h('li', { class: 'agg-voce' + (x.chi === 'Claude' ? ' da-claude' : '') }, h('span', { class: 'agg-chi' }, `${x.chi}, ${testoQuando(x.quando)}`), h('span', { class: 'testo-lungo' }, x.testo));

/* Casella per scrivere: un aggiornamento su un compito esistente, oppure il primo messaggio di un compito collegato. */
function casellaScrivi(etichetta, invia, conFatto) {
  const ta = h('textarea', { rows: 2, 'aria-label': etichetta, placeholder: 'Scrivi qui…' });
  const manda = fatto => { const t = ta.value.trim(); if (!t && !fatto) { ta.focus(); return; } invia(t, fatto); avviso(fatto ? 'Segnato come fatto.' : 'Aggiornamento salvato.'); };
  return h('details', { class: 'scrivi' }, h('summary', {}, etichetta), ta,
    h('div', { class: 'azioni stretta' }, btn('Invia', () => manda(false), 'primario piccolo'), conFatto ? btn('Invia e segna fatto', () => manda(true), 'piccolo') : null));
}

function voceCompito(idArea, v, conArea) {
  const agg = v.aggiornamenti || [], u = agg[agg.length - 1];
  const meta = [conArea ? (area(idArea) || {}).nome : '', v.chi === 'Lorenzo' ? 'per te' : 'per Claude', v.stato !== 'da fare' ? v.stato : '', v.scadenza ? 'entro il ' + fmtData(v.scadenza) : ''].filter(Boolean).join(', ');
  const segno = scaduto(v) ? stato('ritardo', v.titolo) : rispostaNuova(v) ? stato('ok', v.titolo) : stato('vuota', v.titolo);
  return h('li', { class: 'compito' },
    h('div', { class: 'tra' }, h('a', { href: '#', class: 'compito-titolo', onclick: e => { e.preventDefault(); apriModulo(idArea, 'compito', v); } }, segno), h('span', { class: 'attenuato piccolo' }, meta)),
    v.nota ? h('div', { class: 'elenco-nota testo-lungo' }, v.nota) : null,
    u ? h('ul', { class: 'agg' }, agg.length > 1 ? h('li', { class: 'attenuato piccolo' }, h('details', { class: 'storia' }, h('summary', {}, `Aggiornamenti precedenti (${agg.length - 1})`), h('ul', { class: 'agg' }, agg.slice(0, -1).map(rigaAggiornamento)))) : null, rigaAggiornamento(u)) : null,
    h('div', { class: 'compito-stato attenuato piccolo' }, daLeggere(v) ? 'Claude non l\'ha ancora letto' : v.letto ? 'Letto da Claude ' + testoQuando(v.letto) : ''),
    casellaScrivi('Scrivi un aggiornamento', (t, fatto) => scriviAggiornamento(v, t, fatto ? { stato: 'fatto' } : {}), true));
}

function moduloNuovoCompito(idArea) {
  const ta = h('textarea', { rows: 3, 'aria-label': 'Nuovo compito o aggiornamento', placeholder: 'Scrivi un compito, una richiesta o un aggiornamento. La prima riga diventa il titolo.' });
  const chi = h('select', { 'aria-label': 'Chi lo fa' }, h('option', { value: 'Claude' }, 'Per Claude'), h('option', { value: 'Lorenzo' }, 'Per me'));
  const entro = h('input', { type: 'date', 'aria-label': 'Entro il' });
  return h('div', { class: 'nuovo-compito' }, ta,
    h('div', { class: 'azioni stretta' }, chi, h('label', { class: 'attenuato piccolo entro' }, 'Entro il ', entro),
      btn('Aggiungi', () => { if (!ta.value.trim()) { ta.focus(); return; } nuovoCompito(idArea, ta.value, chi.value, entro.value); avviso('Compito aggiunto: Claude lo legge alla prossima lettura.'); }, 'primario')));
}

function pannelloCompiti(idArea) {
  const l = compitiAperti(idArea), chiusi = voci(idArea, 'compito').filter(v => !aperto(v)).length;
  const attesa = l.filter(daLeggere).length;
  return h('section', { class: 'pannello compiti', id: 'compiti' }, h('h2', {}, 'Compiti e aggiornamenti'),
    h('p', { class: 'attenuato piccolo' }, 'Scrivi qui cosa fare o cosa è cambiato: Claude lo legge a ogni passaggio e risponde sotto ogni voce.' + (attesa ? ` Da leggere: ${attesa}.` : '')),
    moduloNuovoCompito(idArea),
    l.length ? h('ul', { class: 'elenco compiti-elenco' }, l.map(v => voceCompito(idArea, v))) : h('p', { class: 'attenuato' }, 'Nessun compito aperto.'),
    chiusi ? h('p', { class: 'attenuato piccolo' }, h('a', { href: `#/a/${idArea}/compito` }, chiusi === 1 ? '1 compito chiuso' : `${chiusi} compiti chiusi`)) : null);
}

/* Quadro generale: i compiti di tutte le cartelle in un colpo d'occhio. */
function compitiCasa() {
  const tutti = aree().flatMap(a => voci(a.id, 'compito').filter(aperto).map(v => [a.id, v]));
  const claudio = coseClaudio();
  if (!tutti.length && !claudio.length) return null;
  const miei = ordinaCompiti(tutti.filter(([, v]) => v.chi === 'Lorenzo').map(([, v]) => v));
  const risposte = tutti.filter(([, v]) => rispostaNuova(v)), attesa = tutti.filter(([, v]) => daLeggere(v)).length;
  const elenco = [...risposte.map(([, v]) => v), ...miei.filter(v => !rispostaNuova(v))].slice(0, 8);
  return pannello('Compiti',
    h('div', { class: 'dati' },
      dato('Da fare per te', miei.length, miei.some(scaduto) ? `${miei.filter(scaduto).length} in ritardo` : 'compiti aperti', miei.some(scaduto) ? 'allerta' : ''),
      dato('Risposte di Claude', risposte.length, 'negli ultimi 3 giorni'),
      dato('Da leggere per Claude', attesa, 'scritti da te')),
    elenco.length ? h('ul', { class: 'elenco compiti-elenco' }, elenco.map(v => voceCompito(v.area, v, true))) : null,
    claudio.length ? h('p', { class: 'attenuato piccolo' }, h('a', { href: '#/a/lavoro' }, `${claudio.length} cose di lavoro aperte nell'elenco di Claudio`)) : null);
}

/* --- Cose da fare di Claudio (lavoro/stato/cose-da-fare.md): sola lettura, con la casella per scrivergli --- */
function leggiTabellaMd(testo, titoloSezione) {
  const righe = (testo || '').split(/\r?\n/);
  let i = righe.findIndex(r => r.trim().toLowerCase() === '## ' + titoloSezione.toLowerCase());
  if (i < 0) return [];
  const tab = [];
  for (i++; i < righe.length && !/^##\s/.test(righe[i]); i++) if (righe[i].trim().startsWith('|')) tab.push(righe[i].trim().replace(/^\||\|$/g, '').split('|').map(x => x.trim()));
  if (tab.length < 2) return [];
  const testa = tab[0].map(x => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''));
  return tab.slice(1).filter(r => !r.every(x => /^:?-+:?$/.test(x))).map(r => Object.fromEntries(testa.map((k, j) => [k, r[j] || ''])));
}
const dataIt = t => { const m = (t || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m ? isoData(+m[3], +m[2], +m[1]) : ''; };
function coseClaudio() {
  const t = S.est && S.est.coseDaFare && S.est.coseDaFare.testo;
  return leggiTabellaMd(t, 'Aperte').filter(r => /^c-\d+/.test(r.id || '')).map(r => ({ ...r, entro: dataIt(r.scadenza), prio: +r.priorita || 9 }))
    .sort((a, b) => a.prio - b.prio || (a.entro || '9999').localeCompare(b.entro || '9999'));
}
function pannelloClaudio() {
  const l = coseClaudio();
  if (!l.length) return null;
  const collegati = new Map(voci('lavoro', 'compito').filter(v => /^c-\d+/.test(v.rif || '')).map(v => [v.rif, v]));
  return pannello('Cose da fare di lavoro',
    h('p', { class: 'attenuato piccolo' }, 'Elenco tenuto da Claudio, l\'assistente di lavoro. Scrivi sotto una voce: lo legge al passaggio successivo e aggiorna l\'elenco.'),
    h('ul', { class: 'elenco compiti-elenco' }, l.map(r => {
      const v = collegati.get(r.id), agg = v ? v.aggiornamenti || [] : [];
      const ritardo = r.entro && r.entro < oggi() && !/delegata/i.test(r.stato);
      return h('li', { class: 'compito' },
        h('div', { class: 'tra' }, h('strong', {}, stato(ritardo ? 'ritardo' : 'vuota', r.cosa)), h('span', { class: 'attenuato piccolo' }, [r.area, r.stato, r.entro ? 'entro il ' + fmtData(r.entro) : ''].filter(Boolean).join(', '))),
        r.dettaglio ? h('details', { class: 'storia' }, h('summary', { class: 'attenuato piccolo' }, 'Dettagli'), h('div', { class: 'elenco-nota testo-lungo' }, r.dettaglio)) : null,
        agg.length ? h('ul', { class: 'agg' }, agg.slice(-3).map(rigaAggiornamento)) : null,
        v ? h('div', { class: 'compito-stato attenuato piccolo' }, daLeggere(v) ? 'Claudio non l\'ha ancora letto' : v.letto ? 'Letto da Claudio ' + testoQuando(v.letto) : '') : null,
        casellaScrivi('Scrivi a Claudio', (t, fatto) => {
          if (v) scriviAggiornamento(v, t, fatto ? { stato: 'fatto' } : {});
          else metti({ id: 'cl-' + r.id, area: 'lavoro', tipo: 'compito', persona: personaPredefinita(), data: oggi(), titolo: r.cosa.slice(0, 140), chi: 'Claude', stato: fatto ? 'fatto' : 'da fare', rif: r.id,
            aggiornamenti: [{ quando: adesso(), chi: 'Lorenzo', testo: t || 'Segnato come fatto.' }] });
        }, true));
    })));
}
