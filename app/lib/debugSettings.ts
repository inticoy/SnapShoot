/**
 * DebugSettings - 디버그 모드 전역 설정
 *
 * 콘솔에서 디버그 모드를 제어할 수 있습니다:
 * - window.toggleDebug(): 디버그 모드 토글
 * - window.toggleDebug(true): 디버그 모드 활성화
 * - window.toggleDebug(false): 디버그 모드 비활성화
 */

type DebugModeToggler = (enabled?: boolean) => boolean;

class DebugSettings {
  private debugModeToggler: DebugModeToggler | null = null;

  /**
   * 디버그 모드 토글 함수 등록
   */
  registerDebugToggler(toggler: DebugModeToggler): void {
    this.debugModeToggler = toggler;
  }

  /**
   * 디버그 모드 토글
   */
  toggleDebugMode(enabled?: boolean): boolean {
    if (!this.debugModeToggler) {
      console.warn('⚠️ 디버그 토글 함수가 등록되지 않았습니다.');
      return false;
    }
    return this.debugModeToggler(enabled);
  }
}

// 싱글톤 인스턴스
export const debugSettings = new DebugSettings();

// 전역 접근 (콘솔에서 사용)
declare global {
  interface Window {
    toggleDebug: (enabled?: boolean) => boolean;
  }
}

// SSR safety: only add to window in client environment
if (typeof window !== 'undefined') {
  window.toggleDebug = (enabled?: boolean) => {
    const newState = debugSettings.toggleDebugMode(enabled);
    console.log(`🐛 디버그 모드 ${newState ? 'ON' : 'OFF'}`);
    return newState;
  };
}
