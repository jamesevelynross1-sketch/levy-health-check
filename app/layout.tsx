import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Apprenticeship Levy Health Check',
  description: 'A consultancy-style apprenticeship levy utilisation health check platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
