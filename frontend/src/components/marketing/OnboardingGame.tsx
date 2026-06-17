'use client'

import { useEffect, useRef, useState } from 'react'

export function OnboardingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle')

  const logoRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = '/logo.png'
    img.onload = () => {
      logoRef.current = img
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // High Score loading
    const saved = localStorage.getItem('dl_game_highscore')
    if (saved) setHighScore(parseInt(saved, 10))

    let animationFrameId: number
    let frameCount = 0

    // Ground level
    const groundY = 160
    
    // Game entities
    const player = {
      x: 50,
      y: groundY - 32,
      width: 32,
      height: 32,
      vy: 0,
      gravity: 0.55,
      jumpStrength: -9.5,
      isGrounded: true,
      jumpsRemaining: 2,
    }

    let obstacles: { type: 'package' | 'drone' | 'missile'; x: number; y: number; width: number; height: number; speed: number }[] = []
    let scoreVal = 0
    let currentGameState = 'idle'
    let obstacleTimer = 0
    const stars: { x: number; y: number; size: number; speed: number }[] = Array.from({ length: 20 }, () => ({
      x: Math.random() * 600,
      y: Math.random() * 120,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.1,
    }))

    // Background mountains (8-bit style outline)
    const mountains: { x: number; width: number; height: number }[] = Array.from({ length: 6 }, (_, i) => ({
      x: i * 120,
      width: 120,
      height: Math.random() * 40 + 20,
    }))

    // Input handler
    const jump = () => {
      if (currentGameState === 'idle') {
        currentGameState = 'playing'
        setGameState('playing')
        // reset game
        obstacles = []
        scoreVal = 0
        setScore(0)
        player.y = groundY - player.height
        player.vy = 0
        player.isGrounded = true
        player.jumpsRemaining = 2
      } else if (currentGameState === 'playing') {
        if (player.isGrounded) {
          player.vy = player.jumpStrength
          player.isGrounded = false
          player.jumpsRemaining = 1
        } else if (player.jumpsRemaining > 0) {
          player.vy = player.jumpStrength * 0.9
          player.jumpsRemaining = 0
        }
      } else if (currentGameState === 'gameover') {
        currentGameState = 'playing'
        setGameState('playing')
        obstacles = []
        scoreVal = 0
        setScore(0)
        player.y = groundY - player.height
        player.vy = 0
        player.isGrounded = true
        player.jumpsRemaining = 2
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
    }

    const handleCanvasClick = (e: MouseEvent) => {
      e.preventDefault()
      jump()
    }

    window.addEventListener('keydown', handleKeyDown)
    canvas.addEventListener('mousedown', handleCanvasClick)

    // Main game loop
    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background sky
      ctx.fillStyle = '#081210'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw 8-bit stars
      ctx.fillStyle = '#c2d099'
      stars.forEach(star => {
        if (currentGameState === 'playing') {
          star.x -= star.speed
          if (star.x < 0) star.x = canvas.width
        }
        ctx.fillRect(Math.floor(star.x), Math.floor(star.y), Math.floor(star.size), Math.floor(star.size))
      })

      // Draw background mountains (parallax)
      ctx.fillStyle = '#11221e'
      ctx.beginPath()
      mountains.forEach((m) => {
        if (currentGameState === 'playing') {
          m.x -= 0.3
          if (m.x + m.width < 0) {
            m.x = canvas.width
            m.height = Math.random() * 40 + 20
          }
        }
        
        // Draw pixelated triangles
        ctx.moveTo(m.x, groundY)
        ctx.lineTo(m.x + m.width / 2, groundY - m.height)
        ctx.lineTo(m.x + m.width, groundY)
      })
      ctx.fill()

      // Draw ground line
      ctx.strokeStyle = '#35858e'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(0, groundY)
      ctx.lineTo(canvas.width, groundY)
      ctx.stroke()

      // Draw ground block (underground)
      ctx.fillStyle = '#0e1614'
      ctx.fillRect(0, groundY + 2, canvas.width, canvas.height - groundY)

      // Draw pixelated grass lines on ground
      ctx.fillStyle = '#7da78c'
      for (let i = 0; i < canvas.width; i += 40) {
        const xOffset = (i + (currentGameState === 'playing' ? -Math.floor(frameCount * 2.5) % 40 : 0) + 40) % canvas.width
        ctx.fillRect(xOffset, groundY, 4, 6)
      }

      // Update Player
      if (currentGameState === 'playing') {
        player.vy += player.gravity
        player.y += player.vy

        if (player.y >= groundY - player.height) {
          player.y = groundY - player.height
          player.vy = 0
          player.isGrounded = true
          player.jumpsRemaining = 2
        }
      }

      // Draw Player (lighthouse logo sprite)
      if (logoRef.current) {
        ctx.save()
        let drawHeight = player.height
        let drawWidth = player.width
        if (!player.isGrounded) {
          if (player.vy < 0) {
            drawHeight = player.height + 4
            drawWidth = player.width - 2
          } else {
            drawHeight = player.height - 2
            drawWidth = player.width + 2
          }
        } else if (currentGameState === 'playing' && Math.floor(frameCount / 6) % 2 === 0) {
          drawHeight = player.height - 2
        }
        ctx.drawImage(
          logoRef.current,
          player.x + (player.width - drawWidth) / 2,
          player.y + (player.height - drawHeight),
          drawWidth,
          drawHeight
        )
        ctx.restore()
      } else {
        ctx.fillStyle = '#35858e'
        ctx.fillRect(player.x, player.y, player.width, player.height)
        ctx.fillStyle = '#000000'
        ctx.fillRect(player.x + 16, player.y + 6, 12, 4)
      }

      // Spawning Obstacles
      if (currentGameState === 'playing') {
        obstacleTimer++
        const spawnThreshold = Math.max(55, 115 - Math.floor(scoreVal / 2))
        if (obstacleTimer > spawnThreshold) {
          obstacleTimer = 0
          const spawnType = Math.random()

          // 18% chance to spawn a combination (flying + ground obstacles at the same time) once score > 10
          if (spawnType < 0.18 && scoreVal > 10) {
            const comboType = Math.random()
            if (comboType < 0.5) {
              // Combo 1: Low ground package + high missile vertically stacked (requires precision single-jump through the gap!)
              const packageHeight = 22
              obstacles.push({
                type: 'package',
                x: canvas.width,
                y: groundY - packageHeight,
                width: 22,
                height: packageHeight,
                speed: 4.5 + Math.min(4, scoreVal / 45),
              })
              obstacles.push({
                type: 'missile',
                x: canvas.width,
                y: groundY - 105,
                width: 28,
                height: 12,
                speed: 4.5 + Math.min(4, scoreVal / 45),
              })
            } else {
              // Combo 2: Ground package followed closely by a drone (requires a jump + double-jump sequence)
              const packageHeight = 24
              obstacles.push({
                type: 'package',
                x: canvas.width,
                y: groundY - packageHeight,
                width: 24,
                height: packageHeight,
                speed: 4.5 + Math.min(4, scoreVal / 45),
              })
              const randomHeight = Math.floor(Math.random() * 75) + 30 // any height from 30 to 105 pixels above ground
              obstacles.push({
                type: 'drone',
                x: canvas.width + 80, // offset in X
                y: groundY - randomHeight,
                width: 24,
                height: 16,
                speed: 4.5 + Math.min(4, scoreVal / 45),
              })
            }
          } else {
            // Standard single obstacle spawns
            const singleType = Math.random()
            if (singleType < 0.25) {
              // Missile (high level flying obstacle)
              obstacles.push({
                type: 'missile',
                x: canvas.width,
                y: groundY - 100,
                width: 28,
                height: 12,
                speed: 6.0 + Math.min(4, scoreVal / 45),
              })
            } else if (singleType < 0.50) {
              // Drone (any height flying obstacle)
              const randomHeight = Math.floor(Math.random() * 75) + 30 // any height from 30 to 105 pixels above ground
              obstacles.push({
                type: 'drone',
                x: canvas.width,
                y: groundY - randomHeight,
                width: 24,
                height: 16,
                speed: 5.0 + Math.min(4, scoreVal / 45),
              })
            } else {
              // Ground package
              const sizeType = Math.random()
              let width = 24
              let height = 24
              if (sizeType > 0.7) {
                width = 30
                height = 30
              } else if (sizeType > 0.4) {
                width = 20
                height = 34
              }
              obstacles.push({
                type: 'package',
                x: canvas.width,
                y: groundY - height,
                width,
                height,
                speed: 4.5 + Math.min(4, scoreVal / 45),
              })
            }
          }
        }
      }

      // Draw & Update Obstacles
      obstacles.forEach((obs) => {
        if (currentGameState === 'playing') {
          obs.x -= obs.speed
        }

        if (obs.type === 'drone') {
          // Draw drone body (8-bit style)
          ctx.fillStyle = '#4a5568'
          ctx.fillRect(Math.floor(obs.x + 4), Math.floor(obs.y + 4), obs.width - 8, obs.height - 8)

          // Spinning propellers animation
          const propOffset = Math.floor(frameCount / 3) % 2 === 0 ? 0 : 2
          ctx.fillStyle = '#cbd5e0'
          // Left propeller
          ctx.fillRect(Math.floor(obs.x), Math.floor(obs.y + propOffset), 6, 2)
          // Right propeller
          ctx.fillRect(Math.floor(obs.x + obs.width - 6), Math.floor(obs.y + propOffset), 6, 2)

          // Connector rods
          ctx.fillStyle = '#2d3748'
          ctx.fillRect(Math.floor(obs.x + 3), Math.floor(obs.y + 3), 2, 3)
          ctx.fillRect(Math.floor(obs.x + obs.width - 5), Math.floor(obs.y + 3), 2, 3)

          // Blinking red light
          const isLightOn = Math.floor(frameCount / 10) % 2 === 0
          ctx.fillStyle = isLightOn ? '#e53e3e' : '#742a2a'
          ctx.fillRect(Math.floor(obs.x + obs.width / 2 - 2), Math.floor(obs.y + obs.height / 2 - 2), 4, 4)
        } else if (obs.type === 'missile') {
          // Draw missile body (red with orange nose cone and fins)
          ctx.fillStyle = '#e53e3e'
          ctx.fillRect(Math.floor(obs.x + 6), Math.floor(obs.y + 2), obs.width - 10, obs.height - 4)

          // Nose cone
          ctx.fillStyle = '#f6ad55'
          ctx.fillRect(Math.floor(obs.x + obs.width - 4), Math.floor(obs.y + 4), 4, obs.height - 8)

          // Rear fins
          ctx.fillStyle = '#742a2a'
          ctx.fillRect(Math.floor(obs.x + 2), Math.floor(obs.y), 4, 3)
          ctx.fillRect(Math.floor(obs.x + 2), Math.floor(obs.y + obs.height - 3), 4, 3)

          // Flickering flame trail
          const flameOffset = Math.floor(frameCount / 2) % 2 === 0 ? 0 : 3
          ctx.fillStyle = '#ecc94b'
          ctx.fillRect(Math.floor(obs.x - 6 + flameOffset), Math.floor(obs.y + 4), 8 - flameOffset, 4)
          ctx.fillStyle = '#f6ad55'
          ctx.fillRect(Math.floor(obs.x + 2), Math.floor(obs.y + 3), 4, 6)
        } else {
          ctx.fillStyle = '#c68a4c'
          ctx.fillRect(Math.floor(obs.x), Math.floor(obs.y), obs.width, obs.height)

          ctx.fillStyle = '#a56c33'
          ctx.fillRect(Math.floor(obs.x), Math.floor(obs.y), obs.width, 2)
          ctx.fillRect(Math.floor(obs.x), Math.floor(obs.y + obs.height - 2), obs.width, 2)
          ctx.fillRect(Math.floor(obs.x), Math.floor(obs.y), 2, obs.height)
          ctx.fillRect(Math.floor(obs.x + obs.width - 2), Math.floor(obs.y), 2, obs.height)

          ctx.fillStyle = '#563c22'
          ctx.fillRect(Math.floor(obs.x + 2), Math.floor(obs.y + obs.height / 2 - 3), obs.width - 4, 5)
          ctx.fillRect(Math.floor(obs.x + obs.width / 2 - 3), Math.floor(obs.y + 2), 5, obs.height - 4)

          ctx.fillStyle = '#f0f5e8'
          ctx.fillRect(Math.floor(obs.x + 4), Math.floor(obs.y + 4), 6, 5)
        }

        // Collision Check
        const padX = 5
        const padY = 4
        if (
          player.x + padX < obs.x + obs.width &&
          player.x + player.width - padX > obs.x &&
          player.y + padY < obs.y + obs.height &&
          player.y + player.height - padY > obs.y
        ) {
          currentGameState = 'gameover'
          setGameState('gameover')
          const currentHigh = localStorage.getItem('dl_game_highscore')
          const parsedHigh = currentHigh ? parseInt(currentHigh, 10) : 0
          if (scoreVal > parsedHigh) {
            localStorage.setItem('dl_game_highscore', scoreVal.toString())
            setHighScore(scoreVal)
          }
        }
      })

      obstacles = obstacles.filter(obs => obs.x + obs.width > 0)

      if (currentGameState === 'playing') {
        frameCount++
        if (frameCount % 6 === 0) {
          scoreVal++
          setScore(scoreVal)
        }
      }

      if (currentGameState === 'idle') {
        ctx.fillStyle = 'rgba(8, 18, 16, 0.75)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = '#f0f5e8'
        ctx.font = 'bold 15px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('DEPENDENCY ROT ESCAPE', canvas.width / 2, 70)
        
        ctx.fillStyle = '#c2d099'
        ctx.font = '11px monospace'
        ctx.fillText('Jump over decaying packages!', canvas.width / 2, 100)
        ctx.fillText('Use SPACE / ArrowUp or TAP/Click to JUMP', canvas.width / 2, 120)

        if (Math.floor(Date.now() / 500) % 2 === 0) {
          ctx.fillStyle = '#35858e'
          ctx.font = 'bold 11px monospace'
          ctx.fillText('PRESS SPACE TO START', canvas.width / 2, 150)
        }
      }

      if (currentGameState === 'gameover') {
        ctx.fillStyle = 'rgba(192, 48, 48, 0.15)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = '#e05252'
        ctx.font = 'bold 20px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('PACKAGE ROT OVERTAKEN!', canvas.width / 2, 75)

        ctx.fillStyle = '#f0f5e8'
        ctx.font = '13px monospace'
        ctx.fillText(`Score: ${scoreVal}`, canvas.width / 2, 105)
        
        ctx.fillStyle = '#c2d099'
        ctx.font = '11px monospace'
        ctx.fillText('Press SPACE or TAP to reboot system', canvas.width / 2, 135)
      }

      animationFrameId = requestAnimationFrame(update)
    }

    animationFrameId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('keydown', handleKeyDown)
      canvas.removeEventListener('mousedown', handleCanvasClick)
    }
  }, [])

  return (
    <div className="flex flex-col gap-3 h-full justify-between">
      <div className="flex items-center justify-between border-b border-dl-border/30 pb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-dl-muted">
          Integrity Scan Playroom
        </span>
        <div className="flex gap-4 text-xs font-mono text-dl-forest">
          <div>
            Score: <span className="font-semibold text-dl-teal">{score}</span>
          </div>
          <div>
            Hi-Score: <span className="font-semibold text-dl-healthy">{highScore}</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-dl-m-border/40 shadow-inner w-full flex items-center justify-center bg-[#081210]">
        <canvas
          ref={canvasRef}
          width={500}
          height={200}
          className="w-full h-auto aspect-[5/2]"
        />
      </div>
    </div>
  )
}
