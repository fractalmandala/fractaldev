// ==================== LAYOUT COMPONENTS ====================
export { default as Navigation } from './Navigation.svelte';
export { default as Footer } from './Footer.svelte';
export { default as SplashScreen } from './SplashScreen.svelte';

// ==================== INTERACTIVE COMPONENTS ====================
export { default as Modal } from './Modal.svelte';

// ==================== SETTINGS COMPONENTS ====================
export { default as Settings } from './Settings.svelte';

// ==================== RE-EXPORTS FROM STATES ====================
export { NavigationLogic, type NavigationState } from '$lib/states/navigationState.svelte';
export { splashScreen, splashScreenState, SplashScreenManager } from '$lib/states/splashScreen';
export { ModalLogic, type ModalProps, type ModalState } from '$lib/states/modal';
export {
	settingsService,
	type SettingsData,
	type UISettings,
	updateUISettings,
	mouseEffectsEnabled,
	updateMouseEffectsPreference
} from '$lib/states/settings';
