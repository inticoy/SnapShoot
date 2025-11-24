import * as THREE from 'three';
import { STANDS_CONFIG } from '../config/Stands';

const crowdTextureUrl = '/assets/crowd/crowd.webp';

export class Stands {
  private readonly mesh: THREE.Mesh;

  constructor(
    scene: THREE.Scene,
    adBoardDepth: number
  ) {
    const config = STANDS_CONFIG;

    // 경사면의 실제 길이 계산 (빗변)
    const slopedLength = Math.hypot(config.geometry.height, config.geometry.depth);

    // 간단한 PlaneGeometry 생성 (가로 x 경사면 길이)
    const geometry = new THREE.PlaneGeometry(config.geometry.width, slopedLength);

    // 텍스처 로드
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(crowdTextureUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    // 텍스처 반복 설정
    texture.repeat.set(
      config.crowdTexture.repeat.x,
      config.crowdTexture.repeat.y
    );

    // 재질
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      color: 0xffffff,
      roughness: config.material.roughness,
      metalness: config.material.metalness,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // 위치 및 회전 설정
    // 경사각 계산 (라디안)
    const angleRadians = (config.angle.degrees * Math.PI) / 180;

    // 경사면 중심점 위치 계산
    const halfDepth = config.geometry.depth / 2;
    const halfHeight = config.geometry.height / 2;

    // 광고판 뒤에서 경사면 중심까지의 Z 오프셋
    const centerZ = adBoardDepth + config.position.zOffset - halfDepth;

    // 경사면 중심 높이
    const centerY = config.position.y + halfHeight;

    this.mesh.position.set(config.position.x, centerY, centerZ);

    // X축 기준으로 회전 (경사각)
    this.mesh.rotation.x = angleRadians;

    scene.add(this.mesh);

    console.log(`🏟️ 관중석 생성 완료 (각도: ${config.angle.degrees}°, PlaneGeometry 사용)`);
  }

  // 필요시 관중석 제거
  dispose(scene: THREE.Scene) {
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach(mat => mat.dispose());
    } else {
      this.mesh.material.dispose();
    }
  }
}
