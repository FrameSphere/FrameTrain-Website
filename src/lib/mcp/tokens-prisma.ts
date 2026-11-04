import { prisma } from '@/lib/prisma'
import type { AuthCodeStore, TokenStore } from './tokens'

const tokenSelect = {
  id: true, familyId: true, userId: true, clientId: true, connectionId: true, scope: true, resource: true,
  accessExpiresAt: true, refreshExpiresAt: true, rotatedAt: true, revokedAt: true,
} as const

export const prismaTokenStore: TokenStore = {
  async insert(row) {
    await prisma.oAuthToken.create({ data: row })
  },
  async findByAccessHash(hash) {
    return prisma.oAuthToken.findUnique({ where: { accessTokenHash: hash }, select: tokenSelect })
  },
  async findByRefreshHash(hash) {
    return prisma.oAuthToken.findUnique({ where: { refreshTokenHash: hash }, select: tokenSelect })
  },
  async markRotated(id, now) {
    const res = await prisma.oAuthToken.updateMany({
      where: { id, rotatedAt: null, revokedAt: null },
      data: { rotatedAt: now },
    })
    return res.count === 1
  },
  async revokeFamily(familyId, now) {
    await prisma.oAuthToken.updateMany({ where: { familyId, revokedAt: null }, data: { revokedAt: now } })
  },
}

export const prismaAuthCodeStore: AuthCodeStore = {
  async findByHash(hash) {
    return prisma.oAuthAuthCode.findUnique({
      where: { codeHash: hash },
      select: {
        id: true, clientId: true, userId: true, redirectUri: true, codeChallenge: true,
        scope: true, resource: true, expiresAt: true, usedAt: true,
      },
    })
  },
  async consume(id, now) {
    const res = await prisma.oAuthAuthCode.updateMany({ where: { id, usedAt: null }, data: { usedAt: now } })
    return res.count === 1
  },
}
