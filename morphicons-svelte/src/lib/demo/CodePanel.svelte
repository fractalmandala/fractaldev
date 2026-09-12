<script lang="ts">
  import type { SpringPreset } from "morphicons";

  import CopyButton from "./CopyButton.svelte";
  import { highlightSvelte } from "./syntax.js";

  export const SNIPPET = `<!-- Svelte 5 -->
<script lang="ts">
  import { MorphIcon } from "morphicons-svelte";
  import { Menu, X } from "lucide"; // icon data, not components

  let open = $state(false);
<${"/"}script>

<button onclick={() => (open = !open)} aria-expanded={open}>
  <MorphIcon
    icon={open ? X : Menu}
    spring="snappy"
    label={open ? "Close" : "Menu"}
  />
</button>`;

  type SpringExample = {
    preset: SpringPreset;
    description: string;
    code: string;
  };

  const SPRING_EXAMPLES: readonly SpringExample[] = [
    {
      preset: "smooth",
      description: "Calm and critically damped. No overshoot.",
      code: `<MorphIcon icon={open ? X : Menu} spring="smooth" />`,
    },
    {
      preset: "snappy",
      description: "Fast with a subtle overshoot. Great for controls.",
      code: `<MorphIcon icon={open ? X : Menu} spring="snappy" />`,
    },
    {
      preset: "bouncy",
      description: "Playful and expressive, with a visible overshoot.",
      code: `<MorphIcon icon={open ? X : Menu} spring="bouncy" />`,
    },
  ];
</script>

<section class="usage-section" id="usage" aria-labelledby="usage-heading">
  <div class="section-heading">
    <h2 id="usage-heading">The adapter stays small.</h2>
    <p>
      Keep state in your component and hand MorphIcon the current icon data. The adapter
      owns the path after mount, so the same pair can be interrupted and retargeted.
    </p>
  </div>

  <div class="code-card">
    <div class="code-card-header">
      <span>svelte</span>
      <CopyButton
        text={SNIPPET}
        size={15}
        class="showcase-copy"
      />
    </div>
    <pre><code>{@html highlightSvelte(SNIPPET)}</code></pre>
  </div>

  <p class="usage-note">
    The <code>spring</code> prop is optional. Set it to <code>"smooth"</code>,
    <code>"snappy"</code>, or <code>"bouncy"</code> to choose the feel of each morph.
  </p>

  <div class="preset-guide">
    <div class="preset-heading">
      <div>
        <span class="kicker">spring presets</span>
        <h3>Choose the feel.</h3>
      </div>
      <p>Pass one named preset directly to <code>MorphIcon</code>.</p>
    </div>

    <div class="preset-grid">
      {#each SPRING_EXAMPLES as example}
        <article class="preset-card" data-spring-preset={example.preset}>
          <div class="preset-card-header">
            <div>
              <h4>{example.preset}</h4>
              <p>{example.description}</p>
            </div>
            <CopyButton
              text={example.code}
              size={15}
              class="preset-copy"
            />
          </div>
          <pre class="preset-code"><code>{@html highlightSvelte(example.code)}</code></pre>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .usage-section {
    width: 100%;
  }

  .section-heading {
    max-width: 660px;
    margin: 0 auto 28px;
    text-align: center;
  }

  .section-heading p {
    margin: 0;
    color: #909090;
    font-size: 0.98rem;
    line-height: 1.65;
  }

  .usage-note {
    margin: 32px 0 0;
    color: #888;
    font-size: 0.82rem;
    line-height: 1.55;
  }

  .usage-note code,
  .preset-heading code {
    color: #d6d6d6;
  }

  .kicker {
    display: block;
    margin-bottom: 16px;
    color: #858585;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0 0 14px;
    color: #ededed;
    font-size: clamp(1.7rem, 3vw, 2.4rem);
    font-weight: 550;
    letter-spacing: -0.045em;
    line-height: 1.05;
  }

  .code-card {
    overflow: hidden;
    border: 1px solid #292929;
    border-radius: 14px;
    background: #101010;
    box-shadow: 0 20px 70px rgb(0 0 0 / 22%);
  }

  .code-card-header {
    display: flex;
    height: 48px;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #292929;
    padding: 0 14px;
    color: #777;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.75rem;
  }

  :global(.showcase-copy) {
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

  :global(.showcase-copy:hover) {
    background: #202020;
    color: #ededed;
  }

  pre {
    overflow-x: auto;
    margin: 0;
    padding: 24px 26px 28px;
    color: #dedede;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.8rem;
    line-height: 1.7;
    scrollbar-color: #3a3a3a transparent;
  }

  pre code {
    color: inherit;
    font: inherit;
  }

  .preset-guide {
    margin-top: 42px;
  }

  .preset-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 16px;
  }

  .preset-heading .kicker {
    margin-bottom: 10px;
  }

  h3,
  h4,
  .preset-heading p {
    margin: 0;
  }

  h3 {
    color: #ededed;
    font-size: 1.2rem;
    font-weight: 550;
    letter-spacing: -0.035em;
  }

  .preset-heading p {
    color: #888;
    font-size: 0.82rem;
  }

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .preset-card {
    overflow: hidden;
    border: 1px solid #292929;
    border-radius: 12px;
    background: #101010;
    transition: border-color 150ms ease, transform 150ms ease;
  }

  .preset-card:hover {
    border-color: #414141;
    transform: translateY(-2px);
  }

  .preset-card-header {
    display: flex;
    min-height: 82px;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    border-bottom: 1px solid #292929;
    padding: 16px 14px 13px;
  }

  h4 {
    color: #ededed;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .preset-card-header p {
    max-width: 24ch;
    margin-top: 7px;
    color: #777;
    font-size: 0.72rem;
    line-height: 1.4;
  }

  :global(.preset-copy) {
    flex: 0 0 auto;
    margin: -5px -6px 0 0;
  }

  .preset-code {
    overflow-x: auto;
    padding: 15px 14px 17px;
    color: #dedede;
    font-size: 0.7rem;
    line-height: 1.6;
  }

  :global(.code-token-comment) {
    color: #697386;
  }

  :global(.code-token-keyword) {
    color: #c792ea;
  }

  :global(.code-token-string) {
    color: #c3e88d;
  }

  :global(.code-token-tag),
  :global(.code-token-component) {
    color: #f07178;
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

  @media (max-width: 560px) {
    .preset-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }

    .preset-grid {
      grid-template-columns: 1fr;
    }

    pre {
      padding: 20px 16px 24px;
      font-size: 0.72rem;
    }
  }

#usage-heading {
	font-size: 21px;
}
</style>
