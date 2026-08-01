'use client'

import Link from 'next/link'
import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickStartChecklistProps {
  githubConnected: boolean
  agentConnected: boolean
}

export function QuickStartChecklist({ githubConnected, agentConnected }: QuickStartChecklistProps) {
  const steps = [
    { label: 'Create your account', done: true, href: null },
    { label: 'Connect your coding agent', done: agentConnected, href: '/agent-activity' },
    { label: 'Connect GitHub for dependency tracking', done: githubConnected, href: '/onboarding' },
  ]

  return (
    <div className="dl-card">
      <h3 className="card-heading">Quick start</h3>
      <p className="mt-0.5 text-[11px] text-dl-muted">Get the most out of Beacon</p>

      <div className="mt-3 flex flex-col gap-2">
        {steps.map((step) => {
          const content = (
            <div className="flex items-center gap-2.5 py-1.5">
              {step.done ? (
                <Check className="h-4 w-4 shrink-0 text-dl-healthy" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-dl-border" />
              )}
              <span className={cn(
                'text-[12.5px]',
                step.done ? 'text-dl-muted line-through' : 'text-dl-text'
              )}>
                {step.label}
              </span>
            </div>
          )
          return step.href && !step.done ? (
            <Link key={step.label} href={step.href} className="hover:opacity-80 transition-opacity">
              {content}
            </Link>
          ) : (
            <div key={step.label}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}
