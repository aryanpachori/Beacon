'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, GitBranch } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { useAppData } from '@/context/AppDataContext'
import { fetchGithubInstallUrl, fetchGithubOAuthUrl } from '@/lib/api'
import { RepoCard } from '@/components/repos/RepoCard'
import { ReposEmptyState } from '@/components/repos/ReposEmptyState'

export default function ReposPage() {
  const router = useRouter()
  const { repos, repoLimit, loading, error, refresh } = useAppData()
  const [open, setOpen] = useState(false)
  const [installing, setInstalling] = useState(false)

  async function handleConnectGithub() {
    setInstalling(true)
    try {
      const url = await fetchGithubOAuthUrl()
      window.location.href = url
    } catch {
      setInstalling(false)
    }
  }

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
      <div className="app-page flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-dl-critical">{error}</p>
      </div>
    )
  }

  const atRepoLimit = repos.length >= repoLimit
  const addRepoLabel = atRepoLimit ? 'Change monitored repo' : 'Add repo'

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

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button type="button" className="btn-dash-primary">
              <Plus className="h-4 w-4" />
              {addRepoLabel}
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-dl-forest/40 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-dl-m-border bg-dl-card p-6 shadow-xl">
              <Dialog.Title className="page-heading mb-1">
                {atRepoLimit ? 'Change monitored repo' : 'Connect a new repo'}
              </Dialog.Title>
              <Dialog.Description className="page-description mb-6">
                {atRepoLimit
                  ? 'Choose a different repository to monitor. DriftLogg will only scan the repo you select.'
                  : 'Select a repository to scan, or link GitHub if you have not connected yet.'}
              </Dialog.Description>

              <button
                type="button"
                className="btn-dash-primary mb-3 w-full"
                onClick={handleSelectRepo}
              >
                Select repo to scan
              </button>

              <button
                type="button"
                className="btn-dash-primary mb-3 w-full disabled:opacity-60"
                disabled={installing}
                onClick={handleConnectGithub}
              >
                <GitBranch className="h-4 w-4" />
                {installing ? 'Redirecting…' : 'Link GitHub account'}
              </button>

              <button
                type="button"
                className="mb-4 w-full py-2 text-[13px] text-dl-teal underline disabled:opacity-60"
                disabled={installing}
                onClick={handleInstallGithub}
              >
                Install GitHub App
              </button>

              <p className="text-center text-[13px] text-dl-muted">
                Read-only access — DriftLogg never writes to your repos.
              </p>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="absolute right-4 top-4 text-lg leading-none text-dl-muted transition-colors hover:text-dl-forest"
                  aria-label="Close"
                >
                  ×
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
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
