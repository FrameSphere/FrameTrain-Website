# Bericht Strang C – Website: Remote-MCP, Relay, OAuth 2.1

Stand 2026-11-04, Branch `claude/mcp-remote-0a31d3`. Nicht gemergt, nicht gepusht, keine Produktions-DB angefasst.
Vertrag: [`CONTRACT.md`](CONTRACT.md) (Kopie aus `FrameTrain/docs/mcp/`).

## Ergebnis

- `npm run build`: grün.
- `npm test` (neu, vitest): 51 Tests grün (JSON-RPC-Dispatcher, PKCE, Token-Rotation/Replay, Auth-Code, Job-Lebenszyklus, DCR/CIMD/Redirect-Regeln, Manifest-Normalisierung, Origin-Prüfung).
- Ende-zu-Ende lokal geprüft gegen `next dev` + Wegwerf-Postgres (PGlite, nur im Scratchpad):
  Discovery-Dokumente, 401 mit `WWW-Authenticate`, CORS-Preflight, DCR, Login mit Rücksprung,
  Zustimmungsseite, Code mit `state` + `iss`, Token-Tausch mit PKCE, Code-Wiederverwendung abgelehnt,
  `initialize`/`notifications/initialized` (202)/`tools/list`/`tools/call`, Fallback-Manifest ohne Gerät,
  Heartbeat/Manifest/Poll/Result mit simulierter App, 50-s-Timeout (`expired` + Hinweistext),
  25-s-Long-Poll, Refresh-Rotation, Replay sperrt ganze Token-Familie, Trennen im Dashboard sperrt sofort.
  Zusätzlich offizieller MCP Inspector im CLI-Modus (`tools/list`, `tools/call`) – läuft.
- Migration gegen Postgres getestet: läuft, ist idempotent (zweimal ausführbar), kein Drift zum Prisma-Schema.

## Routen

| Route | Zweck |
|---|---|
| `POST /api/mcp` | Remote-MCP, Streamable HTTP, zustandslos, JSON-Antworten. `GET`/`DELETE` → 405. Bearer-Token Pflicht, sonst 401 + `WWW-Authenticate: Bearer resource_metadata="…/.well-known/oauth-protected-resource", scope="frametrain"` |
| `GET /.well-known/oauth-protected-resource` (auch `…/api/mcp`) | RFC 9728 (Rewrite auf `/api/oauth/metadata/protected-resource`) |
| `GET /.well-known/oauth-authorization-server` | RFC 8414 (Rewrite auf `/api/oauth/metadata/authorization-server`) |
| `POST /api/oauth/register` | DCR (RFC 7591), nur öffentliche Clients, Rate-Limit 30/h je IP |
| `/oauth/authorize` → `/[locale]/oauth/authorize` | Zustimmungsseite (Website-Login, Abo-Prüfung `hasPaid`, DE+EN) |
| `POST /api/oauth/authorize` | Formular-Ziel der Zustimmung (signiertes Ticket + Cookie müssen zusammenpassen) |
| `POST /api/oauth/token` | `authorization_code` (PKCE S256 Pflicht) und `refresh_token` (rotierend); form-urlencoded, JSON tolerant |
| `POST /api/oauth/revoke` | RFC 7009, widerruft die ganze Token-Familie |
| `POST /api/desktop/mcp/heartbeat` · `manifest` · `poll` · `result` · `status` · `disconnect` | Relay laut Vertrag Abschnitt 5, Auth per `apiKey` im Body (`userIdForApiKey`) |
| `GET/POST /api/user/mcp` | Dashboard (Cookie-Login): Status lesen, Verbindung trennen |
| `/[locale]/dashboard/ai-connections` | Dashboard-Seite „KI-Verbindungen“, verlinkt als Karte im Dashboard |
| `/[locale]/docs/mcp` | Öffentliche Doku (DE+EN): Funktionsweise, Voraussetzungen, Einrichtung Claude/ChatGPT/lokal, Werkzeugübersicht, Freigaben, Datenschutz-Link, Fehlerbehebung. In der Sitemap; `service_documentation`/`resource_documentation` zeigen darauf |
| `GET /.well-known/openai-apps-challenge` | OpenAI-Domain-Verifizierung: liefert nur den Token aus `OPENAI_APPS_CHALLENGE_TOKEN` als Klartext (404, wenn nicht gesetzt) |

`maxDuration`: `/api/mcp` = 60 s (wartet bis 50 s), `/api/desktop/mcp/poll` = 35 s (hält bis 25 s). `vercel.json` hat keine `functions`-Einträge, daher per Route-Segment gesetzt. Auf Vercel Hobby ohne Fluid Compute liegt die Grenze bei 60 s – passt.

### Abweichungen/Ergänzungen zum Vertrag (bitte an Strang B weitergeben)

- `/status` liefert je Verbindung zusätzlich `id` (= `connectionId` für `/disconnect`) und `clientId`, außerdem `devices[]` (Name, Version, online, Werkzeuganzahl). Die vertraglichen Felder sind unverändert vorhanden.
- `/poll` antwortet `409`, wenn das Gerät noch nie einen Heartbeat geschickt hat; `/result` antwortet `409` bei unbekanntem/abgeschlossenem Job und `400` bei ungültigem `CallToolResult`.
- `tools/call` auf ein Werkzeug, das nicht im Manifest steht, wird trotzdem an die App weitergereicht (die App entscheidet).
- `tools/list` liefert jedes Werkzeug mit `title` (Fallback aus dem Namen, z. B. `models_list` → „Models list“) und vollständigen `annotations`: fehlende Werte bekommen die sicheren MCP-Standardwerte (`readOnlyHint: false`, `destructiveHint: true`, `openWorldHint: true`; `destructiveHint` ist `false`, wenn `readOnlyHint: true`). `_meta["frametrain/approval"] = "always"` erzwingt `destructiveHint: true` und `readOnlyHint: false`. `annotations.title` = `title`. Strang A sollte die Werte trotzdem bewusst setzen, sonst wirkt z. B. ein lokales Werkzeug als „offene Welt“.
- `/api/mcp` prüft den `Origin`-Header: erlaubt sind kein Origin (Server-zu-Server, so rufen Claude und ChatGPT an), `https://claude.ai`, `https://claude.com`, `https://chatgpt.com`, `https://chat.openai.com`, die eigene Website, `http(s)://localhost|127.0.0.1|[::1]` mit beliebigem Port (Inspector) und optional `MCP_ALLOWED_ORIGINS` (kommagetrennt). Alles andere (auch `null`, Look-alikes wie `claude.ai.evil.example`, `http://claude.ai`) → 403.
- Zusätzlich beantwortet `/api/mcp` `resources/list`, `resources/templates/list`, `prompts/list` mit leeren Listen (manche Clients fragen das ab).

## Sicherheit / Umsetzung

- Tokens opak (`ftat_…`, `ftrt_…`, Codes `ftac_…`), in der DB nur SHA-256. Access 1 h, Refresh 30 Tage, Code 10 min.
- Refresh rotiert; ein bereits eingelöstes Refresh-Token sperrt die ganze Familie (Replay-Schutz). Bewusst ohne Kulanzfenster – wenn ein Client nach einem Netzfehler denselben Refresh wiederholt, muss der Nutzer neu verbinden. Falls das in der Praxis stört: kurzes Fenster (z. B. 30 s) einbauen.
- Redirect-URIs: https Pflicht, http nur für `localhost`/`127.0.0.1`/`[::1]`; bei Loopback wird der Port ignoriert (Claude Code). Ohne gültige `redirect_uri` gibt es eine Fehlerseite statt Umleitung (kein Open Redirect). Alle Antworten an den Client tragen `iss` (RFC 9207) → ChatGPT kann die stabile Redirect-URI nutzen.
- CIMD: `client_id` als HTTPS-URL wird geladen (5 s Timeout, 64 KB, keine Redirects, `client_id` muss übereinstimmen), in `oauth_clients` gecacht und beim Authorize alle 24 h aufgefrischt. SSRF-Schutz nur auf Hostnamen-Ebene (keine IP-Literale/localhost); DNS auf private Adressen wird nicht geprüft – auf Vercel unkritisch, notiert.
- Zustimmung: signiertes Ticket (JWT, 10 min, gebunden an Nutzer + geprüfte Parameter); das `auth-token`-Cookie (SameSite=Lax) muss zum Ticket passen. Seite zeigt Ziel-Host und warnt, wenn der Client nur auf localhost umleitet (MCP-Spezifikation).
- Login-Rücksprung: neuer Helfer `src/lib/post-login.ts` (`safeNextPath`), E-Mail-Login und Google/GitHub/FrameSphere führen nach dem Login zurück zur Zustimmung (Cookie `post_login_next`, 15 min, nur relative Pfade).
- CORS: `/api/mcp`, `/api/oauth/*`, `/.well-known/*` mit `Access-Control-Allow-Origin: *` ohne Credentials, inkl. `Mcp-Protocol-Version`, Expose `WWW-Authenticate` (in `src/middleware.ts`). Übrige `/api`-Routen unverändert.
- Jobs: Abholen per `UPDATE … FOR UPDATE SKIP LOCKED RETURNING` (zwei Polls bekommen nie denselben Job). Nicht abgeholte Jobs nach 2 min `expired`.
- Aufräumen: bei ~2 % der Token-Requests werden abgelaufene Codes/Tokens und Jobs > 30 Tage gelöscht (kein neuer Cron – Hobby-Plan hat schon 2).

## Umgebungsvariablen

Keine neuen Pflichtvariablen. Genutzt werden:

| Variable | Wirkung |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Basis für Issuer, `resource` (`…/api/mcp`) und Metadaten. Muss in Produktion `https://frame-train.com` sein (Default). |
| `MCP_PUBLIC_URL` (optional) | Überschreibt die Basis nur für MCP/OAuth, z. B. für Preview-Deployments. |
| `JWT_SECRET` | Signiert zusätzlich das Zustimmungs-Ticket (bestehende Variable). |
| `OPENAI_APPS_CHALLENGE_TOKEN` (für die ChatGPT-Einreichung) | Token aus dem OpenAI-Portal; wird unter `/.well-known/openai-apps-challenge` ausgeliefert. |
| `MCP_ALLOWED_ORIGINS` (optional) | Zusätzliche erlaubte Origins für `/api/mcp`, kommagetrennt. |

Wichtig: `resource` muss exakt der URL entsprechen, die Nutzer in Claude/ChatGPT eintragen (`https://frame-train.com/api/mcp`, ohne `www`).

## Migrationsschritte für Karol

1. SQL prüfen: `prisma/migrations/20261104000000_mcp_remote/migration.sql` (6 neue Tabellen, Indizes, Fremdschlüssel, RLS an – wie `enable-rls.sql`). Rein additiv, idempotent.
2. **Vor** dem Deploy gegen Supabase ausführen, z. B. im Supabase-SQL-Editor oder
   `DATABASE_URL=<direkte Verbindung> npx prisma db execute --file prisma/migrations/20261104000000_mcp_remote/migration.sql --schema prisma/schema.prisma`
   (Achtung `.env` vs `.env.local`, siehe Memory „FrameTrain Supabase-DB“).
3. Optional als angewendet markieren: `npx prisma migrate resolve --applied 20261104000000_mcp_remote` (nur falls ihr `_prisma_migrations` pflegt).
4. Branch reviewen/mergen → Vercel deployt. Danach prüfen:
   `curl -i -X POST https://frame-train.com/api/mcp` → 401 mit `WWW-Authenticate`,
   `curl https://frame-train.com/.well-known/oauth-authorization-server` → JSON.
5. Hinweis: `src/lib/prisma.ts` loggt jede Query (`log: ['query', …]`). Mit Long-Poll (1 Query/s je online-App) wird das Vercel-Log sehr laut – empfehle `query` aus dem Log zu nehmen (nicht Teil dieses Branches).

## Lokal testen

```bash
npm test
npm run build
```

End-to-End ohne Produktions-DB: Postgres (oder PGlite-Socket-Server) starten, Basisschema + Migration einspielen, dann
`DATABASE_URL=… JWT_SECRET=… NEXT_PUBLIC_SITE_URL=http://localhost:5002 npx next dev -p 5002` und
`npx @modelcontextprotocol/inspector` mit Transport „Streamable HTTP“ auf `http://localhost:5002/api/mcp` (OAuth-Flow im Inspector).
Die Desktop-App lässt sich per curl simulieren (`/api/desktop/mcp/heartbeat` → `manifest` → `poll` → `result`).

## Was für die Einreichung noch fehlt

**Beide**
- Datenschutz: Abschnitt „9a. KI-Verbindungen (MCP)“ in `messages/{de,en}.json` ist ein **Entwurf – Karol muss ihn prüfen** (Rechtsgrundlage, Speicherdauer 30 Tage, Empfänger Anthropic/OpenAI). Privacy-URL für die Formulare: `https://frame-train.com/de/privacy` bzw. `/en/privacy`. Ggf. AGB um KI-Verbindungen ergänzen und `CURRENT_TERMS_VERSION` anheben.
- Werkzeug-Annotations: beide Verzeichnisse verlangen `readOnlyHint`/`destructiveHint` (ChatGPT zusätzlich `openWorldHint`) an jedem Werkzeug und präzise Beschreibungen → Strang A (Manifest). Die Website reicht `annotations` unverändert durch.
- Test-Zugang für Reviewer: ein Konto mit aktivem Zugang (z. B. Lifetime-Promo) **und** eine laufende App mit Fernzugriff bzw. ein Demo-Gerät – sonst sehen Reviewer nur `system_status`. Überlegen: Demo-Modus/Beispieldaten.
- Logo/Icon, Kurzbeschreibung, Support-Kontakt, Beispiel-Prompts. Doku-Link für beide: `https://frame-train.com/en/docs/mcp` (bzw. `/de/docs/mcp`).

**Claude (Custom Connector / Connectors Directory)**
- Custom Connector funktioniert sofort mit `https://frame-train.com/api/mcp` (DCR und CIMD werden angeboten; Callback `https://claude.ai/api/mcp/auth_callback` wird per DCR/CIMD registriert; Claude Code per Loopback).
- Für das Verzeichnis: Einreichung über das Developer-Portal (claude.ai/directory/manage), Server muss von `160.79.104.0/21` erreichbar sein (keine WAF-Sperre), Token-Endpunkt < 10 s.

**ChatGPT (Apps SDK)**
- Was in die App-Konfiguration gehört:
  - Öffentliche Domain / MCP-URL: `https://frame-train.com/api/mcp`, Authentifizierung OAuth (DCR und CIMD werden unterstützt).
  - Domain-Verifizierung: Token aus dem Portal in Vercel als `OPENAI_APPS_CHALLENGE_TOKEN` setzen, deployen, dann prüft OpenAI `https://frame-train.com/.well-known/openai-apps-challenge` (liefert nur den Token).
  - CSP (`connectDomains`, `resourceDomains`, `frameDomains`, Widget-Domain): gilt laut OpenAI-Referenz nur für UI-Komponenten (Resource-Templates mit `_meta.ui.csp`). FrameTrain liefert keine Widgets, also leer lassen; falls das Formular einen Wert verlangt: `connectDomains: ["https://frame-train.com"]`, `resourceDomains: []`, keine `frameDomains`. Erst bei späteren Widgets wird eine eigene Widget-Domain Pflicht.
  - Pflicht-URLs: `privacyPolicyURL` `https://frame-train.com/en/privacy`, `termsOfServiceURL` `https://frame-train.com/en/terms`, `websiteURL` `https://frame-train.com`, `supportURL`: eine öffentliche Support-Seite fehlt noch (Support läuft heute über das Dashboard) – z. B. `https://frame-train.com/en/faq` oder eine eigene Kontaktseite anlegen. Doku: `https://frame-train.com/en/docs/mcp`.
  - Review: Testkonto ohne MFA mit Beispieldaten, Demo-Video (`review.demo_recording_url`), 5 positive und 3 negative Testfälle (`review.test_cases`).
- Im Entwicklermodus sofort testbar. Für die Veröffentlichung: verifizierte Organisation im OpenAI-Plattform-Dashboard, App-Einreichung mit Privacy-URL, Test-Zugang, und die im Dashboard angezeigte Produktions-Redirect-URI allowlisten (wir unterstützen die stabile `https://chatgpt.com/connector_platform_oauth_redirect` dank `iss`).
- Optional: `securitySchemes` je Werkzeug / `_meta["mcp/www_authenticate"]` für werkzeugweises Linking – derzeit nicht nötig, weil der ganze Server Login verlangt.

## Offene Punkte / Ideen

- Long-Poll per DB-Polling (1 s). Bei vielen gleichzeitigen Apps auf Postgres `LISTEN/NOTIFY` oder einen Key-Value-Store umstellen.
- Rate-Limits sind In-Memory (wie im restlichen Projekt) – pro Serverless-Instanz.
- `graphify update .` nicht ausgeführt: der Graph liegt untracked im Haupt-Checkout, nicht in diesem Worktree.
