// #region ████████ IMPORTS: Importing Modules ████████ ~
// #region ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮ ~
import BETTERANGELS from "./helpers/config.mjs";
// #endregion ▮▮▮▮[Constants]▮▮▮▮

// #region ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮ ~
import preloadHandlebarsTemplates from "./helpers/templates.mjs";
import testCircles from "./documents/dragCircle.mjs";
import U from "./helpers/utilities.mjs";

U.init();
// #endregion ▮▮▮▮[Utility]▮▮▮▮

// #region ▮▮▮▮▮▮▮[Classes]▮▮▮▮▮▮▮ ~
import BetterAngelsActor from "./documents/actor.mjs";
import BetterAngelsActorSheet from "./sheets/actor-sheet.mjs";
import HellboundActorSheet from "./sheets/actor-hellbound-sheet.mjs";
import DemonCompanionSheet from "./sheets/actor-demon-sheet.mjs";
import MajorNPCSheet from "./sheets/actor-majornpc-sheet.mjs";
import MinorNPCSheet from "./sheets/actor-minornpc-sheet.mjs";
import BetterAngelsItem from "./documents/item.mjs";
import BetterAngelsItemSheet from "./sheets/item-sheet.mjs";
import BARoll from "./documents/rollPool.mjs";
// #endregion ▮▮▮▮[Classes]▮▮▮▮
// #endregion ▄▄▄▄▄ IMPORTS ▄▄▄▄▄

/*DEVCODE*/console.log("STARTING BETTER ANGELS");/*!DEVCODE*/

// #region ████████ ON INIT: On-Initialization Hook ████████
Hooks.once("init", async () => {
  console.log("STARTING BETTER ANGELS");

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
  Actors.registerSheet("betterangels", HellboundActorSheet, {makeDefault: true, types: ["hellbound"], label: "ba.sheet.hellboundSheet"});
  Actors.registerSheet("betterangels", DemonCompanionSheet, {makeDefault: false, types: ["hellbound"], label: "ba.sheet.demonSheet"});
  Actors.registerSheet("betterangels", MajorNPCSheet, {makeDefault: false, types: ["majornpc"], label: "ba.sheet.majorNPCSheet"});
  Actors.registerSheet("betterangels", MinorNPCSheet, {makeDefault: false, types: ["minornpc"], label: "ba.sheet.minorNPCSheet"});

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("betterangels", BetterAngelsItemSheet, {makeDefault: true});
  // #endregion ▮▮▮▮[Classes]▮▮▮▮

  /*DEVCODE*/
  window.REF = game.betterangels;
  window.DB = {
    BetterAngelsActor,
    BetterAngelsActorSheet,
    HellboundActorSheet,
    DemonCompanionSheet,
    MajorNPCSheet,
    MinorNPCSheet,
    BetterAngelsItem,
    BetterAngelsItemSheet,
    BARoll,
    testCircles
  };
  window.U = U;
  testCircles();
  /*!DEVCODE*/

  // #region ▮▮▮▮▮▮▮[Handlebar Templates] Preload Handlebars Templates ▮▮▮▮▮▮▮
  return preloadHandlebarsTemplates();
  // #endregion ▮▮▮▮[Handlebar Templates]▮▮▮▮

});
// #endregion ▄▄▄▄▄ ON INIT ▄▄▄▄▄

/**
// #region ████████ ON READY: On-Ready Hook ████████ ~
Hooks.once("ready", async () => {

});
// #endregion ▄▄▄▄▄ ON READY ▄▄▄▄▄

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
