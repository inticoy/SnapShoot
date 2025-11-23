'use client';

import { useState } from 'react';
import { useGameEvent } from '@/hooks/useGameEvent';

export function TouchGuide() {
  const [visible, setVisible] = useState(false);

  useGameEvent('SHOW_TOUCH_GUIDE', (event) => {
    setVisible(event.show);
  });

  if (!visible) return null;

  return (
    <div className="touch-guide show">
      <div className="touch-guide__trail touch-guide__trail--1" />
      <div className="touch-guide__trail touch-guide__trail--2" />
      <div className="touch-guide__trail touch-guide__trail--3" />
      <div className="touch-guide__trail touch-guide__trail--4" />
      <div className="touch-guide__icon" />
    </div>
  );
}
