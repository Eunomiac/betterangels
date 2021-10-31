/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌█████████████████████ MIT License █ v0.0.1-prealpha █  ████████████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

// ████████ IMPORTS ████████
import {
  // ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮
  gsap, MotionPathPlugin, // GreenSock Animation Platform
  // ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮
  U
} from "../helpers/bundler.mjs";

export default class XElem {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  // ░░░░░░░[Enumerables]░░░░ Class Subtypes ░░░░░░░
  static get TYPES() { return {basic: "basic"} }
  // ░░░░░░░[Defaults]░░░░ Default Settings for Base XElems ░░░░░░░
  static get DEFAULT_DATA() {
    return {
      PREFIX: "xElem",
      CLASSES: ["x-elem"],
      TYPE: this.TYPES.basic,
      PROPERTIES: {
        position: "absolute",
        xPercent: -50,
        yPercent: -50,
        transformOrigin: "50% 50%"
      },
      CONTAINER: {
        html: "<div></div>",
        id: "x-container",
        parent: $(".vtt.game")[0],
        classes: ["x-container"],
        properties: {
          position: "relative",
          xPercent: 0,
          yPercent: 0,
          transformOrigin: "0% 0%"
        }
      }
    };
  }
  static get CONTAINER() {
    if (!XElem._CONTAINER) {
      XElem._CONTAINER = new XElem(
        $(XElem.DEFAULT_DATA.CONTAINER.html),
        {
          properties: {
            ...XElem.DEFAULT_DATA.PROPERTIES,
            ...XElem.DEFAULT_DATA.CONTAINER.properties
          },
          parent: XElem.DEFAULT_DATA.CONTAINER.parent,
          classes: XElem.DEFAULT_DATA.CONTAINER.classes
        }
      );
      XElem._CONTAINER.$.attr("id", XElem.DEFAULT_DATA.CONTAINER.id);
      XElem._CONTAINER._name = XElem.DEFAULT_DATA.CONTAINER.id;
      XElem._CONTAINER._id = XElem.DEFAULT_DATA.CONTAINER.id;
    }
    return XElem._CONTAINER;
  }
  // ░░░░░░░[Initialization]░░░░ Registration & DOM Initialization ░░░░░░░
  static get REGISTRY() { return (this._REGISTRY = this._REGISTRY ?? {}) }
  static get ALL() { return Object.values(this.REGISTRY) }

  static Register(elem) { return (this.REGISTRY[elem.name] = elem) }
  static Unregister(elem) { delete this.REGISTRY[elem.name] }

  static GetName(xElem) {
    if (xElem.options?.name) {
      if (xElem.options.name in this.REGISTRY) {
        throw new Error(`'${xElem.options.name}' has already been registered as an ${xElem.constructor.name}.`);
      }
      return xElem.options.name;
    }
    const elemNum = U.pInt(U.getLast(this.ALL.filter((regXElem) => regXElem.constructor.name === xElem.constructor.name
      && regXElem._owner === xElem._owner
      && regXElem._type === xElem._type))?.name?.match(/\d+$/)?.pop()) + 1;
    return `${xElem.constructor.DEFAULT_DATA.PREFIX}-${xElem._owner}_${xElem._type}_${elemNum}`;
  }

  // ▮▮▮▮▮▮▮[GSAP INTEGRATION] Ensuring Properties Set Using GSAP ▮▮▮▮▮▮▮
  get(prop) { return gsap.getProperty(this.elem, prop) }
  set(propVals = {}) { gsap.set(this.elem, propVals) }

  // ████████ CONSTRUCTOR ████████
  get options() { return (this._options = this._options ?? {}) }

  constructor($obj, {
    properties = {},
    owner = U.GMID(),
    type = this.constructor.DEFAULT_DATA.TYPE,
    parent,
    classes = [],
    ...options
  } = {}) {
    if ("jquery" in $obj) {
      parent = parent ?? $obj.parents()[0] ?? this.constructor.CONTAINER;
      let parentElem;
      if (parent instanceof XElem) {
        this._parent = parent;
        parentElem = parent.elem;
      } else if ("jquery" in parent) {
        [parentElem] = parent;
      } else if (parent instanceof HTMLElement) {
        parentElem = parent;
      }
      if (!$obj.parents[0]) {
        if (parentElem) {
          $obj.appendTo(parentElem);
        } else {
          throw new Error("XElems must be existing DOM elements, or provide a parent to append to.");
        }
      }
      this._$ = $obj;
      [this._elem] = this.$;
      this._owner = U.getType(owner) === "string" ? owner : owner.id;
      this.type = type;
      this._options = options;
      this._name = this.constructor.GetName(this);
      this._id = this._name;
      this.$.attr("id", this._id);
      this.classes = [
        ...options.noDefaultClasses ? [] : this.constructor.DEFAULT_DATA.CLASSES,
        ...classes
      ];
      this.constructor.Register(this);
      this.set(U.objFilter({
        ...this.constructor.DEFAULT_DATA.PROPERTIES,
        ...properties
      }, (val) => val !== null));
    } else {
      throw new Error(`${this.constructor.name} must be instantiated with a jQuery object.`);
    }
  }

  // ████████ DOM: Basic DOM Management ████████
  get $() { return this._$ }
  get elem() { return this._elem }
  get name() { return this._name }
  get id() { return this._id }
  get sel() { return (this._sel = this._sel ?? `#${this.id}`) }
  get tag() { return this.elem.tagName }
  get owner() { return game.users.get(this._owner) }
  get type() { return this._type }
  set type(v) {
    if (Object.values(this.constructor.TYPES).includes(v)) {
      this._type = v;
    } else {
      throw new Error(`Invalid ${this.constructor.name} Type: ${v}`);
    }
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
  _getRelAngleTo({x, y}) { return U.getAngleDelta(this.rotation + 180, this._getAbsAngleTo({x, y})) } // U.cycleNum( - , -180, 180) }
  _getDistanceTo({x, y}) { return U.getDistance(this, {x, y}) }

  alignOriginTo(targetSpace) {
    return MotionPathPlugin.convertCoordinates(this.parent.elem, targetSpace.elem, this.pos);
  }
  alignLocalPointTo(targetSpace, point) {
    return MotionPathPlugin.convertCoordinates(this.elem, targetSpace.elem, point);
  }

  // ████████ REPARENTING: Reparenting & Converting Coordinates ████████
  get parent() { return this._parent }
  set parent(newParent) {
    if (newParent instanceof XElem) {
      const {x, y} = this.alignOriginTo(newParent);
      this.$.appendTo(newParent.elem);
      this.set({x, y});
    } else {
      throw new Error(`[${this.constructor.name}.parent] No element found for '${newParent}'`);
    }
  }

  // ████████ STYLES: CSS Style Management ████████
  get classes() { return this.elem.classList }
  set classes(v) {
    if (U.getType(v) === "string") { v = v.trim().split(/\s+/) }
    const newClassList = [
      ...this.constructor.DEFAULT_DATA.CLASSES,
      ...v
    ];
    Array.from(this.classes)
      .filter((cls) => !newClassList.includes(cls))
      .forEach(this.classes.remove);
    v.forEach((c) => this.classes.add(c));
  }

  // ████████ CONTENT: Getting & Setting Element Data & Content ████████
  get text() { return this.get("innerText") }
  set text(v) { this.set({innerText: v}) }

  get html() { return this.get("innerHTML") }
  set html(v) { this.set({innerHTML: v}) }
}