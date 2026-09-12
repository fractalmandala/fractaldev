# Dialog (Zero-JS Native Component)

The **Dialog** component renders accessible modal popups natively using `<dialog popover="auto">` and HTML Invoker Commands, styled with **`fractals-styler`** primitives (`box`, `w100`, `maxw500`, `radius12`, `pad20`, `text-lg`, `bold`).

---

## Component Code (`Dialog.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    id: string; // Unique ID used by trigger buttons via popovertarget or commandfor
    title?: string;
    trigger?: Snippet<[dialogId: string]>;
    children?: Snippet;
  };

  let { id, title, trigger, children }: Props = $props();
</script>

{#if trigger}
  {@render trigger(id)}
{/if}

<dialog {id} class="[ dialog ] [ box maxw500 ] [ radius12 ]" popover="auto">
  <div class="[ dialog__header ] [ row ycenter xbetween ] [ pad20 ]">
    {#if title}
      <h3 class="[ dialog__title ] [ margin0 text-lg bold ]">{title}</h3>
    {/if}
    <button class="[ dialog__close ] [ text-xl lh1 ]" popovertarget={id} popovertargetaction="hide" aria-label="Close dialog">
      &times;
    </button>
  </div>
  <div class="[ dialog__body ] [ pad20 padtop0 ]">
    {@render children?.()}
  </div>
</dialog>

```

### External stylesheet (`dialog.sass`)

```sass
	.dialog
		margin: auto
		padding: 0
		border: none
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
		width: 90vw
		background-color: var(--background10)

		&::backdrop
			background-color: rgba(15, 23, 42, 0.5)
			backdrop-filter: blur(4px)

		&__header
			border-bottom: 1px solid var(--border)

		&__close
			background: none
			border: none
			cursor: pointer
			color: var(--foreground-muted)
			&:hover
				color: var(--foreground10)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import Dialog from './Dialog.svelte';
</script>

<Dialog id="modal-1" title="Account Confirmation">
  {#snippet trigger(dialogId)}
    <button popovertarget={dialogId} class="button" data-variant="primary">
      Open Modal
    </button>
  {/snippet}

  <p>Are you sure you want to update your account settings?</p>
  <button popovertarget="modal-1" popovertargetaction="hide">
    Cancel
  </button>
</Dialog>
```
