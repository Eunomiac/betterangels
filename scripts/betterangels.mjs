// #region ████████ IMPORTS ████████ ~
import {
  // #region ▮▮▮▮▮▮▮[Constants]▮▮▮▮▮▮▮ ~
  BETTERANGELS,
  // #endregion ▮▮▮▮[Constants]▮▮▮▮
  // #region ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮ ~
  gsap, Dragger, InertiaPlugin, MotionPathPlugin, GSDevTools, // GreenSock Animation Platform
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
/*DEVCODE*/ import DB from "./helpers/debug.mjs"; /*!DEVCODE*/

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
const GenerateCircles = (circles = {center: 0}) => {
  window.CIRCLES = window.CIRCLES ?? [];
  const circleParams = {
    zeroed: [0, 0],
    center: [375, 414],
    topLeft: [100, 100],
    topRight: [100, 1370],
    left: [100, 414],
    right: [1370, 414],
    botLeft: [100, 729],
    botRight: [1370, 729]
  };
  const circleTyper = U.makeCycler(Object.values(XCircle.TYPES));
  const newCircles = [];
  for (const [circlePos, numDice] of Object.entries(circles)) {
    window.CIRCLES.unshift(new XCircle(...circleParams[circlePos], 100, {type: circleTyper.next().value}));
    window.CIRCLES[0].createDice(numDice);
  }
};

Hooks.once("ready", () => {
  window.REF = game.betterangels;
  Object.assign(DB, {
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
    pause() { gsap.globalTimeline.pause() },
    play() { gsap.globalTimeline.play() }
  });
  window.DB = DB;
  window.U = U;
  window.GenerateCircles = GenerateCircles;

  GenerateCircles({topLeft: 2, left: 8, botLeft: 5});

  return;
  GenerateCircles({center: 4});

  // window.CIRCLES[0]._toggleSlowRotate(false);
  DB.setDBCircle(window.CIRCLES[0]);
  DB.setDBDie(window.CIRCLES[0].slots[0]);
  DB.showAngles(window.CIRCLES[0], 8, true);
  DB.addDieWatch(["dbRelPos"]);
  DB.addDieWatch(["pathPos", "targetPathPos"]);
  DB.addDieWatch(["dbAbsAngle", "dbRelAngle"]);
  DB.addDieWatch(["dbAbsPos"]);
  // setTimeout(() => DB.pause(), 10000);

  DB.showDieData(window.CIRCLES[0]);
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
