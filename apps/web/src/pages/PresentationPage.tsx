import { HeroSection } from '@/components/layout/HeroSection'
import { PlaceholderAuthSection } from '@/components/layout/PlaceholderAuthSection'
import { ProductVisionSection } from '@/components/layout/ProductVisionSection'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'

/** Institutional landing (legacy baseline). */
export default function PresentationPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <ProductVisionSection />
        <PlaceholderAuthSection />
      </main>
      <SiteFooter />
    </div>
  )
}
