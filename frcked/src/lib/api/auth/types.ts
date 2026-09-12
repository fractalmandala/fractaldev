export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
	passwordConfirm: string;
	name?: string;
}

export interface AuthUser {
	id: string;
	email: string;
	verified: boolean;
	avatar?: string;
	name?: string;
	created: string;
	updated: string;
}

export interface LoginResponse {
	token: string;
	record: AuthUser;
}

export interface RegisterResponse {
	token: string;
	record: AuthUser;
}

export interface AuthError {
	message: string;
	data?: Record<string, string>;
}

export interface PasswordResetRequest {
	email: string;
}

export interface PasswordResetResponse {
	success: boolean;
	message: string;
}

export interface EmailVerificationRequest {
	email: string;
}

export interface EmailVerificationResponse {
	success: boolean;
	message: string;
}
