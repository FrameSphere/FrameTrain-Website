import { NextResponse } from 'next/server'

// OpenAI-Domain-Verifizierung fuer die ChatGPT-App:
// /.well-known/openai-apps-challenge (Rewrite) liefert NUR den Token als Klartext.
// Token aus dem OpenAI-Portal in OPENAI_APPS_CHALLENGE_TOKEN eintragen.
export const dynamic = 'force-dynamic'

export async function GET() {
  const token = process.env.OPENAI_APPS_CHALLENGE_TOKEN?.trim()
  if (!token) return new NextResponse('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } })
  return new NextResponse(token, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
