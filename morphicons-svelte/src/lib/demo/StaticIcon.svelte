<script module lang="ts">
  import type { IconInput } from "morphicons";

  export type StaticIconProps = {
    icon: IconInput;
    size?: number | string;
    strokeWidth?: number | string;
    class?: string;
    label?: string;
  };
</script>

<script lang="ts">
  import { cubicsToPathD, iconToCubics } from "morphicons";

  let {
    icon,
    size = 20,
    strokeWidth = 2,
    class: className,
    label,
  }: StaticIconProps = $props();

  const quantize = (d: string): string =>
    d.replace(/-?\d+\.\d+(?:e-?\d+)?/gi, (number) =>
      String(Number(Number(number).toFixed(4))),
    );

  const iconD = $derived.by(() =>
    typeof icon === "string"
      ? icon
      : quantize(cubicsToPathD(iconToCubics(icon))),
  );
</script>

<svg
  viewBox="0 0 24 24"
  width={size}
  height={size}
  fill="none"
  stroke="currentColor"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  role={label ? "img" : undefined}
  aria-hidden={label ? undefined : "true"}
  class={className}
>
  {#if label}<title>{label}</title>{/if}
  <path d={iconD}></path>
</svg>
