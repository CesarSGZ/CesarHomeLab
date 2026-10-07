import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, Hud } from "./components/Chrome";
import { Intro } from "./scenes/Intro";
import { Profile } from "./scenes/Profile";
import { Experience } from "./scenes/Experience";
import { Credentials } from "./scenes/Credentials";
import { Languages } from "./scenes/Languages";
import { Skills } from "./scenes/Skills";
import { Ready } from "./scenes/Ready";
import { beatPulse, FPS } from "./theme";

// 64 s at 120 BPM: every scene starts on a downbeat of the synthwave track.
export const MissionBrief: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / FPS;
  const punch = t >= 6 && t < 58 ? beatPulse(frame, 0, 2, 0.45) : 0;
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ scale: 1 + punch * 0.012 }}>
        <Sequence name="Intro" durationInFrames={6 * fps} premountFor={fps}><Intro /></Sequence>
        <Sequence name="Profile" from={6 * fps} durationInFrames={8 * fps} premountFor={fps}><Profile /></Sequence>
        <Sequence name="Experience" from={14 * fps} durationInFrames={18 * fps} premountFor={fps}><Experience /></Sequence>
        <Sequence name="Credentials" from={32 * fps} durationInFrames={8 * fps} premountFor={fps}><Credentials /></Sequence>
        <Sequence name="Languages" from={40 * fps} durationInFrames={8 * fps} premountFor={fps}><Languages /></Sequence>
        <Sequence name="Skills" from={48 * fps} durationInFrames={10 * fps} premountFor={fps}><Skills /></Sequence>
        <Sequence name="Ready" from={58 * fps} durationInFrames={6 * fps} premountFor={fps}><Ready /></Sequence>
      </AbsoluteFill>
      <Hud />
      <Audio src={staticFile("soundtrack.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
