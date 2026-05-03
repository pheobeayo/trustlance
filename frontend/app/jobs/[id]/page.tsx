'use client'
import { use } from 'react'
import { JobDetail } from '@/components/escrow/JobDetail'

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const jobId  = BigInt(id)
  return <JobDetail jobId={jobId} />
}
