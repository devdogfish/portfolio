'use client'

import { useActionState, useState, type ChangeEvent, type FormEvent } from 'react'
import { submitWebsiteInquiry } from '@/app/contact/inquiry-action'
import { readAnalyticsLinkCode } from '@/lib/analytics/session'

const fieldClass = 'w-full rounded-md border border-border bg-background px-3 py-2 text-base'
const labelClass = 'grid gap-1 text-sm font-medium'

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

  if (state.sent) return <p className="mt-7" role="status">Message sent.</p>
  return (
    <form className="mt-7 grid gap-4" action={action} onSubmit={prepare}>
      <input type="hidden" name="id" />
      <input type="hidden" name="link_code" />
      <label className={labelClass}>Name <input className={fieldClass} name="name" autoComplete="name" required maxLength={120} value={fields.name} onChange={change} /></label>
      <label className={labelClass}>Email <input className={fieldClass} type="email" name="email" autoComplete="email" required maxLength={254} value={fields.email} onChange={change} /></label>
      <label className={labelClass}>Topic <input className={fieldClass} name="topic" required maxLength={120} value={fields.topic} onChange={change} /></label>
      <label className={labelClass}>Message <textarea className={fieldClass} rows={4} name="message" required maxLength={8000} value={fields.message} onChange={change} /></label>
      <button className="min-h-12 justify-self-start rounded-md bg-primary px-5 py-3 text-primary-foreground disabled:opacity-60" type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send message'}</button>
      {state.error && <p className="text-sm text-destructive" role="alert">{state.error}</p>}
    </form>
  )
}
