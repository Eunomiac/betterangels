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
  XItem, XDie, XSnap,
  // #endregion ▮▮▮▮[XCircles]▮▮▮▮
  // #region ▮▮▮▮▮▮▮[Mixins]▮▮▮▮▮▮▮ ~
  MIX, HasSnapPath
  // #endregion ▮▮▮▮[Mixins]▮▮▮▮
} from "../helpers/bundler.mjs";
// #endregion ▄▄▄▄▄ IMPORTS ▄▄▄▄▄

export default class XCircle extends MIX(XElem).with(HasSnapPath) {
  // #region ████████ STATIC: Static Getters, Setters, Methods ████████ ~
  // #region ░░░░░░░[Enumerables]░░░░ Class Subtypes ░░░░░░░ ~
  static get TYPES() {
    return {
      ...super.TYPES,
      pink: "pink",
      yellow: "yellow",
      cyan: "cyan",
      purple: "purple"
    };
  }
  // #endregion ░░░░[Enumerables]░░░░
  // #region ░░░░░░░[Defaults]░░░░ Overrides of XElem Defaults ░░░░░░░ ~
  static get DEFAULT_DATA() {
    return {
      ...super.DEFAULT_DATA,
      CLASSES: [...super.DEFAULT_DATA.CLASSES, "x-circle"],
      PREFIX: "xCircle"
    };
  }
  // #endregion ░░░░[Defaults]░░░░
  // #region ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░ ~
  static Snap({x, y}) {
    const snapPoint = gsap.utils.snap({values: Array.from(this.SNAPPOINTS.keys())}, {x, y});
    const circle = this.SNAPPOINTS.get(snapPoint);
    return {...snapPoint, circle};
  }
  static UpdateCircleWatch(item) {
    if (item.snap) { return item.snap }
    const {x, y, circle} = this.Snap(item.pos);
    if (item.closestCircle?.name !== circle.name) {
      if (item.closestCircle) {
        item.closestCircle.unwatchItem(item).then(() => circle.watchItem(item));
      } else {
        circle.watchItem(item);
      }
    }
    return {x, y, circle};
  }
  static GetClosestTo(item) { return this.Snap(item).circle }
  // #endregion ░░░░[Methods]░░░░
  // #endregion ▄▄▄▄▄ STATIC ▄▄▄▄▄

  // #region ████████ CONSTRUCTOR ████████ ~
  constructor(x, y, radius, options = {}) {
    const circle$ = $(`
    <div style="height: ${2 * radius}px; width: ${2 * radius}px;">
      <svg height="100%" width="100%">
        <circle cx="${radius}" cy="${radius}" r="${radius}" stroke="none"></circle>
        <circle class="motion-path" cx="${radius}" cy="${radius}" r="${radius * 0.8}" fill="none" stroke="none"></circle>
      </svg>
    </div>`);
    super(circle$, {
      properties: {x, y},
      pathProperties: {
        x: radius * 0.8,
        y: radius * 0.8
      },
      classes: [`x-circle-${options.type ?? XCircle.DEFAULT_DATA.TYPE}`],
      ...options
    });
    /*DEVCODE*/console.log(this);/*!DEVCODE*/
    this._toggleSlowRotate(true);
  }
  // #endregion ▄▄▄▄▄ CONSTRUCTOR ▄▄▄▄▄

  // #region ████████ GETTERS & SETTERS ████████ ~
  get slots() { return (this._slots = this._slots ?? []) }

  // #region ========== Path Items: Positioning Contained Items Along Motion Path =========== ~
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
  get pathItems() { return Array.from(this.pathMap.keys()) }
  // #endregion _______ Path Items _______

  // #region ========== Animation: Tickers & Other Animations =========== ~
  get watchFuncs() { return (this._watchFuncs = this._watchFuncs ?? new Map()) }
  // #endregion _______ Animation _______
  // #endregion ░░░░[Read-Only]░░░░
  // #endregion ▄▄▄▄▄ GETTERS & SETTERS ▄▄▄▄▄

  // #region ████████ PRIVATE METHODS ████████ ~
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
  /*
    Whenever a "SnapsToCircle" XItem parents itself to .x-container (for any reason)
    ... determines from REGISTRY which registered XCircles are valid receivers
          - logs them to 'watchingCircles'
          - calls 'startWatching(this)' on each XCircle

    XCircle.startWatching(xItem) => {
      sanity check: if already watching, throw error; if already contains snap item, throw error.
      1) determine relative angle to xItem
      2) determine the TWO slots it must form a gap between such that the gap aims towards the XItem
      3) create XSnap item and insert it into the gap
      4) call updateWatchTicker()
    }

    XCircle.updateWatchTicker() => { checks this._isWatching: if false, set true & adds watch function to gsap.ticker }

    watch function() { // run on every tick
      for each XSnap item {
        call "getWatchData" on XSnap
          ... updates XSnap's pathweight based on distance to watched item
          ... returns the slot it should be in (from relative angle) to face item
      }
      take new slots positions of each XSnap item and construct a new slots array
      redistribute slot items to new slot array
    }
    
    
    Whenever a "SnapsToCircle" XItem fires its onSnap() method (i.e. at the moment of a throw)
    ... XItem determines, via XCircle, which snap point it will land on
    ... XItem removes that XCircle from its watch-log, saving it as its snapCircle
    ... XItem tells all other XCircles in its watch-log to stop watching it, and removes them from its log as it does so
      ... those XCircles kill the associated XSnap item and redistribute their slots
    ... XItem tells the XCircle it's snapping to where it's going to land
    ... XCircle determines time until XItem lands (from tween)
    ... XCircle rotates so that the associated XSnap item's absAngle equals the absAngle to the snap coordinates, timing the tween
        so that it completes just as the XItem reaches its final snap point
      ... XCircle continues to update the pathWeight of the XSnap item so that the space grows as the XItem approaches

    Whenever a "SnapsToCircle" XItem fires its onThrowComplete() method after arriving at its snap position
    ... XItem kills its XSnap item, reparents itself to the XCircle, and tells the XCircle to redistribute its slots

    Whenever a "SnapsToCircle" XItem parents itself OUT of the .x-container (for any reason, including removal)
    ... XItem tells any remaining XCircles in its watch-log to stop watching it
      ... those XCircles kill the associated XSnap item and redistribute their slots
  */
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
  _getSnapItemFor(item) {
    return this.slots.find((slotItem) => slotItem.snapTarget?.name === item.name);
  }
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
    const {slot} = this._getSlotItemPos(item);
    if (~slot) {
      const slots = [...this.slots];
      slots[slot] = new XSnap(item, {parent: this});
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

    const slotCompare = this._compareSlots(oldSlots, newSlots);
    if (slotCompare.isEqual) { return Promise.resolve() }
    if (slotCompare.isSameOrder && "cycleSlot" in slotCompare) {
      newSlots = [
        oldSlots[oldSlots.length - 1],
        ...oldSlots.slice(1, -1),
        oldSlots[0]
      ];
    }
    /*DEVCODE*/
    /* console.log(slotCompare);
    console.log(newSlots); */
    /*!DEVCODE*/

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
    const snapItem = new XSnap(item, {parent: this});
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
  // #endregion ░░░░[Items]░░░░
  // #endregion ▄▄▄▄▄ PRIVATE METHODS ▄▄▄▄▄

  // #region ████████ PUBLIC METHODS ████████ ~
  //~ # region ░░░░░░░[Getters]░░░░ Data Retrieval ░░░░░░░ ~// # endregion ░░░░[Getters]░░░░
  //~ # region ░░░░░░░[Elements]░░░░ Managing Core DOM Elements ░░░░░░░ ~// #endregion ░░░░[Elements]░░░░
  // #region ░░░░░░░[Items]░░░░ Contained Item Management ░░░░░░░ ~
  // #region ========== Adding / Removing =========== ~
  async addDice(numDice = 1, type = undefined) {
    const newDice = [...Array(numDice)].map(() => new XDie({parent: this, type}));
    return this._distItems(this._getSlotsPlus(newDice));
  }
  async killItem(item) {
    this._distItems(this._getSlotsWithout(item));
    item.kill();
  }
  // #endregion _______ Adding / Removing _______
  // #region ========== Releasing to Drag =========== ~
  async pluckItem(item) {
    return this._distItems(this._swapItemToSnap(item))
      .then(() => this._addWatchFuncFor(item));
  }
  // #endregion _______ Releasing to Drag _______

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
    /*DEVCODE*/
    this.ping({x: endX, y: endY});
    /*!DEVCODE*/
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

  // #endregion ░░░░[Dice]░░░░
  // #endregion ▄▄▄▄▄ PUBLIC METHODS ▄▄▄▄▄

  /*DEVCODE*/
  // #region ████████ TEST METHODS: For Debugging & Development ████████ ~
  // #region ░░░░░░░[INITIALIZATION]░░░░ DB Container, Hiding & Showing Debug Data ░░░░░░░ ~
  static get DBCONTAINER() {
    return (this._DBCONTAINER = this._DBCONTAINER
      ?? $("#dbContainer")[0]
      ?? $("<div id=\"dbContainer\" class=\"db x-container\" />").appendTo(".vtt.game")[0]);
  }
  dbShow() {
    this.showAngles();
    this.dbUpdate();
  }
  dbHide() {
    this.hideAngles();
    this._isDBActive = false;
  }
  // #endregion ░░░░[INITIALIZATION]░░░░
  // #region ░░░░░░░ PING ░░░░░░░ ~
  static PING({x, y}, parentID, {radius = 20, color = "yellow"} = {}) {
    const [pingElem] = $(`<svg class="db" height="100%" width="100%">
      <circle cx="${radius}" cy="${radius}" r="${radius}" fill="${color}" stroke="none" />
    </svg>`)
      .appendTo(XCircle.DBCONTAINER)
      .children()
      .last();
    if (parentID) {
      const [parentContext] = $(parentID);
      ({x, y} = MotionPathPlugin.convertCoordinates(parentContext, XCircle.DBCONTAINER.elem, {x, y}));
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
  // #region ░░░░░░░[ANGLE DISPLAY]░░░░ Display Angle & Path Position on Circle ░░░░░░░ ~
  get angleGuide() { return (this._angleGuide = this._angleGuide ?? {}) }
  showAngles(numGuides = 4, isShowingAll = false) {
    [this._dbAngleContainer] = $(`
    <svg height="100%" width="100%">
      <circle id="db-${this.id}" class="db snap-circle" cx="${this.radius}" cy="${this.radius}" r="${this.radius * 1.25}" fill="none" stroke="none" />
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
      [...Array(numGuides)]
        .map((_, i) => gsap.utils.mapRange(0, numGuides, -180, 180, i))
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
      const convCoords = this.alignLocalPointTo(XElem.CONTAINER, {x, y});
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