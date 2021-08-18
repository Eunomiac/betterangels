// #region ▒░▒░▒░▒[IMPORTS] Importing Modules ▒░▒░▒░▒
// #region ░░░░░░░[CONSTANTS]░░░░ Globally-Accessible Constants, Settings, Configuration ░░░░░░░
import {BETTERANGELS} from "./helpers/config.mjs";
// #endregion ░░░░[CONSTANTS]░░░░
// #region ░░░░░░░[UTILITIES]░░░░ Utility Functions ░░░░░░░
import {preloadHandlebarsTemplates} from "./helpers/templates.mjs";
// #endregion ░░░░[UTILITIES]░░░░
// #region ░░░░░░░[CLASSES]░░░░ Foundry Class Extensions ░░░░░░░
import {BetterAngelsActor} from "./documents/actor.mjs";
import {BetterAngelsItem} from "./documents/item.mjs";
import {BetterAngelsActorSheet} from "./sheets/actor-sheet.mjs";
import {BetterAngelsItemSheet} from "./sheets/item-sheet.mjs";
// #endregion ░░░░[CLASSES]░░░░
// #endregion ▒▒▒▒[IMPORTS]▒▒▒▒

// #region ████████ ON INIT: On-Initialization Hook ████████
Hooks.once("init", async () => {
    CONFIG.BETTERANGELS = BETTERANGELS; // Apply Configuration Settings

    // #region ░░░░░░░[CLASSES]░░░░ Register & Apply Class Extensions ░░░░░░░
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
    // #endregion ░░░░[CLASSES]░░░░

    return preloadHandlebarsTemplates(); // Preload Handlebars templates.
});
// #endregion ▄▄▄▄▄ ON INIT ▄▄▄▄▄
// #region ████████ ON READY: On-Ready Hook ████████
Hooks.once("ready", async () => {

});
// #endregion ▄▄▄▄▄ ON READY ▄▄▄▄▄

// #region ████████ HANDLEBARS: Custom Handlebar Helpers ████████
// #endregion ▄▄▄▄▄ HANDLEBARS ▄▄▄▄▄