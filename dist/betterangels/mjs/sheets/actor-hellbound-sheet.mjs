/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌█████████████████████ MIT License █ v0.0.1-prealpha █  ████████████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

import {
	// ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮
	C,
	// ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮
	U,
	// ▮▮▮▮▮▮▮[Classes]▮▮▮▮▮▮▮
	BetterAngelsActorSheet
} from "../helpers/bundler.mjs";

export default class extends BetterAngelsActorSheet {

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: [...super.defaultOptions.classes, "hellbound"],
			width: 600,
			height: 700,
			tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "front"}]
		});
	}

	getData() {
		const context = super.getData();

		const thisActorData = context.actor.data;

		return context;
	}

	_prepareCharacterData(context) {
		super._prepareCharacterData(context);

		// Identify primary sinister strategy, if chosen, and determine status of demon:
		const {primaryStrategy} = context.data;
		if (C.strategies.includes(primaryStrategy) && primaryStrategy in C.sinisterTraitPairs) {
			const sinisterValue = context.data[primaryStrategy].value;
			const virtuousValue = context.data[C.sinisterTraitPairs[primaryStrategy]].value;
			context.data.isDemonAwake = sinisterValue > virtuousValue;
			context.data.isDraggingToHell = sinisterValue === 5;
			context.data.isExorcising = virtuousValue === 5;
		}
	}

	_prepareItems(context) {
		super._prepareItems(context);
	}

	activateListeners(html) {
		super.activateListeners(html);
	}

}