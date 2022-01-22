// #region ████████ IMPORTS ████████ ~
import {
	// #region ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮ ~
	BETTERANGELS, C,
	// #endregion ▮▮▮▮[Constants]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮ ~
	gsap,
	Dragger,
	InertiaPlugin,
	MotionPathPlugin,
	GSDevTools,
	RoughEase,
	SlowMo,
	CSSPlugin, // GreenSock Animation Platform
	// #endregion ▮▮▮▮[External Libraries]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮ ~
	loadHandlebars,
	U,
	// #endregion ▮▮▮▮[Utility]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Actors]▮▮▮▮▮▮▮ ~
	BetterAngelsActor,
	BetterAngelsActorSheet,
	HellboundActorSheet,
	MinorNPCSheet,
	MobNPCSheet,
	// #endregion ▮▮▮▮[Actors]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Items]▮▮▮▮▮▮▮ ~
	BetterAngelsItem,
	BetterAngelsItemSheet,
	// #endregion ▮▮▮▮[Items]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Hooks]▮▮▮▮▮▮▮ ~
	ActorSheetHooks,
	// #endregion ▮▮▮▮[Hooks]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Hooks]▮▮▮▮▮▮▮ ~
	ActorSheetEffects,
	// #endregion ▮▮▮▮[Hooks]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[XCircles]▮▮▮▮▮▮▮ ~
	XElem,
	XCircle,
	XItem,
	XDie,
	XSnap
	// #endregion ▮▮▮▮[XCircles]▮▮▮▮
} from "./helpers/bundler.mjs";

/*DEVCODE*/ import BA_DB from "./helpers/debug.mjs"; /*!DEVCODE*/

gsap.registerPlugin(
	Dragger,
	InertiaPlugin,
	MotionPathPlugin,
	GSDevTools,
	RoughEase,
	SlowMo,
	CSSPlugin
);

// #endregion ▄▄▄▄▄ IMPORTS ▄▄▄▄▄

/*DEVCODE*/ console.log("STARTING BETTER ANGELS"); /*!DEVCODE*/

// #region ████████ ON INIT: On-Initialization Hook ████████
Hooks.once("init", async () => {
	console.log("STARTING BETTER ANGELS");

	// #region ▮▮▮▮▮▮▮[Configuration] Apply Configuration Settings ▮▮▮▮▮▮▮
	CONFIG.BETTERANGELS = BETTERANGELS;
	// #endregion ▮▮▮▮[Configuration]▮▮▮▮

	// #region ▮▮▮▮▮▮▮[Documents] Register & Apply Document & Sheet Extensions ▮▮▮▮▮▮▮
	game.betterangels = {
		BetterAngelsActor,
		BetterAngelsItem
	};
	CONFIG.Actor.documentClass = BetterAngelsActor;
	CONFIG.Item.documentClass = BetterAngelsItem;
	CONFIG.TinyMCE.content_css.push("systems/betterangels/tinymce.css");

	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("betterangels", HellboundActorSheet, {
		makeDefault: true,
		types: ["hellbound"],
		label: "ba.sheet.hellboundSheet"
	});
	Actors.registerSheet("betterangels", MinorNPCSheet, {
		makeDefault: false,
		types: ["minornpc"],
		label: "ba.sheet.minorNPCSheet"
	});
	Actors.registerSheet("betterangels", MobNPCSheet, {
		makeDefault: false,
		types: ["mobnpc"],
		label: "ba.sheet.mobNPCSheet"
	});

	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("betterangels", BetterAngelsItemSheet, {
		makeDefault: true
	});
	// #endregion ▮▮▮▮[Classes]▮▮▮▮

	// #region ▮▮▮▮▮▮▮[Handlebars] Preload Handlebars Templates & Register Custom Helpers ▮▮▮▮▮▮▮
	return loadHandlebars();
	// #endregion ▮▮▮▮[Handlebars]▮▮▮▮
});
// #endregion ▄▄▄▄▄ ON INIT ▄▄▄▄▄

// #region ████████ REGISTER MODULAR HOOKS: Register Hooks From Other Modules ████████
U.registerHooks([ActorSheetHooks]);
// #endregion ▄▄▄▄▄ REGISTER MODULAR HOOKS ▄▄▄▄▄

// #region ████████ REGISTER MODULAR EFFECTS: Register GSAP Effects From Other Modules ████████
U.registerEffects([ActorSheetEffects]);
// #endregion ▄▄▄▄▄ REGISTER MODULAR EFFECTS ▄▄▄▄▄

/*DEVCODE*/
Hooks.once("ready", () => {
	window.REF = game.betterangels;
	window.DB = new BA_DB({
		topLeft: 10,
		botLeft: 5,
		topRight: 6,
		botRight: 4
	});
	/* eslint-disable sort-keys */
	Object.entries({
		C,
		U,
		BetterAngelsActor,
		BetterAngelsActorSheet,
		HellboundActorSheet,
		MinorNPCSheet,
		BetterAngelsItem,
		BetterAngelsItemSheet,
		XElem,
		XCircle,
		XItem,
		XDie,
		XSnap,
		gsap,
		MotionPathPlugin,
		Dragger,
		GSDevTools,
		ORE: game.oneRollEngine,
		getPos: U.getPos,
		pause: () => gsap.globalTimeline.pause(),
		play: () => gsap.globalTimeline.play(),
		XContainer: XElem.CONTAINER
	}).forEach(([key, ref]) => {
		window[key] = ref;
	});
	/* eslint-enable sort-keys */
});
/*!DEVCODE*/