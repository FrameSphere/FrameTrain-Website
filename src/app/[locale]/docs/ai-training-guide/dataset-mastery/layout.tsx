import type { Metadata } from 'next'
import { coachChapterMetadata, CoachChapterJsonLd } from '@/lib/coach-seo'

const ID = 'dataset-mastery' as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return coachChapterMetadata(locale, ID)
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <>
      <CoachChapterJsonLd locale={locale} id={ID} />
      {children}
    </>
  )
}
