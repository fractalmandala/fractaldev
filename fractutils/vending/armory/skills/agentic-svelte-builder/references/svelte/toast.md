# Svelte 5 Native Toast Notification System

A Sonner-style Toast notification queue powered by **Svelte 5 Runes** (`$state`, `$effect`) and programmatic `toast()` helper functions.

---

## Component & Store Implementation (`Toast.svelte`)

```ts
// toastStore.ts
export type ToastMessage = {
  id: string;
  title: string;
  type?: 'info' | 'success' | 'danger';
  duration?: number;
};

let toasts = $state<ToastMessage[]>([]);

export const toastState = {
  get items() { return toasts; },
  add(msg: Omit<ToastMessage, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9);
    toasts = [...toasts, { ...msg, id }];
    const duration = msg.duration || 4000;
    setTimeout(() => {
      this.remove(id);
    }, duration);
  },
  remove(id: string) {
    toasts = toasts.filter(t => t.id !== id);
  }
};

export const toast = {
  info: (title: string) => toastState.add({ title, type: 'info' }),
  success: (title: string) => toastState.add({ title, type: 'success' }),
  danger: (title: string) => toastState.add({ title, type: 'danger' })
};
```

```svelte
<!-- ToastContainer.svelte -->
<script lang="ts">
  import { toastState } from './toastStore';
</script>

<div class="[ toast-container ] [ box gap8 position-fixed ]" role="region" aria-label="Notifications">
  {#each toastState.items as item (item.id)}
    <div
      class="[ toast-item ] [ row ycenter xbetween ] [ pad12 padleft16 padright16 radius8 bdr text-sm bold ]"
      data-type={item.type || 'info'}
    >
      <span>{item.title}</span>
      <button class="[ toast-close ]" onclick={() => toastState.remove(item.id)} aria-label="Dismiss notification">&times;</button>
    </div>
  {/each}
</div>

```

### External stylesheet (`toast.sass`)

```sass
	.toast-container
		bottom: 1.5rem
		right: 1.5rem
		z-index: 100
		max-width: 360px
		width: 100%

	.toast-item
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
		background-color: var(--background10)
		&[data-type="success"]
			border-color: var(--color-accent)
			color: var(--color-accent)
		&[data-type="danger"]
			border-color: var(--color-accent)
			color: var(--color-accent)
		&[data-type="info"]
			border-color: var(--color-accent)
			color: var(--color-accent)

	.toast-close
		background: none
		border: none
		cursor: pointer
		color: inherit
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import ToastContainer from './ToastContainer.svelte';
  import { toast } from './toastStore';
</script>

<button class="button" data-variant="primary" onclick={() => toast.success('Profile updated successfully!')}>
  Show Success Toast
</button>

<ToastContainer />
```
