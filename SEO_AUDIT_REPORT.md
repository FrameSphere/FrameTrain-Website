# SEO-Audit-Report — FrameTrain Website

**Erstellt:** 09.08.2026 · Branch `seo/ranking-ausbau` · Basis-Commit `4730ca4`
**Auftrag:** Analyse, kein Umbau (siehe `SEO_AUDIT_BRIEF.md`). Es wurde **kein Code
geändert** — alle Punkte sind Befunde + Empfehlungen mit Datei/Zeile.

---

## 0. Zusammenfassung (TL;DR)

Der technische SEO-Unterbau ist **überdurchschnittlich sauber**: zentraler Helper
(`src/lib/seo.ts`), konsequente Canonicals/hreflang, zweisprachige Metadaten, kein
`meta-keywords`, robots.txt korrekt (kein `/_next/`-Block). Die Content-Guides sind
echt und tief — keine Doorway-/Thin-Pages im indexierten Bereich, **mit einer Ausnahme**.

**Die drei wichtigsten Baustellen:**

1. **`/login`, `/register`, `/redeem` sind indexierbar**, obwohl sie es laut Briefing
   nicht sein sollen. Sie setzen ein Canonical, aber **kein `noindex`** und stehen
   **nicht** in `robots.txt`. → Dünne Auth-Seiten laufen in den Index. **(kritisch)**
2. **`/extensions` ist eine „Coming Soon"-Platzhalterseite, aber indexierbar** und
   nicht in der Sitemap. Thin Content, den Google aktiv abstraft. **(kritisch)**
3. **Sitemap-Drift + verwaiste Seiten:** `/extensions` fehlt in der Sitemap;
   `/download` (Sitemap-Prio 0.95) und `/install` sind intern kaum bzw. nur aus
   Nicht-Content-Seiten verlinkt. **(mittel)**

**Live-Rankings:** google.de konnte in dieser Session **nicht** erhoben werden — Google
liefert im automatisierten Browser eine Bot-Sperre („ungewöhnlicher Datenverkehr"),
die ich laut Sicherheitsregeln nicht umgehen darf. Als Ersatzsignal wurde Bing
genutzt (Details in §4). Für belastbare Positionen: Search Console (steht ohnehin an).

---

## 1. Metadaten-Inventar (alle Routen unter `src/app/[locale]/`)

Titel/Descriptions kommen zweisprachig aus `messages/{de,en}.json` (bzw. `coach-seo.tsx`),
sind also je Locale sprachrichtig gepflegt. Canonical/hreflang liefert überall
`pageAlternates()`, OG liefert `pageOpenGraph()`. Legende: ✅ vorhanden/korrekt ·
⚠️ Mangel · ❌ Fehler · — nicht zutreffend.

### 1a. Indexierbare Content-Seiten

| Route | Meta-Quelle | Canonical eigen | hreflang | og | JSON-LD | robots | In Sitemap |
|---|---|---|---|---|---|---|---|
| `/` (Home) | `layout.tsx:24` | ✅ | ✅ | ✅ | Organization + SoftwareApplication + FAQPage | index | ✅ |
| `/about` | `about/page.tsx:16` | ✅ | ✅ | ✅ | ⚠️ keins | index | ✅ |
| `/download` | `download/layout.tsx` | ✅ | ✅ | ✅ | ⚠️ keins (SoftwareApplication-Kandidat) | index | ✅ |
| `/install` | `install/layout.tsx` | ✅ | ✅ | ✅ | ⚠️ keins (HowTo-Kandidat) | index | ✅ |
| `/faq` | `faq/layout.tsx` | ✅ | ✅ | ✅ | ✅ FAQPage | index | ✅ |
| `/changelog` | `changelog/layout.tsx` | ✅ | ✅ | ✅ | ⚠️ keins | index | ✅ |
| `/docs` | `docs/layout.tsx` | ✅ | ✅ | ✅ | ⚠️ keins (Breadcrumb/CollectionPage) | index | ✅ |
| `/docs/ai-training-guide` (Coach-Hub) | `…/layout.tsx` | ✅ | ✅ | ✅ (article) | ⚠️ keins (**Course**-Kandidat*) | index | ✅ |
| `/docs/ai-training-guide/*` (8 Kapitel) | `coach-seo.tsx` | ✅ | ✅ | ✅ (article) | ✅ BreadcrumbList + TechArticle | index | ✅ |
| `/guides` (Hub) | `guides/page.tsx:11` | ✅ | ✅ | ✅ | ⚠️ keins (Breadcrumb/ItemList) | index | ✅ |
| `/guides/lora-finetuning` | `…/page.tsx:11` | ✅ | ✅ | ✅ (article) | ✅ BreadcrumbList + Article | index | ✅ |
| `/guides/local-vs-cloud` | `…/page.tsx:11` | ✅ | ✅ | ✅ (article) | ✅ BreadcrumbList + Article | index | ✅ |
| `/guides/gpu-guide` | `…/page.tsx:11` | ✅ | ✅ | ✅ (article) | ✅ BreadcrumbList + Article | index | ✅ |
| `/imprint` | `imprint/page.tsx:16` | ✅ | ✅ | ⚠️ kein og | keins (ok) | index | ✅ |
| `/privacy` | `privacy/page.tsx:14` | ✅ | ✅ | ⚠️ kein og | keins (ok) | index | ✅ |
| `/terms` | `terms/page.tsx:13` | ✅ | ✅ | ⚠️ kein og | keins (ok) | index | ✅ |
| `/cookies` | `cookies/page.tsx:13` | ✅ | ✅ | ⚠️ kein og | keins (ok) | index | ✅ |
| `/extensions` | `extensions/layout.tsx:8` | ✅ | ✅ | ❌ kein og | ❌ keins | **index ❌** | **❌ fehlt** |

\* Die 8 Kapitel deklarieren `isPartOf: { @type: Course }`, aber der Hub selbst trägt
kein `Course`-Schema — das referenzierte Course-Objekt existiert nirgends als eigene Entität.

### 1b. Bewusst nicht-indexierte / gesperrte Seiten

| Route | Mechanismus | Bewertung |
|---|---|---|
| `/library` | `page.tsx` `robots.index:false` + Canonical + og | ✅ korrekt (Test-Einträge in DB, bewusst noindex) |
| `/sso-welcome` | `layout` `robots.index:false, follow:true` + Canonical | ✅ korrekt |
| `/verify-email` | `layout` `robots.index:false, follow:true` + Canonical | ✅ korrekt |
| `/verify-email/pending` | `layout` `robots.index:false, follow:false` + Canonical | ✅ korrekt |
| `/dashboard` | **nur** `robots.txt` Disallow (`/de,/en/dashboard`), keine Meta | ✅ ausreichend (Disallow verhindert Crawl; Meta wäre unlesbar) |
| `/payment`, `/payment/cancel`, `/payment/success` | **nur** `robots.txt` Disallow (`/de,/en/payment/`) | ✅ ausreichend |
| `/login` | `layout:8` Canonical, **kein noindex**, **nicht** in robots.txt | ❌ **indexierbar** |
| `/register` | `layout:8` Canonical, **kein noindex**, **nicht** in robots.txt | ❌ **indexierbar** |
| `/redeem` | `layout:8` Canonical, **kein noindex**, **nicht** in robots.txt | ❌ **indexierbar** |

**Canonical-Vererbung (Audit-Punkt A2):** Alle geprüften Unterseiten setzen eigene
`alternates` via `pageAlternates()`. Es wurde **keine** Route gefunden, die
fälschlich das Startseiten-Canonical erbt — inkl. der Client-Component-Seiten
(`login/register/redeem/extensions/sso-welcome/verify-email`), die genau dafür ein
`layout.tsx` bekommen haben. Einzige Ausnahme ohne eigenes Canonical:
`/dashboard` und `/payment/*` — dort aber irrelevant, weil per robots.txt gesperrt.

**`meta-keywords` (Audit-Punkt A4):** ✅ Keine im Quellcode. Die `keywords`-Treffer in
`page.tsx` (UseCase-Tags, sichtbare UI) und `library` (`itemProp="keywords"`, Microdata)
sind legitim und kein Meta-Keywords-Tag.

---

## 2. Priorisierte Mängelliste

### 🔴 Kritisch

| # | Befund | Datei / Zeile | Wirkung |
|---|---|---|---|
| K1 | `/login`, `/register`, `/redeem` **ohne `noindex`** → laufen in den Index | `login/layout.tsx:8`, `register/layout.tsx:8`, `redeem/layout.tsx:8` | Dünne Auth-Seiten im Index verwässern die Domain-Relevanz. Fix: `robots: { index: false, follow: true }` ergänzen — identisch zu `sso-welcome/layout.tsx`. |
| K2 | `/extensions` ist **indexierbar & thin** („Coming Soon", „Marketplace noch nicht geöffnet") | `extensions/page.tsx:1` (Kommentar „Temporäre UI … bald herausnehmen"), `extensions/layout.tsx:8` | Thin/Placeholder-Content im Index = aktives Google-Risiko. Fix: `robots: { index: false }` bis echter Inhalt existiert. |

### 🟡 Mittel

| # | Befund | Datei / Zeile | Wirkung / Empfehlung |
|---|---|---|---|
| M1 | Sitemap-Drift: `/extensions` fehlt (Route existiert) | `src/app/sitemap.ts:13-40` | Konsistent zu K2: erst noindex, dann **nicht** in Sitemap aufnehmen. Sonst (falls echter Content) aufnehmen. |
| M2 | `/download` intern verwaist: nicht in Header/Footer/Homepage; nur aus `/library` (noindex) und `docs/.../fortgeschrittene` verlinkt | `Header.tsx`, `Footer.tsx`, `app/[locale]/page.tsx` | Sitemap-Prio 0.95, aber kaum interner Linkjuice. Erklärbar durch Early-Access (Primär-CTA = `/register`), aber SEO-seitig unterversorgt. Mind. 1 Link aus Footer/Homepage empfehlenswert. |
| M3 | `/install` verwaist: einziger interner Link aus `/dashboard` (privat, robots-gesperrt) | `dashboard/page.tsx` | Für öffentliche Crawler praktisch nicht erreichbar. Aus `/download` oder `/docs` verlinken. |
| M4 | JSON-LD-Lücken auf Content-Seiten | `docs/`, `docs/ai-training-guide/` (Hub), `guides/` (Hub), `about/`, `download/`, `install/`, `changelog/` | Kandidaten: Coach-Hub → `Course` (wird von Kapiteln referenziert!); `/install` → `HowTo`; `/download` → `SoftwareApplication`+`DownloadAction`; Hubs → `BreadcrumbList`+`ItemList`; `/about` → `AboutPage`. |
| M5 | Titel systematisch >60 Zeichen | Coach-Kapitel `coach-seo.tsx` (76–95 Z.), `Docs`/`CloudGuide`/`GpuGuide`/`LoraGuide`/`Install`/`AICoach.meta` (61–80 Z., de+en) | Google kürzt ~60 Z. Keyword-reich, aber Suffix „ \| FrameTrain" schiebt viele über die Grenze. Kürzen oder Suffix bei langen Titeln weglassen. |
| M6 | Descriptions >155 Zeichen | `About` (de 190/en 175), `LoraGuide` (170/166), `Docs` (164/165), `CloudGuide` (164), `Install` (160), einige Coach-Kapitel (160–170) | Werden abgeschnitten. Auf ≤155 kürzen, Kernaussage nach vorn. |

### ⚪ Kosmetisch

| # | Befund | Datei / Zeile | Empfehlung |
|---|---|---|---|
| C1 | Footer verlinkt auf `frame-sphere.vercel.app` | `Footer.tsx:150` | Nach dem Domain-Umzug-Narrativ konsequent auf eigene Domain zeigen, sobald vorhanden. Externer Firmenlink, geringe Priorität. |
| C2 | Sitemap-Prioritäten sehr uniform (viele 0.88–0.92) | `sitemap.ts:26-39` | Google gewichtet `priority` kaum; kein Handlungsdruck. Optional differenzieren (Guides/Coach höher als Docs-Unterseiten). |
| C3 | Rechtsseiten ohne OG-Tags (`imprint/privacy/terms/cookies`) | jeweilige `page.tsx` | Unkritisch (werden selten geteilt). Nur wenn einheitliche Social-Cards gewünscht. |
| C4 | Organization-`logo` ist SVG (`favicon.svg`) | `layout.tsx:122`, `coach-seo.tsx:272` | Für Rich-Result-Logos bevorzugt Google Raster (PNG). Optional auf PNG umstellen. |

---

## 3. Sitemap & Technik (Audit-Punkte B5–B8)

- **B5 Sitemap-Drift:** Manuelle Liste (`sitemap.ts`) deckt alle Content-Routen ab
  **außer `/extensions`**. Keine Karteileichen (alle gelisteten Pfade existieren).
  Bewusst ausgelassen und korrekt: `/library` (noindex), Auth-/Payment-/Dashboard-Seiten.
- **B6 noindex-Audit:** siehe Tabelle 1b. Sauber bei `library/sso-welcome/verify-email(/pending)`
  und via robots.txt bei `dashboard/payment`. **Lücke:** `login/register/redeem` (→ K1).
- **B7 JSON-LD-Abdeckung:** Vorhanden auf Home, `/faq`, allen 8 Coach-Kapiteln, allen 3
  Guides. **Fehlt** auf beiden Hub-Seiten, `/docs`, `/about`, `/download`, `/install`,
  `/changelog` (→ M4). Syntaxprüfung der vorhandenen Graphen: strukturell valide
  (`@context`/`@graph`, korrekte Verschachtelung von BreadcrumbList/Article/TechArticle).
  Vor Deployment zusätzlich mit dem Rich-Results-Test gegenprüfen.
- **B8 Interne Verlinkung:**
  - Global (Header/Footer): Home, Docs, Guides, Library, Extensions, About, Changelog,
    FAQ, Legal — solide.
  - **Verwaist/unterversorgt:** `/download` (→ M2), `/install` (→ M3).
  - Hub→Kind sauber: `/guides` → 3 Guides, `/docs/ai-training-guide` → 8 Kapitel.
  - **Ankertexte:** Guides/Coach nutzen beschreibende, keyword-nahe Linktexte
    (Kapitelnamen, „Best GPU…", Breadcrumb-Namen). Das im Briefing befürchtete
    „Mehr erfahren"-Problem betrifft nur die Homepage-UseCase-Cards
    (`page.tsx:463/690`, ein einziger generischer Link pro Card) — geringe Tragweite.

---

## 4. Keyword-Lücken-Analyse

> **Methodik-Hinweis:** Live-Positionen auf **google.de** waren nicht erhebbar
> (Bot-Sperre im automatisierten Browser, darf ich nicht umgehen). Die folgende
> Analyse stützt sich auf (a) **Bing-SERPs** als Ersatz-Signal und (b) das
> On-Page-Keyword-Targeting im Code. Belastbare google.de-Positionen bitte über
> Search Console / manuell nachziehen.

### Live-Stichproben (Bing.de, 09.08.2026)

| Keyword | Ziel-Seite bei FrameTrain | Bing Top-~12 | SERP-Charakter |
|---|---|---|---|
| „LoRA Fine-Tuning lokal" | `/guides/lora-finetuning` | ❌ nicht sichtbar | Tutorial-/Blog-dominiert (freshlab.es, promptquorum.com, localai.computer, medium, sitepoint) |
| „KI-Modell lokal trainieren" | Home / `/guides` | ❌ nicht sichtbar | Gemischte Intention: v.a. **Betrieb** lokaler Modelle (Ollama, LM Studio — toolify.ai, win-tipps.de), nicht Training |

**Deutung:** Für beide Kernbegriffe ranken **informative Guides**, nicht Produktseiten
— das validiert FrameTrains Guide-first-Strategie. FrameTrain rankt (auf Bing) noch
nicht in den Top, plausibel für eine frisch auf `.com` umgezogene Domain. Bei
„KI-Modell lokal trainieren" ist die Suchintention teils *Inferenz* statt *Training* —
dieser Begriff ist unschärfer als er klingt.

### On-Page-Targeting: Wo die Site „nah dran" sein sollte

| Keyword(-Cluster) | Vorhandene, passgenaue Seite | Status |
|---|---|---|
| LoRA / QLoRA Fine-Tuning erklärt | `/guides/lora-finetuning` (+ Coach `fine-tuning`) | Content + Schema vorhanden → **optimieren, nicht neu bauen** |
| Beste GPU für ML/LLM Training 2026 | `/guides/gpu-guide` | Kaufberatung 2026, gut optimiert → optimieren |
| Lokal vs. Cloud (Colab/SageMaker/Paperspace) | `/guides/local-vs-cloud` | Vergleichstabellen + Schema → optimieren |
| ML-Theorie (Loss-Kurven, Overfitting, Hyperparameter, Transformer) | 8 Coach-Kapitel | Tiefe vorhanden, frisch mit Schema → indexieren lassen, intern stärken |
| HuggingFace Modell fine-tunen ohne Cloud | Kombination `/guides/lora-finetuning` + `/local-vs-cloud` | inhaltlich abgedeckt, kein dedizierter Landeplatz |
| QLoRA Tutorial (transaktional/Tutorial) | Coach `fine-tuning` + `/guides/lora-finetuning` | abgedeckt |

**Lücke ohne eigene Seite:** ein explizit **schritt-für-schritt** transaktionaler
„QLoRA/HuggingFace lokal fine-tunen"-Tutorial-Flow (How-To mit Code) — aktuell auf
Guide + Coach verteilt. **Kein Neubau in dieser Session** — als Kandidat für die
gemeinsame Entscheidung vormerken (siehe §5).

---

## 5. Empfehlung: Optimieren vs. Neu bauen

Grundlinie: **Der Content-Bestand ist gut. Der Hebel liegt fast überall im
Optimieren/Freiräumen, nicht im Neubauen.** Priorisiert nach Aufwand↔Wirkung:

### Sofort (klein, hohe Wirkung, reiner Fix — kein neuer Content)
1. **K1** — `noindex` für `/login`, `/register`, `/redeem` (3× eine Zeile, Muster aus
   `sso-welcome/layout.tsx` kopieren).
2. **K2/M1** — `/extensions` auf `noindex` setzen und aus der Sitemap-Betrachtung
   herausnehmen (bleibt bereits ausgelassen).
3. **M2/M3** — je 1 interner Link auf `/download` (Footer/Homepage) und `/install`
   (aus `/download` oder `/docs`).

### Kurzfristig (Optimieren bestehender Seiten)
4. **M5/M6** — Titel/Descriptions der langen Seiten (Coach, Docs, CloudGuide, GpuGuide,
   LoraGuide, Install, About) auf ≤60/≤155 kürzen. Reine Textänderung in
   `messages/*.json` + `coach-seo.tsx`.
5. **M4** — JSON-LD nachrüsten: Coach-Hub `Course` (schließt die `isPartOf`-Referenz),
   `/install` `HowTo`, `/download` `SoftwareApplication`, Hubs `BreadcrumbList`+`ItemList`.

### Zur gemeinsamen Entscheidung (potenzieller Neubau — NICHT jetzt)
6. Dedizierte **How-To-Landingpage** „HuggingFace-Modell lokal mit QLoRA fine-tunen"
   (transaktionaler Tutorial-Intent) — nur, wenn sie echten Mehrwert über die
   bestehenden Guides hinaus liefert (lauffähiger Code, Schritt-für-Schritt, HowTo-Schema).
   Andernfalls Guide `/guides/lora-finetuning` um einen Praxis-Abschnitt erweitern
   statt neuer Seite (vermeidet Kannibalisierung/Thin Content).

### Nicht im Code lösbar (Betreiber — aus Briefing §2, weiterhin offen)
- `frame-train.vercel.app`-Alias in Vercel entfernen/redirecten.
- Redeploy **ohne** Build-Cache (stale Meta-Tags auf `.vercel.app`).
- Search Console `.com` verifizieren + Sitemap einreichen → liefert dann die echten
  google.de-Positionen, die diese Session nicht erheben konnte.

---

## Anhang: Prüfumfang

- 36 Seiten-Routen unter `src/app/[locale]/`, 32 Dateien mit `generateMetadata`/`metadata`.
- Kern-SEO-Dateien: `src/lib/seo.ts`, `src/lib/coach-seo.tsx`, `src/app/sitemap.ts`,
  `src/app/robots.ts`, `src/app/[locale]/layout.tsx`, Header/Footer, `messages/{de,en}.json`.
- Live: Bing.de (2 Keywords) als Ersatz für die gesperrte google.de-Abfrage.
- **Keine Code-Änderungen vorgenommen** (Auftrag = Analyse).
