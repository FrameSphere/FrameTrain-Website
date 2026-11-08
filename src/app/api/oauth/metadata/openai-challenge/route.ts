import { NextResponse } from 'next/server'

// OpenAI-Domain-Verifizierung fuer die ChatGPT-App:
// /.well-known/openai-apps-challenge (Rewrite) liefert NUR den Token als Klartext.
// Token aus dem OpenAI-Portal (Plugin > MCPs > Domain verification). Er ist
// ohnehin oeffentlich abrufbar, darf also im Code stehen; OPENAI_APPS_CHALLENGE_TOKEN
// in Vercel ueberschreibt ihn bei Bedarf.
export const dynamic = 'force-dynamic'

const DEFAULT_TOKEN = 'IGCz_1ETK3nkJJkiN-7-p02mzGZ7h8O2s8psZZSJdjs'

export async function GET() {
  const token = process.env.OPENAI_APPS_CHALLENGE_TOKEN?.trim() || DEFAULT_TOKEN
  if (!token) return new NextResponse('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } })
  return new NextResponse(token, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
