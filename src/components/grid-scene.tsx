"use client";

import { useMemo, useRef, useState, useEffect, useCallback, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Grid, Points, PointMaterial } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  GitBranch,
  Mail,
  MapPin,
  TerminalSquare,
  Contact,
} from "lucide-react";

import { projects, certifications, heroContent, contactInfo } from "@/lib/data";

// three.js Color does not parse oklch(), so the design tokens are converted to sRGB hex.
const AMBER = "#ff4b00"; // oklch(0.70 0.25 40)
const TEAL = "#00a153"; // oklch(0.60 0.20 160)
const DARK = "#070b14"; // oklch(0.15 0.02 260)
const VOID_BG = "#030303"; // oklch(0.10 0 260)

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

type StationNum = 1 | 2 | 3 | 4;
type Vec3 = [number, number, number];
type Project = (typeof projects)[number];

const STATION_TOTAL = 4;

const CAMERA_POS: Record<StationNum, Vec3> = {
  1: [0, 1.6, 7.5],
  2: [0, 2.0, 8.2],
  3: [0, 2.1, 8.5],
  4: [0, 1.8, 7.9],
};

const CAMERA_LOOKAT: Record<StationNum, Vec3> = {
  1: [0, 1.6, -1.5],
  2: [0, 2.2, -2.2],
  3: [0, 2.2, -3.0],
  4: [0, 1.75, -2.5],
};

const STATION_LABEL: Record<StationNum, string> = {
  1: "ENTRY // SERVER CORE",
  2: "PROJECTS // TERMINAL RACK",
  3: "CERTIFICATIONS // STATUS RACK",
  4: "CONTACT // SSR SHELL",
};

/* ------------------------------------------------------------------ */
/* Performance detection: mobile / low-power / reduced-motion          */
/* ------------------------------------------------------------------ */

function useLowPower(): boolean {
  // Server sees the full-detail layout; the live snapshot (client only) is
  // derived from matchMedia + UA + device caps so hydration cannot mismatch.
  const subscribe = (onChange: () => void) => {
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia("(max-width: 768px)");
    mqReduced.addEventListener("change", onChange);
    mqMobile.addEventListener("change", onChange);
    return () => {
      mqReduced.removeEventListener("change", onChange);
      mqMobile.removeEventListener("change", onChange);
    };
  };
  const getSnapshot = () => {
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia("(max-width: 768px)");
    const ua = navigator.userAgent || navigator.vendor || "";
    const mobileUa = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    return (
      mqReduced.matches ||
      mqMobile.matches ||
      mobileUa ||
      (navigator.hardwareConcurrency ?? 8) <= 4 ||
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4
    );
  };
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** Toggle the OS cursor while hovering an interactive 3D object. */

/* ------------------------------------------------------------------ */
/* Camera rig: damped movement between fixed viewpoints                */
/* ------------------------------------------------------------------ */

function CameraRig({ station }: { station: StationNum }) {
  const target = useMemo(() => new THREE.Vector3(...CAMERA_POS[station]), [station]);
  const lookAt = useMemo(() => new THREE.Vector3(...CAMERA_LOOKAT[station]), [station]);
  useFrame((state, delta) => {
    const cam = state.camera;
    // frame-rate-independent exponential damping toward the fixed viewpoint
    cam.position.x += (target.x - cam.position.x) * (1 - Math.exp(-2.4 * delta));
    cam.position.y += (target.y - cam.position.y) * (1 - Math.exp(-2.4 * delta));
    cam.position.z += (target.z - cam.position.z) * (1 - Math.exp(-2.4 * delta));
    cam.lookAt(lookAt);
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Ambience: lights, fog, drifting data-stream particles, room grid    */
/* ------------------------------------------------------------------ */

function Room() {
  return (
    <group>
      <ambientLight intensity={0.45} />
      <pointLight key="teal" position={[-6, 3, 2]} intensity={26} distance={26} color={TEAL} />
      <pointLight key="amber" position={[6, 3, 2]} intensity={26} distance={26} color={AMBER} />
      <pointLight position={[0, 7, 5]} intensity={10} distance={30} color="#dfe8ff" />
      <fog attach="fog" args={[VOID_BG, 12, 34]} />

      {/* Back wall of the void */}
      <mesh position={[0, 3.4, -6]}>
        <boxGeometry args={[40, 12, 0.4]} />
        <meshStandardMaterial color="#03060d" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Grid floor */}
      <Grid
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        args={[10.5, 10.5]}
        cellSize={0.5}
        cellThickness={0.7}
        cellColor="#0b4a35"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#5e2410"
        fadeDistance={26}
        fadeStrength={2.5}
        infiniteGrid
      />
    </group>
  );
}

function ParticleStream({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  // Zeroed placeholder so <Points> has a buffer from first paint; real random
  // positions are generated in an effect (impure work is not allowed in render).
  const placeholder = useMemo(() => new Float32Array(count * 3), [count]);
  useEffect(() => {
    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 24;
      arr[i * 3 + 1] = Math.random() * 8; // drift upward over time → data-stream feel
      arr[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    geom.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  }, [count]);
  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = clock.elapsedTime * 0.02;
    const yAttr = pointsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = yAttr.getY(i) + 0.006;
      if (y > 8) y = 0;
      yAttr.setY(i, y);
    }
    yAttr.needsUpdate = true;
  });
  return (
    <Points ref={pointsRef} positions={placeholder} frustumCulled={false}>
      <PointMaterial
        size={0.06}
        color={TEAL}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

/** Soft additive "glow" painted behind an object, faked with a sprite-less billboard. */
function GlowDisc({ position, color, scale = 2.2, opacity = 0.16 }: { position: Vec3; color: string; scale?: number; opacity?: number }) {
  return (
    <mesh
      position={position}
      scale={scale}
    >
      <circleGeometry args={[1, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Station 1: the glowing Server Core                                  */
/* ------------------------------------------------------------------ */

function ServerCore({ lowPower }: { lowPower: boolean }) {
  const coreMat = useRef<THREE.MeshStandardMaterial>(null);
  const innerMat = useRef<THREE.MeshStandardMaterial>(null);
  const ringA = useRef<THREE.Group>(null);
  const ringB = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const pulse = 0.55 + 0.35 * Math.sin(t * 1.7);
    if (coreMat.current) coreMat.current.emissiveIntensity = pulse;
    if (innerMat.current) innerMat.current.emissiveIntensity = 1.2 + 0.8 * Math.sin(t * 2.2);
    if (ringA.current) ringA.current.rotation.z = t * 0.35;
    if (ringB.current) ringB.current.rotation.z = -t * 0.22;
  });

  return (
    <group position={[0, 1.6, -3]}>
      {/* chassis of stacked servers */}
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[1.5, 1.1, 1.1]} />
        <meshStandardMaterial color={DARK} metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[1.15, 0.55, 1.15]} />
        <meshStandardMaterial color="#0a1220" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* wireframe cage */}
      <mesh>
        <boxGeometry args={[1.9, 1.9, 1.9]} />
        <meshBasicMaterial color="#0f3d" wireframe transparent opacity={0.35} />
      </mesh>
      {/* the core */}
      <mesh>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          ref={coreMat}
          color="#101820"
          emissive={TEAL}
          emissiveIntensity={0.6}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>
      <mesh ref={ringA}>
        <torusGeometry args={[1.15, 0.018, 8, 64]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.8} />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.45, 0.015, 8, 64]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0.7} />
      </mesh>
      {!lowPower && (
        <>
          <GlowDisc position={[0, 0, -0.7]} color={TEAL} scale={2.6} opacity={0.14} />
          <GlowDisc position={[0, 0, 0]} color={AMBER} scale={1.4} opacity={0.08} />
        </>
      )}
      <Text position={[0, -1.55, 0]} fontSize={0.09} font="/fonts/JetBrainsMono-Regular.ttf" color="#38e0a8" anchorX="center">
        SERVER_CORE // v0.1
      </Text>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Station 2: project monitors in the rack                             */
/* ------------------------------------------------------------------ */

function ProjectMonitor({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: (p: Project) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const screenMat = useRef<THREE.MeshStandardMaterial>(null);
  const x = (index - 2) * 2.5;
  return (
    <group position={[x, 2.25, -2.3]}>
      {/* floor pedestal */}
      <mesh position={[0, -1.55, 0.1]}>
        <boxGeometry args={[0.9, 1.2, 0.5]} />
        <meshStandardMaterial color="#05080f" metalness={0.4} roughness={0.6} />
      </mesh>
      <group
        scale={hovered ? 1.045 : 1}
        onClick={(e) => {
          e.stopPropagation();
          onOpen(project);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          setHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
          setHovered(false);
        }}
      >
        {/* chassis */}
        <mesh>
          <boxGeometry args={[1.55, 1.05, 0.16]} />
          <meshStandardMaterial color={hovered ? "#12202c" : "#0a1018"} metalness={0.5} roughness={0.32} />
        </mesh>
        {/* status led */}
        <mesh position={[0.66, 0.44, 0.09]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color={project.featured ? AMBER : "#3a4657"} emissive={project.featured ? AMBER : "#3a4657"} emissiveIntensity={hovered ? 2 : 1} />
        </mesh>
        {/* screen */}
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[1.42, 0.9]} />
          <meshStandardMaterial
            ref={screenMat}
            color="#03060d"
            emissive={TEAL}
            emissiveIntensity={hovered ? 0.55 : 0.28}
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
        <Text
          position={[0, 0.2, 0.1]}
          fontSize={0.105}
          font="/fonts/JetBrainsMono-Regular.ttf"
          color="#f2fffa"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.3}
          textAlign="center"
        >
          {project.title}
        </Text>
        <Text
          position={[0, -0.24, 0.1]}
          fontSize={0.065}
          font="/fonts/JetBrainsMono-Regular.ttf"
          color={project.featured ? AMBER : TEAL}
          anchorX="center"
          anchorY="middle"
          maxWidth={1.32}
        >
          {project.subtitle}
        </Text>
        <Text
          position={[0, -0.42, 0.1]}
          fontSize={0.05}
          font="/fonts/JetBrainsMono-Regular.ttf"
          color="#5c7a6f"
          anchorX="center"
          anchorY="middle"
        >
          {hovered ? "> OPEN" : `rack/${index + 1}`}
        </Text>
      </group>
    </group>
  );
}

function ProjectRack({ onOpen }: { onOpen: (p: Project) => void }) {
  return (
    <group>
      {/* rack spine rail behind the monitors */}
      <mesh position={[0, 1.6, -2.6]}>
        <boxGeometry args={[13, 4, 0.22]} />
        <meshStandardMaterial color="#04070d" metalness={0.5} roughness={0.5} />
      </mesh>
      {projects.map((p, i) => (
        <ProjectMonitor key={p.title} project={p} index={i} onOpen={onOpen} />
      ))}
      <Text position={[0, 0.55, -2.2]} fontSize={0.085} font="/fonts/JetBrainsMono-Regular.ttf" color="#3f5a4f" anchorX="center">
        ROOT://PROJECTS — 5 VOLUMES ATTACHED
      </Text>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Station 3: certification status rack                                */
/* ------------------------------------------------------------------ */

function CertSlot({ cert, row }: { cert: (typeof certifications)[number]; row: number }) {
  const y = 3.62 - row * 0.42;
  const active = cert.status === "in-progress";
  const ledMat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (!active || !ledMat.current) return;
    ledMat.current.emissiveIntensity = 0.6 + 0.6 * Math.sin(clock.elapsedTime * 2.6 + row);
  });
  const barColor = active ? AMBER : "#37424f";
  return (
    <group position={[0, y, 0.3]}>
      {/* slot plate */}
      <mesh>
        <boxGeometry args={[4.6, 0.3, 0.14]} />
        <meshStandardMaterial color="#080d15" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* status LED */}
      <mesh position={[-2.15, 0, 0.09]}>
        <sphereGeometry args={[0.09, 14, 14]} />
        <meshStandardMaterial
          ref={ledMat}
          color={active ? AMBER : "#1f2733"}
          emissive={active ? AMBER : "#1f2733"}
          emissiveIntensity={active ? 1 : 0.25}
        />
      </mesh>
      {/* name */}
      <Text
        position={[-1.7, 0, 0.09]}
        fontSize={0.085}
        font="/fonts/JetBrainsMono-Regular.ttf"
        color={active ? "#ffe9de" : "#9fb4c7"}
        anchorX="left"
        anchorY="middle"
        maxWidth={2.5}
      >
        {cert.name}
      </Text>
      {/* progress track */}
      <mesh position={[1.25, 0, 0.05]}>
        <boxGeometry args={[2.3, 0.045, 0.02]} />
        <meshStandardMaterial color="#121823" />
      </mesh>
      {/* progress fill */}
      <mesh position={[-0.1 + (cert.progress / 100) * 1.15, 0, 0.08]}>
        <boxGeometry args={[(cert.progress / 100) * 2.3, 0.07, 0.03]} />
        <meshStandardMaterial color={barColor} emissive={barColor} emissiveIntensity={active ? 1.1 : 0.25} />
      </mesh>
      {/* status text */}
      <Text
        position={[2.62, 0, 0.09]}
        fontSize={0.06}
        font="/fonts/JetBrainsMono-Regular.ttf"
        color={active ? TEAL : "#5d6f80"}
        anchorX="right"
        anchorY="middle"
      >
        {cert.status.toUpperCase()}
      </Text>
    </group>
  );
}

function CertRack() {
  return (
    <group position={[0, 0.16, -2.8]}>
      {/* rack chassis */}
      <mesh position={[0, 2.42, 0]}>
        <boxGeometry args={[5.0, 3.55, 0.42]} />
        <meshStandardMaterial color="#05080e" metalness={0.55} roughness={0.42} />
      </mesh>
      {certifications.map((c, i) => (
        <CertSlot key={c.name} cert={c} row={i} />
      ))}
      <Text
        position={[0, -0.75, 0.1]}
        fontSize={0.08}
        font="/fonts/JetBrainsMono-Regular.ttf"
        color="#3f5a4f"
        anchorX="center"
      >
        CERT_STATUS.RACK // 6 SLOTS — AMBER=IN_PROGRESS
      </Text>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Station 4: the contact terminal (CRT)                               */
/* ------------------------------------------------------------------ */

function ContactTerminal({ onOpen }: { onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const screenMat = useRef<THREE.MeshStandardMaterial>(null);
  const cursorMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (screenMat.current) screenMat.current.emissiveIntensity = hovered ? 0.55 : 0.3 + 0.06 * Math.sin(t * 5) + 0.04 * Math.sin(t * 13);
    if (cursorMat.current) cursorMat.current.opacity = Math.abs(Math.sin(t * 2.2));
  });
  return (
    <group position={[0, 1.25, -2.5]}>
      {/* pedestal */}
      <mesh position={[0, -1.0, 0]}>
        <boxGeometry args={[2.6, 0.6, 1.0]} />
        <meshStandardMaterial color="#04070c" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* CRT case */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          setHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
          setHovered(false);
        }}
        scale={hovered ? 1.04 : 1}
      >
        <mesh>
          <boxGeometry args={[2.5, 1.55, 0.68]} />
          <meshStandardMaterial color={hovered ? "#131f2b" : "#0a1018"} metalness={0.45} roughness={0.35} />
        </mesh>
        {/* ventilation slots */}
        <mesh position={[0, 0.58, 0.35]}>
          <boxGeometry args={[1.6, 0.07, 0.02]} />
          <meshStandardMaterial color="#101820" />
        </mesh>
        <mesh position={[0, 0.42, 0.35]}>
          <boxGeometry args={[1.6, 0.07, 0.02]} />
          <meshStandardMaterial color="#101820" />
        </mesh>
        {/* screen */}
        <mesh position={[0, -0.14, 0.36]}>
          <planeGeometry args={[2.15, 1.28]} />
          <meshStandardMaterial
            ref={screenMat}
            color="#02060a"
            emissive="#2bd9a0"
            emissiveIntensity={0.3}
            roughness={0.5}
          />
        </mesh>
        <Text position={[0, 0.38, 0.42]} fontSize={0.075} font="/fonts/JetBrainsMono-Regular.ttf" color="#c9ffef" maxWidth={2.0} anchorX="left">
          {"> init jj.portfolio"}
        </Text>
        <Text position={[0, 0.24, 0.42]} fontSize={0.075} font="/fonts/JetBrainsMono-Regular.ttf" color="#9fd9c2" anchorX="left">
          {"-> user: jj / pass: **********"}
        </Text>
        <Text position={[0, 0.1, 0.42]} fontSize={0.075} font="/fonts/JetBrainsMono-Regular.ttf" color="#9fd9c2" anchorX="left">
          {"-> shell available: /root/contact"}
        </Text>
        <Text position={[0, -0.08, 0.42]} fontSize={0.075} font="/fonts/JetBrainsMono-Regular.ttf" color="#eafff7" anchorX="left">
          {"$ ./reach_jj --open-contact"}
        </Text>
        <Text position={[0, -0.24, 0.42]} fontSize={0.075} font="/fonts/JetBrainsMono-Regular.ttf" color="#6f8c80" anchorX="left">
          {"> read /contact/notes"}
        </Text>
        {/* blinking cursor */}
        <mesh position={[-0.99, -0.24, 0.44]}>
          <planeGeometry args={[0.1, 0.17]} />
          <meshBasicMaterial ref={cursorMat} color={TEAL} transparent opacity={1} />
        </mesh>
      </group>
      <Text position={[0, -1.75, 0]} fontSize={0.09} font="/fonts/JetBrainsMono-Regular.ttf" color="#38e0a8" anchorX="center">
        TERMINAL // 127.0.0.1
      </Text>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Lazy station mount: only build each station's 3D content once,      */
/* after it has been visited, so the first load stays light.           */
/* ------------------------------------------------------------------ */

function StationContent({
  visited,
  lowPower,
  onOpenProject,
  onOpenContact,
}: {
  visited: number[];
  lowPower: boolean;
  onOpenProject: (p: Project) => void;
  onOpenContact: () => void;
}) {
  return (
    <group>
      {visited.includes(1) && <ServerCore lowPower={lowPower} />}
      {visited.includes(2) && <ProjectRack onOpen={onOpenProject} />}
      {visited.includes(3) && <CertRack />}
      {visited.includes(4) && <ContactTerminal onOpen={onOpenContact} />}
      <Room key="room" />
      {!lowPower && <ParticleStream count={1100} />}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* 2D overlay bits                                                     */
/* ------------------------------------------------------------------ */

const pill: React.CSSProperties = {
  position: "fixed",
  zIndex: 30,
  padding: "6px 14px",
  borderRadius: 9999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(10,12,20,0.6)",
  color: "rgba(255,255,255,0.85)",
  fontSize: 12,
  fontFamily: MONO,
  backdropFilter: "blur(6px)",
  pointerEvents: "none",
};

const navBtn: React.CSSProperties = {
  position: "fixed",
  zIndex: 40,
  top: "50%",
  transform: "translateY(-50%)",
  width: 48,
  height: 48,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(10,12,20,0.55)",
  color: "#fff",
  cursor: "pointer",
  backdropFilter: "blur(6px)",
  opacity: 0.7,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

function OverlayShell({
  station,
  goPrev,
  goNext,
  lowPower,
}: {
  station: StationNum;
  goPrev: () => void;
  goNext: () => void;
  lowPower: boolean;
}) {
  return (
    <>
      {/* station chip */}
      <div style={{ ...pill, top: 18, left: 18 }}>
        <span style={{ color: AMBER }}>●</span> {STATION_LABEL[station]}
      </div>

      {/* entry hero card */}
      <div
        style={{
          position: "fixed",
          left: 18,
          bottom: 74,
          zIndex: 20,
          maxWidth: 420,
          pointerEvents: "none",
          transition: "opacity 0.35s ease",
          ...(station === 1 ? {} : { opacity: 0, visibility: "hidden" }),
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", color: "#f5f7f8" }}>
          {heroContent.title}
        </div>
        <div style={{ fontSize: 14, fontFamily: MONO, color: TEAL, marginTop: 4 }}>{heroContent.subtitle}</div>
        <div style={{ fontSize: 13, fontFamily: MONO, color: AMBER, marginTop: 2 }}>{heroContent.tagline}</div>
        <div style={{ fontSize: 13, color: "#97a7b5", marginTop: 10, lineHeight: 1.55 }}>{heroContent.description}</div>
        <div style={{ marginTop: 10, display: "flex", gap: 8, color: "#6f8c96", fontSize: 12, fontFamily: MONO }}>
          <MapPin size={13} /> {heroContent.location}
        </div>
      </div>

      {/* hint line per station */}
      <div style={{ ...pill, top: 18, right: 18 }}>
        {station === 2 && "click a screen to open project"}
        {station === 3 && "amber = in progress · dim = planned"}
        {station === 4 && "click the terminal to reach jj"}
        {station === 1 && "scroll · arrows · keys"}
      </div>

      {!lowPower && (
        <div
          style={{
            position: "fixed",
            left: 50,
            right: 50,
            bottom: 34,
            zIndex: 5,
            height: 1,
            pointerEvents: "none",
            opacity: 0.5,
            background: "linear-gradient(90deg, transparent, rgba(0,161,83,0.5), transparent)",
          }}
        />
      )}

      <button aria-label="Previous station" onClick={goPrev} style={{ ...navBtn, left: 16 }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}>
        <ChevronLeft size={22} />
      </button>
      <button aria-label="Next station" onClick={goNext} style={{ ...navBtn, right: 16 }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}>
        <ChevronRight size={22} />
      </button>
      <div style={{ ...pill, bottom: 18, left: "50%", transform: "translateX(-50%)" }}>
        {station} / {STATION_TOTAL}
      </div>
    </>
  );
}

const modalShell: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(2,4,8,0.72)",
  backdropFilter: "blur(4px)",
  padding: 20,
};

const modalPanel: React.CSSProperties = {
  position: "relative",
  width: "100%",
  maxWidth: 640,
  maxHeight: "82vh",
  overflowY: "auto",
  background: "rgba(10,13,20,0.96)",
  border: `1px solid rgba(0,161,83,0.35)`,
  borderRadius: 12,
  padding: 26,
  color: "#d7e0e6",
  boxShadow: "0 0 40px rgba(0,161,83,0.12), 0 0 0 1px rgba(255,75,0,0.06)",
};

function field(label: string, value: ReactNode) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, fontFamily: MONO, color: TEAL, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 14, marginTop: 4, lineHeight: 1.6, color: "#c2cdd4" }}>{value}</div>
    </div>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalShell} onClick={onClose}>
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 12, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        style={modalPanel}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close project"
          onClick={onClose}
          style={{ position: "absolute", top: 14, right: 14, background: "transparent", border: "none", color: "#7f8ea0", cursor: "pointer" }}
        >
          <X size={20} />
        </button>
        <div style={{ fontFamily: MONO, fontSize: 11, color: AMBER }}>vol/{project.featured ? "featured" : "std"}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#f2f6f8", marginTop: 6 }}>{project.title}</div>
        <div style={{ fontFamily: MONO, fontSize: 13, color: TEAL, marginTop: 2 }}>{project.subtitle}</div>
        {field("Description", project.description)}
        {field("Problem", project.problem)}
        {field("What JJ did", project.whatJJDid)}
        {field("Result", project.result)}
        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {project.techStack.map((t) => (
            <span key={t} style={{ fontFamily: MONO, fontSize: 11, padding: "3px 8px", borderRadius: 9999, border: "1px solid rgba(255,75,0,0.4)", color: "#ffd9c7" }}>
              {t}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" style={{ ...linkBtn, borderColor: "rgba(0,161,83,0.5)", color: "#7ff0c8" }}>
              <ExternalLink size={14} /> Live
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" style={linkBtn}>
              <GitBranch size={14} /> GitBranch
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

const linkBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontFamily: MONO,
  fontSize: 12,
  padding: "7px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#dbe4ea",
  textDecoration: "none",
  cursor: "pointer",
};

function ContactModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalShell} onClick={onClose}>
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        style={{ ...modalPanel, maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close contact"
          onClick={onClose}
          style={{ position: "absolute", top: 14, right: 14, background: "transparent", border: "none", color: "#7f8ea0", cursor: "pointer" }}
        >
          <X size={20} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 11, color: TEAL }}>
          <TerminalSquare size={15} /> /root/contact — transmit
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#f2f6f8", marginTop: 10 }}>Contact</div>
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <a href="mailto:jj@jewellcore.com" style={{ ...linkBtn, justifyContent: "flex-start" }}>
            <Mail size={15} /> jj@jewellcore.com
          </a>
          <a href={`https://${contactInfo.github}`} target="_blank" rel="noreferrer" style={{ ...linkBtn, justifyContent: "flex-start" }}>
            <GitBranch size={15} /> {contactInfo.github}
          </a>
          <a href={`https://${contactInfo.linkedin}`} target="_blank" rel="noreferrer" style={{ ...linkBtn, justifyContent: "flex-start" }}>
            <Contact size={15} /> {contactInfo.linkedin}
          </a>
          <div style={{ ...linkBtn, justifyContent: "flex-start", cursor: "default", opacity: 0.7 }}>
            <MapPin size={15} /> {contactInfo.location}
          </div>
        </div>
        <div style={{ marginTop: 18, fontFamily: MONO, fontSize: 11, color: "#6f8c96", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14 }}>
          resume: ask at jj@jewellcore.com — I&apos;ll send a copy (kept out of the repo on purpose).
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Root component                                                      */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Debug aid: when the page is loaded with ?proj=1, project each       */
/* interactive 3D target's center to DOM pixels so E2E tests can click */
/* exact spots. Inert during normal operation.                         */
/* ------------------------------------------------------------------ */

function ProjectionReporter() {
  const { camera, size } = useThree();
  const enabled = useRef(false);
  useEffect(() => {
    enabled.current = new URLSearchParams(window.location.search).get("proj") === "1";
    return () => {
      enabled.current = false;
      delete (window as Window & { __proj?: unknown }).__proj;
    };
  }, []);
  useFrame(() => {
    if (!enabled.current) return;
    const v = new THREE.Vector3();
    const targets: Record<string, Vec3> = { contact: [0, 1.25, -2.5] };
    projects.forEach((p, i) => {
      targets[p.title] = [(i - 2) * 2.5, 2.25, -2.3];
    });
    const out: Record<string, [number, number]> = {};
    for (const [k, w] of Object.entries(targets)) {
      v.set(w[0], w[1], w[2]).project(camera);
      out[k] = [Math.round((v.x * 0.5 + 0.5) * size.width), Math.round((-v.y * 0.5 + 0.5) * size.height)];
    }
    (window as Window & { __proj?: Record<string, [number, number]> }).__proj = out;
  });
  return null;
}

export function GridScene() {
  const [station, setStation] = useState<StationNum>(1);
  const [visited, setVisited] = useState<number[]>([1]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [showContact, setShowContact] = useState(false);
  const lowPower = useLowPower();

  // Mirror of `station` for the nav callbacks so they never go stale.
  const stationRef = useRef<StationNum>(1);
  useEffect(() => {
    stationRef.current = station;
  }, [station]);

  const goTo = useCallback((n: number) => {
    const s = Math.min(4, Math.max(1, n)) as StationNum;
    setStation(s);
    setVisited((v) => (v.includes(s) ? v : [...v, s]));
  }, []);

  const goPrev = useCallback(() => {
    const s = stationRef.current;
    const next = (s === 1 ? STATION_TOTAL : s - 1) as StationNum;
    setStation(next);
    setVisited((v) => (v.includes(next) ? v : [...v, next]));
  }, []);

  const goNext = useCallback(() => {
    const s = stationRef.current;
    const next = (s === STATION_TOTAL ? 1 : s + 1) as StationNum;
    setStation(next);
    setVisited((v) => (v.includes(next) ? v : [...v, next]));
  }, []);

  // wheel + keyboard navigation
  useEffect(() => {
    const modalOpen = selected !== null || showContact;
    const onWheel = (e: WheelEvent) => {
      // A modal is showing: let it scroll naturally — never change station underneath.
      if (modalOpen) return;
      e.preventDefault();
      if (e.deltaY > 40) goNext();
      else if (e.deltaY < -40) goPrev();
    };
    const onKey = (e: KeyboardEvent) => {
      if (modalOpen) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); goNext(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); goPrev(); }
      else if (e.key === "Home") goTo(1);
      else if (e.key === "End") goTo(4);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [goPrev, goNext, goTo, selected, showContact]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <Canvas camera={{ fov: 60, near: 0.1, far: 120, position: CAMERA_POS[1] }} dpr={lowPower ? [1, 1.5] : [1, 2]} gl={{ antialias: true, powerPreference: "high-performance" }} style={{ background: VOID_BG, overflow: "hidden" }}>
        <StationContent
          visited={visited}
          lowPower={lowPower}
          onOpenProject={setSelected}
          onOpenContact={() => setShowContact(true)}
        />
        <CameraRig station={station} />
        <ProjectionReporter />
      </Canvas>

      <OverlayShell station={station} goPrev={goPrev} goNext={goNext} lowPower={lowPower} />

      <AnimatePresence>
        {selected && <ProjectModal key="project" project={selected} onClose={() => setSelected(null)} />}
        {showContact && <ContactModal key="contact" onClose={() => setShowContact(false)} />}
      </AnimatePresence>
    </div>
  );
}