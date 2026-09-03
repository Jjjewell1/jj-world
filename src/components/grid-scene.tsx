"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { useScroll } from "react-use";
import { useResize } from "@react-three/fiber";

import { StationEntry } from "./station-entry";
import { StationProjects } from "./station-projects";
import { StationCertifications } from "./station-certifications";
import { StationContact } from "./station-contact";

const ACCENT_AMBER = "oklch(0.70 0.25 40)";
const ACCENT_TEAL = "oklch(0.60 0.20 160)";
const BACKGROUND_DARK = "oklch(0.10 0.02 260)";
const CARD_BG_DARK = "oklch(0.15 0.02 260)";

export function GridScene() {
  const [station, setStation] = useState<1 | 2 | 3 | 4>(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isLowPower, setLowPower] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    mq.addEventListener("change", setReducedMotion);

    const pmq = window.matchMedia("(max-width: 768px)");
    setLowPower(pmq.matches);
    pmq.addEventListener("change", (e) => setLowPower(e.matches));

    // Check if we're on a mobile/low-power device
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini|IEMobile/.test(ua);
    if (isMobile) setLowPower(true);
  }, []);

  // Determine station based on scroll position
  const { scrollY } = useScroll({
    target: window,
    onMove: (v) => {
      if (v < 0.25) setStation(1);
      else if (v < 0.5) setStation(2);
      else if (v < 0.75) setStation(3);
      else setStation(4);
    },
    onStart: () => {
      // prevent default drag
    },
  });

  // Click hotspot to navigate
  const handleStationClick = useCallback((n: number) => {
    setStation(n);
  }, []);

  // Camera positions for each station
  const cameraPositions = {
    1: { x: 0, y: 10, z: 20 },
    2: { x: -15, y: 10, z: 20 },
    3: { x: 15, y: 10, z: 20 },
    4: { x: 0, y: -5, z: 30 },
  };

  return (
    <Canvas
      shadows
      camera={{ fov: 60, position: cameraPositions[station] }}
      style={{
        background: reducedMotion || isLowPower ? "solid var(--background)" : `oklch(0.10 0.02 260)`,
        overflow: "hidden",
      }}
      reduce-motion={reducedMotion || isLowPower}
    >
      <ambientLight intensity={0.5} color={CARD_BG_DARK} />
      
      // Accent lights - amber and teal
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        color={ACCENT_AMBER}
      />
      <directionalLight
        position={[-5, 10, -5]}
        intensity={0.8}
        castShadow
        color={ACCENT_TEAL}
      />
      
      // Ground plane
      <mesh>
        <planeGeometry args={[100, 100, 10, 10]} />
        <meshStandardMaterial 
          color={reducedMotion || isLowPower ? "#1a1a2e" : "oklch(0.10 0 260)"} 
          opacity={0.3} 
          transparent 
        />
      </mesh>
      
      // Server room structure - low poly
      {/* Back wall */}
      <mesh>
        <boxGeometry args={[30, 0.5, 20]} />
        <meshStandardMaterial 
          color="oklch(0.12 0.02 260)" 
          roughness={0.3} 
        />
      </mesh>
      
      {/* Left wall */}
      <mesh>
        <boxGeometry args={[0.5, 0.5, 20]} />
        <meshStandardMaterial 
          color="oklch(0.12 0.02 260)" 
          roughness={0.3} 
        />
      </mesh>
      
      {/* Right wall */}
      <mesh>
        <boxGeometry args={[0.5, 0.5, 20]} />
        <meshStandardMaterial 
          color="oklch(0.12 0.02 260)" 
          roughness={0.3} 
        />
        <position x={27} />
      </mesh>
      
      {/* Ceiling */}
      <mesh>
        <boxGeometry args={[30, 0.5, 25]} />
        <meshStandardMaterial 
          color="oklch(0.12 0.02 260)" 
          roughness={0.3} 
        />
      </mesh>
      
      {/* Data stream particles - disabled on reduced motion or low power */}
      {(!reducedMotion && !isLowPower) && (
        <>
          {/* Particle system 1 */}
          <group>
            {Array.from({ length: 10 }).map((_, i) => (
              <mesh key={i}>
                <sphereGeometry args={[0.1, 0.1, 0.1]} />
                <meshStandardMaterial 
                  color={ACCENT_TEAL} 
                  opacity={0.8} 
                  transparent
                />
                <position 
                  x={Math.random() * 25 - 12.5} 
                  y={Math.random() * 20 - 10} 
                  z={Math.random() * 20 - 5} 
                />
              </mesh>
            ))}
          </group>
          
          {/* Particle system 2 */}
          <group>
            {Array.from({ length: 8 }).map((_, i) => (
              <mesh key={i + 100}>
                <boxGeometry args={[0.05, 0.05, 0.05]} />
                <meshStandardMaterial 
                  color={ACCENT_AMBER} 
                  opacity={0.6} 
                  transparent
                />
                <position 
                  x={Math.random() * 25 - 12.5} 
                  y={Math.random() * 20 - 10} 
                  z={Math.random() * 20 - 5} 
                />
              </mesh>
            ))}
          </group>
        </>
      )}
      
      {/* Station hotspots - clickable areas at edges */}
      <group>
        {/* Station 1 hotspot - top area */}
        <mesh
          onClick={() => handleStationClick(1)}
          position={cameraPositions[1]}
          rotation={{-Math.PI / 2, 0, 0}}
          args={[2, 2, 2]}
        >
          <sphereGeometry />
          <meshStandardMaterial 
            color={ACCENT_AMBER} 
            opacity={0.4} 
            transparent
          />
        </mesh>
        
        {/* Station 2 hotspot */}
        <mesh
          onClick={() => handleStationClick(2)}
          position={cameraPositions[2]}
          rotation={{-Math.PI / 2, 0, 0}}
          args={[2, 2, 2]}
        >
          <sphereGeometry />
          <meshStandardMaterial 
            color={ACCENT_TEAL} 
            opacity={0.4} 
            transparent
          />
        </mesh>
        
        {/* Station 3 hotspot */}
        <mesh
          onClick={() => handleStationClick(3)}
          position={cameraPositions[3]}
          rotation={{-Math.PI / 2, 0, 0}}
          args={[2, 2, 2]}
        >
          <sphereGeometry />
          <meshStandardMaterial 
            color={ACCENT_AMBER} 
            opacity={0.4} 
            transparent
          />
        </mesh>
        
        {/* Station 4 hotspot */}
        <mesh
          onClick={() => handleStationClick(4)}
          position={cameraPositions[4]}
          rotation={{-Math.PI / 2, 0, 0}}
          args={[2, 2, 2]}
        >
          <sphereGeometry />
          <meshStandardMaterial 
            color={ACCENT_TEAL} 
            opacity={0.4} 
            transparent
          />
        </mesh>
      </group>
      
      {/* Station content overlays */}
      {station === 1 && <StationEntry />}
      {station === 2 && <StationProjects />}
      {station === 3 && <StationCertifications />}
      {station === 4 && <StationContact />}
    </Canvas>
  );
}