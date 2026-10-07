import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DataField, Orbits, Turbine, World } from "../components/Worlds";
import { back, beatPulse, C, DISPLAY, ease, FPS, inOut, mono } from "../theme";

type Column = { title: string; color: string; rim: string; skills: string[]; at: number; world: "eng" | "mgmt" | "data" };
const COLUMNS: Column[] = [
  { title: "Engineering", color: C.eng, rim: "#83d7ed", world: "eng", at: 0.5, skills: ["Requirements & traceability", "V&V and testing", "Means of Compliance", "ARP4754A · ISO 15288", "DOORS & CAMEO", "Design reviews · SRR PDR CDR"] },
  { title: "Management", color: C.mgmt, rim: "#d5e99a", world: "mgmt", at: 3.5, skills: ["Programme risk", "Integrated schedule", "Budget & cost control", "Stakeholder management", "Executive reporting", "MS Project & BigPicture"] },
  { title: "Data", color: C.data, rim: "#bba8f1", world: "data", at: 6.5, skills: ["SAP BW / HANA", "Python", "KPI design", "Data visualisation", "Automation · VBA & scripts", "MATLAB & Simulink"] },
];

// 48–58 s · each discipline arrives with its 3D world; skills land on eighth notes.
export const Skills: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ padding: "140px 150px 150px", display: "flex", flexDirection: "column", gap: 10, opacity: ease(frame, [9.65, 9.95], [1, 0], inOut) }}>
      <div style={{ ...mono(24), opacity: ease(frame, [0, 0.3], [0, 1]) }}>Skills · mapped to each discipline</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40, flex: 1 }}>
        {COLUMNS.map((col) => {
          const local = t - col.at;
          const pulse = local > 0 ? beatPulse(frame, col.at, 0.5, 0.3) : 0;
          return (
            <div key={col.title} style={{ display: "flex", flexDirection: "column", opacity: ease(frame, [col.at, col.at + 0.25], [0, 1]) }}>
              <div style={{ height: 250, position: "relative", scale: ease(frame, [col.at, col.at + 0.7], [0.4, 1], back) }}>
                <World width={500} height={250} rim={col.rim} z={4.4}>
                  {col.world === "eng" ? <Turbine spin={t * 1.6} tilt={[0.5, -0.5]} /> : col.world === "mgmt" ? <Orbits t={t} /> : <DataField t={t} />}
                </World>
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 76, lineHeight: 1, fontWeight: 860, fontStretch: "70%", letterSpacing: "-.02em", color: col.color, paddingBottom: 16, borderBottom: `4px solid ${col.color}`, translate: `0 ${ease(frame, [col.at, col.at + 0.5], [60, 0])}px` }}>{col.title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 18 }}>
                {col.skills.map((s, i) => {
                  const at = col.at + 0.5 + i * 0.25;
                  return (
                    <div key={s} style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 600, fontStretch: "90%", color: C.fg, padding: "11px 16px", borderRadius: 10, background: "rgba(12,26,32,.88)", border: `1.5px solid ${i === Math.floor(local * 2) % 6 && t > 9 ? col.color : C.line}`, opacity: ease(frame, [at, at + 0.15], [0, 1]), translate: `${ease(frame, [at, at + 0.35], [-40, 0], back)}px 0`, boxShadow: `0 0 ${pulse * 14}px ${col.color}22` }}>
                      {s}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
