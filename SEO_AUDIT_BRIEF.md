# SEO-Audit-Briefing — FrameTrain Website

**Zweck:** Handoff für eine Claude-Code-Session. Auftrag ist **Analyse, kein Umbau**.
Erst Bestandsaufnahme + Bewertung, danach wird gemeinsam über neue Seiten entschieden.

**Stand:** 09.08.2026 · Branch `seo/ranking-ausbau` · letzter Commit `4730ca4`

---

## 1. Ausgangslage

- Domain: **frame-train.com** (Umzug von `frame-train.vercel.app` ist erfolgt)
- Stack: Next.js App Router, `next-intl`, zweisprachig **de/en** mit Locale-Präfix (`/de/...`, `/en/...`)
- Deployment: Vercel
- Produkt: Desktop-App für lokales ML-Training (LoRA/QLoRA, HuggingFace, DSGVO-Fokus)

### Indexierungsstatus (live geprüft, google.de)

- `site:frame-train.com` → ~19+ distinkte URLs indexiert, danach „ähnliche Ergebnisse ausgelassen"
- Markensuche „FrameTrain local machine learning training" → **Platz 1 organisch**
- `site:frame-train.vercel.app` → nur noch 1 Seite (Startseite), Altlast

> **Wichtig für die Analyse:** Das `WebSearch`-Tool liefert nur den **US-Index** und zeigt die
> Domain fälschlich als unindexiert. Für alle Ranking-Checks den Browser mit
> `google.de` + `hl=de&gl=de` verwenden. Ein früherer Audit war deshalb komplett falsch.

---

## 2. Bereits erledigt (nicht erneut anfassen)

| Fix | Ort | Status |
|---|---|---|
| 308-Redirect Legacy-Domain → frame-train.com | `src/middleware.ts` | live, funktioniert |
| Canonicals inkl. `/de`-Präfix | `src/lib/seo.ts` → `pageAlternates()` | korrekt |
| hreflang de/en/x-default | `pageAlternates()` + `sitemap.ts` | vorhanden |
| og:image als PNG (vorher SVG) | `pageOpenGraph()` | korrekt |
| Zweisprachige Metadaten der 8 Coach-Kapitel | `src/lib/coach-seo.tsx` (neu) | Commit `4730ca4` |
| JSON-LD (BreadcrumbList + TechArticle) je Coach-Kapitel | `src/lib/coach-seo.tsx` | Commit `4730ca4` |

**Offen, aber NICHT im Code lösbar** (Plattform-Aufgaben für den Betreiber):

1. `frame-train.vercel.app`-Alias in Vercel entfernen bzw. auf Redirect stellen
2. Redeploy **ohne Build-Cache** — alte Docs-Seiten liefern auf `.vercel.app` noch veraltete
   Meta-Tags (falscher Canonical ohne `/de`, `meta-keywords`, og-image.svg) → stale ISR/CDN-Cache
3. Search Console: Property für `.com` verifizieren + Sitemap einreichen

---

## 3. Relevante Dateien

```
src/lib/seo.ts                    siteUrl, pageAlternates(), pageOpenGraph()
src/lib/coach-seo.tsx             Metadaten + JSON-LD der 8 Coach-Kapitel (neu)
src/app/sitemap.ts                HARTCODIERTE Seitenliste (Driftgefahr!)
src/app/robots.ts                 robots.txt
src/app/[locale]/layout.tsx       Root-Metadata + JSON-LD (Organization, SoftwareApplication, FAQPage)
src/app/[locale]/guides/*         3 Guides, je mit BreadcrumbList + Article JSON-LD
src/app/[locale]/docs/ai-training-guide/*   8 Kapitel + _shared.tsx
messages/de.json, messages/en.json          alle Texte (i18n)
```

Ca. **32 Dateien** enthalten `generateMetadata` bzw. `export const metadata`.

---

## 4. Auftrag: Audit-Punkte

### A. Metadaten-Inventar

1. **Alle Routen auflisten** unter `src/app/[locale]/` und tabellarisch erfassen:
   Titel, Description, Canonical, hreflang, og:*, JSON-LD-Typ, robots-Direktive — je de/en.
2. **Canonical-Vererbung prüfen.** In `src/app/[locale]/layout.tsx` steht der Hinweis:
   *jede Unterseite MUSS eigene `alternates` via `pageAlternates()` setzen*, sonst erbt sie
   das Startseiten-Canonical. → Routen finden, die das **nicht** tun. Hohe Priorität.
3. **Titel/Descriptions bewerten:** Duplikate, fehlende, zu lang (>60 Zeichen Titel,
   >155 Description), fehlendes Ziel-Keyword, generische Formulierungen.
4. **`meta-keywords` aufspüren.** Im Quellcode sollten keine mehr sein (veraltet, ohne Wirkung).
   Falls doch → melden. Auf `.vercel.app` sind sie nur Cache-Artefakt.

### B. Technik

5. **Sitemap-Drift:** `src/app/sitemap.ts` pflegt eine **manuelle** Liste. Gegen die real
   existierenden Routen abgleichen → fehlende Seiten (z.B. `/download`, `/install`, `/extensions`?)
   und Karteileichen. Prioritäten/changeFrequency auf Plausibilität prüfen.
6. **noindex-Audit:** `dashboard`, `payment`, `login`, `register`, `redeem`, `verify-email`,
   `sso-welcome`, `library` — sollten nicht indexiert werden. Ist-Zustand prüfen
   (`library` ist laut Kommentar bewusst noindex und nicht in der Sitemap).
7. **JSON-LD-Abdeckung + Validität:** Welche Seiten haben keins? Syntax gegen schema.org prüfen.
   Kandidaten: `/download` (SoftwareApplication), `/faq` (FAQPage), `/changelog`, Guides-Übersicht.
8. **Interne Verlinkung:** verwaiste Seiten finden (nicht aus Header/Footer/Content verlinkt).
   Ankertexte auf Keyword-Relevanz prüfen — aktuell viel „Mehr erfahren".

### C. Live-Daten (Browser, nicht WebSearch)

9. **Ist-Rankings** für Marken- und Nicht-Marken-Begriffe erheben, z.B.:
   „LoRA Fine-Tuning lokal", „KI-Modell lokal trainieren", „beste GPU LLM Training",
   „QLoRA Tutorial", „HuggingFace Modell fine-tunen ohne Cloud" — jeweils de + en.
10. **Welche URLs** rankt Google aktuell für welche Begriffe? Daraus ableiten, wo bestehende
    Seiten nur knapp danebenliegen (Position 5–20 = größter Hebel durch Optimierung
    statt Neubau).

---

## 5. Ergebnis

**Ein Report** (Markdown, im Repo ablegen), enthaltend:

- Metadaten-Inventartabelle aller Routen
- Priorisierte Mängelliste: kritisch / mittel / kosmetisch, je mit Datei + Zeile
- Keyword-Lücken-Analyse: wofür rankt die Site, wofür nicht, wo ist sie nah dran
- Empfehlung: **Optimieren vs. Neu bauen** — mit Begründung je Vorschlag

## 6. Leitplanken

- **Keine neuen Seiten in dieser Session.** Erst Analyse, Entscheidung fällt gemeinsam danach.
- **Keine Doorway-Pages / Thin Content.** Seiten müssen für Menschen echten Wert haben,
  sonst schadet es der Domain. Google bestraft das aktiv.
- **Keine Keyword-Stuffing-Vorschläge**, kein `meta-keywords` wieder einführen.
- Änderungen nur auf einem Branch, `npx tsc --noEmit` muss grün bleiben.
- `next build` dauert >2 Min — bei Timeouts ist das kein Fehlschlag.
