'use client';

import { useEffect, useRef } from 'react';

export default function AdminPage() {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const mount = async () => {
      await import('../../src/admin/main');
    };

    void mount();
  }, []);

  return <div id="admin-app" />;
}
