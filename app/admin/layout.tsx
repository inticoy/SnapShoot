import type { ReactNode } from 'react';
import '../../src/admin/style.css';

export const metadata = {
  title: 'SnapShoot Admin',
  description: '난이도 프리뷰 관리자 도구'
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
