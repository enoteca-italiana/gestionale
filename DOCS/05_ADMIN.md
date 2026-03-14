# Admin

Ultimo aggiornamento: **14/03/2026 17:33 CET**.

## Accesso

- Route: `/admin`
- Password:
  - default `1909` (hashata e salvata localmente)
  - modificabile in Admin

Hook: `apps/scarichi-vini/src/pages/admin/useAdminAuth.ts`

- salva hash in localStorage
- sessione valida ~12h (`authedUntil`)

## Navigazione admin

`AdminGate` gestisce le sezioni:

- home admin (menu)
- history
- pending

Azioni rapide disponibili direttamente in home admin:

- `Sessioni`
- `Aggiorna password`
- `Importa archivio`
- `Reset totale`

Nota:

- La pagina “Impostazioni” non è più parte del flusso UI.
- Le azioni sopra aprono i modali restando nella home admin (nessun redirect pagina).

La Bottom Nav operativa mostra:

- `Home` (`/`)
- `Archivio` (`/admina`)

## Impostazioni operative (stato attuale)

File: `AdminSettings.tsx`

- componente usato come host modali operativi:
  - cambio password admin
  - import archivio CSV
  - reset totale con PIN
- non espone più toggle di configurazione utente.

## Storico

File: `AdminHistory.tsx`

- mostra solo sessioni inviate correttamente.
- sorgente dati: Supabase (`discharge_sessions` con status `submitted`).
- reset storico:
  - doppia conferma.

## Sospesi

File: `AdminPending.tsx`

- lista sessioni in coda.
- sorgente dati: Supabase (`discharge_sessions` con status `pending`).
- delete singolo con conferma.
- delete tutti con conferma.

## Reset totale

In `AdminSettings.tsx`:

- doppia conferma
- seconda conferma con PIN admin
- chiama `hardResetAll()` solo per dati locali tecnici
- storico/sospesi operativi sono gestiti via API Supabase dedicate

## Archivio vini (`/admina`)

Route dedicata per gestione archivio desktop-first.

Componenti:

- `pages/admina/WineAdminPage.tsx`
- `pages/admina/components/AdminArchiveToolbar.tsx`
- `pages/admina/components/AdminArchiveTable.tsx`
- `pages/admina/components/WineArchiveFormModal.tsx`

Funzioni:

- ricerca e filtri (testo, categoria, soglia/esauriti)
- filtri su singola riga desktop con box statistiche compatto (`Totale`, `Soglia`, `Esauriti`) e pulsante `Aggiungi vino`
- rimosso il vecchio filtro `Tutte le giacenze`
- CRUD vini
- categoria e provenienza selezionabili solo da liste gestite
- fornitore selezionabile solo da lista gestita
- opzione `+ Aggiungi ...` in dropdown con suggerimenti valori uguali/simili
- tabella estesa con header sticky
- righe alternate + separatori verticali
- riempimento automatico con righe vuote fino al fondo area tabella
- box statistiche: `Totale` verde, `Soglia` ambra, `Esauriti` rosso
- pulsanti statistiche selezionati con colori invertiti (testo bianco)
- colonna `ANNO`: mostra cella vuota quando il valore è assente
- colonna `FORNITORE`: posizionata subito dopo `PROVENIENZA`
- colonna note rimossa dalla tabella; note consultabili da icona dedicata in `Azioni`
- ordinamento `A-Z / Z-A` su colonne `Categoria`, `Nome`, `Produttore`, `Provenienza`, `Fornitore`

Regole business:

- `Magazzino = Acquisto × Q.tà`
- `Margine = Vendita − Acquisto`
- q.tà `0` evidenziata in rosso acceso
- q.tà in soglia evidenziata in giallo ambra chiaro
- `Soglia` disponibile nel modale vino: `Vuoto` oppure valore `>= 1` (mai `0`)
