# @partials/form

Form input components and utilities for building forms and collecting user input.

## Button

Versatile button component with multiple variants, sizes, colors, and icon support.

### Props

**`variant`** • `string` • Default: `'primary'`  
Button style (primary, secondary, outline, ghost, link)

**`color`** • `string` • Default: `'blue'`  
Color theme (blue, green, red, yellow, gray, white, purple)

**`size`** • `string` • Default: `'md'`  
Button size (xs, sm, md, lg, xl)

**`disabled`** • `boolean` • Default: `false`  
Disable button

**`loading`** • `boolean` • Default: `false`  
Show loading spinner

**`href`** • `string`  
Link destination (renders as anchor)

**`target`** • `string`  
Link target attribute

**`icon`** • `string`  
Icon emoji/character

**`iconSnippet`** • `Snippet`  
Custom icon component

**`iconComponent`** • `string`  
Icon library (navigation, account, status, action, theme, social)

**`iconName`** • `string`  
Icon name for component

**`iconClass`** • `string` • Default: `'h-4 w-4'`  
Icon sizing classes

**`iconPosition`** • `string` • Default: `'left'`  
Icon position (left, right)

**`fullWidth`** • `boolean` • Default: `false`  
Full width button

**`type`** • `string` • Default: `'button'`  
Button type (button, submit, reset)

**`onclick`** • `function`  
Click handler

**`class`** • `string` • Default: `''`  
Custom classes

**`children`** • `Snippet`  
Button content

### Variants

- **primary**: Solid background
- **secondary**: Light background
- **outline**: Border style
- **ghost**: Transparent with hover effect
- **link**: Text link style

### Colors

- blue, green, red, yellow, gray, white, purple

### Sizes

- xs, sm, md, lg, xl

### Features

- Multiple style variants
- 7 color options
- Icon support (emoji, custom, or from icon libraries)
- Loading state with spinner
- Disabled state
- Full-width option
- Link support
- Dark mode support

---

## FileUpload

File upload component with drag-and-drop, file validation, and directory support.

### Props

**`id`** • `string` • **Required**  
Input ID

**`label`** • `string` • **Required**  
Field label

**`accept`** • `string` • Default: `''`  
Accepted file types

**`multiple`** • `boolean` • Default: `false`  
Allow multiple files

**`directory`** • `boolean` • Default: `false`  
Allow directory upload

**`maxSize`** • `number` • Default: 50MB  
Maximum file size (bytes)

**`required`** • `boolean` • Default: `false`  
Required field

**`disabled`** • `boolean` • Default: `false`  
Disable input

**`helperText`** • `string`  
Helper text

**`errorText`** • `string`  
Error message

**`value`** • `File | File[] | null` • Default: `null`  
Selected files

**`class`** • `string` • Default: `''`  
Container classes

**`onFileSelect`** • `function`  
File selection callback

**`onError`** • `function`  
Error callback

### Features

- Drag-and-drop support
- File type validation
- File size validation
- Multiple or single file
- Directory upload mode
- File preview display
- Formatted file sizes
- Dark mode support
- Keyboard support

### Validation

- File type checking (MIME type and extension)
- Maximum file size enforcement
- Custom error messages

---

## FormField

Universal form field component supporting text, select, textarea, checkbox inputs with automatic validation.

### Props

**`id`** • `string` • **Required**  
Input ID

**`label`** • `string` • **Required**  
Field label

**`type`** • `string` • Default: `'text'`  
Field type

**`placeholder`** • `string`  
Placeholder text

**`required`** • `boolean` • Default: `false`  
Required field

**`disabled`** • `boolean` • Default: `false`  
Disable field

**`readonly`** • `boolean` • Default: `false`  
Read-only field

**`helperText`** • `string`  
Helper text

**`errorText`** • `string`  
Error message

**`value`** • `string | number` • Default: `''`  
Field value (bindable)

**`checked`** • `boolean` • Default: `false`  
Checkbox state (bindable)

**`options`** • `Array` • Default: `[]`  
Select options

**`min`** • `number`  
Min value (number input)

**`max`** • `number`  
Max value (number input)

**`step`** • `number | string`  
Step value (number input)

**`rows`** • `number` • Default: `3`  
Textarea rows

**`class`** • `string` • Default: `''`  
Container classes

**`oninput`** • `function`  
Input event handler

**`onchange`** • `function`  
Change event handler

**`autoValidate`** • `boolean` • Default: `true`  
Enable automatic validation

**`validateOnBlur`** • `boolean` • Default: `true`  
Validate when field loses focus

**`validateOnInput`** • `boolean` • Default: `false`  
Validate while typing

**`customValidationRules`** • `ValidationRule[]` • Default: `[]`  
Custom validation rules

**`confirmValue`** • `string | number`  
Value to confirm against (for password confirmation)

### Supported Types

- text, email, password, number, tel, url, search
- select, checkbox, textarea

### Option Format

```typescript
interface Option {
	value: string | number;
	label: string;
	disabled?: boolean;
}
```

### Automatic Validation

FormField includes built-in validation based on field type:

- **Email**: Valid email format (`user@example.com`)
- **URL**: Valid URL format (`https://example.com`)
- **Phone**: Valid phone number format
- **Password**: Minimum 8 characters
- **Number**: Min/max value validation
- **Text/Textarea**: Min/max length validation

### Validation Rules

```typescript
interface ValidationRule {
	type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'confirm';
	value?: unknown;
	message: string;
}
```

### Validation Behavior

- **Auto Helper Text**: Automatically generated based on field type and constraints
- **Smart Validation**: Only validates after user interaction (blur/input)
- **Real-time Updates**: Clears errors as user fixes them
- **Custom Rules**: Add your own validation rules alongside automatic ones

### Features

- 10+ input types with automatic validation
- Checkbox layout
- Select dropdown
- Textarea support
- Required indicator
- Auto-generated helper text
- Error message display
- Success indicator
- Password confirmation support
- Dark mode support
- Comprehensive styling

### Validation Examples

```svelte
<!-- Email with automatic validation -->
<FormField id="email" label="Email" type="email" required bind:value={email} />

<!-- Password with custom minimum length -->
<FormField id="password" label="Password" type="password" required min={10} bind:value={password} />

<!-- Password confirmation -->
<FormField
	id="confirm-password"
	label="Confirm Password"
	type="password"
	required
	confirmValue={password}
	bind:value={confirmPassword}
/>

<!-- Custom validation rules -->
<FormField
	id="username"
	label="Username"
	required
	customValidationRules={[
		{
			type: 'pattern',
			value: /^[a-zA-Z0-9_]+$/,
			message: 'Username can only contain letters, numbers, and underscores'
		}
	]}
	bind:value={username}
/>

<!-- Disable auto-validation -->
<FormField
	id="custom"
	label="Custom Field"
	autoValidate={false}
	errorText={customError}
	bind:value={customValue}
/>
```

---

## FormValidator

Utility component for form-level validation management (logic-only component).

### Props

**`formData`** • `Record<string, unknown>` • Default: `{}`  
Form data object (bindable)

**`fieldConfigs`** • `Record<string, FieldConfig>` • Default: `{}`  
Field validation configurations

**`validateOnChange`** • `boolean` • Default: `true`  
Auto-validate when form data changes

**`children`** • `Snippet`  
Render prop with validation context

### Field Config

```typescript
interface FieldConfig {
	type: string;
	required?: boolean;
	min?: number;
	max?: number;
	customRules?: ValidationRule[];
	confirmField?: string;
}
```

### Usage

```svelte
<script>
	let formData = { email: '', password: '', confirmPassword: '' };

	const fieldConfigs = {
		email: { type: 'email', required: true },
		password: { type: 'password', required: true, min: 8 },
		confirmPassword: { type: 'password', required: true, confirmField: 'password' }
	};
</script>

<FormValidator bind:formData {fieldConfigs}>
	{#snippet children(validation)}
		<form
			onsubmit={() => {
				const result = validation.validateForm();
				if (result.isValid) {
					// Submit form
				}
			}}
		>
			<FormField
				id="email"
				label="Email"
				type="email"
				required
				bind:value={formData.email}
				errorText={validation.getFieldError('email')}
			/>

			<button type="submit" disabled={!validation.isValid}> Submit </button>
		</form>
	{/snippet}
</FormValidator>
```

### Validation Context

The FormValidator provides these methods and properties through the children snippet:

- `validateForm()` - Validate entire form
- `validateField(fieldName)` - Validate single field
- `clearFieldError(fieldName)` - Clear field error
- `clearAllErrors()` - Clear all errors
- `getFieldError(fieldName)` - Get error message
- `hasFieldError(fieldName)` - Check if field has error
- `errors` - All current errors
- `isValid` - Overall form validity
- `hasValidated` - Whether validation has run

---

## Validation Utilities

Standalone validation functions for custom form handling.

### Functions

- `validateField(value, rules, confirmValue?)` - Validate single value
- `quickValidate(type, value, required, options?)` - Quick type-based validation
- `getAutoValidationRules(type, required, min?, max?)` - Get automatic rules
- `getAutoHelperText(type, required, min?, max?)` - Generate helper text
- `validateForm(formData, fieldConfigs)` - Validate entire form object

### Usage

```typescript
import { quickValidate, validateForm } from '$lib/utils';

// Quick validation
const result = quickValidate('email', 'user@example.com', true);
if (!result.isValid) {
	console.error(result.message);
}

// Form validation
const formResult = validateForm(
	{ email: 'test@test.com', password: '12345' },
	{
		email: { type: 'email', required: true },
		password: { type: 'password', required: true, min: 8 }
	}
);
```

---

## SettingsForm

Pre-built form component for managing application settings.

### Props

**`settings`** • `SettingsData | null` • Default: `null`  
Settings object

**`loading`** • `boolean` • Default: `false`  
Loading state

**`saving`** • `boolean` • Default: `false`  
Saving state

**`onSave`** • `function`  
Save callback

### Settings Data

```typescript
interface SettingsData {
	ui: {
		animationsEnabled: boolean;
		mouseEffectsEnabled: boolean;
	};
}
```

### Features

- UI preferences management
- Animation toggle
- Mouse effects toggle
- Organized in cards
- Save button with loading state
- Form validation
- Reactive updates
