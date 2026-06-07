# Codex Status-Update API

Codex kann täglich automatisch einen Entwicklungsstand auf die FrameTrain-Website posten.
Der Endpoint ist gesichert durch einen API-Key.

## Setup

### 1. Env-Variable setzen

In `.env.local` (und im Deployment):

```
CODEX_API_KEY=dein-geheimes-token-hier
```

### 2. Prisma Migration ausführen

```bash
npx prisma migrate dev --name add_status_updates
```

---

## API-Aufruf (Codex Automation)

### Endpoint
```
POST https://frame-train.vercel.app/api/status-updates
```

### Header
```
Authorization: Bearer <CODEX_API_KEY>
Content-Type: application/json
```

### Payload-Schema

```json
{
  "title": "Kurze Überschrift (max 200 Zeichen)",
  "body": "Detaillierter Text – Markdown-formatiert",
  "type": "status",
  "appVersion": "0.9.3-dev",
  "author": "Codex"
}
```

#### `type` Optionen
| Wert        | Beschreibung                        | Farbe  |
|-------------|-------------------------------------|--------|
| `status`    | Allgemeines tägliches Update        | Blau   |
| `dev`       | Technisches Dev-Update              | Cyan   |
| `hotfix`    | Kurzfristiger Fix                   | Orange |
| `milestone` | Großer Fortschritt / Meilenstein    | Lila   |

---

## Empfohlenes Body-Format für Codex

```markdown
### Was wurde heute gemacht
- **Synapse Builder**: Canvas-Persistence via IndexedDB implementiert
- **Training Engine**: Eval-Loss-Spike-Filter verbessert
- **Dashboard**: Globale Training-Progress-Pill eingebaut

### Aktueller Stand
Die Desktop-App befindet sich in aktiver Entwicklung. Release geplant für 29. Juni 2026.

### Nächste Schritte
- Plugin-Architektur für neue Modelltypen
- Laboratory-Feature stabilisieren
```

---

## Beispiel-curl

```bash
curl -X POST https://frame-train.vercel.app/api/status-updates \
  -H "Authorization: Bearer $CODEX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Synapse Builder: Canvas-Persistence gefixt",
    "body": "### Was wurde gemacht\n- **Canvas-Nodes** bleiben jetzt nach App-Neustart erhalten\n- Eval-Loss-Spike-Filterung verbessert\n- MPS-Kompatibilität für Apple Silicon stabilisiert",
    "type": "hotfix",
    "appVersion": "0.9.3-dev",
    "author": "Codex"
  }'
```

## Response

```json
{ "success": true, "id": "clxyz..." }
```

---

## Wo erscheinen die Updates?

1. **Changelog-Seite** (`/changelog`) – oben als eigener Abschnitt „Entwicklungsstand"
2. **Header-Modal** – 🔔 Bell-Icon in der Navigation öffnet ein Modal mit den neuesten Einträgen
3. **Unread-Badge** – rote Zahl am Bell-Icon für noch nicht gesehene Updates
