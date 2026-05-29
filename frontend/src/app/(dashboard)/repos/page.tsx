'use client'

import { useState } from 'react'
import { Plus, GitBranch } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { repos } from '@/lib/mockData'
import { RepoCard } from '@/components/repos/RepoCard'
import { ReposEmptyState } from '@/components/repos/ReposEmptyState'

export default function ReposPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="app-page">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="page-heading">Repositories</h1>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button type="button" className="btn-dash-primary">
              <Plus className="h-4 w-4" />
              Add repo
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-dl-forest/40 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-dl-m-border bg-dl-card p-6 shadow-xl">
              <Dialog.Title className="page-heading mb-1">Connect a new repo</Dialog.Title>
              <Dialog.Description className="page-description mb-6">
                Install the DriftLogg GitHub App to start scanning your repositories.
              </Dialog.Description>

              <button
                type="button"
                className="btn-dash-primary mb-4 w-full"
                onClick={() => setOpen(false)}
              >
                <GitBranch className="h-4 w-4" />
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
        <ReposEmptyState onConnect={() => setOpen(true)} />
      ) : (
        <div className="mt-6 flex flex-col gap-5">
          {repos.map(repo => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </div>
  )
}
