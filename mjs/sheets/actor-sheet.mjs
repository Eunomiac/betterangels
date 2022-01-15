import {
	// #region ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮ ~
	C,
	// #endregion ▮▮▮▮[Constants]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮ ~
	// GreenSock Animation Platform
	gsap, Dragger, MotionPathPlugin,
	// #endregion ▮▮▮▮[External Libraries]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮ ~
	U,
	// #endregion ▮▮▮▮[Utility]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Mixins]▮▮▮▮▮▮▮ ~
	MIX, UpdateQueue
	// #endregion ▮▮▮▮[Mixins]▮▮▮▮
} from "../helpers/bundler.mjs";

export default class extends MIX(ActorSheet).with(UpdateQueue) {
	// #region ▮▮▮▮▮▮▮[Defaults, Template]▮▮▮▮▮▮▮ ~
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["betterangels", "sheet", "actor"],
			template: "systems/betterangels/hbs/actor/actor-sheet.hbs",
			width: 476,
			height: 786,
			tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "front"}]
		});
	}

	get template() { return `systems/betterangels/hbs/actor/actor-${this.actor.data.type}-sheet.hbs` }
	// #endregion ▮▮▮▮[Defaults, Template]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Data Prep]▮▮▮▮▮▮▮
	getData() {
		const context = ((rootData) => ({
			...rootData,
			type: rootData.actor.data.type,
			data: rootData.actor.data.data,
			flags: rootData.actor.data.flags
		}))(super.getData());

		if (["hellbound", "minornpc", "mobnpc"].includes(context.type)) {
			this._prepareItems(context);
			this._prepareCharacterData(context);
		}

		return context;
	}
	_prepareCharacterData(context) {
		// Data for trait radial menus

		// For each trait, define data for rendering of dots and radial menu
		Object.entries(C.sinisterTraitPairs).forEach(([top, bottom]) => {
			const [topState, bottomState] = this._getButtonStates(top);

			// const {min: topMin, max: topMax, value: topVal} = context.data[top];
			// const {min: botMin, max: botMax, value: botVal} = context.data[bottom];
			Object.assign(context.data[top], {
				name: topState.name,
				_emptyDots: topState.max - topState.value,
				canSlideTo: topState.slide/*  && (topVal + botVal) < 7 */,
				canAdd: topState.add,
				canDrop: topState.drop
			});
			Object.assign(context.data[bottom], {
				name: bottomState.name,
				_emptyDots: bottomState.max - bottomState.value,
				canSlideTo: bottomState.slide/*  && (topVal + botVal) < 7 */,
				canAdd: bottomState.add,
				canDrop: bottomState.drop
			});
		});
	}
	// #endregion ▮▮▮▮[Data Prep]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Item Prep]▮▮▮▮▮▮▮
	_prepareItems(context) {
		console.log({CONTEXT: context, ITEMS: context.items});
		Object.assign(context.data, {
			powers: context.items.filter((item) => item.type === "power").slice(context.data.isBigDemon ? -3 : -2),
			aspects: context.items.filter((item) => item.type === "aspect").slice(-2),
			devices: context.items.filter((item) => item.type === "device").slice(-2)
		});
	}
	// #endregion ▮▮▮▮[Item Prep]▮▮▮▮

	// #region ████████ 🔴🟠🟡 ACTIVATE LISTENERS 🟡🟠🔴 ████████ ~
	activateListeners(html) {
		super.activateListeners(html);

		window.html = html;
		window.sheet = this;

		// html.find(".feature").click((event) => {
		// 	const item = this.actor.items.get(event.currentTarget.dataset.itemId);
		// 	item.sheet.render(true);
		// });

		if (!this.isEditable) { return }

		const sheetContext = this;

		html.find(".radial-hover").contextmenu(this._openRadialMenu.bind(this));
		html.find(".radial-hover").mouseleave(this._closeRadialMenu.bind(this));

		html.find(".trait-button").click(this._changeTrait.bind(this));
		html.find(".trait-button").contextmenu(this._changeTrait.bind(this));

		html.find(".trait-pair.strategy label.sinister .draggable").dblclick(this._setPrimarySinister.bind(this));

		html.find(".trait-pair .virtuous").each((_, label) => {
			$(label)
				.find(".trait.draggable")
				.each((__, span) => U.set([span, $(span).prev()], {x: U.get(label, "width") - (1.1 * U.get(span, "width"))}));
		});

		html.find(".feature").css({pointerEvents: "all"}).click((event) => {
			const item = this.actor.items.get(event.currentTarget.dataset.itemId);
			item.sheet.render(true);
		});

		// Construct lookup object for trait livesnap points
		// const getSnapPoints = (traitName) => {
		// 	traitName = U.lCase(traitName);
		// 	const traitType = C.strategies.includes(traitName) ? "strategy" : "tactic";
		// 	const snapPoints = new Map();
		// 	html.find(`#trait-label-${traitName}`).removeClass("faded-trait");
		// 	const [homeTarget] = html.find(`#trait-label-${traitName} .display`);
		// 	const globalHomePos = U.getGlobalPos(homeTarget);
		// 	snapPoints.set(globalHomePos, homeTarget);
		// 	C.strategies.forEach((trait) => {
		// 		if (trait !== traitName) {
		// 			if (traitType === "tactic") {
		// 				// We are dragging a TACTIC around ...
		// 				html.find(`#trait-label-${trait}`).removeClass("faded-trait");
		// 				const [dropTarget] = html.find(`#trait-label-${trait} .display`);
		// 				const globalDropPos = U.getGlobalPos(dropTarget);
		// 				// ... so, its drop point will be LOWER and RIGHT
		// 				globalDropPos.x += 15;
		// 				globalDropPos.y += 15;
		// 				snapPoints.set(globalDropPos, dropTarget);
		// 			} else {
		// 				html.find(`#trait-label-${trait}`).addClass("faded-trait");
		// 			}
		// 		}
		// 	});
		// 	C.tactics.forEach((trait) => {
		// 		if (trait !== traitName) {
		// 			if (traitType === "strategy") {
		// 				// We are dragging a STRATEGY around ...
		// 				html.find(`#trait-label-${trait}`).removeClass("faded-trait");
		// 				const [dropTarget] = html.find(`#trait-label-${trait} .display`);
		// 				const globalDropPos = U.getGlobalPos(dropTarget);
		// 				globalDropPos.x -= 15;
		// 				globalDropPos.y -= 15;
		// 				// ... so, its drop point will be UPPER and LEFT
		// 				snapPoints.set(globalDropPos, dropTarget);
		// 			} else {
		// 				html.find(`#trait-label-${trait}`).addClass("faded-trait");
		// 			}
		// 		}
		// 	});

		// 	C[traitType === "strategy" ? "tactics" : "strategies"].forEach((trait) => {
		// 	});
		// 	return snapPoints;
		// };

		Dragger.create(`#actor-${this.actor.id} .draggable.trait`, {
			onDragStart() {
				this.trait = this.target.dataset.target;
				[this.type, this.dropType] = C.strategies.includes(this.trait) ? ["strategy", "tactic"] : ["tactic", "strategy"];
				console.log({thisTrait: this.trait, thisType: this.type, thisDrop: this.dropType, CStratsIncludes: C.strategies.includes(this.trait)});
				this.snapElems = Array.from(html.find(`#trait-label-${this.trait} .display.trait, .draggable.trait.${this.dropType}`));
				[this.startParent] = html.find(this.target).parent();
				html.find(".trait-pair label.droppable").addClass("no-hover");
				U.reparent(this.target, $("#x-container")[0]);
				this.update(false, true);
				console.log({"DRAG START": this});
				gsap.to(this.target, {
					scale: 2,
					fontFamily: "Komikax, sans-serif",
					color: C.html.colors[this.type],
					opacity: 1,
					duration: 2,
					textShadow: "0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black",
					ease: "elastic.out"
				});
				// console.log("DRAG START:", {["this"]: this, target: this.target, startParent: this.startParent});
			},
			/* onDragUpdate() {
				// Determine which of the snap points target is closest to, and animate that snap element without livesnapping
			} */
			liveSnap: {
				points(point) {
					if (!this.snapElems || this.snapElems.length === 0) {
						return point;
					}
					// const elem = this.target;
					let snapThreshold = 50,
									closeSnapElems;
					while (snapThreshold < 80 && (!closeSnapElems || closeSnapElems.length > 1)) {
						const newCloseElems = (closeSnapElems ?? [...this.snapElems]).filter((elem) => this.hitTest(elem, `${snapThreshold}%`));
						if (newCloseElems.length === 0) {
							break;
						}
						closeSnapElems = [...newCloseElems];
						snapThreshold += 10;
					}
					if (closeSnapElems && closeSnapElems.includes(this.snapElem)) {
						return point;
					}
					this.hoverAnimation?.reverse();
					if (!closeSnapElems) {
						this.snapElem = null;
						return point;
					}
					[this.snapElem] = closeSnapElems;
					this.hoverAnimation = gsap.to(this.snapElem, {
						onStart() {
							gsap.set(this.snapElem, {zIndex: 1000});
						},
						scale: 2,
						fontFamily: "Komikax, sans-serif",
						color: C.html.colors[$(this.snapElem).hasClass("display") ? this.type : this.dropType],
						opacity: 1,
						ease: "back",
						textShadow: "0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black",
						duration: 0.5
					});
					return point;
				}
			},
			onDragEnd() {
				console.log("DRAG END");
				console.log(`SNAP TARGET: ${this.snapElem?.dataset?.target}`);
				const [dragTrait, dragValue] = [this.target.dataset.target, this.target.dataset.value];
				const [snapTrait, snapValue] = [this.snapElem?.dataset?.target, this.snapElem?.dataset?.value];
				this.disable();
				U.reparent(this.target, this.startParent);
				gsap.to(this.target, {
					scale: 1,
					opacity: 0,
					duration: 0.25,
					ease: "elastic.out",
					callbackScope: this,
					onComplete() {
						gsap.set(`#actor-${sheetContext.actor.id} .draggable`, {x: 0, y: 0});
						this.enable();
						html.find("label.droppable").removeClass("no-hover");
						sheetContext._launchRoll(dragTrait, dragValue, snapTrait, snapValue);
					}
				});
				gsap.to(this.snapElem, {
					y: 0,
					color: C.html.colors.fg,
					textShadow: "none",
					fontSize: 14,
					scale: 1,
					ease: "power4.out",
					duration: 0.25
				});
			}
		});
	}
	// #endregion ▄▄▄▄▄ ACTIVATE LISTENERS ▄▄▄▄▄

	// #region ████████ Trait Radial Menu: Radial Menu for Trait Lines ████████ ~
	_getButtonStates(trait) {
		const [main, opp] = [trait, C.traitPairs[trait]];
		const {min: mainMin, max: mainMax, value: mainVal} = this.actorData.data[main];
		const {min: oppMin, max: oppMax, value: oppVal} = this.actorData.data[opp];
		return [
			{
				name: main,
				min: mainMin,
				max: mainMax,
				value: mainVal,
				add: mainVal < mainMax && (mainVal + oppVal) < 7,
				drop: mainVal > mainMin,
				slide: mainVal < mainMax && oppVal > oppMin
			},
			{
				name: opp,
				min: oppMin,
				max: oppMax,
				value: oppVal,
				add: oppVal < oppMax && (mainVal + oppVal) < 7,
				drop: oppVal > oppMin,
				slide: oppVal < oppMax && mainVal > mainMin
			}
		];
	}
	_updateRadialButtons(trait) {
		trait = C.virtuousTraitPairs[trait] ?? trait;
		const [top, bottom] = this._getButtonStates(trait);
		U.objForEach({
			[`#menu-add-drop-${top.name}`]: {
				"active-add": top.add,
				"active-drop": top.drop
			},
			[`#menu-add-drop-${bottom.name}`]: {
				"active-add": bottom.add,
				"active-drop": bottom.drop
			},
			[`#menu-slide-${top.name}`]: {
				"active-slide-left": top.slide
			},
			[`#menu-slide-${bottom.name}`]: {
				"active-slide-right": bottom.slide
			}
		}, (classes, id) => U.objForEach(
			classes,
			(isActive, className) => {
				if (isActive) {
					$(`#${this.actor.id} ${id}`).addClass(className);
				} else {
					$(`#${this.actor.id} ${id}`).removeClass(className);
				}
			}
		));
	}
	_openRadialMenu(event) {
		event.preventDefault();
		console.log("Open Menu", event);
		const [posElem] = $(event.currentTarget).find(".menu-positioner");
		if ($(posElem).find(".radial-menu").hasClass("active")) {
			return;
		}
		gsap.set(posElem, {xPercent: -50, yPercent: -50, x: event.offsetX, y: event.offsetY});
		$(posElem).find("video").each(function playVideo() { this.play() });
		$(posElem).find(".radial-menu").addClass("active");
	}
	_closeRadialMenu(event) {
		event.preventDefault();
		// console.log("Close Menu", event);
		const [posElem] = $(event.currentTarget).find(".menu-positioner");
		$(posElem).find("video").each(function stopVideo() { this.pause() });
		/*DEVCODE*/if (!CONFIG.BETTERANGELS.keepMenuOpen) { /*!DEVCODE*/
			$(posElem).find(".radial-menu").removeClass("active");
		/*DEVCODE*/ } /*!DEVCODE*/
		setTimeout(() => this.pushUpdates(), 500);
	}
	async _changeTrait(event) {
		event.preventDefault();
		console.log({CHANGETRAIT: event});
		const {clickaction, contextaction, target} = event.target.dataset;
		const {data} = this.actorData;
		const action = {
			click: clickaction,
			contextmenu: contextaction
		}[event.type];
		if (this._getButtonStates(target)[0][action]) {
			switch (action) {
				case "add": {
					const targetVal = Math.min(data[target].max, data[target].value + 1);
					this.updateSync({[`data.${target}.value`]: targetVal});
					this._fillDot(target, targetVal);
					break;
				}
				case "drop": {
					this._emptyDot(target, data[target].value);
					this.updateSync({[`data.${target}.value`]: Math.max(data[target].min, data[target].value - 1)});
					break;
				}
				case "slide": {
					const fromTarget = C.traitPairs[target];
					const targetVal = Math.min(data[target].max, data[target].value + 1);
					this._slideDot(target, targetVal, fromTarget, data[fromTarget].value);
					this.updateSync({
						[`data.${target}.value`]: targetVal,
						[`data.${fromTarget}.value`]: Math.max(data[fromTarget].min, data[fromTarget].value - 1)
					});
					break;
				}
				default: return false;
			}
			this._updateRadialButtons(target);
			return true;
		}
		return false;
	}
	// #endregion ▄▄▄▄▄ Trait Radial Menu ▄▄▄▄▄
	// #region ████████ Dot Animations████████ ~
	_fillDot(trait, dot) {
		const [dotElem] = $(`#actor-${this.actor.id} #${trait}-${dot} > .dot-slot`);
		const timeline = gsap.timeline({
			onStart() {
				$(dotElem).addClass("full top-layer");
			},
			onInterrupt() {
				$(dotElem).addClass("full");
				$(dotElem).removeClass("top-layer");
				gsap.set(dotElem, {clearProps: "all"});
			},
			onComplete() {
				$(dotElem).addClass("full");
				$(dotElem).removeClass("top-layer");
				gsap.set(dotElem, {clearProps: "all"});
			}
		});
		timeline.fromTo(
			dotElem,
			{
				scale: 10,
				opacity: 0
			},
			{
				scale: 1,
				opacity: 1,
				ease: "sine",
				duration: 0.75,
				clearProps: true
			}
		);
	}
	_emptyDot(trait, dot) {
		const [dotElem] = $(`#actor-${this.actor.id} #${trait}-${dot} > .dot-slot`);
		const timeline = gsap.timeline({
			onStart() {
				$(dotElem).addClass("top-layer");
			},
			onInterrupt() {
				$(dotElem).removeClass("full top-layer");
				gsap.set(dotElem, {clearProps: "all"});
			},
			onComplete() {
				$(dotElem).removeClass("full top-layer");
				gsap.set(dotElem, {clearProps: "all"});
			}
		});
		timeline.fromTo(
			dotElem,
			{
				scale: 1,
				opacity: 1
			},
			{
				scale: 10,
				opacity: 0,
				ease: "sine",
				duration: 0.75,
				clearProps: true
			}
		);
	}
	_slideDot(toTrait, toDot, fromTrait, fromDot) {
		const [fromElem] = $(`#actor-${this.actor.id} #${fromTrait}-${fromDot} > .dot-slot`);
		const [toElem] = $(`#actor-${this.actor.id} #${toTrait}-${toDot} > .dot-slot`);
		const [animElem] = $("<span class=\"dot-slot full top-layer\">&nbsp;</span>").appendTo(`#actor-${this.actor.id} #${fromTrait}-${fromDot}`);
		gsap.to(animElem, {
			...U.convertCoords(
				{x: 0, y: 0},
				$(toElem).parent()[0],
				$(fromElem).parent()[0]
			),
			duration: 0.5,
			ease: "slow(0.7, 0.7)",
			onStart() {
				$(fromElem).removeClass("full");
			},
			onInterrupt() {
				$(toElem).addClass("full");
				$(animElem).remove();
			},
			onComplete() {
				$(toElem).addClass("full");
				$(animElem).remove();
			}
		});
		gsap.to(animElem, {
			scale: 5,
			duration: 0.5,
			ease: "slow(0.7, 0.7, true)"
		});
	}
	// #endregion ▄▄▄▄▄ Dot Animations ▄▄▄▄▄
	// #region ████████ Demonic Influence: Animations & Styling ████████ ~
	async _setPrimarySinister(event) {
		const strategy = event.currentTarget.dataset.target;
		await this.actor.update({"data.primaryStrategy": strategy});
	}
	// #endregion ▄▄▄▄▄ Demonic Influence ▄▄▄▄▄

	// #region ████████ Dice Rolling ████████ ~
	async _launchRoll(traitA, valueA, traitB, valueB, advantages = {}) {
		if (traitA === traitB) {
			traitB = false;
		}
		const descParts = [];
		const postParts = [];
		for (const [trait, value] of [[traitA, valueA], [traitB, valueB]]) {
			if (trait) {
				const traitCode = [
					"<span class=\"character\">(</span>",
					`<span class="trait-value">${value}</span>`,
					"<span class=\"character\">)</span>"
				];
				if (C.strategies.includes(trait)) {
					traitCode.unshift(`<span class="trait-name strategy">${U.tCase(trait)}</span>`);
					descParts.unshift(traitCode.join(""));
				} else if (C.tactics.includes(trait)) {
					traitCode.unshift(`<span class="trait-name tactic">${U.tCase(trait)}</span>`);
					descParts.push(traitCode.join(""));
				} else {
					traitCode.unshift(`<span class="trait-name">${U.tCase(trait)}</span>`);
					descParts.push(traitCode.join(""));
				}
			}
		}
		let poolAdvantage = 0, widthAdvantage = 0;

		for (const [advType, {pool, width}] of Object.entries(advantages)) {
			const glyph = `<span class="advantage-glyph">${{
				weapon: "⚔️",
				surprise: "<span style=\"color: #FF0000; font-weight: bold; text-shadow: 0 0 3px black, 0 0 3px black, 0 0 3px black;\">!!</span>",
				secret: "🔍" // 💡
			}[advType]}</span>`;
			if (pool) {
				poolAdvantage += pool;
				descParts.push(`<span class="trait-value">${pool}</span>${glyph}`);
			}
			if (width) {
				widthAdvantage += width;
				postParts.push(`<span class="trait-value">+${width}</span>${glyph}`);
			}
		}
		const poolTotal = U.pInt(valueA) + U.pInt(valueB) + U.pInt(poolAdvantage);
		const descHTML = [
			descParts.join("<span class=\"operator\">+</span>"),
			"<span class=\"operator\">=</span>",
			`<span class="pool-total">${poolTotal}</span>`
		].join("");
		const roll = game.oneRollEngine.createRawRoll(poolTotal);
		const {sets, looseDice, flavorText: descLine} = game.oneRollEngine.parseRawRoll(roll, descHTML);
		const sortedSets = sets.sort((setA, setB) => {
			if (setA.width > setB.width) { return -10 }
			if (setB.width > setA.width) { return 10 }
			return setB.height - setA.height;
		});
		if (sets.length === 0) {
			postParts.length = 0;
		}
		console.log({sets, looseDice, descLine, postParts, advantages});
		const data = {
			content: await renderTemplate("systems/betterangels/hbs/chat/ORE-roll.hbs", {name: this.actor.name, sets: sortedSets, looseDice, descLine, postParts: postParts.join(", ")}),
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			roll,
			flags: {core: {canPopout: true}}
		};
		return ChatMessage.create(data, {});
	}
	// #endregion ▄▄▄▄▄ Dice Rolling ▄▄▄▄▄
}

export const HOOKS = {
	on_preCreateItem: (item, itemData) => {
		const {type} = itemData;
		const {actor} = item;
		const {items} = actor;
		const itemIDs = Array.from(items.values())
			.filter((ownedItem) => ownedItem.type === itemData.type)
			.map((itm) => itm.id);
		const maxNum = {
			power: actor.data.data.isBigDemon ? 3 : 2,
			aspect: 2,
			device: 3
		}[type];
		const toDelete = [];
		while (itemIDs.length >= maxNum) {
			toDelete.push(itemIDs.shift());
		}
		console.log({type, actor, items, itemIDs, maxNum, toDelete});
		if (toDelete.length) {
			actor.deleteEmbeddedDocuments("Item", toDelete);
			// .then(() => actor.sheet.render());
			gsap.delayedCall(0.25, () => actor.sheet.render());
		}
	}
};
