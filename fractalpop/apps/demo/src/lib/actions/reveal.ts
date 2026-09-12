/** Scroll-triggered entrance. Adds `is-in` once the node crosses into view and
 *  then stops observing — Aura's motion brief is restrained, one-way reveals. */
export function reveal(node: HTMLElement, delay = 0) {
  node.classList.add('reveal')
  if (delay) node.style.setProperty('--reveal-delay', `${delay}ms`)

  if (typeof IntersectionObserver === 'undefined') {
    node.classList.add('is-in')
    return {}
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      node.classList.add('is-in')
      io.disconnect()
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  )
  io.observe(node)

  return { destroy: () => io.disconnect() }
}
