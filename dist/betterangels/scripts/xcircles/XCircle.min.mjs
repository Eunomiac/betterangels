/* ▌██░░ betterangels v0.0.1-prealpha (2021) ║ MIT License ║ https://github.com/Eunomiac/betterangels ░░██▐ */// ████████ IMPORTS ████████
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
  XItem, XDie, XSnap,
  // ▮▮▮▮▮▮▮[Mixins]▮▮▮▮▮▮▮
  MIX, HasDOMElem, HasMotionPath, HasSnapPath
} from "../helpers/bundler.mjs";

export default class XCircle extends MIX().with(HasDOMElem, HasSnapPath) {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  // ░░░░░░░[Getters]░░░░ Registry, Enumerables, Constants ░░░░░░░
  static get REGISTRY() { return (this._REGISTRY = this._REGISTRY ?? {}) }
  static get ALL() { return Object.values(this.REGISTRY) }
  static get TYPES() {
    return {
      basic: "basic",
      pink: "pink",
      yellow: "yellow",
      cyan: "cyan",
      purple: "purple"
    };
  }
  static get DEFAULTTYPE() { return this.TYPES.basic }
  static get CLASSES() { return ["x-circle"] }
  static get PREFIX() { return "xCircle" }
  static get SNAPPOINTS() { return (this._SNAPPOINTS = this._SNAPPOINTS ?? new Map()) }

  // ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░
  static NameCircle(circle) {
    if (circle._options.name) {
      circle._name = circle._options.name;
    } else {
      const namePrefix = `${circle._owner}_${circle._type}`;
      const nameTest = new RegExp(`^${namePrefix}_`);
      const circleNum = parseInt(Object.keys(this.REGISTRY)
        .filter((key) => nameTest.test(key)).pop()?.match(/_(\d+)$/)
        ?.pop() ?? 0) + 1;
      circle._name = `${namePrefix}_${circleNum}`;
      circle._id = `${circle.constructor.PREFIX}-${circle.name}`;
    }
  }
  static Register(circle) {
    circle.snap.points.forEach(({x, y}) => {
      x = Math.round(x);
      y = Math.round(y);
      this.SNAPPOINTS.set({x, y}, circle);
    });
    this.REGISTRY[circle.name] = circle;
    return circle;
  }
  static Unregister(circle) {
    delete this.REGISTRY[circle.name];
  }
  static Kill(circle) {
    circle.killAll();
    delete this.REGISTRY[circle.name];
  }
  static Snap({x, y}) {
    const snapPoint = gsap.utils.snap({values: Array.from(this.SNAPPOINTS.keys())}, {x, y});
    const circle = this.SNAPPOINTS.get(snapPoint);
    return {...snapPoint, circle};
  }
  static UpdateCircleWatch(item, pos) {
    const {x, y, circle} = this.Snap(pos);
    if (item.snapCircle !== circle) {
      item.snapCircle?.unwatchItem(item);
      circle.watchItem(item);
    }
    return [circle, {x, y}];
  }
  static GetClosestTo(item) { return this.Snap(item).circle }

  // ████████ CONSTRUCTOR ████████
  constructor(x, y, radius, options = {}) {
    super();
    this._options = options;

    this.type = options.type;
    this._owner = options.owner?.id ?? options.owner ?? U.GMID;

    this.constructor.NameCircle(this);
    this._create(x, y, radius);
    this.constructor.Register(this);
  }

  // ████████ GETTERS & SETTERS ████████
  // ░░░░░░░ Read-Only ░░░░░░░
  get owner() { return game.users.get(this._owner) }
  get name() { return this._name }
  get slots() { return (this._slots = this._slots ?? []) }

  // ░░░░░░░ Writeable ░░░░░░░
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

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░
  _create(x, y, radius) {
    [this._xCircle] = $(`
    <div id="${this.id}" class="${this.defaultClasses.join(" ")}" style="height: ${2 * radius}px; width: ${2 * radius}px;">
      <svg height="100%" width="100%">
        <circle cx="${radius}" cy="${radius}" r="${radius}" stroke="none" />
        <circle id="${this.snap.id}" class="snap-circle" cx="${radius}" cy="${radius}" r="${radius * 0.8}" fill="none" stroke="none" />
      </svg>
    </div>
    `).appendTo(XCircle.CONTAINER);
    this.set({xPercent: -50, yPercent: -50, x, y});

    MotionPathPlugin.convertToPath(`#${this.snap.id}`);
    this._toggleSlowRotate(true);
  }

  // ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░
  _killTweens(types) {
    if (types) {
      [types].flat().forEach((type) => {
        gsap.killTweensOf(this.elem, type);
        if (type === "rotation") {
          delete this._isSlowRotating;
        }
      });
    } else {
      gsap.killTweensOf(this.elem);
      delete this._isSlowRotating;
    }
  }
  _toggleSlowRotate(isRotating) {
    if (Boolean(isRotating) === Boolean(this._isSlowRotating)) { return }
    if (isRotating) {
      this._isSlowRotating = gsap.to(this.elem, {
        rotation: "+=360",
        duration: 100,
        repeat: -1,
        ease: "none",
        callbackScope: this,
        onUpdate() {
          this.slots.forEach((item) => item.straighten());
        }
      });
    } else {
      this._isSlowRotating.kill();
      delete this._isSlowRotating;
    }
  }

  // ░░░░░░░[Items]░░░░ Managing Contained XItems ░░░░░░░
  get pathMap() {
    // Incorporates the weights of all items and returns a Map of [item]: [pathPos] in order of slots
    const pathMap = new Map();
    let totalWeights = 0;
    this.slots.forEach((slotItem) => {
      totalWeights += slotItem.pathWeight;
      pathMap.set(slotItem, totalWeights - 0.5 * slotItem.pathWeight);
    });
    for (const [item, pathWeight] of pathMap.entries()) {
      pathMap.set(item, gsap.utils.normalize(0, totalWeights, pathWeight));
    }
    return pathMap;
  }
  get pathPositions() { return Array.from(this.pathMap.values()) }
  _getAdjacentSlots(pathPos) {
    const {pathPositions: pathVals} = this;
    const upperSlot = pathVals
      .findIndex((v, i, a) => i === (a.length - 1) || v >= pathPos);
    pathVals.reverse();
    const lowerSlot = this.pathMap.size - 1 - pathVals
      .findIndex((v, i, a) => i === (a.length - 1) || v <= pathPos);
    return [lowerSlot, upperSlot];
  }
  get pathItems() { return Array.from(this.pathMap.keys()) }
  _getNearestSlot({x, y}) {
    // Determines closest slot to the provided point, relying on angle.
    if ([x, y].includes(undefined)) { return false }
    const angle = this._getRelAngleTo({x, y});
    const pathPos = gsap.utils.normalize(-180, 180, angle);
    const [lowerSlot, upperSlot] = this._getAdjacentSlots(pathPos);
    if (upperSlot === 0
      || lowerSlot === upperSlot
      || gsap.utils.snap([
        this.pathPositions[lowerSlot],
        this.pathPositions[upperSlot]
      ], pathPos) === this.pathPositions[upperSlot]) { return upperSlot }
    return lowerSlot;
  }
  _getSlotItemPos(item) {
    // Returns the pixel coordinates, angle, pathPos and slot of a slot item
    return {
      ...this._getPosOnPath(this.pathMap.get(item)),
      slot: this.slots.findIndex((slotItem) => slotItem === item)
    };
  }
  _getSlotsBetween(item1, item2, isClockwise = true) {
    // Returns
  }
  _getSlotsWithout(ref, slots = this.slots) { return slots.filter((slot) => slot !== ref) }
  _getSlotsPlus(items, index, slots = this.slots) {
    index = index ?? slots.length;
    return [
      ...slots.slice(0, index),
      ...[items].flat(),
      ...slots.slice(index)
    ];
  }
  _swapItemToSnap(item) {
    const type = XSnap.TYPES[[
      ["die", XDie]
    ].find(([typ, cls]) => item instanceof cls)[0]];
    const snapItem = new XSnap(item, {circle: this, type, alignTo: item});
  }
  _swapSnapToItem(item) {
    const slots = [...this.slots];
    const slot = this.slots.findIndex((slotItem) => slotItem.snapTarget === item);
    slots[slot] = item;
    return slot >= 0 ? slots : false;
  }
  _compareSlots(oSlots, nSlots) {
    oSlots = [...oSlots];
    nSlots = [...nSlots];
    function getNext(slot, slots) {
      const slotIndex = slots.findIndex((s) => slot === s);
      return slots[slotIndex === slots.length - 1
        ? 0
        : slotIndex + 1];
    }
    if (oSlots.length !== nSlots.length) {
      return {isEqual: false, isSameOrder: false};
    }
    if (oSlots.every((oSlot, i) => oSlot === nSlots[i])) {
      return {isEqual: true, isSameOrder: true};
    }
    const testResults = {isEqual: false, isSameOrder: true};
    for (const slot of oSlots) {
      if (getNext(slot, oSlots) !== getNext(slot, nSlots)) {
        testResults.isSameOrder = false;
        break;
      }
    }
    if (testResults.isSameOrder) {
      if (oSlots[0] === nSlots[1]) {
        testResults.cycleSlot = 0;
      } else if (oSlots[1] === nSlots[0]) {
        testResults.cycleSlot = oSlots.length - 1;
      }
    }
    return testResults;
  }

  async _distItems(newSlots, duration = 1) {
    const oldSlots = [...this.slots];

    const slotCompare = this._compareSlots(newSlots, oldSlots);

    if (slotCompare.isEqual) { return }
    if (slotCompare.isSameOrder && "cycleSlot" in slotCompare) {
      newSlots = [
        oldSlots[oldSlots.length - 1],
        ...oldSlots.slice(1, -1),
        oldSlots[0]
      ];
    }

    this._slots = [...newSlots];

    const newPositions = Object.fromEntries(this.slots.map((item) => [item.id, this._getSlotItemPos(item, this.slots)]));

    this.slots.forEach((item) => { item.targetPathPos = newPositions[item.id].pathPos });
  }
  _getSnapFor(item) { return this.slots.find((slotItem) => slotItem.snapTarget === item) }
  async _openSnapPoint(item) {

  }
  async _closeSnapPoint(item) {

  }

  // ████████ PUBLIC METHODS ████████

  // ░░░░░░░[Items]░░░░ Contained Item Management ░░░░░░░
  // ========== Adding / Removing ===========
  async addDice(numDice = 1, type = XDie.TYPES.basic) {
    const newDice = new Array(numDice).fill(null).map(() => new XDie({circle: this, type}));
    return this._distItems(this._getSlotsPlus(newDice));
  }
  async killItem(item) {
    this._distItems(this._getSlotsWithout(item));
    item.kill();
  }
  // ========== Releasing to Drag ===========
  async pluckItem(item) {
    this._distItems(this._swapItemToSnap(item));
  }

  async watchItem(item) {

  }
  async watchItems() {
  }
  unwatchItem(item) {
  }
  async catchItem(item) {
  }

}