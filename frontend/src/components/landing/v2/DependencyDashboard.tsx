'use client'

export function DependencyDashboard() {
  return (
    <section data-reveal className="border-t border-white/[0.07] py-[90px]">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_520px] lg:gap-16">
        <div>
          <p className="bl-kicker">Not just an agent</p>
          <h2 className="bl-h2 mb-3">A dashboard for your dependencies, too.</h2>
          <p className="max-w-[46ch] text-[14.5px] leading-[1.6] text-[rgba(242,240,237,.55)]">
            Beacon also runs the original dependency-health scan — commit velocity, maintainer
            activity, issue backlog — and gives every package a health score, with a web dashboard
            that flags abandonment 60-90 days before it breaks your build. Connect a repo once, no
            install required, and track it alongside everything the agent catches live.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[14px] border border-white/[0.09] shadow-[0_24px_60px_-28px_rgba(0,0,0,.6)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dashbaord.png"
            alt="Beacon web dashboard — package health overview"
            className="block w-full"
          />
          {/* Redact the account email shown in the screenshot */}
          <div
            className="absolute rounded-full backdrop-blur-md backdrop-saturate-150 bg-black/50"
            style={{ left: '76%', top: '8.5%', width: '16%', height: '4%' }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  )
}
