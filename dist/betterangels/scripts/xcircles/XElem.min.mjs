/* ▌██░░ betterangels v0.0.1-prealpha (2021) ║ MIT License ║ https://github.com/Eunomiac/betterangels ░░██▐ */// ████████ IMPORTS ████████
import {
  // ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮
  gsap, Dragger, InertiaPlugin, MotionPathPlugin, // GreenSock Animation Platform
  // ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮
  U
} from "../helpers/bundler.mjs";
export default class XElem {
  // ████████ STATIC ████████
  static get CONTAINER() {
    return (this._CONTAINER = this._CONTAINER
      ?? $("#xContainer")[0]
      ?? $("<div id=\"xContainer\" class=\"x-container\" />").appendTo(".vtt.game")[0]);
  }
  static get PREFIX() { return "xElem" }
  static get STANDARDSETTINGS() {
    return {position: "absolute", xPercent: -50, yPercent: -50, transformOrigin: "50% 50%"};
  }

  // ▮▮▮▮▮▮▮[GSAP INTEGRATION] Ensuring Properties Set Using GSAP ▮▮▮▮▮▮▮
  get(prop) { return gsap.getProperty(this.elem, prop) }
  set(propVals = {}) { gsap.set(this.elem, propVals) }

  // ████████ CONSTRUCTOR ████████
  constructor(htmlCode, {properties = {}, parent = XElem.CONTAINER} = {}) {
    this._$ = $(htmlCode);
    this.$.appendTo(parent);
    this.set({...this.constructor.STANDARDSETTINGS, ...properties});
  }

  // ████████ DOM: Basic DOM Properties ████████
  get $() { return this._$ }
  get elem() { return (this._elem = this._elem ?? this.$[0]) }
  get id() { return (this._id = this._id ?? this.elem.id) }
  get sel() { return (this._sel = this._sel ?? `#${this.id}`) }
  get selector() { return (this._selector = this._selector ?? gsap.utils.selector(this.elem)) }

  // ████████ POSITION: Getting & Setting Relative/Absolute Positions, Reparenting ████████
  get x() { return this.get("x") } set x(v) { this.set({x: v}) }
  get y() { return this.get("y") } set y(v) { this.set({y: v}) }
  get height() { return this.get("height") } set height(v) { this.set({height: v}) }
  get width() { return this.get("width") } set width(v) { this.set({width: v}) }

  get radius() {
    console.log([this.height, this.width, (this.height + this.width) / 4]);
    return (this.height + this.width) / 4;
  }
  set radius(v) {
    const scaleRatio = v / this.radius;
    this.set({
      height: this.height * scaleRatio,
      width: this.width * scaleRatio
    });
  }

  get rotation() { return gsap.getProperty(this.elem, "rotation") }
  set rotation(v) {
    if (/^[+-]=/.test(`${v}`)) {
      v = this.rotation + U.pFloat(`${v}`.replace(/=/g, ""));
    }
    if (["int", "float"].includes(U.getType(v))) {
      gsap.set(this.elem, {rotation: v});
    } else {
      throw new Error(`Cannot set rotation to a non-number value: ${JSON.stringify(v)}`);
    }
  }

  get left() { return this.x - 0.5 * this.width }
  set left(v) { this.x = v + 0.5 * this.width }
  get top() { return this.y - 0.5 * this.height }
  set top(v) { this.y = v + 0.5 * this.height }
  get right() { return this.x + 0.5 * this.width }
  set right(v) { this.x = v - 0.5 * this.width }
  get bottom() { return this.y + 0.5 * this.height }
  set bottom(v) { this.y = v - 0.5 * this.height }

  setPosition(posData = {}) {
    const [directVals, derivedVals] = U.partition(posData, (v, k) => ["x", "y", "height", "width"].includes(k));
    this.set(directVals);
    for (const [prop, val] of Object.entries(derivedVals)) {
      if (["left", "top", "right", "bottom", "radius", "rotation"].includes(prop)) {
        this[prop] = val;
      }
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
      this.$.appendTo(elem);
    } else {
      throw new Error(`[${this.constructor.name}.parent] No element found for '${v}'`);
    }
  }

  // ████████ STYLES: CSS Style Management ████████
  get defaultClasses() {
    return [
      ...this.constructor.CLASSES ?? [],
      U.formatAsClass(`${this.constructor.PREFIX}-${this.type ?? "generic"}`)
    ];
  }

  get classes() { return this.elem?.classList }
  set classes(v) {
    if (this.classes) {
      const newClassList = [
        ...this.defaultClasses ?? [],
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

  // ████████ CONTENT: Getting & Setting Element Data & Content ████████
  get text() { return this.get("innerText") }
  set text(v) { this.set({innerText: v}) }

  get html() { return this.get("innerHTML") }
  set html(v) { this.set({innerHTML: v}) }

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Position Getters]░░░░ Angles & Distances to Other Elements ░░░░░░░
  _getAbsAngleTo({x, y}) { return U.getAngle(this, {x, y}) }
  _getRelAngleTo({x, y}) { return U.cycleNum(this._getAbsAngleTo({x, y}) - this.rotation + 180, -180, 180) }
  _getDistanceTo({x, y}) { return U.getDistance(this, {x, y}) }

  // ████████ PUBLIC METHODS ████████
  // ░░░░░░░[Elements]░░░░ Managing DOM Elements ░░░░░░░
  kill() { this.$.remove() }

}