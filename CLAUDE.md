# Pagina dell'archivio: istruzioni per Claude

Codice della pagina dell'archivio personale. I dati sono nel repository privato `Archivio-datighessa` dello stesso utente: istruzioni nel suo CLAUDE.md.
Questo repository è **pubblico**: mai dati personali, nemmeno nelle prove o nei messaggi di commit.

## Lavorare qui
- Sorgenti in `src/` (numerati, uniti in quest'ordine). `python3 costruisci.py` rigenera `index.html`: committare sempre sorgenti e `index.html` insieme.
- Prima di ogni push: `python3 prove/prova.py /tmp/schermate` deve finire con "TUTTO OK". Guardare le schermate dopo modifiche grafiche (anche a larghezza telefono). Aggiungere un controllo alla prova per ogni funzione nuova.
- GitHub Pages pubblica da `main`, radice, all'indirizzo https://lorenzoghessa.github.io/ArchivioGhessa/: ogni push è online in 1-2 minuti.

## Regole
- Nessuna libreria esterna, nessuna chiamata di rete oltre a `api.github.com`.
- Il testo dei dati va inserito nella pagina sempre come testo (funzioni `h` e `s`), mai come HTML.
- Non cambiare il significato dei campi esistenti. Un cambiamento incompatibile del formato richiede `archivio-vita/2` e la conversione automatica della versione 1.
- La forma di `archivio.json` (funzione `serializza`) deve restare identica a quella di `strumenti/archivio.py` nel repository dei dati.
- Lingua dell'interfaccia: italiano; nei titoli solo la prima parola maiuscola; niente parole inglesi quando esiste l'equivalente italiano.
- Importi in euro sempre scritti con `fmtEuro` (o comunque con il simbolo €): così il pulsante "Nascondi importi" li copre da solo (`src/07b-riservato.js`). Un grafico di importi si crea con `grafico(..., { soldi: true })`; un campo del modulo con `euro: true`.
- Cartella Finanze: il quadro con tutti i conti, i beni e i debiti (`quadroFinanze`) resta la prima cosa sotto il titolo.
