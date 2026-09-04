"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";

import { StationEntry } from "./station-entry";
import { StationProjects } from "./station-projects";
import { StationCertifications } from "./station-certifications";
import { StationContact } from "./station-contact";

const ACCENT_AMBER = "oklch(0.70 0.25 40)";
const ACCENT_TEAL = "oklch(0.60 0.20 160)";
const CARD_BG_DARK = "oklch(0.15 0.02 260)";

type StationNum = 1 | 2 | 3 | 4;

const CAMERA_POSITIONS: Record<StationNum, [number, number, number]> = {
  1: [0, 10, 20],
  2: [-15, 10, 20],
  3: [15, 10, 20],
  4: [0, -5, 30],
};

const STATION_TOTAL = 4;

function ServerRoomParticles({ active }: { active: boolean }) {
  if (!active) return null;
  const positions = useRef(
    Array.from({ length: 10 }).map(() => [
      Math.random() * 25 - 12.5,
      Math.random() * 20 - 10,
      Math.random() * 20 - 5,
    ] as [number, number, number])
  );
  const positions2 = useRef(
    Array.from({ length: 8 }).map(() => [
      Math.random() * 25 - 12.5,
      Math.random() * 20 - 10,
      Math.random() * 20 - 5,
    ] as [number, number, number])
  );

  return (
    <group>
      {positions.current.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color={ACCENT_TEAL} opacity={0.8} transparent />
        </mesh>
      ))}
      {positions2.current.map((p, i) => (
        <mesh key={i + 100} position={p}>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshStandardMaterial color={ACCENT_AMBER} opacity={0.6} transparent />
        </mesh>
      ))}
    </group>
  );
}

export function GridScene() {
  const [station, setStation] = useState<StationNum>(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onMq = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onMq);

    const pmq = window.matchMedia("(max-width: 768px)");
    setIsLowPower(pmq.matches);
    const onPmq = (e: MediaQueryListEvent) => setIsLowPower(e.matches);
    pmq.addEventListener("change", onPmq);

    const ua = navigator.userAgent || navigator.vendor || "";
    if (/iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      setIsLowPower(true);
    }

    return () => {
      mq.removeEventListener("change", onMq);
      pmq.removeEventListener("change", onPmq);
    };
  }, []);

  const handleStationClick = useCallback((n: number) => {
    setStation(n as StationNum);
  }, []);

  const lowPower = reducedMotion || isLowPower;

  return (
    <Canvas
      shadows
      camera={{ fov: 60, position: CAMERA_POSITIONS[station] }}
      style={{
        background: lowPower ? "var(--background)" : "oklch(0.10 0.02 260)",
        overflow: "hidden",
      }}
    >
      <ambientLight intensity={0.5} color={CARD_BG_DARK} />

      {/* Accent lights - amber and teal */}
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow color={ACCENT_AMBER} />
      <directionalLight position={[-5, 10, -5]} intensity={0.8} castShadow color={ACCENT_TEAL} />

      {/* Ground plane */}
      <mesh>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={lowPower ? "#1a1a2e" : "oklch(0.10 0 260)"} opacity={0.3} transparent />
      </mesh>

      {/* Server room structure - low poly */}
      {/* Back wall */}
      <mesh position={[0, 0, -10]}>
        <boxGeometry args={[30, 0.5, 20]} />
        <meshStandardMaterial color="oklch(0.12 0.02 260)" roughness={0.3} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-15, 0, 0]}>
        <boxGeometry args={[0.5, 0.5, 20]} />
        <meshStandardMaterial color="oklch(0.12 0.02 260)" roughness={0.3} />
      </mesh>

      {/* Right wall */}
      <mesh position={[27, 0, 0]}>
        <boxGeometry args={[0.5, 0.5, 20]} />
        <meshStandardMaterial color="oklch(0.12 0.02 260)" roughness={0.3} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 20, 0]}>
        <boxGeometry args={[30, 0.5, 25]} />
        <meshStandardMaterial color="oklch(0.12 0.02 260)" roughness={0.3} />
      </mesh>

      {/* Data stream particles - disabled on reduced motion or low power */}
      <ServerRoomParticles active={!lowPower} />

      {/* Station hotspots - clickable areas at edges */}
      <group>
        {([1, 2, 3, 4] as StationNum[]).map((n) => (
          <mesh
            key={n}
            onClick={() => handleStationClick(n)}
            position={CAMERA_POSITIONS[n]}
          >
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshStandardMaterial
              color={n % 2 === 1 ? ACCENT_AMBER : ACCENT_TEAL}
              opacity={0.4}
              transparent
            />
          </mesh>
        ))}
      </group>

      {/* Station content overlays */}
      {station === 1 && <StationEntry />}
      {station === 2 && <StationProjects />}
      {station === 3 && <StationCertifications />}
      {station === 4 && <StationContact />}
    </Canvas>
  );
}
