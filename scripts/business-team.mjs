#!/usr/bin/env node
// FrameTrain Business von Hand verwalten (Anfrage per Mail, Zahlung per Rechnung).
//
//   node scripts/business-team.mjs list
//   node scripts/business-team.mjs create --email kunde@firma.de --name "Muster GmbH" [--seats 5] [--until 2027-01-01]
//   node scripts/business-team.mjs until  --email kunde@firma.de --until 2027-02-01
//   node scripts/business-team.mjs seats  --email kunde@firma.de --seats 8
//
// --until = bezahlt bis (Ende des Rechnungszeitraums). Danach sperrt die App
// alle Plaetze und den Inhaber, bis du verlaengerst. Ohne --until haengt der
// Zugang wie bisher am Abo des Inhabers (hasPaid).
// Braucht DATABASE_URL (z. B. aus .env.local: `node --env-file=.env.local scripts/business-team.mjs ...`).
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const [cmd, ...rest] = process.argv.slice(2)
const args = {}
for (let i = 0; i < rest.length; i += 2) args[rest[i].replace(/^--/, '')] = rest[i + 1]

function date(v) {
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) throw new Error(`Ungueltiges Datum: ${v}`)
  return d
}
async function owner() {
  if (!args.email) throw new Error('--email fehlt')
  const user = await prisma.user.findUnique({ where: { email: args.email.toLowerCase() } })
  if (!user) throw new Error(`Kein Konto mit ${args.email} — die Person muss sich zuerst registrieren.`)
  return user
}

async function main() {
  if (cmd === 'list') {
    const teams = await prisma.team.findMany({ include: { owner: { select: { email: true } }, _count: { select: { seats: true } } } })
    for (const t of teams) {
      console.log(`${t.name}  ·  ${t.owner.email}  ·  ${t._count.seats + 1}/${t.seatLimit} Personen  ·  bezahlt bis ${t.accessUntil?.toISOString().slice(0, 10) ?? '(Abo)'}`)
    }
    if (!teams.length) console.log('Noch keine Business-Teams.')
  } else if (cmd === 'create') {
    const user = await owner()
    if (!args.name) throw new Error('--name fehlt')
    const team = await prisma.team.create({
      data: {
        ownerId: user.id,
        name: args.name,
        seatLimit: args.seats ? Number(args.seats) : 5,
        accessUntil: args.until ? date(args.until) : null,
      },
    })
    // Inhaber braucht einen eigenen aktiven Schluessel; den legt er wie gewohnt im Dashboard an.
    console.log(`Team "${team.name}" angelegt (${team.seatLimit} Personen). Plaetze vergibt der Inhaber im Dashboard.`)
  } else if (cmd === 'until') {
    const user = await owner()
    const team = await prisma.team.update({ where: { ownerId: user.id }, data: { accessUntil: date(args.until) } })
    console.log(`Bezahlt bis ${team.accessUntil.toISOString().slice(0, 10)}.`)
  } else if (cmd === 'seats') {
    const user = await owner()
    const team = await prisma.team.update({ where: { ownerId: user.id }, data: { seatLimit: Number(args.seats) } })
    console.log(`Jetzt ${team.seatLimit} Personen.`)
  } else {
    console.log('Befehle: list | create | until | seats  (Kopf der Datei zeigt die Beispiele)')
  }
}

main()
  .catch((e) => { console.error(e.message || e); process.exitCode = 1 })
  .finally(() => prisma.$disconnect())
