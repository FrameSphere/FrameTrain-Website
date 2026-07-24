import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateApiKey } from '@/lib/api-key'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // API-Keys geben der Desktop-App vollen Zugriff auf den Account – daher
    // erst ausstellen, wenn die E-Mail-Adresse bestätigt ist.
    const dbUser = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: { emailVerified: true },
    })

    if (!dbUser?.emailVerified) {
      return NextResponse.json(
        { error: 'Bitte bestätige zuerst deine E-Mail-Adresse, bevor du einen API-Key erstellst.', code: 'EMAIL_NOT_VERIFIED' },
        { status: 403 }
      )
    }

    // Check if user already has a valid key (active only)
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        userId: currentUser.userId,
        isActive: true,
      },
    })

    if (existingKey) {
      return NextResponse.json(
        { error: 'Du hast bereits einen gültigen API-Key' },
        { status: 409 }
      )
    }

    // Generate new API key (plaintext stored – dashboard needs to display it)
    const apiKey = generateApiKey()

    // Deactivate any stale inactive keys first (cleanup)
    await prisma.apiKey.deleteMany({
      where: { userId: currentUser.userId, isActive: false },
    })

    // Save to database as plaintext
    await prisma.apiKey.create({
      data: {
        userId: currentUser.userId,
        key: apiKey,
        isActive: true,
      },
    })

    return NextResponse.json({
      message: 'API-Key erfolgreich erstellt',
      key: apiKey, // Only return the unhashed key once!
    })
  } catch (error) {
    console.error('Create key error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}
