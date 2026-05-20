/// <reference types="vite/client" />

interface Window {
  webkitAudioContext: typeof AudioContext;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.glsl' {
  const content: string;
  export default content;
}
