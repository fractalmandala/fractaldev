<script lang="ts">
	import { onMount } from 'svelte';
	import 'virtual:fractutils.css';
	import { initPresets, getPresetScript } from '$lib/ui/presets.svelte';
	import Appshell from '$lib/components/ui/Appshell.svelte'
	import DropdownMenu from '$lib/components/ui/DropdownMenu.svelte';
	import ModeToggle from '$lib/components/presets/ModeToggle.svelte';
	import LayoutPicker from '$lib/components/presets/LayoutPicker.svelte';
	import ShellTypePicker from '$lib/components/presets/ShellTypePicker.svelte';
	import SiteLogo from '$lib/icons/futils.svelte'
	import SidebarLeft from '$lib/components/ui/SidebarLeft.svelte';

	let { children } = $props();

	onMount(() => {
		initPresets();
	});
</script>

<svelte:head>
	{@html `<script>${getPresetScript()}<\/script>`}
</svelte:head>

<Appshell>
	{#snippet appHeader()}
		<a class="nav-logo" href="/">
			<span class="bold text-tight-lg">fractalutils</span>
		</a>
		<div class="row ycenter gap-bs">
			<ModeToggle/>
			<DropdownMenu label="Layout">
				<LayoutPicker/>
			</DropdownMenu>
			<DropdownMenu label="Shell">
				<ShellTypePicker/>
			</DropdownMenu>
		</div>
	{/snippet}

	{#snippet sidebarLeft()}
		<nav class="navtree pad-bs">
			<SidebarLeft/>
		</nav>
	{/snippet}

	{#snippet sidebarRight()}
		<!-- toc -->
	{/snippet}

	{#snippet appFooter()}
		footer
	{/snippet}

	{@render children()}
</Appshell>
