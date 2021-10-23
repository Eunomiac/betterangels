// #region ████████ IMPORTS ████████ ~
// #region ▮▮▮▮▮▮▮ GreenSock ▮▮▮▮▮▮▮ ~
import gsap, {
  Draggable as Dragger,
  InertiaPlugin,
  MotionPathPlugin/* ,
  Flip */
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
      },
      get htmlPoints() {
        return new Array(parent.numSnapPoints).fill(null).map((v, i) => {
          const {x, y} = MotionPathPlugin.convertCoordinates(
            this.elem,
            "html",
            MotionPathPlugin.getPositionOnPath(
              this.path,
              gsap.utils.mapRange(0, parent.numSnapPoints, 0, 1, i)
            )
          );
          return {x, y};
        });
      },
      get innPoints() {
        return new Array(parent.numSnapPoints).fill(null).map((v, i) => {
          const {x, y} = MotionPathPlugin.convertCoordinates(
            this.elem,
            this.constructor.CONTAINER,
            MotionPathPlugin.getPositionOnPath(
              this.path,
              gsap.utils.mapRange(0, parent.numSnapPoints, 0, 1, i)
            )
          );
          return {x, y};
        });
      },
      get absPoints() {
        return new Array(parent.numSnapPoints).fill(null).map((v, i) => {
          const {x, y} = MotionPathPlugin.getPositionOnPath(
            this.path,
            gsap.utils.mapRange(0, parent.numSnapPoints, 0, 1, i)
          );
          return {x, y};
        });
      },
      get revPoints() {
        return new Array(parent.numSnapPoints).fill(null).map((v, i) => {
          const {x, y} = MotionPathPlugin.convertCoordinates(
            this.constructor.CONTAINER,
            parent.elem,
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
  _onSnap(point) { }
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
        snap: {points: this._onSnap},
        onDragEnd: this._onDragEnd,
        onThrowUpdate: this._onThrowUpdate,
        onThrowComplete: this._onThrowComplete
      }
    );
  }
  // #endregion ░░░░[Initializing]░░░░
  // #endregion ▄▄▄▄▄ PRIVATE METHODS ▄▄▄▄▄
};
export const SnapsToCircle = (superclass) => class extends superclass {
  get snap() {
    if (super.snap) {
      throw new Error(`SnapsToCircle Mixin Collision: Preexisting 'snap' getter on ${super.constructor.name}`);
    }
    const parent = this;
    return this.circle
      ? null
      : {
          get circle() { return parent._snapCircle },
          get x() { return parent._snapPoint?.x },
          get y() { return parent._snapPoint?.y },
          get point() { return {x: this.x, y: this.y} }
        };
  }

  get closestCircle() { return (this._closestCircle = this.circle ?? this.snap?.circle ?? this._closestCircle ?? XCircle.GetClosestTo(this)) }
  set closestCircle(v) { this._closestCircle = v }

  get pathPos() { return (this._pathPos = this.circle ? this._pathPos ?? 0 : false) }
  set pathPos(v) { this._pathPos = this.circle ? v : false }

  get pathWeight() { return (this._pathWeight = this._pathWeight ?? this._options.pathWeight ?? 1) }
  set pathWeight(v) { this._pathWeight = v }

  get pathRepositionTime() { return (this._pathRepositionTime = this._pathRepositionTime ?? 0.5) }
  set pathRepositionTime(v) { this._pathRepositionTime = v }

  get targetPathPos() { return (this._targetPathPos = this.circle ? this._targetPathPos ?? 0 : false) }
  set targetPathPos(v) { this._targetPathPos = this.circle ? v : false }

  async setPathPos(pathPos) {
    if (!this.circle) { return Promise.reject() }
    if (pathPos === this.targetPathPos) { return Promise.resolve() }
    const item = this;
    let [start, end] = [this.pathPos, pathPos];
    if (start && Math.abs(start - end) > 0.6) {
      start += start > end ? -1 : 1;
    }
    this.targetPathPos = pathPos;
    return new Promise((resolve, reject) => {
      gsap.to(this.elem, {
        motionPath: {
          path: this.circle.snap.elem,
          alignOrigin: [0.5, 0.5],
          start,
          end,
          fromCurrent: true
        },
        duration: this.pathRepositionTime,
        ease: "power4.out",
        onStart() { item.isMoving = true },
        onUpdate() {
          if (!item.circle) {
            this.kill();
            reject();
          } else {
            item.pathPos = start + this.ratio * (end - start);
          }
        },
        onComplete() {
          item.pathPos = end;
          item.isMoving = false;
          resolve();
        },
        onInterrupt: reject
      });
    });
  }

  catch(catchCircle) {
    delete this._snapCircle;
    delete this._snapPoint;
    this.circle = catchCircle;
  }

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
  _onSnap(point) {
    super._onSnap(point);
    const {x, y, circle} = XCircle.Snap(point);
    this._snapCircle = circle;
    this._snapPoint = {x, y};
    return {x, y};
  }
};
// #endregion ▄▄▄▄▄ MIXINS ▄▄▄▄▄