import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PortfolioContact from '@/components/portfolio-contact';
import { isAudienceProfile } from '@/lib/profiles';

export const metadata: Metadata = { title: 'Contact Luigi Girke', alternates: { canonical: '/contact' } };

export default async function AudienceContact({ params }: { params: Promise<{ profile: string }> }) {
  const { profile } = await params;
  if (!isAudienceProfile(profile)) notFound();
  return <PortfolioContact profileId={profile} />;
}
