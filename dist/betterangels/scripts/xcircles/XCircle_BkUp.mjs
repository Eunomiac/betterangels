/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌█████████████████████ MIT License █ v0.0.1-prealpha █  ████████████████████▐     *|
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
	MIX, HasSnapPath
} from "../helpers/bundler.mjs";

export default class XCircle extends MIX(XElem).with(HasSnapPath) {
	// ████████ STATIC: Static Getters, Setters, Methods ████████
	// ░░░░░░░[Enumerables]░░░░ Class Subtypes ░░░░░░░
	static get TYPES() {
		return {
			...super.TYPES,
			pink: "pink",
			yellow: "yellow",
			cyan: "cyan",
			purple: "purple"
		};
	}
	// ░░░░░░░[Defaults]░░░░ Overrides of XElem Defaults ░░░░░░░
	static get DEFAULT_DATA() {
		return {
			...super.DEFAULT_DATA,
			CLASSES: [...super.DEFAULT_DATA.CLASSES, "x-circle"],
			PREFIX: "xCircle"
		};
	}
	// ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░
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

	// ████████ CONSTRUCTOR ████████
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

		this._toggleSlowRotate(true);
	}

	// ████████ GETTERS & SETTERS ████████
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

	// ████████ PRIVATE METHODS ████████
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

	// ████████ PUBLIC METHODS ████████

	// ░░░░░░░[Items]░░░░ Contained Item Management ░░░░░░░
	// ========== Adding / Removing ===========
	async addDice(numDice = 1, type = undefined) {
		const newDice = [...Array(numDice)].map(() => new XDie({parent: this, type}));
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