import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { back, C, DISPLAY, ease, expo, FPS, inOut, mono } from "../theme";

type Role = { logo: string; light?: boolean; title: string; sub: string; dates: string; color: string; domain: string; at: number; spot: number; now?: boolean };

const CONSULTING: Role[] = [
  { logo: "assets/ey.png", light: true, title: "R&D Consultant", sub: "Technology & innovation incentives · defence, AI, energy", dates: "Nov 2021 — Apr 2022", color: C.eng, domain: "Engineering · R&D", at: 1, spot: 11.5 },
  { logo: "assets/deloitte.svg", title: "Salesforce Analyst", sub: "CRM platform for Stellantis · certified administrator", dates: "May 2022 — Oct 2022", color: C.data, domain: "Data · Platforms", at: 3, spot: 12.6 },
];
const AIRBUS: Role[] = [
  { logo: "", title: "BI & SAP BW/HANA Technical Expert", sub: "Procurement & supply-chain analytics, KPIs and automation", dates: "Oct 2022 — May 2023", color: C.data, domain: "Data", at: 5.5, spot: 13.7 },
  { logo: "", title: "Powerplant Systems Engineer · Eurodrone", sub: "Requirements, V&V and testing across engine, nacelle and avionics", dates: "May 2023 — Apr 2024", color: C.eng, domain: "Engineering", at: 7.5, spot: 14.8 },
  { logo: "", title: "Programme Management Office · A330 MRTT & Derivative Aircraft", sub: "Strategic R&D · risk, schedule, budget and executive reporting", dates: "Apr 2024 — Present", color: C.mgmt, domain: "Management", at: 9.5, spot: 15.9, now: true },
];

const Card: React.FC<{ role: Role; compact?: boolean }> = ({ role, compact }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const lit = t >= role.spot && t < role.spot + (role.now ? 1.6 : 1.1) ? 1 : 0;
  const glow = ease(frame, [role.spot, role.spot + 0.3], [0, 1]) * (role.now ? 1 : ease(frame, [role.spot + 0.9, role.spot + 1.2], [1, 0]));
  const reveal = ease(frame, [role.at, role.at + 0.6], [100, 0]);
  return (
    <div style={{
      position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", gap: compact ? 6 : 10,
      padding: compact ? "20px 30px 22px 38px" : "26px 34px 28px 40px", borderRadius: 18, background: "rgba(12,26,32,.86)",
      border: `2px solid ${glow > 0.01 ? role.color : C.line}`, boxShadow: `0 0 ${60 * glow}px ${role.color}55`,
      clipPath: `inset(0 ${reveal}% 0 0 round 18px)`, translate: `${ease(frame, [role.at, role.at + 0.6], [80, 0])}px 0`,
      scale: 1 + glow * 0.025, opacity: lit || t < 11.5 ? 1 : 0.82, flex: 1,
    }}>
      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: role.color }} />
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ ...mono(19), color: role.color, whiteSpace: "nowrap" }}>{role.dates}</span>
        <span style={{ ...mono(15, role.color), border: `1.5px solid ${role.color}`, borderRadius: 6, padding: "5px 9px", whiteSpace: "nowrap" }}>{role.domain}</span>
        {role.now ? <span style={{ ...mono(15, C.bg), background: C.hud, borderRadius: 6, padding: "6px 10px", scale: 1 + Math.max(0, Math.sin(t * Math.PI * 2)) * 0.08 }}>NOW</span> : null}
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: compact ? 44 : 52, lineHeight: 1.02, fontWeight: 800, fontStretch: "80%", letterSpacing: "-.02em", color: C.fg, translate: `0 ${ease(frame, [role.at + 0.15, role.at + 0.7], [30, 0])}px`, opacity: ease(frame, [role.at + 0.15, role.at + 0.5], [0, 1]) }}>{role.title}</div>
      <div style={{ fontFamily: DISPLAY, fontSize: compact ? 25 : 27, lineHeight: 1.3, color: C.muted, opacity: ease(frame, [role.at + 0.45, role.at + 0.9], [0, 1]) }}>{role.sub}</div>
    </div>
  );
};

const GroupLabel: React.FC<{ at: number; logos: React.ReactNode; title: string; sub: string; color: string }> = ({ at, logos, title, sub, color }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: ease(frame, [at, at + 0.3], [0, 1]), translate: `0 ${ease(frame, [at, at + 0.5], [-30, 0])}px`, marginBottom: 18 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center", scale: ease(frame, [at, at + 0.5], [0.6, 1], back) }}>{logos}</div>
      <div>
        <div style={{ ...mono(24, color), whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ ...mono(17, C.muted), marginTop: 6 }}>{sub}</div>
      </div>
    </div>
  );
};

// 14–32 s · every role on one board: consulting first, then the Airbus chapter, then a spotlight pass.
export const Experience: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const exit = ease(frame, [17.6, 17.95], [1, 0], inOut);
  const climb = ease(frame, [5.5, 11.2], [0, 1], inOut);
  return (
    <AbsoluteFill style={{ padding: "140px 130px 140px", opacity: exit }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 30, opacity: ease(frame, [0, 0.4], [0, 1]) }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 84, fontWeight: 860, fontStretch: "70%", letterSpacing: "-.03em", color: C.fg }}>Experience</div>
        <div style={{ ...mono(22) }}>Five roles · two chapters · one direction: up</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "700px 1fr", gap: 56, marginTop: 26, flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <GroupLabel at={0.5} color={C.hud} title="Consulting · 2021–22" sub="Big Four · EY and Deloitte"
            logos={<>
              <span style={{ background: "#f3f4ee", borderRadius: 8, padding: "4px 10px", display: "flex" }}><Img src={staticFile("assets/ey.png")} style={{ height: 52 }} /></span>
              <Img src={staticFile("assets/deloitte.svg")} style={{ height: 30 }} />
            </>} />
          <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
            {CONSULTING.map((r) => <Card key={r.title} role={r} />)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
          <GroupLabel at={5} color={C.hud} title="Airbus Defence and Space · 2022 → now" sub="AGGP Talents Programme · 3 progressive roles"
            logos={<Img src={staticFile("assets/airbus.svg")} style={{ height: 40 }} />} />
          <div style={{ display: "flex", flexDirection: "column-reverse", gap: 16, flex: 1, paddingRight: 70 }}>
            {AIRBUS.map((r) => <Card key={r.title} role={r} compact />)}
          </div>
          {/* climb indicator: responsibility rising through the Airbus chapter */}
          <div style={{ position: "absolute", right: 18, top: 110, bottom: 6, width: 4, background: C.line, borderRadius: 2 }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${climb * 100}%`, background: C.hud, borderRadius: 2, boxShadow: `0 0 18px ${C.hud}` }} />
            <div style={{ position: "absolute", left: -9, bottom: `calc(${climb * 100}% - 11px)`, width: 22, height: 22, borderRadius: "50%", background: C.hud, opacity: climb > 0 ? 1 : 0 }} />
          </div>
          <div style={{ ...mono(14), position: "absolute", right: -46, top: 120, writingMode: "vertical-rl", rotate: "180deg", opacity: climb }}>Increasing responsibility ↑</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, pointerEvents: "none", background: `linear-gradient(100deg, transparent ${ease(frame, [11, 17], [-30, 130], expo) - 15}%, rgba(207,232,143,.06) ${ease(frame, [11, 17], [-30, 130], expo)}%, transparent ${ease(frame, [11, 17], [-30, 130], expo) + 15}%)`, opacity: t > 11 ? 1 : 0 }} />
    </AbsoluteFill>
  );
};
