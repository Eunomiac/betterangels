import gsap, {MotionPathPlugin} from "/scripts/greensock/esm/all.js"; // eslint-disable-line import/no-unresolved

export default {
  // #region ████████ GETTERS: Basic Data Retrieval ████████ ~
  get GMID() { return game.users.find((user) => user.isGM)?.id ?? false },
  // #endregion ▄▄▄▄▄ GETTERS ▄▄▄▄▄

  // #region ████████ GSAP: GSAP Functions ████████ ~
  init() { gsap.registerPlugin(MotionPathPlugin) },
  get(...args) { return gsap.getProperty(...args) },
  set(...args) { return gsap.set(...args) },

  // #region ▮▮▮▮▮▮▮[GSAP.UTILS]▮▮▮▮▮▮▮ ~
  random(...args) { return gsap.utils.random(...args) },
  distribute(...args) { return gsap.utils.distribute(...args) },
  splitColor(...args) { return gsap.utils.splitColor(...args) },
  mapRange(...args) { return gsap.utils.mapRange(...args) },
  // #endregion ▮▮▮▮[GSAP.UTILS]▮▮▮▮

  // #region ▮▮▮▮▮▮▮[MOTIONPATH] MotionPathPlugin ▮▮▮▮▮▮▮ ~

  // #endregion ▮▮▮▮[MOTIONPATH]▮▮▮▮

  // #endregion ▄▄▄▄▄ GSAP ▄▄▄▄▄

  // #region ████████ STRINGS: String Parsing ████████ ~
  // #region ▮▮▮▮▮▮▮[COLORS] Color String Conversion & Manipulation ▮▮▮▮▮▮▮ ~
  joinColor: (r, g, b, a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`
  // #endregion ▮▮▮▮[COLORS]▮▮▮▮
  // #endregion ▄▄▄▄▄ STRINGS ▄▄▄▄▄
};