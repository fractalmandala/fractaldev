/** True when running in a browser (not SSR). */
export const browser = typeof window !== 'undefined' && typeof document !== 'undefined';
