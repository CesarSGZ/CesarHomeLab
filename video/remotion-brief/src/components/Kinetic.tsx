import React from "react";
import { useCurrentFrame } from "remotion";
import { ease, FPS, expo } from "../theme";

/** A line that slams up out of a mask. `at` is in seconds, relative to the parent sequence. */
export const Slam: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; exitAt?: number; skew?: number }> = ({ at, children, style, exitAt, skew = 0 }) => {
  const frame = useCurrentFrame();
  const enter = ease(frame, [at, at + 0.55], [115, 0]);
  const exit = exitAt ? ease(frame, [exitAt, exitAt + 0.3], [0, -115], expo) : 0;
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.06em" }}>
      <div style={{ ...style, translate: `0 ${enter + exit}%`, rotate: `${ease(frame, [at, at + 0.55], [4, 0])}deg`, transform: `skewX(${ease(frame, [at, at + 0.8], [skew, 0])}deg)` }}>{children}</div>
    </div>
  );
};

/** Letters fly in one by one on a short stagger. */
export const Letters: React.FC<{ text: string; at: number; style?: React.CSSProperties; stagger?: number }> = ({ text, at, style, stagger = 0.035 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ ...style, display: "flex", whiteSpace: "pre" }}>
      {[...text].map((ch, i) => {
        const t0 = at + i * stagger;
        return (
          <span key={i} style={{ display: "inline-block", opacity: ease(frame, [t0, t0 + 0.25], [0, 1]), translate: `0 ${ease(frame, [t0, t0 + 0.5], [0.6, 0])}em`, rotate: `${ease(frame, [t0, t0 + 0.5], [i % 2 ? 18 : -18, 0])}deg`, filter: `blur(${ease(frame, [t0, t0 + 0.4], [8, 0])}px)` }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** Typewriter: reveals characters frame by frame. */
export const Typed: React.FC<{ text: string; at: number; cps?: number; style?: React.CSSProperties }> = ({ text, at, cps = 22, style }) => {
  const frame = useCurrentFrame();
  const shown = Math.max(0, Math.min(text.length, Math.floor((frame / FPS - at) * cps)));
  return <span style={style}>{text.slice(0, shown)}<span style={{ opacity: shown < text.length && shown > 0 ? 1 : 0 }}>▌</span></span>;
};
