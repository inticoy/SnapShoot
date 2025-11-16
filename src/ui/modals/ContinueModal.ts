/**
 * ContinueModal - 광고보고 이어하기 모달 (1단계)
 *
 * 프로덕션 레벨 UI:
 * - 원형 버튼 + 진행바 (3-5초 카운트다운)
 * - 중앙 정렬 레이아웃
 * - 부드러운 애니메이션
 * - 모바일 게임 스타일
 */

import { BaseModal } from './BaseModal';

export interface ContinueModalCallbacks {
  onBeforeOpen?: () => void;       // 모달 열리기 전 (광고 로드용)
  onContinue?: () => void;         // 광고보고 이어하기
  onGiveUp?: () => void;           // 포기하기 (GameOver로 전환)
  onTimeout?: () => void;          // 타임아웃 (GameOver로 전환)
}

export interface ContinueModalOptions {
  timeoutSeconds?: number;         // 타임아웃 시간 (기본 5초)
}

export class ContinueModal extends BaseModal {
  private callbacks: ContinueModalCallbacks;
  private timeoutSeconds: number;
  private continueButton!: HTMLButtonElement;
  private giveUpButton!: HTMLButtonElement;
  private progressCircle!: SVGCircleElement;
  private percentageText!: HTMLSpanElement;
  private timerText!: HTMLSpanElement;
  private animationFrameId?: number;
  private fallbackInterval?: number;
  private startTime?: number;

  constructor(
    container: HTMLElement,
    callbacks: ContinueModalCallbacks = {},
    options: ContinueModalOptions = {}
  ) {
    super({
      closeOnEsc: false,      // ESC로 닫기 비활성화
      closeOnBackdrop: false, // 배경 클릭으로 닫기 비활성화
      containerElement: container
    });

    this.callbacks = callbacks;
    this.timeoutSeconds = options.timeoutSeconds ?? 5;

    this.createModalContent();
  }

  /**
   * 모달 컨텐츠 생성
   */
  private createModalContent(): void {
    // BaseModal의 content를 완전히 새로 구성
    this.content.className = `
      absolute inset-0
      flex items-center justify-center
      px-6
    `.trim().replace(/\s+/g, ' ');

    const contentWrapper = document.createElement('div');
    contentWrapper.className = `
      flex-1 w-full max-w-lg
      flex flex-col items-center justify-between
      pt-[2vh] pb-[8vh] gap-4
    `.trim().replace(/\s+/g, ' ');

    // 상단 콘텐츠 컨테이너
    const topContent = document.createElement('div');
    topContent.className = 'flex flex-col items-center w-full gap-4';

    // 타이틀
    const title = document.createElement('div');
    title.className = `
      font-russo text-white tracking-tight font-black text-center
      animate-fade-in
    `.trim().replace(/\s+/g, ' ');
    title.style.fontSize = 'clamp(24px, 5vw, 32px)';
    title.textContent = '게임을 계속하시겠습니까?';

    // 원형 버튼 + 진행바
    const continueButtonWrapper = this.createContinueButton();

    topContent.appendChild(title);
    topContent.appendChild(continueButtonWrapper);

    // 하단 버튼 (포기하기)
    const bottomButtonsWrapper = document.createElement('div');
    bottomButtonsWrapper.className = 'flex items-center justify-center w-full';

    this.giveUpButton = this.createGiveUpButton();
    bottomButtonsWrapper.appendChild(this.giveUpButton);

    contentWrapper.appendChild(topContent);
    contentWrapper.appendChild(bottomButtonsWrapper);

    this.content.appendChild(contentWrapper);
  }

  /**
   * 원형 진행바가 있는 이어하기 버튼 생성
   */
  private createContinueButton(): HTMLDivElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'relative flex items-center justify-center';

    // SVG 원형 진행바
    const size = 200;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size.toString());
    svg.setAttribute('height', size.toString());
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.classList.add('absolute', '-rotate-90');
    svg.style.filter = 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))';

    // 배경 원
    const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgCircle.setAttribute('cx', (size / 2).toString());
    bgCircle.setAttribute('cy', (size / 2).toString());
    bgCircle.setAttribute('r', radius.toString());
    bgCircle.setAttribute('fill', 'none');
    bgCircle.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)');
    bgCircle.setAttribute('stroke-width', strokeWidth.toString());

    // 진행 원
    this.progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this.progressCircle.setAttribute('cx', (size / 2).toString());
    this.progressCircle.setAttribute('cy', (size / 2).toString());
    this.progressCircle.setAttribute('r', radius.toString());
    this.progressCircle.setAttribute('fill', 'none');
    this.progressCircle.setAttribute('stroke', '#ffffff');
    this.progressCircle.setAttribute('stroke-width', strokeWidth.toString());
    this.progressCircle.setAttribute('stroke-linecap', 'round');
    this.progressCircle.setAttribute('stroke-dasharray', circumference.toString());
    this.progressCircle.setAttribute('stroke-dashoffset', '0');

    svg.appendChild(bgCircle);
    svg.appendChild(this.progressCircle);

    // 중앙 버튼
    this.continueButton = document.createElement('button');
    this.continueButton.type = 'button';
    this.continueButton.className = `
      relative z-10
      w-[180px] h-[180px]
      flex flex-col items-center justify-center gap-3
      rounded-full
      transition-all duration-200
      overflow-hidden
    `.trim().replace(/\s+/g, ' ');

    // 황금색 그라데이션 배경
    this.continueButton.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffb800 25%, #ffa500 50%, #ff8c00 75%, #ff6b35 100%)';
    this.continueButton.style.border = '3px solid rgba(255, 193, 7, 0.8)';
    this.continueButton.style.boxShadow = '0 12px 32px rgba(255, 140, 0, 0.5), 0 0 30px rgba(255, 193, 7, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 8px rgba(0, 0, 0, 0.2)';
    this.continueButton.style.animation = 'ad-glow 2s ease-in-out infinite';

    // 하이라이트 레이어
    const highlight = document.createElement('div');
    highlight.className = 'absolute inset-0 rounded-full pointer-events-none';
    highlight.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%)';
    highlight.style.zIndex = '1';
    this.continueButton.appendChild(highlight);

    // 컨텐츠 컨테이너
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'relative z-[2] flex flex-col items-center justify-center gap-3';

    const icon = document.createElement('i');
    icon.className = 'ph-fill ph-play-circle text-5xl text-white';
    icon.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))';

    const text = document.createElement('span');
    text.className = 'text-white font-bold text-sm px-4 text-center leading-tight';
    text.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.4)';
    text.textContent = '광고보고 이어하기';

    // 타이머 표시
    this.timerText = document.createElement('span');
    this.timerText.className = 'text-white font-black text-3xl font-russo';
    this.timerText.textContent = this.timeoutSeconds.toString();

    // 퍼센트 표시 (작게)
    this.percentageText = document.createElement('span');
    this.percentageText.className = 'text-white/60 font-semibold text-xs';
    this.percentageText.textContent = '';

    contentWrapper.appendChild(icon);
    contentWrapper.appendChild(text);
    contentWrapper.appendChild(this.timerText);
    contentWrapper.appendChild(this.percentageText);
    this.continueButton.appendChild(contentWrapper);

    this.addPressEffect(this.continueButton);

    this.continueButton.addEventListener('click', () => {
      this.stopTimer();
      this.close();
      this.callbacks.onContinue?.();
    });

    wrapper.appendChild(svg);
    wrapper.appendChild(this.continueButton);

    return wrapper;
  }

  /**
   * 포기하기 버튼 생성
   */
  private createGiveUpButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `
      px-16 py-4 rounded-full
      backdrop-blur-sm
      text-white font-bold text-lg
      transition-all duration-150
      relative overflow-hidden
    `.trim().replace(/\s+/g, ' ');

    // 스타일 적용 (GameOverModal의 다시하기 버튼과 동일)
    button.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)';
    button.style.border = '2px solid rgba(255, 255, 255, 0.4)';
    button.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 8px rgba(0, 0, 0, 0.2)';

    // 하이라이트 레이어
    const highlight = document.createElement('div');
    highlight.className = 'absolute inset-0 rounded-full pointer-events-none';
    highlight.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 60%)';
    highlight.style.zIndex = '1';

    // 아이콘과 텍스트 컨테이너 (GameOverModal 스타일)
    const content = document.createElement('div');
    content.className = 'relative z-[2] flex items-center gap-2';
    content.innerHTML = `
      <i class="ph-fill ph-x-circle text-2xl"></i>
      <span>포기하기</span>
    `;

    button.appendChild(highlight);
    button.appendChild(content);

    // 아이콘에 필터 적용
    const icon = content.querySelector('i');
    if (icon) {
      (icon as HTMLElement).style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))';
      (icon as HTMLElement).style.transition = 'transform 0.15s ease';
    }

    // 클릭 효과 (GameOverModal과 동일)
    button.addEventListener('pointerdown', () => {
      button.style.transform = 'scale(0.95)';
      button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 4px 12px rgba(0, 0, 0, 0.4)';
      if (icon) {
        (icon as HTMLElement).style.transform = 'scale(0.85)';
      }
    });
    button.addEventListener('pointerup', () => {
      button.style.transform = '';
      button.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 8px rgba(0, 0, 0, 0.2)';
      if (icon) {
        (icon as HTMLElement).style.transform = '';
      }
    });
    button.addEventListener('pointercancel', () => {
      button.style.transform = '';
      button.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 8px rgba(0, 0, 0, 0.2)';
      if (icon) {
        (icon as HTMLElement).style.transform = '';
      }
    });

    this.addPressEffect(button);

    button.addEventListener('click', () => {
      this.stopTimer();
      this.close();
      this.callbacks.onGiveUp?.();
    });

    return button;
  }

  /**
   * 타이머 시작
   */
  private startTimer(): void {
    this.startTime = Date.now();
    const duration = this.timeoutSeconds * 1000;
    const size = 200;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const updateProgress = () => {
      if (!this.startTime) return;

      const elapsed = Date.now() - this.startTime;
      const progress = Math.min(elapsed / duration, 1);
      const remaining = Math.max(0, this.timeoutSeconds - elapsed / 1000);

      // 진행바 업데이트 (시계방향으로 진행)
      const offset = circumference * progress;
      this.progressCircle.setAttribute('stroke-dashoffset', offset.toString());

      // 타이머 텍스트 업데이트 (남은 시간)
      this.timerText.textContent = Math.ceil(remaining).toString();

      // 색상 변화 (버튼 배경 + 진행바 + 텍스트 모두)
      if (remaining <= 1) {
        // 레드 단계 (부드러운 레드)
        this.continueButton.style.background = 'linear-gradient(135deg, #ff7b7b 0%, #ff6b6b 50%, #ff5252 100%)';
        this.continueButton.style.borderColor = 'rgba(255, 107, 107, 0.8)';
        this.continueButton.style.boxShadow = '0 12px 32px rgba(255, 82, 82, 0.6), 0 0 40px rgba(255, 107, 107, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 8px rgba(0, 0, 0, 0.2)';
        this.progressCircle.setAttribute('stroke', '#ffffff');
        this.timerText.style.color = '#ffffff';
      } else if (remaining <= 2) {
        // 오렌지-레드 중간 단계
        this.continueButton.style.background = 'linear-gradient(135deg, #ff8c5a 0%, #ff7043 50%, #ff5722 100%)';
        this.continueButton.style.borderColor = 'rgba(255, 112, 67, 0.8)';
        this.continueButton.style.boxShadow = '0 12px 32px rgba(255, 87, 34, 0.6), 0 0 40px rgba(255, 112, 67, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 8px rgba(0, 0, 0, 0.2)';
        this.progressCircle.setAttribute('stroke', '#ffffff');
        this.timerText.style.color = '#ffffff';
      } else if (remaining <= 3) {
        // 오렌지 단계
        this.continueButton.style.background = 'linear-gradient(135deg, #ffa500 0%, #ff8c00 50%, #ff6b35 100%)';
        this.continueButton.style.borderColor = 'rgba(255, 140, 0, 0.8)';
        this.continueButton.style.boxShadow = '0 12px 32px rgba(255, 140, 0, 0.6), 0 0 40px rgba(255, 165, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 8px rgba(0, 0, 0, 0.2)';
        this.progressCircle.setAttribute('stroke', '#ffffff');
        this.timerText.style.color = '#ffffff';
      } else {
        // 노랑 단계 (기본)
        this.progressCircle.setAttribute('stroke', '#ffffff');
        this.timerText.style.color = '#ffffff';
      }

      // 버튼 펄스 애니메이션 (마지막 3초) - 더 강한 효과
      if (remaining <= 3 && remaining > 0) {
        const pulseScale = 1 + Math.sin(elapsed * 0.008) * 0.08;
        this.continueButton.style.transform = `scale(${pulseScale})`;
      }

      if (progress >= 1) {
        // 타임아웃
        this.stopTimer();
        this.close();
        this.callbacks.onTimeout?.();
        return;
      }

      // requestAnimationFrame으로 계속 실행
      this.animationFrameId = requestAnimationFrame(updateProgress);
    };

    // requestAnimationFrame으로 부드러운 애니메이션 (브라우저 렌더링 사이클과 동기화)
    this.animationFrameId = requestAnimationFrame(updateProgress);

    // Fallback: 모바일 절전 모드에서 requestAnimationFrame이 throttling될 경우를 대비
    // 1초마다 강제로 업데이트하여 최소한의 정확도 보장
    this.fallbackInterval = window.setInterval(() => {
      if (this.startTime) {
        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, this.timeoutSeconds - elapsed / 1000);
        this.timerText.textContent = Math.ceil(remaining).toString();
      }
    }, 1000);
  }

  /**
   * 타이머 중지
   */
  private stopTimer(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = undefined;
    }
    this.startTime = undefined;
  }

  /**
   * 타이머 리셋
   */
  private resetTimer(): void {
    this.stopTimer();

    // 노랑 초기 상태로 리셋
    this.continueButton.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffb800 25%, #ffa500 50%, #ff8c00 75%, #ff6b35 100%)';
    this.continueButton.style.borderColor = 'rgba(255, 193, 7, 0.8)';
    this.continueButton.style.boxShadow = '0 12px 32px rgba(255, 140, 0, 0.5), 0 0 30px rgba(255, 193, 7, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 8px rgba(0, 0, 0, 0.2)';
    this.progressCircle.setAttribute('stroke-dashoffset', '0');
    this.progressCircle.setAttribute('stroke', '#ffffff');
    this.timerText.textContent = this.timeoutSeconds.toString();
    this.timerText.style.color = '#ffffff';
    this.percentageText.textContent = '';
    this.continueButton.style.transform = '';
  }

  /**
   * 모달 열린 후 타이머 시작
   */
  protected onAfterOpen(): void {
    this.startTimer();
  }

  /**
   * 모달 열리기 전 광고 로드 시작
   */
  protected onBeforeOpen(): void {
    if (this.callbacks.onBeforeOpen) {
      this.callbacks.onBeforeOpen();
    }
  }

  /**
   * 모달 닫히기 전 타이머 중지
   */
  protected onBeforeClose(): void {
    this.stopTimer();
  }

  /**
   * 모달 닫힌 후 타이머 리셋
   */
  protected onAfterClose(): void {
    this.resetTimer();
  }

  /**
   * 정리
   */
  destroy(): void {
    this.stopTimer();
    super.destroy();
  }
}
