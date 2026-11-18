import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { CURRENT_TERMS_VERSION } from '@/lib/legal-version'
import { cleanDeviceName, decideDevice, isTeamRole, teamHasAccess, type TeamInfo } from '@/lib/team'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + WINDOW_MS })
    return { allowed: true }
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }

  record.count++
  return { allowed: true }
}

export async function POST(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown'

    // Parse request body
    const body = await req.json()
    const { apiKey, password, deviceId, deviceName, takeover } = body

    // API-Key ist immer erforderlich; Passwort nur für Email-Accounts
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'API-Key ist erforderlich',
          isValid: false 
        },
        { status: 400 }
      )
    }

    // Check rate limit
    // Pro IP und Schluessel: In einer Firma melden sich bis zu 5 Personen hinter
    // derselben IP an (jeder App-Start zaehlt) — die sollen sich nicht
    // gegenseitig aussperren. Passwort-Raten bleibt je Schluessel begrenzt.
    const rateLimitCheck = checkRateLimit(`${clientIp}|${String(apiKey).slice(0, 24)}`)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          error: `Zu viele Versuche. Bitte warte ${rateLimitCheck.retryAfter} Sekunden.`,
          isValid: false 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimitCheck.retryAfter)
          }
        }
      )
    }

    // 1. Validate API-Key format
    if (!apiKey.startsWith('ft_') || apiKey.length < 24) {
      return NextResponse.json(
        { 
          error: 'Ungültiges API-Key Format',
          isValid: false 
        },
        { status: 400 }
      )
    }

    // 2. Find API key in database
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            passwordHash: true,
            desktopPasswordHash: true,
            hasPaid: true,
            termsAcceptedAt: true,
            termsVersion: true,
            diagnosticsConsent: true,
            ownedTeam: { select: { id: true, name: true, seatLimit: true, accessUntil: true } },
          }
        },
        // Business-Platz: eigener Schluessel einer Person im Team des Inhabers
        seat: {
          include: { team: { select: { id: true, name: true, seatLimit: true, accessUntil: true } } },
        },
      }
    })

    if (!apiKeyRecord) {
      return NextResponse.json(
        { 
          error: 'API-Key nicht gefunden oder ungültig',
          isValid: false 
        },
        { status: 401 }
      )
    }

    // 3. Check if key is active (gesperrter Business-Platz mit eigener Meldung)
    if (apiKeyRecord.seat && !apiKeyRecord.seat.isActive) {
      return NextResponse.json(
        { error: 'Dieser Platz wurde vom Team-Inhaber gesperrt.', isValid: false, seatLocked: true },
        { status: 401 }
      )
    }
    if (!apiKeyRecord.isActive) {
      return NextResponse.json(
        { 
          error: 'API-Key ist deaktiviert',
          isValid: false 
        },
        { status: 401 }
      )
    }

    // 4. Check if key is expired
    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { 
          error: 'API-Key ist abgelaufen',
          isValid: false 
        },
        { status: 401 }
      )
    }

    const seat = apiKeyRecord.seat

    // 4b. Business-Platz: Passwort noch nicht festgelegt
    if (seat) {
      if (!seat.desktopPasswordHash) {
        return NextResponse.json(
          {
            error: 'Lege für deinen Platz ein eigenes Passwort fest.',
            isValid: false,
            needsSeatPassword: true,
            seatName: seat.name,
            teamName: seat.team.name,
          },
          { status: 403 }
        )
      }
    }

    // 5. Verify password
    // Business-Platz: eigenes Passwort der Person. Sonst Priorität:
    // desktopPasswordHash (gesetzt via Dashboard) > passwordHash (Email-Accounts)
    const { desktopPasswordHash, passwordHash } = apiKeyRecord.user
    const hashToCheck = seat ? seat.desktopPasswordHash : (desktopPasswordHash || passwordHash)

    if (!hashToCheck) {
      // OAuth-User ohne gesetztes Desktop-Passwort
      return NextResponse.json(
        {
          error: 'Kein Desktop-Passwort gesetzt. Bitte besuche frame-train.com/dashboard und setze ein Desktop-Passwort unter "Desktop-App".',
          isValid: false,
          needsDesktopPassword: true,
        },
        { status: 403 }
      )
    }

    if (!password) {
      return NextResponse.json(
        {
          error: 'Passwort ist erforderlich',
          isValid: false
        },
        { status: 400 }
      )
    }

    const passwordValid = await bcrypt.compare(password, hashToCheck)
    if (!passwordValid) {
      return NextResponse.json(
        {
          error: 'Falsches Passwort',
          isValid: false
        },
        { status: 401 }
      )
    }

    // 6. Check if user has paid (Team: Abo des Inhabers oder Rechnung bis accessUntil)
    const team = seat ? seat.team : apiKeyRecord.user.ownedTeam
    const hasAccess = team
      ? teamHasAccess(apiKeyRecord.user.hasPaid, team.accessUntil)
      : apiKeyRecord.user.hasPaid
    if (!hasAccess) {
      return NextResponse.json(
        { 
          error: 'Account ist nicht aktiv. Bitte schließe eine Lizenz ab.',
          isValid: false 
        },
        { status: 403 }
      )
    }

    // 6b. Ein Platz ist nur auf einem Geraet gleichzeitig aktiv
    if (seat) {
      const decision = decideDevice(seat, deviceId, takeover === true)
      if (decision.kind === 'needs_device') {
        return NextResponse.json(
          { error: 'Bitte aktualisiere FrameTrain, um dich mit einem Team-Platz anzumelden.', isValid: false },
          { status: 426 }
        )
      }
      if (decision.kind === 'in_use') {
        return NextResponse.json(
          {
            error: `Dein Platz wird gerade auf „${decision.deviceName}“ genutzt.`,
            isValid: false,
            seatInUse: true,
            deviceName: decision.deviceName,
          },
          { status: 409 }
        )
      }
      await prisma.teamSeat.update({
        where: { id: seat.id },
        data: { deviceId: deviceId as string, deviceName: cleanDeviceName(deviceName), lastSeenAt: new Date() },
      })
    }

    // 7. Update last_used_at
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() }
    })

    const teamInfo: TeamInfo | null = team
      ? {
          id: team.id,
          name: team.name,
          seatLimit: team.seatLimit,
          role: seat ? (isTeamRole(seat.role) ? seat.role : 'member') : 'admin',
          isOwner: !seat,
          seatId: seat ? seat.id : null,
        }
      : null

    // 8. Return success
    return NextResponse.json({
      isValid: true,
      userId: apiKeyRecord.user.id,
      email: apiKeyRecord.user.email,
      // Einwilligungen aus der Registrierung — die App übernimmt sie als Standard
      // AGB-Zustimmung zählt nur für die aktuelle Fassung; termsUpdated = früher
      // zugestimmt, aber einer älteren Fassung (App zeigt "AGB aktualisiert").
      // Business-Platz: AGB gelten ueber den Vertrag mit dem Unternehmen
      termsAccepted: seat ? true : apiKeyRecord.user.termsVersion === CURRENT_TERMS_VERSION,
      termsUpdated: seat ? false : !!apiKeyRecord.user.termsAcceptedAt && apiKeyRecord.user.termsVersion !== CURRENT_TERMS_VERSION,
      diagnosticsConsent: apiKeyRecord.user.diagnosticsConsent,
      // Business: Team, Rolle und Platz; null = Einzelkonto
      team: teamInfo,
      memberName: seat ? seat.name : null,
      message: 'Validierung erfolgreich'
    })

  } catch (error) {
    console.error('Credential validation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Ein interner Fehler ist aufgetreten',
        isValid: false
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'desktop-credential-validation',
    timestamp: new Date().toISOString()
  })
}
