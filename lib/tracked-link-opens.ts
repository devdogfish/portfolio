import { after } from 'next/server';
import type { AnalyticsEvent } from './analytics/contract';
import { analyticsVisitor, sendAnalyticsBatch } from './analytics/server';

export function recordLinkOpen(request: Request, code: string, path: string, occurredAt: Date, key?: string) {
  const { method, headers } = request;
  if (method !== 'GET' && method !== 'HEAD') return;
  const { excluded, ipId, device } = analyticsVisitor(headers, occurredAt);
  if (excluded) return;
  const event: AnalyticsEvent = {
    id: crypto.randomUUID(),
    kind: 'link:open',
    occurred_at: occurredAt.toISOString(),
    path,
    link_code: code,
    ip_id: ipId,
    device,
    props: { method, key, ua: headers.get('user-agent')?.slice(0, 512) },
  };
  after(async () => {
    try {
      await sendAnalyticsBatch([event]);
    } catch {
      console.warn('Tracked-link ingest unavailable');
    }
  });
}
