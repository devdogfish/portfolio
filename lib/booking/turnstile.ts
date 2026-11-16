// Server imports only. Verifies a Cloudflare Turnstile token before any booking API call.
import { z } from 'zod'

const siteverify = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const reply = z.object({ success: z.boolean() })

// Tests point verification at a loopback fixture. Any other override is ignored.
function verifyUrl() {
  const override = process.env.TURNSTILE_VERIFY_URL
  if (!override) return siteverify
  const url = new URL(override)
  return url.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) ? url : siteverify
}

/** Fails closed: a missing secret, a network error or a malformed reply all count as failure. */
export async function verifyTurnstile(token: unknown, ip?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret || typeof token !== 'string' || !token || token.length > 2048) return false
  const body = new URLSearchParams({ secret, response: token })
  if (ip) body.set('remoteip', ip)
  try {
    const response = await fetch(verifyUrl(), {
      method: 'POST', body, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(5_000),
    })
    if (!response.ok) return false
    const parsed = reply.safeParse(await response.json())
    return parsed.success && parsed.data.success
  } catch {
    return false
  }
}
