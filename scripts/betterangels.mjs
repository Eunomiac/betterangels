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
	RoughEase, // GreenSock Animation Platform
	// #endregion ▮▮▮▮[External Libraries]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮ ~
	preloadTemplates,
	registerHelpers,
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
	// #region ▮▮▮▮▮▮▮[XCircles]▮▮▮▮▮▮▮ ~
	XElem,
	XCircle,
	XItem,
	XDie,
	XSnap
	// #endregion ▮▮▮▮[XCircles]▮▮▮▮
} from "./helpers/bundler.mjs";

/*DEVCODE*/ import BA_DB from "./helpers/debug.mjs"; /*!DEVCODE*/

gsap.registerPlugin(Dragger, InertiaPlugin, MotionPathPlugin, GSDevTools);

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
	await registerHelpers();
	return preloadTemplates();
	// #endregion ▮▮▮▮[Handlebars]▮▮▮▮
});
// #endregion ▄▄▄▄▄ ON INIT ▄▄▄▄▄

/*DEVCODE*/
Hooks.once("ready", () => {

	$(".notification.error.permanent").remove();
	window.REF = game.betterangels;
	window.DB = new BA_DB({
		topLeft: 10,
		botLeft: 5,
		topRight: 6,
		botRight: 4
	});
	Object.entries({
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
		GSDevTools,
		pause: () => gsap.globalTimeline.pause(),
		play: () => gsap.globalTimeline.play()
	}).forEach(([key, ref]) => {
		window[key] = ref;
	});
	return;

	window.DB.setDBCircle(window.CIRCLES[0]);
	window.DB.showAngles(window.CIRCLES[0], 8, true);
	// DB.addDieWatch(["dbRelPos"]);
	window.DB.addDieWatch(["pathPos", "targetPathPos"]);
	window.DB.addDieWatch(["dbAbsAngle", "dbRelAngle"]);
	// DB.addDieWatch(["dbAbsPos"]);
	// DB.setDBDie(window.CIRCLES[1].slots[2]);
	// DB.showDieData(window.CIRCLES[1]);
});
/*!DEVCODE*/

// #region ████████ ONDROPACTORSHEETDATA: on-dropActorSheetData Hook ████████ ~
Hooks.on("preCreateItem", async (item, itemData) => {

});
// #endregion ▄▄▄▄▄ ON READY ▄▄▄▄▄
/**
// #region ████████ HANDLEBARS: Custom Handlebar Helpers ████████ ~
Handlebars.registerHelper("concat", (...args) => {
    let outStr = "";

    for (const arg in args) {
        if (typeof args[arg] !== "object") {
            outStr += args[arg];
        }
    }

    return outStr;
});
Handlebars.registerHelper("toLowerCase", (str) => str.toLowerCase());
// #endregion ▄▄▄▄▄ HANDLEBARS ▄▄▄▄▄ **/
