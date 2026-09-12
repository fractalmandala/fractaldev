<script module lang="ts">
  import type { MorphIconProps } from "../MorphIcon.svelte";
  import { CLOSE_PATH, MENU_PATH } from "./paths.js";

  export { CLOSE_PATH, MENU_PATH };

  export type MenuCloseIconProps = Omit<
    MorphIconProps,
    "icon" | "from" | "to" | "progress"
  > & {
    open?: boolean;
  };
</script>

<script lang="ts">
  import MorphIcon from "../MorphIcon.svelte";

  let { open = false, ...props }: MenuCloseIconProps = $props();
</script>

<MorphIcon {...props} icon={open ? CLOSE_PATH : MENU_PATH} />
