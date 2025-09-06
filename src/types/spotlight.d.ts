declare module 'spotlight.js' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Spotlight: any;
  export default Spotlight;
}

declare global {
  interface Window {
    Spotlight: any;
  }
}
