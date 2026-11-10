"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { jobs } from "@/lib/data"
import {
  analyticsBatchLimit,
  analyticsEventSchema,
  analyticsToken,
  scrollThresholds,
  type AnalyticsEvent,
} from "@/lib/analytics-contract"

type Props = { cohort: string; source: string; entryCode?: string }
type EventDetails = {
  [Type in AnalyticsEvent["type"]]: Pick<Extract<AnalyticsEvent, { type: Type }>, "type" | "properties">
}[AnalyticsEvent["type"]]

const checkpointMs = 15_000
const activeWindowMs = 30_000
const sessionIdleMs = 30 * 60_000
const visitorLifetimeMs = 90 * 24 * 60 * 60_000
const queueLimit = 120
const eventEndpoint = "/api/events"

let visitor: { id: string; expiresAt: number } | undefined
let session: { id: string; lastActivity: number; seq: number } | undefined
let lastView: { key: string; id: string; sessionId: string } | undefined
let queue: AnalyticsEvent[] = []
const beaconQueued = new Set<string>()
let sending = false
let retryAt = 0
let failures = 0

function optedOut() {
  return navigator.doNotTrack === "1" ||
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
}

function readStorage(storage: "localStorage" | "sessionStorage", key: string) {
  try {
    return JSON.parse(window[storage].getItem(key) ?? "null")
  } catch {
    return null
  }
}

function writeStorage(storage: "localStorage" | "sessionStorage", key: string, value: unknown) {
  try {
    window[storage].setItem(key, JSON.stringify(value))
  } catch {
    // In-memory identity still works for this document.
  }
}

function getVisitor(now: number) {
  visitor ??= readStorage("localStorage", "portfolio-visitor-v1")
  if (!visitor || typeof visitor.id !== "string" || !(visitor.expiresAt > now)) {
    visitor = { id: crypto.randomUUID(), expiresAt: now + visitorLifetimeMs }
    writeStorage("localStorage", "portfolio-visitor-v1", visitor)
  }
  return visitor.id
}

function getSession(now: number) {
  session ??= readStorage("sessionStorage", "portfolio-session-v1")
  if (!session || typeof session.id !== "string" || !Number.isSafeInteger(session.seq) ||
      !(now - session.lastActivity < sessionIdleMs)) {
    session = { id: crypto.randomUUID(), lastActivity: now, seq: 0 }
  }
  return session
}

function referrerHost() {
  try {
    const { hostname } = new URL(document.referrer)
    return hostname !== location.hostname && /^[a-z0-9.-]{1,253}$/.test(hostname)
      ? hostname
      : undefined
  } catch {
    return undefined
  }
}

function deviceClass() {
  if (matchMedia("(pointer: coarse)").matches) {
    return matchMedia("(max-width: 767px)").matches ? "mobile" : "tablet"
  }
  return "desktop"
}

async function flush(terminal = false) {
  if (optedOut()) {
    queue = []
    beaconQueued.clear()
    return
  }
  if (!queue.length || (!terminal && (sending || Date.now() < retryAt))) return
  const pending = terminal ? queue.filter(({ eventId }) => !beaconQueued.has(eventId)) : queue
  const events = pending.slice(0, analyticsBatchLimit)
  if (!events.length) return
  const body = JSON.stringify({ events })

  // A queued beacon has no delivery receipt. Keep the IDs for an acknowledged
  // retry if this document returns to the foreground.
  if (terminal && navigator.sendBeacon?.(eventEndpoint, new Blob([body], { type: "application/json" }))) {
    for (const { eventId } of events) beaconQueued.add(eventId)
    if (pending.length > events.length) void flush(true)
    return
  }
  if (!terminal) sending = true
  try {
    const response = await fetch(eventEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: terminal,
    })
    if (!response.ok && (response.status >= 500 || [408, 425, 429].includes(response.status))) {
      throw new Error("Analytics delivery failed")
    }
    const delivered = new Set(events.map(({ eventId }) => eventId))
    queue = queue.filter(({ eventId }) => !delivered.has(eventId))
    for (const eventId of delivered) beaconQueued.delete(eventId)
    failures = 0
    retryAt = 0
  } catch {
    failures += 1
    retryAt = Date.now() + Math.min(120_000, 5_000 * 2 ** (failures - 1))
  } finally {
    if (!terminal) sending = false
  }
}

export default function PortfolioAnalytics({ cohort, source, entryCode }: Props) {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || !globalThis.crypto?.randomUUID || optedOut()) return
    const publicPath = window.location.pathname
    const path = /^\/r\/[^/]+\/?$/.test(publicPath) ? "/" : publicPath.replace(/\/$/, "") || "/"
    const key = `${path}:${cohort}:${source}:${entryCode ?? ""}`
    const sourceToken = analyticsToken.safeParse(source)
    const codeToken = analyticsToken.safeParse(entryCode)
    if (!sourceToken.success) return
    const pageSource = sourceToken.data
    const code = codeToken.success ? codeToken.data : undefined
    const thresholds = new Set<number>()
    let visibleMs = 0
    let activeMs = 0
    let reportedVisibleMs = 0
    let visible = document.visibilityState === "visible"
    let lastTick = performance.now()
    let activeUntil = lastTick
    let viewId: string | undefined

    function record(details: EventDetails, now = Date.now()) {
      if (optedOut() || !viewId || !session) return
      const event = analyticsEventSchema.safeParse({
        eventId: crypto.randomUUID(),
        visitorId: getVisitor(now),
        sessionId: session.id,
        pageViewId: viewId,
        seq: ++session.seq,
        occurredAt: new Date(now).toISOString(),
        cohort,
        applicationCode: code && /^[a-f0-9]{24}$/.test(code) ? code : undefined,
        path,
        ...details,
      })
      if (!event.success) return
      writeStorage("sessionStorage", "portfolio-session-v1", session)
      if (queue.length >= queueLimit) {
        const dropped = queue.shift()
        if (dropped) beaconQueued.delete(dropped.eventId)
      }
      queue.push(event.data)
      if (queue.length >= analyticsBatchLimit) void flush()
    }

    function ensureView(now: number) {
      const current = getSession(now)
      if (lastView?.key === key && lastView.sessionId === current.id) {
        viewId = lastView.id
        return
      }
      viewId = crypto.randomUUID()
      lastView = { key, id: viewId, sessionId: current.id }
      thresholds.clear()
      visibleMs = activeMs = reportedVisibleMs = 0
      lastTick = performance.now()
      current.lastActivity = now
      record({
        type: "page_view",
        properties: { source: pageSource, entryCode: code, referrer: referrerHost(), device: deviceClass() },
      }, now)
    }

    // Clamp suspended timers. Active time accrues only during recent interaction
    // and foreground visibility. Checkpoints are cumulative per page-view ID.
    function tick() {
      const now = performance.now()
      const start = Math.max(lastTick, now - checkpointMs * 2)
      if (visible) {
        visibleMs += now - start
        activeMs += Math.max(0, Math.min(now, activeUntil) - start)
      }
      lastTick = now
    }

    function checkpoint() {
      tick()
      const rounded = Math.min(86_400_000, Math.round(visibleMs))
      if (rounded === reportedVisibleMs || !viewId) return
      reportedVisibleMs = rounded
      record({
        type: "engagement",
        properties: { visibleMs: rounded, activeMs: Math.min(rounded, Math.round(activeMs)) },
      })
    }

    function noteActivity() {
      if (!visible || optedOut()) return
      const now = Date.now()
      ensureView(now)
      tick()
      activeUntil = lastTick + activeWindowMs
      if (session && now - session.lastActivity >= 1000) {
        session.lastActivity = now
        writeStorage("sessionStorage", "portfolio-session-v1", session)
      }
    }

    function onScroll() {
      noteActivity()
      if (!visible) return
      const root = document.scrollingElement
      if (!root || root.scrollHeight <= root.clientHeight) return
      const depth = 100 * root.scrollTop / (root.scrollHeight - root.clientHeight)
      for (const threshold of scrollThresholds) {
        if (depth >= threshold && !thresholds.has(threshold)) {
          thresholds.add(threshold)
          record({ type: "scroll", properties: { threshold } })
        }
      }
    }

    function onClick(event: MouseEvent) {
      if (!event.isTrusted || (event.type === "auxclick" && event.button !== 1)) return
      noteActivity()
      const element = event.target instanceof Element ? event.target.closest("[data-track], a[href]") : null
      if (!(element instanceof HTMLElement)) return
      const href = element.getAttribute("href") ?? ""
      const navigation: Record<string, string> = {
        '/': 'home', '/privacy': 'privacy', '#services': 'services', '#projects': 'projects',
        '#about': 'about', '#jobs': 'experience', '#connect': 'connect',
        'https://www.linkedin.com/in/luigigirke/': 'linkedin-profile',
        ...Object.fromEntries(jobs.map(job => [`/job/${job.slug}`, job.slug])),
      }
      const fallback = Object.hasOwn(navigation, href) ? navigation[href] : undefined
      const action = analyticsToken.safeParse(element.dataset.track ?? (fallback ? 'navigation' : undefined))
      const target = analyticsToken.safeParse(element.dataset.trackTarget ?? fallback)
      if (!action.success) return
      record({ type: "cta_click", properties: { action: action.data, target: target.success ? target.data : undefined } })
      void flush(true)
    }

    function onVisibility() {
      checkpoint()
      visible = document.visibilityState === "visible"
      activeUntil = lastTick
      if (visible) {
        ensureView(Date.now())
        void flush()
      } else {
        void flush(true)
      }
    }

    function onPageHide() {
      checkpoint()
      void flush(true)
    }

    ensureView(Date.now())
    const timer = window.setInterval(() => {
      checkpoint()
      void flush()
    }, checkpointMs)
    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("pagehide", onPageHide)
    window.addEventListener("online", onVisibility)
    window.addEventListener("scroll", onScroll, { passive: true })
    document.addEventListener("pointerdown", noteActivity, { passive: true })
    document.addEventListener("keydown", noteActivity)
    document.addEventListener("click", onClick)
    document.addEventListener("auxclick", onClick)

    return () => {
      checkpoint()
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pagehide", onPageHide)
      window.removeEventListener("online", onVisibility)
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("pointerdown", noteActivity)
      document.removeEventListener("keydown", noteActivity)
      document.removeEventListener("click", onClick)
      document.removeEventListener("auxclick", onClick)
    }
  }, [pathname, cohort, source, entryCode])

  return null
}
