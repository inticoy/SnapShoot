'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LevelPreviewEngine } from '../lib/PreviewEngine';
import type { DifficultyLevelConfig } from '../../../src/config/Difficulty';
import type { ObstacleInstanceConfig } from '../../../src/config/Obstacles';

interface LevelPreviewProps {
  level: DifficultyLevelConfig;
  obstacleConfigs?: ObstacleInstanceConfig[];
}

export function LevelPreview({ level, obstacleConfigs }: LevelPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<LevelPreviewEngine | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create preview engine
    engineRef.current = new LevelPreviewEngine(containerRef.current, level, obstacleConfigs);

    // Animation loop
    const clock = new THREE.Clock();
    function tick() {
      const delta = clock.getDelta();
      engineRef.current?.update(delta);
      animationRef.current = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      engineRef.current?.dispose();
    };
  }, [level, obstacleConfigs]);

  return <div ref={containerRef} className="w-full" />;
}
