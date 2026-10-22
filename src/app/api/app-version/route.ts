import { NextResponse } from 'next/server';
import { fetchLatestRelease } from '@/lib/github-releases';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Releases kommen aus FrameTrain-Releases, mit Rückfall auf FrameTrain-App
// (siehe lib/github-releases.ts)
async function getLatestVersion(): Promise<{ version: string; name: string; date: string } | null> {
  const found = await fetchLatestRelease({ next: { revalidate: 60 } });
  if (!found) {
    console.error('[App Version] Kein veröffentlichtes Release gefunden');
    return null;
  }
  return {
    version: found.release.tag_name,
    name: found.release.name,
    date: found.release.published_at,
  };
}

/**
 * GET /api/app-version
 * Returns the latest app version from GitHub releases
 */
export async function GET() {
  try {
    const versionInfo = await getLatestVersion();
    
    if (!versionInfo) {
      return NextResponse.json(
        { 
          error: 'Version nicht gefunden',
          version: '1.0.0', // Fallback
        },
        { status: 200 } // Still return 200 with fallback
      );
    }

    return NextResponse.json({
      success: true,
      ...versionInfo
    });

  } catch (error) {
    console.error('Version fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Fehler beim Abrufen der Version',
        version: '1.0.0', // Fallback
      },
      { status: 200 }
    );
  }
}
