import PocketBase from 'pocketbase';
import type {
	LoginRequest,
	RegisterRequest,
	LoginResponse,
	RegisterResponse,
	AuthUser,
	PasswordResetRequest,
	PasswordResetResponse,
	EmailVerificationRequest,
	EmailVerificationResponse
} from './types.js';

export class AuthCrudClient {
	private pb: PocketBase;

	constructor(pb: PocketBase) {
		this.pb = pb;
	}

	/**
	 * Login user with email and password
	 */
	async login(data: LoginRequest): Promise<LoginResponse> {
		try {
			const authData = await this.pb
				.collection('users')
				.authWithPassword(data.email, data.password);

			const response: LoginResponse = {
				token: this.pb.authStore.token,
				record: {
					id: authData.record.id,
					email: authData.record.email || '',
					verified: authData.record.verified || false,
					avatar: authData.record.avatar || undefined,
					name: authData.record.name || undefined,
					created: authData.record.created || '',
					updated: authData.record.updated || ''
				}
			};

			return response;
		} catch (error) {
			console.error('Login failed:', error);
			throw error;
		}
	}

	/**
	 * Register new user
	 */
	async register(data: RegisterRequest): Promise<RegisterResponse> {
		try {
			const userData = {
				email: data.email,
				password: data.password,
				passwordConfirm: data.passwordConfirm,
				...(data.name && { name: data.name })
			};

			await this.pb.collection('users').create(userData);

			// After successful registration, log the user in
			const authData = await this.pb
				.collection('users')
				.authWithPassword(data.email, data.password);

			const response: RegisterResponse = {
				token: this.pb.authStore.token,
				record: {
					id: authData.record.id,
					email: authData.record.email || '',
					verified: authData.record.verified || false,
					avatar: authData.record.avatar || undefined,
					name: authData.record.name || undefined,
					created: authData.record.created || '',
					updated: authData.record.updated || ''
				}
			};

			return response;
		} catch (error) {
			console.error('Registration failed:', error);
			throw error;
		}
	}

	/**
	 * Logout current user
	 */
	async logout(): Promise<void> {
		try {
			this.pb.authStore.clear();
		} catch (error) {
			console.error('Logout failed:', error);
			throw error;
		}
	}

	/**
	 * Refresh authentication token
	 */
	async refresh(): Promise<LoginResponse> {
		try {
			const authData = await this.pb.collection('users').authRefresh();

			const response: LoginResponse = {
				token: this.pb.authStore.token,
				record: {
					id: authData.record.id,
					email: authData.record.email || '',
					verified: authData.record.verified || false,
					avatar: authData.record.avatar || undefined,
					name: authData.record.name || undefined,
					created: authData.record.created || '',
					updated: authData.record.updated || ''
				}
			};

			return response;
		} catch (error) {
			console.error('Token refresh failed:', error);
			throw error;
		}
	}

	/**
	 * Get current authenticated user
	 */
	getCurrentUser(): AuthUser | null {
		if (!this.pb.authStore.isValid || !this.pb.authStore.record) {
			return null;
		}

		const user = this.pb.authStore.record;
		return {
			id: user.id,
			email: user.email || '',
			verified: user.verified || false,
			avatar: user.avatar || undefined,
			name: user.name || undefined,
			created: user.created || '',
			updated: user.updated || ''
		};
	}

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		return this.pb.authStore.isValid;
	}

	/**
	 * Get auth token
	 */
	getToken(): string {
		return this.pb.authStore.token;
	}

	/**
	 * Request password reset
	 */
	async requestPasswordReset(data: PasswordResetRequest): Promise<PasswordResetResponse> {
		try {
			await this.pb.collection('users').requestPasswordReset(data.email);

			return {
				success: true,
				message: 'Password reset email sent successfully'
			};
		} catch (error) {
			console.error('Password reset request failed:', error);
			throw error;
		}
	}

	/**
	 * Request email verification
	 */
	async requestVerification(data: EmailVerificationRequest): Promise<EmailVerificationResponse> {
		try {
			await this.pb.collection('users').requestVerification(data.email);

			return {
				success: true,
				message: 'Verification email sent successfully'
			};
		} catch (error) {
			console.error('Email verification request failed:', error);
			throw error;
		}
	}

	/**
	 * Update user profile
	 */
	async updateProfile(
		userId: string,
		data: Partial<{ name: string; avatar: File }>
	): Promise<AuthUser> {
		try {
			const formData = new FormData();

			if (data.name) {
				formData.append('name', data.name);
			}

			if (data.avatar) {
				formData.append('avatar', data.avatar);
			}

			const updatedUser = await this.pb.collection('users').update(userId, formData);

			return {
				id: updatedUser.id,
				email: updatedUser.email || '',
				verified: updatedUser.verified || false,
				avatar: updatedUser.avatar || undefined,
				name: updatedUser.name || undefined,
				created: updatedUser.created || '',
				updated: updatedUser.updated || ''
			};
		} catch (error) {
			console.error('Profile update failed:', error);
			throw error;
		}
	}

	/**
	 * Change password
	 */
	async changePassword(data: {
		oldPassword: string;
		password: string;
		passwordConfirm: string;
	}): Promise<void> {
		try {
			if (!this.pb.authStore.record?.id) {
				throw new Error('No authenticated user');
			}

			await this.pb.collection('users').update(this.pb.authStore.record.id, {
				oldPassword: data.oldPassword,
				password: data.password,
				passwordConfirm: data.passwordConfirm
			});
		} catch (error) {
			console.error('Password change failed:', error);
			throw error;
		}
	}
}
