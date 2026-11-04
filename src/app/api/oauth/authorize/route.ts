import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { AUTH_CODE_TTL_MS } from '@/lib/mcp/config'
import { randomSecret, sha256Hex } from '@/lib/mcp/crypto'
import { buildClientRedirect, verifyConsentTicket } from '@/lib/mcp/authorize'
import { resolveClient } from '@/lib/mcp/clients'

// Formular-Ziel der Zustimmungsseite /[locale]/oauth/authorize.
// Das Ticket bindet die bereits geprueften Parameter an den Nutzer; das
// auth-token-Cookie (SameSite=Lax) muss zum Ticket passen.
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const ticket = verifyConsentTicket(form.get('ticket'))
  const user = await getCurrentUser()
  if (!ticket || !user || user.userId !== ticket.userId) {
    return NextResponse.json({ error: 'Die Anfrage ist abgelaufen. Bitte starte die Verbindung erneut.' }, { status: 400 })
  }
  const p = ticket.params
  const client = await resolveClient(p.clientId)
  if (!client) return NextResponse.json({ error: 'Unbekannter Client' }, { status: 400 })

  if (form.get('decision') !== 'approve') {
    return NextResponse.redirect(
      buildClientRedirect(p.redirectUri, { error: 'access_denied', error_description: 'The user denied the request', state: p.state }),
      303,
    )
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { hasPaid: true } })
  if (!dbUser?.hasPaid) {
    return NextResponse.redirect(
      buildClientRedirect(p.redirectUri, { error: 'access_denied', error_description: 'No active FrameTrain subscription', state: p.state }),
      303,
    )
  }

  await prisma.mcpConnection.upsert({
    where: { userId_clientId: { userId: user.userId, clientId: client.clientId } },
    create: { userId: user.userId, clientId: client.clientId, clientName: client.clientName },
    update: { clientName: client.clientName, revokedAt: null },
  })

  const code = randomSecret('ftac_')
  await prisma.oAuthAuthCode.create({
    data: {
      codeHash: sha256Hex(code),
      clientId: client.clientId,
      userId: user.userId,
      redirectUri: p.redirectUri,
      codeChallenge: p.codeChallenge,
      scope: p.scope,
      resource: p.resource,
      expiresAt: new Date(Date.now() + AUTH_CODE_TTL_MS),
    },
  })

  return NextResponse.redirect(buildClientRedirect(p.redirectUri, { code, state: p.state }), 303)
}
