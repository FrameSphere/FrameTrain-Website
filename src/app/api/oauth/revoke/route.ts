import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sha256Hex } from '@/lib/mcp/crypto'
import { withCors } from '@/lib/mcp/http'
import { readFormOrJson } from '@/lib/mcp/form'

// RFC 7009: Token widerrufen. Antwortet immer 200 (auch bei unbekanntem Token).
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const form = await readFormOrJson(req)
  const token = form.token
  if (token) {
    const hash = sha256Hex(token)
    const row = await prisma.oAuthToken.findFirst({
      where: { OR: [{ accessTokenHash: hash }, { refreshTokenHash: hash }] },
      select: { familyId: true, clientId: true },
    })
    if (row && (!form.client_id || form.client_id === row.clientId)) {
      await prisma.oAuthToken.updateMany({
        where: { familyId: row.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      })
    }
  }
  return withCors(new NextResponse(null, { status: 200 }))
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}
