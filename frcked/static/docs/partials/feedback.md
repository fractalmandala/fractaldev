# @partials/feedback

User feedback components for displaying messages, status indicators, and empty states.

## EmptyState

A centered empty state component for displaying when no data is available.

### Props

**`icon`** • `string`  
Emoji or icon character

**`iconSnippet`** • `Snippet`  
Custom icon component

**`title`** • `string` • **Required**  
Empty state title

**`description`** • `string`  
Detailed description

**`primaryAction`** • `object`  
Call-to-action button config

**`secondaryText`** • `string`  
Secondary helper text

**`size`** • `'sm' | 'md' | 'lg'` • Default: `'md'`  
Component size

**`class`** • `string` • Default: `''`  
Container classes

### Primary Action Config

```typescript
{
  text: string                    // Button text
  onclick?: () => void            // Click handler
  href?: string                   // Link destination
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'white' | 'purple'
}
```

### Features

- Customizable icons
- Multiple size options
- Optional CTA button
- Secondary text support
- Dark mode support
- Centered layout

---

## LoadingSpinner

Animated loading spinner with text label.

### Props

**`text`** • `string` • Default: `'Loading...'`  
Loading text

**`size`** • `'sm' | 'md' | 'lg'` • Default: `'md'`  
Spinner size

**`color`** • `'blue' | 'gray' | 'green' | 'red' | 'yellow'` • Default: `'blue'`  
Spinner color

**`centered`** • `boolean` • Default: `true`  
Center in container

**`class`** • `string` • Default: `''`  
Container classes

### Features

- 5 color options
- 3 size options
- Optional centering
- Optional text label
- Dark mode support
- Smooth animation

---

## StatusBadge

Compact status indicator badge component.

### Props

**`status`** • `string` • **Required**  
Status text

**`variant`** • `string` • Default: `'gray'`  
Status type (success, warning, error, info, gray, update, custom)

**`size`** • `'xs' | 'sm' | 'md' | 'lg'` • Default: `'sm'`  
Badge size

**`rounded`** • `boolean` • Default: `true`  
Rounded corners

**`dot`** • `boolean` • Default: `false`  
Show status dot

**`customColors`** • `object`  
Custom color config

**`class`** • `string` • Default: `''`  
Container classes

### Variants

- **success**: Green - for successful operations
- **warning**: Amber - for warnings
- **error**: Red - for errors
- **info**: Blue - for information
- **update**: Purple - for updates
- **gray**: Gray - default neutral
- **custom**: Use customColors prop

### Features

- 7 built-in variants
- Custom color support
- Optional status dot
- Multiple sizes
- Dark mode support
- Ring/border design

---

## Toast

Global toast notification component with auto-dismiss and actions.

### Props

None - controlled via global `toastState` store

### Features

- Auto-dismiss with progress bar
- 4 toast types (success, error, warning, info)
- Dismissible close button
- Optional action button
- Stacked display (max 5)
- Smooth slide animations
- Dark mode support
- Responsive (mobile optimized)

### Toast Object

```typescript
interface Toast {
	id: string;
	message: string;
	type: 'error' | 'warning' | 'info' | 'success';
	dismissible: boolean;
	duration: number; // ms, 0 = no auto-dismiss
	class?: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	onDismiss?: () => void;
}
```

### Usage

Via `toast` utility:

- `toast.success(message, options)`
- `toast.error(message, options)`
- `toast.warning(message, options)`
- `toast.info(message, options)`
- `toast.promise(promise, messages, options)`

---

## WarningBanner

Dismissible warning/alert banner component.

### Props

**`message`** • `string` • Default: `'Ohaithere'`  
Banner message

**`dismissible`** • `boolean` • Default: `true`  
Show close button

**`color`** • `'yellow' | 'blue' | 'red' | 'gray' | 'green'` • Default: `'yellow'`  
Banner color

**`size`** • `'xs' | 'sm'` • Default: `'sm'`  
Banner size

**`class`** • `string` • Default: `''`  
Container classes

**`onDismiss`** • `function`  
Dismiss callback

**`delay`** • `number` • Default: `150`  
Show delay (ms)

### Features

- Automatic icon selection based on color
- Slide-in animation
- Dismissible with ESC key
- Responsive full-width design
- Dark mode support
- Optional delay before showing

### Colors

- **yellow**: Warning (default)
- **blue**: Information
- **red**: Error/danger
- **green**: Success
- **gray**: Neutral
