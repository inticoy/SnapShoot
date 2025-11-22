import type { Metadata } from 'next';
import './globals.css';
import '../src/style.css';
import '../src/phosphor-icons.css';

export const metadata: Metadata = {
  title: 'SnapShoot',
  description: 'Next.js migration workspace for the SnapShoot game',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
