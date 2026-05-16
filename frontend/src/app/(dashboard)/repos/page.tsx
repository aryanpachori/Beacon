'use client'

import { useState } from 'react'
import { Plus, GitBranch } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { repos } from '@/lib/mockData'
import { RepoCard } from '@/components/repos/RepoCard'

export default function ReposPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-dash-text">Repos</h1>
          <p className="text-sm text-dash-muted mt-0.5">{repos.length} connected repositories</p>
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-white/8 border border-dash-border text-sm text-dash-text hover:bg-white/12 transition-colors">
              <Plus className="w-4 h-4" />
              Add repo
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-xl border border-dash-border bg-dash-surface p-6 shadow-2xl">
              <Dialog.Title className="text-base font-bold text-dash-text mb-1">
                Connect a new repo
              </Dialog.Title>
              <Dialog.Description className="text-sm text-dash-muted mb-5">
                Install the DriftLogg GitHub App to start scanning your repositories.
              </Dialog.Description>

              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-gray-100 transition-colors mb-4"
                onClick={() => setOpen(false)}
              >
                <GitBranch className="w-4 h-4" />
                Install GitHub App
              </button>

              <p className="text-xs text-dash-muted text-center">
                Read-only access — DriftLogg never writes to your repos.
              </p>
              <Dialog.Close asChild>
                <button className="absolute top-4 right-4 text-dash-muted hover:text-dash-text transition-colors text-lg leading-none">
                  ×
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {repos.map(repo => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
      </div>
    </div>
  )
}
