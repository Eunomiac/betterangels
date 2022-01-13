/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌█████████████████████ MIT License █ v0.0.1-prealpha █  ████████████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

// ████████ IMPORTS ████████
import {
	// ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮
	BETTERANGELS, C,
	// ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮
	gsap,
	Dragger,
	InertiaPlugin,
	MotionPathPlugin,
	GSDevTools,
	RoughEase,
	SlowMo, // GreenSock Animation Platform
	// ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮
	loadHandlebars,
	U,
	// ▮▮▮▮▮▮▮[Actors]▮▮▮▮▮▮▮
	BetterAngelsActor,
	BetterAngelsActorSheet,
	HellboundActorSheet,
	MinorNPCSheet,
	MobNPCSheet,
	// ▮▮▮▮▮▮▮[Items]▮▮▮▮▮▮▮
	BetterAngelsItem,
	BetterAngelsItemSheet,
	// ▮▮▮▮▮▮▮[XCircles]▮▮▮▮▮▮▮
	XElem,
	XCircle,
	XItem,
	XDie,
	XSnap
} from "./helpers/bundler.mjs";

gsap.registerPlugin(
	Dragger,
	InertiaPlugin,
	MotionPathPlugin,
	GSDevTools,
	RoughEase,
	SlowMo
);

// ████████ ON INIT: On-Initialization Hook ████████
Hooks.once("init", async () => {
	console.log("STARTING BETTER ANGELS");

	// ▮▮▮▮▮▮▮[Configuration] Apply Configuration Settings ▮▮▮▮▮▮▮
	CONFIG.BETTERANGELS = BETTERANGELS;

	// ▮▮▮▮▮▮▮[Documents] Register & Apply Document & Sheet Extensions ▮▮▮▮▮▮▮
	game.betterangels = {
		BetterAngelsActor,
		BetterAngelsItem
	};
	CONFIG.Actor.documentClass = BetterAngelsActor;
	CONFIG.Item.documentClass = BetterAngelsItem;
	CONFIG.TinyMCE.content_css = ["systems/betterangels/tinymce.css"];

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

	// ▮▮▮▮▮▮▮[Handlebars] Preload Handlebars Templates & Register Custom Helpers ▮▮▮▮▮▮▮
	return loadHandlebars();
});

// ████████ ONDROPACTORSHEETDATA: on-dropActorSheetData Hook ████████
Hooks.on("preCreateItem", async (item, itemData) => {

});
