<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { FormValidator, type ValidationRule } from '$lib/utils/validation.js';

	interface Option {
		value: string | number;
		label: string;
		disabled?: boolean;
	}

	interface Props {
		id: string;
		label: string;
		type?:
			| 'text'
			| 'email'
			| 'password'
			| 'number'
			| 'tel'
			| 'url'
			| 'search'
			| 'select'
			| 'checkbox'
			| 'textarea';
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		helperText?: string;
		errorText?: string;
		value?: string | number;
		checked?: boolean;
		options?: Option[];
		min?: number;
		max?: number;
		step?: number | string;
		rows?: number;
		class?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		oninput?: (event: Event) => void;
		onchange?: (event: Event) => void;
		// Validation props
		autoValidate?: boolean;
		validateOnBlur?: boolean;
		validateOnInput?: boolean;
		customValidationRules?: ValidationRule[];
		confirmValue?: string | number; // For password confirmation fields
	}

	let {
		id,
		label,
		type = 'text',
		placeholder,
		required = false,
		disabled = false,
		readonly = false,
		helperText,
		errorText,
		value = $bindable(''),
		checked = $bindable(false),
		options = [],
		min,
		max,
		step,
		rows = 3,
		class: className = '',
		autocomplete,
		oninput,
		onchange,
		// Validation props with defaults
		autoValidate = true,
		validateOnBlur = true,
		validateOnInput = false,
		customValidationRules = [],
		confirmValue,
		...restProps
	}: Props = $props();

	// Internal validation state
	let hasBlurred = $state(false);
	let hasInputted = $state(false);

	// Derived validation result
	const validationResult = $derived.by(() => {
		if (!autoValidate || disabled || readonly) {
			return { isValid: true, message: '' };
		}

		// For checkboxes, always validate if required
		// For other fields, don't validate until user has interacted (unless it's required and empty)
		const shouldValidate =
			(validateOnBlur && hasBlurred) ||
			(validateOnInput && hasInputted) ||
			(required && !hasValue) ||
			(isCheckbox && required);

		if (!shouldValidate) {
			return { isValid: true, message: '' };
		}

		// For checkboxes, pass the checked value instead of the string value
		const validationValue = isCheckbox ? checked : value;
		return FormValidator.validateField(validationValue, validationRules, confirmValue);
	});

	// Derived error state
	const internalErrorText = $derived(validationResult.isValid ? '' : validationResult.message);
	const isError = $derived(!!(errorText || internalErrorText));
	const displayError = $derived(errorText || internalErrorText);
	const hasValue = $derived(value !== '' && value !== null && value !== undefined);
	const isCheckbox = $derived(type === 'checkbox');
	const isSelect = $derived(type === 'select');
	const isTextarea = $derived(type === 'textarea');

	// Auto-generate helper text if not provided and autoValidate is enabled
	const computedHelperText = $derived.by(() => {
		if (helperText) return helperText;
		if (!autoValidate || isError) return '';
		return FormValidator.getAutoHelperText(type, required, min, max);
	});

	// Get validation rules
	const validationRules = $derived.by(() => {
		if (!autoValidate) return [];
		const autoRules = FormValidator.getAutoValidationRules(type, required, min, max);
		return [...autoRules, ...customValidationRules];
	});

	// Resolve autocomplete: use explicit prop, otherwise derive from type
	const resolvedAutocomplete = $derived.by((): HTMLInputAttributes['autocomplete'] => {
		if (autocomplete !== undefined) return autocomplete;
		switch (type) {
			case 'email':
				return 'email';
			case 'password':
				return 'current-password';
			case 'tel':
				return 'tel';
			case 'url':
				return 'url';
			default:
				return 'off';
		}
	});

	// Handle input events
	function handleInput(event: Event): void {
		hasInputted = true;

		// Call original oninput handler if provided
		if (oninput) {
			oninput(event);
		}

		// Mark as inputted for validation logic - validation happens via $derived
	}

	function handleBlur(): void {
		hasBlurred = true;

		// Mark as blurred for validation logic - validation happens via $derived
	}

	function handleChange(event: Event): void {
		// For checkboxes, mark as having been interacted with
		if (isCheckbox) {
			hasInputted = true;
			hasBlurred = true;
		}

		// Call original onchange handler if provided
		if (onchange) {
			onchange(event);
		}

		// Mark interaction for validation logic - validation happens via $derived
	}
</script>

<div class="form-field {className}">
	{#if isCheckbox}
		<!-- Checkbox Layout -->
		<div class="checkbox-container" class:error={isError}>
			<input
				{id}
				type="checkbox"
				bind:checked
				{disabled}
				{readonly}
				class="checkbox"
				class:error={isError}
				onchange={handleChange}
				autocomplete="off"
				data-form-type="other"
				{...restProps}
			/>
			<div class="checkbox-content">
				<label for={id} class="checkbox-label">
					{label}
					{#if required}<span class="required">*</span>{/if}
				</label>
				{#if computedHelperText}
					<p class="helper-text">{computedHelperText}</p>
				{/if}
				{#if isError}
					<div class="error-message">
						<svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
						<span>{displayError}</span>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Standard Field Layout -->
		<div class="field-container">
			<label for={id} class="field-label">
				{label}
				{#if required}<span class="required">*</span>{/if}
			</label>

			<div class="input-wrapper">
				{#if isSelect}
					<select
						{id}
						bind:value
						{required}
						{disabled}
						class="input select"
						class:error={isError}
						onchange={handleChange}
						autocomplete="off"
						data-form-type="other"
						{...restProps}
					>
						{#if placeholder}
							<option value="" disabled class="placeholder-option">
								{placeholder}
							</option>
						{/if}
						{#each options as option (option.value)}
							<option value={option.value} disabled={option.disabled}>
								{option.label}
							</option>
						{/each}
					</select>
				{:else if isTextarea}
					<textarea
						{id}
						bind:value
						{placeholder}
						{required}
						{disabled}
						{readonly}
						{rows}
						class="input textarea"
						class:error={isError}
						oninput={handleInput}
						onchange={handleChange}
						onblur={handleBlur}
						autocomplete="off"
						autocapitalize="off"
						spellcheck="false"
						data-form-type="other"
						{...restProps}
					></textarea>
				{:else}
					<input
						{id}
						{type}
						bind:value
						{placeholder}
						{required}
						{disabled}
						{readonly}
						{min}
						{max}
						{step}
						class="input"
						class:error={isError}
						oninput={handleInput}
						onchange={handleChange}
						onblur={handleBlur}
						autocomplete={resolvedAutocomplete}
						autocorrect="off"
						autocapitalize="off"
						spellcheck="false"
						{...restProps}
					/>
				{/if}

				<!-- Success indicator -->
				{#if hasValue && !isError && !isSelect}
					<div class="success-indicator"></div>
				{/if}
			</div>

			<!-- Helper text -->
			{#if computedHelperText && !isError}
				<p class="helper-text">{computedHelperText}</p>
			{/if}

			<!-- Error message -->
			{#if isError}
				<div class="error-message">
					<svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
							clip-rule="evenodd"
						/>
					</svg>
					<span>{displayError}</span>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style lang="sass">
.form-field
	--color-primary: rgba(107, 158, 255, 0.6)
	--color-primary-dark: rgba(74, 127, 230, 0.6)
	--color-success: rgba(91, 199, 138, 0.6)
	--color-error: rgba(255, 153, 51, 0.6)
	--color-text: rgba(55, 65, 81, 0.85)
	--color-text-secondary: rgba(142, 146, 154, 0.75)
	--color-bg: rgba(255, 255, 255, 0.95)
	--color-bg-secondary: rgba(245, 246, 248, 0.8)
	--color-border: rgba(216, 219, 223, 0.6)
	--color-border-hover: rgba(176, 179, 184, 0.7)
	--color-border-focus: var(--color-primary)
	--color-disabled: rgba(176, 179, 184, 0.5)
	--color-disabled-bg: rgba(245, 246, 248, 0.6)
	--shadow-focus: 0 0 0 3px rgba(107, 158, 255, 0.08)
	--border-radius: 8px
	--spacing-xs: 4px
	--spacing-sm: 8px
	--spacing-md: 12px
	--spacing-lg: 16px
	width: 100%

	*
		box-sizing: border-box

:global([data-theme='dark']) .form-field
	--color-text: rgba(229, 231, 235, 0.9)
	--color-text-secondary: rgba(156, 163, 175, 0.7)
	--color-bg: rgba(31, 41, 55, 0.9)
	--color-bg-secondary: rgba(55, 65, 81, 0.7)
	--color-border: rgba(75, 85, 99, 0.6)
	--color-border-hover: rgba(107, 114, 128, 0.7)
	--color-disabled-bg: rgba(55, 65, 81, 0.5)
	--shadow-focus: 0 0 0 3px rgba(107, 158, 255, 0.15)

.checkbox-container
	display: flex
	align-items: row-start
	gap: var(--spacing-md)
	padding: var(--spacing-lg)
	border: 2px solid var(--color-border)
	border-radius: var(--border-radius)
	background-color: var(--color-bg)
	transition: border-color 0.2s ease

	&:hover
		border-color: var(--color-border-hover)

	&.error
		border-color: var(--color-error)

.checkbox
	width: 20px
	height: 20px
	margin-top: 2px
	border: 2px solid var(--color-border)
	border-radius: 4px
	background-color: var(--color-bg)
	cursor: pointer
	transition: all 0.2s ease
	flex-shrink: 0
	appearance: none
	background-size: 16px 16px
	background-position: center
	background-repeat: no-repeat

	&:hover
		border-color: var(--color-border-hover)

	&:focus
		outline: none
		border-color: var(--color-border-focus)
		box-shadow: var(--shadow-focus)

	&:checked
		background-color: var(--color-primary)
		border-color: var(--color-primary)
		background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 20 20' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clip-rule='evenodd'/%3e%3c/svg%3e")

	&:disabled
		cursor: not-allowed
		opacity: 0.5
		background-color: var(--color-disabled-bg)
		border-color: var(--color-disabled)

	&.error
		border-color: var(--color-error)

.checkbox-content
	flex: 1
	min-width: 0

.checkbox-label
	display: block
	font-size: 14px
	font-weight: 500
	color: var(--color-text)
	cursor: pointer
	line-height: 1.4
	margin: 0

.field-container
	display: flex
	flex-direction: column
	gap: var(--spacing-sm)

.field-label
	display: block
	font-size: 14px
	font-weight: 500
	color: var(--color-text)
	margin: 0

.required
	color: var(--color-error)
	margin-left: var(--spacing-xs)

.input-wrapper
	position: relative

.input
	width: 100%
	padding: var(--spacing-md)
	font-size: 14px
	line-height: 1.5
	color: var(--color-text)
	background-color: var(--color-bg)
	border: 2px solid var(--color-border)
	border-radius: var(--border-radius)
	transition: all 0.2s ease
	outline: none

	&::placeholder
		color: var(--color-text-secondary)

	&:hover:not(:disabled)
		border-color: var(--color-border-hover)

	&:focus
		border-color: var(--color-border-focus)
		box-shadow: var(--shadow-focus)

	&:disabled
		cursor: not-allowed
		opacity: 0.6
		background-color: var(--color-disabled-bg)
		color: var(--color-disabled)

	&:read-only
		background-color: var(--color-bg-secondary)
		cursor: default

	&.error
		border-color: var(--color-error)

		&:focus
			border-color: var(--color-error)
			box-shadow: 0 0 0 3px rgba(255, 153, 51, 0.08)

.select
	appearance: none
	background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%236b7280'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3e%3c/svg%3e")
	background-repeat: no-repeat
	background-position: right var(--spacing-md) center
	background-size: 16px 16px
	padding-right: 40px
	cursor: pointer

	&:disabled
		cursor: not-allowed

.placeholder-option
	color: var(--color-text-secondary)

.textarea
	resize: vertical
	min-height: 80px
	font-family: inherit

.success-indicator
	position: absolute
	top: 50%
	right: var(--spacing-md)
	width: 8px
	height: 8px
	background-color: var(--color-success)
	border-radius: 50%
	transform: translateY(-50%)

.helper-text
	font-size: 12px
	line-height: 1.4
	color: var(--color-text-secondary)
	margin: 0

.error-message
	display: flex
	align-items: row-start
	gap: var(--spacing-sm)
	font-size: 12px
	color: var(--color-error)
	margin: 0

.error-icon
	width: 16px
	height: 16px
	flex-shrink: 0
	margin-top: 1px

@media (max-width: 640px)
	.input
		font-size: 16px

	.checkbox-container
		padding: var(--spacing-md)

	.checkbox
		width: 24px
		height: 24px

@media (prefers-contrast: high)
	.input,
	.checkbox
		border-width: 2px

	.input:focus,
	.checkbox:focus
		outline: 2px solid var(--color-border-focus)
		outline-offset: 2px

@media (prefers-reduced-motion: reduce)
	.input,
	.checkbox,
	.checkbox-container
		transition: none
</style>
