# @partials/layout

Layout and structural components for organizing content and building interactive UI patterns.

## Accordion

Expandable/collapsible accordion component with support for multiple or single open sections.

### Props

**`sections`** • `Array` • Default: `[]`  
Array of accordion sections

**`openSections`** • `SvelteSet` • Default: new Set()  
Set of open section IDs

**`multiple`** • `boolean` • Default: `true`  
Allow multiple sections open

**`disabled`** • `boolean` • Default: `false`  
Disable accordion

**`animationDuration`** • `object` • Default: `{in: 400, out: 300}`  
Animation timings (ms)

**`maxHeight`** • `string` • Default: `'400px'`  
Max height for scrollable content

**`enableScroll`** • `boolean` • Default: `true`  
Enable scrolling in content

**`class`** • `string` • Default: `''`  
Container classes

**`sectionClass`** • `string` • Default: `''`  
Section classes

**`headerClass`** • `string` • Default: `''`  
Header classes

**`contentClass`** • `string` • Default: `''`  
Content classes

**`onToggle`** • `function`  
Toggle callback

**`onSectionOpen`** • `function`  
Open callback

**`onSectionClose`** • `function`  
Close callback

**`children`** • `Snippet`  
Section content renderer

### Section Definition

```typescript
interface AccordionSection {
	id: string;
	title: string;
	icon?: string;
	disabled?: boolean;
	content?: string;
	[key: string]: unknown;
}
```

### Features

- Single or multiple open sections
- Keyboard support (Enter/Space)
- Smooth slide animations
- Optional icons
- Scrollable content
- Dark mode support
- Disabled states

---

## Card

Flexible card component with optional header, title, expandable functionality, and clickable states.

### Props

**`title`** • `string`  
Card title

**`subtitle`** • `string`  
Card subtitle

**`padding`** • `'none' | 'sm' | 'md' | 'lg' | 'xl'` • Default: `'md'`  
Padding size (disabled when expandable)

**`shadow`** • `'none' | 'sm' | 'md' | 'lg' | 'xl'` • Default: `'md'`  
Shadow size

**`rounded`** • `'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'` • Default: `'lg'`  
Border radius

**`hover`** • `boolean` • Default: `false`  
Hover effect

**`clickable`** • `boolean` • Default: `false`  
Clickable/interactive

**`expandable`** • `boolean` • Default: `false`  
Enable expand/collapse functionality

**`defaultExpanded`** • `boolean` • Default: `false`  
Initial expanded state

**`href`** • `string`  
Link destination

**`target`** • `string`  
Link target

**`onclick`** • `function`  
Click handler

**`class`** • `string` • Default: `''`  
Container classes

**`headerClass`** • `string` • Default: `''`  
Header classes

**`bodyClass`** • `string` • Default: `''`  
Body classes

**`children`** • `Snippet`  
Card content

### Features

- Flexible sizing and styling options
- Optional title/subtitle header
- **Expandable/collapsible content** with smooth slide animations
- **Mobile-optimized header** with responsive typography
- Clickable header for expand/collapse
- Hover animations and interactive feedback
- Clickable/linkable cards
- Gradient background with glassmorphism
- Dark mode support
- Full keyboard accessibility (Enter/Space)
- Touch-friendly design
- Professional chevron animations

---

## Carousel

Responsive carousel/slider with autoplay, navigation, and marquee modes.

### Props

**`children`** • `Snippet` • **Required**  
Carousel items

**`showArrows`** • `boolean` • Default: `true`  
Show prev/next arrows

**`showDots`** • `boolean` • Default: `true`  
Show page dots

**`class`** • `string` • Default: `''`  
Container classes

**`autoplay`** • `boolean` • Default: `false`  
Enable autoplay

**`autoplayInterval`** • `number` • Default: `3000`  
Autoplay interval (ms)

**`totalItems`** • `number` • **Required**  
Total number of items

**`itemsVisible`** • `number` • Default: `3`  
Items visible at once

**`marquee`** • `boolean` • Default: `false`  
Marquee/ticker mode

**`marqueeSpeed`** • `number` • Default: `30`  
Marquee speed (seconds)

### Features

- Responsive layouts
- Touch/swipe support
- Autoplay with pause on hover
- Navigation arrows
- Page indicator dots
- Marquee/ticker mode
- Mobile optimized
- Hardware acceleration
- Dark mode support

### Item Rendering

Use `.carousel-item` class for items:

```html
<div class="carousel-item">
	<!-- Your content -->
</div>
```

---

## ChromeDivider

Decorative chrome/metallic divider component with shimmer and flow animations.

### Props

**`variant`** • `'chrome' | 'gradient'` • Default: `'chrome'`  
Divider style

**`height`** • `'sm' | 'md' | 'lg'` • Default: `'md'`  
Height size

**`animated`** • `boolean` • Default: `true`  
Enable animation

**`className`** • `string` • Default: `''`  
Custom classes

### Variants

- **chrome**: Metallic chrome effect with shimmer
- **gradient**: Gradient flow animation

### Heights

- **sm**: 1px (h-px)
- **md**: 2px (h-0.5)
- **lg**: 4px (h-1)

### Features

- Chrome metallic effect
- Gradient variant
- Shimmer animation
- Flow animation
- Side fade mask
- 3D edge effects
- Dark mode support
- Smooth performance

---

## Window

Draggable, resizable window component with boundary constraints.

### Props

**`title`** • `string` • Default: `'Window'`  
Window title

**`open`** • `boolean` • Default: `true`  
Window visibility (bindable)

**`closable`** • `boolean` • Default: `true`  
Show close button

**`resizable`** • `boolean` • Default: `true`  
Allow resizing

**`draggable`** • `boolean` • Default: `true`  
Allow dragging

**`width`** • `number` • Default: `400`  
Window width (px)

**`height`** • `number` • Default: `300`  
Window height (px)

**`minWidth`** • `number` • Default: `200`  
Minimum width

**`minHeight`** • `number` • Default: `150`  
Minimum height

**`x`** • `number` • Default: `100`  
X position

**`y`** • `number` • Default: `100`  
Y position

**`zIndex`** • `number` • Default: `1000`  
Z-index

**`boundary`** • `'viewport' | 'parent' | 'manual'` • Default: `'viewport'`  
Boundary constraint

**`boundaryElement`** • `HTMLElement` • Default: null  
Custom boundary element

**`boundaries`** • `object` • Default: null  
Manual boundaries {top, right, bottom, left}

**`class`** • `string` • Default: `''`  
Container classes

**`headerClass`** • `string` • Default: `''`  
Header classes

**`bodyClass`** • `string` • Default: `''`  
Body classes

**`onClose`** • `function`  
Close callback

**`onResize`** • `function`  
Resize callback

**`onMove`** • `function`  
Move callback

**`children`** • `Snippet`  
Window content

### Boundary Types

- **viewport**: Constrain to browser viewport
- **parent**: Constrain to parent container
- **manual**: Use boundaryElement or boundaries

### Features

- Drag to move (mouse and touch)
- Resize from bottom-right corner
- Grid snapping (36px grid)
- Boundary constraints
- Transparency toggle
- Responsive sizing (mobile/tablet)
- Touch-friendly on mobile
- Keyboard support
- Smooth animations
- Dark mode support

### Callbacks

```typescript
onResize({ width: number; height: number })
onMove({ x: number; y: number })
```

---

## Layout Component Usage

All layout components support:

- Dark mode compatibility
- Custom CSS classes
- Responsive design
- Smooth animations
- Accessibility features
- Keyboard navigation
- Touch support
