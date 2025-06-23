declare module "*?filepath" {
  const value: string;
  export default value;
}

declare global {
  interface Window {
    toggleFont: (font: string) => void;
  }

  interface Array<T> {
    filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S): S[];
  }

  interface ObjectConstructor {
    keys<T>(o: T): (keyof T)[];
  }
}


export {};