export interface AuraLayer {
	layer?: number;
	background: string;
	blendMode: string;
	blurMobile?: number;
	blurDesktop?: number;
	blur?: number;
	opacity?: number;
}

export interface AuraPreset {
	id: string;
	name: string;
	category: string;
	mood: string;
	dark: boolean;
	baseColor: string;
	textColor: string;
	description: string;
	layersCount?: number;
	layers: AuraLayer[];
}