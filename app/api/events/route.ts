import { NextRequest, NextResponse } from 'next/server';
import { analyticsBatchSchema } from '@/lib/analytics-contract';
import { analyticsIp } from '@/lib/analytics-ip';
import { entryLinks, profileIds } from '@/lib/profiles';
import { jobs, projects } from '@/lib/data';
import { resolveApplication } from '@/lib/application-links';

export const runtime = 'nodejs';
export const maxDuration = 15;
const maxBytes = 32_768;
const paths = new Set(['/', '/contact', '/privacy', ...jobs.map(job => `/job/${job.slug}`), ...projects.map(project => `/project/${project.slug}`)]);
const actions = new Set(['navigation', 'resume_download', 'project_open', 'demo_open', 'repository_open', 'contact_open', 'email_click', 'booking_click']);
const targets = new Set([...profileIds, ...projects.map(project => project.slug), ...jobs.map(job => job.slug), 'home', 'privacy', 'services', 'projects', 'about', 'experience', 'connect', 'linkedin-profile', 'contact', 'discovery', 'github-profile', 'careers-email', 'contact-email']);

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return new NextResponse(null, { status: 403 });
  if (!request.headers.get('content-type')?.includes('application/json')) return new NextResponse(null, { status: 415 });
  if (request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1') return new NextResponse(null, { status: 204 });
  if (/bot|crawler|spider|preview|headless/i.test(request.headers.get('user-agent') ?? '')) return new NextResponse(null, { status: 204 });
  const { excluded, ipId } = analyticsIp(request.headers);
  if (excluded) return new NextResponse(null, { status: 204 });
  if (Number(request.headers.get('content-length') ?? 0) > maxBytes) return new NextResponse(null, { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) return new NextResponse(null, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maxBytes) { await reader.cancel(); return new NextResponse(null, { status: 413 }); }
    chunks.push(value);
  }
  let json: unknown;
  try { json = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { return new NextResponse(null, { status: 400 }); }
  const parsed = analyticsBatchSchema.safeParse(json);
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const now = Date.now();
  const events = parsed.data.events;
  const codes = [...new Set(events.flatMap(event => [event.applicationCode,
    event.type === 'page_view' ? event.properties.entryCode : undefined]).filter((code): code is string => !!code && /^[a-f0-9]{24}$/.test(code)))];
  let applications: Map<string, Awaited<ReturnType<typeof resolveApplication>>>;
  try { applications = new Map(await Promise.all(codes.map(async code => [code, await resolveApplication(code)] as const))); }
  catch { return new NextResponse(null, { status: 503 }); }
  if (events.some(event => {
    if (event.applicationCode && applications.get(event.applicationCode)?.profileId !== event.cohort) return true;
    if (Math.abs(now - Date.parse(event.occurredAt)) > 24 * 60 * 60_000 || !paths.has(event.path) || !profileIds.some(id => id === event.cohort)) return true;
    if (event.type === 'cta_click') return !actions.has(event.properties.action) || (event.properties.target !== undefined && !targets.has(event.properties.target));
    if (event.type === 'engagement') return event.properties.activeMs > event.properties.visibleMs;
    if (event.type === 'page_view') {
      const code = event.properties.entryCode;
      const mapping = code && Object.hasOwn(entryLinks, code) ? entryLinks[code] : code ? applications.get(code) : undefined;
      if (code && applications.has(code) && event.applicationCode !== code) return true;
      return code ? !mapping || mapping.profileId !== event.cohort || mapping.source !== event.properties.source : event.cohort !== 'default' || event.properties.source !== 'direct';
    }
    return false;
  })) return new NextResponse(null, { status: 400 });
  // Validate known public cohorts, but preserve each event's original selection:
  // another tab can change the cookie while an older batch is in flight.
  const endpoint = process.env.QUANTSELF_ANALYTICS_URL;
  const token = process.env.QUANTSELF_ANALYTICS_TOKEN;
  if (!endpoint || !token) return NextResponse.json({ error: 'Analytics unavailable' }, { status: 503, headers: { 'Retry-After': '60' } });
  try {
    const upstream = await fetch(endpoint, { method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(10_000), headers: { 'Content-Type': 'application/json', 'X-API-Key': token }, body: JSON.stringify({ siteId: 'girke.dev', events: events.map(event => ({ ...event, ipId })) }) });
    if (!upstream.ok) return new NextResponse(null, { status: upstream.status === 429 ? 429 : 502 });
    return NextResponse.json({ accepted: events.length }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return new NextResponse(null, { status: 502 }); }
}
