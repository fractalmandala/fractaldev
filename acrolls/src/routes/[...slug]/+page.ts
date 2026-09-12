import type { PageLoad } from "./$types";
import { docs } from "$lib/demo/source";

// Resolve the compiled article in load (kit-consumer pattern) so the prose lands in the
// SSR HTML instead of an {#await} block.
export const load: PageLoad = async ({ params }) => {
	const slug = params.slug ?? "";
	const document = docs.get(slug);
	return { slug, Article: document ? await document.loader() : undefined };
};
