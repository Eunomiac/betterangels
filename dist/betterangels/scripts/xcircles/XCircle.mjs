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
  XItem, XDie, XSnap

} from "../helpers/bundler.mjs";

class XCircle {
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
  static get CLASSES() { return ["x-circle"] }
  static get PREFIX() { return "xCircle" }
  static get SNAPPOINTS() { return (this._SNAPPOINTS = this._SNAPPOINTS ?? new Map()) }
  static get CONTAINER() {
    return (this._CONTAINER = this._CONTAINER
      ?? $("#xContainer")[0]
      ?? $("<div id=\"xContainer\" />").appendTo(".vtt.game")[0]);
  }

  // ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░
  static NameCircle(circle) {
    const nameTest = new RegExp(`${circle._owner}_${circle._type}_`);
    const circleNum = parseInt(Object.keys(this.REGISTRY)
      .filter((key) => nameTest.test(key)).pop()?.match(/_(\d+)$/)
      ?.pop() ?? 0) + 1;
    circle._name = `${circle._owner}_${circle._type}_${circleNum}`;
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
  static Kill(circle) {
    circle.killAll();
    delete this.REGISTRY[circle.name];
  }
  static Snap({x, y}) {
    const snapPoint = gsap.utils.snap({values: Array.from(this.SNAPPOINTS.keys())}, {x, y});
    const circle = this.SNAPPOINTS.get(snapPoint);
    return {...snapPoint, circle};
  }
  static GetClosestTo(item) { return this.Snap(item).circle }

  // ████████ CONSTRUCTOR ████████
  constructor(x, y, radius, options) {
    this._owner = options?.owner?.id ?? options?.owner ?? U.GMID;
    this._type = this._checkType(options?.type);

    this.constructor.NameCircle(this);
    this._create(x, y, radius);
    this.constructor.Register(this);
  }

  // ████████ GETTERS & SETTERS ████████
  // ░░░░░░░ Read-Only ░░░░░░░
  get x() { return gsap.getProperty(this.elem, "x") }
  get y() { return gsap.getProperty(this.elem, "y") }
  get height() { return gsap.getProperty(this.elem, "height") }
  get width() { return gsap.getProperty(this.elem, "width") }
  get radius() { return (this.height + this.width) / 4 }
  get owner() { return game.users.get(this._owner) }

  get name() { return this._name }
  get id() { return (this._id = this._id ?? `${this.constructor.PREFIX}-${this._name}`) }
  get elem() { return (this._elem = this._elem ?? $(`#${this.id}`)?.[0]) }
  get $() { return $(this.elem) }
  get defaultClasses() {
    return [
      ...this.constructor.CLASSES,
      U.formatAsClass(`${this.constructor.PREFIX}-${this.type}`)
    ];
  }

  get snap() {
    const circle = this;
    return {
      get id() { return `${circle.id}-snap` },
      get elem() { return (circle._snapCircle = circle._snapCircle ?? $(`#${this.id}`)?.[0]) },
      get path() {
        if (!circle._rawSnapPath) {
          circle._rawSnapPath = MotionPathPlugin.getRawPath(this.elem);
          MotionPathPlugin.cacheRawPathMeasurements(circle._rawSnapPath);
        }
        return circle._rawSnapPath;
      },
      get points() {
        return new Array(10).fill(null).map((_, i) => {
          const {x, y} = MotionPathPlugin.convertCoordinates(
            circle.elem,
            this.constructor.CONTAINER,
            MotionPathPlugin.getPositionOnPath(
              this.path,
              gsap.utils.mapRange(0, 10, 0, 1, i)
            )
          );
          return {x, y};
        });
      }
    };
  }

  get slots() { return (this._slots = this._slots ?? []) }
  get items() { return this.slots.filter((item) => item instanceof XItem) }
  get readiedItems() { return (this._readiedItems = this._readiedItems ?? []) }

  // ░░░░░░░ Writeable ░░░░░░░
  get classes() { return this.elem.classList }
  set classes(v) {
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

  get type() { return this._type }
  set type(v) {
    this._type = this._checkType(v);
    this.classes = [];
  }

  get rotation() { return gsap.getProperty(this.elem, "rotation") }
  set rotation(v) {
    if (/^[+-]=/.test(`${v}`)) {
      v = this.rotation + parseFloat(`${v}`.replace(/=/g, ""));
    }
    gsap.set(this.elem, {rotation: v});
  }

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░
  _create(x, y, radius, cssClasses = []) {
    [this._xCircle] = $(`
    <div id="${this.id}" class="${this.defaultClasses.join(" ")}" style="height: ${2 * radius}px; width: ${2 * radius}px;">
      <svg height="100%" width="100%">
        <circle cx="${radius}" cy="${radius}" r="${radius}" stroke="none" />
        <circle id="${this.snap.id}" class="snap-circle" cx="${radius}" cy="${radius}" r="${radius * 0.8}" fill="none" stroke="none" transform="rotate(90)" />
      </svg>
    </div>
    `).appendTo(XCircle.CONTAINER);
    this.set({xPercent: -50, yPercent: -50, x, y});
    console.log(this);
    MotionPathPlugin.convertToPath(`#${this.snap.id}`);
    this._rawSnapPath = MotionPathPlugin.getRawPath(`#${this.snap.id}`);
    MotionPathPlugin.cacheRawPathMeasurements(this.snap.path);
    this._toggleSlowRotate(true);
  }

  // ░░░░░░░[Elements]░░░░ Managing Core Circle Elements ░░░░░░░
  _checkType(type) {
    const checkedType = this.constructor.TYPES[type] ?? type;
    if (Object.values(this.constructor.TYPES).includes(checkedType)) {
      return checkedType;
    }
    throw new Error(`Invalid Circle Type: ${type}`);
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

    if ((isRotating && this._isSlowRotating)
        || (!isRotating && !this._isSlowRotating)) { return }
    if (isRotating) {
      this._isSlowRotating = gsap.to(this.elem, {
        rotation: "+=360",
        duration: 100,
        repeat: -1,
        ease: "none",
        callbackScope: this,
        onUpdate() {
          this.items.forEach((item) => item.straighten());
        }
      });
    } else {
      this._isSlowRotating.kill();
      delete this._isSlowRotating;
    }
  }

  // ░░░░░░░[Items]░░░░ Managing Contained XItems ░░░░░░░
  /* IN ALL CASES, PATH STARTS AT 90deg, 0deg IS AT 12'O'CLOCK */

  _getAbsAngleTo({x, y}) { return U.getAngle(this, {x, y}) }
  _getRelAngleTo({x, y}) { return U.cycle(this._getAbsAngleTo({x, y}) - this.rotation + 180, -180, 180) }
  _getDistanceTo({x, y}) { return U.getDistance(this, {x, y}) }
  _getPosOnPath(pathPos) { return {pathPos, ...MotionPathPlugin.getPositionOnPath(this.snap.path, pathPos, true)} }

  get slotPathPositions() {
    let totalWeights = 0;
    return this.slots
      .map((slotItem) => {
        totalWeights += slotItem.pathWeight;
        return totalWeights - 0.5 * slotItem.pathWeight;
      })
      .map((slotWeight) => gsap.utils.mapRange(0, 1, 0, totalWeights, slotWeight));
  }

  _getNearestSlot({x, y}) {
    if ([x, y].includes(undefined)) { return false }
    const angle = this._getRelAngleTo({x, y});
    const pathPos = gsap.utils.normalize(-180, 180, angle);

    const upperSlot = this.slotPathPositions.findIndex((v, i, a) => i === (a.length - 1) || v <= pathPos);
    if (upperSlot === 0) {
      return upperSlot;
    }
    const lowerSlot = this.slotPathPositions[upperSlot - 1];
    if (gsap.utils.snap([this.slotPathPositions[lowerSlot], this.slotPathPositions[upperSlot]], pathPos) === lowerSlot) {
      return lowerSlot;
    }
    return upperSlot;
  }
  _getItemSlot(item, slots, isSearching = true) {
    slots = slots ?? (!isSearching && this.slots);
    let slot = -1;
    if (slots) {
      slot = slots.findIndex((slotItem) => (item instanceof XItem
        ? item.name === slotItem?.name
        : item === slotItem));
    } else if (isSearching) {
      slot = this._getNearestSlot(item);
    }
    return slot >= 0 ? slot : false;
  }
  _getItemPos(item, slots) {
    const slotNum = this._getItemSlot(item, slots);
    if (slotNum !== false) {
      const {x, y, angle, pathPos} = this._getPosOnPath(slotNum / slots.length);
      return {x, y, angle, pathPos, slot: slotNum};
    } else {
      return false;
    }
  }
  _getSlotsWithout(ref, slots) {
    slots = slots ?? [...this.slots];
    if (Number.isInteger(parseInt(ref))) {
      return slots.filter((slot, i) => i !== parseInt(ref));
    } else if (ref instanceof XItem) {
      return slots.filter((slot) => !(slot instanceof XItem)
                                    || slot.name !== ref.name);
    }
    return this.slots.filter((slot) => slot !== ref);
  }
  _getSlotsPlus(items, index, slots) {
    slots = slots ?? [...this.slots];
    index = index ?? slots.length;
    return [
      ...slots.slice(0, index),
      ...[items].flat(),
      ...slots.slice(index)
    ];
  }
  _compareSlots(oSlots, nSlots) {
    oSlots = [...oSlots];
    nSlots = [...nSlots];
    function compareSlot(slot1, slot2) {
      if (slot1 instanceof XItem && slot2 instanceof XItem) {
        return slot1.name === slot2.name;
      }
      return slot1 === slot2;
    }
    function getNext(slot, slots) {
      let slotIndex = slots.findIndex((s) => compareSlot(slot, s));
      if (slotIndex === slots.length - 1) {
        slotIndex = 0;
      } else {
        slotIndex++;
      }
      return slots[slotIndex];
    }
    if (oSlots.length !== nSlots.length) {
      return {isEqual: false, isSameOrder: false};
    }
    if (oSlots.every((oSlot, i) => compareSlot(oSlot, nSlots[i]))) {
      return {isEqual: true, isSameOrder: true};
    }
    const testResults = {isEqual: false, isSameOrder: true};
    for (const slot of oSlots) {
      if (!compareSlot(getNext(slot, oSlots), getNext(slot, nSlots))) {
        testResults.isSameOrder = false;
        break;
      }
    }
    if (testResults.isSameOrder) {
      if (compareSlot(oSlots[0], nSlots[1])) {
        testResults.cycleSlot = 0;
      } else if (compareSlot(oSlots[1], nSlots[0])) {
        testResults.cycleSlot = oSlots.length - 1;
      }
    }
    return testResults;
  }
  _checkSlots(item, slots) {
    slots = slots ?? this.slots;
    if (item instanceof XItem) {
      return slots.filter((slot) => slot instanceof XItem && slot.name === item.name).length > 0;
    }
    return slots.includes(item);
  }
  _getSnap(item, slots) {
    if (item instanceof XItem) {
      slots = slots ?? this.slots;
      const regExTest = new RegExp(`xSnap-${item.name}`);
      return slots.find((itm) => regExTest.test(itm));
    }
    return false;
  }
  _checkSnap(item, slots) {
    slots = [...slots];
    if (item instanceof XItem) {
      const snapPointName = `SNAP-${item.name}`;
      const snapPointSlot = slots.findIndex((slot) => slot === snapPointName);
      if (snapPointSlot >= 0) {
        slots[snapPointSlot] = item;
      }
    }
    return slots;
  }
  async pushClockwise(slotRef, numSlots = 1) {
    const slot = this._getItemSlot(slotRef, this.slots, false);

  } // Have some kind of throttling or queue here, but will be easier since only one other item should have to move
  async pushCounterClockwise(slotRef, numSlots = 1) { }
  async pushToSlot(slotRef, slotNum) { } // Finds the slotRef, then pushes it through the other items to its new position using above functions. If no slotNum given, will try to use the slotRef to figure out the slotNum...?

  /* For basic path positioning:  Give each item a weight -- dice are 1, snap points are 2, etc
          Should have a "maximum absolute path share per item" before triggering the weighting, so circles with only a few items and lots of room don't do it
    Then just map the weighted positions of each item to the 0 - 1 pathPos
    Can just call this function with no args after closing the snap point to redistribute all the items with the proper positioning
    Can probably make it a super safe function, too, since all it will ever do is look at the items and adjust their weighted positions
    Weights can even change dynamically based on, say, distance of dragged item to the snap point

    DB TEST: On debug layer, generate a item image at the exact moment and position the snap point is determined */
  async _distItems(newSlots, duration = 1, isStartPosOK = false) {
    const oldSlots = [...this.slots];
    newSlots = Array.isArray(newSlots)
      ? newSlots
      : this._checkSnap(newSlots, this.slots);
    // const newSlotRecord = [...newSlots];

    const slotCompare = this._compareSlots(newSlots, oldSlots);
    if (slotCompare.isEqual) { return Promise.resolve() }
    if (slotCompare.isSameOrder && "cycleSlot" in slotCompare) {
      newSlots = [
        oldSlots[oldSlots.length - 1],
        ...oldSlots.slice(1, -1),
        oldSlots[0]
      ];
    }

    this._slots = [...newSlots];

    const oldPositions = Object.fromEntries(this.items.map((item) => [item.id, this._getItemPos(item, oldSlots)]));
    const newPositions = Object.fromEntries(this.items.map((item) => [item.id, this._getItemPos(item, this.slots)]));

    const circle = this;

    return Promise.allSettled(this.items
      .map((item) => new Promise((resolve, reject) => {
        let oldPathPos = oldPositions[item.id]?.pathPos ?? 0;
        const newPathPos = newPositions[item.id].pathPos;

        // OLD: 0.9 to NEW: 0.1   --> startAt OLD--
        // OLD: 0.1 to NEW: 0.9   --> startAt OLD++
        if (circle._checkSlots(item, oldSlots) && Math.abs(oldPathPos - newPathPos) > 0.6) {
          if (oldPathPos > newPathPos) {
            oldPathPos--;
          } else {
            oldPathPos++;
          }
        }
        console.log(gsap.to(item.elem, {
          motionPath: {
            path: circle.snap.elem,
            alignOrigin: [0.5, 0.5],
            start: oldPathPos,
            end: newPathPos,
            fromCurrent: true // item.id in oldPositions
          },
          duration,
          ease: "power4.out",
          onComplete: resolve,
          onUpdate() {
            // const {onUpdate, ...theRest} = this;
            // item._pathPos = JSON.parse(JSON.stringify(theRest));
          },
          onInterrupt: reject
        }));
      })));
  }
  async _openSnapPoint(item) {
    if (item instanceof XItem && !this._checkSlots(item)) {
      return this._distItems(this._getSlotsPlus(new XSnap(item), this._getItemSlot(item)));
    }
    return Promise.reject();
  }
  async _closeSnapPoint(item) {
    const snap = this._getSnap(item);
    if (snap) {
      const itemDist = this._distItems(this._getSlotsWithout(snap));
      snap.kill();
      return itemDist;
    }
    return Promise.reject();
  }

  // ████████ PUBLIC METHODS ████████
  // ░░░░░░░[Getters]░░░░ Data Retrieval ░░░░░░░

  // ░░░░░░░ SETTERS ░░░░░░░
  set(params) { gsap.set(this.elem, params) }

  // ░░░░░░░[Items]░░░░ Adding & Removing XItems ░░░░░░░

  killItem(item) {
    this._distItems(this._getSlotsWithout(item));
    item.kill();
  }
  killAll() {
    this.items.forEach(this.killItem);
    delete this._slots;
  }

  async addDice(numDice = 1, type = XDie.TYPES.basic) {
    const newDice = new Array(numDice).fill(null).map(() => new XDie({circle: this, type}));
    return this._distItems(this._getSlotsPlus(newDice));
  }
  async pluckItem(item) {
    if (item instanceof XItem && this.slots.includes(item)) {
      this._distItems(this._getSlotsWithout(item));
      this.watchItem(item);
    }
  }
  async watchItem(item) {
    console.log(`Readying ${item.name}`);
    if (this.readiedItems.filter((rItem) => item.name === rItem.name).length) { return }
    this.readiedItems.push(item);
    console.log("... Readied, Starting Watch");
    this.watchItems();
  }
  async watchItems() {
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
            const newSlot = circle._getItemSlot(item);
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
    window.requestAnimationFrame(step);
  }
  unwatchItem(item) {
    if (item instanceof XItem) {
      this._readiedItems = this.readiedItems.filter((rItem) => rItem.name !== item.name);
      this._closeSnapPoint(item);
    }
  }
  async distDice() {
    // this.slots.forEach(())
  }
  async catchItem(item) {
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

      // const catchSlot = this._getNearestSlot({x: endX, y: endY});
      // const catchSlotAngle = this._getAbsAngleTo({x, y});
      // this._distItems(this._getSlotsPlus(snapPointName, catchSlot, this._getSlotsWithout(snapPointName)), 0.25);
      const duration = tween.duration() - tween.time();
      const rotation = `${angleDelta > 0 ? "+" : "-"}=${Math.abs(parseInt(angleDelta))}`; /* 0; */ /* this._getAbsAngleTo({x, y}); */
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
  }
  /*
.tween : Tween
[read-only] The Tween instance that gets created as soon as the mouse (or touch) is released (when inertia is true). This allows you to check its duration, .pause() or .resume() it, change its timeScale, or whatever you want.

Details
Tween - The tween instance that gets created as soon as the mouse (or touch) is released (when inertia is true) - this allows you to check its duration, pause() it, resume() it, change its timeScale, or whatever you want. Keep in mind that a new tween is created each time the element is “thrown”. You can easily get it when the user releases the mouse (or touch) by referencing this.tween inside the onDragEnd callback.

 Home  Docs

 .endX
.endX : Number
[read-only] The ending x (horizontal) position of the Draggable instance which is calculated as soon as the mouse/touch is released after a drag, meaning you can use it to predict precisely where it'll land after an inertia flick.

Details
Number - The ending x (horizontal) position of the Draggable instance. endX gets populated immediately when the mouse (or touch) is released after dragging, even before tweening has completed. This makes it easy to predict exactly where the element will land (useful for inertia: true Draggables where momentum gets applied). For a Draggable of type: "x,y", endX would pertain to the x transform translation, as in the CSS transform: translateX(...). For type: "top,left", the Draggable’s x would refer to the CSS left value that’s applied. This is not the global coordinate - it is the inline CSS-related value applied to the element.

 Home  Docs

 maxDuration : Number - The maximum duration (in seconds) that the kinetic-based inertia tween can last. InertiaPlugin will automatically analyze the velocity and bounds and determine an appropriate duration (faster movements would typically result in longer tweens to decelerate), but you can cap the duration by defining a maxDuration. The default is 10 seconds. This has nothing to do with the maximum amount of time that the user can drag the object - it’s only the inertia tween that results after they release the mouse/touch. (requires InertiaPlugin and setting inertia: true, otherwise maxDuration will simply be ignored.)

minDuration : Number - The minimum duration (in seconds) that the kinetic-based inertia tween should last. InertiaPlugin will automatically analyze the velocity and bounds and determine an appropriate duration (faster movements would typically result in longer tweens to decelerate), but you can force the tween to take at least a certain amount of time by defining a minDuration. The default is 0.2 seconds. This has nothing to do with the minimum amount of time that the user can drag the object - it’s only the inertia tween that results after they release the mouse/touch. (requires InertiaPlugin and setting inertia: true, otherwise minDuration will simply be ignored.)

overshootTolerance : Number - Affects how much overshooting is allowed before smoothly returning to the resting position at the end of the tween. This can happen when the initial velocity from the flick would normally cause it to exceed the bounds/min/max. The larger the overshootTolerance the more leeway the tween has to temporarily shoot past the max/min if necessary. The default is 1. If you don’t want to allow any overshooting, you can set it to 0.
 */

}

// ████████ EXPORTS ████████
export default XCircle;