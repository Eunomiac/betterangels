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
  set path(path) {
    if (this.isValidMotionPath(path)) {
      gsap.set(path, {
        xPercent: -50,
        yPercent: -50,
        transformOrigin: "50% 50%"
      });
      $(path).attr("id", `${this.id}-motion-path`);
      [path] = MotionPathPlugin.convertToPath(path);
    }
    if (path instanceof SVGPathElement) {
      this._path = {
        id: `${this.id}-motion-path`,
        elem: path,
        raw: MotionPathPlugin.getRawPath(path)
      };
      MotionPathPlugin.cacheRawPathMeasurements(this.path.raw);
    } else {
      throw new Error("Failed to create MotionPath: Path element must be a valid SVG element.");
    }
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

  isValidMotionPath(pathElem) {
    return pathElem instanceof SVGElement
      || $(`<svg>${pathElem.outerHTML}</svg>`).find("*")[0] instanceof SVGElement;
  }

  _getPosOnPath(pathPos) {
    const {x, y, angle} = MotionPathPlugin.getPositionOnPath(this.path.raw, pathPos, true);
    return {x, y, angle, pathPos};
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

  get closestCircle() {
    return (this._closestCircle = this.circle
    ?? this.snap.circle
    ?? XCircle.GetClosestTo(this));
  }
  set closestCircle(v) { this._closestCircle = v }

  get pathPos() {
    return (this._pathPos = this.circle
      ? this._pathPos ?? 0
      : false);
  }
  set pathPos(v) { this._pathPos = this.circle ? v : false }

  get pathWeight() { return (this._pathWeight = this._pathWeight ?? this.options.pathWeight ?? 1) }
  set pathWeight(v) { this._pathWeight = v }

  get pathRepositionTime() { return (this._pathRepositionTime = this._pathRepositionTime ?? 0.5) }
  set pathRepositionTime(v) { this._pathRepositionTime = v }

  get targetPathPos() { return (this._targetPathPos = this.circle ? this._targetPathPos ?? 0 : false) }
  set targetPathPos(v) { this._targetPathPos = this.circle ? v : false }

  
  async setPathPos(targetPos) {
    if (!this.circle) { return Promise.reject() }
    if (targetPos === this.pathPos || targetPos === this.targetPathPos) { return Promise.resolve() }
    this.targetPathPos = targetPos;
    while (this.targetPathPos < this.pathPos) { this.targetPathPos++ }
    let deltaPos = this.targetPathPos - this.pathPos;
    if (deltaPos > 0.5) { deltaPos-- }
    deltaPos = `${deltaPos >= 0 ? "+" : "-"}=${Math.abs(deltaPos)}`;
    const _this = this;
    const startPos = this.pathPos;
    const endPos = this.targetPathPos;
    return new Promise((resolve, reject) => {
      gsap.to(this.elem, {
        motionPath: {
          path: this.circle.path.elem,
          alignOrigin: [0.5, 0.5],
          start: this.pathPos,
          end: this.targetPathPos,
          fromCurrent: true
        },
        duration: this.pathRepositionTime,
        ease: "power4.out",
        onStart() {
          _this.isMoving = true;
        },
        onUpdate() {
          if (!_this.circle) {
            _this.isMoving = false;
            this.kill();
            reject();
          } else {
            _this.pathPos = this.ratio * (endPos - startPos) + startPos;
          }
        },
        onComplete() {
          _this.pathPos = _this.targetPathPos;
          _this.isMoving = false;
          delete _this._targetPathPos;
          resolve();
        },
        onInterrupt: reject
      });
    });
  }

  catch() {
    this.circle = this.snap.circle;
    delete this._snapPath;
    delete this._snapPoint;
  }

  _onDragStart(...args) {
    super._onDragStart(...args);
    delete this._snapPath;
    delete this._snapPoint;
    this.circle?.pluckItem(this);
    this.parent = XCircle.CONTAINER;
  }
  _onDrag(point, ...args) {
    super._onDrag(point, ...args);
    this.updateSnapPoint();
  }
  _onSnap(point) {
    super._onSnap(point);
    // console.log(`Snapping ${this.name} at (${U.pInt(point.x)}, ${U.pInt(point.y)}) to ...`);
    const {x, y, circle} = XCircle.Snap(point);
    // console.log(`... (${U.pInt(x)}, ${U.pInt(y)}) of the ${circle?.type?.toUpperCase()} XCircle`);
    this._snapPath = circle;
    this._snapPoint = {x, y};
    return {x, y};
  }
  _onDragEnd() {
    super._onDragEnd();
    this._snapPath.catchItem(this);
  }/*
  _onThrowComplete() {
    super._onThrowComplete();
    this.catch();
  } */

  updateSnapPoint() {
    const {x, y, circle} = XCircle.UpdateCircleWatch(this);
    this._snapCircle = circle;
    this._snapPoint = {x, y};
  }

};
// #endregion ▄▄▄▄▄ MIXINS ▄▄▄▄▄