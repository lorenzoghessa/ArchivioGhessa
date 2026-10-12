/* ===== 5. Schema: aree, tipi di voce e campi =====
   Per aggiungere un'area o un tipo basta aggiungere una descrizione qui: tabelle, moduli,
   importazione CSV ed esportazione si generano da soli. I dati già salvati non vanno toccati. */
const c = (k, etichetta, tipo = 'testo', extra = {}) => ({ k, etichetta, tipo, ...extra });
const CAT_ESAMI = ['Rene', 'Lipidi', 'Glicemia', 'Fegato', 'Infiammazione', 'Ematologia', 'Ferro e vitamine', 'Tiroide e ormoni', 'Proteine', 'Elettroliti', 'Intestino', 'Urine', 'Sierologie', 'Allergologia', 'Altro'];
const RIPETI = { mai: 0, mensile: 1, trimestrale: 3, semestrale: 6, annuale: 12 };

const AREE_BASE = [
  { id: 'salute', nome: 'Salute e longevità', tipi: {
    misura: { nome: 'Esame di laboratorio', plur: 'Esami di laboratorio', titolo: v => v.parametro, colonne: ['data', 'parametro', 'valore', 'unita', 'rif_testo', 'laboratorio'], campi: [
      c('data', 'Data del prelievo', 'data', { obbl: true }), c('parametro', 'Parametro', 'testo', { obbl: true, suggerisci: true }), c('categoria', 'Categoria', 'scelta', { opzioni: CAT_ESAMI }),
      c('valore', 'Valore', 'numero'), c('testo', 'Risultato a parole (es. Negativo)'), c('unita', 'Unità di misura', 'testo', { suggerisci: true }),
      c('rif_min', 'Riferimento minimo', 'numero'), c('rif_max', 'Riferimento massimo', 'numero'), c('rif_testo', 'Riferimento come scritto sul referto'),
      c('fuori', 'Segnalato fuori intervallo dal laboratorio', 'si_no'), c('laboratorio', 'Laboratorio', 'testo', { suggerisci: true }), c('doc', 'Referto di origine', 'allegato'), c('nota', 'Nota', 'lungo')] },
    visita: { nome: 'Visita o referto', plur: 'Visite e referti', titolo: v => v.specialista, colonne: ['data', 'specialista', 'struttura', 'conclusioni'], campi: [
      c('data', 'Data', 'data', { obbl: true }), c('specialista', 'Specialista o tipo di esame', 'testo', { obbl: true }), c('struttura', 'Struttura'), c('motivo', 'Motivo'),
      c('conclusioni', 'Conclusioni', 'lungo'), c('indicazioni', 'Indicazioni ricevute', 'lungo'), c('doc', 'Referto di origine', 'allegato')] },
    sensore: { nome: 'Dato del dispositivo', plur: 'Dati del dispositivo', titolo: v => v.metrica, colonne: ['data', 'metrica', 'valore', 'unita', 'fonte'], largo: 'metrica', campi: [
      c('data', 'Data', 'data', { obbl: true }), c('metrica', 'Metrica', 'testo', { obbl: true, suggerisci: true }), c('valore', 'Valore', 'numero', { obbl: true }), c('unita', 'Unità'), c('fonte', 'Dispositivo', 'testo', { suggerisci: true })] },
    corpo: { nome: 'Misura del corpo', plur: 'Peso e misure', titolo: v => v.metrica, colonne: ['data', 'metrica', 'valore', 'unita'], largo: 'metrica', campi: [
      c('data', 'Data', 'data', { obbl: true }), c('metrica', 'Misura', 'testo', { obbl: true, suggerisci: true, esempi: ['Peso', 'Massa grassa', 'Massa magra', 'Circonferenza vita', 'Pressione sistolica', 'Pressione diastolica'] }), c('valore', 'Valore', 'numero', { obbl: true }), c('unita', 'Unità')] },
    allenamento: { nome: 'Seduta di allenamento', plur: 'Allenamenti', titolo: v => v.seduta || v.scheda, colonne: ['data', 'scheda', 'seduta', 'serie', 'stimato'], campi: [
      c('data', 'Data', 'data', { obbl: true }), c('scheda', 'Scheda', 'testo', { obbl: true, suggerisci: true }), c('settimana', 'Settimana della scheda', 'numero'), c('seduta', 'Seduta', 'testo'),
      c('serie', 'Serie eseguite', 'numero'), c('dettaglio', 'Esercizi (serie × ripetizioni @RPE, carico)', 'lungo'), c('stimato', 'Valori stimati', 'si_no'), c('stime', 'Cosa è stimato', 'lungo'),
      c('data_stimata', 'Data stimata dai giorni abituali', 'si_no'), c('doc', 'Scheda di origine', 'allegato'), c('nota', 'Nota', 'lungo')] },
    massimale: { nome: 'Massimale', plur: 'Massimali', titolo: v => v.esercizio, colonne: ['data', 'esercizio', 'valore', 'nota'], campi: [
      c('data', 'Data', 'data', { obbl: true }), c('esercizio', 'Esercizio', 'testo', { obbl: true, suggerisci: true, esempi: ['Dip', 'Chin up', 'Squat', 'Panca piana', 'Stacco'] }),
      c('valore', 'Chili (per dip e trazioni: zavorra)', 'numero', { obbl: true }), c('ripetizioni', 'Ripetizioni', 'numero'), c('data_stimata', 'Data approssimata', 'si_no'), c('nota', 'Nota', 'lungo')] },
    osservazione: { nome: 'Osservazione', plur: 'Osservazioni e piano', titolo: v => v.titolo, colonne: ['data', 'titolo', 'priorita', 'stato'], campi: [
      c('data', 'Data', 'data', { obbl: true }), c('titolo', 'Titolo', 'testo', { obbl: true }), c('testo', 'Testo', 'lungo'), c('priorita', 'Priorità', 'scelta', { opzioni: ['alta', 'media', 'bassa'] }),
      c('stato', 'Stato', 'scelta', { opzioni: ['aperta', 'in corso', 'chiusa'] }), c('origine', 'Scritta da')] },
  } },
  { id: 'finanze', nome: 'Finanze', tipi: {
    saldo: { nome: 'Saldo di un conto', plur: 'Saldi dei conti', titolo: v => v.conto, colonne: ['data', 'conto', 'categoria', 'valore'], campi: [
      c('data', 'Data', 'data', { obbl: true }), c('conto', 'Conto', 'testo', { obbl: true, suggerisci: true }), c('categoria', 'Tipo', 'scelta', { opzioni: ['Conto corrente', 'Risparmio', 'Investimenti', 'Previdenza', 'Contanti', 'Debito'] }), c('valore', 'Saldo in euro', 'numero', { obbl: true, euro: true }), c('nota', 'Nota')] },
    movimento: { nome: 'Movimento', plur: 'Entrate e uscite', titolo: v => v.descrizione, colonne: ['data', 'descrizione', 'categoria', 'valore'], campi: [
      c('data', 'Data', 'data', { obbl: true }), c('descrizione', 'Descrizione', 'testo', { obbl: true }), c('categoria', 'Categoria', 'testo', { suggerisci: true }), c('valore', 'Importo in euro (negativo per le uscite)', 'numero', { obbl: true, euro: true }), c('conto', 'Conto', 'testo', { suggerisci: true })] },
  } },
  { id: 'patrimonio', nome: 'Patrimonio', tipi: {
    bene: { nome: 'Bene', plur: 'Beni', titolo: v => v.titolo, colonne: ['titolo', 'categoria', 'valore', 'data'], campi: [
      c('titolo', 'Nome', 'testo', { obbl: true }), c('categoria', 'Tipo', 'scelta', { opzioni: ['Immobile', 'Quote societarie', 'Veicolo', 'Oggetti di valore', 'Altro'] }), c('valore', 'Valore stimato oggi in euro', 'numero', { obbl: true, euro: true }),
      c('data', 'Data della stima', 'data'), c('costo', 'Costo di acquisto in euro', 'numero', { euro: true }), c('acquisto', 'Data di acquisto', 'data'), c('nota', 'Nota', 'lungo')] },
    debito: { nome: 'Debito', plur: 'Debiti', titolo: v => v.titolo, colonne: ['titolo', 'categoria', 'valore', 'scadenza'], campi: [
      c('titolo', 'Nome', 'testo', { obbl: true }), c('categoria', 'Tipo', 'scelta', { opzioni: ['Mutuo', 'Finanziamento', 'Leasing', 'Altro'] }), c('valore', 'Residuo in euro', 'numero', { obbl: true, euro: true }),
      c('data', 'Data del residuo', 'data'), c('rata', 'Rata mensile in euro', 'numero', { euro: true }), c('scadenza', 'Fine prevista', 'data'), c('nota', 'Nota', 'lungo')] },
  } },
  { id: 'viaggi', nome: 'Viaggi ed esperienze', tipi: {
    viaggio: { nome: 'Viaggio', plur: 'Viaggi', titolo: v => v.titolo, colonne: ['data', 'titolo', 'luogo', 'con', 'voto'], campi: [
      c('titolo', 'Titolo', 'testo', { obbl: true }), c('luogo', 'Luogo', 'testo'), c('paese', 'Paese', 'testo', { suggerisci: true }), c('data', 'Partenza', 'data', { obbl: true }), c('fine', 'Rientro', 'data'),
      c('con', 'Con chi'), c('valore', 'Costo in euro', 'numero', { euro: true }), c('voto', 'Voto da 1 a 5', 'numero'), c('nota', 'Ricordi e note', 'lungo')] },
    esperienza: { nome: 'Esperienza', plur: 'Esperienze', titolo: v => v.titolo, colonne: ['data', 'titolo', 'categoria', 'voto'], campi: [
      c('titolo', 'Titolo', 'testo', { obbl: true }), c('data', 'Data', 'data', { obbl: true }), c('categoria', 'Categoria', 'testo', { suggerisci: true }), c('luogo', 'Luogo'),
      c('con', 'Con chi'), c('valore', 'Costo in euro', 'numero', { euro: true }), c('voto', 'Voto da 1 a 5', 'numero'), c('nota', 'Note', 'lungo')] },
  } },
  { id: 'progetti', nome: 'Progetti', tipi: {
    progetto: { nome: 'Progetto', plur: 'Progetti', titolo: v => v.titolo, colonne: ['titolo', 'stato', 'agg'], campi: [
      c('titolo', 'Titolo', 'testo', { obbl: true }), c('stato', 'Stato', 'scelta', { opzioni: ['idea', 'attivo', 'in pausa', 'concluso'] }), c('obiettivo', 'Obiettivo in una frase', 'lungo')] },
  } },
];
const TIPO_SCADENZA = { nome: 'Scadenza', plur: 'Scadenze', titolo: v => v.titolo, colonne: ['data', 'titolo', 'ripeti', 'stato'], campi: [
  c('titolo', 'Cosa', 'testo', { obbl: true }), c('data', 'Entro il', 'data', { obbl: true }), c('zona', 'Area', 'testo', { suggerisci: true }),
  c('ripeti', 'Si ripete', 'scelta', { opzioni: Object.keys(RIPETI) }), c('stato', 'Stato', 'scelta', { opzioni: ['da fare', 'fatta'] }), c('nota', 'Nota', 'lungo')] };
const TIPO_LIBERO = { nome: 'Voce', plur: 'Voci', titolo: v => v.titolo, colonne: ['data', 'titolo', 'categoria', 'valore'], campi: [
  c('titolo', 'Titolo', 'testo', { obbl: true }), c('data', 'Data', 'data', { obbl: true }), c('categoria', 'Categoria', 'testo', { suggerisci: true }), c('valore', 'Valore numerico (facoltativo)', 'numero'), c('unita', 'Unità'), c('nota', 'Note', 'lungo')] };
const AREA_SISTEMA = { id: 'sistema', nome: 'Scadenze', tipi: { scadenza: TIPO_SCADENZA } };

function aree() {
  const extra = S.A.aree.filter(a => !a.canc).map(a => ({ id: a.id, nome: a.nome, libera: true, tipi: { voce: TIPO_LIBERO } }));
  return [...AREE_BASE, ...extra];
}
const area = id => (id === 'sistema' ? AREA_SISTEMA : aree().find(a => a.id === id));
const tipoDef = (a, t) => (area(a) || { tipi: {} }).tipi[t];
const ETICHETTE = { agg: 'Ultima modifica', persona: 'Persona' };
const etichetta = (def, k) => (def.campi.find(f => f.k === k) || {}).etichetta || ETICHETTE[k] || k;

/* Fonti da tenere aggiornate: la pagina segnala da quanto tempo non arrivano dati nuovi. */
const FONTI = [
  { id: 'referti', nome: 'Esami e referti', area: 'salute', tipi: ['misura', 'visita'], giorni: 200, come: 'Carica il PDF in Documenti o mandalo a Claude in chat: i valori li inserisce lui.' },
  { id: 'dispositivo', nome: 'Dati del dispositivo (Garmin)', area: 'salute', tipi: ['sensore'], giorni: 3, come: 'Arrivano da soli ogni notte da Garmin Connect. Se sono fermi, guarda lo stato in Impostazioni.' },
  { id: 'corpo', nome: 'Peso e pressione', area: 'salute', tipi: ['corpo'], giorni: 35, come: 'Registrali nell\'app Garmin Connect (arrivano da soli) oppure aggiungili qui in Salute.' },
  { id: 'allenamenti', nome: 'Schede di allenamento', area: 'salute', tipi: ['allenamento'], giorni: 21, come: 'Carica il file Excel della scheda in Documenti o mandalo a Claude: le sedute le ricava lui.' },
  { id: 'saldi', nome: 'Saldi dei conti', area: 'finanze', tipi: ['saldo'], giorni: 35, come: 'Aggiungi il saldo di ogni conto in Finanze.' },
];
function statoFonte(f) {
  const l = voci(f.area).filter(v => f.tipi.includes(v.tipo));
  if (!l.length) return { stato: 'vuota', testo: 'Mai caricati' };
  const caricato = l.reduce((m, v) => ((v.creato || '') > m ? v.creato : m), '');
  const dato = l.reduce((m, v) => ((v.data || '') > m ? v.data : m), '');
  const g = giorniDa(caricato);
  return { stato: g > f.giorni ? 'ritardo' : 'ok', testo: `Ultimo caricamento ${fa(g)}` + (dato ? `, dati fino al ${fmtData(dato)}` : ''), giorni: g };
}
function fuoriIntervallo(v) {
  if (v.fuori === true) return true;
  if (typeof v.valore !== 'number') return false;
  return (typeof v.rif_min === 'number' && v.valore < v.rif_min) || (typeof v.rif_max === 'number' && v.valore > v.rif_max);
}
function testoRif(v) {
  if (v.rif_testo) return v.rif_testo;
  const a = typeof v.rif_min === 'number', b = typeof v.rif_max === 'number';
  return a && b ? `${fmtNum(v.rif_min, 3)} - ${fmtNum(v.rif_max, 3)}` : a ? `≥ ${fmtNum(v.rif_min, 3)}` : b ? `≤ ${fmtNum(v.rif_max, 3)}` : '';
}
const valoreTesto = v => (typeof v.valore === 'number' ? fmtNum(v.valore, 3) : (v.testo || ''));
function prossimaData(iso, ripeti) {
  const mesi = RIPETI[ripeti] || 0; if (!mesi) return null;
  const d = new Date(tempo(iso)); const giorno = d.getUTCDate();
  d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + mesi);
  const ultimo = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  return isoData(d.getUTCFullYear(), d.getUTCMonth() + 1, Math.min(giorno, ultimo));
}
