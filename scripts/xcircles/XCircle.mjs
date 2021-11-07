// #region ████████ IMPORTS ████████ ~
import {
  // #region ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮ ~
  gsap, Dragger, InertiaPlugin, MotionPathPlugin, RoughEase, // GreenSock Animation Platform
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
  static get TYPES() {
    return {
      ...super.TYPES,
      pink: "pink",
      yellow: "yellow",
      cyan: "cyan",
      purple: "purple"
    };
  }
  static get DEFAULT_DATA() {
    return {
      ...super.DEFAULT_DATA,
      CLASSES: [...super.DEFAULT_DATA.CLASSES, "x-circle"],
      PREFIX: "xCircle"
    };
  }
  static Snap({x, y}, excludeCircle) {
    const snapPoints = Array.from(this.SNAPPOINTS.entries())
      .filter(([_, circle]) => excludeCircle?.name !== circle.name)
      .map(([point]) => point);
    const snapPoint = gsap.utils.snap({values: snapPoints}, {x, y});
    const circle = this.SNAPPOINTS.get(snapPoint);
    return {...snapPoint, circle};
  }
  static GetClosestTo(item) { return this.Snap(item).circle }
  // #endregion ▄▄▄▄▄ STATIC ▄▄▄▄▄

  // #region ████████ CONSTRUCTOR ████████ ~
  constructor(x, y, radius, options = {}) {
    const circle$ = $(`
    <div style="height: ${2 * radius}px; width: ${2 * radius}px;">
      <svg height="100%" width="100%">
        <path class="circle-path" stroke="none" d="${U.drawCirclePath(radius, {x: radius, y: radius})}"></path>
        <path class="motion-path" fill="none" stroke="none" d="${U.drawCirclePath(radius * 0.8, {x: radius, y: radius})}"></path>
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

  get rotation() { return super.rotation }
  set rotation(v) {
    super.rotation = v;
    this.slots.forEach((item) => item.straighten?.());
  }
  get slots() { return (this._slots = this._slots ?? []) }

  // #region ████████ Animation: Animation Effects, Tweens, Timelines ████████ ~
  get effects() { return (this._effects = this._effects ?? {}) }

  _toggleSlowRotate(isRotating) {
    if (Boolean(isRotating) === Boolean(this._slowRotator)) { return }
    if (isRotating) {
      this._slowRotator = gsap.to(this.elem, {
        rotation: "+=360",
        duration: 100,
        repeat: -1,
        ease: "rough",
        callbackScope: this,
        onUpdate() {
          this.slots.forEach((item) => item.straighten?.());
        }
      });
    } else {
      this._slowRotator.kill();
      delete this._slowRotator;
    }
  }
  // #endregion ▄▄▄▄▄ Animation ▄▄▄▄▄

  // #region ████████ XItems: Managing Contained XItems ████████ ~
  get pathMap() {
    // Incorporates the weights of all items and returns a Map of [item]: [pathPos] in order of slots
    // if (!this._pathMap) { this.drawPathMap() }
    this.drawPathMap();
    return this._pathMap;
  }
  drawPathMap() {
    this._pathMap = new Map();
    let totalWeights = 0; //~ IN ALL CASES, PATH STARTS AT 90deg, 0deg IS AT 12'O'CLOCK
    this.slots.forEach((slotItem) => {
      totalWeights += slotItem.pathWeight;
      this._pathMap.set(slotItem, totalWeights - 0.5 * slotItem.pathWeight);
    });
    for (const [item, pathWeight] of this._pathMap.entries()) {
      this._pathMap.set(item, gsap.utils.normalize(0, totalWeights, pathWeight));
    }
    // if (this._lockedItem && this._pathMap.has(this._lockedItem)) {
    //   const {pathPos: lockedPathPos} = this._lockedItem;
    //   const mappedPathPos = this._pathMap.get(this._lockedItem);
    //   const deltaPathPos = mappedPathPos - lockedPathPos;
    //   for (const [item, pathPos] of this._pathMap.entries()) {
    //     this._pathMap.set(item, U.cycleNum(pathPos + deltaPathPos, [0, 1]));
    //   }
    // }
  }
  get pathPositions() { return Array.from(this.pathMap.values()) }

  getSlotPos(item) {
    return {
      ...this._getPosOnPath(this.pathMap.get(item)),
      slot: this.slots.findIndex((slotItem) => slotItem === item)
    };
  }
  getSnapItem(item) { return this.slots.find((slotItem) => slotItem instanceof XSnap && slotItem.snapTarget === item) }
  getSlotPositions(slots) { return (slots ?? this.slots).map((slotItem) => this.getSlotPos(slotItem)) }
  getSlotPathPositions(slots) { return this.getSlotPositions(slots).map((slotData) => slotData.pathPos) }

  getNearestSlot(xItem, xItemPoint) {
    // Determines closest slot to the provided point, relying on angle.
    xItemPoint = xItemPoint ?? {x: xItem.x, y: xItem.y};
    const {pathPos} = this.getPosOnCircle(xItem, xItemPoint);
    const pathVals = Array.from(this.pathMap.values());
    const upperSlot = Math.max(0, pathVals.findIndex((v) => v >= pathPos));
    const lowerSlot = upperSlot === 0 ? this.pathMap.size - 1 : upperSlot - 1;
    let upperPathPos = this.pathPositions[upperSlot],
        lowerPathPos = this.pathPositions[lowerSlot];
    while (upperPathPos < pathPos) { upperPathPos++ }
    while (lowerPathPos > pathPos) { lowerPathPos-- }
    if (upperPathPos - pathPos > pathPos - lowerPathPos) {
      return lowerSlot;
    }
    return upperSlot;
  }

  addItem(item, insertAt) {
    if (U.isPosInt(insertAt)) {
      this._slots = [
        ...this._slots.slice(0, insertAt),
        item,
        ...this._slots.slice(insertAt)
      ];
    } else {
      this.slots.push(item);
      // console.log(this.slots);
    }
    // this.distributeSlots();
    return item;
  }
  swapItem(newItem, oldItem) {
    oldItem = oldItem ?? this.slots.find((slotItem) => slotItem.snapTarget === newItem);
    const index = this.slots.findIndex((slotItem) => slotItem === oldItem);
    if (U.isPosInt(index)) {
      this.slots[index] = newItem;
      if (this._lockedItem === oldItem) {
        delete this._lockedItem;
      }
      return oldItem;
    }
    throw new Error(`${oldItem.name} not found in ${this.name}: ${newItem.name} NOT swapped in.`);
  }
  removeItem(item) {
    if (this.slots.includes(item)) {
      this._slots = this.slots.filter((slotItem) => slotItem !== item);
      if (this._lockedItem === item) {
        delete this._lockedItem;
      }
      return item;
    }
    throw new Error(`${item.name} not found in ${this.name}`);
  }
  killItem(item) { this.removeItem(item).kill() }

  async distributeSlots(duration = 0.5) {
    const newPositions = this.getSlotPathPositions();
    return Promise.allSettled(this.slots
      .map((item, i) => item.setPathPos(newPositions[i], duration)));
  }
  async createDice(numDice = 1, type = undefined) {
    [...Array(numDice)].forEach(() => this.addItem(new XDie({parent: this, type})));
    return this.distributeSlots(5);
  }
  async pluckItem(targetItem, duration = 1) {
    this.removeItem(targetItem);
    return this.distributeSlots(duration);
  }
  addSnapPoint(targetItem, targetPoint) {
    const {x, y} = this.getPosOnCircle(targetItem, targetPoint);
    const snapItem = new XSnap(targetItem, {parent: this, properties: targetPoint});
    this._lockedItem = snapItem;
    return this.addItem(snapItem, this.getNearestSlot(targetItem, targetPoint));

    /* const _this = this;
    console.log("BEFORE SNAP ADDED:");
    console.log({
      slots: [..._this.slots],
      pathMap: Array.from(_this.pathMap.entries()).map(([item, pathPos]) => `${item.shortName}: ${pathPos}`)
    });
    const snapItem = this.addItem(new XSnap(targetItem, {parent: this, properties: targetPoint}), this.getNearestSlot(targetItem, targetPoint));
    console.log("AFTER SNAP ADDED:");
    console.log({
      slots: [..._this.slots],
      pathMap: Array.from(_this.pathMap.entries()).map(([item, pathPos]) => `${item.shortName}: ${pathPos}`)
    });
    this.distributeSlots(0.25).then(() => {
      console.log("AFTER DISTRIBUTED:");
      console.log({
        slots: [..._this.slots],
        pathMap: Array.from(_this.pathMap.entries()).map(([item, pathPos]) => `${item.shortName}: ${pathPos}`)
      });
    });
    return snapItem; */
  }
  async catchThrownItem(targetItem) {
    // Pause rotation
    this._toggleSlowRotate(false);

    /* const _this = this;
    const globalPos = {
      target: targetItem.absPos,
      circle: _this.absPos,
      snap: this.alignLocalPointTo(XElem.CONTAINER, _this.getPosOnCircle(targetItem)),
      end: targetItem._snapPoint
    };
    globalPos.angleBetween = U.getAngle(globalPos.snap, globalPos.end, globalPos.circle);
    globalPos.angleToSnap = U.getAngle(globalPos.circle, globalPos.snap, globalPos.circle);
    globalPos.angleToEnd = U.getAngle(globalPos.circle, globalPos.end, globalPos.circle);
    globalPos.angleDelta = U.getAngleDelta(globalPos.angleToSnap, globalPos.angleToEnd);
    globalPos.newRotation = U.cycleAngle(this.rotation + globalPos.angleDelta);
    Object.values(globalPos).forEach(({x, y}) => {
      window.DB.ping({x, y}, {
        color: gsap.utils.random(["yellow", "orange", "red", "blue", "cyan", "lime", "purple"]),
        radius: U.randNum(15, 25, 1)
      });
    });
    // gsap.globalTimeline.pause();
    console.log(globalPos);
    // return; */
    /* const debugData = {
      circleRotation: {
        start: this.rotation
      },
      globalAlign: {
        targetCurPos: targetItem.absPos,
        targetEndPos: targetItem._snapPoint
      },
      localAlign: {
        targetCurPos: this.alignGlobalPointTo(this, targetItem),
        targetEndPos: this.alignGlobalPointTo(this, targetItem._snapPoint),
        relCurAngle: this.getRelAngleTo(this.alignGlobalPointTo(this, targetItem)),
        relEndAngle: this.getRelAngleTo(this.alignGlobalPointTo(this, targetItem._snapPoint)),
        absEndAngle: this.getAbsAngleTo(this.alignGlobalPointTo(this, targetItem._snapPoint)),
        angleDelta: null,
        wouldRotateTo: null
      },
      pathAlign: {
        targetCurPath: null,
        targetEndPath: null,
        relCurAngle: null,
        relEndAngle: null,
        angleDelta: null,
        wouldRotateTo: null
      }
    };
    debugData.localAlign.angleDelta = U.getAngleDelta(debugData.localAlign.relEndAngle, debugData.localAlign.relCurAngle);
    debugData.localAlign.wouldRotateTo = {
      relative: U.cycleNum(this.rotation + debugData.localAlign.angleDelta, [-180, 180]),
      absolute: U.cycleNum(debugData.localAlign.absEndAngle, [-180, 180])
    };

    const {pathPos: snapPathPos, angle: relFacingAngle, ...snapPoint} = this.getPosOnCircle(targetItem);
    debugData.pathAlign.targetCurPath = snapPathPos;
    debugData.pathAlign.relCurAngle = relFacingAngle; 
    const {pathPos: endPathPos, angle: relEndAngle, ...endPoint} = this.getPosOnCircle(targetItem, targetItem._snapPoint);
    debugData.pathAlign.targetEndPath = endPathPos;
    debugData.pathAlign.relEndAngle = relEndAngle;
    debugData.pathAlign.angleDelta = U.getAngleDelta(debugData.pathAlign.relEndAngle, debugData.pathAlign.relCurAngle);
    debugData.pathAlign.wouldRotateTo = U.cycleNum(this.rotation + debugData.pathAlign.angleDelta, [-180, 180]);

    window.DB.ping(this.alignLocalPointTo(XElem.CONTAINER, {x, y}), {color: "orange"});
    window.DB.ping(targetItem._snapPoint, {color: "purple"});
    const relSnapAngle = this.getRelAngleTo(targetItem._snapPoint);
    window.DB.ping(endPoint, {color: "red"});
    window.DB.ping(targetItem._snapPoint, {color: "red"});
    const {tween} = targetItem.dragger;
    const deltaAngle = U.getAngleDelta(relSnapAngle, relFacingAngle);

    console.log(debugData);
    gsap.globalTimeline.pause();

    console.log({
      snapCircle: this.shortName,
      deltaAngle,
      curRotation: this.rotation,
      finalRotation: U.cycleAngle(this.rotation + deltaAngle),
      relFacingAngle,
      relSnapAngle,
      snapPoint: targetItem._snapPoint,
      xCircle: this,
      xDie: targetItem,
      xSnap: snapItem
    });
    gsap.globalTimeline.pause();
    const catchAngle = this.getAbsAngleTo(targetItem, {x: targetItem.dragger.endX, y: targetItem.dragger.endY});
    */

    // Calculate new rotation by GLOBAL coordinates of all relevant points.
    const snapItem = this.addSnapPoint(targetItem);
    await this.distributeSlots(0.1);
    const angleToSnap = U.getAngle(this.absPos, snapItem.absPos, this.absPos);
    const angleToEnd = U.getAngle(this.absPos, targetItem._snapPoint, this.absPos);
    const angleDelta = U.getAngleDelta(angleToSnap, angleToEnd);
    const rotation = U.cycleAngle(this.rotation + angleDelta);

    // Determine how long until incoming die reaches its snap point
    const duration = targetItem.dragger.tween.duration();

    // Animate to the new rotation in time.
    gsap.to(this.elem, {
      rotation: rotation + 360 * 4,
      duration,
      ease: "expo4.inOut",
      callbackScope: this,
      onUpdate() {
        this.slots.forEach((item) => item.straighten?.());
      }
    });
    // setTimeout(() => {
    //   snapItem.pathWeight = 1;
    //   this.distributeSlots(0.5);
    // }, 1000 * (duration - 0.5));
  }
  async grabThrownItem(targetItem) {
    const oldSnap = this.swapItem(targetItem);
    this.distributeSlots(0.5);
    this._toggleSlowRotate(true);
    oldSnap.kill();
  }
  // #endregion ▄▄▄▄▄ XItems ▄▄▄▄▄

  // #region ░░░░░░░[Items]░░░░ Managing Contained XItems ░░░░░░░ ~
  // _areSlotsEqual(slots1, slots2) {
  //   return slots1.length === slots2.length
  //     && slots1.every((slot, i) => slot.name === slots2[i].name);
  // }
  // _areSameOrder(slots1, slots2) {
  //   if (slots1.length !== slots2.length) { return false }
  //   const posIndexOffset = slots2.findIndex((slot) => slot.name === slots1[0].name);
  //   if (U.isPosInt(posIndexOffset)
  //     && slots1.every((slot, i) => slot.name === gsap.utils.wrap(slots2, i + posIndexOffset).name)) {
  //     const negIndexOffset = posIndexOffset - slots1.length;
  //     return Math.abs(negIndexOffset) >= posIndexOffset ? posIndexOffset : negIndexOffset;
  //   }
  //   return false;
  // }

  // pluckItem(xItem) {
  //   this._slots = this._getSlotsWithout(xItem);
  // }

  // _getSlotPathPositions(slots) {
  //   return [...slots ?? this.slots].map((item) => this._getSlotItemPos(item, slots).pathPos);
  // }

  // _getSnapPosFor(item) { return this._getSlotItemPos(this._getSnapItemFor(item)) }
  // _getSlotsWithout(ref, slots = this.slots) { return slots.filter((slot) => slot !== ref) }
  // _getSlotsPlus(items, index, slots = this.slots) {
  //   index = index ?? slots.length;
  //   return [
  //     ...slots.slice(0, index),
  //     ...[items].flat(),
  //     ...slots.slice(index)
  //   ];
  // }
  // _unshiftSlots(newSlots) {
  //   newSlots = [...newSlots];
  //   const oldSlots = [...this.slots];
  //   const shiftCounts = {};
  //   newSlots.forEach((item, slotNum) => {
  //     const oldSlotNum = oldSlots.findIndex((oItem) => oItem.name === item.name);
  //     if (U.isPosInt(oldSlotNum)) {
  //       shiftCounts[slotNum - oldSlotNum] = (shiftCounts[slotNum - oldSlotNum] ?? 0) + 1;
  //     }
  //   });
  //   let [indexShift] = Object.entries(shiftCounts).reduce(([maxShift, maxCount], [shift, count]) => (count > maxCount ? [parseInt(shift), count] : [maxShift, maxCount]), [0, 0]);
  //   while (indexShift !== 0) {
  //     if (indexShift > 0) {
  //       newSlots.push(newSlots.shift());
  //       indexShift--;
  //     } else {
  //       newSlots.unshift(newSlots.pop());
  //       indexShift++;
  //     }
  //   }
  //   return newSlots;
  // }
  // async _distItems(newSlots, duration = 1) {
  //   const oldSlots = [...this.slots];

  //   if (this._areSlotsEqual(oldSlots, newSlots)) { return Promise.resolve() }

  //   this._slots = newSlots; // [...this._unshiftSlots(newSlots)];
  //   const newPositions = this._getSlotPathPositions();
  //   // console.log({
  //   //   oldSlots: oldSlots.map((slot) => slot.name.replace(new RegExp(`${slot.owner.id}_`, "g"), "")),
  //   //   newSlots: newSlots.map((slot) => slot.name.replace(new RegExp(`${slot.owner.id}_`, "g"), "")),
  //   //   newPositions
  //   // });
  //   return Promise.allSettled(this.slots
  //     .map((item, i) => item.setPathPos(newPositions[i])));
  // }
  // #endregion ░░░░[Items]░░░░

}