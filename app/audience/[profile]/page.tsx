import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PortfolioHome from '@/components/portfolio-home';
import { isAudienceProfile, profileMetadata } from '@/lib/profiles';

type Props = { params: Promise<{ profile: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { profile } = await params;
  if (!isAudienceProfile(profile)) notFound();
  return { ...profileMetadata[profile], alternates: { canonical: '/' } };
}

export default async function AudienceHome({ params }: Props) {
  const { profile } = await params;
  if (!isAudienceProfile(profile)) notFound();
  return <PortfolioHome profileId={profile} />;
}
