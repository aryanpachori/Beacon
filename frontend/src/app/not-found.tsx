import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dl-bg px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dl-surface border border-dl-border mb-6">
        <span className="text-2xl font-bold text-dl-blue">404</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-dl-navy sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm text-dl-muted font-normal">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-dl-blue px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 shadow-sm"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
