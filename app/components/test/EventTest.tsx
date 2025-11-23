'use client';

import { useState } from 'react';
import { useGameEvent } from '@/hooks/useGameEvent';
import { gameEventBus } from '@/lib/gameEventBus';

export function EventTest() {
  const [score, setScore] = useState(0);

  useGameEvent('SCORE_CHANGED', (event) => {
    setScore(event.score);
  });

  return (
    <div className="fixed top-10 left-10 bg-black/50 p-4 text-white z-50">
      <h3 className="font-bold mb-2">Event Test</h3>
      <p className="mb-2">Score: {score}</p>
      <button
        onClick={() => gameEventBus.emit({ type: 'SCORE_CHANGED', score: score + 1 })}
        className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
      >
        Increment
      </button>
    </div>
  );
}
