# acrolls/svelte

Svelte 5 publication primitives for Acrolls.

```svelte
<script>
  import { Publication, Callout, Figure, Banner } from 'acrolls/svelte';
</script>

<Publication>
  <Banner title="Hello" description="A technical note" />
  <Callout variant="insight" title="Tip">Prefer foundation CSS when the host owns type.</Callout>
</Publication>
```

`PublicationLayout` is the default mdsvex layout used by the `acrolls/sveltekit` helper.
Hosts can also keep the compiler layout unset and wrap docs/blog routes explicitly with
`<Publication>` so only article surfaces receive the publication UI.
