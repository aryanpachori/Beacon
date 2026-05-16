'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck, CheckCircle2 } from 'lucide-react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'

const MOCK_REPOS = [
  'acme-corp/frontend',
  'acme-corp/api-gateway',
  'acme-corp/data-pipeline',
  'acme-corp/legacy-app',
]

const stepVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [count, setCount] = useState(0)

  // Step 3 auto-advance after 4s — only fires on step 3 (D8 fix)
  useEffect(() => {
    if (step !== 3) return
    const t = setTimeout(() => setStep(4), 4000)
    return () => clearTimeout(t)
  }, [step])

  // Progress bar and counter animation for step 3
  useEffect(() => {
    if (step !== 3) return
    setProgress(0)
    setCount(0)
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100 }
        return p + 2.5
      })
      setCount(c => {
        if (c >= 340) { clearInterval(interval); return 340 }
        return c + 9
      })
    }, 100)
    return () => clearInterval(interval)
  }, [step])

  const toggleRepo = (repo: string) => {
    setSelected(prev =>
      prev.includes(repo) ? prev.filter(r => r !== repo) : [...prev, repo]
    )
  }

  return (
    <div className="min-h-screen bg-dl-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center text-center gap-5"
            >
              <div className="w-14 h-14 rounded-xl bg-dl-surface border border-dl-border flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-dl-healthy" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dl-text mb-2">Know before they die.</h1>
                <p className="text-sm text-dl-muted leading-relaxed">
                  DriftLogg watches your dependencies and predicts abandonment 60-90 days before it happens.
                  Connect your GitHub repos to get started.
                </p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full py-2.5 rounded-lg bg-dl-healthy text-black font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Connect GitHub
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-5"
            >
              <div>
                <h2 className="text-lg font-bold text-dl-text mb-1">Select repos to scan</h2>
                <p className="text-sm text-dl-muted">Choose which repositories to monitor.</p>
              </div>
              <div className="flex flex-col gap-2">
                {MOCK_REPOS.map(repo => (
                  <label
                    key={repo}
                    className="flex items-center gap-3 p-3 rounded-lg border border-dl-border bg-dl-surface cursor-pointer hover:border-white/20 transition-colors"
                  >
                    <Checkbox.Root
                      checked={selected.includes(repo)}
                      onCheckedChange={() => toggleRepo(repo)}
                      className="w-4 h-4 rounded border border-dl-border bg-white/5 flex items-center justify-center data-[state=checked]:bg-dl-healthy data-[state=checked]:border-dl-healthy"
                    >
                      <Checkbox.Indicator>
                        <Check className="w-3 h-3 text-black" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <span className="text-sm text-dl-text font-mono">{repo}</span>
                  </label>
                ))}
              </div>
              <button
                disabled={selected.length === 0}
                onClick={() => setStep(3)}
                className="w-full py-2.5 rounded-lg bg-dl-healthy text-black font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Scan selected →
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center text-center gap-6"
            >
              {/* Pulse animation */}
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="w-14 h-14 rounded-xl bg-dl-surface border border-dl-healthy/30 flex items-center justify-center"
              >
                <ShieldCheck className="w-7 h-7 text-dl-healthy" />
              </motion.div>

              <div>
                <h2 className="text-lg font-bold text-dl-text mb-1">Scanning your stack…</h2>
                <p className="text-2xl font-bold font-mono text-dl-text">{count}</p>
                <p className="text-xs text-dl-muted mt-0.5">packages discovered</p>
              </div>

              <div className="w-full">
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-dl-healthy"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center text-center gap-5"
            >
              <div className="w-14 h-14 rounded-xl bg-dl-surface border border-dl-healthy/30 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-dl-healthy" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-dl-text mb-2">Your stack is ready.</h2>
                <div className="rounded-lg border border-dl-border bg-dl-surface p-4 text-left">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-dl-muted text-xs">Packages scanned</p>
                      <p className="text-dl-text font-bold font-mono text-lg">340</p>
                    </div>
                    <div>
                      <p className="text-dl-muted text-xs">Repos connected</p>
                      <p className="text-dl-text font-bold font-mono text-lg">{selected.length}</p>
                    </div>
                    <div>
                      <p className="text-dl-muted text-xs">Critical</p>
                      <p className="text-dl-critical font-bold font-mono text-lg">3</p>
                    </div>
                    <div>
                      <p className="text-dl-muted text-xs">At risk</p>
                      <p className="text-dl-risk font-bold font-mono text-lg">8</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-2.5 rounded-lg bg-dl-healthy text-black font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Go to dashboard →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mt-8">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                s === step ? 'bg-dl-healthy' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
