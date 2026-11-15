'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import type { startAnalytics } from '@/lib/analytics/tracker'

export function AnalyticsTracker() {
  const pathname = usePathname()
  const tracker = useRef<ReturnType<typeof startAnalytics>>(undefined)

  useEffect(() => {
    let mounted = true
    const start = () => {
      void import('@/lib/analytics/tracker').then(({ startAnalytics }) => {
        if (mounted) tracker.current = startAnalytics()
      })
    }
    const idle = typeof window.requestIdleCallback === 'function'
    const handle = idle ? window.requestIdleCallback(start) : window.setTimeout(start, 0)
    return () => {
      mounted = false
      if (idle) window.cancelIdleCallback(handle)
      else clearTimeout(handle)
      tracker.current?.stop()
      tracker.current = undefined
    }
  }, [])

  useEffect(() => { tracker.current?.view() }, [pathname])
  return null
}
