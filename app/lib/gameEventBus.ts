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
