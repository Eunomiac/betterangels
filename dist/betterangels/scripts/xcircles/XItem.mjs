/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌█████████████████████ MIT License █ v0.0.1-prealpha █  ████████████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

// ████████ IMPORTS ████████
import {
  // ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮
  gsap, Dragger, InertiaPlugin, MotionPathPlugin, // GreenSock Animation Platform
  // ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮
  U,
  // ▮▮▮▮▮▮▮[XCircles]▮▮▮▮▮▮▮
  XElem,
  XCircle,
  // ▮▮▮▮▮▮▮[Mixins]▮▮▮▮▮▮▮
  MIX, IsDraggable, SnapsToCircle
} from "../helpers/bundler.mjs";

class XItem extends XElem {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  // ░░░░░░░[Getters]░░░░ Registry, Enumerables, Constants ░░░░░░░
  static get REGISTRY() { return (this._REGISTRY = this._REGISTRY ?? {}) }
  static get ALL() { return Object.values(this.REGISTRY) }
  static get TYPES() { return { } }
  static get CLASSES() { return ["x-item"] }
  static get PREFIX() { return "xItem" }
  // ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░
  // ========== Registration: Item Naming & Registration ===========
  static NameItem(item) {
    if (item._options.name) {
      item._name = item._options.name;
    } else {
      const namePrefix = `${item._owner}_${item._type}`;
      const nameTest = new RegExp(`^${namePrefix}_`);
      const itemNum = parseInt(Object.keys(this.REGISTRY)
        .filter((key) => nameTest.test(key)).pop()?.match(/_(\d+)$/)
        ?.pop() ?? 0) + 1;
      item._name = `${namePrefix}_${itemNum}`;
      item._id = `${item.constructor.PREFIX}-${item.name}`;
    }
  }
  static Register(item) {
    this.REGISTRY[item.name] = item;
    this.IsTicking = true;
    return item;
  }
  static Unregister(item) {
    delete this.REGISTRY[item.name];
    if (this.ALL.length === 0) {
      this.IsTicking = false;
    }
  }

  // ████████ CONSTRUCTOR ████████
  constructor(options = {}) {
    super();
    this._options = options;

    this.type = options.type;
    this._owner = options.owner?.id ?? options.owner ?? options.circle?.owner?.id ?? U.GMID();

    this.constructor.NameItem(this);
    this._create(options.circle);
    this.constructor.Register(this);
  }

  // ████████ GETTERS & SETTERS ████████
  // ░░░░░░░ Read-Only ░░░░░░░
  get owner() { return game.users.get(this._owner) }
  get name() { return this._name }

  get slot() {
    const {slot} = this.circle?._getSlotItemPos(this) ?? {};
    return slot;
  }
  get slotAbsAngle() {
    const {angle} = this.circle?._getSlotItemPos(this) ?? {};
    return angle;
  }
  get watchFuncName() {
    return `watchItem-${this.name}`;
  }

  // ░░░░░░░ Writeable ░░░░░░░
  get type() { return this._type }
  set type(v) {
    const checkedType = this.constructor.TYPES[v] ?? v ?? this.constructor.DEFAULTTYPE;
    if (Object.values(this.constructor.TYPES).includes(checkedType)) {
      this._type = checkedType;
      this.classes = [];
    } else {
      throw new Error(`Invalid ${this.constructor.name} Type: ${v}`);
    }
  }

  get circle() { return this.parent instanceof XCircle ? this.parent : undefined }
  set circle(v) {
    if (v instanceof XCircle) {
      this.parent = v;
    } else {
      throw new Error(`[${this.constructor.name}.parent] '${v}' is not an XCircle`);
    }
  }

  get isMoving() { return this._isMoving }
  set isMoving(v) { this._isMoving = Boolean(v) }

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░
  _create(startCircle) {
    [this._elem] = $(`<div id="${this.id}" class="${this.defaultClasses.join(" ")}" />`);
    this[startCircle ? "circle" : "parent"] = startCircle ?? XCircle.CONTAINER;
    this.set({xPercent: -50, yPercent: -50, rotation: 0, ...this._startPos?.x ? this._startPos : {}});
  }

  // ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░
  straighten() { this.set({rotation: -1 * (this.parent?.rotation ?? 0)}) }

}

class XDie extends MIX(XItem).with(IsDraggable, SnapsToCircle) {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  // ░░░░░░░[Getters]░░░░ Enumerables, Constants ░░░░░░░
  static get TYPES() { return {basic: "basic"} }
  static get DEFAULTTYPE() { return this.TYPES.basic }
  static get CLASSES() { return [...super.CLASSES, "x-die"] }
  static get PREFIX() { return "xDie" }

}

class XSnap extends MIX(XItem).with(SnapsToCircle) {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  // ░░░░░░░[Getters]░░░░ Enumerables, Constants ░░░░░░░
  static get TYPES() { return {die: "die"} }
  static get DEFAULTTYPE() { return this.TYPES.die }
  static get CLASSES() { return [...super.CLASSES, "x-snap"] }
  static get PREFIX() { return "xSnap" }

  // ████████ CONSTRUCTOR ████████
  constructor(snapTarget, options = {}) {
    options.pathWeight = options.pathWeight ?? 2;
    options.name = `S:${snapTarget.name}`;
    super(options);
    this._snapTarget = snapTarget;
    this._startPos = options.alignTo
      ? {x: options.alignTo.x, y: options.alignTo.y}
      : {x: options.x, y: options.y};
  }

  // ████████ GETTERS & SETTERS ████████

  // ░░░░░░░ Writeable ░░░░░░░
  get snapTarget() { return this._snapTarget }
  set snapTarget(v) { this._snapTarget = v }

}

// ████████ EXPORTS ████████
export {XItem, XDie, XSnap};