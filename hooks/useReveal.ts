'use client'
import { useEffect, useRef } from 'react'

/** Attaches a scroll-parallax translate to the returned ref. */
export function useReveal(visibleClass: string) {
  const refs = useRef<HTMLElement[]>([])
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add(visibleClass)
          io.unobserve(e.target)
        }
      }),
      { threshold: 0.08 }
    )
    refs.current.forEach(el => el && io.observe(el))
    return () => io.disconnect()
  }, [visibleClass])

  const ref = (el: HTMLElement | null) => {
    if (el && !refs.current.includes(el)) refs.current.push(el)
  }

  return ref
}
