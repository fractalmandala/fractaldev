// ==================== VIEW TRANSITIONS ====================
export {
	supportsViewTransitions,
	startViewTransition,
	injectViewTransitionStyles,
	reinitializeViewTransitions
} from './view-transitions';

// ==================== NAVIGATION ====================
export {
	navigateWithTransition,
	createTransitionLink,
	transitionLink,
	updateAnimationPreference,
	safeResolve,
	disableUserScroll,
	scrollToElementSmooth
} from './navigation';

// ==================== THEME ====================
export { themeStore } from './theme';

// ==================== TOAST ====================
export {
	toast,
	toastState,
	dismiss,
	addToast,
	dismissToast,
	dismissAllToasts,
	updateToast,
	successToast,
	errorToast,
	warningToast,
	infoToast,
	promiseToast
} from './toast.svelte';

// ==================== ANIMATIONS ====================
export { animations } from './animations.svelte';
export { staggeredAnimation, singleElementAnimation, staggerPresets } from './staggered-animation';

export type { StaggeredAnimationOptions } from './staggered-animation';

// ==================== AUTH ====================
export {
	auth,
	initializeAuth,
	loginUser,
	logoutUser,
	type User,
	type AuthState
} from './auth.svelte';

// ==================== CONFIG ====================
export { APP_NAME, getApiUrl, setApiUrl, getPocketBaseInstance, pb } from './config.svelte';

// ==================== VALIDATION ====================
export {
	FormValidator,
	validateField,
	quickValidate,
	getAutoValidationRules,
	getAutoHelperText,
	validateForm,
	type ValidationRule,
	type ValidationResult
} from './validation';

// ==================== COMPONENT UTILITIES ====================
export { default as Mouse } from './Mouse.svelte';
export { default as ScrollToTop } from './ScrollToTop.svelte';
export { default as Seo } from './SEO.svelte';

// ==================== POPOVER & FLOATING ====================
export * from './popover.svelte';
