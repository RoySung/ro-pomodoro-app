declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.png' {
  const source: number;
  export default source;
}

declare module '*.gif' {
  const source: number;
  export default source;
}

declare module '*.mp3' {
  const source: number;
  export default source;
}