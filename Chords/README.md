# Reachords

Interfaccia web per REAPER che mostra a schermo, in tempo reale, gli accordi
e i testi di un brano mentre viene suonato — pensata per essere aperta da un
tablet durante le prove o un concerto.

## Come funziona

1. Nel progetto REAPER crei una traccia chiamata `Chords` con degli item; il
   testo di ogni item (note dell'item) è il nome dell'accordo. Opzionalmente
   una traccia `Lyrics` funziona allo stesso modo per i testi.
2. Lo script `scripts/arilia_Reachords Export.lua` legge il progetto ed
   esporta accordi, testi, marker e misure in JSON tramite `ExtState`.
3. La pagina web (`web/`) legge questi dati tramite il web server integrato
   di REAPER e li mostra, scorrendo in sincrono con il playhead.

## Installazione

### Script

Copia `scripts/{AUTHOR}_Reachords Export.lua` nella cartella `Scripts` di
REAPER (o installa via ReaPack, quando disponibile).

### Interfaccia web

1. Copia la cartella `web/` dentro la cartella del web server integrato di
   REAPER (quella impostata in *Options > Preferences > Control/OSC/Web*),
   ad esempio come sottocartella `reachords/`.
2. Assicurati che il web server di REAPER sia abilitato.
3. Apri da un browser (anche su tablet, sulla stessa rete locale)
   l'indirizzo del web server seguito da `reachords/{AUTHOR}_Reachords Chords.html`.

## Utilizzo

1. Prepara gli item su una traccia `Chords` (e opzionalmente `Lyrics`) nel
   progetto.
2. Esegui l'azione `arilia_Reachords Export.lua` in REAPER (puoi anche
   assegnarle una scorciatoia da tastiera, o farla girare a ogni salvataggio).
3. Apri/aggiorna la pagina web sul tablet.

## Stato del progetto

Progetto ad uso personale/della band, in fase di stabilizzazione prima di
un'eventuale pubblicazione su ReaPack.

### TODO

- [ ] Verificare e allineare i nomi dei campi JSON tra script Lua e JS
      (vedi nota sotto)
- [ ] Aggiungere `arilia_Reachords Lyrics.html`
- [ ] Aggiungere i metadati ReaPack (header `@description`, `@version`,
      changelog) allo script quando pronto per la pubblicazione
- [ ] Licenza

## Nota tecnica aperta

Il file `web/js/reachords.js` attualmente si aspetta nel JSON esportato i
campi `measure`, `beat`, `duration`, `start`, `end` — che corrispondono
all'output del vecchio script di prototipo (`prova.lua`), non a quello
dello script corrente (`scripts/arilia_Reachords Export.lua`), che esporta
`barNumber`, `beatStart`, `beatDuration`, `startTime`, `endTime`. Da
allineare prima di considerare il progetto funzionante end-to-end.
