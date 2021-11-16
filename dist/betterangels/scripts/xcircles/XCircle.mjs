/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌█████████████████████ MIT License █ v0.0.1-prealpha █  ████████████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

// ████████ IMPORTS ████████
import {
	// ▮▮▮▮▮▮▮[External Libraries]▮▮▮▮▮▮▮
	gsap, Dragger, InertiaPlugin, MotionPathPlugin, RoughEase, // GreenSock Animation Platform
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

	// ████████ CONSTRUCTOR ████████
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

		this._toggleSlowRotate(true);
	}

	get rotation() { return super.rotation }
	set rotation(v) {
		super.rotation = v;
		this.slots.forEach((item) => item.straighten?.());
	}
	get slots() { return (this._slots = this._slots ?? []) }

	// ████████ Animation: Animation Effects, Tweens, Timelines ████████
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

	// ████████ XItems: Managing Contained XItems ████████
	get pathMap() {
		// Incorporates the weights of all items and returns a Map of [item]: [pathPos] in order of slots
		this._pathMap = new Map();
		let totalWeights = 0;
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
		return this._pathMap;
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
		}
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

	async distributeSlots(duration = 0.5, ease) {
		const newPositions = this.getSlotPathPositions();
		return Promise.allSettled(this.slots
			.map((item, i) => item.setPathPos(newPositions[i], duration, ease)));
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
	}
	async catchThrownItem(targetItem) {
		// Pause rotation
		this._toggleSlowRotate(false);

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
		const fullRotator = this.rotation > 400 ? -360 : 360;
		gsap.to(this.elem, {
			rotation: rotation + 4 * fullRotator,
			duration,
			ease: "expo4.inOut",
			callbackScope: this,
			onUpdate() {
				this.slots.forEach((item) => item.straighten?.());
			}
		});
		gsap.to(`#${this.id} > svg`, {
			scale: 1.5,
			opacity: 0.75,
			rotation: rotation - 2 * fullRotator,
			duration: duration * 0.5,
			ease: "sine.inOut"
		});
		gsap.to(`#${this.id} > svg`, {
			scale: 0.5,
			opacity: 1,
			rotation: rotation - fullRotator,
			duration: duration * 0.25,
			delay: duration * 0.5,
			ease: "sine.inOut"
		});
		gsap.to(`#${this.id} > svg`, {
			scale: 1,
			rotation: rotation - fullRotator,
			duration: duration * 0.25,
			delay: duration * 0.75,
			ease: "sine.inOut"
		});
	}
	async grabThrownItem(targetItem) {
		const oldSnap = this.swapItem(targetItem).kill();
		this.distributeSlots(5, "sine.inOut");
		this._toggleSlowRotate(true);
		// oldSnap.kill();
	}
}