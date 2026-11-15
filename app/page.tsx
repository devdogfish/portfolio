import type { Metadata } from 'next';
import PortfolioHome from '@/components/portfolio-home';
import { profileMetadata } from '@/lib/profiles';

export const metadata: Metadata = { ...profileMetadata.default, alternates: { canonical: '/' } };

export default function Home() {
  return <PortfolioHome profileId="default" />;
}
