import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateApiKey } from '@/lib/api-key'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // Lösche ALLE Keys dieses Users (aktive & inaktive)
    await prisma.apiKey.deleteMany({
      where: { userId: user.userId },
    })

    // Generiere neuen Key im korrekten Format (ft_ + 64 hex chars)
    const newKey = generateApiKey()

    // Erstelle neuen Key (plaintext – für Dashboard-Anzeige)
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.userId,
        key: newKey,
        isActive: true,
      },
      select: {
        id: true,
        key: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
      },
    })

    return NextResponse.json({
      message: 'API-Key erfolgreich regeneriert',
      apiKey,
    })
  } catch (error) {
    console.error('Regenerate key error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}
