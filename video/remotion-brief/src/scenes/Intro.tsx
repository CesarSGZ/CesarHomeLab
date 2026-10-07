import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Slam } from "../components/Kinetic";
import { Turbine, World } from "../components/Worlds";
import { C, condensed, ease, expanded, FPS, inOut, mono } from "../theme";

// 0–6 s · "Who is César Solla González? — in a nutshell." The turbine spools up into the drop.
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // Accumulated rotation: speed grows quadratically so the fan visibly spools up towards 6 s.
  const spin = 0.4 * t + 0.32 * t * t;
  const out = ease(frame, [5.55, 5.95], [1, 0], inOut);
  return (
    <AbsoluteFill style={{ opacity: out, scale: ease(frame, [5.55, 5.95], [1, 1.06], inOut) }}>
      <div style={{ position: "absolute", right: 40, top: 120, width: 900, height: 840, opacity: ease(frame, [0, 1.2], [0, 1]), scale: ease(frame, [0, 6], [0.85, 1.12], inOut) }}>
        <World width={900} height={840} rim="#83d7ed"><Turbine spin={spin} /></World>
      </div>
      <div style={{ position: "absolute", left: 170, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", width: 1100 }}>
        <Slam at={0.5} style={{ ...expanded(140), color: C.hud }}>Who is</Slam>
        <Slam at={2} style={{ ...condensed(230), color: C.fg }}>César Solla</Slam>
        <Slam at={2.5} style={{ ...condensed(230), color: C.fg }}>González?</Slam>
        <div style={{ ...mono(32, C.fg), display: "flex", alignItems: "center", gap: 24, marginTop: 40, opacity: ease(frame, [4, 4.3], [0, 1]) }}>
          <span style={{ width: 120, height: 3, background: C.hud, display: "block", transformOrigin: "0 50%", scale: `${ease(frame, [4, 4.6], [0, 1])} 1` }} />
          <span style={{ translate: `${ease(frame, [4, 4.6], [-20, 0])}px 0` }}>In a nutshell</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
