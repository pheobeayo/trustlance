import { MOCK_JOBS } from '@/lib/mockData'
import { JobDetail } from '@/components/escrow/JobDetail'
import { notFound } from 'next/navigation'

interface Props {
  params: { id: string }
}

export function generateStaticParams() {
  return MOCK_JOBS.map(j => ({ id: String(j.id) }))
}

export default function JobDetailPage({ params }: Props) {
  const job = MOCK_JOBS.find(j => j.id === Number(params.id))
  if (!job) notFound()

  return <JobDetail job={job} />
}
