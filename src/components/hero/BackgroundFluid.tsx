/**
 * 背景流體層（WebGL Shader）：金粉流體的「靈魂」。
 * 獨立組件，禁止修改此處邏輯。
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- 核心 Shader：控制金粉流體的「靈魂」 ---
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 优化后的极简高精金粉 Shader：仅计算鼠标周围扰动 + 随机微光闪烁
const fragmentShader = `
  varying vec2 vUv;
  uniform vec2 uMouse;
  uniform vec3 uColorVoid;
  uniform vec3 uColorGold;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float d = length(p - uMouse);

    // 仅计算鼠标周围的扰动，减少全局开销
    float glow = 0.05 / (d + 0.1);

    // 产生随机微光闪烁（金粉感）
    float sparkles = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
    sparkles = step(0.995, sparkles) * 0.3; // 极细腻的闪烁点

    vec3 baseColor = mix(uColorVoid, uColorGold * 0.5, glow + sparkles);
    gl_FragColor = vec4(baseColor, 1.0);
  }
`;

// --- 獨立背景組件：AI 禁止修改此處邏輯 ---
export default function BackgroundFluid() {
  const meshRef = useRef<THREE.Mesh>(null!);

  const uniforms = useMemo(
    () => ({
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorVoid: { value: new THREE.Color('#030305') }, // 深淵黑
      uColorGold: { value: new THREE.Color('#D4AF37') }, // 燙金
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current?.material) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uMouse.value.lerp(state.mouse, 0.05); // 平滑跟隨
    }
  });

  return (
    <mesh ref={meshRef} scale={[20, 20, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
      />
    </mesh>
  );
}
