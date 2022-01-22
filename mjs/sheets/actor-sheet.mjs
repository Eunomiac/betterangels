import {
	// #region ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮ ~
	C,
	// #endregion ▮▮▮▮[Constants]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮ ~
	// GreenSock Animation Platform
	gsap,
	Dragger,
	MotionPathPlugin,
	SplitText,
	// #endregion ▮▮▮▮[External Libraries]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮ ~
	U,
	// #endregion ▮▮▮▮[Utility]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Mixins]▮▮▮▮▮▮▮ ~
	MIX,
	UpdateQueue
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
		const context = {...super.getData()};

		this._prepareRootData(context);
		this._prepareItems(context);
		this._prepareCharacterData(context);

		return context;
	}
	_prepareRootData(context) {
		// Assign actor type, actor data and actor flags to top of scope
		Object.assign(context, {
			...context,
			type: context.actor.data.type,
			data: context.actor.data.data,
			flags: context.actor.data.flags
		});
	}
	_prepareCharacterData(context) {
		// Create array of trait pairs for grid creation
		context.data.traitGrid = C.sinister.map((trait) => this._getTraitPairData(trait));
	}
	// #endregion ▮▮▮▮[Data Prep]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Item Prep]▮▮▮▮▮▮▮
	_prepareItems(context) {
		// Separate owned items into categories
		Object.assign(context.data, {
			powers: context.items.filter((item) => item.type === "power").slice(context.data.isBigDemon ? -3 : -2),
			aspects: context.items.filter((item) => item.type === "aspect").slice(-2),
			devices: context.items.filter((item) => item.type === "device").slice(-2)
		});
	}
	// #endregion ▮▮▮▮[Item Prep]▮▮▮▮

	get $() { return $(`#actor-${this.actor.id}`) }

	// #region ████████ 🔴 ACTIVATE LISTENERS ████████ ~
	activateListeners(html) {
		super.activateListeners(html);

		// Attach gsap hover events
		html.find(".trait-label").mouseenter(this._onTraitHover.bind(this));
		html.find(".trait-label").mouseleave(this._offTraitHover.bind(this));

		// Everything below here should only activate if sheet is editable by user
		if (!this.isEditable) { return }

		const sheetContext = this;

		html.find(".trait-cell").contextmenu(this._openRadialMenu.bind(this));
		html.find(".trait-cell").mouseleave(this._closeRadialMenu.bind(this));
		html.find(".trait-button").click(this._changeTrait.bind(this));
		html.find(".trait-button").contextmenu(this._changeTrait.bind(this));

		html.find(".trait-label[data-type=\"strategy\"][data-sub-type=\"sinister\"]").dblclick(this._setPrimarySinister.bind(this));

		html.find(".feature").click((event) => {
			const item = this.actor.items.get(event.currentTarget.dataset.itemId);
			item.sheet.render(true);
		});

		// Create gsap Draggable trait elements
		Dragger.create(this.$.find(".trait-label"), {
			onDragStart() {
				// Assign is-dragging class, remove draggable class
				$(this.target).addClass("is-dragging");

				// Determine trait type and droppable target type
				this.trait = $(this.target).data("trait");
				this.type = $(this.target).data("type");
				[this.homeTarget] = sheetContext.$.find(".trait-label.is-dragging + .trait-label-bg");
				[this.rollTargets, this.nonTargets] = U.partition(
					Array.from(sheetContext.$.find(".trait-draggable:not(.is-dragging)")),
					(elem) => $(elem).data("type") !== this.type
				);
				this.modTargets = Array.from(sheetContext.$.find(".trait-roll-modifier"));
				this.dropTargets = [
					...this.rollTargets,
					this.homeTarget
				];
				console.log({
					DRAGGING: this.target,
					trait: this.trait,
					type: this.type,
					homeTarget: this.homeTarget,
					rollTargets: this.rollTargets,
					nonTargets: this.nonTargets,
					modTargets: this.modTargets,
					dropTargets: this.dropTargets
				});

				// Reset hover-over timeline, then color and expand draggable trait
				sheetContext.hoverTimelines[this.trait]?.seek(0.01)?.reverse();
				this.dragTimeline = gsap.timeline({
					callbackScope: this,
					onReverseComplete() {
						gsap.set(this.target, {clearProps: "transform,color,textShadow"});
						gsap.to(this.target, {opacity: 1, duration: 0.25});
						$(this.target).removeClass("is-dragging");
						this.enable();
					}
				})
					.fromTo(this.target, {
						opacity: 0
					}, {
						color: C.html.colors[this.type],
						opacity: 1,
						textShadow: [
							...[2, 4, 8].map((blur) => `0 0 ${1.5 * blur}px white`),
							...[4, 7, 8, 10, 15].map((blur) => `0 0 ${1.5 * blur}px ${C.html.colors[`${this.type}Bright`]}`)
						].join(", "),
						scale: 2,
						duration: 0.25
					});

				// Enable display of background trait, brighten droppable traits, expand roll modifier targets
				this.dropTimeline = gsap.timeline()
					.fade(this.homeTarget, 0)
					.brighten(this.rollTargets, 0)
					.darken(this.nonTargets, 0);
				// 	.spinOut(this.modTargets, 0)
			},
			onDragEnd() {
				// Temporarily disable this draggable instance while it is repositioned
				this.disable();

				// Find which, if any, roll targets (including home target) it is being dropped on
				let dropThreshold = 0.5, dropTargets;
				const targetReport = {};
				while (dropThreshold >= 0) {
					const validDropTargets = (dropTargets ?? this.dropTargets).filter((elem) => this.hitTest(elem, `${dropThreshold * 100}%`));
					if (validDropTargets.length === 0) { break }
					dropTargets = [...validDropTargets];
					targetReport[`${dropThreshold * 100}% (${dropTargets.length})`] = [...dropTargets];
					if (dropTargets.length === 1) { break }
					dropThreshold -= 0.1;
				}
				const [dropElem] = dropTargets ?? [];
				console.log({
					targetReport,
					dropElem
				});
				if (dropElem) {
					console.log(`Dropped on ${dropElem.dataset?.trait?.toUpperCase()}`);
				} else {
					console.log("Dropped on NO TARGET");
				}

				// Fade the dragged trait to hidden, then reset its position and fade it back in while reversing the trait timeline
				this.dragTimeline?.reverse();
				this.dropTimeline?.reverse();
			}
		});
	}
	// #endregion ▄▄▄▄▄ ACTIVATE LISTENERS ▄▄▄▄▄

	// #region ████████ 🔴 RENDER ████████ ~
	render(...args) {
		// Clear saved gsap animations so they can be recreated after sheet re-rendered
		delete this._hoverTimelines;
		delete this._dragTimelines;
		super.render(...args);
	}
	// #endregion ▄▄▄▄▄ RENDER ▄▄▄▄▄

	// #region ████████ GSAP Effects ████████ ~
	get hoverTimelines() { return (this._hoverTimelines = this._hoverTimelines ?? {}) }
	get dragHoverTimelines() { return (this._dragHoverTimelines = this._dragHoverTimelines ?? {}) }
	get isDraggingTrait() { return Boolean(this.$.find(".is-dragging")[0]) }

	_onTraitHover({currentTarget}) {
		const trait = $(currentTarget).data("trait");
		if (this.isDraggingTrait) {
			if (!(trait in this.dragHoverTimelines)) {
				const isStrategy = C.strategies.includes(trait);
				this.dragHoverTimelines[trait] = gsap.timeline({paused: true})
					.to(currentTarget, {
						scale: 1.5,
						textShadow: [
							...[2, 4/* , 8 */].map((blur) => `0 0 ${1.5 * blur}px white`),
							...[4, 7, 8, 10/* , 15 */].map((blur) => `0 0 ${1.5 * blur}px gold`)
						].join(", "),
						color: "gold",
						duration: 0.15,
						ease: "sine.out"
					}, 0);
			}
			this.dragHoverTimelines[trait].play();
		} else {
			if (!(trait in this.hoverTimelines)) {
				const isStrategy = C.strategies.includes(trait);
				this.hoverTimelines[trait] = gsap.timeline({paused: true})
					.to(currentTarget, {
						scale: 1.25,
						textShadow: [
							...[2, 4/* , 8 */].map((blur) => `0 0 ${1.5 * blur}px white`),
							...[4, 7, 8, 10/* , 15 */].map((blur) => `0 0 ${1.5 * blur}px ${C.html.colors[isStrategy ? "strategyBright" : "tacticBright"]}`)
						].join(", "),
						color: C.html.colors[isStrategy ? "strategyDark" : "tacticDark"],
						duration: 0.15,
						ease: "sine.out"
					}, 0);
			}
			this.hoverTimelines[trait].play();
		}
	}

	_offTraitHover({currentTarget}) {
		const trait = $(currentTarget).data("trait");
		if (this.isDraggingTrait) {
			this.dragHoverTimelines[trait]?.reverse();
		}
		this.hoverTimelines[trait]?.reverse();
	}
	// #endregion ▄▄▄▄▄ GSAP Effects ▄▄▄▄▄
	// #region ████████ Trait Radial Menu: Radial Menu for Trait Lines ████████ ~
	_getTraitPairData(trait) {
		const [tNameA, tNameB] = [trait, C.traitPairs[trait]];
		const {data} = this.actorData;
		const [dataA, dataB] = [data[tNameA], data[tNameB]];
		const dataSet = [
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
				isPrimary: tNameA === data.primaryStrategy,
				radialSize: C.menuRadius[C.strategies.includes(tNameA) ? "strategy" : "tactic"]
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
				isPrimary: tNameB === data.primaryStrategy,
				radialSize: C.menuRadius[C.strategies.includes(tNameA) ? "strategy" : "tactic"]
			}
		];
		if (C.virtuous.includes(trait)) {
			dataSet.reverse();
		}
		return dataSet;
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
			"button.button-top.button-add-drop": {
				"active-add": top.canAdd,
				"active-drop": top.canDrop
			},
			"button.button-bottom.button-add-drop": {
				"active-add": bottom.canDdd,
				"active-drop": bottom.canDrop
			},
			"button.button-top.button-slide-left": {
				"active-slide-left": top.canSlideTo
			},
			"button.button-bottom.button-slide-right": {
				"active-slide-right": bottom.canSlideTo
			}
		}, (classes, selector) => U.objForEach(
			classes,
			(isActive, className) => {
				const elem$ = $(`#actor-${this.actor.id} .radial-menu .menu-container .menu-button ${selector}`);
				if (isActive) {
					elem$.addClass(className);
				} else {
					elem$.removeClass(className);
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
		/*DEVCODE*/
		if (!CONFIG.BETTERANGELS.keepMenuOpen) { /*!DEVCODE*/
			$(posElem).find(".radial-menu").removeClass("active");
			/*DEVCODE*/
		} /*!DEVCODE*/
		setTimeout(() => this.pushUpdates(), 500);
	}
	async _changeTrait(event) {
		event.preventDefault();
		const {clickaction, contextaction, target} = event.target.dataset;
		const {data} = this.actorData;
		const [traitData] = this._getTraitPairData(target);
		const action = {
			click: clickaction,
			contextmenu: contextaction
		}[event.type];
		console.log({CHANGETRAIT: event, clickaction, contextaction, target, data, action, traitData});
		switch (action) {
			case "add": {
				if (traitData.canAdd) {
					const targetVal = Math.min(traitData.max, traitData.max + 1);
					this.updateSync({
						[`data.${target}.value`]: targetVal});
					this._fillDot(target, targetVal);
				}
				break;
			}
			case "drop": {
				if (traitData.canDrop) {
					this._emptyDot(target, data[target].value);
					this.updateSync({
						[`data.${target}.value`]: Math.max(data[target].min, data[target].value - 1)});
				}
				break;
			}
			case "slide": {
				if (traitData.canSlideTo) {
					const fromTarget = C.traitPairs[target];
					const targetVal = Math.min(data[target].max, data[target].value + 1);
					this._slideDot(target, targetVal, fromTarget, data[fromTarget].value);
					this.updateSync({
						[`data.${target}.value`]: targetVal,
						[`data.${fromTarget}.value`]: Math.max(data[fromTarget].min, data[fromTarget].value - 1)
					});
				}
				break;
			}
			default: return false;
		}
		this._updateRadialButtons(target);
		return true;
	}
	// #endregion ▄▄▄▄▄ Trait Radial Menu ▄▄▄▄▄
	// #region ████████ Dot Animations ████████ ~

	_createAddDropDot(trait, dot) {
		const dot$ = $(`#actor-${this.actor.id} .dot-line > #${trait}-${dot}`);
		const cell$ = dot$.parents(".trait-cell");
		const anim$ = dot$.clone().css({background: "cyan"}).appendTo(cell$);
		const animPos = U.getPos(dot$, cell$);
		gsap.set(U.getElem(anim$), {
			position: "absolute",
			xPercent: -50,
			yPercent: -50,
			height: U.get(dot$, "height"),
			width: U.get(dot$, "width"),
			x: animPos.x,
			y: animPos.y,
			zIndex: 100
		});

		// FORWARD: big, invisible, empty --> normal size, so FROM tween.
		anim$.data("addDropTimeline", gsap.timeline({
			onComplete() {
				dot$.addClass("full");
				anim$.remove();
			},
			onReverseComplete() {
				dot$.removeClass("full");
				anim$.remove();
			},
			paused: true
		}).from(anim$, {
			scale: 10,
			autoAlpha: 0,
			ease: "sine",
			duration: 0.75
		}, 0));

		return anim$;
	}
	_fillDot(trait, dot) {
		console.log(`Filling ${trait}-${dot}`);
		const dot$ = $(`#actor-${this.actor.id} .dot-line.${C.sinister.includes(trait) ? "sinister" : "virtuous"} #${trait}-${dot}`);
		const cell$ = dot$.parents(".trait-cell");
		let anim$ = $(`#actor-${this.actor.id} .trait-cell > #${trait}-${dot}`);
		console.log({dot: dot$[0], cell: cell$[0], anim: anim$[0]});
		console.log({dot: dot$[0]?.id, cell: cell$[0]?.id, anim: anim$[0]?.id});
		if (anim$) {
			if (anim$.data("addDropTimeline")) {
				anim$.data("addDropTimeline").play();
			} else if (anim$.data("slideTimeline")) {
				anim$.data("slideTimeline").reverse().then(() => this._fillDot(trait, dot));
			}
		} else {
			anim$ = this._createAddDropDot(trait, dot);
			anim$.data("addDropTimeline").play();
		}
	}
	_emptyDot(trait, dot) {
		const dot$ = $(`#actor-${this.actor.id} .dot-line > #${trait}-${dot}`);
		const cell$ = dot$.parents(".trait-cell");
		let anim$ = $(`#actor-${this.actor.id} .trait-cell > #${trait}-${dot}`);
		console.log({dot$, cell$, anim$});
		if (anim$) {
			if (anim$.data("addDropTimeline")) {
				dot$.removeClass("full");
				anim$.data("addDropTimeline").reverse();
			} else if (anim$.data("slideTimeline")) {
				anim$.data("slideTimeline").reverse().then(() => this._emptyDot(trait, dot));
			}
		} else {
			anim$ = this._createAddDropDot(trait, dot);
			dot$.removeClass("full");
			anim$.data("timeline").reverse(0);
		}
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
	// #endregion ▄▄▄▄▄ Dot Animations ▄▄▄▄▄
	// #region ████████ Demonic Influence: Animations & Styling ████████ ~
	async _setPrimarySinister(event) {
		const strategy = event.currentTarget.dataset.trait;
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
			content: await renderTemplate("systems/betterangels/hbs/chat/ORE-roll.hbs", {name: this.actor.name, sets: sortedSets, looseDice, descLine, postParts: postParts.join(", ")}),
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			roll,
			flags: {core: {canPopout: true}}
		};
		return ChatMessage.create(data, {});
	}
}
// #endregion ▄▄▄▄▄ Dice Rolling ▄▄▄▄▄

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
export const EFFECTS = [
	{
		name: "fade",
		effect: (targets, config) => gsap.to(targets, {
			autoAlpha: 1,
			duration: config.duration,
			onReverseComplete() { gsap.set(this.targets, {clearProps: "transform"}) }
		}),
		defaults: {duration: 0.25},
		extendTimeline: true
	},
	{
		name: "brighten",
		effect: (targets, config) => gsap.to(targets, {
			color: C.html.colors.fgBright,
			scale: 1.25,
			duration: config.duration,
			onReverseComplete() { gsap.set(this.targets, {clearProps: "transform"}) }
		}),
		defaults: {duration: 0.25},
		extendTimeline: true
	},
	{
		name: "darken",
		effect: (targets, config) => gsap.to(targets, {
			opacity: 0.25,
			duration: config.duration,
			onReverseComplete() { gsap.set(this.targets, {clearProps: "transform"}) }
		}),
		defaults: {duration: 0.25},
		extendTimeline: true
	}
];