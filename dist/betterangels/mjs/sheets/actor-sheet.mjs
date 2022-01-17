/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌█████████████████████ MIT License █ v0.0.1-prealpha █  ████████████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

import {
	// ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮
	C,
	// ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮
	// GreenSock Animation Platform
	gsap,
	Dragger,
	MotionPathPlugin,
	// ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮
	U,
	// ▮▮▮▮▮▮▮[Mixins]▮▮▮▮▮▮▮
	MIX,
	UpdateQueue
} from "../helpers/bundler.mjs";

export default class extends MIX(ActorSheet).with(UpdateQueue) {
	// ▮▮▮▮▮▮▮[Defaults, Template]▮▮▮▮▮▮▮
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["betterangels", "sheet", "actor"],
			template: "systems/betterangels/hbs/actor/actor-sheet.html",
			width: 476,
			height: 786,
			tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "front"}]
		});
	}

	get template() { return `systems/betterangels/hbs/actor/actor-${this.actor.data.type}-sheet.html` }
	// ▮▮▮▮▮▮▮[Data Prep]▮▮▮▮▮▮▮
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

		// Create array of trait pairs for grid creation
		const sinisterTraits = ["greed", "cunning", "espionage", "cruelty", "sly", "contempt", "corruption", "devious", "deceit"];
		context.data.traitGrid = sinisterTraits.map((trait) => this._getTraitPairData(trait));

	}
	// ▮▮▮▮▮▮▮[Item Prep]▮▮▮▮▮▮▮
	_prepareItems(context) {
		console.log({CONTEXT: context, ITEMS: context.items});
		Object.assign(context.data, {
			powers: context.items.filter((item) => item.type === "power").slice(context.data.isBigDemon ? -3 : -2),
			aspects: context.items.filter((item) => item.type === "aspect").slice(-2),
			devices: context.items.filter((item) => item.type === "device").slice(-2)
		});
	}

	// ████████ 🔴🟠🟡 ACTIVATE LISTENERS 🟡🟠🔴 ████████
	activateListeners(html) {
		super.activateListeners(html);

		window.html = html;
		window.sheet = this;

		// Construct dynamic DOM elements

		html.find(".trait-name").each((i, traitElem) => {
			const label$ = $(traitElem).find(".trait-label");
			const dragger$ = $(`<div class="trait-dragger" 
							data-trait="${traitElem.dataset.trait}"
							data-value="${traitElem.dataset.value}"
							data-type="${traitElem.dataset.type}"
							data-sub-type="${traitElem.dataset.subType}"
				>`).appendTo(traitElem);
			const display$ = $("<div class=\"trait-big-display\"></div>")
				.appendTo(dragger$);
			gsap.set([label$, dragger$, display$], {
				position: "absolute",
				display: "block",
				xPercent: -50,
				yPercent: -50,
				height: gsap.getProperty(traitElem, "height"),
				width: gsap.getProperty(traitElem, "width"),
				x: 0.5 * U.get(traitElem, "width"),
				y: 0.5 * U.get(traitElem, "height"),
				transformOrigin: "50% 50%"
			});
			gsap.set(display$, {
				height: 5 * gsap.getProperty(traitElem, "height"),
				width: 2 * gsap.getProperty(traitElem, "width"),
				pointerEvents: "none"
			});
			gsap.set(dragger$, {
				width: 0.8 * gsap.getProperty(traitElem, "width"),
				x: `${dragger$.data("subType") === "sinister" ? "-" : "+"}=${0.1 * gsap.getProperty(traitElem, "width")}`,
				pointerEvents: "all"
			});

			const labelPos = {x: gsap.getProperty(label$[0], "x"), y: gsap.getProperty(label$[0], "y")};
			const newPos = U.getNewPos(label$, display$);
			console.log({labelPos, newPos, label: label$[0], display: display$[0]});
	// 	<div class="trait-big-display"></div> {{!-- Much bigger, the frame in which animations play while dragging --}}
	// </div>`
		})

		if (!this.isEditable) { return }

		const sheetContext = this;

		html.find(".radial-hover").contextmenu(this._openRadialMenu.bind(this));
		html.find(".radial-hover").mouseleave(this._closeRadialMenu.bind(this));

		html.find(".trait-button").click(this._changeTrait.bind(this));
		html.find(".trait-button").contextmenu(this._changeTrait.bind(this));

		html.find(".feature").css({pointerEvents: "all"}).click((event) => {
			const item = this.actor.items.get(event.currentTarget.dataset.itemId);
			item.sheet.render(true);
		});

		// <span class="draggable trait {{type}}" data-type="{{type}}" data-target="{{top}}" data-value={{lookup (lookup data top) "value"}}>{{case "title" top}}</span>

		html.find(".trait-pair.strategy label.sinister .draggable").dblclick(this._setPrimarySinister.bind(this));

		html.find(".trait-pair .virtuous").each((_, label) => {
			$(label)
				.find(".trait.draggable")
				.each((__, span) => U.set([span, $(span).prev()], {x: U.get(label, "width") - (1.1 * U.get(span, "width"))}));
		});

		// Generate drag entities for each trait

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
					fontFamily: "KomikaAxis, sans-serif",
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
						fontFamily: "KomikaAxis, sans-serif",
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

	// ████████ Trait Radial Menu: Radial Menu for Trait Lines ████████
	_getTraitPairData(trait) {
		const [tNameA, tNameB] = [trait, C.traitPairs[trait]];
		const {data} = this.actorData;
		const [dataA, dataB] = [data[tNameA], data[tNameB]];
		return [
			{
				name: tNameA,
				displayName: U.tCase(tNameA),
				type: C.strategies.includes(tNameA) ? "strategy" : "tactic",
				subType: "sinister",
				...dataA,
				canSlideTo: dataA.value < dataA.max && dataB.value > dataB.min,
				canAdd: dataA.value < dataA.max && (dataA.value + dataB.value) < 7,
				canDrop: dataA.value > dataA.min,
				emptyDots: dataA.max - dataA.value,
				isPrimary: tNameA === data.primaryStrategy
			},
			{
				name: tNameB,
				displayName: U.tCase(tNameB),
				type: C.strategies.includes(tNameB) ? "strategy" : "tactic",
				subType: "virtuous",
				...dataB,
				canSlideTo: dataB.value < dataB.max && dataA.value > dataA.min,
				canAdd: dataB.value < dataB.max && (dataB.value + dataA.value) < 7,
				canDrop: dataB.value > dataB.min,
				emptyDots: dataB.max - dataB.value,
				isPrimary: tNameB === data.primaryStrategy
			}
		];
	}

		/* const {min: mainMin, max: mainMax, value: mainVal} = this.actorData.data[tNameA];
		const {min: oppMin, max: oppMax, value: oppVal} = this.actorData.data[tNameB];
		return [
			{
				name: tNameA,
				...data[tNameA],
				canSlideTo: 
			}
			
			{
			name: tNameA,
			min: mainMin,
			max: mainMax,
			value: mainVal,

			slide: mainVal < mainMax && oppVal > oppMin
		},
										{
											name: tNameB,
											min: oppMin,
											max: oppMax,
											value: oppVal,
											add: oppVal < oppMax && (mainVal + oppVal) < 7,
											drop: oppVal > oppMin,
											slide: oppVal < oppMax && mainVal > mainMin
										}
		];
	} */
	_updateRadialButtons(trait) {
		trait = C.virtuousTraitPairs[trait] ?? trait;
		const [top, bottom] = this._getTraitPairData(trait);
		U.objForEach({
			[`#menu-add-drop-${top.name}`]: {
				"active-add": top.canAdd,
				"active-drop": top.canDrop
			},
			[`#menu-add-drop-${bottom.name}`]: {
				"active-add": bottom.canDdd,
				"active-drop": bottom.canDrop
			},
			[`#menu-slide-${top.name}`]: {
				"active-slide-left": top.canSlideTo
			},
			[`#menu-slide-${bottom.name}`]: {
				"active-slide-right": bottom.canSlideTo
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

			$(posElem).find(".radial-menu").removeClass("active");

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
		if (this._getTraitPairData(target)[0][action]) {
			switch (action) {
				case "add":
				{
					const targetVal = Math.min(data[target].max, data[target].value + 1);
					this.updateSync({
						[`data.${target}.value`]: targetVal});
					this._fillDot(target, targetVal);
					break;
				}
				case "drop":
				{
					this._emptyDot(target, data[target].value);
					this.updateSync({
						[`data.${target}.value`]: Math.max(data[target].min, data[target].value - 1)});
					break;
				}
				case "slide":
				{
					const fromTarget = C.traitPairs[target];
					const targetVal = Math.min(data[target].max, data[target].value + 1);
					this._slideDot(target, targetVal, fromTarget, data[fromTarget].value);
					this.updateSync({
						[`data.${target}.value`]: targetVal,
						[`data.${fromTarget}.value`]: Math.max(data[fromTarget].min, data[fromTarget].value - 1)
					});
					break;
				}
				default:
					return false;
			}
			this._updateRadialButtons(target);
			return true;
		}
		return false;
	}
	// ████████ Dot Animations████████
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
			dotElem, {
				scale: 10,
				opacity: 0
			}, {
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
			dotElem, {
				scale: 1,
				opacity: 1
			}, {
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
			...U.convertCoords({x: 0, y: 0},
																						$(toElem).parent()[0],
																						$(fromElem).parent()[0]),
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
	// ████████ Demonic Influence: Animations & Styling ████████
	async _setPrimarySinister(event) {
		const strategy = event.currentTarget.dataset.target;
		await this.actor.update({"data.primaryStrategy": strategy});
	}

	// ████████ Dice Rolling ████████
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
		let poolAdvantage = 0,
						widthAdvantage = 0;

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
			content: await renderTemplate("systems/betterangels/hbs/chat/ORE-roll.html", {name: this.actor.name, sets: sortedSets, looseDice, descLine, postParts: postParts.join(", ")}),
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			roll,
			flags: {core: {canPopout: true}}
		};
		return ChatMessage.create(data, {});
	}
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