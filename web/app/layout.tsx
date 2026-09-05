import type { Metadata, Viewport } from 'next';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { PALETTE } from '@/lib/lab-constants';
import './globals.css';

/**
 * Шрифты берутся через next/font: файлы скачиваются на сборке и раздаются
 * со своего домена. В рантайме запроса на сторону нет, и вёрстка не скачет
 * при загрузке.
 */
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-archivo',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mark Omelchenko — Frontend Developer',
  description:
    'Frontend developer working with React, Next.js and TypeScript. Selected work, projects and skills.',
};

export const viewport: Viewport = {
  themeColor: PALETTE.paper,
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
