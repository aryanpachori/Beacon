const COMPANIES = ['Acme Corp', 'BuildCo', 'ShipFast', 'Stackery', 'DevHQ']

export function SocialProof() {
  return (
    <section className="border-y border-dl-border bg-dl-card py-8">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-6 md:flex-row md:justify-between">
        <p className="shrink-0 text-[13px] text-dl-hint">Trusted by engineering teams at</p>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {COMPANIES.map((name) => (
            <span key={name} className="text-sm font-medium text-dl-teal/35">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
