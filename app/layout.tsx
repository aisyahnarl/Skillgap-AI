import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SkillGap.AI',
  description: 'Platform assessment skill gap berbasis Next.js App Router',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
