'use client'

import { Button, Input, Textarea } from '@atom63/ui-react'
import { useActionState, useState, type ChangeEvent, type FormEvent } from 'react'
import { submitWebsiteInquiry } from '@/app/contact/inquiry-action'
import { readAnalyticsLinkCode } from '@/lib/analytics/session'

export function ContactForm({ topic = 'project' }: { topic?: 'project' | 'hiring' | 'other' }) {
  const [state, action, pending] = useActionState(submitWebsiteInquiry, {})
  const [fields, setFields] = useState({ name: '', email: '', message: '' })
  const change = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.currentTarget
    setFields(previous => ({ ...previous, [name]: value }))
  }
  // Fills the dedupe id and the visitor's tracked-link code just before submitting.
  const prepare = (event: FormEvent<HTMLFormElement>) => {
    const { elements } = event.currentTarget
    const id = elements.namedItem('id') as HTMLInputElement
    const code = elements.namedItem('link_code') as HTMLInputElement
    id.value = state.id || id.value || crypto.randomUUID()
    code.value = readAnalyticsLinkCode() ?? ''
  }

  if (state.sent) {
    return <p className="status" role="status">Thanks, I’ve got your message. I’ll reply within twenty-four hours.</p>
  }
  return (
    <form className="form" action={action} onSubmit={prepare}>
      <input type="hidden" name="id" />
      <input type="hidden" name="link_code" />
      <input type="hidden" name="topic" value={topic} />
      <label>Name<Input name="name" autoComplete="name" required maxLength={120} value={fields.name} onChange={change} /></label>
      <label>Email<Input type="email" name="email" autoComplete="email" required maxLength={254} value={fields.email} onChange={change} /></label>
      <label>What can I help you build?<Textarea name="message" rows={5} required maxLength={8000} value={fields.message} onChange={change} /></label>
      <div>
        <Button type="submit" size="lg" disabled={pending} data-track="cta:contact-submit">{pending ? 'Sending…' : 'Send message'}</Button>
      </div>
      {state.error && <p className="status" role="alert">{state.error}</p>}
    </form>
  )
}
