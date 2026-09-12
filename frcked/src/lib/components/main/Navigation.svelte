<script lang="ts">
	import { page } from '$app/state';
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { themeStore, transitionLink, APP_NAME, safeResolve } from '$lib/utils';
	import { NavigationLogic, type NavigationState } from '$lib/data/Navigation.js';
	import { NavigationIcons, AccountIcons, ThemeIcons } from '$lib/components/icons';

	const logic = new NavigationLogic(page.url.pathname);
	let state = $state<NavigationState>(logic.getState());

	logic.onStateUpdate((newState) => {
		state = newState;
	});

	$effect(() => {
		logic.updateCurrentPath(page.url.pathname);
	});

	function isActive(path: string): boolean {
		const normalizePath = (p: string) => (p === '/' ? p : p.endsWith('/') ? p.slice(0, -1) : p);
		return normalizePath(state.currentPath) === normalizePath(path);
	}

	// const api = new ApiClient();
	// async function handleLogout() {
	// 	try {
	// 		await api.auth.logout();
	// 		logoutUser();
	// 		await navigateWithTransition('/');
	// 	} catch (error) {
	// 		console.error('Logout failed:', error);
	// 	}
	// }
</script>

<nav class="row ycenter xbetween wfull" in:slide>
	<div class="row ycenter">
		<div class="grow">
			<a href={safeResolve('/')} class="group row ycenter gap-4" use:transitionLink>
				<img
					alt="{APP_NAME} logo"
					src="/images/frcked.png"
					class="square-32 transition-transform group-hover:scale-110"
				/>
				<span class="text-lg weight-500 text-primary">{APP_NAME}</span>
			</a>
		</div>
	</div>

	<!-- Right side items -->
	<div class="row ycenter gap-12">
		<!-- Desktop navigation -->
		<div class="relative marg-left-32 hidden sm:flex sm:items-center sm:gap-1">
			{#each logic.navItems as item (item.href)}
				<a
					href={safeResolve(item.href)}
					onclick={() => logic.handleNavItemClick(item.href)}
					use:transitionLink
					class="nav-link relative row ycenter gap-6 radius-6 pad-x-12 pad-y-6 text-sm weight-500 transition-all duration-200
							{isActive(item.href)
						? 'text-primary'
						: 'text-secondary hover:bg-gray-50/50 hover:text-gray-900 dark:hover:bg-gray-800/30 dark:hover:text-gray-100'}
							{logic.isNavItemDisabled(item) ? 'pointer-events-none cursor-not-allowed opacity-50' : ''}"
					aria-disabled={logic.isNavItemDisabled(item)}
				>
					<span class="transition-transform duration-200 {isActive(item.href) ? 'scale-110' : ''}">
					</span>
					<span class="relative row ycenter gap-16">
						<span>{item.label}</span>
						{#if logic.hasNavItemBadge(item)}
							<span
								class="row h-4 min-w-4 ycenter xcenter radius-full bg-danger pad-x-6 text-xs weight-500 text-inverse"
							>
								{logic.getNavItemBadge(item)}
							</span>
						{/if}
						<div
							class="nav-indicator absolute -bottom-3 left-1/2 h-0.5 radius-full bg-black transition-all duration-300 ease-out dark:bg-white
									{isActive(item.href) ? 'wfull -translate-x-1/2 opacity-100' : 'w-0 -translate-x-1/2 opacity-0'}"
						></div>
					</span>
				</a>
			{/each}
		</div>
		<!-- Settings link -->

		<a
			href={safeResolve('/settings')}
			use:transitionLink
			class="button blank row square-32 ycenter xcenter radius-6 border surface text-secondary"
			title="Settings"
			aria-label="View settings"
		>
			<ThemeIcons name="settings" />
		</a>

		<!-- Theme toggle -->
		<button
			onclick={() => logic.toggleTheme()}
			class="button blank row square-32 ycenter xcenter radius-6 border surface text-secondary"
			title="Toggle theme"
			aria-label="Toggle dark mode"
		>
			<ThemeIcons name={$themeStore === 'dark' ? 'sun' : 'moon'} />
		</button>

		<!-- Mobile menu button -->
		<button
			onclick={() => logic.toggleMobileMenu()}
			class="button blank row square-32 ycenter xcenter radius-6 border surface text-secondary sm:hidden"
			aria-expanded={state.mobileMenuOpen}
			aria-label="Toggle mobile menu"
		>
			<NavigationIcons
				name={state.mobileMenuOpen ? 'close' : 'menu'}
				class="transition-transform duration-150 {state.mobileMenuOpen ? 'rotate-90' : ''}"
			/>
		</button>
	</div>

	<!-- Mobile menu -->
	{#if state.mobileMenuOpen}
		<div
			out:slide={{ duration: 200, easing: cubicOut, axis: 'y' }}
			in:slide={{ duration: 300, easing: cubicOut, axis: 'y' }}
			class="border-top surface sm:hidden"
		>
			<div class="pad-x-16 pad-y-12">
				<!-- Mobile navigation items -->
				<div class="box gap-16">
					{#each logic.navItems as item (item.href)}
						<a
							href={safeResolve(item.href)}
							onclick={() => logic.handleNavItemClick(item.href)}
							use:transitionLink
							class="group relative row ycenter gap-12 overflow-hidden radius-6 pad-x-12 pad-y-12 text-sm weight-500 transition-all duration-200
							{isActive(item.href)
								? 'surface text-primary'
								: 'text-secondary hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-900/50 dark:hover:text-gray-100'}
							{logic.isNavItemDisabled(item) ? 'pointer-events-none cursor-not-allowed opacity-50' : ''}"
							aria-disabled={logic.isNavItemDisabled(item)}
						>
							<span
								class="transition-transform duration-200 {isActive(item.href) ? 'scale-110' : ''}"
							>
							</span>
							<span class="grow">{item.label}</span>
							<div class="row ycenter gap-32">
								{#if logic.hasNavItemBadge(item)}
									<span
										class="row h-4 min-w-4 ycenter xcenter radius-full bg-danger pad-x-6 text-xs weight-500 text-inverse"
									>
										{logic.getNavItemBadge(item)}
									</span>
								{/if}
								<div
									class="h-1.5 w-1.5 radius-full bg-black transition-all duration-300 dark:bg-white
									{isActive(item.href) ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}"
								></div>
							</div>
							{#if isActive(item.href)}
								<div
									class="absolute top-0 left-0 hfull w-1 bg-black transition-all duration-300 ease-out dark:bg-white"
								></div>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</nav>

<style lang="sass">
.nav-link:hover
	.nav-indicator
		width: 50%
		opacity: 0.3

.nav-indicator
	will-change: width, opacity, transform
</style>
