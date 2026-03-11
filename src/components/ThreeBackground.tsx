import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

// 银河核心：发光的旋转线框球体（较少分段 = 清晰经纬线，不是密麻麻的三角块）
function GalaxyCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.2;
    }
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.2, 24, 24]} />
      <meshBasicMaterial
        color="#FBBF24"
        wireframe
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

// 圆形粒子贴图（Three 默认点是方块，用 alpha 贴图变成圆点）
function useCirclePointTexture() {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.2, "rgba(255,255,255,0.8)");
    g.addColorStop(0.5, "rgba(255,255,255,0.2)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

// 漂浮的金/紫色粒子（圆形，非方块）
function FloatingNumbers() {
  const count = 300;
  const circleTex = useCirclePointTexture();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const cols = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const color = new THREE.Color().setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.6);
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    }
    return cols;
  }, []);

  if (!circleTex) return null;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={circleTex}
        vertexColors
        size={0.18}
        sizeAttenuation
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// 主背景画布：fixed 铺满视口，保证 Canvas 有明确宽高
export default function ThreeBackground() {
  return (
    <div
      className="fixed inset-0 z-0 w-full h-full"
      style={{ minHeight: "100vh", minWidth: "100%" }}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        style={{ width: "100%", height: "100%", display: "block" }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <pointLight position={[-5, -5, 5]} intensity={0.4} color="#8B5CF6" />
        <GalaxyCore />
        <FloatingNumbers />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.2}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
