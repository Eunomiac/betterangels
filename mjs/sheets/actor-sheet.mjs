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

	// #region ████████ Trait Radial Menu: Radial Menu for Trait Lines ████████ ~
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
	// #endregion ▄▄▄▄▄ Trait Radial Menu ▄▄▄▄▄

	/* <script>
  // Show loading animation.
  var playPromise = video.play();

  if (playPromise !== undefined) {
    playPromise.then(_ => {
      // Automatic playback started!
      // Show playing UI.
    })
    .catch(error => {
      // Auto-play was prevented
      // Show paused UI.
    });
  }
</script>

Danger zone
<source> within <video> makes play() promise never rejects
For <video src="not-existing-video.mp4"\>, the play() promise
rejects as expected as the video doesn't exist. For
<video><source src="not-existing-video.mp4" type='video/mp4'></video>,
 the play() promise never rejects. It only happens if there are no valid sources. */

	_onVideoHover(event) {
		event.preventDefault();
		// console.log("Play Label Video", event);
		console.log({PLAY: event.currentTarget});
		const [videoElem] = $(event.currentTarget).find("video");
		videoElem.status = "fade-in";
		gsap.fromTo(videoElem, {
			opacity: 0/* ,
			opacity: 0.1 */
		}, {
			opacity: 1,
			duration: 0.5,
			ease: "sine"/* ,
			onComplete() {
				if (videoElem.status === "fade-in") {
					videoElem.play();
					videoElem.status = false;
				}
			} */
		});
		videoElem.play();
		// videoElem.play();
		// setTimeout(() => videoElem.play(), 150);
	}

	_offVideoHover(event) {
		event.preventDefault();
		// console.log("Pause Label Video", event);
		const [videoElem] = $(event.currentTarget).find("video");
		videoElem.status = "fade-out";
		gsap.to(videoElem, {
			opacity: 0,
			duration: 0.5,
			ease: "sine"/* ,
			onComplete() {
				if (videoElem.status === "fade-out") {
					videoElem.pause();
					videoElem.status = false;
				}
			} */
		});
	}

	async _launchRoll(traitA, valueA, traitB, valueB, poolAdvantage = 0, widthAdvantage = 0) {
		if (traitA === traitB) { return false }
		const descParts = [];
		for (const [trait, value] of [[traitA, valueA], [traitB, valueB]]) {
			if (trait) {
				const traitCode = [
					`<span class="trait-name ${C.strategies.includes(trait) ? "strategy" : "tactic"}">${U.tCase(trait)}</span>`,
					"<span class=\"character\">(</span>",
					`<span class="trait-value">${value}</span>`,
					"<span class=\"character\">)</span>"
				].join("");
				if (C.strategies.includes(trait)) {
					descParts.unshift(traitCode);
				} else {
					descParts.push(traitCode);
				}
			}
		}
		if (poolAdvantage) {
			descParts.push(`<span class="advantage-value">${poolAdvantage}</span>`);
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
		const resultParts = [];
		// if (sets.length) {
		// 	resultParts.push("<span class=\"roll-results\">SETS:");
		// 	for (const {width, height} of sets) {
		// 		resultParts.push([
		// 			`<span class="roll-set height-${height} width-${width}">`,
		// 			`<span class="set-term width">${width}</span>`,
		// 			"<span class=\"set-term operator\">×</span>",
		// 			`<span class="set-term height">${height}</span>`,
		// 			"</span>"].join(""));
		// 	}
		// 	resultParts.push("</span>");
		// }
		const data = {
			content: await renderTemplate("systems/betterangels/hbs/chat/ORE-roll.hbs", {name: this.actor.name, sets: sortedSets, looseDice, descLine, resultSummary: resultParts.join("")}),
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			roll,
			flags: {core: {canPopout: true}}
		};
		return ChatMessage.create(data, {});
	}

	_fillDot(trait, dot) {
		const [dotElem] = $(`.app.betterangels #${trait}-${dot} > .dot-slot`);
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
		const [dotElem] = $(`#${trait}-${dot} > .dot-slot`);
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
		const [fromElem] = $(`.app.betterangels #${fromTrait}-${fromDot} > .dot-slot`);
		const [toElem] = $(`.app.betterangels #${toTrait}-${toDot} > .dot-slot`);
		const [animElem] = $("<span class=\"dot-slot full top-layer\">&nbsp;</span>").appendTo(`.app.betterangels #${fromTrait}-${fromDot}`);
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

	_prepareItems(context) {
		Object.assign(context.data, {
			powers: context.items.filter((item) => item.type === "power"),
			aspects: context.items.filter((item) => item.type === "aspect"),
			devices: context.items.filter((item) => item.type === "device")
		});
	}

	activateListeners(html) {
		super.activateListeners(html);

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

		$(".trait-pair .virtuous").each((_, label) => {
			$(label)
				.find(".trait.draggable")
				.each((__, span) => U.set([span, $(span).prev()], {x: U.get(label, "width") - (1.1 * U.get(span, "width"))}));
		});

		$(".feature").css({pointerEvents: "all"}).click((event) => {
			const item = this.actor.items.get(event.currentTarget.dataset.itemId);
			item.sheet.render(true);
		});

		Hooks.on("preCreateItem", (item, itemData) => {
			const {type} = itemData;
			switch (itemData.type) {
				case "power": {
					const powerItems = Array.from(this.actor.items.values()).filter((ownedItem) => ownedItem.data.type === "power");
					if (powerItems.length === 3) {
						powerItems[0].delete();
					}
					break;
				}
				case "aspect": {
					const aspectItems = Array.from(this.actor.items.values()).filter((ownedItem) => ownedItem.data.type === "aspect");
					if (aspectItems.length === 2) {
						aspectItems[0].delete();
					}
					break;
				}
				// no default
			}
		});

		// Construct lookup object for trait livesnap points
		const getSnapPoints = (traitName) => {
			traitName = U.lCase(traitName);
			const traitType = C.strategies.includes(traitName) ? "strategy" : "tactic";
			const snapPoints = new Map();
			$(`#trait-label-${traitName}`).removeClass("faded-trait");
			const [homeTarget] = $(`#trait-label-${traitName} .display`);
			const globalHomePos = U.getGlobalPos(homeTarget);
			snapPoints.set(globalHomePos, homeTarget);
			C.strategies.forEach((trait) => {
				if (trait !== traitName) {
					if (traitType === "tactic") {
						// We are dragging a TACTIC around ...
						$(`#trait-label-${trait}`).removeClass("faded-trait");
						const [dropTarget] = $(`#trait-label-${trait} .display`);
						const globalDropPos = U.getGlobalPos(dropTarget);
						// ... so, its drop point will be LOWER and RIGHT
						globalDropPos.x += 15;
						globalDropPos.y += 15;
						snapPoints.set(globalDropPos, dropTarget);
					} else {
						$(`#trait-label-${trait}`).addClass("faded-trait");
					}
				}
			});
			C.tactics.forEach((trait) => {
				if (trait !== traitName) {
					if (traitType === "strategy") {
						// We are dragging a STRATEGY around ...
						$(`#trait-label-${trait}`).removeClass("faded-trait");
						const [dropTarget] = $(`#trait-label-${trait} .display`);
						const globalDropPos = U.getGlobalPos(dropTarget);
						globalDropPos.x -= 15;
						globalDropPos.y -= 15;
						// ... so, its drop point will be UPPER and LEFT
						snapPoints.set(globalDropPos, dropTarget);
					} else {
						$(`#trait-label-${trait}`).addClass("faded-trait");
					}
				}
			});

			C[traitType === "strategy" ? "tactics" : "strategies"].forEach((trait) => {
			});
			return snapPoints;
		};

		Dragger.create(".draggable.trait", {
			onDragStart() {
				this.snapElems = [];
				const traitName = this.target.dataset.target;
				this.snapPoints = getSnapPoints(traitName);
				[this.startParent] = $(this.target).parent();
				$("label.droppable").addClass("no-hover");
				U.reparent(this.target, $("#x-container")[0]);
				this.update(false, true);
				gsap.to(this.target, {
					scale: 2,
					fontFamily: "Komikax, sans-serif",
					color: C.html.colors[C.strategies.includes(traitName) ? "strategy" : "tactic"],
					opacity: 1,
					duration: 2,
					textShadow: "0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black",
					ease: "elastic.out"
				});
				// console.log("DRAG START:", {["this"]: this, target: this.target, startParent: this.startParent});
			},
			liveSnap: {
				points(point) {
					const traitName = this.target.dataset.target;
					if (!this.snapPoints) {
						this.snapPoints = getSnapPoints(traitName);
					}
					const snapPoint = gsap.utils.snap({values: Array.from(this.snapPoints.keys()), radius: 25}, point);
					const newSnapElem = this.snapPoints.get(snapPoint);
					const curSnapElem = this.snapElem;

					if (newSnapElem?.id !== curSnapElem?.id) {
						if (curSnapElem) {
							console.log(`UNSNAPPING ${curSnapElem.dataset.target}`);
							gsap.set($(curSnapElem).parent(), {pointerEvents: "none"});
							$(curSnapElem).parent()
								.data("snapAnim").reverse()
								.then(() => gsap.set($(curSnapElem).parent(), {pointerEvents: "all"}));
							delete this.snapPoint;
							delete this.snapElem;
						}
						if (newSnapElem) {
							const [newSnapParent] = $(newSnapElem).parent();
							gsap.set(newSnapParent, {pointerEvents: "none"});
							const newSnapPos = newSnapParent.id === this.startParent.id
								? {
										x: "+=0",
										y: "+=0"
									}
								: {
										x: newSnapElem.dataset.type === "tactic" ? "+=25" : "-=25",
										y: newSnapElem.dataset.type === "tactic" ? "+=15" : "-=15"
									};
							$(newSnapElem).parent()
								.data({snapAnim: gsap.fromTo(newSnapElem, {zIndex: 1000}, {
									...newSnapPos,
									scale: 2,
									fontFamily: "Komikax, sans-serif",
									color: C.html.colors[C.strategies.includes(traitName) ? "tactic" : "strategy"],
									opacity: 1,
									ease: "back",
									textShadow: "0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black",
									duration: 0.5
								})});
							this.snapPoint = snapPoint;
							this.snapElem = newSnapElem;
							console.log(`SNAPPING TO ${this.snapElem.dataset.target}`);
						}
					}

					return this.snapPoint ?? point;
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
					duration: 1,
					ease: "elastic.out",
					callbackScope: this,
					onComplete() {
						gsap.set(this.target, {x: 0, y: 0});
						this.enable();
						$("label.droppable").removeClass("no-hover");
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
					duration: 0.5
				});
			}
		});
	}

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

	_canTrait(trait, action) { return this._getButtonStates(trait)[0][action] }

	updateRadialButtons(trait) {
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
					$(id).addClass(className);
				} else {
					$(id).removeClass(className);
				}
			}
		));
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
		if (this._canTrait(target, action)) {
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
			this.updateRadialButtons(target);
			return true;
		}
		return false;
	}

	async _onItemCreate(event) { //~ Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
		console.log("On Item Create Called");
		return;
		event.preventDefault();
		const header = event.currentTarget;
		//~ Get the type of item to create.
		const {type} = header.dataset;
		//~ Grab any data associated with this control.
		const data = duplicate(header.dataset);
		//~ Initialize a default name.
		const name = `New ${type.capitalize()}`;
		//~ Prepare the item object.
		const itemData = {name, type, data};
		//~ Remove the type from the dataset since it's in the itemData.type prop.
		delete itemData.data.type;

		//~ Finally, create the item!
		return await Item.create(itemData, {parent: this.actor});
	}

	_onRoll(event) { //~ Handle clickable rolls
		event.preventDefault();
		const element = event.currentTarget;
		const {dataset} = element;

		//~ Handle item rolls.
		if (dataset.rollType) {
			if (dataset.rollType === "item") {
				const {itemId} = element.closest(".item").dataset;
				const item = this.actor.items.get(itemId);
				if (item) {
					return item.roll();
				}
			}
		}

		//~ Handle rolls that supply the formula directly.
		if (dataset.roll) {
			const label = dataset.label ? `[roll] ${dataset.label}` : "";
			const roll = new Roll(dataset.roll, this.actor.getRollData()).roll();
			roll.toMessage({
				speaker: ChatMessage.getSpeaker({actor: this.actor}),
				flavor: label,
				rollMode: game.settings.get("core", "rollMode")
			});
			return roll;
		}

		return false;
	}

}