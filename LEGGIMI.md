# Archivio

Pagina personale per salute, finanze, patrimonio, viaggi, progetti e documenti.
Un solo file `index.html`, nessun server, nessuna libreria esterna.

In questo repository c'è solo il programma, **nessun dato personale**. I dati stanno nel repository privato separato `Archivio-datighessa`, dove li leggono e scrivono la pagina, Claude e l'automazione Garmin.

## Come funziona

| Pezzo | Dove | Cosa fa |
|---|---|---|
| Pagina | questo repository, pubblicato con GitHub Pages | Mostra i dati e permette di modificarli. Su ogni dispositivo li tiene cifrati con una frase segreta. |
| Dati | repository privato `Archivio-datighessa` | `archivio.json`, `documenti/`, `garmin/`, `rapporti/`, `strumenti/` |
| Garmin | automazione nel repository dei dati | Ogni notte scarica i dati da Garmin Connect in `garmin/AAAA.csv`. |
| Claude | collegato a GitHub | Trascrive i referti, aggiorna osservazioni e progetti, scrive il rapporto mensile, modifica la pagina. |

## Messa in opera (una volta sola)

1. **Due repository** dell'utente `lorenzoghessa`: `ArchivioGhessa` pubblico (questo) e `Archivio-datighessa` privato.
2. **Claude**: in claude.ai, Impostazioni, Connettori, GitHub. Dare accesso ai due repository. Da lì Claude carica i file e li tiene aggiornati.
3. **Pubblicazione della pagina**: nel repository `ArchivioGhessa`, Settings, Pages, "Deploy from a branch", ramo `main`, cartella `/ (root)`. La pagina risponde a `https://lorenzoghessa.github.io/ArchivioGhessa/`.
4. **Token per la pagina**: foto del profilo, Settings, Developer settings, Personal access tokens, Fine-grained tokens, Generate new token. Repository access: "Only select repositories", `Archivio-datighessa`. Permissions: Repository permissions, Contents, "Read and write". Scadenza: la più lunga disponibile.
5. **Garmin**: nel repository `Archivio-datighessa`, Settings, Secrets and variables, Actions, "New repository secret": `GARMIN_EMAIL` e `GARMIN_PASSWORD`. Poi Actions, "Scarica dati Garmin", "Run workflow".
6. **Ogni dispositivo**: apri la pagina, "Collega il mio archivio", inserisci utente, `Archivio-datighessa`, token e una frase segreta.

## Sicurezza

- I dati nel repository privato sono leggibili da chi entra nell'account GitHub e da Claude. Per questo password lunga e verifica in due passaggi sull'account GitHub sono indispensabili.
- Sul dispositivo dati e token sono cifrati (AES-256-GCM, chiave da PBKDF2-SHA256 con 600.000 iterazioni). La pagina si blocca dopo 15 minuti di inattività.
- Le credenziali Garmin stanno solo nei secrets di GitHub: non le vede la pagina né Claude.
- Il repository dei dati tiene la cronologia di ogni modifica: qualunque errore si può annullare.

## Formato dei dati: `archivio-vita/1`

`archivio.json` (nel repository dei dati), l'esportazione e i file di importazione hanno questa struttura. Nel repository il file è scritto con un elemento per riga, ordinati per `id`.

```json
{
 "schema": "archivio-vita/1",
 "meta": { "creato": "...", "aggiornato": "..." },
 "impostazioni": { "agg": "...", "blocco_min": 15 },
 "persone":  [{ "id": "...", "nome": "...", "nascita": "AAAA-MM-GG", "ruolo": "titolare" }],
 "voci":     [{ "id": "...", "area": "salute", "tipo": "misura", "persona": "<id persona>", "data": "AAAA-MM-GG", "...": "campi del tipo" }],
 "allegati": [{ "id": "...", "nome": "referto.pdf", "mime": "application/pdf", "file": "documenti/<id>.pdf", "area": "salute", "persona": "...", "data": "...", "stato": "da elaborare | elaborato" }],
 "aree":     [{ "id": "x-...", "nome": "Cartella personalizzata" }],
 "registro": [{ "id": "...", "quando": "...", "azione": "...", "origine": "...", "aggiunti": 0, "aggiornati": 0, "saltati": 0, "errori": [] }]
}
```

Ogni elemento ha `id` stabile, `creato` e `agg` (data e ora dell'ultima modifica, ISO 8601). Quando due modifiche si incrociano vince la più recente; un elemento cancellato resta come `{ "id", "canc": true, "agg" }`.
Date `AAAA-MM-GG`, numeri come numeri JSON. Nell'esportazione i documenti possono essere inclusi in `contenuto_base64`.

### Aree e tipi di voce

| Area | Tipo | Campi |
|---|---|---|
| `salute` | `misura` | `data`, `parametro`, `categoria`, `valore` (numero) oppure `testo`, `unita`, `rif_min`, `rif_max`, `rif_testo`, `fuori` (segnalato dal laboratorio), `laboratorio`, `doc`, `nota` |
| `salute` | `visita` | `data`, `specialista`, `struttura`, `motivo`, `conclusioni`, `indicazioni`, `doc` |
| `salute` | `sensore` | `data`, `metrica`, `valore`, `unita`, `fonte` |
| `salute` | `corpo` | `data`, `metrica`, `valore`, `unita` |
| `salute` | `osservazione` | `data`, `titolo`, `testo`, `priorita` (alta, media, bassa), `stato` (aperta, in corso, chiusa), `origine` |
| `finanze` | `saldo` | `data`, `conto`, `categoria`, `valore`, `nota` |
| `finanze` | `movimento` | `data`, `descrizione`, `categoria`, `valore` (negativo per le uscite), `conto` |
| `patrimonio` | `bene` | `titolo`, `categoria`, `valore`, `data`, `costo`, `acquisto`, `nota` |
| `patrimonio` | `debito` | `titolo`, `categoria`, `valore` (residuo), `data`, `rata`, `scadenza`, `nota` |
| `viaggi` | `viaggio` | `titolo`, `luogo`, `paese`, `data`, `fine`, `con`, `valore`, `voto`, `nota` |
| `viaggi` | `esperienza` | `titolo`, `data`, `categoria`, `luogo`, `con`, `valore`, `voto`, `nota` |
| `progetti` | `progetto` | `titolo`, `stato`, `obiettivo`, `contenuto` (Markdown), `versione`, `versioni` |
| `sistema` | `scadenza` | `titolo`, `data`, `zona`, `ripeti` (mai, mensile, trimestrale, semestrale, annuale), `stato`, `nota` |
| cartella personalizzata | `voce` | `titolo`, `data`, `categoria`, `valore`, `unita`, `nota` |

I dati Garmin non stanno in `archivio.json`: sono in `garmin/AAAA.csv` (`data;tipo;metrica;valore;unita`) e la pagina li mostra come voci `sensore` o `corpo` di sola lettura.

## Modificare la pagina

Sorgenti in `src/`, numerati nell'ordine in cui vengono uniti; `python3 costruisci.py` rigenera `index.html`.
Prima di pubblicare: `python3 prove/prova.py` deve finire con "TUTTO OK" (usa dati inventati e un GitHub simulato).
Per aggiungere un'area o un tipo di voce si modifica solo `src/05-schema.js`.
