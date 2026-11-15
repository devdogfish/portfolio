'use server'

import { randomUUID } from 'node:crypto'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { z } from 'zod'
import { analyticsLinkCode } from '@/lib/analytics/intake'
import { analyticsVisitor, sendAnalyticsBatch, sendAnalyticsInquiry } from '@/lib/analytics/server'

type InquiryState = { id?: string; sent?: boolean; error?: string }
const idSchema = z.string().uuid()
const inquiryInput = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  topic: z.enum(['project', 'hiring', 'other']),
  message: z.string().trim().min(1).max(8000),
})

export async function submitWebsiteInquiry(previous: InquiryState, form: FormData): Promise<InquiryState> {
  const prior = idSchema.safeParse(previous?.id)
  const proposed = idSchema.safeParse(form.get('id'))
  const id = prior.success ? prior.data : proposed.success ? proposed.data : randomUUID()
  const input = inquiryInput.safeParse({
    name: form.get('name'), email: form.get('email'), topic: form.get('topic'), message: form.get('message'),
  })
  if (!input.success) return { id, error: 'Add your name, a valid email, and a short message.' }

  const occurredAt = new Date()
  const visitor = analyticsVisitor(await headers(), occurredAt)
  const code = analyticsLinkCode.safeParse(form.get('link_code'))
  const link_code = !visitor.excluded && code.success ? code.data : undefined
  try {
    await sendAnalyticsInquiry({ id, ...input.data, link_code })
  } catch {
    return { id, error: 'Your message didn’t go through. Please try again, or email me directly.' }
  }

  if (!visitor.excluded) {
    after(async () => {
      try {
        await sendAnalyticsBatch([{
          id: randomUUID(), occurred_at: occurredAt.toISOString(), path: '/contact',
          kind: 'contact_form:submit', link_code, ip_id: visitor.ipId,
          device: visitor.device, props: { method: 'form', result: 'ok' },
        }])
      } catch {
        console.warn('Portfolio inquiry analytics delivery failed')
      }
    })
  }
  return { id, sent: true }
}
