import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Locale-bewusste Versionen von Link, redirect, usePathname und useRouter.
// WICHTIG: Ab jetzt überall `import { Link } from '@/i18n/navigation'`
// statt `import Link from 'next/link'` verwenden – sonst geht beim Klick
// das aktuell aktive Locale verloren (z.B. /en/about -> Klick auf "/faq"
// würde sonst auf /de/faq landen statt /en/faq).
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
