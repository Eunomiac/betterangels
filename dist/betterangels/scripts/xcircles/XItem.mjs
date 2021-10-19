/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Oct 19 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

// ████████ IMPORTS ████████
// ▮▮▮▮▮▮▮ GreenSock ▮▮▮▮▮▮▮
import gsap, {
  Draggable as Dragger,
  InertiaPlugin,
  MotionPathPlugin
} from "/scripts/greensock/esm/all.js";

import {
  // ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮
  U,

  // ▮▮▮▮▮▮▮[XCircles]▮▮▮▮▮▮▮
  XCircle,

  // ▮▮▮▮▮▮▮[Mixins]▮▮▮▮▮▮▮
  MIX, IsDraggable

} from "../helpers/bundler.mjs";

class XItem {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  // ░░░░░░░[Getters]░░░░ Registry, Enumerables, Constants ░░░░░░░
  static get REGISTRY() { return (this._REGISTRY = this._REGISTRY ?? {}) }
  static get ALL() {
    return Object.values(this.REGISTRY)
      .filter((item) => item instanceof this.constructor);
  }
  static get TYPES() { return { } }
  static get CLASSES() { return ["x-item"] }
  static get PREFIX() { return "xItem" }

  // ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░
  static NameItem(item) {
    const nameTest = new RegExp(`${item._owner}_${item._type}_`);
    const itemNum = parseInt(Object.keys(this.REGISTRY)
      .filter((key) => nameTest.test(key)).pop()?.match(/_(\d+)$/)
      ?.pop() ?? 0) + 1;
    item._name = `${item._owner}_${item._type}_${itemNum}`;
  }
  static Register(item) {
    this.REGISTRY[item.name] = item;
    return item;
  }
  static Kill(item) {
    item.killAll();
    delete this.REGISTRY[item.name];
  }

  // ████████ CONSTRUCTOR ████████
  constructor({circle, type, ...options} = {}) {
    if (circle && !(circle instanceof XCircle)) {
      throw new Error(`[new XItem] '${circle.name}' is not a valid Circle.`);
    }

    this._type = this._checkType(type);
    this._owner = options?.owner?.id ?? options?.owner ?? circle?.owner?.id ?? U.GMID;

    this.constructor.NameItem(this);
    this._create(circle);
    this.constructor.Register(this);
  }

  // ████████ GETTERS & SETTERS ████████
  // ░░░░░░░ Read-Only ░░░░░░░
  get x() { return gsap.getProperty(this.elem, "x") }
  get y() { return gsap.getProperty(this.elem, "y") }
  get height() { return gsap.getProperty(this.elem, "height") }
  get width() { return gsap.getProperty(this.elem, "width") }
  get radius() { return (this.height + this.width) / 4 }
  get owner() { return game.users.get(this._owner) }

  get name() { return this._name }
  get id() { return (this._id = this._id ?? `${this.constructor.PREFIX}-${this.name}`) }
  get elem() { return (this._elem = this._elem ?? $(`#${this.id}`)?.[0]) }
  get $() { return $(this.elem) }
  get defaultClasses() {
    return [
      ...this.constructor.CLASSES,
      U.formatAsClass(`${this.constructor.PREFIX}-${this.type}`)
    ];
  }

  // ░░░░░░░ Writeable ░░░░░░░
  get classes() { return this.elem.classList }
  set classes(v) {
    const newClassList = [
      ...this.defaultClasses,
      ...Array.from([v])
        .flat()
        .join(" ")
        .trim()
        .split(" ")
    ];
    this.classes.forEach((c) => { if (!newClassList.includes(c)) { this.classes.remove(c) } });
    v.forEach((c) => this.classes.add(c));
  }

  get type() { return this._type }
  set type(v) {
    this._type = this._checkType(v);
    this.classes = [];
  }

  get parent() { return this._parent }
  set parent(v) {
    const [elem] = $(`#${v?.id ?? "noElemFound"}`);
    if (elem) {
      const {x, y} = MotionPathPlugin.convertCoordinates(
        this.parent?.elem ?? this.parent ?? this.elem,
        elem,
        {x: this.x, y: this.y}
      );
      this._parent = v;
      this.set({x, y});
      $(this.elem).appendTo(elem);
    } else {
      throw new Error(`[XItem.parent] No element found for '${v}'`);
    }
  }
  get circle() { return this.parent instanceof XCircle ? this.parent : undefined }
  set circle(v) {
    if (v instanceof XCircle) {
      this.parent = v;
    } else {
      throw new Error(`[XItem.parent] '${v}' is not an XCircle`);
    }
  }

  get closestCircle() { return (this._closestCircle = this.circle ?? this._closestCircle ?? XCircle.GetClosestTo(this)) }
  set closestCircle(v) { this._closestCircle = v }

  get pathWeight() { return (this._pathWeight = this._pathWeight ?? 1) }
  set pathWeight(v) { this._pathWeight = v }

  get isMoving() { return this._isMoving }
  set isMoving(v) { this._isMoving = Boolean(v) }

  get rotation() { return gsap.getProperty(this.elem, "rotation") }
  set rotation(v) {
    if (/^[+-]=/.test(`${v}`)) {
      v = this.rotation + parseFloat(`${v}`.replace(/=/g, ""));
    }
    gsap.set(this.elem, {rotation: v});
  }

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░
  _create(startCircle) {
    [this._elem] = $(`<div id="${this.id}" class="${this.defaultClasses.join(" ")}" />`).appendTo(XCircle.CONTAINER);
    this.set({xPercent: -50, yPercent: -50});
    if (startCircle) {
      this.circle = startCircle;
    } else {
      this._parent = XCircle.CONTAINER;
    }
  }

  // ░░░░░░░[Elements]░░░░ Managing Item Element ░░░░░░░
  _checkType(type) {
    const checkedType = this.constructor.TYPES[type] ?? type;
    if (Object.values(this.constructor.TYPES).includes(checkedType)) {
      return checkedType;
    }
    throw new Error(`Invalid Item Type: ${type}`);
  }
  _updateClosestCircle({x, y} = {}) {
    x = x ?? this.x;
    y = y ?? this.y;
    if (this.circle) {
      this.closestCircle?.unwatchItem(this);
      delete this._closestCircle;
    } else {
      const closestCircle = XCircle.GetClosestTo({x, y});
      if (closestCircle.name !== this.closestCircle?.name) {
        if (this.closestCircle?.name !== this._snapCircle?.name) {
          this.closestCircle?.unwatchItem(this);
        }
        this.closestCircle = closestCircle;
        if (this.closestCircle.name !== this._snapCircle?.name) {
          this.closestCircle.watchItem(this);
        }
      }
    }
  }

  // ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░
  straighten() { gsap.set(this.elem, {rotation: -1 * this.parent?.rotation ?? 0}) }

  // ████████ PUBLIC METHODS ████████
  set(params) { gsap.set(this.elem, params) }
  kill() {
    this.constructor.Unregister(this);
    this.$.remove();
  }
  // ░░░░░░░ Animation ░░░░░░░
  // get slot() { return this.circle
  //   ? this.circle._}
  // set slot(v) {
  //   if (!this.circle) { throw new Error(`[XItem.slot] '${this.name}' is not parented to a circle.`) }

  // }
  get pathPos() { return this._pathPos }
  set pathPos(v) {

  }
  async _distItems(newSlots, duration = 1, isStartPosOK = false) {

    const oldSlots = [...this.slots];
    newSlots = Array.isArray(newSlots)
      ? newSlots
      : this._checkSnap(newSlots, this.slots);
    // const newSlotRecord = [...newSlots];

    const slotCompare = this._compareSlots(newSlots, oldSlots);
    if (slotCompare.isEqual) { return Promise.resolve() }
    if (slotCompare.isSameOrder && "cycleSlot" in slotCompare) {
      newSlots = [
        oldSlots[oldSlots.length - 1],
        ...oldSlots.slice(1, -1),
        oldSlots[0]
      ];
    }

    this._slots = [...newSlots];

    const oldPositions = Object.fromEntries(this.dice.map((item) => [item.id, this._getItemPos(item, oldSlots)]));
    const newPositions = Object.fromEntries(this.dice.map((item) => [item.id, this._getItemPos(item, this.slots)]));

    const circle = this;

    return Promise.allSettled(this.dice
      .map((item) => new Promise((resolve, reject) => {
        let oldPathPos = oldPositions[item.id]?.pathPos ?? 0;
        const newPathPos = newPositions[item.id].pathPos;

        // OLD: 0.9 to NEW: 0.1   --> startAt OLD--
        // OLD: 0.1 to NEW: 0.9   --> startAt OLD++
        if (circle._checkSlots(item, oldSlots) && Math.abs(oldPathPos - newPathPos) > 0.6) {
          if (oldPathPos > newPathPos) {
            oldPathPos--;
          } else {
            oldPathPos++;
          }
        }
        console.log(gsap.to(item.elem, {
          motionPath: {
            path: circle.snap.elem,
            alignOrigin: [0.5, 0.5],
            start: oldPathPos,
            end: newPathPos,
            fromCurrent: true // item.id in oldPositions
          },
          duration,
          ease: "power4.out",
          onComplete: resolve,
          onUpdate() {
            // const {onUpdate, ...theRest} = this;
            // item._pathPos = JSON.parse(JSON.stringify(theRest));
          },
          onInterrupt: reject
        }));
      })));
  }

}

class XDie extends MIX(XItem).with(IsDraggable) {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  // ░░░░░░░[Getters]░░░░ Enumerables, Constants ░░░░░░░
  static get TYPES() { return {basic: "basic"} }
  static get CLASSES() { return [...super.CLASSES, "x-die"] }
  static get PREFIX() { return "xDie" }

  // ████████ CONSTRUCTOR ████████
  constructor(options = {}) {
    options.pathWeight = options.pathWeight ?? 1;
    options.type = XDie.TYPES[options.type] ?? options.type ?? XDie.TYPES.basic;
    super(options);
  }

  // ████████ GETTERS & SETTERS ████████

  // ░░░░░░░ Writeable ░░░░░░░
  get parent() { return super.parent }
  set parent(v) {
    super.parent = v;
    this.straighten();
  }

  // # region ████████ PRIVATE METHODS ████████ ~ // # endregion ▄▄▄▄▄ PRIVATE METHODS ▄▄▄▄▄
  // # region ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░ ~ // # endregion ░░░░[Initializing]░░░░
  // # region ░░░░░░░[Elements]░░░░ Managing Item Element ░░░░░░░ ~ // # endregion ░░░░[Elements]░░░░
  // # region ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░ ~ // # endregion ░░░░[Animation]░░░░

  // ████████ PUBLIC METHODS ████████
  // ░░░░░░░ Animation ░░░░░░░
  // get slot() { return this.circle
  //   ? this.circle._}
  // set slot(v) {
  //   if (!this.circle) { throw new Error(`[XItem.slot] '${this.name}' is not parented to a circle.`) }
  // }
  get pathPos() { return this._pathPos }
  set pathPos(v) {

  }

}

class XSnap extends XItem {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  // ░░░░░░░[Getters]░░░░ Enumerables, Constants ░░░░░░░
  static get TYPES() { return {die: "die"} }
  static get CLASSES() { return [...super.CLASSES, "x-snap"] }
  static get PREFIX() { return "xSnap" }

  // ████████ CONSTRUCTOR ████████
  constructor(snapTarget, options = {}) {
    options.pathWeight = options.pathWeight ?? 2;
    options.type = XSnap.TYPES[options.type] ?? options.type ?? XSnap.TYPES.die;
    super(options);
    this._name = `SNAP-${this.name}`;
    this._snapTarget = snapTarget;
  }

  // ████████ PRIVATE METHODS ████████

}

// ████████ EXPORTS ████████
export {XItem, XDie, XSnap};