/**
 * GameOverModal - 게임오버 모달 (2단계)
 *
 * 기능:
 * - 점수 표시
 * - 랭킹보기, 테마변경, 공유하기 버튼
 * - 다시하기 버튼
 */

import { BaseModal } from './BaseModal';
import { ViewManager } from '../ViewManager';
import { createCustomizeView } from '../views/CustomizeView';

export interface GameOverModalCallbacks {
  onRestart?: () => void;
  onShare?: () => void;
  onRanking?: () => void;
  onSelectTheme?: (themeName: string) => void;
}

/**
 * 공유 메시지 템플릿
 */
const SHARE_MESSAGES = [
  '스냅슛⚽️ {score}점! 따라올테면 따라와봐~!\n\n따라가기... 👇',
  '스냅슛⚽️ {score}점! 넌 나한테 안 되지...\n\n도전은 웰컴이야~ 👇',
  '오늘 에임 미쳤다... 스냅슛⚽️ {score}점 나옴...\n\n나도 슈팅하기 👇',
  '푸스카스급 감차가능ㅋㅋ 스냅슛⚽️ {score}점 찍음!\n\n푸스카스상 받기 👇'
] as const;

/**
 * 랜덤 공유 메시지 생성
 */
export function getRandomShareMessage(score: number): string {
  const randomIndex = Math.floor(Math.random() * SHARE_MESSAGES.length);
  const template = SHARE_MESSAGES[randomIndex];
  return template.replace('{score}', score.toLocaleString('ko-KR'));
}

export class GameOverModal extends BaseModal {
  private callbacks: GameOverModalCallbacks;
  private score: number;
  private viewManager!: ViewManager;
  private titleEl!: HTMLDivElement;
  private backButton!: HTMLButtonElement;
  private gameOverView!: HTMLDivElement;
  private customizeView!: HTMLDivElement;

  constructor(
    container: HTMLElement,
    score: number,
    callbacks: GameOverModalCallbacks = {}
  ) {
    super({
      closeOnEsc: false,      // ESC로 닫기 비활성화
      closeOnBackdrop: false, // 배경 클릭으로 닫기 비활성화
      containerElement: container
    });

    this.callbacks = callbacks;
    this.score = score;

    this.createModalContent();
  }

  /**
   * 모달 컨텐츠 생성
   */
  private createModalContent(): void {
    // Title Container
    const titleContainer = document.createElement('div');
    titleContainer.className = 'w-full flex items-center justify-center pointer-events-none py-4 pb-8';

    this.titleEl = document.createElement('div');
    this.titleEl.className = 'font-russo text-white tracking-tight font-black';
    this.titleEl.style.fontSize = 'clamp(32px, 6vw, 48px)';
    this.titleEl.textContent = 'GAME OVER';
    titleContainer.appendChild(this.titleEl);

    // Content Area
    const contentArea = document.createElement('div');
    contentArea.className = 'flex-auto flex flex-col items-center w-full px-6';

    // Back Button
    this.backButton = this.createBackButton();

    // Views
    this.gameOverView = this.createGameOverView();
    this.customizeView = this.createCustomizeView();

    // 초기에는 gameOver view만 보임
    this.customizeView.classList.add('hidden');

    contentArea.appendChild(this.gameOverView);
    contentArea.appendChild(this.customizeView);

    this.content.appendChild(this.backButton);
    this.content.appendChild(titleContainer);
    this.content.appendChild(contentArea);

    // ViewManager 초기화
    this.viewManager = new ViewManager(this.titleEl, this.backButton);
    this.viewManager.registerView('gameOver', {
      element: this.gameOverView,
      title: 'GAME OVER',
      showBackButton: false
    });
    this.viewManager.registerView('customize', {
      element: this.customizeView,
      title: '테마 변경',
      showBackButton: true
    });

    this.viewManager.setOnBack(() => this.viewManager.switchTo('gameOver'));
    this.viewManager.switchTo('gameOver');
  }

  /**
   * Back Button 생성
   */
  private createBackButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = `
      hidden
      absolute z-[40] pointer-events-auto
      flex items-center justify-center
      text-white/90
      transition-all duration-150
      hover:text-white
    `.trim().replace(/\s+/g, ' ');
    button.style.top = 'calc(env(safe-area-inset-top, 0px) + 16px)';
    button.style.left = 'calc(env(safe-area-inset-left, 0px) + 16px)';
    button.style.width = '40px';
    button.style.height = '40px';
    button.type = 'button';
    button.innerHTML = '<i class="ph ph-arrow-left text-3xl"></i>';

    this.addPressEffect(button);
    return button;
  }

  /**
   * Game Over View 생성
   */
  private createGameOverView(): HTMLDivElement {
    const view = document.createElement('div');
    view.className = 'flex-1 flex flex-col items-center justify-between w-full max-w-lg pt-[2vh] pb-[8vh] gap-4';

    // 상단 콘텐츠 컨테이너
    const topContent = document.createElement('div');
    topContent.className = 'flex flex-col items-center w-full gap-4';

    // 점수 표시
    const scoreWrapper = document.createElement('div');
    scoreWrapper.className = `
      flex flex-col items-center gap-2 py-4
      animate-fade-in
    `.trim().replace(/\s+/g, ' ');

    const scoreLabel = document.createElement('div');
    scoreLabel.className = 'text-white/70 font-semibold text-sm uppercase tracking-wider';
    scoreLabel.textContent = '최종 점수';

    const scoreValue = document.createElement('div');
    scoreValue.className = 'text-white font-russo font-black tracking-tight drop-shadow-lg';
    scoreValue.style.fontSize = 'clamp(48px, 10vw, 72px)';
    scoreValue.textContent = this.score.toString();

    scoreWrapper.appendChild(scoreLabel);
    scoreWrapper.appendChild(scoreValue);

    // 상단 3개 버튼 (랭킹, 테마, 공유)
    const topButtonsWrapper = document.createElement('div');
    topButtonsWrapper.className = 'flex gap-4 w-full justify-center mb-8';

    const rankingButton = this.createSquareIconButton(
      'gameover-ranking-btn',
      `<i class="ph-fill ph-ranking text-4xl text-white"></i>`,
      '랭킹보기',
      'ranking'
    );
    const customizeButton = this.createSquareIconButton(
      'gameover-customize-btn',
      `<i class="ph-fill ph-palette text-4xl text-white"></i>`,
      '테마 변경',
      'theme'
    );
    const shareButton = this.createSquareIconButton(
      'gameover-share-btn',
      `<i class="ph-fill ph-share-network text-4xl text-white"></i>`,
      '공유하기',
      'share'
    );

    this.addPressEffect(rankingButton);
    this.addPressEffect(customizeButton);
    this.addPressEffect(shareButton);

    rankingButton.addEventListener('click', () => {
      console.log('랭킹보기 버튼 클릭');
      this.callbacks.onRanking?.();
      // TODO: 랭킹 화면 표시 로직
    });

    customizeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.viewManager.switchTo('customize');
    });

    shareButton.addEventListener('click', () => {
      console.log('공유하기 버튼 클릭');
      this.callbacks.onShare?.();
      // TODO: 공유 로직 구현
    });

    topButtonsWrapper.appendChild(rankingButton);
    topButtonsWrapper.appendChild(customizeButton);
    topButtonsWrapper.appendChild(shareButton);

    // 하단 버튼 (다시하기)
    const bottomButtonsWrapper = document.createElement('div');
    bottomButtonsWrapper.className = 'flex items-center justify-center w-full';

    const restartButton = document.createElement('button');
    restartButton.type = 'button';
    restartButton.className = `
      flex items-center gap-2
      px-16 py-4 rounded-full
      backdrop-blur-sm
      text-white font-bold text-lg
      transition-all duration-150
      relative overflow-hidden
    `.trim().replace(/\s+/g, ' ');

    // 스타일 적용
    restartButton.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)';
    restartButton.style.border = '2px solid rgba(255, 255, 255, 0.4)';
    restartButton.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 8px rgba(0, 0, 0, 0.2)';

    // 하이라이트 레이어
    const highlight = document.createElement('div');
    highlight.className = 'absolute inset-0 rounded-full pointer-events-none';
    highlight.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 60%)';
    highlight.style.zIndex = '1';

    // 아이콘과 텍스트 컨테이너
    const content = document.createElement('div');
    content.className = 'relative z-[2] flex items-center gap-2';
    content.innerHTML = `
      <i class="ph-fill ph-arrow-clockwise text-2xl"></i>
      <span>다시하기</span>
    `;

    restartButton.appendChild(highlight);
    restartButton.appendChild(content);

    // 아이콘에 필터 적용
    const icon = content.querySelector('i');
    if (icon) {
      (icon as HTMLElement).style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))';
      (icon as HTMLElement).style.transition = 'transform 0.15s ease';
    }

    // 클릭 효과
    restartButton.addEventListener('pointerdown', () => {
      restartButton.style.transform = 'scale(0.95)';
      restartButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 4px 12px rgba(0, 0, 0, 0.4)';
      if (icon) {
        (icon as HTMLElement).style.transform = 'scale(0.85)';
      }
    });
    restartButton.addEventListener('pointerup', () => {
      restartButton.style.transform = '';
      restartButton.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 8px rgba(0, 0, 0, 0.2)';
      if (icon) {
        (icon as HTMLElement).style.transform = '';
      }
    });
    restartButton.addEventListener('pointercancel', () => {
      restartButton.style.transform = '';
      restartButton.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -3px 8px rgba(0, 0, 0, 0.2)';
      if (icon) {
        (icon as HTMLElement).style.transform = '';
      }
    });

    this.addPressEffect(restartButton);

    restartButton.addEventListener('click', () => {
      console.log('다시하기 버튼 클릭');
      this.close();
      this.callbacks.onRestart?.();
    });

    bottomButtonsWrapper.appendChild(restartButton);

    // 레이아웃 구성
    topContent.appendChild(scoreWrapper);
    topContent.appendChild(topButtonsWrapper);
    view.appendChild(topContent);
    view.appendChild(bottomButtonsWrapper);

    return view;
  }

  /**
   * Customize View 생성
   */
  private createCustomizeView(): HTMLDivElement {
    return createCustomizeView({
      onSelectTheme: (themeName: string) => {
        this.callbacks.onSelectTheme?.(themeName);
      },
      onPressEffect: (button: HTMLButtonElement) => {
        this.addPressEffect(button);
      }
    });
  }

  /**
   * 점수 업데이트 (모달이 열리기 전에 호출 가능)
   */
  updateScore(score: number): void {
    this.score = score;
    // gameOverView의 점수 텍스트 업데이트
    const scoreValue = this.gameOverView.querySelector('.font-russo');
    if (scoreValue) {
      scoreValue.textContent = score.toString();
    }
  }

  /**
   * 현재 점수 가져오기
   */
  getScore(): number {
    return this.score;
  }

  /**
   * 모달 열린 후 처리
   */
  protected onAfterOpen(): void {
    // Game Over 뷰로 리셋
    this.viewManager.switchTo('gameOver');
  }

  /**
   * 모달 닫힌 후 처리
   */
  protected onAfterClose(): void {
    // Game Over 뷰로 리셋
    this.viewManager.switchTo('gameOver');
  }
}
