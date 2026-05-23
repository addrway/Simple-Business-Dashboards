"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";
export type JarvisState = "idle" | "listening" | "thinking" | "speaking";
type Props = {
  state: JarvisState;
};
function getStatePower(state: JarvisState) {
  if (state === "listening") return 1.25;
  if (state === "thinking") return 1.5;
  if (state === "speaking") return 1.8;
  return 1;
}
function EnergySphere({ state }: Props) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const outer = useRef<THREE.Mesh>(null);
  const power = getStatePower(state);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = t * 0.18 * power;
      group.current.rotation.x = Math.sin(t * 0.25) * 0.18;
    }
    if (inner.current) {
      const pulse = 1 + Math.sin(t * 2.4 * power) * 0.08 * power;
      inner.current.scale.setScalar(pulse);
    }
    if (outer.current) {
      const breath = 1 + Math.sin(t * 1.2 * power) * 0.04 * power;
      outer.current.scale.setScalar(breath);
      outer.current.rotation.z = t * 0.12 * power;
    }
  });
  return (
    <group ref={group}>
      <mesh ref={inner}>
        <sphereGeometry args={[1.15, 96, 96]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00aaff"
          emissiveIntensity={2.8 * power}
          transparent
          opacity={0.34}
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>
      <mesh ref={outer}>
        <sphereGeometry args={[1.62, 64, 64]} />
        <meshBasicMaterial
          color="#74f7ff"
          wireframe
          transparent
          opacity={0.23 * power}
        />
      </mesh>
      <mesh rotation={[0.8, 0.2, 0.5]}>
        <torusGeometry args={[1.92, 0.012, 16, 180]} />
        <meshBasicMaterial color="#00eaff" transparent opacity={0.7} />
      </mesh>
      <mesh rotation={[1.3, 0.8, 1.1]}>
        <torusGeometry args={[2.15, 0.01, 16, 180]} />
        <meshBasicMaterial color="#008cff" transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[0.4, 1.7, 0.9]}>
        <torusGeometry args={[2.38, 0.008, 16, 180]} />
        <meshBasicMaterial color="#b4fbff" transparent opacity={0.42} />
      </mesh>
    </group>
  );
}
function ParticleField({ state }: Props) {
  const points = useRef<THREE.Points>(null);
  const power = getStatePower(state);
  const particles = useMemo(() => {
    const count = 1200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2.1 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (points.current) {
      points.current.rotation.y = t * 0.07 * power;
      points.current.rotation.x = Math.sin(t * 0.18) * 0.2;
      const scale =
        state === "listening"
          ? 0.94 + Math.sin(t * 2) * 0.025
          : 1 + Math.sin(t * power) * 0.015;
      points.current.scale.setScalar(scale);
    }
  });
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#7df9ff"
        transparent
        opacity={0.72}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
function ElectricArcs({ state }: Props) {
  const group = useRef<THREE.Group>(null);
  const power = getStatePower(state);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = t * 0.28 * power;
      group.current.rotation.z = Math.sin(t * 0.5) * 0.3;
    }
  });
  const arcs = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.5 + Math.random(), Math.random() - 0.5, Math.random() - 0.5),
        new THREE.Vector3(-0.5 + Math.random(), 1.2 * (Math.random() - 0.5), 1.2 * (Math.random() - 0.5)),
        new THREE.Vector3(0.5 + Math.random(), 1.2 * (Math.random() - 0.5), 1.2 * (Math.random() - 0.5)),
        new THREE.Vector3(1.5 - Math.random(), Math.random() - 0.5, Math.random() - 0.5)
      ]);
      return {
        id: i,
        points: curve.getPoints(40),
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ] as [number, number, number]
      };
    });
  }, []);
  return (
    <group ref={group}>
      {arcs.map((arc) => (
        <line key={arc.id} rotation={arc.rotation}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(arc.points.flatMap((p) => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#8ffcff"
            transparent
            opacity={0.18 * power}
            blending={THREE.AdditiveBlending}
          />
        </line>
      ))}
    </group>
  );
}
export default function JarvisCore({ state }: Props) {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 3]} intensity={35} color="#00d9ff" />
      <pointLight position={[3, 3, 4]} intensity={8} color="#7df9ff" />
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.3}>
        <EnergySphere state={state} />
        <ParticleField state={state} />
        <ElectricArcs state={state} />
      </Float>
      <Stars radius={60} depth={35} count={1600} factor={2} saturation={0} fade speed={0.3} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
    </Canvas>
  );
}
