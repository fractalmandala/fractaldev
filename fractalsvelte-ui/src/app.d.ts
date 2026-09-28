declare global {
	namespace App {}
}

declare module '*?raw' {
	const content: string;
	export default content;
}

export {};



