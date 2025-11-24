'use client';

import { useState } from 'react';
import { useGameEvent } from '@/hooks/useGameEvent';
import { gameEventBus } from '@/lib/gameEventBus';
import { CustomizeView } from '@/components/views/CustomizeView';
import { gameStateService } from '@/../src/core/GameStateService';
import { showToast } from '@/lib/toast';
import { TOSS_CONFIG } from '@/../src/config/TossConfig';
import { isTossGameCenterAvailable } from '@/../src/utils/TossEnvironment';

import { StyledIconButton } from '@/components/common/StyledIconButton';

// Modal Wrapper Component (can be extracted later if needed)
const ModalWrapper = ({ children, onClose: _onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-fast pointer-events-auto">
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {children}
    </div>
  </div>
);

export function PauseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'pause' | 'settings' | 'customize'>('pause');
  
  // Audio Settings State
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [masterVolume, setMasterVolume] = useState(1);

  useGameEvent('SHOW_PAUSE_MODAL', (event) => {
    if (event.show) {
      setIsOpen(true);
      setView('pause');
      // Load current audio settings
      const settings = gameStateService.getAudioSettings();
      setMusicEnabled(settings.musicEnabled);
      setSfxEnabled(settings.sfxEnabled);
      setMasterVolume(settings.masterVolume);
      
      gameEventBus.emit({ type: 'GAME_PAUSED' });
    } else {
      setIsOpen(false);
      gameEventBus.emit({ type: 'GAME_RESUMED' });
    }
  });

  const handleClose = () => {
    setIsOpen(false);
    gameEventBus.emit({ type: 'SHOW_PAUSE_MODAL', show: false });
  };

  const handleRestart = () => {
    handleClose();
    // We need a way to trigger restart. 
    // Currently SnapShoot.ts doesn't listen for RESTART_GAME event.
    // But we can add it or use a direct method if we had access, but we don't.
    // Let's add RESTART_GAME event to gameEvents.ts later if needed, 
    // OR we can just emit GAME_STARTED? No, that's for loading screen.
    // Let's check if there is a restart mechanism.
    // Legacy PauseModal called callbacks.onRestart().
    // We should emit a new event 'RESTART_GAME'.
    // For now, let's assume we'll add it.
    // Wait, SnapShoot.ts needs to listen to it.
    // I'll add 'RESTART_GAME' to gameEvents.ts in the next step.
    gameEventBus.emit({ type: 'RESTART_GAME' } as any); 
  };

  const handleContinue = () => {
    // Unlock audio context logic is handled by user interaction here
    gameEventBus.emit({ type: 'UNLOCK_AUDIO' });
    handleClose();
  };

  // Audio Handlers
  const toggleMusic = (enabled: boolean) => {
    setMusicEnabled(enabled);
    gameStateService.setMusicEnabled(enabled);
    gameEventBus.emit({ type: 'MUSIC_ENABLED_CHANGED', enabled });
  };

  const toggleSfx = (enabled: boolean) => {
    setSfxEnabled(enabled);
    gameStateService.setSfxEnabled(enabled);
    gameEventBus.emit({ type: 'SFX_ENABLED_CHANGED', enabled });
  };

  const changeMasterVolume = (volume: number) => {
    setMasterVolume(volume);
    gameStateService.setMasterVolume(volume);
    gameEventBus.emit({ type: 'MASTER_VOLUME_CHANGED', volume });
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
    <ModalWrapper onClose={handleClose}>
      {/* Title */}
      <div className="absolute top-8 w-full flex items-center justify-center pointer-events-none py-4 pb-8">
        <div className="font-russo text-white tracking-tight font-black text-[clamp(32px,6vw,48px)]">
          {view === 'pause' ? '일시정지' : view === 'settings' ? '설정' : '테마 변경'}
        </div>
      </div>

      {/* Back Button */}
      {view !== 'pause' && (
        <button
          onClick={() => setView('pause')}
          className="absolute top-8 left-8 z-[40] w-10 h-10 flex items-center justify-center text-white/90 hover:text-white transition-colors"
        >
          <i className="ph ph-arrow-left text-3xl"></i>
        </button>
      )}

      {/* Content */}
      <div className="flex-auto flex flex-col items-center w-full px-6 justify-center">
        
        {view === 'pause' && (
          <div className="flex flex-col items-center gap-8 w-full max-w-lg">
            {/* Top Buttons */}
            <div className="flex gap-6 w-full justify-center">
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
                icon="ph-gear" 
                label="설정" 
                variant="settings"
                onClick={() => setView('settings')} 
              />
            </div>

            {/* Bottom Buttons */}
            <div className="flex items-center justify-center gap-6 w-full mt-8">
              <CircleButton 
                icon="ph-arrow-clockwise" 
                size="w-16 h-16" 
                iconSize="text-3xl"
                onClick={handleRestart}
              />
              <CircleButton 
                icon="ph-play" 
                size="w-20 h-20" 
                iconSize="text-4xl"
                isLarge 
                onClick={handleContinue}
              />
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="w-full max-w-md flex flex-col gap-4">
            <ToggleSection 
              label="배경음악" 
              checked={musicEnabled} 
              onChange={toggleMusic} 
            />
            <ToggleSection 
              label="효과음" 
              checked={sfxEnabled} 
              onChange={toggleSfx} 
            />
            <VolumeSection 
              volume={masterVolume} 
              onChange={changeMasterVolume} 
            />
          </div>
        )}

        {view === 'customize' && (
          <CustomizeView />
        )}

      </div>
    </ModalWrapper>
  );
}

// Sub-components


function CircleButton({ icon, size, iconSize, isLarge, onClick }: { icon: string; size: string; iconSize: string; isLarge?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        ${size} rounded-full flex items-center justify-center transition-transform active:scale-90
        ${isLarge 
          ? 'bg-gradient-to-br from-[#4facfe] to-[#00f2fe] shadow-[0_8px_20px_rgba(79,172,254,0.5)] border-[3px] border-[#4facfe]/80' 
          : 'bg-gradient-to-br from-white/25 to-white/15 shadow-[0_6px_16px_rgba(0,0,0,0.25)] border-[2px] border-white/35'}
      `}
    >
      <i className={`ph-fill ${icon} ${iconSize} text-white drop-shadow-md`}></i>
    </button>
  );
}

function ToggleSection({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="w-full flex items-center justify-between py-3">
      <div className="text-white/90 font-medium">{label}</div>
      <label className="relative inline-block w-12 h-6 cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <div className="absolute inset-0 rounded-full bg-white/15 transition-colors peer-checked:bg-white/55"></div>
        <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
      </label>
    </div>
  );
}

function VolumeSection({ volume, onChange }: { volume: number; onChange: (v: number) => void }) {
  return (
    <div className="w-full flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between">
        <div className="text-white/90 font-medium">마스터 볼륨</div>
        <div className="text-white/90 font-medium">{Math.round(volume * 100)}%</div>
      </div>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={Math.round(volume * 100)} 
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-white"
      />
    </div>
  );
}
