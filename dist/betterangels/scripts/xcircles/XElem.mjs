/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Oct 26 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

// ████████ IMPORTS ████████
import {
  // ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮
  gsap, MotionPathPlugin, // GreenSock Animation Platform
  // ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮
  U,
  // ▮▮▮▮▮▮▮[Mixins]▮▮▮▮▮▮▮
  MIX, Positioner
} from "../helpers/bundler.mjs";

export default class XElem extends MIX().with(Positioner) {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  static get CONTAINER_DATA() {
    return {
      id: "x-container",
      classes: ["x-container"]
    };
  }
  static get CONTAINER() {
    return (this._CONTAINER = this._CONTAINER ?? this.MakeContainer());
  }
  static get STANDARDSETTINGS() {
    return {position: "absolute", xPercent: -50, yPercent: -50, transformOrigin: "50% 50%"};
  }
  static MakeContainer() {
    this._CONTAINER = new XElem(
      "<div id=\"#x-container\" class=\"x-container\" />",
      {
        properties: U.objMap(this.STANDARDSETTINGS, (v) => null),
        parent: new XElem(this.CONTAINER_DATA.parentSelector)
      }
    );
  }

  // ▮▮▮▮▮▮▮[GSAP INTEGRATION] Ensuring Properties Set Using GSAP ▮▮▮▮▮▮▮
  get(prop) { return gsap.getProperty(this.elem, prop) }
  set(propVals = {}) { gsap.set(this.elem, propVals) }

  // ████████ CONSTRUCTOR ████████
  constructor(htmlOrSelector, {properties = {}, parent, isMotionPath} = {}) {
    super();
    const setParams = {};
    if (U.isHTMLCode(htmlOrSelector)) {
      parent = parent ?? XElem.CONTAINER;
      Object.assign(setParams, this.constructor.STANDARDSETTINGS);
      if (isMotionPath) {
        [this._elem] = MotionPathPlugin.convertToPath(
          $(`<svg>${htmlOrSelector}</svg>`)
            .find("*")
            .appendTo(parent.$.find("svg"))[0]
        );
        this._$ = $(this._elem);
      } else {
        this._$ = $(htmlOrSelector);
        [this._elem] = this.$;
        console.log(this);
      }
    } else {
      if (isMotionPath) {
        [this._elem] = MotionPathPlugin.convertToPath($(htmlOrSelector)[0]);
        this._$ = $(this._elem);
      } else {
        this._$ = $(htmlOrSelector);
        [this._elem] = this.$;
      }
    }
    this.set(U.objFilter({...setParams, ...properties}, (v) => v !== null));
  }

  // ████████ DOM: Basic DOM Management ████████
  get $() { return this._$ }
  get elem() { return this._elem }
  get id() { return (this._id = this._id ?? this.elem.id) }
  get sel() { return (this._sel = this._sel ?? `#${this.id}`) }
  get selector() { return (this._selector = this._selector ?? gsap.utils.selector(this.elem)) }

  get tag() { return this.elem.tagName }

  get isValidPath() {
    return this.elem instanceof SVGElement
    || $(`<svg>${this.elem.outerHTML}</svg>`).find("*")[0] instanceof SVGElement;
  }

  kill() { this.$.remove() }

  // ████████ POSITION: Getting & Setting Relative/Absolute Positions ████████
  get x() { return this.get("x") } set x(x) { this.set({x}) }
  get y() { return this.get("y") } set y(y) { this.set({y}) }
  get pos() { return {x: this.x, y: this.y} } set pos({x, y}) { this.set({x, y}) }

  get left() { return this.x - 0.5 * this.width } set left(left) { this.x = left + 0.5 * this.width }
  get top() { return this.y - 0.5 * this.height } set top(top) { this.y = top + 0.5 * this.height }
  get right() { return this.x + 0.5 * this.width } set right(right) { this.x = right - 0.5 * this.width }
  get bottom() { return this.y + 0.5 * this.height } set bottom(bottom) { this.y = bottom - 0.5 * this.height }

  get height() { return this.get("height") } set height(height) { this.set({height}) }
  get width() { return this.get("width") } set width(width) { this.set({width}) }
  get radius() { return (this.height + this.width) / 4 }
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

  _getAbsAngleTo({x, y}) { return U.getAngle(this, {x, y}) }
  _getRelAngleTo({x, y}) { return U.cycleNum(this._getAbsAngleTo({x, y}) - this.rotation + 180, -180, 180) }
  _getDistanceTo({x, y}) { return U.getDistance(this, {x, y}) }

  // ████████ REPARENTING: Reparenting & Converting Coordinates ████████
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
  get defaultClasses() { return this.constructor.CLASSES ?? [] }

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
}