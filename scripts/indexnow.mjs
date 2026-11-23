#!/usr/bin/env node
/*
 * IndexNow: meldet geänderte URLs sofort an Bing (und Yandex, Seznam, Naver …).
 * ChatGPTs Websuche stützt sich stark auf den Bing-Index – neue Seiten
 * landen so in Stunden statt Wochen dort.
 *
 * Der Schlüssel ist bewusst öffentlich: Bing prüft über die Datei
 * public/<key>.txt, dass die Domain uns gehört. Kein Geheimnis.
 *
 * Aufruf (erst NACH dem Deploy, die Seiten müssen live sein):
 *   npm run indexnow                      → alle URLs aus der Live-Sitemap
 *   npm run indexnow -- /en/compare /de/compare   → nur diese Pfade
 *   npm run indexnow -- --dry-run         → nur anzeigen, nichts senden
 */

const KEY = '6465720245d263b99463be354963fe1d'
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://frame-train.com').replace(/\/$/, '')
const host = new URL(SITE).host

async function sitemapUrls() {
  const res = await fetch(`${SITE}/sitemap.xml`)
  if (!res.ok) throw new Error(`Sitemap nicht erreichbar: ${res.status}`)
  const xml = await res.text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
}

const dryRun = process.argv.includes('--dry-run')
const args = process.argv.slice(2).filter((a) => a !== '--dry-run')
const urlList = args.length
  ? args.map((p) => (p.startsWith('http') ? p : `${SITE}${p.startsWith('/') ? '' : '/'}${p}`))
  : await sitemapUrls()

if (!urlList.length) {
  console.error('Keine URLs gefunden.')
  process.exit(1)
}
if (urlList.some((u) => new URL(u).host !== host)) {
  console.error(`Alle URLs müssen auf ${host} liegen.`)
  process.exit(1)
}

// Schlüsseldatei muss live sein, sonst lehnt IndexNow mit 403 ab
const keyRes = await fetch(`${SITE}/${KEY}.txt`)
if (!keyRes.ok || (await keyRes.text()).trim() !== KEY) {
  console.error(`Schlüsseldatei ${SITE}/${KEY}.txt ist (noch) nicht live – erst deployen.`)
  process.exit(1)
}

if (dryRun) {
  console.log(`Dry run – würde ${urlList.length} URLs für ${host} melden:`)
  urlList.forEach((u) => console.log('  ' + u))
  process.exit(0)
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
})
// 200 = angenommen, 202 = angenommen, Schlüssel wird noch geprüft
console.log(`IndexNow: ${res.status} ${res.statusText} – ${urlList.length} URLs gemeldet`)
if (!res.ok) {
  console.error(await res.text())
  process.exit(1)
}
