// #region ████████ IMPORTS ████████ ~
import {
  // #region ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮ ~
  BETTERANGELS,
  // #endregion ▮▮▮▮[Constants]▮▮▮▮
  // #region ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮ ~
  gsap, Dragger, InertiaPlugin, MotionPathPlugin, GSDevTools, RoughEase, // GreenSock Animation Platform
  // #endregion ▮▮▮▮[External Libraries]▮▮▮▮
  // #region ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮ ~
  preloadTemplates, U,
  // #endregion ▮▮▮▮[Utility]▮▮▮▮
  // #region ▮▮▮▮▮▮▮[Actors]▮▮▮▮▮▮▮ ~
  BetterAngelsActor,
  BetterAngelsActorSheet, HellboundActorSheet, DemonCompanionSheet, MajorNPCSheet, MinorNPCSheet,
  // #endregion ▮▮▮▮[Actors]▮▮▮▮
  // #region ▮▮▮▮▮▮▮[Items]▮▮▮▮▮▮▮ ~
  BetterAngelsItem,
  BetterAngelsItemSheet,
  // #endregion ▮▮▮▮[Items]▮▮▮▮
  // #region ▮▮▮▮▮▮▮[XCircles]▮▮▮▮▮▮▮ ~
  XElem,
  XCircle,
  XItem, XDie, XSnap
  // #endregion ▮▮▮▮[XCircles]▮▮▮▮
} from "./helpers/bundler.mjs";
/*DEVCODE*/ import BA_DB from "./helpers/debug.mjs"; /*!DEVCODE*/

gsap.registerPlugin(Dragger, InertiaPlugin, MotionPathPlugin, GSDevTools);

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

  // #region ▮▮▮▮▮▮▮[Handlebar Templates] Preload Handlebars Templates ▮▮▮▮▮▮▮
  return preloadTemplates();
  // #endregion ▮▮▮▮[Handlebar Templates]▮▮▮▮
});
// #endregion ▄▄▄▄▄ ON INIT ▄▄▄▄▄

/*DEVCODE*/
Hooks.once("ready", () => {
  window.REF = game.betterangels;
  window.DB = new BA_DB({
    topLeft: 10,
    botLeft: 5,
    topRight: 6,
    botRight: 4
  });
  Object.entries({
    U,
    BetterAngelsActor,
    BetterAngelsActorSheet,
    HellboundActorSheet,
    DemonCompanionSheet,
    MajorNPCSheet,
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
    GSDevTools,
    pause: () => gsap.globalTimeline.pause(),
    play: () => gsap.globalTimeline.play()
  }).forEach(([key, ref]) => { window[key] = ref });
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
