'use client'

import { useState } from 'react'
import { X, Send, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppData } from '@/context/AppDataContext'
import { cn } from '@/lib/utils'

const TYPES = [
  { value: 'general', label: 'General' },
  { value: 'bug',     label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function FeedbackModal({ open, onClose }: Props) {
  const { user } = useAppData()
  const [type, setType] = useState('general')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, type, email: user?.email }),
      })
      if (!res.ok) throw new Error('Failed')
      setSent(true)
      setMessage('')
      setTimeout(() => { setSent(false); onClose() }, 2000)
    } catch {
      setError('Failed to send. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-4 left-4 right-4 z-50 w-auto max-w-[320px] rounded-2xl border border-dl-border bg-dl-bg shadow-2xl sm:bottom-6 sm:left-6 sm:right-auto sm:w-[320px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-dl-border px-5 py-4">
              <div>
                <p className="text-[14px] font-semibold text-dl-navy">Share feedback</p>
                <p className="text-[11px] text-dl-muted">Help us improve Beacon</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-dl-muted hover:bg-dl-surface hover:text-dl-text transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {sent ? (
              <div className="flex flex-col items-center justify-center gap-3 px-5 py-10">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <p className="text-[14px] font-semibold text-dl-navy">Thanks for your feedback!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                {/* Type selector */}
                <div className="flex gap-2">
                  {TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={cn(
                        'flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors',
                        type === t.value
                          ? 'border-dl-blue bg-dl-blue-pale text-dl-blue'
                          : 'border-dl-border bg-dl-surface text-dl-muted hover:border-dl-blue/50'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Message */}
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-dl-border bg-dl-surface px-3 py-2.5 text-[13px] text-dl-navy placeholder:text-dl-muted outline-none focus:border-dl-blue focus:ring-2 focus:ring-dl-blue/15 transition-all"
                />

                {error && <p className="text-[11px] text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-dl-navy text-white dark:bg-dl-blue dark:text-[#f8f8f8] py-2.5 text-[13px] font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {loading ? 'Sending…' : 'Send feedback'}
                </button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
