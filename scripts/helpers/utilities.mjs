import gsap from "/scripts/greensock/esm/all.js"; // eslint-disable-line import/no-unresolved

const pad = (num, minLength = 0) => {
  let numString = `${num}`;
  while (numString.length < minLength) {
    numString = ` ${numString}`;
  }
  return numString;
};
const cycle = (num, min = 0, max = num) => {
  while (num > max) {
    num -= max - min;
  }
  while (num <= min) {
    num += max - min;
  }
  return num;
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
const getAngleDelta = (angleStart, angleEnd) => cycle(Math.round(angleEnd - angleStart), -180, 180);

// #region ████████ ARRAYS: Managing Arrays ████████ ~
/* const remove = (arr, filterFunc) => {
  if (typeof filterFunc === "function") {
    return arr.filter(filterFunc);
  } else {
    return arr.fil
  }
} */
// #endregion ▄▄▄▄▄ ARRAYS ▄▄▄▄▄
export default {
  gsap,
  // #region ████████ GETTERS: Basic Data Retrieval ████████ ~
  get GMID() { return game.users.find((user) => user.isGM)?.id ?? false },
  // #endregion ▄▄▄▄▄ GETTERS ▄▄▄▄▄

  // #region ████████ GSAP: GSAP Functions ████████ ~
  get(...args) { return gsap.getProperty(...args) },
  set(...args) { return gsap.set(...args) },

  // #region ▮▮▮▮▮▮▮[GSAP.UTILS]▮▮▮▮▮▮▮ ~
  random(...args) { return gsap.utils.random(...args) },
  distribute(...args) { return gsap.utils.distribute(...args) },
  splitColor(...args) { return gsap.utils.splitColor(...args) },
  mapRange(...args) { return gsap.utils.mapRange(...args) },
  // #endregion ▮▮▮▮[GSAP.UTILS]▮▮▮▮
  // #endregion ▄▄▄▄▄ GSAP ▄▄▄▄▄

  // #region ████████ MATH ████████ ~
  cycle,
  pad,
  sign,
  round,
  radToDeg,
  getDistance,
  getAngle,
  getAngleDelta,
  // #endregion ▄▄▄▄▄ MATH ▄▄▄▄▄
  // #region ████████ DOM: DOM Elements ████████ ~

  // #endregion ▄▄▄▄▄ DOM ▄▄▄▄▄
  // #region ████████ STRINGS: String Parsing ████████ ~
  // #region ▮▮▮▮▮▮▮[FORMATS] Conversion Between Various String Formats ▮▮▮▮▮▮▮ ~
  formatAsClass: (str) => `${str}`.replace(/([A-Z])|\s/g, "-$1").replace(/^-/, "").trim().toLowerCase(),
  // #endregion ▮▮▮▮[FORMATS]▮▮▮▮
  // #region ▮▮▮▮▮▮▮[COLORS] Color String Conversion & Manipulation ▮▮▮▮▮▮▮ ~
  joinColor: (r, g, b, a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`
  // #endregion ▮▮▮▮[COLORS]▮▮▮▮
  // #endregion ▄▄▄▄▄ STRINGS ▄▄▄▄▄
};