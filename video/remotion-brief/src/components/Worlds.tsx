import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { FPS } from "../theme";

/** Shared studio lighting so the three disciplines read as one family (same look as the website). */
const Lights: React.FC<{ rim: string }> = ({ rim }) => (
  <>
    <ambientLight intensity={0.65} color="#d3e6ff" />
    <directionalLight position={[-3, 4, 5]} intensity={3.5} color="#f6fbff" />
    <directionalLight position={[3, -1, -2]} intensity={4} color={rim} />
    <pointLight position={[0, -3, 3]} intensity={9} />
  </>
);

/** Engineering: the turbine. `spin` is accumulated rotation in radians, so speed can ramp smoothly. */
export const Turbine: React.FC<{ spin: number; tilt?: [number, number] }> = ({ spin, tilt = [0.38, -0.42] }) => {
  const blade = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0.28, -0.045); s.bezierCurveTo(0.52, -0.1, 0.79, -0.21, 1.12, -0.07); s.lineTo(1.16, 0.09); s.bezierCurveTo(0.77, -0.035, 0.52, 0.08, 0.3, 0.09); s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.014, bevelThickness: 0.014, curveSegments: 12 });
  }, []);
  return (
    <group rotation={[tilt[0], tilt[1], 0.1]}>
      <group rotation={[0, 0, spin]}>
        {Array.from({ length: 22 }, (_, i) => (
          <mesh key={i} geometry={blade} rotation={[0.25, 0, (i * Math.PI * 2) / 22]}>
            <meshStandardMaterial color="#5dbbda" metalness={0.48} roughness={0.3} emissive="#5dbbda" emissiveIntensity={0.08} />
          </mesh>
        ))}
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.27]}>
        <coneGeometry args={[0.29, 0.65, 48]} />
        <meshStandardMaterial color="#cee9ef" metalness={0.5} roughness={0.25} />
      </mesh>
      <mesh><torusGeometry args={[1.21, 0.036, 8, 160]} /><meshStandardMaterial color="#cee9ef" metalness={0.5} roughness={0.25} /></mesh>
      <mesh><torusGeometry args={[1.28, 0.009, 8, 160]} /><meshBasicMaterial color="#83d7ed" /></mesh>
      {Array.from({ length: 44 }, (_, i) => {
        const a = (i * Math.PI * 2) / 44;
        return <mesh key={i} position={[Math.cos(a) * 1.38, Math.sin(a) * 1.38, 0]} rotation={[0, 0, a]}><boxGeometry args={[0.035, 0.006, 0.006]} /><meshBasicMaterial color="#83d7ed" /></mesh>;
      })}
    </group>
  );
};

/** Management: orbital assembly with satellites travelling each ring. */
export const Orbits: React.FC<{ t: number }> = ({ t }) => (
  <group rotation={[0.2 + Math.sin(t * 0.3) * 0.1, -0.25 + t * 0.15, -0.2 + t * 0.05]}>
    <mesh><icosahedronGeometry args={[0.42, 2]} /><meshStandardMaterial color="#e5f0cd" metalness={0.48} roughness={0.3} /></mesh>
    <mesh rotation={[t * 0.3, t * 0.2, 0]}><icosahedronGeometry args={[0.55, 1]} /><meshBasicMaterial color="#d5e99a" wireframe transparent opacity={0.25} /></mesh>
    {[0, 1, 2, 3].map((i) => {
      const r = 0.86 + i * 0.13;
      return (
        <group key={i} rotation={[0.45 + i * 0.55, 0.25 + i * 0.8, i * 0.5]}>
          <mesh><torusGeometry args={[r, 0.034 + (i % 2) * 0.013, 10, 160]} /><meshStandardMaterial color="#b8ce7d" metalness={0.48} roughness={0.3} emissive="#b8ce7d" emissiveIntensity={0.07} /></mesh>
          {[0, 1].map((j) => {
            const a = j * Math.PI + i + t * (i % 2 ? -1 : 1) * (0.9 + i * 0.25);
            return <mesh key={j} position={[Math.cos(a) * r, Math.sin(a) * r, 0]}><sphereGeometry args={[0.06, 14, 14]} /><meshBasicMaterial color="#f3ffd6" /></mesh>;
          })}
        </group>
      );
    })}
  </group>
);

/** Data: flowing filaments with signal pulses. */
export const DataField: React.FC<{ t: number }> = ({ t }) => {
  const curves = useMemo(() => Array.from({ length: 42 }, (_, j) => {
    const phase = (j / 42) * Math.PI * 2, pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 110; k++) { const u = (k / 110) * Math.PI * 2, r = 0.8 + 0.25 * Math.cos(u * 3 + phase); pts.push(new THREE.Vector3(r * Math.cos(u), r * Math.sin(u), 0.25 * Math.sin(u * 3 + phase) + 0.36 * Math.sin(phase))); }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    return { curve, geo: new THREE.TubeGeometry(curve, 110, j % 7 === 0 ? 0.009 : 0.0035, 6, true), color: new THREE.Color().setHSL(0.71 + j / 420, 0.5, 0.5 + j / 180), strong: j % 7 === 0 };
  }), []);
  return (
    <group scale={1.18} rotation={[0.75 + Math.sin(t * 0.3) * 0.1, 0.2 + t * 0.12, -0.4 - t * 0.05]}>
      {curves.map((c, j) => <mesh key={j} geometry={c.geo}><meshBasicMaterial color={c.color} transparent opacity={c.strong ? 0.95 : 0.65} /></mesh>)}
      {curves.filter((_, j) => j % 3 === 0).map((c, j) => <mesh key={`p${j}`} position={c.curve.getPointAt((j / 14 + t * (0.08 + (j % 4) * 0.02)) % 1)}><sphereGeometry args={[0.035, 10, 10]} /><meshBasicMaterial color="#f4ecff" /></mesh>)}
    </group>
  );
};

/** Wraps a world in its own canvas. */
export const World: React.FC<{ width: number; height: number; rim: string; z?: number; children: React.ReactNode }> = ({ width, height, rim, z = 5.6, children }) => (
  <ThreeCanvas width={width} height={height} camera={{ fov: 34, position: [0, 0, z] }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
    <Lights rim={rim} />
    {children}
  </ThreeCanvas>
);

export const useSeconds = () => useCurrentFrame() / FPS;
