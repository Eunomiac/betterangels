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
	U
	// #endregion ▮▮▮▮[Utility]▮▮▮▮
} from "../helpers/bundler.mjs";

export default class extends ActorSheet {

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

	get pendingUpdateData() { return (this._pendingUpdateData = this._pendingUpdateData ?? {}) }
	get actorData() { return U.merge(this.actor.data, U.expand(this.pendingUpdateData)) }

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

	get animate() {
		return {
			fillDot: (trait, dot) => {
				const dotID = `#${trait}-${dot}`;
				gsap.to(dotID, {
					backgroundColor: "rgba(0, 0, 0, 1)",
					ease: "power.out",
					duration: 1,
					onComplete() {
						$(dotID).removeClass("empty");
					}
				});
			},
			emptyDot: (trait, dot) => {
				const dotID = `#${trait}-${dot}`;
				gsap.to(dotID, {
					backgroundColor: "rgba(0, 0, 0, 0)",
					ease: "power.out",
					duration: 1,
					onComplete() {
						$(dotID).addClass("empty");
					}
				});
			},
			slideDot: (toTrait, toDot, fromTrait, fromDot) => {
				this.animate.fillDot(toTrait, toDot);
				this.animate.emptyDot(fromTrait, fromDot);
			}
		};
	}

	async updateActor(updateData = {}) {
		updateData = {
			...this.pendingUpdateData,
			...updateData
		};
		delete this._pendingUpdateData;
		return this.actor.update(updateData);
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
		console.log(event);
		$(event.currentTarget).find(".radial-menu")?.addClass("active");
	}

	_closeRadialMenu(event) {
		$(".radial-menu.active").removeClass("active");
		setTimeout(() => this.actor.update(this.pendingUpdateData), 500);
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

		html.find(".trait-button").click(this._changeTrait.bind(this));

		html.find(".radial-menu video").each(function playMenuVideos() { this.play() });

		Dragger.create(".trait-pair > label > span", {
			onDragStart() {
				gsap.to(this.target, {
					scale: 2,
					opacity: 1,
					duration: 2,
					ease: "elastic"
				});
			},
			onDragEnd() {
				$(this.target).addClass("click-through");
				gsap.to(this.target, {
					scale: 5,
					opacity: 0,
					duration: 1,
					ease: "power.out",
					onComplete() {
						$(this.target).removeClass("click-through");
						sheetContext.render(true);
					}
				});
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
				this.pendingUpdateData[`data.${target}.value`] = targetVal;
				this.animate.fillDot(target, targetVal);
				break;
			}
			case "drop": {
				this.animate.emptyDot(target, data[target].value);
				this.pendingUpdateData[`data.${target}.value`] = Math.max(data[target].min, data[target].value - 1);
				break;
			}
			case "slide": {
				const fromTarget = CONFIG.BETTERANGELS.traitPairs[target];
				const targetVal = Math.min(data[target].max, data[target].value + 1);
				this.animate.slideDot(target, targetVal, fromTarget, data[fromTarget].value);
				this.pendingUpdateData[`data.${target}.value`] = targetVal;
				this.pendingUpdateData[`data.${fromTarget}.value`] = Math.max(data[fromTarget].min, data[fromTarget].value - 1);
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