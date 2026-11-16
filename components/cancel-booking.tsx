'use client'

import { Button } from '@atom63/ui-react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { cancelBooking, type CancelResult } from '@/app/book/actions'
import { Turnstile, type TurnstileHandle } from './turnstile'

const messages: Record<Exclude<CancelResult['status'], 'cancelled'>, string> = {
  missing: 'This cancel link isn’t valid anymore. The call may already be cancelled.',
  limited: 'Too many attempts. Please try again in a few minutes.',
  challenge: 'I couldn’t confirm you’re not a bot. Please try again.',
  failed: 'The cancellation didn’t go through. Please try again, or email me.',
}

export function CancelBooking({ token, siteKey, email }: { token: string; siteKey: string; email: string }) {
  const turnstile = useRef<TurnstileHandle>(null)
  const [challenge, setChallenge] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<CancelResult['status'] | null>(null)

  async function cancel() {
    if (!challenge || pending) return
    setPending(true)
    let status: CancelResult['status']
    try {
      status = (await cancelBooking(token, challenge)).status
    } catch {
      status = 'failed'
    }
    setPending(false)
    setResult(status)
    if (status !== 'cancelled' && status !== 'missing') turnstile.current?.reset()
  }

  if (result === 'cancelled') {
    return (
      <div className="booking-done" role="status">
        <p className="lede">Your call is cancelled. Thanks for letting me know.</p>
        <p><Link href="/book">Pick another time</Link> whenever suits you.</p>
      </div>
    )
  }
  if (result === 'missing') {
    return (
      <p className="status" role="alert">
        {messages.missing} <Link href="/book">Book a new time</Link> or email <a href={`mailto:${email}`}>{email}</a>.
      </p>
    )
  }
  return (
    <div className="form">
      <p className="lede">This frees up the time slot. You can always book another one later.</p>
      <Turnstile ref={turnstile} siteKey={siteKey} action="cancel" onToken={setChallenge}
        onError={() => setResult(current => current ?? 'challenge')} />
      <div>
        <Button type="button" size="lg" disabled={pending || !challenge} onClick={cancel}>
          {pending ? 'Cancelling…' : 'Cancel my call'}
        </Button>
      </div>
      {result && <p className="status" role="alert">{messages[result]}</p>}
    </div>
  )
}
