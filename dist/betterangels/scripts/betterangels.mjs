/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Oct 20 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

// ████████ IMPORTS ████████
// ▮▮▮▮▮▮▮ GreenSock ▮▮▮▮▮▮▮
import gsap, {
  Draggable as Dragger,
  InertiaPlugin,
  MotionPathPlugin
} from "/scripts/greensock/esm/all.js";
import {
// ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮
  BETTERANGELS,
  // ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮
  preloadTemplates, U,
  // ▮▮▮▮▮▮▮[Actors]▮▮▮▮▮▮▮
  BetterAngelsActor,
  BetterAngelsActorSheet, HellboundActorSheet, DemonCompanionSheet, MajorNPCSheet, MinorNPCSheet,
  // ▮▮▮▮▮▮▮[Items]▮▮▮▮▮▮▮
  BetterAngelsItem,
  BetterAngelsItemSheet,
  // ▮▮▮▮▮▮▮[XCircles]▮▮▮▮▮▮▮
  XCircle,
  XItem, XDie, XSnap
} from "./helpers/bundler.mjs";

gsap.registerPlugin(Dragger, InertiaPlugin, MotionPathPlugin);

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
  Actors.registerSheet("betterangels", HellboundActorSheet, {makeDefault: true, types: ["hellbound"], label: "ba.sheet.hellboundSheet"});
  Actors.registerSheet("betterangels", DemonCompanionSheet, {makeDefault: false, types: ["hellbound"], label: "ba.sheet.demonSheet"});
  Actors.registerSheet("betterangels", MajorNPCSheet, {makeDefault: false, types: ["majornpc"], label: "ba.sheet.majorNPCSheet"});
  Actors.registerSheet("betterangels", MinorNPCSheet, {makeDefault: false, types: ["minornpc"], label: "ba.sheet.minorNPCSheet"});

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("betterangels", BetterAngelsItemSheet, {makeDefault: true});

  // ▮▮▮▮▮▮▮[Handlebar Templates] Preload Handlebars Templates ▮▮▮▮▮▮▮
  return preloadTemplates();

});
