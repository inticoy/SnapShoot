/**
 * 토스 앱 전용 기능들을 캡슐화한 모듈
 * 웹 환경에서는 fallback 동작 제공
 */

// 타입 정의
export interface TossIntegration {
  openGameCenterLeaderboard: () => Promise<void>;
  submitGameCenterLeaderBoardScore: (options: { score: string }) => Promise<{ statusCode: string } | null>;
  getUserKeyForGame: () => Promise<any>;
  GoogleAdMob: any;
  getTossShareLink: (deepLink: string) => Promise<string>;
  share: (options: { message: string }) => Promise<void>;
}

/**
 * Fallback 구현
 */
function getFallbackIntegration(): TossIntegration {
  return {
    openGameCenterLeaderboard: async () => {
      console.log('ℹ️ openGameCenterLeaderboard - 웹 환경에서는 지원되지 않습니다.');
    },
    submitGameCenterLeaderBoardScore: async () => {
      console.log('ℹ️ submitGameCenterLeaderBoardScore - 웹 환경에서는 지원되지 않습니다.');
      return null;
    },
    getUserKeyForGame: async () => {
      console.log('ℹ️ getUserKeyForGame - 웹 환경에서는 지원되지 않습니다.');
      return null;
    },
    GoogleAdMob: {
      loadAppsInTossAdMob: {
        isSupported: () => false
      },
      showAppsInTossAdMob: {
        isSupported: () => false
      }
    },
    getTossShareLink: async (deepLink: string) => {
      console.log('ℹ️ getTossShareLink - 웹 환경에서는 지원되지 않습니다.');
      return deepLink;
    },
    share: async () => {
      console.log('ℹ️ share - 웹 환경에서는 지원되지 않습니다.');
    }
  };
}

/**
 * 토스 앱 통합 기능 로드
 * 토스 앱 환경에서만 실제 기능 사용, 웹 환경에서는 fallback
 */
export async function loadTossIntegration(): Promise<TossIntegration> {
  // 웹 환경에서는 항상 fallback 사용
  // 토스 프레임워크는 빌드 시 포함되지 않음
  return getFallbackIntegration();
}
