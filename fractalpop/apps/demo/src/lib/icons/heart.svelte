<script lang="ts">
	interface Props {
		size?: number;
	}

	let { size = 24 }: Props = $props();
</script>

<svg class="heart-beat" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.8197 5.57912L11.999 6.40162L11.1757 5.57837C9.07663 3.47931 5.67337 3.47931 3.5743 5.57837C1.47523 7.67744 1.47523 11.0807 3.5743 13.1798L11.4697 21.0751C11.7626 21.368 12.2374 21.368 12.5303 21.0751L20.4318 13.1783C22.5262 11.0723 22.5298 7.67857 20.4303 5.57912C18.3274 3.47623 14.9226 3.47623 12.8197 5.57912Z" fill="url(#paint0_linear_387_149)"/>
<defs>
<linearGradient id="paint0_linear_387_149" x1="-2.37582" y1="-0.938864" x2="8.13523" y2="21.3771" gradientUnits="userSpaceOnUse">
<stop stop-color="#E16A0F"/>
<stop offset="1" stop-color="#FF3E00"/>
</linearGradient>
</defs>
</svg>

<style lang="sass">

@keyframes heartbeat
	0%
		transform: scale(1)
	14%
		transform: scale(1.12)
	28%
		transform: scale(1)
	42%
		transform: scale(1.07)
	70%
		transform: scale(1)
	100%
		transform: scale(1)
.heart-beat
	display: inline-block
	transform-origin: center
	animation: heartbeat 1.4s ease-in-out infinite
	will-change: transform
@media (prefers-reduced-motion: reduce)
	.heart-beat
		animation: none

</style>