import { analyticsMaxBytes, analyticsMaxEvents, analyticsPath, analyticsReferrerHost, type BrowserAnalyticsEvent } from './contract'
import { ownerStorageKey, readAnalyticsSession, sessionIdleMs, storeAnalyticsSession, type Attribution } from './session'

type Kind = BrowserAnalyticsEvent['kind']
type Details = { [K in Kind]: Pick<Extract<BrowserAnalyticsEvent, { kind: K }>, 'kind' | 'props'> }[Kind]
const intake = '/api/e'
const interval = 10_000
const id = () => crypto.randomUUID()
const linkCode = /^[A-Za-z0-9][A-Za-z0-9-]{0,63}$/
const label = /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,99}$/
const target = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/
// Booking cancel links carry a secret token. Record the route, never the token.
const trackedPath = () => location.pathname.replace(/^\/book\/cancel\/[^/]+\/?$/, '/book/cancel')

export function startAnalytics() {
  const url = new URL(location.href)
  const owner = url.searchParams.get('owner')
  const via = url.searchParams.get('via')
  if (owner !== null || via !== null) {
    url.searchParams.delete('owner')
    url.searchParams.delete('via')
    history.replaceState(history.state, '', url)
  }
  if (owner) {
    void fetch(intake, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ owner }),
    }).then(response => {
      if (response.ok) localStorage.setItem(ownerStorageKey, '1')
    }).catch(() => {})
    return
  }
  let visitor: string | undefined
  try {
    if (localStorage.getItem(ownerStorageKey) === '1') return
  } catch {}
  if ((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl ||
      navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes') return
  try {
    visitor = localStorage.getItem('analytics:visitor') ?? id()
    localStorage.setItem('analytics:visitor', visitor)
  } catch {}

  let session = readAnalyticsSession()
  let landing: Attribution | undefined = {}
  if (via && linkCode.test(via)) landing.link_code = via
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign'] as const) {
    const value = url.searchParams.get(key)
    if (value && label.test(value)) landing[key] = value
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
    if (leaving && navigator.sendBeacon?.(intake, new Blob([body], { type: 'application/json' }))) return
    if (!leaving) sending = true
    void fetch(intake, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: leaving,
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
    const active = document.visibilityState === 'visible' && document.hasFocus()
    if (activeSince !== undefined && (commit || !active)) {
      activeMs += now - activeSince
      activeSince = undefined
    }
    if (active) activeSince ??= now
  }

  function engagement() {
    clock(true)
    const duration = Math.min(86_400_000, Math.round(activeMs))
    if (duration || maxScroll > sentScroll) {
      track({ kind: 'page:engagement', props: { activeMs: duration, maxScroll } })
    }
    activeMs = 0
    sentScroll = maxScroll
  }

  function view(isRestore = false) {
    const time = Date.now()
    const expired = !session || time - session.time >= sessionIdleMs
    if (!expired && !isRestore && page?.path === trackedPath()) return
    if (page) engagement()
    session = {
      id: expired ? id() : session!.id,
      time,
      attribution: { ...(expired ? {} : session!.attribution), ...landing },
    }
    landing = undefined
    storeAnalyticsSession(session)

    maxScroll = sentScroll = 0
    const path = trackedPath()
    page = analyticsPath.test(path) && path.length <= 240
      ? { path, session_id: session.id, page_view_id: id(), visitor_id: visitor, ...session.attribution }
      : undefined
    track({ kind: 'page:view', props: isRestore ? { isRestore } : {} }, referrer)
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
      storeAnalyticsSession(session)
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
  const { signal } = events
  document.addEventListener('click', click, { signal })
  document.addEventListener('visibilitychange', visibility, { signal })
  window.addEventListener('focus', focus, { signal })
  window.addEventListener('blur', focus, { signal })
  window.addEventListener('scroll', scroll, { passive: true, signal })
  window.addEventListener('pagehide', leave, { signal })
  window.addEventListener('pageshow', restore, { signal })

  view()
  const timer = setInterval(() => flush(false), interval)
  return { view, stop() { events.abort(); clearInterval(timer); cancelAnimationFrame(frame) } }
}
