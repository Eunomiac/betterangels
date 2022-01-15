import {
	// #region ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮ ~
	C,
	// #endregion ▮▮▮▮[Constants]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮ ~
	U,
	// #endregion ▮▮▮▮[Utility]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Classes]▮▮▮▮▮▮▮ ~
	BetterAngelsActorSheet
	// #endregion ▮▮▮▮[Classes]▮▮▮▮
} from "../helpers/bundler.mjs";

export default class extends BetterAngelsActorSheet {

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: [...super.defaultOptions.classes, "npc", "mobnpc"],
			width: 600,
			height: 400
		});
	}

	_prepareCharacterData(context) {
		// Determine mob size and flight parameters
		context.data.curSize = context.data.size - context.data.sizeLost;
		context.data.flightSize = Math.floor(context.data.size * (1 - context.data.resolve));
		context.data.leftToLose = Math.max(0, context.data.curSize - context.data.flightSize);
		context.data.isFleeing = context.data.leftToLose === 0;
		context.config = context.config ?? {};
		context.config.mobResolve = {...C.mobResolve};

		// Determine base mob dice pool
		context.data.basePool = Math.min(10, context.data.curSize);

		// Determine mob weapon advantage
		context.data.advantage.total = this.weaponAdvantage;
		context.data.advantage.toPool = context.data.advantage.total - context.data.advantage.toWidth;

		// Derive actual mob pool
		context.data.dicePool = context.data.basePool + context.data.advantage.toPool;
	}

	activateListeners(html) {
		super.activateListeners(html);

		html.find("#mob-roll").click(this._makeMobRoll.bind(this));
	}

	get weaponAdvantage() {
		let total = 0;
		const {factors} = this.actor.data.data;
		if (factors.isLeaderArmed) { total++ }
		if (factors.isHeavilyArmed) { total++ }
		if (factors.isCornered) { total++ }
		if (factors.isAlreadyMad) { total++ }
		if (factors.isTrained || factors.isMotivated) { total++ }
		return total;
	}

	_makeMobRoll(event) {
		const dicePool = U.pInt(event.currentTarget.dataset.dicePool);
		const weaponAdvantage = U.pInt(this.actor.data.data.advantage.toWidth);
		this._launchRoll("strength", dicePool, false, 0, {weapon: {pool: this.weaponAdvantage - weaponAdvantage, width: weaponAdvantage}});
	}

}