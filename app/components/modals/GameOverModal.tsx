'use client';

import { useState } from 'react';
import { useGameEvent } from '@/hooks/useGameEvent';
import { gameEventBus } from '@/lib/gameEventBus';
import { CustomizeView } from '@/components/views/CustomizeView';
import { showToast } from '@/lib/toast';
import { TOSS_CONFIG } from '@/../src/config/TossConfig';
import { isTossApp, isTossGameCenterAvailable } from '@/../src/utils/TossEnvironment';

const SHARE_MESSAGES = [
  '스냅슛⚽️ {score}점! 따라올테면 따라와봐~!\n\n따라가기... 👇',
  '스냅슛⚽️ {score}점! 넌 나한테 안 되지...\n\n도전은 웰컴이야~ 👇',
  '오늘 에임 미쳤다... 스냅슛⚽️ {score}점 나옴...\n\n나도 슈팅하기 👇',
  '푸스카스급 감차가능ㅋㅋ 스냅슛⚽️ {score}점 찍음!\n\n푸스카스상 받기 👇'
] as const;

export function getRandomShareMessage(score: number): string {
  const randomIndex = Math.floor(Math.random() * SHARE_MESSAGES.length);
  const template = SHARE_MESSAGES[randomIndex];
  return template.replace('{score}', score.toLocaleString('ko-KR'));
}

import { StyledIconButton } from '@/components/common/StyledIconButton';

// Modal Wrapper Component
const ModalWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-fast pointer-events-auto">
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {children}
    </div>
  </div>
);

export function GameOverModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [view, setView] = useState<'gameOver' | 'customize'>('gameOver');

  useGameEvent('SHOW_GAME_OVER_MODAL', (event) => {
    setIsOpen(true);
    setScore(event.score);
    setView('gameOver');
  });

  const handleRestart = () => {
    setIsOpen(false);
    gameEventBus.emit({ type: 'RESTART_GAME' } as any);
  };

  const handleShare = async () => {
    try {
      // 1. 현재 점수 가져오기
      const currentScore = score;

      // 2. 랜덤 메시지 생성
      const message = getRandomShareMessage(currentScore);

      // 3. 토스 앱 여부에 따라 다른 공유 링크 사용
      if (isTossApp()) {
        // 토스 앱: 딥링크 + 토스 공유 링크 사용
        const environment = typeof process !== 'undefined'
          ? process.env.NEXT_PUBLIC_ENVIRONMENT ?? 'development'
          : 'development';
        const scheme = environment === 'production' ? 'intoss' : 'intoss-private';
        const deepLink = `${scheme}://snapshoot?score=${currentScore}`;

        console.log(`📤 공유 시작 (토스 앱) - 환경: ${environment}, 딥링크: ${deepLink}`);

        const { getTossShareLink, share } = await import('@apps-in-toss/web-framework');
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
          showToast.success('공유 메시지가 클립보드에 복사되었습니다!\n원하는 곳에 붙여넣기 해주세요.');
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
          showToast.error('공유 중 오류가 발생했습니다.\n다시 시도해주세요.');
        }
      }
    }
  };

  const handleRanking = async () => {
    // 게임센터가 비활성화되어 있으면 안내 메시지 표시
    if (!TOSS_CONFIG.GAME_CENTER_ENABLED) {
      console.warn('ℹ️ 게임센터 기능이 아직 활성화되지 않았습니다.');
      showToast.info('랭킹 기능은 준비 중입니다.\n조금만 기다려주세요!');
      return;
    }

    // 토스 앱 환경이 아니면 경고 메시지 표시
    if (!isTossGameCenterAvailable()) {
      console.warn('ℹ️ 랭킹 기능은 토스 앱에서만 사용 가능합니다.');
      showToast.info('랭킹 기능은 토스 앱에서만 사용 가능합니다.\n토스 앱에서 게임을 실행해주세요!');
      return;
    }

    try {
      const { openGameCenterLeaderboard } = await import('@apps-in-toss/web-framework');
      await openGameCenterLeaderboard();
      console.log('✅ 토스 게임센터 리더보드 열기');
    } catch (error) {
      console.error('❌ 리더보드 열기 실패:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper>
      {/* Title */}
      <div className="absolute top-8 w-full flex items-center justify-center pointer-events-none py-4 pb-8">
        <div className="font-russo text-white tracking-tight font-black text-[clamp(32px,6vw,48px)]">
          {view === 'gameOver' ? 'GAME OVER' : '테마 변경'}
        </div>
      </div>

      {/* Back Button */}
      {view !== 'gameOver' && (
        <button
          onClick={() => setView('gameOver')}
          className="absolute top-8 left-8 z-[40] w-10 h-10 flex items-center justify-center text-white/90 hover:text-white transition-colors"
        >
          <i className="ph ph-arrow-left text-3xl"></i>
        </button>
      )}

      {/* Content */}
      <div className="flex-auto flex flex-col items-center w-full px-6 justify-center">
        
        {view === 'gameOver' && (
          <div className="flex flex-col items-center justify-between w-full max-w-lg pt-[2vh] pb-[8vh] gap-4">
            {/* Score Display */}
            <div className="flex flex-col items-center gap-2 py-4 animate-fade-in">
              <div className="text-white/70 font-semibold text-sm uppercase tracking-wider">최종 점수</div>
              <div className="text-white font-russo font-black tracking-tight drop-shadow-lg text-[clamp(48px,10vw,72px)]">
                {score.toLocaleString()}
              </div>
            </div>

            {/* Top Buttons */}
            <div className="flex gap-6 w-full justify-center mb-8">
              <StyledIconButton 
                icon="ph-ranking" 
                label="랭킹보기" 
                variant="ranking"
                onClick={handleRanking} 
              />
              <StyledIconButton 
                icon="ph-palette" 
                label="테마 변경" 
                variant="theme"
                onClick={() => setView('customize')} 
              />
              <StyledIconButton 
                icon="ph-share-network" 
                label="공유하기" 
                variant="share"
                onClick={handleShare} 
              />
            </div>

            {/* Restart Button */}
            <button
              onClick={handleRestart}
              className="
                flex items-center gap-2
                px-16 py-4 rounded-full
                backdrop-blur-sm
                text-white font-bold text-lg
                transition-all duration-150
                relative overflow-hidden
                bg-gradient-to-br from-white/25 to-white/15
                border-2 border-white/40
                shadow-[0_12px_32px_rgba(0,0,0,0.4)]
                active:scale-95
                group
              "
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent pointer-events-none"></div>
              <div className="relative z-[2] flex items-center gap-2">
                <i className="ph-fill ph-arrow-clockwise text-2xl drop-shadow-md group-active:scale-90 transition-transform"></i>
                <span>다시하기</span>
              </div>
            </button>
          </div>
        )}

        {view === 'customize' && (
          <CustomizeView />
        )}

      </div>
    </ModalWrapper>
  );
}

// Reusing SquareIconButton from PauseModal logic (duplicated for independence or can be shared)

