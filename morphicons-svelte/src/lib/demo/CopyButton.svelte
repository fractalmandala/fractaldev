<script module lang="ts">
  export type CopyButtonProps = {
    text: string;
    class?: string;
    size?: number | string;
  };
</script>

<script lang="ts">
  import { onDestroy } from "svelte";
  import MorphIcon from "../MorphIcon.svelte";

  const COPIED_DURATION_MS = 1600;
  const COPY_PATH = "M8 8 H20 V20 H8 Z M4 16 V4 H16";
  const CHECK_PATH = "M5 12 L10 17 L20 6";

  let {
    text,
    class: className = "",
    size = 16,
  }: CopyButtonProps = $props();

  let copied = $state(false);
  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  function clearResetTimer(): void {
    if (resetTimer !== null) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
  }

  async function copy(): Promise<void> {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        return;
      }

      await navigator.clipboard.writeText(text);
      copied = true;
      clearResetTimer();
      resetTimer = setTimeout(() => {
        copied = false;
        resetTimer = null;
      }, COPIED_DURATION_MS);
    } catch {
      // Clipboard permissions and insecure contexts are expected failures.
    }
  }

  onDestroy(clearResetTimer);
</script>

<button
  type="button"
  onclick={copy}
  aria-label={copied ? "Copied" : "Copy to clipboard"}
  class={`copy-button ${className}`}
>
  <MorphIcon
    icon={copied ? CHECK_PATH : COPY_PATH}
    size={size}
    strokeWidth={2}
  />
</button>

<style>
  .copy-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 8px;
    padding: 8px;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .copy-button:hover {
    background: rgb(23 23 20 / 7%);
  }

  .copy-button:focus-visible {
    outline: 3px solid #315ee7;
    outline-offset: 3px;
  }
</style>
