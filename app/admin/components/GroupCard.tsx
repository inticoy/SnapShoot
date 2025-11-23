'use client';

import type { DifficultyLevelConfig } from '../../../src/config/Difficulty';

interface GroupCardProps {
  prefix: string;
  levels: DifficultyLevelConfig[];
  onClick: () => void;
}

export function GroupCard({ prefix, levels, onClick }: GroupCardProps) {
  return (
    <div
      onClick={onClick}
      className="group bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700
                 rounded-2xl p-6 cursor-pointer transition-all duration-300
                 hover:border-blue-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/20"
    >
      <h2 className="text-2xl font-bold text-white mb-2">
        Level {prefix}
      </h2>

      <p className="text-blue-400 text-sm mb-3">
        {levels.length} variant{levels.length > 1 ? 's' : ''}
      </p>

      <p className="text-slate-400 text-xs">
        Threshold: {levels[0].threshold}
      </p>
    </div>
  );
}
