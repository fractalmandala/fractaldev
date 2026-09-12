<script lang="ts">
	import { Card, FormField, Button } from '$lib/components/partials';
	import type { SettingsData } from '$lib/components/main';

	let {
		settings,
		loading = false,
		saving = false,
		onSave
	}: {
		settings: SettingsData | null;
		loading?: boolean;
		saving?: boolean;
		onSave?: (data: { animationsEnabled: boolean; mouseEffectsEnabled: boolean }) => void;
	} = $props();

	let formData = $state({
		animationsEnabled: true,
		mouseEffectsEnabled: true
	});

	// Update form data when settings change
	$effect(() => {
		if (settings) {
			formData = {
				animationsEnabled: settings.ui.animationsEnabled,
				mouseEffectsEnabled: settings.ui.mouseEffectsEnabled
			};
		}
	});

	function handleSubmit(e: Event) {
		e.preventDefault();
		onSave?.({
			animationsEnabled: formData.animationsEnabled,
			mouseEffectsEnabled: formData.mouseEffectsEnabled
		});
	}
</script>

<form onsubmit={handleSubmit} class="box gap-2xl">
	<!-- UI Settings Card -->
	<Card
		title="User Interface Settings"
		subtitle="Configure visual preferences and animations"
		class="box gap-lg"
	>
		<div class="box gap-lg">
			<FormField
				id="animations-enabled"
				label="Enable UI Animations"
				type="checkbox"
				bind:checked={formData.animationsEnabled}
				helperText="Enable GPU transitions & animations"
			/>

			<FormField
				id="mouse-effects-enabled"
				label="Enable Mouse Effects"
				type="checkbox"
				bind:checked={formData.mouseEffectsEnabled}
				helperText="Enable mouse trail & click ripple FX"
			/>
		</div>
	</Card>

	<!-- Save Button Section -->
	<Card padding="lg" class="border-2 border-dashed dark:border-gray-700">
		<div class="box gap-md sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h3 class="text-sm weight-500 text-primary xl:text-lg">Save Configuration</h3>
				<p class="text-xs text-secondary xl:text-sm">Apply your changes to update</p>
			</div>
			<Button
				type="submit"
				loading={saving}
				disabled={saving || loading}
				color="blue"
				variant="outline"
				size="lg"
				class="wfull sm:w-auto"
			>
				{saving ? 'Saving...' : 'Save Settings'}
			</Button>
		</div>
	</Card>
</form>
