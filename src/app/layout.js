import { Sora, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-hanken',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'NEON_LEDGER | Command Center',
  description:
    'Portal de finanzas personales de grado institucional. Gestiona ingresos, gastos, presupuestos y metas.',
};

export const viewport = {
  themeColor: '#05070a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`dark ${sora.variable} ${hanken.variable} ${mono.variable}`}>
      <head>
        {/* Iconos Material Symbols (fuente de ligaduras, cargada como stylesheet) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body-md text-body-md bg-surface-dim text-on-surface antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
