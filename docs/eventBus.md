# 🎯 UI 마이그레이션 완전 계획서

## 📋 목차

1. [개요](#개요)
2. [이벤트 버스 아키텍처](#이벤트-버스-아키텍처)
3. [파일 분류 및 이동 계획](#파일-분류-및-이동-계획)
4. [Phase 0: 준비 작업](#phase-0-준비-작업)
5. [Phase 1: 간단한 HUD 전환](#phase-1-간단한-hud-전환)
6. [Phase 2: LoadingScreen 전환](#phase-2-loadingscreen-전환)
7. [Phase 3: 모달 전환](#phase-3-모달-전환)
8. [Phase 4: 나머지 UI 전환](#phase-4-나머지-ui-전환)
9. [Phase 5: 최종 통합](#phase-5-최종-통합)
10. [테스트 체크리스트](#테스트-체크리스트)
11. [트러블슈팅](#트러블슈팅)

---

## 개요

### 목표
- **src/ui/** 폴더의 모든 UI를 **app/components/**로 전환
- **Three.js 게임 엔진**은 src/에 그대로 유지
- **이벤트 버스**를 통한 느슨한 결합
- 단계별 테스트를 통한 안정적인 마이그레이션

### 타임라인
- **총 12일** (Phase 0~5)
- 각 Phase 완료 후 **반드시 테스트**
- 문제 발견 시 다음 Phase로 진행하지 않음

### 원칙
1. ✅ **점진적 마이그레이션**: 한 번에 하나씩
2. ✅ **Three.js 최소 수정**: 이벤트 emit만 추가
3. ✅ **타입 안전성**: 모든 이벤트 타입 정의
4. ✅ **CSS 재사용**: 기존 style.css 최대한 활용

---

## 이벤트 버스 아키텍처

### 왜 이벤트 버스인가?

**문제점**:
```
Three.js (src/) ←─?─→ React (app/)
```

**해결책**: 이벤트 버스를 중앙 허브로 사용

```
Three.js (src/) ─→ EventBus ─→ React (app/)
                     ↑
                     └─ 모든 이벤트 모니터링 가능
```

### 미래 확장성

**멀티플레이어 추가 시**:
```typescript
// Three.js에서
gameEventBus.emit({ type: 'GOAL_SCORED', score: 100 });

// 네트워크 레이어에서 자동으로 캐치
socket.emit('game_event', event);

// 상대방 이벤트 수신
socket.on('opponent_event', (data) => {
  gameEventBus.emit(data); // React가 자동으로 업데이트
});
```

**구글 로그인 추가 시**:
```typescript
gameEventBus.emit({ type: 'USER_LOGGED_IN', userId: 'abc123' });

// 점수 저장 시 자동으로 userId 추가
useGameEvent('SCORE_CHANGED', (event) => {
  saveScore({ userId, score: event.score });
});
```

### 이벤트 타입 정의

```typescript
// app/types/gameEvents.ts
export type GameEvent =
  // 점수 관련
  | { type: 'SCORE_CHANGED'; score: number }
  | { type: 'BEST_SCORE_UPDATED'; bestScore: number }

  // 게임 상태
  | { type: 'GAME_STARTED' }
  | { type: 'GAME_PAUSED' }
  | { type: 'GAME_RESUMED' }
  | { type: 'GAME_OVER'; score: number; isNewRecord: boolean }

  // 골 관련
  | { type: 'GOAL_SCORED'; score: number }
  | { type: 'GOAL_MISSED' }

  // UI 표시
  | { type: 'SHOW_TOUCH_GUIDE'; show: boolean }
  | { type: 'SHOW_PAUSE_MODAL'; show: boolean }
  | { type: 'SHOW_GAME_OVER_MODAL'; score: number }
  | { type: 'SHOW_CONTINUE_MODAL'; failCount: number }
  | { type: 'SHOW_TOAST'; message: string; type?: 'info' | 'success' | 'error' }

  // 로딩
  | { type: 'LOADING_PROGRESS'; progress: number }
  | { type: 'LOADING_COMPLETE' }
  | { type: 'LOADING_ITEM_COMPLETE'; itemId: string }

  // 오디오
  | { type: 'PLAY_SOUND'; soundId: string }
  | { type: 'MUSIC_ENABLED_CHANGED'; enabled: boolean }
  | { type: 'SFX_ENABLED_CHANGED'; enabled: boolean }
  | { type: 'MASTER_VOLUME_CHANGED'; volume: number }

  // 디버그
  | { type: 'SHOT_INFO_UPDATED'; data: ShotInfo }
  | { type: 'DEBUG_MODE_CHANGED'; enabled: boolean }

  // 테마
  | { type: 'THEME_CHANGED'; themeName: string }

  // 친구 점수
  | { type: 'FRIEND_SCORE_CHALLENGE'; score: number };

interface ShotInfo {
  type: string;
  power: number;
  curveAmount: number;
  curveDirection: number;
  heightFactor: number;
  speed: number;
  targetPosition: { x: number; y: number };
}
```

### 이벤트 버스 구현

```typescript
// app/lib/gameEventBus.ts
import type { GameEvent } from '@/types/gameEvents';

type EventHandler = (event: GameEvent) => void;

class GameEventBus {
  private listeners = new Map<string, Set<EventHandler>>();
  private debug = process.env.NODE_ENV === 'development';

  /**
   * 이벤트 발생
   */
  emit(event: GameEvent) {
    if (this.debug) {
      console.log(`[Event] ${event.type}`, event);
    }

    const handlers = this.listeners.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`[Event Error] ${event.type}:`, error);
        }
      });
    }
  }

  /**
   * 이벤트 구독
   */
  on(type: GameEvent['type'], handler: EventHandler) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);

    if (this.debug) {
      console.log(`[Event Subscribe] ${type}, listeners: ${this.listeners.get(type)!.size}`);
    }

    // 구독 해제 함수 반환
    return () => this.off(type, handler);
  }

  /**
   * 이벤트 구독 해제
   */
  off(type: GameEvent['type'], handler: EventHandler) {
    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.delete(handler);

      if (this.debug) {
        console.log(`[Event Unsubscribe] ${type}, remaining: ${handlers.size}`);
      }
    }
  }

  /**
   * 특정 타입의 모든 구독자 제거
   */
  removeAllListeners(type?: GameEvent['type']) {
    if (type) {
      this.listeners.delete(type);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * 구독자 수 확인 (디버깅용)
   */
  getListenerCount(type: string): number {
    return this.listeners.get(type)?.size ?? 0;
  }

  /**
   * 모든 이벤트 타입 목록
   */
  getEventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }
}

export const gameEventBus = new GameEventBus();

// 개발 모드에서 전역 접근
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).gameEventBus = gameEventBus;
}
```

### React Hook 래퍼

```typescript
// app/hooks/useGameEvent.ts
import { useEffect } from 'react';
import { gameEventBus } from '@/lib/gameEventBus';
import type { GameEvent } from '@/types/gameEvents';

/**
 * 게임 이벤트 구독 Hook
 *
 * @example
 * useGameEvent('SCORE_CHANGED', (event) => {
 *   setScore(event.score);
 * });
 */
export function useGameEvent<T extends GameEvent['type']>(
  type: T,
  handler: (event: Extract<GameEvent, { type: T }>) => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const wrappedHandler = (event: GameEvent) => {
      if (event.type === type) {
        handler(event as Extract<GameEvent, { type: T }>);
      }
    };

    const unsubscribe = gameEventBus.on(type, wrappedHandler);

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, ...deps]);
}
```

---

## 파일 분류 및 이동 계획

### 전체 파일 목록

```
src/
├── 🔴 UI 전환 필요 (11개 파일)
│   ├── ui/modals/BaseModal.ts          → app/components/ui/Modal.tsx
│   ├── ui/modals/PauseModal.ts         → app/components/modals/PauseModal.tsx
│   ├── ui/modals/GameOverModal.ts      → app/components/modals/GameOverModal.tsx
│   ├── ui/modals/ContinueModal.ts      → app/components/modals/ContinueModal.tsx
│   ├── ui/hud/ScoreDisplay.ts          → app/components/hud/ScoreDisplay.tsx
│   ├── ui/hud/ShotInfoHud.ts           → app/components/hud/ShotInfoHud.tsx
│   ├── ui/hud/TouchGuide.ts            → app/components/hud/TouchGuide.tsx
│   ├── ui/screens/LoadingScreen.ts     → app/components/screens/LoadingScreen.tsx
│   ├── ui/views/CustomizeView.ts       → app/components/views/CustomizeView.tsx
│   ├── ui/utils/Toast.ts               → app/components/ui/Toast.tsx
│   └── ui/ViewManager.ts               → (로직만 추출, 대부분 React state로 대체)
│
├── 🟡 공유 라이브러리 (2개 파일)
│   ├── core/GameStateService.ts        → app/lib/gameStateService.ts
│   └── core/DebugSettings.ts           → app/lib/debugSettings.ts
│
└── 🟢 게임 로직 유지 (40+ 파일)
    ├── SnapShoot.ts                    ✅ 유지 (이벤트 emit 추가)
    ├── GameLoader.ts                   ⚠️ 수정 (UI 생성 제거)
    ├── core/GameStateManager.ts        ✅ 유지
    ├── core/DifficultyManager.ts       ✅ 유지
    ├── core/AssetLoader.ts             ✅ 유지
    ├── config/**/*.ts                  ✅ 전부 유지
    ├── entities/**/*.ts                ✅ 전부 유지
    ├── physics/**/*.ts                 ✅ 전부 유지
    ├── shooting/**/*.ts                ✅ 전부 유지
    ├── infra/**/*.ts                   ✅ 전부 유지
    ├── input/**/*.ts                   ✅ 전부 유지
    ├── environment/**/*.ts             ✅ 전부 유지
    ├── debug/**/*.ts                   ✅ 유지
    └── utils/*.ts                      ✅ 유지
```

### 최종 폴더 구조

```
app/
├── components/
│   ├── game/
│   │   └── GameUI.tsx              # UI 컨테이너
│   ├── modals/
│   │   ├── PauseModal.tsx
│   │   ├── GameOverModal.tsx
│   │   └── ContinueModal.tsx
│   ├── hud/
│   │   ├── ScoreDisplay.tsx
│   │   ├── ShotInfoHud.tsx
│   │   └── TouchGuide.tsx
│   ├── screens/
│   │   └── LoadingScreen.tsx
│   ├── views/
│   │   └── CustomizeView.tsx
│   └── ui/
│       ├── Modal.tsx               # BaseModal 대체
│       ├── Toast.tsx
│       └── Button.tsx
├── hooks/
│   ├── useGameEvent.ts
│   └── useGameInstance.ts
├── lib/
│   ├── gameEventBus.ts
│   ├── gameStateService.ts
│   └── debugSettings.ts
└── types/
    └── gameEvents.ts

src/                                # Three.js 게임 엔진
├── SnapShoot.ts                    # 이벤트 emit 추가
├── GameLoader.ts                   # UI 생성 제거
└── ... (나머지 모두 유지)
```

---

## Phase 0: 준비 작업 (2일)

### 목표
- 이벤트 버스 시스템 구축
- 공유 라이브러리 이동
- 폴더 구조 생성
- 기본 UI 컴포넌트 준비

### Step 0.1: 폴더 구조 생성 (30분)

```bash
# 폴더 생성
mkdir -p app/components/{game,modals,hud,screens,views,ui}
mkdir -p app/{hooks,lib,types}
```

**체크리스트**:
- [ ] app/components/game 폴더 생성
- [ ] app/components/modals 폴더 생성
- [ ] app/components/hud 폴더 생성
- [ ] app/components/screens 폴더 생성
- [ ] app/components/views 폴더 생성
- [ ] app/components/ui 폴더 생성
- [ ] app/hooks 폴더 생성
- [ ] app/lib 폴더 생성
- [ ] app/types 폴더 생성

---

### Step 0.2: 이벤트 타입 정의 (1시간)

**파일 생성**: `app/types/gameEvents.ts`

```typescript
// app/types/gameEvents.ts
export type GameEvent =
  // 점수 관련
  | { type: 'SCORE_CHANGED'; score: number }
  | { type: 'BEST_SCORE_UPDATED'; bestScore: number }

  // 게임 상태
  | { type: 'GAME_STARTED' }
  | { type: 'GAME_PAUSED' }
  | { type: 'GAME_RESUMED' }
  | { type: 'GAME_OVER'; score: number; isNewRecord: boolean }

  // 골 관련
  | { type: 'GOAL_SCORED'; score: number }
  | { type: 'GOAL_MISSED' }

  // UI 표시
  | { type: 'SHOW_TOUCH_GUIDE'; show: boolean }
  | { type: 'SHOW_PAUSE_MODAL'; show: boolean }
  | { type: 'SHOW_GAME_OVER_MODAL'; score: number }
  | { type: 'SHOW_CONTINUE_MODAL'; failCount: number }
  | { type: 'SHOW_TOAST'; message: string; toastType?: 'info' | 'success' | 'error' }

  // 로딩
  | { type: 'LOADING_PROGRESS'; progress: number }
  | { type: 'LOADING_COMPLETE' }
  | { type: 'LOADING_ITEM_COMPLETE'; itemId: string }

  // 오디오
  | { type: 'PLAY_SOUND'; soundId: string }
  | { type: 'MUSIC_ENABLED_CHANGED'; enabled: boolean }
  | { type: 'SFX_ENABLED_CHANGED'; enabled: boolean }
  | { type: 'MASTER_VOLUME_CHANGED'; volume: number }

  // 디버그
  | { type: 'SHOT_INFO_UPDATED'; data: ShotInfo }
  | { type: 'DEBUG_MODE_CHANGED'; enabled: boolean }

  // 테마
  | { type: 'THEME_CHANGED'; themeName: string }

  // 친구 점수
  | { type: 'FRIEND_SCORE_CHALLENGE'; score: number };

export interface ShotInfo {
  type: string;
  power: number;
  curveAmount: number;
  curveDirection: number;
  heightFactor: number;
  speed: number;
  targetPosition: { x: number; y: number };
}
```

**체크리스트**:
- [ ] gameEvents.ts 파일 생성
- [ ] 모든 이벤트 타입 정의 완료
- [ ] ShotInfo 인터페이스 정의

---

### Step 0.3: 이벤트 버스 구현 (2시간)

**파일 생성**: `app/lib/gameEventBus.ts`

위의 "이벤트 버스 구현" 코드 전체 사용

**체크리스트**:
- [ ] gameEventBus.ts 파일 생성
- [ ] emit 메서드 구현
- [ ] on/off 메서드 구현
- [ ] 디버그 로그 추가
- [ ] 전역 접근 설정 (development 모드)

**테스트**:
```typescript
// 브라우저 콘솔에서
gameEventBus.emit({ type: 'SCORE_CHANGED', score: 100 });
// [Event] SCORE_CHANGED { type: 'SCORE_CHANGED', score: 100 }

gameEventBus.on('SCORE_CHANGED', (event) => {
  console.log('Received:', event.score);
});

gameEventBus.emit({ type: 'SCORE_CHANGED', score: 200 });
// [Event] SCORE_CHANGED { type: 'SCORE_CHANGED', score: 200 }
// Received: 200
```

---

### Step 0.4: React Hook 생성 (1시간)

**파일 생성**: `app/hooks/useGameEvent.ts`

위의 "React Hook 래퍼" 코드 전체 사용

**체크리스트**:
- [ ] useGameEvent.ts 파일 생성
- [ ] 타입 안전성 확보
- [ ] 자동 구독 해제 구현

**테스트 컴포넌트 생성**:
```tsx
// app/components/test/EventTest.tsx
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
      <h3>Event Test</h3>
      <p>Score: {score}</p>
      <button
        onClick={() => gameEventBus.emit({ type: 'SCORE_CHANGED', score: score + 1 })}
        className="bg-blue-500 px-4 py-2 rounded"
      >
        Increment
      </button>
    </div>
  );
}
```

**app/page.tsx에 임시 추가**:
```tsx
import { EventTest } from '@/components/test/EventTest';

export default function GamePage() {
  return (
    <>
      <EventTest />
      {/* ... */}
    </>
  );
}
```

**테스트**:
1. 페이지 로드
2. "Increment" 버튼 클릭
3. 점수 증가 확인
4. 콘솔에서 이벤트 로그 확인

---

### Step 0.5: 공유 라이브러리 이동 (2시간)

#### GameStateService 이동

**파일 복사**:
```bash
cp src/core/GameStateService.ts app/lib/gameStateService.ts
```

**수정 사항**:
```typescript
// app/lib/gameStateService.ts
// (기존 코드 그대로, import 경로만 확인)

// src/core/GameStateService.ts는 유지 (기존 코드와의 호환성)
```

**app/lib/gameStateService.ts** 내용은 기존과 동일하게 유지

**체크리스트**:
- [ ] gameStateService.ts 복사
- [ ] localStorage 접근 확인
- [ ] 타입 정의 확인

**테스트**:
```typescript
// 브라우저 콘솔에서
import { gameStateService } from '@/lib/gameStateService';

gameStateService.setBestScore(999);
console.log(gameStateService.getBestScore()); // 999

gameStateService.setMusicEnabled(false);
console.log(gameStateService.getMusicEnabled()); // false
```

---

#### DebugSettings 이동

**파일 복사**:
```bash
cp src/core/DebugSettings.ts app/lib/debugSettings.ts
```

**체크리스트**:
- [ ] debugSettings.ts 복사
- [ ] 전역 접근 확인

---

### Step 0.6: 기본 Modal 컴포넌트 (2시간)

**파일 생성**: `app/components/ui/Modal.tsx`

```tsx
'use client';

import { useEffect, type ReactNode } from 'react';

export interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
}

export function Modal({
  children,
  isOpen,
  onClose,
  closeOnEsc = true,
  closeOnBackdrop = false
}: ModalProps) {
  // ESC 키 처리
  useEffect(() => {
    if (!closeOnEsc || !isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [closeOnEsc, isOpen, onClose]);

  // 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex bg-black/40 backdrop-blur-[2px] z-[30] transition-opacity duration-300"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className="relative flex h-full w-full flex-col overflow-y-auto pt-[15vh] pb-[5vh] bg-black/30 backdrop-blur-sm text-white transition-all duration-300 ease-out"
        style={{
          paddingRight: 'calc(env(safe-area-inset-right, 0px) + 16px)',
          paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 16px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
```

**체크리스트**:
- [ ] Modal.tsx 파일 생성
- [ ] ESC 키 처리 구현
- [ ] 스크롤 잠금 구현
- [ ] Safe area 처리

**테스트 컴포넌트**:
```tsx
// app/components/test/ModalTest.tsx
'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

export function ModalTest() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 left-10 bg-purple-500 px-4 py-2 rounded z-50"
      >
        Open Modal
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="flex-auto flex items-center justify-center">
          <div className="bg-white/10 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Test Modal</h2>
            <p>This is a test modal</p>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 bg-blue-500 px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
```

**테스트**:
1. "Open Modal" 버튼 클릭
2. 모달 열림 확인
3. ESC 키로 닫기 확인
4. 배경 클릭으로 닫기 확인 (closeOnBackdrop prop 변경)

---

### Phase 0 완료 체크리스트

```
✅ Phase 0: 준비 작업
  □ Step 0.1: 폴더 구조 생성
  □ Step 0.2: 이벤트 타입 정의
  □ Step 0.3: 이벤트 버스 구현 및 테스트
  □ Step 0.4: useGameEvent Hook 및 테스트
  □ Step 0.5: 공유 라이브러리 이동
  □ Step 0.6: Modal 컴포넌트 및 테스트

테스트:
  □ gameEventBus 콘솔 테스트 통과
  □ EventTest 컴포넌트 동작 확인
  □ gameStateService 동작 확인
  □ Modal 열기/닫기/ESC 확인
```

---

## Phase 1: 간단한 HUD 전환 (2일)

### 목표
- TouchGuide, ShotInfoHud, ScoreDisplay 전환
- 이벤트 버스 실전 사용
- Three.js ↔ React 통신 검증

---

### Step 1.1: TouchGuide 전환 (4시간)

#### ⭐ **가장 간단한 컴포넌트부터 시작**

#### 1.1.1: React 컴포넌트 생성

**파일 생성**: `app/components/hud/TouchGuide.tsx`

```tsx
'use client';

import { useGameEvent } from '@/hooks/useGameEvent';
import { useState } from 'react';

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
```

**체크리스트**:
- [ ] TouchGuide.tsx 파일 생성
- [ ] useGameEvent 사용
- [ ] CSS 클래스는 기존 src/style.css 재사용

---

#### 1.1.2: Three.js 수정

**파일 수정**: `src/SnapShoot.ts`

현재 코드 찾기:
```typescript
// 현재 (라인 ~200-300 사이)
this.onShowTouchGuide(true);
```

변경:
```typescript
// 추가 import (파일 상단)
import { gameEventBus } from '../app/lib/gameEventBus';

// 메서드 내에서
gameEventBus.emit({ type: 'SHOW_TOUCH_GUIDE', show: true });
```

**모든 onShowTouchGuide 호출을 찾아서 변경**:
```bash
# 검색
grep -n "onShowTouchGuide" src/SnapShoot.ts
```

**체크리스트**:
- [ ] import 추가
- [ ] 모든 onShowTouchGuide 호출을 이벤트로 변경
- [ ] onShowTouchGuide 콜백 제거

---

#### 1.1.3: GameLoader.ts 수정

**파일 수정**: `src/GameLoader.ts`

현재 코드 찾기:
```typescript
// 현재
const touchGuide = new TouchGuide(uiContainer);
```

변경:
```typescript
// TouchGuide import 제거
// TouchGuide 생성 코드 제거
// React가 담당하므로 삭제
```

**체크리스트**:
- [ ] TouchGuide import 제거
- [ ] TouchGuide 생성 코드 제거

---

#### 1.1.4: app/page.tsx에 추가

**파일 수정**: `app/page.tsx`

```tsx
import { TouchGuide } from '@/components/hud/TouchGuide';

export default function GamePage() {
  return (
    <div id="game-container">
      <canvas id="game-canvas" />
      <div id="ui">
        <TouchGuide />  {/* 추가 */}
      </div>
    </div>
  );
}
```

**체크리스트**:
- [ ] TouchGuide import
- [ ] JSX에 추가

---

#### 1.1.5: 테스트

**테스트 시나리오**:
1. ✅ 게임 실행
2. ✅ 로딩 화면 종료 후 TouchGuide 표시 확인
3. ✅ 첫 스와이프 후 TouchGuide 사라짐 확인
4. ✅ 콘솔에서 이벤트 확인:
   ```
   [Event] SHOW_TOUCH_GUIDE { type: 'SHOW_TOUCH_GUIDE', show: true }
   [Event] SHOW_TOUCH_GUIDE { type: 'SHOW_TOUCH_GUIDE', show: false }
   ```

**문제 발생 시**:
- CSS가 적용 안 됨 → `src/style.css`가 로드되는지 확인
- 이벤트가 안 옴 → Three.js에서 emit 확인
- 컴포넌트가 안 보임 → React DevTools로 확인

---

### Step 1.2: ShotInfoHud 전환 (4시간)

#### 1.2.1: React 컴포넌트 생성

**파일 생성**: `app/components/hud/ShotInfoHud.tsx`

```tsx
'use client';

import { useGameEvent } from '@/hooks/useGameEvent';
import { useState } from 'react';
import type { ShotInfo } from '@/types/gameEvents';

export function ShotInfoHud() {
  const [visible, setVisible] = useState(false);
  const [shotInfo, setShotInfo] = useState<ShotInfo | null>(null);

  useGameEvent('DEBUG_MODE_CHANGED', (event) => {
    setVisible(event.enabled);
  });

  useGameEvent('SHOT_INFO_UPDATED', (event) => {
    setShotInfo(event.data);
  });

  if (!visible || !shotInfo) return null;

  const getShotTypeColor = (type: string): string => {
    switch (type) {
      case 'NORMAL': return '#81a1c1';
      case 'CURVE': return '#b48ead';
      case 'INVALID': return '#d08770';
      default: return '#ffffff';
    }
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-black/70 border border-blue-400/40 rounded-lg font-mono text-xs text-blue-100 z-[5] backdrop-blur max-w-[95vw] shadow-lg">
      <div className="flex justify-center flex-wrap gap-x-3 gap-y-1.5 mb-1.5">
        <span className="whitespace-nowrap">
          <span className="text-sky-400 font-bold">TYPE: </span>
          <span style={{ color: getShotTypeColor(shotInfo.type) }}>{shotInfo.type}</span>
        </span>
        <span className="whitespace-nowrap">
          <span className="text-sky-400 font-bold">PWR: </span>
          <span className="text-white">{Math.round(shotInfo.power * 100)}%</span>
        </span>
        <span className="whitespace-nowrap">
          <span className="text-sky-400 font-bold">CRV: </span>
          <span className="text-white">
            {Math.round(shotInfo.curveAmount * 100)}% {shotInfo.curveDirection === 1 ? 'R' : shotInfo.curveDirection === -1 ? 'L' : '-'}
          </span>
        </span>
        <span className="whitespace-nowrap">
          <span className="text-sky-400 font-bold">HGT: </span>
          <span className="text-white">{Math.round(shotInfo.heightFactor * 100)}%</span>
        </span>
      </div>
      <div className="flex justify-center flex-wrap gap-x-3 gap-y-1.5">
        <span className="whitespace-nowrap">
          <span className="text-sky-400 font-bold">SPD: </span>
          <span className="text-white">{shotInfo.speed.toFixed(1)} m/s</span>
        </span>
        <span className="whitespace-nowrap">
          <span className="text-sky-400 font-bold">TGT: </span>
          <span className="text-white">
            ({shotInfo.targetPosition.x.toFixed(1)}, {shotInfo.targetPosition.y.toFixed(1)})
          </span>
        </span>
      </div>
    </div>
  );
}
```

**체크리스트**:
- [ ] ShotInfoHud.tsx 파일 생성
- [ ] 디버그 모드 구독
- [ ] 슛 정보 구독
- [ ] 스타일 적용

---

#### 1.2.2: Three.js 수정

**파일 수정**: `src/SnapShoot.ts`

디버그 모드 토글 시:
```typescript
// 디버그 모드 변경 시
gameEventBus.emit({ type: 'DEBUG_MODE_CHANGED', enabled: this.debugMode });
```

슛 정보 업데이트 시:
```typescript
// executeShot 메서드 내
gameEventBus.emit({
  type: 'SHOT_INFO_UPDATED',
  data: {
    type: shotAnalysis.type,
    power: shotAnalysis.power,
    curveAmount: shotAnalysis.curveAmount,
    curveDirection: shotAnalysis.curveDirection,
    heightFactor: shotAnalysis.heightFactor,
    speed,
    targetPosition: { x: shotParams.targetPosition.x, y: shotParams.targetPosition.y }
  }
});
```

**체크리스트**:
- [ ] 디버그 모드 이벤트 추가
- [ ] 슛 정보 이벤트 추가

---

#### 1.2.3: 테스트

1. ✅ 콘솔에서 `window.toggleDebug(true)` 실행
2. ✅ ShotInfoHud 표시 확인
3. ✅ 슛을 쏘면 정보 업데이트 확인
4. ✅ `window.toggleDebug(false)` 실행 후 숨김 확인

---

### Step 1.3: ScoreDisplay 전환 (8시간) ⚠️ **가장 복잡**

#### 1.3.1: React 컴포넌트 생성

**파일 생성**: `app/components/hud/ScoreDisplay.tsx`

```tsx
'use client';

import { useGameEvent } from '@/hooks/useGameEvent';
import { useState, useEffect } from 'react';

export function ScoreDisplay() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  // 초기 best score 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('snapshoot.bestScore');
      if (saved) {
        setBestScore(parseInt(saved));
      }
    }
  }, []);

  // 점수 변경 이벤트
  useGameEvent('SCORE_CHANGED', (event) => {
    animateScore(displayScore, event.score);
  });

  // Best 점수 업데이트 이벤트
  useGameEvent('BEST_SCORE_UPDATED', (event) => {
    setBestScore(event.bestScore);
    // 펄스 애니메이션 트리거
    const bestEl = document.getElementById('best-score-number');
    if (bestEl) {
      bestEl.classList.add('animate-best-score-pop');
      setTimeout(() => {
        bestEl.classList.remove('animate-best-score-pop');
      }, 800);
    }
  });

  // 카운트업 애니메이션
  const animateScore = (from: number, to: number) => {
    const duration = 300;
    const startTime = Date.now();
    const range = to - from;

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(from + range * easeOut);

      setDisplayScore(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setScore(to);
      }
    };

    requestAnimationFrame(step);

    // Scoreboard bounce 애니메이션
    const scoreboard = document.getElementById('scoreboard-container');
    if (scoreboard) {
      scoreboard.classList.add('animate-scoreboard-pulse');
      setTimeout(() => {
        scoreboard.classList.remove('animate-scoreboard-pulse');
      }, 400);
    }
  };

  const isAppInToss = typeof navigator !== 'undefined' && /TossApp/i.test(navigator.userAgent);

  return (
    <>
      {/* Best Score */}
      <div
        className="pointer-events-none absolute top-0 left-3 z-[5] inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[36px] border border-white/10 bg-[#0000009A] shadow-[0_6px_18px_rgba(0,0,0,0.45)] font-montserrat text-base font-semibold text-white landscape-xs:top-0 landscape-xs:px-3 landscape-xs:py-1.5 landscape-xs:text-sm"
        style={isAppInToss ? {} : {
          top: 'calc(env(safe-area-inset-top, 0px) + 1rem)',
          left: 'calc(env(safe-area-inset-left, 0px) + 1rem)'
        }}
      >
        <span className="text-[#FFEE00] drop-shadow-[0_0_6px_rgba(255,238,0,0.45)]">
          Best:
        </span>
        <span
          id="best-score-number"
          className="text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.45)]"
        >
          {bestScore}
        </span>
      </div>

      {/* Current Score */}
      <div
        id="scoreboard-container"
        className="pointer-events-none absolute top-[12%] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center w-[148px] px-6 py-4 rounded-[24px] border border-white/10 bg-[#00000099] shadow-[0_12px_28px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.35)] transition-all duration-300 landscape-xs:w-[140px] landscape-xs:px-5 landscape-xs:py-3"
      >
        <div className="font-montserrat text-[72px] font-black tracking-wide leading-none text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] landscape-xs:text-[32px]">
          {displayScore}
        </div>
      </div>
    </>
  );
}
```

**체크리스트**:
- [ ] ScoreDisplay.tsx 파일 생성
- [ ] 카운트업 애니메이션 구현
- [ ] Best 점수 펄스 애니메이션
- [ ] Scoreboard bounce 애니메이션

---

#### 1.3.2: Three.js 수정

**파일 수정**: `src/SnapShoot.ts`

점수 업데이트 시:
```typescript
// updateScore 메서드 (또는 점수 변경 위치)
private updateScore(newScore: number) {
  this.score = newScore;

  // React로 점수 전달
  gameEventBus.emit({ type: 'SCORE_CHANGED', score: newScore });

  // Best 점수 체크
  const bestScore = gameStateService.getBestScore();
  if (newScore > bestScore) {
    gameStateService.setBestScore(newScore);
    gameEventBus.emit({ type: 'BEST_SCORE_UPDATED', bestScore: newScore });
  }
}
```

**체크리스트**:
- [ ] SCORE_CHANGED 이벤트 추가
- [ ] BEST_SCORE_UPDATED 이벤트 추가

---

#### 1.3.3: GameLoader.ts 수정

```typescript
// ScoreDisplay import 제거
// ScoreDisplay 생성 코드 제거
```

---

#### 1.3.4: 테스트

1. ✅ 게임 실행
2. ✅ 초기 점수 0 확인
3. ✅ 골 넣으면 점수 증가 및 애니메이션 확인
4. ✅ Best 점수 갱신 시 펄스 애니메이션 확인
5. ✅ localStorage에 저장 확인

---

### Phase 1 완료 체크리스트

```
✅ Phase 1: HUD 전환
  □ Step 1.1: TouchGuide 전환 및 테스트
  □ Step 1.2: ShotInfoHud 전환 및 테스트
  □ Step 1.3: ScoreDisplay 전환 및 테스트

Three.js 수정:
  □ SHOW_TOUCH_GUIDE 이벤트 추가
  □ DEBUG_MODE_CHANGED 이벤트 추가
  □ SHOT_INFO_UPDATED 이벤트 추가
  □ SCORE_CHANGED 이벤트 추가
  □ BEST_SCORE_UPDATED 이벤트 추가

GameLoader.ts:
  □ TouchGuide 생성 제거
  □ ShotInfoHud 생성 제거
  □ ScoreDisplay 생성 제거

app/page.tsx:
  □ TouchGuide 추가
  □ ShotInfoHud 추가
  □ ScoreDisplay 추가

테스트:
  □ 전체 게임 플레이 테스트
  □ 모든 UI 동작 확인
  □ 콘솔 에러 없음
```

---

## 최종 테스트 체크리스트

```
✅ 전체 게임 플로우
  □ 로딩 화면 → 게임 진입
  □ 점수 표시 및 증가
  □ TouchGuide 표시/숨김
  □ Pause 모달 열기/닫기
  □ 설정 변경 (음악, 효과음, 볼륨)
  □ 테마 변경
  □ 게임 오버 모달
  □ Continue 모달
  □ 다시하기

✅ 성능
  □ FPS 60 유지
  □ React 리렌더 최소화
  □ 메모리 누수 없음

✅ 호환성
  □ Chrome 테스트
  □ Safari 테스트
  □ 모바일 테스트
  □ Toss 앱 테스트
```

---

## 트러블슈팅

### 이벤트가 발생하지 않을 때
1. gameEventBus import 확인
2. 콘솔에서 `window.gameEventBus.getEventTypes()` 확인
3. 이벤트 타입 오타 확인

### CSS가 적용되지 않을 때
1. `src/style.css` 로드 확인
2. Tailwind 빌드 확인
3. 클래스 이름 확인

### 성능 저하 시
1. React DevTools Profiler 사용
2. 불필요한 리렌더 찾기
3. `useMemo`, `useCallback` 추가

---

**이제 이 계획을 따라 단계별로 진행하시면 됩니다! 각 Phase 완료 후 반드시 테스트하세요.**
