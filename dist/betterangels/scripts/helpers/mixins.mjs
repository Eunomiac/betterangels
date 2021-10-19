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
  XItem, XDie, XSnap

} from "./bundler.mjs";

// ▮▮▮▮▮▮▮[FACTORY] "MIX" Class Factory for Applying Mixins ▮▮▮▮▮▮▮
/*  USAGE: DEFINING MIXINS
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
      } */
class MixinBuilder {
  constructor(superclass) { this.superclass = superclass }
  with(...mixins) { return mixins.reduce((cls, mixin = (x) => x) => mixin(cls), this.superclass) }
}
export const MIX = (superclass) => new MixinBuilder(superclass);

// ████████ MIXINS ████████
export const IsDraggable = (superclass) => class extends superclass {
  // ████████ GETTERS & SETTERS ████████
  // ░░░░░░░ Read-Only ░░░░░░░
  get dragger() { return this._dragger }
  get isThrowing() { return this.dragger?.isThrowing }
  get isDragging() { return this._isDragging && !this.isThrowing }
  get isMoving() { return super.isMoving || this.isDragging || this.isThrowing }

  // ░░░░░░░ Writeable ░░░░░░░
  get parent() { return super.parent }
  set parent(v) {
    super.parent = v;
    this.dragger?.update(false, this.isDragging);
  }

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░
  _create(...params) {
    super._create(...params);
    this._createDragger();
  }

  _createDragger() {
    const xDragItem = this;
    [this._dragger] = Dragger.create(
      this.elem,
      {
        type: "x,y",
        inertia: true,
        callbackScope: this,
        minDuration: 2,
        throwResistance: 100,
        onDragStart() {
          this._isDragging = true;
          this._updateClosestCircle();
          this.circle?.pluckItem(this);
          this.parent = XCircle.CONTAINER;
        },
        onDrag() { this._updateClosestCircle() },
        snap({x, y}) {
          const {x: xSnap, y: ySnap, circle} = XCircle.Snap({x, y});
          this._snapCircle = circle;
          return {x: xSnap, y: ySnap};
        },
        onDragEnd() {
          this._isDragging = false;
          this._snapCircle.catchItem(this, {x: this.dragger.endX, y: this.dragger.endY});
        },
        onThrowUpdate() { this._updateClosestCircle() },
        onThrowComplete() { delete this._snapCircle }
      }
    );
  }
};