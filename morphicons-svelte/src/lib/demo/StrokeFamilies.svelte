<script module lang="ts">
  import type { IconInput } from "morphicons";

  type FamilyExample = {
    name: string;
    detail: string;
    icon: IconInput;
  };
</script>

<script lang="ts">
  import StaticIcon from "./StaticIcon.svelte";
  import { byId } from "./icons.js";

  const gridCells = Array.from({ length: 24 });
  const arrow = byId.get("lucide:arrow-right")?.data ?? "M4 12h16m-6-6 6 6-6 6";
  const planet = byId.get("tabler:planet")?.data ?? "M5 12a7 7 0 1 0 14 0a7 7 0 1 0-14 0";
  const camera = byId.get("heroicons:camera")?.data ?? "M4 8h16v11H4zM8 8l1.5-3h5L16 8";

  const families: FamilyExample[] = [
    { name: "Lucide", detail: "outline · 24×24", icon: arrow },
    { name: "Tabler", detail: "outline · 24×24", icon: planet },
    { name: "Heroicons outline", detail: "outline · 24×24", icon: camera },
    { name: "Iconoir", detail: "stroke · 24×24", icon: "M5 12h14M12 5v14" },
    { name: "Akar Icons", detail: "stroke · 24×24", icon: "M4 12h16M12 4v16" },
    { name: "Untitled UI", detail: "stroke · 24×24", icon: "M5 12h14m-7-7v14" },
    { name: "Hugeicons", detail: "stroke · 24×24", icon: "M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16m0 4v4l3 2" },
    { name: "shadcn registry", detail: "stroke · 24×24", icon: "M5 12h14M12 5v14" },
  ];
</script>

<section class="families-section" id="how" aria-labelledby="families-heading">
  <div class="families-copy">
    <span class="kicker">one coordinate space</span>
    <h2 id="families-heading">Bring your stroke set.</h2>
    <p>
      Morphicons works on the geometry inside an icon, not the component that renders it.
      Normalize both endpoints to a common grid and any compatible stroke family can share a
      morph driver.
    </p>

    <div class="normalization-card" aria-label="A stroke icon normalized to a 24 by 24 grid">
      <div class="grid-paper" aria-hidden="true">
        {#each gridCells as _}
          <span></span>
        {/each}
      </div>
      <div class="normalization-icon">
        <StaticIcon icon={arrow} size={72} strokeWidth={1.5} />
      </div>
      <div class="normalization-label">
        <span>same frame</span>
        <code>24 × 24</code>
      </div>
    </div>
  </div>

  <div class="family-list">
    <div class="family-list-heading">
      <span>Compatible examples</span>
      <span>stroke-based</span>
    </div>
    <ul>
      {#each families as family (family.name)}
        <li>
          <span class="family-mark"><StaticIcon icon={family.icon} size={22} strokeWidth={1.7} /></span>
          <span class="family-name">{family.name}</span>
          <span class="family-detail">{family.detail}</span>
        </li>
      {/each}
    </ul>
  </div>

  <p class="scope-note">
    <strong>Scope note:</strong> this normalization path is for stroke-based geometry. Fill-only
    icon sets are not supported; choose an outline or stroke variant when a family provides one.
  </p>
</section>
