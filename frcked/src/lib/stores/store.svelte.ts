// Shell-only reactive state. Holds only app-wide chrome: the active view, a busy
// flag, and the status message. Surface-specific data lives in each surface's own
// state module (src/lib/surfaces/<id>/state.svelte.ts).
//
// The active view persists across reloads via localStorage (unknown values fall
// through to the shell's surface picker, so no registry import — and its cycle
// risk — is needed here).

const VIEW_KEY = 'fractaldesk:app:view';

function loadView(): string {
	if (typeof localStorage === 'undefined') return 'themes';
	try {
		return localStorage.getItem(VIEW_KEY) || 'themes';
	} catch {
		return 'themes';
	}
}

export const app = $state({
	view: loadView(),
	busy: false,
	msg: '',
	kind: '' as string
});

if (typeof window !== 'undefined') {
	window.addEventListener('beforeunload', () => {
		try {
			localStorage.setItem(VIEW_KEY, app.view);
		} catch {
			// Ignore storage failures.
		}
	});
}

export function say(msg: string, kind: string = ''): void {
	app.msg = msg;
	app.kind = kind;
}
