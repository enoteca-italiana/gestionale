# Scheda Tecnica Progetto

Ultimo aggiornamento analisi: **11/05/2026**.

## 1. Introduzione Progetto

Questo repository contiene un gestionale PWA per **scarichi inventariali in enoteca**, con focus operativo su due domini distinti:

- `Vini`
- `Spirits`

L'applicazione e' pensata per uso operativo quotidiano, soprattutto in mobilita', con esperienza touch-first e supporto offline. Lo scopo principale e' consentire:

- consultazione inventario;
- apertura di una sessione di scarico;
- selezione rapida dei prodotti scaricati;
- conferma della sessione con persistenza su Supabase;
- gestione archivio, storico e configurazioni lato admin;
- operativita' anche in caso di rete assente tramite coda locale.

Parti gia' implementate e confermate nel codice:

- frontend React/Vite funzionante;
- routing applicativo;
- dominio `Vini` operativo;
- dominio `Spirits` operativo con repository e viste dedicate;
- persistenza locale via `localStorage`;
- sync dati reali con Supabase, se configurato;
- queue offline per scarichi;
- area admin con login locale, PIN, storico, import/export, reset, soglie;
- PWA con manifest, service worker e asset dedicati;
- workflow GitHub di keepalive Supabase;
- documentazione DNA ampia e strutturata.

Elementi presenti solo come predisposizione o parzialmente implementati:

- integrazione Google Sheets lato frontend, dichiarata ma placeholder;
- backend AI server-side dichiarato nei file ambiente e README, ma non presente nel clone sotto forma di `functions/` o `api/`;
- alcune note documentali operative risultano datate o da riallineare al codice effettivo.

Vincolo generale di questa scheda:

- nessuna indicazione qui contenuta implica modifica di layout, UX, UI, testi visibili, sincronizzazioni approvate o comportamento runtime.

## 2. Architettura Generale

### 2.1 Stack tecnico

Stack rilevato:

- `React 18`
- `TypeScript` strict
- `Vite 5`
- `wouter` per il routing
- `vite-plugin-pwa` per PWA/Workbox
- `@supabase/supabase-js` per il backend dati
- `Vitest` + `Testing Library`
- `ESLint` + `Prettier`
- `exceljs`, `jspdf`, `jspdf-autotable` per export
- `lucide-react` per iconografia

Workspace:

- root monorepo npm;
- workspace applicativo: `apps/scarichi-vini`.

### 2.2 Separazione frontend/backend

Frontend effettivo:

- interamente dentro `apps/scarichi-vini/`;
- applicazione SPA/PWA React.

Backend effettivo:

- non esiste backend Node/Express versionato nel repository;
- il backend reale e' Supabase;
- le logiche server-side piu' importanti stanno in:
  - schema e tabelle Supabase;
  - RPC Supabase;
  - trigger DB;
  - RLS/policy;
  - eventuali workflow GitHub per keepalive;
  - eventuale Apps Script Google esterno, di cui il sorgente e' versionato in `scripts/google-apps-script/enoteca_sync.gs`.

Backend dichiarato ma non presente nel clone:

- API AI server-side su Cloudflare Pages Functions, citata in README e `.env.example`, ma senza codice versionato corrispondente.

### 2.3 Routing

Route principali rilevate in `src/app/routes.ts`:

- `/` -> Home scarichi
- `/admina` -> archivio desktop-first
- `/impostazioni` -> impostazioni admin
- `/admin` -> alias legacy di `/impostazioni`

Le route sono lazy-loaded in `src/App.tsx`.

### 2.4 Gestione stato

Gestione stato principale:

- stato locale React nei componenti/hook;
- `AppDomainProvider` per il dominio attivo `wine | spirits`;
- `localStorage` come storage persistente applicativo;
- `sessionStorage` per alcuni flag sessionali, come intro e PIN sbloccato;
- eventi DOM custom + `BroadcastChannel` per sincronizzazione cross-tab;
- nessuna libreria esterna di state management globale tipo Redux/Zustand.

### 2.5 Gestione dati

Dati reali:

- Supabase, se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` sono configurati.

Fallback applicativo:

- modalita' solo locale quando Supabase non e' configurato;
- cache locale e queue offline come strato di resilienza.

Predisposizione ambiente:

- normalizzazione dell'URL Supabase se contiene per errore `/rest/v1/`;
- guard diagnostica per mismatch tra URL progetto e anon key.

### 2.6 Deploy e portabilita'

Deploy dichiarato:

- Cloudflare Pages;
- build output `apps/scarichi-vini/dist`.

Portabilita':

- il codice non dipende tecnicamente da Replit per il runtime principale;
- sono presenti file e note Replit, ma l'app gira come normale progetto Node/Vite su qualsiasi ambiente compatibile;
- esiste pero' documentazione con riferimenti operativi specifici a Replit che andrebbero tenuti opzionali.

## 3. Struttura Del Codice

### 3.1 Struttura root

Elementi principali in root:

- `package.json` -> orchestrazione workspace e script root;
- `package-lock.json` -> lock npm;
- `apps/scarichi-vini/` -> applicazione principale;
- `DNA/` -> documentazione di progetto;
- `scripts/` -> SQL, Apps Script, helper operativi;
- `backup/` -> script backup;
- `.github/workflows/` -> keepalive Supabase;
- `deploy.sh` -> pipeline locale/API GitHub;
- `eslint.config.js`, `prettier.config.cjs` -> quality tools;
- `replit.md`, `replit.nix` -> contesto Replit.

### 3.2 Cartelle principali applicative

`apps/scarichi-vini/src/app`

- contesto dominio;
- routing helpers;
- hook generici applicativi;
- sync coda offline;
- stato online;
- debounce.

`apps/scarichi-vini/src/components`

- componenti trasversali UI;
- navbar;
- modali base;
- toast;
- logo.

`apps/scarichi-vini/src/data`

- repository dati;
- local DB;
- queue offline;
- parsing/export CSV;
- hook storico sessioni;
- registri categorie/produttori/provenienze.

`apps/scarichi-vini/src/domain`

- tipi dominio;
- normalizzazioni testuali;
- pricing;
- formatter.

`apps/scarichi-vini/src/lib`

- client Supabase;
- keepalive Supabase.

`apps/scarichi-vini/src/pages/home`

- logica home;
- sessione di scarico;
- modali consultive;
- riepilogo;
- risultati.

`apps/scarichi-vini/src/pages/admin`

- autenticazione locale;
- storico;
- gestione registri;
- impostazioni;
- storage chiavi;
- modali admin.

`apps/scarichi-vini/src/pages/admina`

- archivio principale;
- toolbar;
- tabella;
- modali archivio;
- inline editing;
- filtri;
- export.

`apps/scarichi-vini/src/integrations`

- integrazione Google Sheets lato frontend, oggi placeholder.

`apps/scarichi-vini/src/styles`

- CSS globale segmentato per ambiti.

### 3.3 File principali

File di ingresso e orchestrazione:

- [apps/scarichi-vini/src/main.tsx](/Users/dero/Documents/gestionale/apps/scarichi-vini/src/main.tsx:1)
- [apps/scarichi-vini/src/App.tsx](/Users/dero/Documents/gestionale/apps/scarichi-vini/src/App.tsx:1)
- [apps/scarichi-vini/vite.config.ts](/Users/dero/Documents/gestionale/apps/scarichi-vini/vite.config.ts:1)

File chiave dati:

- [apps/scarichi-vini/src/data/wineRepository.ts](/Users/dero/Documents/gestionale/apps/scarichi-vini/src/data/wineRepository.ts:1)
- [apps/scarichi-vini/src/data/spiritsRepository.ts](/Users/dero/Documents/gestionale/apps/scarichi-vini/src/data/spiritsRepository.ts:1)
- [apps/scarichi-vini/src/data/dischargeRepository.ts](/Users/dero/Documents/gestionale/apps/scarichi-vini/src/data/dischargeRepository.ts:1)
- [apps/scarichi-vini/src/data/localDb.ts](/Users/dero/Documents/gestionale/apps/scarichi-vini/src/data/localDb.ts:1)
- [apps/scarichi-vini/src/data/offlineDischargeQueue.ts](/Users/dero/Documents/gestionale/apps/scarichi-vini/src/data/offlineDischargeQueue.ts:1)

File chiave logica home/admin:

- [apps/scarichi-vini/src/pages/home/useHomePage.ts](/Users/dero/Documents/gestionale/apps/scarichi-vini/src/pages/home/useHomePage.ts:1)
- [apps/scarichi-vini/src/pages/admin/useAdminAuth.ts](/Users/dero/Documents/gestionale/apps/scarichi-vini/src/pages/admin/useAdminAuth.ts:1)
- [apps/scarichi-vini/src/pages/admin/useRegistryManager.ts](/Users/dero/Documents/gestionale/apps/scarichi-vini/src/pages/admin/useRegistryManager.ts:1)
- [apps/scarichi-vini/src/pages/admina/useWineAdminPage.ts](/Users/dero/Documents/gestionale/apps/scarichi-vini/src/pages/admina/useWineAdminPage.ts:1)
- [apps/scarichi-vini/src/pages/admina/components/AdminArchiveTable.tsx](/Users/dero/Documents/gestionale/apps/scarichi-vini/src/pages/admina/components/AdminArchiveTable.tsx:1)

### 3.4 File critici per dimensione e complessita'

Moduli oltre 300 righe, da trattare come hotspot di consolidamento:

- `src/data/wineRepository.ts` -> 820 righe
- `src/pages/admina/components/AdminArchiveTable.tsx` -> 713 righe
- `src/data/dischargeRepository.ts` -> 687 righe
- `src/pages/admina/useWineAdminPage.ts` -> 645 righe
- `src/pages/admin/useRegistryManager.ts` -> 591 righe
- `src/pages/admina/components/useArchiveInlineEdit.ts` -> 533 righe
- `src/pages/home/useHomePage.ts` -> 431 righe
- `src/pages/admina/components/WineArchiveFormModal.tsx` -> 424 righe
- `src/pages/admin/useAdminSettings.ts` -> 422 righe
- `src/pages/admin/AdminHistory.tsx` -> 403 righe
- `src/data/spiritsRepository.ts` -> 397 righe
- `src/data/offlineDischargeQueue.ts` -> 370 righe
- `src/pages/admin/AdminSettings.tsx` -> 337 righe
- `src/pages/admina/components/AdminArchiveToolbar.tsx` -> 330 righe
- `src/pages/admin/AdminRegistryManager.tsx` -> 324 righe
- `src/App.tsx` -> 311 righe

Valutazione:

- il progetto e' modulare a livello macro;
- esistono pero' alcuni file densamente responsabilizzati;
- il consolidamento enterprise dovrebbe ridurre complessita' interna senza alterare UI o flussi.

### 3.5 Duplicazioni o logiche parallele da verificare

Punti da verificare:

- logiche `wine` e `spirits` volutamente parallele, ma da monitorare per drift nel tempo;
- fallback schema inglese/italiano in `spiritsRepository.ts`, utile ma fonte potenziale di ambiguita';
- fallback schema completo/legacy in `wineRepository.ts`, anch'esso da governare con cura;
- documentazione AI/Cloudflare presente senza backend versionato corrispondente;
- Google Sheets dichiarato in piu' punti, ma l'integrazione frontend e' solo placeholder.

## 4. Logiche Applicative

### 4.1 Logiche utente

Flusso utente operativo:

- intro iniziale una volta per sessione;
- su desktop, redirect automatico post-intro verso archivio `/admina`;
- su mobile, permanenza in home `/`;
- selezione dominio `Vini` o `Spirits`;
- sessione chiusa:
  - consultazione lista;
  - apertura modale giacenza;
  - eventuale aggiornamento stock;
- sessione aperta:
  - ricerca real-time;
  - aggiunta scarichi;
  - riepilogo;
  - conferma finale;
  - salvataggio online o enqueue offline.

### 4.2 Logiche admin

Area admin:

- login locale con password hashata;
- sessione admin valida 12 ore;
- gate PIN opzionale su avvio app;
- gate PIN opzionale su accesso impostazioni;
- storico sessioni;
- reset archivio;
- import/export archivio;
- gestione categorie/produttori/provenienze;
- soglia globale;
- cambio password.

### 4.3 Autenticazione e accesso

Autenticazione presente:

- solo lato admin;
- locale nel browser;
- default password/PIN `1909`;
- hash SHA-256 Base64 calcolato client-side;
- nessun sistema utenti multi-account;
- nessun backend auth custom versionato nel repo.

Implicazioni:

- soluzione leggera e coerente con il contesto operativo;
- non e' autenticazione enterprise vera;
- va considerata protezione locale di convenienza, non perimetro di sicurezza forte.

### 4.4 Gestione dati e persistenza

Persistenza attiva:

- `localStorage` per cache inventario, queue, auth locale, flags, dominio;
- `sessionStorage` per intro e PIN sessionale;
- Supabase per archivio, sessioni, snapshot storico, registri e dominio spirits.

Strategie dati:

- fetch remoto paginato;
- cache in memoria;
- TTL per ridurre egress;
- refresh su focus/pageshow/visibility;
- write-through locale + remoto;
- update ottimistici in alcune fasi del flusso.

### 4.5 Filtri, stati e feedback

Filtri presenti:

- ricerca testuale;
- filtri stock `all/threshold/out`;
- filtri archivio per categoria/produttore/provenienza;
- preset temporali storico.

Stati e feedback:

- toast;
- banner offline;
- modali conferma;
- feedback invio coda;
- loading/busy diffusi nei moduli principali.

### 4.6 Notifiche ed eventi interni

Il progetto usa eventi browser custom come meccanismo di coordinamento:

- `scarichi:dbChanged`
- `scarichi:dbChangedChannel`
- `scarichi:dischargeQueueChanged`
- `scarichi:dischargeQueueStatus`
- `scarichi:settingsChanged`
- `scarichi:archiveReset`
- `scarichi:adminSectionChange`
- `scarichi:beforeNav`

Valutazione:

- soluzione pragmatica e leggera;
- richiede disciplina per evitare coupling implicito.

### 4.7 Validazioni e protezioni

Validazioni applicative:

- `qty >= 0`;
- `threshold >= 1` o assente;
- normalizzazione testi;
- campi DB obbligatori con fallback `N/D` su stringhe richieste;
- controllo sessione vuota prima di submit;
- distinzione errori recoverable/non recoverable nella queue offline.

Protezione dati:

- snapshot sessione per non perdere leggibilita' storica se il prodotto viene cancellato;
- gestione FK violation in reset archivio;
- paginazione per dataset ampi;
- guard contro mismatch Supabase URL/key.

### 4.8 Logiche mobile

Aspetti mobile rilevati:

- PWA installabile;
- layout touch-first;
- intro leggera GPU-friendly;
- navbar fissa;
- scroll mirati;
- supporto smartphone economici tra gli obiettivi documentali;
- queue offline come caratteristica operativa fondamentale;
- redirect desktop-only per non rompere UX mobile.

## 5. Funzioni Principali

### 5.1 Funzioni lato utente

- visualizzazione inventario per dominio;
- ricerca locale prodotti;
- apertura sessione di scarico;
- aggiunta rapida `-1/-2/-3`;
- riepilogo sessione con correzioni;
- conferma sessione;
- funzionamento offline con queue;
- aggiornamento stock in modalita' consultiva;
- switch dominio `Vini/Spirits`;
- refresh manuale inventario;
- visualizzazione stato online/offline e sincronizzazione coda.

### 5.2 Funzioni lato admin

- login locale admin;
- cambio password;
- attivazione/disattivazione PIN;
- storico sessioni;
- reset storico per retention;
- cancellazione singole sessioni inviate;
- gestione registri categorie/produttori/provenienze;
- CRUD archivio;
- inline editing;
- filtri e ordinamenti archivio;
- bulk edit filtrato;
- import CSV;
- export CSV/Excel/PDF;
- reset archivio;
- impostazione soglie globali.

### 5.3 Funzioni tecniche

- keepalive Supabase lato client;
- keepalive Supabase via GitHub Actions;
- PWA/service worker;
- precache asset;
- cache locale con coalescing write;
- eventi cross-tab e intra-tab;
- fallback schema legacy/completo;
- fallback `salePrice` derivata da `purchasePrice`;
- paginazione Supabase 1000 righe;
- normalizzazione testuale centralizzata;
- chunking export/librerie pesanti via Vite.

### 5.4 Funzioni future predisposte o non completamente attive

- AI assistant server-side, documentato ma non versionato nel repo;
- endpoint `/api/*` predisposto nel `_redirects`;
- sync Google Sheets lato frontend, oggi placeholder;
- ulteriori evoluzioni `Spirits` indicate nella documentazione;
- possibile hardening SQL ulteriore per regole di pricing.

### 5.5 Funzioni dipendenti da servizi esterni

Dipendono da Supabase:

- inventario remoto;
- archivio vino;
- archivio spirits;
- sessioni di scarico;
- storico;
- reset/rename/update massivi;
- soglie bulk;
- snapshot e RPC.

Dipendono da GitHub:

- workflow keepalive Supabase;
- eventuali script di push/deploy locale/API.

Dipendono da Google Apps Script/Sheets:

- sync foglio esterno, non nel runtime principale frontend.

Dipendono da Cloudflare Pages:

- deploy statico dichiarato;
- eventuali funzioni AI, oggi solo documentate.

## 6. Sincronizzazioni E Dati

### 6.1 Provenienza dati

Origine dati reale:

- Supabase per inventario, sessioni, storico e registri.

Origine dati locale:

- `localStorage` come cache, queue e stato operativo locale.

Origine dati esterna non primaria:

- Google Sheets/Apps Script come canale di sincronizzazione/operativita' esterna, non come sorgente frontend diretta.

### 6.2 Modalita' di caricamento

Caricamento inventario:

- tramite repository;
- con paginazione Supabase;
- con cache in memoria e persistenza locale;
- refresh su mount/focus/visibility/pageshow e refresh manuale.

Caricamento storico:

- on-demand;
- cache TTL breve lato hook;
- domain-aware per `wine` e `spirits`.

### 6.3 Dati mock o reali

Conclusione:

- i dati applicativi non sono mock;
- il progetto e' predisposto per dati reali Supabase;
- l'integrazione Google Sheets frontend e' invece placeholder;
- il backend AI dichiarato non e' verificabile nel clone e va marcato `da verificare`.

### 6.4 Sincronizzazioni automatiche

Automatiche confermate:

- flush coda offline su startup, online, focus, pageshow, visibility e queue change;
- refresh inventario su focus/pageshow/visibility;
- keepalive Supabase client-side ogni 24h;
- keepalive Supabase via GitHub Actions ogni 3 giorni.

### 6.5 Sincronizzazioni manuali

Manuali confermate:

- refresh forzato Home;
- import/export archivio;
- operazioni Google Apps Script esterne documentate nel DNA;
- eventuale sincronizzazione foglio/DB tramite script esterni.

### 6.6 Punti fragili

- mismatch Supabase URL/anon key porta a 401;
- free tier Supabase puo' sospendere il progetto;
- Google Sheets frontend non implementato davvero;
- backend AI non versionato nel clone;
- schema fallback inglese/italiano o legacy/completo puo' mascherare drift di schema;
- working tree locale contiene CSV non tracciati, da governare operativamente.

### 6.7 Rischi di perdita o disallineamento dati

- queue offline con errori non recoverable puo' lasciare sessioni ferme in coda;
- doppia sorgente documentale/operativa tra Supabase e Google Sheet richiede disciplina;
- fallback `N/D` evita rotture DB ma puo' introdurre dati placeholder in archivio se input incompleti;
- documentazione AI/server-side senza codice versionato crea rischio di aspettative errate;
- eventuali differenze tra DNA e codice reale possono portare interventi tecnici su assunzioni non aggiornate.

## 7. Cartella DNA

### 7.1 Elenco file presenti

- `DNA/00_INDEX.md`
- `DNA/01_REQUIREMENTS.md`
- `DNA/02_ARCHITECTURE.md`
- `DNA/03_LOCAL_STORAGE_MODEL.md`
- `DNA/04_USER_FLOW_SESSION.md`
- `DNA/05_ADMIN.md`
- `DNA/06_OFFLINE_PWA.md`
- `DNA/07_OPERATIONS_BACKUP.md`
- `DNA/08_SUPABASE_SETUP.md`
- `DNA/09_CODE_REFERENCE.md`
- `DNA/10_TEXT_CASING_POLICY.md`
- `DNA/11_SPIRITS_WORKPLAN.md`
- `DNA/12_HANDOFF_STATUS.md`

Totale documentazione DNA rilevata:

- 12 file `.md`
- circa 3217 righe complessive

### 7.2 Contenuto sintetico di ogni file

`00_INDEX.md`

- indice generale del DNA;
- definisce il DNA come fonte di verita';
- suggerisce ordine di lettura.

`01_REQUIREMENTS.md`

- requisiti funzionali baseline;
- scope utente/admin;
- vincoli UX/UI;
- fuori scope.

`02_ARCHITECTURE.md`

- stack;
- routing;
- moduli principali;
- struttura directory;
- principali invarianti architetturali.

`03_LOCAL_STORAGE_MODEL.md`

- chiavi `localStorage` e `sessionStorage`;
- seed locale;
- migrazioni;
- eventi;
- queue offline.

`04_USER_FLOW_SESSION.md`

- flusso utente completo della sessione di scarico;
- intro;
- riepilogo;
- flush coda;
- comportamento online/offline.

`05_ADMIN.md`

- area admin;
- autenticazione;
- modali;
- storico;
- registri;
- archivio;
- gestione filtri.

`06_OFFLINE_PWA.md`

- service worker;
- manifest;
- queue offline;
- trigger flush;
- installazione multi-device;
- keepalive Supabase.

`07_OPERATIONS_BACKUP.md`

- avvio sviluppo;
- quality gate;
- deploy Cloudflare Pages;
- note GitHub/PAT;
- backup;
- contenuti esclusi dal tracking.

`08_SUPABASE_SETUP.md`

- progetto Supabase;
- variabili ambiente;
- tabelle principali;
- trigger;
- RPC;
- RLS;
- note su egress e fix security advisor.

`09_CODE_REFERENCE.md`

- riferimento esteso del codice;
- funzioni, hook, tipi e responsabilita' modulo per modulo;
- documento piu' voluminoso del DNA.

`10_TEXT_CASING_POLICY.md`

- policy obbligatoria di normalizzazione testi;
- enforcement nel codice e lato DB.

`11_SPIRITS_WORKPLAN.md`

- piano e stato di integrazione Spirits;
- decisioni architetturali;
- cronologia tecnica;
- audit operativi su foglio/DB.

`12_HANDOFF_STATUS.md`

- fotografia di stato;
- checklist per nuovo PC;
- stato chiuso/aperto;
- contenuti versionati e locali.

### 7.3 Stato attuale della documentazione DNA

Valutazione sintetica:

- molto ricca;
- ben organizzata;
- utile come base per onboarding tecnico;
- generalmente coerente con il codice;
- non perfettamente allineata in ogni dettaglio operativo.

### 7.4 Contraddizioni o drift tra DNA e codice reale

Drift rilevati:

- il DNA/README in alcuni punti cita `10/10 test`, mentre la suite attuale eseguita e' `14/14`;
- `replit.md` descrive `HomePage.tsx` come file di circa 196 righe, ma il codice attuale e' diverso;
- il DNA parla di AI server-side e Cloudflare Functions come contesto operativo, ma nel clone non risultano directory `functions/` o `api/` con codice implementativo;
- `googleSheetsSync.ts` nel codice e' placeholder, mentre la documentazione operativa parla di sync piu' ampia: questo non e' per forza un errore, ma conferma che il canale principale di integrazione non passa dal runtime frontend.

### 7.5 Parti obsolete o da aggiornare

Da aggiornare o verificare:

- conteggio test e quality gate documentali;
- riferimenti quantitativi a dimensioni file in documenti non-DNA come `replit.md`;
- stato reale del backend AI, se esiste fuori repo;
- eventuali riferimenti a chiavi/ambienti Replit se il progetto deve restare neutro rispetto alla piattaforma;
- eventuali snapshot numerici DB, da trattare come fotografie temporali e non verita' permanenti.

### 7.6 Stato definitivo della documentazione

Conclusione sul DNA:

- il DNA e' oggi una buona base di verita' progettuale;
- non e' da considerare infallibile;
- va mantenuto allineato al codice reale durante qualsiasi consolidamento successivo;
- il prossimo ciclo di consolidamento dovrebbe aggiornare almeno i file con metriche o riferimenti operativi datati.

## 8. Vincoli Di Sviluppo

Vincoli tecnici da rispettare nel consolidamento:

- il progetto non deve essere vincolato a Replit;
- il codice deve restare portabile su ambienti locali, Codex, Windsurf e CI standard;
- evitare dipendenze inutili o specifiche di piattaforme singole;
- evitare soluzioni temporanee, opache o difficili da mantenere;
- evitare logiche duplicate quando possono essere rese condivise senza rompere i domini;
- evitare fallback ambigui non documentati;
- evitare componenti paralleli non necessari;
- mantenere il codice modulare;
- mantenere file leggibili e, quando sensato, sotto circa 300 righe;
- non introdurre modifiche visive o funzionali non richieste;
- non alterare routing, testi visibili, UX, UI, sincronizzazioni o comportamento approvato;
- trattare `wine` e `spirits` come domini fratelli, senza contaminazioni involontarie;
- preservare compatibilita' con dataset grandi e con device mobili poco performanti.

## 9. Obiettivo Enterprise

Il consolidamento successivo dovra' puntare a:

- stabilita';
- performance;
- velocita' di navigazione;
- robustezza operativa;
- chiarezza del codice;
- manutenibilita';
- scalabilita';
- compatibilita' mobile;
- buona fluidita' anche su smartphone economici;
- riduzione del debito tecnico;
- eliminazione di anomalie documentali e implementative;
- allineamento tra codice, DNA e script operativi;
- test incrociati tutti verdi prima della chiusura.

## 10. Priorita' Di Intervento

### Priorita' 1 - Critica

#### 1. Backend AI dichiarato ma non versionato

- File coinvolti:
  - `apps/scarichi-vini/.env.example`
  - `apps/scarichi-vini/README.md`
  - `apps/scarichi-vini/public/_redirects`
- Problema rilevato:
  - esiste predisposizione documentale per `/api/*` e chiavi AI server-side, ma non c'e' codice backend corrispondente nel clone.
- Rischio:
  - analisi future basate su backend inesistente;
  - deploy incompleto o funzionalita' percepite come presenti ma non verificabili.
- Intervento consigliato:
  - verificare se il backend AI vive fuori repo;
  - in caso negativo, riallineare documentazione e configurazioni.
- Alterazione layout/funzioni:
  - l'intervento documentale puo' essere fatto senza alterare layout o UX;
  - eventuale implementazione backend richiede analisi separata.
- Test necessari:
  - verifica route `/api/*`;
  - verifica build/deploy;
  - verifica chiamate frontend eventuali `da verificare`.

#### 2. Integrazione Google Sheets frontend placeholder

- File coinvolti:
  - `src/integrations/googleSheetsSync.ts`
  - repository dati che la richiamano
  - documentazione DNA/README
- Problema rilevato:
  - il modulo di sync frontend e' stub con `Promise.resolve()`.
- Rischio:
  - falsa percezione di sync applicativa completa;
  - manutentori futuri potrebbero credere che la sync passi da qui.
- Intervento consigliato:
  - chiarire definitivamente il ruolo del file;
  - documentare se va eliminato, implementato o lasciato come adapter neutro.
- Alterazione layout/funzioni:
  - chiarimento documentale si';
  - sostituzione tecnica solo se confermata la sorgente autorevole.
- Test necessari:
  - audit end-to-end flusso Google Sheet -> DB e DB -> Sheet fuori dal frontend.

#### 3. Mismatch ambiente Supabase da trattare come rischio operativo costante

- File coinvolti:
  - `src/lib/supabase.ts`
  - `DNA/07_OPERATIONS_BACKUP.md`
  - `DNA/08_SUPABASE_SETUP.md`
- Problema rilevato:
  - la documentazione segnala storicamente mismatch tra anon key e progetto;
  - il codice contiene una guard, ma il problema resta operativo.
- Rischio:
  - 401 generalizzati;
  - app apparentemente viva ma degradata a solo locale/fallimenti rete.
- Intervento consigliato:
  - standardizzare checklist ambiente;
  - verificare che tutti gli ambienti usino chiavi coerenti.
- Alterazione layout/funzioni:
  - no.
- Test necessari:
  - smoke test Supabase reale;
  - check console browser;
  - create/update/delete remoto.

### Priorita' 2 - Alta

#### 4. File critici troppo grandi e ad alta densita' logica

- File coinvolti:
  - `src/data/wineRepository.ts`
  - `src/data/dischargeRepository.ts`
  - `src/pages/admina/useWineAdminPage.ts`
  - `src/pages/admina/components/AdminArchiveTable.tsx`
  - altri file >300 righe
- Problema rilevato:
  - concentrazione eccessiva di responsabilita'.
- Rischio:
  - regressioni durante modifiche;
  - difficolta' di review e test;
  - costi alti di onboarding/manutenzione.
- Intervento consigliato:
  - estrarre funzioni pure, adapter, mapper, selectors e sottocomponenti;
  - preservare API pubbliche e comportamento.
- Alterazione layout/funzioni:
  - si puo' fare senza alterare UI/funzioni, se il refactor e' solo strutturale.
- Test necessari:
  - typecheck;
  - lint;
  - test unitari;
  - smoke test manuali di home/admina/admin.

#### 5. Formattazione non completamente verde

- File coinvolti:
  - `src/data/wineRepository.ts`
- Problema rilevato:
  - `npm run format:check` fallisce.
- Rischio:
  - quality gate non totalmente verde;
  - attrito in CI o nella disciplina di consolidamento.
- Intervento consigliato:
  - riallineare il file a Prettier senza cambiare logica.
- Alterazione layout/funzioni:
  - nessuna.
- Test necessari:
  - `npm run format:check`.

#### 6. Fallback multipli di schema e naming

- File coinvolti:
  - `src/data/wineRepository.ts`
  - `src/data/spiritsRepository.ts`
  - script SQL in `scripts/sql/`
- Problema rilevato:
  - supporto a schemi legacy e naming multipli;
  - utile per compatibilita', ma costoso da mantenere.
- Rischio:
  - mascheramento di drift infrastrutturali;
  - comportamenti divergenti tra ambienti.
- Intervento consigliato:
  - definire schema autorevole;
  - mantenere fallback solo se giustificato e documentato.
- Alterazione layout/funzioni:
  - potenzialmente no, se fatto con hardening graduale.
- Test necessari:
  - CRUD completo su `wine`;
  - CRUD completo su `spirits`;
  - import/export;
  - storico e submit sessione.

### Priorita' 3 - Media

#### 7. Drift documentale tra DNA, README e file reali

- File coinvolti:
  - `DNA/*`
  - `apps/scarichi-vini/README.md`
  - `replit.md`
- Problema rilevato:
  - alcune metriche e note operative non sono perfettamente allineate.
- Rischio:
  - decisioni tecniche prese su informazioni non aggiornate.
- Intervento consigliato:
  - aggiornare documentazione dopo ogni consolidamento significativo.
- Alterazione layout/funzioni:
  - nessuna.
- Test necessari:
  - rilettura incrociata codice/documenti;
  - validazione script/comandi documentati.

#### 8. Sicurezza admin solo locale

- File coinvolti:
  - `src/pages/admin/useAdminAuth.ts`
  - `src/pages/admin/storage.ts`
  - `src/App.tsx`
- Problema rilevato:
  - accesso admin protetto solo da hash locale e sessione browser.
- Rischio:
  - sufficiente per contesto leggero, ma non sicurezza enterprise forte.
- Intervento consigliato:
  - classificare formalmente il livello di protezione;
  - non cambiare il comportamento senza decisione esplicita di prodotto.
- Alterazione layout/funzioni:
  - eventuale hardening cambierebbe il modello di accesso, quindi va trattato separatamente.
- Test necessari:
  - login/logout;
  - cambio password;
  - PIN app;
  - PIN impostazioni.

#### 9. Event-driven browser coupling

- File coinvolti:
  - `src/App.tsx`
  - `src/data/localDb.ts`
  - `src/data/offlineDischargeQueue.ts`
  - `src/pages/home/useHomePage.ts`
- Problema rilevato:
  - uso intensivo di `CustomEvent` e `BroadcastChannel`.
- Rischio:
  - dipendenze implicite;
  - difficile tracciamento in refactor futuri.
- Intervento consigliato:
  - documentare meglio il contratto degli eventi;
  - valutare centralizzazione dei nomi/event payload.
- Alterazione layout/funzioni:
  - nessuna se fatto come refactor interno.
- Test necessari:
  - cross-tab;
  - queue status;
  - refresh inventario;
  - before-nav guard.

### Priorita' 4 - Bassa

#### 10. Pulizia file operativi e naming secondario

- File coinvolti:
  - `replit.md`
  - script helper root
  - documentazione secondaria
- Problema rilevato:
  - alcuni riferimenti sono storici o orientati a un ambiente specifico.
- Rischio:
  - rumore documentale e onboarding meno pulito.
- Intervento consigliato:
  - rendere i file piu' neutrali rispetto alla piattaforma.
- Alterazione layout/funzioni:
  - nessuna.
- Test necessari:
  - verifica comandi documentati.

#### 11. Razionalizzazione commenti e naming interni

- File coinvolti:
  - file repository/hook maggiori
- Problema rilevato:
  - naming generalmente buono, ma ci sono punti dove l'intento puo' essere reso piu' esplicito.
- Rischio:
  - impatto limitato, soprattutto di leggibilita'.
- Intervento consigliato:
  - micro-refactor lessicale e commenti mirati solo dove servono.
- Alterazione layout/funzioni:
  - nessuna.
- Test necessari:
  - typecheck;
  - lint.

## 11. Test E Verifiche

### 11.1 Test automatici base

Checklist:

- `npm install`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run test`
- `npm run build`

Stato analisi 11/05/2026:

- `typecheck` -> verde
- `lint` -> verde
- `test` -> verde, `14/14`
- `build` -> verde
- `format:check` -> rosso su `src/data/wineRepository.ts`

### 11.2 Test manuali navigazione

- intro iniziale;
- redirect desktop a `/admina`;
- permanenza mobile su `/`;
- switch tra `Home`, `Archivio`, `Impostazioni`;
- alias `/admin`;
- comportamento navbar durante intro e sottosezioni admin.

### 11.3 Test mobile e responsive

- smartphone piccoli;
- smartphone economici;
- iPhone Safari;
- Android Chrome;
- tablet;
- desktop.

Verifiche:

- rendering corretto;
- fluidita' ricerca;
- scroll confinato dove previsto;
- modali e bottom nav;
- installazione PWA.

### 11.4 Test funzioni utente

- apertura sessione;
- cambio dominio prima della sessione;
- ricerca prodotti;
- `-1/-2/-3`;
- correzioni riepilogo;
- guard abbandono sessione;
- submit online;
- submit offline;
- flush coda;
- aggiornamento stock in modalita' consultiva;
- refresh manuale.

### 11.5 Test funzioni admin

- login admin;
- logout;
- cambio password;
- PIN avvio app;
- PIN impostazioni;
- apertura storico;
- filtri storico;
- reset storico retention;
- gestione registri;
- archivio CRUD;
- inline edit;
- bulk edit;
- import CSV;
- export CSV/Excel/PDF;
- reset archivio;
- soglie globali.

### 11.6 Test sincronizzazioni e persistenza

- lettura Supabase con env corrette;
- comportamento con env mancanti;
- mismatch key/url;
- cache locale inventario;
- queue offline;
- `BroadcastChannel`;
- `storage` events;
- keepalive client;
- keepalive GitHub Action;
- eventuale processo Google Sheet esterno `da verificare`.

### 11.7 Test performance

- archivio con dataset grande;
- ricerca home con dataset grande;
- rendering progressivo tabella;
- export grandi dataset;
- first load PWA;
- assenza di blocchi eccessivi su device poco potenti.

### 11.8 Test console e runtime

- errori console browser;
- warning React;
- fallimenti fetch;
- sessioni offline ferme in coda;
- mismatch Supabase;
- problemi PWA/SW.

### 11.9 Test deploy readiness

- build completa;
- asset PWA;
- `_redirects`;
- variabili ambiente;
- verifica assenza di dipendenze implicite da Replit;
- verifica presenza o assenza esplicita del backend AI prima del deploy.

Obiettivo:

- tutti i test disponibili devono arrivare a esito verde prima di dichiarare chiuso un consolidamento.

## 12. Istruzioni Per Il Consolidamento Successivo

Istruzione operativa da lasciare al prossimo agente:

> Leggi questa scheda tecnica, leggi tutta la cartella DNA, analizza tutto il codice e prepara un piano di consolidamento enterprise. Prima di modificare codice, suddividi gli interventi per priorita'. Non modificare layout, UX, UI, funzioni o sincronizzazioni approvate. Ogni intervento deve preservare il comportamento attuale dell'app. Dopo ogni modifica importante aggiorna la cartella DNA. Al termine esegui tutti i test disponibili e produci un report finale con esito verde, problemi risolti, problemi rimasti, file modificati e stato definitivo del progetto.

Ulteriori istruzioni operative:

- non inventare backend o integrazioni assenti;
- se qualcosa non e' verificabile nel clone, segnalarlo come `da verificare`;
- non rimuovere fallback senza prima identificare il motivo storico;
- consolidare prima i file ad alta densita' logica;
- riallineare DNA, README e documentazione secondaria dopo ogni intervento importante;
- non cambiare il contratto utente dell'app senza richiesta esplicita.

## 13. Stato Attuale Sintetico Del Progetto

Stato generale al momento dell'analisi:

- app avviabile in locale su porta `5001`;
- stack coerente e funzionante;
- codice in condizioni complessivamente buone;
- backend dati reale basato su Supabase;
- PWA attiva;
- test principali verdi;
- un quality gate di formattazione non verde;
- alcune parti documentali o infrastrutturali da verificare;
- nessun blocker certo di runtime emerso durante questa analisi locale;
- consolidamento enterprise sensato e fattibile senza rivoluzioni architetturali.

## 14. Allegato Rapido: Comandi Utili

Comandi confermati dal repository:

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
npm run dev -w @enoteca/scarichi-vini -- --port 5001
```

Note operative:

- la porta prevista e' `5001`, con `strictPort`;
- la build genera output in `apps/scarichi-vini/dist`;
- il progetto deve restare gestibile anche fuori da Replit.
