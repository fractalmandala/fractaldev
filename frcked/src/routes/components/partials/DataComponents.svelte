<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Card,
		DataTable,
		MetricCard,
		RecentItemsCard,
		ProgressBar,
		Button
	} from '$lib/components/partials';
	import { infoToast } from '$lib/utils';
	import { NavigationIcons, ActionIcons, StatusIcons } from '$lib/components/icons';

	// Progress bar states for realistic animations
	let uploadProgress = 0;
	let processingProgress = 0;
	let storageProgress = 0;
	let errorProgress = 0;

	// Animate progress bars on mount
	onMount(() => {
		const animateProgress = (setter: (v: number) => void, target: number, delay: number) => {
			setTimeout(() => {
				let current = 0;
				const interval = setInterval(() => {
					current += Math.random() * 15 + 5;
					setter(current >= target ? target : current);
					if (current >= target) {
						clearInterval(interval);
					}
				}, 100);
			}, delay);
		};

		animateProgress((v: number) => (uploadProgress = v), 85, 0);
		animateProgress((v: number) => (processingProgress = v), 92, 200);
		animateProgress((v: number) => (storageProgress = v), 67, 400);
		animateProgress((v: number) => (errorProgress = v), 15, 600);
	});

	// Enhanced sample data for DataTable
	const enhancedDataTable = [
		{
			id: 1,
			name: 'John Doe',
			email: 'john@example.com',
			status: 'Active',
			role: 'Admin',
			department: 'Engineering',
			salary: '$95,000'
		},
		{
			id: 2,
			name: 'Jane Smith',
			email: 'jane@example.com',
			status: 'Active',
			role: 'User',
			department: 'Marketing',
			salary: '$65,000'
		},
		{
			id: 3,
			name: 'Bob Johnson',
			email: 'bob@example.com',
			status: 'Inactive',
			role: 'User',
			department: 'Sales',
			salary: '$55,000'
		},
		{
			id: 4,
			name: 'Alice Brown',
			email: 'alice@example.com',
			status: 'Active',
			role: 'Moderator',
			department: 'Support',
			salary: '$72,000'
		},
		{
			id: 5,
			name: 'Charlie Wilson',
			email: 'charlie@example.com',
			status: 'Pending',
			role: 'Manager',
			department: 'Engineering',
			salary: '$120,000'
		}
	];

	// Comprehensive column configuration
	const enhancedDataColumns = [
		{ key: 'name', label: 'Name', sortable: true, width: '150px', align: 'left' as const },
		{ key: 'email', label: 'Email', sortable: true, width: '200px', align: 'left' as const },
		{
			key: 'department',
			label: 'Department',
			sortable: true,
			width: '120px',
			align: 'center' as const
		},
		{ key: 'role', label: 'Role', sortable: true, width: '100px', align: 'center' as const },
		{ key: 'salary', label: 'Salary', sortable: true, width: '80px', align: 'right' as const },
		{ key: 'status', label: 'Status', sortable: true, width: '80px', align: 'center' as const }
	];

	// Sample recent items with more variety
	const enhancedRecentItems = [
		{
			id: 1,
			title: 'Project Documentation',
			description: 'Updated API documentation with new endpoints',
			timestamp: '2 hours ago'
		},
		{
			id: 2,
			title: 'User Settings',
			description: 'Modified user preferences and notification settings',
			timestamp: '5 hours ago'
		},
		{
			id: 3,
			title: 'Database Backup',
			description: 'Completed backup process successfully',
			timestamp: '1 day ago'
		},
		{
			id: 4,
			title: 'Security Update',
			description: 'Applied latest security patches',
			timestamp: '2 days ago'
		}
	];
</script>

<div class="box gap-32">
	<!-- DataTable Component -->
	<Card
		title="DataTable"
		subtitle="Flexible data table with sorting, custom columns, and action buttons."
		expandable={true}
		defaultExpanded={false}
		class="pad-24"
	>
		<!-- DataTable with custom features -->
		<div class="marg-bottom-24">
			<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Striped & Compact Table</h3>
			<DataTable
				data={enhancedDataTable}
				columns={enhancedDataColumns}
				striped={true}
				compact={true}
				hoverable={true}
			/>
		</div>

		<!-- DataTable with custom actions -->
		<div>
			<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Table with Actions</h3>
			<DataTable data={enhancedDataTable} columns={enhancedDataColumns} hoverable={true}>
				{#snippet actions()}
					<div class="row gap-8">
						<Button size="xs" variant="ghost">Edit</Button>
						<Button size="xs" variant="ghost" color="red">Delete</Button>
					</div>
				{/snippet}
			</DataTable>
		</div>
	</Card>

	<!-- MetricCard Component -->
	<Card
		title="MetricCard"
		subtitle="Display key metrics with various colors, sizes, and interactive states."
		expandable={true}
		defaultExpanded={false}
		class="pad-24"
	>
		<!-- Color Variants -->
		<div class="marg-bottom-32">
			<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Color Variants</h3>
			<div class="grid gap-16 md:grid-cols-2 lg:grid-cols-3">
				<MetricCard title="Total Users" value="1,234" color="default" />
				<MetricCard title="Revenue" value="$45,678" color="blue" />
				<MetricCard title="Active Sessions" value="89" color="green" />
				<MetricCard title="Conversion Rate" value="3.2%" color="yellow" />
				<MetricCard title="Error Rate" value="0.1%" color="red" />
				<MetricCard title="Premium Users" value="234" color="purple" />
			</div>
		</div>

		<!-- Size Variants -->
		<div class="marg-bottom-32">
			<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Size Variants</h3>
			<div class="grid gap-16 md:grid-cols-3">
				<MetricCard title="Small" value="123" size="sm" color="blue" />
				<MetricCard title="Medium" value="456" size="md" color="green" />
				<MetricCard title="Large" value="789" size="lg" color="yellow" />
			</div>
		</div>

		<!-- With Icons -->
		<div class="marg-bottom-32">
			<h3 class="marg-bottom-12 text-lg weight-500 text-primary">With Icons</h3>
			<div class="grid gap-16 md:grid-cols-2">
				<MetricCard title="GitHub Stars" value="3.8K" color="yellow">
					{#snippet iconSnippet()}
						<ActionIcons name="star" size="square-24" />
					{/snippet}
				</MetricCard>
				<MetricCard title="Tasks Complete" value="142" color="green">
					{#snippet iconSnippet()}
						<StatusIcons name="check" size="square-24" />
					{/snippet}
				</MetricCard>
			</div>
		</div>

		<!-- Interactive Cards -->
		<div>
			<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Interactive Cards</h3>
			<div class="grid gap-16 md:grid-cols-2">
				<MetricCard title="Click to Refresh" value="1,234" color="blue" href="#" icon="🔄" />
				<MetricCard
					title="Clickable Metric"
					value="$45,678"
					color="green"
					onclick={() => infoToast('Metric clicked!')}
				/>
			</div>
		</div>
	</Card>

	<!-- RecentItemsCard Component -->
	<Card
		title="RecentItemsCard"
		subtitle="Display recent activity with optional &quot;View all&quot; and custom empty state."
		expandable={true}
		defaultExpanded={false}
		class="pad-24"
	>
		<!-- Standard RecentItemsCard -->
		<div class="marg-bottom-24">
			<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Standard List</h3>
			<RecentItemsCard
				title="Recent Activity"
				items={enhancedRecentItems}
				viewAllHref="#"
				viewAllText="View all activity"
				emptyState={{
					message: 'No recent activity found',
					secondaryText: 'Your activity will appear here'
				}}
			>
				{#snippet children(item)}
					<div class="grow">
						<h4 class="text-sm weight-500 text-primary">{item.title}</h4>
						<p class="text-sm text-secondary">{item.description}</p>
						<p class="text-xs text-muted">{item.timestamp}</p>
					</div>
					<NavigationIcons name="link" size="square-16 text-muted" />
				{/snippet}
			</RecentItemsCard>
		</div>

		<!-- RecentItemsCard with CTA -->
		<div>
			<h3 class="marg-bottom-12 text-lg weight-500 text-primary">With Call-to-Action</h3>
			<RecentItemsCard
				title="Recent Activity"
				items={[]}
				emptyState={{
					message: 'No recent activity',
					ctaText: 'Start an activity',
					ctaHref: '#',
					secondaryText: 'Complete some tasks to see them here'
				}}
			></RecentItemsCard>
		</div>
	</Card>

	<!-- ProgressBar Component -->
	<Card
		title="ProgressBar"
		subtitle="Progress bars with auto-coloring, glow effects, and smooth animations."
		expandable={true}
		defaultExpanded={false}
		class="pad-24"
	>
		<!-- All Features Showcase -->
		<div class="marg-bottom-24">
			<h3 class="marg-bottom-12 text-lg weight-500 text-primary">Feature Showcase</h3>
			<div class="box gap-16">
				<ProgressBar
					value={uploadProgress}
					autoColor={true}
					label="Auto-Color (Dynamic)"
					size="sm"
					animated={true}
				/>
				<ProgressBar
					value={processingProgress}
					color="blue"
					label="Manual Blue Color"
					size="md"
					animated={true}
				/>
				<ProgressBar
					value={storageProgress}
					color="orange"
					label="Striped Orange"
					size="md"
					striped={true}
				/>
				<ProgressBar
					value={errorProgress}
					color="gray"
					label="Large Gray (No Animation)"
					size="lg"
					animated={false}
				/>
			</div>
		</div>

		<!-- Interactive Demo -->

		<div class="marg-top-16 gap-16">
			<div class="row gap-8">
				<Button size="xs" onclick={() => (uploadProgress = 0)}>Reset</Button>
				<Button size="xs" onclick={() => (uploadProgress = 15)}>15%</Button>
				<Button size="xs" onclick={() => (uploadProgress = 35)}>35%</Button>
				<Button size="xs" onclick={() => (uploadProgress = 60)}>60%</Button>
				<Button size="xs" onclick={() => (uploadProgress = 90)}>90%</Button>
				<Button size="xs" onclick={() => (uploadProgress = 100)}>End</Button>
			</div>
		</div>
	</Card>
</div>
