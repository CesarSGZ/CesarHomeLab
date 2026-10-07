import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Typed } from "../components/Kinetic";
import { back, C, DISPLAY, ease, FPS, mono } from "../theme";

type Lang = { flag: string; hello: string; name: string; level: string; bars: number };
const LANGS: Lang[] = [
  { flag: "es", hello: "¡Hola!", name: "Spanish", level: "Native", bars: 6 },
  { flag: "gl", hello: "Ola!", name: "Galician", level: "Native", bars: 6 },
  { flag: "gb", hello: "Hello!", name: "English", level: "C1 · Cambridge", bars: 5 },
  { flag: "fr", hello: "Bonjour !", name: "French", level: "B1", bars: 3 },
  { flag: "pt", hello: "Olá!", name: "Portuguese", level: "A2", bars: 2 },
];
const STEP = 1.5;

const Channel: React.FC<{ l: Lang; last: boolean }> = ({ l, last }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const wave = Math.sin(t * Math.PI * 4); // two waves per second, on the beat
  const exit = last ? 0 : ease(frame, [1.3, 1.5], [0, 1]);
  return (
    <AbsoluteFill style={{ padding: "150px 170px", display: "grid", gridTemplateColumns: "560px 1fr", gap: 110, alignItems: "center", opacity: 1 - exit, translate: `${exit * 120}px 0` }}>
      <div style={{ width: 520, height: 350, borderRadius: 22, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,.45)", transformOrigin: "0% 50%", transform: `perspective(1000px) rotateY(${ease(frame, [0, 0.45], [40, 0]) + wave * 6}deg) skewY(${wave * 2.5}deg)`, translate: `${ease(frame, [0, 0.45], [-160, 0])}px 0`, opacity: ease(frame, [0, 0.2], [0, 1]) }}>
        <Img src={staticFile(`assets/${l.flag}.svg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div>
        <div style={{ display: "inline-block", fontFamily: DISPLAY, fontSize: 150, lineHeight: 1, fontWeight: 820, fontStretch: "78%", color: C.bg, background: C.hud, padding: "26px 44px 34px", borderRadius: "40px 40px 40px 8px", transformOrigin: "0% 100%", scale: ease(frame, [0.05, 0.5], [0, 1], back), minWidth: 200 }}>
          <Typed text={l.hello} at={0.2} cps={16} />
        </div>
        <div style={{ marginTop: 44, fontFamily: DISPLAY, fontSize: 64, fontWeight: 760, fontStretch: "88%", color: C.fg, opacity: ease(frame, [0.25, 0.55], [0, 1]) }}>{l.name}</div>
        <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center" }}>
          {Array.from({ length: 6 }, (_, i) => <span key={i} style={{ width: 74, height: 10, borderRadius: 5, background: i < l.bars ? C.hud : "rgba(238,243,236,.14)", transformOrigin: "0 50%", scale: `${ease(frame, [0.35 + i * 0.05, 0.55 + i * 0.05], [0, 1])} 1` }} />)}
          <span style={{ ...mono(28), marginLeft: 18, opacity: ease(frame, [0.6, 0.9], [0, 1]) }}>{l.level}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 40–48 s · five channels, one every three beats.
export const Languages: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ opacity: ease(frame, [7.65, 7.95], [1, 0]) }}>
      <div style={{ ...mono(24), position: "absolute", left: 170, top: 150, opacity: ease(frame, [0, 0.3], [0, 1]) }}>Languages · five channels open</div>
      {LANGS.map((l, i) => (
        <Sequence key={l.flag} from={Math.round((0.5 + i * STEP) * FPS)} durationInFrames={Math.round((i === 4 ? 2.5 : STEP) * FPS)} name={l.name} premountFor={FPS}>
          <Channel l={l} last={i === 4} />
        </Sequence>
      ))}
      <div style={{ position: "absolute", left: 170, bottom: 150, display: "flex", gap: 14 }}>
        {LANGS.map((l, i) => {
          const on = t >= 0.5 + i * STEP;
          return <Img key={l.flag} src={staticFile(`assets/${l.flag}.svg`)} style={{ width: 54, height: 36, objectFit: "cover", borderRadius: 6, opacity: on ? 1 : 0.25, scale: on ? ease(frame, [0.5 + i * STEP, 0.8 + i * STEP], [1.4, 1.1], back) : 1 }} />;
        })}
      </div>
    </AbsoluteFill>
  );
};
