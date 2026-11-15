import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import "./globals.css";
import { AnalyticsTracker } from '@/components/analytics-tracker';

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const ensureStatic = 'navigation';

export const metadata: Metadata = {
  metadataBase: new URL('https://girke.dev'),
  title: 'Luigi Girke — Software, websites & practical tools',
  description: 'Software developer in Halifax. Custom websites, business applications, and practical AI enablement.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
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
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
        </NextThemesProvider>
      </body>
    </html>
  );
}
