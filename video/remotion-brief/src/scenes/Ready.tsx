import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Slam } from "../components/Kinetic";
import { C, condensed, DISPLAY, ease, expanded, FPS, inOut, mono } from "../theme";

// Runway in perspective rolling towards the viewer: the landing that closes the flight.
const Runway: React.FC = () => {
  const frame = useCurrentFrame();
  const roll = (frame / FPS) * 220;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 760, perspective: 700, perspectiveOrigin: "50% 0%", overflow: "hidden", maskImage: "linear-gradient(transparent 0, transparent 35%, #000 80%)", opacity: ease(frame, [0, 1], [0, 0.8]) }}>
      <div style={{ position: "absolute", left: "50%", bottom: "-8%", width: 620, height: 2800, marginLeft: -310, transform: "rotateX(78deg)", transformOrigin: "50% 100%", background: "linear-gradient(90deg, transparent, rgba(143,216,240,.06) 10%, rgba(143,216,240,.1) 50%, rgba(143,216,240,.06) 90%, transparent)" }}>
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 9, marginLeft: -4, backgroundImage: "repeating-linear-gradient(0deg, #cfe88f 0 70px, transparent 70px 160px)", backgroundPositionY: roll, opacity: 0.5 }} />
        {[0, 1].map((side) => <div key={side} style={{ position: "absolute", top: 0, bottom: 0, [side ? "right" : "left"]: 0, width: 8, backgroundImage: "repeating-linear-gradient(0deg, #8fd8f0 0 10px, transparent 10px 80px)", backgroundPositionY: roll, filter: "drop-shadow(0 0 6px #8fd8f0)" }} />)}
      </div>
    </div>
  );
};

// 58–64 s · ready for the next mission.
export const Ready: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill>
      <Runway />
      <AbsoluteFill style={{ padding: "150px 170px", display: "grid", gridTemplateColumns: "500px 1fr", gap: 110, alignItems: "center" }}>
        <div style={{ width: 500, height: 640, borderRadius: "250px 250px 18px 18px", overflow: "hidden", border: "2px solid rgba(207,232,143,.6)", clipPath: `inset(${ease(frame, [0, 1], [100, 0], inOut)}% 0 0 0)` }}>
          <Img src={staticFile("assets/cesar-hq.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 40%", scale: ease(frame, [0, 2.2], [1.3, 1]) }} />
        </div>
        <div>
          <div style={{ ...mono(24), display: "flex", alignItems: "center", gap: 16, opacity: ease(frame, [0.2, 0.5], [0, 1]) }}>
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: C.hud, display: "inline-block", scale: 1 + Math.max(0, Math.sin(t * Math.PI * 2)) * 0.6 }} />Available · cleared for take-off
          </div>
          <div style={{ marginTop: 30 }}>
            <Slam at={0.5} style={{ ...condensed(180), color: C.fg }}>Ready for</Slam>
            <Slam at={1} skew={-10} style={{ ...expanded(130), color: C.hud }}>the next mission.</Slam>
          </div>
          <div style={{ marginTop: 44, fontFamily: DISPLAY, fontSize: 50, fontWeight: 720, color: C.fg, opacity: ease(frame, [2, 2.5], [0, 1]), translate: `0 ${ease(frame, [2, 2.5], [20, 0])}px` }}>César Solla González</div>
          <div style={{ marginTop: 18, display: "flex", gap: 40, ...mono(25, C.muted), opacity: ease(frame, [2.5, 3], [0, 1]) }}><span style={{ color: C.fg }}>cesar-solla.pages.dev</span><span>linkedin.com/in/cesarsgz</span></div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
