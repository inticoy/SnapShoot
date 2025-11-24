'use client';

import React from 'react';

type ButtonVariant = 'ranking' | 'theme' | 'settings' | 'share';

interface StyledIconButtonProps {
  icon: string;
  label: string;
  variant: ButtonVariant;
  onClick: () => void;
  className?: string;
}

export function StyledIconButton({ icon, label, variant, onClick, className = '' }: StyledIconButtonProps) {
  const getButtonStyles = () => {
    switch (variant) {
      case 'ranking':
        return {
          container: 'bg-gradient-to-br from-[#ffd700] via-[#ffa500] to-[#ff8c00] border-2 border-[#ffd700]/80 shadow-[0_6px_20px_rgba(255,193,7,0.5),0_0_30px_rgba(255,215,0,0.3)] animate-gold-glow',
          highlight: 'bg-gradient-to-br from-white/40 to-transparent',
          icon: 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]'
        };
      case 'theme':
        return {
          container: 'bg-black border-2 border-white/60 shadow-[0_6px_20px_rgba(255,0,128,0.4),0_0_30px_rgba(128,0,255,0.3)] overflow-hidden relative',
          highlight: 'bg-gradient-to-br from-white/30 via-white/5 to-white/20 inset-[2px] rounded-[calc(1rem-2px)]',
          icon: 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-icon-pulse z-10'
        };
      case 'settings':
        return {
          container: 'bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#1d4ed8] border-2 border-[#3b82f6]/80 shadow-[0_6px_20px_rgba(37,99,235,0.4)]',
          highlight: 'bg-gradient-to-br from-white/40 to-transparent',
          icon: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]'
        };
      case 'share':
        return {
          container: 'bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] border-2 border-[#10b981]/80 shadow-[0_6px_20px_rgba(16,185,129,0.4)]',
          highlight: 'bg-gradient-to-br from-white/40 to-transparent',
          icon: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]'
        };
      default:
        return {
          container: '',
          highlight: '',
          icon: ''
        };
    }
  };

  const styles = getButtonStyles();

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 group ${className}`}
      aria-label={label}
    >
      <div 
        className={`
          w-16 h-16 rounded-2xl flex items-center justify-center 
          transition-all duration-150 active:scale-95 relative
          ${styles.container}
        `}
      >
        {/* Rainbow Background for Theme Button */}
        {variant === 'theme' && (
          <div 
            className="absolute inset-[-200%] z-0 animate-rainbow-spin"
            style={{
              background: 'conic-gradient(from 0deg, #ff0080, #ff8c00, #ffd700, #00ff00, #00d4ff, #0080ff, #8000ff, #ff0080)'
            }}
          />
        )}

        {/* Highlight Layer */}
        <div className={`absolute inset-0 rounded-2xl pointer-events-none z-[1] ${styles.highlight}`} />

        {/* Icon */}
        <i className={`ph-fill ${icon} text-3xl text-white relative z-[2] ${styles.icon}`} aria-hidden="true"></i>
      </div>
      <span className="text-white/80 text-xs font-medium drop-shadow-md">{label}</span>
    </button>
  );
}
