'use client';

import { useEffect, useState } from 'react';

export function useHashRouter() {
  const [route, setRoute] = useState<string>('');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove '#'
      const cleanRoute = hash.startsWith('/') ? hash.slice(1) : hash;
      setRoute(cleanRoute || '');
    };

    // Initial route
    handleHashChange();

    // Listen to hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigate = (path: string) => {
    window.location.hash = `/${path}`;
  };

  return { route, navigate };
}
