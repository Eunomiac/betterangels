// #region ████████ IMPORTS ████████ ~
// #region ▮▮▮▮▮▮▮ GreenSock ▮▮▮▮▮▮▮ ~
import gsap, {
  Draggable as Dragger,
  InertiaPlugin,
  MotionPathPlugin
} from "/scripts/greensock/esm/all.js"; // eslint-disable-line import/no-unresolved
// #endregion ▮▮▮▮[GreenSock]▮▮▮▮
import {
  // #region ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮ ~
  U,
  // #endregion ▮▮▮▮[Utility]▮▮▮▮
  // #region ▮▮▮▮▮▮▮[XCircles]▮▮▮▮▮▮▮ ~
  XCircle,
  XItem, XDie, XSnap
  // #endregion ▮▮▮▮[XCircles]▮▮▮▮
} from "./bundler.mjs";
// #endregion ▄▄▄▄▄ IMPORTS ▄▄▄▄▄

/*~  USAGE: DEFINING MIXINS
    ======================
    A mixin must be defined with the following syntax. The code within is written exactly as if the mixin were a subclass
    of whichever classes receive the mixin:

      const MyMixin = (superclass) => class extends superclass {
          // ... methods, properties, overrides to be integrated into the receiving class
      };

    USAGE: SUBCLASSING MIXINS
    =========================
    Mixins can subclass from other mixins just as with a normal class, though again with special syntax:

      const MySubMixin = (superclass) => class extends MyBaseMixin(superclass) {
          // ... methods, properties, overrides to be integrated into the receiving class
      };

    USAGE: APPLYING MIXINS TO CLASSES
    =================================
    The "MIX" class factory, exported from this module, makes applying multiple mixins to a receiving class syntactically simple:

      import {MIX, MyMixin1, MyMixin2, MyMixin3} from "mixins.js";
      class MySubClass extends MIX(MyBaseClass).with(MyMixin1, MyMixin2, MyMixin3) {
          // ... subclass code
      } ~*/
// #region ████████ FACTORY: "MIX" Class Factory for Applying Mixins ████████ ~
class MixinBuilder {
  constructor(superclass) { this.superclass = superclass }
  with(...mixins) { return mixins.reduce((cls, mixin = (x) => x) => mixin(cls), this.superclass) }
}
export const MIX = (superclass = class {}) => new MixinBuilder(superclass);
// #endregion ▄▄▄▄▄ FACTORY ▄▄▄▄▄

// #region ████████ MIXINS ████████ ~
export const HasDOMElem = (superclass) => class extends superclass {
  // #region ████████ STATIC: Static Getters, Setters, Methods ████████ ~
  // #region ░░░░░░░[Getters]░░░░ Registry, Enumerables, Constants ░░░░░░░ ~
  static get _ContainerID() { return "xContainer" }
  static get CONTAINER() {
    return (this._CONTAINER = this._CONTAINER
      ?? $(`#${this._ContainerID}`)[0]
      ?? $(`<div id="${this._ContainerID}" />`).appendTo(".vtt.game")[0]);
  }
  // #endregion ░░░░[Getters]░░░░
  // #region ████████ GETTERS & SETTERS ████████ ~
  // #region ░░░░░░░ Read-Only ░░░░░░░ ~
  get x() { return this.elem ? gsap.getProperty(this.elem, "x") : false }
  get y() { return this.elem ? gsap.getProperty(this.elem, "y") : false }
  get height() { return this.elem ? gsap.getProperty(this.elem, "height") : false }
  get width() { return this.elem ? gsap.getProperty(this.elem, "width") : false }
  get radius() { return this.elem ? (this.height + this.width) / 4 : false }
  get id() { return (this._id = (this._id && this._name && `${this.constructor.PREFIX}-${this._name}`) || undefined) }
  get elem() { return (this._elem = this._elem ?? $(`#${this.id}`)?.[0]) }
  get $() { return $(this.elem) }
  get defaultClasses() {
    return [
      ...this.constructor.CLASSES,
      U.formatAsClass(`${this.constructor.PREFIX}-${this.type}`)
    ];
  }
  // #endregion ░░░░[Read-Only]░░░░
  // #region ░░░░░░░ Writeable ░░░░░░░ ~
  get classes() { return this.elem?.classList }
  set classes(v) {
    if (this.elem) {
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
      this.straighten?.();
    } else {
      throw new Error(`[${this.constructor.name}.parent] No element found for '${v}'`);
    }
  }

  get rotation() { return gsap.getProperty(this.elem, "rotation") }
  set rotation(v) {
    if (/^[+-]=/.test(`${v}`)) {
      v = this.rotation + parseFloat(`${v}`.replace(/=/g, ""));
    } else if (Number.isNumber(v)) {
      gsap.set(this.elem, {rotation: v});
    } else {
      throw new Error(`Cannot set rotation to a non-number value: ${JSON.stringify(v)}`);
    }
  }
  // #endregion ░░░░[Writeable]░░░░
  // #endregion ▄▄▄▄▄ GETTERS & SETTERS ▄▄▄▄▄

  // #region ████████ PRIVATE METHODS ████████ ~
  // #region ░░░░░░░[Position Getters]░░░░ Angles & Distances to Other Elements ░░░░░░░ ~
  _getAbsAngleTo({x, y}) { return U.getAngle(this, {x, y}) }
  _getRelAngleTo({x, y}) { return U.cycle(this._getAbsAngleTo({x, y}) - this.rotation + 180, -180, 180) }
  _getDistanceTo({x, y}) { return U.getDistance(this, {x, y}) }
  // #endregion ░░░░[Position Getters]░░░░
  // #endregion ▄▄▄▄▄ PRIVATE METHODS ▄▄▄▄▄

  // #region ████████ PUBLIC METHODS ████████ ~
  // #region ░░░░░░░[Elements]░░░░ Managing DOM Elements ░░░░░░░ ~
  set(params) { gsap.set(this.elem, params) }
  kill() {
    this.constructor.Unregister?.(this);
    this.$.remove();
  }
  // #endregion ░░░░[Elements]░░░░
  // #endregion ▄▄▄▄▄ PUBLIC METHODS ▄▄▄▄▄
};
export const HasMotionPath = (superclass) => class extends superclass {
  // #region ████████ PRIVATE METHODS ████████ ~
  // #region ░░░░░░░[Path Position]░░░░ Functions related to position & movement along a path ░░░░░░░ ~
  _getPosOnPath(pathPos) {
    const {x, y, angle} = MotionPathPlugin.getPositionOnPath(this.snap.path, pathPos, true);
    return {x, y, angle, pathPos};
  }
  // #endregion ░░░░[MotionPathPlugin]░░░░
};

export const HasSnapPath = (superclass) => class extends HasMotionPath(superclass) {
  // #region ████████ GETTERS & SETTERS ████████ ~
  // #region ░░░░░░░ Read-Only ░░░░░░░ ~
  get snap() {
    const parent = this;
    return {
      get id() { return `${parent.id}-snap` },
      get elem() { return (parent._snapCircle = parent._snapCircle ?? $(`#${this.id}`)?.[0]) },
      get path() {
        if (!parent._rawSnapPath) {
          parent._rawSnapPath = MotionPathPlugin.getRawPath(this.elem);
          MotionPathPlugin.cacheRawPathMeasurements(parent._rawSnapPath);
        }
        return parent._rawSnapPath;
      },
      get points() {
        return new Array(parent.numSnapPoints).fill(null).map((v, i) => {
          const {x, y} = MotionPathPlugin.convertCoordinates(
            parent.elem,
            this.constructor.CONTAINER,
            MotionPathPlugin.getPositionOnPath(
              this.path,
              gsap.utils.mapRange(0, parent.numSnapPoints, 0, 1, i)
            )
          );
          return {x, y};
        });
      }
    };
  }
  // #endregion ░░░░[Read-Only]░░░░
  // #region ░░░░░░░ Writeable ░░░░░░░ ~
  get numSnapPoints() { return (this._numSnapPoints = this._numSnapPoints ?? 10) }
  set numSnapPoints(v) { this._numSnapPoints = v }
  // #endregion ░░░░[Writeable]░░░░
  // #endregion ▄▄▄▄▄ GETTERS & SETTERS ▄▄▄▄▄
};
export const IsDraggable = (superclass) => class extends superclass {
  // #region ████████ GETTERS & SETTERS ████████ ~
  // #region ░░░░░░░ Read-Only ░░░░░░░ ~
  get dragger() { return this._dragger }
  get isThrowing() { return this.dragger?.isThrowing }
  get isDragging() { return this._isDragging && !this.isThrowing }
  // #endregion ░░░░░░░[Read-Only]░░░░░░░ ~

  // #region ░░░░░░░ Writeable ░░░░░░░ ~
  get parent() { return super.parent }
  set parent(v) {
    super.parent = v;
    this.dragger?.update(false, this.isDragging);
  }
  get isMoving() { return super.isMoving || this.isDragging || this.isThrowing }
  set isMoving(v) { super.isMoving = v }
  // #endregion ░░░░[Writeable]░░░░
  // #endregion ▄▄▄▄▄ GETTERS & SETTERS ▄▄▄▄▄

  // #region ████████ PRIVATE METHODS ████████ ~
  // #region ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░ ~
  _create(...params) {
    super._create(...params);
    this._createDragger();
  }

  _onDragStart() { this._isDragging = true }
  _onDrag(point) { }
  _snap(point) { }
  _onDragEnd() { this._isDragging = false }
  _onThrowUpdate() { }
  _onThrowComplete() { }

  _createDragger() {
    [this._dragger] = Dragger.create(
      this.elem,
      {
        type: "x,y",
        inertia: true,
        callbackScope: this,
        minDuration: 2,
        throwResistance: 100,
        onDragStart: this._onDragStart,
        onDrag: this._onDrag,
        snap: this._snap,
        onDragEnd: this._onDragEnd,
        onThrowUpdate: this._onThrowUpdate,
        onThrowComplete: this._onThrowComplete
      }
    );
  }
  // #endregion ░░░░[Initializing]░░░░
  // #endregion ▄▄▄▄▄ PRIVATE METHODS ▄▄▄▄▄
};
export const SnapsToCircle = (superclass) => class extends IsDraggable(superclass) {
  _onDragStart(...args) {
    super._onDragStart(...args);
    delete this._snapCircle;
    delete this._snapPoint;
    this.circle?.pluckItem(this);
    this.parent = XCircle.CONTAINER;
  }
  _onDrag(point, ...args) {
    super._onDrag(point, ...args);
    [this._snapCircle, this._snapPoint] = XCircle.UpdateCircleWatch(this, point);
  }
  _snap(point, ...args) {
    super._snap(point, ...args);
    const {x, y, circle} = XCircle.Snap(point);
    this._snapCircle = circle;
    this._snapPoint = {x, y};
    return {x, y};
  }
};
// #endregion ▄▄▄▄▄ MIXINS ▄▄▄▄▄