import type { Metadata } from 'next';
import './globals.css';
import { getAssetPath } from '@/../src/utils/assetPath';

const iconPath = getAssetPath('/icon.svg');

export const metadata: Metadata = {
  title: 'SnapShoot',
  description: 'Swipe up to SnapShoot!',
  icons: {
    icon: iconPath,
    apple: iconPath,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
