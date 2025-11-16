import type { ObstacleInstanceConfig } from './Obstacles';

export interface CompositionConfig {
  /** 선택할 장애물 개수 */
  count: number;
  /** 선택할 그룹 (예: ['1-0', '1-1']) */
  from: string[];
  /** 중복 방지 여부 (기본값: true) */
  unique?: boolean;
}

export interface DifficultyLevelConfig {
  /** 이 난이도가 적용되는 최소 점수 */
  threshold: number;
  name: string;
  obstacles?: ObstacleInstanceConfig[];
  composition?: CompositionConfig;
}

/**
 * 난이도 레벨 정의 (점수 오름차순)
 * 점수가 주어진 threshold 이상일 때 해당 레벨이 적용됨.
 */
export const DIFFICULTY_LEVELS: DifficultyLevelConfig[] = [
  {
    threshold: 0,
    name: '0-0-no-obstacles',
    obstacles: []
  },
  /* Level 1-0 fixed */
  {
    threshold: 1,
    name: '1-0-left-woodVertical',
    obstacles: [
      {
        blueprintId: 'woodVertical',
        transform: { 
          position: { x: -1.1, z: -5.4 }, 
        },
        behavior: { type: 'static' }
      }
    ]
  },
  {
    threshold: 1,
    name: '1-0-right-woodVertical',
    obstacles: [
      {
        blueprintId: 'woodVertical',
        transform: { 
          position: { x: 1.1, z: -5.4 }, 
        },
        behavior: { type: 'static' }
      }
    ]
  },
  {
    threshold: 1,
    name: '1-0-top-woodHorizontal',
    obstacles: [
      {
        blueprintId: 'woodHorizontal',
        transform: { position: { y: 1.7, z: -5.4 } },
        behavior: { type: 'static' }
      }
    ]
  },
  {
    threshold: 1,
    name: '1-0-bottom-woodHorizontal',
    obstacles: [
      {
        blueprintId: 'woodHorizontal',
        transform: { position: { y: 0.2, z: -5.4 } },
        behavior: { type: 'static' }
      }
    ]
  },
  {
    threshold: 1,
    name: '1-0-left-drum',
    obstacles: [
      {
        blueprintId: 'drum',
        transform: { position: {x: -0.8, y: 0.5, z: -5.0 }},
        behavior: {
		  type: 'static',
		}
      },
    ]
  },
  {
    threshold: 1,
    name: '1-0-right-drum',
    obstacles: [
      {
        blueprintId: 'drum',
        transform: { position: {x: 0.8, y: 0.5, z: -5.0 }},
        behavior: {
		  type: 'static',
		}
      },
    ]
  },
  {
    threshold: 1,
    name: '1-0-left-keeperWall',
    obstacles: [
      {
        blueprintId: 'keeperWall',
        transform: { position: { x: -0.8, z: -5.2 } },
        behavior: { type: 'static' }
      }
    ]
  },
  {
    threshold: 1,
    name: '1-0-right-keeperWall',
    obstacles: [
      {
        blueprintId: 'keeperWall',
        transform: { position: { x: 0.8, z: -5.2 } },
        behavior: { type: 'static' }
      }
    ]
  },
  {
    threshold: 5,
    name: '1-0-middle-woodVertical',
    obstacles: [
      {
        blueprintId: 'woodVertical',
        transform: { position: { z: -5.4 } },
        behavior: { type: 'static' }
      }
    ]
  },
  {
    threshold: 5,
    name: '1-0-middle-keeperWall',
    obstacles: [
      {
        blueprintId: 'keeperWall',
        transform: { position: { z: -5.2 } },
        behavior: { type: 'static' }
      }
    ]
  },
  {
    threshold: 5,
    name: '1-0-middle-drum',
    obstacles: [
      {
        blueprintId: 'drum',
        transform: { position: { y: 0.5, z: -5.0 } },
        behavior: { type: 'static' }
      }
    ]
  },
  {
    threshold: 6,
    name: '1-0-diagonal-woodVertical',
    obstacles: [
      {
        blueprintId: 'woodVertical',
        transform: {
          position: { z: -5.4 },
          positionRange : { x: [-1.5, 1.5] },
          rotationRange : { z: [0, Math.PI] }
          },
        behavior: { type: 'static' }
      }
    ]
  },
  {
    threshold: 6,
    name: '1-0-diagonal-keeperWall',
    obstacles: [
      {
        blueprintId: 'keeperWall',
        transform: {
          position: { z: -5.4 },
          positionRange : { x: [-1.5, 1.5] },
          rotationRange : { z: [0, Math.PI] }
          },
        behavior: { type: 'static' }
      }
    ]
  },
  {
    threshold: 6,
    name: '1-0-diagonal-drum',
    obstacles: [
      {
        blueprintId: 'drum',
        transform: {
          position: { z: -5.0 },
          positionRange : { x: [-1.5, 1.5], y: [0.5, 1.5] },
          rotationRange : { z: [0, Math.PI] }
          },
        behavior: { type: 'static' }
      }
    ]
  },
  /* Level 1-1 patrol slow */
  {
    threshold: 10,
    name: '1-1-patrol-keeperWall',
    obstacles: [
      {
        blueprintId: 'keeperWall',
        transform: {
          position: { z: -5.4 }
        },
        behavior: {
          type: 'patrol',
          axis: 'x',
          range: [-1.2, 1.2],
          speed: 1.0,
          waveform: 'sine',
          startPhase: Math.random() * Math.PI * 2
        }
      }
    ]
  },
  {
    threshold: 10,
    name: '1-1-patrol-drum',
    obstacles: [
      {
        blueprintId: 'drum',
        transform: {
          position: { y: 0.5, z: -5.0 }
        },
        behavior: {
          type: 'patrol',
          axis: 'x',
          range: [-1.1, 1.1],
          speed: 1.0,
          waveform: 'sine',
          startPhase: Math.random() * Math.PI * 2
        }
      }
    ]
  },
  {
    threshold: 10,
    name: '1-1-patrol-whiteDrone',
    obstacles: [
      {
        blueprintId: 'whiteDrone',
        transform: {
          position: { z: -5.0 },
          positionRange: { y: [0.5, 1.5] }
        },
        behavior: {
          type: 'patrol',
          axis: 'x',
          range: [-1.0, 1.0],
          speed: 1.0,
          waveform: 'sine',
          startPhase: Math.random() * Math.PI * 2
        }
      },
    ]
  },
  {
    threshold: 10,
    name: '1-1-patrol-van',
    obstacles: [
      {
        blueprintId: 'van',
        transform: {
          position: { y: 1, z: -5.0 },
          rotation: { y: -Math.PI / 2 }
        },
        behavior: {
          type: 'patrol',
          axis: 'x',
          range: [-2.5, 2.5],
          speed: 0.5,
          waveform: 'sine',
          startPhase: Math.random() * Math.PI * 2
        }
      },
    ]
  },
  {
    threshold: 10,
    name: '1-1-horizontal-shark',
    obstacles: [
      {
        blueprintId: 'shark',
        transform: {
          position: { z: -5.0 },
          positionRange: { y: [0.3, 1.6] }
        },
        behavior: {
          type: 'patrol',
          axis: 'x',
          range: [-2.0, 2.0],
          speed: 1.0,
          waveform: 'sine',
          startPhase: Math.random() * Math.PI * 2
        },
      },
    ]
  },
  /* Level 1-2 patrol fast */
  {
    threshold: 15,
    name: '1-2-patrol-keeperWall',
    obstacles: [
      {
        blueprintId: 'keeperWall',
        transform: {
          position: { z: -5.4 }
        },
        behavior: {
          type: 'patrol',
          axis: 'x',
          range: [-1.2, 1.2],
          speed: 2.0,
          waveform: 'sine',
          startPhase: Math.random() * Math.PI * 2
        }
      }
    ]
  },
  {
    threshold: 15,
    name: '1-2-patrol-drum',
    obstacles: [
      {
        blueprintId: 'drum',
        transform: {
          position: { y: 0.5, z: -5.0 }
        },
        behavior: {
          type: 'patrol',
          axis: 'x',
          range: [-1.1, 1.1],
          speed: 2.0,
          waveform: 'sine',
          startPhase: Math.random() * Math.PI * 2
        }
      }
    ]
  },
  {
    threshold: 15,
    name: '1-2-patrol-whiteDrone',
    obstacles: [
      {
        blueprintId: 'whiteDrone',
        transform: {
          position: { z: -5.0 },
          positionRange: { y: [0.5, 2.5] }
        },
        behavior: {
          type: 'patrol',
          axis: 'x',
          range: [-1.0, 1.0],
          speed: 2.0,
          waveform: 'sine',
          startPhase: Math.random() * Math.PI * 2
        }
      },
    ]
  },
  {
    threshold: 15,
    name: '1-2-patrol-van',
    obstacles: [
      {
        blueprintId: 'van',
        transform: {
          position: { y: 1, z: -5.0 },
          rotation: { y: -Math.PI / 2 }
        },
        behavior: {
          type: 'patrol',
          axis: 'x',
          range: [-2.5, 2.5],
          speed: 1.0,
          waveform: 'sine',
          startPhase: Math.random() * Math.PI * 2
        }
      },
    ]
  },
  {
    threshold: 15,
    name: '1-2-horizontal-shark',
    obstacles: [
      {
        blueprintId: 'shark',
        transform: {
          position: { z: -5.0 },
          positionRange: { y: [0.3, 1.6] }
        },
        behavior: {
          type: 'patrol',
          axis: 'x',
          range: [-2.0, 2.0],
          speed: 2.0,
          waveform: 'sine',
          startPhase: Math.random() * Math.PI * 2
        },
      },
    ]
  },
  {
    threshold: 15,
    name: '1-2-vertical-shark',
    obstacles: [
      {
        blueprintId: 'shark',
        transform: {
          position: { z: -5.0 }
        },
        behavior: {
          type: 'patrol',
          axis: 'y',
          range: [0, 2.0],
          speed: 2.0,
          waveform: 'sine',
          startPhase: Math.random() * Math.PI * 2
        },
      },
    ]
  },
  /* Level 1-3 orbit spining */
  {
    threshold: 20,
    name: '1-3-spin-keeperWall',
    obstacles: [
      {
        blueprintId: 'keeperWall',
        transform: {
          position: { z: -5.4 }
        },
        behavior: {
          type: 'spin',
          axis: 'z',
          speed: 2.0,
          orbit: {
            axis: 'x',
            range: [-1.5, 1.5],
            speed: 2.0,
            startPhase: Math.random() * Math.PI * 2
          },
          radius: 0,
          startAngle: 0,
        }
      }
    ]
  },
  {
    threshold: 20,
    name: '1-3-spin-drum',
    obstacles: [
      {
        blueprintId: 'drum',
        transform: {
          position: { z: -5.0 },
          positionRange: { y: [0.5, 1.5] }
        },
        behavior: {
          type: 'spin',
          axis: 'z',
          speed: 2.0,
          orbit: {
            axis: 'x',
            range: [-1.5, 1.5],
            speed: 2.0,
            startPhase: Math.random() * Math.PI * 2
          },
          radius: 0,
          startAngle: 0,
        }
      }
    ]
  },
  {
    threshold: 20,
    name: '1-3-spin-whiteDrone',
    obstacles: [
      {
        blueprintId: 'whiteDrone',
        transform: {
          position: { z: -5.0 },
          positionRange: { y: [0.5, 1.5] }
        },
        behavior: {
          type: 'spin',
          axis: 'z',
          speed: 2.0,
          orbit: {
            axis: 'x',
            range: [-1.5, 1.5],
            speed: 2.0,
            startPhase: Math.random() * Math.PI * 2
          },
          radius: 0,
          startAngle: 0,
        }
      },
    ]
  },
  {
    threshold: 20,
    name: '1-3-spin-van',
    obstacles: [
      {
        blueprintId: 'van',
        transform: {
          position: { y: 1, z: -5.0 },
          rotation: { y: -Math.PI / 2 }
        },
        behavior: {
          type: 'spin',
          axis: 'y',
          speed: 2.0,
          orbit: {
            axis: 'x',
            range: [-2.5, 2.5],
            speed: 1.0,
            startPhase: Math.random() * Math.PI * 2
          },
          radius: 0,
          startAngle: 0,
        }
      },
    ]
  },
  {
    threshold: 20,
    name: '1-3-spin-shark',
    obstacles: [
      {
        blueprintId: 'shark',
        transform: {
          position: { z: -5.0 },
          positionRange: { y: [0.3, 1.6] }
        },
        behavior: {
          type: 'spin',
          axis: 'x',
          speed: 2.0,
          orbit: {
            axis: 'x',
            range: [-2.0, 2.0],
            speed: 2.0,
            startPhase: Math.random() * Math.PI * 2
          },
          radius: 0,
          startAngle: 0,
        }
      },
    ]
  },
  {
    threshold: 20,
    name: '1-3-vertical-shark',
    obstacles: [
      {
        blueprintId: 'shark',
        transform: {
          position: { z: -5.0 }
        },
        behavior: {
          type: 'spin',
          axis: 'x',
          speed: 2.0,
          orbit: {
            axis: 'y',
            range: [0, 2.0],
            speed: 2.0,
            startPhase: Math.random() * Math.PI * 2
          },
          radius: 0,
          startAngle: 0,
        }
      },
    ]
  },
  /* Level 2-0: Composition - 2 obstacles from level 1-0 */
  {
    threshold: 30,
    name: '2-0-composition',
    composition: {
      count: 2,
      from: ['1-0'],
      unique: true
    }
  },
  /* Level 2-1: Composition - 2 obstacles from level 1-1 */
  {
    threshold: 40,
    name: '2-1-composition',
    composition: {
      count: 2,
      from: ['1-1'],
      unique: true
    }
  },
  /* Level 2-2: Composition - 2 obstacles from level 1-2 */
  {
    threshold: 50,
    name: '2-2-composition',
    composition: {
      count: 2,
      from: ['1-2'],
      unique: true
    }
  },
  /* Level 2-3: Composition - 2 obstacles from level 1-3 */
  {
    threshold: 60,
    name: '2-3-composition',
    composition: {
      count: 2,
      from: ['1-3'],
      unique: true
    }
  },
  /* Level 5-3: Composition */
  {
    threshold: 60,
    name: '5-3-composition',
    composition: {
      count: 5,
      from: ['1-3'],
      unique: false
    }
  },


];

/**
 * 현재 점수에 해당하는 난이도 정보를 반환한다.
 */
export function getDifficultyForScore(score: number): DifficultyLevelConfig {
  let bestThreshold = Number.NEGATIVE_INFINITY;
  let candidates: DifficultyLevelConfig[] = [];

  for (const level of DIFFICULTY_LEVELS) {
    if (score < level.threshold) {
      break;
    }

    if (level.threshold > bestThreshold) {
      bestThreshold = level.threshold;
      candidates = [level];
    } else if (level.threshold === bestThreshold) {
      candidates.push(level);
    }
  }

  if (candidates.length === 0) {
    return DIFFICULTY_LEVELS[0];
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}

/**
 * composition 설정으로부터 장애물 배열을 생성한다.
 */
export function composeObstacles(composition: CompositionConfig): ObstacleInstanceConfig[] {
  const { count, from, unique = true } = composition;

  // from 그룹에 속하는 모든 레벨 수집
  const pool: DifficultyLevelConfig[] = [];
  for (const level of DIFFICULTY_LEVELS) {
    if (!level.obstacles || level.obstacles.length === 0) continue;

    // 레벨 이름이 from 그룹 중 하나로 시작하는지 확인 (예: '1-0-left-woodVertical'은 '1-0' 그룹에 속함)
    const matchesGroup = from.some(groupPrefix => level.name.startsWith(groupPrefix));
    if (matchesGroup) {
      pool.push(level);
    }
  }

  if (pool.length === 0) {
    console.warn(`No levels found for groups: ${from.join(', ')}`);
    return [];
  }

  const result: ObstacleInstanceConfig[] = [];
  const used = new Set<number>();

  for (let i = 0; i < count; i++) {
    let selectedLevel: DifficultyLevelConfig;

    if (unique && pool.length > used.size) {
      // unique 모드: 사용하지 않은 레벨 중에서 선택
      let attempts = 0;
      do {
        const index = Math.floor(Math.random() * pool.length);
        if (!used.has(index)) {
          selectedLevel = pool[index];
          used.add(index);
          break;
        }
        attempts++;
      } while (attempts < 100); // 무한 루프 방지

      if (!selectedLevel!) {
        // 실패 시 풀에서 랜덤 선택
        selectedLevel = pool[Math.floor(Math.random() * pool.length)];
      }
    } else {
      // non-unique 모드 또는 풀이 부족할 때: 중복 허용
      selectedLevel = pool[Math.floor(Math.random() * pool.length)];
    }

    // 선택된 레벨의 모든 장애물 추가
    if (selectedLevel.obstacles) {
      result.push(...selectedLevel.obstacles);
    }
  }

  return result;
}