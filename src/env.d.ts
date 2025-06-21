declare module "*?filepath" {
  const value: string;
  export default value;
}

declare global {
  interface Window {
    toggleFont: (font: string) => void;
  }
}

export {};