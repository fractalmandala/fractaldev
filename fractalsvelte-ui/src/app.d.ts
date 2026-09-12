declare global {
	namespace App {}
}

declare module 'fractalstyler2/styles' {
	const content: string;
	export default content;
}

declare module 'fractalstyler2/*' {
	const content: string;
	export default content;
}

declare module 'fractalthemer/styles' {
	const content: string;
	export default content;
}

declare module 'fractalthemer/*' {
	const content: string;
	export default content;
}

export {};



