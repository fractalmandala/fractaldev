import { browser } from '$app/environment';
import PocketBase from 'pocketbase';

export const APP_NAME = 'frcked';

const defaultApiUrl = 'http://127.0.0.1:8090';

let _apiUrl = $state(defaultApiUrl);

export function getApiUrl(): string {
	if (browser) {
		// In development, use the PocketBase port
		if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
			return 'http://127.0.0.1:8090';
		}
		// In production, assume backend is on same origin
		return window.location.origin;
	}
	return _apiUrl;
}

export function setApiUrl(url: string): void {
	_apiUrl = url;
}

// Will be properly initialized on client
let pbInstance: PocketBase;

// Safe initialization function that checks for browser environment
export function getPocketBaseInstance(): PocketBase {
	if (!pbInstance) {
		const apiUrl = getApiUrl();
		pbInstance = new PocketBase(apiUrl);

		if (browser) {
			setApiUrl(apiUrl);
		}
	}
	return pbInstance;
}

export const pb = getPocketBaseInstance();
