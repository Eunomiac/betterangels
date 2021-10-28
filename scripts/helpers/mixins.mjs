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

// #region ████████ MIXINS ████████ ~

export const Positioner = (superclass) => class extends superclass {
  convertCoords({x, y} = this, to = XElem.CONTAINER, from = this) {
    if (to instanceof XElem && from instanceof XElem) {
      return MotionPathPlugin.convertCoordinates(from.domElem, to.domElem, {x, y});
    }
    throw new Error("Can only convert coordinates between two XElem instances.");
  }
};
export const BindToXElem = (superclass) => class extends superclass {
  // A class with this mixin applied is associated with a primary XElem instance (i.e. a
  // primary DOMElement) such that setting properties on instances of this class will flow
  // through to the properties of the bound XElem.

  bindXElem(xElem) {
    if (xElem instanceof XElem) {
      this._XElem = xElem;
    }
  }

  // #region ▮▮▮▮▮▮▮[GSAP INTEGRATION] Mapping DOM Property Manipulation to Bound XElem ▮▮▮▮▮▮▮ ~
  get(prop) { return this.elem ? gsap.getProperty(this.elem.elem, prop) : null }
  set(propVals = {}) { if (this.elem) { gsap.set(this.elem.elem, propVals) } }
  // #endregion ▮▮▮▮[GSAP INTEGRATION]▮▮▮▮

  // #region ████████ DOM: Basic DOM Management ████████ ~
  get elem() { return this._XElem }
  get $() { return this.elem?.$ }
  get domElem() { return this.elem?.elem }
  get id() { return (this._id = this._id ?? this.elem?.id) }
  get sel() { return this.elem?.sel }
  get selector() { return (selText) => Array.from(this.$?.find(selText)) }

  kill() {
    this.elem?.kill();
    super.kill?.();
  }
  // #endregion ▄▄▄▄▄ DOM ▄▄▄▄▄

  // #region ████████ POSITION: Mapping DOM Position Settings to Bound XElem ████████ ~
  get x() { return this.elem?.x } set x(x) { if (this.elem) { this.elem.x = x } }
  get y() { return this.elem?.y } set y(y) { if (this.elem) { this.elem.y = y } }
  get pos() { return this.elem?.pos } set pos(pos) { if (this.elem) { this.elem.pos = pos } }

  get left() { return this.elem?.left } set left(left) { if (this.elem) { this.elem.left = left } }
  get right() { return this.elem?.right } set right(right) { if (this.elem) { this.elem.right = right } }
  get top() { return this.elem?.top } set top(top) { if (this.elem) { this.elem.top = top } }
  get bottom() { return this.elem?.bottom } set bottom(bottom) { if (this.elem) { this.elem.bottom = bottom } }

  get height() { return this.elem?.height } set height(height) { if (this.elem) { this.elem.height = height } }
  get width() { return this.elem?.width } set width(width) { if (this.elem) { this.elem.width = width } }
  get radius() { return this.elem?.radius } set radius(radius) { if (this.elem) { this.elem.radius = radius } }

  get rotation() { return this.elem?.rotation } set rotation(rotation) { if (this.elem) { this.elem.rotation = rotation } }

  _getAbsAngleTo(point) { return this.elem?._getAbsAngleTo(point) }
  _getRelAngleTo(point) { return this.elem?._getRelAngleTo(point) }
  _getDistanceTo(point) { return this.elem?._getDistanceTo(point) }
  // #endregion ▄▄▄▄▄ POSITION ▄▄▄▄▄

  // #region ████████ REPARENTING: Mapping Parenting Methods to Bound XElem ████████ ~
  get parent() { return this.elem?._parent }
  set parent(parent) { if (this.elem) { this.elem.parent = parent } }
  // #endregion ▄▄▄▄▄ REPARENTING ▄▄▄▄▄

  // #region ████████ STYLES: CSS Style Management ████████ ~
  get defaultClasses() {
    return [
      ...this.constructor.CLASSES ?? this.elem?.defaultClasses ?? [],
      U.formatAsClass(`${this.constructor.PREFIX}-${this.type ?? "generic"}`)
    ];
  }
  get classes() { return this.elem?.classList }
  set classes(classes) { if (this.elem) { this.elem.classes = classes } }
  // #endregion ▄▄▄▄▄ STYLES ▄▄▄▄▄

  // #region ████████ CONTENT: Getting & Setting Element Data & Content ████████ ~
  get text() { return this.elem?.text }
  set text(text) { if (this.elem) { this.elem.text = text } }

  get html() { return this.elem?.html }
  set html(html) { if (this.elem) { this.elem.html = html } }
  // #endregion ▄▄▄▄▄ CONTENT ▄▄▄▄▄
};
export const HasMotionPath = (superclass) => class extends superclass {
  get path() { return this._path }
  set path(path) {
    if (path.isValidPath) {
      if (!(path.elem instanceof SVGPathElement)) {
        [path._elem] = MotionPathPlugin.convertToPath(path.elem);
      }
      this._path = path;
      console.log(path);
      this._rawPath = MotionPathPlugin.getRawPath(path.elem);
      MotionPathPlugin.cacheRawPathMeasurements(this._rawPath);
    } else {
      throw new Error("Failed to create MotionPath: Path element must be an XElem instance bound to an SVG element.");
    }
  }

  get rawPath() { return this._rawPath }

  // #region ░░░░░░░[Path Position]░░░░ Functions related to position & movement along a path ░░░░░░░ ~
  _getPosOnPath(pathPos) {
    const {x, y, angle} = MotionPathPlugin.getPositionOnPath(this.path.elem, pathPos, true);
    return {x, y, angle, pathPos};
  }
  // #endregion ░░░░[Path Position]░░░░
};
export const HasSnapPath = (superclass) => class extends HasMotionPath(superclass) {
  get numSnapPoints() { return (this._numSnapPoints = this._numSnapPoints ?? 10) }
  set numSnapPoints(numSnapPoints) { this._numSnapPoints = numSnapPoints }

  get snap() {
    const _this = this;
    return {
      get id() { return _this.path?.id ?? `${_this.id}-snap` },
      get path() { return _this.path },
      get elem() { return _this.path?.elem },
      get raw() { return _this.rawPath },
      get points() {
        return [...Array(_this.numSnapPoints)].map((_, index) => {
          const {x, y} = MotionPathPlugin.convertCoordinates(
            _this.domElem,
            XElem.CONTAINER,
            _this._getPosOnPath(gsap.utils.mapRange(0, _this.numSnapPoints, 0, 1, index))
          );
          return {x, y};
        });
      }
    };
  }
};
export const IsDraggable = (superclass) => class extends superclass {
  // #region ████████ GETTERS & SETTERS ████████ ~
  get dragger() { return this._dragger }
  get isThrowing() { return this.dragger?.isThrowing }
  get isDragging() { return this._isDragging && !this.isThrowing }

  // #region ░░░░░░░ Writeable ░░░░░░░ ~
  get parent() { return super.parent }
  set parent(v) {
    super.parent = v;
    this.dragger?.update();
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
    const _this = this;
    return this.circle
      ? null
      : {
          get circle() { return _this._snapPath },
          get x() { return _this._snapPoint?.x },
          get y() { return _this._snapPoint?.y },
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
    delete this._snapPath;
    delete this._snapPoint;
    this.circle = catchCircle;
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
    [this._snapPath, this._snapPoint] = XCircle.UpdateCircleWatch(this, point);
  }
  _onSnap(point) {
    super._onSnap(point);
    const {x, y, circle} = XCircle.Snap(point);
    this._snapPath = circle;
    this._snapPoint = {x, y};
    return {x, y};
  }
};
// #endregion ▄▄▄▄▄ MIXINS ▄▄▄▄▄