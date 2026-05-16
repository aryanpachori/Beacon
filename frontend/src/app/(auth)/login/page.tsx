'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-dl-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Activity className="w-6 h-6 text-dl-healthy" />
          <span className="text-lg font-bold text-dl-text tracking-tight">DriftLogg</span>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-dl-border bg-dl-surface p-6">
          <h1 className="text-base font-bold text-dl-text mb-1">Sign in</h1>
          <p className="text-xs text-dl-muted mb-5">Know which packages are dying before they do.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs text-dl-muted mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-dl-border text-sm text-dl-text placeholder-dl-muted focus:outline-none focus:border-white/20"
              />
            </div>
            <div>
              <label className="block text-xs text-dl-muted mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-dl-border text-sm text-dl-text placeholder-dl-muted focus:outline-none focus:border-white/20"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-dl-healthy text-black font-semibold text-sm hover:opacity-90 transition-opacity mt-1"
            >
              Sign in
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-dl-muted mt-4">
          No account?{' '}
          <Link href="/register" className="text-dl-text hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
