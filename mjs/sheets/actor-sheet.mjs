// #region ████████ IMPORTS ████████ ~
import {
	// #region ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮
	C,
	// #endregion ▮▮▮▮[Constants]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮
	// GreenSock Animation Platform
	gsap,
	Dragger,
	MotionPathPlugin,
	SplitText,
	// #endregion ▮▮▮▮[External Libraries]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮
	U,
	// #endregion ▮▮▮▮[Utility]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Mixins]▮▮▮▮▮▮▮
	MIX,
	UpdateQueue
	// #endregion ▮▮▮▮[Mixins]▮▮▮▮
} from "../helpers/bundler.mjs";
// #endregion ▄▄▄▄▄ IMPORTS ▄▄▄▄▄

// #region 🟪🟥🟪🟥🟪🟥 DragRoll: Defines Sheet Roll Throughout Construction 🟥🟪🟥🟪🟥🟪
class DragRoll {
	// #region ▓▓▓▓▓▓▓ CONSTRUCTOR ▓▓▓▓▓▓▓ ~
	constructor(dragger, {traits, advantages, expertDice, masteryDice, difficulty, poolMod, heightMod, maxPool, actor} = {}) {
		this._dragger = dragger;
		this._actor = actor ?? this._dragger.sheet.actor;

		this._traits = traits ?? [dragger.trait];
		this._advantages = advantages ?? {
			pool: {general: 0, weapon: 0, surprise: 0, secret: 0},
			width: {general: 0, weapon: 0, surprise: 0, secret: 0}
		};
		this._expertDice = expertDice ?? [];
		this._masteryDice = masteryDice ?? 0;
		this._difficulty = difficulty ?? 1;
		this._poolMod = poolMod ?? 0;
		this._heightMod = heightMod ?? 0;
		this._maxPool = maxPool ?? 10;

		[this._topIconsElem] = $(dragger.target).find(".icons-top");
		[this._bottomIconsElem] = $(dragger.target).find(".icons-bottom");

		this._initElements();
	}
	// #endregion ▓▓▓▓[CONSTRUCTOR]▓▓▓▓

	// #region ▓▓▓▓▓▓▓ GETTERS & SETTERS ▓▓▓▓▓▓▓ ~
	// #region ========== Object Reference Getters =========== ~
	get actor() { return this._actor }
	get actorSheet() { return this.actor.sheet }
	get actorData() { return this.actor.data.data }
	// #endregion _______ Object Reference Getters _______
	// #region ========== DOM Element Getters =========== ~
	get roll$() { return $(this._dragger.target) }
	get topContainer$() { return this.roll$.find(".icons-top") }
	get topIcons$() { return this.topContainer$.find(".roll-icon") }
	get rollDesc$() { return this.roll$.find(".roll-desc") }
	get bottomContainer$() { return this.roll$.find(".icons-bottom") }
	get bottomIcons$() { return this.bottomContainer$.find(".roll-icon") }

	get lastTopAdvantage() {
		return Array.from(this.topIcons$).filter((elem) => $(elem).data("type") === "advantage").pop();
	}
	// #endregion _______ DOM Element Getters _______

	// #region ========== Basic Getters & Setters =========== ~
	get traits() { return this._traits }
	set traits(v) { this._traits = v }
	get difficulty() { return this._difficulty }
	set difficulty(v) { this._difficulty = v }
	get advantages() { return this._advantages }
	set advantages(v) { this._advantages = v }
	get masteryDice() { return this._masteryDice }
	set masteryDice(v) { this._masteryDice = v }
	get expertDice() { return this._expertDice }
	set expertDice(v) { this._expertDice = v }
	get poolMod() { return this._poolMod }
	set poolMod(v) { this._poolMod = v }
	get heightMod() { return this._heightMod }
	set heightMod(v) { this._heightMod = v }
	get maxPool() { return this._maxPool }
	set maxPool(v) {
		switch (v) {
			case "heightMod":
				this._maxPool = 10 + this.heightMod;
				break;
			case "+heightMod":
				this._maxPool += this.heightMod;
				break;
			default:
				this._maxPool = v ?? 10;
		}
	}
	// #endregion _______ Basic Getters & Setters _______
	// #region ========== Derived Getters =========== ~
	// #region Roll Data ~
	get strategies() { return this.traits.filter((trait) => C.strategies.includes(trait)) }
	get tactics() { return this.traits.filter((trait) => C.tactics.includes(trait)) }
	get traitVals() { return Object.fromEntries(this.traits.map((trait) => [trait, this.actorData[trait].value])) }
	get traitTotal() { return Object.values(this.traitVals).reduce((tot, val) => tot + val, 0) }
	get advantageTotals() {
		return {
			pool: Object.values(this.advantages.pool).reduce((tot, val) => tot + val, 0),
			width: Object.values(this.advantages.width).reduce((tot, val) => tot + val, 0)
		};
	}
	get numTopDice() { return this.advantageTotals.pool + this.expertDice.length + this.masteryDice }
	get numDice() { return this.traitTotal + this.poolMod + this.numTopDice }
	// #endregion Roll Data
	// #region DOM-Related Data: Positioning ~
	get nextTopPos() {
		return {
			left: (C.icons.size * this.topContainer$.children().length) + (C.icons.size / 2),
			top: C.icons.size / 2
		};
	}
	get nextBottomPos() {
		return {
			left: (C.icons.size * this.bottomContainer$.children().length) + (C.icons.size / 2),
			top: C.icons.size / 2
		};
	}
	// #endregion DOM-Related Data
	// #endregion _______ Derived Getters _______
	// #endregion ▓▓▓▓[GETTERS & SETTERS]▓▓▓▓

	// #region ████████ DRAGGABLE DISPLAY: Managing Roll Description & Icons on Draggable Element ████████ ~
	// #region ▓▓▓▓▓▓▓ Icons ▓▓▓▓▓▓▓ ~
	_initIcon(htmlCode, container$) {
		container$ = $(U.getElem(container$));
		const [iconElem] = $(htmlCode).appendTo(container$);
		gsap.set(iconElem, {
			xPercent: -50,
			yPercent: -50,
			...this[container$.hasClass("icons-top") ? "nextTopPos" : "nextBottomPos"],
			scale: 3,
			autoAlpha: 0,
			x: 30,
			y: -30
		});
		return iconElem;
	}
	_getIconPositions(icons$) {
		const groupOverlap = (2 / 3) * C.icons.size;
		const groupPadding = (1 / 3) * C.icons.size;

		// Group top icons by type
		const iconGroups = [
			{group: "general", elems: Array.from(icons$.find("*[data-sub-type=\"general\"]"))},
			{group: "weapon", elems: Array.from(icons$.find("*[data-sub-type=\"weapon\"]"))},
			{group: "surprise", elems: Array.from(icons$.find("*[data-sub-type=\"surprise\"]"))},
			{group: "secret", elems: Array.from(icons$.find("*[data-sub-type=\"secret\"]"))},
			{group: "mastery", elems: Array.from(icons$.find("*[data-type=\"mastery\"]"))},
			...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => ({
				group: `expert-${value}`,
				elems: Array.from(icons$.find(`*[data-type="expert"][data-value=${value}]`))
			}))
		].filter(({elems}) => elems.length > 0);

		// Determine x-positions of all icons, in a container where left = 0 is leftmost side
		const widths = [];
		const getWidth = () => widths.reduce((tot, width) => tot + width, 0);
		for (const iconGroup of iconGroups) {
			if (getWidth() > 0) { // This isn't the first group: Add a spacer.
				widths.push(groupPadding);
			}
			iconGroup.posData = [];
			for (const elem of iconGroup.elems) {
				iconGroup.posData.push(getWidth() + 0.5 * C.icons.size);
				widths.push(C.icons.size - groupOverlap); // Each icon increments the width by its own size, minus the overlap
			}
			widths.push(groupOverlap); // The final icon isn't overlapped, so its full width must be restored
		}

		return [iconGroups, getWidth()];
	}
	_positionIcons() {
		const [topIconGroups, topWidth] = this._getIconPositions(this.topIcons$);
		const [bottomIconGroups, bottomWidth] = this._getIconPositions(this.bottomIcons$);

		// Tween containers so its center lines up with the label center
		gsap.to(this.topContainer$, {
			left: -0.5 * topWidth,
			duration: 0.5,
			ease: "sine.inOut"
		});
		gsap.to(this.bottomContainer$, {
			left: -0.5 * bottomWidth,
			duration: 0.5,
			ease: "sine.inOut"
		});

		// At the same time, tween each icon to its new position.
		// First, combine elements and positions into two flattened arrays.
		const [elems, posData] = [
			[],
			[]
		];
		for (const iconGroup of [...topIconGroups, ...bottomIconGroups]) {
			elems.push(...iconGroup.elems);
			posData.push(...iconGroup.posData);
		}

		// Now, can stagger everything in a single tween
		gsap.to(elems, {
			left(i) { return posData[i] },
			scale: 1,
			autoAlpha: 1,
			duration: 0.5,
			ease: "back",
			stagger: 0.2
		});
	}
	// #endregion ▓▓▓▓[Icons]▓▓▓▓
	// #region ▓▓▓▓▓▓▓ Roll Description ▓▓▓▓▓▓▓ ~
	_updateRollDesc() {
		const rollDescParts = [];
		for (const strategy of this.strategies) {
			rollDescParts.push(C.icons.traits.strategy(strategy, this.traitVals[strategy]));
		}
		for (const tactic of this.tactics) {
			rollDescParts.push(C.icons.traits.tactic(tactic, this.traitVals[tactic]));
		}
		if (this.numTopDice > 0) {
			rollDescParts.push(`${this.numTopDice}${C.icons.topDice}`);
		}
		if (this.poolMod > 0) {
			rollDescParts.push(this.poolMod);
		}
		rollDescParts[0] = rollDescParts.join(" + ");
		rollDescParts.length = 1;
		if (this.poolMod < 0) {
			rollDescParts[0] = `${rollDescParts[0]}<span class="red-text"> - ${Math.abs(this.poolMod)}</span>`;
		}
		if (this.numDice > this.maxPool) {
			rollDescParts.push(`<span class="red-text">${this.numDice}</span>`);
		} else {
			rollDescParts.push(this.numDice);
		}
		this.rollDesc$[0].innerHTML = rollDescParts.join(" = ");
	}
	// #endregion ▓▓▓▓[Roll Description]▓▓▓▓
	async _initElements() {
		// Position roll-desc, top-icons & bottom icons so that they are centered on display-label
		// 		- still useful to have them as y-positioners and containers
		// Use distributer function to set x values of icons with their origin point at the center
		//		- whenever an icon is added or removed, call distributer function and tween all elements to their new positions
		//		- can use this to sort icons by type, even overlap them
		// roll-desc is a flex-container containing splitText elements -- even operators like "+" and "=" are a splitText 'phrase'
		//		- phrases get a $().data("type", <type>) to identify them for later removal and for styling
		//		- on adding or removing, splitText animation in/out
		//		- changing (i.e. updating the up-arrow advantage number) is just a removal followed by an addition
		//		- reparent items being animated-out to .roll-desc-animations, so positions and widths of newly-added phrases can be accurate

		// Create any initial icons the roll starts with:
		for (const [location, advData] of Object.entries(this.advantages)) {
			for (const [type, amount] of Object.entries(advData)) {
				for (let i = 1; i <= amount; i++) {
					this._initIcon(C.icons.advantages[type], location === "width" ? this.bottomContainer$ : this.topContainer$);
				}
			}
		}
		for (const expertDie of this.expertDice) {
			this._initIcon(C.icons.expertDice[expertDie], this.topContainer$);
		}
		for (let i = 1; i <= this.masteryDice; i++) {
			this._initIcon(C.icons.masteryDie, this.topContainer$);
		}
		this._positionIcons();
		this._updateRollDesc();
	}
	// #endregion ▄▄▄▄▄ DRAGGABLE DISPLAY ▄▄▄▄▄

	// #region ████████ PUBLIC METHODS: Manipulating Roll Elements, Launching Roll ████████ ~
	async addTrait(trait) {
		if (!this.traits.includes(trait)) {
			this.traits.push(trait);
		}
		this._updateRollDesc();
	}
	async removeTrait(trait) {
		this.traits = this.traits.filter((rollTrait) => trait !== rollTrait);
		this._updateRollDesc();
	}
	async add(hoverElem) {
		const type = $(hoverElem).data("type");
		switch (type) {
			case "general":
			case "weapon":
			case "surprise":
			case "secret":
			{
				this._initIcon(C.icons.advantages[type], this.topContainer$);
				this.advantages.pool[type]++;
				break;
			}
			case "mastery":
			{
				this._initIcon(C.icons.masteryDie, this.topContainer$);
				this.masteryDice++;
				break;
			}
			case "expert":
			{
				const value = $(hoverElem).data("value");
				this._initIcon(C.icons.expertDice[value], this.topContainer$);
				this.expertDice.push(value);
				break;
			}
                // no default
		}
		this._positionIcons();
		this._updateRollDesc();
	}
	async toWidth() {
		// because _positionIcons() tweens
		const advElem = this.lastTopAdvantage;
		const newTop = gsap.getProperty(advElem, "top");
		const newLeft = this.nextBottomPos.left;
		const subType = $(advElem).data("subType");
		this.advantages.pool[subType]--;
		this.advantages.width[subType]++;
		U.reparent(advElem, this.bottomContainer$, true);
		const curTop = gsap.getProperty(advElem, "top");
		const curLeft = gsap.getProperty(advElem, "left");
		// const newTop = oldTop;
		// const newLeft = ;
		const midTop = (newTop - curTop) / 2 + curTop;
		const midLeft = -20;
		gsap.timeline({onCompleteParams: [this], onComplete(roll) { roll._updateRollDesc() }})
			.to(advElem, {
				left: midLeft,
				ease: "sine.out",
				duration: 0.25
			}, 0)
			.to(advElem, {
				top: midTop,
				ease: "sine.in",
				duration: 0.25
			}, 0)
			.to(advElem, {
				left: newLeft,
				ease: "sine.in",
				duration: 0.25
			}, ">")
			.to(advElem, {
				top: newTop,
				ease: "sine.out",
				duration: 0.25
			}, "<");
	}
	async toHeight() { }
	async reset() {
		const iconElems = [
			...Array.from(this.topContainer$.children()),
			...Array.from(this.bottomContainer$.children())
		];
		this.masteryDice = 0;
		this.expertDice = [];
		this._advantages = {
			pool: {general: 0, weapon: 0, surprise: 0, secret: 0},
			width: {general: 0, weapon: 0, surprise: 0, secret: 0}
		};
		const randomPositions = iconElems.map(() => {
			const pos = {
				x: gsap.utils.random(-75, 75)
			};
			pos.y = Math.sqrt((100 ** 2) - (pos.x ** 2)) * (U.coinFlip() ? 1 : -1);
			return pos;
		});
		gsap.to(iconElems, {
			x(i) { return randomPositions[i].x },
			y(i) { return randomPositions[i].y },
			rotation: "+=720",
			scale: 3,
			autoAlpha: 0,
			duration: 0.5,
			stagger: 0.25,
			ease: "power2.out",
			onComplete() {
				$(iconElems).remove();
			}
		});
		this._updateRollDesc();
	}
	async launch() { }
	// #endregion ▄▄▄▄▄ PUBLIC METHODS ▄▄▄▄▄
}
// #endregion	🟥🟥🟥🟥 DragRoll 🟥🟥🟥🟥

// #region 🟪🟥🟪🟥🟪🟥 BetterAngelsActorSheet: Primary Extension of Base ActorSheet Class 🟥🟪🟥🟪🟥🟪
class BetterAngelsActorSheet extends MIX(ActorSheet).with(UpdateQueue) {
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
	// #region ▮▮▮▮▮▮▮[Data Prep]▮▮▮▮▮▮▮ ~
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
	// #region ▮▮▮▮▮▮▮[Item Prep]▮▮▮▮▮▮▮ ~
	_prepareItems(context) {
		// Separate owned items into categories
		Object.assign(context.data, {
			powers: context.items.filter((item) => item.type === "power").slice(context.data.isBigDemon ? -3 : -2),
			aspects: context.items.filter((item) => item.type === "aspect").slice(-2),
			devices: context.items.filter((item) => item.type === "device").slice(-2)
		});
	}
	// #endregion ▮▮▮▮[Item Prep]▮▮▮▮

	// #region ▓▓▓▓▓▓▓ BASIC GETTERS & SETTERS ▓▓▓▓▓▓▓ ~
	get $() { return $(`#actor-${this.actor.id}`) }
	get isDraggingTrait() { return Boolean(this.$.find(".is-dragging")[0]) }
	// #endregion ▓▓▓▓[BASIC GETTERS & SETTERS]▓▓▓▓

	// #region ████████ 🔴 ACTIVATE LISTENERS ████████ ~
	activateListeners(html) {
		super.activateListeners(html);

		// Initialize Timelines
		console.log(this.TIMELINES);

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
				// Save sheet context for later calls
				this.sheet = actorSheet;

				// Assign is-dragging class
				$(this.target).addClass("is-dragging");

				// Determine trait, trait type, and droppable target type
				this.trait = $(this.target).data("trait");
				this.type = $(this.target).data("type");
				this.dropType = this.type === "strategy" ? "tactic" : "strategy";

				// Assemble home element, potential drop targets, and modifier targets
				[this.homeTarget] = this.sheet.$.find(".trait-label.is-dragging + .trait-label-bg");
				[this.rollTargets, this.nonTargets] = U.partition(
					Array.from(this.sheet.$.find(".trait-draggable:not(.is-dragging)")),
					(elem) => $(elem).data("type") !== this.type
				);
				this.hoverTriggers = Array.from(this.sheet.$.find(".hover-target"));
				this.dropTargets = [...this.rollTargets, this.homeTarget];
				this.hoverTargets = [...this.dropTargets, ...this.hoverTriggers];

				console.log("DRAG START", {
					dragger: this,
					homeTarget: this.homeTarget,
					rollTargets: this.rollTargets,
					dropTargets: this.dropTargets,
					hoverTriggers: this.hoverTriggers,
					hoverTargets: this.hoverTargets
				});

				// Construct new roll instance
				this.sheet.initiateDragRoll(this);

				// Tween draggable element to "dragging"
				this.sheet.playTimelineTo(this.target, "dragging", {maxDuration: 0.5, ease: "elastic"});

				// Tween drop target elements to "bright"
				this.sheet.playTimelineTo(this.rollTargets, "bright", {duration: 1, ease: "sine", stagger: 10}); // 1});

				// Tween invalid target elements to "faded"
				this.sheet.playTimelineTo(this.nonTargets, "faded", {maxDuration: 1, ease: "sine", stagger: 1});

				// Tween hover targets to "visible"
				this.sheet.playTimelineTo(this.hoverTriggers, "visible", {duration: 1, stagger: 2, staggerFrom: "start"});
			},
			onDrag() {
				// Check for a drop target and fire its droppable timeline
				const dropTarget = this.sheet.getDropElem(this);
				if (dropTarget !== this.dropTarget) {
					this.sheet.setDroppable(dropTarget, this.dropTarget);
					this.dropTarget = dropTarget;
				}

				// Check for a mod target and initiate its charge-up timeline
				const modTarget = this.sheet.getModElem(this);
				if (modTarget !== this.modTarget) {
					this.sheet.setModTarget(modTarget, this.modTarget);
					this.modTarget = modTarget;
				}
			},
			onDragEnd() {
				// Temporarily disable this draggable instance while it is repositioned
				this.disable();

				// Check if it's dropped on a valid drop target: If so, launch the roll.
				if (this.dropTarget) {
					this.sheet.dragRoll.launch();
				}
				this.sheet.dragRoll = null;

				// Tween unused drop targets and non-targets to "base"
				this.sheet.playTimelineTo([
					...this.dropTargets,
					...this.nonTargets
				].filter((elem) => elem !== this.dropTarget), "base", {duration: 0.5, ease: "sine", stagger: 5});

				// Fade hover targets to hidden
				this.sheet.playTimelineTo(this.hoverTriggers, "hidden", {duration: 0.5, ease: "sine", stagger: 2});

				window.dragSheet = this.sheet;
				window.hoverTriggers = this.hoverTriggers;

				// Tween drop target into roll animation
				this.sheet.playTimelineTo(this.dropTarget, "base", {duration: 5});

				// Fade-explode draggable item to opacity 0, set position to 0, set timeline position to base, fade in
				this.sheet.playTimelineTo(this.target, "hoverOver", {duration: 1.5, ease: "power2"})
					.then(() => {
						this.sheet.playTimelineTo(this.target, "base", {duration: 0});
						gsap.set(this.target, {x: 0, y: 0});
						$(this.target).removeClass("is-dragging");
						this.enable();
					});
			}
		});
	}
	// #endregion ▄▄▄▄▄ ACTIVATE LISTENERS ▄▄▄▄▄

	// #region ████████ 🔴 RENDER ████████ ~
	render(...args) {
		// Clear saved gsap animations so they can be recreated after sheet re-rendered
		delete this._TIMELINES;
		super.render(...args);
	}
	// #endregion ▄▄▄▄▄ RENDER ▄▄▄▄▄

	// #region ████████ DRAG-ROLLS: Implementation of DragRoll to Construct Rolls Via Drag/Drag-Over/Drop Interactions ████████ ~
	initiateDragRoll(dragger) {
		this.dragRoll = new DragRoll(dragger);
		console.log(this.dragRoll);
	}
	// #region ▓▓▓▓▓▓▓ Getters & Setters ▓▓▓▓▓▓▓ ~
	get dragRoll() { return this._dragRoll ?? false }
	set dragRoll(dRoll) {
		this._dragRoll = dRoll;
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
	getModElem(dragger) {
		const isOverElement = (threshold) => (elem) => dragger.hitTest(elem, `${threshold}%`);
		let [validTargets] = U.partition(dragger.hoverTriggers, isOverElement(50)),
						invalidTargets;
		for (let threshold = 40; threshold >= 0; threshold -= 10) {
			if (validTargets.length <= 1) { break }
			[validTargets, invalidTargets] = U.partition(validTargets, isOverElement(threshold));
		}
		return [...validTargets, ...invalidTargets ?? []].shift();
	}
	// #endregion ▓▓▓▓[Getters & Setters]▓▓▓▓
	// #region ▓▓▓▓▓▓▓[Timelines]▓▓▓▓ Creation & Control ▓▓▓▓▓▓▓ ~
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
		const [labelElem] = $(traitElem).find(".display-name");
		const [rollDescElem] = $(traitElem).find(".roll-desc");
		return gsap.timeline({paused: true, data: {}, defaults: {ease: "none"}})
			.addLabel("faded", 0)
			.fromTo(traitElem, {
				autoAlpha: 0.25,
				scale: 1
			}, {
				autoAlpha: 1
			})
			.fromTo(labelElem, {
				autoAlpha: 1,
				scale: 0.9,
				color: C.html.colors.fg,
				textShadow: C.html.shadows.traitShadow
			}, {scale: 1}, "<")
			.fromTo(rollDescElem, {
				autoAlpha: 0,
				scaleX: 0
			}, {
				scaleX: 0.1
			}, "<")
			.addLabel("base")
			.to(labelElem, {
				color: C.html.colors.fgBright,
				scale: 1.15
			})
			.addLabel("bright")
			.to(labelElem, {
				color: C.html.colors[`${type}Dark`],
				scale: 1.25,
				textShadow: C.html.shadows[`${type}Hover`]
			})
			.addLabel("hoverOver")
			.to(labelElem, {
				color: C.html.colors.bgDark,
				scale: 1.5,
				textShadow: C.html.shadows.dropTarget
			})
			.addLabel("dropTarget")
			.to(labelElem, {
				color: C.html.colors[`${type}Dark`],
				scale: 1,
				textShadow: C.html.shadows[`${type}Hover`]
			})
			.to(rollDescElem, {
				autoAlpha: 1,
				scaleX: 1
			}, "<")
			.to(traitElem, {
				scale: 2
			}, "<")
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

		const timeline = gsap.timeline({paused: true, data: {}, defaults: {ease: "none"}})
			.addLabel("hidden")
			.fromTo([modElem, iconElem, videoElem], {
				autoAlpha: 0,
				scale: 1,
				textShadow: 0,
				outline: 0
			}, {
				autoAlpha: 0.75,
				scale: 0.8,
				stagger: 0.25
			}, 0)
			.fromTo(triggerAnimElem, {
				autoAlpha: 0,
				scale: 0,
				textShadow: 0,
				outline: 0
			}, {
				scale: 0.1
			}, 0)
			.fromTo(labelElem, {
				autoAlpha: 0,
				scale: 1,
				textShadow: 0,
				outline: 0
			}, {
				autoAlpha: 1,
				textShadow: C.html.shadows[`${action}HoverTrigger`],
				delay: 0.5
			}, 0)
			.addLabel("visible")
			.to([modElem, iconElem, videoElem], {
				autoAlpha: 1,
				scale: 1,
				duration: 0.1
			})
			.to(labelElem, {
				keyframes: [
					{scale: 1, outline: 0},
					{scale: 1.25, outline: 0},
					{scale: 1, outline: 0},
					{scale: 1, outline: `3px solid ${C.html.colors[`${action}HoverTrigger`]}`}
				],
				duration: 0.1
			}, "<")
			.addLabel("startCycle");
		timeline.call(() => {
				if (!timeline.reversed()) {
					videoElem.currentTime = 0;
					videoElem.play();
				}
			})
			.to(iconElem, {
				keyframes: [
					{scale: 1},
					{scale: 0.75},
					{scale: 1},
					{scale: 5},
					{scale: 1}
				],
				ease: "sine.inOut",
				duration: videoElem.duration
			}, "<")
			.fromTo(triggerAnimElem, {
				autoAlpha: 0,
				scale: 0
			}, {
				autoAlpha: 0.75,
				scale: 1,
				ease: "power2.in",
				duration: videoElem.duration,
				onCompleteParams: [this],
				onComplete(roll) {
					if (!timeline.reversed() && timeline.data.targetLabel === "endCycle") {
						roll.triggerModTarget(modElem);
					}
				}
			}, "<")
			.call(() => {
				if (!timeline.reversed() && timeline.data.targetLabel === "endCycle") {
					videoElem.currentTime = 0;
				}
			})
			.to(videoElem, {
				autoAlpha: 0,
				duration: 0.25
			})
			.to(triggerAnimElem, {
				keyframes: [
					{autoAlpha: 0.75, duration: 0.25},
					{autoAlpha: 1, duration: 0.25},
					{autoAlpha: 0, duration: 0.5}
				],
				ease: "power4.out"
			}, "<")
			.to(triggerAnimElem, {
				scale: 10,
				ease: "power4.out",
				duration: 1
			}, "<")
			.to(triggerAnimElem, {
				scale: 1,
				duration: 0
			})
			.call(() => {
				if (!timeline.reversed() && timeline.data.targetLabel === "endCycle") {
					this.playTimelineTo(modElem, "endCycle", {from: "startCycle", maxDuration: 20});
				}
			})
			.addLabel("endCycle")
			.seek("hidden");

		return timeline;
	}

	playTimelineTo(tlRef, label, {from, minDuration = 0, maxDuration = 0.5, duration, ease, stagger = 0, staggerFrom = "random"} = {}) {
		const timelines = this.getTimelines(tlRef)
			.map((timeline) => {
				if (timeline) {
					const curLabel = from ?? timeline.currentLabel();
					if (timeline.labels[curLabel] >= timeline.labels[label]) {
						timeline.reversed(true);
					} else {
						timeline.reversed(false);
					}
					timeline.data.targetLabel = label;
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
	// #endregion ▓▓▓▓[Timelines]▓▓▓▓
	// #region ▓▓▓▓▓▓▓[Triggers]▓▓▓▓ Events Triggering Timeline Control ▓▓▓▓▓▓▓ ~
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
	setDroppable(newTarget, oldTarget) {
		[newTarget, oldTarget] = U.getElems(newTarget, oldTarget);
		console.log("SET DROPPABLE", {
			oldTarget,
			newTarget,
			oldTrait: oldTarget && !$(oldTarget).hasClass("trait-label-bg")
				? $(oldTarget).data("trait")
				: false,
			newTrait: newTarget && !$(newTarget).hasClass("trait-label-bg")
				? $(newTarget).data("trait")
				: false
		});
		if (oldTarget && !$(oldTarget).hasClass("trait-label-bg")) {
			this.playTimelineTo(oldTarget, "bright");
			this.dragRoll.removeTrait($(oldTarget).data("trait"));
		}
		if (newTarget && !$(newTarget).hasClass("trait-label-bg")) {
			this.playTimelineTo(newTarget, "dropTarget", {duration: 0.25});
			this.dragRoll.addTrait($(newTarget).data("trait"));
		}
	}
	setModTarget(newTarget, oldTarget) {
		[newTarget, oldTarget] = U.getElems(newTarget, oldTarget);
		if (oldTarget) {
			this.playTimelineTo(oldTarget, "visible", {maxDuration: 0.25});
		}
		if (newTarget) {
			gsap.timeline()
				.add(this.playTimelineTo(newTarget, "startCycle", {maxDuration: 0.25}))
				.call(() => this.playTimelineTo(newTarget, "endCycle", {maxDuration: 20}));
		}
	}
	triggerModTarget(modTarget) {
		const action = $(modTarget).data("action");
		switch (action) {
			case "add": {
				this.dragRoll.add(modTarget);
				break;
			}
			case "toWidth": {
				this.dragRoll.toWidth();
				break;
			}
			case "toHeight": {
				this.dragRoll.toHeight();
				break;
			}
			case "reset": {
				this.dragRoll.reset();
				break;
			}
			// no default
		}
	}
	// #endregion ▓▓▓▓[Triggers]▓▓▓▓
	// #region ▓▓▓▓▓▓▓[Launch Roll]▓▓▓▓ Interfacing With Foundry Roller on Roll Complete ▓▓▓▓▓▓▓ ~
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
	// #endregion ▓▓▓▓[Launch Roll]▓▓▓▓
	// #endregion ▄▄▄▄▄ DRAG-ROLLS ▄▄▄▄▄

	// #region ████████ TRAIT GRID: Radial Menu, Dot Animations, Demonic Influence ████████ ~
	// #region ▓▓▓▓▓▓▓ Trait Data Retrieval ▓▓▓▓▓▓▓ ~
	_getTraitPairData(trait) {
		const [tNameA, tNameB] = C.sinister.includes(trait) ? [trait, C.traitPairs[trait]] : [C.traitPairs[trait], trait];
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
				isPrimary: false,
				radialSize: C.menuRadius[C.strategies.includes(tNameA) ? "strategy" : "tactic"]
			}
		];
		console.log(`getTraitPairData(${trait})`, {sinister: dataSet[0], virtuous: dataSet[1]});
		return dataSet;
	}
	// _getTraitData(trait) {
	// 	const [sinisterData, virtuousData] = this._getTraitPairData(trait);

		
	// }
	// #endregion ▓▓▓▓[Trait Data Retrieval]▓▓▓▓
	// #region ▓▓▓▓▓▓▓ Trait Radial Menu ▓▓▓▓▓▓▓ ~

	
	_updateRadialButtons(trait) {
		trait = C.virtuousTraitPairs[trait] ?? trait;
		const [top, bottom] = this._getTraitPairData(trait);
		U.objForEach({
			"button.button-top.button-add-drop": {
				"active-add": top.canAdd,
				"active-drop": top.canDrop
			},
			"button.button-bottom.button-add-drop": {
				"active-add": bottom.canAdd,
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
		const [posElem] = $(event.currentTarget).find(".menu-positioner");
		if ($(posElem).find(".radial-menu").hasClass("active")) { return }
		gsap.set(posElem, {xPercent: -50, yPercent: -50, x: event.offsetX, y: event.offsetY});
		$(posElem).find("video").each(function playVideo() { this.play() });
		$(posElem).find(".radial-menu").addClass("active");
	}
	_closeRadialMenu(event) {
		event.preventDefault();
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
		const traitData = this._getTraitPairData(target).find(({name}) => name === target);
		const action = {
			click: clickaction,
			contextmenu: contextaction
		}[event.type];
		console.log({CHANGETRAIT: event, clickaction, contextaction, target, data, action, traitData});
		switch (action) {
			case "add": {
				if (traitData.canAdd) {
					const targetVal = Math.min(traitData.max, traitData.value + 1);
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
	// #endregion ▓▓▓▓[Trait Radial Menu]▓▓▓▓
	// #region ▓▓▓▓▓▓▓ Dot Animations ▓▓▓▓▓▓▓ ~
	_getAddDropDot(trait, dot, isEmptying = false) {
		const dot$ = this.$.find(`.dot-line[data-trait="${trait}"] > .dot-${dot}`);
		const cell$ = dot$.parents(".trait-cell");
		let anim$ = cell$.find(`.dot-${dot}.add-drop`);
		if (anim$.length > 0) {
			console.log(`Existing Animation Dot: ${trait}-${dot}`);
			return anim$;
		}
		console.log(`Creating Animation Dot: ${trait}-${dot}`);
		anim$ = dot$.clone().addClass("add-drop").css({background: "cyan"}).appendTo(cell$);
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
		const timeline = gsap.timeline({
			paused: true,
			onComplete() {
				dot$.addClass("full");
				anim$.remove();
			},
			onReverseComplete() {
				dot$.removeClass("full");
				anim$.remove();
			}
		})
			.from(anim$, {
				scale: 10,
				autoAlpha: 0,
				ease: "sine",
				duration: 0.75
			}, 0);
		if (isEmptying) {
			timeline.seek(timeline.duration());
		}
		anim$.data("timeline", timeline);
		return anim$;
	}
	_fillDot(trait, dot) {
		console.log(`Filling ${trait}-${dot}`);
		// const dot$ = $(`#actor-${this.actor.id} .dot-line.${C.sinister.includes(trait) ? "sinister" : "virtuous"} #${trait}-${dot}`);
		// const cell$ = dot$.parents(".trait-cell");
		// let anim$ = $(`#actor-${this.actor.id} .trait-cell > #${trait}-${dot}`);
		// console.log({dot: dot$[0], cell: cell$[0], anim: anim$[0]});
		// console.log({dot: dot$[0]?.id, cell: cell$[0]?.id, anim: anim$[0]?.id});
		const anim$ = this._getAddDropDot(trait, dot);
		const timeline = anim$.data("timeline");
		timeline.reversed(false);
		timeline.resume();
	}
	_emptyDot(trait, dot) {
		console.log(`Emptying ${trait}-${dot}`);
		// const dot$ = $(`#actor-${this.actor.id} .dot-line > #${trait}-${dot}`);
		// const cell$ = dot$.parents(".trait-cell");
		// let anim$ = $(`#actor-${this.actor.id} .trait-cell > #${trait}-${dot}`);
		// console.log({dot$, cell$, anim$});
		const anim$ = this._getAddDropDot(trait, dot, true);
		const timeline = anim$.data("timeline");
		timeline.reversed(true);
		timeline.resume();
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
	// #endregion ▓▓▓▓[Dot Animations]▓▓▓▓
	// #region ▓▓▓▓▓▓▓ Demonic Influence ▓▓▓▓▓▓▓ ~
	async _setPrimarySinister(event) {
		const strategy = event.currentTarget.dataset.trait;
		await this.actor.update({"data.primaryStrategy": strategy});
	}
	// #endregion ▓▓▓▓[Demonic Influence]▓▓▓▓
	// #endregion ▄▄▄▄▄ TRAIT GRID ▄▄▄▄▄
}
// #endregion 🟥🟥🟥 BetterAngelsActorSheet 🟥🟥🟥

// #region ████████ EXPORTS ████████ ~
export default BetterAngelsActorSheet;
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
	},
	{
		name: "iconFadeIn",
		effect: (targets, config) => gsap.fromTo(targets, {
			scale: 3,
			autoAlpha: 0,
			x: 30,
			y: -30
		}, {
			scale: 1,
			autoAlpha: 1,
			x: 0,
			y: 0,
			duration: config.duration,
			ease: config.ease,
			stagger: config.stagger
		}),
		defaults: {duration: 0.5, ease: "back(2)", stagger: 0.25},
		extendTimeline: true
	}
];
// #endregion ▄▄▄▄▄ EXPORTS ▄▄▄▄▄