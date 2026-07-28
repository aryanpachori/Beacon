'use client'

import { RefObject, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const SCRUB = 0.35
const HORIZONTAL_SCRUB = 0.7
const HORIZONTAL_SETTLE = 0.22
/* How much the horizontal pan overlaps the tail of the vertical settle
   phase — with an eased (not linear) pan, the overlap means the pan's
   near-zero starting velocity blends into the settle instead of the
   two phases meeting at a hard, dead-stop handoff. */
const HORIZONTAL_OVERLAP = 0.08

function playReveal(
  elements: gsap.TweenTarget,
  options: { y?: number; stagger?: number; duration?: number; trigger?: Element | null } = {}
) {
  const { y = 20, stagger = 0, duration = 0.45, trigger } = options
  const targets = gsap.utils.toArray(elements)
  if (!targets.length) return

  const triggerEl = trigger ?? (targets[0] as Element)

  ScrollTrigger.create({
    trigger: triggerEl,
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.fromTo(
        targets,
        { y, opacity: 0 },
        { y: 0, opacity: 1, duration, ease: 'power3.out', stagger, overwrite: 'auto' }
      )
    },
  })
}

function heroExitDistance(el: HTMLElement | null, axis: 'x' | 'y', direction: 1 | -1) {
  if (!el) return axis === 'y' ? -window.innerHeight : 0
  const rect = el.getBoundingClientRect()
  if (axis === 'y') {
    return -(window.innerHeight * 0.5 + rect.height * 0.6)
  }
  return direction * (window.innerWidth * 0.28 + rect.width * 0.35)
}

export function useLandingScroll(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const hero = root.querySelector<HTMLElement>('[data-scroll-hero]')
      const heroContent = root.querySelector<HTMLElement>('[data-scroll-hero-content]')
      const heroVisual = root.querySelector<HTMLElement>('[data-scroll-hero-visual]')

      if (hero && heroContent) {
        gsap.set([heroContent, heroVisual], { opacity: 1, y: 0, x: 0 })

        gsap
          .timeline({
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: 'bottom top',
              scrub: SCRUB,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            heroContent,
            { y: 0, x: 0, opacity: 1 },
            {
              y: () => heroExitDistance(heroContent, 'y', -1),
              x: () => heroExitDistance(heroContent, 'x', -1),
              opacity: 0,
              ease: 'power2.in',
            },
            0
          )
          .fromTo(
            heroVisual ?? heroContent,
            { y: 0, x: 0, opacity: 1 },
            {
              y: () => heroExitDistance(heroVisual, 'y', -1),
              x: () => heroExitDistance(heroVisual, 'x', 1),
              opacity: 0,
              ease: 'power2.in',
            },
            0
          )
      }

      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px)', () => {
        const horizontal = root.querySelector<HTMLElement>('[data-scroll-horizontal]')
        const viewport = horizontal?.querySelector<HTMLElement>('[data-scroll-horizontal-viewport]')
        const track = horizontal?.querySelector<HTMLElement>('[data-scroll-horizontal-track]')

        if (horizontal && track && viewport) {
          const panels = gsap.utils.toArray<HTMLElement>('[data-scroll-panel]', track)

          const getScrollDistance = () => {
            const lastPanel = panels[panels.length - 1]
            if (!lastPanel) return 0
            const padding = 24
            return Math.max(
              0,
              lastPanel.offsetLeft + lastPanel.offsetWidth - viewport.clientWidth + padding
            )
          }

          const setupHorizontal = () => {
            const scrollDistance = getScrollDistance()
            if (scrollDistance <= 40) return

            const header = horizontal.querySelector<HTMLElement>('[data-scroll-horizontal-header]')

            gsap.set(track, { x: 0 })
            gsap.set(panels, { opacity: 1, y: 0 })
            if (header) gsap.set(header, { opacity: 1, y: 0 })

            const settleScroll = window.innerHeight * HORIZONTAL_SETTLE
            const totalScroll = settleScroll + scrollDistance
            const horizontalStart = settleScroll / totalScroll

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: horizontal,
                start: 'top top',
                end: () => `+=${totalScroll}`,
                pin: true,
                scrub: HORIZONTAL_SCRUB,
                invalidateOnRefresh: true,
                anticipatePin: 1,
              },
            })

            if (header) {
              tl.fromTo(
                header,
                { y: 28, opacity: 0.6 },
                { y: 0, opacity: 1, ease: 'power2.out', duration: horizontalStart },
                0
              )
            }

            // Start the pan slightly before the settle phase ends. Because
            // it's eased (not linear), its opening velocity is near zero —
            // that overlap is what makes the hand-off read as one continuous
            // motion instead of a dead stop followed by a sideways yank.
            const panStart = Math.max(0, horizontalStart - HORIZONTAL_OVERLAP)
            tl.fromTo(
              track,
              { x: 0 },
              { x: () => -getScrollDistance(), ease: 'power1.inOut', duration: 1 - panStart },
              panStart
            )
          }

          setupHorizontal()
        }
      })

      const beforeAfter = root.querySelector<HTMLElement>('[data-scroll-before-after]')
      const withoutPanel = root.querySelector<HTMLElement>('[data-scroll-panel-without]')
      const withPanel = root.querySelector<HTMLElement>('[data-scroll-panel-with]')

      if (beforeAfter && withoutPanel && withPanel) {
        gsap.set([withoutPanel, withPanel], { opacity: 1, x: 0 })

        ScrollTrigger.create({
          trigger: beforeAfter,
          start: 'top 78%',
          once: true,
          onEnter: () => {
            gsap.fromTo(
              withoutPanel,
              { x: -28, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
            )
            gsap.fromTo(
              withPanel,
              { x: 28, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.04 }
            )
          },
        })
      }

      gsap.utils.toArray<HTMLElement>('[data-scroll-reveal]', root).forEach((el) => {
        playReveal(el)
      })

      const revealGroups = gsap.utils.toArray<HTMLElement>('[data-scroll-reveal-group]', root)
      revealGroups.forEach((group) => {
        const items = group.querySelectorAll(':scope > *')
        if (!items.length) return

        ScrollTrigger.create({
          trigger: group,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            gsap.fromTo(
              items,
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.05 }
            )
          },
        })
      })

      const featuresSection = root.querySelector('[data-scroll-features]')
      const featureCards = gsap.utils.toArray<HTMLElement>('[data-scroll-feature-card]', root)
      if (featuresSection && featureCards.length) {
        gsap.set(featureCards, { opacity: 1, y: 0 })

        ScrollTrigger.create({
          trigger: featuresSection,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.fromTo(
              featureCards,
              { y: 16, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.06 }
            )
          },
        })
      }

      const stats = root.querySelector<HTMLElement>('[data-scroll-stats]')
      if (stats) {
        gsap.set(stats, { opacity: 1, y: 0 })
      }

      const ctaInner = root.querySelector<HTMLElement>('[data-scroll-cta-inner]')
      if (ctaInner) playReveal(ctaInner, { y: 24, duration: 0.45 })
    }, root)

    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('resize', refresh)
    window.addEventListener('load', refresh)
    const t = window.setTimeout(refresh, 400)

    return () => {
      window.removeEventListener('resize', refresh)
      window.removeEventListener('load', refresh)
      window.clearTimeout(t)
      ctx.revert()
    }
  }, [rootRef])
}
