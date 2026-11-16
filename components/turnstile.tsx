'use client'

import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}
declare global {
  interface Window { turnstile?: TurnstileApi }
}

export type TurnstileHandle = { reset: () => void }
const script = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let loading: Promise<TurnstileApi> | undefined

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const tag = document.createElement('script')
    tag.src = script
    tag.async = true
    tag.onload = () => window.turnstile ? resolve(window.turnstile) : reject(Error('Turnstile missing'))
    tag.onerror = () => {
      loading = undefined
      reject(Error('Turnstile failed to load'))
    }
    document.head.append(tag)
  })
  return loading
}

// Each token is single-use. Callers reset after a server action spends one.
export function Turnstile({ siteKey, action, onToken, onError, ref }: {
  siteKey: string
  action: string
  onToken: (token: string | null) => void
  onError?: () => void
  ref?: Ref<TurnstileHandle>
}) {
  const box = useRef<HTMLDivElement>(null)
  const widget = useRef<string | undefined>(undefined)
  const handlers = useRef({ onToken, onError })
  useEffect(() => { handlers.current = { onToken, onError } })

  useImperativeHandle(ref, () => ({
    reset() {
      handlers.current.onToken(null)
      if (widget.current) window.turnstile?.reset(widget.current)
    },
  }), [])

  useEffect(() => {
    let cancelled = false
    loadTurnstile().then(api => {
      if (cancelled || !box.current) return
      widget.current = api.render(box.current, {
        sitekey: siteKey,
        action,
        appearance: 'interaction-only',
        callback: (token: string) => handlers.current.onToken(token),
        'expired-callback': () => handlers.current.onToken(null),
        'error-callback': () => {
          handlers.current.onToken(null)
          handlers.current.onError?.()
        },
      })
    }).catch(() => handlers.current.onError?.())
    return () => {
      cancelled = true
      if (widget.current) window.turnstile?.remove(widget.current)
      widget.current = undefined
    }
  }, [siteKey, action])

  return <div ref={box} className="turnstile" />
}
