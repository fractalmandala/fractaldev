# @main

Core layout and modal components for building application structure.

## Modal

A flexible dialog component for displaying content in a modal window with customizable sizing and behavior.

### Props

**`open`** • `boolean` • Default: `false`  
Controls modal visibility

**`title`** • `string` • Default: `''`  
Modal header title

**`size`** • `'sm' | 'md' | 'lg' | 'xl'` • Default: `'md'`  
Modal width size

**`closeable`** • `boolean` • Default: `true`  
Allow closing via ESC key and close button

**`onclose`** • `function`  
Callback fired when modal closes

**`children`** • `Snippet`  
Main content area

**`footer`** • `Snippet`  
Optional footer content area

### Features

- Responsive sizing with four preset widths
- Keyboard support (ESC to close)
- Body scroll prevention when open
- Smooth fade and fly transitions
- Dark mode support

### ModalLogic Class

Internal state management class with methods:

- `open()` - Open the modal
- `close()` - Close the modal
- `isOpen()` - Check if modal is open
- `updateProps()` - Update modal properties
- `getSizeClass()` - Get Tailwind size class

---

## Navigation

Top navigation bar with responsive mobile menu, theme toggle, and authentication links.

### Props

None (component manages internal state)

### Features

- Responsive desktop/mobile navigation
- Active route indicator
- Theme toggle button
- Authentication state display
- Mobile hamburger menu
- Smooth transitions
- Dark mode support

### NavigationLogic Class

Internal navigation state management with:

- `navItems` - Array of navigation menu items
- `toggleMobileMenu()` - Toggle mobile menu visibility
- `toggleTheme()` - Toggle between light/dark theme
- `isActive(path)` - Check if route is active
- `handleNavItemClick()` - Handle navigation item clicks

### Navigation Items

- Home (`/`)
- Components (`/components`)
- Icons (`/icons`)
- Utils (`/utils`)

---

## Settings

Settings page component for managing application preferences.

### Props

None (component manages internal state)

### Features

- Load and persist settings to localStorage
- UI preference management (animations, mouse effects)
- Loading and saving states
- Toast notifications for user feedback
- Settings validation

### SettingsService Class

Manages application settings with methods:

- `getSettings()` - Load settings from storage
- `updateSettings()` - Update and persist settings

### Settings Data

```typescript
interface SettingsData {
	ui: {
		animationsEnabled: boolean;
		mouseEffectsEnabled: boolean;
	};
}
```

---

## SplashScreen

Loading splash screen with progress bar displayed during app initialization.

### Props

None (component uses global state)

### Features

- Animated logo with pulse effect
- Progress bar visualization
- Smooth loading animation
- Dark mode support
- Backdrop blur effect

### SplashScreenManager Class

Singleton manager for splash screen state with methods:

- `startLoading()` - Start the loading animation
- `completeLoading()` - Mark loading as complete
- `stopLoading()` - Stop the loading animation
- `reset()` - Reset to initial state

### State

```typescript
interface SplashScreenState {
	isLoading: boolean;
	progress: number; // 0-100
}
```

---

## Footer

Simple footer component displaying build information.

### Props

None
