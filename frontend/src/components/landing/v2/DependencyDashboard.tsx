'use client'

export function DependencyDashboard() {
  return (
    <section data-reveal className="border-t border-black/[0.07] py-[90px]">
      <div className="mx-auto max-w-[720px] text-center">
        <p className="bl-kicker mx-auto justify-center">Not just an agent</p>
        <h2 className="bl-h2 mx-auto mb-3">A dashboard for your dependencies, too.</h2>
        <p className="mx-auto max-w-[52ch] text-[14.5px] leading-[1.6] text-[rgba(8,9,10,.55)]">
          Beacon also runs the original dependency-health scan — commit velocity, maintainer
          activity, issue backlog — and gives every package a health score, with a web dashboard
          that flags abandonment 60-90 days before it breaks your build. Connect a repo once, no
          install required, and track it alongside everything the agent catches live.
        </p>
      </div>

      <div className="relative mx-auto mt-12 max-w-[1080px] overflow-hidden rounded-[14px] border border-black/[0.09]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/dashboard_bw.png"
          alt="Beacon web dashboard — Dependency Tracker view"
          className="block w-full"
        />
      </div>
    </section>
  )
}
