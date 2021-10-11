/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Oct 09 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

// ████████ IMPORTS ████████
// ▮▮▮▮▮▮▮ GreenSock ▮▮▮▮▮▮▮
import gsap, {
  Draggable as Dragger,
  InertiaPlugin,
  MotionPathPlugin
} from "/scripts/greensock/esm/all.js";

// ▮▮▮▮▮▮▮ Utilities ▮▮▮▮▮▮▮
import U from "../helpers/utilities.mjs";

// ████████ CLASSES ████████
// ░░░░░░░ RollCircle ░░░░░░░
class RollCircle {
  // ████████ STATIC ████████
  // ░░░░░░░[Getters]░░░░ Basic Data Retrieval ░░░░░░░
  static get REGISTRY() { return (this._REGISTRY = this._REGISTRY ?? {}) }
  static get ALL() { return Object.values(this.REGISTRY) }
  static get SnapPoints() { return Object.values(this._SnapPoints ?? {}).flat() }
  static GetClosestTo(die) {
    let targetCircle, minDistance = Infinity;
    this.ALL.forEach((circle) => {
      const thisDistance = circle._getDistanceTo(die);
      if (thisDistance < minDistance) {
        targetCircle = circle;
        minDistance = thisDistance;
      }
    });
    return targetCircle;
  }
  // ========== Enumeration Objects ===========
  static get TYPES() {
    return {
      basic: "basic",
      purple: "purple"
    };
  }

  // ========== DOM Elements ===========
  static get CONTAINER() { return (this._CONTAINER = this._CONTAINER ?? $("#rollCircleContainer")[0] ?? this.CreateContainer()) }

  // ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░
  static CreateContainer() { return $("<div id=\"rollCircleContainer\" />").appendTo(".vtt.game")[0] }
  static NameCircle(circle) {
    const nameTest = new RegExp(`${this._owner}_${this._type}_`);
    const circleNum = parseInt(Object.keys(RollCircle.REGISTRY).filter((key) => nameTest.test(key)).pop()?.match(/_(\d+)$/)
      ?.pop() ?? 0) + 1;
    circle._name = `${circle._owner}_${circle._type}_${circleNum}`;
  }
  static Register(circle) {
    this._SnapPoints = this._SnapPoints ?? {};
    this._SnapPoints[circle.name] = circle.snap.points;
    return (this.REGISTRY[circle.name] = circle);
  }
  static Unregister(circle) { delete this.REGISTRY[circle.name] }
  static Kill(circle) {
    circle.killAll();
    this.Unregister(circle);
  }

  // ████████ CONSTRUCTOR ████████
  constructor(x, y, radius, options) {
    this._owner = options?.owner ?? U.GMID;
    this._type = options?.type ?? RollCircle.TYPES.basic;

    RollCircle.NameCircle(this);

    this._id = `rollCircle-${this.name}`;
    this._create(x, y, radius, ["roll-circle", `type-${this.type}`]);

    RollCircle.Register(this);
  }

  // ████████ GETTERS & SETTERS ████████
  // ░░░░░░░ Read-Only ░░░░░░░
  get x() { return U.get(this.elem, "x") }
  get y() { return U.get(this.elem, "y") }
  get height() { return U.get(this.elem, "height") }
  get width() { return U.get(this.elem, "width") }
  get radius() { return (this.height + this.width) / 4 }
  get type() { return this._type }
  get owner() { return game.users.get(this._owner) }

  get name() { return this._name }
  get id() { return this._id }
  get elem() { return (this._rollCircle = this._rollCircle ?? $(`#${this.id}`)?.[0]) }

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
        return new Array(35).fill(null).map((_, i) => MotionPathPlugin.convertCoordinates(
          circle.elem,
          RollCircle.CONTAINER,
          MotionPathPlugin.getPositionOnPath(
            this.path,
            gsap.utils.mapRange(0, 360, 0, 36, i)
          )
        ));
      }
    };
  }

  get slots() { return (this._slots = this._slots ?? []) }
  get dice() { return this.slots.filter((die) => die instanceof OREDie) }
  get readiedDice() { return (this._readiedDice = this._readiedDice ?? []) }

  // ░░░░░░░ Writeable ░░░░░░░
  get rotation() { return U.get(this.elem, "rotation") }
  set rotation(v) {
    if (/^[+-]=/.test(`${v}`)) {
      v = this.rotation + parseFloat(`${v}`.replace(/=/g, ""));
    }
    U.set(this.elem, {rotation: v});
  }

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░
  _create(x, y, radius, cssClasses = []) {
    [this._rollCircle] = $(`
    <div id="${this.id}" class="${cssClasses.join(" ")}" style="height: ${2 * radius}px; width: ${2 * radius}px;">
      <svg height="100%" width="100%">
        <circle cx="${radius}" cy="${radius}" r="${radius}" stroke="none" />
        <circle id="${this.snap.id}" class="snap-circle" cx="${radius}" cy="${radius}" r="${radius * 0.8}" fill="none" stroke="none" />
      </svg>
    </div>
    `).appendTo(RollCircle.CONTAINER);
    console.log(this);
    MotionPathPlugin.convertToPath(`#${this.snap.id}`);
    [this._snapCircle] = $(`#${this.snap.id}`);
    this._rawSnapPath = MotionPathPlugin.getRawPath(this.snap.elem);
    MotionPathPlugin.cacheRawPathMeasurements(this.snap.path);
    this._setCircle({xPercent: -50, yPercent: -50, x, y});
    this._setSnapCircle({xPercent: -50, yPercent: -50});
    this._toggleSlowRotate(true);
  }

  // ░░░░░░░[Elements]░░░░ Managing Core Circle Elements ░░░░░░░
  _setCircle(params) { U.set(this.elem, params) }
  _setSnapCircle(params) { U.set(this.snap.elem, params) }

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
          this.dice.forEach((die) => die.straighten());
        }
      });
    } else {
      this._isSlowRotating.kill();
      delete this._isSlowRotating;
    }
  }

  // ░░░░░░░[Dice]░░░░ Managing Orbiting Dice ░░░░░░░
  _getAbsAngleTo({x, y}) { return U.getAngle({x: this.x, y: this.y}, {x, y}) }
  _getRelAngleTo({x, y}) { return U.cycle(this._getAbsAngleTo({x, y}) - this.rotation + 180, -180, 180) }
  _getDistanceTo({x, y}) { return U.getDistance({x: this.x, y: this.y}, {x, y}) }
  _getPosOnPath(pathPos) {
    const {x, y, angle} = MotionPathPlugin.getPositionOnPath(this.snap.path, pathPos, true);
    return {x, y, angle, pathPos};
  }
  _getDieSlot(die, slots) {
    let slot = -1;
    if (die instanceof OREDie) {
      if (slots) {
        slot = slots.findIndex((slotDie) => die.name === slotDie?.name);
      } else {
        const angle = this._getRelAngleTo(die);
        const pathPos = gsap.utils.normalize(-180, 180, angle);
        slot = this.slots.findIndex((v, i, a) => i / a.length >= pathPos);
        if (slot === -1) { slot = this.slots.length - 1 }
        if (slot > 0
          && ((slot / this.slots.length) - pathPos) > (pathPos - ((slot - 1) / this.slots.length))) {
          slot--;
        }
      }
    }
    return slot >= 0 ? slot : false;
  }
  _getDiePos(die, slots) {
    const slotNum = this._getDieSlot(die, slots);
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
    } else if (ref instanceof OREDie) {
      return slots.filter((slot) => !(slot instanceof OREDie)
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
  async _redistributeDice(newSlots, duration = 1) {
    // newSlots = newSlots ?? this.slots; <-- Won't work unless _getDiePos can get actual path position
    if (
      newSlots.map((item) => (item instanceof OREDie ? item.name : item)).join("")
      === this.slots.map((item) => (item instanceof OREDie ? item.name : item)).join("")
    ) { return Promise.resolve() }

    const oldSlots = [...this.slots];
    this._slots = [...newSlots];

    const oldPositions = Object.fromEntries(this.dice.map((die) => [die.id, this._getDiePos(die, oldSlots)]));
    const newPositions = Object.fromEntries(this.dice.map((die) => [die.id, this._getDiePos(die, this.slots)]));

    const circle = this;

    return Promise.allSettled(this.dice
      .map((die) => new Promise((resolve, reject) => {
        const oldPathPos = oldPositions[die.id]?.pathPos ?? 0;
        const newPathPos = newPositions[die.id].pathPos;
        gsap.to(die.elem, {
          motionPath: {
            path: circle.snap.elem,
            alignOrigin: [0.5, 0.5],
            start: oldPathPos,
            end: newPathPos,
            fromCurrent: die.id in oldPositions
          },
          duration,
          ease: "power4.out",
          onComplete: resolve,
          onInterrupt: reject
        });
      })));
  }
  async _openSnapPoint(die) {
    if (die instanceof OREDie) {
      const snapPointName = `SNAP-${die.name}`;
      const snapSlot = this._getDieSlot(die);
      if (this.slots[snapSlot] === snapPointName) { return Promise.resolve() }

      if (this.slots.includes(snapPointName)) {
        await this._closeSnapPoint(die);
        return this._openSnapPoint(die);
      }

      return this._redistributeDice(this._getSlotsPlus(snapPointName, snapSlot));
    }
    return Promise.reject();
  }
  async _closeSnapPoint(snapPointName) {
    if (snapPointName === "ALL") {
      return this._redistributeDice(this.dice);
    }
    if (snapPointName instanceof OREDie) {
      snapPointName = `SNAP-${snapPointName.name}`;
    }
    if (!this.slots.includes(snapPointName)) {
      return Promise.resolve();
    }

    return this._redistributeDice(this._getSlotsWithout(snapPointName));
  }

  // ████████ PUBLIC METHODS ████████
  // ░░░░░░░[Getters]░░░░ Data Retrieval ░░░░░░░

  // ░░░░░░░ SETTERS ░░░░░░░
  set(params) { this._setCircle(params) }

  // ░░░░░░░[Dice]░░░░ Adding & Removing OREDice ░░░░░░░

  killDie(die) {
    this._redistributeDice(this._getSlotsWithout(die));
    die.kill();
  }
  killAll() {
    this.dice.forEach(this.killDie);
    delete this._slots;
  }

  async addDice(numDice = 1) {
    const circle = this;
    const newDice = new Array(numDice).fill(null).map(() => new OREDie(circle));
    return this._redistributeDice(this._getSlotsPlus(newDice));
  }
  async pluckDie(die) {
    if (die instanceof OREDie && this.slots.includes(die)) {
      await this._redistributeDice(this._getSlotsWithout(die));
      this.readyDie(die);
    }
  }
  async readyDie(die) {
    console.log(`Readying ${die.name}`);
    if (this.readiedDice.filter((rDie) => die.name === rDie.name).length) { return }
    this.readiedDice.push(die);
    console.log("... Readied, Starting Watch");
    this.watchDice();
  }
  async watchDice() {
    console.log("Watching ...");
    if (this._isWatching) { return }
    this._isWatching = this.readiedDice.length > 0;
    const circle = this;
    let start, prevTime;
    async function step(timestamp) {
      if (circle._isWatching && circle.readiedDice.length > 0) {
        start = start ?? (timestamp - 1000);
        const elapsed = timestamp - start;
        if (prevTime !== timestamp && Math.floor(elapsed / 200)) {
          let newSlots = [...circle.slots],
              isChangingSlots = false;
          circle.readiedDice.forEach((die) => {
            const snapPointName = `SNAP-${die.name}`;
            const newSlot = circle._getDieSlot(die);
            const oldSlot = newSlots.findIndex((slot) => slot === snapPointName);
            if (newSlot !== oldSlot) {
              isChangingSlots = true;
              newSlots = circle._getSlotsPlus(snapPointName, newSlot, circle._getSlotsWithout(snapPointName, newSlots));
            }
          });
          if (isChangingSlots) {
            circle._redistributeDice(newSlots, 0.25);
          }
        }
        prevTime = timestamp;
        window.requestAnimationFrame(step);
      } else {
        console.log("No dice to watch.");
        circle._isWatching = false;
      }
    }
    console.log(`... ${this.readiedDice.length} Dice.`);
    window.requestAnimationFrame(step);
  }
  unreadyDie(die) {
    if (die instanceof OREDie) {
      this._readiedDice = this._readiedDice.filter((rDie) => rDie.name !== die.name);
      this._closeSnapPoint(die);
    }
  }

  /* watchDie(die, snapSlot) {
    if (die.name === this._watchDie?.name) { return }
    this._toggleSlowRotate(false);
    this._watchDie = die;
    this._watchSlot = snapSlot;
    this._watchAngle =
    const circle = this;
    let start, prevTime;
    function step(timestamp) {
      if (circle._watchDie?.isDragging) {
        start = start ?? (timestamp - 1000);
        const elapsed = timestamp - start;
        if (prevTime !== timestamp && Math.floor(elapsed / 200)) {
          const newRotation = circle._getAbsAngleTo(circle._watchDie);
          const angleDelta = parseInt(U.getAngleDelta(circle.rotation, newRotation));
          gsap.to(circle.elem, {
            rotation: `${angleDelta < 0 ? "-" : "+"}=${Math.abs(angleDelta)}`,
            duration: 1,
            ease: "sine",
            callbackScope: circle,
            onUpdate() {
              this.dice.forEach((_die) => _die.straighten());
            }
          });
        }
        prevTime = timestamp;
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);
  } */
  catchDie(die) {
    if (die.isThrowing) {
      const {endX: x, endY: y} = die.dragger;

    }

    if (die.isThrowing) {
      const {tween: throwTween, endX: x, endY: y} = die.dragger;
      const duration = throwTween.duration() - throwTween.time();
      const rotation = this._getAbsAngleTo({x, y});
      gsap.to(this.elem, {
        rotation,
        duration,
        ease: "power4.out",
        callbackScope: this,
        onUpdate() {
          this.dice.forEach((_die) => _die.straighten());
        },
        onComplete() {
          die.circle = this;
          die.straighten();
          this.unreadyDie(die);
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

// ░░░░░░░ OREDie ░░░░░░░
class OREDie {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  // ░░░░░░░[Getters]░░░░ Basic Data Retrieval ░░░░░░░
  static get REGISTRY() { return (this._REGISTRY = this._REGISTRY ?? {}) }

  // ========== Enumeration Objects ===========
  static get TYPES() {
    return {
      basic: "basic",
      openSpace: "slot-space"
    };
  }

  // ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░
  static Register(die) { this.REGISTRY[die.name] = die }
  static Unregister(die) { delete this.REGISTRY[die.name] }

  // ████████ CONSTRUCTOR ████████
  constructor(homeCircle, type, options) {
    type = type ?? options?.type ?? OREDie.TYPES.basic;
    if (!Object.values(OREDie.TYPES).includes(type)) {
      throw new Error(`Invalid Die Type: ${type}`);
    }
    this._type = type;

    // Options
    this._owner = options?.owner ?? homeCircle.owner.id;

    const nameTest = new RegExp(`${this._owner}_${this._type}_`);
    this._name = `${this._owner}_${this._type}_${Object.keys(OREDie.REGISTRY).filter((key) => nameTest.test(key)).length + 1}`;
    OREDie.Register(this);
    this._create();
    this.circle = homeCircle;
    this._createDragger();
  }

  // ████████ GETTERS & SETTERS ████████
  // ░░░░░░░ Read-Only ░░░░░░░
  get x() { return U.get(this.elem, "x") }
  get y() { return U.get(this.elem, "y") }
  get rotation() { return U.get(this.elem, "rotation") }

  get owner() { return game.users.get(this._owner) }
  get name() { return this._name }
  get id() { return `die-${this.name}` }
  get elem() { return this._elem }
  get sel() { return `#${this.id}` }

  get parent() { return this._parent }
  set parent(v) {
    const [elem] = $(`#${v?.id ?? "noElemFound"}`);
    if (elem) {
      this._parent = v;
      const {x, y} = MotionPathPlugin.convertCoordinates(this.elem, elem, {x: this.x, y: this.y});
      this.set({x, y});
      $(this.elem).appendTo(elem);
      this.straighten();
      if (this.dragger) {
        this.dragger.update(false, this.isDragging);
      }
    }
  }

  get circle() { return this.parent instanceof RollCircle ? this.parent : undefined }
  set circle(v) {
    if (v instanceof RollCircle) {
      this.parent = v;
    } else {
      throw new Error(`'${v}' is not a RollCircle`);
    }
  }
  get snapPoints() { return this.circle?.snap.points }
  /*
    this._parent = this._parent ?? {};
    const die = this;
    return {
      get id() { return die._parent.id },
      get elem() { return die._parent.elem },
      get circle() { return die._parent.circle },
    };
  }
  */
  get dragger() { return this._dragger }
  get isThrowing() { return this.dragger?.isThrowing }
  get isDragging() { return this._isDragging && !this.isThrowing }
  get isMoving() { return this.isDragging || this.isThrowing }

  // ░░░░░░░ Writeable ░░░░░░░
  get homeCircle() { return this._homeCircle }
  get type() { return this._type }
  set type(v) {
    $(this.sel)
      .removeClass(`ore-${this.type}`)
      .addClass(`ore-${v}`);
    this._type = v;
  }

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░
  _create() {
    [this._elem] = $(`<div id="${this.id}" class="ore-die ore-${this.type}">X</div>`).appendTo(RollCircle.CONTAINER);
    this.set({xPercent: -50, yPercent: -50});
  }

  _createDragger() {
    const die = this;
    [this._dragger] = Dragger.create(
      this.elem,
      {
        type: "x,y",
        inertia: true,
        callbackScope: this,
        minDuration: 2,
        throwResistance: 100,
        onDragStart() {
          this._isDragging = true;
          this.closestCircle = this.circle ?? RollCircle.GetClosestTo(this);
          this.parent = RollCircle.CONTAINER;
          this.closestCircle.pluckDie(this);
        },
        onDrag() {
          const closestCircle = RollCircle.GetClosestTo(this);
          if (closestCircle?.name !== this.closestCircle?.name) {
            this.closestCircle.unreadyDie(this);
            this.closestCircle = closestCircle;
            this.closestCircle.readyDie(this);
          }
        },
        snap: {
          get points() {
            // const closestCircle = RollCircle.GetClosestTo({x: die.dragger.endX, y: die.dragger.endY});
            /* console.log([
              "SNAP",
              closestCircle.type,
              closestCircle.snap.points[0],
              {x: die.x, y: die.y},
              {endX: die.dragger.endX, endY: die.dragger.endY}
            ]); */
            /* if (closestCircle?.name !== die.closestCircle?.name) {
              die.closestCircle = closestCircle;
            } */
            return RollCircle.SnapPoints;
          }
        },
        onDragEnd() {
          this._isDragging = false;
          const closestCircle = RollCircle.GetClosestTo({x: this.dragger.endX, y: this.dragger.endY});
          if (closestCircle?.name !== this.closestCircle?.name) {
            this.closestCircle.unreadyDie(this);
            this.closestCircle = closestCircle;
            this.closestCircle.readyDie(this);
          }
          this.closestCircle.catchDie(this);
          
        }
      }
    );
  }

  // ░░░░░░░[Elements]░░░░ Managing Die Element ░░░░░░░

  // ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░

  // ████████ PUBLIC METHODS ████████
  set(params) { U.set(this.elem, params) }

  kill() {
    OREDie.Unregister(this);
    $(`#${this.id}`).remove();
  }
  // ░░░░░░░ Animation ░░░░░░░
  straighten() {
    if (this.circle) {
      U.set(this.elem, {rotation: -1 * this.circle.rotation});
    } else {
      U.set(this.elem, {rotation: 0});
    }
  }

}

// ████████ EXPORTS ████████
// ▮▮▮▮▮▮▮ Default Export ▮▮▮▮▮▮▮
export default () => {
  const rollCircles = [];
  gsap.registerPlugin(Dragger, InertiaPlugin, MotionPathPlugin);
  [
    // [3, 45, 100, 100, 100, {type: "lime"}],
    // [7, -45, 1370, 100, 100, {type: "cyan"}],
    // [11, 0, 100, 729, 100, {type: "pink"}],
    // [15, 270, 1370, 729, 100, {type: "yellow"}],
    [15, 0, 635, 314, 100, {type: "purple"}]
  ].forEach(([numDice, startAngle, ...args]) => {
    const rollCircle = new RollCircle(...args);
    rollCircle.set({rotation: startAngle});
    rollCircle.addDice(numDice);
    rollCircle.dbShow();
    rollCircles.push(rollCircle);
  });
  return rollCircles;
};