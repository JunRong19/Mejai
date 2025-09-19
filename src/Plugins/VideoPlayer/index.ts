import { MejaiPlugin } from "@Mejai";
import { createImage, createVideo } from "@Chromium";
import { Elements } from "@Chromium";
import { waitTill } from "@Mejai";
import AudioMotionAnalyzer from "audiomotion-analyzer";
import { appendSidecarAudio, createAudioContext, ensureVisualizer, prepareVideoEl, selectAudioSource, startPlayback } from "./helpers";

export default new class VideoPlayer extends MejaiPlugin {
  private loadedVideos: string[] = [];
  private loadedImages: string[] = [];
  private loadedAudios: string[] = [];

  constructor() {
    super(import("./package.json"));

    // Load all assets.
    this.loadAllVideos();
    this.loadAllImages();
    this.loadAllAudios();
  }

  override async init(): Promise<void> {
    // Replaces the activity content with a video or image background.
    await this.removeActivityContent();

    try {
      const video = await this.displayVideo();
      if (!video) {
        const image = await this.displayImage();
        if (!image) throw new Error("No media found to display.");
      }

      // Choose audio source per rule and prep elements
      const mediaEl = video as HTMLVideoElement;
      const { sourceEl, audioEl } = selectAudioSource(mediaEl, this.loadedAudios);
      
      // Start visualizer
      try {
        const root = document.querySelector(Elements.ROOT) as HTMLElement;
        if (!root) throw new Error('Root element not found for visualizer');

        // create or reuse a dedicated visualizer container so it's visible and sized
        let visualizer = root.querySelector('#Mejai-Visualizer') as HTMLElement | null;
        if (!visualizer) {
          visualizer = document.createElement('div');
          visualizer.id = 'Mejai-Visualizer';
          visualizer.className = 'mejai-visualizer';
          
          // inject minimal stylesheet for the visualizer (translucent bottom bar)
          if (!document.getElementById('mejai-visualizer-styles')) {
            const style = document.createElement('style');
            style.id = 'mejai-visualizer-styles';
            style.textContent = `
              .mejai-visualizer {
                position: fixed !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                height: 30vh !important;
                width: 100vw !important;
                margin: 0 !important;
                box-shadow: none !important;
                background: transparent !important;
                border-radius: 0 !important;
                border: none !important;
                z-index: 9999 !important;
                pointer-events: none !important;
                overflow: hidden !important;
                display: block !important;
              }
              .mejai-visualizer .inner-canvas {
                width: 100% !important;
                height: 100% !important;
              }
              /* hide common scale/background elements used by visualizers */
              .mejai-visualizer canvas { background: transparent !important; }
              .mejai-visualizer .ama-scale, .mejai-visualizer .ama-scale-vertical, .mejai-visualizer .ama-scale-horizontal, .mejai-visualizer .ama-background { display: none !important; }
            `;
            document.head.appendChild(style);
          }

          // create an inner wrapper for the analyzer canvas to fill
          const inner = document.createElement('div');
          inner.className = 'inner-canvas';
          visualizer.appendChild(inner);

          root.appendChild(visualizer);
        }

  // Create AudioContext and prepare video element
  const audioCtx = createAudioContext();
  prepareVideoEl(mediaEl);

        // Safer approach: pass the HTMLAudioElement to AudioMotionAnalyzer instead of
        // creating a MediaElementAudioSourceNode here. Creating multiple source nodes
        // for the same element (or creating it in a different context) can throw or
        // silence playback in embedded webviews. Let the library handle node creation
        // where possible, and ensure the AudioContext and playback are resumed after.
          // Initialize with the inner wrapper so the analyzer fills the area
          const innerEl = ensureVisualizer(Elements.ROOT);
          // @ts-ignore - ignore library types here
          const audioMotion = new AudioMotionAnalyzer(innerEl, {
            source: sourceEl,
            audioCtx: audioCtx ?? undefined,
            connectSpeakers: true,
            showScaleX: false,
            showBgColor: false,
            showPeaks: false,
            bgAlpha: 0,
            overlay: true,
            gradient: 'prism',
            mode: 2,
            fillAlpha: 0.3,
            outlineBars: true,
            barSpace: 0.25,
            lineWidth: 1,
          });

          // Ensure AudioContext is resumed and audio is playing
          if (audioCtx && audioCtx.state === 'suspended') {
            try { await audioCtx.resume(); } catch {}
          }
          // Try to start playback on chosen source; keep video playing (possibly muted) for visuals
          // Start playback (video and chosen source)
          await startPlayback(mediaEl, sourceEl, audioCtx);

          // If using sidecar audio, append it to DOM after starting playback
          await appendSidecarAudio(audioEl);

          // Keep it simple: no extra diagnostics
      } catch (err) {
        console.warn('AudioMotionAnalyzer initialization failed', err);
      }

    } catch (e) {
      Toast.error(`Error initializing VideoPlayer plugin: ${(e as Error).message}`);
    }
  }

  private async displayVideo(): Promise<HTMLVideoElement | null> {
    const firstVideoUrl = this.getFirstVideo();

    if (!firstVideoUrl) {
      Toast.error("No videos found in ./Assets/Videos");
      return null;
    }

    Toast.success(`Loaded video: ${firstVideoUrl}`);
  const video = createVideo(firstVideoUrl);

    try {
      // Ensure sensible defaults for video playback
  prepareVideoEl(video);

      const parent = await waitTill(() => document.querySelector(Elements.ROOT), 5000) as HTMLElement;
      parent.prepend(video);

      return video;

    } catch (err) {
      throw new Error("Parent element not found. Cannot add video background.");
    }
  }

  private async displayImage(): Promise<HTMLImageElement | null> {
    const firstImageUrl = this.getFirstImage();

    if (!firstImageUrl) {
      Toast.error("No images found in ./Media/Images");
      return null;
    }

    Toast.success(`Loaded image: ${firstImageUrl}`);
    const img = createImage(firstImageUrl);

    try {
      const parent = await waitTill(() => document.querySelector(Elements.ROOT), 5000) as HTMLElement;
      parent.prepend(img);
      return img;

    } catch (err) {
      throw new Error("Parent element not found. Cannot add image background.");
    }
  }

  private async removeActivityContent() {
    try {
      const activityContent = await waitTill(() => document.querySelector(Elements.HOME_ACTIVITY_CONTENT), 5000) as HTMLElement;
      activityContent.remove();
      Toast.success("Removed Activity Content");
    } catch (err) {
      throw new Error("Activity Content element not found. Unable to remove it.");
    }
  }

  private loadAllVideos() {
    const videos = import.meta.glob([
      "./Assets/Videos/*.mp4",
      "./Assets/Videos/*.webm"
    ], {
      eager: true,
      import: "default",
    }) as Record<string, string>;

    this.loadedVideos = Object.values(videos);
  }

  private loadAllImages() {
    const images = import.meta.glob([
      "./Assets/Images/*.jpg",
      "./Assets/Images/*.png",
    ], {
      eager: true,
      import: "default",
    }) as Record<string, string>;

    this.loadedImages = Object.values(images);
  }

  private loadAllAudios() {
    const audios = import.meta.glob([
      "./Assets/Audios/*.mp3",
      "./Assets/Audios/*.wav",
      "./Assets/Audios/*.webm",
      "./Assets/Audios/*.ogg",
    ], {
      eager: true,
      import: "default",
    }) as Record<string, string>;
    this.loadedAudios =  Object.values(audios);
  }

  private getFirstVideo(): string | null {
    return this.loadedVideos.length > 0 ? this.loadedVideos[0] : null;
  }

  private getFirstImage(): string | null {
    return this.loadedImages.length > 0 ? this.loadedImages[0] : null;
  }
};
