"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { StationEntry } from "./station-entry";
import { StationProjects } from "./station-projects";
import { StationCertifications } from "./station-certifications";
import { StationContact } from "./station-contact";

// three.js Color does not parse oklch() strings, so the design's oklch tokens
// are converted to their sRGB equivalents (resolved via the browser color pipeline).
const ACCENT_AMBER = "#ff4b00"; // oklch(0.70 0.25 40)
const ACCENT_TEAL = "#00a153"; // oklch(0.60 0.20 160)
const CARD_BG_DARK = "#070b14"; // oklch(0.15 0.02 260)

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

  const goPrev = useCallback(() => {
    setStation((s) => (s === 1 ? STATION_TOTAL : s - 1) as StationNum);
  }, []);

  const goNext = useCallback(() => {
    setStation((s) => (s === STATION_TOTAL ? 1 : s + 1) as StationNum);
  }, []);

  const lowPower = reducedMotion || isLowPower;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
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
        <meshStandardMaterial color={lowPower ? "#1a1a2e" : "#030303"} opacity={0.3} transparent />
      </mesh>

      {/* Server room structure - low poly */}
      {/* Back wall */}
      <mesh position={[0, 0, -10]}>
        <boxGeometry args={[30, 0.5, 20]} />
        <meshStandardMaterial color="#03060d" roughness={0.3} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-15, 0, 0]}>
        <boxGeometry args={[0.5, 0.5, 20]} />
        <meshStandardMaterial color="#03060d" roughness={0.3} />
      </mesh>

      {/* Right wall */}
      <mesh position={[27, 0, 0]}>
        <boxGeometry args={[0.5, 0.5, 20]} />
        <meshStandardMaterial color="#03060d" roughness={0.3} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 20, 0]}>
        <boxGeometry args={[30, 0.5, 25]} />
        <meshStandardMaterial color="#03060d" roughness={0.3} />
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

      {/* Station content overlays - plain HTML/React overlays must NOT live inside
          the R3F Canvas tree (R3F only accepts Three.js objects), so they are
          rendered here, absolutely positioned above the scene */}
    </Canvas>

    <div
      style={{
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        pointerEvents: "none",
      }}
    >
      {station === 1 && (
        <div style={{ pointerEvents: "auto" }}>
          <StationEntry onNavigate={handleStationClick} />
        </div>
      )}
      {station === 2 && (
        <div style={{ pointerEvents: "auto" }}>
          <StationProjects />
        </div>
      )}
      {station === 3 && (
        <div style={{ pointerEvents: "auto" }}>
          <StationCertifications />
        </div>
      )}
      {station === 4 && (
        <div style={{ pointerEvents: "auto" }}>
          <StationContact />
        </div>
      )}

      {/* Station navigation - fixed overlay controls, painted above station
          content so they stay clickable on every station */}
      <button
        aria-label="Previous station"
        onClick={goPrev}
        style={{
          position: "fixed",
          zIndex: 20,
          left: 16,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "auto",
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(10,12,20,0.55)",
          color: "#fff",
          cursor: "pointer",
          backdropFilter: "blur(6px)",
          opacity: 0.7,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
      >
        <ChevronLeft size={22} />
      </button>
      <button
        aria-label="Next station"
        onClick={goNext}
        style={{
          position: "fixed",
          zIndex: 20,
          right: 16,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "auto",
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(10,12,20,0.55)",
          color: "#fff",
          cursor: "pointer",
          backdropFilter: "blur(6px)",
          opacity: 0.7,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
      >
        <ChevronRight size={22} />
      </button>
      <div
        style={{
          position: "fixed",
          zIndex: 20,
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "6px 14px",
          borderRadius: 9999,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(10,12,20,0.55)",
          color: "rgba(255,255,255,0.8)",
          fontSize: 13,
          fontFamily: "ui-monospace, monospace",
          backdropFilter: "blur(6px)",
        }}
      >
        {station} / {STATION_TOTAL}
      </div>
    </div>
    </div>
  );
}
