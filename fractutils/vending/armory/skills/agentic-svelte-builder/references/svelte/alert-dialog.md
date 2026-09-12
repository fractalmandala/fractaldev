# Svelte 5 Native Alert Dialog

An accessible modal Alert Dialog component built for asynchronous confirmation workflows. Uses **Svelte 5 Runes** (`$state`, `$props`) to control open states, preserve alert-dialog semantics, and handle promise resolutions on confirmation or cancellation. Add a tested focus trap when the host accessibility contract requires one.

---

## Component Implementation (`AlertDialog.svelte`)

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    open?: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onconfirm?: () => void | Promise<void>;
    oncancel?: () => void;
    children?: Snippet;
  };

  let {
    open = $bindable(false),
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmText = 'Continue',
    cancelText = 'Cancel',
    onconfirm,
    oncancel,
    children
  }: Props = $props();

  let loading = $state(false);

  async function handleConfirm() {
    loading = true;
    try {
      await onconfirm?.();
      open = false;
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    oncancel?.();
    open = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      handleCancel();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div class="[ alert-dialog-overlay ] [ row ycenter xcenter position-fixed ]" onclick={handleCancel} role="presentation">
    <div
      class="[ alert-dialog ] [ box maxw500 w100 ] [ pad24 radius12 bdr ]"
      onclick={(e) => e.stopPropagation()}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-desc"
    >
      <h3 id="alert-title" class="[ alert-dialog__title ] [ margin0 text-lg bold ]">{title}</h3>
      <p id="alert-desc" class="[ alert-dialog__desc ] [ text-sm color-muted marginbot24 ]">{description}</p>

      {#if children}
        <div class="[ alert-dialog__body ] [ marginbot24 ]">
          {@render children()}
        </div>
      {/if}

      <div class="[ alert-dialog__actions ] [ row ycenter xend gap12 ]">
        <button class="button" data-variant="outline" onclick={handleCancel} disabled={loading}>
          {cancelText}
        </button>
        <button class="button" data-variant="destructive" onclick={handleConfirm} disabled={loading}>
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}

```

### External stylesheet (`alert-dialog.sass`)

```sass
	.alert-dialog-overlay
		inset: 0
		background-color: rgba(15, 23, 42, 0.5)
		backdrop-filter: blur(4px)
		z-index: 100

	.alert-dialog
		background-color: var(--background10)
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
```

---

## Usage Example (`+page.svelte`)

```svelte
<script lang="ts">
  import AlertDialog from './AlertDialog.svelte';

  let showDeleteConfirm = $state(false);

  async function deleteAccount() {
    // Perform API call
    await new Promise(r => setTimeout(r, 1000));
    console.log('Account deleted');
  }
</script>

<button class="button" data-variant="destructive" onclick={() => showDeleteConfirm = true}>
  Delete Account
</button>

<AlertDialog
  bind:open={showDeleteConfirm}
  title="Delete Account?"
  description="This will permanently delete your data. Are you sure?"
  confirmText="Delete Permanently"
  onconfirm={deleteAccount}
/>
```
