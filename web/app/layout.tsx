import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mark Omelchenko — Frontend Developer',
  description:
    'Frontend developer working with React, Next.js and TypeScript. Selected work, projects and skills.',
};

export const viewport: Viewport = {
  themeColor: '#0c0c0c',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="static-grain">{children}</body>
    </html>
  );
}
