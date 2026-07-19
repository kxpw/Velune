import type { ProfilerOnRenderCallback, ReactNode } from "react";
import { Profiler } from "react";

export interface StoryProfilerSample {
  storyId: string;
  phase: "mount" | "update" | "nested-update";
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
}

declare global {
  interface Window {
    __ZP_STORYBOOK_PROFILER__?: StoryProfilerSample[];
  }
}

function recordSample(storyId: string): ProfilerOnRenderCallback {
  return (_id, phase, actualDuration, baseDuration, startTime, commitTime) => {
    const samples = (window.__ZP_STORYBOOK_PROFILER__ ??= []);
    samples.push({
      storyId,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
    });
  };
}

export function StoryProfiler({
  storyId,
  children,
}: {
  storyId: string;
  children: ReactNode;
}) {
  return (
    <Profiler id={storyId} onRender={recordSample(storyId)}>
      {children}
    </Profiler>
  );
}
