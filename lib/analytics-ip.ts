import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

function normalizeIp(value: string): string | undefined {
  const ip = value.trim();
  if (isIP(ip) === 4) return ip;
  if (isIP(ip) !== 6 || ip.includes('%')) return;
  const canonical = new URL(`http://[${ip}]`).hostname.slice(1, -1);
  const mapped = canonical.match(/^::ffff:([0-9a-f]+):([0-9a-f]+)$/);
  if (!mapped) return canonical;
  const high = parseInt(mapped[1], 16);
  const low = parseInt(mapped[2], 16);
  return [high >> 8, high & 255, low >> 8, low & 255].join('.');
}

export function analyticsIp(headers: Headers): { excluded: boolean; ipId?: string } {
  if (process.env.VERCEL !== '1') return { excluded: false };
  const ip = normalizeIp(headers.get('x-vercel-forwarded-for') ?? '');
  if (!ip) return { excluded: true };

  const excluded = (process.env.ANALYTICS_EXCLUDED_IPS ?? '')
    .split(',')
    .some(value => normalizeIp(value) === ip);
  if (excluded) return { excluded: true };

  const key = process.env.ANALYTICS_IP_KEY;
  if (!key) return { excluded: false };
  const ipId = createHmac('sha256', key).update(ip).digest('hex').slice(0, 32);
  return { excluded: false, ipId };
}
