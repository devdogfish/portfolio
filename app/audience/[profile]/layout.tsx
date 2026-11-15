import type { Metadata } from 'next';
import { audienceProfiles } from '@/lib/profiles';

export function generateStaticParams() {
  return audienceProfiles.map(profile => ({ profile }));
}

export const metadata: Metadata = { robots: { index: false } };

export default function AudienceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
