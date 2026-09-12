<script lang="ts">
  interface Props {
    /** Raw source. This is what the copy button writes. */
    code: string;
    /** Shiki HTML from the server. Falls back to a plain pre when absent. */
    html?: string;
    /** Header label: a filename, or the language. */
    title?: string;
    copyable?: boolean;
  }

  let { code, html, title, copyable = true }: Props = $props();

  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => () => clearTimeout(timer));

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return; // clipboard denied — leave the label alone
    }
    copied = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied = false), 1600);
  }
</script>

<figure class="code-frame">
  {#if title || copyable}
    <figcaption class="code-frame__head">
      <span class="code-frame__title">{title ?? ''}</span>
      {#if copyable}
        <button
          type="button"
          class="code-frame__copy"
          class:is-copied={copied}
          onclick={copy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy code'}
        >
          <span aria-hidden="true">{copied ? 'copied' : 'copy'}</span>
        </button>
      {/if}
    </figcaption>
  {/if}

  <div class="code-frame__body">
    {#if html}
      {@html html}
    {:else}
      <pre class="shiki"><code>{code}</code></pre>
    {/if}
  </div>
</figure>