import { NextResponse } from 'next/server'
import { ownerTeam, teamDashboardView } from '@/lib/team-admin'

export const dynamic = 'force-dynamic'

// Team-Bereich im Dashboard: Plaetze mit Schluessel, Geraet und Status.
// 404 = kein Business-Team (Dashboard blendet den Bereich dann aus).
export async function GET() {
  const auth = await ownerTeam()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  return NextResponse.json({ team: await teamDashboardView(auth.team.id) })
}
