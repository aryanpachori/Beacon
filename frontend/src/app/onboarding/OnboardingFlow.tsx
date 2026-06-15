'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck, CheckCircle2, Check, Search } from 'lucide-react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { Spinner } from '@/components/ui/Spinner'
import {
  fetchGithubInstallUrl,
  fetchGithubOAuthUrl,
  fetchOnboardingRepos,
  fetchOnboardingState,
  getAccessToken,
  startOnboardingScan,
  type OnboardingRepo,
} from '@/lib/api'
import { useScanProgressStream } from '@/hooks/useScanProgressStream'
import { cn } from '@/lib/utils'
import { OnboardingGame } from '@/components/marketing/OnboardingGame'

const stepVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

function resolveInitialStep(
  urlStep: string | null,
  connected: boolean,
  scanStatus: string,
  total: number
): number {
  if (urlStep === '2') return 2
  if (urlStep === '3') return 3
  if (urlStep === '4' && total > 0) return 4
  if (!connected) return 1
  if (scanStatus === 'scanning' || scanStatus === 'scoring') return 3
  if (scanStatus === 'complete' && total > 0) return 4
  return 2
}

export function OnboardingFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [repos, setRepos] = useState<OnboardingRepo[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [repoLimit, setRepoLimit] = useState(1)
  const [accountLogin, setAccountLogin] = useState<string | null>(null)
  const [configureUrl, setConfigureUrl] = useState<string | null>(null)
  const [githubConnected, setGithubConnected] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [startingScan, setStartingScan] = useState(false)
  const [repoError, setRepoError] = useState<string | null>(null)
  const [needsInstall, setNeedsInstall] = useState(false)
  const [summaryRepoNames, setSummaryRepoNames] = useState<string[]>([])
  const [summaryPackageCount, setSummaryPackageCount] = useState(0)

  const { progress, activeCount, percent, isComplete, isFailed, error, reconnectStatus } = useScanProgressStream(
    step === 3
  )

  const filteredRepos = repos.filter((repo) =>
    repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    if (step !== 2) {
      setSearchQuery('')
    }
  }, [step])

  const loadRepos = useCallback(async () => {
    setLoadingRepos(true)
    setRepoError(null)
    try {
      const data = await fetchOnboardingRepos()
      setRepos(data.repos)
      setRepoLimit(data.repoLimit)
      if (data.selectedRepos.length > 0) {
        setSelected(data.selectedRepos)
      }
    } catch {
      setRepoError('Could not load your GitHub repositories. Try linking again.')
    } finally {
      setLoadingRepos(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!getAccessToken()) {
        setBootstrapping(false)
        return
      }

      try {
        const state = await fetchOnboardingState()
        if (cancelled) return

        setGithubConnected(state.connected)
        setAccountLogin(state.accountLogin)
        setConfigureUrl(state.configureUrl)
        setRepoLimit(state.repoLimit)

        const urlStep = searchParams.get('step')
        setStep(resolveInitialStep(urlStep, state.connected, state.scanStatus, state.total))
        setSummaryRepoNames(state.selectedRepoNames)
        setSummaryPackageCount(state.total)

        if (state.onboardingComplete && state.total > 0) {
          router.replace('/dashboard')
        }
      } catch {
        if (!cancelled) setRepoError('Could not load onboarding status.')
      } finally {
        if (!cancelled) setBootstrapping(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  useEffect(() => {
    const err = searchParams.get('error')
    if (err === 'github_sync') {
      setRepoError(
        'GitHub is linked but we could not list your repositories. Check app permissions on GitHub.'
      )
      setStep(2)
    }
    if (err === 'no_installation') {
      setNeedsInstall(true)
      setRepoError(
        'Install the DriftLogg GitHub App on your account first, then link again.'
      )
    }
    if (err === 'github_oauth') {
      setRepoError('GitHub authorization failed. Please try again.')
    }
    if (err === 'installation_claimed') {
      setRepoError(
        'This GitHub App installation is already connected to another DriftLogg account. Please install the GitHub App under a different account.'
      )
    }
    if (err === 'already_connected') {
      setRepoError(
        'Your account already has a GitHub installation connected. Each DriftLogg account supports one GitHub connection. Visit Repos to manage it.'
      )
    }
  }, [searchParams])

  useEffect(() => {
    if (step === 2) loadRepos()
  }, [step, loadRepos])

  useEffect(() => {
    if (step === 3 && isComplete) {
      if (progress.total > 0) {
        setSummaryPackageCount(progress.total)
        setStep(4)
      } else {
        setRepoError(
          'No dependencies found in that repo. Choose a repo with a package.json (or similar manifest) and scan again.'
        )
        setStep(2)
      }
    }
    if (step === 3 && isFailed) {
      setRepoError(
        'Scan did not find any dependency manifests. Pick a repo with package.json, requirements.txt, go.mod, etc.'
      )
      setStep(2)
    }
  }, [step, isComplete, isFailed, progress.total])

  const toggleRepo = (repoId: string) => {
    setSelected((prev) => {
      if (prev.includes(repoId)) {
        return prev.filter((id) => id !== repoId)
      }
      if (repoLimit === 1) {
        return [repoId]
      }
      if (prev.length >= repoLimit) {
        return prev
      }
      return [...prev, repoId]
    })
  }

  const handleLinkGitHub = async () => {
    if (!getAccessToken()) {
      router.push('/register')
      return
    }

    setConnecting(true)
    setRepoError(null)
    setNeedsInstall(false)
    try {
      const url = await fetchGithubOAuthUrl()
      window.location.href = url
    } catch {
      setConnecting(false)
      setRepoError('Could not start GitHub linking.')
    }
  }

  const handleInstallApp = async () => {
    setConnecting(true)
    setRepoError(null)
    try {
      const url = await fetchGithubInstallUrl()
      window.location.href = url
    } catch {
      setConnecting(false)
      setRepoError('Could not open GitHub App install page.')
    }
  }

  const handleContinue = () => {
    setStep(2)
  }

  const handleStartScan = async () => {
    if (selected.length === 0) return
    setStartingScan(true)
    setRepoError(null)
    try {
      await startOnboardingScan(selected)
      setStep(3)
    } catch (err) {
      setRepoError(err instanceof Error ? err.message : 'Could not start scan')
    } finally {
      setStartingScan(false)
    }
  }

  const selectedFullNames =
    summaryRepoNames.length > 0
      ? summaryRepoNames
      : repos.filter((r) => selected.includes(r.id)).map((r) => r.fullName)

  const statusLabel =
    progress.status === 'scoring'
      ? 'Scoring your packages…'
      : progress.status === 'complete'
        ? 'Scan complete'
        : 'Scanning your stack…'

  if (bootstrapping) {
    return (
      <div className="site-shell flex min-h-screen items-center justify-center">
        <Spinner size="md" label="Loading onboarding…" />
      </div>
    )
  }

  return (
    <div className="site-shell flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="mb-8">
        <SiteLogo />
      </div>

      <div className={cn("w-full transition-all duration-300", step === 3 ? "max-w-4xl" : "max-w-md")}>
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
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dl-border bg-white onboarding-icon-container">
                  {githubConnected ? (
                    <CheckCircle2 className="h-7 w-7 text-dl-teal" />
                  ) : (
                    <ShieldCheck className="h-7 w-7 text-dl-teal" />
                  )}
                </div>
                <div>
                  <p className="label-overline text-dl-sage">Get started</p>
                  <h1 className="marketing-title mt-3 dark:text-white">
                    {githubConnected ? 'GitHub is connected' : 'Know before they die.'}
                  </h1>
                  <p className="marketing-subtitle mt-3">
                    {githubConnected ? (
                      <>
                        DriftLogg is linked to{' '}
                        <span className="font-mono text-dl-forest">
                          {accountLogin ? `@${accountLogin}` : 'your GitHub account'}
                        </span>
                        . Choose which repo to scan next.
                      </>
                    ) : (
                      <>
                        DriftLogg watches your dependencies and predicts abandonment 60–90 days
                        before it happens. Link your GitHub account to continue.
                      </>
                    )}
                  </p>
                </div>

                {repoError && <p className="text-xs text-dl-m-critical">{repoError}</p>}

                {githubConnected ? (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="btn-primary w-full py-2.5"
                  >
                    Choose repo to scan →
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleLinkGitHub}
                      disabled={connecting}
                      className="btn-primary w-full py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {connecting ? 'Redirecting…' : 'Link GitHub account'}
                    </button>
                    {needsInstall && (
                      <button
                        type="button"
                        onClick={handleInstallApp}
                        disabled={connecting}
                        className="w-full py-2.5 text-sm text-dl-teal underline"
                      >
                        Install DriftLogg GitHub App
                      </button>
                    )}
                    {!needsInstall && (
                      <button
                        type="button"
                        onClick={handleInstallApp}
                        disabled={connecting}
                        className="text-xs text-dl-m-muted underline"
                      >
                        Need to install the app first?
                      </button>
                    )}
                  </>
                )}

                {githubConnected && configureUrl && (
                  <a
                    href={configureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-dl-m-muted underline"
                  >
                    Manage repo access on GitHub
                  </a>
                )}
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
                  <h2 className="card-heading mt-2 text-dl-forest">
                    {repoLimit === 1 ? 'Choose one repository' : 'Select repos to scan'}
                  </h2>
                  <p className="marketing-subtitle mt-1.5">
                    {repoLimit === 1
                      ? 'Your starter plan monitors a single repo. Pick which project DriftLogg should scan — not every repo GitHub can access.'
                      : `Choose up to ${repoLimit} repositories to monitor in DriftLogg.`}
                  </p>
                  {accountLogin && (
                    <p className="mt-2 text-xs text-dl-m-muted">
                      Connected as <span className="font-mono">@{accountLogin}</span>
                    </p>
                  )}
                </div>

                {repos.length > 0 && !loadingRepos && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search repositories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="form-input pl-9"
                    />
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dl-m-muted" />
                  </div>
                )}

                {loadingRepos ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="md" label="Loading repositories…" />
                  </div>
                ) : repos.length === 0 ? (
                  <div className="rounded-lg border border-dl-m-border bg-white dark:bg-dl-surface onboarding-repo-card p-4 text-sm text-dl-m-muted">
                    No repositories found. Grant DriftLogg access to at least one repo on GitHub,
                    then refresh this page.
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="rounded-lg border border-dl-m-border bg-white dark:bg-dl-surface onboarding-repo-card p-4 text-sm text-dl-m-muted text-center">
                    No repositories match &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                    {filteredRepos.map((repo) => {
                      const checked = selected.includes(repo.id)
                      const atLimit = !checked && selected.length >= repoLimit
                      return (
                        <label
                          key={repo.id}
                          className={`flex items-center gap-3 rounded-lg border border-dl-m-border bg-white dark:bg-dl-surface onboarding-repo-card p-3 transition-colors ${
                            atLimit
                              ? 'cursor-not-allowed opacity-50'
                              : 'cursor-pointer hover:border-blue-500/40'
                          }`}
                        >
                          <Checkbox.Root
                            checked={checked}
                            disabled={atLimit}
                            onCheckedChange={() => toggleRepo(repo.id)}
                            className="flex h-4 w-4 items-center justify-center rounded border border-dl-m-border bg-white dark:bg-dl-bg onboarding-checkbox data-[state=checked]:border-dl-teal data-[state=checked]:bg-dl-teal"
                          >
                            <Checkbox.Indicator>
                              <Check className="h-3 w-3 text-white" />
                            </Checkbox.Indicator>
                          </Checkbox.Root>
                          <span className="font-mono text-sm text-dl-forest">{repo.fullName}</span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {repoError && <p className="text-xs text-dl-m-critical">{repoError}</p>}

                <button
                  type="button"
                  disabled={selected.length === 0 || startingScan || loadingRepos}
                  onClick={handleStartScan}
                  className="btn-primary w-full py-2.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {startingScan ? 'Starting scan…' : repoLimit === 1 ? 'Scan this repo →' : 'Scan selected →'}
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
                className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 py-2 items-center animate-fade-in"
              >
                <div
                  className="flex flex-col items-center gap-5 text-center md:border-r pb-6 md:pb-0 md:pr-8"
                  style={{ borderColor: 'color-mix(in srgb, var(--dl-m-border) 40%, transparent)' }}
                >
                  <Spinner size="lg" label={statusLabel} className="[&_p]:text-dl-m-muted" />
                  <div>
                    <p className="text-3xl font-medium font-mono tabular-nums text-dl-forest">
                      {activeCount}
                      {progress.total > 0 ? ` / ${progress.total}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-dl-m-muted">
                      {progress.status === 'scoring' ? 'packages scored' : 'packages scanned'}
                    </p>
                  </div>
                  <div className="progress-track w-full">
                    <div className="progress-fill" style={{ width: `${percent}%` }} />
                  </div>
                  {reconnectStatus === 'reconnecting' && (
                    <p className="text-xs text-amber-400">
                      Connection lost — retrying…
                    </p>
                  )}
                  {reconnectStatus === 'polling' && (
                    <p className="text-xs text-amber-400">
                      Live updates paused — refreshing every 5 seconds
                    </p>
                  )}
                  {error && reconnectStatus === 'idle' && (
                    <p className="text-xs text-dl-m-critical">
                      Live updates disconnected. Refresh if progress stalls.
                    </p>
                  )}
                  {isFailed && (
                    <div className="flex flex-col gap-3">
                      <p className="text-xs text-dl-m-critical">
                        Scan failed. Pick a repository and try again.
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-sm text-dl-teal underline"
                      >
                        Back to repo selection
                      </button>
                    </div>
                  )}
                  {!isFailed && progress.total === 0 && progress.status === 'scanning' && (
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-sm text-dl-teal underline"
                    >
                      Back to repo selection
                    </button>
                  )}
                </div>

                <div className="w-full">
                  <OnboardingGame />
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
                {summaryPackageCount > 0 ? (
                  <>
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-xl border"
                      style={{
                        borderColor: 'color-mix(in srgb, var(--dl-teal) 30%, transparent)',
                        backgroundColor: 'color-mix(in srgb, var(--dl-teal) 10%, transparent)',
                      }}
                    >
                      <CheckCircle2 className="h-7 w-7 text-dl-teal" />
                    </div>
                    <div className="w-full">
                      <p className="label-overline text-dl-sage">Complete</p>
                      <h2 className="marketing-title mt-3 text-[24px] md:text-[28px] dark:text-white">
                        Your stack is ready.
                      </h2>
                      <div className="mt-5 rounded-lg border border-dl-m-border bg-white dark:bg-dl-surface onboarding-repo-card p-5 text-left">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-dl-m-muted">Packages scanned</p>
                            <p className="mt-1 font-mono text-lg font-medium tabular-nums text-dl-forest">
                              {summaryPackageCount || progress.total || activeCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-dl-m-muted">Repos connected</p>
                            <p className="mt-1 font-mono text-lg font-medium tabular-nums text-dl-forest">
                              {selectedFullNames.length || '—'}
                            </p>
                          </div>
                        </div>
                        {selectedFullNames.length > 0 && (
                          <p className="mt-3 font-mono text-xs text-dl-m-muted">
                            {selectedFullNames.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard')}
                      className="btn-primary w-full py-2.5"
                    >
                      Go to dashboard →
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dl-border bg-white onboarding-icon-container">
                      <ShieldCheck className="h-7 w-7 text-dl-teal" />
                    </div>
                    <div>
                      <p className="label-overline text-dl-sage">Almost there</p>
                      <h2 className="marketing-title mt-3 text-[24px] md:text-[28px] dark:text-white">
                        Select a repo to scan
                      </h2>
                      <p className="marketing-subtitle mt-3">
                        GitHub is connected, but no repository has been scanned yet. Pick one repo
                        with a dependency manifest (package.json, etc.) to continue.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="btn-primary w-full py-2.5"
                    >
                      Choose repo →
                    </button>
                  </>
                )}
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
