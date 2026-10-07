import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Letters, Slam } from "../components/Kinetic";
import { back, C, condensed, ease, expanded, FPS, mono } from "../theme";

const Exit: React.FC<{ at: number; children: React.ReactNode; dir?: number }> = ({ at, children, dir = -1 }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: ease(frame, [at, at + 0.3], [1, 0]), translate: `${ease(frame, [at, at + 0.3], [0, dir * 160])}px 0`, padding: "150px 170px", display: "flex", flexDirection: "column", justifyContent: "center" }}>{children}</AbsoluteFill>;
};

// 6–14 s · one idea per bar, a moving marquee of traits behind.
export const Profile: React.FC = () => {
  const frame = useCurrentFrame();
  const marquee = "CURIOUS · PROACTIVE · LEADS FROM ANY POSITION · AEROSPACE ENGINEER · ";
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 820, left: 0, whiteSpace: "nowrap", ...condensed(150), color: "transparent", WebkitTextStroke: "1.5px rgba(207,232,143,.16)", translate: `${-(frame * 6) % 2400}px 0` }}>{marquee.repeat(4)}</div>
      <Sequence durationInFrames={2 * FPS} name="Aerospace engineer">
        <Exit at={1.7}>
          <div style={{ ...mono(24), marginBottom: 20, opacity: ease(frame, [0, 0.3], [0, 1]) }}>Profile</div>
          <Letters text="Aerospace" at={0} style={{ ...condensed(230), color: C.fg }} stagger={0.03} />
          <Slam at={0.5} style={{ ...expanded(190), color: C.hud }}>engineer.</Slam>
        </Exit>
      </Sequence>
      <Sequence from={2 * FPS} durationInFrames={2 * FPS} name="Curious. Proactive.">
        <Traits />
      </Sequence>
      <Sequence from={4 * FPS} durationInFrames={2 * FPS} name="Leads from any position">
        <Exit at={1.7} dir={1}>
          <Slam at={0} style={{ ...condensed(220), color: C.fg }}>Leads from</Slam>
          <Slam at={0.5} skew={-12} style={{ ...expanded(180), color: C.hud }}>any position.</Slam>
        </Exit>
      </Sequence>
      <Sequence from={6 * FPS} durationInFrames={2 * FPS} name="Disciplines">
        <Disciplines />
      </Sequence>
    </AbsoluteFill>
  );
};

const Traits: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Exit at={1.7}>
      <div style={{ ...condensed(230), color: C.fg, translate: `${ease(frame, [0, 0.5], [-500, 0])}px 0`, opacity: ease(frame, [0, 0.3], [0, 1]) }}>Curious.</div>
      <div style={{ ...expanded(200), color: C.hud, alignSelf: "flex-end", translate: `${ease(frame, [0.5, 1], [500, 0])}px 0`, opacity: ease(frame, [0.5, 0.8], [0, 1]) }}>Proactive.</div>
    </Exit>
  );
};

const Disciplines: React.FC = () => {
  const frame = useCurrentFrame();
  const tags: [string, string][] = [["Systems engineering", C.eng], ["Programme management", C.mgmt], ["Data science", C.data]];
  return (
    <Exit at={1.65} dir={1}>
      <div style={{ ...mono(24), marginBottom: 28, opacity: ease(frame, [0, 0.3], [0, 1]) }}>Experienced in</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {tags.map(([label, color], i) => (
          <div key={label} style={{ alignSelf: "flex-start", ...condensed(96), fontWeight: 820, fontStretch: "76%", color: C.bg, background: color, padding: "18px 34px 22px", borderRadius: 18, translate: `${ease(frame, [i * 0.5, i * 0.5 + 0.45], [-260, 0], back)}px 0`, opacity: ease(frame, [i * 0.5, i * 0.5 + 0.2], [0, 1]), rotate: `${ease(frame, [i * 0.5, i * 0.5 + 0.5], [-4, 0], back)}deg` }}>{label}</div>
        ))}
      </div>
    </Exit>
  );
};
