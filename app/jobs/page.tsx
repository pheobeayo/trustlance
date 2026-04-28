import { Hero } from '@/components/escrow/Hero'
import { SponsorStrip } from '@/components/escrow/SponsorStrip'
import { JobFilters } from '@/components/escrow/JobFilters'
import { JobGrid } from '@/components/escrow/JobGrid'

export default function JobsPage() {
  return (
    <>
      <Hero />
      <SponsorStrip />
      <JobFilters />
      <JobGrid />
    </>
  )
}
