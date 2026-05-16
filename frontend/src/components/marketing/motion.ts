export const sectionReveal = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: 'easeOut' },
  },
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

export const staggerFast = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
}

export const inViewOptions = { once: true, margin: '-80px' as const }
