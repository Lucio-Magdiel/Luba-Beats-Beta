import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PersistentPlayer } from '@/components/audio/PersistentPlayer';
import { LicenseModal } from '@/components/modals/LicenseModal';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CheckoutSimModal } from '@/components/modals/CheckoutSimModal';

export const metadata: Metadata = {
  title: 'Luba Beats | Marketplace de Beats, Instrumentales y Audio',
  description:
    'La plataforma definitiva para comprar y vender instrumentales en Perú y Latinoamérica. Filtros armónicos por BPM y Tonalidad, streaming continuo y pagos con Yape y Plin.',
  keywords: [
    'beats',
    'instrumentales',
    'comprar beats',
    'trap beats',
    'reggaeton beats',
    'drill beats',
    'yape',
    'plin',
    'peru',
    'beatmakers'
  ]
};

import { AuthProvider } from '@/components/providers/AuthProvider';

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#09090b] text-[#f4f4f5] antialiased selection:bg-purple-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-80px)] pb-24 sm:pb-20">{children}</main>
          <Footer />

          {/* Global Floating Components */}
          <PersistentPlayer />
          <LicenseModal />
          <CartDrawer />
          <CheckoutSimModal />
        </AuthProvider>
      </body>
    </html>
  );
}
