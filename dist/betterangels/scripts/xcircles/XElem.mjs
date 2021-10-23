/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Oct 23 2021 ███████████████▐     *|
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
  // ▮▮▮▮▮▮▮[Mixins]▮▮▮▮▮▮▮
  MIX, HasDOMElem
} from "../helpers/bundler.mjs";

export default class XElem {
  // ████████ STATIC ████████
  static get CONTAINER() {
    return (this._CONTAINER = this._CONTAINER
      ?? $("#xContainer")[0]
      ?? $("<div id=\"xContainer\" class=\"x-container\" />").appendTo(".vtt.game")[0]);
  }

  // ▮▮▮▮▮▮▮[GSAP INTEGRATION] Ensuring Properties Set Using GSAP ▮▮▮▮▮▮▮
  get(prop) { return gsap.getProperty(this.elem, prop) }
  set(propVals = {}) { gsap.set(this.elem, this._parsePropVals(propVals)) }

  _parsePropVals(propVals = {}) {
    let [propsToTweak, props] = U.partition(propVals, (v, k) => k in this.propTweaks);
    propsToTweak = U.mapObject(propsToTweak, (v, k) => this.propTweaks[k](v));

    for (const [prop, val] of Object.entries(propVals)) {
      propTweak()
      if (prop in this.propTweaks) {

            this[prop] = val;
            delete propVals[prop];
        }
    }
    
  }

  // ████████ CONSTRUCTOR ████████ ~  
  constructor(htmlCode, parentElem = XElem.CONTAINER) {    
    this._$ = $(htmlCode);
    this.$.appendTo(parentElem);
    this.setElem({xPercent: -50, yPercent: -50});
  }

  // ▮▮▮▮▮▮▮[GETTERS: DOM] DOM Element Fundamentals ▮▮▮▮▮▮▮
  get $() { return this._$ }
  get elem() { return this.$[0] }
  get id() { return this.elem.id }
  get sel() { return `#${this.elem.id}` }
  get selector() { return gsap.utils.selector(this.elem) }

  // ████████ POSITION: Getting & Setting Relative/Absolute Positions ████████

    get x() { return this._get("x") } set x(v) { this._set({x: v}) }
    get y() { return this._get("y") } set y(v) { this._set({y: v}) }
    get height() { return this._get("height") } set height(v) { this._set({height: v}) }
    get width() { return this._get("width") } set width(v) { this._set({width: v}) }
    
    get left() { return this.x - 0.5 * this.width }
    set left(v) { this.x = v + 0.5 * this.width }
    get top() { return this.y - 0.5 * this.height }
    set top(v) { this.y = v + 0.5 * this.height }
    
    get text() { return this._get("innerText") }
    set text(v) { this._set({innerText: v}) }
       
    constructor(htmlCode, appendTo) {
        this.$ = $(htmlCode);
        this.elem = this.$[0];
        this.id = this.elem.id;
        this.sel = `#${this.id}`;        
        this.$.appendTo(appendTo);
        this._set(ELEM.STANDARDSETTINGS);
    }
    
    updatePosDisplay() {
        
    }
}

  // ████████ GETTERS & SETTERS ████████
  // ░░░░░░░ Read-Only ░░░░░░░
  get id() { return (this._id = (this._id ?? (this._name && `${this.constructor.PREFIX}-${this._name}`)) || this.constructor.Throw("Unable to determine element id."))

  get x() { return this.elem ? gsap.getProperty(this.elem, "x") : false }
  get y() { return this.elem ? gsap.getProperty(this.elem, "y") : false }
  get height() { return this.elem ? gsap.getProperty(this.elem, "height") : false }
  get width() { return this.elem ? gsap.getProperty(this.elem, "width") : false }
  get radius() { return this.elem ? (this.height + this.width) / 4 : false }
  get id() { return (this._id = (this._id ?? (this._name && `${this.constructor.PREFIX}-${this._name}`)) || undefined) }
  get elem() { return (this._elem = this._elem ?? $(`#${this.id}`)?.[0]) }
  get $() { return $(this.elem) }
  get defaultClasses() {
    return [
      ...this.constructor.CLASSES,
      U.formatAsClass(`${this.constructor.PREFIX}-${this.type}`)
    ];
  }
  // ░░░░░░░ Writeable ░░░░░░░
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

  /*   get parent() { return this._parent }
  set parent(v) {
    const [elem] = $(`#${v?.id ?? "noElemFound"}`);
    if (elem) {
      const state = Flip.getState(this.elem);
      this._parent = v;
      $(this.elem).appendTo(elem);
      Flip.fit(this.elem, state);
      this.straighten?.();
    } else {
      throw new Error(`[${this.constructor.name}.parent] No element found for '${v}'`);
    }
  } */

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

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Position Getters]░░░░ Angles & Distances to Other Elements ░░░░░░░
  _getAbsAngleTo({x, y}) { return U.getAngle(this, {x, y}) }
  _getRelAngleTo({x, y}) { return U.cycle(this._getAbsAngleTo({x, y}) - this.rotation + 180, -180, 180) }
  _getDistanceTo({x, y}) { return U.getDistance(this, {x, y}) }

  // ████████ PUBLIC METHODS ████████
  // ░░░░░░░[Elements]░░░░ Managing DOM Elements ░░░░░░░
  set(params) { gsap.set(this.elem, params) }
  kill() {
    this.constructor.Unregister?.(this);
    this.$.remove();
  }

};