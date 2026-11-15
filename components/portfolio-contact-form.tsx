'use client'

import { useActionState, useState, type ChangeEvent, type FormEvent } from 'react'
import { submitWebsiteInquiry } from '@/app/contact/inquiry-action'
import { readAnalyticsLinkCode } from '@/lib/analytics/session'

export function PortfolioContactForm() {
  const [state, action, pending] = useActionState(submitWebsiteInquiry, {})
  const [fields, setFields] = useState({ name: '', email: '', topic: '', message: '' })
  const change = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.currentTarget
    setFields(previous => ({ ...previous, [name]: value }))
  }
  const prepare = (event: FormEvent<HTMLFormElement>) => {
    const { elements } = event.currentTarget
    const id = elements.namedItem('id') as HTMLInputElement
    const code = elements.namedItem('link_code') as HTMLInputElement
    id.value = state.id || id.value || crypto.randomUUID()
    code.value = readAnalyticsLinkCode() ?? ''
  }

  if (state.sent) return <p role="status">Message sent.</p>
  return (
    <form action={action} onSubmit={prepare}>
      <input type="hidden" name="id" />
      <input type="hidden" name="link_code" />
      <label>Name <input name="name" autoComplete="name" required maxLength={120} value={fields.name} onChange={change} /></label>
      <label>Email <input type="email" name="email" autoComplete="email" required maxLength={254} value={fields.email} onChange={change} /></label>
      <label>Topic <input name="topic" required maxLength={120} value={fields.topic} onChange={change} /></label>
      <label>Message <textarea name="message" required maxLength={8000} value={fields.message} onChange={change} /></label>
      <button type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send message'}</button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  )
}
