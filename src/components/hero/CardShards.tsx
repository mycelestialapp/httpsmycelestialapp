/**
 * 36 張牌碎片：階段一猛烈炸裂 → 階段二優雅回歸矩陣。
 * 大師級對齊座標 + 燙金邊緣線。
 */
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SACRED_COLORS } from './sacredColors';

/** 36 張牌的矩陣座標計算（大師級對齊） */
const calculateMatrixPos = (index: number): [number, number, number] => {
  const row = Math.floor(index / 6);
  const col = index % 6;
  return [(col - 2.5) * 1.2, (2.5 - row) * 1.5, 0]; // 黃金比例間距
};

const SHARD_COUNT = 36;

interface CardShardsProps {
  active: boolean;
  onShuffleEnd?: () => void;
}

export function CardShards({ active, onShuffleEnd }: CardShardsProps) {
  const groupRef = useRef<THREE.Group>(null!);
  /** 硬核重構：用 delta 累積 elapsed，不再依賴 state.clock */
  const elapsedRef = useRef(0);
  const hasCalledShuffleEnd = useRef(false);

  // 初始化碎片位置與隨機速度 + 邊緣幾何（每張牌獨立 EdgesGeometry）
  const { shardData, edgeGeometries, planeGeometry } = useMemo(() => {
    const plane = new THREE.PlaneGeometry(1, 1.4);
    const shardData = Array.from({ length: SHARD_COUNT }).map((_, i) => ({
      targetPos: new THREE.Vector3(...calculateMatrixPos(i)),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 5
      ),
      rotationSpeed: new THREE.Vector3(
        Math.random(),
        Math.random(),
        Math.random()
      ),
    }));
    const edgeGeometries = Array.from(
      { length: SHARD_COUNT },
      () => new THREE.EdgesGeometry(plane.clone())
    );
    return { shardData, edgeGeometries, planeGeometry: plane };
  }, []);

  useEffect(() => {
    if (!active || !groupRef.current) return;
    elapsedRef.current = 0;
    hasCalledShuffleEnd.current = false;
    groupRef.current.children.forEach((child) => {
      child.position.set(0, 0, 0);
      child.rotation.set(0, 0, 0);
    });
  }, [active]);

  useFrame((_state, delta) => {
    if (!active || !groupRef.current) return;
    elapsedRef.current += delta;
    const elapsed = elapsedRef.current;
    const phase1End = 1.5;
    const phase2MinDuration = 2.5;

    groupRef.current.children.forEach((child, i) => {
      const data = shardData[i];
      const groupObj = child as THREE.Group;

      // 階段一：猛烈炸裂
      if (elapsed < phase1End) {
        groupObj.position.add(
          data.velocity.clone().multiplyScalar(delta)
        );
        groupObj.rotation.x += data.rotationSpeed.x * delta;
        groupObj.rotation.y += data.rotationSpeed.y * delta;
        groupObj.rotation.z += data.rotationSpeed.z * delta;
      }
      // 階段二：優雅回歸矩陣（插值動畫）
      else {
        groupObj.position.lerp(data.targetPos, 0.05);
        groupObj.rotation.set(0, 0, 0);
      }
    });

    // 階段二持續足夠時間後回調一次
    if (
      elapsed > phase1End + phase2MinDuration &&
      onShuffleEnd &&
      !hasCalledShuffleEnd.current
    ) {
      hasCalledShuffleEnd.current = true;
      onShuffleEnd();
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: SHARD_COUNT }).map((_, i) => (
        <group key={i}>
          <mesh>
            <primitive object={planeGeometry} attach="geometry" />
            <meshStandardMaterial
              color="#050505"
              metalness={1}
              roughness={0.05}
              emissive="#D4AF37"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* 邊緣燙金線 */}
          <lineSegments>
            <primitive object={edgeGeometries[i]} attach="geometry" />
            <lineBasicMaterial color={SACRED_COLORS.GOLD_LEAF} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}
