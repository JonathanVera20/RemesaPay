import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RemesaPay - Instant Blockchain Remittances to Ecuador',
  description: 'Send money to Ecuador instantly with 0.5% fees using blockchain technology. Fast, secure, and affordable remittances.',
  keywords: ['remittance', 'Ecuador', 'blockchain', 'USDC', 'crypto', 'money transfer'],
  authors: [{ name: 'RemesaPay Team' }],
  creator: 'RemesaPay',
  publisher: 'RemesaPay',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://remesapay.com',
    siteName: 'RemesaPay',
    title: 'RemesaPay - Instant Blockchain Remittances to Ecuador',
    description: 'Send money to Ecuador instantly with 0.5% fees using blockchain technology.',
    images: [
      {
        url: 'https://remesapay.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RemesaPay - Blockchain Remittances to Ecuador',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RemesaPay - Instant Blockchain Remittances to Ecuador',
    description: 'Send money to Ecuador instantly with 0.5% fees using blockchain technology.',
    images: ['https://remesapay.com/twitter-image.jpg'],
    creator: '@RemesaPay',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
