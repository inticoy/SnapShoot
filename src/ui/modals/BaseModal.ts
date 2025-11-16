/**
 * BaseModal - 모든 모달의 기본 클래스
 *
 * 공통 기능:
 * - 열기/닫기 애니메이션
 * - 배경 블러 처리
 * - ESC 키 처리
 * - 스크롤 잠금
 * - Safe area 처리
 */

export interface BaseModalOptions {
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  containerElement?: HTMLElement;
}

export type ButtonType = 'ranking' | 'theme' | 'settings' | 'share' | 'default';

export abstract class BaseModal {
  protected overlay: HTMLDivElement;
  protected content: HTMLDivElement;
  protected closeOnEsc: boolean;
  protected closeOnBackdrop: boolean;
  protected isOpen: boolean = false;
  private keydownHandler?: (event: KeyboardEvent) => void;
  private static stylesInjected = false;

  constructor(options: BaseModalOptions = {}) {
    this.closeOnEsc = options.closeOnEsc ?? true;
    this.closeOnBackdrop = options.closeOnBackdrop ?? false;

    // CSS 스타일 주입 (한 번만)
    if (!BaseModal.stylesInjected) {
      this.injectButtonStyles();
      BaseModal.stylesInjected = true;
    }

    this.overlay = this.createOverlay();
    this.content = this.createContentWrapper();

    this.overlay.appendChild(this.content);

    if (options.containerElement) {
      options.containerElement.appendChild(this.overlay);
    }

    this.setupEventListeners();
  }

  /**
   * 버튼 스타일 CSS 주입
   */
  private injectButtonStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gold-glow {
        0%, 100% {
          box-shadow: 0 6px 20px rgba(255, 193, 7, 0.5), 0 0 30px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -2px 8px rgba(0, 0, 0, 0.25);
        }
        50% {
          box-shadow: 0 6px 20px rgba(255, 193, 7, 0.6), 0 0 40px rgba(255, 215, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -2px 8px rgba(0, 0, 0, 0.25);
        }
      }

      @keyframes ad-glow {
        0%, 100% {
          box-shadow: 0 12px 32px rgba(255, 140, 0, 0.5), 0 0 30px rgba(255, 193, 7, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 8px rgba(0, 0, 0, 0.2);
        }
        50% {
          box-shadow: 0 12px 32px rgba(255, 140, 0, 0.6), 0 0 40px rgba(255, 193, 7, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 8px rgba(0, 0, 0, 0.2);
        }
      }

      @keyframes rainbow-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes icon-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      .modal-btn-icon-active {
        transform: scale(0.85) !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 오버레이 생성 (배경)
   */
  private createOverlay(): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.className = `
      fixed inset-0
      flex
      bg-black/40 backdrop-blur-[2px] ios-backdrop
      opacity-0 pointer-events-none
      transition-opacity duration-300
      z-[30]
    `.trim().replace(/\s+/g, ' ');

    overlay.style.display = 'none';
    return overlay;
  }

  /**
   * 컨텐츠 래퍼 생성
   */
  private createContentWrapper(): HTMLDivElement {
    const content = document.createElement('div');
    content.className = `
      relative flex h-full w-full flex-col
      overflow-y-auto
      pt-[15vh] pb-[5vh]
      bg-black/30
      backdrop-blur-sm ios-backdrop
      text-white
      transition-all duration-300 ease-out
    `.trim().replace(/\s+/g, ' ');

    // Safe area padding
    content.style.paddingRight = 'calc(env(safe-area-inset-right, 0px) + 16px)';
    content.style.paddingLeft = 'calc(env(safe-area-inset-left, 0px) + 16px)';

    return content;
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // ESC 키 처리
    if (this.closeOnEsc) {
      this.keydownHandler = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.isOpen) {
          this.close();
        }
      };
      document.addEventListener('keydown', this.keydownHandler);
    }

    // 배경 클릭 처리
    if (this.closeOnBackdrop) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }
  }

  /**
   * 모달 열기
   */
  open(): void {
    if (this.isOpen) return;

    this.isOpen = true;
    this.onBeforeOpen();

    // display를 먼저 flex로 변경 (애니메이션을 위해)
    this.overlay.style.display = 'flex';

    // 다음 프레임에서 opacity 변경 (transition이 작동하도록)
    requestAnimationFrame(() => {
      this.overlay.classList.remove('opacity-0', 'pointer-events-none');
      this.overlay.classList.add('opacity-100', 'pointer-events-auto');
    });

    // 스크롤 잠금
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    this.onAfterOpen();
  }

  /**
   * 모달 닫기
   */
  close(): void {
    if (!this.isOpen) return;

    this.onBeforeClose();

    this.overlay.classList.add('opacity-0');
    this.overlay.classList.remove('opacity-100');

    // 애니메이션 완료 후 처리
    setTimeout(() => {
      this.overlay.classList.add('pointer-events-none');
      this.overlay.classList.remove('pointer-events-auto');
      this.overlay.style.display = 'none';

      // 스크롤 잠금 해제
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';

      this.isOpen = false;
      this.onAfterClose();
    }, 300); // transition duration과 동일
  }

  /**
   * 모달이 열려있는지 확인
   */
  isModalOpen(): boolean {
    return this.isOpen;
  }

  /**
   * 버튼에 press 효과 추가
   */
  protected addPressEffect(button: HTMLButtonElement): void {
    const onPress = () => {
      button.classList.add('button-pressed');
    };

    const onRelease = () => {
      button.classList.remove('button-pressed');
    };

    button.addEventListener('pointerdown', onPress);
    button.addEventListener('pointerup', onRelease);
    button.addEventListener('pointercancel', onRelease);
    button.addEventListener('pointerleave', onRelease);

    button.addEventListener('touchstart', onPress, { passive: true });
    button.addEventListener('touchend', onRelease, { passive: true });
    button.addEventListener('touchcancel', onRelease, { passive: true });
  }

  /**
   * 정사각형 아이콘 버튼 생성 헬퍼
   */
  protected createSquareIconButton(id: string, iconSvg: string, label: string, buttonType: ButtonType = 'default'): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = id;
    button.type = 'button';

    const baseClass = `
      flex-1 aspect-[0.85]
      flex flex-col items-center justify-center gap-3
      rounded-2xl
      transition-all duration-150
      max-w-[120px] max-h-[140px]
      relative overflow-hidden
    `.trim().replace(/\s+/g, ' ');

    button.className = baseClass;

    // 하이라이트 레이어 추가
    const highlight = document.createElement('div');
    highlight.className = 'absolute inset-0 pointer-events-none';
    highlight.style.zIndex = '1';

    // 버튼 타입별 스타일 적용
    switch (buttonType) {
      case 'ranking':
        this.applyRankingStyle(button, highlight);
        break;
      case 'theme':
        this.applyThemeStyle(button, highlight);
        break;
      case 'settings':
        this.applySettingsStyle(button, highlight);
        break;
      case 'share':
        this.applyShareStyle(button, highlight);
        break;
      default:
        this.applyDefaultStyle(button);
        break;
    }

    button.appendChild(highlight);

    // 아이콘과 텍스트 추가
    const content = document.createElement('div');
    content.className = 'relative z-[2] flex flex-col items-center justify-center gap-3';
    content.innerHTML = `
      ${iconSvg}
      <span class="text-white/90 font-medium text-sm">${label}</span>
    `;
    button.appendChild(content);

    // 클릭 효과 - 아이콘 축소
    const icon = content.querySelector('i');
    if (icon) {
      button.addEventListener('pointerdown', () => {
        icon.classList.add('modal-btn-icon-active');
      });
      button.addEventListener('pointerup', () => {
        icon.classList.remove('modal-btn-icon-active');
      });
      button.addEventListener('pointercancel', () => {
        icon.classList.remove('modal-btn-icon-active');
      });
    }

    return button;
  }

  /**
   * 랭킹 버튼 스타일
   */
  private applyRankingStyle(button: HTMLButtonElement, highlight: HTMLDivElement): void {
    button.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffcc00 20%, #ffb800 40%, #ffa500 60%, #ff9500 80%, #ff8c00 100%)';
    button.style.border = '2px solid rgba(255, 215, 0, 0.8)';
    button.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.5), 0 0 30px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -2px 8px rgba(0, 0, 0, 0.25)';
    button.style.animation = 'gold-glow 2s ease-in-out infinite';

    highlight.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%)';

    // 아이콘 스타일
    button.addEventListener('DOMNodeInserted', function handler() {
      const icon = button.querySelector('i');
      if (icon) {
        (icon as HTMLElement).style.filter = 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))';
        button.removeEventListener('DOMNodeInserted', handler);
      }
    });

    // 클릭 효과
    button.addEventListener('pointerdown', () => {
      button.style.transform = 'scale(0.92)';
      button.style.boxShadow = '0 2px 6px rgba(255, 193, 7, 0.3), inset 0 3px 10px rgba(0, 0, 0, 0.4)';
    });
    button.addEventListener('pointerup', () => {
      button.style.transform = '';
      button.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.5), 0 0 30px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -2px 8px rgba(0, 0, 0, 0.25)';
    });
  }

  /**
   * 테마 버튼 스타일
   */
  private applyThemeStyle(button: HTMLButtonElement, highlight: HTMLDivElement): void {
    button.style.background = '#000';
    button.style.border = '2px solid rgba(255, 255, 255, 0.6)';
    button.style.boxShadow = '0 6px 20px rgba(255, 0, 128, 0.4), 0 0 30px rgba(128, 0, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -2px 8px rgba(0, 0, 0, 0.3)';

    // 회전하는 무지개 배경
    const rainbow = document.createElement('div');
    rainbow.className = 'absolute';
    rainbow.style.cssText = 'inset: -200%; z-index: 0;';
    rainbow.style.background = 'conic-gradient(from 0deg, #ff0080, #ff8c00, #ffd700, #00ff00, #00d4ff, #0080ff, #8000ff, #ff0080)';
    rainbow.style.animation = 'rainbow-spin 4s linear infinite';
    button.insertBefore(rainbow, button.firstChild);

    // 유리 질감
    highlight.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.2) 100%)';
    highlight.style.borderRadius = 'calc(1rem - 2px)';
    highlight.style.inset = '2px';

    // 아이콘 스타일 및 펄스
    button.addEventListener('DOMNodeInserted', function handler() {
      const icon = button.querySelector('i');
      if (icon) {
        (icon as HTMLElement).style.filter = 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))';
        (icon as HTMLElement).style.animation = 'icon-pulse 2s ease-in-out infinite';
        button.removeEventListener('DOMNodeInserted', handler);
      }
    });

    // 클릭 효과
    button.addEventListener('pointerdown', () => {
      button.style.transform = 'scale(0.92)';
      button.style.boxShadow = '0 2px 8px rgba(255, 0, 128, 0.3), 0 0 20px rgba(128, 0, 255, 0.2), inset 0 3px 12px rgba(0, 0, 0, 0.4)';
      highlight.style.opacity = '0.3';
    });
    button.addEventListener('pointerup', () => {
      button.style.transform = '';
      button.style.boxShadow = '0 6px 20px rgba(255, 0, 128, 0.4), 0 0 30px rgba(128, 0, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -2px 8px rgba(0, 0, 0, 0.3)';
      highlight.style.opacity = '';
    });
  }

  /**
   * 설정 버튼 스타일 (파란색)
   */
  private applySettingsStyle(button: HTMLButtonElement, highlight: HTMLDivElement): void {
    button.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)';
    button.style.border = '2px solid rgba(59, 130, 246, 0.8)';
    button.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -2px 6px rgba(0, 0, 0, 0.2)';

    highlight.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%)';

    // 아이콘 스타일
    button.addEventListener('DOMNodeInserted', function handler() {
      const icon = button.querySelector('i');
      if (icon) {
        (icon as HTMLElement).style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))';
        button.removeEventListener('DOMNodeInserted', handler);
      }
    });

    // 클릭 효과
    button.addEventListener('pointerdown', () => {
      button.style.transform = 'scale(0.92)';
      button.style.boxShadow = '0 2px 6px rgba(37, 99, 235, 0.3), inset 0 3px 10px rgba(0, 0, 0, 0.35)';
    });
    button.addEventListener('pointerup', () => {
      button.style.transform = '';
      button.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -2px 6px rgba(0, 0, 0, 0.2)';
    });
  }

  /**
   * 공유 버튼 스타일 (녹색)
   */
  private applyShareStyle(button: HTMLButtonElement, highlight: HTMLDivElement): void {
    button.style.background = 'linear-gradient(135deg, #2ecc71 0%, #27ae60 50%, #229954 100%)';
    button.style.border = '2px solid rgba(46, 204, 113, 0.7)';
    button.style.boxShadow = '0 6px 16px rgba(46, 204, 113, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 6px rgba(0, 0, 0, 0.2)';

    highlight.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%)';

    // 아이콘 스타일
    button.addEventListener('DOMNodeInserted', function handler() {
      const icon = button.querySelector('i');
      if (icon) {
        (icon as HTMLElement).style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))';
        button.removeEventListener('DOMNodeInserted', handler);
      }
    });

    // 클릭 효과
    button.addEventListener('pointerdown', () => {
      button.style.transform = 'scale(0.92)';
      button.style.boxShadow = '0 2px 6px rgba(46, 204, 113, 0.3), inset 0 3px 10px rgba(0, 0, 0, 0.35)';
    });
    button.addEventListener('pointerup', () => {
      button.style.transform = '';
      button.style.boxShadow = '0 6px 16px rgba(46, 204, 113, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 6px rgba(0, 0, 0, 0.2)';
    });
  }

  /**
   * 기본 버튼 스타일
   */
  private applyDefaultStyle(button: HTMLButtonElement): void {
    button.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)';
    button.style.border = '1px solid rgba(255, 255, 255, 0.15)';
    button.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';

    // 클릭 효과
    button.addEventListener('pointerdown', () => {
      button.style.transform = 'scale(0.92)';
      button.style.background = 'rgba(255, 255, 255, 0.10)';
      button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
    });
    button.addEventListener('pointerup', () => {
      button.style.transform = '';
      button.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)';
      button.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
    });
  }

  /**
   * 라이프사이클 훅: 열리기 직전
   */
  protected onBeforeOpen(): void {}

  /**
   * 라이프사이클 훅: 열린 직후
   */
  protected onAfterOpen(): void {}

  /**
   * 라이프사이클 훅: 닫히기 직전
   */
  protected onBeforeClose(): void {}

  /**
   * 라이프사이클 훅: 닫힌 직후
   */
  protected onAfterClose(): void {}

  /**
   * 정리
   */
  destroy(): void {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
    this.overlay.remove();
  }
}
