<script lang="ts">
	import { Button, Card, FormField, FileUpload, FormValidator } from '$lib/components/partials';
	import { successToast, errorToast } from '$lib/utils';

	// Demo form data
	let basicFormData = $state({
		email: '',
		password: '',
		confirmPassword: '',
		username: '',
		age: '',
		website: ''
	});

	let validationFormData = $state({
		email: '',
		password: '',
		confirmPassword: ''
	});

	let checkboxData = $state({
		terms: false
	});

	const validationFieldConfigs = {
		email: { type: 'email', required: true },
		password: { type: 'password', required: true, min: 8 },
		confirmPassword: { type: 'password', required: true, confirmField: 'password' }
	};

	function handleValidationSubmit(validation: {
		validateForm: () => { isValid: boolean; errors: Record<string, string> };
	}) {
		const result = validation.validateForm();
		if (result.isValid) {
			successToast('Form is valid! Ready to submit.');
		} else {
			errorToast('Please fix the validation errors.');
		}
	}
</script>

<div class="box gap-32">
	<!-- Button Component -->
	<Card
		title="Button"
		subtitle="Versatile button component with multiple variants, sizes, colors, and icon support."
		expandable={true}
		defaultExpanded={false}
		class="pad-24"
	>
		<div class="marg-bottom-24 gap-16">
			<div class="box gap-32">
				<h3 class="text-lg weight-500 text-primary">Variants</h3>
				<div class="row wrap gap-8">
					<Button variant="primary">Primary</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="link">Link</Button>
				</div>
			</div>

			<div class="box gap-32">
				<h3 class="text-lg weight-500 text-primary">Colors</h3>
				<div class="row wrap gap-8">
					<Button color="blue">Blue</Button>
					<Button color="green">Green</Button>
					<Button color="red">Red</Button>
					<Button color="yellow">Yellow</Button>
					<Button color="gray">Gray</Button>
					<Button color="white">White</Button>
					<Button color="purple">Purple</Button>
				</div>
			</div>

			<div class="box gap-32">
				<h3 class="text-lg weight-500 text-primary">Sizes</h3>
				<div class="row wrap ycenter gap-8">
					<Button size="xs">Extra Small</Button>
					<Button size="sm">Small</Button>
					<Button size="md">Medium</Button>
					<Button size="lg">Large</Button>
					<Button size="xl">Extra Large</Button>
				</div>
			</div>

			<div class="box gap-32">
				<h3 class="text-lg weight-500 text-primary">States</h3>
				<div class="row wrap gap-8">
					<Button>Normal</Button>
					<Button disabled>Disabled</Button>
					<Button loading>Loading</Button>
				</div>
			</div>

			<div class="box gap-32">
				<h3 class="text-lg weight-500 text-primary">Icons & Positions</h3>
				<div class="row wrap gap-8">
					<Button icon="🚀" iconPosition="left">Left Icon</Button>
					<Button icon="🎯" iconPosition="right" variant="outline">Right Icon</Button>
					<Button iconComponent="action" iconName="edit" iconClass="square-16" variant="secondary">
						Component Icon
					</Button>
				</div>
			</div>
		</div>
	</Card>

	<!-- FormField Component -->
	<Card
		title="FormField"
		subtitle="Universal form field component with automatic validation based on field types."
		expandable={true}
		defaultExpanded={false}
		class="pad-24"
	>
		<div class="box gap-32">
			<!-- Basic Form Fields -->
			<div>
				<h3 class="marg-bottom-16 text-lg weight-500 text-primary">
					Basic Fields with Auto-Validation
				</h3>
				<form class="grid gap-16 md:grid-cols-2" onsubmit={(e) => e.preventDefault()}>
					<!-- Email with automatic validation -->
					<FormField
						id="email-auto"
						label="Email (Auto-validated)"
						type="email"
						placeholder="user@example.com"
						required={true}
						bind:value={basicFormData.email}
					/>

					<!-- Password with auto validation -->
					<FormField
						id="password-auto"
						label="Password (Min 8 chars)"
						type="password"
						placeholder="Enter password..."
						required={true}
						bind:value={basicFormData.password}
					/>

					<!-- Password confirmation -->
					<FormField
						id="confirm-password-auto"
						label="Confirm Password"
						type="password"
						placeholder="Confirm password..."
						required={true}
						confirmValue={basicFormData.password}
						bind:value={basicFormData.confirmPassword}
						customValidationRules={[
							{
								type: 'confirm',
								message: 'Passwords do not match'
							}
						]}
					/>

					<!-- Username with custom validation -->
					<FormField
						id="username-custom"
						label="Username (Custom Rules)"
						placeholder="alphanumeric_only"
						required={true}
						customValidationRules={[
							{
								type: 'pattern',
								value: /^[a-zA-Z0-9_]+$/,
								message: 'Username can only contain letters, numbers, and underscores'
							},
							{
								type: 'minLength',
								value: 3,
								message: 'Username must be at least 3 characters'
							}
						]}
						bind:value={basicFormData.username}
					/>

					<!-- Number with min/max -->
					<FormField
						id="age-number"
						label="Age (18-120)"
						type="number"
						placeholder="Your age"
						min={18}
						max={120}
						required={true}
						bind:value={basicFormData.age}
					/>

					<!-- URL validation -->
					<FormField
						id="website-url"
						label="Website (URL)"
						type="url"
						placeholder="https://example.com"
						bind:value={basicFormData.website}
					/>

					<!-- Text input (no auto-validation) -->
					<FormField
						id="text-no-validation"
						label="Text (No Auto-Validation)"
						placeholder="Enter anything..."
						autoValidate={false}
						helperText="This field has auto-validation disabled"
					/>

					<!-- Select Input -->
					<FormField
						id="select-input"
						label="Select Dropdown"
						type="select"
						required={true}
						options={[
							{ value: '', label: 'Choose an option' },
							{ value: 'option1', label: 'Option 1' },
							{ value: 'option2', label: 'Option 2' },
							{ value: 'option3', label: 'Option 3', disabled: true }
						]}
					/>

					<!-- Checkbox -->
					<FormField
						id="checkbox-input"
						label="I agree to terms"
						type="checkbox"
						required={true}
						helperText="Please read and accept the terms"
						bind:checked={checkboxData.terms}
					/>

					<!-- Textarea with length limits -->
					<FormField
						id="textarea-input"
						label="Message (10-500 chars)"
						type="textarea"
						placeholder="Enter your message..."
						rows={4}
						min={10}
						max={500}
						required={true}
					/>
				</form>
			</div>

			<!-- Validation Behavior Demo -->
			<div>
				<h3 class="marg-bottom-16 text-lg weight-500 text-primary">Validation Behavior Options</h3>
				<div class="grid gap-16 md:grid-cols-3">
					<FormField
						id="validate-on-blur"
						label="Validate on Blur (Default)"
						type="email"
						placeholder="user@example.com"
						required={true}
						validateOnBlur={true}
						validateOnInput={false}
						helperText="Validates when you click away"
					/>

					<FormField
						id="validate-on-input"
						label="Validate on Input"
						type="email"
						placeholder="user@example.com"
						required={true}
						validateOnBlur={false}
						validateOnInput={true}
						helperText="Validates as you type"
					/>

					<FormField
						id="validate-both"
						label="Validate on Both"
						type="email"
						placeholder="user@example.com"
						required={true}
						validateOnBlur={true}
						validateOnInput={true}
						helperText="Validates on both blur and input"
					/>
				</div>
			</div>
		</div>
	</Card>

	<!-- FormValidator Component Demo -->
	<Card
		title="FormValidator"
		subtitle="Form-level validation component that manages validation state across multiple fields."
		expandable={true}
		defaultExpanded={false}
		class="pad-24"
	>
		<FormValidator bind:formData={validationFormData} fieldConfigs={validationFieldConfigs}>
			{#snippet children(validation)}
				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleValidationSubmit(validation);
					}}
					class="box gap-16"
				>
					<div class="grid gap-16 md:grid-cols-2">
						<FormField
							id="form-validator-email"
							label="Email"
							type="email"
							placeholder="user@example.com"
							required={true}
							bind:value={validationFormData.email}
							errorText={validation.getFieldError('email')}
							autoValidate={false}
							oninput={() => validation.validateField('email')}
						/>

						<FormField
							id="form-validator-password"
							label="Password (8+ chars)"
							type="password"
							placeholder="Enter password..."
							required={true}
							bind:value={validationFormData.password}
							errorText={validation.getFieldError('password')}
							autoValidate={false}
							oninput={() => {
								validation.validateField('password');
								if (validationFormData.confirmPassword) {
									validation.validateField('confirmPassword');
								}
							}}
						/>

						<div class="md:col-span-2">
							<FormField
								id="form-validator-confirm"
								label="Confirm Password"
								type="password"
								placeholder="Confirm password..."
								required={true}
								bind:value={validationFormData.confirmPassword}
								errorText={validation.getFieldError('confirmPassword')}
								autoValidate={false}
								oninput={() => validation.validateField('confirmPassword')}
							/>
						</div>
					</div>

					<div
						class="box gap-16 pad-top-16 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
					>
						<div class="text-sm text-secondary sm:mb-0">
							<div class="row ycenter gap-8">
								<span>Form valid:</span>
								<span class={validation.isValid ? 'text-green-600' : 'text-red-600'}>
									{validation.isValid ? 'Yes' : 'No'}
								</span>
							</div>
							{#if validation.hasValidated}
								<div class="marg-top-4">
									<span>Errors: {Object.keys(validation.errors).length}</span>
									{#if Object.keys(validation.errors).length > 0}
										<div class="marg-top-4 text-xs">
											Fields: {Object.keys(validation.errors).join(', ')}
										</div>
									{/if}
								</div>
							{/if}
						</div>

						<div class="box wfull gap-32 sm:w-auto sm:flex-row sm:space-y-0 sm:gap-8">
							<Button
								variant="outline"
								onclick={() => {
									validation.clearAllErrors();
									validationFormData.email = '';
									validationFormData.password = '';
									validationFormData.confirmPassword = '';
								}}
								disabled={!validation.hasValidated &&
									validationFormData.email === '' &&
									validationFormData.password === '' &&
									validationFormData.confirmPassword === ''}
								class="wfull sm:w-auto"
							>
								Reset Form
							</Button>
							<Button
								type="submit"
								variant="primary"
								color="blue"
								disabled={!validation.isValid}
								class="wfull sm:w-auto"
							>
								Submit Form
							</Button>
						</div>
					</div>
				</form>
			{/snippet}
		</FormValidator>
	</Card>

	<!-- FileUpload Component -->
	<Card
		title="FileUpload"
		subtitle="File upload component with drag-and-drop, validation, and multiple configurations."
		expandable={true}
		defaultExpanded={false}
		class="pad-24"
	>
		<div class="box gap-24">
			<!-- Single File Upload -->
			<div>
				<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Single File Upload</h3>
				<FileUpload
					id="single-file"
					label="Upload Image"
					accept="image/*"
					multiple={false}
					maxSize={5 * 1024 * 1024}
					helperText="Upload a single image file (max 5MB)"
				/>
			</div>

			<!-- Multiple File Upload -->
			<div>
				<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Multiple File Upload</h3>
				<FileUpload
					id="multiple-files"
					label="Upload Documents"
					accept=".pdf,.doc,.docx,.txt"
					multiple={true}
					maxSize={10 * 1024 * 1024}
					helperText="Upload multiple documents (max 10MB each)"
				/>
			</div>

			<!-- Directory Upload -->
			<div>
				<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Directory Upload</h3>
				<FileUpload
					id="directory-upload"
					label="Upload Directory"
					multiple={true}
					directory={true}
					helperText="Upload an entire directory of files"
				/>
			</div>

			<!-- Required Upload -->
			<div>
				<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Required Upload</h3>
				<FileUpload
					id="required-upload"
					label="Required File"
					accept=".csv,.xlsx"
					required={true}
					helperText="Please upload a CSV or Excel file"
					errorText="File upload is required"
				/>
			</div>

			<!-- Disabled Upload -->
			<div>
				<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Disabled Upload</h3>
				<FileUpload
					id="disabled-upload"
					label="Disabled Upload"
					disabled={true}
					helperText="File upload is currently disabled"
				/>
			</div>
		</div>
	</Card>
</div>
