import { notFound } from 'next/navigation'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { LANGUAGES } from '@/lib/data'
import LanguageDetailClient from '@/components/language/language-detail-client'

export function generateStaticParams() {
  return LANGUAGES.map((l) => ({ id: l.id }))
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function LanguageDetailPage({ params }: Props) {
  const { id } = await params
  const lang = LANGUAGES.find((l) => l.id === id)
  if (!lang) notFound()

  return (
    <>
      <Navigation />
      <LanguageDetailClient lang={lang} />
      <Footer />
    </>
  )
}
