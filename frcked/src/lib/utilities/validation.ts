export interface ValidationRule {
	type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'confirm';
	value?: unknown;
	message: string;
}

export interface ValidationResult {
	isValid: boolean;
	message: string;
}

export class FormValidator {
	private static emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	private static urlRegex =
		/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
	private static phoneRegex = /^[+]?[1-9][\d]{0,15}$/;

	/**
	 * Get automatic validation rules based on field type
	 */
	static getAutoValidationRules(
		fieldType: string,
		required: boolean = false,
		min?: number,
		max?: number
	): ValidationRule[] {
		const rules: ValidationRule[] = [];

		// Required validation
		if (required) {
			rules.push({
				type: 'required',
				message: 'This field is required'
			});
		}

		// Type-specific validations
		switch (fieldType) {
			case 'email':
				rules.push({
					type: 'email',
					message: 'Please enter a valid email address'
				});
				break;

			case 'url':
				rules.push({
					type: 'pattern',
					value: this.urlRegex,
					message: 'Please enter a valid URL (e.g., https://example.com)'
				});
				break;

			case 'tel':
				rules.push({
					type: 'pattern',
					value: this.phoneRegex,
					message: 'Please enter a valid phone number'
				});
				break;

			case 'password':
				rules.push({
					type: 'minLength',
					value: 8,
					message: 'Password must be at least 8 characters long'
				});
				break;

			case 'number':
				if (min !== undefined) {
					rules.push({
						type: 'min',
						value: min,
						message: `Value must be at least ${min}`
					});
				}
				if (max !== undefined) {
					rules.push({
						type: 'max',
						value: max,
						message: `Value must be at most ${max}`
					});
				}
				break;

			case 'text':
			case 'textarea':
				// Add reasonable defaults for text fields
				if (min !== undefined) {
					rules.push({
						type: 'minLength',
						value: min,
						message: `Must be at least ${min} characters long`
					});
				}
				if (max !== undefined) {
					rules.push({
						type: 'maxLength',
						value: max,
						message: `Must be at most ${max} characters long`
					});
				}
				break;
		}

		return rules;
	}

	/**
	 * Validate a single field value against validation rules
	 */
	static validateField(
		value: unknown,
		rules: ValidationRule[],
		confirmValue?: unknown
	): ValidationResult {
		// Convert value to string for most validations
		const stringValue = value?.toString() || '';

		for (const rule of rules) {
			switch (rule.type) {
				case 'required':
					// For boolean values (checkboxes), check if it's true
					if (typeof value === 'boolean') {
						if (!value) {
							return { isValid: false, message: rule.message };
						}
					} else if (value === null || value === undefined || stringValue.trim() === '') {
						return { isValid: false, message: rule.message };
					}
					break;

				case 'email':
					if (stringValue && !this.emailRegex.test(stringValue)) {
						return { isValid: false, message: rule.message };
					}
					break;

				case 'minLength':
					if (stringValue && stringValue.length < (rule.value as number)) {
						return { isValid: false, message: rule.message };
					}
					break;

				case 'maxLength':
					if (stringValue && stringValue.length > (rule.value as number)) {
						return { isValid: false, message: rule.message };
					}
					break;

				case 'pattern':
					if (stringValue && !(rule.value as RegExp).test(stringValue)) {
						return { isValid: false, message: rule.message };
					}
					break;

				case 'min': {
					const numValue = typeof value === 'number' ? value : parseFloat(stringValue);
					if (!isNaN(numValue) && numValue < (rule.value as number)) {
						return { isValid: false, message: rule.message };
					}
					break;
				}

				case 'max': {
					const maxNumValue = typeof value === 'number' ? value : parseFloat(stringValue);
					if (!isNaN(maxNumValue) && maxNumValue > (rule.value as number)) {
						return { isValid: false, message: rule.message };
					}
					break;
				}

				case 'confirm':
					// Only validate if we have a confirm value
					if (confirmValue !== undefined) {
						const confirmStringValue = confirmValue?.toString() || '';
						// Always validate if current field has a value
						if (stringValue && stringValue !== confirmStringValue) {
							return { isValid: false, message: rule.message };
						}
					}
					break;
			}
		}

		return { isValid: true, message: '' };
	}

	/**
	 * Quick validation for common field types
	 */
	static quickValidate(
		fieldType: string,
		value: unknown,
		required: boolean = false,
		options: {
			min?: number;
			max?: number;
			confirmValue?: unknown;
			customRules?: ValidationRule[];
		} = {}
	): ValidationResult {
		const autoRules = this.getAutoValidationRules(fieldType, required, options.min, options.max);

		// Add custom rules if provided
		const allRules = [...autoRules, ...(options.customRules || [])];

		// Special handling for confirm fields - add confirmation validation
		if (options.confirmValue !== undefined) {
			allRules.push({
				type: 'confirm',
				message: 'Passwords do not match'
			});
		}

		return this.validateField(value, allRules, options.confirmValue);
	}

	/**
	 * Get helper text based on field type and validation rules
	 */
	static getAutoHelperText(
		fieldType: string,
		required: boolean = false,
		min?: number,
		max?: number
	): string {
		const hints: string[] = [];

		if (required) {
			hints.push('Required');
		}

		switch (fieldType) {
			case 'email':
				hints.push('Valid email format required');
				break;

			case 'password':
				hints.push('Minimum 8 characters');
				break;

			case 'url':
				hints.push('Must be a valid URL (https://...)');
				break;

			case 'tel':
				hints.push('Valid phone number format');
				break;

			case 'number':
				if (min !== undefined && max !== undefined) {
					hints.push(`Value between ${min} and ${max}`);
				} else if (min !== undefined) {
					hints.push(`Minimum value: ${min}`);
				} else if (max !== undefined) {
					hints.push(`Maximum value: ${max}`);
				}
				break;

			case 'text':
			case 'textarea':
				if (min !== undefined && max !== undefined) {
					hints.push(`${min}-${max} characters`);
				} else if (min !== undefined) {
					hints.push(`Minimum ${min} characters`);
				} else if (max !== undefined) {
					hints.push(`Maximum ${max} characters`);
				}
				break;
		}

		return hints.join(' • ');
	}

	/**
	 * Validate an entire form object
	 */
	static validateForm(
		formData: Record<string, unknown>,
		fieldConfigs: Record<
			string,
			{
				type: string;
				required?: boolean;
				min?: number;
				max?: number;
				customRules?: ValidationRule[];
				confirmField?: string; // Field name to confirm against
			}
		>
	): {
		isValid: boolean;
		errors: Record<string, string>;
	} {
		const errors: Record<string, string> = {};
		let isValid = true;

		for (const [fieldName, config] of Object.entries(fieldConfigs)) {
			const value = formData[fieldName];
			let confirmValue: unknown;

			// Handle confirmation fields - get the value of the field we're confirming against
			if (config.confirmField) {
				confirmValue = formData[config.confirmField];
			}

			const result = this.quickValidate(config.type, value, config.required, {
				min: config.min,
				max: config.max,
				confirmValue,
				customRules: config.customRules
			});

			if (!result.isValid) {
				errors[fieldName] = result.message;
				isValid = false;
			}
		}

		return { isValid, errors };
	}
}

// Export convenience functions (bound to preserve correct this context)
export const validateField = FormValidator.validateField.bind(FormValidator);
export const quickValidate = FormValidator.quickValidate.bind(FormValidator);
export const getAutoValidationRules = FormValidator.getAutoValidationRules.bind(FormValidator);
export const getAutoHelperText = FormValidator.getAutoHelperText.bind(FormValidator);
export const validateForm = FormValidator.validateForm.bind(FormValidator);
