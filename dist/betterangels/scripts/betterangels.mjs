/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌█████████████████████ MIT License █ v0.0.1-prealpha █  ████████████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

// ████████ IMPORTS ████████
import {
	// ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮
	BETTERANGELS,
	// ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮
	gsap,
	Dragger,
	InertiaPlugin,
	MotionPathPlugin,
	GSDevTools,
	RoughEase, // GreenSock Animation Platform
	// ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮
	preloadTemplates,
	registerHelpers,
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

gsap.registerPlugin(Dragger, InertiaPlugin, MotionPathPlugin, GSDevTools);

// ████████ ON INIT: On-Initialization Hook ████████
Hooks.once("init", async () => {
	console.log("STARTING BETTER ANGELS");

	// ▮▮▮▮▮▮▮[Configuration] Apply Configuration Settings ▮▮▮▮▮▮▮
	CONFIG.BETTERANGELS = BETTERANGELS;

	// ▮▮▮▮▮▮▮[Classes] Register & Apply Class Extensions ▮▮▮▮▮▮▮
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

	// ▮▮▮▮▮▮▮[Handlebars] Preload Handlebars Templates & Register Custom Helpers ▮▮▮▮▮▮▮
	await registerHelpers();
	return preloadTemplates();
});
