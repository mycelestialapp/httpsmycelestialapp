/**
 * 翻牌動效增強：大師級光影
 * 牌背黑金騎士馬 · 牌面全息圖案區 · 翻開瞬間輝光
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SACRED_COLORS } from './sacredColors';

const FLIP_LERP = 0.12;
const OPACITY_LERP = 0.18;

export interface SacredCardData {
  /** 牌面紋理（可選，無則用燙金底色） */
  texture?: THREE.Texture;
  nameEn?: string;
  nameZh?: string;
}

interface SacredCardProps {
  cardData: SacredCardData;
  isFlipped: boolean;
}

export function SacredCard({ cardData, isFlipped }: SacredCardProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const frontMeshRef = useRef<THREE.Mesh>(null!);
  const rotYRef = useRef(0);
  const opacityRef = useRef(0);

  useFrame(() => {
    if (!groupRef.current || !frontMeshRef.current) return;

    const targetRotY = isFlipped ? Math.PI : 0;
    const targetOpacity = isFlipped ? 1 : 0;

    rotYRef.current += (targetRotY - rotYRef.current) * FLIP_LERP;
    opacityRef.current += (targetOpacity - opacityRef.current) * OPACITY_LERP;

    groupRef.current.rotation.y = rotYRef.current;

    const mat = frontMeshRef.current.material as THREE.MeshStandardMaterial;
    if (mat) {
      mat.opacity = opacityRef.current;
      mat.transparent = opacityRef.current < 1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 牌背：邏輯生成的動態光效，無外部貼圖 */}
      <mesh>
        <planeGeometry args={[1, 1.4]} />
        <meshStandardMaterial
          color="#050505"
          metalness={1}
          roughness={0.05}
          emissive="#D4AF37"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* 牌面：全息圖案區（翻轉後可見），無貼圖時用金色發光 */}
      <mesh
        ref={frontMeshRef}
        rotation={[0, Math.PI, 0]}
        position={[0, 0, 0.01]}
      >
        <planeGeometry args={[0.95, 1.35]} />
        <meshStandardMaterial
          map={cardData.texture ?? undefined}
          color={cardData.texture ? undefined : '#0a0a0a'}
          metalness={1}
          roughness={0.05}
          emissive="#D4AF37"
          emissiveIntensity={cardData.texture ? 0.6 : 0.2}
          transparent
          opacity={0}
        />
      </mesh>

      {/* 翻開瞬間的輝光特效 */}
      {isFlipped && (
        <pointLight
          color={SACRED_COLORS.GOLD_LEAF}
          intensity={2}
          distance={2}
          position={[0, 0, 0.5]}
        />
      )}
    </group>
  );
}
