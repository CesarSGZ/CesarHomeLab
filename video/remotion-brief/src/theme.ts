import { continueRender, delayRender, Easing, interpolate, staticFile } from "remotion";

export const FPS = 30;
export const BEAT = 0.5; // 120 BPM
export const BAR = 2;

export const C = {
  bg: "#071015",
  fg: "#eef3ec",
  muted: "#a9b9b3",
  hud: "#cfe88f",
  hudDim: "rgba(207,232,143,.35)",
  line: "rgba(238,243,236,.12)",
  eng: "#8fd8f0",
  mgmt: "#cfe88f",
  data: "#c4b2f5",
};

export const DISPLAY = "Archivo, sans-serif";
export const MONO = "'DM Mono', monospace";

// Archivo is a variable font with a width axis, so it is registered with FontFace directly
// (weight 300–900, stretch 62–125%) and rendering waits until every face is ready.
const fontHandle = delayRender("Loading fonts");
Promise.all([
  new FontFace("Archivo", `url(${staticFile("fonts/archivo-var.woff2")})`, { weight: "300 900", stretch: "62% 125%" }),
  new FontFace("DM Mono", `url(${staticFile("fonts/dmmono-400.woff2")})`, { weight: "400" }),
  new FontFace("DM Mono", `url(${staticFile("fonts/dmmono-500.woff2")})`, { weight: "500" }),
].map(async (face) => document.fonts.add(await face.load())))
  .then(() => continueRender(fontHandle))
  .catch(() => continueRender(fontHandle));

export const expo = Easing.bezier(0.16, 1, 0.3, 1);
export const back = Easing.bezier(0.34, 1.56, 0.64, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);

/** Interpolate over seconds (relative to the current sequence) with clamping. */
export const ease = (frame: number, [t0, t1]: [number, number], [a, b]: [number, number], easing = expo) =>
  interpolate(frame, [t0 * FPS, t1 * FPS], [a, b], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

/** 0→1 envelope that decays after each beat: drives punches and pulses. */
export const beatPulse = (frame: number, start = 0, every = BEAT, decay = 0.35) => {
  const t = frame / FPS - start;
  if (t < 0) return 0;
  const since = t % every;
  return Math.max(0, 1 - since / decay) ** 2;
};

export const mono = (size: number, color = C.hud): React.CSSProperties => ({
  fontFamily: MONO, fontSize: size, letterSpacing: ".14em", textTransform: "uppercase", color, fontWeight: 500,
});
export const condensed = (size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontSize: size, fontWeight: 860, fontStretch: "70%", letterSpacing: "-.03em", lineHeight: 0.92,
});
export const expanded = (size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontSize: size, fontWeight: 330, fontStretch: "125%", letterSpacing: "-.02em", lineHeight: 1,
});
