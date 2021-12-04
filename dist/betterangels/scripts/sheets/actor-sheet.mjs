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
	gsap, Dragger, MotionPathPlugin,
	// ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮
	U,
	// ▮▮▮▮▮▮▮[Mixins]▮▮▮▮▮▮▮
	MIX, UpdateQueue
} from "../helpers/bundler.mjs";

export default class extends MIX(ActorSheet).with(UpdateQueue) {

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["betterangels", "sheet", "actor"],
			template: "systems/betterangels/templates/actor/actor-sheet.html",
			width: 476,
			height: 786,
			tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "front"}]
		});
	}

	get template() { return `systems/betterangels/templates/actor/actor-${this.actor.data.type}-sheet.html` }

	getData() {

		const context = super.getData();

		const actorData = U.cloneObj(context.actor.data);

		context.data = actorData.data;
		context.flags = actorData.flags;

		if (["hellbound", "minornpc", "mobnpc"].includes(actorData.type)) {
			this._prepareItems(context);
			this._prepareCharacterData(context);
		}

		context.rollData = context.actor.getRollData();

		return context;
	}

	// ████████ Trait Radial Menu: Radial Menu for Trait Lines ████████
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

	_playLabelVideo(event) {
		event.preventDefault();
		// console.log("Play Label Video", event);
		const [videoElem] = $(event.currentTarget).find("video");
		videoElem.status = "fade-in";
		gsap.fromTo(videoElem, {
			opacity: 0.1
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

	_pauseLabelVideo(event) {
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

	_launchRoll(dragged, dropped) {
		const {target: targetA, value: valueA} = dragged.dataset;
		const [{dataset: {target: targetB, value: valueB}}] = $(dropped)?.find(".draggable") ?? [{dataset: {}}];
		const sheetContext = this;
		const [dropDisplay] = $(dropped).find(".display");
		$(dropDisplay).addClass("big-gold click-through");

		function clearAnimation() {
			$(this).removeClass("click-through");
			gsap.set(this, {
				opacity: 0,
				x: 0,
				y: 0,
				scale: 1
			});
		}

		gsap.to(dragged, {
			scale: 5,
			y: "-=75px",
			opacity: 0,
			duration: 1,
			ease: "power.out",
			onComplete: clearAnimation.bind(dragged)
		});
		gsap.to(dropDisplay, {
			scale: 5,
			y: "+=75px",
			opacity: 0,
			duration: 1,
			ease: "power.out",
			onComplete() {
				$(dropDisplay).removeClass("big-gold");
				gsap.set(dropDisplay, {scale: 1, y: "-=75px"});
				gsap.fromTo(dropDisplay, {
					opacity: 0
				}, {
					opacity: 1,
					duration: 0.25,
					ease: "sine",
					onComplete() {
						$(dropDisplay).removeClass("click-through");
						gsap.set(dropDisplay, {y: 0});
						gsap.set(dragged, {opacity: 0});
					}
				});
			}
		});

		const rollPoolParts = [];
		if (C.strategies.includes(targetA)) {
			rollPoolParts.push(`<h1><span style="color: darkgreen !important; font-weight: bold !important; font-style: normal !important;">${U.tCase(targetA)}</span> ${valueA} + `);
			rollPoolParts.push(`<span style="color: purple !important; font-weight: normal !important; font-style: italic !important;">${U.tCase(targetB)}</span> ${valueB}</h1>`);
		} else {
			rollPoolParts.push(`<h1><span style="color: darkgreen !important; font-weight: bold !important; font-style: normal !important;">${U.tCase(targetB)}</span> ${valueB} + `);
			rollPoolParts.push(`<span style="color: purple !important; font-weight: normal !important; font-style: italic !important;">${U.tCase(targetA)}</span> ${valueA}</h1>`);
		}
		rollPoolParts.push(`<h3>(${U.pInt(valueA) + U.pInt(valueB)} Dice Total)`);

		$("#sheet-message").html(rollPoolParts.join(""));

		const [rollPool] = $("#sheet-message").find("h1");
		const [rollSummary] = $("#sheet-message").find("h3");

		gsap.fromTo(rollPool, {
			scale: 10,
			opacity: 0
		}, {
			scale: 1,
			opacity: 1,
			duration: 0.5,
			ease: "power4.out"
		});
		gsap.fromTo(rollSummary, {
			scale: 1,
			y: "+=300px",
			opacity: 0
		}, {
			y: 0,
			opacity: 1,
			duration: 1,
			ease: "power4.in",
			onComplete() {
				gsap.to("#sheet-message *", {
					opacity: 0,
					scale: 5,
					duration: 0.5,
					delay: 1,
					stagger: 0.2,
					ease: "power4.out"
				});
			}
		});

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

		html.find(".feature").click((event) => {
			const item = this.actor.items.get(event.currentTarget.dataset.itemId);
			item.sheet.render(true);
		});

		if (!this.isEditable) { return }

		const sheetContext = this;

		html.find(".radial-hover").contextmenu(this._openRadialMenu.bind(this));
		html.find(".radial-hover").mouseleave(this._closeRadialMenu.bind(this));
		html.find(".trait-pair > label").hover(this._playLabelVideo.bind(this), this._pauseLabelVideo.bind(this));

		html.find(".trait-button").click(this._changeTrait.bind(this));
		html.find(".trait-button").contextmenu(this._changeTrait.bind(this));

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

			}
		});

		Dragger.create(".draggable.trait", {
			onDragStart() {
				this.droppables = Array.from($(".droppable")).filter((elem) => !new RegExp(`${this.target.dataset.target}$`).test(elem.id));
				// console.log("Droppables", this.droppables);
				[this.startParent] = $(this.target).parent();
				U.reparent(this.target, $("#x-container")[0]);
				this.update(false, true);
				gsap.to(this.target, {
					scale: 2,
					opacity: 1,
					duration: 2,
					ease: "elastic.out"
				});
			},
			onDrag() {
				this.droppables.forEach((elem) => {
					if (this.hitTest(elem, "50%")) {
						// const displayElem = $(elem).find(".display");
						// displayElem.addClass("highlight");
						gsap.to($(elem).find(".display").addClass("highlight"), {
							y: -10,
							scale: 3,
							ease: "power4.out",
							duration: 0.5
						});
						this.dropTarget = elem;
					} else if (this.dropTarget?.id !== elem.id) {
						const [displayElem] = $(elem).find(".display");
						$(displayElem).removeClass("highlight");
						gsap.to(displayElem, {
							y: 0,
							scale: 1,
							ease: "power4.out",
							duration: 0.5
						});
					}
				});
			},
			onDragEnd() {
				const dragContext = this;
				$(".droppable .display.highlight").each((_, elem) => {
					$(elem).removeClass("highlight");
					U.reparent(this.target, this.startParent);
					gsap.to(elem, {
						y: 0,
						scale: 1,
						ease: "power4.out",
						duration: 0.5,
						onComplete() { sheetContext._launchRoll(dragContext.target, dragContext.dropTarget) }
					});
				});
				$(this.target).addClass("click-through");
				// sheetContext._launchRoll(this.target, this.dropTarget);
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

	_canTrait(trait, action) {
		return this._getButtonStates(trait)[0][action];
	}

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

	async _onItemCreate(event) {
		console.log("On Item Create Called");
		return;
		event.preventDefault();
		const header = event.currentTarget;

		const {type} = header.dataset;

		const data = duplicate(header.dataset);

		const name = `New ${type.capitalize()}`;

		const itemData = {name, type, data};

		delete itemData.data.type;

		return await Item.create(itemData, {parent: this.actor});
	}

	_onRoll(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const {dataset} = element;

		if (dataset.rollType) {
			if (dataset.rollType === "item") {
				const {itemId} = element.closest(".item").dataset;
				const item = this.actor.items.get(itemId);
				if (item) {
					return item.roll();
				}
			}
		}

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