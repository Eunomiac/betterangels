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
  XItem, XDie, XSnap
  // #endregion ▮▮▮▮[XCircles]▮▮▮▮
} from "./bundler.mjs";
// #endregion ▄▄▄▄▄ IMPORTS ▄▄▄▄▄

// #region ████████ FACTORY: "MIX" Class Factory for Applying Mixins ████████ ~
class MixinBuilder {
  constructor(superclass) { this.superclass = superclass }
  with(...mixins) { return mixins.reduce((cls, mixin = (x) => x) => mixin(cls), this.superclass) }
}
export const MIX = (superclass = class {}) => new MixinBuilder(superclass);
// #endregion ▄▄▄▄▄ FACTORY ▄▄▄▄▄

// #region ████████ MIXINS ████████
export const HasMotionPath = (superclass) => class extends superclass {
  get path() { return this._path }
  set path(elem) {
    const radius = gsap.getProperty(elem, "r");
    gsap.set(elem, {
      xPercent: -50,
      yPercent: -50,
      transformOrigin: "50% 50%"
    });
    $(elem).attr("id", `${this.id}-motion-path`);
    [elem] = MotionPathPlugin.convertToPath(elem);
    this._path = {
      id: `${this.id}-motion-path`,
      elem,
      raw: MotionPathPlugin.getRawPath(elem),
      radius
    };
    MotionPathPlugin.cacheRawPathMeasurements(this.path.raw);
  }

  constructor($obj, {pathProperties = {}, ...options} = {}) {
    super($obj, options);
    const [path] = this.$.find(".motion-path");
    gsap.set(path, U.objFilter({
      ...this.constructor.DEFAULT_DATA.SETTINGS,
      ...pathProperties
    }, (val) => val !== null));
    this.path = path;
  }
  _getPosOnPath(pathPos) {
    const {x, y, angle} = MotionPathPlugin.getPositionOnPath(this.path.raw, pathPos, true);
    return {x, y, angle, pathPos};
  }
  _getPosOnCircle({pathPos, x, y} = {}) {
    pathPos = pathPos ?? gsap.utils.normalize(-180, 180, this._getRelAngleTo({x, y}));
    return this._getPosOnPath(pathPos);
  }
};
export const HasSnapPath = (superclass) => class extends HasMotionPath(superclass) {
  get path() {
    const _this = this;
    return {
      ...super.path,
      get points() {
        return [...Array(_this.numSnapPoints)].map((_, index) => {
          const localPoint = _this._getPosOnPath(gsap.utils.mapRange(0, _this.numSnapPoints, 0, 1, index));
          return _this.alignLocalPointTo(XElem.CONTAINER, localPoint);
        });
      }
    };
  }
  set path(path) {
    super.path = path;
    this.constructor.SNAPPOINTS = this;
  }

  static get SNAPPOINTS() { return (this._SNAPPOINTS = this._SNAPPOINTS ?? new Map()) }
  static set SNAPPOINTS(xInst) {
    xInst.path.points.forEach(({x, y}) => {
      x = U.pInt(x);
      y = U.pInt(y);
      this.SNAPPOINTS.set({x, y}, xInst);
    });
  }
  static Unregister(xInst) {
    this.SNAPPOINTS.forEach((regInst, point, map) => {
      if (xInst.id === regInst.id) { map.delete(point) }
    });
    super.Unregister(xInst);
  }

  get numSnapPoints() { return (this._numSnapPoints = this._numSnapPoints ?? 10) }
  set numSnapPoints(numSnapPoints) { this._numSnapPoints = numSnapPoints }
};
export const IsDraggable = (superclass) => class extends superclass {
  get dragger() { return this._dragger }

  get isThrowing() { return this.dragger?.isThrowing }
  get isDragging() { return this._isDragging && !this.isThrowing }
  get isMoving() { return super.isMoving || this.isDragging || this.isThrowing }
  set isMoving(v) { super.isMoving = v }

  get parent() { return super.parent }
  set parent(v) {
    super.parent = v;
    this.dragger?.update();
  }

  constructor($obj, options = {}) {
    super($obj, options);
    this._createDragger();
  }

  _createDragger() {
    const _this = this;
    [this._dragger] = Dragger.create(
      this.elem,
      {
        type: "x,y",
        inertia: true,
        callbackScope: this,
        minDuration: 2,
        throwResistance: 100,
        onDragStart() { return this._onDragStart() },
        onDrag(point) { return this._onDrag(point) },
        snap: {points(point) { return _this._onSnap(point) }},
        onDragEnd() { return this._onDragEnd() },
        onThrowUpdate() { return this._onThrowUpdate() },
        onThrowComplete() { return this._onThrowComplete() }
      }
    );
  }

  _onDragStart() { this._isDragging = true }
  _onDrag() { }
  _onSnap() { }
  _onDragEnd() { this._isDragging = false }
  _onThrowUpdate() { }
  _onThrowComplete() { }
};
export const SnapsToCircle = (superclass) => class extends IsDraggable(superclass) {

  get snap() {
    if (this.circle) { return null }
    const _this = this;
    return {
      get circle() { return _this._snapCircle },
      get x() { return _this._snapPoint?.x },
      get y() { return _this._snapPoint?.y },
      get point() { return {x: this.x, y: this.y} }
    };
  }

  get pathPos() {
    return this.circle._getPosOnCircle({x: this.x, y: this.y}).pathPos;
  }

  get pathWeight() { return (this._pathWeight = this._pathWeight ?? this.options.pathWeight ?? 1) }
  set pathWeight(v) { this._pathWeight = v }

  get targetPathPos() { return (this._targetPathPos = this._targetPathPos ?? 0) }
  set targetPathPos(v) { this._targetPathPos = v }

  async setPathPos(targetPos, duration = 0.5) {
    if (!this.circle) { return Promise.reject() }
    if (targetPos === this.targetPathPos) { return Promise.resolve() }
    this.targetPathPos = targetPos;
    const {pathPos} = this;
    while (this.targetPathPos < pathPos) { this.targetPathPos++ }
    while (Math.abs(pathPos - this.targetPathPos) > 0.5) { this.targetPathPos-- }
    return new Promise((resolve, reject) => {
      gsap.to(this.elem, {
        motionPath: {
          path: this.circle.path.elem,
          alignOrigin: [0.5, 0.5],
          fromCurrent: false,
          start: this.pathPos,
          end: this.targetPathPos
        },
        duration,
        callbackScope: this,
        ease: "power4.out",
        onStart() {
          this.isMoving = true;
        },
        onUpdate() {
          // if (!_this.circle) {
          //   _this.isMoving = false;
          //   this.kill();
          //   reject();
          // }
        },
        onComplete() {
          this.isMoving = false;
          resolve();
        },
        onInterrupt: reject
      });
    });
  }

  _onDragStart(...args) {
    super._onDragStart(...args);
    this.circle?.removeItem(this);
    this.circle?.distributeSlots();
    this.parent = XCircle.CONTAINER;
    this.straighten();
  }
  _onDrag(point, ...args) {
    super._onDrag(point, ...args);
  }
  _onSnap(point) {
    super._onSnap(point);
    const {x, y, circle} = XCircle.Snap(point);
    return {x, y};
  }
  _onDragEnd() {
    super._onDragEnd();
    this._snapPoint = {x: this.endX, y: this.endY};
    const {circle} = XCircle.Snap(this._snapPoint);
    this._snapCircle = circle;
    this._snapCircle.catchThrownItem(this);
  }
  _onThrowComplete() {
    super._onThrowComplete();
    this.circle = this._snapCircle;
    this.circle._toggleSlowRotate(true);
    gsap.fromTo(this.elem, this._snapPoint, {
      x: this._snapCircle.x,
      y: this._snapCircle.y,
      opacity: 0.4,
      ease: "expo.out",
      duration: 1,
      callbackScope: this,
      onComplete() {
        gsap.to(this.elem, {opacity: 1, duration: 0.5});
        this._snapCircle.swapItem(this).kill();
        this._snapCircle.distributeSlots();
        this._snapCircle._toggleSlowRotate(true);
      }
    });
  }

};
// #endregion ▄▄▄▄▄ MIXINS ▄▄▄▄▄