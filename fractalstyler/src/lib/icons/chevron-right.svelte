<script lang="ts">

	interface Props  { 
		rotate: boolean;
		size: number
	}

	let {
		rotate = false,
		size = 15
	} = $props()

</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class:rotated={rotate}
>
  <path d="m9 18 6-6-6-6" />
</svg>

<style lang="sass">

svg
	transform: rotate(0)
svg.rotated
	transform: rotate(90deg)

</style>
