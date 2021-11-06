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

const EFFECTS = (() => {
  gsap.registerEffect({
    name: "slowRotate",
    effect: (targets, config) => {
      const [target] = targets;
      return gsap.to(target.elem, {
        rotation: "+=360",
        duration: 100,
        repeat: -1,
        ease: "none",
        paused: true,
        callbackScope: target,
        onUpdate() {
          this.slots.forEach((item) => item.straighten?.());
        }
      });
    },
    defaults: {}
  });
  return gsap.effects;
})();

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
  static Snap({x, y}) {
    const snapPoint = gsap.utils.snap({values: Array.from(this.SNAPPOINTS.keys())}, {x, y});
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
        <circle cx="${radius}" cy="${radius}" r="${radius}" stroke="none"></circle>
        <path class="motion-path" fill="none" stroke="none" d="m 100 20 c 44.2 0 80 35.8 80 80 c 0 44.2 -35.8 80 -80 80 c -44.2 0 -80 -35.8 -80 -80 c 0 -44.2 35.8 -80 80 -80 z"></path>
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

  get slots() { return (this._slots = this._slots ?? []) }

  // #region ████████ Animation: Animation Effects, Tweens, Timelines ████████ ~
  get effects() { return (this._effects = this._effects ?? {}) }

  _toggleSlowRotate(isRotating) {
    this.effects.slowRotate = this.effects.slowRotate ?? EFFECTS.slowRotate(this);
    if (Boolean(isRotating) === Boolean(this.effects.slowRotate.isActive())) { return }
    if (isRotating) {
      this.effects.slowRotate.play();
    } else {
      this.effects.slowRotate.pause();
    }
  }
  // #endregion ▄▄▄▄▄ Animation ▄▄▄▄▄

  // #region ████████ XItems: Managing Contained XItems ████████ ~
  get pathMap() {
    // Incorporates the weights of all items and returns a Map of [item]: [pathPos] in order of slots
    if (!this._pathMap) { this.drawPathMap() }
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
      console.log(this.slots);
    }
    this.drawPathMap();
    return item;
  }
  swapItem(newItem, oldItem) {
    oldItem = oldItem ?? this.slots.find((slotItem) => slotItem.snapTarget === newItem);
    const index = this.slots.findIndex((slotItem) => slotItem === oldItem);
    if (U.isPosInt(index)) {
      this.slots[index] = newItem;
    } else {
      throw new Error(`${oldItem.name} not found in ${this.name}: ${newItem.name} NOT swapped in.`);
    }
    this.drawPathMap();
    return oldItem;
  }
  removeItem(item) {
    if (this.slots.includes(item)) {
      this._slots = this.slots.filter((slotItem) => slotItem !== item);
    } else {
      throw new Error(`${item.name} not found in ${this.name}`);
    }
    this.drawPathMap();
    return item;
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
  async createSnapPoint(targetItem, targetPoint) {
    targetPoint = this.getPosOnCircle(targetItem, targetPoint);
    delete targetPoint.pathPos;
    delete targetPoint.angle;
    const snapItem = this.addItem(new XSnap(targetItem, {parent: this, properties: targetPoint}), this.getNearestSlot(targetItem, targetPoint));
    this.distributeSlots(0.25);
    return snapItem;
  }
  async catchThrownItem(targetItem) {
    // Pause rotation
    this._toggleSlowRotate(false);
    // Open snap point facing thrown item AND absolute angle
    const {x, y} = this.getPosOnCircle(targetItem);
    // const dbItem = this.addItem(new XSnap(targetItem, {parent: this, properties: {x, y}}), this.getNearestSlot(targetItem, {x, y}));
    // gsap.set(dbItem, {background: "purple"});
    // dbItem.parent = XElem.CONTAINER;
    const snapItem = this.createSnapPoint(targetItem);
    const catchAngle = this.getAbsAngleTo(targetItem, {x: targetItem.dragger.endX, y: targetItem.dragger.endY});
    const {duration} = targetItem.dragger.tween;
    gsap.to(this.elem, {
      rotation: catchAngle,
      duration: 1,
      ease: "expo4.out",
      callbackScope: this,
      onUpdate() {
        this.slots.forEach((item) => item.straighten?.());
      }
    });
    // Determine absolute angle to item's snap point
    // Get how much time is left in the throw tween
    // Rotate so snap point is at snap coords
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