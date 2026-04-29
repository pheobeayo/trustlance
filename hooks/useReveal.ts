'use client'
import { useEffect, useRef } from 'react'

/**
 * Returns a ref-setter function and a CSS class name.
 * Any element passed to the ref setter will animate in
 * when it enters the viewport.
 */
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
