/* ****▌████████████████████████████████████████████████████████████▐**** *\
|*     ▌█░░░░      System Core: Initialization & Setup         ░░░░█▐     *|
|*     ▌███████████████████v@@VERSION@@██@@DATE@@███████████████████▐     *|
|*     ▌█████░░░░ https://github.com/Eunomiac/betterangels ░░░░█████▐     *|
\* ****▌████████████████████████████████████████████████████████████▐**** */

// #region ████████ IMPORTS: Importing Modules ████████ ~
// #region ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮ ~
import {BETTERANGELS} from "./helpers/config.mjs";
// #endregion ▮▮▮▮[Constants]▮▮▮▮
// #region ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮ ~
import {preloadHandlebarsTemplates} from "./helpers/templates.mjs";
// #endregion ▮▮▮▮[Utility]▮▮▮▮
// #region ▮▮▮▮▮▮▮[Classes]▮▮▮▮▮▮▮ ~
import {BetterAngelsActor} from "./documents/actor.mjs";
import {BetterAngelsActorSheet} from "./sheets/actor-sheet.mjs";
import {HellboundActorSheet} from "./sheets/actor-hellbound-sheet.mjs";
import {DemonCompanionSheet} from "./sheets/actor-demon-sheet.mjs";
import {MajorNPCSheet} from "./sheets/actor-majornpc-sheet.mjs";
import {MinorNPCSheet} from "./sheets/actor-minornpc-sheet.mjs";

import {BetterAngelsItem} from "./documents/item.mjs";
import {BetterAngelsItemSheet} from "./sheets/item-sheet.mjs";
// #endregion ▮▮▮▮[Classes]▮▮▮▮
/*DB*/
// #region ▮▮▮▮▮▮▮[Debug]▮▮▮▮▮▮▮ ~
import {BetterAngelsDebugger} from "./debug/debugger.mjs";
// #endregion ▮▮▮▮[Debug]▮▮▮▮
// #endregion ▄▄▄▄▄ IMPORTS ▄▄▄▄▄
console.log("STARTING BETTER ANGELS");
/*!DB*/
// #region ████████ ON INIT: On-Initialization Hook ████████
Hooks.once("init", async () => {

    // #region ▮▮▮▮▮▮▮[Configuration] Apply Configuration Settings ▮▮▮▮▮▮▮
    CONFIG.BETTERANGELS = BETTERANGELS;
    // #endregion ▮▮▮▮[Configuration]▮▮▮▮

    // #region ▮▮▮▮▮▮▮[Classes] Register & Apply Class Extensions ▮▮▮▮▮▮▮
    game.betterangels = {
        BetterAngelsActor,
        BetterAngelsItem/*DB*/,
        "debug": true,
        "debugger": BetterAngelsDebugger/*!DB*/
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
    // #endregion ▮▮▮▮[Classes]▮▮▮▮

    // #region ▮▮▮▮▮▮▮[Handlebar Templates] Preload Handlebars Templates ▮▮▮▮▮▮▮
    return preloadHandlebarsTemplates();
    // #endregion ▮▮▮▮[Handlebar Templates]▮▮▮▮

});
// #endregion ▄▄▄▄▄ ON INIT ▄▄▄▄▄
// #region ████████ ON READY: On-Ready Hook ████████ ~
Hooks.once("ready", async () => {

});
// #endregion ▄▄▄▄▄ ON READY ▄▄▄▄▄

// #region ████████ HANDLEBARS: Custom Handlebar Helpers ████████ ~
/** Handlebars.registerHelper("concat", (...args) => {
    let outStr = "";

    for (const arg in args) {
        if (typeof args[arg] !== "object") {
            outStr += args[arg];
        }
    }

    return outStr;
});
Handlebars.registerHelper("toLowerCase", (str) => str.toLowerCase()); **/
// #endregion ▄▄▄▄▄ HANDLEBARS ▄▄▄▄▄