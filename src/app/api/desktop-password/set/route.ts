import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Auth-Check: User muss eingeloggt sein
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { password } = body

    // Validierung
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Passwort ist erforderlich' },
        { status: 400 }
      )
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Passwort muss mindestens 6 Zeichen lang sein' },
        { status: 400 }
      )
    }
    if (password.length > 128) {
      return NextResponse.json(
        { error: 'Passwort darf maximal 128 Zeichen lang sein' },
        { status: 400 }
      )
    }

    // Hash & speichern
    const desktopPasswordHash = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { id: currentUser.userId },
      data: { desktopPasswordHash },
    })

    return NextResponse.json({ success: true, message: 'Desktop-Passwort erfolgreich gesetzt' })
  } catch (error) {
    console.error('Set desktop password error:', error)
    return NextResponse.json(
      { error: 'Ein interner Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}
