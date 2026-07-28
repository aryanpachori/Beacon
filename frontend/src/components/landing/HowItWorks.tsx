'use client'

const STEPS = [
  {
    title: 'Add Beacon to your tools',
    copy: 'Install the IDE extension, connect the MCP server to your agent, or drop the CLI into CI. Under a minute, no config files.',
  },
  {
    title: 'Keep working. Keep agenting.',
    copy: 'Beacon runs alongside Cursor, Claude Code, Copilot, or any MCP-compatible agent — watching diffs as they\u2019re written, not after.',
  },
  {
    title: 'It reviews in real time, locally',
    copy: 'Every new line is checked against known vulnerability patterns, secrets, and unsafe logic — entirely on your machine. Nothing leaves it.',
  },
  {
    title: 'Get an inline verdict, not a report',
    copy: 'Findings surface as annotations right where the risk is, with a suggested fix ready to accept. No dashboards to check later.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works">
      {/* Desktop — pinned horizontal scroll */}
      <div
        data-scroll-horizontal
        className="relative hidden h-screen overflow-hidden lg:block"
      >
        <div className="mx-auto flex h-full max-w-[1180px] flex-col px-6 pb-16 pt-28">
          <div data-scroll-horizontal-header className="shrink-0 pb-12">
            <p className="section-kicker">
              <span className="kicker-index">03</span> How it works
            </p>
            <h2 className="mt-5 max-w-[560px] text-section font-medium text-dl-text">
              From install to invisible in under 60 seconds.
            </h2>
          </div>

          <div data-scroll-horizontal-viewport className="flex min-h-0 flex-1 items-center overflow-hidden">
            <div
              data-scroll-horizontal-track
              className="flex w-max items-stretch gap-8 pr-6"
            >
              {STEPS.map((step, i) => (
                <article
                  key={step.title}
                  data-scroll-panel
                  className="flex w-[340px] shrink-0 flex-col xl:w-[380px]"
                >
                  <span className="font-serif text-[32px] italic text-dl-blue">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-5 text-[18px] font-medium text-dl-text">{step.title}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-dl-muted">{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile — vertical stack */}
      <div className="px-6 py-[120px] lg:hidden">
        <div className="mx-auto max-w-[1080px]">
          <p className="section-kicker">
            <span className="kicker-index">03</span> How it works
          </p>
          <h2 className="mt-5 max-w-[560px] text-section-mobile font-medium text-dl-text">
            From install to invisible in under 60 seconds.
          </h2>

          <div className="mt-12 flex flex-col gap-10">
            {STEPS.map((step, i) => (
              <div key={step.title} className="border-l border-dl-border/50 pl-6">
                <span className="font-serif italic text-[15px] text-dl-blue">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-[15px] font-medium text-dl-text">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-dl-muted">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
