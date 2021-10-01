/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Sep 30 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

// ████████ INITIALIZATION ████████
import gsap, {
  Draggable as GSDraggable,
  InertiaPlugin,
  MotionPathPlugin,
  CustomWiggle,
  CustomEase
} from "/scripts/greensock/esm/all.js";
const REGISTRY = {};

// ████████ UTILITY FUNCTIONS ████████
const {
  getProperty: get,
  utils: {random, distribute, splitColor, mapRange}
} = gsap;

const joinColor = (r, g, b, a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`;

// 1) Create Canvas DIV
$("<div id=\"roll-circle-container\" />").appendTo(".vtt.game.system-betterangels");

// 2) Create Classes
class RollCircle {
  static get REGISTRY() {
    this._REGISTRY = this._REGISTRY ?? {};
    return this._REGISTRY;
  }
  static RegisterCircle(circle) {
    const circleNum = Object.keys(this.REGISTRY).length + 1;
    circle.id = `rollCircle-${circleNum}`;
    this.REGISTRY[circle.id] = circle;
  }
  constructor({x, y}, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    [this.r, this.g, this.b] = splitColor(color);
    RollCircle.RegisterCircle(this);
    this.draw();
  }

  get color() { return joinColor(this.r, this.g, this.b) }

  get id() { return this._id }
  set id(v) {
    this._id = v;
    [this.index] = v.match(/\d+$/);
  }

  get index() { return this._index }
  set index(v) { this._index = parseInt(v) }

  get childDice() { return (this._childDice = this._childDice ?? []) }

  draw() {
    [this.elem] = $(`<svg id="${this.id}" class="roll-circle" height="${2 * this.radius}" width="${2 * this.radius}">
        <circle r="50%" stroke="none" fill="${this.color}" cx="50%" cy="50%" />
       </svg>`)
      .appendTo("#roll-circle-container");
    gsap.set(`#${this.id}`, {xPercent: -50, yPercent: -50, x: this.x, y: this.y});
  }

  initDie() { this.childDice.push(new OREDie(this)) }
  addDie(die) { this.childDice.push(die) }
  remDie(die) { this._childDice = this.childDice.filter((child) => die !== child) }

  distributeDice() {
    const radius = 0.8 * this.radius;
    const stepSize = 360 / (this.childDice.length + 1);
    let angle = 0;
    this.childDice.forEach((die) => {
      angle += stepSize;
      gsap.set(die.elem, {
        xPercent: -50,
        yPercent: -50,
        x: radius * Math.cos(angle * (Math.PI / 180)),
        y: radius * Math.sin(angle * (Math.PI / 180))
      });
    });
  }
}
class OREDie {
  static get REGISTRY() {
    this._REGISTRY = this._REGISTRY ?? {};
    return this._REGISTRY;
  }
  static RegisterDie(die, circle) {
    const dieNum = Object.keys(this.REGISTRY).length + 1;
    die.id = `die-${dieNum}`;
    die.homeCircle = circle;
    this.REGISTRY[die.id] = die;
  }

  constructor(homeCircle) {
    OREDie.RegisterDie(this, homeCircle);
    this.draw();
  }

  draw() {
    [this.elem] = $(`<circle id="${this.id}" r="30px" stroke="#FFFFFF" fill="lime">&nbsp;</circle>`).appendTo(this.homeCircle.elem);
    gsap.set(this.elem, {xPercent: -50, yPercent: -50, transformOrigin: "50% 50%"});
  }
}

export default () => {
  gsap.registerPlugin(GSDraggable, InertiaPlugin, MotionPathPlugin);
  [
    [{x: 100, y: 100}, 100, "lime"],
    [{x: 1100, y: 100}, 100, "cyan"],
    [{x: 600, y: 750}, 100, "pink"]
  ].forEach((params) => {
    const rollCircle = new RollCircle(...params);
    for (let i = 0; i < 6; i++) {
      rollCircle.initDie();
    }
    rollCircle.distributeDice();
  });
};

/*

const getDistance = ({x: x1, y: y1}, {x: x2, y: y2}) => {
  // Calculates distance between two points.
  return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
};

const getElem = (elem) => {
  // Consolidates Draggable/jQuery/DOM elements into their corresponding HTMLElement
  if (elem instanceof Draggable) { return elem.target; }
  else if (elem instanceof jQuery) { return elem[0]; }
  else { return elem; }
};
const getDistanceBetween = (elem1, elem2) => {
  // Calculates distance between two elements.
  return getDistance(
    {x: get(elem1, "x"), y: get(elem1, "y")},
    {x: get(elem2, "x"), y: get(elem2, "y")}
  );
};
const getClosest = (elem, targetElems) => {
  // Given an element and an array of targets, returns closest target.
  let closestDistance, closestTarget;
  targetElems.forEach((target) => {
    const distance = getDistanceBetween(elem, target);
    if (distance < (closestDistance ?? Infinity)) {
      closestDistance = distance;
      closestTarget = target;
    }
  });
  return closestTarget;
};
*/