// ████████ IMPORTS: Importing Modules ████████
// ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮
import {BETTERANGELS} from "./helpers/config.mjs";

// ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮
import {preloadHandlebarsTemplates} from "./helpers/templates.mjs";

// ▮▮▮▮▮▮▮[Classes]▮▮▮▮▮▮▮
import {BetterAngelsActor} from "./documents/actor.mjs";
import {BetterAngelsItem} from "./documents/item.mjs";
import {BetterAngelsActorSheet} from "./sheets/actor-sheet.mjs";
import {BetterAngelsItemSheet} from "./sheets/item-sheet.mjs";

// ████████ ON INIT: On-Initialization Hook ████████
Hooks.once("init", async () => {

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
    Actors.registerSheet("betterangels", BetterAngelsActorSheet, {makeDefault: true});
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("betterangels", BetterAngelsItemSheet, {makeDefault: true});    

    // ▮▮▮▮▮▮▮[Handlebar Templates] Preload Handlebars Templates ▮▮▮▮▮▮▮
    return preloadHandlebarsTemplates();

});

// ████████ ON READY: On-Ready Hook ████████
Hooks.once("ready", async () => {
 
});

// ████████ HANDLEBARS: Custom Handlebar Helpers ████████