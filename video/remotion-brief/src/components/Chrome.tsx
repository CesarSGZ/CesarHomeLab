import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { beatPulse, C, ease, FPS, inOut, mono } from "../theme";

const SECTIONS: [number, string][] = [[0, "In a nutshell"], [6, "Profile"], [14, "Experience"], [32, "Certifications"], [40, "Languages"], [48, "Skills"], [58, "Ready"]];
const drumsOn = (t: number) => t >= 6 && t < 58;

/** Grid, drifting glows and an attitude ladder that banks through the flight. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / FPS;
  const pulse = drumsOn(t) ? beatPulse(frame, 0, 0.5, 0.4) : 0;
  const ladder = useMemo(() => {
    const paths: string[] = [];
    for (let d = -40; d <= 40; d += 5) {
      if (!d) continue;
      const y = -d * 18, w = d % 10 ? 140 : 230, tk = d > 0 ? 12 : -12;
      paths.push(`M${-w} ${y + tk}V${y}H-80M80 ${y}H${w}V${y + tk}`);
    }
    return paths;
  }, []);
  const p = frame / durationInFrames;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 1400, height: 1400, left: 900, top: -560, borderRadius: "50%", background: "radial-gradient(circle, rgba(36,86,110,.6), transparent 62%)", translate: `${interpolate(p, [0, 1], [0, -800])}px 0`, scale: interpolate(p, [0, 1], [1, 1.3]) }} />
      <div style={{ position: "absolute", width: 1200, height: 1200, left: -500, top: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,178,245,.12), transparent 62%)", translate: `${interpolate(p, [0, 1], [0, 1000])}px 0` }} />
      <div style={{ position: "absolute", inset: -60, backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: "120px 120px", opacity: 0.3 + pulse * 0.22, maskImage: "radial-gradient(ellipse 70% 65% at 50% 50%, #000 30%, transparent 80%)" }} />
      <svg viewBox="-1200 -800 2400 1600" style={{ position: "absolute", left: "50%", top: "50%", width: 2400, height: 1600, marginLeft: -1200, marginTop: -800 }}>
        <g transform={`rotate(${Math.sin(t * 0.18) * 5})`}>
          <g transform={`translate(0 ${interpolate(Math.sin(t * 0.09), [-1, 1], [-180, 300])})`} stroke="#8fd8f0" strokeWidth={1.4} fill="none" opacity={0.14}>
            <line x1={-1400} x2={1400} y1={0} y2={0} stroke={C.hud} strokeWidth={1.6} opacity={2.8} />
            {ladder.map((d, i) => <path key={i} d={d} strokeDasharray={i < 8 ? "14 9" : undefined} />)}
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Avionics frame: corners that punch on the kick, timecode, altitude, section and progress. */
export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / FPS;
  const down = drumsOn(t) ? beatPulse(frame, 0, 2, 0.45) : 0;
  const beat = drumsOn(t) ? beatPulse(frame, 0, 0.5, 0.3) : 0;
  const scale = 1 + beat * 0.06 + down * 0.06;
  const section = [...SECTIONS].reverse().find(([s]) => t >= s)?.[1] ?? "";
  const altitude = Math.round(interpolate(t, [0, 6, 14, 32, 58, 62], [0, 2000, 9000, 35000, 39000, 0], { extrapolateRight: "clamp", easing: inOut }) / 10) * 10;
  const intro = ease(frame, [0.1, 0.8], [0, 1]);
  const corner = (pos: React.CSSProperties, w: string): React.CSSProperties => ({ position: "absolute", width: 46, height: 46, border: `0 solid ${C.hud}`, borderWidth: w, opacity: 0.8 * intro, scale, ...pos });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={corner({ left: 60, top: 56, transformOrigin: "0 0" }, "2px 0 0 2px")} />
      <div style={corner({ right: 60, top: 56, transformOrigin: "100% 0" }, "2px 2px 0 0")} />
      <div style={corner({ left: 60, bottom: 56, transformOrigin: "0 100%" }, "0 0 2px 2px")} />
      <div style={corner({ right: 60, bottom: 56, transformOrigin: "100% 100%" }, "0 2px 2px 0")} />
      <div style={{ ...mono(17), position: "absolute", left: 128, top: 66, display: "flex", gap: 26, alignItems: "center", opacity: intro }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.hud, display: "inline-block" }} />
        <span>CSG</span><span>{section}</span>
      </div>
      <div style={{ ...mono(17), position: "absolute", right: 128, top: 66, display: "flex", gap: 26, opacity: intro }}>
        <span>T+<b style={{ color: C.fg, fontWeight: 500 }}>{String(Math.floor(t / 60)).padStart(2, "0")}:{String(Math.floor(t % 60)).padStart(2, "0")}</b></span>
        <span>ALT <b style={{ color: C.fg, fontWeight: 500 }}>{String(altitude).padStart(5, "0")}</b></span>
      </div>
      <div style={{ ...mono(17, "#b9c8c2"), position: "absolute", left: 128, bottom: 64, opacity: intro }}>40.4168° N · 03.7038° W</div>
      <div style={{ ...mono(17), position: "absolute", right: 128, bottom: 64, opacity: intro }}>cesar-solla.pages.dev</div>
      <div style={{ position: "absolute", left: 128, right: 128, bottom: 100, height: 2, background: C.line }}>
        <div style={{ position: "absolute", inset: 0, background: C.hud, transformOrigin: "0 50%", scale: `${frame / durationInFrames} 1` }} />
      </div>
      {/* section-change flash */}
      <AbsoluteFill style={{ background: C.hud, mixBlendMode: "screen", opacity: Math.max(...SECTIONS.slice(1).map(([s]) => (t >= s && t < s + 0.45 ? 0.2 * (1 - (t - s) / 0.45) : 0))) }} />
    </AbsoluteFill>
  );
};
