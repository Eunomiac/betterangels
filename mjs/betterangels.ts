// #region ████████ IMPORTS ████████ ~
import {
	// #region ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮ ~
	BETTERANGELS,
	// #endregion ▮▮▮▮[Constants]▮▮▮▮
	// #region ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮ ~
	gsap,
	Dragger,
	InertiaPlugin,
	MotionPathPlugin,
	GSDevTools,
	RoughEase,
	SlowMo, // GreenSock Animation Platform
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
	SlowMo
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
		makeDefault: true,
		types: ["power"],
		label: "ba.sheet.powerSheet"
	});
	Items.registerSheet("betterangels", BetterAngelsItemSheet, {
		makeDefault: true,
		types: ["aspect"],
		label: "ba.sheet.aspectSheet"
	});
	Items.registerSheet("betterangels", BetterAngelsItemSheet, {
		makeDefault: true,
		types: ["device"],
		label: "ba.sheet.deviceSheet"
	});
	// #endregion ▮▮▮▮[Classes]▮▮▮▮

	// #region ▮▮▮▮▮▮▮[Handlebars] Preload Handlebars Templates & Register Custom Helpers ▮▮▮▮▮▮▮
	return loadHandlebars();
	// #endregion ▮▮▮▮[Handlebars]▮▮▮▮
});
// #endregion ▄▄▄▄▄ ON INIT ▄▄▄▄▄

/*DEVCODE*/
const initDragTest = (traitName = "courage") => {
	gsap.set(".trait-pair .draggable", {opacity: 0});
	const [elem, newParent, oldParent] = [
		$(`#trait-label-${U.lCase(traitName)} .draggable`)[0],
		$("#x-container")[0],
		$(`#trait-label-${U.lCase(traitName)}`)[0]
	];
	if (elem) {
		window.elem = elem;
		gsap.set(elem, {opacity: 1});
		window.dragElem = Dragger.get(elem);
	}
	if (newParent) {
		window.newParent = newParent;
	}
	if (oldParent) {
		window.oldParent = oldParent;
	}
};

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
		initDragTest,
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
		getPos: U.getPos,
		pause: () => gsap.globalTimeline.pause(),
		play: () => gsap.globalTimeline.play(),
		XContainer: XElem.CONTAINER
	}).forEach(([key, ref] : [string, any]) => {
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
// Hooks.on("preCreateItem", (item : Item, itemData : {}) => {

// });
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
