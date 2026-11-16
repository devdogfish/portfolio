import { analyticsMaxBytes, analyticsMaxEvents, analyticsPath, analyticsReferrerHost, type BrowserAnalyticsEvent } from './contract'
import type { AnalyticsSession, Attribution } from './session'

type Kind = BrowserAnalyticsEvent['kind']
type Details = { [K in Kind]: Pick<Extract<BrowserAnalyticsEvent, { kind: K }>, 'kind' | 'props'> }[Kind]
const intake = '/api/e'
const interval = 10_000
const id = () => crypto.randomUUID()
const linkCode = /^[A-Za-z0-9]{1,24}$/
const jsonType = 'application/json'
const jsonHeaders = { 'Content-Type': jsonType }
const label = /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,99}$/
const target = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/
// Booking cancel links carry a secret token. Record the route, never the token.
const trackedPath = () => location.pathname.startsWith('/book/cancel/') ? '/book/cancel' : location.pathname
// Same keys and idle window as readAnalyticsLinkCode in session.ts.
const sessionKey = 'analytics:session'
const ownerKey = 'analytics:owner'
const sessionIdleMs = 30 * 60_000

function readSession(): AnalyticsSession | undefined {
  try {
    const session: AnalyticsSession | null = JSON.parse(sessionStorage.getItem(sessionKey) ?? 'null')
    if (session && Date.now() - session.time < sessionIdleMs) return session
  } catch {}
}

function storeSession(session: AnalyticsSession) {
  try { sessionStorage.setItem(sessionKey, JSON.stringify(session)) } catch {}
}

export function startAnalytics() {
  const url = new URL(location.href)
  const params = url.searchParams
  const owner = params.get('owner')
  const via = params.get('via')
  params.delete('owner')
  params.delete('via')
  if (url.href !== location.href) history.replaceState(history.state, '', url)
  if (owner) {
    void fetch(intake, {
      method: 'PUT', headers: jsonHeaders, body: JSON.stringify({ owner }),
    }).then(response => {
      if (response.ok) localStorage.setItem(ownerKey, '1')
    }).catch(() => {})
    return
  }
  if ((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl ||
      navigator.doNotTrack === '1') return

  let visitor: string | undefined
  try {
    if (localStorage.getItem(ownerKey) === '1') return
    visitor = localStorage.getItem('analytics:visitor') ?? id()
    localStorage.setItem('analytics:visitor', visitor)
  } catch {}

  let session = readSession()
  let landing: Attribution | undefined = {}
  if (via && linkCode.test(via)) landing.link_code = via
  for (const key of ['source', 'medium', 'campaign'] as const) {
    const value = params.get('utm_' + key)
    if (value && label.test(value)) landing[`utm_${key}`] = value
  }
  let referrer: string | undefined
  if (!session && document.referrer) {
    const source = new URL(document.referrer)
    if (source.origin !== location.origin && source.hostname.length <= 253 && analyticsReferrerHost.test(source.hostname)) {
      referrer = source.hostname
    }
  }

  const queue: string[] = []
  let sending = false
  let page: Omit<BrowserAnalyticsEvent, 'id' | 'occurred_at' | 'kind' | 'props'> | undefined
  let activeSince: number | undefined
  let activeMs = 0
  let maxScroll = 0
  let sentScroll = 0
  let frame = 0

  function track(details: Details, referrer_host?: string) {
    if (!page || queue.length >= 2 * analyticsMaxEvents) return
    queue.push(JSON.stringify({ ...page, id: id(), occurred_at: new Date().toISOString(), referrer_host, ...details }))
  }

  function flush(leaving: boolean) {
    if ((!leaving && sending) || !queue.length) return
    const batch: string[] = []
    let bytes = '{"events":[]}'.length
    for (const event of queue) {
      bytes += event.length + Number(batch.length > 0)
      if (bytes > analyticsMaxBytes || batch.length === analyticsMaxEvents) break
      batch.push(event)
    }
    if (!batch.length) return
    queue.splice(0, batch.length)
    const body = '{"events":[' + batch.join(',') + ']}'
    if (leaving && navigator.sendBeacon?.(intake, new Blob([body], { type: jsonType }))) return
    if (!leaving) sending = true
    void fetch(intake, {
      method: 'POST', headers: jsonHeaders, body, keepalive: leaving,
    }).then(response => {
      if (!response.ok) throw Error()
    }).catch(() => {
      if (!leaving) queue.unshift(...batch)
    }).finally(() => {
      if (!leaving) sending = false
    })
  }

  function clock(commit = false) {
    const now = performance.now()
    const active = !document.hidden && document.hasFocus()
    if (activeSince !== undefined && (commit || !active)) {
      activeMs += now - activeSince
      activeSince = undefined
    }
    if (active) activeSince ??= now
  }

  function engagement() {
    clock(true)
    const duration = Math.min(86_400_000, Math.round(activeMs))
    // pagehide and the hidden visibilitychange both end a view; skip the near-empty second one.
    if (duration >= 1000 || maxScroll > sentScroll) {
      track({ kind: 'page:engagement', props: { activeMs: duration, maxScroll } })
    }
    activeMs = 0
    sentScroll = maxScroll
  }

  function view(isRestore = false) {
    const time = Date.now()
    const expired = !session || time - session.time >= sessionIdleMs
    const path = trackedPath()
    if (!expired && !isRestore && page?.path === path) return
    if (page) engagement()
    session = {
      id: expired ? id() : session!.id,
      time,
      attribution: { ...(expired ? {} : session!.attribution), ...landing },
    }
    landing = undefined
    storeSession(session)

    maxScroll = sentScroll = 0
    page = analyticsPath.test(path) && path.length <= 240
      ? { path, session_id: session.id, page_view_id: id(), visitor_id: visitor, ...session.attribution }
      : undefined
    track({ kind: 'page:view', props: { isRestore } }, referrer)
    referrer = undefined
    clock()
  }

  function click(event: MouseEvent) {
    if (!(event.target instanceof Element)) return
    const marked = (event.target.closest('[data-track]') as HTMLElement | null)?.dataset
    const cta = marked?.track?.split(':')
    const link = event.target.closest('a[href]') as HTMLAnchorElement | null
    const outbound = link && link.origin !== location.origin &&
      (link.protocol === 'https:' || link.protocol === 'http:') && target.test(link.hostname) ? link.hostname : undefined
    if (cta?.[0] !== 'cta' && !outbound) return
    view()
    if (session) {
      session.time = Date.now()
      storeSession(session)
    }
    if (cta?.[0] === 'cta' && target.test(cta[1] ?? '')) {
      const value = marked?.trackTarget
      track({ kind: 'cta:click', props: { cta: cta[1], target: value && target.test(value) ? value : undefined } })
    }
    if (outbound) track({ kind: 'outbound:click', props: { target: outbound } })
  }

  function scroll() {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      const height = document.documentElement.scrollHeight - innerHeight
      if (height > 0) maxScroll = Math.max(maxScroll, Math.min(100, Math.round(100 * scrollY / height)))
    })
  }
  const focus = () => clock()
  const leave = () => { engagement(); flush(true) }
  const visibility = () => { document.hidden ? leave() : focus() }
  const restore = (event: PageTransitionEvent) => { if (event.persisted) view(true) }
  const events = new AbortController()
  const options = { passive: true, signal: events.signal }
  document.addEventListener('click', click, options)
  document.addEventListener('visibilitychange', visibility, options)
  window.addEventListener('focus', focus, options)
  window.addEventListener('blur', focus, options)
  window.addEventListener('scroll', scroll, options)
  window.addEventListener('pagehide', leave, options)
  window.addEventListener('pageshow', restore, options)

  view()
  const timer = setInterval(() => flush(false), interval)
  return { view, stop() { events.abort(); clearInterval(timer); cancelAnimationFrame(frame) } }
}
