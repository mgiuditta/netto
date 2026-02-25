# 📘 Netto: Documento Integrale di Progetto
**"La verità sul tuo saldo. 100% privata, 100% tua."**

---

## 1. POSIZIONAMENTO E VISIONE
Netto nasce per abbattere il **bias di conferma** nel gioco d'azzardo occasionale. Mentre l'industria del betting vive di feedback dopaminergici, Netto agisce come uno specchio freddo e matematico.

* **Il Problema:** Gli scommettitori ricordano le vincite e minimizzano le perdite, perdendo il senso reale del bilancio.
* **La Soluzione:** Un'app offline-only che isola il flusso di cassa del gioco dal conto corrente, rendendo i dati inoppugnabili.
* **Vantaggio Competitivo:** L'architettura "Zero-Knowledge" (nessun server) elimina la paura del tracciamento in un ambito estremamente sensibile.

---

## 2. BRAND & DESIGN IDENTITY (L'ESTETICA DELLA LUCIDITÀ)

Il design è l'opposto polare delle app di scommesse: niente oro, niente luci, niente confusione.

### Visual Identity
* **Nome:** Netto (Trasparenza, ciò che resta dopo aver tolto le illusioni).
* **Logo:** Monogramma "N" minimale formato da due blocchi sfasati che rappresentano l'equilibrio svelato.
* **Palette Colori (Dark Mode First):**
    * `Background`: Deep Slate (`#11151C`) - Riduce l'ansia e la stimolazione.
    * `Surface`: Slate (`#1A222E`) - Per card e input.
    * `Primary/Accent`: Teal (`#008F9C`) - Colore clinico, trasmette stabilità e guarigione.
    * `Text`: Fog White (`#F3F5F7`) - Massima leggibilità.

### Principi UX
* **Anti-Dopamine Design:** Niente animazioni celebrative per le vincite. Il dato è trattato come pura statistica.
* **Velocità "3-Tap":** L'inserimento deve durare meno di 5 secondi per ridurre l'attrito all'uso.
* **Tone of Voice:** Neutro, oggettivo, mai giudicante.

---

## 3. ANALISI TECNICA (ARCHITETTURA 100% LOCALE)

### Stack Tecnico
* **Framework:** Expo (React Native) + Expo Router.
* **Database:** `expo-sqlite/next` (Motore C++ nativo).
* **ORM:** **Drizzle ORM** (Per query SQL tipizzate e performance elevate).
* **State Management:** **Zustand** + React Hooks di Drizzle (`useLiveQuery`).
* **UI:** Tailwind CSS (via NativeWind).

### Modello Dati e Calcolo
Gli importi sono gestiti esclusivamente in **centesimi** (Integer) per evitare errori di precisione dei numeri a virgola mobile in JavaScript.

$$Saldo_{Netto} = \frac{\sum \text{Entrate}_{cents} - \sum \text{Uscite}_{cents}}{100}$$

### Sicurezza e Privacy
* **Autenticazione:** `expo-local-authentication` (FaceID/TouchID obbligatorio).
* **Privacy Screen:** Offuscamento del contenuto nel multitasking di iOS.
* **Sovranità dei Dati:** Funzione di Export in CSV/JSON sempre accessibile.

---

## 4. STRUTTURA DELL'APPLICAZIONE

### Tab 1: Dashboard (La Verità)
* **Hero:** Saldo Netto Totale in primo piano.
* **Trend:** Grafico a linea semplice dell'andamento cumulativo.
* **Quick Look:** Totale speso vs Totale vinto nel mese corrente.

### Tab 2: Storico (Il Diario Onesto)
* Lista cronologica raggruppata per data (FlashList per performance).
* Filtri rapidi per categoria e tipo di transazione (WIN/LOSS).

### Tab 3: Quick Entry (Modal Centralizzato)
* Tastierino numerico custom per inserimento rapido.
* Selettore categorie (Slot, Scommesse, Poker, Gratta e Vinci).

### Tab 4: Insight & Impostazioni
* Breakdown percentuale delle perdite per categoria.
* **Safe Room:** Sezione con contatti per assistenza alle ludopatie.
* **Tip Jar:** Sistema di donazione volontaria via In-App Purchase.

---

## 5. STRATEGIA DI MARKETING E BUSINESS

### Modello di Monetizzazione: "Buy Me a Coffee"
* L'app è **100% gratuita** e priva di pubblicità.
* Monetizzazione tramite **In-App Purchase Consumabili** (Donazioni volontarie).
* *Razionale:* Costruire fiducia totale. L'utente non è il prodotto, è il beneficiario.

### Posizionamento sul Mercato
Netto occupa il "vuoto" tra le app pro-gambling (tracker per vincere) e quelle puramente riabilitative. Si posiziona come uno **strumento di consapevolezza finanziaria**.
* **Canali:** Reddit (r/PersonalFinance, r/ProblemGambling), forum di settore, passaparola organico basato sull'etica.

---

## 6. ROADMAP DI IMPLEMENTAZIONE

1.  **Fase 1 (MVP):** Setup database locale, tastierino custom e calcolo saldo netto.
2.  **Fase 2 (Trust):** Blocco FaceID, export CSV e privacy overlay.
3.  **Fase 3 (Refinement):** Grafici di analisi temporale e ottimizzazione UI/UX.
4.  **Fase 4 (Launch):** Integrazione Tip Jar e pubblicazione Store.