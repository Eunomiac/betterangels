
// #region ████████ IMPORTS ████████ ~
// #region ▮▮▮▮▮▮▮ GreenSock ▮▮▮▮▮▮▮ ~
import gsap, {
  Draggable as Dragger,
  InertiaPlugin,
  MotionPathPlugin
} from "/scripts/greensock/esm/all.js"; // eslint-disable-line import/no-unresolved
// #endregion ▮▮▮▮[GreenSock]▮▮▮▮

// #region ▮▮▮▮▮▮▮ Utilities ▮▮▮▮▮▮▮ ~
import U from "../helpers/utilities.mjs";
// #endregion ▮▮▮▮[Utilities]▮▮▮▮
// #endregion ▄▄▄▄▄ IMPORTS ▄▄▄▄▄

// #region ████████ CLASSES ████████
// #region ░░░░░░░ RollCircle ░░░░░░░ ~
class RollCircle {
  // #region ████████ STATIC ████████ ~
  // #region ░░░░░░░[Getters]░░░░ Basic Data Retrieval ░░░░░░░ ~
  static get REGISTRY() { return (this._REGISTRY = this._REGISTRY ?? {}) }

  // #region ========== Enumeration Objects =========== ~
  static get TYPES() {
    return {
      basic: "basic"
    };
  }
  // #endregion _______ Enumeration Objects _______
  // #region ========== DOM Elements =========== ~
  static get CONTAINER() { return (this._CONTAINER = this._CONTAINER ?? $("#rollCircleContainer")[0] ?? this.CreateContainer()) }
  // #endregion _______ DOM Elements _______

  // #endregion ░░░░[Getters]░░░░
  // #region ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░ ~
  static CreateContainer() {
    return $("<div id=\"rollCircleContainer\" />").appendTo(".vtt.game")[0];
  }
  static Register(circle) { this.REGISTRY[circle.name] = circle }
  static Unregister(circle) { delete this.REGISTRY[circle.name] }
  static Kill(circle) {
    circle.killAll();
    this.Unregister(circle);
  }
  // #endregion ░░░░[Methods]░░░░
  // #endregion ▄▄▄▄▄ STATIC ▄▄▄▄▄

  // #region ████████ CONSTRUCTOR ████████ ~
  constructor(x, y, radius, cssClasses = [], options) {
    this._x = x;
    this._y = y;
    this._r = radius;
    this._cssClasses = ["roll-circle", ...[cssClasses].flat()];

    // Options
    this._owner = options?.owner ?? U.GMID;
    this._type = options?.type ?? RollCircle.TYPES.basic;

    const nameTest = new RegExp(`${this._owner}_${this._type}_`);
    this._indexNum = Object.keys(RollCircle.REGISTRY).filter((key) => nameTest.test(key)).length + 1;
    this._name = `${this._owner}_${this._type}_${this._indexNum}`;
    this._shortName = `RC-${this.owner.name}-${this._type}_${this._indexNum}`;
    this._id = `rollCircle-${this.name}`;

    RollCircle.Register(this);
    this._create();
  }
  // #endregion ▄▄▄▄▄ CONSTRUCTOR ▄▄▄▄▄

  // #region ████████ GETTERS & SETTERS ████████ ~
  // #region ░░░░░░░ Read-Only ░░░░░░░ ~
  get x() { return this._x }
  get y() { return this._y }
  get radius() { return this._r }
  get height() { return this.radius * 2 }
  get width() { return this.radius * 2 }
  get rotation() { return U.get(this.elem, "rotation") }
  get type() { return this._type }
  get owner() { return game.users.get(this._owner) }

  get name() { return this._name }
  get shortName() { return this._shortName }
  get id() { return this._id }
  get sel() { return `#${this.id}` }
  get elem() { return this._rollCircle }

  get snap() {
    const circle = this;
    return {
      get id() { return `${circle.id}-snap` },
      get sel() { return `#${circle.id}` },
      get elem() { return circle._snapCircle },
      get path() { return circle._rawSnapPath },
      get point() { return MotionPathPlugin.convertCoordinates(circle.elem, RollCircle.CONTAINER, MotionPathPlugin.getPositionOnPath(circle.snap.path, 0)) }
    };
  }

  get diceLine() { return (this._childDice = this._childDice ?? []) }
  get numSlots() { return this.diceLine.length }
  get dice() { return this.diceLine.filter((die) => die instanceof OREDie && die.type !== OREDie.TYPES.openSpace) }
  get numDice() { return this.dice.length }
  get numBlanks() { return this.numSlots - this.numDice }

  // #endregion ░░░░[Read-Only]░░░░
  // #endregion ▄▄▄▄▄ GETTERS & SETTERS ▄▄▄▄▄

  // #region ████████ PRIVATE METHODS ████████ ~
  // #region ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░ ~
  _create() {
    [this._rollCircle] = $(`
    <div id="${this.id}" class="${this._cssClasses.join(" ")}" style="height: ${this.height}px; width: ${this.width}px;">
      <svg height="100%" width="100%">
        <circle cx="${this.radius}" cy="${this.radius}" r="${this.radius}" stroke="none" />
        <circle id="${this.snap.id}" class="snap-circle" cx="${this.radius}" cy="${this.radius}" r="${this.radius * 0.8}" fill="none" stroke="none" />
      </svg>
    </div>
    `).appendTo(RollCircle.CONTAINER);
    MotionPathPlugin.convertToPath(this.snap.sel);
    [this._snapCircle] = $(this.snap.sel);
    this._rawSnapPath = MotionPathPlugin.getRawPath(this.snap.sel);
    MotionPathPlugin.cacheRawPathMeasurements(this.snap.path);
    this._setCircle({xPercent: -50, yPercent: -50, x: this.x, y: this.y});
    this._setSnapCircle({xPercent: -50, yPercent: -50});
    this._toggleSlowRotate(true);
  }
  // #endregion ░░░░[Initializing]░░░░

  // #region ░░░░░░░[Elements]░░░░ Managing Core Circle Elements ░░░░░░░ ~
  _setCircle(params) { U.set(this.elem, params) }
  _setSnapCircle(params) { U.set(this.snap.elem, params) }
  // #endregion ░░░░[Elements]░░░░

  // #region ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░ ~
  _toggleSlowRotate(isRotating) {
    if (isRotating) {
      gsap.to(this.sel, {
        rotation: "+=360",
        duration: 100,
        repeat: -1,
        ease: "none",
        callbackScope: this,
        onUpdate() {
          this.diceLine.forEach((die) => die.straighten());
        }
      });
    } else {
      gsap.killTweensOf(this.sel, "rotation");
    }
  }
  // #endregion ░░░░[Animation]░░░░

  // #region ░░░░░░░[Dice]░░░░ Managing Orbiting Dice ░░░░░░░ ~
  _getAngleToDie(die) {

    return U.getAngle({x: this.x, y: this.y}, {x: die.x, y: die.y});
  }

  _addNewDie(die) {
    if (die instanceof OREDie) {
      // U.set(die.sel, {opacity: 0});
      this._redistributeDice([...this.diceLine, die]);
      this._childDice = [...this.diceLine, die];
      gsap.to(die.sel, {
        opacity: 1,
        duration: 0.2,
        delay: 0.2
      });
    }
  }
  _openSnapPoint() {
    this._redistributeDice(["SNAPPOINT", ...this.diceLine]);
  }

  _closeSnapPoint() {
    this._redistributeDice(this.diceLine, ["SNAPPOINT", ...this.diceLine]);
  }

  _catchThrownDie(die) {
    if (die.isThrowing) {
      const {tween: throwTween} = die.dragger;
      const tweenDur = throwTween.duration();
      const tweenTime = throwTween.time();
      const timeLeft = tweenDur - tweenTime;
    }
  }

  _pluckDie(die) {
    const slotNum = this._getDieSlot(die);
    const curPositions = [...this.diceLine];
    if (slotNum) {
      curPositions[slotNum] = "BLANK";
    }
    this._childDice = [...this.diceLine.filter((slotDie) => slotDie.name !== die.name)];
    this._redistributeDice(this.diceLine, curPositions);
  }

  _deleteDie(die) {
    this._pluckDie(die);
    die.kill();
  }

  _getDieSlot(die, diceLine) {
    diceLine = diceLine ?? this.diceLine;
    let dieSlot;
    if (die instanceof OREDie) {
      dieSlot = diceLine.findIndex((slotDie) => die.name === slotDie.name);
    } else if (diceLine.filter((slotDie) => slotDie === die).length <= 1) {
      dieSlot = diceLine.findIndex((slotDie) => slotDie === die);
    } else {
      throw new Error(`[${this.shortName}] Multiple '${die?.name ?? die}' in '[${diceLine.map((slotDie) => slotDie?.name ?? slotDie).join(" ")}'`);
    }

    if (dieSlot >= 0) {
      return dieSlot;
    } else {
      return false;
    }
  }

  _getPosOnPath(pathPos) {
    const {x, y, angle} = MotionPathPlugin.getPositionOnPath(this.snap.path, pathPos, true);
    return {x, y, angle, pathPos};
  }

  _getDiePos(die, diceLine) {
    // Returns the position (0 - 1) along the path the die is currently claiming, or,
    // if an array showing the new positions of all dice in a new diceLine is given,
    // the position of the die in that diceLine.
    diceLine = diceLine ?? this.diceLine;
    const slotNum = this._getDieSlot(die, diceLine);
    if (slotNum !== false) {
      const {x, y, angle, pathPos} = this._getPosOnPath(slotNum / diceLine.length);
      return {x, y, angle, pathPos, slot: slotNum};
    } else {
      return false;
      // throw new Error(`[${this.shortName}] No '${die?.name ?? die}' in '[${diceLine.map((die) => die?.name ?? die).join(" ")}'`);
    }
  }

  _initDiePos(die) {
    const {x, y, slot} = this._getDiePos(die);
    /*DEVCODE*/
    die.set({x, y, innerText: `${slot}`});
    return;
    /*!DEVCODE*/
    die.set({x, y});
  }

  _redistributeDice(newDiceline, oldDiceline) {
    // Submit an empty array to oldDiceLine to have all dice initialized at path position 0.
    oldDiceline = oldDiceline ?? this.diceLine;
    newDiceline = newDiceline ?? this.diceLine;
    const oldPositions = Object.fromEntries(oldDiceline.map((die) => [die.id, this._getDiePos(die, oldDiceline)]));
    const newPositions = Object.fromEntries(newDiceline.map((die) => [die.id, this._getDiePos(die, newDiceline)]));
    newDiceline.forEach((die) => {
      if (die instanceof OREDie) {
        const oldPathPos = oldPositions[die.id]?.pathPos ?? 0;
        const newPathPos = newPositions[die.id].pathPos;
        /*DEVCODE*/
        die.set({innerText: `${newPositions[die.id].slot}`});
        /*!DEVCODE*/
        gsap.to(die.sel, {
          motionPath: {
            path: this.snap.sel,
            alignOrigin: [0.5, 0.5],
            start: oldPathPos,
            end: newPathPos,
            fromCurrent: die.id in oldPositions
          },
          duration: 0.2,
          ease: "power4.inOut"
        });
      }
    });
  }
  // #endregion ░░░░[Dice]░░░░
  // #endregion ▄▄▄▄▄ PRIVATE METHODS ▄▄▄▄▄

  // #region ████████ PUBLIC METHODS ████████ ~
  // #region ░░░░░░░[Getters]░░░░ Data Retrieval ░░░░░░░ ~

  // #endregion ░░░░[Getters]░░░░
  // #region ░░░░░░░ SETTERS ░░░░░░░ ~
  set(params) { this._setCircle(params) }
  // #endregion ░░░░[SETTERS]░░░░
  // #region ░░░░░░░[Dice]░░░░ Adding & Removing OREDice ░░░░░░░ ~
  addDie(die) {
    if (die instanceof OREDie) {
      // Adding an already-existing Die
      // Should be able to assume that it's already snapped to a blank-space die in orbit
      // Just need to kill the blank-space die after parenting the new die
    } else {
      this._addNewDie(new OREDie(this, die));
    }
  }
  pluckDie(die) {
    if (this.diceLine.includes(die)) {
      const oldPositions = this.diceLine.map((slotDie) => (slotDie.name === die.name ? "BLANK" : slotDie));
      const newPositions = ["OPEN", ...this.diceLine.filter((slotDie) => slotDie.name !== die.name)];
      this._redistributeDice(newPositions, oldPositions);
      this._watchDie(die);
    }
  }
  readyForDie(die) {
    if (this._readyDie?.name === die.name) { return }
    this._readyDie = die;
    // 1) Animate redistribution of dice so there's a spot at the zero point.
  }
  unreadyForDie() {

  }
  watchDie(die) {
    // If asked to watch a die that's already being watched, ignore the call.
    if (die.name === this._watchDie?.name) { console.log(`Already Watching ${die.name}`); return }
    this._watchDie = die;

    function trackDie() {
      const circle = this;
      let start, isFirstRun, prevTime;

      function step(timestamp) {
        if (circle._watchDie?.isDragging) {
          isFirstRun = !start;
          start = start ?? timestamp;
          const elapsed = timestamp - start;
          if (isFirstRun || (prevTime !== timestamp && Math.floor(elapsed / 100))) {
            const newRotation = circle._getAngleToDie(circle._watchDie);
            const angleDelta = parseInt(U.getAngleDelta(circle.rotation, newRotation));
            gsap.to(circle.sel, {
              rotation: `${angleDelta < 0 ? "-" : "+"}=${Math.abs(angleDelta)}`,
              duration: 0.2,
              ease: "none"
            });
          }
          prevTime = timestamp;
          window.requestAnimationFrame(step);
        }
      }

      window.requestAnimationFrame(step);
    }

    // Tween to face the die, then start tracking it until it isn't being dragged.
    gsap.to(this.sel, {
      rotation: this._getAngleToDie(this._watchDie),
      duration: 0.25,
      ease: "power4.out",
      onComplete: trackDie,
      callbackScope: this
    });
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

  // #endregion ░░░░[Dice]░░░░
  // #endregion ▄▄▄▄▄ PUBLIC METHODS ▄▄▄▄▄

  /*DEVCODE*/
  // #region ████████ TEST METHODS: For Debugging & Development ████████ ~
  get dbData() { return (this._dbData = this._dbData ?? {}) }
  get dbHTML() {
    const numCols = Object.values(this.dbData).length;
    const numRows = Object.values(this.dbData).reduce((maxRows, colData) => Math.max(maxRows, Object.values(colData).length), 0);
    const tableRows = new Array(numRows).fill("").map(() => [...new Array(numCols).fill("<td></td>")]);
    let col = 0;
    for (const colData of Object.values(this.dbData)) {
      let row = 0;
      for (const [label, data] of Object.entries(colData)) {
        tableRows[row][col] = `<td>${label}: ${`${data}`.slice(0, 5)}</td>`;
        row++;
      }
      col++;
    }
    return `<table><tbody>${
      tableRows.map((rowCells) => `<tr>${rowCells.join("")}</tr>`).join("\n")
    }</tbody></table>`;
  }
  get DISPLAY() {
    if (this._DISPLAY) {
      return this._DISPLAY;
    }
    [this._DISPLAY] = $(`<div id="${this.id}-DBdisplay" class="db-display">${this.dbHTML}</div>`)
      .appendTo(RollCircle.CONTAINER);
    U.set(this._DISPLAY, {xPercent: -50, x: this.x, y: this.y + 0.5 * this.height + 25});
    return this._DISPLAY;
  }
  get angleGuide() { return (this._angleGuide = this._angleGuide ?? {}) }

  updateDisplay() {
    U.set(this.DISPLAY, {innerHTML: this.dbHTML});
  }
  showDegrees() {
    this.hideDegrees();
    [0, 90, 180, 270].forEach((ang) => {
      const pathPos = gsap.utils.normalize(0, 360, ang);
      const {x, y, angle} = MotionPathPlugin.getPositionOnPath(this.snap.path, pathPos, true);
      [this.angleGuide[ang]] = $(`<div class="angle-marker">${parseInt(angle)}<br>${pathPos}</div>`).appendTo(this.elem);
      U.set(this.angleGuide[ang], {x, y, xPercent: -50, yPercent: -50, rotation: -1 * this.rotation});
    });
  }
  hideDegrees() { $(`${this.sel} .angle-marker`).remove() }
  dbShow() {
    this.showDegrees();
    this.dbUpdate();
  }
  dbHide() {
    this.hideDegrees();
    this._isDBActive = false;
    $(`${this.sel} .db-display`).remove();
  }
  dbUpdate() {
    if (this._isDBActive) { return }
    const circle = this;
    let start, prevTime;

    function step(timestamp) {
      circle._isDBActive = circle.isDBActive ?? true;
      circle._testData = circle._testData ?? {};
      if (circle._isDBActive) {
        start = start ?? timestamp;
        const elapsed = timestamp - start;
        if (prevTime !== timestamp) {
          circle._dbData = {
            col1: {
              "cAng": circle.rotation,
              "dAng": circle._watchDie ? circle._getAngleToDie(circle._watchDie) : 0,
              "∆Ang": circle._watchDie ? U.getAngleDelta(circle.rotation, circle._getAngleToDie(circle._watchDie)) : 0
            },
            col2: {
              cPos: `${U.pad(parseInt(circle.x), 5)}, ${U.pad(parseInt(circle.y), 5)}`,
              dPos: `${U.pad(parseInt(circle._watchDie?.x ?? 0), 5)}, ${U.pad(parseInt(circle._watchDie?.y ?? 0), 5)}`,
              sPos: `${U.pad(parseInt(circle.snap.points[0].x), 5)}, ${U.pad(parseInt(circle.snap.points[0].y), 5)}`
            },
            col3: {
              "tS.End": `${circle._testData.startingEndTime ?? 0}`,
              "tCatch": `${circle._testData.catchTime ?? 0}`,
              "tT.End": `${circle._testData.targetEndTime ?? 0}`,
              "tScale": `${circle._testData.scalingFactor ?? 0}`,
              "tR.End": `${circle._testData.resultEndTime ?? 0}`
            },
            col4: {
              "cStart": `${circle._testData.startingTime ?? 0}`,
              "c.Dur ": `${circle._testData.curDuration ?? 0}`,
              "c.Time": `${circle._testData.curTime ?? 0}`,
              "c.End ": `${circle._testData.curEndTime ?? 0}`,
              "r.Time": `${circle._testData.realTime ?? 0}`
            }
          };
          circle.updateDisplay();
        }
        prevTime = timestamp;
        window.requestAnimationFrame(step);
      } else {
        delete circle._isDBActive;
      }
    }
    window.requestAnimationFrame(step);
  }
  getPathReport() {
    const pathData = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((pathPos) => {
      const {x, y, angle} = MotionPathPlugin.getPositionOnPath(this.snap.path, pathPos, true);
      const convCoords = MotionPathPlugin.convertCoordinates(this.elem, RollCircle.CONTAINER, {x, y});
      return {
        pos: {x: parseInt(x), y: parseInt(y)},
        convPos: {x: parseInt(convCoords.x), y: parseInt(convCoords.y)},
        angle: parseInt(angle),
        pathPos
      };
    });
    console.log(pathData);
  }
  testTweenTiming() {
    const tweenConfig = {
      duration: 10,
      catchTime: 8,
      desiredMinTime: 10
    };
    const startTime = gsap.globalTimeline.time();
    this._testData = this._testData ?? {};
    const circle = this;
    const [testObj] = $("<div id='testObj' class='testObj' />").appendTo(RollCircle.CONTAINER);
    U.set(testObj, {xPercent: -50, yPercent: -50, x: 0, y: 50});
    this._testTween = gsap.to(testObj, {
      x: "+=1000",
      duration: tweenConfig.duration,
      ease: "expo.inOut",
      onStart() {
        circle._testData.startingTime = this.startTime();
        circle._testData.startingEndTime = this.endTime();
        setTimeout(catchTween, tweenConfig.catchTime * 1000);
      },
      onUpdate() {
        const tData = circle._testData;
        tData.realTime = gsap.globalTimeline.time() - startTime;
        tData.curTime = this.time();
        tData.curScale = this.timeScale();
        tData.curDuration = this.duration();
        tData.curEndTime = this.endTime();
      },
      onComplete() {
        console.log(circle._testData);
      }
    });
    console.log(this);
    console.log(this._testTween);

    function catchTween() {
      U.set("#testObj", {backgroundColor: "lime"});
      const tween = circle._testTween;
      const tData = circle._testData;
      const timeLeft = tween.duration() - tween.time();
      tData.catchTime = -1 * timeLeft;
      const timeLeftDesired = tweenConfig.desiredMinTime;
      tData.targetEndTime = tween.time() + timeLeftDesired;
      const scaleFactor = timeLeft / timeLeftDesired;
      // const scaleFactor = timeLeft / durationDesired;
      tData.scalingFactor = scaleFactor;
      tween.timeScale(scaleFactor);
      // tween.pause();
      tData.resultEndTime = tween.endTime();
    }

  }
  // #endregion ▄▄▄▄▄ TEST METHODS ▄▄▄▄▄
  /*!DEVCODE*/
}
// #endregion ░░░░[RollCircle]░░░░
// #region ░░░░░░░ OREDie ░░░░░░░ ~
class OREDie {
  // #region ████████ STATIC: Static Getters, Setters, Methods ████████ ~
  // #region ░░░░░░░[Getters]░░░░ Basic Data Retrieval ░░░░░░░ ~
  static get REGISTRY() { return (this._REGISTRY = this._REGISTRY ?? {}) }

  // #region ========== Enumeration Objects =========== ~
  static get TYPES() {
    return {
      basic: "basic",
      openSpace: "slot-space"
    };
  }
  // #endregion _______ Enumeration Objects _______

  // #endregion ░░░░[Getters]░░░░
  // #region ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░ ~
  static Register(die) { this.REGISTRY[die.name] = die }
  static Unregister(die) { delete this.REGISTRY[die.name] }
  // #endregion ░░░░[Methods]░░░░
  // #endregion ▄▄▄▄▄ STATIC ▄▄▄▄▄

  // #region ████████ CONSTRUCTOR ████████ ~
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
    this.reparent(homeCircle);
    this._createDragger();
  }
  // #endregion ▄▄▄▄▄ CONSTRUCTOR ▄▄▄▄▄

  // #region ████████ GETTERS & SETTERS ████████ ~
  // #region ░░░░░░░ Read-Only ░░░░░░░ ~
  get x() { return U.get(this.elem, "x") }
  get y() { return U.get(this.elem, "y") }
  get rotation() { return U.get(this.elem, "rotation") }

  get owner() { return game.users.get(this._owner) }
  get name() { return this._name }
  get id() { return `die-${this.name}` }
  get elem() { return this._elem }
  get sel() { return `#${this.id}` }

  get parent() {
    this._parent = this._parent ?? {};
    const die = this;
    return {
      get id() { return die._parent.id },
      get elem() { return die._parent.elem },
      get sel() { return die._parent.sel }
    };
  }

  get dragger() { return this._dragger }
  get isThrowing() { return this.dragger?.isThrowing }
  get isDragging() { return this._isDragging && !this.isThrowing }
  get isMoving() { return this.isDragging || this.isThrowing }
  // #endregion ░░░░[Read-Only]░░░░

  // #region ░░░░░░░ Writeable ░░░░░░░ ~
  get homeCircle() { return this._homeCircle }
  get type() { return this._type }
  set type(v) {
    $(this.sel)
      .removeClass(`ore-${this.type}`)
      .addClass(`ore-${v}`);
    this._type = v;
  }
  // #endregion ░░░░[Writeable]░░░░
  // #endregion ▄▄▄▄▄ GETTERS & SETTERS ▄▄▄▄▄

  // #region ████████ PRIVATE METHODS ████████ ~
  // #region ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░ ~
  _create() {
    [this._elem] = $(`<div id="${this.id}" class="ore-die ore-${this.type}">X</div>`).appendTo(RollCircle.CONTAINER);
    this.set({xPercent: -50, yPercent: -50});
  }

  _createDragger() {
    const die = this;
    [this._dragger] = Dragger.create(
      die.sel,
      {
        type: "x,y",
        inertia: true,
        callbackScope: this,
        onDragStart() {
          this._isDragging = true;
          this.closestCircle = this.homeCircle;
          this.reparent(RollCircle.CONTAINER);
          this.closestCircle.watchDie(this); /*
          $(this.target).appendTo("#container");
          this.update(false, true);

          // Log the closest circle to the die (i.e. the circle it's starting from)
          this.closestCircle = getClosest(this, "onDragStart");

          // Stop the nearest circle's rotation
          gsap.killTweensOf(this.closestCircle, "rotation");
          dragDice.forEach((die) => die.update());

          // Stop the die's counter-rotation, since it doesn't need it to cancel out the larger circle's rotation anymore
          gsap.killTweensOf(this.target, "rotation");
          gsap.set(this.target, {rotation: 0}); */

        },
        onDrag() {
          // die.dbCircle.faceDie(die);
          /*
          // Constantly update the closest circle to the die as it's moving, rotating it to follow the cursor
          const closestCircle = getClosest(this, "onDrag");
          if (this.closestCircle !== closestCircle) {
            redistributeDice(this.closestCircle, 0);
            // gsap.to(this.closestCircle, {rotation: "+=360", duration: 100, repeat: -1});
            gsap.killTweensOf(closestCircle, "rotation");
            redistributeDice(closestCircle, 1);
            this.closestCircle = closestCircle;
          } */
        },
        onDragEnd() {
          this._isDragging = false;
        },
        snap: {
          points(point) { /*
            // Get the closest circle. (I realize that, by calculating the closest circle in every event listener, I'm obviating the need to log it... but I suspect that something about the way snapping works means I need to log it at some point and not calculate it again here...?)
            this.closestCircle = getClosest(point, "snap");

            // Get the raw path of the closest circle's "snap-circle" (the inner circle with the dashed stroke). It was cached when it was created in the initialization section above, so no need to cache it again.
            const rawPath = MotionPathPlugin.getRawPath(`#snap-circle-${this.closestCircle.id.slice(-1)}`);
            MotionPathPlugin.cacheRawPathMeasurements(rawPath);

            // Get a point on that snap-circle to snap to (I'm just using '0.5' for this demo, but the real logic will figure out the nearest spot between the dice already in orbit, then animate those dice to new positions on the path to create a space for the new die to snap to. You can probably expect another forum post when I inevitably struggle to get that working ;) )
            const snapPoint = MotionPathPlugin.getPositionOnPath(rawPath, this.closestCircle.blankPathPos);
            snapPoint.y += 19;

            this.snapPoint = snapPoint;

            // Convert the snap point to the #container coordinate space, where the dragged die is currently
            const convSnapPoint = MotionPathPlugin.convertCoordinates($(`#${this.closestCircle.id}`)[0], $("#container")[0], snapPoint);

            this.convSnapPoint = convSnapPoint;

            CALLLOG.push(`SNAP --> Path: ${parseInt(snapPoint.x)}, ${parseInt(snapPoint.y)} ... Converted: ${parseInt(convSnapPoint.x)}, ${parseInt(convSnapPoint.y)}`);
            CALLLOG.push(`... Blank Path Pos: ${this.closestCircle.blankPathPos}`);

            return convSnapPoint; */
            return point;
          }
        },
        onThrowUpdate() { /*
          // Continue to update the closest circle to the die as it's moving. (I tried using 'endX'/'endY' here, but it didn't work --- I think 'endX'/'endY' are being calculated after the snapping has been applied, but I need to figure out the circle *to* snap to at this point.)
          const closestCircle = getClosest(this, "onDrag");
          if (this.closestCircle !== closestCircle) {
            redistributeDice(this.closestCircle, 0);
            // gsap.to(this.closestCircle, {rotation: "+=360", duration: 100, repeat: -1});
            gsap.killTweensOf(closestCircle, "rotation");
            redistributeDice(closestCircle, 1);
            this.closestCircle = closestCircle;
          }
          // this.closestCircle = getClosest(point, "onThrowUpdate"); */
        },
        onThrowComplete(point) {
          // die.faceCircle.hideAngle();
          /*
          // Convert the die's current location to the coordinate space of its new home circle
          const convertCoords = MotionPathPlugin.convertCoordinates($("#container")[0], $(`#${this.closestCircle.id}`)[0], this);

          // Reparent the die to its new home circle
          $(this.target).appendTo(`#${this.closestCircle.id}`);
          this.update();

          // Set the die's position to the converted coordinates of its new parent circle
          gsap.set(this.target, {x: this.snapPoint.x, y: this.snapPoint.y});
          this.update();
          // gsap.fromTo(this.target, {x: logCVs.target.x, y: logCVs.target.y}, {x: this.snapPoint.x, y: this.snapPoint.y});

          // Restart the die's counter-rotation, now that it's in a rotating circle again. (Though, instead of '0', I think I need to start it at a negative offset rotation from wherever the circle has rotated to, for it to land in the correct orientation --- I'll worry about that later!)
          // gsap.to(this.closestCircle, {rotation: "+=360", duration: 100, repeat: -1});
          // gsap.to(this.target, {rotation: "+=360", duration: 100, repeat: -1, runBackwards: true, startAt: {rotation: -1 * gsap.getProperty(`#${this.closestCircle.id}`, "rotation")}});

          delete this.closestCircle.numBlanks;
          redistributeDice(this.closestCircle, 0); */
        }
      }
    );
  }
  // #endregion ░░░░[Initializing]░░░░

  // #region ░░░░░░░[Elements]░░░░ Managing Die Element ░░░░░░░ ~

  // #endregion ░░░░[Elements]░░░░

  // #region ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░ ~

  // #endregion ░░░░[Animation]░░░░
  // #endregion ▄▄▄▄▄ PRIVATE METHODS ▄▄▄▄▄

  // #region ████████ PUBLIC METHODS ████████ ~
  set(params) { U.set(this.sel, params) }

  kill() {
    OREDie.Unregister(this);
    $(this.sel).remove();
  }
  // #region ░░░░░░░ Animation ░░░░░░░ ~
  straighten() { U.set(this.sel, {rotation: -1 * U.get(this.parent.sel, "rotation")}) }
  reparent(newParent) {
    if (newParent instanceof RollCircle) {
      this._parent = {
        id: newParent.id,
        elem: newParent.elem,
        sel: newParent.sel,
        circle: newParent
      };
      this._homeCircle = newParent;
    } else {
      this._parent = {
        id: newParent.id,
        elem: newParent,
        sel: `#${newParent.id}`
      };
      delete this._homeCircle;
    }
    const {x, y} = this;
    const convertCoords = MotionPathPlugin.convertCoordinates(this.elem, this.parent.elem, {x, y});
    $(this.elem).appendTo(this.parent.elem);
    this.set({x: convertCoords.x, y: convertCoords.y});
    this.straighten();
    if (this.dragger) {
      this.dragger.update(false, this.isDragging);
    }
  }
  // #endregion ░░░░ Animation ░░░░
  // #endregion ▄▄▄▄▄ PUBLIC METHODS ▄▄▄▄▄
}
// #endregion ░░░░[OREDie]░░░░
// #endregion ▄▄▄▄▄ CLASSES ▄▄▄▄▄

// #region ████████ EXPORTS ████████ ~
// #region ▮▮▮▮▮▮▮ Default Export ▮▮▮▮▮▮▮ ~
export default () => {
  const rollCircles = [];
  gsap.registerPlugin(Dragger, InertiaPlugin, MotionPathPlugin);
  [
    // [3, 45, 100, 100, 100, "lime"],
    // [7, -45, 1370, 100, 100, "cyan"],
    // [11, 0, 100, 729, 100, "pink"],
    // [15, 270, 1370, 729, 100, "yellow"],
    [15, 0, 635, 314, 100, "lime"]
  ].forEach((params) => {
    const numDice = params.shift();
    const startAngle = params.shift();
    const rollCircle = new RollCircle(...params);
    rollCircle.set({rotation: startAngle});
    rollCircle.dice.forEach((die) => die.straighten());
    for (let i = 0; i < numDice; i++) {
      rollCircle.addDie();
    }
    rollCircle.dbShow();
    rollCircle.testTweenTiming();
    rollCircles.push(rollCircle);
  });
  return rollCircles;
};
// #endregion ▮▮▮▮[Default Export]▮▮▮▮
// #endregion ▄▄▄▄▄ EXPORTS ▄▄▄▄▄