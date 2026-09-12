import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { updateAnimationPreference, reinitializeViewTransitions } from '$lib/utils';

export interface SettingsData {
	ui: UISettings;
}

export interface UISettings {
	animationsEnabled: boolean;
	mouseEffectsEnabled: boolean;
}

const defaultSettings: SettingsData = {
	ui: {
		animationsEnabled: true,
		mouseEffectsEnabled: true
	}
};

export class SettingsService {
	private readonly STORAGE_KEY = 'settings';

	private getStoredSettings(): SettingsData {
		if (!browser) return defaultSettings;

		try {
			const stored = localStorage.getItem(this.STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				// Merge with defaults to ensure all properties exist
				return {
					ui: { ...defaultSettings.ui, ...parsed.ui }
				};
			}
		} catch (error) {
			console.error('Failed to parse stored settings:', error);
		}

		return defaultSettings;
	}

	private saveSettings(settings: SettingsData): void {
		if (!browser) return;

		try {
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
		} catch (error) {
			console.error('Failed to save settings:', error);
			throw new Error('Failed to save settings to localStorage', { cause: error });
		}
	}

	async getSettings(): Promise<SettingsData> {
		await new Promise((resolve) => setTimeout(resolve, 100));
		return this.getStoredSettings();
	}

	async updateSettings(newSettings: Partial<SettingsData>): Promise<SettingsData> {
		await new Promise((resolve) => setTimeout(resolve, 200));

		const currentSettings = this.getStoredSettings();

		const updatedSettings: SettingsData = {
			ui: { ...currentSettings.ui, ...(newSettings.ui || {}) }
		};

		this.saveSettings(updatedSettings);
		return updatedSettings;
	}
}

export const settingsService = new SettingsService();

/**
 * Store to track mouse effects preference
 */
export const mouseEffectsEnabled = writable(true);

/**
 * Update mouse effects preference
 */
export function updateMouseEffectsPreference(enabled: boolean): void {
	mouseEffectsEnabled.set(enabled);
}

/**
 * Update animation preference in navigation store when settings change
 */
export function updateUISettings(settings: SettingsData) {
	updateAnimationPreference(settings.ui.animationsEnabled);
	updateMouseEffectsPreference(settings.ui.mouseEffectsEnabled);

	// Reinitialize view transitions when animation setting changes
	if (browser) {
		reinitializeViewTransitions();
	}
}
