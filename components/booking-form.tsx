'use client'

import { Button, Input, Textarea } from '@atom63/ui-react'
import { Calendar } from '@atom63/ui-react/calendar'
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { bookSlot, type BookingResult, type SlotsResult } from '@/app/book/actions'
import { readAnalyticsLinkCode } from '@/lib/analytics/session'
import { Turnstile, type TurnstileHandle } from './turnstile'

type Meeting = Extract<BookingResult, { status: 'booked' }>['meeting']

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const time = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
const longDay = (date: Date) => date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
const plusMinutes = (iso: string, minutes: number) => new Date(Date.parse(iso) + minutes * 60_000).toISOString()

function slotMessage(result: BookingResult) {
  switch (result.status) {
    case 'taken': return 'That time is no longer available.'
    case 'limited': {
      const minutes = result.retryAfter ? Math.max(1, Math.ceil(result.retryAfter / 60)) : undefined
      return `Too many booking attempts. Please try again${minutes ? ` in ${minutes} minute${minutes === 1 ? '' : 's'}` : ' in a few minutes'}.`
    }
    case 'challenge': return 'I couldn’t confirm you’re not a bot. Please try again.'
    case 'invalid': return 'Add your name, a valid email, and pick a time that hasn’t passed.'
    default: return 'The booking didn’t go through. Please try again, or email me instead.'
  }
}

export function BookingForm({ siteKey, email, openSlots }: { siteKey: string; email: string; openSlots: SlotsResult | null }) {
  const turnstile = useRef<TurnstileHandle>(null)
  const [token, setToken] = useState<string | null>(null)
  // The panel loads open times alongside its config; the Turnstile token is needed only to book.
  const initial = openSlots && 'slots' in openSlots ? openSlots.slots : null
  const first = initial?.[0] ? new Date(initial[0]) : undefined
  const [slots, setSlots] = useState<string[] | null>(initial)
  const [loadError, setLoadError] = useState<string | null>(initial ? null : 'Open times couldn’t be loaded right now.')
  const [day, setDay] = useState<Date | undefined>(first)
  const [month, setMonth] = useState<Date | undefined>(first)
  const [slot, setSlot] = useState<string | null>(null)
  const [fields, setFields] = useState({ name: '', email: '', note: '' })
  const [pending, setPending] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [booked, setBooked] = useState<Meeting | null>(null)
  const key = useRef<string | null>(null)
  const done = useRef<HTMLDivElement>(null)
  // Times show in the browser's own zone, named by that zone's city ("America/Halifax" -> "Halifax time"). The
  // visitor's IP location can name a different town, so it is not used. Zones with no city get the generic name.
  const locationLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, { timeZoneName: 'longGeneric' })
    const { timeZone } = formatter.resolvedOptions()
    if (timeZone.includes('/') && !timeZone.startsWith('Etc/')) return `${timeZone.split('/').pop()!.replace(/_/g, ' ')} time`
    return formatter.formatToParts().find(part => part.type === 'timeZoneName')?.value ?? timeZone
  }, [])

  const byDay = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const start of slots ?? []) {
      const id = dayKey(new Date(start))
      map.set(id, [...(map.get(id) ?? []), start])
    }
    return map
  }, [slots])

  function showSlots(next: string[]) {
    setSlots(next)
    setSlot(null)
    const first = next[0] ? new Date(next[0]) : undefined
    setDay(current => current && next.some(start => dayKey(new Date(start)) === dayKey(current)) ? current : first)
    setMonth(current => current ?? first)
  }

  // The form is gone once booked: bring the confirmation into view and to screen readers.
  useEffect(() => { if (booked) done.current?.focus() }, [booked])

  const change = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.currentTarget
    setFields(previous => ({ ...previous, [name]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!slot || !token || pending) return
    setPending(true)
    setNotice(null)
    key.current ??= crypto.randomUUID()
    let result: BookingResult
    try {
      result = await bookSlot({
        turnstile: token, key: key.current, start: slot, name: fields.name, email: fields.email,
        note: fields.note || undefined, link_code: readAnalyticsLinkCode() ?? undefined,
      })
    } catch {
      result = { status: 'failed' }
    }
    setPending(false)
    turnstile.current?.reset()
    if (result.status === 'booked') {
      setBooked(result.meeting)
      return
    }
    if (result.status === 'taken') {
      key.current = null
      if (result.slots) showSlots(result.slots)
      else setSlot(null)
    }
    setNotice(slotMessage(result))
  }

  if (booked) {
    const start = new Date(booked.start)
    return (
      <div className="booking-done" role="status" ref={done} tabIndex={-1}>
        <h2>You’re booked</h2>
        <p><strong>{longDay(start)}, {time(booked.start)} to {time(booked.end)}</strong> <span className="booking-zone">({locationLabel})</span></p>
        <p>A confirmation with a link to cancel is on its way to {fields.email}. Talk soon.</p>
      </div>
    )
  }

  const daySlots = day ? byDay.get(dayKey(day)) ?? [] : []
  const last = slots?.at(-1)
  return (
    <div className="booking">
      <Turnstile ref={turnstile} siteKey={siteKey} action="book" onToken={setToken}
        onError={() => setLoadError(current => current ?? 'The bot check couldn’t load. Refresh the page, or email me instead.')} />
      {loadError ? (
        <p className="status" role="alert">{loadError} You can always email me at <a href={`mailto:${email}`}>{email}</a>.</p>
      ) : !slots ? (
        <p className="status booking-loading" aria-live="polite">Loading open times…</p>
      ) : !slots.length ? (
        <p className="status">No open times in the next few weeks. Email me at <a href={`mailto:${email}`}>{email}</a> and we’ll find one.</p>
      ) : (
        <>
          <div className="booking-picker">
            <Calendar
              mode="single"
              selected={day}
              onSelect={next => { if (next) { setDay(next); setSlot(null) } }}
              month={month}
              onMonthChange={setMonth}
              startMonth={new Date()}
              endMonth={last ? new Date(last) : undefined}
              disabled={date => !byDay.has(dayKey(date))}
              showOutsideDays={false}
            />
            <div className="booking-slots">
              <p className="booking-day">{day ? longDay(day) : 'Pick a day'}</p>
              <p className="booking-zone">Shown in {locationLabel}</p>
              <ul aria-label="Open times">
                {daySlots.map(start => (
                  <li key={start}>
                    <Button type="button" size="sm" variant={slot === start ? 'default' : 'outline'}
                      aria-pressed={slot === start} onClick={() => { setSlot(start); setNotice(null) }}>
                      <time dateTime={start}>{time(start)}</time>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {slot && (
            <form className="form" onSubmit={submit}>
              <p className="booking-summary">
                {longDay(new Date(slot))}, {time(slot)} to {time(plusMinutes(slot, 30))} <span className="booking-summary-zone">({locationLabel})</span>
              </p>
              <label>Name<Input name="name" autoComplete="name" required maxLength={100} value={fields.name} onChange={change} /></label>
              <label>Email<Input type="email" name="email" autoComplete="email" required maxLength={254} value={fields.email} onChange={change} /></label>
              <label><span>Anything I should know? <span className="booking-optional">(optional)</span></span>
                <Textarea name="note" rows={3} maxLength={1000} value={fields.note} onChange={change} />
              </label>
              <div>
                <Button type="submit" size="lg" disabled={pending || !token}>{pending ? 'Booking…' : 'Confirm booking'}</Button>
              </div>
              {notice && <p className="status" role="alert">{notice}</p>}
            </form>
          )}
        </>
      )}
      {notice && !slot && <p className="status booking-notice" role="alert">{notice}</p>}
    </div>
  )
}
