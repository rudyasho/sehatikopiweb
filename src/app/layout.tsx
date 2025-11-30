import { Poppins, Roboto, Inter } from 'next/font/google';

import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/layout/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getSettings } from '@/lib/settings-data';
import type { Metadata } from 'next';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-code',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
      metadataBase: new URL('https://sehatikopi.id'),
      title: {
          template: `%s | ${settings.siteName}`,
          default: `${settings.siteName} - Jual Kopi Arabika & Robusta Indonesia`,
      },
      description: `Jelajahi & beli biji kopi arabika dan robusta single-origin terbaik dari seluruh Indonesia. ${settings.siteName} adalah roastery & kedai kopi Anda untuk rasa otentik yang dipanggang dengan penuh semangat.`,
  };
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html lang="id" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-body antialiased', poppins.variable, inter.variable, roboto.variable)}>
        <Providers
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
          <div className="relative flex min-h-dvh flex-col">
            <Header siteName={settings.siteName} />
            <main className="flex-1">
              {children}
            </main>
            <Footer siteName={settings.siteName} />
          </div>
        </Providers>
      </body>
    </html>
  );
}
