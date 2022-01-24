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
	SplitText,
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
	// ▮▮▮▮▮▮▮[Item Prep]▮▮▮▮▮▮▮
	_prepareItems(context) {
		// Separate owned items into categories
		Object.assign(context.data, {
			powers: context.items.filter((item) => item.type === "power").slice(context.data.isBigDemon ? -3 : -2),
			aspects: context.items.filter((item) => item.type === "aspect").slice(-2),
			devices: context.items.filter((item) => item.type === "device").slice(-2)
		});
	}

	get $() { return $(`#actor-${this.actor.id}`) }
	get isDraggingTrait() { return Boolean(this.$.find(".is-dragging")[0]) }

	// ████████ 🔴 ACTIVATE LISTENERS ████████
	activateListeners(html) {
		super.activateListeners(html);

		const testTrait$ = this.$.find(".trait-label[data-trait=\"cunning\"]");
		testTrait$.find(".roll-desc")[0].innerText = "CUNNING + Espionage + 3✒️ + 2⚔️ = 10";
		testTrait$.find(".to-width-advantages .to-width-label")[0].innerText = "To Width:";
		testTrait$.find(".to-width-advantages .general")[0].innerText = "💡";
		testTrait$.find(".to-width-advantages .weapon")[0].innerText = "⚔️";
		testTrait$.find(".to-width-advantages .surprise")[0].innerText = "";
		testTrait$.find(".to-width-advantages .secret")[0].innerText = "";

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

		html.find(".hover-target video").on("ended", ({currentTarget}) => { currentTarget.currentTime = 0 });

		html.find(".feature").click((event) => {
			const item = this.actor.items.get(event.currentTarget.dataset.itemId);
			item.sheet.render(true);
		});

		// Create gsap Draggable trait elements
		Dragger.create(this.$.find(".trait-label"), {
			onDragStartParams: [this],
			onDragStart(actorSheet) {
				// Assign is-dragging class
				$(this.target).addClass("is-dragging");

				// Determine trait, trait type, and droppable target type
				this.trait = $(this.target).data("trait");
				this.type = $(this.target).data("type");
				this.dropType = this.type === "strategy" ? "tactic" : "strategy";

				// Assemble home element, potential drop targets, and modifier targets
				[this.homeTarget] = actorSheet.$.find(".trait-label.is-dragging + .trait-label-bg");
				[this.rollTargets, this.nonTargets] = U.partition(
					Array.from(actorSheet.$.find(".trait-draggable:not(.is-dragging)")),
					(elem) => $(elem).data("type") !== this.type
				);
				[this.readyRollovers, this.unassignedRollovers] = U.partition(
					Array.from(actorSheet.$.find(".roll-over-mod")),
					(elem) => $(elem).data("action")
				);

				this.modTargets = [
					...this.readyRollovers,
					...this.unassignedRollovers
				];
				this.dropTargets = [
					...this.rollTargets,
					this.homeTarget
				];
				this.hoverTargets = [
					...this.dropTargets,
					...this.modTargets
				];

				console.log({
					homeTarget: this.homeTarget,
					rollTargets: this.rollTargets,
					dropTargets: this.dropTargets,
					hoverTargets: this.hoverTargets
				});

				// Tween draggable element to "dragging"
				actorSheet.playTimelineTo(this.target, "dragging", {duration: 0.5, ease: "elastic"});

				// Tween drop target elements to "bright"
				actorSheet.playTimelineTo(this.rollTargets, "bright", {duration: 1, ease: "sine", stagger: 1});

				// Tween invalid target elements to "faded"
				actorSheet.playTimelineTo(this.nonTargets, "faded", {duration: 1, ease: "sine", stagger: 1});

				// Tween ready rollover targets to "assigned"
				// actorSheet.playTimelineTo(this.readyRollovers, "assigned", {duration: 1, stagger: 2, staggerFrom: "start"});

				// Tween assignable rollover targets to "visible"
				// actorSheet.playTimelineTo(this.unassignedRollovers, "visible", {duration: 1, stagger: 2, staggerFrom: "start"});
			},
			onDragParams: [this],
			onDrag(actorSheet) {
				// Check for a drop target and fire its droppable timeline
				const dropTarget = actorSheet.getDropElem(this);
				if (dropTarget !== this.dropTarget) {
					actorSheet.setDroppable(dropTarget, this.dropTarget);
					this.dropTarget = dropTarget;
				}

				// Check for a mod target and initiate its charge-up timeline
				const modTarget = actorSheet.getModElem(this);
				if (modTarget !== this.modTarget) {
					actorSheet.setModTarget(modTarget, this.modTarget);
					this.modTarget = modTarget;
				}
			},
			onDragEndParams: [this],
			onDragEnd(actorSheet) {
				// Temporarily disable this draggable instance while it is repositioned
				this.disable();

				if (this.dropTarget) {
					this.dropTargets = this.dropTargets.filter((elem) => elem !== this.dropTarget);
					console.log(`Dropped on ${this.dropTarget.dataset?.trait?.toUpperCase()}`);
				} else {
					console.log("Dropped on NO TARGET");
				}

				// Tween unused drop targets and non-targets to "base"
				actorSheet.playTimelineTo([...this.dropTargets, ...this.nonTargets], "base", {duration: 0.5, ease: "sine", stagger: 5});

				// Tween drop target into roll animation
				actorSheet.playTimelineTo(this.dropTarget, "base", {duration: 5});

				// Fade-explode draggable item to opacity 0, set position to 0, set timeline position to base, fade in
				actorSheet.playTimelineTo(this.target, "hoverOver", {duration: 1.5, ease: "power2"})
					.then(() => {
						actorSheet.playTimelineTo(this.target, "base", {duration: 0});
						gsap.set(this.target, {x: 0, y: 0});
						$(this.target).removeClass("is-dragging");
						this.enable();
					});

				// Tween mod targets to "hidden"
				// actorSheet.playTimelineTo(this.modTargets, "hidden", {duration: 1, stagger: 2, staggerFrom: "start"});
			}
		});
	}

	// ████████ 🔴 RENDER ████████
	render(...args) {
		// Clear saved gsap animations so they can be recreated after sheet re-rendered
		delete this._hoverTimelines;
		delete this._dragTimelines;
		super.render(...args);
	}

	// ████████ GSAP Timelines ████████
	get TIMELINES() {
		if (!this._TIMELINES) {
			this._TIMELINES = new Map();
			this.$.find(".trait-draggable").each((i, elem) => {
				this._TIMELINES.set(elem, this.makeTraitTimeline(elem));
			});
			this.$.find(".hover-target").each((i, elem) => {
				this._TIMELINES.set(elem, this.makeModTimeline(elem));
			});
		}
		return this._TIMELINES;
	}
	getTimeline(elemRef) { return this.TIMELINES.get(U.getElem(elemRef)) }
	getTimelines(elemsRef) { return U.getElems(elemsRef).map((elem) => this.TIMELINES.get(elem)) }

	makeTraitTimeline(traitElem) {
		const trait = $(traitElem).data("trait");
		const type = $(traitElem).data("type");
		return gsap.timeline({paused: true, defaults: {ease: "none"}})
			.addLabel("faded", 0)
			.fromTo(traitElem, {
				autoAlpha: 0.25,
				color: C.html.colors.fg,
				scale: 1,
				textShadow: C.html.shadows.traitShadow
			}, {
				autoAlpha: 1
			})
			.addLabel("base")
			.to(traitElem, {
				color: C.html.colors.fgBright,
				scale: 1.15
			})
			.addLabel("bright")
			.to(traitElem, {
				color: C.html.colors[`${type}Dark`],
				scale: 1.25,
				textShadow: C.html.shadows[`${type}Hover`]
			})
			.addLabel("hoverOver")
			.to(traitElem, {
				color: C.html.colors.gold,
				scale: 1.5,
				textShadow: C.html.shadows.dropTarget
			})
			.addLabel("dropTarget")
			.to(traitElem, {
				color: C.html.colors[type],
				scale: 2
			})
			.addLabel("dragging")
			.seek("base");
	}

	makeModTimeline(modElem) {
		const modElem$ = $(modElem);
		const action = modElem$.data("action");
		const type = modElem$.data("type");
		const [iconElem] = modElem$.find(".target-icon");
		const [labelElem] = modElem$.find(".target-label");
		const [videoElem] = modElem$.find("video");
		const [triggerAnimElem] = modElem$.find(".target-trigger-anim");

		return gsap.timeline(({paused: true, defaults: {ease: "none"}}))
			.to([modElem, iconElem, labelElem, videoElem, triggerAnimElem], {
				autoAlpha: 0,
				scale: 0,
				duration: 0,
				textShadow: 0,
				outline: 0
			})
			.addLabel("hidden")
			.to([modElem, iconElem, videoElem], {
				autoAlpha: 0.75,
				scale: 0.8,
				stagger: 0.25
			}, ">")
			.to(labelElem, {
				autoAlpha: 1,
				scale: 1,
				delay: 0.5,
				textShadow: C.html.shadows[`${action}HoverTrigger`]
			}, "<")
			.addLabel("visible")
			.to([modElem, iconElem, videoElem], {
				autoAlpha: 1,
				scale: 1
			})
			.to(labelElem, {
				keyframes: {
					scale: [1, 1.25, 1, 1, 1, 1],
					outline: [0, 0, `3px solid ${C.html.colors[`${action}HoverTrigger`]}`]
				}
			}, "<")
			.addLabel("startCycle")
			.call(() => {
				videoElem.currentTime = 0;
				videoElem.play();
			})
			.to(iconElem, {
				keyframes: {
					scale: [1, 1.25, 1, 0.75, 1],
					ease: "sine.inOut"
				},
				duration: videoElem.duration
			}, "<")
			.to(triggerAnimElem, {
				autoAlpha: 0.75,
				scale: 1,
				ease: "power2.in",
				duration: videoElem.duration
			}, "<")
			.call(() => {
				this.onHoverTrigger(action, type);
			})
			.to(videoElem, {
				autoAlpha: 0,
				duration: 0.25
			})
			.to(triggerAnimElem, {
				keyframes: {
					autoAlpha: [0.75, 1, 0, 0, 0],
					scale: [1, 10],
					ease: "power4.out"
				},
				duration: 0.25
			}, "<")
			.to(triggerAnimElem, {
				scale: 1,
				duration: 0,
				onCompleteParams: [this],
				onComplete(actorSheet) {
					actorSheet.playTimelineTo(modElem, "endCycle", {from: "startCycle", maxDuration: 20});
				}
			}) // Check how onComplete and .call() work with your CodePen timeline label tester
			.addLabel("endCycle")
			.seek("hidden");
	}

	playTimelineTo(tlRef, label, {from, minDuration = 0, maxDuration = 0.5, duration, ease, stagger = 0, staggerFrom = "random"} = {}) {
		const timelines = this.getTimelines(tlRef)
			.map((timeline) => {
				if (timeline) {
					const thisTween = from
						? timeline.tweenFromTo(from, label, ease ? {ease, paused: true} : {paused: true})
						: timeline.tweenTo(label, ease ? {ease, paused: true} : {paused: true});
					const tweenDur = thisTween.duration();
					const targetDuration = duration ?? Math.max(Math.min(tweenDur, maxDuration), minDuration);
					const tlReport = {
						[`${tlRef}`]: label,
						params: {minDuration, maxDuration, duration, ease, stagger, staggerFrom},
						duration: {initialTweenDur: tweenDur, targetDuration}
					};
					if (parseFloat(targetDuration) !== parseFloat(tweenDur)) {
						thisTween.timeScale(tweenDur / targetDuration);
					}
					tlReport.duration.finalDuration = thisTween.duration();
					// console.log(tlReport);
					return thisTween;
				}
				return false;
			})
			.filter((timeline) => Boolean(timeline));
		if (timelines.length === 0) {
			return [];
		}
		if (timelines.length === 1) {
			return timelines[0].delay(0).play();
		}
		if (stagger > 0) {
			const distributer = gsap.utils.distribute({amount: stagger, from: staggerFrom});
			return timelines.map((timeline, i, arr) => timeline.delay(distributer(i, arr[i], arr)).play());
		}
		return timelines.map((timeline) => timeline.delay(0).play());
	}

	_onTraitHover({currentTarget}) {
		if (!this.isDraggingTrait) {
			this.playTimelineTo(currentTarget, "hoverOver", {from: "bright", duration: 0.25, ease: "power2.out"});
		}
	}
	_offTraitHover({currentTarget}) {
		if (!this.isDraggingTrait) {
			this.playTimelineTo(currentTarget, "base", {duration: 0.25, ease: "power2.in"});
		}
	}

	getDropElem(dragger) {
		const isOverElement = (threshold) => (elem) => dragger.hitTest(elem, `${threshold}%`);
		let [validTargets] = U.partition(dragger.dropTargets, isOverElement(50)),
						invalidTargets;
		for (let threshold = 40; threshold >= 0; threshold -= 10) {
			if (validTargets.length <= 1) { break }
			[validTargets, invalidTargets] = U.partition(validTargets, isOverElement(threshold));
		}
		return [...validTargets, ...invalidTargets ?? []].shift();
	}
	setDroppable(newTarget, oldTarget) {
		[newTarget, oldTarget] = U.getElems(newTarget, oldTarget);
		if (oldTarget && !$(oldTarget).hasClass("trait-label-bg")) {
			this.playTimelineTo(oldTarget, "bright");
		}
		if (newTarget && !$(newTarget).hasClass("trait-label-bg")) {
			this.playTimelineTo(newTarget, "dropTarget", {duration: 0.25});
		}
	}
	getModElem(dragger) {
		const isOverElement = (threshold) => (elem) => dragger.hitTest(elem, `${threshold}%`);
		let [validTargets] = U.partition(dragger.modTargets, isOverElement(50)),
						invalidTargets;
		for (let threshold = 40; threshold >= 0; threshold -= 10) {
			if (validTargets.length <= 1) { break }
			[validTargets, invalidTargets] = U.partition(validTargets, isOverElement(threshold));
		}
		return [...validTargets, ...invalidTargets ?? []].shift();
	}
	setModTarget(newTarget, oldTarget) {
		[newTarget, oldTarget] = U.getElems(newTarget, oldTarget);
		if (oldTarget) {
			this.playTimelineTo(oldTarget, "visible");
		}
		if (newTarget) {
			this.playTimelineTo(newTarget, "startCycle", {maxDuration: 0.25})
				.then(() => this.playTimelineTo(newTarget, "endCycle", {maxDuration: 20}));
		}
	}
	// ████████ Trait Radial Menu: Radial Menu for Trait Lines ████████
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

			$(posElem).find(".radial-menu").removeClass("active");

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
	// ████████ Dot Animations ████████

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
	// ████████ Demonic Influence: Animations & Styling ████████
	async _setPrimarySinister(event) {
		const strategy = event.currentTarget.dataset.trait;
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