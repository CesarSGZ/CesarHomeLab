import React from "react";
import { Composition, Folder } from "remotion";
import { MissionBrief } from "./MissionBrief";
import { Intro } from "./scenes/Intro";
import { Profile } from "./scenes/Profile";
import { Experience } from "./scenes/Experience";
import { Credentials } from "./scenes/Credentials";
import { Languages } from "./scenes/Languages";
import { Skills } from "./scenes/Skills";
import { Ready } from "./scenes/Ready";
import { FPS } from "./theme";

const scene = { width: 1920, height: 1080, fps: FPS } as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Scenes">
      <Composition id="Intro" component={Intro} durationInFrames={6 * FPS} {...scene} />
      <Composition id="Profile" component={Profile} durationInFrames={8 * FPS} {...scene} />
      <Composition id="Experience" component={Experience} durationInFrames={18 * FPS} {...scene} />
      <Composition id="Credentials" component={Credentials} durationInFrames={8 * FPS} {...scene} />
      <Composition id="Languages" component={Languages} durationInFrames={8 * FPS} {...scene} />
      <Composition id="Skills" component={Skills} durationInFrames={10 * FPS} {...scene} />
      <Composition id="Ready" component={Ready} durationInFrames={6 * FPS} {...scene} />
    </Folder>
    <Composition id="MissionBrief" component={MissionBrief} durationInFrames={64 * FPS} {...scene} />
  </>
);
