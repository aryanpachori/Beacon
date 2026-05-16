'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/onboarding')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-sm">
        <div className="dl-card p-6 shadow-sm md:p-8">
          <h1 className="marketing-title mb-1 text-[22px] md:text-[24px]">Create account</h1>
          <p className="marketing-subtitle mb-6">
            Start monitoring your package health in minutes.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
              />
            </div>
            <button type="submit" className="btn-primary mt-1 w-full justify-center py-2.5">
              Create account
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-dl-m-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-dl-teal hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
