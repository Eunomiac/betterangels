/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Oct 27 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

// ████████ IMPORTS ████████
import {
  // ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮
  gsap, Dragger, InertiaPlugin, MotionPathPlugin, // GreenSock Animation Platform
  // ▮▮▮▮▮▮▮[Utility]▮▮▮▮▮▮▮
  U,
  // ▮▮▮▮▮▮▮[XCircles]▮▮▮▮▮▮▮
  XElem,
  XItem, XDie, XSnap,
  // ▮▮▮▮▮▮▮[Mixins]▮▮▮▮▮▮▮
  MIX, BindToXElem, HasMotionPath, HasSnapPath
} from "../helpers/bundler.mjs";

export default class XCircle extends MIX().with(BindToXElem, HasSnapPath) {
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
    this.SNAPPOINTS.forEach((regCircle, point, map) => {
      if (circle === regCircle) { map.delete(point) }
    });
    delete this.REGISTRY[circle.name];
  }
  static Kill(circle) {
    circle.killAll();
    delete this.REGISTRY[circle.name];
  }
  static Snap({x, y}) {
    const snapPoint = gsap.utils.snap({values: Array.from(this.SNAPPOINTS.keys())}, {x, y});
    const circle = this.SNAPPOINTS.get(snapPoint);
    console.log(`SNAPPING: {${x}, ${y}} to {${snapPoint.x}, ${snapPoint.y}} of Circle ${circle.type}`);
    return {...snapPoint, circle};
  }
  static UpdateCircleWatch(item, pos) {
    if (item.snap) {
      return [item.snap.circle, item.snap.point];
    }
    const {x, y, circle} = this.Snap(pos);
    if (item.closestCircle !== circle) {
      item.closestCircle?.unwatchItem(item);
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
    this._owner = options.owner?.id ?? options.owner ?? U.GMID();

    this.constructor.NameCircle(this);
    this._create(x, y, radius);
    this.constructor.Register(this);
  }

  // ████████ GETTERS & SETTERS ████████
  // ░░░░░░░ Read-Only ░░░░░░░
  get owner() { return game.users.get(this._owner) }
  get name() { return this._name }
  get slots() { return (this._slots = this._slots ?? []) }

  // ========== Path Items: Positioning Contained Items Along Motion Path ===========
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
  get pathItems() { return Array.from(this.pathMap.keys()) }

  // ========== Animation: Tickers & Other Animations ===========
  get watchFuncs() { return (this._watchFuncs = this._watchFuncs ?? new Map()) }

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
    const xElem = new XElem(`
    <div id="${this.id}" class="${this.defaultClasses.join(" ")}" style="height: ${2 * radius}px; width: ${2 * radius}px;">
      <svg height="100%" width="100%">
        <circle cx="${radius}" cy="${radius}" r="${radius}" stroke="none" />
      </svg>
    </div>
    `, {properties: {x, y}, parent: XElem.CONTAINER});
    return;
    this.bindXElem(xElem);
    this.path = new XElem(`
      <circle id="${this.snap.id}" class="snap-circle" cx="${radius}" cy="${radius}" r="${radius * 0.8}" fill="none" stroke="none" />
    `, {properties: {x: radius * 0.8, y: radius * 0.8}, parent: this.selector("svg"), isMotionPath: true});

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
    return;
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
  _compareSlots(oSlots, nSlots) {
    // Given two sequences of slot items, returns a report object detailing the
    // results of various comparison tests against the two slot arrays.
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
  _getAdjacentSlots(pathPos) {
    // Given a path position, returns the two nearest slot positions
    const {pathPositions: pathVals} = this;
    const upperSlot = pathVals
      .findIndex((v, i, a) => i === (a.length - 1) || v >= pathPos);
    pathVals.reverse();
    const lowerSlot = this.pathMap.size - 1 - pathVals
      .findIndex((v, i, a) => i === (a.length - 1) || v <= pathPos);
    return [lowerSlot, upperSlot];
  }
  _getAngledPathPos({x, y}) {
    // Determines the path position closest to the provided point, relying on angle.
    if ([x, y].includes(undefined)) { return false }
    const angle = this._getRelAngleTo({x, y});
    return gsap.utils.normalize(-180, 180, angle);
  }
  _getNearestSlot({x, y}) {
    // Determines closest slot to the provided point, relying on angle.
    if ([x, y].includes(undefined)) { return false }
    const angle = this._getRelAngleTo({x, y});
    const pathPos = this._getAngledPathPos({x, y});
    if (pathPos !== false) {
      const [lowerSlot, upperSlot] = this._getAdjacentSlots(pathPos);
      if (upperSlot === 0
        || lowerSlot === upperSlot
        || gsap.utils.snap([
          this.pathPositions[lowerSlot],
          this.pathPositions[upperSlot]
        ], pathPos) === this.pathPositions[upperSlot]) { return upperSlot }
      return lowerSlot;
    }
    return false;
  }
  _getSlotItemPos(item) {
    // Returns the pixel coordinates, angle, pathPos and slot of a slot item
    return {
      ...this._getPosOnPath(this.pathMap.get(item)),
      slot: this.slots.findIndex((slotItem) => slotItem === item)
    };
  }
  _getSlotPathPositions(slots) {
    return [...slots ?? this.slots].map((item) => this._getSlotItemPos(item, slots).pathPos);
  }
  _getSnapItemFor(item) { return this.slots.find((slotItem) => slotItem.snapTarget === item) }
  _getSnapPosFor(item) { return this._getSlotItemPos(this._getSnapItemFor(item)) }
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
    const {slot} = this._getSlotItemPos(item);
    if (~slot) {
      const slots = [...this.slots];
      slots[slot] = new XSnap(item, {circle: this, type, alignTo: item});
      return slots;
    }
    return false;
  }
  _swapSnapToItem(item) {
    const {slot} = this._getSnapPosFor(item);
    if (~slot) {
      const slots = [...this.slots];
      slots[slot] = item;
      return slots;
    }
    return false;
  }

  async _distItems(newSlots, duration = 1) {
    const oldSlots = [...this.slots];

    const slotCompare = this._compareSlots(oldSlots, newSlots);
    if (slotCompare.isEqual) { return Promise.resolve() }
    if (slotCompare.isSameOrder && "cycleSlot" in slotCompare) {
      newSlots = [
        oldSlots[oldSlots.length - 1],
        ...oldSlots.slice(1, -1),
        oldSlots[0]
      ];
    }

    this._slots = [...newSlots];

    const newPositions = this._getSlotPathPositions(this.slots);
    return Promise.allSettled(this.slots
      .map((item, i) => item.setPathPos(newPositions[i])));
  }
  async _moveToSlot(item, newSlot) {
    const {slot} = this._getSlotItemPos(item);
    if (!Number.isInteger(newSlot)) { return Promise.reject() }
    if (slot === newSlot) { return Promise.resolve() }
    return this._distItems(this._getSlotsPlus(item, newSlot, this._getSlotsWithout(item)));
  }
  async _openSnapPoint(item, isCatching = false) {
    if (item.circle) { return Promise.reject() }
    if (this._getSnapItemFor(item)) { return Promise.resolve() }
    const snapSlot = this._getNearestSlot(isCatching ? item.snap.point : item);
    const snapItem = new XSnap(item, {circle: this});
    return this._distItems(this._getSlotsPlus(snapItem, snapSlot, this._getSlotsWithout(snapItem)));
  }
  async _closeSnapPoint(item) {
    const snapItem = this._getSnapItemFor(item);
    if (snapItem) {
      return this._distItems(this._getSlotsWithout(snapItem))
        .then(() => snapItem.kill());
    }
    return Promise.reject();
  }

  // ████████ PUBLIC METHODS ████████

  // ░░░░░░░[Items]░░░░ Contained Item Management ░░░░░░░
  // ========== Adding / Removing ===========
  async addDice(numDice = 1, type = XDie.TYPES.basic) {
    const newDice = [...Array(numDice)].map(() => new XDie({circle: this, type}));
    return this._distItems(this._getSlotsPlus(newDice));
  }
  async killItem(item) {
    this._distItems(this._getSlotsWithout(item));
    item.kill();
  }
  // ========== Releasing to Drag ===========
  async pluckItem(item) {
    return this._distItems(this._swapItemToSnap(item))
      .then(() => this._addWatchFuncFor(item));
  }

  _addWatchFuncFor(item) {
    if (this.watchFuncs.has(item)) { return }
    function watchFunc() {
      const snapItem = this._getSnapItemFor(item);
      if (snapItem) {
        this._moveToSlot(snapItem, this._getNearestSlot(item));
      }
    }
    this.watchFuncs.set(item, watchFunc.bind(this));
    gsap.ticker.add(watchFunc.bind(this));
  }
  _removeWatchFuncFor(item) {
    if (this.watchFuncs.has(item)) {
      gsap.ticker.remove(this.watchFuncs.get(item));
      this.watchFuncs.delete(item);
    }
  }
  async watchItem(item) {
    return this._openSnapPoint(item)
      .then(() => this._addWatchFuncFor(item))
      .catch(() => console.warn(`Could not open snap point for ${item.name}`));
  }
  async unwatchItem(item) {
    this._removeWatchFuncFor(item);
    return this._closeSnapPoint(item);
  }
  async catchItem(item) {
    // Use endX and endY to get exact position item will land as absolute angle
    // Also get angle to where the item's current snap slot is
    // Rotate during the tween so that the two line up
    if (!item.isThrowing) { return Promise.reject() }
    const {tween, endX, endY} = item.dragger;

    this._toggleSlowRotate(false);
    this._removeWatchFuncFor(item);
    return this._openSnapPoint(item, true)
      .then(() => {
        const {angle: angleToSlot} = this._getSlotItemPos(this._getSnapItemFor(item));
        const angleToEndPoint = this._getAbsAngleTo({x: endX, y: endY});
        const angleDelta = U.getAngleDelta(angleToSlot, angleToEndPoint);
        const duration = tween.duration() - tween.time();
        const rotation = `${angleDelta > 0 ? "+" : "-"}=${Math.abs(parseInt(angleDelta))}`;
        gsap.to(this.elem, {
          rotation,
          duration,
          ease: "power4.out",
          callbackScope: this,
          onUpdate() {
            this.items.forEach((_item) => _item.straighten());
          },
          onComplete() {
            item.circle = this;
            item.straighten();
            this._distItems(this._swapSnapToItem(item));
            this._toggleSlowRotate(true);
          }
        });
      });
  }

}