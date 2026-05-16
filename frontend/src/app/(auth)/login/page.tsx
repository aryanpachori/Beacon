'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/dashboard')
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
          <h1 className="mb-1 text-base font-bold text-dl-forest">Sign in</h1>
          <p className="mb-5 text-xs text-dl-m-muted">
            Know which packages are dying before they do.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs text-dl-m-muted">Email</label>
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
              Sign in
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-dl-m-muted">
          No account?{' '}
          <Link href="/register" className="text-dl-teal hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
