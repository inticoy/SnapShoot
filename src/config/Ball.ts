import { PHYSICS_LINEAR_DAMPING } from '../physics/Constants';
import type { SoundKey } from './Audio';
import { getAssetPath } from '../utils/assetPath';

const basicBallModel = getAssetPath('/assets/ball/basic.glb');
const moonBallModel = getAssetPath('/assets/ball/moon.glb');
const basketBallModel = getAssetPath('/assets/ball/basketball.glb');
const volleyBallModel = getAssetPath('/assets/ball/volleyball.glb');
const earthBallModel = getAssetPath('/assets/ball/earth.glb');
const worldCup2010BallModel = getAssetPath('/assets/ball/worldcup2010.glb');
const beachBallModel = getAssetPath('/assets/ball/beachball.glb');
const monsterBallModel = getAssetPath('/assets/ball/monsterball.glb');
const sunBallModel = getAssetPath('/assets/ball/sun.glb');

const basicBallImage = getAssetPath('/assets/ball/basic.png');
const moonBallImage = getAssetPath('/assets/ball/moon.png');
const basketballBallImage = getAssetPath('/assets/ball/basketball.png');
const volleyballBallImage = getAssetPath('/assets/ball/volleyball.png');
const earthBallImage = getAssetPath('/assets/ball/earth.png');
const worldcup2010BallImage = getAssetPath('/assets/ball/worldcup2010.png');
const beachballImage = getAssetPath('/assets/ball/beachball.png');
const monsterballImage = getAssetPath('/assets/ball/monsterball.png');
const sunBallImage = getAssetPath('/assets/ball/sun.png');

// 공통 물리 속성 (모든 테마에서 공유)
export interface BallPhysicsConfig {
  radius: number;
  mass: number;
  linearDamping: number;
  angularDamping: number;
  startPosition: { x: number; y: number; z: number };
  startRotation: { x: number; y: number; z: number };  // 라디안 단위
}

// 테마별 시각적 속성
export interface BallTheme {
  name: string;
  modelUrl: string;  // 실제 URL을 저장
  imageUrl: string;  // 프리뷰 이미지 URL
  gltfScale: number;
  unlockScore: number;  // 잠금 해제에 필요한 최고 점수 (0 = 기본 제공)
  material?: {
    roughness?: number;
    metalness?: number;
  };
  sounds?: {
    bounce?: SoundKey;  // 바운스 사운드 이름 (기본값: 'bounce')
  };
}

// 전체 Ball 설정 (물리 + 테마)
export interface BallConfig extends BallPhysicsConfig {
  theme: BallTheme;
  gltfScale: number;  // 하위 호환성을 위해 유지
}

const BALL_HOVER_EPSILON = 0.01; // 공이 지면과 겹치지 않도록 살짝 띄움

// 공통 물리 속성
export const BALL_PHYSICS: BallPhysicsConfig = {
  radius: 0.15,
  mass: 1.2,
  linearDamping: PHYSICS_LINEAR_DAMPING,
  angularDamping: 0.9,
  startPosition: { x: 0, y: 0.15, z: 0 },  // y는 아래에서 radius 기반으로 재계산됨
  startRotation: { x: 0.3, y: 0.5, z: 0.2 }  // 자연스러운 초기 회전 (라디안)
};

// startPosition.y를 radius 기반으로 재설정
BALL_PHYSICS.startPosition.y = BALL_PHYSICS.radius + BALL_HOVER_EPSILON;

// 테마 정의
export const BALL_THEMES = {
  BASIC: {
    name: 'basic',
    modelUrl: basicBallModel,
    imageUrl: basicBallImage,
    gltfScale: 1.3,
    unlockScore: 0  // 기본 제공
  } as BallTheme,
  MOON: {
    name: 'moon',
    modelUrl: moonBallModel,
    imageUrl: moonBallImage,
    gltfScale: 0.0048,
    unlockScore: 60,  // 60골 달성 시 잠금 해제
	material: {
	  roughness: 0.,
	  metalness: 0.3,
	},
	sounds: {
    bounce: 'post'  // 다른 사운드 사용 가능
  }
  } as BallTheme,
  BASKETBALL : {
	name: 'basketball',
	modelUrl: basketBallModel,
	imageUrl: basketballBallImage,
	gltfScale: 0.15,
	unlockScore: 15  // 15골 달성 시 잠금 해제
  } as BallTheme,
  VOLLEYBALL : {
	name: 'volleyball',
	modelUrl: volleyBallModel,
	imageUrl: volleyballBallImage,
	gltfScale: 1.3,
	unlockScore: 30  // 30골 달성 시 잠금 해제
  } as BallTheme,
  EARTH : {
	name: 'earth',
	modelUrl: earthBallModel,
	imageUrl: earthBallImage,
	gltfScale: 0.125,
	unlockScore: 75,  // 75골 달성 시 잠금 해제
	material: {
	  roughness: 0.,
	  metalness: 0.3,
	}
  } as BallTheme,
  WORLDCUP2010 : {
	name: 'worldcup2010',
	modelUrl: worldCup2010BallModel,
	imageUrl: worldcup2010BallImage,
	gltfScale: 0.4,
	unlockScore: 120  // 120골 달성 시 잠금 해제
  } as BallTheme,
  BEACHBALL : {
	name: 'beachball',
	modelUrl: beachBallModel,
	imageUrl: beachballImage,
	gltfScale: 0.14,
	unlockScore: 90  // 90골 달성 시 잠금 해제
  } as BallTheme,
  MONSTERBALL : {
	name: 'monsterball',
	modelUrl: monsterBallModel,
	imageUrl: monsterballImage,
	gltfScale: 0.04,
	unlockScore: 105  // 105골 달성 시 잠금 해제
  } as BallTheme,
  SUN : {
	name: 'sun',
	modelUrl: sunBallModel,
	imageUrl: sunBallImage,
	gltfScale: 0.015,
	unlockScore: 45  // 45골 달성 시 잠금 해제
  } as BallTheme,
} as const;

// 기본 테마 설정
export const DEFAULT_BALL_THEME = BALL_THEMES.BASIC;

// 전체 Ball 설정 (하위 호환성을 위해 유지)
export const BALL_CONFIG: BallConfig = {
  ...BALL_PHYSICS,
  theme: DEFAULT_BALL_THEME,
  gltfScale: DEFAULT_BALL_THEME.gltfScale  // 하위 호환성
};

// Export 단순화
export const BALL_RADIUS = BALL_PHYSICS.radius;
export const BALL_START_POSITION = BALL_PHYSICS.startPosition;
export const BALL_HOVER_OFFSET = BALL_HOVER_EPSILON;
