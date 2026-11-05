import { NextResponse } from 'next/server'
import { issuer, siteOrigin, SCOPES_SUPPORTED } from '@/lib/mcp/config'
import { corsJson, withCors } from '@/lib/mcp/http'

// RFC 8414 – erreichbar ueber /.well-known/oauth-authorization-server (Rewrite).
export const dynamic = 'force-dynamic'

export async function GET() {
  const base = siteOrigin()
  return corsJson({
    issuer: issuer(),
    authorization_endpoint: `${base}/oauth/authorize`,
    token_endpoint: `${base}/api/oauth/token`,
    registration_endpoint: `${base}/api/oauth/register`,
    revocation_endpoint: `${base}/api/oauth/revoke`,
    scopes_supported: SCOPES_SUPPORTED,
    response_types_supported: ['code'],
    response_modes_supported: ['query'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['none'],
    revocation_endpoint_auth_methods_supported: ['none'],
    code_challenge_methods_supported: ['S256'],
    client_id_metadata_document_supported: true,
    authorization_response_iss_parameter_supported: true,
    service_documentation: `${base}/docs/mcp`,
    op_policy_uri: `${base}/privacy`,
    op_tos_uri: `${base}/terms`,
  })
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}
