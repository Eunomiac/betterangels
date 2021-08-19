// #region ████████ IMPORTS: Importing Modules ████████ ~
// #region ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮ ~
import {BETTERANGELS} from "./helpers/config.mjs";
// #endregion ▮▮▮▮[Constants]▮▮▮▮
// #region ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮ ~
import {preloadHandlebarsTemplates} from "./helpers/templates.mjs";
// #endregion ▮▮▮▮[Utility]▮▮▮▮
// #region ▮▮▮▮▮▮▮[Classes]▮▮▮▮▮▮▮ ~
import {BetterAngelsActor} from "./documents/actor.mjs";
import {BetterAngelsItem} from "./documents/item.mjs";
import {BetterAngelsActorSheet} from "./sheets/actor-sheet.mjs";
import {BetterAngelsItemSheet} from "./sheets/item-sheet.mjs";
// #endregion ▮▮▮▮[Classes]▮▮▮▮
// #endregion ▄▄▄▄▄ IMPORTS ▄▄▄▄▄

// #region ████████ ON INIT: On-Initialization Hook ████████
Hooks.once("init", async () => {

    // #region ▮▮▮▮▮▮▮[Configuration] Apply Configuration Settings ▮▮▮▮▮▮▮
    CONFIG.BETTERANGELS = BETTERANGELS;
    // #endregion ▮▮▮▮[Configuration]▮▮▮▮

    // #region ▮▮▮▮▮▮▮[Classes] Register & Apply Class Extensions ▮▮▮▮▮▮▮
    game.betterangels = {
        BetterAngelsActor,
        BetterAngelsItem
    };
    CONFIG.Actor.documentClass = BetterAngelsActor;
    CONFIG.Item.documentClass = BetterAngelsItem;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("betterangels", BetterAngelsActorSheet, {makeDefault: true});
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