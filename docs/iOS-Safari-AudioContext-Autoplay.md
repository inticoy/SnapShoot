# iOS Safari AudioContext Autoplay Policy 문제 해결

## 문제 개요

### 증상
- **Chrome/Desktop Safari**: 로딩 화면에서 스와이프 시 소리가 정상적으로 재생됨
- **iOS Mobile Safari**:
  - 로딩 화면에서 스와이프 → ❌ 소리 없음
  - 로딩 화면에서 탭 → ✅ 소리 재생됨
  - 인게임에서 2-3골 넣은 후 → ✅ 소리 재생됨 (우연히 탭이 발생)

### 근본 원인
**iOS Safari는 스와이프 제스처를 AudioContext unlock을 위한 유효한 사용자 제스처로 인정하지 않습니다.**

---

## 기술적 배경

### Safari Autoplay Policy
- Safari는 사용자 제스처 없이 오디오 자동 재생을 차단합니다
- `AudioContext`는 기본적으로 `suspended` 상태로 시작됩니다
- 사용자 제스처 내에서 `audioContext.resume()` 또는 오디오 재생을 호출해야 `running` 상태로 전환됩니다

### iOS Safari의 유효한 사용자 제스처
✅ **인정되는 제스처:**
- `click`
- `touchend` (단, `touchmove` 이후가 **아닌** 경우)
- `pointerup` (단, `pointermove` 이후가 **아닌** 경우)
- `mouseup`
- `keydown`

❌ **인정되지 않는 제스처:**
- `touchstart`
- `pointerdown`
- `touchmove` 후의 `touchend` (스와이프)
- `pointermove` 후의 `pointerup` (스와이프)
- capture phase에서의 이벤트 핸들러
- `preventDefault()` 호출 후의 제스처

---

## 시도한 해결 방법들

### 1차 시도: async/await로 AudioContext unlock ❌

**코드:**
```typescript
async unlockAudioContext(): Promise<void> {
  const context = this.getContext();
  if (context.state === 'suspended') {
    await context.resume();
  }
}
```

**실패 원인:**
- iOS는 AudioContext unlock이 **동기적 콜스택** 내에서 이루어져야 함
- `async/await`은 Promise를 사용하여 비동기로 실행되므로 사용자 제스처의 콜스택에서 벗어남

**로그:**
```
[Log] 🔓 AudioContext unlocking...
[Log] ✅ AudioContext unlocked, state: "suspended"  ← 여전히 suspended!
```

---

### 2차 시도: touchend 이벤트 사용 ❌

**코드:**
```typescript
canvas.addEventListener('touchend', () => {
  this.audio.unlockAudioContext();
});
```

**실패 원인:**
- 스와이프 동작은 `touchstart` → `touchmove` → `touchend` 순서로 발생
- `touchmove`가 발생한 후의 `touchend`는 iOS가 유효한 사용자 제스처로 인정하지 않음
- 탭 동작(`touchstart` → `touchend`, touchmove 없음)은 작동함

---

### 3차 시도: 동기 방식 + 빈 버퍼 재생 ❌

**코드:**
```typescript
unlockAudioContext(): void {
  const context = this.getContext();
  if (context.state === 'suspended') {
    // 빈 버퍼 재생으로 강제 unlock
    const buffer = context.createBuffer(1, 1, 22050);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
  }
}
```

**실패 원인:**
- 동기 방식으로 변경했지만 여전히 스와이프 시 실패
- 빈 버퍼 재생도 유효한 사용자 제스처 내에서만 작동함

---

### 4차 시도: Capture Phase에서 이벤트 처리 ❌

**코드:**
```typescript
canvas.addEventListener('touchstart', unlockHandler, { capture: true });
```

**실패 원인:**
- iOS는 capture phase에서 실행된 핸들러도 유효한 사용자 제스처로 인정하지 않음
- 로그에서 `isTrusted: true`였지만 `state: "suspended"` 유지됨

---

### 5차 시도: SwipeTracker 내부에서 preventDefault() 전에 unlock ❌

**코드:**
```typescript
// SwipeTracker.ts - handlePointerDown()
private handlePointerDown(e: PointerEvent) {
  // preventDefault() 전에 unlock 시도
  if (!this.hasTriggeredFirstTouch && this.onFirstTouch) {
    this.onFirstTouch();  // AudioContext unlock
    this.hasTriggeredFirstTouch = true;
  }

  e.preventDefault();  // 그 다음 preventDefault
  // ...
}
```

**실패 원인:**
- `pointerdown`은 iOS에서 AudioContext unlock을 위한 유효한 제스처가 아님
- `preventDefault()` 전후와 무관하게 실패

---

### 6차 시도: 별도 touchend 리스너 (preventDefault 없이) ❌

**코드:**
```typescript
// SwipeTracker와 독립적인 touchend 리스너
canvas.addEventListener('touchend', () => {
  this.audio.unlockAudioContext();
}, { once: true, passive: true });
```

**실패 원인:**
- SwipeTracker가 `pointerdown`과 `pointermove`에서 `preventDefault()`를 호출
- 이미 제스처가 무효화된 상태에서 `touchend`가 발생
- iOS는 이를 유효하지 않은 제스처로 간주

**로그:**
```
[Log] 🎵 touchend로 AudioContext unlock 시도
[Log] 🔓 AudioContext unlocking...
[Log] ✅ AudioContext unlocked via dummy buffer, state: "suspended"  ← 여전히 실패!
```

---

## 최종 해결 방법 ✅

### 핵심 인사이트

웹 검색을 통해 확인한 결과:
> **"The touchend event works for enabling audio autoplay when fired after a click, but not after a touchmove."**
>
> **"Swipe/touchmove gestures cannot be used as a workaround for iOS Safari's autoplay restrictions. You'll need to capture an actual click/tap event first."**

**결론**: iOS Safari에서 스와이프로는 AudioContext를 unlock할 수 없습니다. 반드시 **순수한 탭(tap)** 제스처가 필요합니다.

### 해결 방법: "탭해서 시작" UI 단계 추가

**변경 전 플로우:**
```
로딩 100% → 축구공 페이드인 → 스와이프로 게임 진입
```

**변경 후 플로우:**
```
로딩 100% → "👆 탭해서 시작" → [탭] → AudioContext unlock → 축구공 페이드인 → 스와이프로 게임 진입
```

### 구현 코드

#### 1. "탭해서 시작" UI 생성

```typescript
// LoadingScreen.ts
private createTapToStartUI(): HTMLDivElement {
  const tapContainer = document.createElement('div');
  tapContainer.className = LoadingScreen.CLASS_NAMES.tapToStartContainer;

  const icon = document.createElement('div');
  icon.textContent = '👆';

  const text = document.createElement('div');
  text.textContent = '탭해서 시작';

  tapContainer.appendChild(icon);
  tapContainer.appendChild(text);
  return tapContainer;
}
```

#### 2. 탭 이벤트 핸들러

```typescript
// LoadingScreen.ts
private setupTapToStart(): void {
  if (!this.tapToStartContainer) return;

  const handleTap = (e: Event) => {
    if (this.hasUnlockedAudio) return;

    console.log('🎵 탭으로 AudioContext unlock 시도', e.type);

    // AudioContext unlock (동기 방식)
    if (this.audio) {
      this.audio.unlockAudioContext();
    }

    this.hasUnlockedAudio = true;

    // "탭해서 시작" UI 숨기기
    if (this.tapToStartContainer) {
      this.tapToStartContainer.style.opacity = '0';
      // 이벤트 리스너 제거 (중복 방지)
      this.tapToStartContainer.removeEventListener('click', handleTap);
      this.tapToStartContainer.removeEventListener('touchend', handleTap);
    }

    // 0.5초 후 축구공 페이드인
    setTimeout(() => {
      this.showSoccerBall();
    }, 500);
  };

  // 모바일: touchend와 click 모두 등록
  this.tapToStartContainer.addEventListener('touchend', handleTap);
  this.tapToStartContainer.addEventListener('click', handleTap);
}
```

#### 3. CSS 클래스 (중요: z-index)

```typescript
static readonly CLASS_NAMES = {
  // z-[37]: swipeCanvas(z-[36])보다 위에 위치하여 터치 가로막힘 방지
  tapToStartContainer: 'loading-screen__tap-to-start absolute left-1/2 bottom-[10vh] -translate-x-1/2 flex flex-col items-center gap-4 opacity-0 transition-opacity duration-500 z-[37] cursor-pointer',
  tapToStartText: 'text-[24px] font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.3)] animate-pulse',
  tapToStartIcon: 'text-[48px]',

  // swipeCanvas는 z-[36]
  swipeCanvas: 'loading-screen__swipe-canvas fixed inset-0 z-[36] touch-none pointer-events-auto',
};
```

#### 4. AudioContext unlock 구현

```typescript
// Audio.ts
unlockAudioContext(): void {
  const context = this.getContext();
  if (context.state === 'suspended') {
    console.log('🔓 AudioContext unlocking...');

    try {
      // 빈 버퍼 재생으로 unlock (Stack Overflow 검증된 방법)
      const buffer = context.createBuffer(1, 1, 22050);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(0);

      console.log('✅ AudioContext unlocked via dummy buffer, state:', context.state);
    } catch (error) {
      console.warn('❌ AudioContext unlock failed:', error);
    }
  } else {
    console.log('ℹ️ AudioContext already running, state:', context.state);
  }
}
```

---

## 주요 트러블슈팅 포인트

### 문제 1: "탭해서 시작" 터치가 인식되지 않음

**원인:**
- `swipeCanvas`의 z-index(36)가 `tapToStartContainer`의 z-index(35)보다 높아 터치를 가로막음

**해결:**
```typescript
// tapToStartContainer의 z-index를 37로 상향
tapToStartContainer: '... z-[37] ...'
```

### 문제 2: 일부 모바일 기기에서 click 이벤트 미작동

**원인:**
- iOS에서는 `touchend` 이벤트가 더 확실하게 작동할 수 있음

**해결:**
```typescript
// touchend와 click 모두 등록
this.tapToStartContainer.addEventListener('touchend', handleTap);
this.tapToStartContainer.addEventListener('click', handleTap);

// 중복 호출 방지
const handleTap = (e: Event) => {
  if (this.hasUnlockedAudio) return;
  // ... unlock logic
  this.hasUnlockedAudio = true;

  // 두 이벤트 리스너 모두 제거
  this.tapToStartContainer.removeEventListener('click', handleTap);
  this.tapToStartContainer.removeEventListener('touchend', handleTap);
};
```

---

## 성공 로그

```
[Log] 🎵 탭으로 AudioContext unlock 시도 touchend
[Log] 🔓 AudioContext unlocking...
[Log] ✅ AudioContext unlocked via dummy buffer, state: "running"  ← 성공!
```

---

## 참고 자료

### Stack Overflow 답변
- [iOS Safari not unlocking Web AudioContext on swipe](https://stackoverflow.com/questions/37986154/ios-safari-not-unlocking-web-audiocontext-on-swipe)
  - **핵심 인용**: "When a callback is triggered by a quick swipe on the screen rather than a tap, the AudioContext state remains 'suspended' even after executing the unlock code."

- [Unlock JavaScript Web Audio in Safari](https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos)

- [Unlocking Web Audio — the smarter way](https://hackernoon.com/unlocking-web-audio-the-smarter-way-8858218c0e09)

### 핵심 학습 내용

1. **iOS는 스와이프를 유효한 오디오 제스처로 인정하지 않음**
   - 이는 사용자 경험을 위한 의도적 정책
   - 스크롤/스와이프 중 갑작스런 오디오 재생 방지

2. **유일한 해결책은 순수한 탭/클릭 요구**
   - "Start" 버튼
   - "Tap to continue"
   - 또는 다른 명시적 탭 인터랙션

3. **동기 방식 + 유효한 제스처 = 성공**
   - `async/await` 사용 금지
   - capture phase 금지
   - `preventDefault()` 전에 호출해도 `pointerdown`은 무효

4. **레이어링 주의**
   - 터치 타겟의 z-index가 다른 요소보다 높아야 함
   - `pointer-events` 설정 확인 필요

---

## 결론

iOS Safari의 AudioContext autoplay policy는 매우 엄격하며, 스와이프 제스처로는 우회할 수 없습니다.
유일한 해결책은 **명시적인 탭/클릭 인터랙션**을 UX 플로우에 추가하는 것입니다.

이는 제약이 아니라 더 나은 사용자 경험을 위한 기회로 활용할 수 있습니다:
- 명확한 게임 시작 의식 (ceremonial start)
- 사용자에게 사운드 활성화에 대한 명시적 동의 획득
- 접근성 향상 (사용자가 오디오를 원하지 않을 수 있음)
