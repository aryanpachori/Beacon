'use client'

import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-ring {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        .pulse-ring-1 {
          animation: pulse-ring 3.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .pulse-ring-2 {
          animation: pulse-ring 3.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          animation-delay: 1.1s;
        }
        .pulse-ring-3 {
          animation: pulse-ring 3.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          animation-delay: 2.2s;
        }
      `}} />

      <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#060B14] px-6 py-24 text-center font-sans antialiased select-none overflow-hidden">
        {/* Subtle Blue Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#3B82F6]/10 rounded-full blur-[90px] pointer-events-none" />

        {/* Glass Card Container */}
        <div className="relative z-10 flex flex-col items-center max-w-sm w-full rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-[12px] p-10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)]">
          
          {/* Beacon Pulse */}
          <div className="relative flex items-center justify-center w-24 h-24 mb-8">
            <div className="absolute w-20 h-20 rounded-full bg-[#3B82F6]/5 border border-[#3B82F6]/20 pulse-ring-1" />
            <div className="absolute w-20 h-20 rounded-full bg-[#3B82F6]/5 border border-[#3B82F6]/15 pulse-ring-2" />
            <div className="absolute w-20 h-20 rounded-full bg-[#3B82F6]/5 border border-[#3B82F6]/10 pulse-ring-3" />
            {/* Core Beacon */}
            <div className="relative w-4 h-4 rounded-full bg-[#3B82F6] shadow-[0_0_20px_6px_rgba(59,130,246,0.4)]" />
          </div>

          {/* 404 Status */}
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#3B82F6] mb-2 font-mono">
            404
          </span>

          {/* Title */}
          <h1 className="text-[20px] font-semibold tracking-tight text-white mb-3">
            Signal Lost
          </h1>

          {/* Description */}
          <p className="text-[13px] leading-relaxed text-neutral-400 mb-8 max-w-[280px]">
            The resource you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>

          {/* Go Back Trigger */}
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-6 py-2.5 text-[12px] font-medium tracking-wide text-neutral-300 transition-all hover:bg-white/5 hover:text-white hover:border-white/20 active:scale-[0.98]"
          >
            <span className="transition-transform duration-150 group-hover:-translate-x-0.5">←</span>
            Go Back
          </button>
        </div>
      </div>
    </>
  )
}
