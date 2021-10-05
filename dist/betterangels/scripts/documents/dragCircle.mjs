/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Oct 05 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

// ████████ IMPORTS ████████
// ▮▮▮▮▮▮▮ GreenSock ▮▮▮▮▮▮▮
import gsap, {
  Draggable as Dragger,
  InertiaPlugin,
  MotionPathPlugin
} from "/scripts/greensock/esm/all.js";

// ▮▮▮▮▮▮▮ Utilities ▮▮▮▮▮▮▮
import U from "../helpers/utilities.mjs";

// ████████ CLASSES: Class Definitions ████████
// ░░░░░░░ RollCircle ░░░░░░░
class RollCircle {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  // ░░░░░░░[Getters]░░░░ Basic Data Retrieval ░░░░░░░
  static get REGISTRY() { return (this._REGISTRY = this._REGISTRY ?? {}) }

  // ========== Enumeration Objects ===========
  static get TYPES() {
    return {
      basic: "basic"
    };
  }

  // ========== DOM Elements ===========
  static get CONTAINER() { return (this._CONTAINER = this._CONTAINER ?? $("#rollCircleContainer")[0] ?? this.CreateContainer()) }

  // ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░
  static CreateContainer() {
    return $("<div id=\"rollCircleContainer\" />").appendTo(".vtt.game")[0];
  }
  static Register(circle) { this.REGISTRY[circle.name] = circle; console.log(this.REGISTRY) }
  static Unregister(circle) { delete this.REGISTRY[circle.name] }
  static Kill(circle) {
    circle.killAll();
    this.Unregister(circle);
  }

  // ████████ CONSTRUCTOR ████████
  constructor(x, y, radius, cssClasses = [], options) {
    this._x = x;
    this._y = y;
    this._r = radius;
    this._cssClasses = ["roll-circle", ...[cssClasses].flat()];

    // Options
    this._owner = options?.owner ?? U.GMID;
    this._type = options?.type ?? RollCircle.TYPES.basic;

    const nameTest = new RegExp(`${this._owner}_${this._type}_`);
    this._name = `${this._owner}_${this._type}_${Object.keys(RollCircle.REGISTRY).filter((key) => nameTest.test(key)).length + 1}`;
    this._id = `rollCircle-${this.name}`;

    RollCircle.Register(this);
    this._create();
  }

  // ████████ GETTERS & SETTERS ████████
  // ░░░░░░░ Read-Only ░░░░░░░
  get x() { return this._x }
  get y() { return this._y }
  get radius() { return this._r }
  get height() { return this.radius * 2 }
  get width() { return this.radius * 2 }
  get type() { return this._type }
  get owner() { return game.users.get(this._owner) }

  get name() { return this._name }
  get id() { return this._id }
  get sel() { return `#${this.id}` }
  get elem() { return this._rollCircle }

  get snap() {
    const circle = this;
    return {
      get id() { return `${circle.id}-snap` },
      get sel() { return `#${this.id}` },
      get elem() { return circle._snapCircle },
      get path() { return circle._rawSnapPath }
    };
  }

  get diceLine() { return (this._childDice = this._childDice ?? []) }
  get numSlots() { return this.diceLine.length }
  get dice() { return this.diceLine.filter((die) => die.type !== OREDie.TYPES.openSpace) }
  get numDice() { return this.dice.length }
  get numBlanks() { return this.numSlots - this.numDice }

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░
  _create() {
    [this._rollCircle] = $(`
    <div id="${this.id}" class="${this._cssClasses.join(" ")}" style="height: ${this.height}px; width: ${this.width}px;">
      <svg height="100%" width="100%">
        <circle cx="${this.radius}" cy="${this.radius}" r="${this.radius}" stroke="none" />
        <circle id="${this.snap.id}" class="snap-circle" cx="${this.radius}" cy="${this.radius}" r="${this.radius * 0.8}" fill="none" stroke="none" />
      </svg>
    </div>
    `).appendTo(RollCircle.CONTAINER);
    MotionPathPlugin.convertToPath(this.snap.sel);
    [this._snapCircle] = $(this.snap.sel);
    this._rawSnapPath = MotionPathPlugin.getRawPath(this.snap.sel);
    MotionPathPlugin.cacheRawPathMeasurements(this.snap.path);
    this._setCircle({xPercent: -50, yPercent: -50, x: this.x, y: this.y});
    this._setSnapCircle({xPercent: -50, yPercent: -50});
    this._toggleSlowRotate(true);
  }

  // ░░░░░░░[Elements]░░░░ Managing Core Circle Elements ░░░░░░░
  _setCircle(params) { U.set(this.elem, params) }
  _setSnapCircle(params) { U.set(this.snap.elem, params) }

  // ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░
  _toggleSlowRotate(isRotating) {
    if (isRotating) {
      gsap.to(this.sel, {
        rotation: "+=360",
        duration: 100,
        repeat: -1,
        ease: "none"
      });
    } else {
      gsap.killTweensOf(this.sel, "rotation");
    }
  }

  // ░░░░░░░[Dice]░░░░ Managing Orbiting Dice ░░░░░░░
  _addNewDie(die) {
    if (die instanceof OREDie) {
      U.set(die.sel, {opacity: 0});
      this._redistributeDice([...this.diceLine, die]);
      this._childDice = [...this.diceLine, die];
      this._initDiePos(die);
      gsap.to(die.sel, {
        opacity: 1,
        duration: 1,
        delay: 2
      });
    }
  }
  _deleteDie(die) {
    if (die instanceof OREDie) {
      const newDiceLine = this.diceLine.filter((slotDie) => slotDie.name !== die.name);
      this._redistributeDice([...newDiceLine]);
      this._childDice = [...newDiceLine];
      // die.kill();
    }
  }

  _getDieSlot(die, diceLine) {
    diceLine = diceLine ?? this.diceLine;
    const dieSlot = diceLine.findIndex((slotDie) => die.name === slotDie.name);
    if (dieSlot >= 0) {
      return dieSlot;
    } else {
      return false;
    }
  }

  _getDiePathPos(die, diceLine) {
    // Returns the position (0 - 1) along the path the die is currently claiming, or,
    // if an array showing the new positions of all dice in a new diceLine is given,
    // the position of the die in that diceLine.
    diceLine = diceLine ?? this.diceLine;
    const slotNum = this._getDieSlot(die, diceLine);
    if (slotNum !== false) {
      const pathPos = slotNum / diceLine.length;
      const {x, y, angle} = MotionPathPlugin.getPositionOnPath(this.snap.path, pathPos, true);
      return {x, y, angle, pathPos};
    } else {
      throw new Error(`No die '${die}' found in ${this.name}.`);
    }
  }

  _getDiePathDelta(die, newDiceLine) {
    // Given a die and an array showing the new positions of all dice, returns the
    // difference in the die's current path position and where it should be
    if (newDiceLine.includes(die)) {
      return {
        curPathPos: this.diceLine.includes(die) ? this._getDiePathPos(die).pathPos : 0.01,
        newPathPos: this._getDiePathPos(die, newDiceLine).pathPos
      };
    } else {
      return {};
    }
  }

  _initDiePos(die) {
    const {x, y} = this._getDiePathPos(die);
    gsap.set(die.sel, {x, y});
  }

  _redistributeDice(newPositions) {
    const newPos = newPositions ?? this.diceLine;
    this.diceLine.forEach((die, slot) => {
      const {curPathPos, newPathPos} = this._getDiePathDelta(die, newPos);
      if (newPathPos) {
        gsap.to(die.sel, {
          motionPath: {
            path: this.snap.sel,
            alignOrigin: [0.5, 0.5],
            start: newPositions ? curPathPos : 0.01,
            end: newPathPos,
            fromCurrent: Boolean(newPositions)
          },
          duration: 2,
          ease: "power4.inOut"
        });
      }
    });
  }

  // ████████ PUBLIC METHODS ████████
  // ░░░░░░░[Dice]░░░░ Adding & Removing OREDice ░░░░░░░
  addDie(die) {
    if (die instanceof OREDie) {
      // Adding an already-existing Die
    } else {
      this._addNewDie(new OREDie(this, die));
    }
  }

}

// ░░░░░░░ OREDie ░░░░░░░
class OREDie {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  // ░░░░░░░[Getters]░░░░ Basic Data Retrieval ░░░░░░░
  static get REGISTRY() { return (this._REGISTRY = this._REGISTRY ?? {}) }

  // ========== Enumeration Objects ===========
  static get TYPES() {
    return {
      basic: "basic",
      openSpace: "slot-space"
    };
  }

  // ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░
  static Register(die) { this.REGISTRY[die.name] = die }
  static Unregister(die) { delete this.REGISTRY[die.name] }
  static Kill(die) {
    die.kill();
    this.Unregister(die);
  }

  // ████████ CONSTRUCTOR ████████
  constructor(homeCircle, type, options) {
    this._homeCircle = homeCircle;
    type = type ?? options?.type ?? OREDie.TYPES.basic;
    if (!Object.values(OREDie.TYPES).includes(type)) {
      throw new Error(`Invalid Die Type: ${type}`);
    }
    this._type = type;

    // Options
    this._owner = options?.owner ?? homeCircle.owner.id;

    const nameTest = new RegExp(`${this._owner}_${this._type}_`);
    this._name = `${this._owner}_${this._type}_${Object.keys(OREDie.REGISTRY).filter((key) => nameTest.test(key)).length + 1}`;
    OREDie.Register(this);
    this._create();
  }

  // ████████ GETTERS & SETTERS ████████
  // ░░░░░░░ Read-Only ░░░░░░░
  // get x()
  // get y()
  // get rotation()
  get owner() { return game.users.get(this._owner) }
  get name() { return this._name }
  get id() { return `die-${this.name}` }
  get elem() { return this._elem }
  get sel() { return `#${this.id}` }
  get dragger() { return this._dragger }

  // ░░░░░░░ Writeable ░░░░░░░
  get homeCircle() { return this._homeCircle }
  get type() { return this._type }
  set type(v) {
    $(this.sel)
      .removeClass(`ore-${this.type}`)
      .addClass(`ore-${v}`);
    this._type = v;
  }

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░
  _create() {
    [this._elem] = $(`<div id="${this.id}" class="ore-die ore-${this.type}"></div>`).appendTo(this.homeCircle.elem);
    this._setDie({xPercent: -50, yPercent: -50, transformOrigin: "50% 50%"});
    this._toggleCounterRotate(true);
  }

  // ░░░░░░░[Elements]░░░░ Managing Die Element ░░░░░░░
  _setDie(params) { U.set(this.sel, params) }
  _setHomeCircle(circle) {
    circle = circle ?? this.homeCircle;

  }

  // ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░
  _toggleCounterRotate(isRotating) {
    if (isRotating) {
      U.set(this.sel, {rotation: -1 * U.get(this.homeCircle.sel, "rotation")});
      gsap.to(this.sel, {
        rotation: "+=360",
        duration: 100,
        repeat: -1,
        runBackwards: true,
        ease: "none"
      });
    } else {
      gsap.killTweensOf(this.sel, "rotation");
    }
  }

}

// ████████ EXPORTS ████████
// ▮▮▮▮▮▮▮ Default Export ▮▮▮▮▮▮▮
export default () => {
  const rollCircles = [];
  gsap.registerPlugin(Dragger, InertiaPlugin, MotionPathPlugin);
  [
    [3, 100, 100, 100, "lime"],
    [9, 1370, 100, 100, "cyan"],
    [13, 735, 700, 100, "pink"]
  ].forEach((params) => {
    const numDice = params.shift();
    const rollCircle = new RollCircle(...params);
    for (let i = 0; i < numDice; i++) {
      rollCircle.addDie();
    }
    rollCircles.push(rollCircle);
  });
  return rollCircles;
};