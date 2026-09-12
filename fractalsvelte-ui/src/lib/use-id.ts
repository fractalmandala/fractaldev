let counter = 0;

/** Stable unique id generator, SSR-safe (deterministic per render pass). */
export function useId(): string {
	counter += 1;
	return `mg-${counter}`;
}
