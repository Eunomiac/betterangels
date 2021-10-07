/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Oct 07 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

import gsap from "/scripts/greensock/esm/all.js";

const pad = (num, minLength = 0) => {
  let numString = `${num}`;
  while (numString.length < minLength) {
    numString = ` ${numString}`;
  }
  return numString;
};
const sign = (num) => `${num >= 0 ? "+" : ""}${num}`;
const round = (num, sigDigits = 0) => Math.round(num * (10 ** sigDigits)) / (10 ** sigDigits);
const getDistance = ({x: x1, y: y1}, {x: x2, y: y2}) => ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
const radToDeg = (rad, isConstrained = true) => {
  rad = isConstrained ? rad % (2 * Math.PI) : rad;
  rad *= 180 / Math.PI;
  return rad;
};
const degToRad = (deg, isConstrained = true) => {
  deg = isConstrained ? deg % 360 : deg;
  deg *= Math.PI / 180;
  return deg;
};
const getAngle = ({x: x0, y: y0}, {x: xT, y: yT}) => radToDeg(Math.atan2(yT - y0, xT - x0)); // range (-180, 180]
const getAngleDelta = (angleStart, angleEnd) => {
  const delta = Math.round(angleEnd - angleStart);
  if (delta > 180) {
    return delta - 360;
  }
  if (delta <= -180) {
    return delta + 360;
  }
  return delta;
};

export default {
  // ████████ GETTERS: Basic Data Retrieval ████████
  get GMID() { return game.users.find((user) => user.isGM)?.id ?? false },

  // ████████ GSAP: GSAP Functions ████████
  get(...args) { return gsap.getProperty(...args) },
  set(...args) { return gsap.set(...args) },

  // ▮▮▮▮▮▮▮[GSAP.UTILS]▮▮▮▮▮▮▮
  random(...args) { return gsap.utils.random(...args) },
  distribute(...args) { return gsap.utils.distribute(...args) },
  splitColor(...args) { return gsap.utils.splitColor(...args) },
  mapRange(...args) { return gsap.utils.mapRange(...args) },

  // ████████ MATH ████████
  pad,
  sign,
  round,
  radToDeg,
  getDistance,
  getAngle,
  getAngleDelta,

  // ████████ DOM: DOM Elements ████████

  // ████████ STRINGS: String Parsing ████████
  // ▮▮▮▮▮▮▮[COLORS] Color String Conversion & Manipulation ▮▮▮▮▮▮▮
  joinColor: (r, g, b, a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`

};