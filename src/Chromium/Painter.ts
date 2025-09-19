export function addCSS(css: string): void {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
}

export function createVideo(videoSrc: string): HTMLVideoElement {
    const video = document.createElement("video");
    video.src = videoSrc;
    video.id = "Mejai-Video";

    video.autoplay = true;
    video.loop = true;
    video.muted = false;
    video.volume = 1;

    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";
    video.style.pointerEvents = "none";
    video.style.zIndex = "-1";
    video.style.position = "absolute";

    return video;
}

export function createImage(imageSrc: string): HTMLImageElement {
    const img = document.createElement("img");
    img.src = imageSrc;
    img.id = "Mejai-Image";

    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.pointerEvents = "none";
    img.style.zIndex = "-1";
    img.style.position = "absolute";

    return img;
}