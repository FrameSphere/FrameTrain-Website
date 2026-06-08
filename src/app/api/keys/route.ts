import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // User-Details + Keys zusammen laden
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        hasPaid: true,
        subscriptionCancelAt: true,
        provider: true,
        passwordHash: true,
        desktopPasswordHash: true,
        apiKeys: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            key: true,
            isActive: true,
            createdAt: true,
            lastUsedAt: true,
          },
        },
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User nicht gefunden' }, { status: 404 })
    }

    const isOAuthUser = dbUser.provider !== 'email' && !dbUser.passwordHash
    const hasDesktopPassword = !!dbUser.desktopPasswordHash

    return NextResponse.json({
      apiKeys: dbUser.apiKeys,
      hasPaid: dbUser.hasPaid,
      subscriptionCancelAt: dbUser.subscriptionCancelAt?.toISOString() ?? null,
      isOAuthUser,
      hasDesktopPassword,
    })
  } catch (error) {
    console.error('Get keys error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}
