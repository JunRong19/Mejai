import { Elements } from "@Chromium";
import { waitTill } from "@Mejai";
import { injectVisualizerStyles } from "./styles";

/** Ensure a visualizer container exists and return the inner canvas host element */
export function ensureVisualizer(rootSelector: string = Elements.ROOT): HTMLElement {
  const root = document.querySelector(rootSelector) as HTMLElement | null;
  if (!root) throw new Error("Root element not found for visualizer");

  let visualizer = root.querySelector('#Mejai-Visualizer') as HTMLElement | null;
  if (!visualizer) {
    visualizer = document.createElement('div');
    visualizer.id = 'Mejai-Visualizer';
    visualizer.className = 'mejai-visualizer';
    injectVisualizerStyles();

    const inner = document.createElement('div');
    inner.className = 'inner-canvas';
    visualizer.appendChild(inner);
    root.appendChild(visualizer);
  }

  return (visualizer.querySelector('.inner-canvas') as HTMLElement) || visualizer;
}

/** Create an AudioContext if possible */
export function createAudioContext(): AudioContext | undefined {
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return undefined;
    return new AudioCtx();
  } catch {
    return undefined;
  }
}

/** Basic prep for video element for embedded environments */
export function prepareVideoEl(video: HTMLVideoElement): void {
  try { (video as any).id = 'Mejai-Video'; } catch {}
  try { video.loop = true; } catch {}
  try { video.autoplay = true; } catch {}
  try { (video as any).playsInline = true; } catch {}
  try { video.preload = 'auto'; } catch {}
}

/**
 * Select the audio source following rules:
 * - If video is .webm, use its own audio (return sourceEl = video)
 * - Else, if any sidecar audio provided, construct an <audio> and return it as source
 */
export function selectAudioSource(
  video: HTMLVideoElement,
  loadedAudios: string[]
): { sourceEl: HTMLMediaElement; audioEl?: HTMLAudioElement } {
  const isWebm = typeof video.currentSrc === 'string'
    ? video.currentSrc.endsWith('.webm')
    : (video.src || '').endsWith('.webm');

  if (isWebm) {
    return { sourceEl: video };
  }

  if (loadedAudios && loadedAudios.length > 0) {
    const audioEl = new Audio(loadedAudios[0]);
    audioEl.id = 'Mejai-Audio';
    audioEl.loop = true;
    audioEl.preload = 'auto';
    // @ts-ignore
    audioEl.playsInline = true;
    // @ts-ignore
    audioEl.crossOrigin = 'anonymous';
    try { video.muted = true; } catch {}
    return { sourceEl: audioEl, audioEl };
  }

  return { sourceEl: video };
}

/** Try to start playback of both the video and the chosen source element */
export async function startPlayback(
  mediaEl: HTMLVideoElement,
  sourceEl: HTMLMediaElement,
  audioCtx?: AudioContext
): Promise<void> {
  try { if (audioCtx && audioCtx.state !== 'running') await audioCtx.resume(); } catch {}
  try { if (mediaEl.paused) await mediaEl.play(); } catch {}
  try { if (sourceEl.paused) await sourceEl.play(); } catch {}
}

/** Append sidecar audio element to the DOM if provided */
export async function appendSidecarAudio(audioEl?: HTMLAudioElement): Promise<void> {
  if (!audioEl) return;
  try {
    const parent = (document.querySelector(Elements.HOME_MAIN_VIEW) as HTMLElement) ||
      await waitTill(() => document.querySelector(Elements.HOME_MAIN_VIEW), 3000) as HTMLElement;
    if (parent) parent.prepend(audioEl);
  } catch {}
}
