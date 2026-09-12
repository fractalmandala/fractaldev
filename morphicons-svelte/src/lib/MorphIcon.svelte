<script module lang="ts">
  import type { SVGAttributes } from "svelte/elements";
  import type { IconInput, SpringPreset } from "morphicons";
  import type { MorphOptions } from "morphicons/dom";

  type OwnedSvgAttribute =
    | "children"
    | "class"
    | "color"
    | "fill"
    | "height"
    | "role"
    | "stroke"
    | "stroke-linecap"
    | "stroke-linejoin"
    | "stroke-width"
    | "viewBox"
    | "width"
    | "xmlns"
    | "aria-hidden";

  export type MorphIconProps = Omit<
    SVGAttributes<SVGSVGElement>,
    OwnedSvgAttribute
  > & {
    icon?: IconInput;
    from?: IconInput;
    to?: IconInput;
    progress?: number;
    spring?: SpringPreset | MorphOptions;
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    allocOutputs,
    buildPlan,
    interpPolar,
    resampleIcon,
    serialize,
  } from "morphicons";
  import {
    canonicalD,
    createMorph,
    type Morph,
  } from "morphicons/dom";

  let {
    icon,
    from,
    to,
    progress = 0,
    spring,
    size = 24,
    color = "currentColor",
    strokeWidth = 2,
    absoluteStrokeWidth = false,
    label,
    class: className,
    ...svgProps
  }: MorphIconProps = $props();

  type Mode = "empty" | "uncontrolled" | "controlled";

  function frozenD(source: IconInput, target: IconInput, t: number): string {
    if (t <= 0) return canonicalD(source);
    if (t >= 1) return canonicalD(target);

    const plan = buildPlan(resampleIcon(source), resampleIcon(target));
    const output = allocOutputs(plan);
    interpPolar(plan, t, output);
    return serialize(
      output,
      plan.items.map((item) => item.closed),
    );
  }

  function initialPathD(): string {
    if (from !== undefined && to !== undefined) {
      return frozenD(from, to, progress);
    }

    const startingIcon = icon ?? from ?? to;
    return startingIcon !== undefined ? canonicalD(startingIcon) : "";
  }

  const initialD = initialPathD();

  let pathElement: SVGPathElement;
  let morph: Morph | null = null;
  let mode: Mode = "empty";
  let currentTarget: IconInput | undefined;
  let pair: readonly [IconInput, IconInput] | null = null;
  let based = false;
  let lastUncontrolledIcon: IconInput | undefined;

  function ensureDriver(seed: IconInput): Morph {
    if (!morph) {
      morph = createMorph(pathElement, seed);
      currentTarget = seed;
    }
    return morph;
  }

  function applyControlled(source: IconInput, target: IconInput, t: number) {
    const driver = ensureDriver(source);
    const pairChanged = !pair || pair[0] !== source || pair[1] !== target;

    if (pairChanged) {
      pair = [source, target];
      based = false;
    }

    if (t <= 0) {
      driver.set(source);
      currentTarget = source;
      based = false;
      return;
    }

    if (t >= 1) {
      driver.set(target);
      currentTarget = target;
      based = false;
      return;
    }

    if (!based) driver.set(source);
    driver.seek(target, t);
    currentTarget = target;
    based = true;
  }

  $effect(() => {
    if (from !== undefined && to !== undefined) {
      applyControlled(from, to, progress);
      mode = "controlled";
      return;
    }

    const nextIcon = icon ?? from ?? to;
    if (nextIcon === undefined) {
      mode = "empty";
      pair = null;
      based = false;
      return;
    }

    const driverWasAbsent = morph === null;
    const driver = ensureDriver(nextIcon);
    pair = null;
    based = false;

    if (
      !driverWasAbsent &&
      (mode !== "uncontrolled" || lastUncontrolledIcon !== nextIcon) &&
      currentTarget !== nextIcon
    ) {
      driver.morphTo(nextIcon, spring);
      currentTarget = nextIcon;
    }

    lastUncontrolledIcon = nextIcon;
    mode = "uncontrolled";
  });

  /** Immediately set an icon. Declarative props take over on their next change. */
  export function set(nextIcon: IconInput): void {
    pair = null;
    based = false;
    const driver = ensureDriver(nextIcon);
    driver.set(nextIcon);
    currentTarget = nextIcon;
  }

  /** Morph to an icon. With no source icon yet, the first call seeds immediately. */
  export function morphTo(
    nextIcon: IconInput,
    nextSpring?: SpringPreset | MorphOptions,
  ): void {
    pair = null;
    based = false;

    if (!morph) {
      ensureDriver(nextIcon);
      return;
    }

    morph.morphTo(nextIcon, nextSpring ?? spring);
    currentTarget = nextIcon;
  }

  onDestroy(() => {
    morph?.destroy();
    morph = null;
    pair = null;
    based = false;
  });

  const renderedStrokeWidth = $derived(
    absoluteStrokeWidth
      ? (Number(strokeWidth) * 24) / Number(size)
      : strokeWidth,
  );
</script>

<svg
  {...svgProps}
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke={color}
  stroke-width={renderedStrokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  role={label ? "img" : undefined}
  aria-hidden={label ? undefined : "true"}
  class={className}
>
  {#if label}<title>{label}</title>{/if}
  <path bind:this={pathElement} d={initialD}></path>
</svg>
