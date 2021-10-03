// ████████ INITIALIZATION ████████
import U from "../helpers/utilities.mjs";
import gsap, {
  Draggable as Dragger,
  InertiaPlugin as Inertia
} from "/scripts/greensock/esm/all.js"; // eslint-disable-line import/no-unresolved

// ████████ UTILITY FUNCTIONS ████████

// 1) Create Canvas DIV

// 2) Create Classes
class RollCircle {
  // #region ████████ STATIC: Static Getters, Setters, Methods ████████ ~
  // #region ▮▮▮▮▮▮▮[Getters] Basic Data Retrieval ▮▮▮▮▮▮▮ ~
  static get REGISTRY() { return (this._REGISTRY = this._REGISTRY ?? {}) }
  // #region ░░░░░░░[Enums]░░░░ Enumeration Objects ░░░░░░░ ~
  static get TYPES() {
    return {
      basic: "basic"
    };
  }
  // #endregion ░░░░[Enums]░░░░

  // #region ░░░░░░░[Elements]░░░░ Element Retrieval ░░░░░░░ ~
  static get CONTAINER() { return (this._CONTAINER = [this._CONTAINER ?? "#rollCircleContainer" ?? this.CreateContainer()][0]) }
  static Get(owner, type, num = 1) { return this.REGISTRY[`${owner}_${type}_${num}`] }
  // #endregion ░░░░[Elements]░░░░

  // #endregion ▮▮▮▮[Getters]▮▮▮▮

  static CreateContainer() {
    return $("<div id=\"rollCircleContainer\" />").appendTo(".vtt.game")[0];
  }
  static Register(circle) { this.REGISTRY[circle.name] = circle }

  // #endregion ▄▄▄▄▄ STATIC ▄▄▄▄▄

  // #region ████████ CONSTRUCTOR ████████ ~
  constructor({x, y}, radius, cssClasses = [], {owner, type, dice: {num, types}} = {}) {
    this._x = x;
    this._y = y;
    this._r = radius;
    this._cssClasses = ["roll-circle", ...cssClasses];
    this._owner = owner ?? U.GMID;
    this._type = type ?? RollCircle.TYPES.basic;
    this._name = `${this._owner}_${this._type}_${
      Object.keys(RollCircle.REGISTRY)
        .filter((key) => new RegExp(`${this._owner}_${this._type}_`).test(key))
        .length + 1
    }`;
    RollCircle.Register(this);
    this.create();
    this.addDice(num, types);
  }
  // #endregion ▄▄▄▄▄ CONSTRUCTOR ▄▄▄▄▄

  get x() { return this._x }
  get y() { return this._y }
  get radius() { return this._r }
  get height() { return this.radius * 2 }
  get width() { return this.radius * 2 }
  get cssClasses() { return this._cssClasses }
  get owner() { return game.users.get(this._owner) }
  get type() { return this._type }
  get name() { return this._name }
  get id() { return `rollCircle-${this.name}` }
  get snapID() { return `snapCircle-${this.name}` }

  get rollCircle() { return this._rollCircle }
  get snapCircle() { return $(`#${this.id} .snap-circle`)[0] }
  get diceElems() { return $(`#${this.id} .ore-die`) }

  create() {
    [this._rollCircle] = $(`
    <div id="${this.id}" class="${this.cssClasses.join(" ")}" style="height: ${this.height}px; width: ${this.width}px;">
      <svg height="100%" width="100%">
        <circle cx="${this.radius}" cy="${this.radius}" r="${this.radius}" stroke="none" />
        <circle class="snap-circle" cx="${this.radius}" cy="${this.radius}" r="${this.radius * 0.8}" fill="none" stroke="none" />
      </svg>
    </div>
    `).appendTo(RollCircle.CONTAINER);
    this.setCircle({xPercent: -50, yPercent: -50, x: this.x, y: this.y});
    this.setSnapCircle({xPercent: -50, yPercent: -50});
  }

  setCircle(params) { U.set(this.rollCircle, params) }
  setSnapCircle(params) { U.set(this.snapCircle, params) }

  distributeDice() {
    const radius = 0.8 * this.radius;
    const stepSize = 360 / (this.childDice.length + 1);
    let angle = 0;
    this.childDice.forEach((die) => {
      angle += stepSize;
      G.set(die.elem, {
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
    G.set(this.elem, {xPercent: -50, yPercent: -50, transformOrigin: "50% 50%"});
  }
}

export default () => {
  gsap.registerPlugin(Dragger, Inertia);
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