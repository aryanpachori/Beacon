'use client'

import { AlertTriangle, KeyRound, Bug, GitPullRequestArrow, Sparkles, CheckCircle, Zap } from 'lucide-react'

const WITHOUT = [
  { icon: KeyRound, text: 'Secrets committed by an agent, caught in prod' },
  { icon: Bug, text: 'SQL injection slips through review, found by a scanner in CI' },
  { icon: GitPullRequestArrow, text: 'Reviewers re-reading every AI-generated diff line by line' },
  { icon: AlertTriangle, text: '"It looked fine" — until it wasn\u2019t' },
]

const WITH = [
  { icon: Sparkles, text: 'Flagged inline, the moment the line is written' },
  { icon: CheckCircle, text: 'Fixed before the diff is even staged' },
  { icon: Zap, text: 'Reviewers focus on product, not policing the AI' },
  { icon: Sparkles, text: 'Confidence to ship at agent speed' },
]

export function BeforeAfter() {
  return (
    <section data-scroll-before-after className="section-light px-6 py-[120px]">
      <div className="mx-auto max-w-[1000px]">
        <p data-scroll-reveal className="section-kicker justify-center">
          <span className="kicker-index">02</span> The difference
        </p>
        <h2
          data-scroll-reveal
          className="mx-auto mt-5 max-w-[600px] text-center text-section-mobile font-medium text-dl-text lg:text-section"
        >
          Not another gate. A quiet second pair of eyes.
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div
            data-scroll-panel-without
            className="rounded-[14px] border p-8"
            style={{
              borderColor: 'rgba(164,70,54,0.22)',
              background: 'rgba(164,70,54,0.06)',
            }}
          >
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(164,70,54,0.1)' }}>
                <AlertTriangle className="h-4 w-4" style={{ color: '#A44636' }} />
              </div>
              <span className="text-[15px] font-semibold" style={{ color: '#A44636' }}>Without Beacon</span>
            </div>
            <ul className="flex flex-col gap-3.5">
              {WITHOUT.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-[13px] text-dl-forest">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'rgba(164,70,54,0.65)' }} />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div
            data-scroll-panel-with
            className="rounded-[14px] border p-8"
            style={{
              borderColor: 'rgba(79,97,40,0.28)',
              background: 'rgba(79,97,40,0.06)',
            }}
          >
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dl-blue/15">
                <CheckCircle className="h-4 w-4 text-dl-blue" />
              </div>
              <span className="text-[15px] font-semibold text-dl-blue">With Beacon</span>
            </div>
            <ul className="flex flex-col gap-3.5">
              {WITH.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-[13px] text-dl-forest">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-dl-blue/70" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
