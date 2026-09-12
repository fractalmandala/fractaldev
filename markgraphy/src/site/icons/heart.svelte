<script lang="ts">
	interface Props {
		/** Square size in px. Default 48. */
		size?: number | string;
		/** Beat, or sit still. Default true. Always still under reduced motion. */
		beating?: boolean;
		/** Seconds per beat cycle. Default 1.2 — roughly a resting pulse. */
		speed?: number;
		class?: string;
	}

	let { size = 32, beating = true, speed = 1.2, class: className = '' }: Props = $props();

	// The gradient id has to be unique per instance: two hearts on one page
	// would otherwise share one <linearGradient> definition.
	const uid = $props.id();
	const gradient = `heart-gradient-${uid}`;
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 48 48"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class={className}
	style="--beat-speed:{speed}s"
	aria-hidden="true"
>
	<path class="heart" class:beating d="M25.6394 11.1592L23.998 12.8042L22.3514 11.1577C18.1533 6.9596 11.3467 6.9596 7.14861 11.1577C2.95046 15.3559 2.95046 22.1624 7.14861 26.3606L22.9394 42.1512C23.5252 42.737 24.4748 42.737 25.0606 42.1512L40.8636 26.3576C45.0524 22.1456 45.0596 15.3581 40.8606 11.1592C36.6548 6.95344 29.8452 6.95344 25.6394 11.1592Z" fill="url(#{gradient})" />
	<defs>
		<linearGradient
			id={gradient}
			x1="-4.75164"
			y1="-1.87675"
			x2="16.2705"
			y2="42.7552"
			gradientUnits="userSpaceOnUse"
		>
			<stop stop-color="#F97DBD" />
			<stop offset="1" stop-color="#D7257D" />
		</linearGradient>
	</defs>
</svg>

<style>
	.heart {
		/*
		 * Without fill-box the origin is the SVG viewport's corner, not the
		 * shape's centre, and the heart lurches diagonally instead of pulsing.
		 */
		transform-box: fill-box;
		transform-origin: center;
	}

	@media (prefers-reduced-motion: no-preference) {
		.heart.beating {
			animation: heartbeat var(--beat-speed, 1.2s) ease-in-out infinite;
		}
	}

	/*
	 * A real heartbeat is a double thump — lub-dub — then a rest. Two peaks of
	 * unequal height early in the cycle, followed by stillness, is what reads as
	 * beating; an even sine pulse reads as breathing.
	 */
	@keyframes heartbeat {
		0%,
		28%,
		70%,
		100% {
			transform: scale(1);
		}
		14% {
			transform: scale(1.16);
		}
		42% {
			transform: scale(1.08);
		}
	}
</style>
