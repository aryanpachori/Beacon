'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
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
      className="flex flex-1 items-center justify-center p-4"
    >
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-dl-m-border bg-dl-card p-6 shadow-sm">
          <h1 className="mb-1 text-base font-bold text-dl-forest">Create your account</h1>
          <p className="mb-5 text-xs text-dl-m-muted">Start monitoring your dependency health.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs text-dl-m-muted">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-dl-m-border bg-white px-3 py-2 text-sm text-dl-forest placeholder:text-dl-hint focus:border-dl-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-dl-m-muted">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-dl-m-border bg-white px-3 py-2 text-sm text-dl-forest placeholder:text-dl-hint focus:border-dl-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-dl-m-muted">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-dl-m-border bg-white px-3 py-2 text-sm text-dl-forest placeholder:text-dl-hint focus:border-dl-teal focus:outline-none"
              />
            </div>
            <button type="submit" className="btn-primary mt-1 w-full py-2.5 text-sm">
              Create account
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-dl-m-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-dl-teal hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
