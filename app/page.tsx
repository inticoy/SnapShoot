'use client';

import { useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TouchGuide } from '@/components/hud/TouchGuide';
import { ShotInfoHud } from '@/components/hud/ShotInfoHud';
import { ScoreDisplay } from '@/components/hud/ScoreDisplay';
import { ModalTest } from '@/components/test/ModalTest';

function GameContent() {
  const searchParams = useSearchParams();
  const initializationRef = useRef(false);

  const friendScore = useMemo(() => {
    const scoreParam = searchParams?.get('score');
    if (!scoreParam) return undefined;
    const parsed = Number.parseInt(scoreParam, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [searchParams]);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const load = async () => {
      const { loadGame } = await import('../src/GameLoader');
      loadGame(friendScore ? { score: friendScore } : undefined);
    };

    void load();
  }, [friendScore]);

  return null;
}

export default function HomePage() {
  return (
    <div id="game-container">
      <div id="loading-screen" />
      <canvas id="game-canvas" />
      <div id="ui" className="pointer-events-none">
        <TouchGuide />
        <ShotInfoHud />
        <ScoreDisplay />
      </div>
      <ModalTest />
      <Suspense fallback={null}>
        <GameContent />
      </Suspense>
    </div>
  );
}
