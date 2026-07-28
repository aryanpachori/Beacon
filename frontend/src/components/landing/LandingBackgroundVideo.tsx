'use client'

import { useState } from 'react'

const VIDEO_MP4 = '/videos/beacon-landing-hero.mp4'
const VIDEO_WEBM = '/videos/beacon-landing-hero.webm'
const POSTER_SRC = '/videos/beacon-landing-hero-poster.jpg'

export function LandingBackgroundVideo() {
  const [videoFailed, setVideoFailed] = useState(false)
  const [useWebm, setUseWebm] = useState(false)
  const videoSrc = useWebm ? VIDEO_WEBM : VIDEO_MP4

  if (videoFailed) return null

  return (
    <div className="landing-video-bg pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <video
        key={videoSrc}
        className="absolute inset-0 h-full w-full min-h-full min-w-full scale-[1.15] object-cover object-[68%_50%] opacity-45"
        src={videoSrc}
        poster={POSTER_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onError={() => {
          if (!useWebm) setUseWebm(true)
          else setVideoFailed(true)
        }}
      />
      <div className="absolute inset-0 bg-[#14110c]/68" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#14110c]/55 via-[#14110c]/45 to-[#14110c]/75" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(20,17,12,0.35)_100%)]" />
    </div>
  )
}
