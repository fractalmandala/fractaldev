<script lang="ts">
	import { AnimatePresence, motion, useReducedMotion, type DragInfo } from '@humanspeak/svelte-motion';
	import { Icon, type IconData } from 'fractalicons';
	import { luBell, luCheck, luCircleAlert, luInfo, luLoaderCircle, luX } from 'fractalicons/lucide';
	import { EASE_OUT } from '../../ease.js';
	import type { AnimatedToastStackItemProps, ToastStatus } from './types.js';

	let {
		toast,
		index,
		onDismiss,
		classNames,
		icons,
		renderToast
	}: AnimatedToastStackItemProps = $props();

	const reduce = useReducedMotion();

	const STACK_SPRING = { type: 'spring', stiffness: 420, damping: 34, mass: 0.75 } as const;
	const CONTENT_TRANSITION = { duration: 0.28, ease: EASE_OUT } as const;
	const STATUS_ICON: Record<ToastStatus, IconData> = {
		neutral: luBell,
		info: luInfo,
		loading: luLoaderCircle,
		success: luCheck,
		error: luCircleAlert
	};

	const status = $derived(toast.status ?? 'neutral');
	const canDismiss = $derived(toast.dismissible !== false && Boolean(onDismiss));
	const resolvedIcon = $derived(icons?.[status] ?? toast.icon);
	const contentKey = $derived(
		`${toast.id}-${status}-${typeof toast.title === 'string' ? toast.title : 'node'}`
	);

	function handleDragEnd(_event: PointerEvent, info: DragInfo) {
		if (!canDismiss || !onDismiss) return;
		if (Math.abs(info.offset.x) > 72 || Math.abs(info.velocity.x) > 520) {
			onDismiss(toast.id);
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions — the li is a motion
     element carrying drag; the dismissible surface inside is a real button. -->
<motion.li
	layout
	initial={reduce.current
		? { opacity: 0 }
		: { opacity: 0, y: 22, scale: 0.96, filter: 'blur(10px)' }}
	animate={reduce.current
		? { opacity: 1 }
		: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
	exit={reduce.current
		? { opacity: 0 }
		: {
				opacity: 0,
				x: 32,
				scale: 0.96,
				filter: 'blur(8px)',
				transition: { duration: 0.18, ease: EASE_OUT }
			}}
	transition={STACK_SPRING}
	drag={canDismiss && !reduce.current ? 'x' : false}
	dragConstraints={{ left: 0, right: 0 }}
	dragElastic={0.18}
	ondragend={handleDragEnd}
	data-slot="toast-item"
	class={classNames?.item}
	style={`z-index:${20 - index}`}
>
	<div data-slot="toast-item-surface" class={classNames?.surface}>
		{#if renderToast}
			{@render renderToast(toast)}
		{:else}
			{@const statusIcon = STATUS_ICON[status]}
			<div data-slot="toast-item-row">
				<motion.span
					layout
					data-status={status}
					data-slot="toast-item-icon"
					class={classNames?.iconWrap}
				>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={status}
							initial={reduce.current
								? { opacity: 0 }
								: { opacity: 0, y: 8, scale: 0.8, filter: 'blur(6px)' }}
							animate={reduce.current
								? { opacity: 1 }
								: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
							exit={reduce.current
								? { opacity: 0 }
								: { opacity: 0, y: -8, scale: 0.9, filter: 'blur(6px)' }}
							transition={CONTENT_TRANSITION}
							class="mg-toast-icon"
						>
							{#if status === 'loading'}
								<span class="mg-toast-spin">
									{#if resolvedIcon}
										{@render resolvedIcon()}
									{:else}
										<Icon icon={statusIcon} size={14} />
									{/if}
								</span>
							{:else}
								{#if resolvedIcon}
									{@render resolvedIcon()}
								{:else}
									<Icon icon={statusIcon} size={14} />
								{/if}
							{/if}
						</motion.span>
					</AnimatePresence>
				</motion.span>

				<div data-slot="toast-content" class={classNames?.content}>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.div
							key={contentKey}
							initial={reduce.current
								? { opacity: 0 }
								: { opacity: 0, y: 8, filter: 'blur(6px)' }}
							animate={reduce.current
								? { opacity: 1 }
								: { opacity: 1, y: 0, filter: 'blur(0px)' }}
							exit={reduce.current
								? { opacity: 0 }
								: { opacity: 0, y: -8, filter: 'blur(6px)' }}
							transition={CONTENT_TRANSITION}
						>
							<p data-slot="toast-title" class={classNames?.title}>
								{#if typeof toast.title === 'string'}
									{toast.title}
								{:else}
									{@render toast.title()}
								{/if}
							</p>
							{#if toast.description}
								<p data-slot="toast-description" class={classNames?.description}>
									{#if typeof toast.description === 'string'}
										{toast.description}
									{:else}
										{@render toast.description()}
									{/if}
								</p>
							{/if}
						</motion.div>
					</AnimatePresence>

					{#if toast.action}
						<button
							type="button"
							onclick={() => toast.action?.onClick(toast)}
							data-slot="toast-action"
							class={classNames?.action}
						>
							{#if typeof toast.action.label === 'string'}
								{toast.action.label}
							{:else}
								{@render toast.action.label()}
							{/if}
						</button>
					{/if}
				</div>

				{#if canDismiss}
					<button
						type="button"
						aria-label="Dismiss toast"
						onclick={() => onDismiss?.(toast.id)}
						data-slot="toast-close"
						class={classNames?.close}
					>
						<Icon icon={luX} size={14} />
					</button>
				{/if}
			</div>
		{/if}
	</div>
</motion.li>
