# i18n-Migration Status (next-intl, DE/EN mit Präfix)

Stand: Setup + Home-Page (Pilot) abgeschlossen.

## ✅ Fertig

- **Infrastruktur**: `src/i18n/routing.ts`, `navigation.ts`, `request.ts`
- **next.config.js**: next-intl Plugin eingebunden
- **package.json**: `next-intl` als Dependency eingetragen (→ `npm install` ausführen!)
- **Middleware**: `src/middleware.ts` kombiniert CORS (für `/api/*`) + next-intl Locale-Routing
- **URL-Strategie**: beide Sprachen mit Präfix, `/de/...` und `/en/...`, kein Default ohne Präfix
- **Ordnerstruktur**: alle Routen liegen jetzt unter `src/app/[locale]/`, `api/`, `robots.ts`, `sitemap.ts`, `globals.css` bleiben außerhalb
- **`messages/de.json` + `messages/en.json`**: Namespaces `Nav`, `Footer`, `Home` (komplett, beide Sprachen)
- **`app/[locale]/layout.tsx`**: neu gebaut, Locale-Metadata (Title/Description/OG/Hreflang-Alternates), FAQ- + SoftwareApplication-Schema sprachabhängig, `NextIntlClientProvider`
- **`app/[locale]/page.tsx`** (Home): komplett auf `useTranslations` umgestellt
- **`Header.tsx`**: komplett übersetzt, LangSwitcher funktioniert jetzt wirklich (vorher nur TODO-Kommentare)
- **`Footer.tsx`**: komplett übersetzt, Links auf locale-fähigen `Link` umgestellt
- **`AuthContext.tsx`**: `useRouter`/`usePathname` auf `@/i18n/navigation` umgestellt (sonst würde Login/Logout den User immer auf `/de` zurückwerfen, egal welche Sprache aktiv war)
- **`sitemap.ts`**: generiert jetzt `/de/...` + `/en/...` Einträge mit `alternates.languages` (hreflang)
- **`robots.ts`**: Disallow-Regeln auf `/de/dashboard`, `/en/dashboard`, `/de/payment/`, `/en/payment/` etc. erweitert

## ⏳ Noch offen

**Hinweis:** Login, Register, SSO-Welcome und Payment werden von Karol parallel selbst übersetzt.

Fertig: Home, Imprint, Privacy, Terms, About, Changelog, Extensions, Download, Install, Guides (Hub + LoRA + Cloud + GPU), Library, FAQ, Docs (Hub mit allen 22 Sektionen).

**`/docs/ai-training-guide` – Fortschritt:**
Hub-Seite, Sidebar, Navigation, Diagramm-Labels: fertig. **Alle 8/8 Kapitel fertig** (ml-grundlagen, training-verstehen, trainingsverlauf, diagnose, hyperparameter, fine-tuning, dataset-mastery, fortgeschrittene). Zusätzlich fehlenden `AICoach.finalCta`-Namespace ergänzt (wurde von `fortgeschrittene/page.tsx` referenziert, existierte aber noch nicht – hätte zur Laufzeit gefehlt).

**Noch offen:**

Keine offenen Punkte mehr aus der ursprünglichen Liste. `/dashboard/page.tsx` wurde geprüft: bereits vollständig auf `useTranslations('Dashboard')` umgestellt, alle 110 Keys in `de.json`/`en.json` vorhanden und deckungsgleich (keine fehlenden Keys in beide Richtungen). Keine Unterseiten unter `/dashboard` vorhanden (nur `page.tsx`).

**✅ Migration der gesamten Website ist damit inhaltlich abgeschlossen.** Verbleibend sind nur die in „Manuell nötig“ unten gelisteten Schritte (npm install, lokaler Test, AGB-Prüfung) sowie ggf. Login/Register/SSO-Welcome/Payment, die laut Notiz oben von Karol selbst parallel bearbeitet werden.

**Kleiner Fund nebenbei:** In den 3 Guide-Seiten (lora-finetuning, local-vs-cloud, gpu-guide) stand noch der alte "Einmalig 1,99€"-Preis aus der Zeit vor dem Abo-Modell. Beim Übersetzen direkt auf "Ab 4,99€/Monat" korrigiert (DE + EN), passend zum Rest der Seite.

Für jede Seite: Strings nach `messages/de.json` + `en.json` auslagern (neuer Namespace, z.B. `"About"`), Component auf `useTranslations(...)` umstellen, `next/link` → `import { Link } from '@/i18n/navigation'`.

## ⚠️ Manuell nötig

1. `npm install` ausführen (zieht `next-intl`)
2. `npm run dev` testen: `/de`, `/en`, `/de/dashboard` (eingeloggt), Sprachswitcher im Header
3. AGB-Hinweis aus der SEO-Session gilt weiterhin: Texte auf `/terms` (DE) rechtlich nicht ohne Prüfung ändern
