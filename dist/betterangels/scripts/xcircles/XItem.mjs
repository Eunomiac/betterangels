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
  static get DEFAULT_DATA() {
    return {
      ...super.DEFAULT_DATA,
      PREFIX: "xItem",
      CLASSES: [...super.DEFAULT_DATA.CLASSES, "x-item"],
      PROPERTIES: {
        ...super.DEFAULT_DATA.PROPERTIES,
        rotation: 0
      }
    };
  }

  // ████████ GETTERS & SETTERS ████████
  get slot() {
    const {slot} = this.circle?._getSlotItemPos(this) ?? {};
    return slot;
  }
  get slotAbsAngle() {
    const {angle} = this.circle?._getSlotItemPos(this) ?? {};
    return angle;
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
  straighten() { this.set({rotation: -1 * (this.parent?.rotation ?? 0)}) }
}

class XDie extends MIX(XItem).with(IsDraggable, SnapsToCircle) {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  static get DEFAULT_DATA() {
    return {
      ...super.DEFAULT_DATA,
      PREFIX: "xDie",
      CLASSES: [...super.DEFAULT_DATA.CLASSES, "x-die"],
      PROPERTIES: {
        ...super.DEFAULT_DATA.PROPERTIES,
        rotation: 0
      }
    };
  }

  constructor(options = {}) {
    super($("<div></div>"), {
      ...options,
      classes: [`x-die-${options.type ?? XDie.DEFAULT_DATA.TYPE}`]
    });

  }
}

class XSnap extends MIX(XItem).with(SnapsToCircle) {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  static get DEFAULT_DATA() {
    return {
      ...super.DEFAULT_DATA,
      PREFIX: "xSnap",
      CLASSES: [...super.DEFAULT_DATA.CLASSES, "x-snap"]
    };
  }

  // ████████ CONSTRUCTOR ████████
  constructor(snapTarget, {
    properties = {},
    alignTo = snapTarget,
    pathWeight = 2,
    name = `S:${snapTarget.name}`,
    ...options
  } = {}) {
    if (snapTarget._snapTarget) {
      throw new Error(`${snapTarget.name} already has an associated XSnap element.`);
    }
    super($("<div></div>"), {
      ...options,
      properties: {
        ...properties,
        x: alignTo.x,
        y: alignTo.y
      },
      pathWeight,
      name
    });
    this._snapTarget = snapTarget;
    snapTarget._snapTarget = this;
  }

  // ████████ GETTERS & SETTERS ████████
  get snapTarget() { return this._snapTarget }
  set snapTarget(v) {
    if (v._snapTarget) {
      throw new Error(`${v.name} already has an associated XSnap element.`);
    }
    this._snapTarget = v;
    v._snapTarget = this;
  }
}

// ████████ EXPORTS ████████
export {XItem, XDie, XSnap};