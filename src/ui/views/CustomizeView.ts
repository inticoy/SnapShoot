/**
 * CustomizeView - 테마 변경 뷰 (재사용 가능)
 *
 * PauseModal과 GameOverModal에서 공통으로 사용
 */

import { BALL_THEMES } from '../../config/Ball';
import { gameStateService } from '../../core/GameStateService';

export interface CustomizeViewCallbacks {
  onSelectTheme?: (themeName: string) => void;
  onPressEffect?: (button: HTMLButtonElement) => void;
}

/**
 * 자물쇠 아이콘 SVG 생성
 */
function createLockIcon(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.style.width = '24px';
  svg.style.height = '24px';

  // 자물쇠 몸통
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '5');
  rect.setAttribute('y', '11');
  rect.setAttribute('width', '14');
  rect.setAttribute('height', '10');
  rect.setAttribute('rx', '2');

  // 자물쇠 고리
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M7 11V7a5 5 0 0 1 10 0v4');

  svg.appendChild(rect);
  svg.appendChild(path);

  return svg;
}

export function createCustomizeView(callbacks: CustomizeViewCallbacks = {}): HTMLDivElement {
  const view = document.createElement('div');
  view.className = 'w-full max-w-md flex flex-col gap-6 pb-6';

  const ballThemeSection = document.createElement('div');
  ballThemeSection.className = 'flex flex-col gap-4';

  const sectionTitle = document.createElement('h3');
  sectionTitle.className = 'text-white/90 font-semibold text-lg';
  sectionTitle.textContent = '볼 테마';
  ballThemeSection.appendChild(sectionTitle);

  const themeGrid = document.createElement('div');
  themeGrid.className = 'grid grid-cols-3 gap-4';

  const themes = [
    { name: BALL_THEMES.BASIC.name, image: BALL_THEMES.BASIC.imageUrl, unlockScore: BALL_THEMES.BASIC.unlockScore },
    { name: BALL_THEMES.BASKETBALL.name, image: BALL_THEMES.BASKETBALL.imageUrl, unlockScore: BALL_THEMES.BASKETBALL.unlockScore },
    { name: BALL_THEMES.VOLLEYBALL.name, image: BALL_THEMES.VOLLEYBALL.imageUrl, unlockScore: BALL_THEMES.VOLLEYBALL.unlockScore },
    { name: BALL_THEMES.SUN.name, image: BALL_THEMES.SUN.imageUrl, unlockScore: BALL_THEMES.SUN.unlockScore },
    { name: BALL_THEMES.MOON.name, image: BALL_THEMES.MOON.imageUrl, unlockScore: BALL_THEMES.MOON.unlockScore },
    { name: BALL_THEMES.EARTH.name, image: BALL_THEMES.EARTH.imageUrl, unlockScore: BALL_THEMES.EARTH.unlockScore },
    { name: BALL_THEMES.BEACHBALL.name, image: BALL_THEMES.BEACHBALL.imageUrl, unlockScore: BALL_THEMES.BEACHBALL.unlockScore },
    { name: BALL_THEMES.MONSTERBALL.name, image: BALL_THEMES.MONSTERBALL.imageUrl, unlockScore: BALL_THEMES.MONSTERBALL.unlockScore },
    { name: BALL_THEMES.WORLDCUP2010.name, image: BALL_THEMES.WORLDCUP2010.imageUrl, unlockScore: BALL_THEMES.WORLDCUP2010.unlockScore },
  ];

  themes.forEach((theme) => {
    const isUnlocked = gameStateService.isThemeUnlocked(theme.unlockScore);

    // 버튼 컨테이너 (상대 위치 지정을 위해)
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'relative aspect-square';

    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.theme = theme.name;
    button.className = `
      w-full h-full rounded-full
      bg-white/12 border-2 border-white/15
      shadow-[0_4px_12px_rgba(0,0,0,0.2)]
      transition-all duration-150
      ${isUnlocked ? 'hover:bg-white/16 hover:border-white/30 hover:shadow-[0_6px_16px_rgba(0,0,0,0.3)] active:bg-white/10 active:shadow-[0_2px_6px_rgba(0,0,0,0.2)]' : 'cursor-not-allowed'}
      flex items-center justify-center
      overflow-hidden
      p-2
    `.trim().replace(/\s+/g, ' ');

    const img = document.createElement('img');
    img.src = theme.image;
    img.alt = theme.name;
    img.className = `w-full h-full object-contain ${isUnlocked ? '' : 'opacity-30'}`;

    button.appendChild(img);

    // 잠금 오버레이 추가 (잠긴 테마인 경우)
    if (!isUnlocked) {
      const lockOverlay = document.createElement('div');
      lockOverlay.className = `
        absolute inset-0 rounded-full
        bg-black/40
        flex flex-col items-center justify-center
        pointer-events-none
        gap-1
      `.trim().replace(/\s+/g, ' ');

      const lockIcon = createLockIcon();
      lockIcon.style.color = 'white';
      lockIcon.style.opacity = '0.9';
      lockIcon.style.marginBottom = '2px';

      const lockText = document.createElement('div');
      lockText.className = 'text-white/90 text-xs font-semibold text-center px-2 leading-tight';
      lockText.textContent = `${theme.unlockScore}골 달성 시`;

      const unlockText = document.createElement('div');
      unlockText.className = 'text-white/80 text-[10px] text-center px-2';
      unlockText.textContent = '잠금해제';

      lockOverlay.appendChild(lockIcon);
      lockOverlay.appendChild(lockText);
      lockOverlay.appendChild(unlockText);
      buttonContainer.appendChild(button);
      buttonContainer.appendChild(lockOverlay);
    } else {
      buttonContainer.appendChild(button);
    }

    themeGrid.appendChild(buttonContainer);

    // Press 효과 (잠금 해제된 경우만)
    if (isUnlocked && callbacks.onPressEffect) {
      callbacks.onPressEffect(button);
    }

    // 클릭 이벤트 (잠금 해제된 경우만)
    button.addEventListener('click', () => {
      if (isUnlocked && callbacks.onSelectTheme) {
        callbacks.onSelectTheme(theme.name);
      }
    });
  });

  ballThemeSection.appendChild(themeGrid);
  view.appendChild(ballThemeSection);

  return view;
}
