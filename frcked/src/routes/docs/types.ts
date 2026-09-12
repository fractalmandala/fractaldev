export interface DocHeader {
	id: string;
	title: string;
	level: number;
	anchor: string;
}

export interface DocSection {
	id: string;
	title: string;
	icon: string;
	file: string;
	category: string;
	categoryOrder: number;
	sectionOrder: number;
}

export interface LoadedDocSection extends DocSection {
	content: string;
	headers: DocHeader[];
	error?: string;
}

export interface CategoryInfo {
	icon: string;
	title: string;
	order: number;
}

export type CategoryMap = Record<string, CategoryInfo>;
