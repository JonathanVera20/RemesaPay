import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from '@/components/Web3Provider';

export const metadata: Metadata = {
  title: 'RemesaPay - Remesas Instantáneas con Blockchain a Ecuador',
  description: 'Envía dinero a Ecuador instantáneamente con comisiones del 0.5% usando tecnología blockchain. Transferencias rápidas, seguras y accesibles.',
  keywords: ['remesas', 'Ecuador', 'blockchain', 'USDC', 'cripto', 'transferencia de dinero'],
  authors: [{ name: 'Equipo RemesaPay' }],
  creator: 'RemesaPay',
  publisher: 'RemesaPay',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://remesapay.com',
    siteName: 'RemesaPay',
    title: 'RemesaPay - Remesas Instantáneas con Blockchain a Ecuador',
    description: 'Envía dinero a Ecuador instantáneamente con comisiones del 0.5% usando tecnología blockchain.',
    images: [
      {
        url: 'https://remesapay.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RemesaPay - Remesas con Blockchain a Ecuador',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RemesaPay - Remesas Instantáneas con Blockchain a Ecuador',
    description: 'Envía dinero a Ecuador instantáneamente con comisiones del 0.5% usando tecnología blockchain.',
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
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans">
        <Web3Provider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                fontSize: '14px',
                fontWeight: '500',
                padding: '16px',
                maxWidth: '400px',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                },
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  );
}
