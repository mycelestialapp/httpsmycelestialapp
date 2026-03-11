/**
 * 黑金騎士牌：黑曜石卡體 + 燙金發光線框 + 中心金色能量核心。
 * 硬核重構：禁止加載 .ttf，不使用 THREE.Clock，僅用 useFrame(state, delta)。
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Group } from 'three';

interface BlackGoldRiderPortalProps {
  onStart?: () => void;
}

export function BlackGoldRiderPortal({ onStart }: BlackGoldRiderPortalProps) {
  const groupRef = useRef<Group>(null!);
  const elapsedRef = useRef(0);
  const cardBoxGeom = useMemo(() => new THREE.BoxGeometry(3.2, 5, 0.15), []);
  const frameBoxGeom = useMemo(() => new THREE.BoxGeometry(3.22, 5.02, 0.16), []);
  const frameEdgesGeom = useMemo(() => new THREE.EdgesGeometry(frameBoxGeom), [frameBoxGeom]);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    elapsedRef.current += delta;
    const t = elapsedRef.current;
    groupRef.current.rotation.x = Math.cos(t / 2) / 10;
    groupRef.current.rotation.y = Math.sin(t / 2) / 10;
    groupRef.current.position.y = Math.sin(t / 1.5) / 5;
  });

  return (
    <group>
      <group
        ref={groupRef}
        onClick={onStart}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <mesh castShadow geometry={cardBoxGeom}>
          <meshStandardMaterial
            color="#050505"
            metalness={1}
            roughness={0.05}
            envMapIntensity={1}
          />
        </mesh>
        <lineSegments geometry={frameEdgesGeom}>
          <lineBasicMaterial color="#D4AF37" linewidth={2} />
        </lineSegments>
        <mesh position={[0, 0, 0.1]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#D4AF37" />
        </mesh>
        <pointLight position={[0, 0, 0.1]} color="#D4AF37" intensity={1} distance={2} />
      </group>
    </group>
  );
}
