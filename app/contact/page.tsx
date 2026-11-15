import type { Metadata } from 'next';
import PortfolioContact from '@/components/portfolio-contact';

export const metadata: Metadata = { title: 'Contact Luigi Girke', alternates: { canonical: '/contact' } };

export default function Contact() {
  return <PortfolioContact profileId="default" />;
}
