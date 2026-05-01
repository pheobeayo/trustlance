'use client'
import { useEffect, useRef } from 'react'

/** Attaches a scroll-parallax translate to the returned ref. */
export function useParallax(speed = 0.35) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      el.style.transform = `translateY(${window.scrollY * speed}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [speed])
  return ref
}

/** Returns a ref-setter that triggers tw-animate-css classes when element enters viewport. */
export function useReveal() {
  const refs = useRef<HTMLElement[]>([])
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        e.target.classList.remove('opacity-0', 'translate-y-6')
        e.target.classList.add('opacity-100', 'translate-y-0')
        io.unobserve(e.target)
      })
    }, { threshold: 0.08 })
    refs.current.forEach(el => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (el: HTMLElement | null) => {
    if (el && !refs.current.includes(el)) refs.current.push(el)
  }
}
