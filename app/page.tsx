import type { Metadata } from 'next';
import PortfolioHome from '@/components/portfolio-home';
import EntryCleanup from '@/components/entry-cleanup';
import { selectedProfile } from '@/lib/selected-profile';
import { profileMetadata } from '@/lib/profiles';

export async function generateMetadata(): Promise<Metadata> {
  const { profileId } = await selectedProfile();
  return { ...profileMetadata[profileId], alternates: { canonical: '/' } };
}
export default async function Home() {
  const { profileId } = await selectedProfile();
  return <><PortfolioHome profileId={profileId} /><EntryCleanup /></>;
}
