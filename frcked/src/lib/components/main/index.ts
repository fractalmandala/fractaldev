// ==================== LAYOUT COMPONENTS ====================
export { default as Navigation } from './Navigation.svelte';
export { NavigationLogic, type NavigationState } from '../../data/Navigation';

export { default as Footer } from './Footer.svelte';

export { default as SplashScreen } from './SplashScreen.svelte';
export { splashScreen, splashScreenState, SplashScreenManager } from './SplashScreen';

// ==================== INTERACTIVE COMPONENTS ====================
export { default as Modal } from './Modal.svelte';
export { ModalLogic } from './Modal';

// ==================== SETTINGS COMPONENTS ====================
export { default as Settings } from './Settings.svelte';
export {
	settingsService,
	type SettingsData,
	updateUISettings,
	mouseEffectsEnabled,
	updateMouseEffectsPreference
} from './Settings';
