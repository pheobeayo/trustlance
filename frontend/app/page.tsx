import { LandingHero }     from '@/components/landing/LandingHero'
import { ProofChips }      from '@/components/landing/ProofChips'
import { ProblemSection }  from '@/components/landing/ProblemSection'
import { HowItWorks }      from '@/components/landing/HowItWorks'
import { SponsorsSection } from '@/components/landing/SponsorsSection'
import { ContractFlow }    from '@/components/landing/ContractFlow'
import { QuotesSection }   from '@/components/landing/QuotesSection'
import { CompareSection }  from '@/components/landing/CompareSection'
import { LandingCTA }      from '@/components/landing/LandingCTA'
import { LandingFooter }   from '@/components/landing/LandingFooter'

export default function LandingPage() {
  return (
    <>
      <LandingHero />
      <ProofChips />
      <ProblemSection />
      <HowItWorks />
      <SponsorsSection />
      <ContractFlow />
      <QuotesSection />
      <CompareSection />
      <LandingCTA />
      <LandingFooter />
    </>
  )
}
