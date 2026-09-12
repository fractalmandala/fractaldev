<script lang="ts">
  import CopyButton from "./CopyButton.svelte";
  import { highlightSvelte } from "./syntax.js";

  export const SNIPPET = `$ pnpm add morphicons-svelte`;
</script>

<section class="usage-section" id="usage" aria-labelledby="usage-heading">
  <div class="code-card">
    <div class="row">
      <pre><code>{@html highlightSvelte(SNIPPET)}</code></pre>
      <CopyButton
        text={SNIPPET}
        size={15}
        class="snip-copy"
      />
    </div>
  </div>
</section>

<style>
  .row {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 14px 16px;
    min-height: 48px;
  }

  .usage-section {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
  }

  .code-card {
    overflow: hidden;
    border: 1px solid #292929;
    border-radius: 8px;
    background: #101010;
    box-shadow: 0 20px 70px rgb(0 0 0 / 22%);
  }

  :global(.snip-copy) {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    display: grid;
    width: 30px;
    height: 30px;
    place-items: center;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #888;
    cursor: pointer;
  }

  :global(.snip-copy:hover) {
    background: #202020;
    color: #ededed;
  }

  pre {
    overflow-x: auto;
    margin: 0;
    padding: 0;
    color: #dedede;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.85rem;
    line-height: 1.5;
  }

  pre code {
    color: inherit;
    font: inherit;
  }

  :global(.code-token-attr) {
    color: #82aaff;
  }

  :global(.code-token-function) {
    color: #82aaff;
  }

  :global(.code-token-variable),
  :global(.code-token-number) {
    color: #f78c6c;
  }

  :global(.code-token-property) {
    color: #e6d37a;
  }

  :global(.code-token-operator),
  :global(.code-token-punctuation) {
    color: #89ddff;
  }
</style>
