import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from '@/components/ui/toaster';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { PerformanceOptimizer } from '@/components/PerformanceOptimizer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRM Next.js - Système CRM de Qualité Production',
  description: 'Un système CRM moderne et de qualité production construit avec Next.js, React et MongoDB.',
  keywords: 'CRM, Next.js, React, MongoDB, Tableau de bord, Gestion de Contenu',
  authors: [{ name: 'Votre Entreprise' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full w-full">
      <head>
        {/* Preconnect to image CDNs for faster loading */}
        <link rel="preconnect" href="https://autopublisher-crm.s3.eu-north-1.amazonaws.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://autopublisher-crm.s3.eu-north-1.amazonaws.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        {/* Early hints for critical resources */}
        <link rel="preload" href="/favicon.ico" as="image" type="image/x-icon" />
      </head>
      <body className={`${inter.className} h-full w-full m-0 p-0`}>
        <AuthProvider>
          <PerformanceOptimizer />
          <div className="h-full w-full">
            {children}
          </div>
          <Toaster />
          <GoogleAnalytics />
        </AuthProvider>
      </body>
    </html>
  );
} 
