/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Oct 03 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

import gsap, {MotionPathPlugin} from "/scripts/greensock/esm/all.js";

export default {
  // ████████ GETTERS: Basic Data Retrieval ████████
  get GMID() { return game.users.find((user) => user.isGM)?.id ?? false },

  // ████████ GSAP: GSAP Functions ████████
  init() { gsap.registerPlugin(MotionPathPlugin) },
  get(...args) { return gsap.getProperty(...args) },
  set(...args) { return gsap.set(...args) },

  // ▮▮▮▮▮▮▮[GSAP.UTILS]▮▮▮▮▮▮▮
  random(...args) { return gsap.utils.random(...args) },
  distribute(...args) { return gsap.utils.distribute(...args) },
  splitColor(...args) { return gsap.utils.splitColor(...args) },
  mapRange(...args) { return gsap.utils.mapRange(...args) },

  // ▮▮▮▮▮▮▮[MOTIONPATH] MotionPathPlugin ▮▮▮▮▮▮▮

  // ████████ STRINGS: String Parsing ████████
  // ▮▮▮▮▮▮▮[COLORS] Color String Conversion & Manipulation ▮▮▮▮▮▮▮
  joinColor: (r, g, b, a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`

};