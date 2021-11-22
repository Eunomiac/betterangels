import {

	// #region ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮ ~
	gsap,
	Dragger,
	InertiaPlugin,
	MotionPathPlugin,
	GSDevTools,
	RoughEase, // GreenSock Animation Platform
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
			template: "systems/betterangels/templates/actor/actor-sheet.hbs",
			width: 700,
			height: 700,
			tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats"}]
		});
	}

	get template() { return `systems/betterangels/templates/actor/actor-${this.actor.data.type}-sheet.hbs` }

	getData() {
		/*~ Retrieve the data structure from the base sheet. You can inspect or log
            the context variable to see the structure, but some key properties for
            sheets are the actor object, the data object, whether or not it's
            editable, the items array, and the effects array. */
		const context = super.getData();

		//~ Use a safe clone of the actor data for further operations.
		const actorData = U.cloneObj(context.actor.data);

		//~ Add the actor's data to context.data for easier access, as well as flags.
		context.data = actorData.data;
		context.flags = actorData.flags;

		//~ Prepare character data and items.
		if (["hellbound", "minornpc", "mobnpc"].includes(actorData.type)) {
			this._prepareItems(context);
			this._prepareCharacterData(context);
		}

		//~ Add roll data for TinyMCE editors.
		context.rollData = context.actor.getRollData();

		return context;
	}

	_prepareCharacterData(context) {
		// Data for trait radial menus

		// For each trait, define data for rendering of dots and radial menu
		Object.entries(CONFIG.BETTERANGELS.sinisterTraitPairs).forEach(([top, bottom]) => {
			const {min: topMin, max: topMax, value: topVal} = context.data[top];
			const {min: botMin, max: botMax, value: botVal} = context.data[bottom];
			Object.assign(context.data[top], {
				name: top,
				emptyDots: topMax - topVal,
				canSlideTo: topVal < topMax && botVal > botMin && (topVal + botVal) < 7,
				canAdd: topVal < topMax && (topVal + botVal) < 7,
				canDrop: topVal > topMin
			});
			Object.assign(context.data[bottom], {
				name: bottom,
				emptyDots: botMax - botVal,
				canSlideTo: botVal < botMax && topVal > topMin && (topVal + botVal) < 7,
				canAdd: botVal < botMax && (topVal + botVal) < 7,
				canDrop: botVal > botMin
			});
		});
	}

	_openRadialMenu(event) {
		// console.log("Open Menu", event);
		const [posElem] = $(event.currentTarget).find(".menu-positioner");
		if ($(posElem).find(".radial-menu").hasClass("active")) {
			this._closeRadialMenu(event);
		} else {
			gsap.set(posElem, {xPercent: -50, yPercent: -50, x: event.offsetX, y: event.offsetY});
			$(posElem).find("video").each(function playVideo() { this.play() });
			$(posElem).find(".radial-menu").addClass("active");
		}
	}

	_closeRadialMenu(event) {
		// console.log("Close Menu", event);
		const [posElem] = $(event.currentTarget).find(".menu-positioner");
		$(posElem).find("video").each(function stopVideo() { this.pause() });
		$(posElem).find(".radial-menu").removeClass("active");
		setTimeout(() => this.pushUpdates(), 500);
	}

	_updateLabelVideo(event) {
		// console.log("Update Label Video", event);
		const [videoElem] = $(event.currentTarget).find("video");

	}

	_playLabelVideo(event) {
		// console.log("Play Label Video", event);
		const [videoElem] = $(event.currentTarget).find("video");
		videoElem.play();
		setTimeout(() => videoElem.play(), 150);
		gsap.fromTo(videoElem,
														{
															opacity: 0
														},
														{
															opacity: 1,
															duration: 0.5,
															ease: "sine",
															onComplete() {
																videoElem.play();
															}
														});
	}

	_pauseLabelVideo(event) {
		// console.log("Pause Label Video", event);
		const [videoElem] = $(event.currentTarget).find("video");
		gsap.to(videoElem, {opacity: 0,
																						duration: 0.5,
																						ease: "sine",
																						onComplete() {
																							videoElem.pause();
																						}});
	}

	_launchRoll(dragged, dropped) {
		const {target: targetA, value: valueA} = dragged.dataset;
		const [{dataset: {target: targetB, value: valueB}}] = $(dropped)?.find(".draggable") ?? [{dataset: {}}];
		const sheetContext = this;
		const [dropDisplay] = $(dropped).find(".display");
		$(dropDisplay).addClass("big-gold click-through");

		gsap.to(dragged, {
			scale: 5,
			y: "-=75px",
			opacity: 0,
			duration: 1,
			ease: "power.out",
			onComplete() {
				$(dragged).removeClass("click-through");
				gsap.set(dragged, {
					opacity: 0,
					x: 0,
					y: 0,
					scale: 1
				});
			}
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
		if (CONFIG.BETTERANGELS.strategies.includes(targetA)) {
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

	fillDot(trait, dot) {
		const [dotElem] = $(`#${trait}-${dot} > .dot-animation`);
		const [menuElem] = $(dotElem).closest(".radial-hover").find(".radial-menu");
		const [videoElem] = $(menuElem).find("video");
		const videoScale = gsap.getProperty(videoElem, "scale");
		const tl = gsap.timeline({
			onComplete() { $(dotElem).removeClass("empty") }
		});
		tl.fromTo(dotElem, {
			scale: 7,
			backgroundColor: "rgb(0, 0, 0)",
			opacity: 0
		}, {
			scale: 1,
			opacity: 1,
			backgroundColor: "rgb(0, 0, 0)",
			ease: "sine",
			duration: 0.5
		});
	}
	emptyDot(trait, dot) {
		const [dotElem] = $(`#${trait}-${dot} > .dot-animation`);
		const [menuElem] = $(dotElem).closest(".radial-hover").find(".radial-menu");
		const [videoElem] = $(menuElem).find("video");
		const videoScale = gsap.getProperty(videoElem, "scale");
		const tl = gsap.timeline({
			onComplete() { $(dotElem).addClass("empty") }
		});
		tl.fromTo(dotElem, {
			scale: 1,
			backgroundColor: "rgb(0, 0, 0)",
			opacity: 1
		}, {
			scale: 10,
			opacity: 0,
			backgroundColor: "rgb(0, 0, 0)",
			ease: "sine",
			duration: 0.75
		});
	}
	slideDot(toTrait, toDot, fromTrait, fromDot) {
		this.emptyDot(fromTrait, fromDot);
		setTimeout(() => this.fillDot(toTrait, toDot), 250);
	}

	_prepareItems(context) {
		//~ Initialize containers.
		const gear = [];
		const features = [];

		//~ Iterate through items, allocating to containers
		for (const i of context.items) {
			i.img = i.img || DEFAULT_TOKEN;
			if (i.type === "item") {
				// Append to gear.
				gear.push(i);
			} else if (i.type === "feature") {
				// Append to features.
				features.push(i);
			}
		}

		//~ Assign and return
		context.gear = gear;
		context.features = features;
	}

	activateListeners(html) {
		super.activateListeners(html);

		if (!this.isEditable) { return }

		const sheetContext = this;

		html.find(".radial-hover").contextmenu(this._openRadialMenu.bind(this));
		html.find(".radial-hover").mouseleave(this._closeRadialMenu.bind(this));
		html.find(".trait-pair > label").hover(this._playLabelVideo.bind(this), this._pauseLabelVideo.bind(this));

		html.find(".trait-button").click(this._changeTrait.bind(this));

		Dragger.create(".trait-pair .draggable", {
			onDragStart() {
				this.droppables = Array.from($(".droppable")).filter((elem) => !new RegExp(`${this.target.dataset.target}$`).test(elem.id));
				// console.log("Droppables", this.droppables);
				gsap.to(this.target, {
					scale: 2,
					opacity: 1,
					duration: 2,
					ease: "elastic"
				});
			},
			onDrag() {
				this.droppables.forEach((elem) => {
					if (this.hitTest(elem, "50%")) {
						const [displayElem] = $(elem).find(".display");
						$(displayElem).addClass("highlight");
						gsap.to(displayElem, {
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
				$(".droppable .display.highlight").each((_, elem) => {
					$(elem).removeClass("highlight");
					gsap.to(elem, {
						y: 0,
						scale: 1,
						ease: "power4.out",
						duration: 0.5
					});
				});
				$(this.target).addClass("click-through");
				sheetContext._launchRoll(this.target, this.dropTarget);
			}
		});
	}

	updateRadialButtons(trait) {
		trait = CONFIG.BETTERANGELS.virtuousTraitPairs[trait] ?? trait;
		const [top, bottom] = [trait, CONFIG.BETTERANGELS.traitPairs[trait]];
		const {min: topMin, max: topMax, value: topVal} = this.actorData.data[top];
		const {min: botMin, max: botMax, value: botVal} = this.actorData.data[bottom];
		Object.entries({
			[`#menu-add-${top}`]: topVal < topMax && (topVal + botVal) < 7,
			[`#menu-add-${bottom}`]: botVal < botMax && (topVal + botVal) < 7,
			[`#menu-drop-${top}`]: topVal > topMin,
			[`#menu-drop-${bottom}`]: botVal > botMin,
			[`#menu-slide-${top}`]: topVal < topMax && botVal > botMin && (topVal + botVal) < 7,
			[`#menu-slide-${bottom}`]: botVal < botMax && topVal > topMin && (topVal + botVal) < 7
		}).forEach(([id, isActive]) => {
			if (isActive) {
				$(id).removeClass("empty");
			} else {
				$(id).addClass("empty");
			}
		});
	}

	async _changeTrait(event) {
		console.log({CHANGETRAIT: event});
		const {action, target} = event.target.dataset;
		const {data} = this.actorData;
		switch (action) {
			case "add": {
				const targetVal = Math.min(data[target].max, data[target].value + 1);
				this.updateSync({[`data.${target}.value`]: targetVal});
				this.fillDot(target, targetVal);
				break;
			}
			case "drop": {
				this.emptyDot(target, data[target].value);
				this.updateSync({[`data.${target}.value`]: Math.max(data[target].min, data[target].value - 1)});
				break;
			}
			case "slide": {
				const fromTarget = CONFIG.BETTERANGELS.traitPairs[target];
				const targetVal = Math.min(data[target].max, data[target].value + 1);
				this.slideDot(target, targetVal, fromTarget, data[fromTarget].value);
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

	async _onItemCreate(event) { //~ Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
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