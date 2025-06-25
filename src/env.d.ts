declare module "*?filepath" {
  const value: string;
  export default value;
}

declare global {
  interface Array<T> {
    filter<S extends T>(
      predicate: (value: T, index: number, array: T[]) => value is S,
    ): S[];
  }
}
