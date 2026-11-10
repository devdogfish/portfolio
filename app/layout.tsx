import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import "./globals.css";
import PortfolioAnalytics from '@/components/portfolio-analytics';
import { selectedProfile } from '@/lib/selected-profile';

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://girke.dev'),
  title: 'Luigi Girke — Software, websites & practical tools',
  description: 'Software developer in Halifax. Custom websites, business applications, and practical AI enablement.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const selection = await selectedProfile();
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <NextThemesProvider
          attribute="class"
          // defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <PortfolioAnalytics cohort={selection.profileId} source={selection.source} entryCode={selection.code} />
        </NextThemesProvider>
      </body>
    </html>
  );
}
