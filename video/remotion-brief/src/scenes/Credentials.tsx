import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { back, C, DISPLAY, ease, FPS, inOut, mono } from "../theme";

type Pass = { code: string; title: string; issuer: string; year: string; domain: string; color: string; at: number };
const PASSES: Pass[] = [
  { code: "PMP", title: "Project Management Professional", issuer: "Project Management Institute", year: "2026", domain: "Management", color: C.mgmt, at: 0.5 },
  { code: "MSc", title: "Aerospace Engineering", issuer: "Universidad Europea de Madrid", year: "2025", domain: "Engineering", color: C.eng, at: 2.5 },
  { code: "BSc", title: "Aerospace Engineering", issuer: "Technical University of Madrid", year: "2021", domain: "Engineering", color: C.eng, at: 4.5 },
  { code: "SF", title: "Salesforce Administrator", issuer: "Certified admin & functional developer", year: "2022", domain: "Data", color: C.data, at: 6.5 },
];

// A credential presented as a boarding pass: stub with the code, perforation, flight details.
const BoardingPass: React.FC<{ p: Pass }> = ({ p }) => {
  const frame = useCurrentFrame();
  const flip = ease(frame, [p.at, p.at + 0.7], [-95, 0], back);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", borderRadius: 20, overflow: "hidden", background: "rgba(12,26,32,.9)", border: `2px solid ${C.line}`, transform: `perspective(1400px) rotateX(${flip}deg)`, transformOrigin: "50% 0%", opacity: ease(frame, [p.at, p.at + 0.2], [0, 1]), boxShadow: `0 30px 60px rgba(0,0,0,.35)` }}>
      <div style={{ background: p.color, color: C.bg, padding: "26px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
        <span style={{ ...mono(16, C.bg) }}>{p.domain}</span>
        <span style={{ fontFamily: DISPLAY, fontSize: 116, lineHeight: 0.9, fontWeight: 880, fontStretch: "66%", letterSpacing: "-.03em" }}>{p.code}</span>
        <span style={{ position: "absolute", right: -10, top: 0, bottom: 0, width: 20, backgroundImage: `radial-gradient(circle at 10px 12px, ${C.bg} 6px, transparent 7px)`, backgroundSize: "20px 24px" }} />
      </div>
      <div style={{ padding: "26px 34px", display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
        <div style={{ display: "flex", justifyContent: "space-between", ...mono(16, C.muted) }}><span>Credential</span><span>Issued {p.year}</span></div>
        <div style={{ fontFamily: DISPLAY, fontSize: 50, lineHeight: 1.04, fontWeight: 780, fontStretch: "84%", color: C.fg }}>{p.title}</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 26, color: C.muted }}>{p.issuer}</div>
        <div style={{ height: 26, marginTop: 6, backgroundImage: `repeating-linear-gradient(90deg, ${C.fg} 0 3px, transparent 3px 7px, ${C.fg} 7px 8px, transparent 8px 13px)`, opacity: 0.35, width: `${ease(frame, [p.at + 0.4, p.at + 1], [0, 100])}%` }} />
      </div>
    </div>
  );
};

// 32–40 s · four credentials, one per bar, colour-coded by domain.
export const Credentials: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const legend: [string, string][] = [["Engineering", C.eng], ["Management", C.mgmt], ["Data", C.data]];
  return (
    <AbsoluteFill style={{ padding: "150px 170px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 30, opacity: ease(frame, [7.6, 7.95], [1, 0], inOut) }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: ease(frame, [0, 0.3], [0, 1]) }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 84, fontWeight: 860, fontStretch: "70%", color: C.fg, letterSpacing: "-.03em" }}>Cleared to lead.</div>
        <div style={{ display: "flex", gap: 14 }}>
          {legend.map(([label, color]) => {
            const active = PASSES.some((p) => p.domain === label && t >= p.at && t < p.at + 0.6);
            return <span key={label} style={{ ...mono(19, active ? C.bg : color), background: active ? color : "transparent", border: `2px solid ${color}`, borderRadius: 8, padding: "9px 14px", scale: active ? 1.08 : 1 }}>{label}</span>;
          })}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }}>
        {PASSES.map((p) => <BoardingPass key={p.code} p={p} />)}
      </div>
    </AbsoluteFill>
  );
};
