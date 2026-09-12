<script lang="ts">
	import type { Snippet } from 'svelte';
	import { FormValidator as Validator, type ValidationRule } from '$lib/utils/validation.js';

	interface FieldConfig {
		type: string;
		required?: boolean;
		min?: number;
		max?: number;
		customRules?: ValidationRule[];
		confirmField?: string;
	}

	interface Props {
		formData: Record<string, unknown>;
		fieldConfigs: Record<string, FieldConfig>;
		validateOnChange?: boolean;
		children?: Snippet<
			[
				{
					validateForm: () => { isValid: boolean; errors: Record<string, string> };
					validateField: (fieldName: string) => boolean;
					clearFieldError: (fieldName: string) => void;
					clearAllErrors: () => void;
					getFieldError: (fieldName: string) => string;
					hasFieldError: (fieldName: string) => boolean;
					errors: Record<string, string>;
					isValid: boolean;
					hasValidated: boolean;
				}
			]
		>;
	}

	let {
		formData = $bindable({}),
		fieldConfigs = {},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		validateOnChange = true,
		children
	}: Props = $props();

	// Form validation state
	let errors = $state({} as Record<string, string>);
	let hasValidated = $state(false);
	let validationVersion = $state(0); // Used to trigger re-validation

	// Derived state for form validity (removed - using currentIsValid instead)

	// Validate a single field (pure function)
	function validateSingleField(
		fieldName: string,
		config: FieldConfig,
		currentFormData: Record<string, unknown>
	): { isValid: boolean; message: string } {
		const value = currentFormData[fieldName];
		let confirmValue: unknown;

		if (config.confirmField) {
			confirmValue = currentFormData[config.confirmField];
		}

		return Validator.quickValidate(config.type, value, config.required, {
			min: config.min,
			max: config.max,
			confirmValue,
			customRules: config.customRules
		});
	}

	// Track validation version for re-validation triggers
	$effect(() => {
		void validationVersion; // Force dependency tracking
	});

	// Validate the entire form
	function validateForm(): { isValid: boolean; errors: Record<string, string> } {
		const result = Validator.validateForm(formData, fieldConfigs);
		errors = { ...result.errors };
		hasValidated = true;

		// Trigger auto-validation to start
		validationVersion++;

		return { isValid: result.isValid, errors: { ...result.errors } };
	}

	// Validate a single field
	function validateField(fieldName: string): boolean {
		const config = fieldConfigs[fieldName];
		if (!config) return true;

		const result = validateSingleField(fieldName, config, formData);

		// Always use current errors as base
		const newErrors = { ...errors };

		if (result.isValid) {
			delete newErrors[fieldName];
		} else {
			newErrors[fieldName] = result.message;
		}

		// Also validate dependent fields (password confirmation)
		for (const [depFieldName, depConfig] of Object.entries(fieldConfigs)) {
			if (depConfig.confirmField === fieldName && depFieldName in formData) {
				const depResult = validateSingleField(depFieldName, depConfig, formData);
				if (depResult.isValid) {
					delete newErrors[depFieldName];
				} else {
					newErrors[depFieldName] = depResult.message;
				}
			}
		}

		errors = newErrors;

		// If we haven't validated yet, mark as validated
		if (!hasValidated) {
			hasValidated = true;
			validationVersion++;
		}

		return result.isValid;
	}

	// Clear errors for a specific field
	function clearFieldError(fieldName: string): void {
		const newErrors = { ...errors };
		delete newErrors[fieldName];
		errors = newErrors;
	}

	// Clear all errors
	function clearAllErrors(): void {
		errors = {};
		hasValidated = false;
		validationVersion = 0;
	}

	// Get error message for a specific field
	function getFieldError(fieldName: string): string {
		return errors[fieldName] || '';
	}

	// Check if field has error
	function hasFieldError(fieldName: string): boolean {
		return !!errors[fieldName];
	}

	// Derived validity state - form is invalid if it has errors OR if it has required empty fields
	const isValid = $derived.by(() => {
		// If there are validation errors, form is invalid
		if (Object.keys(errors).length > 0) {
			return false;
		}

		// Check if any required fields are empty
		for (const [fieldName, config] of Object.entries(fieldConfigs)) {
			if (config.required) {
				const value = formData[fieldName];
				// For boolean fields (checkboxes), check if it's false
				if (typeof value === 'boolean') {
					if (!value) return false;
				} else {
					// For other fields, check if empty
					if (value === null || value === undefined || value === '') {
						return false;
					}
				}
			}
		}

		return true;
	});

	// Expose validation methods through a derived object
	const validationContext = $derived({
		validateForm,
		validateField,
		clearFieldError,
		clearAllErrors,
		getFieldError,
		hasFieldError,
		errors,
		isValid,
		hasValidated
	});
</script>

<!--
FormValidator component provides form-level validation management.

Usage:
```svelte
<script>
	let formData = { email: '', password: '', confirmPassword: '' };

	const fieldConfigs = {
		email: { type: 'email', required: true },
		password: { type: 'password', required: true, min: 8 },
		confirmPassword: { type: 'password', required: true, confirmField: 'password' }
	};

	function handleSubmit(validation) {
		const result = validation.validateForm();
		if (result.isValid) {
			// Submit form
		}
	}
</script>

<FormValidator bind:formData {fieldConfigs}>
	{#snippet children(validation)}
		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(validation); }}>
			<FormField
				id="email"
				label="Email"
				type="email"
				required
				bind:value={formData.email}
				errorText={validation.getFieldError('email')}
			/>

			<FormField
				id="password"
				label="Password"
				type="password"
				required
				bind:value={formData.password}
				errorText={validation.getFieldError('password')}
			/>

			<FormField
				id="confirmPassword"
				label="Confirm Password"
				type="password"
				required
				bind:value={formData.confirmPassword}
				errorText={validation.getFieldError('confirmPassword')}
			/>

			<button type="submit" disabled={!validation.isValid}>Submit</button>
		</form>
	{/snippet}
</FormValidator>
```
-->

{@render children?.(validationContext)}
