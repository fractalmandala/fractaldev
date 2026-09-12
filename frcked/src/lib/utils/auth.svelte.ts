import { browser } from '$app/environment';
import type { AuthRecord } from 'pocketbase';
import { pb } from './config.svelte';

export interface User {
	id: string;
	email: string;
	verified: boolean;
	avatar?: string;
	name?: string;
	created: string;
	updated: string;
}

export interface AuthState {
	isAuthenticated: boolean;
	token: string | null;
	user: User | null;
	loading: boolean;
}

export const auth = $state<AuthState>({
	isAuthenticated: false,
	token: null,
	user: null,
	loading: true
});

// Initialize auth state from localStorage (if we're in a browser)
export async function initializeAuth() {
	if (browser) {
		auth.loading = true;

		// Check if PocketBase has stored auth data
		if (pb.authStore.isValid) {
			try {
				// Attempt to refresh the auth
				const authData = await pb.collection('users').authRefresh();

				// Update state with refreshed data
				auth.isAuthenticated = true;
				auth.token = pb.authStore.token;
				auth.user = {
					id: authData.record.id,
					email: authData.record.email || '',
					verified: authData.record.verified || false,
					avatar: authData.record.avatar || undefined,
					name: authData.record.name || undefined,
					created: authData.record.created || '',
					updated: authData.record.updated || ''
				};
				auth.loading = false;
				return true;
			} catch (error) {
				console.error('Auth refresh failed:', error);
				// If refresh fails, clear auth and set to unauthenticated
				pb.authStore.clear();
				auth.isAuthenticated = false;
				auth.token = null;
				auth.user = null;
				auth.loading = false;
				return false;
			}
		} else {
			// If we get here, no valid auth data was found
			auth.isAuthenticated = false;
			auth.token = null;
			auth.user = null;
			auth.loading = false;
		}
	}
	return false;
}

export function loginUser(token: string, user: AuthRecord | null) {
	if (!user) {
		console.error('Invalid user record');
		return;
	}

	auth.isAuthenticated = true;
	auth.token = token;
	auth.user = {
		id: user.id,
		email: user.email || '',
		verified: user.verified || false,
		avatar: user.avatar || undefined,
		name: user.name || undefined,
		created: user.created || '',
		updated: user.updated || ''
	};
	auth.loading = false;

	// PocketBase handles saving auth data to localStorage automatically
}

export function logoutUser() {
	pb.authStore.clear();

	auth.isAuthenticated = false;
	auth.token = null;
	auth.user = null;
	auth.loading = false;
}
