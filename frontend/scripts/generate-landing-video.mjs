import { mkdirSync, renameSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'public', 'videos')
const OUT_MP4 = join(OUT_DIR, 'beacon-landing-hero.mp4')
const OUT_WEBM = join(OUT_DIR, 'beacon-landing-hero.webm')
const OUT_POSTER = join(OUT_DIR, 'beacon-landing-hero-poster.jpg')

// Symmetry loop from https://separate-integrate.tumblr.com/post/656514289974345728
const SOURCE_MP4 =
  'https://64.media.tumblr.com/a07f24820b9d6f7bd065d60a4abce894/tumblr_ouhvddrDNw1s4fz4bo1_1280.mp4'

mkdirSync(OUT_DIR, { recursive: true })

function getFfmpegPath() {
  try {
    const require = createRequire(import.meta.url)
    return require('@ffmpeg-installer/ffmpeg').path
  } catch {
    return null
  }
}

function curlDownload(url, dest) {
  return new Promise((resolve, reject) => {
    const proc = spawn('curl', ['-sL', url, '-o', dest], { stdio: 'inherit' })
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`curl exit ${code}`))))
    proc.on('error', reject)
  })
}

async function main() {
  console.log('Downloading hero video…')
  await curlDownload(SOURCE_MP4, OUT_MP4)
  console.log(`Wrote ${OUT_MP4}`)

  const ffmpeg = getFfmpegPath()
  if (!ffmpeg) {
    console.warn('ffmpeg not found — skipped webm/poster generation')
    return
  }

  spawnSync(ffmpeg, ['-y', '-i', OUT_MP4, '-vframes', '1', '-q:v', '2', OUT_POSTER], { stdio: 'inherit' })
  console.log(`Wrote ${OUT_POSTER}`)

  spawnSync(
    ffmpeg,
    ['-y', '-i', OUT_MP4, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '33', OUT_WEBM],
    { stdio: 'inherit' }
  )
  console.log(`Wrote ${OUT_WEBM}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
