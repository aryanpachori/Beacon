'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck, CheckCircle2, Check } from 'lucide-react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { Spinner } from '@/components/ui/Spinner'

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

  useEffect(() => {
    if (step !== 3) return
    const t = setTimeout(() => setStep(4), 4000)
    return () => clearTimeout(t)
  }, [step])

  useEffect(() => {
    if (step !== 3) return
    setProgress(0)
    setCount(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          return 100
        }
        return p + 2.5
      })
      setCount((c) => {
        if (c >= 340) {
          clearInterval(interval)
          return 340
        }
        return c + 9
      })
    }, 100)
    return () => clearInterval(interval)
  }, [step])

  const toggleRepo = (repo: string) => {
    setSelected((prev) =>
      prev.includes(repo) ? prev.filter((r) => r !== repo) : [...prev, repo]
    )
  }

  return (
    <div className="site-shell flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="mb-8">
        <SiteLogo />
      </div>

      <div className="w-full max-w-md">
        <div className="dl-card p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center gap-6 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dl-border bg-white">
                  <ShieldCheck className="h-7 w-7 text-dl-teal" />
                </div>
                <div>
                  <p className="label-overline text-dl-sage">Get started</p>
                  <h1 className="marketing-title mt-3">Know before they die.</h1>
                  <p className="marketing-subtitle mt-3">
                    DriftLogg watches your dependencies and predicts abandonment 60–90 days
                    before it happens. Connect your GitHub repos to get started.
                  </p>
                </div>
                <button type="button" onClick={() => setStep(2)} className="btn-primary w-full py-2.5">
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
                className="flex flex-col gap-6"
              >
                <div>
                  <p className="label-overline text-dl-sage">Step 2 of 4</p>
                  <h2 className="card-heading mt-2 text-dl-forest">Select repos to scan</h2>
                  <p className="marketing-subtitle mt-1.5">Choose which repositories to monitor.</p>
                </div>
                <div className="flex flex-col gap-2">
                  {MOCK_REPOS.map((repo) => (
                    <label
                      key={repo}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-dl-m-border bg-white p-3 transition-colors hover:border-dl-teal/40"
                    >
                      <Checkbox.Root
                        checked={selected.includes(repo)}
                        onCheckedChange={() => toggleRepo(repo)}
                        className="flex h-4 w-4 items-center justify-center rounded border border-dl-m-border bg-white data-[state=checked]:border-dl-teal data-[state=checked]:bg-dl-teal"
                      >
                        <Checkbox.Indicator>
                          <Check className="h-3 w-3 text-white" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      <span className="font-mono text-sm text-dl-forest">{repo}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={selected.length === 0}
                  onClick={() => setStep(3)}
                  className="btn-primary w-full py-2.5 disabled:cursor-not-allowed disabled:opacity-40"
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
                className="flex flex-col items-center gap-6 py-4 text-center"
              >
                <Spinner size="lg" label="Scanning your stack…" className="[&_p]:text-dl-m-muted" />
                <div>
                  <p className="text-3xl font-medium font-mono tabular-nums text-dl-forest">{count}</p>
                  <p className="mt-1 text-xs text-dl-m-muted">packages discovered</p>
                </div>
                <div className="progress-track w-full">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
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
                className="flex flex-col items-center gap-6 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dl-teal/30 bg-dl-teal/10">
                  <CheckCircle2 className="h-7 w-7 text-dl-teal" />
                </div>
                <div className="w-full">
                  <p className="label-overline text-dl-sage">Complete</p>
                  <h2 className="marketing-title mt-3 text-[24px] md:text-[28px]">Your stack is ready.</h2>
                  <div className="mt-5 rounded-lg border border-dl-m-border bg-white p-5 text-left">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-dl-m-muted">Packages scanned</p>
                        <p className="mt-1 font-mono text-lg font-medium tabular-nums text-dl-forest">340</p>
                      </div>
                      <div>
                        <p className="text-xs text-dl-m-muted">Repos connected</p>
                        <p className="mt-1 font-mono text-lg font-medium tabular-nums text-dl-forest">
                          {selected.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-dl-m-muted">Critical</p>
                        <p className="mt-1 font-mono text-lg font-medium tabular-nums text-dl-m-critical">3</p>
                      </div>
                      <div>
                        <p className="text-xs text-dl-m-muted">At risk</p>
                        <p className="mt-1 font-mono text-lg font-medium tabular-nums text-dl-m-risk">8</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary w-full py-2.5"
                >
                  Go to dashboard →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? 'w-6 bg-dl-teal' : 'w-1.5 bg-dl-m-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
