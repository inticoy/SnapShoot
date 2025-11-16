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
 *
 * 새로운 난이도 시스템:
 * - 0점: 장애물 없음
 * - 1-14점: 1개 장애물 (threshold 1, 2, 3, 4, 7, 10)
 * - 15점 이상: 15점마다 장애물 1개씩 증가 (2개→3개→...→10개)
 * - 각 장애물 개수당 3+3+4+5 = 15점 주기 (1-0, 1-1, 1-2, 1-3)
 * - 145-149점: 10-3 최고 난이도
 */
export const DIFFICULTY_LEVELS: DifficultyLevelConfig[] = [
  /* ============================================
   * 0점: 장애물 없음
   * ============================================ */
  {
    threshold: 0,
    name: '0-0-no-obstacles',
    obstacles: []
  },

  /* ============================================
   * 1-14점: 1개 장애물
   * ============================================ */

  /* Threshold 1: 1-0 기본 고정 장애물 (8개 variation) */
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

  /* Threshold 2: 1-0 중앙 고정 장애물 (3개 variation) */
  {
    threshold: 2,
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
    threshold: 2,
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
    threshold: 2,
    name: '1-0-middle-drum',
    obstacles: [
      {
        blueprintId: 'drum',
        transform: { position: { y: 0.5, z: -5.0 } },
        behavior: { type: 'static' }
      }
    ]
  },

  /* Threshold 3: 1-0 대각선/랜덤 위치 (3개 variation) */
  {
    threshold: 3,
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
    threshold: 3,
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
    threshold: 3,
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

  /* Threshold 4: 1-1 느린 patrol (5개 variation) */
  {
    threshold: 4,
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
          waveform: 'sine'
        }
      }
    ]
  },
  {
    threshold: 4,
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
          waveform: 'sine'
        }
      }
    ]
  },
  {
    threshold: 4,
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
          waveform: 'sine'
        }
      },
    ]
  },
  {
    threshold: 4,
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
          waveform: 'sine'
        }
      },
    ]
  },
  {
    threshold: 4,
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
          waveform: 'sine'
        },
      },
    ]
  },

  /* Threshold 7: 1-2 빠른 patrol (6개 variation) */
  {
    threshold: 7,
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
          waveform: 'sine'
        }
      }
    ]
  },
  {
    threshold: 7,
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
          waveform: 'sine'
        }
      }
    ]
  },
  {
    threshold: 7,
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
          waveform: 'sine'
        }
      },
    ]
  },
  {
    threshold: 7,
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
          waveform: 'sine'
        }
      },
    ]
  },
  {
    threshold: 7,
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
          waveform: 'sine'
        },
      },
    ]
  },
  {
    threshold: 7,
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
          waveform: 'sine'
        },
      },
    ]
  },

  /* Threshold 10: 1-3 회전/spin (6개 variation) */
  {
    threshold: 10,
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
            speed: 2.0
          },
          radius: 0,
          startAngle: 0,
        }
      }
    ]
  },
  {
    threshold: 10,
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
            speed: 2.0
          },
          radius: 0,
          startAngle: 0,
        }
      }
    ]
  },
  {
    threshold: 10,
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
            speed: 2.0
          },
          radius: 0,
          startAngle: 0,
        }
      },
    ]
  },
  {
    threshold: 10,
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
            speed: 1.0
          },
          radius: 0,
          startAngle: 0,
        }
      },
    ]
  },
  {
    threshold: 10,
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
            speed: 2.0
          },
          radius: 0,
          startAngle: 0,
        }
      },
    ]
  },
  {
    threshold: 10,
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
            speed: 2.0
          },
          radius: 0,
          startAngle: 0,
        }
      },
    ]
  },

  /* ============================================
   * 15-149점: 2-10개 장애물 (Composition)
   * 패턴: 각 장애물 개수당 3+3+4+5 = 15점 주기
   * 각 구간의 시작 threshold만 정의 (나머지는 자동 적용)
   * ============================================ */

  /* 15-29점: 2개 장애물 (3+3+4+5) */
  { threshold: 15, name: '2-0-composition', composition: { count: 2, from: ['1-0'], unique: true } },
  { threshold: 18, name: '2-1-composition', composition: { count: 2, from: ['1-1'], unique: true } },
  { threshold: 21, name: '2-2-composition', composition: { count: 2, from: ['1-2'], unique: true } },
  { threshold: 25, name: '2-3-composition', composition: { count: 2, from: ['1-3'], unique: true } },

  /* 30-44점: 3개 장애물 (3+3+4+5) */
  { threshold: 30, name: '3-0-composition', composition: { count: 3, from: ['1-0'], unique: true } },
  { threshold: 33, name: '3-1-composition', composition: { count: 3, from: ['1-1'], unique: true } },
  { threshold: 36, name: '3-2-composition', composition: { count: 3, from: ['1-2'], unique: true } },
  { threshold: 40, name: '3-3-composition', composition: { count: 3, from: ['1-3'], unique: true } },

  /* 45-59점: 4개 장애물 (3+3+4+5) */
  { threshold: 45, name: '4-0-composition', composition: { count: 4, from: ['1-0'], unique: true } },
  { threshold: 48, name: '4-1-composition', composition: { count: 4, from: ['1-1'], unique: true } },
  { threshold: 51, name: '4-2-composition', composition: { count: 4, from: ['1-2'], unique: true } },
  { threshold: 55, name: '4-3-composition', composition: { count: 4, from: ['1-3'], unique: true } },

  /* 60-74점: 5개 장애물 (3+3+4+5) */
  { threshold: 60, name: '5-0-composition', composition: { count: 5, from: ['1-0'], unique: true } },
  { threshold: 63, name: '5-1-composition', composition: { count: 5, from: ['1-1'], unique: true } },
  { threshold: 66, name: '5-2-composition', composition: { count: 5, from: ['1-2'], unique: true } },
  { threshold: 70, name: '5-3-composition', composition: { count: 5, from: ['1-3'], unique: true } },

  /* 75-89점: 6개 장애물 (3+3+4+5) */
  { threshold: 75, name: '6-0-composition', composition: { count: 6, from: ['1-0'], unique: true } },
  { threshold: 78, name: '6-1-composition', composition: { count: 6, from: ['1-1'], unique: true } },
  { threshold: 81, name: '6-2-composition', composition: { count: 6, from: ['1-2'], unique: true } },
  { threshold: 85, name: '6-3-composition', composition: { count: 6, from: ['1-3'], unique: true } },

  /* 90-104점: 7개 장애물 (3+3+4+5) */
  { threshold: 90, name: '7-0-composition', composition: { count: 7, from: ['1-0'], unique: true } },
  { threshold: 93, name: '7-1-composition', composition: { count: 7, from: ['1-1'], unique: true } },
  { threshold: 96, name: '7-2-composition', composition: { count: 7, from: ['1-2'], unique: true } },
  { threshold: 100, name: '7-3-composition', composition: { count: 7, from: ['1-3'], unique: true } },

  /* 105-119점: 8개 장애물 (3+3+4+5) */
  { threshold: 105, name: '8-0-composition', composition: { count: 8, from: ['1-0'], unique: true } },
  { threshold: 108, name: '8-1-composition', composition: { count: 8, from: ['1-1'], unique: true } },
  { threshold: 111, name: '8-2-composition', composition: { count: 8, from: ['1-2'], unique: true } },
  { threshold: 115, name: '8-3-composition', composition: { count: 8, from: ['1-3'], unique: true } },

  /* 120-134점: 9개 장애물 (3+3+4+5) */
  { threshold: 120, name: '9-0-composition', composition: { count: 9, from: ['1-0'], unique: true } },
  { threshold: 123, name: '9-1-composition', composition: { count: 9, from: ['1-1'], unique: true } },
  { threshold: 126, name: '9-2-composition', composition: { count: 9, from: ['1-2'], unique: true } },
  { threshold: 130, name: '9-3-composition', composition: { count: 9, from: ['1-3'], unique: true } },

  /* 135-149점: 10개 장애물 (최고 난이도, 3+3+4+5) */
  { threshold: 135, name: '10-0-composition', composition: { count: 10, from: ['1-0'], unique: true } },
  { threshold: 138, name: '10-1-composition', composition: { count: 10, from: ['1-1'], unique: true } },
  { threshold: 141, name: '10-2-composition', composition: { count: 10, from: ['1-2'], unique: true } },
  { threshold: 145, name: '10-3-composition', composition: { count: 10, from: ['1-3'], unique: true } },

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
