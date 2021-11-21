/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌█████████████████████ MIT License █ v0.0.1-prealpha █  ████████████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

import {
	// ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮
	gsap,
	Dragger,
	InertiaPlugin,
	MotionPathPlugin,
	GSDevTools,
	RoughEase, // GreenSock Animation Platform
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
			width: 700,
			height: 700,
			tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats"}]
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
		setTimeout(() => this.pushUpdates(), 500);
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
			ease: "power4.in",
			duration: 0.5
		}, 0.25);
	}
	emptyDot(trait, dot) {
		const [dotElem] = $(`#${trait}-${dot} > .dot-animation`);
		const [menuElem] = $(dotElem).closest(".radial-hover").find(".radial-menu");
		const [videoElem] = $(menuElem).find("video");
		const videoScale = gsap.getProperty(videoElem, "scale");
		console.log(`Scale: ${videoScale}`);
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
			ease: "power4.out",
			duration: 0.75
		}, 0.25);
	}
	slideDot(toTrait, toDot, fromTrait, fromDot) {
		this.fillDot(toTrait, toDot);
		this.emptyDot(fromTrait, fromDot);
	}

	_prepareItems(context) {

		const gear = [];
		const features = [];

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

		context.gear = gear;
		context.features = features;
	}

	activateListeners(html) {
		super.activateListeners(html);

		Hooks.once("renderActorSheet", () => html.find(".radial-menu video").each(function playMenuVideos() { this.play() }));

		if (!this.isEditable) { return }

		const sheetContext = this;

		html.find(".radial-hover").contextmenu(this._openRadialMenu.bind(this));
		html.find(".radial-hover").mouseleave(this._closeRadialMenu.bind(this));

		html.find(".trait-button").click(this._changeTrait.bind(this));

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

	async _onItemCreate(event) {
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