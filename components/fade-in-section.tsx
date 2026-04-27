'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface FadeInSectionProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FadeInSection({ children, delay = 0, className = '' }: FadeInSectionProps) {
  const domRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('is-visible')
          }, delay)
        }
      })
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    })

    const currentRef = domRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [delay])

  return (
    <div ref={domRef} className={`fade-in-section ${className}`}>
      {children}
    </div>
  )
}
