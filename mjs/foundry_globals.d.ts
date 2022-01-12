
interface Window {
	REF: {},
	DB: {
		setDBCircle: (circle?: XCircle) => void,
		showAngles: (circle?: XCircle, numGuides?: number, isShowingAll?: boolean) => void,
		addDieWatch: (watchList: string[]) => void
	},
	CIRCLES: XCircle[],
	elem?: HTMLElement,
	newParent?: HTMLElement,
	oldParent?: HTMLElement,
	dragElem?: HTMLElement,
}
declare var window: Window & typeof globalThis;

declare var game: any;
declare var CONFIG: any;

declare class Hooks {
	static on: (event: string, callback: (...args: any) => void) => void;
	static once: (event: string, callback: (...args: any) => void) => void;
}

declare class Actors { 
	static unregisterSheet: (sheetRef: string, sheet: ActorSheet) => void;
	static registerSheet: (sheetRef: string, sheet: ActorSheet, params: {
			makeDefault: boolean,
			types: string[],
			label: string
		}) => void;
}

declare class Actor { }
declare class ActorSheet { }

declare class Items { 
	static unregisterSheet: (sheetRef: string, sheet: ItemSheet) => void;
	static registerSheet: (sheetRef: string, sheet: ItemSheet, params: {
			makeDefault: boolean,
			types: string[],
			label: string
		}) => void;
}

declare class Item { }
declare class ItemSheet { }
