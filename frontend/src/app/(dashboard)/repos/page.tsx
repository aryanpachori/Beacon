'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, RefreshCw, ExternalLink, GitBranch } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { useAppData } from '@/context/AppDataContext'
import { fetchGithubInstallUrl } from '@/lib/api'
import { RepoCard } from '@/components/repos/RepoCard'
import { ReposEmptyState } from '@/components/repos/ReposEmptyState'

export default function ReposPage() {
  const router = useRouter()
  const { repos, repoLimit, loading, error, refresh } = useAppData()
  const [open, setOpen] = useState(false)
  const [installing, setInstalling] = useState(false)

  function handleSelectRepo() {
    setOpen(false)
    router.push('/onboarding?step=2')
  }

  async function handleInstallGithub() {
    setInstalling(true)
    try {
      const url = await fetchGithubInstallUrl()
      window.location.href = url
    } catch {
      setInstalling(false)
    }
  }

  if (loading) {
    return (
      <div className="app-page flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-dl-muted">Loading repositories…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-page flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-dl-critical">Could not load repositories. Check your connection.</p>
        <button
          type="button"
          onClick={refresh}
          className="btn-dash-secondary flex items-center gap-1.5 text-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    )
  }

  // Detect free plan: repoLimit of 1 means starter/free plan
  const isFreeAtLimit = repoLimit === 1 && repos.length >= 1
  const atRepoLimit = repos.length >= repoLimit

  return (
    <div className="app-page">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="page-heading">Repositories</h1>
          <p className="mt-1 text-sm text-dl-muted">
            {repoLimit === 1
              ? 'Starter plan: monitor one repository. Pick which repo DriftLogg scans — even if GitHub grants access to all repos.'
              : `Pro plan: monitor up to ${repoLimit} repositories.`}
          </p>
        </div>

        {isFreeAtLimit ? (
          <p className="shrink-0 text-[13px] text-dl-muted">
            To add more repos,{' '}
            <a href="/billing" className="font-semibold text-dl-blue hover:underline">
              upgrade to Pro
            </a>
          </p>
        ) : (
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button type="button" className="btn-dash-primary">
                <Plus className="h-4 w-4" />
                {repoLimit > 1 ? 'Add another repo' : 'Add repo'}
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
              <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-dl-border bg-dl-bg p-6 shadow-2xl">
                <Dialog.Title className="mb-1 text-[17px] font-bold text-dl-navy">
                  {atRepoLimit ? 'Change monitored repo' : 'Connect a repository'}
                </Dialog.Title>
                <Dialog.Description className="mb-6 text-[13px] text-dl-muted">
                  {atRepoLimit
                    ? 'Switch to a different repository. DriftLogg scans the repo you select.'
                    : 'Install the GitHub App to let DriftLogg scan your dependencies.'}
                </Dialog.Description>

                {repos.length > 0 && (
                  <button
                    type="button"
                    className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dl-blue bg-dl-blue-pale py-2.5 text-[13px] font-semibold text-dl-blue transition-colors hover:bg-dl-blue hover:text-white"
                    onClick={handleSelectRepo}
                  >
                    Select a different repo to scan
                  </button>
                )}

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-dl-navy py-3 text-[13px] font-semibold text-dl-bg transition-all hover:opacity-90 disabled:opacity-60"
                  disabled={installing}
                  onClick={handleInstallGithub}
                  style={{ boxShadow: '0 2px 8px rgba(30,42,60,0.25)' }}
                >
                  <GitBranch className="h-4 w-4" />
                  {installing ? 'Redirecting to GitHub…' : 'Install GitHub App'}
                  {!installing && <ExternalLink className="h-3.5 w-3.5 opacity-60" />}
                </button>

                <p className="mt-4 text-center text-[12px] text-dl-muted">
                  🔒 Read-only access — DriftLogg never writes to your repos.
                </p>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-dl-muted transition-colors hover:bg-dl-surface hover:text-dl-text"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </div>

      {repos.length === 0 ? (
        <ReposEmptyState onConnect={handleSelectRepo} />
      ) : (
        <div className="mt-6 flex flex-col gap-5">
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} onRescan={refresh} />
          ))}
        </div>
      )}
    </div>
  )
}
