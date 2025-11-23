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
