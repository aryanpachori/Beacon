'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CriticalPackageCard } from '@/components/dashboard/CriticalPackageCard'
import { getTopRiskPackages } from '@/lib/dashboardData'

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
}

export function CriticalPackagesFeed() {
  const topRisk = getTopRiskPackages(5)

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0, x: 16 },
        show: { opacity: 1, x: 0, transition: { staggerChildren: 0.1 } },
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="dash-section-label">NEEDS ATTENTION</p>
        <Link href="/packages" className="text-[12px] text-dl-teal hover:underline">
          View all →
        </Link>
      </div>

      <motion.div variants={listVariants}>
        {topRisk.map(pkg => (
          <CriticalPackageCard key={pkg.id} pkg={pkg} />
        ))}
      </motion.div>
    </motion.div>
  )
}
