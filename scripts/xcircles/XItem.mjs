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
  // #endregion ▮▮▮▮[XCircles]▮▮▮▮
  // #region ▮▮▮▮▮▮▮[Mixins]▮▮▮▮▮▮▮ ~
  MIX, HasDOMElem, IsDraggable, SnapsToCircle
  // #endregion ▮▮▮▮[Mixins]▮▮▮▮
} from "../helpers/bundler.mjs";
// #endregion ▄▄▄▄▄ IMPORTS ▄▄▄▄▄

class XItem extends MIX().with(HasDOMElem) {
  // #region ████████ STATIC: Static Getters, Setters, Methods ████████ ~
  // #region ░░░░░░░[Getters]░░░░ Registry, Enumerables, Constants ░░░░░░░ ~
  static get REGISTRY() { return (this._REGISTRY = this._REGISTRY ?? {}) }
  static get ALL() { return Object.values(this.REGISTRY) }
  static get TYPES() { return { } }
  static get CLASSES() { return ["x-item"] }
  static get PREFIX() { return "xItem" }
  // #endregion ░░░░[Getters]░░░░
  // #region ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░ ~
  // #region ========== Registration: Item Naming & Registration =========== ~
  static NameItem(item) {
    if (item._options.name) {
      item._name = item._options.name;
    } else {
      const namePrefix = `${item._owner}_${item._type}`;
      const nameTest = new RegExp(`^${namePrefix}_`);
      const itemNum = parseInt(Object.keys(this.REGISTRY)
        .filter((key) => nameTest.test(key)).pop()?.match(/_(\d+)$/)
        ?.pop() ?? 0) + 1;
      item._name = `${namePrefix}_${itemNum}`;
      item._id = `${item.constructor.PREFIX}-${item.name}`;
    }
  }
  static Register(item) {
    this.REGISTRY[item.name] = item;
    this.IsTicking = true;
    return item;
  }
  static Unregister(item) {
    delete this.REGISTRY[item.name];
    if (this.ALL.length === 0) {
      this.IsTicking = false;
    }
  }
  // #endregion _______ Registration _______
  // #endregion ░░░░[Methods]░░░░
  // #endregion ▄▄▄▄▄ STATIC ▄▄▄▄▄

  // #region ████████ CONSTRUCTOR ████████ ~
  constructor(options = {}) {
    super();
    this._options = options;

    this.type = options.type;
    this._owner = options.owner?.id ?? options.owner ?? options.circle?.owner?.id ?? U.GMID();

    this.constructor.NameItem(this);
    this._create(options.circle);
    this.constructor.Register(this);
  }
  // #endregion ▄▄▄▄▄ CONSTRUCTOR ▄▄▄▄▄

  // #region ████████ GETTERS & SETTERS ████████ ~
  // #region ░░░░░░░ Read-Only ░░░░░░░ ~
  get owner() { return game.users.get(this._owner) }
  get name() { return this._name }

  get slot() {
    const {slot} = this.circle?._getSlotItemPos(this) ?? {};
    return slot;
  }
  get slotAbsAngle() {
    const {angle} = this.circle?._getSlotItemPos(this) ?? {};
    return angle;
  }
  get watchFuncName() {
    return `watchItem-${this.name}`;
  }
  // #endregion ░░░░[Read-Only]░░░░

  // #region ░░░░░░░ Writeable ░░░░░░░ ~
  get type() { return this._type }
  set type(v) {
    const checkedType = this.constructor.TYPES[v] ?? v ?? this.constructor.DEFAULTTYPE;
    if (Object.values(this.constructor.TYPES).includes(checkedType)) {
      this._type = checkedType;
      this.classes = [];
    } else {
      throw new Error(`Invalid ${this.constructor.name} Type: ${v}`);
    }
  }

  get circle() { return this.parent instanceof XCircle ? this.parent : undefined }
  set circle(v) {
    if (v instanceof XCircle) {
      this.parent = v;
    } else {
      throw new Error(`[${this.constructor.name}.parent] '${v}' is not an XCircle`);
    }
  }

  get isMoving() { return this._isMoving }
  set isMoving(v) { this._isMoving = Boolean(v) }

  // #endregion ░░░░[Writeable]░░░░
  // #endregion ▄▄▄▄▄ GETTERS & SETTERS ▄▄▄▄▄

  // #region ████████ PRIVATE METHODS ████████ ~
  // #region ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░ ~
  _create(startCircle) {
    [this._elem] = $(`<div id="${this.id}" class="${this.defaultClasses.join(" ")}" />`);
    this[startCircle ? "circle" : "parent"] = startCircle ?? XCircle.CONTAINER;
    this.set({xPercent: -50, yPercent: -50, rotation: 0, ...this._startPos?.x ? this._startPos : {}});
  }
  // #endregion ░░░░[Initializing]░░░░
  //~ # region ░░░░░░░[Elements]░░░░ Managing Item Element ░░░░░░░ ~// # endregion ░░░░[Elements]░░░░
  // #region ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░ ~
  straighten() { this.set({rotation: -1 * (this.parent?.rotation ?? 0)}) }
  // #endregion ░░░░[Animation]░░░░
  // #endregion ▄▄▄▄▄ PRIVATE METHODS ▄▄▄▄▄

  //~ # region ████████ PUBLIC METHODS ████████ ~// # endregion ▄▄▄▄▄ PUBLIC METHODS ▄▄▄▄▄
  //~ # region ░░░░░░░[Elements]░░░░ Managing Core DOM Elements ░░░░░░░ ~// #endregion ░░░░[Elements]░░░░
}

class XDie extends MIX(XItem).with(IsDraggable, SnapsToCircle) {
  // #region ████████ STATIC: Static Getters, Setters, Methods ████████ ~
  // #region ░░░░░░░[Getters]░░░░ Enumerables, Constants ░░░░░░░ ~
  static get TYPES() { return {basic: "basic"} }
  static get DEFAULTTYPE() { return this.TYPES.basic }
  static get CLASSES() { return [...super.CLASSES, "x-die"] }
  static get PREFIX() { return "xDie" }
  // #endregion ░░░░[Getters]░░░░
  //~ # region ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░ ~// # endregion ░░░░[Methods]░░░░
  // #endregion ▄▄▄▄▄ STATIC ▄▄▄▄▄

  /*DEVCODE*/
  // #region ████████ CONSTRUCTOR ████████ ~
  constructor(options = {}) {
    super(options);
    setTimeout(() => (this.elem.innerText = this.slot), 500);
  }
  // #endregion ▄▄▄▄▄ CONSTRUCTOR ▄▄▄▄▄
  /*!DEVCODE*/

  //~ # region ████████ GETTERS & SETTERS ████████ ~// # endregion ▄▄▄▄▄ GETTERS & SETTERS ▄▄▄▄▄
  //~ # region ░░░░░░░ Read-Only ░░░░░░░ ~// # endregion ░░░░[Read-Only]░░░░
  //~ # region ░░░░░░░ Writeable ░░░░░░░ ~// # endregion ░░░░[Writeable]░░░░
  //~ # region ████████ PRIVATE METHODS ████████ ~// # endregion ▄▄▄▄▄ PRIVATE METHODS ▄▄▄▄▄
  //~ # region ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░ ~// # endregion ░░░░[Initializing]░░░░
  //~ # region ░░░░░░░[Elements]░░░░ Managing Item Element ░░░░░░░ ~// # endregion ░░░░[Elements]░░░░
  //~ # region ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░ ~// # endregion ░░░░[Animation]░░░░

  //~ # region ████████ PUBLIC METHODS ████████ ~// # endregion ▄▄▄▄▄ PUBLIC METHODS ▄▄▄▄▄
}

class XSnap extends MIX(XItem).with(SnapsToCircle) {
  // #region ████████ STATIC: Static Getters, Setters, Methods ████████ ~
  // #region ░░░░░░░[Getters]░░░░ Enumerables, Constants ░░░░░░░ ~
  static get TYPES() { return {die: "die"} }
  static get DEFAULTTYPE() { return this.TYPES.die }
  static get CLASSES() { return [...super.CLASSES, "x-snap"] }
  static get PREFIX() { return "xSnap" }
  // #endregion ░░░░[Getters]░░░░
  //~ # region ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░ ~// # endregion ░░░░[Methods]░░░░
  // #endregion ▄▄▄▄▄ STATIC ▄▄▄▄▄

  // #region ████████ CONSTRUCTOR ████████ ~
  constructor(snapTarget, options = {}) {
    options.pathWeight = options.pathWeight ?? 2;
    options.name = `S:${snapTarget.name}`;
    super(options);
    this._snapTarget = snapTarget;
    this._startPos = options.alignTo
      ? {x: options.alignTo.x, y: options.alignTo.y}
      : {x: options.x, y: options.y};
  }
  // #endregion ▄▄▄▄▄ CONSTRUCTOR ▄▄▄▄▄

  // #region ████████ GETTERS & SETTERS ████████ ~
  //~ # region ░░░░░░░ Read-Only ░░░░░░░ ~// # endregion ░░░░[Read-Only]░░░░
  // #region ░░░░░░░ Writeable ░░░░░░░ ~
  get snapTarget() { return this._snapTarget }
  set snapTarget(v) { this._snapTarget = v }
  // #endregion ░░░░[Writeable]░░░░
  // #endregion ▄▄▄▄▄ GETTERS & SETTERS ▄▄▄▄▄

  //~ # region ████████ PRIVATE METHODS ████████ ~// # endregion ▄▄▄▄▄ PRIVATE METHODS ▄▄▄▄▄
  //~ # region ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░ ~// # endregion ░░░░[Initializing]░░░░
  //~ # region ░░░░░░░[Elements]░░░░ Managing Item Element ░░░░░░░ ~// # endregion ░░░░[Elements]░░░░
  //~ # region ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░ ~// # endregion ░░░░[Animation]░░░░

  //~ # region ████████ PUBLIC METHODS ████████ ~// # endregion ▄▄▄▄▄ PUBLIC METHODS ▄▄▄▄▄
  //~ # region ░░░░░░░ Animation ░░░░░░░ ~// # endregion ░░░░ Animation ░░░░
}

// #region ████████ EXPORTS ████████ ~
export {XItem, XDie, XSnap};
// #endregion ▄▄▄▄▄ EXPORTS ▄▄▄▄▄