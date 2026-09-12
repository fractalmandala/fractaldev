import { writable } from 'svelte/store';

interface SplashScreenState {
	isVisible: boolean;
	progress: number;
}

const initialState: SplashScreenState = {
	isVisible: true,
	progress: 0
};

export const splashScreenState = writable<SplashScreenState>(initialState);

export class SplashScreenManager {
	private static instance: SplashScreenManager;
	private interval: number | null = null;
	private hideTimeout: number | null = null;

	static getInstance(): SplashScreenManager {
		if (!SplashScreenManager.instance) {
			SplashScreenManager.instance = new SplashScreenManager();
		}
		return SplashScreenManager.instance;
	}

	startLoading(): void {
		this.stop();

		splashScreenState.set({
			isVisible: true,
			progress: 0
		});

		// DataComponents-style animation
		let current = 0;
		this.interval = setInterval(() => {
			current += Math.random() * 10 + 5;
			const progress = current >= 100 ? 100 : current;

			splashScreenState.update((state) => ({
				...state,
				progress
			}));

			if (current >= 100) {
				this.stop();
				// Hide splash screen after completion
				this.hideTimeout = setTimeout(() => {
					splashScreenState.update((state) => ({
						...state,
						isVisible: false
					}));
				}, 300);
			}
		}, 50);
	}

	stop(): void {
		if (this.interval !== null) {
			clearInterval(this.interval);
			this.interval = null;
		}
		if (this.hideTimeout !== null) {
			clearTimeout(this.hideTimeout);
			this.hideTimeout = null;
		}
	}

	hide(): void {
		this.stop();
		splashScreenState.update((state) => ({
			...state,
			isVisible: false
		}));
	}
}

export const splashScreen = SplashScreenManager.getInstance();
