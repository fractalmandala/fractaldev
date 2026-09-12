<script lang="ts" generics="T extends { id: string | number; [key: string]: unknown }">
	import { LoadingSpinner, EmptyState } from '$lib/components/partials';

	interface Column {
		key: string;
		label: string;
		sortable?: boolean;
		width?: string;
		align?: 'left' | 'center' | 'right';
		class?: string;
	}

	let {
		data = [],
		columns,
		loading = false,
		emptyState,
		striped = false,
		hoverable = true,
		compact = false,
		class: className = '',
		tableClass = '',
		headerClass = '',
		bodyClass = '',
		rowClass = '',
		cellClass = '',
		children,
		actions
	}: {
		data?: T[];
		columns: Column[];
		loading?: boolean;
		emptyState?: {
			icon?: string;
			title: string;
			description?: string;
			primaryAction?: {
				text: string;
				onclick?: () => void;
				href?: string;
			};
		};
		striped?: boolean;
		hoverable?: boolean;
		compact?: boolean;
		class?: string;
		tableClass?: string;
		headerClass?: string;
		bodyClass?: string;
		rowClass?: string;
		cellClass?: string;
		children?: import('svelte').Snippet<[item: T, index: number]>;
		actions?: import('svelte').Snippet<[item: T, index: number]>;
	} = $props();

	let hasData = $derived(data && data.length > 0);
	let showEmptyState = $derived(!loading && !hasData);

	let containerClasses = $derived(`card overflow-hidden ${className}`);

	let scrollClasses = 'scroll-x';

	let baseTableClasses = 'wfull divide-y divide-gray-200 dark:divide-gray-800';

	let headerRowClasses = $derived(`surface ${headerClass}`);

	let getHeaderCellBaseClasses = (compact: boolean) => {
		const padding = compact ? 'pad-x-16 pad-y-8' : 'pad-x-24 pad-y-12';
		return `${padding} text-xs weight-600 tt-u text-secondary`;
	};

	let bodyClasses = $derived(`divide-y divide-gray-200 dark:divide-gray-800 bg ${bodyClass}`);

	let getRowClasses = (index: number) => {
		let classes = '';

		if (striped && index % 2 !== 0) {
			classes += 'surface ';
		}

		return `${classes}${rowClass}`.trim();
	};

	let getCellClasses = (column: Column) => {
		let classes = compact ? 'pad-x-16 pad-y-8' : 'pad-x-24 pad-y-16';
		classes += ' whitespace-nowrap text-sm text-primary';

		if (column.align === 'center') {
			classes += ' ta-c';
		} else if (column.align === 'right') {
			classes += ' text-right';
		} else {
			classes += ' text-left';
		}

		if (column.class) {
			classes += ` ${column.class}`;
		}

		return `${classes} ${cellClass}`.trim();
	};

	let getHeaderCellClasses = (column: Column) => {
		let classes = getHeaderCellBaseClasses(compact);

		if (column.align === 'center') {
			classes += ' ta-c';
		} else if (column.align === 'right') {
			classes += ' text-right';
		} else {
			classes += ' text-left';
		}

		if (column.class) {
			classes += ` ${column.class}`;
		}

		return classes;
	};

	let getActionsHeaderClasses = () => {
		const padding = compact ? 'pad-x-16 pad-y-8' : 'pad-x-24 pad-y-12';
		return `${padding} text-right text-xs weight-600 tt-u text-secondary`;
	};
</script>

{#if loading}
	<div class={containerClasses}>
		<div class="pad-48">
			<LoadingSpinner text="Loading data..." />
		</div>
	</div>
{:else if showEmptyState && emptyState}
	<div class={containerClasses}>
		<EmptyState
			icon={emptyState.icon}
			title={emptyState.title}
			description={emptyState.description}
			primaryAction={emptyState.primaryAction}
			class="pad-y-48"
		/>
	</div>
{:else if hasData}
	<div class={containerClasses}>
		<div class={scrollClasses}>
			<table class="{baseTableClasses} {tableClass}" style="table-layout: fixed;">
				<colgroup>
					{#each columns as column (column.key)}
						<col style={column.width ? `width: ${column.width}` : undefined} />
					{/each}
					{#if actions}
						<col style="width: 140px;" />
					{/if}
				</colgroup>
				<thead class={headerRowClasses}>
					<tr>
						{#each columns as column (column.key)}
							<th class={getHeaderCellClasses(column)} style="vertical-align: middle;">
								<div
									class="row ycenter {column.align === 'center'
										? 'xcenter'
										: column.align === 'right'
											? 'xright'
											: 'xleft'}"
								>
									{column.label}
								</div>
							</th>
						{/each}
						{#if actions}
							<th class={getActionsHeaderClasses()} style="vertical-align: middle;">
								<div class="row ycenter xright">Actions</div>
							</th>
						{/if}
					</tr>
				</thead>
				<tbody class={bodyClasses}>
					{#each data as item, index (item.id || index)}
						<tr class={getRowClasses(index)}>
							{#if children}
								{@render children(item, index)}
								{#if actions}
									<td
										class="{getCellClasses({
											key: 'actions',
											label: '',
											align: 'right'
										})} text-sm weight-500"
										style="vertical-align: middle;"
									>
										<div class="row xright gap-md">
											{@render actions(item, index)}
										</div>
									</td>
								{/if}
							{:else}
								{#each columns as column (column.key)}
									<td class={getCellClasses(column)} style="vertical-align: middle;">
										<div
											class="row ycenter {column.align === 'center'
												? 'xcenter'
												: column.align === 'right'
													? 'xright'
													: 'xleft'}"
										>
											{(item as Record<string, unknown>)[column.key] || '—'}
										</div>
									</td>
								{/each}
								{#if actions}
									<td
										class="{getCellClasses({
											key: 'actions',
											label: '',
											align: 'right'
										})} text-sm weight-500"
										style="vertical-align: middle;"
									>
										<div class="row xright gap-md">
											{@render actions(item, index)}
										</div>
									</td>
								{/if}
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}
