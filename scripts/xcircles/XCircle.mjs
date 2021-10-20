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
  XItem, XDie, XSnap,
  // #endregion ▮▮▮▮[XCircles]▮▮▮▮
  // #region ▮▮▮▮▮▮▮[Mixins]▮▮▮▮▮▮▮ ~
  MIX, HasDOMElem, HasMotionPath, HasSnapPath
  // #endregion ▮▮▮▮[Mixins]▮▮▮▮
} from "../helpers/bundler.mjs";
// #endregion ▄▄▄▄▄ IMPORTS ▄▄▄▄▄

export default class XCircle extends MIX().with(HasDOMElem, HasSnapPath) {
  // #region ████████ STATIC: Static Getters, Setters, Methods ████████ ~
  // #region ░░░░░░░[Getters]░░░░ Registry, Enumerables, Constants ░░░░░░░ ~
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
  // #endregion ░░░░[Getters]░░░░

  // #region ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░ ~
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
  // #endregion ░░░░[Methods]░░░░
  // #endregion ▄▄▄▄▄ STATIC ▄▄▄▄▄

  // #region ████████ CONSTRUCTOR ████████ ~
  constructor(x, y, radius, options = {}) {
    super();
    this._options = options;

    this.type = options.type;
    this._owner = options.owner?.id ?? options.owner ?? U.GMID;

    this.constructor.NameCircle(this);
    this._create(x, y, radius);
    this.constructor.Register(this);
  }
  // #endregion ▄▄▄▄▄ CONSTRUCTOR ▄▄▄▄▄

  // #region ████████ GETTERS & SETTERS ████████ ~
  // #region ░░░░░░░ Read-Only ░░░░░░░ ~
  get owner() { return game.users.get(this._owner) }
  get name() { return this._name }
  get slots() { return (this._slots = this._slots ?? []) }
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
  // #endregion ░░░░[Writeable]░░░░
  // #endregion ▄▄▄▄▄ GETTERS & SETTERS ▄▄▄▄▄

  // #region ████████ PRIVATE METHODS ████████ ~
  // #region ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░ ~
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
    /*DEVCODE*/console.log(this);/*!DEVCODE*/
    MotionPathPlugin.convertToPath(`#${this.snap.id}`);
    this._toggleSlowRotate(true);
  }
  // #endregion ░░░░[Initializing]░░░░

  //~ # region ░░░░░░░[Elements]░░░░ Managing Core Circle Elements ░░░░░░░ ~// # endregion ░░░░[Elements]░░░░

  // #region ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░ ~
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
  // #endregion ░░░░[Animation]░░░░

  // #region ░░░░░░░[Items]░░░░ Managing Contained XItems ░░░░░░░ ~
  get pathMap() { //~ IN ALL CASES, PATH STARTS AT 90deg, 0deg IS AT 12'O'CLOCK
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

  //~ Finds the slotRef, then pushes it through the other items to its new position using above functions. If no slotNum given, will try to use the slotRef to figure out the slotNum...?
  //~ Have some kind of throttling or queue here for "pushleft/pushright", but will be easier since only one other item should have to move
  /*~ For basic path positioning:  Give each item a weight -- dice are 1, snap points are 2, etc
          Should have a "maximum absolute path share per item" before triggering the weighting, so circles with only a few items and lots of room don't do it
    Then just map the weighted positions of each item to the 0 - 1 pathPos
    Can just call this function with no args after closing the snap point to redistribute all the items with the proper positioning
    Can probably make it a super safe function, too, since all it will ever do is look at the items and adjust their weighted positions
    Weights can even change dynamically based on, say, distance of dragged item to the snap point

    DB TEST: On debug layer, generate a item image at the exact moment and position the snap point is determined ~*/
  async _distItems(newSlots, duration = 1) {
    const oldSlots = [...this.slots];

    const slotCompare = this._compareSlots(newSlots, oldSlots);
    /*DEVCODE*/console.log(slotCompare);/*!DEVCODE*/
    if (slotCompare.isEqual) { return }
    if (slotCompare.isSameOrder && "cycleSlot" in slotCompare) {
      newSlots = [
        oldSlots[oldSlots.length - 1],
        ...oldSlots.slice(1, -1),
        oldSlots[0]
      ];
    }
    /*DEVCODE*/console.log(newSlots);/*!DEVCODE*/

    this._slots = [...newSlots];

    const newPositions = Object.fromEntries(this.slots.map((item) => [item.id, this._getSlotItemPos(item, this.slots)]));

    this.slots.forEach((item) => { item.targetPathPos = newPositions[item.id].pathPos });
  }
  _getSnapFor(item) { return this.slots.find((slotItem) => slotItem.snapTarget === item) }
  async _openSnapPoint(item) {
    //~ if (!this.slots.includes(item) && !this._getSnapFor(item)) {
    //~  return this._distItems(this._getSlotsPlus(new XSnap(item), this._getSlotWithItem(item)));
    //~ }
    //~ return Promise.reject();
  }
  async _closeSnapPoint(item) {
    //~ const snap = this._getSnap(item);
    //~ if (snap) {
    //~   const itemDist = this._distItems(this._getSlotsWithout(snap));
    //~   snap.kill();
    //~   return itemDist;
    //~ }
    //~ return Promise.reject();
  }
  // #endregion ░░░░[Items]░░░░
  // #endregion ▄▄▄▄▄ PRIVATE METHODS ▄▄▄▄▄

  // #region ████████ PUBLIC METHODS ████████ ~
  //~ # region ░░░░░░░[Getters]░░░░ Data Retrieval ░░░░░░░ ~// # endregion ░░░░[Getters]░░░░
  //~ # region ░░░░░░░[Elements]░░░░ Managing Core DOM Elements ░░░░░░░ ~// #endregion ░░░░[Elements]░░░░
  // #region ░░░░░░░[Items]░░░░ Contained Item Management ░░░░░░░ ~
  // #region ========== Adding / Removing =========== ~
  async addDice(numDice = 1, type = XDie.TYPES.basic) {
    const newDice = new Array(numDice).fill(null).map(() => new XDie({circle: this, type}));
    return this._distItems(this._getSlotsPlus(newDice));
  }
  async killItem(item) {
    this._distItems(this._getSlotsWithout(item));
    item.kill();
  }
  // #endregion _______ Adding / Removing _______
  // #region ========== Releasing to Drag =========== ~
  async pluckItem(item) {
    this._distItems(this._swapItemToSnap(item));
  }
  // #endregion _______ Releasing to Drag _______

  async watchItem(item) {
    //~ console.log(`Readying ${item.name}`);
    //~ if (this.readiedItems.filter((rItem) => item.name === rItem.name).length) { return }
    //~ this.readiedItems.push(item);
    //~ console.log("... Readied, Starting Watch");
    //~ this.watchItems();
  }
  async watchItems() { /*~
    console.log("Watching ...");
    if (this._isWatching) { return }
    this._isWatching = this.readiedItems.length > 0;
    const circle = this;
    let start, prevTime;
    async function step(timestamp) {
      if (circle._isWatching && circle.readiedItems.length > 0) {
        start = start ?? (timestamp - 1000);
        const elapsed = timestamp - start;
        if (prevTime !== timestamp && Math.floor(elapsed / 200)) {
          let newSlots = [...circle.slots],
              isChangingSlots = false;
          circle.readiedItems.forEach((item) => {
            const snapPointName = `SNAP-${item.name}`;
            const newSlot = circle._getSlotWithItem(item);
            const oldSlot = newSlots.findIndex((slot) => slot === snapPointName);
            if (newSlot !== oldSlot) {
              isChangingSlots = true;
              newSlots = circle._getSlotsPlus(snapPointName, newSlot, circle._getSlotsWithout(snapPointName, newSlots));
            }
          });
          if (isChangingSlots) {
            circle._distItems(newSlots, 0.25);
          }
        }
        prevTime = timestamp;
        window.requestAnimationFrame(step);
      } else {
        console.log("Nothing to watch.");
        circle._isWatching = false;
      }
    }
    console.log(`... ${this.readiedItems.length} Items.`);
    window.requestAnimationFrame(step); ~*/
  }
  unwatchItem(item) { /*~
    if (item instanceof XItem) {
      this._readiedItems = this.readiedItems.filter((rItem) => rItem.name !== item.name);
      this._closeSnapPoint(item);
    } ~*/
  }
  async catchItem(item) { /*~
    if (item.isThrowing) {
      this._toggleSlowRotate(false);
      // Use endX and endY to get exact position item will land as absolute angle
      // Also get angle to where the item's current snap slot is
      // Rotate during the tween so that the two line up
      const {tween, endX, endY} = item.dragger;
      this.ping({x: endX, y: endY});
      const angleToItem = this._getAbsAngleTo({x: endX, y: endY});
      const snapPointName = `SNAP-${item.name}`;
      const snapSlot = this.slots.findIndex((slot) => slot === snapPointName);
      const {x, y} = this._getItemPos(snapPointName, this.slots);
      const angleToSnap = this._getAbsAngleTo({x, y});
      const angleDelta = U.getAngleDelta(angleToSnap, angleToItem);
      console.log({
        circle: this,
        item,
        itemPos: {x: endX, y: endY, angle: parseInt(angleToItem)},
        snapPos: {x, y, angle: parseInt(angleToSnap)},
        circleAngle: this.rotation,
        angleDelta
      });
      //~ const catchSlot = this._getNearestSlot({x: endX, y: endY});
      //~ const catchSlotAngle = this._getAbsAngleTo({x, y});
      //~ this._distItems(this._getSlotsPlus(snapPointName, catchSlot, this._getSlotsWithout(snapPointName)), 0.25);
      //~ const duration = tween.duration() - tween.time();
      //~ const rotation = `${angleDelta > 0 ? "+" : "-"}=${Math.abs(parseInt(angleDelta))}`;
      console.log(rotation);
      gsap.to(this.elem, {
        rotation,
        duration,
        ease: "power4.out",
        callbackScope: this,
        onUpdate() {
          this.items.forEach((_item) => _item.straighten());
        },
        async onComplete() {
          item.circle = this;
          item.straighten();
          this._toggleSlowRotate(true);
          await this._distItems(item);
          this.unwatchItem(item);
        }
      });
    }
    //~ .tween : Tween
    //~ [read-only] The Tween instance that gets created as soon as the mouse (or touch) is released
    //~ (when inertia is true). This allows you to check its duration, .pause() or .resume() it,
    //~ change its timeScale, or whatever you want.
    //~   Details - The tween instance that gets created as soon as the mouse (or touch) is released (when
    //~ inertia is true) - this allows you to check its duration, pause() it, resume() it, change
    //~ its timeScale, or whatever you want. Keep in mind that a new tween is created each time
    //~ the element is “thrown”. You can easily get it when the user releases the mouse (or touch)
    //~ by referencing this.tween inside the onDragEnd callback.

    //~ .endX : Number
    //~ [read-only] The ending x (horizontal) position of the Draggable instance which is calculated
    //~ as soon as the mouse/touch is released after a drag, meaning you can use it to predict
    //~ precisely where it'll land after an inertia flick.
    //~   Details - The ending x (horizontal) position of the Draggable instance. endX gets populated
    //~ immediately when the mouse (or touch) is released after dragging, even before tweening has
    //~ completed. This makes it easy to predict exactly where the element will land (useful for
    //~ inertia: true Draggables where momentum gets applied). For a Draggable of type: "x,y", endX
    //~ would pertain to the x transform translation, as in the CSS transform: translateX(...). For
    //~ type: "top,left", the Draggable’s x would refer to the CSS left value that’s applied. This
    //~ is not the global coordinate - it is the inline CSS-related value applied to the element.

    //~ maxDuration : Number
    //~ The maximum duration (in seconds) that the kinetic-based inertia tween
    //~ can last. InertiaPlugin will automatically analyze the velocity and bounds and determine an
    //~ appropriate duration (faster movements would typically result in longer tweens to decelerate),
    //~ but you can cap the duration by defining a maxDuration. The default is 10 seconds. This has
    //~ nothing to do with the maximum amount of time that the user can drag the object - it’s only the
    //~ inertia tween that results after they release the mouse/touch. (requires InertiaPlugin and
    //~ setting inertia: true, otherwise maxDuration will simply be ignored.)

    //~ minDuration : Number
    //~ The minimum duration (in seconds) that the kinetic-based inertia tween
    //~ should last. InertiaPlugin will automatically analyze the velocity and bounds and determine an
    //~ appropriate duration (faster movements would typically result in longer tweens to decelerate),
    //~ but you can force the tween to take at least a certain amount of time by defining a minDuration.
    //~ The default is 0.2 seconds. This has nothing to do with the minimum amount of time that the user
    //~ can drag the object - it’s only the inertia tween that results after they release the mouse/touch.
    //~ (requires InertiaPlugin and setting inertia: true, otherwise minDuration will simply be ignored.)

    //~ overshootTolerance : Number
    //~ Affects how much overshooting is allowed before smoothly returning
    //~ to the resting position at the end of the tween. This can happen when the initial velocity from
    //~ the flick would normally cause it to exceed the bounds/min/max. The larger the overshootTolerance
    //~ the more leeway the tween has to temporarily shoot past the max/min if necessary. The default is
    //~ 1. If you don’t want to allow any overshooting, you can set it to 0. ~*/
  }
  // #endregion ░░░░[Dice]░░░░
  // #endregion ▄▄▄▄▄ PUBLIC METHODS ▄▄▄▄▄

  /*DEVCODE*/
  // #region ████████ TEST METHODS: For Debugging & Development ████████ ~
  // #region ░░░░░░░[INITIALIZATION]░░░░ DB Container, Hiding & Showing Debug Data ░░░░░░░ ~
  static get DBCONTAINER() {
    return (this._DBCONTAINER = this._DBCONTAINER
      ?? $("#debugContainerOverlay")[0]
      ?? $("<div id=\"debugContainerOverlay\" class=\"db\" />").appendTo(".vtt.game")[0]);
  }
  dbShow() {
    this.showAngles();
    this.dbUpdate();
  }
  dbHide() {
    this.hideAngles();
    this._isDBActive = false;
    $(`#${this.id} .db-display`).remove();
  }
  // #endregion ░░░░[INITIALIZATION]░░░░
  // #region ░░░░░░░ PING ░░░░░░░ ~
  static PING({x, y}, {context, radius = 20, color = "yellow"} = {}) {
    const [pingElem] = $(`<svg class="db" height="100%" width="100%">
      <circle cx="${radius}" cy="${radius}" r="${radius}" fill="${color}" stroke="none" />
    </svg>`)
      .appendTo(XCircle.DBCONTAINER)
      .children()
      .last();
    if (context) {
      ({x, y} = MotionPathPlugin.convertCoordinates(context, XCircle.DBCONTAINER, {x, y}));
    }
    gsap.set(pingElem, {xPercent: -50, yPercent: -50, transformOrigin: "50% 50%", x, y});
    gsap.to(pingElem, {
      opacity: 0.75,
      scale: 1,
      startAt: {
        opacity: 0.25,
        scale: 5
      },
      duration: 1,
      ease: "bounce",
      onComplete() {
        gsap.to(pingElem, {
          opacity: 1,
          scale: 0.25,
          duration: 10,
          delay: 5,
          ease: "sine"
        });
      }
    });
  }
  get ping() { return this.constructor.PING }
  // #endregion ░░░░[PING]░░░░
  // #region ▮▮▮▮▮▮▮[UPDATE] Update Functions on Animation Frame ▮▮▮▮▮▮▮ ~
  dbUpdate() {
    if (this._isDBActive) { return }
    this._dbDiceArms = this._dbDiceArms ?? {};
    if (!this._dbDiceArmFrame) {
      this._dbDiceArmFrame = $("").appendTo(XCircle.CONTAINER);
    }
    const dbTickerFunc = (time, deltaTime) => {
      this._isDBActive = this.isDBActive ?? true;
      this._testData = this._testData ?? {};
      if (this._isDBActive) {
        // this.readiedItems.forEach((item) => {
        //   if (!this._dbDiceArms[item.name]) {
        //     $(`<svg id="${item.name}-FRAME" class="db diceArmFrame" height="100%" width="100%">
        //     <line id="${item.name}-ARM" class="db diceArm" fill="none" stroke="blue" stroke-width="2" x1="${this.x}" y1="${this.y}" x2="${item.x}" y2="${item.y}"></line>
        //     </svg>`).appendTo(XCircle.DBCONTAINER);
        //     [this._dbDiceArms[item.name]] = $(`#${item.name}-ARM`);
        //   } else {
        //     this._dbDiceArms[item.name].setAttribute("x2", item.x);
        //     this._dbDiceArms[item.name].setAttribute("y2", item.y);
        //   }
        // });
      } else {
        delete this._isDBActive;
        gsap.ticker.remove(dbTickerFunc);
      }
    };
    gsap.ticker.add(dbTickerFunc);
  }
  // #endregion ▮▮▮▮[UPDATE]▮▮▮▮
  // #region ░░░░░░░[ANGLE DISPLAY]░░░░ Display Angle & Path Position on Circle ░░░░░░░ ~
  get angleGuide() { return (this._angleGuide = this._angleGuide ?? {}) }
  showAngles(numGuides = 4, isShowingAll = false) {
    [this._dbAngleContainer] = $(`
    <svg height="100%" width="100%">
      <circle id="db-${this.id}" class="snap-circle" cx="${this.radius}" cy="${this.radius}" r="${this.radius * 1.25}" fill="none" stroke="none" />
    </svg>
    `).appendTo(XCircle.DBCONTAINER);
    gsap.set(this._dbAngleContainer, {xPercent: -50, yPercent: -50, x: this.x, y: this.y});
    MotionPathPlugin.convertToPath(`#db-${this.id}`);
    this._dbAnglePath = MotionPathPlugin.getRawPath(`#db-${this.id}`);
    MotionPathPlugin.cacheRawPathMeasurements(this._dbAnglePath);
    const makeMarker = (ang, isVerbose = true) => {
      // const pathPos = gsap.utils.normalize(0, 360, ang);
      const pathPos = Math.round(100 * gsap.utils.normalize(-180, 180, ang)) / 100;
      const {x, y, angle: pathAngle} = MotionPathPlugin.getPositionOnPath(this._dbAnglePath, pathPos, true);
      [this.angleGuide[ang]] = $(
        isVerbose
          ? `<div class="db angle-marker">${parseInt(pathAngle)}<br>${pathPos}</div>`
          : `<div class="db angle-marker small-marker">${parseInt(pathAngle)}</div>`
      ).appendTo(this.elem);
      gsap.set(this.angleGuide[ang], {x, y, xPercent: -50, yPercent: -50, rotation: -1 * this.rotation});
    };
    this.hideAngles();
    if (isShowingAll) {
      new Array(numGuides).fill(null)
        .map((n, i) => gsap.utils.mapRange(0, numGuides, -180, 180, i))
        .forEach((angle) => makeMarker(angle, true));
    } else {
      makeMarker(0, false);
    }
  }
  hideAngles() { $(`#${this.id} .angle-marker`).remove() }
  // #endregion ░░░░[ANGLE DISPLAY]░░░░
  // #region ░░░░░░░[CONSOLE GETTERS]░░░░ Data Retrieval via Console Command ░░░░░░░ ~
  getPathReport() {
    const pathData = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((pathPos) => {
      const {x, y, angle} = MotionPathPlugin.getPositionOnPath(this.snap.path, pathPos, true);
      const convCoords = MotionPathPlugin.convertCoordinates(this.elem, XCircle.CONTAINER, {x, y});
      return {
        pos: {x: parseInt(x), y: parseInt(y)},
        convPos: {x: parseInt(convCoords.x), y: parseInt(convCoords.y)},
        angle: parseInt(angle),
        pathPos
      };
    });
    console.log(pathData);
  }
  // #endregion ░░░░[CONSOLE GETTERS]░░░░
  // #endregion ▄▄▄▄▄ TEST METHODS ▄▄▄▄▄
  /*!DEVCODE*/
}