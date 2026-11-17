'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BookingForm, type BookingLocation } from './booking-form'
import { CancelBooking } from './cancel-booking'

type BookingConfig = { siteKey: string | null; canBook: boolean; location: BookingLocation | null }

function cancelToken(pathname: string) {
  const segment = /^\/book\/cancel\/([^/]+)\/?$/.exec(pathname)?.[1]
  if (!segment) return null
  try {
    return decodeURIComponent(segment)
  } catch {
    return null
  }
}

export function BookingPanel({ mode, email }: { mode: 'book' | 'cancel'; email: string }) {
  const pathname = usePathname()
  const [config, setConfig] = useState<BookingConfig | null | undefined>(undefined)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/booking-config', { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(setConfig)
      .catch(() => { if (!controller.signal.aborted) setConfig(null) })
    return () => controller.abort()
  }, [])

  if (config === undefined) {
    return mode === 'book'
      ? <p className="status booking-loading">Loading open times…</p>
      : <p className="status">Loading…</p>
  }
  const mail = <a href={`mailto:${email}`}>{email}</a>
  if (mode === 'book') {
    return config?.siteKey && config.canBook
      ? <BookingForm siteKey={config.siteKey} email={email} location={config.location} />
      : <p className="status">Booking is unavailable right now. Email me at {mail} instead.</p>
  }
  if (!config?.siteKey) {
    return <p className="status">Cancelling is unavailable right now. Email me at {mail} and I’ll cancel it for you.</p>
  }
  const token = cancelToken(pathname)
  return token
    ? <CancelBooking key={token} token={token} siteKey={config.siteKey} email={email} />
    : <p className="status" role="alert">This cancel link isn’t valid. Email me at {mail} for help.</p>
}
