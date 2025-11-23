import type { DifficultyLevelConfig } from '../../../src/config/Difficulty';
import type { ObstacleInstanceConfig } from '../../../src/config/Obstacles';

/**
 * Extract level prefix from name (e.g., "1-0-left-woodVertical" → "1-0")
 */
export function getLevelPrefix(name: string): string {
  const match = name.match(/^(\d+(?:-\d+)?)/);
  return match ? match[1] : '0';
}

/**
 * Group levels by their prefix
 */
export function groupLevelsByPrefix(levels: DifficultyLevelConfig[]): Map<string, DifficultyLevelConfig[]> {
  const groups = new Map<string, DifficultyLevelConfig[]>();

  levels.forEach(level => {
    const prefix = getLevelPrefix(level.name);
    if (!groups.has(prefix)) {
      groups.set(prefix, []);
    }
    groups.get(prefix)!.push(level);
  });

  return groups;
}

/**
 * Sort group entries by prefix
 */
export function sortGroupEntries(entries: [string, DifficultyLevelConfig[]][]): [string, DifficultyLevelConfig[]][] {
  return entries.sort((a, b) => {
    const parsePrefix = (p: string) => p.split('-').map(n => parseInt(n, 10));
    const aNum = parsePrefix(a[0]);
    const bNum = parsePrefix(b[0]);

    for (let i = 0; i < Math.max(aNum.length, bNum.length); i++) {
      const aPart = aNum[i] || 0;
      const bPart = bNum[i] || 0;
      if (aPart !== bPart) return aPart - bPart;
    }
    return 0;
  });
}

/**
 * Create obstacle summary text
 */
export function createObstacleSummary(instance: ObstacleInstanceConfig): string {
  const parts = [instance.blueprintId];
  if (instance.behavior) {
    parts.push(`• ${instance.behavior.type}`);
  } else {
    parts.push('• static');
  }
  return parts.join(' ');
}
