import * as $ from 'svelte/internal/server';
import { highlight } from 'fractalpop/full';

export default function Highlight($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** 1-based line numbers to mark with `fp__line--highlighted`. */
		let {
			code = '',
			lang = 'typescript',
			highlightLines = [],
			cx,
			class: className = '',
			codeClass = '',
			$$slots,
			$$events,
			...rest
		} = $$props;

		const lineSet = $.derived(() => new Set(highlightLines));

		const html = $.derived(() => highlight(code, {
			lang,
			cx,
			markLine: lineSet().size
				? (line) => {
					if (lineSet().has(line.index + 1)) line.className += ' fp__line--highlighted';
				}
				: undefined
		}));

		$$renderer.push(`<pre${$.attributes({ class: $.clsx(`fp ${className}`.trim()), ...rest })}><code${$.attr_class($.clsx(codeClass))}>${$.html(html())}</code></pre>`);
	});
}