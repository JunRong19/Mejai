// Minimal CSS for the visualizer container
export function injectVisualizerStyles(): void {
  const id = 'mejai-visualizer-styles';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    .mejai-visualizer{position:fixed;left:0;right:0;bottom:0;height:30vh;width:100vw;z-index:9999;pointer-events:none;overflow:hidden}
    .mejai-visualizer .inner-canvas{width:100%;height:100%}
    .mejai-visualizer canvas{background:transparent}
  `;
  document.head.appendChild(style);
}
