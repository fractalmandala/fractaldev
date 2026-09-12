<script module lang="ts">
  import type { MorphIconProps } from "../MorphIcon.svelte";
  import { PAUSE_PATH, PLAY_PATH } from "./paths.js";

  export { PAUSE_PATH, PLAY_PATH };

  export type PlayPauseIconProps = Omit<
    MorphIconProps,
    "icon" | "from" | "to" | "progress"
  > & {
    playing?: boolean;
  };
</script>

<script lang="ts">
  import MorphIcon from "../MorphIcon.svelte";

  let { playing = false, ...props }: PlayPauseIconProps = $props();
</script>

<MorphIcon {...props} icon={playing ? PAUSE_PATH : PLAY_PATH} />
