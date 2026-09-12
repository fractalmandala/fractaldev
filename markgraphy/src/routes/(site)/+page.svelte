<script lang="ts">
	import Close from "$site/components/Close.svelte";
	import Observatory from "$site/components/Observatory.svelte";
	import Principles from "$site/components/Principles.svelte";
	import TheSet from "$site/components/TheSet.svelte";
	import GraphFlowPlayer from "$lib/animated/GraphFlowPlayer.svelte";
	import Graph from "$lib/frame/Graph.svelte";
	import FrameControls, {
		FRAME_DEFAULTS,
		type FrameSettings,
	} from "$site/components/FrameControls.svelte";
	import Heart from '$site/icons/heart.svelte'
	import { staticComponents, animatedComponents } from "$site/docs/catalog";

	const graphCount = staticComponents.filter(c => c.slug.startsWith('graph-')).length;
	const diagramCount = staticComponents.length - graphCount;
	const animationCount = animatedComponents.length;

	// Live frame settings, driven by the panel under the player.
	let frame = $state<FrameSettings>({ ...FRAME_DEFAULTS });
</script>

<div class="site-wrapper">
	<Observatory />
	<Principles />
	<TheSet />
	<section class="showcase border-top pad-top-xl gap-lg box">
		<div class="section-head ta-c box xcenter">
			<h2 class="weight-500 text-2xl">Frame Showcase</h2>
		</div>
		<Graph pad="lg" class="surface" ink="var(--text-primary)">
			<div class="showcase-inner box pad-xl gap-lg">
				<GraphFlowPlayer
					class="panel"
					title="IN THIS LIBRARY"
					autoPlay
					speedMs={1400}
					corner={frame.corner}
					frame={{
						dash: frame.dash,
						motion: frame.motion,
						speed: frame.speed,
						easing: frame.easing,
						pad: frame.pad,
						cornerBlink: frame.cornerBlink,
						pauseOnHover: frame.pauseOnHover,
					}}
					steps={[
						{
							label: `${graphCount} Graphs`,
							detail: "tables, bars, stacks, plot, tree, timeline - composables for it all",
						},
						{
							label: `${diagramCount} Diagram Templates`,
							detail: "and an editor to build them your way.",
						},
						{
							label: `${animationCount} Animations`,
							detail: `mostly just ${animationCount} ways of having fun with this library.`,
						},
					]}
				/>
				<FrameControls bind:settings={frame} />
			</div>
		</Graph>
	</section>
	<div class="box pad-y-2xl xcenter ycenter gap-xs" style="height: 256px">
	<div class="row ycenter xcenter gap-sm wrap">
		<a class="button primary" href="/docs">
			Install and Use <span class="mover">→</span>
		</a>
		<a class="button outline" href="/docs">
			Docs
		</a>
		<a class="button outline" href="/docs/editor">
			Play
		</a>
	</div>
	<div class="text-lg row ycenter gap-2xs">Built with <Heart/> for Sveltekit.</div>
	</div>
</div>

<style>
	@media (max-width: 1024px) {
		.showcase-inner.pad-xl {
			padding: calc(var(--space-md) * var(--pad-scale, 1));
			gap: calc(var(--space-md) * var(--gap-scale, 1));
		}
	}
</style>
