'use client';

import { useState } from 'react';
import { useGameEvent } from '@/hooks/useGameEvent';
import { gameEventBus } from '@/lib/gameEventBus';
import { CircularTimerButton } from '@/components/common/CircularTimerButton';

// Modal Wrapper Component
const ModalWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-fast pointer-events-auto">
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {children}
    </div>
  </div>
);

export function ContinueModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);

  useGameEvent('SHOW_CONTINUE_MODAL', () => {
    setIsOpen(true);
    setIsAdLoading(false);
  });

  const handleGiveUp = () => {
    setIsOpen(false);
    gameEventBus.emit({ type: 'CONTINUE_GIVE_UP' });
  };

  const handleContinue = async () => {
    if (isAdLoading) return;
    setIsAdLoading(true);

    try {
      // TODO: Implement Ad logic here
      // For now, simulate ad success
      console.log('Ad started...');
      
      // Simulate ad duration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Ad completed!');
      setIsOpen(false);
      gameEventBus.emit({ type: 'CONTINUE_GAME_SUCCESS' });
    } catch (error) {
      console.error('Ad failed:', error);
      setIsAdLoading(false);
    }
  };

  const handleTimeout = () => {
    if (isOpen && !isAdLoading) {
      handleGiveUp();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper>
      {/* Title */}
      <div className="absolute top-8 w-full flex items-center justify-center pointer-events-none py-4 pb-8">
        <div className="font-russo text-white tracking-tight font-black text-[clamp(24px,5vw,32px)] text-center animate-fade-in">
          게임을 계속하시겠습니까?
        </div>
      </div>

      {/* Content */}
      <div className="flex-auto flex flex-col items-center w-full px-6 justify-center">
        <div className="flex flex-col items-center justify-between w-full max-w-lg pt-2 pb-[8vh]">
          
          {/* Top Spacer */}
          <div className="flex flex-col items-center gap-2 py-2 min-h-[clamp(60px,12vw,100px)]"></div>

          {/* Circular Timer Button */}
          <div className="flex items-center justify-center w-full mb-12">
            <CircularTimerButton 
              duration={5}
              onComplete={handleTimeout}
              onClick={handleContinue}
              size={140}
            />
          </div>

          {/* Give Up Button */}
          <button
            onClick={handleGiveUp}
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
              <i className="ph-fill ph-x-circle text-2xl drop-shadow-md group-active:scale-90 transition-transform"></i>
              <span>포기하기</span>
            </div>
          </button>

        </div>
      </div>
    </ModalWrapper>
  );
}
