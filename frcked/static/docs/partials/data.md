# @data

Data display and visualization components for presenting information.

## DataTable

A flexible, responsive data table component with sorting, loading states, and customizable columns.

### Props

**data** `T[]` (default: `[]`)  
Array of data items to display

**columns** `Column[]` (required)  
Column configuration array

**loading** `boolean` (default: `false`)  
Show loading spinner

**emptyState** `object`  
Config for empty state display

**striped** `boolean` (default: `false`)  
Alternate row background colors

**hoverable** `boolean` (default: `true`)  
Highlight rows on hover

**compact** `boolean` (default: `false`)  
Reduce padding for dense layout

**class** `string` (default: `''`)  
Container CSS classes

**tableClass** `string` (default: `''`)  
Table element CSS classes

**headerClass** `string` (default: `''`)  
Header row CSS classes

**bodyClass** `string` (default: `''`)  
Body section CSS classes

**rowClass** `string` (default: `''`)  
Row CSS classes

**cellClass** `string` (default: `''`)  
Cell CSS classes

**children** `Snippet<[item, index]>`  
Custom cell rendering

**actions** `Snippet<[item, index]>`  
Action buttons per row

### Column Configuration

```typescript
interface Column {
	key: string; // Data property key
	label: string; // Header label
	sortable?: boolean; // Enable sorting
	width?: string; // CSS width value
	align?: 'left' | 'center' | 'right'; // Text alignment
	class?: string; // Custom CSS classes
}
```

### Features

- Responsive horizontal scrolling
- Loading and empty states
- Striped and hover effects
- Custom cell rendering with snippets
- Per-row action buttons
- Dark mode support

---

## MetricCard

A visually appealing card for displaying key metrics and statistics.

### Props

**title** `string` (required)  
Metric title/label

**value** `string | number` (required)  
Displayed metric value

**icon** `string`  
Emoji or icon character

**iconSnippet** `Snippet`  
Custom icon component

**color** `'default' | 'blue' | 'green' | 'red' | 'yellow' | 'purple'` (default: `'default'`)  
Card color scheme

**size** `'sm' | 'md' | 'lg'` (default: `'md'`)  
Card size

**href** `string`  
Link destination (makes card clickable)

**onclick** `function`  
Click handler

**class** `string` (default: `''`)  
Additional CSS classes

### Features

- 6 color variants with gradients
- 3 size options
- Animated hover effects
- Optional clickable/linkable
- Icon support (emoji or custom)
- Dark mode support

### Colors

- **default**: Gray gradient
- **blue**: Blue gradient
- **green**: Emerald gradient
- **red**: Red gradient
- **yellow**: Amber gradient
- **purple**: Violet gradient

---

## ProgressBar

A customizable progress bar component with native HTML semantics, labels, and smart auto-coloring.

### Props

**value** `number` (default: `0`)  
Current progress (0-max)

**max** `number` (default: `100`)  
Maximum value

**label** `string`  
Label text

**showPercentage** `boolean` (default: `true`)  
Display percentage

**color** `'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'orange'` (default: `'blue'`)  
Bar color (overridden by autoColor)

**size** `'sm' | 'md' | 'lg'` (default: `'md'`)  
Bar thickness

**animated** `boolean` (default: `true`)  
Smooth transition and shimmer effects

**striped** `boolean` (default: `false`)  
Animated diagonal stripe pattern

**autoColor** `boolean` (default: `false`)  
Dynamic color based on progress percentage

**class** `string` (default: `''`)  
Container CSS classes

### Features

- **Native HTML progress element** for semantics and accessibility
- **Auto-color system**: Red (0-25%) → Orange (26-45%) → Yellow (46-75%) → Green (76-100%)
- **Smart animations**: Shimmer for animated bars, moving stripes for striped bars
- **Light/dark mode** optimized with data-theme support
- **6 color schemes** including new orange variant
- **3 size options** (thin, compact design)
- **ARIA compliance** with proper labels and semantics

### Auto-Color Thresholds

When `autoColor={true}`, color automatically changes based on percentage:

- **0-25%**: Red (critical/low)
- **26-45%**: Orange (warning/poor)
- **46-75%**: Yellow (caution/fair)
- **76-100%**: Green (success/good)

---

## RecentItemsCard

A card component for displaying a list of recent items with optional "View all" link.

### Props

**title** `string` (required)  
Card title

**items** `T[]` (required)  
Array of items to display

**viewAllHref** `string`  
Link to view all items

**viewAllText** `string` (default: `'View all'`)  
"View all" link text

**emptyState** `EmptyState` (required)  
Empty state configuration

**itemClass** `string`  
Item element CSS classes

**class** `string` (default: `''`)  
Container CSS classes

**children** `Snippet<[item, index]>`  
Item rendering template

### EmptyState Configuration

```typescript
interface EmptyState {
	message: string; // Empty state message
	ctaText?: string; // Call-to-action text
	ctaHref?: string; // Call-to-action link
	secondaryText?: string; // Secondary helper text
}
```

### Features

- Wraps around Card component
- Empty state with optional CTA
- "View all" navigation link
- Custom item rendering
- Dark mode support
- Responsive layout
