import './style.css';
import { SnapShoot } from './SnapShoot';
import { ScoreDisplay } from './ui/hud/ScoreDisplay';
import { TouchGuide } from './ui/hud/TouchGuide';
import { PauseModal } from './ui/modals/PauseModal';
import { ContinueModal } from './ui/modals/ContinueModal';
import { GameOverModal, getRandomShareMessage } from './ui/modals/GameOverModal';
import { gameStateService } from './core/GameStateService';
import {
  openGameCenterLeaderboard,
  submitGameCenterLeaderBoardScore,
  getUserKeyForGame,
  GoogleAdMob,
  getTossShareLink,
  share
} from '@apps-in-toss/web-framework';
import { isTossApp, isTossGameCenterAvailable, isTossAdAvailable, logEnvironmentInfo } from './utils/TossEnvironment';
import { TOSS_CONFIG } from './config/TossConfig';
import { showToast } from './ui/utils/Toast';

/**
 * 친구 점수 알림 표시
 */
function showFriendScoreNotification(friendScore: number): void {
  const notification = document.createElement('div');
  notification.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none';
  notification.innerHTML = `
    <div class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg">
      <p class="text-sm font-bold">친구가 ${friendScore.toLocaleString('ko-KR')}점을 달성했어요!</p>
      <p class="text-xs mt-1">도전해보세요! 🔥</p>
    </div>
  `;

  document.body.appendChild(notification);

  // 3초 후 자동 사라짐
  setTimeout(() => {
    notification.classList.add('opacity-0', 'transition-opacity', 'duration-500');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

export function loadGame(params?: { score?: number }) {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
  const uiContainer = document.getElementById('ui') as HTMLDivElement | null;

  if (!canvas || !uiContainer) {
    throw new Error('필수 DOM 요소를 찾을 수 없습니다.');
  }

  // 친구 점수가 있으면 알림 표시
  if (params?.score) {
    console.log(`🎯 친구 점수: ${params.score}`);
    showFriendScoreNotification(params.score);
  }

  // 광고 상태 관리
  let adLoadState: 'idle' | 'loading' | 'loaded' | 'failed' = 'idle';

  /**
   * 환경변수에서 광고 ID 가져오기
   */
  function getAdGroupId(): string {
    const adId = import.meta.env.VITE_INTERSTITIAL_AD_ID;

    if (!adId) {
      console.warn('⚠️ VITE_INTERSTITIAL_AD_ID 미설정, 테스트 ID 사용');
      return 'ait-ad-test-interstitial-id';
    }

    if (adId === 'ait-ad-test-interstitial-id') {
      console.log('📝 테스트 광고 ID 사용 중');
    } else {
      console.log('🎯 프로덕션 광고 ID 사용 중');
    }

    return adId;
  }

  // 환경 정보 로깅
  logEnvironmentInfo();

  // 토스 게임 로그인 (Game Login - 사용자 식별 키 획득)
  if (TOSS_CONFIG.GAME_CENTER_ENABLED && isTossGameCenterAvailable()) {
    getUserKeyForGame()
      .then((result) => {
        if (!result) {
          console.warn('⚠️ 토스 앱 버전이 낮습니다.');
          return;
        }

        if (result === 'INVALID_CATEGORY') {
          console.warn('⚠️ 게임 카테고리가 아닌 미니앱입니다.');
          return;
        }

        if (result === 'ERROR') {
          console.error('❌ 사용자 키 조회 실패');
          return;
        }

        // 성공: result는 GetUserKeyForGameSuccessResponse 타입
        if (result.type === 'HASH') {
          console.log('✅ 게임 로그인 성공 (Game Login)');
          console.log('🔑 사용자 키:', result.hash.substring(0, 8) + '...');
          // 사용자 키를 저장하여 랭킹 시스템에 사용
          localStorage.setItem('toss_user_key', result.hash);
        }
      })
      .catch((error) => {
        console.error('❌ 게임 로그인 오류:', error);
        // 로그인 실패 시에도 게임은 계속 진행 (로컬 모드)
      });
  }

  // ScoreDisplay 생성 - BestScore 갱신 시 토스 랭킹에 제출
  const scoreDisplay = new ScoreDisplay(uiContainer, async (bestScore) => {
    // 토스 앱 환경이고 게임센터가 활성화된 경우에만 랭킹에 제출
    if (TOSS_CONFIG.GAME_CENTER_ENABLED && isTossGameCenterAvailable()) {
      try {
        const result = await submitGameCenterLeaderBoardScore({ score: bestScore.toString() });
        if (result && result.statusCode === 'SUCCESS') {
          console.log('✅ 토스 랭킹에 BestScore 제출 성공:', bestScore);
        } else if (result) {
          console.warn('⚠️ 토스 랭킹 BestScore 제출 실패:', result.statusCode);
        }
      } catch (error) {
        console.error('❌ 토스 랭킹 BestScore 제출 오류:', error);
      }
    }
  });
  const touchGuide = new TouchGuide(uiContainer);

  // Continue Modal과 GameOver Modal은 미리 선언 (상호 참조를 위해)
  let continueModal: ContinueModal;
  let gameOverModal: GameOverModal;

  const game = new SnapShoot(
    canvas,
    (score) => {
      // 점수 업데이트 (BestScore 갱신 시 자동으로 토스 랭킹에 제출됨)
      scoreDisplay.update(score);
    },
    (show) => touchGuide.show(show),
    scoreDisplay,
    (failCount: number) => {
      // 실패 시 콜백
      if (failCount >= 2) {
        // 2번째 실패 -> 바로 GameOver
        gameOverModal.updateScore(scoreDisplay.getScore());
        gameOverModal.open();
      } else {
        // 1번째 실패 -> Continue Modal
        continueModal.open();
      }
    }
  );

  // 저장된 오디오 설정 복구 및 적용
  const audioSettings = gameStateService.getAudioSettings();
  game.setMusicEnabled(audioSettings.musicEnabled);
  game.setSfxEnabled(audioSettings.sfxEnabled);
  game.setMasterVolume(audioSettings.masterVolume);

  // Pause Modal 생성
  new PauseModal(uiContainer, {
    onToggleDebug: () => game.toggleDebugMode(),
    onSetMusicEnabled: (enabled: boolean) => game.setMusicEnabled(enabled),
    onSetSfxEnabled: (enabled: boolean) => game.setSfxEnabled(enabled),
    onSetMasterVolume: (volume: number) => game.setMasterVolume(volume),
    onNextTheme: () => void game.switchToNextTheme(),
    onSelectTheme: (themeName: string) => void game.switchToTheme(themeName),
    onRestart: () => game.restartGame(),
    onRanking: async () => {
      // 게임센터가 비활성화되어 있으면 안내 메시지 표시
      if (!TOSS_CONFIG.GAME_CENTER_ENABLED) {
        console.warn('ℹ️ 게임센터 기능이 아직 활성화되지 않았습니다.');
        showToast({
          message: '랭킹 기능은 준비 중입니다.\n조금만 기다려주세요!',
          type: 'info'
        });
        return;
      }

      // 토스 앱 환경이 아니면 경고 메시지 표시
      if (!isTossGameCenterAvailable()) {
        console.warn('ℹ️ 랭킹 기능은 토스 앱에서만 사용 가능합니다.');
        showToast({
          message: '랭킹 기능은 토스 앱에서만 사용 가능합니다.\n토스 앱에서 게임을 실행해주세요!',
          type: 'info'
        });
        return;
      }

      try {
        // 토스 게임센터 리더보드 열기
        await openGameCenterLeaderboard();
        console.log('✅ 토스 게임센터 리더보드 열기');
      } catch (error) {
        console.error('❌ 리더보드 열기 실패:', error);
      }
    }
  });

  // Continue Modal 생성 (광고보고 이어하기)
  continueModal = new ContinueModal(
    uiContainer,
    {
      onBeforeOpen: () => {
        // 광고 사전 로드 시작
        if (!TOSS_CONFIG.ADS_ENABLED || !isTossAdAvailable()) {
          adLoadState = 'idle';
          return;
        }

        if (!GoogleAdMob.loadAppsInTossAdMob?.isSupported?.()) {
          adLoadState = 'failed';
          return;
        }

        adLoadState = 'loading';
        console.log('📥 광고 로드 시작...');

        GoogleAdMob.loadAppsInTossAdMob({
          options: {
            adGroupId: getAdGroupId()
          },
          onEvent: (event) => {
            if (event.type === 'loaded') {
              console.log('✅ 광고 로드 완료');
              adLoadState = 'loaded';
            }
          },
          onError: (error) => {
            console.error('❌ 광고 로드 실패:', error);
            adLoadState = 'failed';
          }
        });
      },
      onContinue: async () => {
        // 1. 광고 기능 비활성화 체크
        if (!TOSS_CONFIG.ADS_ENABLED || !isTossAdAvailable()) {
          console.log('ℹ️ 광고 비활성화: 게임 계속');
          game.continueGame();
          return;
        }

        // 2. 광고 로드 상태 체크
        if (adLoadState !== 'loaded') {
          console.warn('⚠️ 광고 미로드 상태: 게임 계속');
          game.continueGame();
          return;
        }

        // 3. 광고 표시 지원 여부 확인
        if (!GoogleAdMob.showAppsInTossAdMob?.isSupported?.()) {
          console.warn('⚠️ 광고 표시 미지원: 게임 계속');
          game.continueGame();
          return;
        }

        // 4. 광고 표시
        try {
          let adCompleted = false;

          GoogleAdMob.showAppsInTossAdMob({
            options: {
              adGroupId: getAdGroupId()
            },
            onEvent: (event) => {
              switch (event.type) {
                case 'show':
                  console.log('🎬 광고 재생 시작');
                  game.pauseAudio(); // 사운드 일시정지
                  break;

                case 'userEarnedReward':
                  console.log('🎁 광고 시청 완료');
                  adCompleted = true;
                  break;

                case 'dismissed':
                  console.log('🔚 광고 닫힘');
                  game.resumeAudio(); // 사운드 재개

                  if (adCompleted) {
                    console.log('✅ 게임 이어하기');
                    game.continueGame();
                  } else {
                    console.warn('⚠️ 광고 미완료, 게임 계속');
                    game.continueGame();
                  }

                  adLoadState = 'idle'; // 상태 초기화
                  break;
              }
            },
            onError: (error) => {
              console.error('❌ 광고 표시 실패:', error);
              game.resumeAudio();
              game.continueGame();
              adLoadState = 'idle';
            }
          });
        } catch (error) {
          console.error('❌ 광고 표시 오류:', error);
          game.resumeAudio();
          game.continueGame();
          adLoadState = 'idle';
        }
      },
      onGiveUp: () => {
        const finalScore = scoreDisplay.getScore();
        game.gameOver(); // 게임오버 처리 (점수 초기화)
        gameOverModal.updateScore(finalScore);
        gameOverModal.open();
      },
      onTimeout: () => {
        const finalScore = scoreDisplay.getScore();
        game.gameOver(); // 게임오버 처리 (점수 초기화)
        gameOverModal.updateScore(finalScore);
        gameOverModal.open();
      }
    },
    {
      timeoutSeconds: 5 // 5초 타임아웃
    }
  );

  // Game Over Modal 생성
  gameOverModal = new GameOverModal(
    uiContainer,
    0, // 초기 점수
    {
      onRestart: () => {
        game.restartGame(); // 점수와 실패 카운트 초기화
      },
      onShare: async () => {
        try {
          // 1. 현재 점수 가져오기
          const score = gameOverModal.getScore();

          // 2. 랜덤 메시지 생성
          const message = getRandomShareMessage(score);

          // 3. 토스 앱 여부에 따라 다른 공유 링크 사용
          if (isTossApp()) {
            // 토스 앱: 딥링크 + 토스 공유 링크 사용
            const environment = import.meta.env.VITE_ENVIRONMENT || 'development';
            const scheme = environment === 'production' ? 'intoss' : 'intoss-private';
            const deepLink = `${scheme}://snapshoot?score=${score}`;

            console.log(`📤 공유 시작 (토스 앱) - 환경: ${environment}, 딥링크: ${deepLink}`);

            const tossShareLink = await getTossShareLink(deepLink);
            await share({
              message: `${message}\n${tossShareLink}`
            });

            console.log('✅ 공유 성공! (토스 앱)');
          } else {
            // 웹: GitHub Pages 링크 사용
            const webLink = 'https://inticoy.github.io/snapshoot';
            const shareText = `${message}\n${webLink}`;

            console.log(`📤 공유 시작 (웹) - 링크: ${webLink}`);

            // Web Share API 사용 가능 여부 확인
            if (navigator.share) {
              await navigator.share({
                text: shareText
              });
              console.log('✅ 공유 성공! (Web Share API)');
            } else {
              // Web Share API 미지원 시 클립보드 복사
              await navigator.clipboard.writeText(shareText);
              showToast({
                message: '공유 메시지가 클립보드에 복사되었습니다!\n원하는 곳에 붙여넣기 해주세요.',
                type: 'success'
              });
              console.log('✅ 클립보드 복사 완료!');
            }
          }
        } catch (error) {
          console.error('❌ 공유 실패:', error);
          if (error instanceof Error) {
            if (error.message.includes('cancel') || error.name === 'AbortError') {
              console.log('ℹ️ 사용자가 공유를 취소했습니다.');
            } else {
              console.error('공유 오류:', error.message);
              showToast({
                message: '공유 중 오류가 발생했습니다.\n다시 시도해주세요.',
                type: 'error'
              });
            }
          }
        }
      },
      onRanking: async () => {
        // 게임센터가 비활성화되어 있으면 안내 메시지 표시
        if (!TOSS_CONFIG.GAME_CENTER_ENABLED) {
          console.warn('ℹ️ 게임센터 기능이 아직 활성화되지 않았습니다.');
          showToast({
            message: '랭킹 기능은 준비 중입니다.\n조금만 기다려주세요!',
            type: 'info'
          });
          return;
        }

        // 토스 앱 환경이 아니면 경고 메시지 표시
        if (!isTossGameCenterAvailable()) {
          console.warn('ℹ️ 랭킹 기능은 토스 앱에서만 사용 가능합니다.');
          showToast({
            message: '랭킹 기능은 토스 앱에서만 사용 가능합니다.\n토스 앱에서 게임을 실행해주세요!',
            type: 'info'
          });
          return;
        }

        try {
          // 토스 게임센터 리더보드 열기
          await openGameCenterLeaderboard();
          console.log('✅ 토스 게임센터 리더보드 열기');
        } catch (error) {
          console.error('❌ 리더보드 열기 실패:', error);
        }
      },
      onSelectTheme: (themeName: string) => void game.switchToTheme(themeName)
    }
  );

  // 게임오버 시 Continue Modal 열기
  // TODO: game.ts에서 게임오버 이벤트 발생 시 continueModal.open() 호출
  // 예시: game.onGameOver(() => continueModal.open());

  // Page Visibility API: 백그라운드 전환 시 사운드 자동 제어
  // 앱인토스 가이드라인: "백그라운드로 전환 시 사운드가 계속 재생이 되지 않는지 확인"
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // 백그라운드로 전환 시 (랭킹보기, 고객센터 등) -> 사운드 일시정지
      console.log('🔇 백그라운드 전환: 사운드 일시정지');
      game.pauseAudio();
    } else {
      // 포그라운드로 복귀 시 -> 사운드 재개
      console.log('🔊 포그라운드 복귀: 사운드 재개');
      game.resumeAudio();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // 임시 테스트: 키보드 'C' 키로 Continue Modal 열기
  window.addEventListener('keydown', (e) => {
    if (e.key === 'c' || e.key === 'C') {
      continueModal.open();
    }
    if (e.key === 'g' || e.key === 'G') {
      gameOverModal.updateScore(scoreDisplay.getScore());
      gameOverModal.open();
    }
  });
}
