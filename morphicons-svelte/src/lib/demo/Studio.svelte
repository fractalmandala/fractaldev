<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import {
    buildPlan,
    resampleIcon,
    type Sampled,
    type SpringPreset,
  } from "morphicons";
  import { createMorph, type Morph } from "morphicons/dom";
  import PlayPauseIcon from "../icons/PlayPauseIcon.svelte";
  import StaticIcon from "./StaticIcon.svelte";
  import {
    byId,
    dOf,
    ICONS,
    type IconEntry,
    type Lib,
  } from "./icons.js";

  type Tab = "all" | Lib;

  const TABS: readonly { value: Tab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "lucide", label: "Lucide" },
    { value: "heroicons", label: "Heroicons" },
    { value: "tabler", label: "Tabler" },
  ];

  /* The sequence starts with simple strokes, then lets the aligned math
     reveal arrow rotation and the closed-shape transitions. */
  const DEFAULT_SEQUENCE = [
    "lucide:x",
    "lucide:plus",
    "lucide:arrow-right",
    "lucide:arrow-down",
    "lucide:check",
    "lucide:chevron-down",
    "lucide:heart",
    "lucide:star",
  ] as const;

  const SPRINGS = ["smooth", "snappy", "bouncy"] as const;
  const STROKES = [1, 1.5, 2, 2.5] as const;
  const searchIcon = byId.get("lucide:search")?.data ?? "M4 4l16 16m0-16L4 20";
  const initialEntry = byId.get(DEFAULT_SEQUENCE[0]) ?? ICONS[0];
  const initialD = dOf(initialEntry);

  const sampleCache = new Map<string, Sampled[]>();

  function samplesOf(entry: IconEntry): Sampled[] {
    let samples = sampleCache.get(entry.id);
    if (!samples) {
      samples = resampleIcon(entry.data);
      sampleCache.set(entry.id, samples);
    }
    return samples;
  }

  function formatDegrees(radians: number): string {
    return `${Math.round((radians * 180) / Math.PI)}°`;
  }

  function readoutFor(
    previous: string | null,
    current: string,
  ): { pair: string; stats: string; verdict: string } | null {
    if (!previous || previous === current) return null;
    const from = byId.get(previous);
    const to = byId.get(current);
    if (!from || !to) return null;

    const items = buildPlan(samplesOf(from), samplesOf(to)).items;
    if (items.length === 0) return null;

    const maxResidual = Math.max(...items.map((item) => item.res));
    const maxTheta = Math.max(...items.map((item) => Math.abs(item.theta)));
    const shown = items.slice(0, 4);
    const more = items.length > 4 ? ` +${items.length - 4}` : "";
    let verdict: string;

    if (maxResidual < 0.03 && maxTheta > 0.09) {
      verdict = "pure rotation, emergent";
    } else if (maxResidual < 0.03) {
      verdict = "pure similarity";
    } else if (maxResidual < 0.3) {
      verdict = "rotation + residual";
    } else {
      verdict = "coordinate morph, aligned frame";
    }

    if (from.data !== to.data && samplesOf(from).length !== samplesOf(to).length) {
      verdict += " · cell division";
    }

    return {
      pair: `${from.label} → ${to.label}`,
      stats: `θ [${shown.map((item) => formatDegrees(item.theta)).join(" ")}${more}]  res ${maxResidual.toFixed(3)}`,
      verdict,
    };
  }

  let sequence = $state<string[]>([...DEFAULT_SEQUENCE]);
  let currentId = $state<string>(DEFAULT_SEQUENCE[0]);
  let previousId = $state<string | null>(null);
  let tab = $state<Tab>("all");
  let queryText = $state("");
  let spring = $state<SpringPreset>("snappy");
  let strokeWidth = $state<number>(2);
  let playing = $state(true);
  let progress = $state(1);
  let mounted = $state(false);

  const currentEntry = $derived(byId.get(currentId) ?? ICONS[0]);
  const selectedEntries = $derived.by(() =>
    sequence
      .map((id) => byId.get(id))
      .filter((entry): entry is IconEntry => entry !== undefined),
  );
  const filteredIcons = $derived.by(() => {
    const query = queryText.trim().toLowerCase();
    return ICONS.filter(
      (entry) =>
        (tab === "all" || entry.lib === tab) &&
        (!query || entry.label.includes(query)),
    );
  });
  const readout = $derived(readoutFor(previousId, currentId));

  let pathElement: SVGPathElement;
  let morph: Morph | null = null;
  let scrubbing = false;

  onMount(() => {
    morph = createMorph(pathElement, initialEntry.data);
    mounted = true;

    return () => {
      morph?.destroy();
      morph = null;
      mounted = false;
    };
  });

  /* This effect is a delay chain: changing the selected sequence, spring, or
     current icon tears down the old timer before arming the next one. */
  $effect(() => {
    if (!mounted || !playing || sequence.length < 2) return;

    const timer = window.setInterval(() => {
      const index = sequence.indexOf(currentId);
      const nextId = sequence[(index + 1 + sequence.length) % sequence.length];
      if (nextId) transitionTo(nextId);
    }, 1300);

    return () => window.clearInterval(timer);
  });

  function transitionTo(id: string): void {
    if (id === currentId) return;
    const entry = byId.get(id);
    if (!entry) return;

    previousId = currentId;
    currentId = id;
    progress = 1;
    scrubbing = false;
    morph?.morphTo(entry.data, spring);
  }

  function advance(): void {
    if (sequence.length < 2) return;
    const index = sequence.indexOf(currentId);
    const nextId = sequence[(index + 1 + sequence.length) % sequence.length];
    if (nextId) transitionTo(nextId);
  }

  function scrub(value: number): void {
    progress = value;
    if (!previousId) return;

    const from = byId.get(previousId);
    const to = byId.get(currentId);
    if (!from || !to || !morph) return;

    playing = false;
    if (!scrubbing) {
      morph.set(from.data);
      scrubbing = true;
    }
    morph.seek(to.data, value);
  }

  function pick(id: string): void {
    if (!sequence.includes(id)) sequence = [...sequence, id];
    transitionTo(id);
  }

  function remove(id: string): void {
    if (sequence.length <= 1) return;

    const removedIndex = sequence.indexOf(id);
    const nextSequence = sequence.filter((entryId) => entryId !== id);
    sequence = nextSequence;

    if (id === currentId) {
      const replacement = nextSequence[Math.min(removedIndex, nextSequence.length - 1)];
      if (replacement) transitionTo(replacement);
    }
  }

  function clearSearch(): void {
    queryText = "";
  }
</script>

<section
  class="studio"
  aria-label="Morph studio"
  data-spring={spring}
  data-stroke={strokeWidth}
>
  <div class="studio-panel">
    <div class="studio-main">
      <div class="stage-pane">
        <div class="stage-glow" aria-hidden="true"></div>

        <div class="stage-heading">
          <span class="kicker">selected icon</span>
          <span class="stage-name">{currentEntry.label}</span>
          <span class="stage-library">{currentEntry.lib}</span>
        </div>

        <button
          class="stage-button"
          type="button"
          onclick={advance}
          disabled={sequence.length < 2}
          aria-label="Morph to the next icon in your set"
          title="Morph to the next icon"
          data-current-icon={currentEntry.id}
        >
          <svg
            viewBox="0 0 24 24"
            width="176"
            height="176"
            fill="none"
            stroke="currentColor"
            stroke-width={strokeWidth}
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <!-- The server-rendered path is intentionally static. After mount,
                 createMorph owns this attribute and paints every transition. -->
            <path bind:this={pathElement} d={initialD}></path>
          </svg>
        </button>

        <div class="stage-readout" aria-live="polite">
          {#if readout}
            <span class="readout-pair">{readout.pair}</span>
            <span>{readout.stats}</span>
            <span>{readout.verdict}</span>
          {:else}
            <span>pick icons to morph between them</span>
          {/if}
        </div>

        <div class="scrubber-row">
          <input
            class="scrubber"
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={progress}
            disabled={!previousId}
            oninput={(event) => scrub(Number(event.currentTarget.value))}
            aria-label="Scrub the morph between the previous and current icon"
          />
          <output class="scrubber-value">t={progress.toFixed(2)}</output>
        </div>

        <div class="selected-set" aria-label="Selected icon set">
          {#each selectedEntries as entry (entry.id)}
            <span class="selected-item">
              <button
                class:current={entry.id === currentId}
                class="selected-icon"
                type="button"
                onclick={() => transitionTo(entry.id)}
                aria-label={`Morph to ${entry.label}`}
                aria-current={entry.id === currentId ? "true" : undefined}
                data-selected-icon={entry.id}
              >
                <StaticIcon icon={entry.data} size={18} strokeWidth={strokeWidth} />
              </button>
              {#if sequence.length > 1}
                <button
                  class="remove-icon"
                  type="button"
                  onclick={() => remove(entry.id)}
                  aria-label={`Remove ${entry.label} from the set`}
                >
                  ×
                </button>
              {/if}
            </span>
          {/each}

          <span class="set-divider" aria-hidden="true"></span>
          <button
            class="play-toggle"
            type="button"
            onclick={() => (playing = !playing)}
            disabled={sequence.length < 2}
            aria-pressed={playing}
            aria-label={playing ? "Pause the sequence" : "Play the sequence"}
            data-control="play-pause"
          >
            <PlayPauseIcon playing={playing} size={16} strokeWidth={strokeWidth} />
          </button>
        </div>
      </div>

      <div class="picker-pane">
        <div class="picker-toolbar">
          <div class="library-tabs" role="tablist" aria-label="Icon libraries">
            {#each TABS as option}
              <button
                class:active={tab === option.value}
                type="button"
                role="tab"
                aria-selected={tab === option.value}
                data-tab={option.value}
                onclick={() => (tab = option.value)}
              >
                {option.label}
              </button>
            {/each}
          </div>

          <label class="search-field">
            <span class="sr-only">Search icons</span>
            <StaticIcon icon={searchIcon} size={15} strokeWidth={strokeWidth} />
            <input
              type="search"
              bind:value={queryText}
              placeholder="Search icons"
              aria-label="Search icons"
            />
          </label>
        </div>

        {#if filteredIcons.length > 0}
          <div class="icon-grid" id="icon-grid">
            {#each filteredIcons as entry (entry.id)}
              {@const added = sequence.includes(entry.id)}
              <button
                class:added
                class:current={entry.id === currentId}
                type="button"
                title={entry.id}
                aria-label={`Add ${entry.label} (${entry.lib})`}
                aria-pressed={added}
                data-icon-id={entry.id}
                data-library={entry.lib}
                onclick={() => pick(entry.id)}
              >
                <StaticIcon icon={entry.data} size={20} strokeWidth={strokeWidth} />
                <span class="sr-only">{entry.label}</span>
              </button>
            {/each}
          </div>
        {:else}
          <div class="empty-search" transition:fade={{ duration: 140 }}>
            <p>Nothing matches “{queryText.trim()}”.</p>
            <button type="button" onclick={clearSearch}>Clear the search</button>
          </div>
        {/if}

        <p class="picker-note">
          Click an icon to add it to your set. Every demo family is normalized to the same
          24×24 stroke grid.
        </p>
      </div>
    </div>

    <div class="studio-controls" aria-label="Studio controls">
      <div class="segmented-control">
        <span class="control-label">spring</span>
        <div class="segment-options">
          {#each SPRINGS as option}
            <button
              class:active={spring === option}
              type="button"
              aria-pressed={spring === option}
              data-spring-option={option}
              onclick={() => (spring = option)}
            >
              {option}
            </button>
          {/each}
        </div>
      </div>

      <div class="segmented-control">
        <span class="control-label">stroke</span>
        <div class="segment-options">
          {#each STROKES as option}
            <button
              class:active={strokeWidth === option}
              type="button"
              aria-pressed={strokeWidth === option}
              data-stroke-option={option}
              onclick={() => (strokeWidth = option)}
            >
              {option}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .studio {
    --studio-bg: #101010;
    --studio-bg-soft: #151515;
    --studio-bg-raised: #191919;
    --studio-border: #2b2b2b;
    --studio-border-strong: #414141;
    --studio-ink: #ededed;
    --studio-body: #a1a1a1;
    --studio-muted: #777;
    width: 100%;
    color: var(--studio-ink);
  }

  .studio-panel {
    overflow: hidden;
    border: 1px solid var(--studio-border);
    border-radius: 16px;
    background: var(--studio-bg);
    box-shadow: 0 20px 70px rgb(0 0 0 / 26%);
  }

  .studio-main {
    display: grid;
    grid-template-columns: minmax(300px, 0.9fr) minmax(0, 1.6fr);
    min-height: 590px;
  }

  .stage-pane {
    position: relative;
    display: flex;
    min-width: 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    overflow: hidden;
    border-right: 1px solid var(--studio-border);
    padding: 42px 30px 34px;
    background:
      radial-gradient(circle at 28% 22%, rgb(80 80 80 / 13%), transparent 32%),
      var(--studio-bg);
  }

  .stage-glow {
    position: absolute;
    inset: 18% 12%;
    pointer-events: none;
    border-radius: 50%;
    background: radial-gradient(circle, rgb(255 255 255 / 5%), transparent 66%);
    filter: blur(16px);
  }

  .stage-heading {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 100%;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.7rem;
  }

  .kicker {
    color: var(--studio-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .stage-name {
    overflow: hidden;
    color: var(--studio-ink);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stage-library {
    color: var(--studio-muted);
  }

  .stage-button {
    position: relative;
    display: grid;
    width: 238px;
    height: 238px;
    place-items: center;
    border: 1px solid transparent;
    border-radius: 22px;
    background: transparent;
    color: var(--studio-ink);
    cursor: pointer;
    transition: border-color 150ms ease, background 150ms ease, transform 150ms ease;
  }

  .stage-button:hover {
    border-color: var(--studio-border);
    background: rgb(255 255 255 / 2%);
  }

  .stage-button:active {
    transform: scale(0.98);
  }

  .stage-button:disabled {
    cursor: default;
    opacity: 0.45;
  }

  .stage-button svg {
    width: 176px;
    height: 176px;
  }

  .stage-readout {
    position: relative;
    display: flex;
    min-height: 49px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: var(--studio-muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.68rem;
    line-height: 1.35;
    text-align: center;
  }

  .readout-pair {
    color: var(--studio-body);
  }

  .scrubber-row {
    position: relative;
    display: flex;
    width: min(100%, 260px);
    align-items: center;
    gap: 12px;
  }

  .scrubber {
    width: 100%;
    height: 4px;
    appearance: none;
    border-radius: 999px;
    background: var(--studio-border);
    cursor: pointer;
  }

  .scrubber:disabled {
    cursor: default;
    opacity: 0.38;
  }

  .scrubber::-webkit-slider-thumb {
    width: 14px;
    height: 14px;
    appearance: none;
    border: 2px solid var(--studio-bg);
    border-radius: 50%;
    background: var(--studio-ink);
    box-shadow: 0 0 0 1px var(--studio-border-strong);
  }

  .scrubber::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border: 2px solid var(--studio-bg);
    border-radius: 50%;
    background: var(--studio-ink);
    box-shadow: 0 0 0 1px var(--studio-border-strong);
  }

  .scrubber-value {
    flex: 0 0 40px;
    color: var(--studio-muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.67rem;
    text-align: right;
  }

  .selected-set {
    position: relative;
    display: flex;
    max-width: 100%;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 7px;
  }

  .selected-item {
    position: relative;
    display: inline-flex;
  }

  .selected-icon,
  .play-toggle {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--studio-border);
    border-radius: 8px;
    background: transparent;
    color: var(--studio-body);
    cursor: pointer;
    transition: border-color 150ms ease, background 150ms ease, color 150ms ease;
  }

  .selected-icon:hover,
  .selected-icon.current,
  .play-toggle:hover,
  .play-toggle[aria-pressed="true"] {
    border-color: var(--studio-border-strong);
    background: var(--studio-bg-raised);
    color: var(--studio-ink);
  }

  .selected-icon.current {
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 16%);
  }

  .remove-icon {
    position: absolute;
    top: -7px;
    right: -7px;
    display: grid;
    width: 16px;
    height: 16px;
    place-items: center;
    border: 1px solid var(--studio-bg);
    border-radius: 50%;
    background: var(--studio-ink);
    color: var(--studio-bg);
    cursor: pointer;
    font-size: 0.68rem;
    line-height: 1;
    opacity: 0;
    transition: opacity 150ms ease;
  }

  .selected-item:hover .remove-icon,
  .selected-item:focus-within .remove-icon {
    opacity: 1;
  }

  .set-divider {
    width: 1px;
    height: 24px;
    margin-inline: 3px;
    background: var(--studio-border);
  }

  .play-toggle:disabled {
    cursor: default;
    opacity: 0.4;
  }

  .picker-pane {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 19px;
    padding: 32px 32px 28px;
  }

  .picker-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }

  .library-tabs,
  .segment-options {
    display: flex;
    overflow: hidden;
    border: 1px solid var(--studio-border);
    border-radius: 9px;
    background: var(--studio-bg);
  }

  .library-tabs button,
  .segment-options button {
    min-height: 38px;
    border: 0;
    border-right: 1px solid var(--studio-border);
    padding: 0 16px;
    background: transparent;
    color: var(--studio-body);
    cursor: pointer;
    font-size: 0.87rem;
    transition: background 150ms ease, color 150ms ease;
  }

  .library-tabs button:last-child,
  .segment-options button:last-child {
    border-right: 0;
  }

  .library-tabs button:hover,
  .segment-options button:hover {
    color: var(--studio-ink);
  }

  .library-tabs button.active,
  .segment-options button.active {
    background: #ededed;
    color: #101010;
  }

  .search-field {
    display: flex;
    min-width: 180px;
    flex: 1;
    height: 38px;
    align-items: center;
    gap: 9px;
    border: 1px solid var(--studio-border);
    border-radius: 9px;
    padding: 0 12px;
    color: var(--studio-muted);
  }

  .search-field input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--studio-ink);
    font-size: 0.95rem;
  }

  .search-field input::placeholder {
    color: var(--studio-muted);
  }

  .search-field:focus-within {
    border-color: var(--studio-border-strong);
  }

  .icon-grid {
    display: grid;
    max-height: 392px;
    grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
    align-content: start;
    gap: 6px;
    overflow-y: auto;
    padding: 2px 3px 4px 0;
    scrollbar-color: var(--studio-border-strong) transparent;
    scrollbar-width: thin;
  }

  .icon-grid button {
    display: grid;
    aspect-ratio: 1;
    place-items: center;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    color: var(--studio-body);
    cursor: pointer;
    transition: border-color 150ms ease, background 150ms ease, color 150ms ease;
  }

  .icon-grid button:hover,
  .icon-grid button.added,
  .icon-grid button.current {
    border-color: var(--studio-border);
    background: var(--studio-bg-raised);
    color: var(--studio-ink);
  }

  .icon-grid button.current {
    border-color: var(--studio-border-strong);
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 11%);
  }

  .empty-search {
    display: flex;
    min-height: 300px;
    flex: 1;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 10px;
    color: var(--studio-muted);
    text-align: center;
  }

  .empty-search p {
    margin: 0;
    font-size: 0.9rem;
  }

  .empty-search button {
    border: 0;
    background: transparent;
    color: var(--studio-ink);
    cursor: pointer;
    font-size: 0.84rem;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .picker-note {
    max-width: 58ch;
    margin: auto 0 0;
    color: var(--studio-muted);
    font-size: 0.86rem;
    line-height: 1.55;
  }

  .studio-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 26px;
    border-top: 1px solid var(--studio-border);
    padding: 18px 30px;
    background: var(--studio-bg-soft);
  }

  .segmented-control {
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .control-label {
    color: var(--studio-muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.76rem;
  }

  .segment-options button {
    min-height: 34px;
    padding-inline: 14px;
    font-size: 0.82rem;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    clip-path: inset(50%);
  }

  @media (max-width: 900px) {
    .studio-main {
      grid-template-columns: 1fr;
    }

    .stage-pane {
      min-height: 530px;
      border-right: 0;
      border-bottom: 1px solid var(--studio-border);
    }

    .picker-pane {
      min-height: 450px;
    }
  }

  @media (max-width: 560px) {
    .stage-pane {
      min-height: 490px;
      padding: 30px 16px 24px;
    }

    .stage-button {
      width: 200px;
      height: 200px;
    }

    .stage-button svg {
      width: 148px;
      height: 148px;
    }

    .picker-pane {
      min-height: 430px;
      padding: 22px 16px 24px;
    }

    .library-tabs {
      width: 100%;
    }

    .library-tabs button {
      flex: 1;
      padding-inline: 5px;
      font-size: 0.76rem;
    }

    .search-field {
      width: 100%;
    }

    .studio-controls {
      align-items: flex-start;
      flex-direction: column;
      gap: 14px;
      padding: 16px;
    }

    .segmented-control {
      width: 100%;
      justify-content: space-between;
    }

    .segment-options button {
      padding-inline: 10px;
    }
  }
</style>
