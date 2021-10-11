/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Oct 11 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

// ████████ IMPORTS: Importing Modules ████████
// ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮
import BETTERANGELS from "./helpers/config.mjs";

// ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮
import preloadHandlebarsTemplates from "./helpers/templates.mjs";
import testCircles from "./documents/dragCircle.mjs";
import U from "./helpers/utilities.mjs";

// ▮▮▮▮▮▮▮[Classes]▮▮▮▮▮▮▮
import BetterAngelsActor from "./documents/actor.mjs";
import BetterAngelsActorSheet from "./sheets/actor-sheet.mjs";
import HellboundActorSheet from "./sheets/actor-hellbound-sheet.mjs";
import DemonCompanionSheet from "./sheets/actor-demon-sheet.mjs";
import MajorNPCSheet from "./sheets/actor-majornpc-sheet.mjs";
import MinorNPCSheet from "./sheets/actor-minornpc-sheet.mjs";
import BetterAngelsItem from "./documents/item.mjs";
import BetterAngelsItemSheet from "./sheets/item-sheet.mjs";
import BARoll from "./documents/rollPool.mjs";

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
  return preloadHandlebarsTemplates();

});