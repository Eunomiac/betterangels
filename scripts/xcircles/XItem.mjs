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
    const {slot} = this.circle?.getSlotPos(this) ?? {};
    return slot;
  }
  get slotAbsAngle() {
    const {angle} = this.circle?.getSlotPos(this) ?? {};
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
      CLASSES: [...super.DEFAULT_DATA.CLASSES, "x-snap"],
      MINWEIGHT: 1.5,
      MAXWEIGHT: 3
    };
  }
  // #endregion ▄▄▄▄▄ STATIC ▄▄▄▄▄

  // #region ████████ CONSTRUCTOR ████████ ~
  constructor(snapTarget, {
    properties = {},
    parent = snapTarget.circle,
    pathWeight = XSnap.DEFAULT_DATA.MINWEIGHT,
    name,
    ...options
  } = {}) {
    if (!(parent instanceof XCircle)) { throw new Error("[XSnap] XSnaps must be parented to an XCircle.") }
    name = `S:${snapTarget.name}:${parent.name}`;
    const {pathPos} = parent._getPosOnCircle({x: snapTarget.x, y: snapTarget.y});
    const {x, y} = parent._getPosOnPath(pathPos);
    super($("<div></div>"), {
      ...options,
      properties: {
        ...properties,
        x,
        y
      },
      parent,
      pathWeight,
      name
    });
    this._snapTarget = snapTarget;
  }
  // #endregion ▄▄▄▄▄ CONSTRUCTOR ▄▄▄▄▄

  get curSlot() { return this.circle.slots.findIndex((slotItem) => slotItem.name === this.name) }
  get targetSlot() { return this.circle._getNearestSlot(this.snapTarget) }

  get snapTarget() { return this._snapTarget }
  get targetDistance() { return Math.max(0, U.getDistance(this.circle, this.snapTarget) - this.circle.path.radius) }

  get pathWeight() {
    this._pathWeightInterpolator = gsap.utils.interpolate(this.constructor.DEFAULT_DATA.MINWEIGHT, this.constructor.DEFAULT_DATA.MAXWEIGHT);
    this._pathWeight = this._pathWeightInterpolator(gsap.utils.normalize(0, 2000, this.targetDistance));
    return super.pathWeight;
  }
}

// #region ████████ EXPORTS ████████ ~
export {
  XItem,
  XDie,
  XSnap
};
// #endregion ▄▄▄▄▄ EXPORTS ▄▄▄▄▄