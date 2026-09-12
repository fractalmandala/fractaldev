<script lang="ts">
	import { FileViewer, generateDesignSpecimenHtml } from '$lib/components/editor';
	import { sampleSpecimenHtml } from './sample-specimen';
	import { SCHEMES, schemeById } from '$lib/demos/registry';

	let selectedSchemeId = $state('default');
	let htmlSource = $state(sampleSpecimenHtml);
	let currentFileName = $state('fractalgraphy-pages.html');

	function handleSelectScheme(schemeId: string) {
		selectedSchemeId = schemeId;
		if (schemeId === 'default') {
			htmlSource = sampleSpecimenHtml;
			currentFileName = 'fractalgraphy-pages.html';
		} else {
			const scheme = schemeById(schemeId);
			if (scheme) {
				htmlSource = generateDesignSpecimenHtml(scheme);
				currentFileName = `${scheme.id}.html`;
			}
		}
	}
</script>

<svelte:head>
	<title>Visual HTML Editor & Inspector — frcked</title>
</svelte:head>

<div class="editor-page-wrapper">
	<FileViewer
		bind:source={htmlSource}
		fileName={currentFileName}
		schemes={SCHEMES}
		{selectedSchemeId}
		onSelectScheme={handleSelectScheme}
	/>
</div>

<style lang="sass">
.editor-page-wrapper
	width: 100%
	padding: 0
	margin: 0
</style>
