function createAnimationState() {
	let enabled = $state(true);
	return {
		get enabled() {
			return enabled;
		},
		set(value: boolean) {
			enabled = value;
		}
	};
}

export const animations = createAnimationState();
