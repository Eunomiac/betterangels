// #region ████████ IMPORTS ████████ ~
import {
  // #region ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮ ~
  gsap, Dragger, InertiaPlugin, MotionPathPlugin, // GreenSock Animation Platform
  // #endregion ▮▮▮▮[External Libraries]▮▮▮▮
  // #region ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮ ~
  U,
  // #endregion ▮▮▮▮[Utility]▮▮▮▮
  // #region ▮▮▮▮▮▮▮[XCircles]▮▮▮▮▮▮▮ ~
  XElem,
  XCircle,
  // #endregion ▮▮▮▮[XCircles]▮▮▮▮
  // #region ▮▮▮▮▮▮▮[Mixins]▮▮▮▮▮▮▮ ~
  MIX, IsDraggable, SnapsToCircle
  // #endregion ▮▮▮▮[Mixins]▮▮▮▮
} from "../helpers/bundler.mjs";
// #endregion ▄▄▄▄▄ IMPORTS ▄▄▄▄▄

class XItem extends XElem {
  // #region ████████ STATIC: Static Getters, Setters, Methods ████████ ~
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
  // #endregion ▄▄▄▄▄ STATIC ▄▄▄▄▄

  // #region ████████ GETTERS & SETTERS ████████ ~
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
  // #endregion ▄▄▄▄▄ GETTERS & SETTERS ▄▄▄▄▄

  // #region ████████ PRIVATE METHODS ████████ ~
  straighten() { this.set({rotation: -1 * (this.parent?.rotation ?? 0)}) }
  // #endregion ▄▄▄▄▄ PRIVATE METHODS ▄▄▄▄▄
}

class XDie extends MIX(XItem).with(IsDraggable, SnapsToCircle) {
  // #region ████████ STATIC: Static Getters, Setters, Methods ████████ ~
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
  // #endregion ▄▄▄▄▄ STATIC ▄▄▄▄▄

  constructor(options = {}) {
    super($("<div></div>"), {
      ...options,
      classes: [`x-die-${options.type ?? XDie.DEFAULT_DATA.TYPE}`]
    });
    /*DEVCODE*/
    setTimeout(() => { this.text = this.slot }, 500);
    /*!DEVCODE*/
  }
}

class XSnap extends MIX(XItem).with(SnapsToCircle) {
  // #region ████████ STATIC: Static Getters, Setters, Methods ████████ ~
  static get DEFAULT_DATA() {
    return {
      ...super.DEFAULT_DATA,
      PREFIX: "xSnap",
      CLASSES: [...super.DEFAULT_DATA.CLASSES, "x-snap"]
    };
  }
  // #endregion ▄▄▄▄▄ STATIC ▄▄▄▄▄

  // #region ████████ CONSTRUCTOR ████████ ~
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
  // #endregion ▄▄▄▄▄ CONSTRUCTOR ▄▄▄▄▄

  // #region ████████ GETTERS & SETTERS ████████ ~
  get snapTarget() { return this._snapTarget }
  set snapTarget(v) {
    if (v._snapTarget) {
      throw new Error(`${v.name} already has an associated XSnap element.`);
    }
    this._snapTarget = v;
    v._snapTarget = this;
  }
  // #endregion ▄▄▄▄▄ GETTERS & SETTERS ▄▄▄▄▄
}

// #region ████████ EXPORTS ████████ ~
export {XItem, XDie, XSnap};
// #endregion ▄▄▄▄▄ EXPORTS ▄▄▄▄▄