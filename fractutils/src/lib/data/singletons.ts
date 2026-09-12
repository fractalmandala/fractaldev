export type ItemType = 'action' | 'component' | 'state' | 'transition' | 'util' | 'page';

export interface SingleItem {
	name: string;
	type: ItemType;
	slug: string
}

export const itemTypes = [
	{ 
		name: 'action ' 
	},
	{
		name: 'component'
	},
	{
		name: 'state'
	},
	{
		name: 'transition'
	}
]

export const allItems: SingleItem[] = [
	{
		name: 'dropdown',
		type: 'component',
		slug: 'dropdown'
	},
	{
		name: 'test baby',
		type: 'page',
		slug: 'test-baby'
	}
]

export interface ItemFilterOptions {
	type?: ItemType | 'all';
	search?: string;
}

export function getItems(options: ItemFilterOptions = {}): SingleItem[] {
	const { type = 'all', search } = options;

	return allItems.filter((item) => {
		if (type !== 'all' && item.type !== type) {
			return false;
		}

		if (search && search.trim() !== '') {
			const query = search.toLowerCase().trim();
			const inName = item.name.toLowerCase().includes(query);
			if (!inName) {
				return false;
			}
		}

		return true;
	});
}
