import { issuer, resourceUrl, SCOPES_SUPPORTED, siteOrigin } from '@/lib/mcp/config'
import { corsJson, withCors } from '@/lib/mcp/http'
import { NextResponse } from 'next/server'

// RFC 9728 – erreichbar ueber /.well-known/oauth-protected-resource(/api/mcp) (Rewrite).
export const dynamic = 'force-dynamic'

export async function GET() {
  return corsJson({
    resource: resourceUrl(),
    authorization_servers: [issuer()],
    scopes_supported: SCOPES_SUPPORTED,
    bearer_methods_supported: ['header'],
    resource_name: 'FrameTrain',
    resource_documentation: `${siteOrigin()}/docs/mcp`,
  })
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}
