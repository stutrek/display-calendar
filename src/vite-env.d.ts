/// <reference types="vite/client" />

declare module '*.css?inline' {
  const css: string;
  export default css;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.json' {
  const value: any;
  export default value;
}
